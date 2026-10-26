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
          VEMB_BANDE+ /* (2026-10-20, VILLE EMBELLIE) LES ÉTAGES TECHNIQUES : une bande de LED tous les 12 à 21 étages sur une tour haute sur deux et demie */
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
  m.customProgramCacheKey=function(){return ancien?('toursV3j'):('toursV6'+(FIN9?'f':'')+('n')+(GTA9?'g':'')+(PAL.n>=1?'e':''));}; // (facades-jour) une clé remplacée, pas un programme de plus
  CITY[K]=m;return m;
}
/* (2026-10-17, banc) dbgVilleGta(k,a,d,h) : les façades GTA à k (0 = l'image d'avant, 1 = GTA) et UNE image re-rendue — la caméra posée par
   dbgView si a est donné (angle relatif au CAP de la caisse : 0 = derrière), sinon telle quelle (en pause : la même image, A puis B). */
window.dbgVilleGta=function(k,a,d,h){CITY.uGta.value=k==null?1:+k;
  if(a!=null){const f=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.getWorldQuaternion(new THREE.Quaternion()));window.dbgView(Math.atan2(-f.x,-f.z)+a,d,h);}
  else if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  return {k:CITY.uGta.value,deco:CITY.deco||null};}; /* (2026-10-20) + le tirage du décor (LES VILLES AU HASARD) */
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
        'if(sc.y>12.&&min(sc.x,sc.z)<3.&&fract(vS9*37.3+.17)>.9)gl_FragColor.rgb=vec3(1.,.8,.34)*dot(gl_FragColor.rgb,vec3(.3,.5,.2))*1.7;'+ // (2026-10-20, VILLE EMBELLIE) L'OR : une enseigne verticale sur dix passe à l'or sodium — le clin d'œil CASH, rare
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
/* ===== LES RÉCLAMES SUIVENT LA LANGUE (24/10, relecture : « une ville en français, la langue passée en anglais, la ville suivante gardait ses
   réclames en français ») ===== la clé de l'atlas porte la teinte ET la langue : changée dans les réglages, l'atlas est repeint à la ville suivante
   (preuve-pubs-langue.cjs). */
function villePubAtlas(){
  const T9=vtCur(),te9=(T9?LVL.cur.teinte:'')+'|'+(typeof LANG==='undefined'?'fr':LANG); // (2026-10-16) LES TEINTES DE LA VILLE : l'atlas est repeint (une fois, à la construction de la ville) quand la teinte change
  if(CITY.pub&&CITY.pubT===te9)return CITY.pub;
  const N=512,C=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  const PUB=[['CASH CAR','#ffd75e','#ff2e8e','LA CAISSE QUI PAIE'],['1.61','#fff3be','#b86bff','GAME STUDIO'],['NITRO','#ff8d2e','#ff2e2e','PLEIN GAZ'],['$$$','#ffd75e','#7a1fb0','BANQUE OUVERTE'],
    ['AURA','#ff9ee6','#7a2fd0','BRILLE FORT'],['FLOW','#5ee6ff','#1d63c8','NE LACHE RIEN'],['GO !','#ffffff','#ff5e7a','VITE VITE'],['24/7','#ffe23e','#ff7a14','NUIT BLANCHE'],
    ['RAMEN','#ffb85a','#d8261e','CHAUD'],['NEON','#2ee6ff','#ff3ea5','PLUIE ET LUMIERE'],['TURBO','#ffffff','#ff2e8e','PLUS VITE'],['CASINO','#ffd75e','#b0106a','TOUT OU RIEN'],
    ['DRIVE','#9fe8ff','#3a2fd0','OU CREVE'],['LUCKY','#7dffec','#ff3ea5','7 7 7'],['SUSHI','#ffffff','#ff5e7a','24 H'],['\u20bf','#fff0b0','#c08a14','CASH CAR']]; /* (2026-10-20, VILLE EMBELLIE) L'OR : la 16e réclame (VITESSE ILLÉGALE) devient la pièce ₿, dorée — 1 panneau sur 16 */
  pubLangue(PUB); // (2026-10-14, textes) les réclames parlent la langue du joueur
  if(T9)for(const p of PUB){p[1]=vtHex(p[1],T9);p[2]=vtHex(p[2],T9);} // (teintes) le magenta et le violet des réclames → la couleur de la ville
  x.imageSmoothingEnabled=false; // (2026-09-26, vague 2) plus de VERT dans la ville (il n'est nulle part dans la bible) : « $$$ » et « CASINO » passent à l'or sur violet et sur magenta
  PUB.forEach(function(p,k){const ox=(k%4)*C,oy=((k/4)|0)*C;
    const g=x.createLinearGradient(0,oy,0,oy+C);g.addColorStop(0,p[2]);g.addColorStop(1,vtHex('#08061a',T9));x.fillStyle=g;x.fillRect(ox+4,oy+4,C-8,C-8);
    x.strokeStyle=p[1];x.lineWidth=4;x.strokeRect(ox+8,oy+8,C-16,C-16);
    x.fillStyle=p[1];x.textAlign='center';x.textBaseline='middle';
    const fz=Math.min(26,Math.floor((C-28)/Math.max(3,p[0].length)));if(p[0]==='\u20bf'){const u=7,x0=ox+C/2-18,y0=oy+Math.round(C*.42)-24,B9=['11110','10001','10001','11110','10001','10001','11110']; /* le ₿ en pixels, comme le reste de l'atlas (la police n'a pas ce signe) : un B et ses deux barres */
      for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(B9[r][c]==='1')x.fillRect(x0+c*u,y0+r*u,u,u);
      x.fillRect(x0+u+2,y0-7,3,7);x.fillRect(x0+3*u-1,y0-7,3,7);x.fillRect(x0+u+2,y0+49,3,7);x.fillRect(x0+3*u-1,y0+49,3,7);}
    else{x.font=fz+'px "Press Start 2P",monospace';x.fillText(p[0],ox+C/2,oy+C*.44);}
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
/* ===== LES VILLES AU HASARD — LE DÉCOR (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
   MESURÉ AVANT : la graine déplaçait les tours (le flux `vr`), jamais la COMPOSITION — même hauteur de skyline, même densité, mêmes enseignes, mêmes
   réclames, mêmes couronnes ; à CRYPTO CITY toujours deux taureaux à 30 et 70 %, trois rangées de bougies à 13/50/88 %, douze pièces, huit diamants,
   trois dirigeables ; à la VILLE VITRÉE les mêmes formes aux mêmes places (elles naissent de la POSITION de la tour). Désormais, par piste, un TIRAGE DE
   DÉCOR (`villeDecoTire`) dans un flux à lui (né de la graine, brassée : jamais `vr`, jamais `rnd`), lu par buildVoxCity, cryptoPlace, vitreTick, plaTick :
   · COMMUN : la SKYLINE (basse ×0,72 · moyenne · haute ×1,3 : la hauteur des murs du canyon au-dessus de la route), la DENSITÉ des rangs et de la forêt,
     0-3 PLACES (trouées de 180-340 m où les deux premiers rangs s'effacent, d'un côté ou des deux : la vue s'ouvre sur la ville), 0-3 TOURS REPÈRES
     (des géantes de 400 à 700 m au-dessus de la route — 1,3 à 1,8 km à la vitrée —, mât et feu d'obstacle, parfois une couronne), les ANTENNES,
     les COURONNES, les TUYAUX ;
   · LA VILLE (et MINUIT) : les ENSEIGNES verticales (rares · normales · partout), les RÉCLAMES (×0,4 · ×1 · ×1,9), la PALETTE des néons (magenta et cyan ·
     tout magenta · cyan froid · rouge et or — que la teinte de la ville remappe ensuite), le BÉTON (gris-bleu · acier · brique sombre · bleu nuit),
     la part de GÉANTES DE VERRE (peu · normale · beaucoup) et lesquelles ;
   · CRYPTO CITY : 1 à 3 TAUREAUX (à des abscisses tirées), 2 à 5 rangées de BOUGIES (longueur, abscisses, et le marché : bull pur · normal · volatil),
     les PIÈCES ₿ géantes (6 · 12 · 20), les DIAMANTS (3 · 8 · 14), les DIRIGEABLES (1 · 3 · 5), les bougies du lointain, la PLUIE D'ARGENT (fine · normale ·
     averse), la cadence des FUSÉES et des FEUX, la palette des néons (comme avant · tout or · vert profit · orange bitcoin) ;
   · LA VILLE VITRÉE : les FORMES des géantes (mixte · vrillées · lames · sobres · rondes — et lesquelles : la graine de position décalée), les MONTANTS
     (alu · champagne · graphite), le DIRIGEABLE (aucun · comme avant · haut · rasant), les NUAGES (dégagé · comme avant · couvert).
   Que des pièces déjà là (le cube des tours, ses matières, les néons, les instances de crypto) : 0 programme de plus. Rien sur la route : les places
   retirent des tours, les repères passent par la règle d'or (tourLibre / routePres, chev, la réserve de crypto). `CITY.dz` (le tirage), `CITY.deco`
   (lisible) : `dbgVilleDeco()`, `dbgCrypto().deco`, `dbgVitre().deco`, `dbgVilleGta().deco`. `?sans=villedecor`, `?sans=cryptodecor`, `?sans=vitreedecor` =
   le décor d'avant, au tirage près. */
const VILLE_DECOR=!/[?&]sans=([^&]*,)?villedecor(,|&|$)/.test(location.search);
const CRYPTO_DECOR=!/[?&]sans=([^&]*,)?cryptodecor(,|&|$)/.test(location.search);
const VITREE_DECOR=!/[?&]sans=([^&]*,)?vitreedecor(,|&|$)/.test(location.search);
function villeDecoGraine(seed,k){let h=Math.imul(((seed>>>0)^k)>>>0,0x85EBCA6B);h^=h>>>13;h=Math.imul(h,0xC2B2AE35);h^=h>>>16;return mulberry32(h>>>0);} // la graine BRASSÉE (des graines voisines ne tirent pas les mêmes choix)
function villeDecoTire(seed,genre){ // genre : 'ville' (et minuit) · 'crypto' · 'vitree' — null : le décor d'avant
  if(genre==='ville'?!VILLE_DECOR:genre==='crypto'?!CRYPTO_DECOR:!VITREE_DECOR)return null;
  const dr=villeDecoGraine(seed,0xDEC0C17E),ch=a=>a[(dr()*a.length)|0],D={genre:genre},li=[],pc=x=>Math.round(x*100)+' %';
  {const h=ch([[.72,'basse'],[1,'moyenne'],[1.3,'haute']]);D.haut=h[0];li.push('skyline '+h[1]);}
  {const d=ch([[.7,'aérée'],[1,'normale'],[1.18,'serrée']]);D.dens=d[0];li.push('densité '+d[1]);}
  {const n=(dr()*4)|0,T9=[];for(let k=0;k<n;k++)T9.push({f:.14+dr()*.76,l:180+dr()*160,c:ch([-1,1,0])});D.trou=T9;
   li.push(n?n+' place'+(n>1?'s':'')+' : '+T9.map(function(t){return pc(t.f)+(t.c<0?' à gauche':t.c>0?' à droite':' des deux côtés');}).join(', '):'pas de place');}
  {const n=(dr()*4)|0,R=[];for(let k=0;k<n;k++)R.push({f:.12+dr()*.78,sg:dr()<.5?-1:1,lat:dr(),h:dr(),cour:dr()<.6});D.rep=R;
   li.push(n?n+' tour'+(n>1?'s':'')+' repère'+(n>1?'s':'')+' : '+R.map(function(r){return pc(r.f)+(r.sg<0?' g':' d');}).join(', '):'pas de tour repère');}
  {const a=ch([[.25,'rares'],[.5,'normales'],[.8,'nombreuses']]);D.ant=a[0];li.push('antennes '+a[1]);}
  {const c=ch([[.12,'rares'],[.32,'normales'],[.6,'partout']]);D.cour=c[0];li.push('couronnes '+c[1]);}
  D.tuy=ch([.5,1,1.3]);li.push('tuyaux ×'+D.tuy);
  if(genre==='ville'){
    {const e=ch([[.35,'rares'],[1,'normales'],[1.7,'partout']]);D.ens=e[0];li.push('enseignes '+e[1]);}
    {const p=ch([[.4,'rares'],[1,'normales'],[1.9,'partout']]);D.pub=p[0];li.push('réclames '+p[1]);}
    {const n=ch([['magenta et cyan',null],['tout magenta',[0xff3ec8,0xff6ad5,0xff4f9e,0xff2e8e,0xff3ec8]],['cyan froid',[0x3ee8ff,0x52c8ff,0x8fd8ff,0x3ee8ff,0xff3ec8]],['rouge et or',[0xff3b5c,0xffb04a,0xff4f9e,0xffd75e,0xff3b5c]]]);D.neon=n[1];li.push('néons '+n[0]);}
    {const b=ch([['gris-bleu',null],['acier',[.19,.21,.23]],['brique sombre',[.25,.20,.19]],['bleu nuit',[.15,.18,.28]]]);D.bet=b[1];li.push('béton '+b[0]);}
    {const v=ch([[.5,'peu'],[1,'normal'],[1.7,'beaucoup']]);D.verre={k:v[0],ox:dr()*97,oz:dr()*89};li.push('géantes de verre : '+v[1]);}}
  else if(genre==='crypto'){D.ens=1;D.pub=ch([.5,1,1.6]);li.push('réclames ×'+D.pub);
    {const n=dr()<.25?1:dr()<.7?2:3,T9=[];for(let k=0;k<n;k++)T9.push(n===1?.3+dr()*.4:(k+.2+dr()*.6)/n);D.tau=T9;li.push(n+' taureau'+(n>1?'x':'')+' : '+T9.map(pc).join(', '));}
    {const n=2+((dr()*4)|0),B9=[];for(let k=0;k<n;k++)B9.push({f:(k+.1+dr()*.8)/n,n:7+((dr()*10)|0)});D.boug=B9;
     const m=ch([[0,'bull pur'],[1,'normal'],[2,'volatil']]);D.rouge=m[0];li.push(n+' rangées de bougies ('+B9.map(function(b){return b.n;}).join('/')+'), marché '+m[1]);}
    D.pie=ch([6,12,20]);D.diam=ch([3,8,14]);D.dir=ch([1,3,5]);li.push(D.pie+' pièces ₿, '+D.diam+' diamants, '+D.dir+' dirigeable'+(D.dir>1?'s':''));
    D.bfo=ch([.05,.13,.26]);li.push('bougies au loin ×'+(D.bfo/.13).toFixed(1));
    {const p=ch([[.25,'fine'],[.5,'normale'],[.85,'averse']]);D.pluie=p[0];li.push('pluie d’argent '+p[1]);}
    D.fus=ch([.6,1,1.7]);D.feu=ch([.6,1,1.7]);li.push('fusées ×'+D.fus+', feux ×'+D.feu);
    {const n=ch([['comme avant',null],['tout or',[0xffd23e,0xffc63a,0xfff2c8,0xf7931a,0xffd23e]],['vert profit',[0x2bff88,0x6dffc8,0x3dff9a,0xffd23e,0x2bff88]],['orange bitcoin',[0xf7931a,0xffb04a,0xffd23e,0xf7931a,0xfff2c8]]]);D.neon=n[1];li.push('néons '+n[0]);}}
  else{
    {const f=ch([['mixte',[.28,.46,.60,.71,.86]],['vrillées',[.14,.26,.52,.72,.86]],['lames',[.18,.30,.40,.48,.62]],['sobres',[.5,.7,.76,.82,.94]],['rondes',[.2,.32,.42,.52,.86]]]);D.fo={s:f[1],ox:dr()*97,oz:dr()*89};li.push('formes '+f[0]);}
    {const m=ch([['alu',null],['champagne',[1.05,.97,.82]],['graphite',[.5,.52,.56]]]);D.mont=m[1];li.push('montants '+m[0]);}
    {const d=ch([['aucun',null],['comme avant',[200,0]],['haut',[260,190]],['rasant',[140,-60]]]);D.dir=d[1];li.push('dirigeable '+d[0]);}
    {const n=ch([[.1,'dégagé'],[0,'comme avant'],[-.1,'couvert']]);D.nu=n[0];li.push('nuages '+n[1]);}}
  D.li=li;return D;}
window.dbgVilleDeco=function(k,v){
  if(k==='vue'){if(started&&!gameOver&&!paused)togglePause();if(acesPass)acesPass.uniforms.uSpeed.value=0;camera.position.fromArray(v.p);camera.lookAt(v.c[0],v.c[1],v.c[2]);if(v.fov){camera.fov=v.fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld(); // (banc) la caméra en p, qui regarde c
    try{if(CITY.dz&&CITY.dz.genre==='crypto'){plaTick(0,false);cryptoTick(0,false);}if(LVL.cur&&LVL.cur.vitre)vitreTick(0,false);}catch(e){}if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'vue';}
  return {pret:!!CITY.root,genre:CITY.dz?CITY.dz.genre:null,deco:CITY.deco||null,reperes:CITY.n&&CITY.n.reperes,places:CITY.n&&CITY.n.places,ville9:CITY.n};}; // (banc) le tirage du décor de la ville en cours
/* ================================ CRYPTOCITY — LA VILLE EN BULL RUN ================================
   (2026-10-13, Léo : « avec le même système de génération automatique que les autres maps, génère une ville mais avec un twist majeur :
   c'est CRYPTOCITY, mais en BULL RUN — ciel joyeux, trouve plein de détails émerveillants du bull run, toute l'ambiance est différente,
   ça respire la réussite et l'argent ; un immeuble BULL, et tout ; et pour la peine ramène la pluie d'argent que t'as enlevée entretemps,
   et augmente la qualité »)
   LE NIVEAU (`NIV_CRYPTO` : id 'ville' + crypto:1, comme MINUIT EN VILLE) : la piste et les tours sont celles de la VILLE — genCtrl (ruban
   sans looping, l'entrée surélevée), buildVoxCity (le canyon, la forêt, la règle d'or : jamais une tour sur la route), les tours DURES, la
   loi 15 du flow. À graine égale c'est la MÊME ville (les tirages `vr` ne bougent pas d'un pas : tout ce qui est à CRYPTOCITY tire dans
   son propre flux `cr`). Ce qui change, c'est tout le reste :
   · LE CIEL DU BULL RUN (biome `bullrun`) : le jour d'altitude, un azur profond, l'horizon et la brume en OR, le soleil franc ; la lune du
     dôme cède la place à une PIÈCE ₿ qui tourne dans le ciel (la lune, c'est là où l'on va) ; route anthracite et glacée (elle renvoie le ciel).
   · LES TOURS QUI REFLÈTENT (`cryptoMatTours`, 2026-10-15, Sacha : « des vitrés, des dorés, des argentés, des métalliques et des blancs ») :
     VERRE bleu-vert, OR, ARGENT miroir, MÉTAL brossé à lames, BLANC en résille de céramique — elles renvoient le ciel, l'éclat du soleil sur
     les vitres, et sur les plus hautes un BANDEAU DE COURS qui défile (chiffres verts et ▲) ; néons verts, or, orange bitcoin ; réclames LED
     du bull run (`cryptoPubAtlas` : BTC +420 %, TO THE MOON, HODL, ATH, WAGMI…).
   · LES TAUREAUX (`cryptoTaureau`) : deux gratte-ciel en forme de taureau qui CHARGE (celui de Wall Street), en verre d'or, à côté de la
     route, tête basse vers la caisse qui arrive, cornes au ciel, les yeux LASER ; ses pattes sont des tours qui plongent dans la brume d'or.
     (2026-10-18, LE TAUREAU v2 : la pose du « Charging Bull » — tête basse et large, cornes en avant, bosse, croupe haute, queue en S —,
     une statue d'OR POLI à facettes posée sur quatre tours à gradins ; ce qu'on voit et ce qui est dur sortent de la même `taureauForme`.)
   · LE GRAPHIQUE : des rangées de BOUGIES VERTES géantes qui montent le long de la route (le cours qui grimpe, deux petites rouges pour
     le vrai), des bougies dans la forêt du lointain ; des PIÈCES ₿ GÉANTES qui tournent au-dessus du canyon (la traverser en vol paie), des
     DIAMANTS (diamond hands), des DIRIGEABLES à écran (le cours en direct), des FUSÉES « TO THE MOON » qui décollent des toits vers la
     lune, des FEUX D'ARTIFICE verts et or ; les pièces de la route frappées du ₿ (coinPeint 'B').
   · LE NOUVEL ATH : toutes les ~35 s, « NOUVEL ATH ! », le cours du bitcoin qui grimpe, une salve de feux d'artifice, et la pluie qui redouble.
   · LA PLUIE D'ARGENT v2 (`PLA`) : voir son bloc juste après.
   Lancement : une map du MODE CLASSIQUE AU HASARD (SF_CARTES.crypto, 2026-10-15) ; `?carte=crypto` / `?niveau=crypto`, `dbgNiveauCrypto(meteo)`. Console : `dbgCrypto()`. */
const MOON_DIR=new THREE.Vector3(-.52,.40,-.72).normalize(); // la lune du dôme (cielLune) — CRYPTOCITY y pose sa pièce, les fusées y vont
const CRYPTO={root:null,res:[],toits:[],taureaux:[],bougies:null,pieces:null,pInfo:[],diam:null,dInfo:[],dirig:[],fus:[],feux:null,lune:null,
  sites:null,colExtra:[],jeter:[],ath:{t:20,n:0,prix:104000},fusT:4,feuT:2.5,rf:null,tick:null,mat:{},
  uT:{value:0},uSun:{value:new THREE.Vector3().copy(SUN_DIR)},uNuit:{value:0},
  v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),m4:new THREE.Matrix4(),q:new THREE.Quaternion(),s:new THREE.Vector3(),
  ax:new THREE.Vector3(0,1,0),c:new THREE.Color()};
function cryptoOn(){return !!(LVL.cur&&LVL.cur.crypto&&!PARK.on);}
function cryptoReserve(x,z,r){const R=CRYPTO.res;for(let i=0;i<R.length;i+=3){const dx=x-R[i],dz=z-R[i+1],q=R[i+2]+r;if(dx*dx+dz*dz<q*q)return true;}return false;}
function cryptoVide(){ // (buildVoxCity, à chaque piste) ce que la ville d'avant avait de crypto s'en va avec elle
  for(const o of CRYPTO.jeter){try{if(o.isInstancedMesh)o.dispose();else if(o.geometry)o.geometry.dispose();}catch(e){}}
  CRYPTO.jeter.length=0;CRYPTO.res.length=0;CRYPTO.toits.length=0;CRYPTO.taureaux.length=0;CRYPTO.colExtra.length=0;
  CRYPTO.bougies=CRYPTO.pieces=CRYPTO.diam=null;CRYPTO.pInfo.length=0;CRYPTO.dInfo.length=0;CRYPTO.dirig.length=0;CRYPTO.sites=null;CRYPTO.root=null;
  for(const f of CRYPTO.fus){f.on=false;f.g.visible=false;f.tr.visible=false;}
  if(CRYPTO.feux){CRYPTO.feux.visible=false;for(let k=0;k<CRYPTO.feux.userData.K;k++)CRYPTO.feux.material.uniforms.uO.value[k].w=-99;}
  if(CRYPTO.lune)CRYPTO.lune.visible=false;
  crhVide(); // (2026-10-21) l'horizon et les projecteurs de la ville d'avant s'en vont aussi
}
/* LE PLAN — appelé par buildVoxCity AVANT les tours (`proches` = sa grille de la piste) : où vont les taureaux, les bougies, les pièces,
   les diamants et les dirigeables. Chaque site vérifie qu'aucun étage de la route ne le traverse (`libre`) et se RÉSERVE : les tours qui
   tomberaient dessus sont bâties puis retirées (leurs tirages ont eu lieu : la ville d'à côté ne bouge pas). */
function cryptoPlace(seed,proches){
  const cr=mulberry32(seed^0xB0117A11),S={taureaux:[],bougies:[],pieces:[],diam:[],dirig:[]},dS=L/(NP-1),iE=CITY.entree?CITY.entree[1]:0;
  CRYPTO.res.length=0;CRYPTO.rf=mulberry32(seed^0xF0E57B0);CRYPTO.sd=seed;
  const DZ=CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) le tirage du décor (villeDecoTire) : combien, où — nul : le plan d'avant, au tirage `cr` près
  const libre=function(x,z,R,y0,y1){let ok=true;proches(x,z,R,function(i){if(!ok)return;const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<R*R&&p.y>y0-45&&p.y<y1+45)ok=false;});return ok;};
  const dessous=function(x,z,R,y){let h=-1e9;proches(x,z,R,function(i){const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<R*R&&p.y<y&&p.y>h)h=p.y;});return h;};
  const cadre=function(i){const T9=T[i],hl=Math.hypot(T9.x,T9.z)||1;return {px:-T9.z/hl,pz:T9.x/hl,tx:T9.x/hl,tz:T9.z/hl};};
  const ix=function(f){return Math.min(NP-2,Math.max(iE+6,Math.floor(f*NP)));};
  // LES TAUREAUX : à 30 % et à 70 % de la piste, à ~230 m de l'axe, le ventre 70 m sous la route (le dos 120 m au-dessus, les cornes 230)
  const poseT=function(t){t.ph=cr()*6.28;S.taureaux.push(t);CRYPTO.res.push(t.x,t.z,330);const p=pts[t.i];
    for(const f of [.3,.52,.74])CRYPTO.res.push(t.x+(p.x-t.x)*f,t.z+(p.z-t.z)*f,95);}; // L'ESPLANADE : pas une tour entre le taureau et la route qu'il regarde
  for(const F0 of (DZ?DZ.tau:[.3,.7])){let rep=null,ok=false;
    for(let k=0;k<14;k++){const i=ix(F0+(cr()-.5)*.2),c=cadre(i),sg=cr()<.5?-1:1,lat=ROAD_HALF+300+cr()*80;
      const x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,yb=pts[i].y-70;
      if(cryptoReserve(x,z,330)||!libre(x,z,280,yb-20,yb+440))continue;
      const pied=Math.max(yb-820,dessous(x,z,280,yb)+70),a=.45; // la tête : vers la caisse qui arrive (−T), tournée vers la route (−sg·B)
      const hx=-c.tx*Math.cos(a)-sg*c.px*Math.sin(a),hz=-c.tz*Math.cos(a)-sg*c.pz*Math.sin(a),cap=Math.atan2(hx,hz),F9=taureauForme((pied-yb)/TAUREAU_K);
      if(!taureauLibre(F9,x,yb,z,cap,proches))continue; // (2026-10-18) la ROUTE ne passe à moins de 30 m d'AUCUNE partie du taureau — mesuré : le cercle de 280 m laissait la route à 4 m de sa tête
      const t={x:x,z:z,y:yb,pied:pied,cap:cap,F:F9,s:i*dS,i:i};
      if(pied>yb-250){if(!rep)rep=t;continue;} // (2026-10-18) une route passe juste dessous : ses pattes s'arrêteraient en moignons — on cherche une place où elles plongent, celle-ci en dernier recours
      poseT(t);ok=true;break;}
    if(!ok&&rep)poseT(rep);}
  // LE GRAPHIQUE : trois rangées de bougies qui MONTENT le long de la route (une bougie tous les ~42 m), deux petites rouges dans chaque
  for(const R0 of (DZ?DZ.boug:[{f:.13},{f:.5},{f:.88}])){const F0=R0.f,i0=ix(F0+(cr()-.5)*.05),sg=cr()<.5?-1:1,lat0=ROAD_HALF+115+cr()*90,pas=Math.max(1,Math.round(42/dS)),n0=10+((cr()*4)|0),r1=2+((cr()*4)|0),n=DZ?R0.n:n0;
    let niv=pts[i0].y-150;
    for(let k=0;k<n;k++){const i=Math.min(NP-1,i0+k*pas),c=cadre(i),lat=lat0+(cr()-.5)*14,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat;
      const rouge=(DZ&&DZ.rouge!==1?DZ.rouge===2&&k%3===r1%3&&k>0:(k===r1||k===r1+4))&&k<n-2,h=rouge?14+cr()*16:28+cr()*52,y0=rouge?niv-h:niv,y1=y0+h,mh=12+cr()*28,mb=8+cr()*22,w=16+cr()*6;
      if(cryptoReserve(x,z,w*.75)||!libre(x,z,w*.75+4,y0-mb,y1+mh)){niv+=rouge?-h*.5:h*.7;continue;}
      S.bougies.push({x:x,z:z,y0:y0,y1:y1,mh:mh,mb:mb,w:w,rouge:rouge});CRYPTO.res.push(x,z,w*.75+3);
      niv=rouge?y0+h*.3:y1-h*.22+cr()*8;}}
  // LES PIÈCES ₿ GÉANTES : douze, de 13 à 25 m de rayon, à 40-150 m du bord, 45-155 m au-dessus de la route
  const nPi=DZ?DZ.pie:12,nDi=DZ?DZ.diam:8;
  for(let k=0;k<nPi;k++){for(let e=0;e<4;e++){const i=ix(.07+.86*(k+cr()*.7)/nPi),c=cadre(i),sg=cr()<.5?-1:1,r=13+cr()*12;
      const lat=ROAD_HALF+r+40+cr()*110,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+45+cr()*110;
      if(cryptoReserve(x,z,r+6)||!libre(x,z,r+18,y-r-10,y+r+10))continue;
      S.pieces.push({x:x,y:y,z:z,r:r,a:cr()*6.28,w:(.35+cr()*.4)*(cr()<.5?-1:1),ph:cr()*6.28,cd:0});CRYPTO.res.push(x,z,r+8);break;}}
  // LES DIAMANTS (diamond hands) : huit, plus petits, plus haut
  for(let k=0;k<nDi;k++){for(let e=0;e<4;e++){const i=ix(.1+.8*(k+cr())/nDi),c=cadre(i),sg=cr()<.5?-1:1,r=6+cr()*5;
      const lat=ROAD_HALF+r+60+cr()*160,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+90+cr()*120;
      if(cryptoReserve(x,z,r+6)||!libre(x,z,r+14,y-r*1.6-10,y+r*1.6+10))continue;
      S.diam.push({x:x,y:y,z:z,r:r,a:cr()*6.28,w:.5+cr()*.6,ph:cr()*6.28});CRYPTO.res.push(x,z,r+6);break;}}
  // LES DIRIGEABLES À ÉCRAN : trois, le long de la route, au-dessus du canyon
  for(const F0 of (DZ?Array.from({length:DZ.dir},function(_,k){return (k+.5)/DZ.dir;}):[.24,.56,.84])){for(let k=0;k<8;k++){const i=ix(F0+(cr()-.5)*.12),c=cadre(i),sg=cr()<.5?-1:1;
      const lat=ROAD_HALF+75+cr()*80,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+70+cr()*50;
      if(cryptoReserve(x,z,48)||!libre(x,z,62,y-28,y+28))continue;
      S.dirig.push({x:x,y:y,z:z,cap:Math.atan2(c.tx,c.tz),ph:cr()*6.28});CRYPTO.res.push(x,z,48);break;}}
  CRYPTO.sites=S;return S;
}
// la tour (cx,cz) qu'on vient de bâtir : retirée si elle tombe sur un site ; dans la forêt, une sur huit devient une BOUGIE (rend vrai = retirée)
function cryptoTour(cx,cz,hd,b,t,canyon){
  if(cryptoReserve(cx,cz,hd))return true;
  const H=t-b;
  if(!canyon&&CRYPTO.rf()<(CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz.bfo:.13)&&H>160){const w=Math.max(14,Math.min(30,hd*.75)),rouge=CRYPTO.rf()<.16,y1=t-20-CRYPTO.rf()*40,y0=Math.max(b+40,y1-(rouge?50:90+CRYPTO.rf()*160));
    CRYPTO.sites.bougies.push({x:cx,z:cz,y0:y0,y1:y1,mh:14+CRYPTO.rf()*30,mb:Math.min(y0-b,30+CRYPTO.rf()*90),w:w,rouge:rouge});return true;}
  if(H>200&&CRYPTO.toits.length<1800)CRYPTO.toits.push(cx,t,cz);
  return false;
}
function cryptoColBougies(){ // les bougies sont DURES, comme les tours (villeHeurt les lit dans CITY.col)
  const X=CRYPTO.colExtra;X.length=0;if(!CRYPTO.sites)return X;
  for(const b of CRYPTO.sites.bougies){const yb=b.y0-b.mb,yt=b.y1+b.mh;X.push(b.x,(b.y0+b.y1)/2,b.z,b.w,b.y1-b.y0,b.w);X.push(b.x,(yb+yt)/2,b.z,3,yt-yb,3);}
  return X;
}
/* ---- LES MATIÈRES (partagées, jamais disposées ; compilées au menu par cryptoChauffe) ---- */
/* ===== LES FAÇADES DU BULL RUN VIVENT (2026-10-21, Sacha : « amélioration visuelle des maps », passe CRYPTO CITY) =====
   Le ciel REFLÉTÉ n'était qu'une couleur par tour (le reflet d'une façade verticale ne dépend que du regard) : plates, de près comme de loin.
   Maintenant, dans le même shader (aucun programme de plus) : (1) le reflet CHANGE DE FACE — chaud côté soleil, froid à l'opposé ;
   (2) il change D'ÉTAGE — l'horizon d'or en bas, l'azur en haut — et la façade s'assombrit, se réchauffe au pied, se refroidit au sommet ;
   (3) de larges BANDES de reflet (un nuage, la tour d'en face) glissent en diagonale ; (4) un COUP DE LUMIÈRE balaie une tour de temps en temps
   (un uniform de temps, ~25 s par tour, chacune à sa phase ; rose la nuit : le clin d'œil CASH) — absent au palier ancien ;
   (5) la nuit les bureaux ne sont plus tous or : un sur huit rose, un sur sept cyan (le trio de la marque), et un toit sur sept s'allume en rose. */
PAL.B.cryptoReflets=[0,1,1];
// LES TOURS DE VERRE — la tour de la ville (même sommet : tri hors champ, portée des lampes, pied noyé), une autre façade : le jour.
const CRYPTO_VERRE=
  '{vec3 an=abs(vNrm9);float fv=step(an.y,.5)*step(9.,min(vSc9.x,vSc9.z));'+
  'float s1=fract(vSeed9*7.13),s2=fract(vSeed9*13.71),s3=fract(vSeed9*29.37),s4=fract(vSeed9*53.17),sty=s3<.26?0.:s3<.44?1.:s3<.64?2.:s3<.80?3.:4.;'+ // (2026-10-15, Sacha) 26 % VERRE · 18 % OR · 20 % ARGENT · 16 % MÉTAL · 20 % BLANC (les mêmes seuils que la structure, dans buildVoxCity)
  'vec2 cel=vec2(1.7+s1*1.5,3.9+s2*.5),uv=(an.x>an.z?vLoc9.zy:vLoc9.xy)/cel,fw=max(fwidth(uv),vec2(1e-4));'+
  'float tt=step(.5,vNrm9.y)*step(9.,min(vSc9.x,vSc9.z)),de=min(vSc9.x*.5-abs(vLoc9.x),vSc9.z*.5-abs(vLoc9.z)),fe=max(fwidth(de),1e-4);'+
  'float ux=(an.x>an.z?vLoc9.z*sign(vNrm9.x):-vLoc9.x*sign(vNrm9.z)),fu=max(fwidth(ux),1e-4);'+ // le long de la façade, pour le bandeau
  '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+
  'if(VIS9){vec3 V9=normalize(vW9-cameraPosition);'+
  ' if(fv>0.){vec3 N9=normalize(vec3(vNrm9.x,0.,vNrm9.z)),R9=reflect(V9,N9);float ry=R9.y,hh9=clamp(vB9/max(vSc9.y,1.),0.,1.);'+
  '  gl_FragColor.rgb*=mix(vec3(.98,.88,.77),vec3(1.01,1.04,1.11),smoothstep(.04,.85,hh9));'+ // la façade : le pied chaud et sombre (le rebond de l'or du sol), le sommet clair et froid (le ciel)
  '  vec3 sky=ry>0.?mix(mix(uHor9,uMid9,smoothstep(0.,.16,ry)),uZen9,smoothstep(.12,.92,ry)):mix(uHor9*.72,vec3(.12,.11,.09),smoothstep(0.,-.28,ry));'+ // en dessous : la ville et sa brume, sombres
  '  {vec2 hz=R9.xz/max(length(R9.xz),1e-3),sz=uSun9.xz/max(length(uSun9.xz),1e-3);float sd2=dot(hz,sz)*.5+.5;'+
  '   sky=mix(sky*vec3(.88,.95,1.08),sky*vec3(1.2,1.02,.8),sd2);'+ // le ciel reflété change de FACE : chaud du côté du soleil, froid à l'opposé
  '   sky=mix(sky,mix(uHor9*1.15,uZen9*1.6+.04,smoothstep(.12,.95,hh9)),.38);'+ // …et d'ÉTAGE : l'horizon d'or en bas, l'azur en haut
  '   sky*=.86+.3*(.5+.5*sin(ux*.052+vB9*.024+s2*6.28));}'+ // …et de larges BANDES de reflet glissent en diagonale (un nuage, la tour d'en face)
  '  float lu=dot(sky,vec3(.3,.59,.11)),sd=max(dot(R9,uSun9),0.),or9=step(.5,sty)*step(sty,1.5),ag9=step(1.5,sty)*step(sty,2.5),mt9=step(2.5,sty)*step(sty,3.5),bl9=step(3.5,sty);'+
  '  float gl=mix(pow(sd,220.)*5.+pow(sd,14.)*.25,pow(sd,36.)*1.7+pow(sd,7.)*.3,mt9);'+ // l'éclat du soleil : une pointe sur le verre, une traînée large sur le métal brossé
  '  float fr=clamp((.50+.50*pow(1.-abs(dot(V9,N9)),5.))*(1.+.4*or9+.6*ag9+.25*mt9),0.,1.);vec3 rf=mix(sky,vec3(lu),.4-.28*ag9+.35*or9+.38*mt9);'+ // FRESNEL : de face l'intérieur, de biais le ciel ; l'or renvoie la LUMIÈRE du ciel ; l'ARGENT est un miroir (il garde le bleu) ; le MÉTAL brouille son reflet
  '  vec3 tint=sty<.5?vec3(.50,.84,.98):sty<1.5?vec3(1.,.74,.34):sty<2.5?vec3(.95,.98,1.04):sty<3.5?vec3(.68,.70,.76):vec3(.62,.76,.94);'+ // verre bleu-vert · or · argent · titane · le verre des tours blanches
  '  vec2 f=fract(uv),hw=vec2(mix(.41,.47,s2),mix(.40,.46,s1));if(bl9>0.)hw*=vec2(.56,.78);if(mt9>0.)hw.x*=.4;'+ // le BLANC : une résille de céramique autour de baies étroites ; le MÉTAL : des lames verticales
  '  vec2 dd=(hw-abs(f-.5))/fw;float far=smoothstep(.3,.75,max(fw.x,fw.y)),pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),4.*hw.x*hw.y,far);'+
  '  float ph=fract(sin(dot(floor(uv)+vSeed9*31.,vec2(12.9898,78.233)))*43758.5453);'+
  '  float pk=fract(ph*13.7+s4*5.3);vec3 wc=pk<.12?vec3(1.,.36,.66):pk<.27?vec3(.38,.92,1.):vec3(1.,.80,.50);'+ // les bureaux de la nuit : l'or, un peu de cyan, un peu de rose (le trio)
  '  vec3 ins=tint*(.055+.05*or9+.07*ag9)*(.7+.6*ph)+uNuit9*wc*step(.45,ph)*(.3+.5*ph)*(1.-.45*far);'+ // l'intérieur, sombre (un bureau derrière une vitre teintée) — la NUIT, les bureaux restent allumés (la ville ne dort pas pendant un bull run)
  '  vec3 glass=mix(ins,rf*tint*1.08,clamp(fr*(.82+.36*ph*(1.-far)),0.,1.))+gl*vec3(1.,.95,.8)+vec3(1.,.8,.5)*.2*step(.972,ph)*(1.-far);'+
  (PAL.b('cryptoReflets',1)?'  {float q9=ux*.5+vB9*.85,qc=-140.+fract(uT9*.038+s2*7.3+s1*3.)*(vSc9.y*.85+280.),gb=1.-smoothstep(0.,30.,abs(q9-qc));gb*=gb;'+
  '   glass+=gb*mix(vec3(1.,.9,.7),vec3(1.,.42,.78),uNuit9)*(.45+.55*or9+.45*ag9)*(1.-.5*far);}'+'\n':'')+ // LE COUP DE LUMIÈRE : une bande diagonale qui monte le long de la tour (rose la nuit)
  '  gl_FragColor.rgb=mix(gl_FragColor.rgb,glass,pane*.93);'+
  // LE BANDEAU DE COURS : sur une tour haute sur deux, à mi-hauteur, des chiffres verts et des ▲ qui défilent
  '  if(s4>.5&&vSc9.y>150.){float bh=6.5+s2*3.,yb=vSc9.y*(.56+.24*s1),yy=vB9-yb;'+
  '   if(abs(yy)<bh*.5+.9){float ps=bh/7.,gx=(ux-uT9*(9.+s1*7.))/ps,gy=floor((yy+bh*.5)/ps),ch=floor(gx/6.),cx=floor(mod(gx,6.));'+
  '    float fl=step(abs(yy),bh*.5),cad=1.-fl;vec3 led=vec3(.004,.012,.006);'+
  '    if(fl>0.&&fu<ps*.5){float on=0.;if(mod(ch,5.)<.5){float r=gy-1.;on=step(0.,r)*step(r,4.)*step(abs(cx-2.),2.-r*.5+.01);}'+ // le ▲
  '     else on=step(cx,4.)*step(1.,gy)*step(gy,5.)*step(.42,fract(sin(dot(vec3(cx,gy,ch+vSeed9*17.),vec3(12.9898,78.233,37.719)))*43758.5453));'+
  '     led+=mix(vec3(.15,1.6,.55),vec3(1.8,1.3,.3),step(.8,fract(ch*.37+vSeed9)))*on;}'+
  '    else if(fl>0.)led+=vec3(.08,.5,.2);'+ // trop loin pour lire : la moyenne du bandeau
  '    gl_FragColor.rgb=mix(gl_FragColor.rgb,led+cad*vec3(1.,.78,.32)*.9,max(fl,cad));}}'+
  ' }'+
  // LES TOITS : le parapet allumé (menthe sur le verre, or sur l'or, blanc chaud sur l'argent, le métal et le blanc)
  ' if(tt>0.&&fe<1.4){vec3 rc=sty<.5?vec3(.3,1.,.8):sty<1.5?vec3(1.,.78,.3):vec3(1.,.95,.86);if(fract(s1*17.3+s4*3.1)<.14)rc=vec3(1.,.32,.64);gl_FragColor.rgb+=rc*tt*(1.-smoothstep(.55,.55+fe*1.5,de))*(1.-smoothstep(.5,1.4,fe))*.75;}'+
  '}}\n';
function cryptoPied(){const s9=villePied(function(c){return c;});return s9.split('uPiedC9*uPied9').join('vec3(.05,.04,0.)').split('vec3(.16,.04,.2)*uPied9').join('vec3(.05,.04,0.)').split('vec3(.16,.04,.2)').join('vec3(.05,.04,0.)');} // le pied dans la brume d'or (la lueur violette des rues de la ville la nuit n'a rien à faire ici)
function cryptoMatToursLoin(){ // la tour AU LOIN (voir villeMatToursLoin) : la couleur de la brume, le pied doré
  if(CRYPTO.mat.toursL)return CRYPTO.mat.toursL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uWet9=ROAD_U.uWet;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vB9;varying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvB9=(position.y+.5)*length(instanceMatrix[1].xyz);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvB9=position.y+.5;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWet9;varying float vB9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+cryptoPied());};
  m.customProgramCacheKey=function(){return 'toursLoinCrypto';};m.dispose=function(){};
  CRYPTO.mat.toursL=m;return m;
}
function cryptoMatTours(){
  if(CRYPTO.mat.tours)return CRYPTO.mat.tours;
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x0c0a06});
  m.extensions={derivatives:true};
  const DECL='varying vec3 vLoc9;varying vec3 vNrm9;varying float vB9;varying float vSeed9;varying vec3 vSc9;varying vec3 vW9;';
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CITY.uT,uWet9:ROAD_U.uWet,uLum9:CITY.uL,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,uSun9:CRYPTO.uSun,uNuit9:CRYPTO.uNuit});
    sh.vertexShader='#undef USE_SHADOWMAP\n'+sh.vertexShader.replace('#include <common>','#include <common>\n'+DECL+'\nuniform vec4 uLum9[4];\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vec3 sc9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));'+
        'vSeed9=fract(instanceMatrix[3].x*.0131+instanceMatrix[3].z*.0173);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvec3 sc9=vec3(1.);vSeed9=0.;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n'+
        'vLoc9=position*sc9;vNrm9=normal;vB9=(position.y+.5)*sc9.y;vSc9=sc9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+VILLE_TRI+
        '#ifdef USE_INSTANCING\nbool proche9=false;{vec3 w9=(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;float r9=.5*length(sc9)+1.;'+
        'for(int i=0;i<4;i++)if(distance(w9,uLum9[i].xyz)<uLum9[i].w+r9)proche9=true;}\n#else\nbool proche9=true;\n#endif\n')
      .replace('#include <lights_lambert_vertex>','vLightFront=vec3(0.);vIndirectFront=vec3(0.);\nif(!loin9){\n'+VILLE_LLV+'\n}');
    sh.fragmentShader='#undef USE_SHADOWMAP\n'+sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uWet9,uNuit9;uniform vec3 uZen9,uMid9,uHor9,uSun9;'+DECL)
      .replace('#include <fog_fragment>',CRYPTO_VERRE+'#include <fog_fragment>\n'+cryptoPied());};
  m.customProgramCacheKey=function(){return 'toursCrypto2';};m.dispose=function(){};
  CRYPTO.mat.tours=m;return m;
}
/* LES RÉCLAMES DU BULL RUN : seize écrans LED (la police du jeu ; ▲, ₿, Ξ, fusée, taureau, diamant, bougies dessinés au pinceau) —
   OPAQUES (en plein jour l'additif de la ville la nuit ne se voyait plus), balayage et glitch comme les réclames de la ville. */
function cryptoPicto(x,k,cx,cy,s,col){x.save();x.translate(cx,cy);x.fillStyle=x.strokeStyle=col;x.lineWidth=s*.12;x.lineJoin='round';
  const tri=function(px,py,r){x.beginPath();x.moveTo(px,py-r);x.lineTo(px+r,py+r*.8);x.lineTo(px-r,py+r*.8);x.closePath();x.fill();};
  if(k==='up'){tri(0,0,s*.55);}
  else if(k==='btc'){x.beginPath();x.arc(0,0,s*.55,0,6.283);x.fill();x.fillStyle='#08130c';x.font=Math.round(s*.6)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('B',s*.03,s*.04);
    x.fillRect(-s*.16,-s*.47,s*.08,s*.16);x.fillRect(s*.04,-s*.47,s*.08,s*.16);x.fillRect(-s*.16,s*.3,s*.08,s*.16);x.fillRect(s*.04,s*.3,s*.08,s*.16);}
  else if(k==='eth'){x.beginPath();x.moveTo(0,-s*.6);x.lineTo(s*.36,0);x.lineTo(0,s*.18);x.lineTo(-s*.36,0);x.closePath();x.fill();x.beginPath();x.moveTo(-s*.36,s*.1);x.lineTo(0,s*.3);x.lineTo(s*.36,s*.1);x.lineTo(0,s*.6);x.closePath();x.fill();}
  else if(k==='fusee'){x.rotate(.6);x.beginPath();x.moveTo(0,-s*.62);x.quadraticCurveTo(s*.22,-s*.3,s*.18,s*.3);x.lineTo(-s*.18,s*.3);x.quadraticCurveTo(-s*.22,-s*.3,0,-s*.62);x.fill();
    x.fillRect(-s*.32,s*.12,s*.14,s*.26);x.fillRect(s*.18,s*.12,s*.14,s*.26);x.fillStyle='#ff9a2e';x.beginPath();x.moveTo(-s*.12,s*.34);x.lineTo(0,s*.7);x.lineTo(s*.12,s*.34);x.fill();}
  else if(k==='taureau'){x.beginPath();x.ellipse(0,s*.08,s*.42,s*.3,0,0,6.283);x.fill();x.lineWidth=s*.11;x.beginPath();x.moveTo(-s*.3,-s*.08);x.quadraticCurveTo(-s*.7,-s*.2,-s*.56,-s*.62);x.stroke();
    x.beginPath();x.moveTo(s*.3,-s*.08);x.quadraticCurveTo(s*.7,-s*.2,s*.56,-s*.62);x.stroke();x.fillStyle='#ff2a2a';x.fillRect(-s*.2,-s*.02,s*.1,s*.08);x.fillRect(s*.1,-s*.02,s*.1,s*.08);}
  else if(k==='diam'){x.beginPath();x.moveTo(-s*.5,-s*.2);x.lineTo(-s*.25,-s*.5);x.lineTo(s*.25,-s*.5);x.lineTo(s*.5,-s*.2);x.lineTo(0,s*.6);x.closePath();x.fill();
    x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=s*.04;x.beginPath();x.moveTo(-s*.5,-s*.2);x.lineTo(s*.5,-s*.2);x.moveTo(-s*.12,-s*.5);x.lineTo(-s*.2,-s*.2);x.lineTo(0,s*.6);x.moveTo(s*.12,-s*.5);x.lineTo(s*.2,-s*.2);x.lineTo(0,s*.6);x.stroke();}
  else if(k==='bougies'){for(let i=0;i<5;i++){const h=s*(.22+i*.14),px=-s*.5+i*s*.25;x.fillRect(px-s*.07,s*.5-h-s*.08*i,s*.14,h);x.fillRect(px-s*.015,s*.5-h-s*.08*i-s*.1,s*.03,h+s*.2);}}
  else if(k==='lune'){x.beginPath();x.arc(0,0,s*.5,0,6.283);x.fill();x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.arc(-s*.15,-s*.1,s*.11,0,6.283);x.arc(s*.18,s*.16,s*.08,0,6.283);x.fill();}
  x.restore();}
function cryptoPubAtlas(){
  if(CRYPTO.mat.pubT)return CRYPTO.mat.pubT;
  const C=256,cv=document.createElement('canvas');cv.width=2048;cv.height=1024;const x=cv.getContext('2d'); // (2026-10-15) 8 × 4 écrans
  const PUB=[['BTC','#3dff9a','#03170c','+420 %','up'],['TO THE MOON','#ffd75e','#140c3a','NEXT STOP','fusee'],['HODL','#7df9ff','#2a0c4a','DIAMOND HANDS','diam'],['ATH','#3dff9a','#062014','ALL TIME HIGH','up'],
    ['BULL RUN','#ffd75e','#0b3a1c','GREEN ONLY','taureau'],['WAGMI','#ffffff','#0f7a3a','WE ALL MAKE IT','up'],['100X','#ffd75e','#3a1206','LEVIER MAX','up'],['ETH','#d8e2ff','#2b1d6e','+69 %','eth'],
    ['LAMBO','#ffe23e','#0a0a0a','WEN ? NOW.','up'],['PUMP','#3dff9a','#0c0c18','IT. ALWAYS.','bougies'],['GM','#ff9a2e','#1a0f04','GOOD MORNING','btc'],['$1 000 000','#ffd75e','#08130c','1 BTC','btc'],
    ['NUMBER','#3dff9a','#03170c','GO UP','bougies'],['CASH CAR','#ffd75e','#b0106a','LA CAISSE QUI PAIE','btc'],['BUY','#3dff9a','#062014','QUEL DIP ?','up'],['MOON','#ffffff','#0d1640','MISSION','lune'],
    /* (2026-10-15, Sacha : « pleine de références à la token culture, à l'argent et à la tech ») seize de plus */
    ['NFT','#ff6ad5','#1a0630','JPEG MILLIONAIRE','diam'],['SATOSHI','#ffb347','#1a0f04','NAKAMOTO','btc'],['WEB3','#7df9ff','#04162a','THE FUTURE','up'],['DEFI','#3dff9a','#062014','APY 1000 %','bougies'],
    ['AIRDROP','#ffd75e','#0d1640','FREE TOKENS','fusee'],['STAKE','#3dff9a','#03170c','APY 420 %','up'],['WHALE','#7df9ff','#0a1a3a','10 000 BTC','btc'],['FOMO','#ff9a2e','#2a0a04','BUY NOW','up'],
    ['DOGE','#ffd75e','#3a2a06','MUCH WOW','lune'],['DAO','#d8e2ff','#2b1d6e','VOTE ON-CHAIN','eth'],['GAS 0','#3dff9a','#062014','GWEI','eth'],['AI','#7df9ff','#08102a','SUPERCYCLE','diam'],
    ['MINING','#ffb347','#14100a','HASHRATE ATH','bougies'],['LFG','#3dff9a','#03170c','LETS GO','fusee'],['SER','#ffffff','#0f7a3a','PROBABLY NOTHING','up'],['1 BTC','#ffd75e','#08130c','= 1 BTC','btc']];
  pubLangue(PUB); // les réclames parlent la langue du joueur
  PUB.forEach(function(p,k){const ox=(k%8)*C,oy=((k/8)|0)*C;
    const g=x.createLinearGradient(0,oy,0,oy+C);g.addColorStop(0,p[2]);g.addColorStop(1,'#020304');x.fillStyle=g;x.fillRect(ox+6,oy+6,C-12,C-12);
    x.strokeStyle=p[1];x.lineWidth=6;x.strokeRect(ox+12,oy+12,C-24,C-24);x.globalAlpha=.35;x.lineWidth=2;x.strokeRect(ox+24,oy+24,C-48,C-48);x.globalAlpha=1;
    cryptoPicto(x,p[4],ox+C/2,oy+C*.3,C*.3,p[1]);
    x.fillStyle=p[1];x.textAlign='center';x.textBaseline='middle';
    const fz=Math.min(40,Math.floor((C-44)/Math.max(3,p[0].length)));x.font=fz+'px "Press Start 2P",monospace';x.fillText(p[0],ox+C/2,oy+C*.62);
    x.font='12px "Press Start 2P",monospace';x.fillStyle='#ffffff';x.fillText(p[3],ox+C/2,oy+C*.8);
    if(p[4]==='up'||p[4]==='bougies'){x.fillStyle=p[1];x.globalAlpha=.6;for(let i=0;i<7;i++)x.fillRect(ox+30+i*28,oy+C-34-i*3,16,6+i*3);x.globalAlpha=1;}});
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=4;texLibere(t); // (2026-10-14, passe perf mobile) — (2026-10-15) 2048 × 1024 : 8 Mo, rendus après l'envoi
  CRYPTO.mat.pubT=t;return t;
}
function cryptoMatPub(){
  if(CRYPTO.mat.pub)return CRYPTO.mat.pub;
  const m=new THREE.MeshBasicMaterial({map:cryptoPubAtlas(),side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CITY.uT;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT9;varying float vS9;')
      .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\n'+
        'vS9=fract(instanceMatrix[3].x*.0713+instanceMatrix[3].z*.0419+instanceMatrix[3].y*.017);float c9=floor(vS9*32.);'+
        'float gl9=step(.95,fract(uT9*(.3+vS9*.4)+vS9*9.))*(fract(sin(floor(uT9*12.)+vS9*50.)*43.7)-.5)*.3;'+
        'vUv=(vec2(clamp(vUv.x+gl9,0.,1.),vUv.y)*.97+.015+vec2(mod(c9,8.),3.-floor(c9/8.)))/vec2(8.,4.);\n#else\nvS9=0.;\n#endif');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9;varying float vS9;')
      .replace('#include <fog_fragment>','gl_FragColor.rgb*=(.86+.14*step(.5,fract(gl_FragCoord.y*.25-uT9*6.)))*(1.25+.15*sin(uT9*(3.+vS9*4.)));\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'pubsCrypto2';};m.dispose=function(){};
  CRYPTO.mat.pub=m;return m;
}
// LES BOUGIES : un prisme de verre qui s'allume du bas vers le haut, ses arêtes plus claires, des données qui montent dedans
function cryptoMatBougie(){
  if(CRYPTO.mat.bougie)return CRYPTO.mat.bougie;
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CRYPTO.uT;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vL9,vN9,vC9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvC9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\n#else\nvC9=vec3(1.);\n#endif\nvL9=position*vC9;vN9=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9;varying vec3 vL9,vN9,vC9;')
      .replace('#include <fog_fragment>','{vec3 an=abs(vN9);vec2 p=an.y>.5?vL9.xz:(an.x>an.z?vL9.zy:vL9.xy),hs=an.y>.5?vC9.xz*.5:(an.x>an.z?vC9.zy:vC9.xy)*.5;'+
        'vec2 e=hs-abs(p),fe=max(fwidth(p),vec2(1e-3));float ar=1.-smoothstep(0.,max(fe.x,fe.y)*2.5+.6,min(e.x,e.y));'+
        'float h=clamp(vL9.y/vC9.y+.5,0.,1.),sc=smoothstep(.9,1.,fract(vL9.y*.03-uT9*.3))*step(9.,vC9.x),me=step(vC9.x,5.);'+ // me : la MÈCHE (pleine lumière)
        'float k9=mix((.16+.30*h+.22*sc)+1.25*ar+.7*step(.5,an.y),1.,me);gl_FragColor.rgb*=k9;}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'bougiesCrypto1';};m.dispose=function(){};
  CRYPTO.mat.bougie=m;return m;
}
// LE TAUREAU : verre d'or — une baie tous les 3,4 m, un étage tous les 4,6 m (dans le monde), le ciel et le soleil dans les vitres
// (2026-10-18, LE TAUREAU v2) les vitres ne sont plus que sur les TOURS sous les sabots (`aVit` = 1), allumées la nuit ; le CORPS est une statue d'OR POLI
// à facettes : chaque facette renvoie SON morceau de ciel, l'éclat du soleil court de l'une à l'autre (la grille de baies, vue de 300 m, ne faisait qu'un grain orange)
const TAUREAU_VERRE=
  '{vec3 N9=normalize(vN9);float vert=1.-smoothstep(.55,.85,abs(N9.y));vec3 V9=normalize(vW9-cameraPosition);'+
  'vec3 Th=normalize(vec3(-N9.z,0.,N9.x)+vec3(1e-4,0.,0.));vec2 uv=vec2(dot(vW9,Th)/3.4,vW9.y/4.6),fw=max(fwidth(uv),vec2(1e-4));'+
  'vec2 f=fract(uv),dd=(vec2(.40,.35)-abs(f-.5))/fw;float far=smoothstep(.3,.75,max(fw.x,fw.y)),pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),.56,far)*vert*vV9;'+
  'vec3 R9=reflect(V9,N9);float ry=R9.y;vec3 sky=ry>0.?mix(mix(uHor9,uMid9,smoothstep(0.,.16,ry)),uZen9,smoothstep(.12,.92,ry)):mix(uHor9*.7,vec3(.12,.1,.07),smoothstep(0.,-.28,ry));'+
  'float sd=max(dot(R9,uSun9),0.),gl=pow(sd,240.)*6.+pow(sd,16.)*.35,fr=clamp(.22+.78*pow(1.-abs(dot(V9,N9)),3.),0.,1.),ph=fract(sin(dot(floor(uv),vec2(12.9898,78.233)))*43758.5453);'+
  'vec3 rf=vec3(dot(sky,vec3(.3,.59,.11)));'+ // le miroir d'or : la LUMIÈRE du ciel, teintée d'or
  'vec3 glass=mix(vec3(.16,.09,.02)*(.7+.6*ph),rf*vec3(1.,.82,.42)*1.1,fr*(.85+.3*ph*(1.-far)))+gl*vec3(1.,.92,.7)+vec3(1.,.84,.5)*.4*step(.95,ph)*(1.-far)+uNuit9*vec3(1.,.8,.5)*step(.45,ph)*(.35+.4*ph)*(1.-.5*far);'+ // la nuit, les bureaux des tours restent allumés
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,glass,pane*.86);'+
  // L'OR POLI du corps : un MÉTAL — presque plus de diffus, le ciel teinté d'or (au carré : l'horizon clair et le zénith sombre se séparent, chaque
  // facette tranche sur sa voisine), plus fort de biais (Fresnel), l'éclat franc du soleil ; la nuit, des projecteurs l'éclairent d'en bas
  'float st=1.-vV9,L9=rf.x;vec3 orP=vec3(1.,.78,.36)*(.10+1.35*L9*L9)*(.75+.55*fr)+gl*vec3(1.,.9,.66)*1.8+uNuit9*vec3(.5,.32,.1)*(.35+.65*clamp(.5-.5*N9.y,0.,1.));'+
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,orP,st*.85);'+
  // LE BANDEAU DU TAUREAU : un ruban de cours vert tout autour du ventre (à hauteur de route : on le lit en passant)
  'float yy=vW9.y-uBand9;if(abs(yy)<4.2&&vert>.5){float ps=1.15,gx=(dot(vW9,Th)-uT9*14.)/ps,gy=floor((yy+4.)/ps),ch=floor(gx/6.),cx=floor(mod(gx,6.));'+
  ' float on=mod(ch,4.)<.5?step(0.,gy-1.)*step(gy-1.,4.)*step(abs(cx-2.),2.-(gy-1.)*.5+.01):step(cx,4.)*step(1.,gy)*step(gy,5.)*step(.4,fract(sin(dot(vec3(cx,gy,ch),vec3(12.9898,78.233,37.719)))*43758.5453));'+
  ' float lo=smoothstep(.4,1.2,fwidth(gx));on=mix(on,.35,lo);gl_FragColor.rgb=vec3(.01,.03,.015)+vec3(.15,1.7,.55)*on;}'+
  '}\n';
function cryptoMatTaureau(){
  if(CRYPTO.mat.taureau)return CRYPTO.mat.taureau;
  const m=new THREE.MeshPhongMaterial({color:0xe0b44a,specular:0xffffff,shininess:110,emissive:0x0a0702});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CRYPTO.uT,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,uSun9:CRYPTO.uSun,uBand9:m.userData.uBand,uNuit9:CRYPTO.uNuit});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aVit;varying vec3 vW9,vN9;varying float vV9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvW9=(modelMatrix*vec4(transformed,1.)).xyz;vN9=normalize(mat3(modelMatrix)*objectNormal);vV9=aVit;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uBand9,uNuit9;uniform vec3 uZen9,uMid9,uHor9,uSun9;varying vec3 vW9,vN9;varying float vV9;')
      .replace('#include <fog_fragment>',TAUREAU_VERRE+'#include <fog_fragment>');};
  m.userData.uBand={value:-1e5}; // la hauteur du ruban (celle du taureau le plus proche : cryptoTick)
  m.customProgramCacheKey=function(){return 'taureauCrypto2';};m.dispose=function(){};
  CRYPTO.mat.taureau=m;return m;
}
function cryptoMats(){ // les petites matières, une fois
  const M=CRYPTO.mat;if(M.corne)return M;
  M.corne=new THREE.MeshPhongMaterial({color:0xfff4dc,specular:0xffffff,shininess:90,emissive:0x3a3326});
  M.oeil=new THREE.MeshBasicMaterial({color:new THREE.Color(4,.35,.25)});
  M.laser=new THREE.MeshBasicMaterial({color:new THREE.Color(3.2,.18,.12),transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending});
  M.laserC=new THREE.MeshBasicMaterial({color:new THREE.Color(4,2.2,1.8),transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
  M.anneau=new THREE.MeshPhongMaterial({color:0xffcf4a,specular:0xffffff,shininess:120,emissive:0x5a3a00});
  M.ballon=new THREE.MeshPhongMaterial({color:0xf3f5f9,specular:0xffffff,shininess:60,emissive:0x1a1a20});
  M.or=new THREE.MeshPhongMaterial({color:0xffc63a,specular:0xfff3c0,shininess:100,emissive:0x4a3000});
  M.diam=new THREE.MeshPhongMaterial({color:0x8fefff,specular:0xffffff,shininess:140,emissive:0x1c4a7a,flatShading:true});
  M.fusee=new THREE.MeshPhongMaterial({color:0xf6f6f8,specular:0xffffff,shininess:70,emissive:0x141418});
  M.fuseeR=new THREE.MeshPhongMaterial({color:0xff3a3a,specular:0xffd0d0,shininess:60,emissive:0x300404});
  M.flamme=new THREE.SpriteMaterial({map:lampTex,color:new THREE.Color(3,1.5,.5),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const k in M)if(M[k]&&M[k].isMaterial)M[k].dispose=function(){};
  return M;
}
/* ---- LES FORMES ---- */
// un triangle tourné vers l'EXTÉRIEUR (ref = un point à l'intérieur du volume) : toutes nos formes sont des volumes convexes par tranche
function crTri(P,a,b,c,ref){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  const gx=(a[0]+b[0]+c[0])/3-ref[0],gy=(a[1]+b[1]+c[1])/3-ref[1],gz=(a[2]+b[2]+c[2])/3-ref[2];
  if(nx*gx+ny*gy+nz*gz<0)P.push(a[0],a[1],a[2],c[0],c[1],c[2],b[0],b[1],b[2]);else P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);}
/* LE TAUREAU v2 (2026-10-18, Sacha : « dans la map crypto city retravaille le design du toreau géant et vérifie bien que la hit box dans la
   map fonctionne ») — UNE SEULE DESCRIPTION pour ce qu'on VOIT et ce qui est DUR : `taureauForme` rend une liste de VOLUMES (des anneaux
   le long d'un axe : le corps, la tête, les pattes, les tours ; ou le long d'une courbe : cornes, oreilles, queue) ; `crVolume` en tire les
   triangles, `crDans` dit si un point est dedans. Retoucher la forme déplace la collision avec elle. (Avant : neuf boîtes posées à la main —
   un trou de 35 m dans l'encolure, des cornes sans collision, et autour des pattes et du corps des murs FANTÔMES : 74 % du volume visible
   en plus, du vide où l'on mourait.)
   Un ANNEAU : un centre c, une demi-largeur w (le long de u), deux demi-hauteurs hT/hB (le long de +v / −v), son axe f (perpendiculaire
   à son plan). Une SECTION : n sommets d'une super-ellipse normalisée (e = 2 ovale, 3 muscle carré), la même pour tout le volume. */
function crAnneau(x,y,z,w,hT,hB,p){const sp=Math.sin(p||0),cp=Math.cos(p||0); // p = le tangage de l'axe : 0 = vers la tête (+z), π/2 = vers le bas
  return {c:[x,y,z],w:w,hT:hT,hB:hB,f:[0,-sp,cp],u:[1,0,0],v:[0,cp,sp]};}
function crSection(n,e,rot){const S=[];for(let j=0;j<n;j++){const t=(rot||0)+j/n*6.2832,c=Math.cos(t),s=Math.sin(t);
  S.push([Math.sign(c)*Math.pow(Math.abs(c),2/e),Math.sign(s)*Math.pow(Math.abs(s),2/e)]);}return S;}
function crPoint(A,s){const h=s[1]>0?A.hT:A.hB,a=s[0]*A.w,b=s[1]*h;return [A.c[0]+a*A.u[0]+b*A.v[0],A.c[1]+a*A.u[1]+b*A.v[1],A.c[2]+a*A.u[2]+b*A.v[2]];}
// un volume d'anneaux : sa boîte englobante (la collision ne regarde dedans que si la caisse y est)
function crVol(A,S,cl){const bb=[1e9,1e9,1e9,-1e9,-1e9,-1e9];
  for(const a of A)for(const s of S){const q=crPoint(a,s);for(let k=0;k<3;k++){bb[k]=Math.min(bb[k],q[k]);bb[k+3]=Math.max(bb[k+3],q[k]);}}
  return {A:A,S:S,cl:cl,bb:bb};}
// un TUBE effilé le long d'une courbe : des anneaux ronds posés sur la courbe, du rayon r0 au rayon r1 (kn : la courbe de l'effilé)
function crTubeV(pts9,r0,r1,n,cl,kn){const cu=new THREE.CatmullRomCurve3(pts9.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);})),tg=new THREE.Vector3(),A=[];
  for(let i=0;i<=n;i++){const u=i/n,p=cu.getPointAt(u);cu.getTangentAt(u,tg);const r=r0+(r1-r0)*Math.pow(u,kn||.8);
    let ux=tg.z,uz=-tg.x;const l=Math.hypot(ux,uz);if(l<1e-4){ux=1;uz=0;}else{ux/=l;uz/=l;} // u : l'horizontale perpendiculaire à la courbe
    A.push({c:[p.x,p.y,p.z],w:r,hT:r,hB:r,f:[tg.x,tg.y,tg.z],u:[ux,0,uz],v:[tg.y*uz,tg.z*ux-tg.x*uz,-tg.y*ux]});} // v = f×u
  return crVol(A,crSection(6,2,0),cl);}
function crVolume(P,V,o,vit){ // les triangles d'un volume, faces dehors, fermé aux deux bouts ; V reçoit le drapeau « vitres » de chaque sommet
  const S=o.S,n=S.length,R=o.A.map(function(A){return S.map(function(s){return crPoint(A,s);});}),n0=P.length;
  for(let k=0;k<R.length-1;k++){const a=o.A[k].c,b=o.A[k+1].c,ref=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
    for(let j=0;j<n;j++){const j2=(j+1)%n;crTri(P,R[k][j],R[k+1][j],R[k+1][j2],ref);crTri(P,R[k][j],R[k+1][j2],R[k][j2],ref);}}
  for(const e of [0,R.length-1]){const c=o.A[e].c,d=e?-3:3,f=o.A[e].f,ref=[c[0]+f[0]*d,c[1]+f[1]*d,c[2]+f[2]*d];
    for(let j=0;j<n;j++)crTri(P,c,R[e][j],R[e][(j+1)%n],ref);}
  if(V)for(let i=n0;i<P.length;i+=3)V.push(vit);}
/* DEDANS ? — le point (x,y,z) dans le volume o, avec une marge m. Entre deux anneaux, le point se place par ses distances aux deux plans
   (t), l'anneau est interpolé là, et le point est comparé à la section (un polygone convexe, symétrique) : exactement la surface dessinée. */
function crDans(o,x,y,z,m){const b=o.bb;
  if(x<b[0]-m||x>b[3]+m||y<b[1]-m||y>b[4]+m||z<b[2]-m||z>b[5]+m)return false;
  const A=o.A,S=o.S,n=S.length,last=A.length-2;
  for(let k=0;k<=last;k++){const a=A[k],c=A[k+1];
    const sa=(x-a.c[0])*a.f[0]+(y-a.c[1])*a.f[1]+(z-a.c[2])*a.f[2],sb=(x-c.c[0])*c.f[0]+(y-c.c[1])*c.f[1]+(z-c.c[2])*c.f[2];
    if(sa<(k?0:-m)||sb>(k<last?0:m))continue;
    const dn=sa-sb,t=dn>1e-6?Math.min(1,Math.max(0,sa/dn)):0,t1=1-t;
    const qx=x-(a.c[0]*t1+c.c[0]*t),qy=y-(a.c[1]*t1+c.c[1]*t),qz=z-(a.c[2]*t1+c.c[2]*t);
    const ua=Math.abs(qx*(a.u[0]*t1+c.u[0]*t)+qy*(a.u[1]*t1+c.u[1]*t)+qz*(a.u[2]*t1+c.u[2]*t)),vb=qx*(a.v[0]*t1+c.v[0]*t)+qy*(a.v[1]*t1+c.v[1]*t)+qz*(a.v[2]*t1+c.v[2]*t);
    const X=ua/(a.w*t1+c.w*t+m),Y=vb/((vb>0?a.hT*t1+c.hT*t:a.hB*t1+c.hB*t)+m);
    let ok=true;for(let j=0;j<n&&ok;j++){const p=S[j],q=S[(j+1)%n];if((q[0]-p[0])*(Y-p[1])-(q[1]-p[1])*(X-p[0])<0)ok=false;}
    if(ok)return true;}
  return false;}
// des anneaux le long d'une patte qui descend, coupés à la hauteur du pied (une route passe parfois juste dessous : la patte s'arrête au-dessus)
function crCoupe(R,pl){const o=[];for(let i=0;i<R.length;i++){const r=R[i];if(r.c[1]>pl+1){o.push(r);continue;}
    if(i){const a=R[i-1],t=(a.c[1]-pl)/(a.c[1]-r.c[1]),L=function(k){return a[k]+(r[k]-a[k])*t;};
      o.push({c:[a.c[0]+(r.c[0]-a.c[0])*t,pl,a.c[2]+(r.c[2]-a.c[2])*t],w:L('w'),hT:L('hT'),hB:L('hB'),f:r.f,u:r.u,v:r.v});}
    break;}
  return o.length>1?o:null;}
// coupé au pied, le bout d'une patte ou d'une tour s'effile (×k sur les 14 derniers mètres du repère) : une pointe suspendue, pas une coupe franche
function crPointe(R,pl,k){const L=R[R.length-1],P=R[R.length-2];if(L.c[1]!==pl||P.c[1]-pl<24)return R;
  const t=14/(P.c[1]-pl),M={c:[L.c[0]+(P.c[0]-L.c[0])*t,pl+14,L.c[2]+(P.c[2]-L.c[2])*t],w:L.w,hT:L.hT,hB:L.hB,f:L.f,u:L.u,v:L.v};
  return R.slice(0,-1).concat([M,{c:L.c,w:L.w*k,hT:L.hT*k,hB:L.hB*k,f:L.f,u:L.u,v:L.v}]);}
/* LE TAUREAU QUI CHARGE (celui de Wall Street, en gratte-ciel d'or) — repère local : +z = la tête, +y = le haut, le dessous du poitrail à y ≈ 0.
   La silhouette : une croupe ronde, des hanches larges, la taille qui se creuse, un poitrail profond sous la BOSSE du garrot (le plus haut),
   l'encolure épaisse, et la TÊTE BASSE (son axe plonge à 63°) : le front fait face à la caisse, le mufle est en bas. Les cornes sortent de
   côté puis viennent en AVANT (c'est elles qui disent « taureau » de loin), les oreilles dessous ; la queue en fouet. Les pattes sont des
   pattes jusqu'au sabot (l'avant lancée, le jarret de l'arrière qui pousse), puis des TOURS à gradins Art déco qui plongent dans la brume. */
function taureauForme(pl){
  const F=[],S16=crSection(16,2.6,0),S12=crSection(12,2.4,0),S8=crSection(8,2,Math.PI/8),PI2=Math.PI/2;
  const Y=function(y,z){return y-.13*z;}; // LA CHARGE : tout le taureau penche de 7° vers l'avant (la croupe haute, le mufle bas)
  // LE CORPS, de la croupe à l'encolure : [z, le dos, le dessous, demi-largeur] — le centre de l'anneau aux 44 % (la masse en bas : le poitrail)
  F.push(crVol([[-208,186,124,28],[-196,204,92,62],[-170,228,50,92],[-130,234,30,100],[-86,224,38,86],[-38,232,22,92],[12,254,8,104],
    [60,288,-6,116],[102,308,-10,118],[138,294,4,106],[166,262,28,90],[196,226,54,72]]
    .map(function(r){const c=r[2]+.44*(r[1]-r[2]);return crAnneau(0,Y(c,r[0]),r[0],r[3],r[1]-c,c-r[2],0);}),S16,0));
  // LA TÊTE, basse : de la nuque (entre les cornes) au mufle, le long d'un axe qui plonge — [t, demi-largeur, côté front, côté gorge]
  const z0=192,y0=Y(152,192),z1=236,y1=Y(-2,236),p=Math.atan2(y0-y1,z1-z0),T9=function(t){return [y0+(y1-y0)*t,z0+(z1-z0)*t];};
  F.push(crVol([[0,70,44,62],[.1,82,58,68],[.26,86,64,66],[.45,70,58,56],[.62,58,50,46],[.8,62,48,44],[.92,62,44,38],[1,50,30,26]]
    .map(function(r){const q=T9(r[0]);return crAnneau(0,q[0],q[1],r[1],r[2],r[3],p);}),crSection(16,3,0),0));
  {const q=T9(.26),sp=Math.sin(p),cp=Math.cos(p);F.yeux=[-1,1].map(function(s){return [s*72,q[0]+24*cp,q[1]+24*sp];}); // les yeux : sur les côtés du front
   const n=T9(.97);F.nez=[0,n[0]-14*cp,n[1]-14*sp+6];} // l'anneau : sous les naseaux
  for(const s of [-1,1]){
    // LES PATTES jusqu'au sabot, courtes et épaisses : [x, y, z, demi-largeur, devant, derrière, tangage] — l'avant lancée, le genou plié ;
    // l'arrière qui POUSSE (le jarret en arrière, le canon qui revient)
    const av=[[54,Y(118,100),100,50,62,62,1.2],[55,Y(40,128),128,46,52,56,1.2],[56,-14,150,37,41,43,1.25],[57,-34,158,38,41,41,1.5],[57,-66,162,30,32,34,1.62],[57,-84,160,29,31,31,1.62],[57,-96,159,31,33,33,1.57]],
      ar=[[56,Y(132,-128),-128,56,72,72,1.95],[57,Y(56,-160),-160,50,58,62,1.95],[58,4,-186,37,40,46,1.9],[58,-22,-194,35,37,44,1.6],[59,-60,-184,29,31,31,1.33],[59,-84,-178,28,29,29,1.45],[59,-96,-176,30,31,31,1.57]];
    for(const P9 of [av,ar]){const R=crCoupe(P9.map(function(r){return crAnneau(s*r[0],r[1],r[2],r[3],r[4],r[5],r[6]);}),pl);if(R)F.push(crVol(crPointe(R,pl,.55),S12,0));
      // …le sabot pose sur LE TOIT D'UNE TOUR : la corniche, puis le fût à vitres (cl 1) qui s'élargit par gradins jusqu'au pied, dans la brume
      const h=P9[P9.length-1],T=[[-92,30],[-96,46],[-104,46],[-105,40],[-180,40],[-181,46],[-290,46],[-291,52],[-1e4,56]],x=s*h[0],z=h[2];
      const RT=crCoupe(T.map(function(r){return crAnneau(x,r[0],z,r[1],r[1],r[1],PI2);}),pl);if(RT)F.push(crVol(crPointe(RT,pl,.4),S8,1));}
    // LA CORNE : grosse à la base, sur les coins du front, de côté puis en AVANT, la pointe qui remonte vers le centre (ivoire, cl 2)
    F.push(crTubeV([[64,146,208],[108,154,210],[148,170,226],[166,194,254],[160,220,286],[136,234,312]].map(function(q){return [s*q[0],Y(q[1],q[2]),q[2]];}),30,4,16,2,.85));
    // L'OREILLE, sous la corne
    F.push(crTubeV([[66,132,200],[100,120,194],[116,108,190]].map(function(q){return [s*q[0],Y(q[1],q[2]),q[2]];}),13,3,6,0,.7));}
  // LA QUEUE en fouet (un grand S qui monte) et sa touffe
  F.push(crTubeV([[0,186,-200],[0,210,-226],[6,242,-238],[16,272,-228],[24,290,-204],[28,296,-178]].map(function(q){return [q[0],Y(q[1],q[2]),q[2]];}),11,5,14,0,1));
  F.push(crTubeV([[27,296,-184],[31,301,-164],[33,301,-148]].map(function(q){return [q[0],Y(q[1],q[2]),q[2]];}),15,2,6,0,1.6));
  return F;}
function taureauDur(F,x,y,z,m){for(let i=0;i<F.length;i++)if(crDans(F[i],x,y,z,m))return true;return false;}
function taureauLibre(F,x,y,z,cap,proches){ // (cryptoPlace) aucun point de la route — au bitume et 6 m au-dessus — à moins de 30 m de la forme posée en (x,y,z), tournée de cap
  const K=TAUREAU_K,co=Math.cos(cap),si=Math.sin(cap),m=30/K;let ok=true;
  proches(x,z,560,function(i){if(!ok)return;const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz>560*560)return;const lx=(dx*co-dz*si)/K,lz=(dx*si+dz*co)/K;
    if(taureauDur(F,lx,(p.y-y)/K,lz,m)||taureauDur(F,lx,(p.y+6-y)/K,lz,m))ok=false;});
  return ok;}
function crGeo(P,V){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));if(V)g.setAttribute('aVit',new THREE.Float32BufferAttribute(V,1));
  g.computeVertexNormals();g.computeBoundingSphere();return g;}
function cryptoTaureauGeo(F){ // l'or (le corps, cl 0 ; les tours à vitres, cl 1) et l'ivoire (les cornes, cl 2)
  const P=[],V=[],Pc=[];for(const o of F){if(o.cl===2)crVolume(Pc,null,o,0);else crVolume(P,V,o,o.cl);}
  return {corps:crGeo(P,V),cornes:crGeo(Pc)};}
const TAUREAU_K=1.35; // l'échelle du taureau : la bosse ~320 m au-dessus de la route, les cornes pointées vers elle
function cryptoTaureau(root,t){
  const M=cryptoMats(),F=t.F||taureauForme((t.pied-t.y)/TAUREAU_K),G=cryptoTaureauGeo(F),g=new THREE.Group(); // F : la forme déjà posée par cryptoPlace
  g.position.set(t.x,t.y,t.z);g.rotation.y=t.cap;g.scale.setScalar(TAUREAU_K);
  const c=new THREE.Mesh(G.corps,cryptoMatTaureau()),k=new THREE.Mesh(G.cornes,M.corne);g.add(c);g.add(k);CRYPTO.jeter.push(c,k);
  const an=new THREE.Mesh(CRYPTO_G.tore,M.anneau);an.position.fromArray(F.nez);an.scale.setScalar(14);g.add(an); // l'anneau dans le mufle
  const yeux=[],lasers=[];
  for(const e of F.yeux){const o=new THREE.Mesh(CRYPTO_G.oeil,M.oeil);o.position.fromArray(e);o.scale.setScalar(8);g.add(o);yeux.push(o);
    const L9=new THREE.Group();L9.position.copy(o.position);g.add(L9);
    const b=new THREE.Mesh(CRYPTO_G.laser,M.laser);b.scale.set(5,1700,5);L9.add(b);const b2=new THREE.Mesh(CRYPTO_G.laser,M.laserC);b2.scale.set(1.3,1700,1.3);L9.add(b2);
    b.frustumCulled=b2.frustumCulled=false;lasers.push(L9);}
  root.add(g);g.updateMatrixWorld(true);
  return {k:TAUREAU_K,g:g,x:t.x,y:t.y,z:t.z,co:Math.cos(t.cap),si:Math.sin(t.cap),F:F,pl:(t.pied-t.y)/TAUREAU_K,lasers:lasers,ph:t.ph,s:t.s};
}
function cryptoHeurt(p){ // la caisse est-elle DANS un taureau ? (comme villeHeurt : en vol) — la forme dessinée elle-même, marge 0,7 m (la demi-caisse)
  for(const b of CRYPTO.taureaux){const dx=p.x-b.x,dz=p.z-b.z;if(dx*dx+dz*dz>480*480)continue; // le bout des cornes est à ~460 m du centre
    const lx=(dx*b.co-dz*b.si)/b.k,lz=(dx*b.si+dz*b.co)/b.k,ly=(p.y-b.y)/b.k; // rotation.y = cap (et l'échelle) : le local se lit par la transformation inverse
    if(taureauDur(b.F,lx,ly,lz,.7/b.k))return true;}
  return false;
}
/* ---- LES GÉOMÉTRIES PARTAGÉES (une fois) ---- */
const CRYPTO_G={};
function cryptoGeos(){
  if(CRYPTO_G.cube)return CRYPTO_G;
  CRYPTO_G.cube=new THREE.BoxGeometry(1,1,1);
  CRYPTO_G.tore=new THREE.TorusGeometry(1,.17,6,14);
  CRYPTO_G.oeil=new THREE.OctahedronGeometry(1,1);
  {const g=new THREE.CylinderGeometry(1,1,1,6,1,true);g.translate(0,.5,0);g.rotateX(Math.PI/2);CRYPTO_G.laser=g;} // le long de +z, depuis l'œil
  {const g=plaGeoPiece(40,.16);g.rotateX(Math.PI/2);CRYPTO_G.piece=g;} // la pièce ₿ géante : celle de la pluie, plus ronde, DEBOUT (ses faces regardent ±z ; elle tourne sur la verticale)
  {const g=new THREE.OctahedronGeometry(1,0);g.scale(1,1.45,1);CRYPTO_G.diam=g;}
  {const g=new THREE.SphereGeometry(1,24,14);g.scale(16,16,60);CRYPTO_G.ballon=g;}
  CRYPTO_G.plan=new THREE.PlaneGeometry(1,1);
  {const g=new THREE.CylinderGeometry(1,1,1,12);CRYPTO_G.cyl=g;const c=new THREE.ConeGeometry(1,1,12);CRYPTO_G.cone=c;}
  for(const k in CRYPTO_G)CRYPTO_G[k].dispose=function(){};
  return CRYPTO_G;
}
// LE BANDEAU DU COURS (dirigeables) : une bande LED qui défile — la police du jeu, les ▲ dessinés
function cryptoTickerTex(){
  if(CRYPTO.mat.tick)return CRYPTO.mat.tick;
  const W=2048,H=96,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#020604';x.fillRect(0,0,W,H);x.fillStyle='rgba(61,255,154,.08)';for(let i=0;i<W;i+=4)x.fillRect(i,0,1,H);
  const L9=[['BTC','$1 000 000','+420 %'],['ETH','$69 000','+69 %'],['CASH','$161 000','+161 %'],['DOGE','$4,20','+1 000 %'],['SOL','$9 000','+88 %'],['MOON','',''],['HODL','','']];
  x.textBaseline='middle';x.font='34px "Press Start 2P",monospace';let px=20;
  for(const l of L9){x.fillStyle='#ffd75e';x.fillText(l[0],px,H/2);px+=x.measureText(l[0]).width+22;
    if(l[1]){x.fillStyle='#ffffff';x.fillText(l[1],px,H/2);px+=x.measureText(l[1]).width+22;}
    if(l[2]){x.fillStyle='#3dff9a';x.beginPath();x.moveTo(px,H/2+14);x.lineTo(px+16,H/2-16);x.lineTo(px+32,H/2+14);x.fill();px+=44;x.fillText(l[2],px,H/2);px+=x.measureText(l[2]).width;}
    px+=70;if(px>W-200)break;}
  const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.NearestFilter;t.anisotropy=4;
  texLibere(t); // (2026-10-14, passe perf mobile) 2048 × 96 : 0,8 Mo (le défilement = `offset`, la toile n'est jamais repeinte)
  CRYPTO.mat.tick=t;CRYPTO.mat.ecran=new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.5,1.5,1.5)});CRYPTO.mat.ecran.dispose=function(){};return t;
}
/* LES CONSTRUCTIONS DU NIVEAU — après les tours (buildVoxCity) : tout dans le groupe de la ville (il part avec la piste) */
function cryptoBatit(root){
  const S=CRYPTO.sites;if(!S)return;CRYPTO.root=root;const M=cryptoMats(),G=cryptoGeos(),M4=CRYPTO.m4,c=CRYPTO.c;cryptoInit();
  const nb=S.bougies.length;
  if(nb){const im=new THREE.InstancedMesh(G.cube,cryptoMatBougie(),nb*2);
    for(let k=0;k<nb;k++){const b=S.bougies[k];
      M4.makeScale(b.w,b.y1-b.y0,b.w);M4.setPosition(b.x,(b.y0+b.y1)/2,b.z);im.setMatrixAt(2*k,M4);c.setRGB(b.rouge?1.3:.12,b.rouge?.12:1,b.rouge?.18:.42);im.setColorAt(2*k,c);
      const yb=b.y0-b.mb,yt=b.y1+b.mh;M4.makeScale(3,yt-yb,3);M4.setPosition(b.x,(yb+yt)/2,b.z);im.setMatrixAt(2*k+1,M4);c.setRGB(b.rouge?1.2:.35,b.rouge?.35:1.2,b.rouge?.4:.6);im.setColorAt(2*k+1,c);}
    im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;root.add(im);CRYPTO.bougies=im;CRYPTO.jeter.push(im);}
  for(const t of S.taureaux)CRYPTO.taureaux.push(cryptoTaureau(root,t));
  if(S.pieces.length){const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),S.pieces.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.pieces=im;CRYPTO.jeter.push(im);
    for(const p of S.pieces)CRYPTO.pInfo.push(p);}
  if(S.diam.length){const im=new THREE.InstancedMesh(G.diam,M.diam,S.diam.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.diam=im;CRYPTO.jeter.push(im);
    for(const d of S.diam)CRYPTO.dInfo.push(d);}
  if(S.dirig.length){cryptoTickerTex();
    for(const d of S.dirig){const g=new THREE.Group();g.position.set(d.x,d.y,d.z);g.rotation.y=d.cap;
      g.add(new THREE.Mesh(G.ballon,M.ballon));
      for(const a of [0,1,2,3]){const f=new THREE.Mesh(G.cube,M.or);const s9=a<2?(a?1:-1):0,u9=a>=2?(a===2?1:-1):0;f.position.set(s9*12,u9*12,-52);f.scale.set(s9?16:1.6,u9?16:1.6,18);g.add(f);} // les ailerons d'or
      const go=new THREE.Mesh(G.cube,M.or);go.position.set(0,-17,6);go.scale.set(8,5,22);g.add(go); // la nacelle
      for(const s of [-1,1]){const e=new THREE.Mesh(G.plan,CRYPTO.mat.ecran);e.position.set(s*16.4,1,2);e.rotation.y=s*Math.PI/2;e.scale.set(56,9,1);g.add(e);} // les écrans du cours
      root.add(g);CRYPTO.dirig.push({g:g,y:d.y,ph:d.ph});}}
  CRYPTO.ath.t=22;CRYPTO.fusT=3;CRYPTO.feuT=2;
  crhBatit(); /* (2026-10-21) l'horizon du bull run et les projecteurs de la nuit : voir cryptocity-embellie */
}
function cryptoMatPiece(){
  if(CRYPTO.mat.piece)return CRYPTO.mat.piece;
  const m=new THREE.MeshPhongMaterial({map:plaTexPieces(),color:0xffffff,specular:0xffe7a8,shininess:90,emissive:0x2c1a04});
  m.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv.y=vUv.y*.5+.5;\n#endif');}; // la moitié ₿ de l'atlas des pièces
  m.customProgramCacheKey=function(){return 'pieceGeante1';};m.dispose=function(){};
  CRYPTO.mat.piece=m;return m;
}
/* ---- LES OBJETS DU CIEL (une fois pour toute la session : la lune ₿, trois fusées, les feux d'artifice) ---- */
function cryptoInit(){
  if(CRYPTO.lune)return;const M=cryptoMats(),G=cryptoGeos();
  // LA LUNE ₿ : la face de la pièce, qui tourne lentement, posée à l'endroit de la lune du dôme
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),src=plaTexPieces().image;
    const g=x.createRadialGradient(256,256,150,256,256,256);g.addColorStop(0,'rgba(255,214,120,.55)');g.addColorStop(.62,'rgba(255,190,90,.18)');g.addColorStop(1,'rgba(255,180,80,0)');
    x.fillStyle=g;x.fillRect(0,0,512,512);x.save();x.beginPath();x.arc(256,256,158,0,6.283);x.clip();x.drawImage(src,8,2,240,240,98,98,316,316);x.restore();
    const t=texLibere(new THREE.CanvasTexture(cv));t.anisotropy=4; // (2026-10-14, passe perf mobile) 512² : 1 Mo
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false,color:new THREE.Color(1.25,1.18,1.05)}));
    s.renderOrder=24;s.frustumCulled=false;s.visible=false;scene.add(s);CRYPTO.lune=s;}
  // LES FUSÉES « TO THE MOON » : le corps blanc, la coiffe et les ailerons rouges, la flamme, et un sillage de fumée (ruban de 56 points)
  for(let k=0;k<3;k++){const g=new THREE.Group();
    const b=new THREE.Mesh(G.cyl,M.fusee);b.scale.set(2.2,17,2.2);g.add(b);
    const n=new THREE.Mesh(G.cone,M.fuseeR);n.scale.set(2.2,7,2.2);n.position.y=12;g.add(n);
    for(let a=0;a<3;a++){const f=new THREE.Mesh(G.cube,M.fuseeR);const r=a/3*6.283;f.position.set(Math.cos(r)*2.6,-7,Math.sin(r)*2.6);f.rotation.y=-r;f.scale.set(3.4,6,.5);g.add(f);}
    const fl=new THREE.Sprite(M.flamme);fl.position.y=-12;fl.scale.set(9,16,1);g.add(fl);
    g.scale.setScalar(1.5);g.visible=false;scene.add(g);
    const NT=56,pos=new Float32Array(NT*2*3),al=new Float32Array(NT*2),sd9=new Float32Array(NT*2),idx=[];for(let i=0;i<NT*2;i++)sd9[i]=i%2;for(let i=0;i<NT-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aA',new THREE.BufferAttribute(al,1).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aS',new THREE.BufferAttribute(sd9,1));tg.setIndex(idx);
    const tm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,vertexShader:'attribute float aA,aS;varying float vA;varying float vS;void main(){vA=aA;vS=aS;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying float vA;varying float vS;void main(){float e=1.-pow(abs(vS*2.-1.),2.);gl_FragColor=vec4(vec3(1.,.98,.95),vA*e*.62);}'});
    const tr=new THREE.Mesh(tg,tm);tr.frustumCulled=false;tr.visible=false;tr.renderOrder=8;scene.add(tr);
    CRYPTO.fus.push({g:g,fl:fl,tr:tr,pos:pos,al:al,NT:NT,hist:[],on:false,t:0,p:new THREE.Vector3(),v:new THREE.Vector3(),dT:0});}
  // LES FEUX D'ARTIFICE : dix gerbes de 120 étoiles, calculées par la puce (l'origine et l'heure de chaque gerbe en uniforms)
  {const K=10,NP9=120,n=K*NP9,aB=new Float32Array(n),aD=new Float32Array(n*3),aR=new Float32Array(n),po=new Float32Array(n*3);
    for(let i=0;i<n;i++){aB[i]=Math.floor(i/NP9);let x,y,z,l;do{x=Math.random()*2-1;y=Math.random()*2-1;z=Math.random()*2-1;l=x*x+y*y+z*z;}while(l>1||l<.05);l=Math.sqrt(l);
      const r=.82+Math.random()*.18;aD[i*3]=x/l*r;aD[i*3+1]=y/l*r;aD[i*3+2]=z/l*r;aR[i]=Math.random();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(po,3));g.setAttribute('aB',new THREE.BufferAttribute(aB,1));g.setAttribute('aD',new THREE.BufferAttribute(aD,3));g.setAttribute('aR',new THREE.BufferAttribute(aR,1));
    const uO=[],uC=[];for(let k=0;k<K;k++){uO.push(new THREE.Vector4(0,0,0,-99));uC.push(new THREE.Vector3(1,1,1));}
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
      uniforms:{uO:{value:uO},uC:{value:uC},uT:{value:0},uPx:{value:600}},
      vertexShader:'uniform vec4 uO['+K+'];uniform vec3 uC['+K+'];uniform float uT,uPx;attribute float aB,aR;attribute vec3 aD;varying vec3 vC;varying float vA;'+
        'void main(){int b=int(aB+.5);vec4 o=uO[b];float t=uT-o.w;if(t<0.||t>2.8){gl_Position=vec4(0.,0.,2.,1.);gl_PointSize=0.;vA=0.;return;}'+
        'float v=(150.+120.*aR)*(1.-exp(-t*2.6))/2.6;vec3 p=o.xyz+aD*v+vec3(0.,-4.2*t*t,0.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;'+
        'float k=1.-t/2.8;vA=k*k*(.6+.4*sin(uT*31.+aR*40.))*smoothstep(0.,.08,t);vC=mix(uC[b],vec3(1.,.95,.8),step(.86,aR))*3.2;gl_PointSize=max(1.5,(7.+6.*aR)*k*uPx/max(1.,-mv.z));}',
      fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=dot(d,d);if(r>.25)discard;gl_FragColor=vec4(vC*vA*(1.-r*3.2),1.);}'});
    const p=new THREE.Points(g,m);p.frustumCulled=false;p.visible=false;p.renderOrder=9;p.userData.K=K;p.userData.k=0;scene.add(p);CRYPTO.feux=p;}
}
function cryptoFeu(x,y,z){const F=CRYPTO.feux;if(!F)return;const U=F.material.uniforms,k=F.userData.k=(F.userData.k+1)%F.userData.K;
  U.uO.value[k].set(x,y,z,U.uT.value);const C=[[.2,1,.5],[1,.8,.25],[1,.95,.85],[1,.55,.12],[.45,1,.85]][(Math.random()*5)|0];U.uC.value[k].set(C[0],C[1],C[2]);
  F.visible=true;}
function cryptoFeuDevant(){ // une gerbe au-dessus de la ville, DEVANT la caméra (300-800 m), dans le ciel
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=Math.max(.05,v.y*.4+.12);v.normalize();const d=300+Math.random()*500,s=CRYPTO.v2.set(-v.z,0,v.x).normalize().multiplyScalar((Math.random()-.5)*d*.9);
  cryptoFeu(camera.position.x+v.x*d+s.x,camera.position.y+v.y*d+60+Math.random()*160,camera.position.z+v.z*d+s.z);}
function cryptoFusee(){ // une fusée part d'un toit DEVANT la caméra (300-1 400 m) et file vers la lune ₿
  const f=CRYPTO.fus.find(function(q){return !q.on;}),T9=CRYPTO.toits;if(!f||T9.length<3)return;
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=0;v.normalize();
  for(let e=0;e<24;e++){const i=((Math.random()*T9.length/3)|0)*3,dx=T9[i]-camera.position.x,dz=T9[i+2]-camera.position.z,d=Math.hypot(dx,dz);
    if(d<300||d>1400||(dx*v.x+dz*v.z)/d<.45)continue;
    f.on=true;f.t=0;f.p.set(T9[i],T9[i+1]+12,T9[i+2]);f.v.set(0,14,0);f.hist.length=0;f.dT=0;f.g.visible=true;f.tr.visible=true;f.g.position.copy(f.p);
    for(let j=0;j<f.NT*2;j++)f.al[j]=0;f.tr.geometry.attributes.aA.needsUpdate=true;return;}}
function cryptoFuseeTick(f,dt){
  f.t+=dt;const k=Math.min(1,f.t/5),dir=CRYPTO.v2.set(0,1,0).lerp(MOON_DIR,k*.85).normalize();
  f.v.addScaledVector(dir,(16+f.t*7)*dt);f.p.addScaledVector(f.v,dt);f.g.position.copy(f.p);
  CRYPTO.q.setFromUnitVectors(CRYPTO.ax,CRYPTO.v3.copy(f.v).normalize());f.g.quaternion.copy(CRYPTO.q);
  f.fl.scale.set(9+Math.random()*2,15+Math.random()*7,1);
  f.dT-=dt;if(f.dT<=0){f.dT=.11;f.hist.unshift(f.p.x,f.p.y,f.p.z,f.t);if(f.hist.length>f.NT*4)f.hist.length=f.NT*4;}
  const H=f.hist,n=H.length/4,cam=camera.position,P=f.pos,A=f.al,vw=CRYPTO.v3,sd=CRYPTO.s;
  for(let i=0;i<f.NT;i++){const j=Math.min(n-1,i);if(n<2){A[i*2]=A[i*2+1]=0;continue;}
    const a=j*4,b=Math.min(n-1,j+1)*4,age=f.t-H[a+3],w=3+age*5.5;
    sd.set(H[a]-H[b],H[a+1]-H[b+1],H[a+2]-H[b+2]);vw.set(H[a]-cam.x,H[a+1]-cam.y,H[a+2]-cam.z);sd.cross(vw).normalize().multiplyScalar(w);
    P[i*6]=H[a]+sd.x;P[i*6+1]=H[a+1]+sd.y;P[i*6+2]=H[a+2]+sd.z;P[i*6+3]=H[a]-sd.x;P[i*6+4]=H[a+1]-sd.y;P[i*6+5]=H[a+2]-sd.z;
    const al=i<n-1?Math.max(0,1-age/6.5)*Math.min(1,i/2)*(f.t>12?Math.max(0,1-(f.t-12)/2):1):0;A[i*2]=A[i*2+1]=al;}
  f.tr.geometry.attributes.position.needsUpdate=true;f.tr.geometry.attributes.aA.needsUpdate=true;
  if(f.t>14.5){f.on=false;f.g.visible=false;f.tr.visible=false;}
}
function cryptoAth(){ // LE NOUVEL ATH : le cours grimpe, la pluie redouble, le ciel tire ses feux
  const A=CRYPTO.ath;A.n++;A.prix=Math.round(A.prix*(1.18+Math.random()*.22)/100)*100;
  const pr=A.prix>=1e6?(A.prix/1e6).toFixed(A.prix>=1e7?1:2).replace('.',',')+' M':Math.round(A.prix/1000)+' K';
  try{slam(TR('NOUVEL ATH !'),'BTC $ '+pr,'#3dff9a','#ffd75e',30,1,true);}catch(e){}
  plaSurge(6);for(let i=0;i<5;i++)setTimeout(cryptoFeuDevant,i*260);
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoTick(dt,sim){
  const on=cryptoOn()&&!!CRYPTO.root;
  if(!on){crhTick(0,false);if(CRYPTO.lune&&(CRYPTO.lune.visible||CRYPTO.feux.visible)){CRYPTO.lune.visible=false;CRYPTO.feux.visible=false; /* (2026-10-18, DEBUGGING : les gerbes du NOUVEL ATH partent en setTimeout jusqu'à 1 s après lui — un ATH juste avant le portail rallumait les FEUX dans la map suivante, où la lune est déjà cachée : ils restaient dans la scène toute la map, un appel de dessin de 1 200 points. Mesuré : ATH à 60 m du portail → feux visibles sur toute la MER DE NUAGES suivante) */for(const f of CRYPTO.fus){f.on=false;f.g.visible=f.tr.visible=false;}}return;}
  const d=sim?dt:0,cam=camera.position;CRYPTO.uT.value+=d;const t=CRYPTO.uT.value;CRYPTO.uSun.value.copy(SUN_DIR);CRYPTO.uNuit.value=LVL.nuit||0;
  // la lune ₿
  {const L9=CRYPTO.lune;L9.visible=true;L9.position.copy(cam).addScaledVector(MOON_DIR,5200);L9.scale.setScalar(5200*.16);L9.material.rotation=Math.sin(t*.25)*.12;}
  // les pièces géantes : elles tournent, elles flottent ; la traverser en vol = JACKPOT
  if(CRYPTO.pieces){const im=CRYPTO.pieces,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1,cp=carGroup.position;
    for(let k=0;k<CRYPTO.pInfo.length;k++){const p=CRYPTO.pInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.7+p.ph)*4,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);
      if(p.cd>0)p.cd-=d;else if(sim&&mode==='fall'&&cp.distanceToSquared(pp)<p.r*p.r*.8){p.cd=8;cryptoJackpot(pp);}}
    im.instanceMatrix.needsUpdate=true;}
  if(CRYPTO.diam){const im=CRYPTO.diam,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1;
    for(let k=0;k<CRYPTO.dInfo.length;k++){const p=CRYPTO.dInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.9+p.ph)*3,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);}
    im.instanceMatrix.needsUpdate=true;}
  for(const b of CRYPTO.dirig){b.g.position.y=b.y+Math.sin(t*.4+b.ph)*3;b.g.rotation.z=Math.sin(t*.3+b.ph)*.03;}
  if(CRYPTO.mat.tick)CRYPTO.mat.tick.offset.x=(t*.045)%1;
  crhTick(t,true);
  // les yeux laser balaient le ciel ; le ruban du taureau le plus proche se pose à la hauteur de la route
  let bd=1e18;for(const b of CRYPTO.taureaux){for(let i=0;i<2;i++){const L9=b.lasers[i];L9.rotation.set(-.32-.12*Math.sin(t*.37+b.ph),.22*Math.sin(t*.5+b.ph+i*.4)+(i?-.06:.06),0);}
    const dd=(b.x-cam.x)*(b.x-cam.x)+(b.z-cam.z)*(b.z-cam.z);if(dd<bd){bd=dd;CRYPTO.mat.taureau.userData.uBand.value=b.y+78*b.k;}}
  // fusées, feux, ATH
  for(const f of CRYPTO.fus)if(f.on&&d>0)cryptoFuseeTick(f,d);
  if(CRYPTO.feux){const U=CRYPTO.feux.material.uniforms;U.uT.value+=d;U.uPx.value=(renderer.domElement.height||600)*.5*camera.projectionMatrix.elements[5];}
  if(sim&&started&&!gameOver){
    const DZ9=CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) la cadence des fusées et des feux tirée
    CRYPTO.fusT-=d*(DZ9?DZ9.fus:1);if(CRYPTO.fusT<=0){CRYPTO.fusT=5+Math.random()*5;cryptoFusee();}
    CRYPTO.feuT-=d*(DZ9?DZ9.feu:1);if(CRYPTO.feuT<=0){CRYPTO.feuT=1.6+Math.random()*2.6;cryptoFeuDevant();}
    CRYPTO.ath.t-=d;if(CRYPTO.ath.t<=0&&mode!=='boom'){CRYPTO.ath.t=32+Math.random()*14;cryptoAth();}}
}
function cryptoJackpot(p){ // traverser une pièce ₿ géante en vol
  try{chaineAura('JACKPOT',160);}catch(e){}
  try{popTexte(TR('JACKPOT !'),'#ffd75e',2);}catch(e){}
  plaSurge(3.5);try{cryptoFeu(p.x,p.y+20,p.z);}catch(e){}
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoChauffe(){ // au menu (chauffeDivers) : chaque matière de CRYPTOCITY compilée et dessinée une fois hors écran — 0 programme en course
  const G=cryptoGeos(),M=cryptoMats();cryptoInit();plaInit();
  const L9=[],add=function(o){o.position.copy(camera.position);camera.getWorldDirection(CRYPTO.v1);o.position.addScaledVector(CRYPTO.v1,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatTours(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatToursLoin(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.plan,cryptoMatPub(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatBougie(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.diam,M.diam,1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  add(new THREE.Mesh(G.cube,cryptoMatTaureau()));for(const k of ['corne','oeil','laser','laserC','anneau','ballon','or','fusee','fuseeR'])add(new THREE.Mesh(G.cube,M[k]));
  cryptoTickerTex();add(new THREE.Mesh(G.plan,CRYPTO.mat.ecran));crhChauffe(add);
  for(const o of [CRYPTO.lune,CRYPTO.feux,PLA.mB,PLA.mP])if(o){o.visible=true;L9.push(o);}
  for(const f of CRYPTO.fus){f.g.visible=f.tr.visible=true;L9.push(f.g,f.tr);}
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9){if(o===CRYPTO.lune||o===CRYPTO.feux||o===PLA.mB||o===PLA.mP||CRYPTO.fus.some(function(f){return f.g===o||f.tr===o;}))o.visible=false;else scene.remove(o);}
}
window.dbgCrypto=function(k,v){ // console : l'état de CRYPTOCITY · ('ath') un ATH tout de suite · ('feu') une gerbe · ('fusee') une fusée · ('pluie',s) une averse
  if(k==='ath'){cryptoAth();return CRYPTO.ath;}if(k==='feu'){cryptoFeuDevant();return 'gerbe';}if(k==='fusee'){cryptoFusee();return CRYPTO.fus.map(function(f){return f.on;});}
  if(k==='pluie'){plaSurge(v||6);return PLA.dens;}
  if(k==='sansPluie'){PLA.off=!PLA.off;return PLA.off;}
  if(k==='vue'&&CRYPTO.taureaux.length){const b=CRYPTO.taureaux[v|0]||CRYPTO.taureaux[0];return {x:Math.round(b.x),y:Math.round(b.y),z:Math.round(b.z)};}
  if(k==='cadre'&&CRYPTO.taureaux.length){ // (banc, 2026-10-18) LE TAUREAU EN PHOTO : v={n, vue:'profil'|'face'|'trois'|'dos'|'dessous'|'haut'|'cote'|'route'|'arrive', fov} — la caméra posée dans SON repère
    v=v||{};const b=CRYPTO.taureaux[v.n|0]||CRYPTO.taureaux[0],K=b.k,W=function(l){return [b.x+K*(l[0]*b.co+l[2]*b.si),b.y+K*l[1],b.z+K*(-l[0]*b.si+l[2]*b.co)];};
    const VUES={profil:[[760,170,40],[0,110,40]],face:[[90,150,900],[0,120,80]],trois:[[560,260,620],[0,120,40]],dos:[[-420,330,-620],[0,150,20]],dessous:[[300,-260,420],[0,60,40]],haut:[[640,560,720],[0,110,60]],cote:[[980,240,260],[0,110,60]],pres:[[210,250,150],[0,120,40]],pres2:[[-205,215,-135],[0,140,30]],tete:[[150,60,250],[0,100,190]]}; // pres, pres2, tete : DANS l'esplanade (aucune tour entre l'objectif et lui)
    if(VUES[v.vue])return dbgCrypto('photo',{p:W(VUES[v.vue][0]),c:W(VUES[v.vue][1]),fov:v.fov||(/^(pres|tete)/.test(v.vue)?74:50)});
    let iB=0,dB=1e18;for(let i=0;i<NP;i++){const dx=pts[i].x-b.x,dz=pts[i].z-b.z,d=dx*dx+dz*dz;if(d<dB){dB=d;iB=i;}} // le point de la route le plus proche
    const i9=v.vue==='arrive'?Math.max(0,iB-Math.round(260/(L/(NP-1)))):iB,p=pts[i9];
    return dbgCrypto('photo',{p:[p.x,p.y+(v.vue==='arrive'?6:4),p.z],c:W([0,140,60]),fov:v.fov||62});}
  if(k==='dur'){ // (banc, 2026-10-18) LA HITBOX DU TAUREAU : (1) la marge la plus courte entre la ROUTE (au bitume, à 2 et 5 m) et le taureau ;
    // (2) le repère de la collision = celui du maillage dessiné : 4 000 points au hasard autour de lui, cryptoHeurt contre taureauDur lu par worldToLocal
    const R=[],q=new THREE.Vector3(),rr=mulberry32(77);
    for(const b of CRYPTO.taureaux){let marge=1e9;
      for(let i=0;i<NP;i++){const p=pts[i],dx=p.x-b.x,dz=p.z-b.z;if(dx*dx+dz*dz>560*560)continue;const lx=(dx*b.co-dz*b.si)/b.k,lz=(dx*b.si+dz*b.co)/b.k;
        for(const hy of [0,2,5]){const ly=(p.y+hy-b.y)/b.k;let m=0;while(m<60&&!taureauDur(b.F,lx,ly,lz,m))m+=1;marge=Math.min(marge,m*b.k);}}
      const me=b.g.children[0];me.updateMatrixWorld(true);let ko=0,dans=0;
      for(let j=0;j<4000;j++){q.set(b.x+(rr()-.5)*900,b.y+(rr()-.62)*900,b.z+(rr()-.5)*900);const h=cryptoHeurt(q);me.worldToLocal(q);const d=taureauDur(b.F,q.x,q.y,q.z,.7/b.k);if(h!==d)ko++;if(d)dans++;}
      R.push({route:marge>=60*b.k?'plus de '+Math.round(60*b.k)+' m':Math.round(marge)+' m',pied:Math.round(b.pl*b.k),repere:{essais:4000,dedans:dans,ecarts:ko}});}
    return R;}
  if(k==='tir'){ // (banc) la caisse lancée EN VOL vers le point v.cible du taureau v.n (repère local), le long de v.dir (local), à v.vit m/s, v.d m AVANT la
    // première surface VUE sur cette ligne (v.passe : v.d m avant la cible, il n'y a rien à voir) — la boucle fait le reste
    if(!started||gameOver||mode==='boom')return 'pas de course';
    const b=CRYPTO.taureaux[v.n|0],me=b.g.children[0],c=me.localToWorld(new THREE.Vector3().fromArray(v.cible)),dr=new THREE.Vector3().fromArray(v.dir).normalize().applyQuaternion(b.g.quaternion);
    const hit=new THREE.Raycaster(c.clone().addScaledVector(dr,-900),dr,0,1800).intersectObjects([b.g.children[0],b.g.children[1]],false)[0]; // ce qu'on VOIT en premier sur la ligne
    const o9=(hit&&!v.passe?hit.point:c).clone().addScaledVector(dr,-(v.d||15));
    if(paused)togglePause();if(v.bouclier)CHANCE.inv=Math.max(CHANCE.inv,3); // v.bouclier : le bouclier de la seconde chance — le choc est détecté (impPrep) puis pardonné, la partie continue
    startFall(10,1);fallPos.copy(o9);fallVel.copy(dr).multiplyScalar((v.vit||120)/SPD);carGroup.position.copy(fallPos);graceT=0;
    return {depart:o9.toArray().map(Math.round),vu:hit?{d:+hit.distance.toFixed(1),p:hit.point.toArray().map(function(x){return +x.toFixed(1);})}:null};}
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();if(acesPass)acesPass.uniforms.uSpeed.value=0;camera.position.fromArray(v.p);camera.lookAt(v.c[0],v.c[1],v.c[2]);if(v.fov){camera.fov=v.fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld(); // (banc) MODE PHOTO libre : la caméra en p, qui regarde c
    try{plaTick(0,false);cryptoTick(0,false);}catch(e){}if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'photo';}
  if(k==='cam'){const d=camera.getWorldDirection(new THREE.Vector3());return {p:camera.position.toArray().map(Math.round),d:d.toArray().map(function(x){return +x.toFixed(3);}),car:carGroup.position.toArray().map(Math.round)};}
  if(k==='masque'){const T9={pla:[PLA.mB,PLA.mP],lune:[CRYPTO.lune],feux:[CRYPTO.feux],bougies:[CRYPTO.bougies],pieces:[CRYPTO.pieces],diam:[CRYPTO.diam],ville:[CITY.root]};
    for(const o of (T9[v]||[]))if(o)o.visible=!o.visible;if(v==='taureaux')for(const b of CRYPTO.taureaux)b.g.visible=!b.g.visible;if(v==='fam')for(const F of CITY.fam||[]){F.im.visible=!F.im.visible;F.imL.visible=!F.imL.visible;}
    if(POST_ON&&composer)composer.render();return v;}
  if(k==='progs')return renderer.info.programs.filter(function(p){return p.diagnostics&&!p.diagnostics.runnable;}).map(function(p){return [p.cacheKey.slice(0,60),JSON.stringify(p.diagnostics).slice(0,400)];});
  if(k==='pla')return {mB:!!PLA.mB,vis:PLA.mB&&PLA.mB.visible,dens:PLA.dens,u:PLA.u&&{d:PLA.u.uDens9.value,t:PLA.u.uT9.value,c:PLA.u.uC9.value.toArray().map(Math.round)},prog:renderer.info.programs.filter(function(p){return /plaBillet1|plaPiece1/.test(p.cacheKey||'');}).map(function(p){return [p.cacheKey.slice(0,40),p.diagnostics?JSON.stringify(p.diagnostics).slice(0,600):'ok'];}),
    pix:PLA.texB?Array.from(PLA.texB.image.getContext('2d').getImageData(256,128,1,1).data):null,pixP:PLA.texP?Array.from(PLA.texP.image.getContext('2d').getImageData(128,122,1,1).data):null,inst:PLA.mB.geometry.instanceCount,max:PLA.mB.geometry._maxInstanceCount};
  if(k==='sites'){const S=CRYPTO.sites;return S?{bougies:S.bougies.slice(0,40).map(function(b){return [Math.round(b.x),Math.round(b.y0),Math.round(b.z),Math.round(b.y1-b.y0)];}),pieces:S.pieces.map(function(p){return [Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.r)];}),dirig:S.dirig.map(function(d){return [Math.round(d.x),Math.round(d.y),Math.round(d.z)];})}:null;}
  if(k==='taureaux')return CRYPTO.taureaux.map(function(b){return {x:Math.round(b.x),y:Math.round(b.y),z:Math.round(b.z),cap:+Math.atan2(b.si,b.co).toFixed(2),s:Math.round(b.s),pied:Math.round(b.pl*b.k)};});
  const S=CRYPTO.sites;return {on:cryptoOn(),ville:!!CITY.root,deco:CITY.dz&&CITY.dz.genre==='crypto'?CITY.deco:null,taureaux:CRYPTO.taureaux.length,bougies:S?S.bougies.length:0,pieces:CRYPTO.pInfo.length,diamants:CRYPTO.dInfo.length,
    dirigeables:CRYPTO.dirig.length,toits:CRYPTO.toits.length/3,reserve:CRYPTO.res.length/3,fusees:CRYPTO.fus.filter(function(f){return f.on;}).length,
    ath:{dans:+CRYPTO.ath.t.toFixed(1),n:CRYPTO.ath.n,prix:CRYPTO.ath.prix},pluie:{dens:+PLA.dens.toFixed(2),surge:+PLA.surge.toFixed(1),n:PLA.N,np:PLA.NP},ville9:CITY.n};};
/* ===== CRYPTO CITY : L'HORIZON DU BULL RUN ET LES PROJECTEURS DE LA NUIT (2026-10-21, Sacha : « amélioration visuelle des maps », passe CRYPTO CITY) =====
   Ce que la route voyait au loin : un ciel, une mer de nuages, et RIEN — la ville s'arrête à 2 km. Deux objets, un seul programme de shader, deux
   appels de dessin, ~2 500 triangles, aucune texture, aucune lumière :
   · L'HORIZON (pilier 1 : la profondeur en trois plans) — une couronne de tours LOINTAINES et trois GRAPHIQUES en bougies japonaises (le cours qui
     monte vers la lune : l'horizon EST le graphique du bull run), centrés sur la caméra comme un ciel et recalés à chaque image sur la brume
     (échelle de la couronne = une part fixe de la portée de la brume : à l'écran elle ne bouge pas, seule la brume dit la distance). La couleur
     se calcule dans le shader à partir du ciel du moment (`skyU.uJ*`) : une seule géométrie sert le matin, le midi, le soir, la nuit. Le jour, des
     silhouettes bleu froid dans la brume d'or, la tête éclairée ; la nuit, des tours sombres aux bureaux allumés (or, cyan, rose) et des bougies
     qui brillent. Les bougies sont l'éclat CASH discret du plan lointain (vert profit / rouge, jamais dans le couloir de jeu).
   · LES PROJECTEURS (pilier 2 : la lumière-vedette de la NUIT) — neuf rais étroits, rose / cyan / or, qui montent de la ville vers le ciel et
     tournent très lentement autour de la caméra (un seul changement de rotation par image). Ce sont trois rubans croisés (6 triangles), fondus
     sur leur largeur et sur leur longueur dans le shader, additifs, derrière tout le reste ; visibles la nuit seulement (`uNuit`).
   Tout se tire dans un générateur LOCAL (`mulberry32(seed ^ …)`, la graine de la piste est `CRYPTO.sd`) : la piste ne bouge pas d'un bit.
   Paliers (`PAL.B`) : tours [36, 72, 110] · bougies par graphique [10, 16, 24] · projecteurs [0, 5, 9] (aucun au palier ancien).
   Crochets : `dbgCrypto('horizon')` (état), `dbgCrypto('masque','horizon'|'faisceaux')`, `dbgCrypto('route',{f,h,av,fov,cap,pitch,sec})` (la caméra posée sur la route :
   `f` la part de la piste, `h` la hauteur, `av` m en arrière, `cap` rad de rotation vers la droite, `sec` : rend les coordonnées sans dessiner) et `dbgCrypto('cout')` (appels/triangles d'UNE image). */
PAL.B.cryptoHor=[36,72,110];
PAL.B.cryptoBoug=[10,16,24];
PAL.B.cryptoFais=[0,5,9];
const CRH={mat:null,matF:null,tours:null,fais:null,D:2400,n:0};
function crhMat(add){ /* un shader, deux mélanges : l'opaque (couronne) et l'additif (projecteurs) partagent le même programme */
  const k=add?'matF':'mat';if(CRH[k])return CRH[k];
  const U=THREE.UniformsUtils.clone(THREE.UniformsLib.fog);
  U.uZen=skyU.uJZen;U.uMid=skyU.uJMid;U.uHor=skyU.uJHor;U.uNuit=CRYPTO.uNuit;U.uT=CRYPTO.uT;U.uSun=CRYPTO.uSun;
  const m=new THREE.ShaderMaterial({uniforms:U,fog:true,side:THREE.DoubleSide,transparent:!!add,depthWrite:!add,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,
    vertexShader:'attribute vec4 aK;varying vec4 vK;varying vec3 vP;varying float fogDepth;void main(){vK=aK;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);fogDepth=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uZen,uMid,uHor,uSun,fogColor;uniform float uNuit,uT,fogNear,fogFar;varying vec4 vK;varying vec3 vP;varying float fogDepth;\n'+
      'void main(){float h=vK.x,kd=vK.y,r=vK.z,ac=vK.w,ff=smoothstep(fogNear,fogFar,fogDepth);vec3 c;\n'+
      ' if(kd>2.5){ /* un PROJECTEUR : fondu sur la largeur (ac) et la longueur (h), plus fort à la base, la nuit seulement */\n'+
      '  vec3 hue=r<.34?vec3(1.,.30,.68):r<.67?vec3(.28,.88,1.):vec3(1.,.78,.32);float e=1.-abs(ac);e*=e*e;\n'+
      '  c=hue*e*(1.-h)*(1.-.4*h)*1.1*uNuit*(.8+.2*sin(uT*1.9+r*40.))*(1.-ff*.75);gl_FragColor=vec4(c,1.);return;}\n'+
      ' float roof=step(5.,ac);vec2 nn=roof>.5?vec2(0.,1.):vec2(cos(ac),sin(ac));float fc=roof>.5?.62:.5+.5*dot(nn,normalize(uSun.xz+vec2(1e-4))); /* la FACE : ac = son azimut (9 = le toit), fc = sa part de soleil */\n'+
      ' if(kd>.5){ /* une BOUGIE : verte (la hausse) ou rouge, plus claire vers le haut, un flanc plus clair que l\'autre ; un peu plus vive la nuit */\n'+
      '  c=(kd<1.5?vec3(.10,.80,.36):vec3(.95,.15,.22))*(.74+.3*h)*(.84+.3*fc)*(1.+.25*uNuit);}\n'+
      ' else { /* une TOUR : le pied fond dans la brume ; le jour une silhouette bleu froid, un flanc chaud (le soleil) et un flanc froid, la tête éclairée ; la nuit une masse sombre aux bureaux allumés */\n'+
      '  vec3 day=mix(fogColor,uMid*vec3(.50,.55,.70),smoothstep(0.,.5,h))+uHor*.55*smoothstep(.78,1.,h);\n'+
      '  day*=roof>.5?vec3(1.1,1.06,1.):mix(vec3(.70,.80,1.),vec3(1.22,1.1,.88),fc);\n'+
      '  vec2 tg=vec2(-nn.y,nn.x),cl=vec2(dot(vP.xz,tg)/24.,vP.y/34.),id=floor(cl),f9=fract(cl);float hs=fract(sin(dot(id+r*37.,vec2(12.9898,78.233)))*43758.5453);\n'+
      '  float win=step(.58,hs)*step(.2,f9.x)*step(f9.x,.8)*step(.25,f9.y)*step(f9.y,.75)*(1.-roof)*smoothstep(.04,.3,h)*(1.-.7*smoothstep(.9,1.,h));\n'+
      '  float pk=fract(hs*7.13+r*5.7);vec3 wn=r>.88?vec3(1.,.36,.66):r<.1?vec3(.38,.92,1.):pk<.1?vec3(1.,.36,.66):pk<.22?vec3(.38,.92,1.):vec3(1.,.76,.40);\n'+
      '  vec3 nuit=mix(fogColor,vec3(.03,.04,.11),smoothstep(0.,.4,h))*(.7+.6*fc)+wn*win*(.6+.9*fract(hs*9.3))*1.5;\n'+
      '  c=mix(day,nuit,uNuit);}\n'+
      ' c=mix(c,fogColor,ff);gl_FragColor=vec4(c,1.);}'});
  m.dispose=function(){};
  CRH[k]=m;return m;
}
/* une boîte (4 flancs + le toit) : x,z le centre, y0..y1 la hauteur, w × d la base, rot l'angle ; K = (hauteur 0..1, sorte, hasard, travers) */
function crhBoite(P,K,x,z,y0,y1,w,d,rot,sorte,r){
  const co=Math.cos(rot),si=Math.sin(rot),hx=w/2,hz=d/2,C=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(function(q){return [x+q[0]*co-q[1]*si,z+q[0]*si+q[1]*co];});
  let az=9; /* K.w : l'azimut du flanc (la normale sortante) ; 9 = le toit */
  const v=function(c,y,h){P.push(c[0],y,c[1]);K.push(h,sorte,r,az);};
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];let nx=b[1]-a[1],nz=a[0]-b[0];if(nx*((a[0]+b[0])/2-x)+nz*((a[1]+b[1])/2-z)<0){nx=-nx;nz=-nz;}az=Math.atan2(nz,nx);
    v(a,y0,0);v(b,y0,0);v(b,y1,1);v(a,y0,0);v(b,y1,1);v(a,y1,1);}
  az=9;v(C[0],y1,1);v(C[1],y1,1);v(C[2],y1,1);v(C[0],y1,1);v(C[2],y1,1);v(C[3],y1,1);
}
function crhGeo(P,K){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,4));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);return g;}
function crhVide(){
  for(const k of ['tours','fais']){const o=CRH[k];if(!o)continue;if(o.parent)o.parent.remove(o);try{o.geometry.dispose();}catch(e){}CRH[k]=null;}
}
function crhBatit(){
  crhVide();
  const sd=(CRYPTO.sd||0)^0x4B0C0DE5,rr=mulberry32(sd),NT=PAL.b('cryptoHor',110),NB=PAL.b('cryptoBoug',24),NF=PAL.b('cryptoFais',9),D=CRH.D,PI2=6.2832;
  {const P=[],K=[];
    /* la couronne de tours : des azimuts tirés par tranches (aucun trou), une distance de 100 à 500 m de plus que D, des hauteurs en carré (beaucoup de basses, quelques géantes) */
    for(let i=0;i<NT;i++){const a=(i+rr())/NT*PI2,d=D+(rr()-.35)*520,w=60+rr()*110,hgt=90+Math.pow(rr(),2.2)*420,y0=-260,rot=a+(rr()-.5)*.8,r=rr();
      crhBoite(P,K,Math.sin(a)*d,Math.cos(a)*d,y0,y0+hgt+120,w,w*(.7+rr()*.5),rot,0,r);
      if(rr()<.28){const w2=w*.55,h2=hgt*(.4+rr()*.4);crhBoite(P,K,Math.sin(a+.012)*d,Math.cos(a+.012)*d,y0+hgt+60,y0+hgt+120+h2*.35,w2,w2,rot,0,r);} /* un étage en retrait sur quelques-unes */
    }
    /* LES TROIS GRAPHIQUES : des bougies japonaises, un cours qui monte en dents de scie (un quart de rouges) — plus près que les tours, donc plus nettes dans la brume */
    for(let g=0;g<3;g++){const a0=(g+rr()*.6)/3*PI2,dA=.027,dg=D*.8+rr()*120,pente=8+rr()*5;let p9=-110+rr()*40;
      for(let i=0;i<NB;i++){const a=a0+i*dA,o=p9;let c=o+pente+(rr()-.5)*2*46;if(Math.abs(c-o)<14)c=o+(c<o?-14:14);
        const lo=Math.min(o,c),hi=Math.max(o,c),sorte=c<o?2:1,mf=10+rr()*38,mb=8+rr()*30,x=Math.sin(a)*dg,z=Math.cos(a)*dg,w=D*dA*.62;
        crhBoite(P,K,x,z,lo,hi,w,w*.8,a,sorte,rr());
        crhBoite(P,K,x,z,lo-mb,hi+mf,w*.12,w*.12,a,sorte,rr()); /* la mèche */
        p9=c;}}
    const m=new THREE.Mesh(crhGeo(P,K),crhMat(false));m.frustumCulled=false;m.renderOrder=-2;m.matrixAutoUpdate=true;m.visible=false;scene.add(m);CRH.tours=m;CRH.n=P.length/9;}
  if(NF>0){const P=[],K=[];
    /* les projecteurs : une base sur l'horizon, une direction qui penche vers l'extérieur ; trois rubans croisés à 60° (fondus sur leur largeur) */
    for(let i=0;i<NF;i++){const a=(i+.2+rr()*.6)/NF*PI2,d=1800+rr()*600,bx=Math.sin(a)*d,bz=Math.cos(a)*d,by=-140+rr()*60,lean=.18+rr()*.3,ph=rr()*PI2,
        dx=Math.sin(a+ph*.1)*lean,dz=Math.cos(a+ph*.1)*lean,dl=Math.hypot(dx,1,dz),dir=[dx/dl,1/dl,dz/dl],len=1700+rr()*500,wB=12+rr()*8,wT=wB*3,hue=(i%3)/3+.1;
      let ux=-dir[2],uy=0,uz=dir[0];const lu=Math.hypot(ux,uz)||1;ux/=lu;uz/=lu;const vx=dir[1]*uz-dir[2]*uy,vy=dir[2]*ux-dir[0]*uz,vz=dir[0]*uy-dir[1]*ux; /* (u, v) : le plan perpendiculaire à la direction */
      for(let q=0;q<3;q++){const f=q*Math.PI/3,sx=ux*Math.cos(f)+vx*Math.sin(f),sy=uy*Math.cos(f)+vy*Math.sin(f),sz=uz*Math.cos(f)+vz*Math.sin(f),
          tx=bx+dir[0]*len,ty=by+dir[1]*len,tz=bz+dir[2]*len,A=[bx-sx*wB,by-sy*wB,bz-sz*wB],B=[bx+sx*wB,by+sy*wB,bz+sz*wB],C=[tx+sx*wT,ty+sy*wT,tz+sz*wT],E=[tx-sx*wT,ty-sy*wT,tz-sz*wT];
        P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2],A[0],A[1],A[2],C[0],C[1],C[2],E[0],E[1],E[2]);
        K.push(0,3,hue,-1, 0,3,hue,1, 1,3,hue,1, 0,3,hue,-1, 1,3,hue,1, 1,3,hue,-1);}}
    const m=new THREE.Mesh(crhGeo(P,K),crhMat(true));m.frustumCulled=false;m.renderOrder=-1;m.visible=false;scene.add(m);CRH.fais=m;}
}
function crhTick(t,on){
  const T9=CRH.tours,F9=CRH.fais;if(!T9&&!F9)return;
  if(!on||!CRYPTO.root){if(T9)T9.visible=false;if(F9)F9.visible=false;return;}
  const fg=scene.fog,cp=camera.position;
  /* la couronne se recale sur la brume : sa distance = 58 % de la portée utile (entre 2 200 et 3 400 m) — la même image à l'écran, une brume qui change */
  const dist=fg?Math.min(3400,Math.max(2200,fg.near+.58*(fg.far-fg.near))):2800,sc=dist/CRH.D;
  if(T9){T9.visible=true;T9.position.set(cp.x,cp.y,cp.z);T9.scale.setScalar(sc);}
  if(F9){const nuit=CRYPTO.uNuit.value;F9.visible=nuit>.03;if(F9.visible){F9.position.set(cp.x,cp.y,cp.z);F9.scale.setScalar(sc);F9.rotation.y=t*.03;}}
}
function crhChauffe(add){ /* au menu : le programme (opaque et additif) compilé et dessiné une fois hors écran — 0 compilation en course */
  const g=crhGeo([0,0,0,1,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0]);for(const a of [false,true]){const o=new THREE.Mesh(g,crhMat(a));o.frustumCulled=false;add(o);}
}
(function(){ /* les crochets de banc, posés par-dessus ceux de cryptocity-taureau */
  const d0=window.dbgCrypto;
  window.dbgCrypto=function(k,v){
    if(k==='horizon')return {tours:!!CRH.tours,faisceaux:!!CRH.fais,tris:CRH.n,echelle:CRH.tours?+CRH.tours.scale.x.toFixed(3):null,brume:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far)]:null,nuit:CRYPTO.uNuit.value};
    if(k==='masque'&&(v==='horizon'||v==='faisceaux')){const o=v==='horizon'?CRH.tours:CRH.fais;if(o)o.userData.cache=!o.userData.cache;if(o)o.layers.mask=o.userData.cache?0:1;if(POST_ON&&composer)composer.render();return v;}
    if(k==='route'){ /* la caméra sur la route, à la part f de la piste, à h m au-dessus, av m en arrière, tournée de cap rad vers la droite */
      v=v||{};const i=Math.max(2,Math.min(NP-3,Math.floor((v.f==null?.3:v.f)*NP))),p=pts[i],q=pts[Math.min(NP-1,i+3)],tx=q.x-p.x,tz=q.z-p.z,tl=Math.hypot(tx,tz)||1,ux=tx/tl,uz=tz/tl,cap=v.cap||0,c=Math.cos(cap),s=Math.sin(cap),fx=ux*c-uz*s,fz=ux*s+uz*c,av=v.av==null?10:v.av;
      const V9={p:[p.x-ux*av,p.y+(v.h==null?5:v.h),p.z-uz*av],c:[p.x-ux*av+fx*100,p.y+(v.h==null?5:v.h)+100*Math.tan(v.pitch||0),p.z-uz*av+fz*100],fov:v.fov||70};
      return v.sec?V9:d0('photo',V9);} /* v.sec : rend les coordonnées sans dessiner (le banc les rejoue sur l'ancienne version) */
    if(k==='cout'){const r=renderer.info;r.autoReset=false;r.reset();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);const o={appels:r.render.calls,triangles:r.render.triangles,programmes:r.programs?r.programs.length:null,textures:r.memory.textures,geometries:r.memory.geometries};r.autoReset=true;return o;}
    return d0(k,v);};
})();
/* ================================ LA VILLE VITRÉE — LES TOURS DE VERRE ================================
   (2026-10-17, Léo : « une nouvelle map VILLE VITRÉE : une ville de tours en VERRE — murs-rideaux à grands carreaux bleus, montants fins,
   reflets du ciel et des nuages dans les vitres, éclat du soleil, coins de tours biseautés, quelques bandes de béton / lames verticales —
   comme mes deux photos (tours de bureaux vues d'en bas, ciel bleu, soleil qui éblouit) ; quatre heures : MATIN (soleil bas, reflets
   dorés), MIDI (ciel bleu et nuages qui se reflètent), COUCHER (les tours qui s'embrasent orange et rose), NUIT (les bureaux allumés) »).
   LE NIVEAU (`NIV_VITRE` : id 'ville' + vitre:1, comme CRYPTO CITY) : la piste et l'emplacement des tours sont ceux de la VILLE (genCtrl,
   buildVoxCity, la règle d'or, les tours DURES) — à graine égale c'est la même ville, aucun tirage `vr` ajouté ni retiré. Ce qui change :
   · LA FAÇADE (`VIT_VERRE`, dans `vitreMatTours`) : le MUR-RIDEAU — un carreau par travée et par étage, des MONTANTS fins d'aluminium
     (la teinte d'instance, éclairée par la scène), chaque carreau un MIROIR légèrement désaxé (± 1-2° : les reflets se cassent d'une vitre
     à l'autre, comme sur un vrai mur de verre), Fresnel de verre traité, le CIEL et ses NUAGES renvoyés, l'ÉCLAT du soleil qui saute de
     carreau en carreau (il passe dans le halo : ça éblouit). Cinq familles tirées de la graine de la tour (la même pour ses retraits) :
     VERRE BLEU (34 %), BANDEAUX de béton clair (18 %), LAMES verticales blanches et leur ombre (16 %), VERRE SOMBRE à grands carreaux
     (16 %), VERRE ARGENT presque miroir (16 %). Les étages se comptent depuis le PIED de la tour : ses retraits gardent les mêmes étages.
     La NUIT : les bureaux allumés derrière le verre, par plateaux (des étages entiers dorment), les plafonniers en haut de chaque baie.
   · LES COINS BISEAUTÉS (`vitreGeo`) : un prisme à huit pans dont les quatre pans de coin s'écrasent à zéro (un cube, au triangle près) ou
     s'ouvrent jusqu'à 7 m — décidé au SOMMET par la graine de la tour (60 % des tours). 28 triangles au lieu de 12 (la seule hausse : MESURÉE).
     Les tours AU LOIN (couleur de brume) gardent le cube.
   · LES NUAGES (`vitreCiel` + `vitreNuages`) : une couche de cumulus peinte une fois (256², bruit périodique), posée sur un PLAFOND à 1 400 m
     au-dessus de la caméra — et ce sont LES MÊMES nuages que les vitres renvoient (même plafond, même texture) : on voit dans les tours le
     ciel qu'on a au-dessus de la tête. Une couche, deux lectures de texture par pixel.
   · Les ENSEIGNES et les RÉCLAMES de la ville de nuit se taisent (un quartier d'affaires) ; les TUYAUX deviennent des LAMES de béton qui
     descendent le long des façades ; les couronnes sont des bandeaux de lumière blanche ; les feux d'antenne restent rouges.
   · LE CIEL (biomes `vitreMatin/vitreMidi/vitreSoir/vitreNuit`) et la route : le jour d'altitude, la route glacée de CRYPTO CITY (`cryptoA`).
   Que des matières neuves compilées AU MENU (`vitreChauffe`) : 0 programme en course.
   Console : `dbgVitre()` (état), `dbgVitre('nuages',{…})` (les nuages à chaud), `dbgNiveauVitre(meteo)`. */
/* (2026-10-17 soir, Léo : « j'abandonne l'idée de la ville au plafond ; rends-la plus distincte — c'est CLEAN CITY : miroir, moderne, le futur,
   la technologie ») LE PLAFOND (la ville à l'envers, v2) n'est plus le défaut : `?plafond=1` le rend, tel quel. */
const VIT_PLAFOND=/[?&]plafond=1\b/.test(location.search);
/* ================================ LA VILLE, NÉON ET VERRE ================================
   (2026-10-18, Sacha : « mets-toi dans la peau d'une designer de jeux vidéo senior et fusionne les maps ville et ville vitrée ; on garde l'ambiance néon
   et tout, mais avec certains bâtiments qui viennent de la ville vitrée »). LA VILLE reste LA VILLE : la nuit, ses quatre temps, ses quatre teintes, ses
   enseignes, ses réclames, sa pluie, sa descente en spirale — mêmes tirages `vr`, au volume près. Ce qui vient de la VILLE VITRÉE : ses GÉANTES DE VERRE.
   · QUI : les tours qui MONTENT au-dessus de la route qu'elles bordent (le skyline, ce qu'on voit défiler et ce qu'on survole) — une sur deux parmi les
     plus hautes, une sur trois parmi les autres, quelques-unes au large ; tiré de la POSITION de la tour (`villeVerreTour`, aucun tirage `vr` de plus).
     Le béton, les enseignes et les réclames restent aux autres : LE NÉON AU PIED, LE VERRE DANS LE CIEL.
   · CE QU'ELLES GARDENT : leurs FORMES (droite à retraits empilés, effilée, vrillée, fuseau, ronde, lame — vitreForme), les coins biseautés (vitreGeo),
     le mur-rideau et ses carreaux désaxés, les bureaux allumés derrière le verre, les filets de LED des arêtes, les logos minimalistes ; pas d'enseigne
     ni de réclame plaquée sur elles (une façade de verre qui vrille ne porte pas une plaque droite).
   · CE QUI CHANGE : elles sont EN NÉON — le verre renvoie le ciel de la ville, sa brume teintée et la lueur de ses néons (VV, posé par villeVerreTick
     d'après la brume et la teinte), les filets, les logos et le parapet prennent la couleur de la TEINTE (violet, vert, jaune, bleu), plus de verre que
     de tours blanches (VV_STY), les bureaux plus vifs (VV_VERRE) ; leur pied se noie dans la brume comme celui des tours de béton (villePied).
   · LA VILLE VITRÉE quitte le JOUER : elle vit désormais dans LA VILLE (SF_HORS) — `?vitree=1` la remet au tirage ; `?carte=vitree`, dbgNiveauVitre
     la jouent toujours, telle quelle (le travail de Léo n'est pas touché).
   VILLE_VERRE_V=false = la ville néon d'avant (et la vitrée revient au tirage) — pas d'interrupteur d'adresse (allègement du 18/10). Console : `dbgVilleVerre()`. */
const VILLE_VERRE_V=true;
const VV_STY='sty=s3<.34?0.:s3<.44?1.:s3<.56?2.:s3<.78?3.:4.'; // (NÉON ET VERRE) 34 % VERRE BLEU · 10 % BLANCHE à bandeaux · 12 % LAMES · 22 % SOMBRE · 22 % ARGENT — les mêmes seuils pour la structure (buildVoxCity)
const VV={on:false,n:0,nv:0,acc:new THREE.Color(1,.25,.78),
  uZen:{value:new THREE.Vector3(.04,.02,.06)},uMid:{value:new THREE.Vector3(.12,.05,.16)},uHor:{value:new THREE.Vector3(.35,.14,.4)},uAcc:{value:new THREE.Vector3(1,.25,.78)},
  uNuit:{value:1},uSunK:{value:0},uClK:{value:new THREE.Vector4(.30,.78,.85,0)},uClL:{value:new THREE.Vector3(.4,.2,.45)},uClA:{value:new THREE.Vector3(.05,.03,.07)},
  uClD:{value:new THREE.Vector2()},uPlf:{value:new THREE.Vector3(.1,.05,.12)}};
/* QUI devient une géante de verre : haut = de combien son toit dépasse la route qu'elle borde (m) — le skyline, pas les toits qu'on survole */
function villeVerreTour(cx,cz,haut,canyon){if(haut<(canyon?60:30))return false;const h=metroH(cx*.71-5.3,cz*1.37+2.9);return h<(canyon?(haut>190?.52:.34):.3);}
function villeVerreTourD(cx,cz,haut,canyon,V){if(haut<(canyon?60:30))return false;const h=metroH(cx*.71-5.3+V.ox,cz*1.37+2.9+V.oz);return h<Math.min(.9,(canyon?(haut>190?.52:.34):.3)*V.k);} // (2026-10-20, LE DÉCOR AU HASARD) la part de géantes tirée (V.k) et LESQUELLES (la graine de position décalée)
/* LE CIEL QUE LE VERRE RENVOIE, en ville : la brume de la ville (sa teinte, son temps) — sombre au zénith, la lueur des rues et des néons à l'horizon ;
   les nuages, éclairés par en dessous. Posé à chaque image (VV : ses propres uniformes, la ville vitrée garde les siens). (banc, 2e passe, même graine :
   à la première les géantes sortaient PLUS SOMBRES que les tours au néon — elles éteignaient le skyline ; d'où ces dosages.) */
const VV_MET={pluie:[.20,.62,.95],nuit:[.52,.84,.55],brouillard:[.10,.50,1.],orage:[.16,.58,1.]}; // la couverture des nuages [seuil bas, seuil haut, force]
function villeVerreTick(dt){
  if(!(VV.on&&CITY.root&&LVL.cur&&LVL.cur.id==='ville'&&!LVL.cur.vitre&&!LVL.cur.crypto))return;
  const f=scene.fog&&scene.fog.color,a=VV.acc;if(!f)return;
  VV.uZen.value.set(f.r*.55+a.r*.04,f.g*.55+a.g*.04,f.b*.55+a.b*.04);
  VV.uMid.value.set(f.r*1.0+a.r*.14,f.g*1.0+a.g*.14,f.b*1.0+a.b*.14);
  VV.uHor.value.set(f.r*1.35+a.r*.32,f.g*1.35+a.g*.32,f.b*1.35+a.b*.32); // la lueur de la ville et de ses néons à l'horizon du reflet
  VV.uAcc.value.set(a.r,a.g,a.b);
  const M=VV_MET[LVL.cur.meteo]||VV_MET.pluie,K=VV.uClK.value,k=Math.min(1,dt*1.5);K.x+=(M[0]-K.x)*k;K.y+=(M[1]-K.y)*k;K.z+=(M[2]-K.z)*k;
  VV.uClL.value.set(f.r*1.5+a.r*.3,f.g*1.5+a.g*.3,f.b*1.5+a.b*.3); // le dessous des nuages : la ville l'allume
  VV.uClA.value.set(f.r*.6,f.g*.6,f.b*.6);
  VV.uClD.value.x+=dt*.0016;VV.uClD.value.y+=dt*.0007;}
window.dbgVilleVerre=function(){return {on:VILLE_VERRE_V,ici:VV.on,tours:VV.n,verre:VV.nv,part:VV.n?+(VV.nv/VV.n).toFixed(3):0,acc:VV.acc.toArray().map(function(x){return +x.toFixed(3);}),
  vitreeAuTirage:!SF_HORS.vitree,familles:(CITY.fam||[]).map(function(F){return F.n;}),
  retouches:[VV_VERRE.indexOf(VV_STY)>=0,VV_VERRE.indexOf('colF+=uAcc9*')>=0,VV_VERRE.indexOf('mix(uAcc9,vec3(1.),.35)*1.9')>=0,VIT_VERRE.indexOf('uAcc9')<0]};}; // (banc) les retouches du verre de la ville sont posées, celui de la vitrée n'a pas bougé
/* (2026-10-18, Léo : « la vitrée je la trouve pas assez différente ; celle-là on reste au sol, effet Shanghai vu d'en bas, mais sur des trucs
   immenses » — et « parfois je vois des formes de ville dans le ciel, à l'envers ». MESURÉ : la route de la ville descend en SPIRALE (5,7 km de
   chute sur 16,7 km) ; d'un étage du bas, les tours des étages du haut PENDAIENT dans le ciel, leur pied fondu dans le bleu.)
   LA VILLE AU SOL : la route ne descend plus (`vitreAplanir` : une voie express à VIT_SOL_H du sol, des PONTS là où elle se recroise), un vrai
   SOL (`vitreSolMat` : dalles claires, avenues, pelouses, bassins), des PILIERS sous la route, et des tours GÉANTES (200 à 1 000 m) posées
   sur le sol — on roule à leur pied et on lève les yeux. Toucher le sol en vol = l'explosion (cause 'sol'). `?vitre=spirale` = la ville
   d'avant (la spirale, les pieds dans la brume) ; `?plafond=1` la rend aussi. */
const VIT_SOL=!VIT_PLAFOND&&!/[?&]vitre=spirale\b/.test(location.search);
const VIT_SOL_H=26,VIT_SEP=46; // la route à 26 m du sol ; un pont passe ≥ 46 m au-dessus de la route qu'il croise (le tablier, la caisse, la caméra)
/* LA ROUTE À PLAT : l'altitude des points de contrôle est RÉÉCRITE (le tracé en plan ne bouge pas, aucun tirage `rnd`) — une houle de ±14 m,
   puis, partout où la route repasse au-dessus (en plan) d'un bout déjà posé, le passage suivant MONTE en pont (rampe en S, ≤ ~7°, VIT_SEP
   au-dessus de l'autre) ; on recommence jusqu'à ce qu'aucun croisement ne reste (un pont peut en enjamber un autre). */
function vitreAplanir(P){
  const n=P.length;if(n<3)return;
  const S=new Float64Array(n);for(let i=1;i<n;i++)S[i]=S[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);
  const y0=P[0].y,f1=((P[0].x*.0137+P[0].z*.0191)%6.2832),f2=((P[0].x*.0071-P[0].z*.0113)%6.2832),h=new Float64Array(n);
  for(let i=0;i<n;i++){const e=1-Math.exp(-S[i]/260);h[i]=(10*Math.sin(S[i]/640+f1)+4*Math.sin(S[i]/230+f2)-10*Math.sin(f1)-4*Math.sin(f2))*e;} // (part de 0 au portail)
  const Dc=2*ROAD_HALF+16,Dc2=Dc*Dc,GAP=Math.max(260,5*Dc),LR=1.5*VIT_SEP/.12; // LR : la rampe d'un pont (pente max ~7°)
  const sd2=function(a,b,c,d){ // distance² en plan entre les segments [a,b] et [c,d]
    const ux=b.x-a.x,uz=b.z-a.z,vx=d.x-c.x,vz=d.z-c.z,wx=a.x-c.x,wz=a.z-c.z,A=ux*ux+uz*uz,B=ux*vx+uz*vz,C=vx*vx+vz*vz,D=ux*wx+uz*wz,E=vx*wx+vz*wz,den=A*C-B*B;
    const den1=ux*(d.z-c.z)-uz*(d.x-c.x);if(Math.abs(den1)>1e-9){const t=((c.x-a.x)*vz-(c.z-a.z)*vx)/den1,u=((c.x-a.x)*uz-(c.z-a.z)*ux)/den1;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
    let m=1e18;const pt=function(px,pz,qx,qz,rx,rz){const lx=rx-qx,lz=rz-qz,l2=lx*lx+lz*lz||1e-9;let t=((px-qx)*lx+(pz-qz)*lz)/l2;t=t<0?0:t>1?1:t;const ex=qx+lx*t-px,ez=qz+lz*t-pz;return ex*ex+ez*ez;};
    m=Math.min(pt(a.x,a.z,c.x,c.z,d.x,d.z),pt(b.x,b.z,c.x,c.z,d.x,d.z),pt(c.x,c.z,a.x,a.z,b.x,b.z),pt(d.x,d.z,a.x,a.z,b.x,b.z));return m;};
  const req=new Float64Array(n),pr=[];
  for(let j=1;j<n-1;j++)for(let i=0;i<j-1&&S[i+1]<=S[j]-GAP;i++)if(sd2(P[i],P[i+1],P[j],P[j+1])<Dc2)pr.push(i,j); // les croisements (en plan), une fois pour toutes
  for(let it=0;it<12;it++){let conf=0;req.fill(-1e9);
    for(let q=0;q<pr.length;q+=2){const i=pr[q],j=pr[q+1],hi=Math.max(h[i],h[i+1]),lo=Math.min(h[i],h[i+1]),hj=Math.min(h[j],h[j+1]),hj2=Math.max(h[j],h[j+1]);
      if(hj>=hi+VIT_SEP-1||hj2<=lo-VIT_SEP+1)continue; // déjà au-dessus (ou dessous) : rien à faire
      conf++;const v=hi+VIT_SEP+2;if(v>req[j])req[j]=v;if(v>req[j+1])req[j+1]=v;}
    if(!conf)break;
    const h0=h.slice(); // la RAMPE : chaque exigence tire la route vers elle en S (smoothstep) sur LR mètres de part et d'autre
    for(let k=0;k<n;k++){let m=h0[k];for(let l=0;l<n;l++){if(req[l]<-1e8)continue;const x=Math.abs(S[k]-S[l])/LR;if(x>=1)continue;const w=1-x*x*(3-2*x),v=h0[k]+(req[l]-h0[k])*w;if(v>m)m=v;}h[k]=m;}}
  for(let i=0;i<n;i++)P[i].y=y0+h[i];
  vitreAplanir.ponts=pr.length/2;
}
/* LE SOL DE LA VILLE (AU SOL) : un seul plan, sous toute la piste (+7 km), dessiné dans le shader — des ÎLOTS de 240 m séparés par des AVENUES
   de 36 m (asphalte, lignes blanches, tirets au milieu), et dans chaque îlot un PARVIS (dalles de 6 m), une PELOUSE tondue ou un BASSIN qui renvoie
   le ciel (le soleil y brille) ; la nuit, des lignes de LED bleues le long des avenues, des réverbères, des bassins éclairés. Le motif s'efface
   au loin (fwidth : rien ne fourmille). Les PILIERS (InstancedMesh, deux boîtes : le fût et le chapiteau en T) tous les ~64 m sous la route, sauf là
   où une autre route passe dessous. Matières compilées au menu (vitreChauffe). */
function vitreSolMat(){
  if(VIT.mat.sol)return VIT.mat.sol;
  const m=new THREE.ShaderMaterial({fog:true,extensions:{derivatives:true},
    uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uSolC:VIT.uSolC,uSolL:VIT.uSolL,uSun:VIT.uSun,uSunC:VIT.uSunC,uNuit:VIT.uNuit,uWet:ROAD_U.uWet,uZen:skyU.uJZen,uHor:skyU.uJHor}),
    vertexShader:'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:'uniform vec3 uSolC,uSolL,uSun,uSunC,uZen,uHor;uniform float uNuit,uWet;varying vec3 vW;\n#include <fog_pars_fragment>\n'+
      'float lgn(float x,float w,float f){return 1.-smoothstep(w-f,w+f,abs(x));}float hs(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}'+
      'void main(){vec2 p=vW.xz;vec2 fw=max(fwidth(p),vec2(1e-3));float f=max(fw.x,fw.y),far=smoothstep(1.2,6.,f),far2=smoothstep(.3,1.6,f);'+
      ' const float B=240.,A=36.;vec2 c=floor(p/B),u=p-c*B,v=u-A;float h=hs(c),h2=hs(c+17.3);'+
      ' float avX=1.-smoothstep(A-f,A+f,u.x),avZ=1.-smoothstep(A-f,A+f,u.y),av=max(avX,avZ);'+                       // l'AVENUE : les 36 premiers mètres de chaque axe de l'îlot
      ' vec3 V=normalize(vW-cameraPosition),R=reflect(V,vec3(0.,1.,0.));'+
      ' vec3 ciel=mix(uHor,uZen,smoothstep(0.,.6,R.y)),eau=ciel*vec3(.60,.74,.88)+pow(max(dot(R,uSun),0.),500.)*uSunC*4.;'+   // le ciel dans l'eau (et le soleil)
      ' float bord=min(min(v.x,v.y),min(B-A-v.x,B-A-v.y)),inn=smoothstep(10.-f,10.+f,bord);'+                       // 10 m de parvis autour de la pelouse ou du bassin
      ' vec2 g6=abs(fract(v/6.)-.5)*6.;float jt=(1.-smoothstep(.1-f*.5,.1+f*.5,min(g6.x,g6.y)))*(1.-far2);'+
      ' vec3 col=uSolC*(1.-.09*jt)*(.965+.05*hs(floor(v/6.)+c*7.)*(1.-far2));'+                                     // le PARVIS : dalles de 6 m
      ' vec3 pel=mix(vec3(.30,.47,.30),vec3(.37,.55,.35),step(.5,fract(v.x/9.))*(1.-far*.7));'+                       // la PELOUSE tondue
      ' float ty=h<.42?0.:h<.66?1.:h<.8?2.:0.;'+
      ' if(ty>.5)col=mix(col,ty<1.5?pel*mix(1.,.2,uNuit):eau*mix(1.,.4,uNuit),inn);'+
      ' float ax=u.x,az=u.y,lx=lgn(ax-2.,.22,f)+lgn(ax-34.,.22,f)+lgn(ax-18.,.18,f)*step(.5,fract(p.y/14.)),lz=lgn(az-2.,.22,f)+lgn(az-34.,.22,f)+lgn(az-18.,.18,f)*step(.5,fract(p.x/14.));'+
      ' float ln=clamp(avX*(1.-avZ)*lx+avZ*(1.-avX)*lz,0.,1.)*(1.-far);'+
      ' vec3 asph=mix(vec3(.19,.20,.23),vec3(.05,.055,.07),uNuit)*mix(1.,.6,uWet);col=mix(col,mix(asph,vec3(.93),ln*.85),av);'+  // l'asphalte et ses lignes
      ' col*=uSolL;'+
      ' col=mix(col,ciel*.55,uWet*.3*(1.-av*.5));'+                                                                   // la pluie : la dalle mouillée renvoie le ciel
      ' float led=(avX*(1.-avZ)*(lgn(ax-1.,.35,f)+lgn(ax-35.,.35,f))+avZ*(1.-avX)*(lgn(az-1.,.35,f)+lgn(az-35.,.35,f)));'+
      ' vec2 lp=vec2(min(abs(ax-5.),abs(ax-31.)),abs(mod(p.y,32.)-16.)),lq=vec2(min(abs(az-5.),abs(az-31.)),abs(mod(p.x,32.)-16.));'+
      ' float lamp=avX*(1.-avZ)*(1.-smoothstep(.5,5.,length(lp)))+avZ*(1.-avX)*(1.-smoothstep(.5,5.,length(lq)));'+
      ' col+=uNuit*(vec3(.25,.55,1.)*1.3*led*(1.-far*.6)+vec3(1.,.86,.62)*.55*lamp+(ty>1.5&&ty<2.5?vec3(.15,.35,.6)*.35*inn:vec3(0.)));'+ // la NUIT : LED bleues, réverbères, bassins éclairés
      ' gl_FragColor=vec4(col,1.);\n#include <fog_fragment>\n}'});
  m.dispose=function(){};VIT.mat.sol=m;return m;
}
function vitrePilMat(){
  if(VIT.mat.pil)return VIT.mat.pil;
  const m=new THREE.ShaderMaterial({fog:true,
    uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uSun:VIT.uSun,uSunC:VIT.uSunC,uNuit:VIT.uNuit,uZen:skyU.uJZen,uSolC:VIT.uSolC}),
    vertexShader:'varying vec3 vN,vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 p=vec4(position,1.);vec3 n=normal;\n#ifdef USE_INSTANCING\np=instanceMatrix*p;n=mat3(instanceMatrix)*n;\n#endif\n'+
      'vec4 w=modelMatrix*p;vW=w.xyz;vN=normalize(mat3(modelMatrix)*n);vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:'uniform vec3 uSun,uSunC,uZen,uSolC;uniform float uNuit;varying vec3 vN,vW;\n#include <fog_pars_fragment>\n'+
      'void main(){vec3 n=normalize(vN);float d=max(dot(n,uSun),0.);'+
      ' vec3 col=vec3(.86,.88,.92)*(uSunC*d*.75+uZen*.4+uSolC*.22*max(-n.y,0.)+.06);'+                                // le béton blanc : le soleil, le ciel, le sol qui renvoie dessous
      ' col+=vec3(.25,.55,1.)*uNuit*.9*(1.-smoothstep(.05,.2,abs(fract(vW.y/16.)-.5)*2.-.85));'+                       // la NUIT : un anneau de LED bleue tous les 16 m
      ' gl_FragColor=vec4(col,1.);\n#include <fog_fragment>\n}'});
  m.dispose=function(){};VIT.mat.pil=m;return m;
}
function vitreSolPose(root,GS){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  const M9=7000,g=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),vitreSolMat());
  g.scale.set(x1-x0+2*M9,1,z1-z0+2*M9);g.position.set((x0+x1)/2,GS,(z0+z1)/2);g.frustumCulled=false;g.renderOrder=1; // dessiné APRÈS la ville : ce que les tours cachent n'est pas peint
  g.matrixAutoUpdate=false;g.updateMatrix();root.add(g);VIT.solM=g;
  // LES PILIERS : un fût de 7 m et un chapiteau en T sous le tablier, tous les ~64 m — pas là où une autre route passe dessous (le pont de l'échangeur)
  const st=Math.max(1,Math.round(64/(L/(NP-1)))),P9=[],R2=(ROAD_HALF+12)*(ROAD_HALF+12),PIL=VIT.pilP||(VIT.pilP=[]);PIL.length=0;
  for(let i=Math.round(st/2);i<NP-st;i+=st){const p=pts[i],n=Nn[i];if(!(n.y>.85))continue;const top=p.y-THICK*.3,hh=top-GS;if(hh<12)continue;
    let dessous=false;for(let j=0;j<NP&&!dessous;j+=3){const q=pts[j],dx=q.x-p.x,dz=q.z-p.z;if(dx*dx+dz*dz<R2&&q.y<top-10)dessous=true;}
    if(dessous)continue;P9.push(p.x,top,p.z,hh,Math.atan2(T[i].x,T[i].z));}
  const nP=P9.length/5;if(!nP)return;
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitrePilMat(),nP*2),m4=VIT.m4,q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
  for(let k=0;k<nP;k++){const x=P9[k*5],top=P9[k*5+1],z=P9[k*5+2],hh=P9[k*5+3],a=P9[k*5+4];q.setFromEuler(e.set(0,a,0));
    m4.compose(v.set(x,GS+hh/2,z),q,sc.set(7,hh,7));im.setMatrixAt(k*2,m4);
    m4.compose(v.set(x,top-3,z),q,sc.set(ROAD_HALF*1.25,5,9));im.setMatrixAt(k*2+1,m4);PIL.push(x,z);}
  im.frustumCulled=false;im.matrixAutoUpdate=false;im.updateMatrix();root.add(im);VIT.pilN=nP;
}
function vitreSolDans(p){return CITY.solY!=null&&p.y<CITY.solY+.8;} // (AU SOL) la caisse touche-t-elle le sol ? (le test de impPrep)
const VIT={mat:{},geo:null,tex:null,ciel:null,met:'midi',
  uT:{value:0},uCam:{value:new THREE.Vector3()},uSun:{value:new THREE.Vector3().copy(SUN_DIR)},uNuit:{value:0},uSunC:{value:new THREE.Vector3(1,1,1)},uSunK:{value:1},
  uCl:{value:null},uClK:{value:new THREE.Vector4(.50,.76,.9,0)},uClL:{value:new THREE.Vector3(1,1,1)},uClA:{value:new THREE.Vector3(.66,.74,.86)},
  uClD:{value:new THREE.Vector2()},uClS:{value:new THREE.Vector2()},uClH:{value:1400},uClT:{value:3200},sol:[6,157],solK:0,
  uBand:{value:new THREE.Vector2(.07,.26)},uPlf:{value:new THREE.Vector3(.78,.86,.95)},geoR:null,uHaut:{value:1},uSolC:{value:new THREE.Vector3(.80,.83,.86)},uSolR:{value:new THREE.Vector3(.62,.66,.72)},uSolL:{value:new THREE.Vector3(1,1,1)},dirY:0,
  v1:new THREE.Vector3(),m4:new THREE.Matrix4(),c:new THREE.Color()};
/* LES HEURES (v2, le plafond) : k = [seuil bas, seuil haut, force] du relief du plafond de nuages · l = le côté éclairé · a = le creux · p = la couleur du
   PLAFOND (la mer de nuages à l'envers, au-dessus de la ville d'en haut) · s = l'éclat du soleil sur le verre · sol = [hauteur, azimut] du soleil en degrés
   (l'azimut depuis +z vers +x : 157° = le soleil de toujours) — BAS : il vit dans la bande de ciel entre les deux villes. */
const VIT_MET_PL={
  matin:{k:[.30,.76,.90],l:[1,.90,.78],a:[.76,.68,.74],p:[.92,.84,.80],s:1,sol:[4,128]},
  midi: {k:[.30,.76,.90],l:[1,1,1],a:[.72,.78,.88],p:[.86,.90,.96],s:1,sol:[8,157]},
  soir: {k:[.30,.76,.90],l:[1,.76,.58],a:[.62,.40,.50],p:[.95,.66,.55],s:1,sol:[2.5,186]},
  nuit: {k:[.42,.84,.70],l:[.11,.12,.19],a:[.03,.035,.06],p:[.035,.045,.085],s:0,sol:[10,157]},
  pluie:{k:[.30,.78,.85],l:[.58,.62,.68],a:[.30,.33,.38],p:[.46,.50,.56],s:.15,sol:[6,157]}};
/* CLEAN CITY : le ciel de la v1 (ses cumulus, k = couverture du ciel) ; p = la mer de nuages d'EN BAS, que le verre renvoie vers le bas. */
const VIT_MET_CL={
  matin:{k:[.54,.80,.78],l:[1,.86,.70],a:[.62,.60,.76],p:[.92,.86,.82],s:1,sol:[9,128]},
  midi: {k:[.47,.74,.94],l:[1,1,1],a:[.64,.72,.86],p:[.88,.92,.97],s:1,sol:[26,157]},
  soir: {k:[.56,.82,.72],l:[1,.76,.56],a:[.46,.32,.48],p:[.95,.70,.58],s:1,sol:[4,186]},
  nuit: {k:[.56,.82,.55],l:[.16,.18,.26],a:[.04,.045,.08],p:[.04,.05,.09],s:0,sol:[32,157]},
  pluie:{k:[.26,.66,.96],l:[.64,.68,.74],a:[.38,.42,.48],p:[.50,.54,.60],s:.15,sol:[20,157]}};
const VIT_MET=VIT_PLAFOND?VIT_MET_PL:VIT_MET_CL;
const VIT_SOLC={matin:[.90,.84,.78],midi:[.82,.85,.88],soir:[.88,.72,.62],nuit:[.05,.055,.07],pluie:[.40,.43,.47]}; // (AU SOL) la couleur des dalles à chaque heure (avant la lumière)
const VIT_HC=150; // le PLAFOND : la ville d'en haut est le miroir de celle d'en bas par rapport à un plan à 150 m au-dessus de la route qu'elle borde (à 330 m, vue de la caméra de course, elle restait hors de l'écran)
function vitreOn(){return !!(LVL.cur&&LVL.cur.vitre&&!PARK.on);}
function vitreNuages(){ // la toile des nuages : un bruit de valeur PÉRIODIQUE (5 octaves, sans couture), remis sur [0,1], peint une fois
  if(VIT.tex)return VIT.tex;
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d'),im=x.createImageData(N,N),d=im.data,R=mulberry32(0x7E77E);
  const G=[4,8,16,32,64].map(function(g){const a=new Float32Array(g*g);for(let i=0;i<a.length;i++)a[i]=R();return [g,a];}),amp=[.5,.26,.13,.07,.04],v=new Float32Array(N*N);
  let lo=1e9,hi=-1e9;
  for(let y=0;y<N;y++)for(let x9=0;x9<N;x9++){let s=0;
    for(let k=0;k<G.length;k++){const g=G[k][0],a=G[k][1],fx=x9/N*g,fy=y/N*g,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
      const i1=(ix+1)%g,j1=(iy+1)%g,v0=a[iy*g+ix]+(a[iy*g+i1]-a[iy*g+ix])*sx,v1=a[j1*g+ix]+(a[j1*g+i1]-a[j1*g+ix])*sx;s+=(v0+(v1-v0)*sy)*amp[k];}
    v[y*N+x9]=s;if(s<lo)lo=s;if(s>hi)hi=s;}
  for(let i=0;i<N*N;i++){const c=Math.round((v[i]-lo)/(hi-lo)*255),o=i*4;d[o]=d[o+1]=d[o+2]=c;d[o+3]=255;}
  x.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  try{t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}catch(e){}
  texLibere(t);VIT.tex=t;VIT.uCl.value=t;return t;}
/* LE PRISME À COINS BISEAUTÉS : chaque coin porte deux sommets confondus (un sur la face x, un sur la face z) ; `aCh9` dit lequel recule
   (x ou z) quand le sommet ouvre le biseau. Biseau nul = le cube d'avant (les pans de coin sont plats : rien n'est rastérisé).
   NR = le nombre d'ÉTAGES de la géométrie : 1 pour les tours droites, effilées, rondes et en lame (28 triangles) ; 6 pour les tours qui VRILLENT
   et les FUSEAUX (108 triangles) — leur forme se calcule au sommet, étage par étage. */
function vitreGeoFab(NR){
  const P=[],Nn=[],C=[],I=[];let n=0;
  const CO=[[1,1],[-1,1],[-1,-1],[1,-1]];                       // les coins, dans l'ordre du tour (vus de dessus)
  const vx=function(k,cote,y){const c=CO[k];return {p:[c[0]*.5,y,c[1]*.5],a:cote==='x'?[0,c[1]]:[c[0],0]};}; // 'x' : sur la face x (recule en z) · 'z' : sur la face z (recule en x)
  const ouvre=function(v){return [v.p[0]-v.a[0]*.1,v.p[1],v.p[2]-v.a[1]*.1];}; // la position biseau ouvert (pour l'ordre des sommets)
  const mur=function(ka,ca,kb,cb,nx,nz){ // une face murale, de (ka,ca) à (kb,cb), en NR bandes
    const b0=n;for(let r=0;r<=NR;r++){const y=-.5+r/NR;for(const v of [vx(ka,ca,y),vx(kb,cb,y)]){P.push(v.p[0],v.p[1],v.p[2]);Nn.push(nx,0,nz);C.push(v.a[0],v.a[1]);}}n+=2*(NR+1);
    const A=ouvre(vx(ka,ca,-.5)),B=ouvre(vx(kb,cb,-.5)),Cc=ouvre(vx(kb,cb,.5)),u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],w=[Cc[0]-A[0],Cc[1]-A[1],Cc[2]-A[2]];
    const ok=(u[1]*w[2]-u[2]*w[1])*nx+(u[0]*w[1]-u[1]*w[0])*nz>0;
    for(let r=0;r<NR;r++){const a=b0+2*r,b=a+1,c=a+3,d=a+2;if(ok)I.push(a,b,c,a,c,d);else I.push(a,c,b,a,d,c);}};
  const r2=Math.SQRT1_2;
  mur(3,'x',0,'x',1,0);mur(1,'x',2,'x',-1,0);mur(0,'z',1,'z',0,1);mur(2,'z',3,'z',0,-1); // ±x, ±z
  for(let k=0;k<4;k++)mur(k,'x',k,'z',CO[k][0]*r2,CO[k][1]*r2); // les quatre pans de coin
  for(const y of [.5,-.5]){const b=n,R=[];for(let k=0;k<4;k++)R.push(vx(k,'x',y),vx(k,'z',y)); // le toit et le dessous : l'octogone en éventail
    for(const v of R){P.push(v.p[0],v.p[1],v.p[2]);Nn.push(0,y>0?1:-1,0);C.push(v.a[0],v.a[1]);}
    for(let k=1;k<7;k++)if(y>0)I.push(b,b+k+1,b+k);else I.push(b,b+k,b+k+1);n+=8;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
  g.setAttribute('aCh9',new THREE.Float32BufferAttribute(C,2));g.setIndex(I);g.computeBoundingSphere();g.computeBoundingBox();
  g.dispose=function(){}; // PARTAGÉE (trackMeshes la jetterait au rebuild) : une seule pour toutes les villes vitrées
  return g;}
function vitreGeo(){return VIT.geo||(VIT.geo=vitreGeoFab(1));}
function vitreGeoR(){return VIT.geoR||(VIT.geoR=vitreGeoFab(6));}
/* LA FORME D'UNE TOUR (2026-10-17, Léo : « moins en forme que Crypto City… imagine plutôt Shanghai — l'architecture des bâtiments, surtout pas
   de stéréotype ») : des gratte-ciel très hauts et fins aux silhouettes travaillées, aucun monument reconnaissable. Tirée de la POSITION de la
   tour (aucun tirage `vr`) : 0 DROITE (retraits empilés) · 1 EFFILÉE · 2 VRILLÉE · 3 FUSEAU · 4 RONDE · 5 LAME (toit en biais). Les tours du
   canyon (le long de la route) ont toutes les formes ; la forêt du lointain, les simples. Le sommet la lit dans la couleur d'instance (r + 8 × forme). */
function vitreForme(cx,cz,H,canyon){const h=metroH(cx*1.7+3.1,cz*.9-7.3);
  if(canyon&&H>240)return h<.28?0:h<.46?1:h<.60?2:h<.71?3:h<.86?4:5;
  return h<.6?0:h<.75?4:h<.88?1:5;}
function vitreFormeD(cx,cz,H,canyon,F){const h=metroH(cx*1.7+3.1+F.ox,cz*.9-7.3+F.oz),S=F.s; // (2026-10-20, LE DÉCOR AU HASARD) les formes de la VILLE VITRÉE : la famille tirée (F.s, les seuils) et lesquelles (la graine décalée)
  if(canyon&&H>240)return h<S[0]?0:h<S[1]?1:h<S[2]?2:h<S[3]?3:h<S[4]?4:5;
  return h<.6?0:h<.75?4:h<.88?1:5;}
// LE MUR DE VERRE — au sommet le biseau, au pixel la façade ; la tour de la ville (tri hors champ, portée des lampes, impact) pour le reste
/* (2026-10-18, NÉON ET VERRE) le mur de verre est une FONCTION de ce qu'il renvoie vers le bas et sur les côtés (CB, la fin du ciel renvoyé) : la VILLE
   VITRÉE la prend avec sa branche de toujours (VIT_CIEL_B : le texte de VIT_VERRE est le même au caractère près), LA VILLE avec la sienne (VV_CIEL_B). */
const VIT_CIEL_B=(VIT_PLAFOND?'sky=mix(sky,mix(uPlf9,rel9,cv),smoothstep(uBand9.x,uBand9.y,ary));}':  // (v2) LE PLAFOND : au-dessus de la bande de ciel, la mer de nuages à l'envers
   VIT_SOL?'sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(uHor9,uSolR9,smoothstep(0.,.16,ary));}': // (AU SOL) vers le bas, les dalles de la ville (la brume à l'horizon)
   'sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(sky,mix(uPlf9,rel9,smoothstep(uClK9.x-.17,uClK9.y,c1)),smoothstep(uBand9.x,uBand9.y,ary));}'); // (CLEAN CITY) en haut le ciel et ses nuages ; en bas, la mer de nuages
const vitreVerre=function(CB){return ''+
  '{vec3 an=abs(vNrm9);float fv=step(an.y,.5)*step(9.,min(vSc9.x,vSc9.z));'+
  'float s1=fract(vSeed9*7.13),s2=fract(vSeed9*13.71),s3=fract(vSeed9*29.37),s4=fract(vSeed9*53.17),sty=s3<.26?0.:s3<.50?1.:s3<.66?2.:s3<.76?3.:4.;'+ // (CLEAN CITY) 26 % VERRE BLEU · 24 % BLANCHE à bandeaux · 16 % LAMES blanches · 10 % SOMBRE · 24 % ARGENT
  'vec2 nh=normalize(vNrm9.xz+vec2(1e-6,0.));float ux=dot(vLoc9.xz,vec2(-nh.y,nh.x));'+                       // le long de la façade (pans de coin compris), en mètres
  'float fh=3.9+s2*.5,cw=sty>3.5?3.+s1*.4:sty>2.5?2.5+s1*.7:1.45+s1*.45;'+                                     // l'ÉTAGE et la TRAVÉE
  'vec2 uv=vec2(ux/cw,(vW9.y+s1*97.)/fh),fw=max(fwidth(uv),vec2(1e-4));'+                                         // les étages comptés dans le MONDE : les volumes empilés d'une tour gardent les mêmes
  'float tt=step(.5,vNrm9.y)*step(9.,min(vSc9.x,vSc9.z)),de=min(min(vSc9.x*.5-abs(vLoc9.x),vSc9.z*.5-abs(vLoc9.z)),(vSc9.x*.5+vSc9.z*.5-vCh9-abs(vLoc9.x)-abs(vLoc9.z))*.7071),fe=max(fwidth(de),1e-4);'+
  'vec3 V9=normalize(vW9-uCam9);vec2 id=floor(uv),f=fract(uv);float far=smoothstep(.3,.75,max(fw.x,fw.y));'+
  'float h1=fract(sin(dot(id+vSeed9*31.,vec2(12.9898,78.233)))*43758.5453),h2=fract(h1*91.7+.13);'+
  'vec3 N9=normalize(vNw9),T9=normalize(vec3(-N9.z,0.,N9.x)+vec3(1e-5,0.,0.)),Np=normalize(N9+(T9*(h1-.5)*.032+vec3(0.,(h2-.5)*.02,0.))*(1.-smoothstep(.06,.22,max(fw.x,fw.y))));'+ // chaque carreau, un miroir un peu désaxé
  'vec3 R9=reflect(V9,Np);float ry=R9.y,fry=max(fwidth(ry),1e-4);'+
  'float ary=abs(ry);vec2 cp=(vW9.xz+R9.xz*(uClH9+(uCam9.y-vW9.y)*sign(ry+1e-5))/max(ary,.02))/uClT9+uClD9;float c1=texture2D(uCl9,cp).r,c2=texture2D(uCl9,cp+uClS9).r;'+ // les NUAGES du plafond (lus hors branche : dérivées sûres)
  '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+
  'if(VIS9){'+
  ' if(fv>0.){'+
  '  vec3 sky=mix(mix(uHor9,uMid9,smoothstep(0.,.18,ary)),uZen9,smoothstep(.14,.9,ary));'+ // (v2) la carte est un MIROIR : en bas comme en haut, la bande de ciel puis la mer de nuages // en dessous : la ville noyée de brume
  '  {float cv=smoothstep(uClK9.x,uClK9.y,c1)*uClK9.z;vec3 rel9=mix(uClA9,uClL9,clamp(.55+(c1-c2)*2.4,0.,1.));'+
  CB+ // la fin du ciel renvoyé (VIT_CIEL_B ou VV_CIEL_B)
  // LES TOURS D'EN FACE : le verre renvoie aussi la ville — deux rangées de tours sur l'horizon du reflet (72 et 120 par tour d'horizon), plus sombres que le ciel,
  // leurs étages en filets (et la nuit leurs bureaux) ; c'est ce qui fait un vrai mur de verre (il ne renvoie jamais que du ciel)
  '  {float az=atan(R9.z,R9.x),a1=floor(az*11.46),a2=floor(az*19.1+.5),q1=fract(sin(a1*12.9898)*43758.5453),q2=fract(sin(a2*78.233+1.7)*43758.5453);'+
  '   float hs1=.035+.2*q1*q1,hs2=.015+.08*q2,b1=1.-smoothstep(hs1-fry,hs1+fry,ry),b2=1.-smoothstep(hs2-fry,hs2+fry,ry),bb=max(b1,b2)*step(-.02,ry);'+
  '   vec3 bc=mix(mix(uHor9,uMid9,.35)*mix(.62,.5,b2),fogColor*.9,.25+.35*b2)*(1.-.75*uNuit9);'+               // la tour renvoyée : le ciel assombri (le verre d'en face), le second rang dans la brume
  '   float wy=fract(ry*90.),wx=fract(az*120.),wn=step(.5,fract(sin(floor(ry*90.)*7.1+floor(az*120.)*3.3)*4375.85));'+
  '   bc+=vec3(1.,.82,.56)*wn*step(.25,wy)*step(.3,wx)*uNuit9*.55*(1.-far);'+                                    // la NUIT : leurs bureaux allumés
  '   float q3=fract(sin(a1*91.7+3.3)*43758.5453),q4=fract(sin(a2*17.3+.7)*43758.5453),hu1=uBand9.x*.8+.18*q3,hu2=uBand9.x*.9+.07*q4;'+ // (v2) LA VILLE D'EN HAUT : ses tours pendent dans le reflet, au-dessus de la bande
  '   float bu=max('+(VIT_PLAFOND?'max(smoothstep(hu1-fry,hu1+fry,ry),.5*smoothstep(hu2-fry,hu2+fry,ry))':'0.')+',max(smoothstep(hu1-fry,hu1+fry,-ry),.5*smoothstep(hu2-fry,hu2+fry,-ry))*step(ry,0.))*(1.-smoothstep(.55,.85,ary));'+ // (et leurs miroirs : la ville d'en bas qui monte vers le reflet)
  '   sky=mix(sky,bc,max(bb*(1.-.5*b2*(1.-b1)),bu));}'+
  '  float sd=max(dot(R9,uSun9),0.),gl=(pow(sd,900.)*16.+pow(sd,70.)*.6+pow(sd,6.)*.3)*uSunK9;'+               // l'ÉCLAT du soleil
  '  vec3 tint=sty<.5?vec3(.40,.66,.96):sty<1.5?vec3(.56,.72,.90):sty<2.5?vec3(.48,.70,.94):sty<3.5?vec3(.30,.50,.60):vec3(.82,.88,.96);'+
  '  float rb=sty<.5?.5:sty<1.5?.42:sty<2.5?.46:sty<3.5?.64:.8,cv=abs(dot(V9,Np)),fr=mix(rb,1.,pow(1.-cv,4.));'+ // Fresnel du verre traité : il renvoie déjà la moitié de face
  '  vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);'+
  // L'INTÉRIEUR : un bureau sombre derrière un verre teinté ; la NUIT, les plateaux allumés (des baies entières, des étages qui dorment, les plafonniers en haut)
  '  vec2 ib=vec2(floor(id.x/(sty>2.5?2.:4.)),id.y);float hb=fract(sin(dot(ib+vSeed9*17.,vec2(41.3,97.1)))*31758.5453),hf=fract(sin(id.y*91.7+vSeed9*311.)*43758.5453),on=step(.4,hb)*step(.22,hf);'+
  '  vec3 lc=mix(vec3(1.,.82,.58),vec3(.80,.90,1.),step(.45,fract(s4*3.7+hb*.6)))*(.5+.5*h1);'+ // (CLEAN CITY) des bureaux en LED froide, un peu plus de la moitié
  '  float spd=(sty<.5||(sty>1.5&&sty<2.5))?1.-smoothstep(.25-fw.y,.25+fw.y,f.y):0.;'+                         // l'ALLÈGE : le bas de chaque étage, verre opaque
  '  float blind=step(.86,fract(h1*13.7));vec3 ins=tint*.045*(.6+.8*h1)+lc*(.5+.5*hb)*on*(uNuit9*(.32+.5*smoothstep(.3,.92,f.y)+.55*smoothstep(.86,.93,f.y)*(1.-smoothstep(.93,.97,f.y)))*(1.-.6*blind)+.03)*(1.-spd);'+ // le PLAFONNIER : un filet clair en haut de la baie ; un store sur sept
  '  ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.11*uNuit9,far);'+ // au loin, la lueur moyenne des bureaux (les baies sous le pixel) : une tour sombre qui rougeoie, pas un carton
  '  vec3 glass=mix(ins,refl,fr*(1.-.35*uNuit9));'+
  // LES MONTANTS (la teinte d'instance, éclairée) : travée et étage ; BANDEAUX : 1,3-1,7 m de béton par étage ; le parapet en haut de chaque volume
  '  float mw=sty>3.5?.05:sty>2.5?.09:.075;vec2 hw=vec2(.5-mw/cw,.5-.07/fh);if(sty>.5&&sty<1.5)hw.y=.5-(.9+.3*s2)/fh;'+ // (CLEAN CITY) les tours BLANCHES : 1,8 à 2,4 m de panneau blanc par étage
  '  vec2 dd=(hw-abs(f-.5))/fw;float pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),4.*hw.x*hw.y,far)*(1.-step(vSc9.y-1.5,vB9));'+
  '  vec3 st=gl_FragColor.rgb*(1.-.6*uNuit9)+sky*tint*.10,colF=mix(st,glass,pane);'+ // (la nuit, le béton et les montants s'éteignent : les bureaux ressortent)
  // LES LAMES : une toutes les deux travées, plus épaisse en rasant (sa profondeur), son OMBRE du côté opposé au soleil
  '  if(sty>1.5&&sty<2.5){float fu=(fract(uv.x*.5+.5)-.5)*2.*cw,fwm=fw.x*cw,lw=.18+.45*(1.-cv),fin=1.-clamp((abs(fu)-lw)/(fwm*2.)+.5,0.,1.);'+
  '   float ss=sign(dot(uSun9.xz,T9.xz)+1e-4),sh=step(0.,-fu*ss)*(1.-smoothstep(lw+.5,lw+.9,abs(fu)));'+
  '   fin=mix(fin,lw/cw,far);colF*=1.-.45*sh*(1.-uNuit9)*(1.-far);colF=mix(colF,st*1.1,fin);}'+
  '  if(an.x>.9||an.z>.9){float hw9=(an.x>an.z?vSc9.z:vSc9.x)*.5-vCh9,pxm=max(fw.x*cw,1e-3);'+ // (CLEAN CITY) sur les faces droites :
  '   colF+=vec3(.25,.62,1.)*(1.-smoothstep(.12,.12+pxm*1.5,hw9-abs(ux)))*step(.5,fract(vSeed9*17.9))*(.1+1.5*uNuit9)*(1.-far);'+ // LES FILETS BLEUS : une tour sur deux a ses arêtes en LED (la nuit surtout)
  '   if(vFo9>.5&&s4>.45){float lw9=min(34.,hw9*1.5),pxl=pxm/(lw9*.5);vec2 q=vec2(ux,vB9-(vSc9.y-lw9*.5-16.))/(lw9*.5);float lk=floor(fract(vSeed9*91.3)*6.),dl=1e3;'+ // LE LOGO : une marque minimaliste près du sommet (inventée)
  '    if(lk<.5)dl=abs(length(q)-.72)-.12;else if(lk<1.5)dl=length(q)-.62;else if(lk<2.5)dl=vitreTri(q);else if(lk<3.5)dl=min(vitreBox(q-vec2(-.34,0.),vec2(.12,.75)),vitreBox(q-vec2(.34,0.),vec2(.12,.75)));'+
  '    else if(lk<4.5)dl=abs(vitreBox(q,vec2(.66)))-.1;else dl=min(length(q-vec2(0.,.42))-.2,vitreBox(q-vec2(0.,-.3),vec2(.62,.1)));'+
  '    float lm=(1.-smoothstep(-pxl,pxl,dl))*(1.-far);colF=mix(colF,mix((sty>.5&&sty<2.5)?vec3(.05,.16,.42):vec3(1.12),vec3(.6,.86,1.)*1.9,uNuit9),lm);}}'+ // bleu profond sur une tour blanche, blanc sur le verre ; la nuit, il s'allume
  '  gl_FragColor.rgb=colF;'+
  ' }'+
  ' if(tt>0.){float hr=fract(sin(dot(floor(vLoc9.xz/6.+vSeed9*7.),vec2(12.9898,78.233)))*43758.5453);'+ // (v2) LE TOIT, vu d'en haut : une dalle sombre et ses blocs techniques, le parapet clair
  '  gl_FragColor.rgb=mix(gl_FragColor.rgb*('+(VIT_PLAFOND?'.36+.16':'.66+.12')+'*step(.72,hr))*(1.-.5*uNuit9),gl_FragColor.rgb,1.-smoothstep(1.2,1.2+fe*1.5,de));'+ // (CLEAN CITY) un toit clair
  '  if(fe<1.4)gl_FragColor.rgb+=vec3(.86,.93,1.)*(1.-smoothstep(.55,.55+fe*1.5,de))*(1.-smoothstep(.5,1.4,fe))*.55*uNuit9;}'+ // la nuit, le parapet s'allume d'un filet blanc
  '}}\n';};
const VIT_VERRE=vitreVerre(VIT_CIEL_B);
/* (NÉON ET VERRE) LE VERRE DE LA VILLE : vers le bas, la rue et ses néons noyés dans la brume (pas de dalles : on est au-dessus du vide) ; un verre
   plus NEUTRE (le bleu du jour mangeait le violet de la ville), les bureaux plus vifs et leur lueur au loin doublée, les filets de LED sur trois tours
   sur quatre, plus forts, à la couleur de la TEINTE (uAcc9), comme les logos et le parapet du toit ; plus de verre que de blanc (VV_STY). */
const VV_CIEL_B='sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(uHor9,fogColor*1.05+uAcc9*.16,smoothstep(0.,.35,ary));}';
const VV_VERRE=vitreVerre(VV_CIEL_B).replace('sty=s3<.26?0.:s3<.50?1.:s3<.66?2.:s3<.76?3.:4.',VV_STY)
  .replace('vec3 tint=sty<.5?vec3(.40,.66,.96):sty<1.5?vec3(.56,.72,.90):sty<2.5?vec3(.48,.70,.94):sty<3.5?vec3(.30,.50,.60):vec3(.82,.88,.96);',
           'vec3 tint=sty<.5?vec3(.66,.76,1.):sty<1.5?vec3(.78,.82,.94):sty<2.5?vec3(.72,.80,.98):sty<3.5?vec3(.46,.50,.62):vec3(.94,.95,1.);')
  .replace('vec3 ins=tint*.045*(.6+.8*h1)+lc*(.5+.5*hb)*on*(','vec3 ins=tint*.045*(.6+.8*h1)+lc*1.55*(.5+.5*hb)*on*(')
  .replace('ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.11*uNuit9,far);','ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.24*uNuit9+uAcc9*.05,far);')
  .replace('colF+=vec3(.25,.62,1.)*','colF+=uAcc9*1.4*')
  .replace('step(.5,fract(vSeed9*17.9))*(.1+1.5*uNuit9)','step(.25,fract(vSeed9*17.9))*(.1+1.5*uNuit9)')
  .replace('vec3(.6,.86,1.)*1.9,uNuit9)','mix(uAcc9,vec3(1.),.35)*1.9,uNuit9)')
  .replace('gl_FragColor.rgb+=vec3(.86,.93,1.)*(1.-smoothstep(.55,.55+fe*1.5,de))','gl_FragColor.rgb+=mix(uAcc9,vec3(1.),.3)*1.6*(1.-smoothstep(.55,.55+fe*1.5,de))')
  /* (2026-10-20, VILLE EMBELLIE) L'ÉCHO des néons dans le verre (des bandes verticales de la teinte et de cyan, fortes sous l'œil) et les ÉTAGES TECHNIQUES (une bande de LED tous les 12 à 21 étages sur une géante sur deux) */
  .replace('vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);','vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);'+
    'float bwV=8.+s2*16.,gbV=floor(ux/bwV),hbV=fract(sin(gbV*12.9898+vSeed9*78.233)*43758.5453),sbV=sin(3.14159*fract(ux/bwV)),pkV=smoothstep(.5,.9,hbV)*sbV*sbV,grV=smoothstep(280.,-140.,vW9.y-uCam9.y);'+
    'refl+=mix(uAcc9,vec3(.24,.91,1.),step(.5,fract(hbV*7.3)))*pkV*grV*.26*uEmb9;')
  .replace('gl_FragColor.rgb=colF;','gl_FragColor.rgb=colF;'+
    'if(s4<.45&&vSc9.y>150.){float npV=12.+floor(s2*10.),yyV=vB9/(fh*npV),fyV=max(fwidth(yyV),1e-5),dqV=abs(fract(yyV+.5)-.5),hbV2=.4/npV;'+
    'float lbV=1.-smoothstep(hbV2,hbV2+fyV*1.5,dqV);lbV=mix(lbV,2.*hbV2,smoothstep(.4,1.5,fyV));lbV+=.2*exp(-dqV*npV/1.2)*(1.-smoothstep(.4,1.5,fyV));'+
    'vec3 bcV=s1>.8?vec3(1.,.78,.34):mix(uAcc9,vec3(.24,.91,1.),step(.5,s1));gl_FragColor.rgb+=bcV*lbV*1.15*uNuit9*uEmb9;}');
/* LE PIED DANS LA BRUME : les volumes sont EMPILÉS (voir buildVoxCity), on ne connaît plus le pied de la tour — la brume est une NAPPE posée
   à ~380 m sous la caméra (la route est à ~330 m au-dessus du pied des tours), fondue sur 300 m ; la nuit, la rue l'éclaire à peine. */
/* (CLEAN CITY) ⚠ une tour qui borde un étage de route PLUS HAUT a son pied au-dessus de la caméra : la nappe seule ne le noyait pas — elle flottait,
   le dessous visible (on aurait dit la ville du plafond). Le volume du PIED (et les lames, qui partent du pied) porte un drapeau (vert + 8) :
   son pied se noie comme dans la ville de nuit. */
const VIT_PIED_P='vPb9>.5?vB9:1e5';
const vitrePied=function(pres){if(VIT_SOL)return ''; /* (AU SOL) la tour est POSÉE : son pied se voit, sur les dalles */ return VIT_PIED.replace('float hB=vW9.y-uCam9.y+380.','float hB=min(vW9.y-uCam9.y+380.,'+(pres?VIT_PIED_P:'1e5')+')');};
const VIT_PIED='#ifdef USE_FOG\n{float hB=vW9.y-uCam9.y+380.,hT=uCam9.y+'+(VIT_PLAFOND?2*VIT_HC+380:1e5)+'.-vW9.y;' + // (v2) et la même NAPPE en miroir, au-dessus de la ville d'en haut (couleur du plafond)
  'if(hB<300.){vec3 vd9=normalize(vW9-uCam9);vec3 mc=mix(fogColor,mix(mix(uHor9,uMid9,smoothstep(0.,.18,vd9.y)),uZen9,smoothstep(.14,.9,vd9.y)),smoothstep(.02,.25,vd9.y))'+ // (CLEAN CITY) un pied AU-DESSUS de la caméra se fond dans le CIEL (pas dans la brume de l'horizon : il se découpait)
  '+vec3(.07,.06,.04)*uNuit9*(1.-smoothstep(0.,160.,hB));gl_FragColor.rgb=mix(mc,gl_FragColor.rgb,smoothstep(0.,300.,hB));}'+
  'if(hT<300.)gl_FragColor.rgb=mix(uPlf9,gl_FragColor.rgb,smoothstep(0.,300.,hT));}\n#endif';
function vitreBiseau(cx,cz){const s=((cx*.0131+cz*.0173)%1+1)%1;return ((s*71.3)%1)<=.6;} // la tour (cx,cz) est-elle biseautée ? (le même tirage que le sommet : la graine de son centre)
function vitreMatToursLoin(){ // la tour AU LOIN (voir villeMatToursLoin) : la couleur de la brume, le pied dans la nappe
  if(VIT.mat.toursL)return VIT.mat.toursL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uNuit9=VIT.uNuit;sh.uniforms.uCam9=VIT.uCam;sh.uniforms.uPlf9=VIT.uPlf;sh.uniforms.uZen9=skyU.uJZen;sh.uniforms.uMid9=skyU.uJMid;sh.uniforms.uHor9=skyU.uJHor;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uNuit9;uniform vec3 uCam9,uPlf9,uZen9,uMid9,uHor9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+vitrePied(false));};
  m.customProgramCacheKey=function(){return VIT_SOL?'toursLoinVitre3':'toursLoinVitre2';};m.dispose=function(){};
  VIT.mat.toursL=m;return m;
}
function vitreMatTours(){return VIT.mat.tours||(VIT.mat.tours=vitreMatFab(false));}
function vitreMatToursNeon(){return VIT.mat.toursN||(VIT.mat.toursN=vitreMatFab(true));} // (2026-10-18, NÉON ET VERRE) les géantes de verre de LA VILLE
function vitreMatFab(NE){ // NE : le verre de LA VILLE (VV_VERRE, les uniformes VV, le pied de villePied) — sinon celui de la VILLE VITRÉE, tel qu'il était
  vitreNuages();
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x05070a});
  m.extensions={derivatives:true};
  const DECL='varying vec3 vLoc9;varying vec3 vNrm9;varying float vB9;varying float vSeed9;varying vec3 vSc9;varying vec3 vW9;varying float vCh9;varying vec3 vNw9;varying float vFo9;varying float vPb9;';
  const SDF='float vitreBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}'+ // les formes des logos (distances signées)
    'float vitreTri(vec2 p){const float k=1.7320508;p.x=abs(p.x)-.7;p.y=p.y+.7/k;if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;p.x-=clamp(p.x,-1.4,0.);return -length(p)*sign(p.y);}';
  const SF='float vitreSF(float fo,float sv,float hh){if(fo<.5)return 1.;if(fo<1.5)return mix(1.,.45+.15*sv,smoothstep(.4,1.,hh));if(fo<2.5)return mix(1.,.72,smoothstep(.3,1.,hh));'+ // l'échelle de la section à la hauteur hh (0 pied, 1 sommet) — la forme vit dans la moitié HAUTE : celle qui sort de la brume
    'if(fo<3.5)return (1.+.16*sin(3.1416*clamp((hh-.4)/.45,0.,1.)))*mix(1.,.5,smoothstep(.8,1.,hh));if(fo<4.5)return mix(1.,.8,smoothstep(.4,1.,hh));return 1.;}';
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CITY.uT,uWet9:ROAD_U.uWet,uLum9:CITY.uL,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,
      uSun9:VIT.uSun,uCam9:VIT.uCam,uNuit9:VIT.uNuit,uSunC9:VIT.uSunC,uSunK9:VIT.uSunK,uCl9:VIT.uCl,uClK9:VIT.uClK,uClL9:VIT.uClL,uClA9:VIT.uClA,uClD9:VIT.uClD,uClS9:VIT.uClS,uClH9:VIT.uClH,uClT9:VIT.uClT,uBand9:VIT.uBand,uPlf9:VIT.uPlf,uHaut9:VIT.uHaut,uSolR9:VIT.uSolR});
    if(NE)Object.assign(sh.uniforms,{uZen9:VV.uZen,uMid9:VV.uMid,uHor9:VV.uHor,uAcc9:VV.uAcc,uNuit9:VV.uNuit,uSunK9:VV.uSunK,uClK9:VV.uClK,uClL9:VV.uClL,uClA9:VV.uClA,uClD9:VV.uClD,uPlf9:VV.uPlf,uPied9:CITY.uPied,uPiedC9:CITY.uPiedC,uEmb9:CITY.uEmb}); // (NÉON ET VERRE) le ciel de la ville, sa teinte, son pied
    sh.vertexShader='#undef USE_SHADOWMAP\n'+sh.vertexShader.replace('#include <common>','#include <common>\n'+DECL+'\nattribute vec2 aCh9;uniform vec4 uLum9[4];uniform float uHaut9;\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n'+SF+'\n')
      .replace('#include <color_vertex>','#include <color_vertex>\nfloat fo9=0.;\n#ifdef USE_INSTANCING_COLOR\nfo9=floor(instanceColor.r/8.+.001);vColor.r-=8.*fo9;\n#endif\nvFo9=fo9;vPb9=0.;\n#ifdef USE_INSTANCING_COLOR\nvPb9=floor(instanceColor.g/8.+.001);vColor.g-=8.*vPb9;\n#endif\n') // LA FORME, rangée dans la couleur d'instance (r + 8 × forme)
            .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n#ifdef USE_INSTANCING\n'+
        'vec3 sc9=max(vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz)),vec3(1e-4));vSeed9=fract(instanceMatrix[3].x*.0131+instanceMatrix[3].z*.0173);'+
        'vec3 fl9=vec3(instanceMatrix[0].x<0.?-1.:1.,instanceMatrix[1].y<0.?-1.:1.,1.);\n#else\nvec3 sc9=vec3(1.);vSeed9=0.;vec3 fl9=vec3(1.);\n#endif\n'+ // fl9 : la ville d'EN HAUT (l'instance retournée)
        'float sv9=fract(vSeed9*41.7),hh9=position.y+.5,aF9=(fo9>1.5&&fo9<2.5)?(1.6+1.2*sv9)*smoothstep(.25,1.,hh9)*(sv9<.5?-1.:1.):0.;'+ // la VRILLE : 90 à 160°, dans la moitié haute
        'vec3 nm9=objectNormal;if(abs(nm9.x)>.1&&abs(nm9.z)>.1)nm9=vec3(sign(nm9.x),0.,sign(nm9.z))*.7071;'+ // le pan de coin : 45° en MÈTRES
        'if(abs(nm9.y)<.5&&fo9>.5){float dS9=(vitreSF(fo9,sv9,min(hh9+.01,1.))-vitreSF(fo9,sv9,max(hh9-.01,0.)))/.02;nm9.y=-dS9*.5*min(sc9.x,sc9.z)/sc9.y;'+ // la façade qui s'effile penche
        'float ca9=cos(aF9),sa9=sin(aF9);nm9.xz=vec2(ca9*nm9.x-sa9*nm9.z,sa9*nm9.x+ca9*nm9.z);}'+
        'nm9=normalize(nm9);vNw9=nm9*fl9;objectNormal=nm9*sc9;') // (three divise par l'échelle² puis multiplie par la matrice : la normale du monde en sort)
      .replace('#include <begin_vertex>','#include <begin_vertex>\n'+
        'vCh9=(fo9>3.5&&fo9<4.5)?.29*min(sc9.x,sc9.z):step(fract(vSeed9*71.3),.6)*min(min(sc9.x,sc9.z)*((fo9>1.5&&fo9<2.5)?.08:.16),7.);transformed.xz-=aCh9*vCh9/sc9.xz;'+ // LE BISEAU (RONDE : l'octogone presque régulier)
        'vLoc9=transformed*sc9;vNrm9=normal;if(abs(normal.x)>.1&&abs(normal.z)>.1)vNrm9=vec3(sign(normal.x),0.,sign(normal.z))*.7071;'+ // AVANT la forme : la grille des carreaux suit la façade
        '{vec2 pm9=transformed.xz*sc9.xz*vitreSF(fo9,sv9,hh9);float ca9=cos(aF9),sa9=sin(aF9);transformed.xz=vec2(ca9*pm9.x-sa9*pm9.y,sa9*pm9.x+ca9*pm9.y)/sc9.xz;'+
        'if(fo9>4.5)transformed.y-=step(.49,position.y)*(.05+.08*sv9)*(.5+position.x);}'+ // LAME : le toit en biais
        '\n#ifdef USE_INSTANCING\nvW9=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\nvW9=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif\n'+
        'vB9=(transformed.y+.5)*sc9.y;vSc9=sc9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+VILLE_TRI+'if(fl9.y<0.&&uHaut9<.5){gl_Position=vec4(0.,0.,2.,1.);loin9=true;}\n'+ // (banc) dbgVitre(\'haut\') : la ville d'en haut masquée (A/B du coût)
        '#ifdef USE_INSTANCING\nbool proche9=false;{vec3 w9=(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;float r9=.5*length(sc9)+1.;'+
        'for(int i=0;i<4;i++)if(distance(w9,uLum9[i].xyz)<uLum9[i].w+r9)proche9=true;}\n#else\nbool proche9=true;\n#endif\n')
      .replace('#include <lights_lambert_vertex>','vLightFront=vec3(0.);vIndirectFront=vec3(0.);\nif(!loin9){\n'+VILLE_LLV+'\n}');
    sh.fragmentShader='#undef USE_SHADOWMAP\n'+sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uWet9,uNuit9,uSunK9,uClH9,uClT9;uniform vec3 uZen9,uMid9,uHor9,uSun9,uSunC9,uClL9,uClA9,uCam9,uPlf9,uSolR9;uniform vec4 uClK9;uniform vec2 uClD9,uClS9,uBand9;uniform sampler2D uCl9;'+DECL+SDF+(NE?'uniform vec3 uAcc9,uPiedC9;uniform float uPied9,uEmb9;':''))
      .replace('#include <fog_fragment>',(NE?VV_VERRE:VIT_VERRE)+'#include <fog_fragment>\n'+(NE?vvPied():vitrePied(true)));};
  m.customProgramCacheKey=function(){return NE?'toursVerreNeon2':VIT_PLAFOND?'toursVitre2':VIT_SOL?'toursVitre5':'toursVitre4';};m.dispose=function(){};
  return m;
}
/* (NÉON ET VERRE) LE PIED D'UNE GÉANTE DE VERRE, dans la brume de la ville : le code de villePied (le même que les tours de béton, au caractère près),
   mais compté depuis le pied de la TOUR — ses retraits sont EMPILÉS : seul le volume du pied (vert + 8, voir buildVoxCity) a un pied à noyer. */
function vvPied(){return '{float vPd9=vPb9>.5?vB9:1e5;\n'+villePied(function(c){return c;}).split('vB9').join('vPd9')+'\n}';}
function vitreMatToursNeonLoin(){ // (NÉON ET VERRE) la géante AU LOIN (voir villeMatToursLoin) : la brume, et le pied du seul volume du pied — elle a sa couleur par instance
  if(VIT.mat.toursNL)return VIT.mat.toursNL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uWet9=ROAD_U.uWet;sh.uniforms.uPied9=CITY.uPied;sh.uniforms.uPiedC9=CITY.uPiedC;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vB9;varying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vB9=(position.y+.5)*length(instanceMatrix[1].xyz);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvB9=position.y+.5;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n'+
        '#ifdef USE_INSTANCING_COLOR\nif(instanceColor.g<7.5)vB9=1e5;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWet9,uPied9;uniform vec3 uPiedC9;varying float vB9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+villePied(function(c){return c;}));};
  m.customProgramCacheKey=function(){return 'toursLoinVerreNeon1';};m.dispose=function(){};
  VIT.mat.toursNL=m;return m;
}
/* LE PLAFOND (v2, Léo : « faire la ville avec le plafond de glace, l'effet miroir… une ville qui vient du ciel ; il n'y a même pas de ciel, juste
   un ciel entre les deux ») : une demi-sphère posée sur la caméra, peinte au plan lointain (comme le dôme), après le ciel et derrière tout le
   reste. Dans la BANDE (de l'horizon à ~4°, fondue jusqu'à ~15°) on voit le vrai ciel ; au-dessus, la MER DE NUAGES À L'ENVERS — le miroir de
   celle d'en bas —, devant laquelle pend la ville d'en haut. Le verre renvoie le MÊME plafond (même toile, même hauteur). */
function vitreCiel(){
  if(VIT.ciel)return VIT.ciel;
  vitreNuages();
  const g=new THREE.SphereGeometry(1,40,12,0,Math.PI*2,0,Math.PI*.5);
  const m=new THREE.ShaderMaterial({uniforms:{uCl:VIT.uCl,uClK:VIT.uClK,uClL:VIT.uClL,uClA:VIT.uClA,uClD:VIT.uClD,uClS:VIT.uClS,uClH:VIT.uClH,uClT:VIT.uClT,uSun:VIT.uSun,uHor:skyU.uJHor,uBand:VIT.uBand,uPlf:VIT.uPlf},
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}',
    fragmentShader:'uniform sampler2D uCl;uniform vec4 uClK;uniform vec3 uClL,uClA,uSun,uHor,uPlf;uniform vec2 uClD,uClS,uBand;uniform float uClH,uClT;varying vec3 vD;'+(!VIT_PLAFOND?
      /* CLEAN CITY : les cumulus de la v1 — un plafond à 1 400 m, deux lectures + une octave fine ; le verre lit LE MÊME */
      'void main(){vec3 d=normalize(vD);float dy=max(d.y,.008);vec2 cp=(cameraPosition.xz+d.xz*uClH/dy)/uClT+uClD;float c3=texture2D(uCl,cp*3.7+.31).r,c1=texture2D(uCl,cp).r*.78+c3*.22,c2=texture2D(uCl,cp+uClS).r*.78+c3*.2;'+
      'float hz=smoothstep(.008,.16,d.y),cov=smoothstep(uClK.x,uClK.y,c1)*uClK.z*hz;if(cov<.003)discard;'+
      'vec3 col=mix(uClA,uClL,clamp(.55+(c1-c2)*2.4,0.,1.));float sd=max(dot(d,uSun),0.);col+=uClL*pow(sd,12.)*.4*(1.-.6*smoothstep(uClK.x,uClK.y,c1));'+
      'col=mix(uHor,col,.25+.75*smoothstep(.01,.22,d.y));gl_FragColor=vec4(col,cov);}':
      'void main(){vec3 d=normalize(vD);float pl=smoothstep(uBand.x,uBand.y,d.y);if(pl<.003)discard;float dy=max(d.y,.02);vec2 cp=(cameraPosition.xz+d.xz*uClH/dy)/uClT+uClD;'+
      'float c3=texture2D(uCl,cp*3.7+.31).r,c1=texture2D(uCl,cp).r*.78+c3*.22,c2=texture2D(uCl,cp+uClS).r*.78+c3*.2,cv=smoothstep(uClK.x,uClK.y,c1)*uClK.z;'+ // la mer de nuages, vue d'en dessous : relief et creux
      'vec3 col=mix(uPlf,mix(uClA,uClL,clamp(.55+(c1-c2)*2.4,0.,1.)),cv);float sd=max(dot(d,uSun),0.);col+=uClL*pow(sd,10.)*.25;'+ // le soleil (dans la bande) l'allume par en dessous
      'col=mix(uHor,col,smoothstep(uBand.x,uBand.y+.12,d.y));gl_FragColor=vec4(col,pl);}'), // au bord de la bande, le plafond se fond dans la brume du ciel
    transparent:true,depthWrite:false,depthTest:true,fog:false,side:THREE.BackSide});
  m.customProgramCacheKey=function(){return VIT_PLAFOND?'vitreCiel2':'vitreCiel1';};
  const o=new THREE.Mesh(g,m);o.name='ville vitrée plafond';o.frustumCulled=false;o.renderOrder=-2;o.scale.setScalar(8000);o.visible=false;scene.add(o);VIT.ciel=o;return o;}
/* ⚠ three r128 n'envoie PAS `cameraPosition` aux matières Lambert (setProgram : seulement Shader/Phong/Toon/Standard ou avec envMap) — dans le
   verre il valait (0,0,0) : la direction du regard partait de l'origine du monde. La vraie caméra du rendu, posée avant chaque rendu de la scène. */
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);if(cam&&cam.matrixWorld)VIT.uCam.value.setFromMatrixPosition(cam.matrixWorld);};} // CHAÎNÉ (jamais réassigné)
/* LE DIRIGEABLE (CLEAN CITY, Léo : « une sorte d'avion-ballon, énorme, très moderne : le futur, l'avancement, la technologie ») : UN seul, blanc,
   lisse, une ligne de lumière BLEUE sur chaque flanc, ailerons fins, nacelle vitrée, un logo minimaliste (un anneau et un point, inventé).
   ~1 200 triangles, matières de base (Lambert, Basic : compilées au menu). Il croise au-dessus de la ville, DEVANT la caisse sur la
   piste (1,7 km devant, 130 m au-dessus, 200 m de côté), d'un côté puis de l'autre, et avance lentement ; une fois dépassé il reprend sa place loin devant (il réapparaît dans la brume). */
function vitreDirigeable(){
  if(VIT.dir)return VIT.dir;
  const g=new THREE.Group(),Lh=230,Rh=31,M=function(c,e){return new THREE.MeshLambertMaterial({color:c,emissive:e||0x000000});};
  const blanc=M(0xf2f5f9,0x0b0f16),gris=M(0xc9d0da),bleu=new THREE.MeshBasicMaterial({color:0x4cb6ff}),vitre=new THREE.MeshBasicMaterial({color:0x9fdcff});
  const rayon=function(u){return Rh*Math.pow(Math.max(0,Math.sin(Math.PI*u)),.62)*(1-.2*u);};
  const prof=[];for(let i=0;i<=16;i++){const u=i/16;prof.push(new THREE.Vector2(Math.max(.05,rayon(u)),(u-.5)*Lh));}
  const coque=new THREE.Mesh(new THREE.LatheGeometry(prof,20),blanc);coque.rotation.x=Math.PI/2;g.add(coque); // l'axe de la coque : +z (le nez devant… la queue au bout du profil)
  for(const sg of [-1,1]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,Lh*.62),bleu);b.position.set(sg*(Rh*.985),-2,Lh*.02);g.add(b); // la ligne de lumière
    const u=.62,r=rayon(u)+.6,an=new THREE.Mesh(new THREE.RingGeometry(9,12.5,32),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));an.position.set(sg*r,6,(u-.5)*Lh);an.rotation.y=sg*Math.PI/2;g.add(an); // le logo : un anneau…
    const pt=new THREE.Mesh(new THREE.CircleGeometry(3.6,20),bleu);pt.position.set(sg*(r+.2),6,(u-.5)*Lh);pt.rotation.y=sg*Math.PI/2;g.add(pt);} // …et un point
  const zq=-Lh*.41;
  for(const [sx,sy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=new THREE.Mesh(new THREE.BoxGeometry(sx?28:1.6,sx?1.6:28,26),gris);a.position.set(sx*(rayon(.09)+11),sy*(rayon(.09)+11),zq);g.add(a);} // les ailerons
  const nac=new THREE.Mesh(new THREE.BoxGeometry(12,6,40),blanc);nac.position.set(0,-Rh-1.5,14);g.add(nac); // la nacelle
  const fen=new THREE.Mesh(new THREE.BoxGeometry(12.3,1.6,34),vitre);fen.position.set(0,-Rh-1.2,14);g.add(fen); // ses vitres
  const nav=new THREE.Mesh(new THREE.SphereGeometry(1.8,8,6),bleu);nav.position.set(0,rayon(.1)+11+14,zq-6);g.add(nav);VIT.nav=nav; // le feu de navigation (bleu, il bat)
  g.traverse(function(o){if(o.isMesh){o.frustumCulled=false;o.matrixAutoUpdate=true;}});
  g.name='ville vitrée dirigeable';g.visible=false;scene.add(g);VIT.dir=g;
  VIT.Fd={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};VIT.dirS=null;VIT.dirC=0;VIT.dirT=0;return g;}
function vitreDirTick(d){
  const DZ9=CITY.dz&&CITY.dz.genre==='vitree'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) le dirigeable tiré : aucun, comme avant, haut, rasant
  if(DZ9&&!DZ9.dir){if(VIT.dir&&VIT.dir.visible)VIT.dir.visible=false;return;}
  const g=vitreDirigeable();g.visible=true;
  if(VIT.dirS==null||s>VIT.dirS-150||VIT.dirS>s+5200){VIT.dirS=Math.min(L-80,s+1700);VIT.dirC++;VIT.dirT=0; // dépassé (ou nouvelle piste) : loin devant, de l'autre côté
    VIT.dirY=0;if(VIT_SOL&&CITY.solY!=null&&VIT.tours){frameAt(VIT.dirS,VIT.Fd);const p9=VIT.Fd.p;let mx=CITY.solY+620; // (AU SOL) il croise AU-DESSUS des géantes qui l'entourent (jamais dans une tour)
      for(const t9 of VIT.tours){const dx=t9[0]-p9.x,dz=t9[1]-p9.z;if(dx*dx+dz*dz<520*520&&t9[5]+60>mx)mx=t9[5]+60;}VIT.dirY=mx;}}
  VIT.dirT+=d;frameAt(VIT.dirS,VIT.Fd);const F9=VIT.Fd,h=Math.hypot(F9.t.x,F9.t.z)||1,tx=F9.t.x/h,tz=F9.t.z/h,sg=(VIT.dirC%2)?1:-1;
  const lat9=DZ9?DZ9.dir[0]:200,dh9=DZ9?DZ9.dir[1]:0;
  g.position.set(F9.p.x-tz*sg*lat9+tx*VIT.dirT*7,(VIT.dirY||F9.p.y+130)+dh9+Math.sin(VIT.uT.value*.3)*3,F9.p.z+tx*sg*lat9+tz*VIT.dirT*7);
  g.rotation.set(0,Math.atan2(tx,tz),Math.sin(VIT.uT.value*.21)*.02);
  if(VIT.nav)VIT.nav.visible=(VIT.uT.value%1.6)<.25;
}
function vitreTick(dt,sim){
  villeVerreTick(dt); // (2026-10-18) LA VILLE, NÉON ET VERRE : le ciel que renvoient ses géantes de verre
  const on=vitreOn()&&!!CITY.root;
  VIT.solK+=((on?1:0)-VIT.solK)*Math.min(1,dt*1.2);if(VIT.solK<.001)VIT.solK=0; // le soleil de l'heure, fondu (lu par canyonSoleil)
  if(!on){if(VIT.ciel&&VIT.ciel.visible)VIT.ciel.visible=false;if(VIT.dir&&VIT.dir.visible)VIT.dir.visible=false;return;}
  const d=sim?dt:0;VIT.uT.value+=d;
  VIT.uSun.value.copy(SUN_DIR);VIT.uNuit.value=LVL.nuit||0;
  VIT.uSunC.value.set(sun.color.r,sun.color.g,sun.color.b).multiplyScalar(Math.min(1.6,sun.intensity));
  const M=VIT_MET[(LVL.cur&&LVL.cur.meteo)||VIT.met]||VIT_MET.midi,k=Math.min(1,dt*1.5+(VIT.neuf?1:0)),K=VIT.uClK.value;VIT.neuf=false; // (au portail : posé d'un coup, ensuite il glisse)
  const nu9=CITY.dz&&CITY.dz.genre==='vitree'?CITY.dz.nu:0; // (2026-10-20, LE DÉCOR AU HASARD) les nuages tirés : le seuil de couverture décalé
  K.x+=(M.k[0]+nu9-K.x)*k;K.y+=(M.k[1]+nu9-K.y)*k;K.z+=(M.k[2]-K.z)*k;VIT.uSunK.value+=(M.s-VIT.uSunK.value)*k;
  {const P=VIT.uPlf.value;P.x+=(M.p[0]-P.x)*k;P.y+=(M.p[1]-P.y)*k;P.z+=(M.p[2]-P.z)*k;} // la couleur du plafond
  const L=VIT.uClL.value,A=VIT.uClA.value;L.x+=(M.l[0]-L.x)*k;L.y+=(M.l[1]-L.y)*k;L.z+=(M.l[2]-L.z)*k;A.x+=(M.a[0]-A.x)*k;A.y+=(M.a[1]-A.y)*k;A.z+=(M.a[2]-A.z)*k;
  VIT.sol[0]+=(M.sol[0]-VIT.sol[0])*k;VIT.sol[1]+=(M.sol[1]-VIT.sol[1])*k; // le soleil de l'heure (posé par canyonSoleil)
  if(VIT_SOL){const g9=VIT_SOLC[(LVL.cur&&LVL.cur.meteo)||VIT.met]||VIT_SOLC.midi,C=VIT.uSolC.value;C.x+=(g9[0]-C.x)*k;C.y+=(g9[1]-C.y)*k;C.z+=(g9[2]-C.z)*k; // (AU SOL) les dalles de l'heure
    const sc=VIT.uSunC.value,z=skyU.uJZen.value,dy=Math.max(0,SUN_DIR.y)*.9,am=1-.82*(LVL.nuit||0),Lg=VIT.uSolL.value;Lg.set(sc.x*dy+(.36+z.x*.1)*am,sc.y*dy+(.37+z.y*.1)*am,sc.z*dy+(.38+z.z*.1)*am); // leur lumière : le soleil d'en haut, un ciel presque blanc (le bleu du zénith teintait tout en lavande)
    VIT.uSolR.value.set(C.x*Lg.x,C.y*Lg.y,C.z*Lg.z);} // ce que le verre renvoie vers le bas
  VIT.uClD.value.x+=d*.0016;VIT.uClD.value.y+=d*.0007; // le vent pousse les nuages (et leurs reflets avec eux)
  {const s=VIT.uSun.value,h=Math.hypot(s.x,s.z)||1;VIT.uClS.value.set(s.x/h*.012,s.z/h*.012);} // le côté au soleil : une lecture décalée vers lui
  const c=vitreCiel();c.visible=true;c.position.copy(camera.position);
  if(!VIT_PLAFOND)vitreDirTick(d);
}
function vitreChauffe(){ // au menu (chauffeDivers) : les trois matières de la VILLE VITRÉE compilées et dessinées une fois hors écran — 0 programme en course
  const L9=[],add=function(o){o.position.copy(camera.position);camera.getWorldDirection(VIT.v1);o.position.addScaledVector(VIT.v1,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(vitreGeo(),vitreMatTours(),1);im.setMatrixAt(0,VIT.m4.identity());im.setColorAt(0,VIT.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitreMatToursLoin(),1);im.setMatrixAt(0,VIT.m4.identity());add(im);}
  if(VIT_SOL){add(new THREE.Mesh(new THREE.PlaneGeometry(4,4).rotateX(-Math.PI/2),vitreSolMat()));const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitrePilMat(),1);im.setMatrixAt(0,VIT.m4.identity());add(im);} // (AU SOL) le sol et les piliers
  const c=vitreCiel();c.visible=true;L9.push(c);
  const dg=vitreDirigeable();dg.visible=true;dg.position.copy(camera.position);camera.getWorldDirection(VIT.v1);dg.position.addScaledVector(VIT.v1,300);L9.push(dg); // le dirigeable
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9){if(o===dg)dg.visible=false;else if(o===c)c.visible=false;else{scene.remove(o);if(o.geometry!==VIT.geo)o.geometry.dispose();}}
}
window.dbgVitre=function(k,v){ // console : l'état de la VILLE VITRÉE · ('nuages',{k:[…],l:[…],a:[…]}) les nuages de l'heure à chaud · ('ciel') cacher/montrer la couche
  if(k==='nuages'&&v){const M=VIT_MET[(LVL.cur&&LVL.cur.meteo)||'midi'];Object.assign(M,v);VIT.neuf=true;return M;}
  if(k==='tours'&&VIT.tours){const c=carGroup.position;return VIT.tours.filter(function(t){return v==null||t[3]===v;}).map(function(t){return [Math.round(t[0]),Math.round(t[1]),Math.round(t[2]),t[3],Math.round(Math.hypot(t[0]-c.x,t[1]-c.z)),Math.round(t[4]),+(((t[0]*.0131+t[1]*.0173)%1+1)%1).toFixed(5)];}).sort(function(a,b){return a[4]-b[4];}).slice(0,12);} // (banc) les tours les plus proches de la caisse (d'une forme)
  if(k==='progs')return (renderer.info.programs||[]).map(function(p){var k9=String(p.cacheKey).replace(/\n/g,' ');return (p.name||'')+' | '+k9.slice(0,40)+' … '+k9.slice(-90);}); // (banc) les programmes compilés (pour traquer une compilation en course)
  if(k==='haut'){VIT.uHaut.value=VIT.uHaut.value>.5?0:1;return VIT.uHaut.value;} // (banc) la ville d'en haut masquée / rendue (le loin, couleur de brume, reste)
  if(k==='dir'&&VIT.dir)return {p:VIT.dir.position.toArray().map(Math.round),visible:VIT.dir.visible,devant:VIT.dirS!=null?Math.round(VIT.dirS-s):null}; // (banc) où est le dirigeable
  if(k==='ciel'&&VIT.ciel){VIT.ciel.material.visible=!VIT.ciel.material.visible;return VIT.ciel.material.visible;}
  if(k==='sol')return {on:VIT_SOL,solY:CITY.solY!=null?Math.round(CITY.solY):null,ponts:vitreAplanir.ponts||0,piliers:VIT.pilN||0,dirY:Math.round(VIT.dirY||0),mort:mortCause,y:Math.round(carGroup.position.y)}; // (banc) la ville au sol
  if(k==='pts'){const o=[],st=v||4;for(let i=0;i<NP;i+=st)o.push([Math.round(pts[i].x),Math.round(pts[i].y),Math.round(pts[i].z)]);return {L:Math.round(L),NP:NP,pas:st,p:o};} // (banc) la route, un point sur `v`
  if(k==='rayon'){const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(v[0]/VP.w*2-1,1-v[1]/VP.h*2),camera);const L=[],M=new THREE.Matrix4(); // (banc) ce qu'il y a sous le pixel (x,y) : quelle pièce de quelle tour
    for(const F of CITY.fam||[])for(const im of [F.im,F.imL])for(const h of rc.intersectObject(im).slice(0,4)){im.getMatrixAt(h.instanceId,M);const e=M.elements;L.push({im:im===F.im?'pres':'loin',fam:CITY.fam.indexOf(F),id:h.instanceId,d:Math.round(h.distance),
      taille:[Math.hypot(e[0],e[1],e[2]),Math.hypot(e[4],e[5],e[6]),Math.hypot(e[8],e[9],e[10])].map(Math.round),centre:[e[12],e[13],e[14]].map(Math.round)});}
    if(!L.length)for(const h of rc.intersectObjects(scene.children,true).slice(0,5))L.push({objet:h.object.name||h.object.type,parent:h.object.parent&&(h.object.parent.name||h.object.parent.type),d:Math.round(h.distance),visible:h.object.visible}); // pas une tour : quoi d'autre ?
    return L.sort(function(a,b){return a.d-b.d;}).slice(0,6);}
  return {on:vitreOn(),ville:!!CITY.root,deco:CITY.dz&&CITY.dz.genre==='vitree'?CITY.deco:null,meteo:LVL.cur&&LVL.cur.meteo,ciel:BIO.name,nuages:VIT.uClK.value.toArray().map(function(x){return +x.toFixed(2);}),eclat:+VIT.uSunK.value.toFixed(2),nuit:+VIT.uNuit.value.toFixed(2),
    couche:!!(VIT.ciel&&VIT.ciel.visible),ville9:CITY.n};};
/* ===== LA VILLE EMBELLIE (2026-10-20, Sacha : « apporter des améliorations visuelles à chaque map — des éléments, des textures, des lumières — sans que ce soit trop gourmand pour le téléphone ») =====
   LA VILLE reste LA VILLE : la nuit ROSE (intouchable, DA-CARCASH §3 bis), ses quatre temps, ses quatre teintes, sa piste au bit près — rien ici ne tire dans `rnd` ni dans `vr`
   (les rais ont leur générateur LOCAL `mulberry32(graine ^ 0x7A15E5)`). Cinq ajouts, tous DANS le rose et les couleurs de la teinte (l'accent `NEON[0]`, remappé avec elle) :
   · LES RAIS DE PROJECTEUR (pilier 2 · la lumière-vedette, pilier 4 · le détail vivant) : quelques faisceaux montent des toits lointains (380 à 1 100 m de la route, jamais dans le couloir) et
     balaient lentement le ciel — rose de la teinte (clé) et cyan #3EE8FF (remplissage), un sur sept en OR sodium (l'éclat CASH). UNE géométrie fusionnée (1 appel de dessin), UN programme de
     shader, zéro lumière : le tube est un cylindre ouvert dont le shader calcule l'épaisseur traversée (cœur clair, bords fondus), le balayage se fait au sommet d'après CITY.uT (zéro travail
     processeur par image) ; additifs, fondus de près (pas de grand voile près de l'œil) et de très loin ;
   · L'ÉCHO DES NÉONS DANS LE VERRE (pilier 3 · la matière) : dans les tours, le verre ÉTEINT renvoie des bandes verticales de la teinte et de cyan, plus fortes sous l'œil (la rue) que
     plus haut ; le noir plat des grandes baies devient un verre qui vit (palier MOYEN et RÉCENT — au palier ANCIEN le verre garde son ancien calcul) ;
   · LES ÉTAGES TECHNIQUES (pilier 3) : une tour haute sur deux et demie (40 %) porte, tous les 12 à 21 étages, une BANDE de LED continue (teinte, cyan ou, une fois sur cinq, or) : le rythme d'un
     vrai gratte-ciel, et ça se lit de loin quand les fenêtres se fondent en lueur ; mêmes bandes sur les géantes de verre (leur aplat prend des étages) ;
   · L'OR (pilier 5 · l'éclat CASH, rare) : une enseigne verticale sur dix passe à l'or sodium, un panneau holographique sur seize devient la pièce ₿ ; un rai sur sept est or.
   Budget : voir le rapport (calls / triangles / programmes mesurés). Paliers : `PAL.B.vilRaisPas` (pas de route entre deux rais, m) · `vilRaisSeg` (côtés du tube).
   `dbgVilleEmb()` (état) · `dbgVilleEmb('rais',0|1)` (montrer / cacher les rais) · `dbgVilleEmb('fac',0|1)` (écho et bandes des façades coupés / rendus). */
PAL.B.vilRaisPas=[3200,1900,1200];PAL.B.vilRaisSeg=[5,6,8]; /* [ANCIEN, MOYEN, RÉCENT] : ~5 · 8 · 13 rais sur 16 km de piste ; 5 · 6 · 8 côtés */
CITY.uEmb={value:1}; /* 1 = les façades embellies (écho du verre, étages techniques) · 0 = comme avant (banc) */
const VEMB={mat:null,mesh:null,n:0,tris:0,pos:[],cy:[.24,.91,1],or:[1,.78,.34]};
/* L'ÉCHO DANS LE VERRE (tours de béton — branche GTA, `gl9` = ce que le verre éteint renvoie) : à poser JUSTE APRÈS la déclaration de `gl9`. `ux9` : le long de la façade (m) ·
   bandes de 8 à 24 m, un quart d'entre elles seulement, en cloche (fondues aux bords) · `gr9` : fort sous l'œil (la rue et ses néons), nul 280 m plus haut. */
const VEMB_ECHO='float ux9=(an.x>an.z?vLoc9.z:vLoc9.x),bw9=8.+s2*16.,gb9=floor(ux9/bw9),hb9=fract(sin(gb9*12.9898+vSeed9*78.233)*43758.5453),sb9=sin(3.14159*fract(ux9/bw9)),'+
  'pk9=smoothstep(.5,.9,hb9)*sb9*sb9,gr9=smoothstep(280.,-140.,vW9.y-uCamE9.y);'+
  'gl9+=mix(uAcc9,vec3(.24,.91,1.),step(.5,fract(hb9*7.3)))*pk9*gr9*.38*(1.-.5*bur)*uEmb9;';
/* LES ÉTAGES TECHNIQUES (tours de béton) : dans le bloc des façades GTA (G9 = la nuit) — une tour sur 2,5 (s4 < .40, l'autre bloc, s4 > .8, porte déjà les LED des arêtes), de plus de 110 m.
   Période np étages, le filet en fait 0,8 (et son halo ~1,5) ; la hauteur se lit depuis le pied du volume (les retraits emboîtés partagent le pied : mêmes étages). Au loin (la bande sous le pixel) : sa moyenne. */
const VEMB_BANDE='if(s4<.40&&vSc9.y>110.){float np=12.+floor(s2*10.),yy9=vB9/(cel.y*np),fy9=max(fwidth(yy9),1e-5),dq=abs(fract(yy9+.5)-.5),hbd=.4/np;'+
  'float lb=1.-smoothstep(hbd,hbd+fy9*1.5,dq);lb=mix(lb,2.*hbd,smoothstep(.4,1.5,fy9));lb+=.20*exp(-dq*np/1.2)*(1.-smoothstep(.4,1.5,fy9));'+ /* un filet de 0,8 étage et son halo (~1,5 étage) : une LED, pas un panneau */
  'vec3 bc9=s5>.8?vec3(1.,.78,.34):mix(uAcc9,vec3(.24,.91,1.),step(.5,s5));gl_FragColor.rgb+=bc9*lb*1.05*uCour9*G9*uEmb9;}';
/* LES RAIS — la matière : un tube ouvert (cos, sin, t) dont le sommet pose le rai (pied `aB.xyz`, longueur `aB.w`, inclinaison `aP.x`, phase `aP.y`, vitesse `aP.z`, couleur `aP.w`),
   le balayage : un cône lent autour de la verticale (+ un léger tangage). Au pixel : l'épaisseur traversée (1 au milieu du tube, 0 au bord), un cœur qui s'éteint avec la hauteur. */
function villeRaisMat(){
  if(VEMB.mat)return VEMB.mat;
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    uniforms:{uT:CITY.uT,uCa:{value:new THREE.Vector3(1,.25,.78)},uCb:{value:new THREE.Vector3(.24,.91,1)},uCg:{value:new THREE.Vector3(1,.78,.34)},uK:{value:1}},
    vertexShader:'attribute vec4 aB;attribute vec4 aP;uniform float uT;varying vec3 vR,vD,vW;varying float vT,vK;'+
      'void main(){float az=aP.y+uT*aP.z,tl=aP.x+.05*sin(uT*.17+aP.y*3.);vec3 d=vec3(sin(tl)*cos(az),cos(tl),sin(tl)*sin(az));'+
      'vec3 u=normalize(cross(d,vec3(0.,0.,1.))),v=cross(d,u);float t=position.z;vec3 rad=u*position.x+v*position.y;'+
      'vec3 w=aB.xyz+d*(aB.w*t)+rad*mix(4.,40.,t);vR=rad;vD=d;vW=w;vT=t;vK=aP.w;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}',
    fragmentShader:'uniform vec3 uCa,uCb,uCg;uniform float uK;varying vec3 vR,vD,vW;varying float vT,vK;'+
      'void main(){vec3 V=cameraPosition-vW;float dist=length(V);V/=dist;vec3 Vp=V-vD*dot(V,vD);float lp=length(Vp);'+
      'float c=abs(dot(normalize(vR),Vp))/max(lp,1e-3);'+ /* l'épaisseur du tube traversée par le regard : 1 au milieu, 0 au bord */
      'float len=1.-vT,a=pow(c,1.7)*pow(len,1.25)*smoothstep(0.,.05,vT)*smoothstep(.04,.3,lp)*smoothstep(240.,720.,dist)*(1.-.65*smoothstep(1400.,3000.,dist));'+
      'vec3 col=vK<.5?uCa:vK<1.5?uCb:uCg;gl_FragColor=vec4(col*(.55+.9*len*len),a*.42*uK);}'});
  m.customProgramCacheKey=function(){return 'villeRais1';};m.dispose=function(){}; /* partagé : le rebuild d'une piste ne le jette pas (comme les matières de la ville) */
  VEMB.mat=m;return m;
}
function villeRaisGeo(R){ /* R : x, y, z (le pied), longueur, inclinaison, phase, vitesse, couleur — par rai (8 nombres) */
  const n=R.length/8,seg=PAL.b('vilRaisSeg',8),nv=n*seg*2,P=new Float32Array(nv*3),B=new Float32Array(nv*4),Q=new Float32Array(nv*4),I=[];
  for(let k=0;k<n;k++){const o=k*8,v0=k*seg*2;
    for(let j=0;j<seg;j++){const a=j/seg*6.283185,ca=Math.cos(a),sa=Math.sin(a);
      for(let r=0;r<2;r++){const v=v0+j*2+r;P[v*3]=ca;P[v*3+1]=sa;P[v*3+2]=r;B[v*4]=R[o];B[v*4+1]=R[o+1];B[v*4+2]=R[o+2];B[v*4+3]=R[o+3];Q[v*4]=R[o+4];Q[v*4+1]=R[o+5];Q[v*4+2]=R[o+6];Q[v*4+3]=R[o+7];}}
    for(let j=0;j<seg;j++){const a=v0+j*2,b=v0+((j+1)%seg)*2;I.push(a,b,a+1,b,b+1,a+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aB',new THREE.BufferAttribute(B,4));g.setAttribute('aP',new THREE.BufferAttribute(Q,4));g.setIndex(I);
  return g;}
function villeRaisChauffe(){ /* un rai de rien, pour compiler le programme au menu (voir villeChauffe) — 0 programme compilé en course */
  const o=new THREE.Mesh(villeRaisGeo([0,0,0,100,0,0,0,0]),villeRaisMat());o.frustumCulled=false;return o;}
/* LA POSE (appelée par buildVoxCity, une fois la ville bâtie) : le long de la piste, une station tous les `pas` mètres ; à chacune, un toit HAUT (≥ 180 m) à 380-1 100 m de l'axe et au plus
   520 m au-dessus de la route (le rai se lit depuis la route, il part d'un toit qu'on voit), pas deux rais à moins de 300 m l'un de l'autre. Hasard LOCAL : la piste et la ville ne bougent pas. */
function villeRais(root,seed,corps,genre,NEON){
  VEMB.mesh=null;VEMB.n=0;VEMB.tris=0;VEMB.pos=[];
  if(!(NP>1)||!(L>0))return;
  const pas=PAL.b('vilRaisPas',1200),rg=mulberry32(((seed|0)^0x7A15E5)>>>0),tops=new Map();
  for(let i=0;i<genre.length;i++){if(genre[i]!==0)continue;const o=i*6,h=corps[o+4];if(h<180)continue; /* les retraits d'une tour partagent son centre : on garde le plus haut (le toit de la tour) */
    const top=corps[o+1]+h/2,k=Math.round(corps[o])+','+Math.round(corps[o+2]),a=tops.get(k);if(!a||top>a[1])tops.set(k,[corps[o],top,corps[o+2]]);}
  const T9=Array.from(tops.values()),R=[],ns=Math.max(1,Math.round(L/pas));
  for(let k=0;k<ns;k++){
    const ip=Math.min(NP-1,Math.max(0,Math.floor(((k+.5+(rg()-.5)*.5)/ns)*(NP-1)))),p=pts[ip],C=[];
    for(let pass=0;pass<2&&!C.length;pass++){const d0=pass?300:380,d1=pass?1500:1100,hMin=pass?-40:30;
      for(const t of T9){const dx=t[0]-p.x,dz=t[2]-p.z,d2=dx*dx+dz*dz,dy=t[1]-p.y;if(d2<d0*d0||d2>d1*d1||dy<hMin||dy>520)continue;
        let ok=true;for(let q=0;q<R.length;q+=8){const ex=R[q]-t[0],ez=R[q+2]-t[2];if(ex*ex+ez*ez<300*300){ok=false;break;}}if(ok)C.push(t);}}
    if(!C.length){rg();rg();rg();rg();rg();continue;}
    const t=C[(rg()*C.length)|0],kd=(k%7===3)?2:(rg()<.5?0:1); /* l'OR : un rai sur sept (le 4e, le 11e…) — le reste, la teinte (clé) ou le cyan (remplissage) */
    R.push(t[0],t[1]+1,t[2],1300+rg()*500,(8+rg()*12)*Math.PI/180,rg()*6.2832,(.022+rg()*.05)*(rg()<.5?-1:1),kd);}
  if(!R.length)return;
  const m=villeRaisMat(),U=m.uniforms,a=NEON[0];U.uCa.value.set(Math.min(1,a.r*1.05),Math.min(1,a.g*1.05),Math.min(1,a.b*1.05)); /* la clé : l'accent de la teinte (NEON[0] : magenta, ou son remappage) */
  U.uCb.value.set(VEMB.cy[0],VEMB.cy[1],VEMB.cy[2]);U.uCg.value.set(VEMB.or[0],VEMB.or[1],VEMB.or[2]);
  const g=villeRaisGeo(R),me=new THREE.Mesh(g,m);me.frustumCulled=false;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=2;me.name='ville rais';
  root.add(me);trackMeshes.push(me);VEMB.mesh=me;VEMB.n=R.length/8;VEMB.tris=g.index.count/3;for(let q=0;q<R.length;q+=8)VEMB.pos.push([Math.round(R[q]),Math.round(R[q+1]),Math.round(R[q+2]),R[q+7]]);
}
window.dbgVilleEmb=function(k,v){
  if(k==='rais'&&VEMB.mesh)VEMB.mesh.visible=v==null?!VEMB.mesh.visible:!!v;
  if(k==='fac')CITY.uEmb.value=v==null?(CITY.uEmb.value?0:1):+v;
  return {rais:VEMB.n,visible:!!(VEMB.mesh&&VEMB.mesh.visible),triangles:VEMB.tris,fac:CITY.uEmb.value,palier:PAL.n,pas:PAL.b('vilRaisPas',0),cotes:PAL.b('vilRaisSeg',0),pos:VEMB.pos,
    programmes:renderer.info.programs?renderer.info.programs.length:null,ville:CITY.n};};
/* ======================= LA PLUIE D'ARGENT v2 — `PLA` (2026-10-13, Léo : « ramène la pluie d'argent, et augmente la qualité ») =======================
   L'averse de glyphes (startMoneyRain : des « $ € ¥ » en sprites, 3 s) ne tombait plus que passé 4 000 $ × ECO3.gain dans UNE partie — on ne
   la voyait plus. Elle revient en VRAIS objets : les billets de la pluie de richesse (la série de sept couleurs, recto dessiné, + le billet
   ₿ de CRYPTOCITY) qui tombent en FEUILLE MORTE ou en CULBUTE et se courbent dans l'air, des pièces ₿ et Ξ en métal qui voilent et FLASHENT
   au soleil, des confettis verts et or. Tout est calculé par la puce : chaque objet a sa place (aO) et son caractère (aR) une fois pour
   toutes ; le sommet calcule la chute, le vent, la rotation, la flexion et la lumière (soleil, ciel, reflet), et replie l'objet dans une
   BOÎTE de 120 × 70 × 160 m qui suit la caméra (le monde est rempli à l'infini, on traverse le rideau à n'importe quelle vitesse) ; les bords
   de la boîte et l'objectif fondent l'objet en trame (aucun tri, aucune transparence). Deux appels de dessin, zéro calcul par objet et par
   image. `PLA.dens` (0 → 1, une part des objets) : à CRYPTOCITY une pluie de fond (.5), une AVERSE (1) à chaque NOUVEL ATH et à chaque
   pièce géante traversée ; ailleurs elle remplace l'averse de glyphes (même déclencheur : startMoneyRain). */
const PLA={N:ALLEGE?900:1400,NP:ALLEGE?220:360,B:new THREE.Vector3(120,70,160),dens:0,surge:0,mB:null,mP:null,u:null,c:new THREE.Vector3(),f:new THREE.Vector3()};
PAL.B.memTexBillets=[.5,1,1]; // (2026-10-14, passe perf mobile) l'échelle de l'atlas des billets de la PLUIE : 1024 × 384 au palier ancien (un billet qui tombe fait quelques dizaines de pixels à l'écran) — 8,4 Mo de puce → 2,1 Mo ; paliers 1-2 : 2048 × 768 comme avant
function plaTexBillets(){ // l'atlas 4 × 3 : la série des sept billets (pluie de richesse) + le billet ₿ · la rangée du bas : les confettis
  if(PLA.texB)return PLA.texB;
  const kT=PAL.b('memTexBillets',1),cv=document.createElement('canvas');cv.width=2048*kT;cv.height=768*kT;const x=cv.getContext('2d');if(kT!==1)x.scale(kT,kT); // (2026-10-14, passe perf mobile) même dessin, mêmes coordonnées, toile taillée au palier
  for(let k=0;k<8;k++){let t=null;try{t=k<7?richTexBillet(RICH_BILLETS[k%RICH_BILLETS.length]):plaBilletBtc();}catch(e){} // (2026-10-16) la série a 5 billets : les cases restantes la répètent
    if(t&&t.image)x.drawImage(t.image,(k%4)*512,Math.floor(k/4)*256+10,512,236);if(t&&t.image)toileRend(t.image);if(t&&t.dispose)t.dispose();} // (2026-10-14, passe perf mobile) les 8 toiles de travail 512 × 236 (3,9 Mo) rendues tout de suite : elles ne vont jamais à la puce
  ['#2bff88','#ffd23e','#ffffff','#ff9a2e'].forEach(function(c,i){const g=x.createLinearGradient(i*512,512,i*512+512,768);g.addColorStop(0,c);g.addColorStop(1,'#ffffff');x.fillStyle=c;x.fillRect(i*512+40,552,432,176);x.globalAlpha=.35;x.fillStyle=g;x.fillRect(i*512+40,552,432,60);x.globalAlpha=1;});
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;PLA.texB=texLibere(t);return t; // (2026-10-14, passe perf mobile) 2048 × 768 : 6,3 Mo rendus après l'envoi (paliers 0-1)
}
function plaBilletBtc(){ // le billet de CRYPTOCITY : vert billet et or, un ₿ dans la rosace, « 1 BITCOIN »
  return richCv(512,236,function(x,w,h){
    const G=x.createLinearGradient(0,0,w,h);G.addColorStop(0,'#0a3a1c');G.addColorStop(.55,'#127a3a');G.addColorStop(1,'#0c4f26');x.fillStyle=G;x.fillRect(0,0,w,h);
    x.strokeStyle='rgba(160,255,200,.12)';x.lineWidth=1;for(let k=0;k<26;k++){x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2+Math.sin(i*.03+k*.5)*h*.42*Math.sin(k*.21+1));x.stroke();}
    x.strokeStyle='rgba(255,215,94,.6)';x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.lineWidth=1;x.strokeRect(18,18,w-36,h-36);
    for(let i=0;i<14;i++){x.strokeStyle='rgba(255,215,94,'+(.07+i*.014)+')';x.beginPath();x.arc(118,118,62-i*4,0,6.2832);x.stroke();}
    cryptoPicto(x,'btc',118,118,92,'#ffb347');
    x.fillStyle='rgba(255,236,170,.9)';x.font='44px "Press Start 2P",monospace';x.textAlign='left';x.textBaseline='middle';x.fillText('1',30,48);x.textAlign='right';x.fillText('1',w-30,h-44);
    x.font='14px "Press Start 2P",monospace';x.textAlign='center';x.fillStyle='rgba(255,236,170,.85)';x.fillText('CASH CAR',w*.6,h*.42); /* (2026-10-14, revue des idées de Léo) le niveau CRYPTOCITY est retiré : le billet ₿ de la pluie d'argent, lui, pleut partout — il porte la marque du jeu */
    x.font='7px "Press Start 2P",monospace';x.fillStyle='rgba(200,255,220,.6)';x.fillText('1 BITCOIN · TO THE MOON',w*.6,h*.56);
    const Bd=x.createLinearGradient(w*.78,0,w*.86,0);Bd.addColorStop(0,'rgba(255,215,94,0)');Bd.addColorStop(.5,'rgba(255,230,140,.55)');Bd.addColorStop(1,'rgba(255,215,94,0)');x.fillStyle=Bd;x.fillRect(w*.78,0,w*.08,h);});
}
function plaTexPieces(){ // l'atlas des pièces : en haut la ₿ (la pièce de la pluie de richesse), en bas l'Ξ d'argent bleuté
  if(PLA.texP)return PLA.texP;
  const cv=document.createElement('canvas');cv.width=512;cv.height=512;const x=cv.getContext('2d');
  try{const b=richTexBtc();x.drawImage(b[0].image,0,0,512,256);for(const t of b){toileRend(t.image);t.dispose();}}catch(e){x.fillStyle='#e8a030';x.fillRect(0,0,512,256);}
  x.fillStyle='#9aa6c8';x.fillRect(0,256,512,256);
  for(const cx of [128,384]){const cy=256+122,R=120;const G=x.createRadialGradient(cx-38,cy-40,10,cx,cy,R);G.addColorStop(0,'#f4f7ff');G.addColorStop(1,'#7c88b0');x.fillStyle=G;x.beginPath();x.arc(cx,cy,R,0,6.283);x.fill();
    x.lineWidth=8;x.strokeStyle='rgba(255,255,255,.4)';x.beginPath();x.arc(cx,cy,R*.95,0,6.283);x.stroke();
    const O=x.createRadialGradient(cx-25,cy-23,8,cx,cy,R*.79);O.addColorStop(0,'#8f7dff');O.addColorStop(1,'#3b2fa8');x.fillStyle=O;x.beginPath();x.arc(cx,cy,R*.79,0,6.283);x.fill();
    cryptoPicto(x,'eth',cx,cy,150,'#eef1ff');}
  x.fillStyle='#c9d2ee';x.fillRect(0,500,512,12);x.fillStyle='#e8b048';x.fillRect(0,244,512,12);for(let i=0;i<512;i+=8){x.fillStyle='rgba(40,28,8,.3)';x.fillRect(i,244,4,12);x.fillStyle='rgba(30,30,60,.3)';x.fillRect(i,500,4,12);}
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;PLA.texP=t;return t;
}
// une PIÈCE : deux faces (le disque gauche de l'atlas en haut, le droit en bas… de sa moitié) et la tranche — faces perpendiculaires à y
function plaGeoPiece(seg,ep){
  const P=[],N=[],U=[],h=ep/2,face=function(y,ny,cu){const cx=cu,cy=.523,ru=.234,rv=.469,s=ny>0?-1:1,su=ny>0?1:-1; // (le dessus tourné vers le haut, le dessous vers le bas ; aucune face en miroir)
    for(let i=0;i<seg;i++){const a0=i/seg*6.2832,a1=(i+1)/seg*6.2832;
      P.push(0,y,0,Math.cos(a0),y,Math.sin(a0)*s,Math.cos(a1),y,Math.sin(a1)*s);
      for(let k=0;k<3;k++)N.push(0,ny,0);
      U.push(cx,cy,cx+Math.cos(a0)*ru*su,cy+Math.sin(a0)*rv*su,cx+Math.cos(a1)*ru*su,cy+Math.sin(a1)*rv*su);}};
  face(h,1,.25);face(-h,-1,.75);
  for(let i=0;i<seg;i++){const a0=i/seg*6.2832,a1=(i+1)/seg*6.2832,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    P.push(c0,h,s0,c1,-h,s1,c0,-h,s0,c0,h,s0,c1,h,s1,c1,-h,s1);
    N.push(c0,0,s0,c1,0,s1,c0,0,s0,c0,0,s0,c1,0,s1,c1,0,s1);
    const u0=i/seg,u1=(i+1)/seg;U.push(u0,.04,u1,.005,u0,.005,u0,.04,u1,.04,u1,.005);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  g.computeBoundingSphere();return g;
}
function plaInstances(base,n,piece){ // la géométrie instanciée : aO = la place dans la boîte + la phase · aR = vitesse, culbute, taille, case de l'atlas
  const g=new THREE.InstancedBufferGeometry();g.index=base.index;for(const k in base.attributes)g.setAttribute(k,base.attributes[k]);
  const aO=new Float32Array(n*4),aR=new Float32Array(n*4),rnd=mulberry32(piece?0xC01A5:0xB1115);
  for(let i=0;i<n;i++){aO[i*4]=rnd();aO[i*4+1]=rnd();aO[i*4+2]=rnd();aO[i*4+3]=rnd();
    const conf=!piece&&rnd()<.24; // un sur quatre : un confetti
    aR[i*4]=.6+rnd()*.8;aR[i*4+1]=rnd();
    aR[i*4+2]=piece?.62+rnd()*.38:conf?.16+rnd()*.12:1.45+rnd()*.7; // la taille : un billet 1,45-2,15 m (lisible en course), une pièce 0,62-1 m de rayon
    aR[i*4+3]=piece?(rnd()<.62?0:1):conf?8+((rnd()*4)|0):(rnd()<.2?7:(rnd()*7)|0);} // la case : pièce ₿/Ξ · billets 0-7 · confettis 8-11
  g.setAttribute('aO',new THREE.InstancedBufferAttribute(aO,4));g.setAttribute('aR',new THREE.InstancedBufferAttribute(aR,4));g.instanceCount=n;
  return g;
}
const PLA_VS=
  'uniform float uT9,uDens9,uFall9;uniform vec3 uC9,uB9,uSunD9,uSunC9,uAmb9,uGnd9;attribute vec4 aO,aR;varying vec3 vLit9,vSpec9;varying float vFade9;\n'+
  'mat3 rX9(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 rY9(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}mat3 rZ9(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}\n';
const PLA_BEGIN=
  'float ph9=aO.w*6.2832,tt9=uT9*aR.x+ph9,cul9=step(.72,aR.y);'+
  'vec3 p9=aO.xyz*uB9+vec3(sin(tt9*.9)*2.4,-uFall9*(.78+.44*fract(aO.w*7.31))*uT9,cos(tt9*.7)*2.4);'+
  'vec3 rel9=mod(p9-uC9+.5*uB9,uB9)-.5*uB9,w9=uC9+rel9,e9=abs(rel9)/(.5*uB9);'+
  'float d9=distance(w9,cameraPosition);vFade9=(1.-smoothstep(.72,.97,max(e9.x,max(e9.y,e9.z))))*smoothstep(2.,5.5,d9)*step(fract(aO.w*91.7),uDens9);'+
  '\n#ifdef PIECE9\nmat3 R9=rY9(tt9*.4)*rX9(tt9*(5.+5.*aR.y)+ph9)*rZ9(.4*sin(tt9));vec3 lp9=position;\n'+
  '#else\nmat3 R9=rY9(tt9*.35+ph9)*rX9(mix(sin(tt9*.9)*.95,tt9*2.6,cul9))*rZ9(mix(cos(tt9*.8)*.5,tt9*.7,cul9));vec3 lp9=position;lp9.y+=sin(lp9.x*2.8+uT9*6.+ph9)*.07+lp9.x*lp9.x*.12*sin(tt9*1.3);\n#endif\n'+
  'vec3 transformed=w9+R9*(lp9*aR.z*step(.001,vFade9));\n'+
  'vec3 n9=normalize(R9*normal),v9=normalize(cameraPosition-w9);if(dot(n9,v9)<0.)n9=-n9;'+
  'float l9=dot(n9,uSunD9);'+
  '\n#ifdef PIECE9\nvLit9=uAmb9*mix(.55,1.,n9.y*.5+.5)+uGnd9*.25+uSunC9*max(l9,0.);vec3 h9=normalize(uSunD9+v9);vSpec9=uSunC9*(pow(max(dot(n9,h9),0.),70.)*3.2+pow(max(dot(n9,h9),0.),8.)*.25);\n'+
  '#else\nvLit9=uAmb9*mix(.6,1.,n9.y*.5+.5)+uGnd9*.2+uSunC9*(max(l9,0.)+max(-l9,0.)*.35);vec3 h9=normalize(uSunD9+v9);vSpec9=uSunC9*pow(max(dot(n9,h9),0.),24.)*.22;\n#endif\n'+
  /* (2026-10-15, Sacha : « les particules d'argent, de crypto, en mode confettis m'apparaissent en NOIR ») LE PLANCHER DE LUMIÈRE. La pluie
     ne vivait QUE de la lumière de la scène : de nuit (ville × nuit, mesuré au banc) soleil et ciel tombent presque à zéro, billets, pièces ₿/Ξ
     et confettis sortaient en silhouettes NOIRES — et Léo, qui la voyait de jour, en couleurs. Comme les pièces de la route (pickMat ÉMET),
     ce qui rapporte garde sa couleur : on ajoute le BLANC qui manque pour que la lumière reçue ne descende jamais sous .8 de luminance.
     De jour (soleil + ciel bien au-dessus), rien ne change. */
  '{float lu9=dot(vLit9,vec3(.299,.587,.114));vLit9+=vec3(max(0.,.8-lu9));}\n';
const PLA_UV=
  '#ifdef USE_UV\n#ifdef PIECE9\nvUv.y=vUv.y*.5+.5-.5*step(.5,aR.w);\n#else\n{float c9=aR.w;vUv=(vUv+vec2(mod(c9,4.),2.-floor(c9/4.)))/vec2(4.,3.);}\n#endif\n#endif\n';
function plaMat(piece){
  const m=new THREE.MeshBasicMaterial({map:piece?plaTexPieces():plaTexBillets(),side:THREE.DoubleSide,alphaTest:piece?0:.5});
  m.defines=piece?{PIECE9:''}:{};
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,PLA.u);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+PLA_VS).replace('#include <begin_vertex>',PLA_BEGIN)
    sh.vertexShader=sh.vertexShader.replace('#include <morphtarget_vertex>',PLA_UV+'#include <morphtarget_vertex>');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLit9,vSpec9;varying float vFade9;')
      .replace('#include <alphatest_fragment>','if(vFade9<fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))))discard;\n#include <alphatest_fragment>\ndiffuseColor.rgb*=vLit9;')
      .replace('#include <envmap_fragment>','#include <envmap_fragment>\noutgoingLight+=vSpec9;');};
  m.customProgramCacheKey=function(){return piece?'plaPiece1':'plaBillet1';};m.dispose=function(){};
  return m;
}
function plaInit(){
  if(PLA.mB)return;
  PLA.u={uT9:{value:0},uDens9:{value:0},uFall9:{value:2.6},uC9:{value:new THREE.Vector3()},uB9:{value:PLA.B},uSunD9:{value:new THREE.Vector3().copy(SUN_DIR)},
    uSunC9:{value:new THREE.Vector3(1,1,1)},uAmb9:{value:new THREE.Vector3(.5,.5,.5)},uGnd9:{value:new THREE.Vector3(.2,.2,.2)}};
  const gb=new THREE.PlaneGeometry(1,.46,6,1);gb.rotateX(-Math.PI/2); // le billet, couché (une feuille qui tombe), coupé en six pour se courber
  const mB=new THREE.Mesh(plaInstances(gb,PLA.N,false),plaMat(false));
  const mP=new THREE.Mesh(plaInstances(plaGeoPiece(14,.16),PLA.NP,true),plaMat(true));
  for(const m of [mB,mP]){m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.renderOrder=2;scene.add(m);}
  PLA.mB=mB;PLA.mP=mP;
}
function plaSurge(s){plaInit();PLA.surge=Math.max(PLA.surge,s||4);}
function plaTick(dt,sim){
  if(!PLA.mB){if(!(PLA.surge>0)&&!cryptoOn())return;plaInit();}
  const cr9=cryptoOn()&&started&&!gameOver,cible=PLA.surge>0?1:cr9?(CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz.pluie:.5):0; /* (2026-10-20, LE DÉCOR AU HASARD) la pluie de fond tirée : fine, normale, averse */
  if(sim){PLA.surge=Math.max(0,PLA.surge-dt);PLA.dens+=(cible-PLA.dens)*Math.min(1,dt*(cible>PLA.dens?2.2:.9));PLA.u.uT9.value+=dt;}
  if(!started||gameOver&&PLA.surge<=0)PLA.dens=Math.max(0,PLA.dens-dt*.8);
  const vis=PLA.dens>.004&&!PLA.off;PLA.mB.visible=PLA.mP.visible=vis;if(!vis)return; // PLA.off : le banc la coupe (dbgCrypto('sansPluie'))
  const U=PLA.u;U.uDens9.value=PLA.dens;
  camera.getWorldDirection(PLA.f);U.uC9.value.copy(camera.position).addScaledVector(PLA.f,PLA.B.z*.3);U.uC9.value.y+=PLA.B.y*.12;
  U.uSunD9.value.copy(sun.position).normalize();
  U.uSunC9.value.set(sun.color.r,sun.color.g,sun.color.b).multiplyScalar(sun.intensity*.85);
  U.uAmb9.value.set(hemi.color.r,hemi.color.g,hemi.color.b).multiplyScalar(hemi.intensity*.9);
  U.uGnd9.value.set(hemi.groundColor.r,hemi.groundColor.g,hemi.groundColor.b).multiplyScalar(hemi.intensity);
}
/* LA FIGURE SLIDE (2026-10-14 soir, Sacha via PILOTAGE : « quand on vient VRAIMENT de frotter contre le bord de la route, ça doit faire
   des ÉTINCELLES et rapporter de l'AURA en fonction de la VITESSE et de la DURÉE »). ⚠ Le jeu n'avait AUCUN contact avec le bord :
   le dépasser fait tomber la caisse. Le frottement, c'est donc le FLANC qui déborde de la route quand les roues tiennent encore
   (|lat| + demi-largeur > ROAD_HALF), plus serré que le RASE-BORD (80 % de la demi-route), plus les parois (murCote : couloirs du canyon…).
   · Tant qu'on frotte : étincelles OR au point de contact, côté bord, plus denses avec la vitesse ; l'aura MONTE (SLD.base + SLD.v × vitesse
     / vmax, par seconde) dans une petite étiquette « SLIDE +X » en haut (jamais au centre) ; la caisse perd un peu de vitesse (SLD.frein,
     la sanction : il n'y en avait pas au bord).
   · À la fin (SLD.lache s sans contact) : payée dans la CHAÎNE d'aura comme un geste (famille 'slide', brut) si on a frotté au moins
     SLD.tMin s. Explosion, replacement ou partie neuve : perdue (slideRaz).
   · Les COMBOS À TROIS sont des trios de figures d'un même VOL : un geste au sol n'y entre pas.
   · Le son : `sonSlide(etat,k)` ('debut' | 'tick' | 'fin', k = vitesse/vmax), livré par la session SON — muet tant qu'il n'existe pas.
   `?slide=0` l'éteint. Banc : dbgSlide() · dbgSlide('force',kmh) colle la caisse au bord à cette vitesse · dbgSlide('stop'). */
const MURC={psiK:0,psiR:0,chocT:0,murT:0,murAnn:0}; /* (2026-10-23, Paris retiré) l'état du coup d'épaule d'une paroi (était dans PARIS) */
const SLD={on:!/[?&]slide=0\b/.test(location.search),base:20,v:120,frein:.12,tMin:.35,lache:.15,kmhMin:40,
  t:0,hors:0,aura:0,cote:1,mur:0,etiq:null,force:0,son:false,k:0};
/* ===== HUD DE COURSE : N'ÉCRIRE QUE CE QUI CHANGE (2026-10-24, passe perf PC : « le navigateur passe ~4,6 ms par image dans le DOM ») =====
   `textContent=` remplace le nœud texte MÊME à valeur égale (mutation du DOM → recalcul de style, mise en page et peinture de
   l'étiquette), là où un style inline réécrit à l'identique ne coûte presque rien à Chrome. L'étiquette « SLIDE +X » se réécrivait à
   chaque image de frottement. `?pchud=0` rend l'ancienne écriture, pour l'A/B. */
const PCH_ON=!/[?&]pchud=0\b/.test(location.search);
function slideRaz(){SLD.t=0;SLD.hors=0;SLD.aura=0;SLD.mur=0;if(SLD.son){SLD.son=false;try{sonSlide('fin',0);}catch(e){}}if(SLD.etiq)SLD.etiq.style.opacity='0';}
function slideEtiq(){let e=SLD.etiq;if(!e){e=SLD.etiq=document.createElement('div');e.id='slideHud';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}return e;}
function slideTick(dt){ // boucle de conduite, chaque image, après le RASE-BORD
  if(!SLD.on)return;
  const w=CARS[level].w*.5,va=Math.abs(vA),kmh=va*3.6*SPD;
  if(SLD.force>0){lat=(Math.sign(lat)||1)*(ROAD_HALF-w+.12);vA=Math.sign(vA||1)*SLD.force/(3.6*SPD);graceT=Math.max(graceT,.2);}
  SLD.mur=Math.max(0,SLD.mur-dt);
  const bord=Math.abs(lat)+w>ROAD_HALF-.02&&Math.abs(lat)<ROAD_HALF,contact=!introD&&!PARK.on&&hopY<=.05&&kmh>SLD.kmhMin&&(bord||SLD.mur>0);
  if(contact){
    SLD.hors=0;SLD.t+=dt;SLD.cote=Math.sign(lat)||1;
    const k=SLD.k=Math.max(0,Math.min(1.3,kmh/Math.max(1,vmaxShow())));
    SLD.aura+=(SLD.base+SLD.v*k)*dt;
    if(!SLD.mur)vA*=1-SLD.frein*dt; // la sanction : le flanc frotte (les façades de Paris ont la leur)
    if(Math.random()<dt*(14+46*k)){DRIFT_V.set(SLD.cote*w,.15,(Math.random()-.5)*CARS[level].l*.6);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1+(k>.6?1:0),5+9*k);}
    try{if(!SLD.son){SLD.son=true;sonSlide('debut',k);}else sonSlide('tick',k);}catch(e){}
    if(SLD.t>=SLD.tMin){const e=slideEtiq();if(!PCH_ON){e.textContent='SLIDE +'+Math.round(SLD.aura);e.style.opacity='1';}else{const t9='SLIDE +'+Math.round(SLD.aura);if(e._t!==t9){e._t=t9;e.textContent=t9;}if(e.style.opacity!=='1')e.style.opacity='1';}} /* (2026-10-24, passe perf PC) le texte n'est remplacé que s'il change (voir PCH_ON) */
    return;}
  if(SLD.t<=0)return;
  SLD.hors+=dt;if(SLD.hors<SLD.lache)return;
  const n=Math.round(SLD.aura),ok=SLD.t>=SLD.tMin&&n>0;slideRaz();
  if(ok){try{chaineAura('SLIDE',n,'slide',true,false);}catch(e){}try{sonSlide('paye',n);}catch(e){}hap([8,20,8]);} // (SON) 'paye' : le tchak du paiement ; 'fin' (slideRaz) : la queue du crissement
}
function slideContact(){SLD.mur=.12;} // le crochet des MURS : une paroi qui touche le flanc ce tour-ci (Paris, les couloirs du CANYON…) — à rappeler à chaque image de contact
window.slideContact=slideContact;
window.dbgSlide=function(k,v){if(k==='force')SLD.force=+v||200;if(k==='stop'){SLD.force=0;lat=0;vL=0;}
  return {on:SLD.on,t:+SLD.t.toFixed(2),aura:Math.round(SLD.aura),k:+SLD.k.toFixed(2),force:SLD.force,lat:+lat.toFixed(2),bord:+ROAD_HALF.toFixed(2),kmh:Math.round(Math.abs(vA)*3.6*SPD),mode:mode,vmax:Math.round(vmaxShow()),chaine:Math.round(CHA.pts||0),auraRun:Math.round(auraRun)};};
function murCote(dt,cause){ // LES FAÇADES SONT DES MURS : un CHOC par contact (vitesse perdue selon l'angle), puis on FROTTE (étincelles) — de face à pleine vitesse, on s'encastre
  const out=Math.sign(lat)||1,lim=ROAD_HALF-1.15;lat=out*lim;
  const into=vL*driveDir*out;if(into<=0)return;
  SLD.mur=.12; // (SLIDE) la façade frotte : la figure le sait
  const va=Math.abs(vA),a=Math.asin(Math.min(1,into/Math.max(1,va))),kmh=va*3.6*SPD,now=performance.now();
  if(a>.52&&kmh>200){impMur(out);explode(cause||'facade');return;} // (2026-10-15) L'IMPACT : la paroi est le bord de la route
  try{impMini(out,a,kmh,into);}catch(e){} // (2026-10-15 soir) L'IMPACT EN MINIATURE : le coup d'épaule, au premier contact (voir IMPM)
  /* (2026-10-17, session « Physique et gameplay fluides ») LE COUP D'ÉPAULE SANS TÉLÉPORTE : la paroi renvoyait le nez (−30 % du cap) et
     prenait jusqu'à 30 % de la vitesse en UNE image — 22° de cap d'un coup sur un choc à 17°, partout où la route a des murs (couloirs du
     canyon, bourrelets du glacier). Même renvoi, même perte : le cap y va en ~50 ms (MURC.psiR/psiK, appliqué par la conduite juste
     après le lacet), la vitesse en ~0,2 s (vFrein). Un renvoi en cours n'est pas recalculé par les images de contact qui suivent. */
  if(!(MURC.psiK>0)){MURC.psiR=-psi*.3;MURC.psiK=1;}yawR=0;slipB=0;vL=0;
  const choc=now-(MURC.chocT||0)>220;if(choc)MURC.chocT=now;       // (mesuré : perdre à CHAQUE image faisait tomber de 151 à 20 km/h en 3 s)
  if(choc)vFrein(1-Math.min(.3,.03+a*.9));else vA*=1-.3*(dt||.016);
  if(now-MURC.murT>90){MURC.murT=now;try{DRIFT_V.set(out*CARS[level].w*.5,.25,.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);noiseBurst(.1,.1+a*.3,2600);}catch(e){}
    shake=Math.max(shake,.12+a);hap(8);}
  if(now-MURC.murAnn>2500&&a>.12){MURC.murAnn=now;try{popTexte(TR('FROTTE !'),'#ffb36b',0);}catch(e){}}
}
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
  {nm:'vallee',  a:[32,62],R:[260,300],inv:.74,dr:[.3,70,160]},   // l'ancienne recette, gardée parmi les autres
  {nm:'serpent', a:[40,42],R:[280,140],inv:.88,dr:[.12,60,100]},  // des S serrés, presque sans répit (280 m : jamais plus serré que l'ancienne recette)
  {nm:'courbes', a:[34,40],R:[420,300],inv:.66,dr:[.25,100,160]},  // de grandes courbes qui se prennent à fond
  {nm:'derive',  a:[22,28],R:[340,240],inv:.25,dr:[.25,80,140]},   // la vallée tourne d'un côté jusqu'à la butée, puis revient : un grand biais
  {nm:'balcon',  a:[24,30],R:[340,260],inv:.6,dr:[.7,110,170]},    // de longues droites cassées de coudes : on voit loin
  {nm:'chicanes',a:[22,20],R:[280,80],inv:1,dr:[.06,40,70]}];     // gauche-droite-gauche, vite
const JADE_PENTE={seuil:.12,garde:.3}; // au-delà de 12 %, la pente n'est gardée qu'à 30 % (voir adoucirPentes)
function genJade(rnd){
  const ctrl=[];CAMPM.length=0;MODMARK.length=0;
  const phi0=(rnd()-.5)*1.5708; // l'AXE de la vallée, tourné au hasard (±45°) : le soleil bas du rouleau (SUN_DIR, derrière le départ) ne tombe plus toujours du même côté
  let P=new THREE.Vector3(0,0,0),phi=phi0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi)),push=()=>ctrl.push(P.clone());
  const droite=(l,nn)=>{nn=nn||Math.max(2,Math.round(l/100));for(let k=0;k<nn;k++){P.addScaledVector(dir(),l/nn);push();}};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;P.addScaledVector(dir(),ch);phi+=st/2;push();}};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi};};
  const LIM=85*Math.PI/180;
  const virages=(len,H)=>{let fait=0,sg=rnd()<.5?-1:1;
    while(fait<len){
      if(rnd()<H.inv)sg=-sg;                                      // le plus souvent un S : on serpente (la DÉRIVE, elle, insiste du même côté)
      let a=H.a[0]+rnd()*H.a[1];const R=rj?Math.max(jRm,(H.R[0]+rnd()*H.R[1])*.5):H.R[0]+rnd()*H.R[1];if(rj)a=a*1.25+6; // (2e tour) avec les modules : 2 × plus serré, 25 % plus tourné (jRm : jamais sous 1,4 × le rayon tenable)
      const lib=(LIM-sg*(phi-phi0))*57.2958;                      // ce qu'il reste avant la butée de cap (autour de l'axe), dans ce sens
      if(lib<22){sg=-sg;a=Math.min(a,(LIM-sg*(phi-phi0))*57.2958);}else a=Math.min(a,lib);
      arc(sg*a,R);fait+=R*a/57.2958;
      if(rnd()<H.dr[0]){const l=H.dr[1]+rnd()*H.dr[2],l9=rj?l*.4:l;droite(l9);fait+=l9;}}}; // (2e tour) les droites entre deux virages, 60 % plus courtes avec les modules
  let hPrec=-1;const humeur=()=>{let i=(rnd()*JADE_HUMEURS.length)|0;if(i===hPrec)i=(i+1+((rnd()*(JADE_HUMEURS.length-1))|0))%JADE_HUMEURS.length;hPrec=i;return JADE_HUMEURS[i];}; // jamais deux fois le même caractère de suite
  const tot0=5200+rnd()*3200,pa=[.75+rnd(),.75+rnd(),.75+rnd()],ps=pa[0]+pa[1]+pa[2]; // la longueur des virages, partagée au hasard entre les trois tronçons
  /* (LA DURÉE DES MAPS) au JOUER, les virages prennent ce qui reste de la longueur visée une fois posés le départ, les deux monuments et la
     ligne de la fin (`FX9` : ~2,4 km avec les modules, 3,2 sans), et les MODULES de Sacha (~1 km chacun : ils prennent leur longueur sur les
     tronçons, mais pas en dessous de la leur) — un seul au départ, les trois quand la longueur visée les tient (`jmN`) : la Porte, le Pont et
     l'effondrement ne raccourcissent pas. */
  const FX9=MODC_ON?2400:3200,MD9=MODC_ON?1000:0,LC9=longueurCible(),jmN=!LC9?3:Math.max(1,Math.min(3,Math.floor((LC9-FX9-900)/1000))),vir9=LC9?Math.max(900,LC9-FX9-jmN*MD9):0,chu9=LC9?Math.min(1000,Math.max(350,vir9*.12)):0,tot=LC9?vir9-chu9:tot0;
  const porte=()=>{{const a=(phi0-phi)*57.2958*.7;if(Math.abs(a)>4)arc(a,rj?300:520);} // (2e tour) avec les modules : l'alignement plus serré, les abords plus courts // la Porte se prend plutôt dans l'axe de la vallée
    droite(rj?130:380,4);ici('porte0');droite(520,6);ici('porte1');droite(rj?90:260,3);}; /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : abords plus courts */
  const pont=()=>{droite(rj?110:300,3);ici('pont0');droite(360,4);ici('pont1');droite(rj?80:200,2);};
  const monus=rnd()<.5?[porte,pont]:[pont,porte];               // la Porte d'abord, ou le Pont
  /* LES MODULES DE JADE (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). Un au cœur de chacun des trois tronçons de virages (après 40 à 60 %
     de sa longueur : jamais collé à la Porte ni au Pont), les trois chaque fois, dans un ordre tiré au hasard (`rj`, un seul tirage de plus) :
       jLacets  · LES LACETS DU DRAGON : 5-7 virages alternés de 34-49° à 190-250 m, sans une droite — la route de Tianmen
       jEpingle · L'ÉPINGLE DE LA FALAISE : un demi-tour de 150-166° à 200-240 m, pris d'une butée de cap à l'autre (la route avance toujours)
       jSommet  · LE DOUBLE SOMMET : deux grands appuis du même côté (145-165° en tout, R 250-300) et une droite entre — on contourne un pic
     Le cap reste dans ± LIM de l'axe : la vallée ne se recroise jamais ; rien ne change au relief (il se lit sur la longueur) ; le module prend sa longueur
     sur celle du tronçon (sans ça la vallée s'allongeait de moitié : banc). */
  const rj=MODC_ON?mulberry32((rnd()*4294967296)>>>0):null,jmPaq=JADE_MODULES?[0,1,2,3,4,5]:[0,1,2],jRm=Math.max(170,1.4*(typeof rayonPalier==='function'?rayonPalier():63));
  if(rj)for(let i=jmPaq.length-1;i>0;i--){const j=(rj()*(i+1))|0,x9=jmPaq[i];jmPaq[i]=jmPaq[j];jmPaq[j]=x9;} /* (2026-10-20) six sortes : le paquet de six, mélangé, en donne trois différentes (jamais deux fois la même) */
  const jCap=h=>{const d=(h-phi)*57.2958;if(Math.abs(d)>3)arc(d,Math.max(300,Math.min(520,Math.abs(d)*6)));}; // se mettre au cap h (radians)
  const jLacets=()=>{const n=5+((rj()*3)|0),a=34+rj()*15,R=Math.max(jRm,190+rj()*60);if(Math.abs(phi-phi0)>LIM-a/57.3*.6)jCap(phi0);let sg=phi-phi0>0?-1:1;arc(sg*a*.5,R);
    for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R);}arc(-sg*a*.5,R);};
  const jEpingle=()=>{const s9=phi-phi0>0?-1:1,a=150+rj()*16,R=Math.max(jRm,200+rj()*40);jCap(phi0-s9*a/2/57.2958);droite(80+rj()*60);arc(s9*a,R);droite(100+rj()*80);};
  const jSommet=()=>{const s9=phi-phi0>0?-1:1,T=145+rj()*20,a1=T*(.45+rj()*.1),R=Math.max(jRm,250+rj()*50);jCap(phi0-s9*T/2/57.2958);arc(s9*a1,R);droite(80+rj()*60);arc(s9*(T-a1),R*(.9+rj()*.15));};
  /* ===== TROIS MODULES DE PLUS (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
       jCorniche · LA CORNICHE : une grande courbe rapide de 55-80° (R 480-640 m, ≥ 1,6 × le rayon tenable), une droite, un contre-appui de 60 % — à fond
       jChicane  · LA CHICANE DU COL : gauche-droite-gauche (28 / 56 / 28° à 180-210 m), une courte droite, la même en miroir — la main, vite
       jDragon   · LE GRAND S DU DRAGON : trois arcs (+a, −2a, +a ; a = 60-75° à 220-260 m), pris dans l'axe de la vallée — on balance de tout son poids
     Le cap reste dans ± LIM de l'axe (chaque module s'y remet avant de partir si besoin) : la vallée ne se recroise jamais. */
  const jCorniche=()=>{if(Math.abs(phi-phi0)>LIM*.5)jCap(phi0);const s9=phi-phi0>0?-1:1,a=55+rj()*25,R=Math.max(jRm*1.6,480+rj()*160);arc(s9*a,R);droite(60+rj()*60);arc(-s9*a*.6,R*.9);};
  const jChicane=()=>{if(Math.abs(phi-phi0)>LIM-.6)jCap(phi0);const sg=phi-phi0>0?-1:1,R=Math.max(jRm,180+rj()*30);arc(sg*28,R);arc(-sg*56,R);arc(sg*28,R);droite(60+rj()*50);arc(-sg*28,R);arc(sg*56,R);arc(-sg*28,R);};
  const jDragon=()=>{jCap(phi0);const sg=rj()<.5?-1:1,a=60+rj()*15,R=Math.max(jRm,220+rj()*40);arc(sg*a,R);arc(-sg*2*a,R*1.05);arc(sg*a,R);};
  const jmJ=[jLacets,jEpingle,jSommet,jCorniche,jChicane,jDragon],JM_NOM=['lacets','épingle','sommet','corniche','chicane','dragon'],MK9=[];
  let jmK=0;const tronc=(len,H)=>{if(!rj||jmK>=jmN){virages(len,H);return;}jmK++;const f=.4+rj()*.2;virages(len*f,H);const i0=ctrl.length-1;const m9=jmPaq.shift();jmJ[m9]();MK9.push(JM_NOM[m9]);MODMARK.push({i0:i0,i1:ctrl.length-1});
    let lm=0;for(let k=i0+1;k<ctrl.length;k++)lm+=ctrl[k].distanceTo(ctrl[k-1]);virages(Math.max(0,len*(1-f)-lm),H);}; // le module prend SA longueur sur le tronçon : la vallée garde la sienne
  push();ici('depart');
  droite(rj?220:380,4); // (2e tour) le départ plus court avec les modules
  tronc(tot*pa[0]/ps,humeur());monus[0]();
  tronc(tot*pa[1]/ps,humeur());monus[1]();
  tronc(tot*pa[2]/ps,humeur());
  ici('chute');{const c9=700+rnd()*300;virages(LC9?chu9:c9,humeur());}droite(rj?420:650,7);ici('fin');droite(150,2); // (v14) LA FIN : les montagnes commencent à tomber autour (jadeChute), puis la ligne droite vers l'arrivée
  // LE RELIEF : des ondes lentes tirées au hasard (pente ramenée sous celle d'origine), aplanies sous les deux monuments (la Porte et le Pont se prennent à plat)
  const ph1=rnd()*6.283,ph2=rnd()*6.283,ph3=rnd()*6.283,L1=2600+rnd()*2400,L2=850+rnd()*900,L3=480+rnd()*360;
  let A1=35+rnd()*75,A2=10+rnd()*28,A3=rnd()<.5?5+rnd()*13:0;
  {const k9=Math.min(1,.30/(6.283*(A1/L1+A2/L2+A3/L3)));A1*=k9;A2*=k9;A3*=k9;} // .30 : le pire cas de l'ancienne recette (95 m sur 3,6 km + 32 m sur 1,3 km)
  let acc=0;const sOf=[0];for(let k=1;k<ctrl.length;k++){acc+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);sOf.push(acc);}
  const sDe=v=>{let bi=0,bd=1e18;for(let k=0;k<ctrl.length;k++){const d=(ctrl[k].x-v.x)**2+(ctrl[k].z-v.z)**2;if(d<bd){bd=d;bi=k;}}return sOf[bi];};
  const zones=[[sDe(Q.porte0.p)-260,sDe(Q.porte1.p)+180],[sDe(Q.pont0.p)-220,sDe(Q.pont1.p)+160],[0,300]];
  const brut=s9=>A1*Math.sin(s9/L1*6.283+ph1)+A2*Math.sin(s9/L2*6.283+ph2)+A3*Math.sin(s9/L3*6.283+ph3);
  for(let k=0;k<ctrl.length;k++){const s9=sOf[k];let y=brut(s9)-brut(0);
    for(const z of zones){const c=(z[0]+z[1])/2,yc=brut(c)-brut(0),w=1-THREE.MathUtils.smoothstep(Math.abs(s9-c),(z[1]-z[0])/2,(z[1]-z[0])/2+260);y+=(yc-y)*w;}
    ctrl[k].y=y;}
  adoucirPentes(ctrl,JADE_PENTE); // les rampes vers les monuments (et les crêtes des ondes) ramenées vers ~10° — les paliers restent à plat
  for(const k in Q){const o=Q[k];let bi=0,bd=1e18;for(let j=0;j<ctrl.length;j++){const d=ctrl[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.y=ctrl[bi].y;}
  JADE.Q=Q;JADE.mk=MK9; /* (2026-10-20) les modules de cette vallée (dbgJade().mods) */
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
const JADE_SOBRE=ALLEGE&&!/[?&]jadeplein=1\b/.test(location.search);
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
/* ---- LA MATIÈRE : des CUBES de pierre réaliste ---- */
/* ===== LA PASSE D'EMBELLISSEMENT DE JADE (2026-10-21, Sacha : « chaque map un peu plus belle, sans que ce soit trop gourmand ») =====
   Dans la matière des cubes (le même programme, pas un de plus) : des STRATES de grès (bandes horizontales teintées), des VEINES de jade qui
   courent dans les fissures claires et s'allument la nuit, de rares fils d'OR dans la pierre (le clin d'œil CASH : le kintsugi de la montagne),
   le REBOND tiède de la mer de brume sur les flancs et les ventres (soir : pêche ; nuit : turquoise), la perspective aérienne en trois plans
   (le moyen plan bleuit et s'éclaircit avant de se fondre dans la brume). Que de l'arithmétique sur des valeurs déjà lues (fv, st, vAO) :
   aucune texture, aucun appel de dessin. JMAT par palier : 0 = la matière d'avant · 1 = strates + veines + rebond · 2 = tout (fils d'or, perspective). */
PAL.B.jadeMatiere=[0,1,2];const JMAT=PAL.b('jadeMatiere',2);
const JADE_VR_VS=[
  'attribute float aM,aAO;attribute vec4 aJ;varying vec3 vW,vO,vN,vNo;varying float vM,vAO;varying vec4 vJ;',
  '#include <fog_pars_vertex>',
  'void main(){',
  '#ifdef USE_INSTANCING',
  '  mat4 mw=modelMatrix*instanceMatrix;',
  '#else',
  '  mat4 mw=modelMatrix;',
  '#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vO=position;vNo=normal;vN=normalize(mat3(mw)*normal);vM=aM;vAO=aAO;vJ=aJ;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;',
  '#include <fog_vertex>',
  '}'].join('\n');
const JADE_VR_FS=[
  'uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillD,uFillC,uMist,uGhost,uCielH,uCielZ,uRocT,uVerT;uniform float uMerY,uBump,uTime,uEcart,uSous;',
  'varying vec3 vW,vO,vN,vNo;varying float vM,vAO;varying vec4 vJ;',
  '#include <fog_pars_fragment>',
  'float rh(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}',
  'float rn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  '  return mix(mix(mix(rh(i),rh(i+vec3(1,0,0)),f.x),mix(rh(i+vec3(0,1,0)),rh(i+vec3(1,1,0)),f.x),f.y),',
  '             mix(mix(rh(i+vec3(0,0,1)),rh(i+vec3(1,0,1)),f.x),mix(rh(i+vec3(0,1,1)),rh(i+vec3(1,1,1)),f.x),f.y),f.z);}',
  JADE_ONDE,'uniform float uEauT;',JADE_EAU_GLSL,
  'void main(){',
  '  float wl9=vW.y-(uMerY+jMerH(floor(vW.xz/JMS))*JMS);if(uSous<.5?wl9<0.:wl9>0.)discard;',     // (2026-10-13) l objectif SOUS l eau : le pied immergé, plus rien au-dessus (la peau de l eau le cache)     // (v17) SOUS L EAU, plus rien : la mer du ciel prend la place
  '#ifdef PREPASS',
  '  gl_FragColor=vec4(1.);return;',                                                // la profondeur de la face la plus proche (rien à peindre)
  '#endif',
  '  vec3 an=abs(vNo);vec2 uv=an.x>.5?vO.zy:(an.y>.5?vO.xz:vO.xy),f=fract(uv);',   // la face du cube (en cubes)
  '  vec3 vox=floor(vO-vNo*.5+.001),Ng=normalize(vN),p=vW+vJ.x*137.;',
  '  float hC=rh(vox+vJ.x*31.);',                                                   // CHAQUE PETIT CUBE sa nuance (légère : une mosaïque, pas un carrelage)
  // les champs de la roche réaliste (monde, continus d un bloc à l autre) : coulées, rugosité, fissures nettes
  '  float st=rn(vec3(p.x*.24,p.y*.022,p.z*.24)),rg=rn(p*.11)*.5+rn(p*.27)*.3+rn(p*.65)*.2;',
  '  float fv=pow(1.-abs(2.*rn(vec3(p.x*.13,p.y*.028,p.z*.13)+19.)-1.),13.);',
  '  float h=st*.35+rg*.4-fv*.4;',                                                  // (v7) plus de JOINT dessiné entre les blocs : c était le carrelage de Minecraft
  '  float pxs=length(fwidth(vW)),dF=1.-smoothstep(1.,6.,pxs);',
  '  vec3 dpx=dFdx(vW),dpy=dFdy(vW);float dhx=dFdx(h),dhy=dFdy(h);',              // ⚠ dérivées hors de toute branche
  '  vec3 r1=cross(dpy,Ng),r2=cross(Ng,dpx);float de=dot(dpx,r1);',
  '  vec3 N=normalize(abs(de)*Ng-sign(de)*(dhx*r1+dhy*r2)*uBump*dF);',
  '  int m=int(vM+.5);vec3 alb;float ve=0.,au=0.;',
  '  vec3 roc=mix('+('vec3(.45,.55,.51),vec3(.33,.41,.39)')+',rn(p*.011+3.));roc=mix(roc,vec3(.56,.51,.44),smoothstep(.62,.9,rn(vec3(vJ.x*9.,p.y*.03,1.)))*.4);',
  '  roc*=mix(.45,1.,smoothstep(.1,.6,st))*(.93+.14*hC)*uRocT;',
  '  float hv=smoothstep(uMerY-20.,uMerY+380.,vW.y);',
  '  if(m==1||m==2){alb=roc*mix(.94,'+('.88+.14*rg')+',dF)*(1.-fv*.42*dF);',
  '    if(m==2)alb=mix(alb,vec3(.52,.37,.27)*(.85+.3*rg),.6);',
  '    alb=mix(alb,vec3(.74,.74,.64),step(.935,rn(p*.85))*dF*.4);',               // le lichen
  '    float mo=max(step(.5,Ng.y)*smoothstep(.3,.62,rn(p*.13)),smoothstep(.6,.78,rn(p*.05+11.)*.7+(1.-st)*.3)*hv*(1.-smoothstep(.4,.95,vAO))*.8)*vJ.y;',
  '    alb=mix(alb,mix(vec3(.09,.16,.07),vec3(.22,.32,.12),rn(p*.4))*uVerT,mo);',      // la mousse
  (JMAT>=1?[
  '    float sb=smoothstep(.15,.85,.5+.5*sin(p.y*.11+st*4.5+vJ.x*6.));alb=mix(alb,roc*vec3(1.55,1.18,.78),sb*.30*(1.-mo));', // (embellie) les STRATES : des bancs de grès chaud entre les bancs de roche verte
  '    float vj=smoothstep(.52,.8,st)*(1.-mo);ve=fv*vj*dF;alb=mix(alb,vec3(.16,.74,.52),ve*.8);'].join('\n'):''),               // (embellie) les VEINES de jade, dans les fissures des bandes claires
  (JMAT>=2?'    au=fv*step(.8,rh(floor(p*.016)+11.))*dF*(1.-mo);alb=mix(alb,vec3(.96,.72,.28),au*.9);':''),                       // (embellie) de RARES fils d or (une région sur cinq, cases de 60 m)
  '  }',
  '  else if(m==3){vec3 g=mix(vec3(.11,.24,.06),vec3(.25,.40,.10),rn(p*.35))*(.82+.32*rg)*uVerT,r9=roc*mix(.94,.82+.3*rg,dF);', // l HERBE : sur le dessus seulement, en PLAQUES de mousse sur la pierre (la frange sur les côtés et la dalle verte unie, c était le bloc d herbe de Minecraft)
  '    alb=Ng.y>.5?mix(r9,g,smoothstep(.38,.62,rn(p*.09+5.)*.7+rn(p*.5)*.3)):r9;}',
  '  else if(m==4)alb=mix(vec3(.07,.14,.06),vec3(.19,.30,.11),rn(p*.6))*(.7+.45*rn(p*1.9))*uVerT;', // les FEUILLES
  '  else if(m==5)alb=vec3(.27,.20,.15)*(.85+.3*rg);',
  '  else if(m==6)alb=vec3(.55,.13,.09);else if(m==7)alb=vec3(.16,.19,.19);else if(m==8)alb=vec3(.86,.66,.30);else if(m==10)alb=roc*.75;else alb=vec3(.62,.60,.55)*(.9+.2*rg);',
  '  vec3 V=normalize(cameraPosition-vW);',
  '  float cav=mix(.3,1.,vAO)*mix(.6,1.,smoothstep(.05,.5,h)),dif=max((dot(N,uSunDir)+.12)/1.12,0.);',
  '  vec3 col=alb*(mix(uGnd,uSky,N.y*.5+.5)*cav*.85+uSunC*dif*mix(.5,1.,cav)*.85+uFillC*max(dot(N,-uFillD),0.)*cav);', // (v7) le soleil un cran plus doux : les grandes faces au soleil sortaient crème
  (JMAT>=1?[
  '  {float dk9=1.-smoothstep(.35,1.1,dot(uSunC,vec3(.333)));',                                                                        // (embellie) 0 le jour · 1 la nuit
  '   col+=alb*uMist*vec3(1.05,.84,.72)*(smoothstep(.1,-.7,N.y)*.34+(1.-abs(N.y))*.10)*cav*(1.-smoothstep(120.,900.,vW.y-uMerY));', // le REBOND de la mer de brume : tiède sous les ventres et sur les flancs
  '   col+=vec3(.10,.62,.44)*ve*(.07+.85*dk9);}'].join('\n'):''),                                                                   // les veines de jade s allument avec la nuit
  (JMAT>=2?[
  '  col+=vec3(1.,.74,.32)*au*(.10+.95*pow(max(dot(reflect(-V,N),uSunDir),0.),12.));',                                                   // l or accroche le soleil
  '#ifdef USE_FOG',
  '  {float ap9=smoothstep(450.,2000.,fogDepth);col=mix(col,col*vec3(.84,.95,1.13)+vec3(.012,.026,.05),ap9*.55);}', // la PERSPECTIVE AÉRIENNE : le moyen plan bleuit et s éclaircit avant de se fondre dans la brume
  '#endif'].join('\n'):''),
  // LE VERRE DE JADE (v6, Léo : « je parlais de la transparence des CUBES qui font la montagne ; c est trop clair là ») : chaque bloc est une
  // brique de jade teinté — on voit au travers les blocs de derrière, l autre face de la montagne et ses plans intérieurs (matière 10), assombris
  // et verdis ; les arêtes des cubes absorbent plus (on lit les blocs). Une lueur discrète au contre-jour et dans les joints, rien de plus.
  '  float nv=abs(dot(Ng,V)),rim=pow(1.-nv,2.5),tr=pow(max(dot(-V,uSunDir),0.),3.)*(1.-max(dot(Ng,uSunDir),0.));',
  '  vec3 ir9=mix(vec3(1.,.58,.90),vec3(.50,.95,1.),.5+.5*sin(nv*8.+vW.y*.012+vJ.x*6.));col+=ir9*(rim*.13+tr*.16)*vJ.y;',     // (v17) FÉERIQUE : le bord du verre s irise (rose ↔ turquoise selon l angle)
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm*hm*(3.-2.*hm));',
  '  float fo=0.;',
  '#ifdef USE_FOG',
  '  fo=smoothstep(fogNear,fogFar,fogDepth);',
  '#endif',
  '  float sg9=pow(max(0.,sin(uEauT*1.7+dot(vW.xz,vec2(.023,.019))+vJ.x*23.)),3.),fe9=1.-smoothstep(0.,5.+14.*sg9,wl9+4.*rh(floor(vW*.5)));',  // (v17) LA VAGUE QUI FRAPPE : l écume au ras de l eau, qui monte par à-coups
  '  fe9*=step(.22-.18*sg9,rh(floor(vW*.85)+floor(uEauT*5.)));col=mix(col,vec3(.98,.97,1.)*(uSunC*.5+uSky*.65),fe9*.95);',
  '  float opB=m==4?.9:m==3?.88:m==2?.76:m==10?.13:m>=5?.95:.72,op=opB*(1.-fo);op=mix(op,0.,hm*.85);op=max(op,fe9*.92*(1.-fo));', // l OPACITÉ du bloc (la brume l efface au loin)
  '#ifdef VITRAIL',                                                                // (v10) LES ÉCAILLES : opaques, écartées (la lumière du cœur passe par les joints)
  '  if(m==10)discard;float dd=length(vW-cameraPosition),e9=min(min(f.x,1.-f.x),min(f.y,1.-f.y)),jw=(1.-uEcart)*.5*(1.-smoothstep(70.,160.,dd));',
  '  float on=exp(-pow((vW.y-onde(vJ.x))/16.,2.));vec3 gl=vec3(.50,.95,.78);',
  'col=mix(col,mix(uCielH,uCielZ,.5),pow(1.-nv,3.)*.35);',                     // le verre par-dessus : le ciel en rasant
  '#ifdef JOINT_LUM',
  '  col=mix(col,col*vec3(.72,.98,.90),.65);col=mix(col,gl*(.30+1.1*on),smoothstep(jw+.012,jw*.4,e9)*dF*dF*.45*(1.-smoothstep(40.,110.,dd)));',              // l arche, le pont : rien derrière, le joint EST la lumière
  '#else',
  '  if(e9<jw)discard;',                                                             // le joint : on voit le cœur
  '  {float fd=smoothstep(170.,125.,dd);if(fd<1.&&fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))>fd)discard;}', // l apparition, en fondu tramé
  '#endif',
  '  col+=gl*smoothstep(.10,0.,e9-jw)*(.10+1.4*on)*dF;',                             // les arêtes s allument au passage de l onde
  '#ifdef USE_FOG','  col=mix(col,fogColor,fo);','#endif','  gl_FragColor=vec4(col,1.);',
  '#elif defined(OPAQUE)',                                                          // (v17) LE LOIN, en une passe : le verre deviné (le fond pris dans la brume)
  '  float oq=max(mix(opB,0.,hm*.85),fe9*.92);vec3 Tq=vec3(1.-oq)*mix(vec3(1.),vec3(.52,.78,.64),oq),bq=uMist;',
  '#ifdef USE_FOG','  bq=fogColor;','#endif',
  '  vec3 cq=col*oq*.6+bq*Tq;',
  '#ifdef USE_FOG','  cq=mix(cq,fogColor,fo);','#endif',
  '  gl_FragColor=vec4(cq,1.);',
  '#elif defined(PASSE_M)',
  '  vec3 Tr=vec3(1.-op)*mix(vec3(1.),vec3(.52,.78,.64),op);', // ce qu on voit À TRAVERS : assombri, verdi
  '  if(!gl_FrontFacing&&m!=10)Tr=mix(vec3(1.),Tr,.8);',
  '  gl_FragColor=vec4(Tr,1.);',
  '#else',
  '  gl_FragColor=vec4(col*op*.6,1.);',                                                 // la LUMIÈRE de la face la plus proche (une seule : la profondeur l a gardée)
  '#endif',
  '}'].join('\n');
/* LE VERRE SANS DÉSORDRE (v6) — trois passes, aucun tri :
   1. l'ABSORPTION (renderOrder 2) : TOUTES les couches (faces avant, de dos, plans intérieurs, montagnes derrière) multiplient le fond par ce
      qu'elles laissent passer — assombri, verdi, l'arête plus sombre : on voit les cubes qui font la montagne, en ombres dans le verre ;
   2. la PROFONDEUR de la face avant la plus proche (renderOrder 2.5, sans couleur) ;
   3. la LUMIÈRE (renderOrder 3) : seule cette face-là ajoute sa lumière (la profondeur a écarté les autres) — rien ne s'additionne en lueur.
   Pour une couche c'est l'exact « fond × (1 − α) + bloc × α ». La brume de three n'est pas appliquée telle quelle : c'est l'OPACITÉ qui
   s'éteint au loin (le fond reprend sa place). La brume, les cascades, les rayons passent après : derrière une montagne, la profondeur les cache. */
function jadeVRMat(k){if(k==='V'||k==='VM'){const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uBump:JADE_BUMP,uEcart:JADE_VIT_U.uEcart,uCielH:JADE_VIT_U.uCielH,uCielZ:JADE_VIT_U.uCielZ}),defines:k==='V'?{VITRAIL:''}:{VITRAIL:'',JOINT_LUM:''},
    vertexShader:JADE_VR_VS,fragmentShader:JADE_VR_FS,fog:true,extensions:{derivatives:true},side:THREE.FrontSide});m.dispose=function(){};return m;} // (v10) les ÉCAILLES du vitrail : opaques, une passe
  const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uBump:JADE_BUMP,uEcart:JADE_VIT_U.uEcart,uCielH:JADE_VIT_U.uCielH,uCielZ:JADE_VIT_U.uCielZ}),defines:k==='O'?{OPAQUE:''}:k==='M'?{PASSE_M:''}:k==='P'?{PREPASS:''}:{},
    vertexShader:JADE_VR_VS,fragmentShader:JADE_VR_FS,fog:true,extensions:{derivatives:true},transparent:k!=='O',depthWrite:k==='P'||k==='O',colorWrite:k!=='P',side:k==='M'?THREE.DoubleSide:THREE.FrontSide,
    blending:k==='M'?THREE.MultiplyBlending:k==='A'?THREE.AdditiveBlending:THREE.NormalBlending});
  if(k==='A'){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;}m.dispose=function(){};return m;}
const JADE_BUMP={value:6};
const JADE_M={vrO:null,vrOM:null,vr:null,vrM:null,vrX:null,vrXM:null,vrP:null,vrPM:null,col:null,arb:null,vit:null,vitM:null,peau:null,coeur:null};
function jadeMats(){if(!JADE_M.vr){JADE_M.vr=jadeVRMat('A');JADE_M.vrO=jadeVRMat('O');JADE_M.vrOM=jadeVRMat('O');JADE_M.vrM=jadeVRMat('A');JADE_M.vrX=jadeVRMat('M');JADE_M.vrXM=jadeVRMat('M');JADE_M.vrP=jadeVRMat('P');JADE_M.vrPM=jadeVRMat('P'); // vr : en instances · vrM : un maillage seul (la muraille, l'arche) — un programme chacun
    JADE_M.col=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U),vertexShader:JADE_COL_VS,fragmentShader:JADE_COL_FS,fog:true});JADE_M.col.dispose=function(){};
    JADE_M.arb=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uTex:{value:jadeArbresTex()}}),vertexShader:JADE_ARB_VS,fragmentShader:JADE_ARB_FS,fog:true,side:THREE.DoubleSide});JADE_M.arb.dispose=function(){};}
  return JADE_M;}
/* LES GABARITS : bâtis une fois par session — dix montagnes, trois rochers flottants (à la suite : `JADE_NTPL` les sépare), les temples */
/* LES GABARITS TAILLÉS AU MENU (2026-10-14, session OPTIMISATION — passation perf n° 2 : « JOUER ~1,0-1,3 s : 1 280 ms de JavaScript dans le
   fn() du volet »). MESURÉ (profil, PC, palier 0) : le volet du JOUER figeait 641 ms, dont 389 ms pour jadeGabarits — les gabarits de la jade,
   taillés « une fois par session, sous le voile » quel que soit le niveau tiré. Ce sont déjà des générateurs à échéance (voxPilierG, voir LES
   TRANCHES) : au MENU, une fois la chauffe finie (CHAUFFE_R.fait), hors volet et hors lâcher, jadeGabFond en taille quelques ms par image
   (gabFondMs). Un JOUER qui arrive avant la fin les finit d'un trait (jadeGabarits) là où elles en sont : les mêmes gabarits au bit près (le
   hasard de chacune est sa graine, une tranche ne fait que suspendre). `ms` = le travail cumulé. dbgGabarits() : l'état. */
PAL.B.gabFondMs=[5,6,8];
const GAB_FOND={it:null,ms:0,n:0,fini:false,sync:0};
function* jadeGabaritsG(){const p=[];
  for(let k=0;k<JADE_TPL.length;k++){const q=JADE_TPL[k];p.push(yield* voxPilierG(q[0]/VX,Math.round(q[1]/VX),q[2],0x51A0+k*131));}
  for(let v=0;v<3;v++)p.push(yield* voxPilierG((6.5+v*2.2)/VX,Math.round((20+v*7.5)/VX),v%3,0xCA11+v*71)); // les ROCHERS qui flottent (6,5-11 m, 20-35 m)
  if(performance.now()>JF.lim)yield;
  return {p:p,pag:jadeTempleGeo(5),pav:jadeTempleGeo(1),arbreQ:new THREE.PlaneGeometry(1,1),ms:0};}
function jadeGabarits(){if(JADE.geos)return JADE.geos;
  const t0=performance.now(),it=GAB_FOND.it||jadeGabaritsG(),l0=JF.lim;GAB_FOND.it=null;GAB_FOND.fini=true;JF.lim=Infinity;
  try{const g=jadeFini(it);GAB_FOND.sync=performance.now()-t0;GAB_FOND.ms+=GAB_FOND.sync;g.ms=Math.round(GAB_FOND.ms);JADE.geos=g;}finally{JF.lim=l0;}
  return JADE.geos;}
function jadeGabFond(){ // une tranche par image, au menu (voir LES GABARITS TAILLÉS AU MENU)
  if(JADE.geos||GAB_FOND.fini||(started&&!gameOver)||!CHAUFFE_R.fait||ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go)||(PREB.W&&PREB.dep&&!PREB.fait))return; // (2026-10-24, passe perf) le départ d'avance d'une autre map passe d'abord : MESURÉ (×4, MOYEN), il ne commençait qu'à ~65 s du chargement, après les gabarits
  const t=performance.now(),l0=JF.lim;if(!GAB_FOND.it)GAB_FOND.it=jadeGabaritsG();JF.lim=t+PAL.b('gabFondMs',6);chauffeGrace(); // (la qualité auto ne lit pas une tranche comme une faiblesse)
  let r;try{r=GAB_FOND.it.next();}catch(e){GAB_FOND.it=null;GAB_FOND.fini=true;console.warn('gabarits',e);return;}finally{JF.lim=l0;GAB_FOND.ms+=performance.now()-t;GAB_FOND.n++;}
  if(r.done){GAB_FOND.it=null;GAB_FOND.fini=true;r.value.ms=Math.round(GAB_FOND.ms);JADE.geos=r.value;}}
window.dbgGabarits=function(){return {pret:!!JADE.geos,tranches:GAB_FOND.n,msTravail:Math.round(GAB_FOND.ms),msFinSurPlace:Math.round(GAB_FOND.sync),enCours:!!GAB_FOND.it};}; // (banc)
function jadeTplDe(r){let bi=0,bd=1e9;for(let k=0;k<JADE_NTPL;k++){const d=Math.abs(JADE_TPL[k][0]-r);if(d<bd){bd=d;bi=k;}}return bi;}
/* ---- LA MATIÈRE DES TEMPLES (couleur par sommet, lumière du niveau, brume) ---- */
const JADE_COL_VS=['attribute vec3 aCol;attribute vec4 aJ;varying vec3 vW,vN,vC;','#include <fog_pars_vertex>','void main(){',
  '#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(mw)*normal);vC=aCol;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const JADE_COL_FS=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uMist;uniform float uMerY;varying vec3 vW,vN,vC;','#include <fog_pars_fragment>','void main(){',
  '  vec3 N=normalize(vN);float dif=max((dot(N,uSunDir)+.15)/1.15,0.);vec3 col=vC*(mix(uGnd,uSky,N.y*.5+.5)+uSunC*dif);',
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* ---- LA FORÊT PEINTE : une planche de 8 dessins (4 × 2) — cinq pins du Huangshan (tronc tordu, plateaux d'aiguilles en nuages), trois
   touffes de feuillus. Chaque dessin : des centaines de touches (ombre dessous, lumière dessus), un alpha franc. ---- */
function jadeArbresTex(){const W=256,cv=document.createElement('canvas');cv.width=W*4;cv.height=W*2;const c=cv.getContext('2d'),rg=mulberry32(0xA7B3);
  const touche=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();};
  const vert=(l,k)=>{const a=[[18,34,18],[27,48,25],[40,66,32],[56,84,40],[74,100,48]][Math.min(4,Math.max(0,l))];const v=k||1;return 'rgb('+Math.round(a[0]*v)+','+Math.round(a[1]*v)+','+Math.round(a[2]*v)+')';};
  for(let n=0;n<8;n++){const ox=(n%4)*W,oy=Math.floor(n/4)*W;c.save();c.translate(ox,oy);c.beginPath();c.rect(0,0,W,W);c.clip();
    if(n>=6){ // LA LIANE (peinte « à l'envers » : posée la tête en bas, elle pend sous la montagne)
      for(let k=0;k<14;k++){let x=20+rg()*(W-40),y=W;const L=90+rg()*150,dx=(rg()-.5)*.5;c.strokeStyle=vert(1,.7);c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);
        for(let q=0;q<L;q+=6){x+=dx*3+(rg()-.5)*2;y-=6;c.lineTo(x,y);}c.stroke();
        for(let q=0;q<L;q+=3){const yy=W-q,xx=x-(L-q)*dx*.5;touche(xx+(rg()-.5)*10,yy,1.5+rg()*2.8*(1-q/L*.6),vert(q<L*.3?2:1,.75+rg()*.4));}}
    }else if(n<4){ // LE PIN : un tronc qui se tord, des branches presque horizontales, des plateaux d'aiguilles
      let x=W/2+(rg()-.5)*20,y=W-2;const pts=[[x,y]],dx=(rg()-.5)*2.2;
      for(let k=0;k<9;k++){x+=dx*6+(rg()-.5)*10;y-=24+rg()*5;pts.push([x,y]);}
      c.strokeStyle='#2b2018';c.lineCap='round';for(let k=0;k<pts.length-1;k++){c.lineWidth=9-k*.8;c.beginPath();c.moveTo(pts[k][0],pts[k][1]);c.lineTo(pts[k+1][0],pts[k+1][1]);c.stroke();}
      const np=3+((rg()*3)|0);
      for(let k=0;k<np;k++){const b=pts[Math.min(pts.length-1,3+Math.round(k*(pts.length-4)/np))],sg=rg()<.5?-1:1,L=30+rg()*60*(k===0?1.4:1),cx=b[0]+sg*L*.6,cy=b[1]-6-rg()*8;
        c.lineWidth=4;c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo((b[0]+cx)/2,b[1]+4,cx,cy+4);c.stroke();
        const rx=26+rg()*(k===0?54:36),ry=9+rg()*9;
        for(let q=0;q<170;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*rx*rr,ty=cy+Math.sin(a)*ry*rr;const hi=(cy-ty)/ry;
          touche(tx,ty+3,2.6+rg()*3.2,vert(hi>.25?3:hi>-.3?2:1,.8+rg()*.35));}
        for(let q=0;q<40;q++){const a=rg()*3.1416+3.1416,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*rx*rr*.9,ty=cy+Math.sin(a)*ry*rr*.8;touche(tx,ty,1.8+rg()*2,vert(4,.85+rg()*.3));}}
      // la couronne : un dernier plateau au sommet
      const t=pts[pts.length-1];for(let q=0;q<120;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=t[0]+Math.cos(a)*30*rr,ty=t[1]+Math.sin(a)*14*rr;touche(tx,ty,2.4+rg()*3,vert((t[1]-ty)/14>.2?3:2,.8+rg()*.35));}
    }else{ // LA TOUFFE : un nuage de feuillage, l'ombre dessous, le soleil dessus
      const cx=W/2,cy=W*.62;for(let q=0;q<900;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*100*rr,ty=cy+Math.sin(a)*82*rr*(Math.sin(a)>0?.85:1.1);if(ty>W-4)continue;
        const hi=(cy-ty)/82;touche(tx,ty,3+rg()*4.5,vert(hi>.35?4:hi>0?3:hi>-.4?2:1,.75+rg()*.4));}}
    if(n===5||n===7){c.clearRect(0,0,W,W);jadeCristalPeint(c,W,n===7?1:0);} // (2026-10-21, embellie) les cases 5 et 7 (la 2e touffe, la 2e liane : mêmes dessins que 4 et 6, le sommet les y renvoie) portent les CRISTAUX DE JADE — le pinceau d'avant a tiré ses nombres comme avant : les autres cases n'ont pas bougé
    c.restore();}
  const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.minFilter=THREE.LinearMipmapLinearFilter;return texLibere(t);} // (2026-10-14, passe perf mobile) la planche 1024 × 512, peinte une fois : 2 Mo rendus après l'envoi (paliers 0-1)
const JADE_ARB_VS=['attribute vec4 aJ;uniform float uTime;varying vec2 vUv,vL;varying vec3 vW;varying float vCr;','#include <fog_pars_vertex>',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
  '  vec3 R=normalize(vec3(viewMatrix[0][0],0.,viewMatrix[2][0])+vec3(1e-4,0.,0.)),U=normalize(vec3(0.,1.,0.)+vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1])*.35);', // face à la caméra (un peu penché vers elle d en haut)
  '  float k=aJ.z,cr=step(7.5,k);k=cr>.5?(k<8.5?5.:7.):(abs(k-5.)<.5?4.:(abs(k-7.)<.5?6.:k));vCr=cr;', // (embellie) cases 8-9 = les cristaux (dessinés dans 5 et 7) ; 5 et 7 pour les arbres = 4 et 6
  '  float y=position.y+.5,sw=sin(uTime*.8+aJ.w*40.)*y*y*.04*aJ.y*(1.-cr);',
  '  vec3 wp=c+R*(position.x*aJ.x+sw)+U*y*aJ.y;vW=wp;',
  '  vUv=(vec2(mod(k,4.),floor(k/4.))+vec2(position.x+.5,1.-y))*vec2(.25,.5);vUv.y=1.-vUv.y;vL=vec2(y,aJ.w);',
  '  vec4 mvPosition=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const JADE_ARB_FS=['uniform sampler2D uTex;uniform vec3 uSunC,uSky,uGnd,uMist,uSunDir;uniform float uMerY,uTime;varying vec2 vUv,vL;varying vec3 vW;varying float vCr;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.45||vW.y<uMerY+1.)discard;',
  '  vec3 col=mix(t.rgb,vec3(dot(t.rgb,vec3(.3,.59,.11))),.15)*(.8+.25*vL.y)*(mix(uGnd,uSky,.35+.5*vL.x)*.9+uSunC*(.35+.4*vL.x));',
  '  col+=t.rgb*vCr*(.20+.60*(1.-smoothstep(.35,1.1,dot(uSunC,vec3(.333)))))*(.82+.18*sin(uTime*1.7+vL.y*50.));', // (embellie) les CRISTAUX luisent (un peu le jour, franchement la nuit) et scintillent chacun à son rythme
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* ---- LES TEMPLES : la PAGODE (octogonale, cinq étages, avant-toits relevés) et le PAVILLON (un toit, huit colonnes) ---- */
function jadeTempleGeo(etages){const P=[],C=[],add=(g,col)=>{const h=g.index?g.toNonIndexed():g,a=h.attributes.position.array;for(let i=0;i<a.length;i++)P.push(a[i]);for(let i=0;i<a.length/3;i++)C.push(col[0],col[1],col[2]);};
  const bois=[.32,.12,.08],mur=[.70,.66,.58],tuile=[.17,.19,.19],pierre=[.55,.53,.49],or=[.86,.66,.30];
  const lathe=(prof,col)=>add(new THREE.LatheGeometry(prof.map(function(q){return new THREE.Vector2(q[0],q[1]);}),8),col);
  lathe([[0,0],[7.5,0],[7.5,1.6],[0,1.6]],pierre);
  let y=1.6,r=5;
  for(let k=0;k<etages;k++){const h=k===0?6:4.2;
    lathe([[0,y],[r,y],[r,y+h],[0,y+h]],k%2?bois:mur);
    const e=r*1.55,ys=y+h;lathe([[0,ys+2.4],[r*.62,ys+2.2],[r*1.05,ys+1.3],[e*.92,ys+.35],[e,ys+.75],[e*.98,ys+.55],[r*.5,ys-.3],[0,ys-.3]],tuile); // l'avant-toit RELEVÉ
    y=ys+1.6;r*=.84;}
  lathe([[0,y],[.45,y],[.25,y+5],[0,y+6.2]],or);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aCol',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g;}
/* LES CASCADES : un ruban qui fait face à la caméra (autour de la verticale), qui s'écarte un peu de la paroi en tombant ; l'eau défile
   (des filets blancs qui coulent), s'élargit et se défait en brume vers le bas. Toutes dans UN maillage. */
const JADE_CHUTE_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,side:THREE.DoubleSide,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTime:JADE_U.uTime,uMist:JADE_U.uMist,uSunC:JADE_U.uSunC}),
  vertexShader:['attribute vec3 aTop;attribute vec4 aW;attribute vec2 aO;varying vec2 vP;varying vec4 vWw;','#include <fog_pars_vertex>',
    'void main(){float t=position.x,sd=position.y;vec3 out3=vec3(aO.x,0.,aO.y);',
    '  vec3 c=aTop+out3*(aW.x*.4+t*t*aW.y*.07)-vec3(0.,1.,0.)*t*aW.y;',
    '  vec3 tc=cameraPosition-c;tc.y=0.;vec3 R=normalize(vec3(tc.z,0.,-tc.x)+vec3(1e-4,0.,0.));',
    '  vec3 wp=c+R*sd*aW.x*(.5+t*1.4);vP=vec2(t,sd);vWw=aW;',
    '  vec4 mvPosition=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform float uTime;uniform vec3 uMist,uSunC;varying vec2 vP;varying vec4 vWw;','#include <fog_pars_fragment>',
    'float ch(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float cn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ch(i),ch(i+vec2(1,0)),f.x),mix(ch(i+vec2(0,1)),ch(i+vec2(1,1)),f.x),f.y);}',
    'void main(){float t=vP.x,x=vP.y;',
    '  float L=vWw.y,fl=cn(vec2(x*7.+vWw.z*13.,t*L*.035-uTime*1.6))*.6+cn(vec2(x*17.,t*L*.08-uTime*2.7))*.4;', // les filets qui coulent
    '  float e=1.-smoothstep(.25,.5,abs(x));float a=e*(.35+.65*fl)*smoothstep(0.,.04,t)*(1.-smoothstep(.45,1.,t));',
    '  a*=mix(.95,.55,t);vec3 col=mix(vec3(.93,.96,.98),uMist,t*.7)+uSunC*.04;',
    '  gl_FragColor=vec4(col,a*.9);','#include <fog_fragment>','}'].join('\n')});m.dispose=function(){};return m;})();
function jadeChutes(L9){ // L9 : [x, y, z, ox, oz, largeur, longueur, graine]
  const n=L9.length,S=24,P=[],T9=[],W=[],O=[],I=[];
  for(let k=0;k<n;k++){const q=L9[k],b=P.length/3;for(let i=0;i<=S;i++)for(const sd of [-.5,.5]){P.push(i/S,sd,0);T9.push(q[0],q[1],q[2]);O.push(q[3],q[4]);W.push(q[5],q[6],q[7],0);}
    for(let i=0;i<S;i++){const a=b+i*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aTop',new THREE.Float32BufferAttribute(T9,3));
  g.setAttribute('aO',new THREE.Float32BufferAttribute(O,2));g.setAttribute('aW',new THREE.Float32BufferAttribute(W,4));g.setIndex(I);
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);return g;}
/* LA BRUME QUI FLOTTE : des nappes en billboard (face caméra), un bruit doux dans le shader, un dessus éclairé, un ventre lavande ;
   elles s'effacent près de l'objectif (pas de voile plein écran quand on les traverse) et au loin dans la brume de three. */
const JADE_BRUME_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTime:JADE_U.uTime,uSunC:JADE_U.uSunC,uMist:JADE_U.uMist,uSky:JADE_U.uSky,uOp:{value:1}}),
  vertexShader:['attribute vec4 aB;varying vec2 vU;varying vec4 vB;varying float vNear;','#include <fog_pars_vertex>',
    'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
    '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
    '  vec3 wp=c+R*position.x*aB.x+U*position.y*aB.y;vU=position.xy;vB=aB;',
    '  vec4 mvPosition=viewMatrix*vec4(wp,1.);vNear=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform float uTime,uOp;uniform vec3 uSunC,uMist,uSky;varying vec2 vU;varying vec4 vB;varying float vNear;','#include <fog_pars_fragment>',
    'float bh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
    'float bn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bh(i),bh(i+vec2(1,0)),f.x),mix(bh(i+vec2(0,1)),bh(i+vec2(1,1)),f.x),f.y);}',
    'void main(){vec2 q=vU*2.;float r=length(q*vec2(1.,1.15));',
    '  vec2 p=vU*vec2(3.2,2.)+vB.z*17.+vec2(uTime*.02,0.);float n=bn(p)*.55+bn(p*2.1+3.)*.3+bn(p*4.3-5.)*.15;',
    '  float a=smoothstep(1.,.15,r+(n-.5)*.9)*vB.w*uOp;a*=smoothstep(25.,140.,vNear);if(a<.004)discard;',
    '  vec3 col=mix(uMist*vec3(.86,.88,.95),uMist*1.06+uSunC*.05,smoothstep(-.6,.5,vU.y+n*.4-.2));',
    '  gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
  m.dispose=function(){};return m;})();
/* ---- LA CONSTRUCTION ---- */
const JADE_LOD=(function(){const k=TEL_NATIF?.8:1;return {r0:220*k,r1:750*k,pin:900*k,pav:1300*k,d1:1500*k};})(); // les distances (m) : cubes de 1,75 → 3,5 → 7 m, arbres, temples, cubes de 14 m
/* (2026-10-14, passe perf mobile) LE VERRE EN TROIS PASSES, PAR PALIER — MESURÉ (iPhone 7 émulé) : la bande 220-750 m (cubes de 3,5 m) passe
   TROIS fois par la puce (absorption, profondeur, lumière : 3 × 48 000 triangles). Les trois passes sont solidaires (la lumière est ADDITIVE
   et n'écrit pas la profondeur : seule, elle ferait une lueur sans corps) — on n'en cache donc aucune ; on rapproche la frontière où la
   montagne passe au verre « deviné » en UNE passe opaque (cubes de 7 m, le mécanisme de la v17). Palier 2 : 750 m, comme avant. */
PAL.B.jadeVerreR1=[400,600,750];JADE_LOD.r1=PAL.b('jadeVerreR1',750)*(TEL_NATIF?.8:1);
function jadeBande(d){const L9=JADE_LOD;return d<L9.r0?0:d<L9.r1?1:d<L9.pin?2:d<L9.pav?3:d<L9.d1?4:5;}
function jadeMatPilier(q,k){ // la matrice d'une montagne (gabarit q[5], quart de tour q[6]) à son niveau de détail k (0 à 3)
  const T9=JADE.geos.p[q[5]],e=1<<(k|0);
  return new THREE.Matrix4().makeTranslation(q[0],q[3],q[1]).multiply(new THREE.Matrix4().makeRotationY(q[6]*Math.PI/2)).multiply(new THREE.Matrix4().makeScale(VX*e,VX*e,VX*e)).multiply(new THREE.Matrix4().makeTranslation(-T9.M/e,0,-T9.M/e));}
function jadeVueGeo(g){const c=new THREE.BufferGeometry();for(const k in g.attributes)if(k!=='aJ')c.setAttribute(k,g.attributes[k]);if(g.index)c.setIndex(g.index);c.boundingSphere=g.boundingSphere;return c;} // une géométrie qui PARTAGE les tampons d'un gabarit (son aJ à elle)
function jadeQuart(r,ox,oz){const c=Math.round(Math.cos(r*Math.PI/2)),s=Math.round(Math.sin(r*Math.PI/2));return [ox*c+oz*s,-ox*s+oz*c];} // un vecteur du gabarit tourné comme l'instance
/* (2026-10-13, passe perf « le JOUER qui gèle ») LA CARTE GARDÉE. MESURÉ : la graine du niveau est FIXE (NIV_JADE.graine) et pourtant la
   carte était jetée puis rebâtie à l'identique à chaque JOUER — et DEUX fois à partir du 2e (rebuildMenuScene sous le volet, puis resetGame
   au lâcher : deux newTrack). Désormais la carte qu'on quitte n'est plus jetée : elle est RANGÉE hors de la scène (JADE_GARDE, une seule), et
   le prochain buildJade de la MÊME vallée (même graine, même ruban au bit près : `jadeCle`) la reprend telle quelle en quelques ms
   (jadeReprend : l'effondrement défait comme au redémarrage du niveau, les familles et les cubes fins à retrier, monuments et pièces du bord
   comme neufs). Une autre vallée (la balade, ?graine=) jette l'ancienne ; une course sur un autre niveau (portail, carrière, CRYPTOCITY)
   aussi : hors du menu, jamais deux cartes. Rangée, elle rend à la carte graphique ce qu'elle seule y tenait (jadeRendGPU : la même mémoire
   GPU au menu qu'avant ; three renvoie ses tableaux au prochain rendu). Le menu garde SON ciel : la carte rangée n'est plus dans la scène. */
const JADE_GARDE={m:null,reprises:0,ms:0};
const JADE_CH=['root','fam','col','porte','pont','brume','monu','merY','eauY','quart','n9','nuages','nuTri','eauPil','eauT','depart','n','msPorte','msPont','tPorte','cle','dz','deco'],
  FIN_CH=['fam','cap','vit','stamp','was','gen','mats','dans'],NUVOX_CH=['L','ims','S','sig'],JCH_CH=['L','fixe','splash','sp']; // TOUT ce qu'une carte écrit hors d'elle-même (voir jadeBatit)
function jadeEtatLit(){const m={J:{},F:{},N:{},C:{}};for(const k of JADE_CH)m.J[k]=JADE[k];for(const k of FIN_CH)m.F[k]=FIN[k];for(const k of NUVOX_CH)m.N[k]=NUVOX[k];for(const k of JCH_CH)m.C[k]=JCH[k];return m;}
function jadeEtatEcrit(m){for(const k of JADE_CH)JADE[k]=m.J[k];for(const k of FIN_CH)FIN[k]=m.F[k];for(const k of NUVOX_CH)NUVOX[k]=m.N[k];for(const k of JCH_CH)JCH[k]=m.C[k];}
function jadeEtatVide(){ // plus de carte en place (les valeurs que buildJade posait avant de bâtir)
  NUVOX.L=null;NUVOX.ims=[];JADE.fam=[];FIN.fam=[];FIN.near.length=0;FIN.sig=0;FIN.mats=new Map();FIN.dans=new Set();JADE.col=null;JADE.porte=null;JADE.pont=null;JADE.brume=null;JADE.sig=0;JADE.root=null;JADE.monu=[];JADE.cle=null;JADE.quart=null;JADE.dz=null;JADE.deco=null;JCH.L=[];JCH.splash=null;JCH.sp=[];}
function jadeJette(m){ // libère une carte : ses familles (tampons d'instances, sans toucher aux gabarits partagés), ses maillages à elle, les tampons de ses instances
  for(const o of m.J.monu||[])if(o.loIt){try{o.loIt.return();}catch(e){}o.loIt=null;} // (2026-10-14, passe perf mobile) le monument de loin en cours : la file fermée (VOXM rendu), rien n'est ajouté à la carte jetée
  for(const F of m.J.fam.concat(m.F.fam.filter(Boolean))){F.im.dispose();if(F.im2&&F.im2!==F.im){F.im2.dispose();F.im3.dispose();}const g9=F.im.geometry;for(const k in g9.attributes)if(k!=='aJ')g9.deleteAttribute(k);g9.setIndex(null);g9.dispose();}
  if(m.J.root)m.J.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});}
function jadeRendGPU(m){m.J.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});} // (ses tableaux restent : three les renverra)
function jadeRange(){ // la carte en place quitte la scène, rangée telle quelle — l'ancienne carte rangée est libérée
  const m=jadeEtatLit();if(JADE.root.parent)JADE.root.parent.remove(JADE.root);
  if(JADE_GARDE.m){jadeJette(JADE_GARDE.m);JADE_GARDE.m=null;}
  if(m.J.cle){jadeRendGPU(m);JADE_GARDE.m=m;}else jadeJette(m);} // (une carte bâtie à moitié — une exception en route — n'est pas gardée)
function jadeOublie(){if(JADE_GARDE.m){jadeJette(JADE_GARDE.m);JADE_GARDE.m=null;}}
function jadeCle(seed){ // l'identité d'une vallée : la graine et le ruban tel que buildTrack l'a posé (au bit près), la largeur, les réglages qui changent la carte
  const f=new Float64Array(1),u=new Uint32Array(f.buffer);let h=0x811c9dc5;const mx=x=>{f[0]=x;h=Math.imul(h^u[0],16777619);h=Math.imul(h^u[1],16777619);};
  mx(seed);mx(NP);mx(L);mx(ROAD_HALF);mx(VX);mx(VXG);mx(FIN.on?1:0);mx(0);mx(JADE_NUVOX?1:0);mx(TEL_NATIF?1:0);
  for(let i=0;i<NP;i++){const p=pts[i],t=T[i],b=B[i],n=Nn[i];mx(p.x);mx(p.y);mx(p.z);mx(t.x);mx(t.y);mx(t.z);mx(b.x);mx(b.y);mx(b.z);mx(n.x);mx(n.y);mx(n.z);}
  const Q=JADE.Q||{};for(const k of Object.keys(Q).sort()){mx(k.length);mx(Q[k].p.x);mx(Q[k].p.y);mx(Q[k].p.z);mx(Q[k].phi);}
  return seed+':'+NP+':'+(h>>>0).toString(36);}
function jadePose(ok){ // la carte bâtie entre dans la scène (avant : dès le début de buildJade — l'ordre n'y change rien), l'eau à son niveau, le style de la route
  scene.add(JADE.root);trackMeshes.push(JADE.root);JADE_U.uMerY.value=JADE.eauY;skyU.uJMerY.value=JADE.eauY;
  {const Z=JADE.dz;JADE_U.uRocT.value.fromArray(Z?Z.roc:[1,1,1]);JADE_U.uVerT.value.fromArray(Z?Z.ver:[1,1,1]);} /* (2026-10-20, LE DÉCOR AU HASARD) la teinte de CETTE vallée — posée à l'entrée en scène (bâtie d'avance, elle ne déteint pas sur celle d'en place) */
  if(ok)try{jadeRoute();}catch(e){console.warn('route',e);}}
function jadeReprend(){const t0=performance.now(),m=JADE_GARDE.m;JADE_GARDE.m=null;
  jadeEtatEcrit(m);
  // ce que la partie d'avant a touché revient comme au sortir de buildJade
  jadeChuteRaz(); // les montagnes tombées remises debout, rendues aux chocs, l'écume vidée (le redémarrage du niveau, jadeRedemarre)
  for(const F of JADE.fam){F.sig=undefined;F.sale=false;F.im.count=0;if(F.im2){F.im2.count=0;F.im3.count=0;}if(F.dst)F.dst.clear();} // jadeTri récrit tout (JADE.sig = 0)
  for(const FF of FIN.fam)if(FF){FF.sig=undefined;FF.im.count=FF.im2.count=FF.im3.count=0;FF.im.visible=FF.im2.visible=FF.im3.visible=false;}
  FIN.near.length=0;FIN.sig=0;FIN.sale=false;FIN.mats=new Map();FIN.dans=new Set();if(FIN.stamp){FIN.stamp.fill(0);FIN.was.fill(0);}FIN.gen=0;
  NUVOX.sig=0;for(const im of NUVOX.ims||[]){im.count=0;im.visible=false;}for(const n of NUVOX.L||[])n.v=0;
  for(const e of JADE.eauPil||[])e.t=0;JADE.eauT=0;JADE.sale=false;
  for(const o of JADE.monu||[]){o.loin=false;o.g.visible=true;if(o.L){o.L[0].material=JADE_M.vrM;o.L[0].renderOrder=3;o.L[1].visible=o.L[2].visible=true;if(o.lo){o.lo.visible=false;o.L[0].visible=true;}}}
  for(const M9 of [JADE.porte,JADE.pont]){if(!M9||!M9.mF)continue;M9.pres=false;for(const x of M9.mF)x.visible=false;for(const x of M9.mL)x.visible=true;}
  if(FIN.on&&JADE.geos&&FIN.cap)for(let t=0;t<JADE.geos.p.length;t++)if(JADE.geos.p[t].fin&&!FIN.fam[t])finFamille(t); // (les gabarits fins finis depuis : leur famille, comme une carte neuve)
  jadePose(true);
  JADE_GARDE.reprises++;JADE_GARDE.ms=Math.round(performance.now()-t0);}
function buildJade(seed){
  JADE.t0=0;JADE.fini=false; // (2026-10-12, passe qualité) le chrono d'ARRIVÉE repart à chaque piste (après REJOUER il comptait les essais d'avant, menus compris)
  try{JADE_ESPRITS.visible=false;}catch(e){} // …et les lucioles s'éteignent : jadeTick ne tourne plus hors de la map, elles restaient figées dans le niveau suivant
  if(JADE.root)jadeRange(); // (2026-10-13) la carte en place n'est plus jetée : rangée (voir LA CARTE GARDÉE)
  jadeEtatVide();
  try{coinSymbole((JADE_JEU||(LVL.cur&&LVL.cur.sansFin))&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on?'Y':LVL.cur&&LVL.cur.crypto&&!PARK.on?'B':'$');}catch(e){} // (2026-10-12) les pièces du SOLEIL DE JADE frappées du ¥
  try{jadeEauRaz();}catch(e){} // (2026-10-13) la mer : rien sous l'eau d'une piste à l'autre
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='jade'||!(NP>1)){if(started&&!gameOver)jadeOublie();return;} // une course sur un autre niveau : la carte rangée est libérée (au menu, elle attend le prochain JOUER)
  const cle=jadeCle(seed);
  if(JADE_GARDE.m&&JADE_GARDE.m.J.cle===cle){jadeReprend();return;} // LA MÊME VALLÉE : reprise telle quelle
  jadeOublie(); // une autre vallée : l'ancienne carte est libérée avant de bâtir
  let ok=false;
  try{jadeFini(jadeBatit(seed,cle));ok=true;}
  finally{if(JADE.root)jadePose(ok);}
}
/* LA CONSTRUCTION — un générateur (voir LES TRANCHES), mené d'une traite par buildJade. Il ne touche NI à la scène NI à la route NI aux
   uniformes (jadePose / jadeReprend s'en chargent). */
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé de la vallée change depuis le 18/10 (axe, ordre des monuments, humeurs), pas son décor — les mêmes rangs de piliers (mêmes
   densités, mêmes hauteurs autour de la route), la même jade vert-de-gris, autant de pins, de lianes, de cascades, de rayons et de brume à chaque
   vallée. Désormais, par vallée, un TIRAGE DE DÉCOR dans un flux à lui (`dr`, né de la graine du décor : jamais `jr`), treize choix indépendants
   (`JADE.dz`, lisible dans `dbgJade().deco`) — (v16, Léo : « évite les clichés en mode Chine ») ni pagode, ni lanterne, ni pavillon ne reviennent :
   · LA PIERRE (`teinte`) : jade (celle d'avant), émeraude, grès rose, ardoise, or d'automne — deux uniforms (uRocT, uVerT) dans le programme du verre
     de jade : même programme, 1 = l'image d'avant ;
   · LES PILIERS DU BORD (`dens`) : la vallée ouverte ×0,6, avant, la forêt de piliers ×1,25 (les trois rangs le long de la route) ;
   · LEUR HAUTEUR (`haut`) : des pics qui plongent sous la route (−70 m), avant, ou qui la dominent (+90 m) ;
   · LEUR CARRURE (`larg`) : fins ×0,75 (les gabarits étroits et hauts), avant, massifs ×1,3 ;
   · LE LOINTAIN (`loin`) : ×0,5 / 1 / 1,35 ;
   · LES ROCHERS QUI FLOTTENT (`roch`) : rares, avant, une NUÉE (3 montagnes sur 4, jusqu'à 4 rochers chacune) ;
   · LA FORÊT PEINTE (`pins`) : clairsemée ×0,45, avant, dense ×1,2, et la part des pins ;
   · LES LIANES (`lian`) : aucune, peu, avant, des rideaux ;
   · LES CASCADES (`casc`) : rares, avant, partout ;
   · LES RAYONS (`ray`), LES NUAGES (`nua`), LA BRUME (`brume` : son nombre et sa part au ras de l'eau) ;
   · L'EAU (`eau`) : basse, avant, haute (le fleuve du ciel, à 165 / 185 / 210 m au-dessus de la mer de nuages).
   La règle d'or ne bouge pas : chaque pilier passe par `regle` (SOUS la dalle à 45 m, ou au-dessus à 70 m). `?sans=jadedecor` = la vallée d'avant,
   au tirage près (aucun tirage de plus dans `jr`). */
const JADE_TEINTES=[['jade',1.3,[1,1,1],[1,1,1]],['émeraude',1,[.84,1.08,.96],[.82,1.18,.92]],['grès rose',1,[1.18,.94,.88],[1.05,1,.9]],['ardoise',.9,[.84,.9,1.1],[.88,1,1.08]],['or d\'automne',.9,[1.06,1,.9],[1.55,1.12,.55]]];
function jadeDecoTire(seed){
  const dr=mulberry32((seed^0xDEC01A)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  {const t=pds(JADE_TEINTES);D.roc=t[2];D.ver=t[3];li.push('pierre '+t[0]);}
  {const d=ch([[.6,'vallée ouverte'],[1,'piliers'],[1.25,'forêt de piliers']]);D.dens=d[0];li.push(d[1]);}
  {const h=ch([[-70,'pics bas'],[0,'pics à hauteur'],[90,'pics dominants']]);D.haut=h[0];li.push(h[1]);}
  {const l=ch([[.75,'fins'],[1,'moyens'],[1.3,'massifs']]);D.larg=l[0];li.push('piliers '+l[1]);}
  D.loin=ch([.5,1,1.35]);li.push('lointain ×'+D.loin);
  {const r=ch([[.18,3,'rares'],[.5,3,'comme avant'],[.75,4,'une nuée']]);D.roch={p:r[0],n:r[1]};li.push('rochers flottants : '+r[2]);}
  {const p=ch([.45,1,1.2]),q=ch([.32,.62,.9]);D.pins={k:p,pin:q};li.push('forêt peinte ×'+p+', '+Math.round(q*100)+' % de pins');}
  D.lian=ch([0,.5,1,1.6]);li.push('lianes ×'+D.lian);
  {const c=ch([[.03,8,'rares'],[.11,16,'comme avant'],[.26,26,'partout']]);D.casc={p:c[0],n:c[1]};li.push('cascades '+c[2]);}
  D.ray=ch([.45,1,1.5]);li.push('rayons ×'+D.ray);
  D.nua=ch([.6,1,1.4]);li.push('nuages ×'+D.nua);
  {const b=ch([.6,1,1.5]),lo=ch([.25,.45,.7]);D.brume={n:b,bas:lo};li.push('brume ×'+b+' ('+Math.round(lo*100)+' % au ras de l\'eau)');}
  D.eau=ch([165,185,210]);li.push('eau '+(D.eau<185?'basse':D.eau>185?'haute':'comme avant'));
  D.li=li;return D;}
function* jadeBatit(seed,cle){
  const t00=performance.now(),M9=jadeMats(),G=jadeGabarits(),jr=mulberry32((seed^0x1ADE5EED)>>>0),Q=JADE.Q||{};
  const DZ=JADE_DECOR?jadeDecoTire(seed):null;JADE.dz=DZ;JADE.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage de cette vallée */
  const root=new THREE.Group();root.matrixAutoUpdate=false;JADE.root=root;
  let yMin=1e9,yMax=-1e9;for(let i=0;i<NP;i+=4){if(pts[i].y<yMin)yMin=pts[i].y;if(pts[i].y>yMax)yMax=pts[i].y;}
  JADE.merY=yMin-230;JADE.eauY=JADE.merY+(DZ?DZ.eau:185); // (v17, Léo : « l'eau plus haute, elle vient frapper les montagnes ») les montagnes sont posées comme avant (pied ≥ merY + 90) ; l'eau monte à merY + 140 : celles du bas trempent
   // LA MER DE NUAGES, loin sous les montagnes : elles flottent — (v14, Léo : « remonte le niveau de l'eau ») 470 → 230 m sous le point le plus bas de la route
  const HB=120,grille=new Map(),pas=Math.max(1,Math.round(10/(L/(NP-1))));
  for(let i=0;i<NP;i+=pas){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const sDe=v=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi;};
  const zonesNu=[];let iPorte=-1,iPont=-1;
  if(Q.porte0&&Q.porte1)iPorte=Math.round((sDe(Q.porte0.p)+sDe(Q.porte1.p))/2);
  if(Q.pont0&&Q.pont1)iPont=Math.round((sDe(Q.pont0.p)+sDe(Q.pont1.p))/2);
  // ---- LES MONTAGNES : [x, z, rayon (m), y du pied (la pointe), y du sommet, gabarit, quart de tour, graine, distance à la route] ----
  const PIL=[],PG=new Map(),PGC=120,mer=JADE.merY+90,snap=v=>Math.round(v/VX)*VX;
  const pgVois=(x,z,cb)=>{const bx=Math.floor(x/PGC),bz=Math.floor(z/PGC);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=PG.get((bx+dx)+','+(bz+dz));if(a)for(const q of a)if(cb(q))return true;}return false;};
  const pose=q9=>{PIL.push(q9);const kk=Math.floor(q9[0]/PGC)+','+Math.floor(q9[1]/PGC);let a9=PG.get(kk);if(!a9)PG.set(kk,a9=[]);a9.push(q9);};
  const regle=(cx,cz,rm,yt,Hs)=>{ // LA RÈGLE D'OR à deux issues : SOUS la dalle (sommet −45 m) ou AU-DESSUS (pointe +70 m) — null si ni l'une ni l'autre
    let lo=1e9,hi=-1e9;const clr=rm+ROAD_HALF+18;
    proches(cx,cz,clr,function(i){const p=pts[i];if(Math.hypot(p.x-cx,p.z-cz)>clr)return;lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);});
    if(hi>-1e9&&yt>lo-45&&yt-Hs<hi+70){const tU=Math.floor((lo-45)/VX)*VX,tA=Math.ceil((hi+70+Hs)/VX)*VX,okU=tU-Hs>=mer,okA=tA<hi+760;
      if(okU&&(!okA||yt-tU<=tA-yt))return tU;if(okA)return tA;return null;}
    return yt;};
  const tente=(cx,cz,r,yt,vert,dR,libre)=>{
    const t=jadeTplDe(r),T9=G.p[t],rm=T9.rmax*VX,Hs=T9.yTop*VX;cx=snap(cx);cz=snap(cz);
    if(!libre)for(const z of zonesNu)if(Math.hypot(cx-z[0],cz-z[1])<z[2]+rm)return false;
    yt=Math.floor(yt/VX)*VX;if(yt-Hs<mer)yt=Math.ceil((mer+Hs)/VX)*VX; // elle FLOTTE : sa pointe reste au-dessus de la mer
    yt=regle(cx,cz,rm,yt,Hs);if(yt==null)return false;
    if(pgVois(cx,cz,function(q){return Math.hypot(q[0]-cx,q[1]-cz)<(q[2]+rm)*.9;}))return false;
    pose([cx,cz,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),dR]);return true;};
  const touffe=(cx,cz,r0,yN,hMin,hMax,n,vert,dR)=>{let ok=0;
    for(let k=0;k<n;k++){const r=r0*(.55+jr()*.6),an=jr()*6.283,dd=k===0?0:(r0+r)*(.9+jr()*.5);
      if(tente(cx+Math.cos(an)*dd,cz+Math.sin(an)*dd,r,yN+hMin+(hMax-hMin)*Math.pow(jr(),.8),vert,dR+dd))ok++;}
    return ok;};
  if(iPorte>0){const p=pts[iPorte],b=B[iPorte];zonesNu.push([p.x,p.z,140]);for(let k=-6;k<=6;k++)zonesNu.push([p.x+b.x*k*85,p.z+b.z*k*85,95]);}
  if(iPont>0){const p=pts[iPont],t=T[iPont];for(let k=-3;k<=3;k++)zonesNu.push([p.x+t.x*k*70,p.z+t.z*k*70,ROAD_HALF+(k===0?30:70)]);}
  const MOB=JADE_SOBRE?.35:TEL_NATIF?.7:1,pasR=Math.max(1,Math.round(46/(L/(NP-1))));
  const RANGS=[[ROAD_HALF+38,90,.27,10,30,-150,260,2],[170,200,.38,12,40,-200,330,3],[380,420,.46,16,56,-260,380,4]];
  for(let i=Math.round(120/(L/(NP-1)));i<NP;i+=pasR){if(performance.now()>JF.lim)yield;const t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.5)continue; // (LE PRÉ-BÂTI) les rendez-vous de jadeBatit ne servent qu'à une échéance finie (JF.lim) : au passage, elle est infinie
    const px=-t9.z/hl,pz=t9.x/hl;
    for(const sg of [-1,1])for(const R9 of RANGS){if(jr()>R9[2]*MOB*(DZ?DZ.dens:1))continue;
      const r=(R9[3]+jr()*(R9[4]-R9[3]))*(DZ?DZ.larg:1),lat=R9[0]+r+jr()*R9[1],al=(jr()-.5)*40;
      touffe(pts[i].x+px*sg*lat+t9.x/hl*al,pts[i].z+pz*sg*lat+t9.z/hl*al,r,pts[i].y,R9[5]+(DZ?DZ.haut:0),R9[6]+(DZ?DZ.haut:0),1+((jr()*R9[7])|0),1,lat);}}
  {const S=230,Rmax=TEL_NATIF?2100:2500,m=new Map(),pasC=Math.max(1,Math.round(S*.7/(L/(NP-1))));
   for(let i=0;i<NP;i+=pasC){if(performance.now()>JF.lim)yield;const cx0=Math.round(pts[i].x/S),cz0=Math.round(pts[i].z/S),rr=Math.ceil(Rmax/S);
     for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const gx=(cx0+dx)*S,gz=(cz0+dz)*S,d=Math.hypot(gx-pts[i].x,gz-pts[i].z);if(d>Rmax)continue;
       const k=(cx0+dx)+','+(cz0+dz),o=m.get(k);if(!o||d<o[0])m.set(k,[d,i,gx,gz]);}}
   for(const v of m.values()){if(v[0]<700||jr()>.55*MOB*(DZ?DZ.loin:1))continue;
     touffe(v[2]+(jr()-.5)*S*.7,v[3]+(jr()-.5)*S*.7,20+jr()*36,pts[v[1]].y,-260,420,1+((jr()*4)|0),.85,v[0]);}}
  const ARB=[];
  const tP0=performance.now();if(iPorte>0){try{yield* jadePorte(root,iPorte,jr,M9,function(x,z,r,yt){return tente(x,z,r,yt,1,60,true);});}catch(e){console.warn('porte',e);JADE.porte=null;}}
  const tP1=performance.now();if(iPont>0){try{yield* jadePont(root,iPont,jr,M9,pose,ARB);}catch(e){console.warn('pont',e);JADE.pont=null;}}JADE.msPorte=Math.round(tP1-tP0);JADE.msPont=Math.round(performance.now()-tP1);
  if(performance.now()>JF.lim)yield;
  // ---- LES ROCHERS EN CUBES qui flottent autour des montagnes (des gabarits à part : JADE_NTPL et suivants) ----
  {const n0=PIL.length;for(let k=0;k<n0;k++){const q=PIL[k];if(JADE_SOBRE||q[8]>1600||jr()>(DZ?DZ.roch.p:.5))continue;const T9=G.p[q[5]];
    for(let j=0,n=1+((jr()*(DZ?DZ.roch.n:3))|0);j<n;j++){const t=JADE_NTPL+((jr()*3)|0),Tr=G.p[t],th=jr()*6.2832,rr=q[2]+12+jr()*45,x=snap(q[0]+Math.cos(th)*rr),z=snap(q[1]+Math.sin(th)*rr),rm=Tr.rmax*VX,Hs=Tr.yTop*VX;
      const yt=Math.floor((q[3]+(T9.Hb+jr()*T9.H*.65)*VX)/VX)*VX;if(yt-Hs<mer)continue;
      let ok=true;proches(x,z,rm+ROAD_HALF+14,function(i){const p=pts[i];if(Math.abs(p.y-yt+Hs/2)<Hs+30&&Math.hypot(p.x-x,p.z-z)<rm+ROAD_HALF+14)ok=false;});
      if(!ok||pgVois(x,z,function(q2){return Math.hypot(q2[0]-x,q2[1]-z)<(q2[2]+rm)*.95&&yt>q2[3]-10&&yt-Hs<q2[4]+10;}))continue;
      pose([x,z,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),1e9]);}}}
  // ---- LA FORÊT PEINTE (pins, touffes) sur les cimes et les corniches, LES LIANES sous les montagnes, les TEMPLES, les CASCADES ----
  const PAG=[],PAV=[],CHU=[],V3=new THREE.Vector3(),Mt=new THREE.Matrix4();
  let qCur=null;JCH.fixe=new Set();
  const arb=(x,y,z,w,h,cell)=>{ARB.push({x:x,y:y,z:z,j:[w,h,cell,jr()],pq:qCur});};
  for(const q of PIL){if(performance.now()>JF.lim)yield;const d=q[8];if(!(d<(TEL_NATIF?700:1000)))continue;const T9=G.p[q[5]],mP=jadeMatPilier(q,0);qCur=q;
    const nA=Math.min(DZ?72:60,Math.round(T9.tops.length*.9*(VX/3.5)*(VX/3.5)*(DZ?DZ.pins.k:1))); // (v7) la même forêt au m² qu'avec des cubes de 3,5 m
    for(let k=0;k<nA&&T9.tops.length;k++){const c=T9.tops[(jr()*T9.tops.length)|0];V3.set(c[0]+.15+jr()*.7,c[1]+1,c[2]+.15+jr()*.7).applyMatrix4(mP);const pin=jr()<(DZ?DZ.pins.pin:.62),h=pin?11+jr()*11:5+jr()*5;arb(V3.x,V3.y,V3.z,h*(pin?.95:1.35),h,pin?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<Math.min(12,T9.cor.length);k++){const c=T9.cor[(jr()*T9.cor.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);const h=7+jr()*9;arb(V3.x,V3.y,V3.z,h,h,jr()<.6?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<Math.min(DZ?Math.round(16*DZ.lian):16,T9.des.length);k++){const c=T9.des[(jr()*T9.des.length)|0];V3.set(c[0]+.5,c[1],c[2]+.5).applyMatrix4(mP);const h=24+jr()*50;arb(V3.x,V3.y,V3.z,14+jr()*12,-h,6+((jr()*2)|0));}
    if(q[5]>=3&&d<700&&T9.tops.length){let bc=null,bd=1e9;for(const c of T9.tops){const e=Math.hypot(c[0]+.5-T9.M,c[2]+.5-T9.M);if(e<bd){bd=e;bc=c;}}
      V3.set(bc[0]+.5,bc[1]+1,bc[2]+.5).applyMatrix4(mP);if(PAG.length<7&&jr()<.16){PAG.push([V3.x,V3.y,V3.z,1.1+jr()*.4]);JCH.fixe.add(q);}else if(PAV.length<10&&jr()<.14){PAV.push([V3.x,V3.y,V3.z,1.3+jr()*.4]);JCH.fixe.add(q);}}
    if(CHU.length<(JADE_SOBRE?4:DZ?DZ.casc.n:16)&&T9.H*VX>260&&jr()<(DZ?DZ.casc.p:.11)){ // UNE CASCADE : d'une cellule au bord (l'air à côté), vers le vide
      const L9=T9.cor.concat(T9.tops);for(let tries=0;tries<12;tries++){const c=L9[(jr()*L9.length)|0];if(!c||c[1]<T9.H*.7)continue;
        const o=[[1,0],[-1,0],[0,1],[0,-1]].find(function(o9){return !voxAt(T9.G,c[0]+o9[0],c[1],c[2]+o9[1])&&!voxAt(T9.G,c[0]+o9[0],c[1]-1,c[2]+o9[1]);});if(!o)continue;
        V3.set(c[0]+.5+o[0]*.55,c[1]+.6,c[2]+.5+o[1]*.55).applyMatrix4(mP);const w=jadeQuart(q[6],o[0],o[1]);
        CHU.push([V3.x,V3.y,V3.z,w[0],w[1],8+jr()*9,Math.max(20,V3.y-JADE.eauY)*(.55+jr()*.35),jr()]);JCH.fixe.add(q);break;}}}
  qCur=null;
  /* ---- (2026-10-21, embellie) LES CRISTAUX DE JADE : des grappes sur les cimes et les corniches, du côté de la route (voir jadeCristalPeint). Posés par un générateur
     LOCAL (`jc`) : ni `jr` (les montagnes, les arbres, les cascades) ni le hasard de la piste ne sont touchés. De simples instances de la famille des arbres. ---- */
  const CRI=[];
  {const jc=mulberry32((seed^0xC215A1)>>>0),kc=PAL.b('jadeCristaux',1),V9=new THREE.Vector3();
   for(const q of PIL){if(performance.now()>JF.lim)yield;if(q[5]>=JADE_NTPL||!(q[8]<(TEL_NATIF?650:900)))continue;
     const r0=jc(),nn=1+((jc()*2.4)|0);if(r0>.62*kc)continue;
     const T9=G.p[q[5]],mP=jadeMatPilier(q,0);
     for(let k=0;k<nn;k++){let best=null,bd=1e9;
       for(let t=0;t<6;t++){const lst=jc()<.5&&T9.cor.length?T9.cor:T9.tops;if(!lst.length)continue;const c=lst[(jc()*lst.length)|0];
         V9.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);let d=1e9;
         proches(V9.x,V9.z,640,function(i){const e=pts[i],dd=Math.hypot(e.x-V9.x,e.z-V9.z);if(dd<d)d=dd;});
         if(d<bd){bd=d;best=[V9.x,V9.y,V9.z];}}
       if(!best||bd>=640||bd<ROAD_HALF+25)continue;
       const h=15+jc()*20;CRI.push({x:best[0],y:best[1],z:best[2],j:[h*(.9+jc()*.3),h,jc()<.6?8:9,jc()],pq:q});}}}
  if(performance.now()>JF.lim)yield;
  // ---- LA POSE : par QUARTIERS de 360 m (le tri, c'est jadeTri) ----
  const QC=160,quart=new Map(),qDe=(x,z)=>{const k=Math.floor(x/QC)+','+Math.floor(z/QC);let o=quart.get(k);if(!o)quart.set(k,o={k:quart.size,x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9});return o;};
  const ext=(o,x,y0,y1,z,r)=>{o.x0=Math.min(o.x0,x-r);o.x1=Math.max(o.x1,x+r);o.y0=Math.min(o.y0,y0);o.y1=Math.max(o.y1,y1);o.z0=Math.min(o.z0,z-r);o.z1=Math.max(o.z1,z+r);};
  const vue=jadeVueGeo;
  const famille=(geo,mat,items,b0,b1)=>{if(!items.length||(geo.index&&!geo.index.count))return;
    items.sort(function(a,b){return a.q.k-b.q.k;});
    const n=items.length,F={n:n,M:new Float32Array(n*16),J:new Float32Array(n*4),r:new Map(),b0:b0,b1:b1,tri:(geo.index?geo.index.count:geo.attributes.position.count)/3};
    let a=0;for(let i=0;i<n;i++){const it=items[i];F.M.set(it.m,i*16);F.J.set(it.j,i*4);if(i===n-1||items[i+1].q!==it.q){F.r.set(it.q.k,[a,i+1]);a=i+1;}}
    {const nr=F.r.size;F.rK=new Int32Array(nr);F.rA=new Int32Array(nr);F.rB=new Int32Array(nr);let i9=0;for(const [k,r] of F.r){F.rK[i9]=k;F.rA[i9]=r[0];F.rB[i9]=r[1];i9++;}} // (2026-10-14) la même liste en tableaux : jadeTri la parcourt sans rien allouer (voir jadeTri)
    if(items.some(function(it){return it.pq;}))F.tq=items.map(function(it){return it.pq||null;}); // (v14) les arbres : leur montagne (l'effondrement les emporte)
    if(items[0].pi!==undefined){F.pidx=new Map();F.qk=new Int32Array(n);F.dst=new Map();for(let i=0;i<n;i++){F.pidx.set(items[i].pi,i);F.qk[i]=items[i].q.k;}} // (v8) pour céder une montagne aux cubes fins
    const g=vue(geo);F.im=new THREE.InstancedMesh(g,mat,n);F.im.frustumCulled=false;F.im.matrixAutoUpdate=false;
    F.aJ=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);F.aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aJ',F.aJ);
    F.im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);F.im.count=0;root.add(F.im);JADE.fam.push(F);
    if(mat===M9.vr){F.im.renderOrder=3;F.im2=new THREE.InstancedMesh(g,M9.vrX,n);F.im2.instanceMatrix=F.im.instanceMatrix;F.im2.frustumCulled=false;F.im2.matrixAutoUpdate=false;F.im2.renderOrder=2;F.im2.count=0;root.add(F.im2); // la passe d'ABSORPTION jumelle (mêmes tampons)
      F.im3=new THREE.InstancedMesh(g,M9.vrP,n);F.im3.instanceMatrix=F.im.instanceMatrix;F.im3.frustumCulled=false;F.im3.matrixAutoUpdate=false;F.im3.renderOrder=2.5;F.im3.count=0;root.add(F.im3);} // …et celle de la PROFONDEUR
    return F;};
  const parT=G.p.map(function(){return [[],[],[],[]];});
  {PIL.forEach(function(q,pi){const o=qDe(q[0],q[1]);ext(o,q[0],q[3]-8,q[4]+25,q[1],q[2]);for(let k=0;k<4;k++)parT[q[5]][k].push({q:o,m:jadeMatPilier(q,k).toArray(),j:[q[7],q[8]<2000||q[8]===1e9?1:.85,0,0],pi:pi});});
    for(let t=0;t<G.p.length;t++){if(performance.now()>JF.lim)yield;const Gt=G.p[t].geo;famille(Gt[0],M9.vr,parT[t][0],0,0);if(performance.now()>JF.lim)yield;famille(Gt[1],M9.vr,parT[t][1],1,1);if(performance.now()>JF.lim)yield;famille(Gt[2],M9.vrO,parT[t][2],2,4);if(performance.now()>JF.lim)yield;famille(Gt[3],M9.vrO,parT[t][3],5,5);}} // (v17) au-delà de 750 m : UNE passe opaque (le verre en trois passes coûtait 3× ses triangles)
  // (v8) LES CUBES MINUSCULES : une famille par gabarit, remplie à chaque image des montagnes proches (finProches) — elles quittent leur famille de 1,75 m
  if(performance.now()>JF.lim)yield;
  FIN.cap=parT.map(function(a){return Math.min(a[0].length,48);});FIN.vit=false;
  if(FIN.on)for(let t=0;t<G.p.length;t++)if(G.p[t].fin)finFamille(t);
  FIN.stamp=new Int32Array(PIL.length);FIN.was=new Uint8Array(PIL.length);FIN.gen=0;
  famille(G.arbreQ,M9.arb,ARB.concat(CRI).map(function(a){const o=qDe(a.x,a.z);ext(o,a.x,a.y-80,a.y+25,a.z,20);return {q:o,m:Mt.makeTranslation(a.x,a.y,a.z).toArray(),j:a.j,pq:a.pq};}),0,2);
  // (v16, « évite les clichés en mode Chine ») plus de pagodes ni de pavillons sur les cimes
  JADE.quart=[];for(const o of quart.values())JADE.quart[o.k]={c:new THREE.Vector3((o.x0+o.x1)/2,(o.y0+o.y1)/2,(o.z0+o.z1)/2),r:Math.hypot(o.x1-o.x0,o.y1-o.y0,o.z1-o.z0)/2+10,b:[o.x0,o.x1,o.y0,o.y1,o.z0,o.z1]};
  if(CHU.length){const m=new THREE.Mesh(jadeChutes(CHU),JADE_CHUTE_M);m.userData.jeter=true;m.frustumCulled=false;m.renderOrder=5;root.add(m);}
  {const RY=[],pasY=Math.max(1,Math.round(170/(L/(NP-1))));for(let i=0;i<NP;i+=pasY){if(JADE_SOBRE||jr()>.55*(DZ?DZ.ray:1))continue;const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl,sg=jr()<.5?-1:1,lat=60+Math.pow(jr(),1.3)*650;
     RY.push([pts[i].x+px*sg*lat,pts[i].y+40+jr()*160,pts[i].z+pz*sg*lat,22+jr()*55,650+jr()*600,jr(),.03+jr()*.05]);}
   if(RY.length){const m=new THREE.Mesh(jadeRayons(RY),JADE_RAYON_M);m.userData.jeter=true;m.frustumCulled=false;m.renderOrder=7;root.add(m);JADE.n9=RY.length;}}
  if(performance.now()>JF.lim)yield;
  // ---- LES NUAGES EN VOLUTES : loin autour de la route (au-dessus des montagnes, et quelques bancs bas sur le fleuve), quelques-uns au-dessus d'elle ----
  {const NU=[],pasN=Math.max(1,Math.round(360/(L/(NP-1)))); // (v17, Léo : « plus de nuages ») 480 → 360 m, quatre par pas au lieu de trois, une couche ENTRE les montagnes et des bancs bas sur l'eau
   for(let i=0;i<NP;i+=pasN){const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl;
     if(!JADE_SOBRE&&jr()<.55*(DZ?DZ.nua:1)){const sg=jr()<.5?-1:1,w=200+jr()*260,lat=ROAD_HALF+420+w*.5+jr()*900;NU.push([pts[i].x+px*sg*lat,pts[i].y-60+jr()*300,pts[i].z+pz*sg*lat,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);} // entre les montagnes
     for(let k=0;k<(JADE_SOBRE?0:4);k++){const r9=jr();if(r9>.8*(DZ?Math.min(1.2,DZ.nua):1))continue;const sg=jr()<.5?-1:1,haut=true,lat=haut?1000+Math.pow(jr(),.8)*3000:1500+jr()*2600,al=(jr()-.5)*700,w=haut?800+jr()*1100:1500+jr()*1300;
       const y=haut?pts[i].y+260+jr()*820:JADE.eauY+45+jr()*120;NU.push([pts[i].x+px*sg*lat+t9.x/hl*al,y,pts[i].z+pz*sg*lat+t9.z/hl*al,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);}
     if(jr()<.35){const sg=jr()<.5?-1:1,lat=250+jr()*500,w=600+jr()*600;NU.push([pts[i].x+px*sg*lat,pts[i].y+780+jr()*600,pts[i].z+pz*sg*lat,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);}} // au-dessus de la route
   }
  // ---- (v17) LES MONTAGNES QUE L'EAU FRAPPE : la section de chacune au ras de l'eau (le centre et le rayon des cubes de cette couche) ----
  {const E=[],V9=new THREE.Vector3();for(const q of PIL){if(q[3]>JADE.eauY-2||q[4]<JADE.eauY)continue;const T9=G.p[q[5]],Gd=T9.G,yl=Math.floor((JADE.eauY-q[3])/VX);if(yl<0||yl>=Gd.ny)continue;
     let n=0,sx=0,sz=0;for(let x=0;x<Gd.nx;x++)for(let z=0;z<Gd.nz;z++)if(voxAt(Gd,x,yl,z)){n++;sx+=x;sz+=z;}
     if(n<2)continue;V9.set(sx/n+.5,yl,sz/n+.5).applyMatrix4(jadeMatPilier(q,0));E.push({x:V9.x,z:V9.z,r:Math.sqrt(n/Math.PI)*VX,ph:jr()*6.283,t:0});}
   JADE.eauPil=E;JADE.eauT=0;}
  if(performance.now()>JF.lim)yield;
  // ---- LA GRILLE DES CHOCS (cases de 80 m) : chaque montagne et chaque rocher y est inscrit dans son cercle ; le test final lit SES cubes ----
  {const CG=80,g9=new Map();
   PIL.forEach(function(q,k){const re=q[2]+2;for(let gx=Math.floor((q[0]-re)/CG);gx<=Math.floor((q[0]+re)/CG);gx++)for(let gz=Math.floor((q[1]-re)/CG);gz<=Math.floor((q[1]+re)/CG);gz++){const kk=gx+','+gz;let a=g9.get(kk);if(!a)g9.set(kk,a=[]);a.push(k);}});
   JADE.col={g:g9,CG:CG,P:PIL};}
  // ---- LA BRUME QUI FLOTTE ----
  {const n0=Math.round((JADE_SOBRE?60:TEL_NATIF?150:240)*(DZ?DZ.brume.n:1)),itb=[],ib=[],Mx=new THREE.Matrix4();const pasB=Math.max(1,Math.floor(NP/n0));
   for(let i=0;i<NP;i+=pasB){const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl;
     for(let k=0;k<2;k++){const sg=jr()<.5?-1:1,lat=ROAD_HALF+60+Math.pow(jr(),1.4)*700,w=140+jr()*320,low=jr()<(DZ?DZ.brume.bas:.45);
       const y=low?JADE.eauY+20+jr()*100:pts[i].y-260+jr()*290;
       itb.push(pts[i].x+px*sg*lat+(jr()-.5)*120,y,pts[i].z+pz*sg*lat+(jr()-.5)*120);ib.push(w*(low?1.8:1),w*(low?.42:.3),jr(),low?.75:.38+jr()*.3);}}
   const n=itb.length/3,geo=new THREE.PlaneGeometry(1,1),im=new THREE.InstancedMesh(geo,JADE_BRUME_M,n);
   for(let k=0;k<n;k++){Mx.makeTranslation(itb[k*3],itb[k*3+1],itb[k*3+2]);im.setMatrixAt(k,Mx);}
   geo.setAttribute('aB',new THREE.InstancedBufferAttribute(new Float32Array(ib),4));im.userData.jeter=true;
   im.frustumCulled=false;im.renderOrder=4;root.add(im);JADE.brume=im;}
  JADE.depart=120; // (2026-10-12, Léo : « enlève les trucs en bois asiatiques ») plus d'arches de troncs au départ ni à l'arrivée
  if(performance.now()>JF.lim)yield;try{yield* jadeChutePrep(PIL,jr,root);}catch(e){console.warn('chute',e);}
  JADE.n={montagnes:PIL.filter(function(q){return q[5]<JADE_NTPL;}).length,rochers:PIL.filter(function(q){return q[5]>=JADE_NTPL;}).length,arbres:ARB.length,cristaux:CRI.length,temples:PAG.length+PAV.length,cascades:CHU.length,
    brume:JADE.brume?JADE.brume.count:0,quartiers:JADE.quart.length,porte:!!JADE.porte,pont:!!JADE.pont,ms:Math.round(performance.now()-t00),gabaritsMs:G.ms,
    L:Math.round(L),merY:Math.round(JADE.merY),eauY:Math.round(JADE.eauY),trempees:JADE.eauPil?JADE.eauPil.length:0,triGabarits:G.p.map(function(T9){return (T9.geo||T9.peau||[]).map(function(g){return g.index.count/3;});}),vitrail:false};
  JADE.cle=cle; // bâtie jusqu'au bout : elle pourra être gardée
}
function jadeRoute(){ // la route du jeu sur la jade : rails, lueur, liseré, flancs et ligne comme partout ailleurs (leurs valeurs de buildTrack)
  for(const m of NEON_RAILS){if(!m.userData.c0)m.userData.c0=m.color.getHex();m.visible=true;}for(const m of NEON_GLOW){if(m.userData.o0==null)m.userData.o0=m.opacity;m.visible=true;}
  const ac=NEON_RAILS[0]&&NEON_RAILS[0].userData.c0||0x4fe0a8,gl=NEON_GLOW[0]&&NEON_GLOW[0].userData.o0!=null?NEON_GLOW[0].userData.o0:.6;
  if(NEON_RAILS[0]){NEON_RAILS[0].color.setHex(ac);if(NEON_RAILS[0].userData.base)NEON_RAILS[0].userData.base.setHex(ac);NEON_RAILS[0].userData.hsl=null;} // (le caméléon garde la teinte mesurée : on la lui fait remesurer)
  if(NEON_GLOW[0]){NEON_GLOW[0].opacity=gl;NEON_GLOW[0].userData.base=gl;}
  ROAD_U.uAcc.value.setHex(0xf2b93b);if(JADE.flank)JADE.flank.color.setHex(0x3a3833); // le liseré et les catadioptres des tranches
  if(JADE.ligne)JADE.ligne.opacity=LIGNE_OPJ;}
/* (v14, Léo : « à la fin du niveau, des montagnes qui commencent à chuter, autour ») L'EFFONDREMENT — après le repère « chute » (les ~2 derniers
   km), les montagnes à moins de 900 m de la route tombent, l'une après l'autre, ~700 m avant que la caisse arrive à leur hauteur : elles
   TREMBLENT (0,9 s), puis basculent autour de leur pointe et tombent (8-15 m/s²) jusqu'à la mer, où elles soulèvent une gerbe de CUBES
   d'écume, et sombrent. Leurs pins et leurs lianes tombent avec elles ; celles qui portent une cascade ou un temple restent debout (ce sont
   des maillages fusionnés). Elles quittent la grille des chocs dès qu'elles bougent, mais gardent leur hitbox mobile (jadeHeurt, via c.inv). Les matrices des familles (F.M, via F.pidx / F.tq) et
   celles des cubes fins (FIN.mats) sont réécrites à chaque image ; au redémarrage, tout revient. */
const JCH={L:[],fixe:new Set(),splash:null,sp:[],t:0};
function* jadeChutePrep(PIL,jr,root){ // (LE PRÉ-BÂTI) un générateur : rendez-vous à l'échéance JF.lim
  JCH.L=[];JCH.sp.length=0;if(JADE.col)JADE.col.mort=new Set();
  /* (v16, Léo : « évite que les montagnes s'effondrent sur la route ; petit à petit : au début ça tient, après ça tombe un peu ») — sur TOUT
     le niveau : rien avant 18 %, puis quelques-unes, de plus en plus jusqu'à la fin (probabilité 6 % → 90 %) ; chacune BASCULE VERS
     L'EXTÉRIEUR (l'axe est ⟂ à la direction route → montagne : son sommet s'éloigne) et dérive en s'éloignant ; jamais celles qui
     surplombent la route ou la frôlent (à moins de ROAD_HALF + 30 m, au-dessus de la dalle). */
  for(let pi=0;pi<PIL.length;pi++){const q=PIL[pi];if((pi&31)===31&&performance.now()>JF.lim)yield;if(JCH.fixe.has(q))continue;let bi=-1,bd2=1e18;
    for(let i=0;i<NP;i+=3){const p=pts[i],d=(p.x-q[0])*(p.x-q[0])+(p.z-q[1])*(p.z-q[1]);if(d<bd2){bd2=d;bi=i;}}
    if(bi<0)continue;const dH=Math.sqrt(bd2),sN=bi/(NP-1)*L,u=sN/L;if(dH-q[2]>900||u<.18)continue;
    if(dH-q[2]<ROAD_HALF+30&&q[3]>pts[bi].y-12)continue;                                             // elle surplombe la route : elle tient
    if(jr()>.06+.84*Math.pow(THREE.MathUtils.smoothstep(u,.25,.93),1.3))continue;                    // de plus en plus vers la fin
    const dx=(q[0]-pts[bi].x)/(dH||1),dz=(q[1]-pts[bi].z)/(dH||1);
    JCH.L.push({pi:pi,q:q,sN:sN,dl:jr()*350,ax:new THREE.Vector3(dz,0,-dx),dx:dx,dz:dz,g:8+jr()*7,w:.12+jr()*.25,t0:0,fin:false,spl:false,orig:null});}
  // L'ÉCUME EN CUBES : une réserve de 700 cubes blancs (une instance), lancés à l'impact
  const g=new THREE.BoxGeometry(1,1,1),im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xf4f8fa,emissive:0x2a3238}),700);im.count=0;im.frustumCulled=false;im.userData.jeter=true;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(im);JCH.splash=im;}
/* (2026-10-14, passe perf mobile) ENVOI BORNÉ d'une InstancedMesh recopiée en tête chaque image : seules les n premières instances (réécrites
   cette image) partent à la puce — pas les 700 / 1 800 places du tampon — et RIEN quand n===0 (le mesh est caché). coul : la teinte aussi (3 par instance). */
function imEnvoi(im,n,coul){if(!(n>0))return;const a=im.instanceMatrix;a.updateRange.offset=0;a.updateRange.count=n*16;a.needsUpdate=true;
  if(coul&&im.instanceColor){const c=im.instanceColor;c.updateRange.offset=0;c.updateRange.count=n*3;c.needsUpdate=true;}}
const JCH_M=new THREE.Matrix4(),JCH_R=new THREE.Matrix4(),JCH_T=new THREE.Matrix4(),JCH_A=new THREE.Matrix4(),JCH_V=new THREE.Vector3(),JCH_Z=new Float32Array(16);
/* ===== L'EFFONDREMENT S'ARRÊTE AVEC LA PAUSE (24/10, relecture : « une montagne qui tombait sautait d'un coup au retour de pause ») ===== son
   horloge était JADE_U.uTime, qui avance aussi en pause (le temps réel) alors que jadeChuteTick n'y tourne pas : au retour, chaque montagne en
   chute avait pris toute la durée de la pause d’un coup (5 s de pause : 140 à 270 m de chute en une image, l’écume partait, sa hitbox avec). JCH.t ne
   compte que le temps joué (preuve-chute-pause.cjs). */
function jadeChuteTick(dt){
  if(!JCH.L.length||!JADE.root||!started||gameOver)return;let chg=false;JCH.t+=dt;const tn=JCH.t;
  for(const c of JCH.L){
    if(!c.t0){if(s>c.sN-700-c.dl&&mode!=='boom'){c.t0=tn;if(JADE.col&&JADE.col.mort)JADE.col.mort.add(c.pi);if(!c.inv)c.inv=new THREE.Matrix4();c.inv.identity();jadeChuteOrig(c);
      if(carGroup.position.distanceTo(JCH_V.set(c.q[0],carGroup.position.y,c.q[1]))<500)shake=Math.max(shake,.12);}else continue;}
    if(c.fin)continue;chg=true;const q=c.q,t=tn-c.t0,tf=Math.max(0,t-.9),dy=.5*c.g*tf*tf,th=Math.min(1.25,.5*c.w*tf*tf),jx=t<.9?Math.sin(t*57)*.35*(t/.9):0;
    const dr=.6*c.g*tf*tf*.25;JCH_T.makeTranslation(q[0]+jx+c.dx*dr,q[3]-dy,q[1]+c.dz*dr); // (elle s'éloigne de la route en tombant)
    JCH_R.makeRotationAxis(c.ax,th);JCH_M.multiplyMatrices(JCH_T,JCH_R);JCH_A.makeTranslation(-q[0],-q[3],-q[1]);JCH_M.multiply(JCH_A); // D = T(pivot)·T(0,−dy,0)·R·T(−pivot)
    if(!c.spl&&q[3]-dy<JADE.eauY+6){c.spl=true;jadeEcume(q[0],JADE.eauY,q[1],q[2]);}
    c.inv.copy(JCH_M).invert(); /* (2026-10-21, Léo : « on traverse les montagnes qui tombent ») la hitbox suit la montagne : le point testé est ramené dans son repère d'origine */
    const out=dy>(q[4]-JADE.eauY)+60;if(out)c.fin=true;
    for(const o of c.orig){const A=o.F.M;if(out)A.set(JCH_Z,o.si*16);else{JCH_R.fromArray(o.m);JCH_R.premultiply(JCH_M);JCH_R.toArray(A,o.si*16);}}
    if(c.fo){if(out)FIN.mats.set(c.pi,JCH_Z);else{JCH_R.fromArray(c.fo);JCH_R.premultiply(JCH_M);FIN.mats.set(c.pi,new Float32Array(JCH_R.elements));}}}
  if(chg){for(const c of JCH.L)if(c.t0&&c.orig&&(!c.fin||!c.vu)){c.vu=c.fin;for(const o of c.orig)o.F.sale=true;if(c.fo)FIN.sale=true;}JADE.sale=true;}
  // l écume
  const S9=JCH.sp,im=JCH.splash;if(im&&S9.length){let n=0;const M9=JCH_M;
    for(let i=S9.length-1;i>=0;i--){const p=S9[i];p.t+=dt;if(p.t>p.l){S9.splice(i,1);continue;}p.vy-=22*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      if(p.y<JADE.eauY-4){S9.splice(i,1);continue;}const k=p.sz*(1-Math.pow(p.t/p.l,3));M9.makeScale(k,k,k).setPosition(p.x,p.y,p.z);if(n<700)im.setMatrixAt(n++,M9);}
    im.count=n;im.visible=n>0;imEnvoi(im,n);}else if(im&&(im.count||im.visible)){im.count=0;im.visible=false;}}
function jadeChuteOrig(c){c.orig=[];
  for(const F of JADE.fam){if(F.pidx){const si=F.pidx.get(c.pi);if(si!==undefined)c.orig.push({F:F,si:si,m:F.M.slice(si*16,si*16+16)});}
    if(F.tq)for(let si=0;si<F.tq.length;si++)if(F.tq[si]===c.q)c.orig.push({F:F,si:si,m:F.M.slice(si*16,si*16+16)});}
  if(FIN.on&&JADE.geos&&JADE.geos.p[c.q[5]]&&FIN.cap)c.fo=Float32Array.from(finMat(c.pi));}
/* (v17) L'EAU QUI FRAPPE : les 12 montagnes trempées les plus proches passent au ciel peint (l'anneau d'écume autour d'elles, uEauP), et de
   loin en loin une GERBE de cubes d'écume jaillit de leur pied (la même réserve que l'effondrement) — devant soi, à moins de 900 m. */
function jadeEauTick(dt){const E=JADE.eauPil;if(!E||!E.length)return;const cp=camera.position,U=skyU.uEauP.value;
  JADE.eauT-=dt;if(JADE.eauT<=0){JADE.eauT=.25;const L9=JADE.eauNear||(JADE.eauNear=[]);L9.length=0;
    for(const e of E){const d=(e.x-cp.x)*(e.x-cp.x)+(e.z-cp.z)*(e.z-cp.z);if(d<2600*2600){e.d=d;L9.push(e);}}
    L9.sort(function(a,b){return a.d-b.d;});if(L9.length>12)L9.length=12;
    for(let i=0;i<12;i++){const e=L9[i];if(e)U[i].set(e.x,e.z,e.r,e.ph);else U[i].set(0,0,-1,0);}}
  if(paused||!started||gameOver||!JCH.splash)return;const L9=JADE.eauNear;if(!L9||!L9.length)return;
  const fx=camera.getWorldDirection(JCH_V);
  for(const e of L9){if(e.d>900*900)continue;e.t-=dt;if(e.t>0)continue;e.t=.9+Math.random()*2.2;
    const dx=e.x-cp.x,dz=e.z-cp.z;if(dx*fx.x+dz*fx.z<0)continue;
    const a0=Math.random()*6.2832,n=8+(Math.random()*10|0);
    for(let k=0;k<n&&JCH.sp.length<650;k++){const a=a0+(Math.random()-.5)*1.6,rr=e.r*(.92+Math.random()*.2),v=4+Math.random()*7;
      JCH.sp.push({x:e.x+Math.cos(a)*rr,y:JADE.eauY+1,z:e.z+Math.sin(a)*rr,vx:Math.cos(a)*v,vy:11+Math.random()*17,vz:Math.sin(a)*v,sz:.7+Math.random()*1.6,t:0,l:1.2+Math.random()*1.1});}}}
function jadeEcume(x,y,z,r){const n=Math.min(90,30+r*1.6|0);
  for(let k=0;k<n;k++){const a=Math.random()*6.2832,rr=r*(.4+Math.random()*.8),v=8+Math.random()*16;
    JCH.sp.push({x:x+Math.cos(a)*rr,y:y+2,z:z+Math.sin(a)*rr,vx:Math.cos(a)*v*.5,vy:14+Math.random()*30,vz:Math.sin(a)*v*.5,sz:1.5+Math.random()*3.5,t:0,l:2+Math.random()*1.6});}}
/* (2026-10-13, Léo : « fais en sorte que la voiture puisse plonger dans l'eau, ressortir, que ce soit comme le ciel ») LA MER COMME UN
   DEUXIÈME CIEL — au SOLEIL DE JADE (et dans la balade), tomber dans l'eau ne tue plus : on y VOLE.
   · LA POUSSÉE (jadeEauVol, dans la branche 'fall') : sous la surface, la gravité s'INVERSE (la poussée d'Archimède la retourne : +1 g
     vers le haut) et l'eau freine un peu ; le volant, le manche et la nitro marchent comme en l'air. On plonge, on ralentit, on remonte.
   · LE JAILLISSEMENT : la mer rend l'élan — on ressort au moins aussi vite qu'on est entré au PREMIER plongeon du vol (×EAU.rend) : on
     remonte jusqu'à la hauteur d'où l'on est tombé, de quoi reprendre la route. Les rebonds suivants ne grandissent jamais au-delà.
   · L'AIR : sous l'eau la jauge du vol se REMPLIT, et plus bas que le point de décollage elle ne baisse pas (la route est à 45-230 m
     au-dessus de l'eau : 200 m de chute durent 7 s, plus que les 6 s de la jauge) — on n'explose de temps de vol qu'en traînant AU-DESSUS, et le plongeon fatal sous la piste n'existe plus
     ici (le fond est à EAU.fond m — la poussée y ramène bien avant). Plongeon et jaillissement sont des FIGURES de la chaîne.
   · LA SURFACE suit la mer en cubes du ciel (jMerH, la même houle, lissée entre les cases pour la caisse, exacte pour l'objectif).
   · SOUS L'EAU (jadeSousTick) : la brume devient l'eau (turquoise, plus sombre en profondeur), le ciel du dôme devient le dessous de
     la mer (jadeSous : la fenêtre de Snell au-dessus, les rais de lumière), la PEAU (une grille de colonnes de 4 m qui suit la houle :
     vue d'en dessous, le miroir de l'eau et la fenêtre sur le ciel ; vue d'au-dessus, l'eau qui laisse deviner la caisse plongée), les
     montagnes montrent leur pied immergé, la caisse lâche des BULLES en petits cubes, la musique s'étouffe. */
/* (2026-10-13, 2e passe — Léo : « on n'a pas l'impression d'être dans l'eau : la physique, les éclaboussures, les gouttes, quand la voiture entre
   et ressort ») L'EAU SE SENT :
   · LE CHOC : l'eau est un mur — à l'impact la vitesse tombe à ×EAU.choc (à plat) … ×EAU.choc+.3 (à pic : on fend l'eau), secousse, coup de
     zoom, gros plouf grave. À PLAT ET VITE (moins de ~14° sous l'horizon) la caisse RICOCHE comme un galet (4 fois au plus par vol).
   · L'EAU ÉPAISSE : sous la surface la caisse freine fort (freinH, freinV), la poussée la remonte doucement — on flotte, on ralentit, on sent
     la masse d'eau ; la nitro y pousse comme une hélice.
   · LE JAILLISSEMENT reste un bond de dauphin : la mer rend la vitesse d'entrée (verticale ET horizontale, ×EAU.rend / ×.85) pour reprendre la route.
   · ÉCLABOUSSURES (EAUP, une réserve de 1 400 cubes d'eau à elle) : à l'entrée une COURONNE qui se lève + des centaines de GOUTTES qui partent
     loin et retombent ; à la sortie une COLONNE d'eau qui suit la caisse ; la caisse RUISSELLE 1,6 s (un chapelet de gouttes derrière elle) ;
     au ras de l'eau, un SILLAGE ; des ONDES qui s'élargissent sur la surface (EAUR).
   · L'OBJECTIF (LENS, une toile en pixels par-dessus l'image) : il sort de l'eau → une NAPPE qui s'égoutte vers le bas et des GOUTTES qui
     glissent sur la vitre ; il y entre → un voile clair et un nuage de bulles.
   · LE SON : sous l'eau tout passe dans un passe-bas (MASTER → filtre → BUSOUT, posé à la 1re plongée, grand ouvert sinon) ; un plouf grave
     à l'entrée, un jet à la sortie, des bloups de bulles sous l'eau. */
/* (2026-10-13, 3e passe — Léo : « pousse encore plus la physique, et mieux faite ») LA VRAIE PHYSIQUE DE L'EAU (réglée d'abord dans un
   simulateur à part, mêmes équations, mêmes unités que le vol) :
   · ARCHIMÈDE : la poussée suit la part IMMERGÉE de la caisse (`f`, de 0 à 1 sur EAU.H = 1,3 m) — B = 3,4 g quand elle est entière sous l'eau
     (nette +2,4 g), et la caisse FLOTTE à l'équilibre (f = 1/B : ~30 cm sous la surface), elle monte et descend avec la houle.
   · L'AMORTISSEMENT du pilonnement (cv) n'agit qu'au passage de la surface (f·(1−f)) : à flot, elle cesse de rebondir en ~1 s ;
     dessous, rien ne retient la remontée.
   · LA TRAÎNÉE ∝ v² (cq) + un peu de linéaire (cl), à proportion de l'immersion : à 600 km/h l'eau est un mur, au ralenti elle glisse.
   · LA GLISSE (hydroplanage) : vite et à moitié dans l'eau, une portance ∝ v² la soulève et la traînée baisse — la nitro en fait un jet-ski.
   · LE MOTEUR à flot : les roues brassent l'eau, la caisse file comme un bateau (~65 km/h) dans la direction du volant.
   · LE CHOC (vitesse ×choc … ×choc+chocK selon la pente) et le RICOCHET restent ; un simple contact (moins de 12 de vitesse verticale) ne
     fait qu'une ride.
   · LE JAILLISSEMENT : seulement après un vrai plongeon (plus de EAU.plonge = 6 m) — la remontée ACCÉLÈRE (la mer recrache), et l'on sort au
     moins à l'élan du premier plongeon du vol (×rend) ou à celui de la PROFONDEUR (on jaillit à ~2,5 × la profondeur atteinte) : plus on
     plonge profond, plus on saute haut. Une vague qui lâche la caisse ne fait qu'un petit bond.
   · L'ASSIETTE : dans l'eau la vrille s'arrête, la caisse se REDRESSE (le haut vers le ciel), à flot elle suit la pente de la houle et son
     nez garde le cap (jadeEauNez, branché sur l'orientation du vol).
   · À FLOT trop longtemps sans nitro (EAU.ramene s), la mer te RAMÈNE sur la route (pas de mort). */
const EAU={amorti:.85,paye:4, /* (2026-10-14, revue des idées de Léo) chaque sortie rendait vRef×1,06+4 : la caisse rebondissait SEULE entre la mer et sa hauteur, et chaque cycle payait REPLONGEON + HORS DE L'EAU + du flow, sans fin. Désormais l'élan rendu baisse de 15 % par plongeon du même vol (la profondeur, elle — un vrai geste à la nitro —, rend toujours son élan) et seuls les 4 premiers paient, comme le ricochet */
  B:3.4,H:1.3,cv:7,cl:.2,cq:.009,vPl:50,cP:1.2,mot:110,vB:95,choc:.55,chocK:.3,ricoA:.24,ricoV:55,rend:1.06,hRend:.85,profSaut:2.5,plonge:6,fond:420,ramene:9};
/* (2026-10-14, Sacha : « le gameplay quand tu vas dans l'eau pourrait être plus fun : là ça ralentit, alors qu'il pourrait y avoir une
   dimension où tu peux PLONGER et SURFER de manière cool ») LA MER QUI SE JOUE — par-dessus la physique de Léo (3e passe), rien n'en est retiré :
   · L'ENTRÉE GARDE L'ÉLAN : le choc ne prend plus que la vitesse VERTICALE (×choc) ; l'avance en garde 90 à 100 % (c'était ×0,55 à ×0,85
     sur tout : on s'arrêtait dans l'eau).
   · LE SURF : à la surface et vite (au-dessus de vPl, la glisse de Léo), l'eau ne freine presque plus (×surfK) — la caisse file sur sa
     carène, le volant taille des courbes dans la houle. « SURF ! » après 0,8 s tenue (une fois par passage dans l'eau), et la mer ne
     « ramène » plus une caisse qui surfe.
   · LE MANCHE PLONGE : dans l'eau le pouce haut / bas pousse la caisse vers le haut / le bas (manche × g), AVEC OU SANS nitro — on
     plonge exprès. Sous l'eau elle est profilée (avance freinée ×sousK seulement) ; on relâche, Archimède la recrache.
   · LE DAUPHIN DE MER : chaque jaillissement rend TOUTE l'avance de l'entrée (c'était 85 %), et les suivants du même vol l'augmentent
     (+6 % par plongeon, plafond +30 %) : plonger, jaillir, replonger = de plus en plus vite. Le nom de la figure compte les sauts.
   `?eau=ancien` = l'eau d'avant, au chiffre près. ⚠ Réglé à la lecture et au banc `dbgEau` : à juger en jeu. */
EAU.fun=!/[?&]eau=ancien\b/.test(location.search);EAU.surfK=.22;EAU.sousK=.4;EAU.manche=3.6;EAU.dauph=.06;EAU.dauphMax=.3;
const JEAU={surfT:0,y0:0,syF:NaN,vS:0,dans:false,f:0,wB:0,t:0,prof:0,vIn:0,vRef:0,hIn:0,n:0,rico:0,cd:0,k:0,sorti:9,goutT:0,bloop:0,flotT:0,cap:new THREE.Vector3(0,0,1),bul:[],im:null}; // cd : le répit après un ricochet ou une sortie (la houle monte et descend de plusieurs mètres)
const JSOUS={sous:false,sous0:false,bascT:9,prof:0,uK:0,N:48,peau:null,base:{c:new THREE.Color(),n:0,f:0},w:{c:new THREE.Color(),n:-1,f:-1,ok:false},c:new THREE.Color(),cA:new THREE.Color(.22,.64,.66),cB:new THREE.Color(.09,.34,.42)};
const JEAU_V=new THREE.Vector3(),JEAU_N=new THREE.Vector3();
function jadeVide(y){return jadeEauOk()?y<JADE.eauY-EAU.fond-200:y<trackMinY-120;} // le plongeon fatal : sous la piste… sauf au-dessus de la mer
function jadeEauOk(){return !!(JADE.root&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&isFinite(JADE.eauY));}
function jMerHJ(cx,cz,T){const px=cx*4,py=cz*4;let r=Math.sin(cx*41.3+cz*289.1)*43758.5453;r-=Math.floor(r); // la houle du ciel (JADE_EAU_GLSL), case par case
  return Math.floor(1.6*Math.sin(px*.0105+T*.95)+1.1*Math.sin(py*.0165-T*1.3+px*.004)+.8*Math.sin((px+py)*.024+T*1.9)+.7*Math.sin(px*.031-py*.027+T*1.6)+.55*Math.sin(px*.061+py*.047+T*2.7)+1.5*(r-.5)+.6*Math.sin(T*3.2+r*6.28));}
function jadeSurfCase(x,z){return JADE.eauY+jMerHJ(Math.floor(x/4),Math.floor(z/4),skyU.uEauT.value)*4;} // la colonne exacte (l'objectif)
function jadeSurf(x,z){const T=skyU.uEauT.value,u=x/4-.5,v=z/4-.5,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j; // lissée entre les centres des cases (la caisse : pas de marches)
  const a=jMerHJ(i,j,T),b=jMerHJ(i+1,j,T),c=jMerHJ(i,j+1,T),d=jMerHJ(i+1,j+1,T);return JADE.eauY+4*((a*(1-fu)+b*fu)*(1-fv)+(c*(1-fu)+d*fu)*fv);}
function jadeEauRaz(){JEAU.syF=NaN;JEAU.dans=false;JEAU.f=0;JEAU.wB=0;JEAU.t=0;JEAU.prof=0;JEAU.vIn=0;JEAU.vRef=0;JEAU.hIn=0;JEAU.n=0;JEAU.rico=0;JEAU.cd=0;JEAU.k=0;JEAU.sorti=9;JEAU.goutT=0;JEAU.flotT=0;JEAU.bul.length=0;if(JEAU.im)JEAU.im.count=0;
  EAUP.L.length=0;if(EAUP.im)EAUP.im.count=0;for(const r of EAUR.L){r.m.visible=false;r.t=9;}for(const c of COUR.L){c.m.visible=false;c.t=9;}SILL.P.length=0;if(SILL.mesh)SILL.mesh.visible=false;EAUB.L.length=0;if(EAUB.im)EAUB.im.count=0;LENS.g.length=0;LENS.nappe=0;LENS.flash=0;if(LENS.cv)LENS.cv.style.visibility='hidden';if(acesPass&&acesPass.uniforms.uLensK)acesPass.uniforms.uLensK.value=0;
  JSOUS.sous=JSOUS.sous0=false;JSOUS.uK=0;if(JSOUS.peau)JSOUS.peau.visible=false;skyU.uSous.value=0;JADE_U.uSous.value=0;eauFiltre(false,true);}
/* LA SURFACE DE LA PHYSIQUE : la mer en cubes du décor saute de 4 m d'une colonne à l'autre et monte jusqu'à ~30 m/s (MESURÉ : 12,7 m en
   0,4 s sous la caisse — elle avalait une caisse à flot et la faisait « jaillir »). La caisse flotte sur une houle CALMÉE : la moyenne des
   9 colonnes autour d'elle (12 m), deux fois moins haute, suivie à 4 m/s au plus et lissée (τ 0,6 s). Le décor, lui, ne change pas. */
function jadeSurfMoy(x,z){const T=skyU.uEauT.value,i=Math.floor(x/4),j=Math.floor(z/4);let h=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)h+=jMerHJ(i+a,j+b,T);return JADE.eauY+2+4*h/9*.55;} // (+2 : le dessus moyen d'une colonne, son plancher étant arrondi en dessous ; ×,55 : la houle de la physique, deux fois plus calme)
function jadeSurfPh(x,z,dt){const s9=jadeSurfMoy(x,z);if(!isFinite(JEAU.syF)||Math.abs(JEAU.syF-s9)>40||dt<=0){JEAU.syF=s9;JEAU.vS=0;return s9;}
  const dl=Math.max(-4*dt,Math.min(4*dt,(s9-JEAU.syF)*Math.min(1,dt/.6)));JEAU.syF+=dl;JEAU.vS=dl/dt;return JEAU.syF;} // vS : la vitesse de la surface (m/s), pour flotter AVEC elle
function jadeEauVol(dt,dtF){ // branche 'fall', AVANT que la position avance (la vitesse vient d'encaisser gravité, volant, manche, nitro)
  if(!jadeEauOk()){if(JEAU.dans)JEAU.dans=false;JEAU.f=0;return false;}
  const sy=jadeSurfPh(fallPos.x,fallPos.z,dt),d=sy-fallPos.y,f=Math.min(1,Math.max(0,d/EAU.H)),hv=Math.hypot(fallVel.x,fallVel.z),vmW=SPD*AIR_RATE,g=FALL_G*gK(); // d : profondeur du DESSOUS de la caisse · f : sa part immergée
  JEAU.f=f;
  if(fallPos.y<JEAU.y0-2)fallTR=Math.max(0,fallTR-dt); // sous le point de décollage, la mer rattrape : la jauge ne baisse pas
  if(JEAU.cd>0)JEAU.cd-=dt;
  if(!JEAU.dans&&d>0&&(JEAU.cd<=0||d>EAU.plonge)){
    const v=Math.max(1,fallVel.length()),pente=-fallVel.y/v;
    if(fallVel.y<0&&pente<EAU.ricoA&&hv>EAU.ricoV&&JEAU.rico<4&&d<2.5){ // ---- LE RICOCHET : à plat et vite, l'eau renvoie la caisse comme un galet ----
      JEAU.rico++;JEAU.cd=.4;fallVel.y=Math.abs(fallVel.y)*.55+15;fallVel.x*=.82;fallVel.z*=.82;fallPos.y=sy+.4;
      const k9=Math.min(1,hv/160);jadeCouronne(fallPos.x,sy,fallPos.z,.25+.3*k9,fallVel);
      shake=Math.max(shake,.3);fovPunch=Math.max(fovPunch,5);hap([10,14]);
      try{noiseBurst(.28,.13,1500);subBoom(.07);if(SONV2)sfx('flaque.eau',{vol:-3});}catch(e){} // (2026-10-14, session SON) un galet qui rebondit : ≈ −33 dBFS (était −25, au niveau d'un verdict) — le plus léger des trois bruits d'eau (ricochet < sortie < plongeon), audit oreille-neuve n°3 §1
      try{addTrick('ricochet',JEAU.rico>1?'RICOCHET ×'+JEAU.rico:'RICOCHET !',5*JEAU.rico,1,true);flowAdd(5,'risque');}catch(e){}
      return false;}
    JEAU.dans=true;JEAU.t=0;JEAU.prof=0;JEAU.flotT=0;JEAU.surfT=0;
    const vn=-fallVel.y;
    if(vn>12){ // ---- LE PLONGEON : le choc, la couronne, le plouf ----
      JEAU.n++;JEAU.vIn=vn;JEAU.hIn=hv;if(!JEAU.vRef)JEAU.vRef=vn;
      const k9=Math.min(1,v/170);
      if(EAU.fun){const kh=.9+.1*pente;fallVel.y*=EAU.choc+EAU.chocK*pente;fallVel.x*=kh;fallVel.z*=kh;} // (2026-10-14) l'eau prend la chute, pas l'élan
      else fallVel.multiplyScalar(EAU.choc+EAU.chocK*pente); // l'eau est un mur : à plat on s'écrase, à pic on la fend
      jadeCouronne(fallPos.x,sy,fallPos.z,.12+.88*k9,null); // la taille de la gerbe suit la vitesse
      jadeBullesJet(fallPos,20+90*k9,4);
      shake=Math.max(shake,.45+.5*k9);fovPunch=Math.max(fovPunch,9+10*k9);hap([20,30,40]);
      // (2026-10-14, session SON) le plouf de Léo (subBoom + deux noiseBurst) est GARDÉ, mais ramené au rang d'une grosse éclaboussure : il sortait à −17,5…−14,7 dBFS (presque l'explosion, −16),
      // maintenant −26…−22 (sous le cratère −20, au-dessus d'une pose −30), dosé par la force k9. Plus de doublon : le « pouf » d'ouate `nuage.entre` (−36, inaudible sous le plouf) est retiré ;
      // `flaque.eau` (le vrai son d'eau, les bulles) reste dessous, dosé aussi (−34 → −28). Et le moteur se creuse un peu, comme pour un grand moment (audit oreille-neuve n°3 §1).
      try{subBoom(.14+.14*k9);noiseBurst(.6,.14+.10*k9,520);noiseBurst(.9,.06+.05*k9,2600);if(SONV2)sfx('flaque.eau',{vol:-6+6*k9});duckT=Math.max(duckT,.15+.25*k9);}catch(e){}
      if(JEAU.n<=EAU.paye)try{addTrick('plongeon',JEAU.n>1?'REPLONGEON !':'PLONGEON !',6+4*k9,1);flowAdd(6,'risque');}catch(e){}}
    else{eauRide(fallPos.x,sy,fallPos.z,.15);try{if(SONV2)sfx('flaque.eau');}catch(e){}}} // un simple contact : une ride
  else if(JEAU.dans&&d<-.3&&fallVel.y>0){ // ---- ELLE QUITTE L'EAU ----
    JEAU.dans=false;JEAU.cd=.35;JEAU.sorti=0;
    if(JEAU.prof>EAU.plonge&&JEAU.t>.4){ // le JAILLISSEMENT : la colonne d'eau, la caisse qui ruisselle
      JEAU.goutT=1.6;
      const vr=Math.max(Math.min(JEAU.vIn,JEAU.vRef||JEAU.vIn)*EAU.rend*Math.pow(EAU.amorti,Math.max(0,JEAU.n-1))+4,Math.sqrt(2*g*EAU.profSaut*JEAU.prof/SPD));if(fallVel.y<vr)fallVel.y=vr; // l'élan du premier plongeon, ou celui de la profondeur — jamais plus
      {const h2=Math.hypot(fallVel.x,fallVel.z),hw=Math.max(h2,JEAU.hIn*(EAU.fun?1+Math.min(EAU.dauphMax,EAU.dauph*Math.max(0,JEAU.n-1)):EAU.hRend));if(h2>1){fallVel.x*=hw/h2;fallVel.z*=hw/h2;}else{fallVel.x=JEAU.cap.x*hw;fallVel.z=JEAU.cap.z*hw;}fallVH0=Math.max(fallVH0,hw);} // …et sa course : on repart vers la route
      fallTR=0;fallT=Math.min(fallT,.5); // l'air rendu : une jauge de vol neuve
      try{jdmJailli(fallVel.x*vmW,fallVel.y*vmW,fallVel.z*vmW);}catch(e){} // (2026-10-15, Léo) LES DAUPHINS DE LA MER sautent avec elle, une fois sur deux
      const k9=Math.min(1,fallVel.y/170);
      jadeColonne(fallPos.x,sy,fallPos.z,fallVel.y*vmW,.15+.85*k9);
      shake=Math.max(shake,.35);fovPunch=Math.max(fovPunch,11);hap([12,18,26]);airFlash=.6;
      // (2026-10-14, session SON) le jet de Léo est gardé, ramené de −23 à −30…−26 dBFS selon k9 (toujours sous le plongeon, ≈ −22) ; `nuage.sort` (−42) redisait le jet : retiré, `flaque.eau` et `air.regain` restent dessous
      try{noiseBurst(.8,.14+.08*k9,2200);noiseBurst(.5,.12+.08*k9,450);subBoom(.08+.06*k9);if(SONV2){sfx('flaque.eau',{vol:-4});sfx('air.regain');}}catch(e){}
      if(JEAU.t>.3&&JEAU.n<=EAU.paye){try{addTrick('jailli',EAU.fun&&JEAU.n>1?'HORS DE L\'EAU ×'+JEAU.n:'HORS DE L\'EAU !',8+Math.min(18,JEAU.prof*.12)+(EAU.fun?3*Math.min(5,Math.max(0,JEAU.n-1)):0),2);flowAdd(8,'risque');}catch(e){}}}
    else{JEAU.goutT=.6;jadeColonne(fallPos.x,sy,fallPos.z,fallVel.y*vmW,.08);}} // une vague la lâche, un bond de bateau : un petit jet
  if(!JEAU.dans){ // hors de l'eau : la caisse ruisselle, et au ras de la surface elle laisse un sillage
    if(JEAU.goutT>0){JEAU.goutT-=dt;const p=carGroup.position,n9=Math.random()<dt*70*Math.min(1,JEAU.goutT/1.6)?3:0;
      for(let k=0;k<n9;k++)eauP(p.x+(Math.random()-.5)*2.2,p.y-.2+(Math.random()-.5)*.8,p.z+(Math.random()-.5)*2.2,(Math.random()-.5)*1.5,-1-Math.random()*3,(Math.random()-.5)*1.5,.07+Math.random()*.13,1.6,sy);}
    if(d>-2.5&&hv>20)jadeSillage(sy,hv,dt,d);
    return false;}
  // ---- DANS L'EAU : Archimède, l'amortissement, la traînée, la glisse, le moteur ----
  JEAU.t+=dt;if(d>JEAU.prof)JEAU.prof=d;
  fallVel.y+=g*EAU.B*f*dtF;                                   // ARCHIMÈDE : la part immergée porte
  if(EAU.fun&&f>0&&(pitchS<0||fallVel.y<18))fallVel.y+=pitchS*(pitchS>0?.45:1)*g*EAU.manche*Math.min(1,f*2)*dtF; // (2026-10-14) LE MANCHE PLONGE : pouce bas = on plonge (avec ou sans nitro) ; pouce haut = un coup de rein vers la surface, bridé (au banc il lançait la caisse à 119 m)
  const recrache=JEAU.prof>EAU.plonge&&JEAU.t>.4&&fallVel.y>0&&f>=1;    // la remontée d'un vrai plongeon ACCÉLÈRE
  if(recrache)fallVel.y+=g*1.5*dtF;
  {const kk=1-Math.exp(-EAU.cv*Math.max(f*(1-f)*4,f<1?.6:0)*dtF);fallVel.y+=(JEAU.vS/vmW-fallVel.y)*kk;} // le pilonnement s'amortit PAR RAPPORT À LA SURFACE : à flot, la caisse monte et descend AVEC la houle (la gravité du jeu, ~8 m/s², est plus lente que la houle qui retombe : sans ça, elle décollait)
  {const v=fallVel.length(),pl=Math.min(1,Math.max(0,(hv-EAU.vPl)/60)),k=(EAU.cl+EAU.cq*v)*(.25+.75*f)*(1-.5*pl*(1-f)),e=Math.exp(-k*dtF);
   const eH=EAU.fun?Math.exp(-k*(f>=1?EAU.sousK:hv>EAU.vPl?EAU.surfK:1)*dtF):e; // (2026-10-14) en SURF et sous l'eau, l'avance n'est presque plus freinée
   fallVel.x*=eH;fallVel.z*=eH;fallVel.y*=recrache?Math.exp(-k*.3*dtF):e; // la traînée ∝ v², moindre en glisse
   if(f<.95&&hv>EAU.vPl)fallVel.y+=g*EAU.cP*pl*pl*Math.min(1,f*4)*dtF;} // LA GLISSE : vite et à moitié dans l'eau, elle se soulève
  if(f>.04&&f<1){const h2=Math.hypot(fallVel.x,fallVel.z);if(h2<EAU.vB){const a=EAU.mot*(1-h2/EAU.vB)*dtF; // LE MOTEUR : à flot, les roues brassent l'eau
    if(h2>2){fallVel.x+=fallVel.x/h2*a;fallVel.z+=fallVel.z/h2*a;}else{fallVel.x+=JEAU.cap.x*a;fallVel.z+=JEAU.cap.z*a;}}}
  fallVH0=Math.max(fallVH0,Math.hypot(fallVel.x,fallVel.z)); // ce que l'eau donne (moteur, glisse) n'est pas plafonné par l'élan du décollage
  if(d>EAU.fond&&fallVel.y<0)fallVel.y*=.85; // le fond (on n'y arrive pas : la poussée ramène bien avant)
  fallTR=Math.max(0,fallTR-dt*3); // la jauge du vol se remplit dans l'eau
  if(EAU.fun&&f<1&&f>.04&&hv>EAU.vPl){const a9=JEAU.surfT;JEAU.surfT+=dt;if(a9<.8&&JEAU.surfT>=.8){try{addTrick('surf','SURF !',8,1);flowAdd(5,'style');hap([8,20,8]);}catch(e){}}}
  if(f<1&&JEAU.t>1&&!(EAU.fun&&hv>EAU.vPl)){JEAU.flotT+=dt;if(JEAU.flotT>EAU.ramene&&!nitroOn){jadeEauRamene();return true;}}else JEAU.flotT=Math.max(0,JEAU.flotT-dt*2); // à flot trop longtemps : la mer te ramène
  if(f<1&&hv>14)jadeSillage(sy,hv,dt,d); // à flot ou en glisse : les deux nappes vers les côtés
  else if(f<1){JEAU.rideT=(JEAU.rideT||0)-dt;if(JEAU.rideT<=0){JEAU.rideT=.7+Math.random()*.5;eauRide(fallPos.x,sy,fallPos.z,.1);}} // à flot, lente : les ronds autour d'elle
  if(f>=1){if(Math.random()<dt*(nitroOn?45:18))jadeBullesJet(carGroup.position,nitroOn?5:2,1.8);
    JEAU.bloop-=dt;if(JEAU.bloop<=0){JEAU.bloop=.12+Math.random()*(nitroOn?.15:.4);eauBloop(nitroOn?1:.6);}}
  return true;}
function jadeEauRamene(){ // à flot depuis trop longtemps, sans nitro : la mer te ramène sur ta dernière route (comme le filet du mode facile — rien n'est perdu que la chaîne)
  JEAU.dans=false;JEAU.flotT=0;JEAU.f=0;airPie.style.display='none';airFlash=0;
  
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0;
  fallVel.set(0,0,0);fallPos.copy(carGroup.position); /* (2026-10-14, revue des idées de Léo) appelée AU MILIEU de la branche du vol : la suite (fallPos qui avance, pickupsTick, tryLand) tournait encore sur l'élan de la mer — elle reste immobile cette image-là, la route la reprend à la suivante */
  try{popTexte(sansAcc(TR('LA MER TE RAMENE')),'#7dffec',2);}catch(e){}try{if(SONV2)sfx('air.regain');}catch(e){}}
function jadeEauNez(nez,dt){ // dans l'orientation du vol : nez = la direction du nez (normalisée), à corriger ; FLY_U se redresse
  const ci=JEAU.dans?1:0;JEAU.wB+=(ci-JEAU.wB)*Math.min(1,dt*(ci?5:1.5));const w=JEAU.wB;if(w<.01)return;
  const hv=Math.hypot(fallVel.x,fallVel.z);if(hv>6)JEAU.cap.set(fallVel.x/hv,0,fallVel.z/hv);
  const V=JEAU_V,sp=fallVel.length();
  if(JEAU.f>=1&&sp>25)V.copy(fallVel).normalize(); // sous l'eau et vite : la trajectoire
  else{V.copy(JEAU.cap);V.y=THREE.MathUtils.clamp(fallVel.y/Math.max(30,hv),-.6,.6);V.normalize();} // à flot ou lente : le CAP, le nez levé/baissé par la vitesse verticale
  nez.lerp(V,w).normalize();
  const N=JEAU_N;if(JEAU.f<1&&JADE.root){const p=fallPos,e=4,sx=(jadeSurfMoy(p.x+e,p.z)-jadeSurfMoy(p.x-e,p.z))/(2*e),sz=(jadeSurfMoy(p.x,p.z+e)-jadeSurfMoy(p.x,p.z-e))/(2*e);N.set(-sx*.5,1,-sz*.5).normalize();}else N.set(0,1,0);
  FLY_U.lerp(N,Math.min(1,dt*3*w)).normalize();} // ARCHIMÈDE redresse la caisse ; à flot elle suit la pente de la houle
/* ===== (2026-10-14, passe SENSATIONS) L'EAU SE SENT — Sacha : « quand tu vas dans l'eau, que tu ressors, la flottaison… que toutes les
   petites sensations trouvent des petits détails pour les améliorer » =====
   La physique de la mer (Léo, 13/10) n'est PAS touchée : ces quatre détails ne lisent que JEAU / fallVel et n'écrivent que la CARROSSERIE
   (`carBody`, au repos pendant tout le vol), des gouttes de la réserve existante (`eauP`), des bulles, un bloop, un tic dans la main.
   · LE BOUCHON : à flot, la carrosserie ROULE et TANGUE sur ses flotteurs (deux ondes lentes par axe, ±4° / ±3°, ±7 cm de pilonnement) ;
     plus elle va vite (glisse, jet-ski), plus elle se cale — le bouchon, c'est à l'arrêt. Avant, à flot, elle était figée comme sur un socle.
   · LE BOUILLON : à flot et lente, le moteur brasse — un bouillon d'écume sort de la poupe, et l'eau CLAPOTE contre la coque (bloop rare).
   · LE CREUX DU PLONGEON : au point le plus bas d'un vrai plongeon, à l'instant où la mer la REPOUSSE, une gerbe de bulles et un tic léger
     dans la main — on sent le moment où ça repart vers le haut.
   · MOUILLÉE : sortie de l'eau, elle se POSE trempée — une gerbe aux roues au contact, puis les pneus crachent l'eau ~2,5 s (ça s'éteint). */
const SEAU={k:0,t:0,vy0:0,pose:false,clap:0,mouP:false};
function sensEau(dt){ // chaque image de VOL, après l'orientation de la caisse
  const flot=JEAU.dans&&JEAU.f>.04&&JEAU.f<1,hv=Math.hypot(fallVel.x,fallVel.z);
  SEAU.k+=((flot?1:0)-SEAU.k)*(1-Math.exp(-dt*(flot?2.2:5)));
  if(SEAU.k>.01){SEAU.t+=dt;const a=SEAU.k*(1-.6*Math.min(1,hv/120)),t=SEAU.t;
    carBody.rotation.set(a*(.045*Math.sin(t*3.1)+.02*Math.sin(t*5.3+1.3)),0,a*(.07*Math.sin(t*2.3+.7)+.025*Math.sin(t*4.1)));
    carBody.position.y=(VEQ.on?VEQ.ext:0)+a*.07*Math.sin(t*2.7+2.1);SEAU.pose=true;} // (2026-10-14, gameplay · accord) le pilonnement s'AJOUTE à la suspension pendante du vol de Léo (veqCorps : VEQ.ext, posée juste avant) — il l'écrasait : la carrosserie tombait de 11 cm d'un coup en touchant l'eau, et y remontait d'un coup en la quittant
  else if(SEAU.pose){carBody.rotation.set(0,0,0);carBody.position.y=VEQ.on?VEQ.ext:0;SEAU.pose=false;}
  if(flot&&hv<EAU.vB&&isFinite(JEAU.syF)){const sy=JEAU.syF,c=JEAU.cap;
    if(Math.random()<dt*(22+hv*.3)){eauPIm();eauP(fallPos.x-c.x*2+(Math.random()-.5)*1.5,sy+.15,fallPos.z-c.z*2+(Math.random()-.5)*1.5,-c.x*(2+Math.random()*3)+(Math.random()-.5)*2,1.4+Math.random()*2.4,-c.z*(2+Math.random()*3)+(Math.random()-.5)*2,.07+Math.random()*.1,.45+Math.random()*.4,sy,0);}
    SEAU.clap-=dt;if(SEAU.clap<=0){SEAU.clap=.7+Math.random()*1.1;eauBloop(.3);}}
  if(JEAU.dans&&JEAU.f>=1&&SEAU.vy0<0&&fallVel.y>=0&&JEAU.prof>EAU.plonge){jadeBullesJet(carGroup.position,14,2.2);eauBloop(.9);sensHap(12,1);}
  SEAU.vy0=JEAU.dans?fallVel.y:0;
  if(JEAU.dans)SEAU.mouP=false;}
function sensMouille(dt){ // chaque image de CONDUITE, dans les 2,6 s qui suivent une sortie de l'eau (JEAU.sorti, tenu par jadeSousTick)
  const k=Math.max(0,1-JEAU.sorti/2.6),v=Math.min(1,Math.abs(vA)/20),hw=CARS[level].w*.46,hl=CARS[level].l*.34;
  if(!SEAU.mouP){SEAU.mouP=true;for(let w=-1;w<=1;w+=2){DRIFT_V.set(w*hw,.1,-hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,5,7);DRIFT_V.set(w*hw,.1,hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,4,6);}}
  if(Math.random()<dt*(8+44*k)*v){DRIFT_V.set((Math.random()<.5?-1:1)*hw,.12,-hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,1,2.5+3*k);}}
/* LES CUBES D'EAU — (2026-10-13, 4e passe, Léo : « la vague en bas doit glisser du milieu vers les côtés, comme une voiture qui va vite sous la
   pluie ; le splash d'entrée plus smooth ; fais le peintre maître du réalisme technique ») : des GOUTTES FINES (5-30 cm) de quatre teintes
   (blanc d'écume, aqua, turquoise clair, vert d'eau), qui héritent d'une part de la vitesse de la caisse ; la gerbe se lit comme une NAPPE. */
const EAUP={L:[],im:null,max:1800,cols:[new THREE.Color(0xf4fbff),new THREE.Color(0xd2f4f6),new THREE.Color(0xa8e6ea),new THREE.Color(0x86d2cf)]};
function eauPIm(){if(EAUP.im)return EAUP.im;const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x3a6670});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,EAUP.max);im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.setColorAt(0,EAUP.cols[0]);im.instanceColor.setUsage(THREE.DynamicDrawUsage); // la teinte par goutte : posée dès la création (le programme se compile une fois, au menu)
  scene.add(im);EAUP.im=im;return im;}
function eauP(x,y,z,vx,vy,vz,sz,l,y0,c){if(EAUP.L.length<EAUP.max)EAUP.L.push({x:x,y:y,z:z,vx:vx,vy:vy,vz:vz,sz:sz,t:0,l:l,y0:y0,c:c===undefined?(Math.random()*4)|0:c});}
function jadeCouronne(x,y,z,k,vel){eauPIm();eauRide(x,y,z,k);eauRide(x,y,z,k*.6); // L'ENTRÉE : la COURONNE lisse, la nappe qui glisse vers les côtés, les gouttes fines
  const fx=vel?vel.x*SPD*.3:0,fz=vel?vel.z*SPD*.3:0,R=1.2+1.6*k;
  eauCouronne(x,y,z,{r0:R,r1:4+10*k,h:2.2+7.5*k,fl:.55,d:.85+.6*k,fx:fx,fz:fz});
  for(let i=0,n=(70+150*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=R*(.85+Math.random()*.3),vo=3+Math.random()*9*k; // les gouttes lancées par le bord de la couronne
    eauP(x+c*r,y+.6+Math.random()*2*k,z+s*r,c*vo+fx,9+Math.random()*16*k,s*vo+fz,.05+Math.random()*.13,1.1+Math.random()*1.1,y,(Math.random()*3)|0);}
  for(let i=0,n=(50+90*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=Math.random()*R,vo=8+Math.random()*14*k; // LA NAPPE qui glisse du milieu vers les côtés, au ras de l'eau
    eauP(x+c*r,y+.2,z+s*r,c*vo+fx*1.4,1.5+Math.random()*4,s*vo+fz*1.4,.06+Math.random()*.16,.7+Math.random()*.7,y,1+((Math.random()*3)|0));}
  for(let i=0;i<24*k;i++){const a=Math.random()*6.2832,r=Math.random()*R*.4;eauP(x+Math.cos(a)*r,y+.4,z+Math.sin(a)*r,(Math.random()-.5)*2,18+Math.random()*26*k,(Math.random()-.5)*2,.08+Math.random()*.16,1+Math.random()*.6,y,0);}} // le jet du milieu
function jadeColonne(x,y,z,vyW,k){eauPIm();eauRide(x,y,z,k);eauRide(x,y,z,k*.55); // LA SORTIE : la COLONNE lisse qui suit la caisse, l'eau qui ruisselle et retombe sur les côtés
  if(k>.12)eauCouronne(x,y,z,{r0:1.1,r1:1.8+1.5*k,h:3+Math.min(11,vyW*.22),fl:-.3,d:.8+.5*k,fx:0,fz:0});
  for(let i=0,n=(60+120*k)|0;i<n;i++){const a=Math.random()*6.2832,r=Math.random()*1.5;eauP(x+Math.cos(a)*r,y+.3+Math.random()*2,z+Math.sin(a)*r,Math.cos(a)*(1+Math.random()*4),vyW*(.2+Math.random()*.55),Math.sin(a)*(1+Math.random()*4),.05+Math.random()*.15,1.1+Math.random()*1,y,(Math.random()*3)|0);}
  for(let i=0,n=(40+70*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=.8+Math.random()*1.4,vo=6+Math.random()*12*k;eauP(x+c*r,y+.2,z+s*r,c*vo,1+Math.random()*4,s*vo,.06+Math.random()*.15,.7+Math.random()*.6,y,1+((Math.random()*3)|0));}}
function jadeSillage(sy,hv,dt,d){eauPIm();const p=fallPos,vx=fallVel.x/hv,vz=fallVel.z/hv,px=-vz,pz=vx,vW=hv*SPD*AIR_RATE,k=Math.min(1,hv/170); // LE SILLAGE : deux nappes qui partent du dessous de la caisse vers les côtés (la voiture rapide sous la pluie)
  const kh=d<0?Math.max(0,1+d/2.5):1;if(kh<=0)return; // en glisse au-dessus de l'eau : moins d'eau soulevée
  const taux=(26+hv*1.25)*kh*dt;let n=Math.floor(taux);if(Math.random()<taux-n)n++;n=Math.min(n,22);
  for(const sd of [-1,1])for(let i=0;i<n;i++){const al=-2.2+Math.random()*3.4,lt=.5+Math.random()*.7,vo=(3+vW*.28)*(.55+Math.random()*.6);
    eauP(p.x+vx*al+px*sd*lt,sy+.1,p.z+vz*al+pz*sd*lt,px*sd*vo+vx*vW*(.15+Math.random()*.25),1.2+Math.random()*(2+5*k),pz*sd*vo+vz*vW*(.15+Math.random()*.25),.08+Math.random()*(.12+.14*k),.45+Math.random()*.55,sy,1+((Math.random()*3)|0));}
  if(k>.45){const m=Math.min(10,Math.round(n*.6));for(let i=0;i<m;i++){const al=-2.6-Math.random()*1.5; // la QUEUE DE COQ derrière, à grande vitesse
    eauP(p.x+vx*al+(Math.random()-.5)*.8,sy+.2,p.z+vz*al+(Math.random()-.5)*.8,vx*vW*.35+(Math.random()-.5)*2,5+Math.random()*12*k,vz*vW*.35+(Math.random()-.5)*2,.05+Math.random()*.14,.7+Math.random()*.6,sy,(Math.random()*2)|0);}}
  sillonPose(p.x,sy,p.z,vx,vz,hv,dt,kh);eauBrume(p,vx,vz,px,pz,vW,k,kh,sy,dt);} // le V d'écume derrière elle, la brume de la gerbe
function eauPTick(dt){const im=EAUP.im;if(!im)return;const L9=EAUP.L;if(!L9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;} // (2026-10-14) vide = caché : un dessin de zéro exemplaire coûte sa préparation à chaque image
  let n=0;const M9=JCH_M,dr=Math.exp(-.5*dt),cp=camera.position; // (2026-10-14, chasse aux bugs) ces déclarations étaient collées au commentaire ci-dessus, donc avalées : ReferenceError dès qu il y avait des gouttes (signalé par SON)
  for(let i=L9.length-1;i>=0;i--){const p=L9[i];if(!paused){p.t+=dt;p.vy-=24*dt;p.vx*=dr;p.vz*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
    if(p.t>p.l||(p.vy<0&&p.y<p.y0-.5)){L9[i]=L9[L9.length-1];L9.pop();continue;}
    let k=p.sz*(1-Math.pow(p.t/p.l,3));{const dx=p.x-cp.x,dy=p.y-cp.y,dz=p.z-cp.z,d2=dx*dx+dy*dy+dz*dz;if(d2<36)k*=Math.max(.15,Math.sqrt(d2)/6);} // près de l'objectif, la goutte rapetisse
    const st=Math.min(2.4,1+Math.abs(p.vy)*.06);M9.makeScale(k,k*st,k).setPosition(p.x,p.y,p.z); // une goutte qui file s'étire
    if(n<EAUP.max){im.setMatrixAt(n,M9);im.setColorAt(n,EAUP.cols[p.c]);n++;}}
  im.count=n;im.visible=n>0;imEnvoi(im,n,true);}
/* LE SILLAGE EN V (Kelvin) : la trace de la caisse sur l'eau, un point toutes les 45 ms ; chaque point s'écarte de l'axe à ~19,5° (la vitesse
   × 0,354 × son âge) et s'élargit — deux bandes d'écume en PETITS CARRÉS de 50 cm, la crête blanche côté intérieur, qui s'éteignent en 1,8 s. */
const SILL={P:[],mesh:null,N:48,acc:0};
const SILL_VS='attribute vec3 aF;varying vec3 vF;varying vec3 vW;void main(){vF=aF;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const SILL_FS=['varying vec3 vF;varying vec3 vW;',
  'void main(){float age=vF.x,ac=vF.y,k=vF.z;vec2 c=floor(vW.xz*2.);float h=fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);',
  '  float cr=exp(-pow((ac-.22)/.2,2.));float a=(1.-age)*(1.-age)*k*(.3+.7*cr)*step(.22+.5*age,h+.3*cr);',
  '  if(a<.02)discard;gl_FragColor=vec4(mix(vec3(.62,.88,.90),vec3(.97,1.,1.),cr*(1.-age)),min(1.,a*.9));}'].join('\n');
function sillonMesh(){if(SILL.mesh)return SILL.mesh;const N=SILL.N,g=new THREE.BufferGeometry(),I=[];
  for(let i=0;i<N-1;i++)for(let sd=0;sd<2;sd++){const a=i*4+sd*2,b=a+1,c=a+4,d=c+1;I.push(a,b,c,b,d,c);}
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*4*3),3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aF',new THREE.BufferAttribute(new Float32Array(N*4*3),3).setUsage(THREE.DynamicDrawUsage));g.setIndex(I);g.setDrawRange(0,0);
  const m=new THREE.ShaderMaterial({vertexShader:SILL_VS,fragmentShader:SILL_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});m.dispose=function(){};
  const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=8;me.matrixAutoUpdate=false;me.visible=false;scene.add(me);SILL.mesh=me;return me;}
function sillonPose(x,y,z,vx,vz,hv,dt,kh){SILL.acc+=dt;if(SILL.acc<.045)return;SILL.acc=0;
  SILL.P.unshift({x:x,y:y,z:z,px:-vz,pz:vx,t:0,v:hv*SPD*AIR_RATE,k:kh});if(SILL.P.length>SILL.N)SILL.P.pop();}
function sillonTick(dt){const P=SILL.P;if(!paused)for(const p of P)p.t+=dt;while(P.length&&P[P.length-1].t>1.8)P.pop();
  const me=SILL.mesh;if(P.length<2){if(me&&me.visible)me.visible=false;return;}sillonMesh();const g=SILL.mesh.geometry,pa=g.attributes.position.array,fa=g.attributes.aF.array;
  for(let i=0;i<P.length;i++){const p=P[i],sp=.8+p.t*p.v*.354,w=.5+p.t*1.8,u=Math.min(1,p.t/1.8);
    for(let sd=0;sd<2;sd++){const s9=sd?1:-1,o=(i*4+sd*2)*3;
      pa[o]=p.x+p.px*s9*sp;pa[o+1]=p.y+.12;pa[o+2]=p.z+p.pz*s9*sp;pa[o+3]=p.x+p.px*s9*(sp+w);pa[o+4]=p.y+.12;pa[o+5]=p.z+p.pz*s9*(sp+w);
      fa[o]=u;fa[o+1]=0;fa[o+2]=p.k;fa[o+3]=u;fa[o+4]=1;fa[o+5]=p.k;}}
  g.attributes.position.needsUpdate=true;g.attributes.aF.needsUpdate=true;g.setDrawRange(0,(P.length-1)*12);if(!SILL.mesh.visible)SILL.mesh.visible=true;}
/* LA BRUME DE LA GERBE : de grands cubes translucides qui partent des flancs, gonflent et s'effacent — la nappe d'eau soulevée se lit
   comme un voile (une voiture rapide sous la pluie), les gouttes fines passent devant. */
const EAUB={L:[],im:null,max:320};
function eauBIm(){if(EAUB.im)return EAUB.im;const m=new THREE.MeshBasicMaterial({color:0xeefcff,transparent:true,opacity:.17,depthWrite:false,fog:true});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,EAUB.max);im.count=0;im.frustumCulled=false;im.renderOrder=8;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);EAUB.im=im;return im;}
function eauBrume(p,vx,vz,px,pz,vW,k,kh,sy,dt){eauBIm();const taux=(5+vW*.45)*kh*dt;let n=Math.floor(taux);if(Math.random()<taux-n)n++;n=Math.min(n,6);
  for(const sd of [-1,1])for(let i=0;i<n;i++){const al=-1.8+Math.random()*2.6,vo=(1.5+vW*.16)*(.6+Math.random()*.6),s0=.45+k*.7+Math.random()*.4;
    if(EAUB.L.length<EAUB.max)EAUB.L.push({x:p.x+vx*al+px*sd*1.1,y:sy+.5,z:p.z+vz*al+pz*sd*1.1,vx:px*sd*vo+vx*vW*.25,vy:.8+Math.random()*(1.5+2*k),vz:pz*sd*vo+vz*vW*.25,s:s0,t:0,l:.6+Math.random()*.5});}}
function eauBTick(dt){const im=EAUB.im;if(!im)return;const L9=EAUB.L;if(!L9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;}let n=0;const M9=JCH_M,dr=Math.exp(-1.6*dt),cp=camera.position;
  for(let i=L9.length-1;i>=0;i--){const b=L9[i];if(!paused){b.t+=dt;b.vx*=dr;b.vz*=dr;b.vy*=dr;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;}
    if(b.t>b.l){L9[i]=L9[L9.length-1];L9.pop();continue;}const u=b.t/b.l;let k=b.s*(1+2.2*u)*(1-u*u);
    {const dx=b.x-cp.x,dy=b.y-cp.y,dz=b.z-cp.z,d2=dx*dx+dy*dy+dz*dz;if(d2<64)k*=Math.max(.1,Math.sqrt(d2)/8);} // jamais un voile plein écran
    M9.makeScale(k,k*.7,k).setPosition(b.x,b.y,b.z);if(n<EAUB.max)im.setMatrixAt(n++,M9);}
  im.count=n;im.visible=n>0;imEnvoi(im,n);}
/* LA COURONNE LISSE : une gerbe d'eau translucide (un cylindre ouvert déformé dans le vertex shader) qui s'ouvre, monte, s'évase en lobes et
   retombe — à l'entrée large et basse, à la sortie étroite et haute (la colonne). Des filets clairs, l'éclat du soleil, le bord blanc. */
const COUR_VS=['uniform float uU,uR0,uR1,uH,uS,uFl;varying float vV,vA;varying vec3 vW;',
  'void main(){float v=position.y+.5,a=atan(position.z,position.x),e=1.-pow(1.-uU,2.6);',
  '  float lob=1.+.22*sin(a*9.+uS)*smoothstep(.45,1.,v)+.10*sin(a*17.-uS*2.)*v;',
  '  float r=mix(uR0,uR1,e)*(1.+uFl*v*v*(.5+.5*e))*mix(1.,lob,.35*v);',
  '  float h=uH*sin(3.14159*min(1.,uU*1.2))*v*mix(1.,lob,v);',
  '  vec4 w=modelMatrix*vec4(cos(a)*r,h,sin(a)*r,1.);vW=w.xyz;vV=v;vA=a;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const COUR_FS=['uniform float uU;uniform vec3 uC,uSun;varying float vV,vA;varying vec3 vW;',
  'void main(){vec3 V=normalize(vW-cameraPosition);',
  '  float al=pow(1.-uU,1.2)*(.22+.62*vV)*(1.-smoothstep(.9,1.,vV)*.5);',
  '  float fil=.78+.22*sin(vA*29.+vV*7.)*sin(vA*11.-vV*3.);',          // les filets d eau
  '  vec3 c=mix(uC,vec3(.97,.99,1.),.2+.7*vV*vV)*fil;',
  '  vec3 N=normalize(vec3(cos(vA),.5,sin(vA)));c+=vec3(1.,.95,.86)*pow(max(dot(reflect(V,N),uSun),0.),24.)*.9;', // l éclat du soleil sur la paroi
  '  c+=vec3(.9,1.,1.)*smoothstep(.86,.97,vV)*.35;',                    // le bord blanc
  '  if(al<.01)discard;gl_FragColor=vec4(c,al);}'].join('\n');
const COUR={L:[],geo:null};
function eauCouronne(x,y,z,o){let c=null;for(const q of COUR.L)if(q.t>=q.d){c=q;break;}
  if(!c){if(COUR.L.length>=4)return;if(!COUR.geo)COUR.geo=new THREE.CylinderGeometry(1,1,1,56,10,true);
    const m=new THREE.ShaderMaterial({uniforms:{uU:{value:0},uR0:{value:1},uR1:{value:4},uH:{value:3},uS:{value:0},uFl:{value:.5},uC:{value:new THREE.Color(.46,.80,.82)},uSun:{value:SUN_DIR}},vertexShader:COUR_VS,fragmentShader:COUR_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    m.dispose=function(){};const me=new THREE.Mesh(COUR.geo,m);me.frustumCulled=false;me.renderOrder=9;me.visible=false;scene.add(me);c={m:me,t:9,d:1};COUR.L.push(c);}
  const u=c.m.material.uniforms;u.uR0.value=o.r0;u.uR1.value=o.r1;u.uH.value=o.h;u.uFl.value=o.fl;u.uS.value=Math.random()*6.28;u.uU.value=0;
  c.t=0;c.d=o.d;c.vx=o.fx;c.vz=o.fz;c.m.position.set(x,y-.2,z);c.m.updateMatrix();c.m.visible=true;}
function eauCouronneTick(dt){for(const c of COUR.L){if(c.t>=c.d){if(c.m.visible)c.m.visible=false;continue;}if(!paused){c.t+=dt;c.m.position.x+=(c.vx||0)*dt*.5;c.m.position.z+=(c.vz||0)*dt*.5;}
  c.m.material.uniforms.uU.value=Math.min(1,c.t/c.d);}}
/* LES ONDES : des disques d'eau (un shader) — une crête blanche, une seconde plus faible derrière, un creux plus sombre ; elles s'élargissent
   et s'éteignent. Une réserve de 10. */
const RIDE_FS=['uniform float uU;varying vec2 vUv;',
  'void main(){float r=length(vUv*2.-1.);if(r>1.)discard;',
  '  float c1=exp(-pow((r-.88)/.055,2.)),c2=exp(-pow((r-.66)/.045,2.))*.45,c3=exp(-pow((r-.48)/.04,2.))*.2,tr=exp(-pow((r-.78)/.05,2.));',
  '  float a=(c1*.75+c2+c3)*pow(1.-uU,1.3)*smoothstep(1.,.96,r);',
  '  vec3 c=mix(vec3(.55,.84,.86),vec3(.98,1.,1.),c1);if(a<.01)discard;gl_FragColor=vec4(c-vec3(.08)*tr,a);}'].join('\n');
const EAUR={L:[],geo:null};
function eauRide(x,y,z,k){let r=null;for(const q of EAUR.L)if(q.t>=q.l){r=q;break;}
  if(!r){if(EAUR.L.length>=10)return;if(!EAUR.geo){EAUR.geo=new THREE.PlaneGeometry(2,2,1,1);EAUR.geo.rotateX(-Math.PI/2);}
    const m=new THREE.ShaderMaterial({uniforms:{uU:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:RIDE_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    m.dispose=function(){};const me=new THREE.Mesh(EAUR.geo,m);me.renderOrder=9;me.frustumCulled=false;scene.add(me);r={m:me,t:9,l:1};EAUR.L.push(r);}
  r.t=0;r.l=1.2+1.2*k;r.s=1.5+3*k;r.S=10+34*k;r.m.position.set(x,y+.2,z);r.m.visible=true;}
function eauRideTick(dt){for(const r of EAUR.L){if(r.t>=r.l){if(r.m.visible)r.m.visible=false;continue;}if(!paused)r.t+=dt;const u=Math.min(1,r.t/r.l),e=1-(1-u)*(1-u);
  r.m.scale.setScalar(r.s+(r.S-r.s)*e);r.m.material.uniforms.uU.value=u;}}
/* L'OBJECTIF MOUILLÉ (2e version — Léo : « l'effet écran quand tu ressors de l'eau, travaille-le encore plus ») — DEUX toiles au tiers de
   l'écran : la VISIBLE (#eauCv, sans lissage : le liseré sombre du bas de chaque goutte, son éclat, la ligne claire de la nappe) et celle des
   NORMALES (LENS.cvN, jamais affichée : recopiée dans le post-traitement, elle y RÉFRACTE l'image — voir uLens dans l'ACES).
   · LA NAPPE : en sortant, tout l'objectif est sous un film d'eau qui s'égoutte vers le bas en 0,75 s ; sa lèvre (le ménisque) dévie fort
     l'image, le film l'ondule.
   · LES GOUTTES (trois familles) : 8-14 GROSSES (5-11 px de toile) qui glissent vite en laissant une traînée d'eau, 14-24 MOYENNES qui
     glissent plus tard ou restent, et une BUÉE de 90-150 micro-gouttelettes qui s'évaporent sur place. Chacune est une lentille : l'image
     derrière elle est retournée et grossie. Elles rétrécissent en fin de vie (elles sèchent) au lieu de s'effacer.
   · L'ENTRÉE dans l'eau : un voile clair bref, et l'objectif se vide de ses gouttes. */
const LENS={cv:null,cx:null,cvN:null,cxN:null,img:null,tex:null,W:0,H:0,g:[],nappe:0,flash:0,t:0,k:0};
function lensInit(){if(LENS.cv)return;const cv=document.createElement('canvas');cv.id='eauCv';cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;visibility:hidden';
  const j=document.getElementById('juiceCv');if(j&&j.parentNode)j.parentNode.insertBefore(cv,j.nextSibling);else document.body.appendChild(cv);LENS.cv=cv;LENS.cx=cv.getContext('2d');
  LENS.cvN=document.createElement('canvas');LENS.cvN.width=LENS.cvN.height=4;LENS.cxN=LENS.cvN.getContext('2d');
  LENS.tex=new THREE.CanvasTexture(LENS.cvN);LENS.tex.minFilter=LENS.tex.magFilter=THREE.LinearFilter;LENS.tex.generateMipmaps=false;
  if(acesPass&&acesPass.uniforms.uLens)acesPass.uniforms.uLens.value=LENS.tex;}
function lensSortie(k){if(REDUCED_MOTION)return;lensInit();LENS.nappe=1;LENS.t=0;LENS.k=k;LENS.g.length=0;const R=Math.random;
  for(let i=0,n=8+((6*k)|0);i<n;i++)LENS.g.push({x:R(),y:.05+R()*.75,r:5+R()*6,t:0,l:1.8+R()*1.4,d:.08+R()*.35,v:0,vx:(R()-.5)*6,tr:[],f:0}); // les GROSSES
  for(let i=0,n=14+((10*k)|0);i<n;i++)LENS.g.push({x:R(),y:R()*.92,r:2.2+R()*2.8,t:0,l:1.6+R()*1.6,d:R()<.5?.5+R()*.9:99,v:0,vx:(R()-.5)*3,tr:[],f:1}); // les MOYENNES
  for(let i=0,n=90+((60*k)|0);i<n;i++)LENS.g.push({x:R(),y:R(),r:.6+R()*1.1,t:0,l:.7+R()*1.3,d:99,v:0,vx:0,tr:null,f:2});} // la BUÉE
function lensEntree(){if(REDUCED_MOTION)return;lensInit();LENS.flash=1;LENS.g.length=0;LENS.nappe=0;}
function lensTick(dt){const cv=LENS.cv;if(!cv)return;const U=acesPass&&acesPass.uniforms;const vide=!LENS.g.length&&LENS.nappe<=0&&LENS.flash<=0;
  if(vide){if(cv.style.visibility!=='hidden'){cv.style.visibility='hidden';LENS.cx.clearRect(0,0,LENS.W,LENS.H);}if(U&&U.uLensK)U.uLensK.value=0;return;}
  const W=Math.max(1,Math.ceil(VP.w/3)),H=Math.max(1,Math.ceil(VP.h/3)); // (2026-10-14, OPTIMISATION — relevé par GENERAL) VP au lieu d'innerWidth : la lecture forçait une mise en page à chaque image (piège n° 11)
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}if(LENS.cvN.width!==W||LENS.cvN.height!==H){LENS.cvN.width=W;LENS.cvN.height=H;LENS.img=null;}
  if(!LENS.img)LENS.img=LENS.cxN.createImageData(W,H);LENS.W=W;LENS.H=H;
  if(cv.style.visibility!=='visible')cv.style.visibility='visible';const x=LENS.cx;x.clearRect(0,0,W,H);LENS.t+=dt;
  const D=LENS.img.data; // la toile des normales, au repos : aucun décalage — (OPTIMISATION) recopiée d'un modèle (une copie mémoire) au lieu de 4 écritures par pixel à chaque image
  if(!LENS.rep||LENS.rep.length!==D.length){const R9=LENS.rep=new Uint8ClampedArray(D.length);for(let i=0;i<R9.length;i+=4){R9[i]=128;R9[i+1]=128;R9[i+2]=0;R9[i+3]=255;}}D.set(LENS.rep);
  const N=function(px,py,nx,ny){if(px<0||py<0||px>=W||py>=H)return;const o=(py*W+px)*4;D[o]=Math.max(0,Math.min(255,128+nx*7.94));D[o+1]=Math.max(0,Math.min(255,128-ny*7.94));}; // (nx, ny en pixels de toile ; ÷16 → ±127)
  if(LENS.flash>0){LENS.flash=Math.max(0,LENS.flash-dt/.22);x.fillStyle='rgba(215,252,255,'+(.55*LENS.flash).toFixed(3)+')';x.fillRect(0,0,W,H);}
  let lens=0;
  if(LENS.nappe>0){LENS.nappe=Math.max(0,LENS.nappe-dt/.75);const p=1-LENS.nappe,top=H*Math.pow(p,1.15),T=LENS.t;lens=1; // LA NAPPE : elle s'égoutte vers le bas
    for(let c=0;c<W;c++){const e=Math.round(top+3*Math.sin(c*.17+T*13)+2.2*Math.sin(c*.053-T*8.5)+1.4*Math.sin(c*.31+T*21));if(e>=H)continue;const e0=Math.max(0,e);
      for(let y=e0;y<H;y++){const dz=y-e;const m=dz<9?(1-dz/9):0; // la LÈVRE (ménisque) dévie fort, le film ondule doucement
        N(c,y,1.6*Math.sin(y*.21+c*.07+T*11)*(1-p*.6)+m*1.5*Math.sin(c*.4),-m*7-.9*Math.sin(c*.13+y*.09-T*9)*(1-p*.6));}
      if((c&1)===0){x.fillStyle='rgba(165,228,236,'+(.16*(1-.5*p)).toFixed(3)+')';x.fillRect(c,e0,2,H-e0);
        if(e>=0){x.fillStyle='rgba(240,255,255,'+(.7*(1-p)).toFixed(3)+')';x.fillRect(c,e,2,1);x.fillStyle='rgba(20,90,105,'+(.35*(1-p)).toFixed(3)+')';x.fillRect(c,e+2,2,1);}}}}
  for(let i=LENS.g.length-1;i>=0;i--){const d=LENS.g[i];d.t+=dt;if(d.t>d.l){LENS.g.splice(i,1);continue;}lens=1;
    if(d.f<2&&d.t>d.d){d.v=Math.min(85,d.v+(d.f?55:110)*dt*(d.r/6));const y0=d.y;d.y+=d.v*dt/H;d.x+=d.vx*dt/W*Math.sin(d.t*3+i);d.r=Math.max(1.2,d.r*(1-.06*dt));
      if(d.tr){d.tr.push(y0);if(d.tr.length>26)d.tr.shift();}}
    const ev=Math.min(1,(d.l-d.t)/.45),r=Math.max(.5,d.r*ev),cx=Math.round(d.x*W),cy=Math.round(d.y*H),ri=Math.ceil(r);
    if(d.tr&&d.tr.length){x.fillStyle='rgba(225,250,255,.10)';const tw=Math.max(1,Math.round(r*.35));for(const ty of d.tr){const yy=Math.round(ty*H);x.fillRect(cx-tw,yy,tw*2,2);N(cx-tw,yy,-.6,0);N(cx+tw-1,yy,.6,0);}} // la traînée d'eau : un mince filet qui dévie un peu
    if(d.f===2){N(cx,cy,(Math.random()-.5)*.8,.8);x.fillStyle='rgba(235,252,255,'+(.2*ev).toFixed(3)+')';x.fillRect(cx,cy,1,1);continue;} // la buée : un point
    for(let dy=-ri;dy<=ri;dy++){const w=Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy)));for(let dx=-w;dx<=w;dx++)N(cx+dx,cy+dy,dx*1.45,dy*1.45); // LA LENTILLE : retournée, grossie ×2
      if(dy>r*.2){x.fillStyle='rgba(18,80,95,'+(.42*ev).toFixed(3)+')';x.fillRect(cx-w,cy+dy,1,1);x.fillRect(cx+w,cy+dy,1,1);}}
    x.fillStyle='rgba(18,80,95,'+(.42*ev).toFixed(3)+')';x.fillRect(cx-Math.floor(r*.55),cy+ri,Math.floor(r*1.1)+1,1);
    x.fillStyle='rgba(255,255,255,'+(.75*ev).toFixed(3)+')';x.fillRect(cx-Math.round(r*.45),cy-Math.round(r*.5),r>6?2:1,r>6?2:1); // l'éclat
    if(r>4){x.fillStyle='rgba(255,255,255,'+(.35*ev).toFixed(3)+')';x.fillRect(cx+Math.round(r*.3),cy+Math.round(r*.45),1,1);}}
  LENS.cxN.putImageData(LENS.img,0,0);LENS.tex.needsUpdate=true;
  if(U&&U.uLensK){U.uLensK.value=lens;U.uLensA.value.set(16*3/Math.max(1,VP.w),16*3/Math.max(1,VP.h));if(U.uLens.value!==LENS.tex)U.uLens.value=LENS.tex;}}
/* LE SON SOUS L'EAU : un passe-bas devant la sortie (grand ouvert hors de l'eau), des bloups de bulles */
function eauFiltre(sous,net){if(!AC||!MASTER||typeof BUSOUT==='undefined'||!BUSOUT)return;
  if(!MASTER._eauLp){if(!sous)return;try{const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=AC.sampleRate/2;lp.Q.value=.6;MASTER.disconnect(BUSOUT);MASTER.connect(lp);lp.connect(BUSOUT);MASTER._eauLp=lp;}catch(e){return;}}
  const f=MASTER._eauLp.frequency,v=sous?620:AC.sampleRate/2;
  if(net){try{f.cancelScheduledValues(AC.currentTime);f.setValueAtTime(v,AC.currentTime);f._s9=v;}catch(e){}}else stt(f,v,AC.currentTime,sous?.04:.12);}
function eauBloop(k){if(!sfxOk())return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),f0=180+Math.random()*260;
  o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*(2.2+Math.random()*1.4),t+.07);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05*k,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.11);
  o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+.13);}catch(e){}}
function jadeBullesIm(){if(JEAU.im)return JEAU.im;
  const m=new THREE.MeshBasicMaterial({color:0xd6fbff,transparent:true,opacity:.62,depthWrite:false,fog:true});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,320);im.count=0;im.frustumCulled=false;im.renderOrder=7;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(im);JEAU.im=im;return im;}
function jadeBullesJet(p,n,r){jadeBullesIm();for(let k=0;k<n&&JEAU.bul.length<320;k++){const a=Math.random()*6.2832,rr=Math.random()*r;
  JEAU.bul.push({x:p.x+Math.cos(a)*rr,y:p.y+(Math.random()-.5)*r,z:p.z+Math.sin(a)*rr,v:3+Math.random()*7,s:.12+Math.random()*.38,t:0,l:1.2+Math.random()*1.8,ph:Math.random()*6.28});}}
function jadeBullesTick(dt){const im=JEAU.im;if(!im)return;const B9=JEAU.bul;if(!B9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;}let n=0;const M9=JCH_M;
  for(let i=B9.length-1;i>=0;i--){const b=B9[i];if(!paused){b.t+=dt;b.v=Math.min(14,b.v+6*dt);b.y+=b.v*dt;b.x+=Math.sin(b.t*5+b.ph)*dt*.9;b.z+=Math.cos(b.t*4.3+b.ph)*dt*.9;}
    if(b.t>b.l||b.y>jadeSurfCase(b.x,b.z)){B9.splice(i,1);continue;}
    const k=b.s*(1-Math.pow(b.t/b.l,4));M9.makeScale(k,k,k).setPosition(b.x,b.y,b.z);if(n<320)im.setMatrixAt(n++,M9);}
  im.count=n;im.visible=n>0;imEnvoi(im,n);}
const JADE_MERP_VS=['uniform float uMerY,uEauT,uN;uniform vec2 uO;attribute vec2 aCell;attribute float aFace;varying vec3 vW,vNo;varying float vEd,vH;',
  JADE_EAU_GLSL,
  'void main(){vec2 c=uO+aCell;float h=jMerH(c),top=uMerY+h*JMS;',
  '  vec2 dn=aFace<.5?vec2(0.):aFace<1.5?vec2(1.,0.):aFace<2.5?vec2(-1.,0.):aFace<3.5?vec2(0.,1.):vec2(0.,-1.);',
  '  float yb=top;if(aFace>.5)yb=min(top,uMerY+jMerH(c+dn)*JMS);',                 // un flanc ne descend que jusqu au dessus de sa voisine plus basse
  '  vW=vec3((uO.x+position.x)*JMS,mix(yb,top,position.y),(uO.y+position.z)*JMS);',
  '  vNo=aFace<.5?vec3(0.,1.,0.):vec3(dn.x,0.,dn.y);vH=h;',
  '  vEd=max(abs(aCell.x+.5-uN*.5),abs(aCell.y+.5-uN*.5))/(uN*.5);',
  '  gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}'].join('\n');
const JADE_MERP_FS=['uniform float uSous,uK,uFogN,uFogF,uEauT;uniform vec3 uFogC,uCielH,uCielZ,uSunDir;varying vec3 vW,vNo;varying float vEd,vH;',
  'float cau(vec2 p,float t){vec2 q=p*.11;float a=sin(q.x+t*1.1+sin(q.y*1.7+t*.8))*sin(q.y*1.3-t*.9+sin(q.x*1.4-t*.7));return pow(1.-abs(a),6.);}',
  'void main(){vec3 D=vW-cameraPosition;float dist=length(D);vec3 V=D/max(dist,1e-3);vec3 col;float a;float pxw=length(fwidth(vW.xz));', // (dérivées hors des branches)
  '  if(uSous>.5){',                                                                     // VUE D EN DESSOUS : le miroir de l eau, et la fenêtre sur le ciel
  '    float cs=cau(vW.xz,uEauT),win=smoothstep(.55,.80,V.y)*step(.5,vNo.y);',
  '    vec3 tir=uFogC*1.45+vec3(.10,.24,.22)*cs,sk=mix(uCielH,uCielZ,.35)*1.12+vec3(.22,.26,.24)*cs;',
  '    col=mix(tir,sk,win);a=mix(.93,.38,win);if(vNo.y<.5){col=uFogC*1.2+vec3(.05,.10,.10)*cs;a=.88;}',
  '  }else{',                                                                           // VUE D AU-DESSUS : la mer en cubes du ciel, translucide (la caisse plongée s y devine)
  '    float hn=clamp((vH+5.)/9.,0.,1.);vec3 wc=mix(vec3(.03,.18,.27),vec3(.20,.58,.64),hn);vec3 Ns=vNo;float sub=0.,s1=0.,s2=0.,sb=1.;',
  '    if(vNo.y>.5){vec2 sq=vW.xz,si=floor(sq),sf=fract(sq);s1=fract(sin(dot(si,vec2(127.1,311.7)))*43758.5453);s2=fract(sin(dot(si,vec2(269.5,183.3)))*43758.5453);float s3=fract(sin(dot(si,vec2(419.2,371.9)))*43758.5453);', // (2026-10-13) les PETITS CUBES de 1 m, comme la mer peinte
  '      sub=1.-smoothstep(.22,.85,pxw);vec3 tn=s2<.2?vec3(.04,.21,.34):s2<.42?vec3(.07,.38,.45):s2<.62?vec3(.15,.57,.61):s2<.80?vec3(.11,.47,.40):s2<.93?vec3(.30,.66,.70):vec3(.52,.80,.82);',
  '      wc=mix(wc,mix(tn,wc,.5)*(.94+.12*s3),sub*.5);sb=min(min(sf.x,1.-sf.x),min(sf.y,1.-sf.y));vec2 bo=sign(sf-.5)*(1.-smoothstep(.02,.09,sb));',
  '      Ns=normalize(mix(vNo,normalize(vec3((s1-.5)*.14+bo.x*.18,1.,(s3-.5)*.14+bo.y*.18)),sub));}',
  '    float F=.03+.97*pow(1.-abs(dot(V,Ns)),5.);vec3 Rf=reflect(V,Ns),sk=mix(uCielH,uCielZ,smoothstep(0.,.6,Rf.y));',
  '    float dif=max(dot(Ns,uSunDir),0.)*.5+.5;col=mix(wc*(.78+.3*dif),sk,F*.8);if(vNo.y<.5)col*=.72;a=mix(.6,.95,F);',
  '    float tw=pow(.5+.5*sin(uEauT*(1.6+3.2*s2)+s1*41.),7.);col+=vec3(1.,.93,.80)*pow(max(dot(Rf,uSunDir),0.),260.)*tw*7.*sub;a=max(a,min(1.,pow(max(dot(Rf,uSunDir),0.),260.)*tw*7.*sub));', // les éclats
  '    col*=mix(1.,.90+.10*smoothstep(0.,.06,sb),sub);}',
  '  col=mix(col,uFogC,smoothstep(uFogN,uFogF,dist));',
  '  a*=(1.-smoothstep(.70,1.,vEd))*uK;if(a<.004)discard;',
  '  gl_FragColor=vec4(col,a);}'].join('\n');
function jadePeau(){if(JSOUS.peau)return JSOUS.peau;const N=JSOUS.N,P=[],A=[],F=[],I=[];let v=0;
  const Q=[[0,[[0,1,0],[1,1,0],[1,1,1],[0,1,1]]],[1,[[1,0,0],[1,0,1],[1,1,1],[1,1,0]]],[2,[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]],[3,[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]],[4,[[0,0,0],[1,0,0],[1,1,0],[0,1,0]]]];
  for(let ix=0;ix<N;ix++)for(let iz=0;iz<N;iz++)for(const q of Q){for(const c of q[1]){P.push(ix+c[0],c[1],iz+c[2]);A.push(ix,iz);F.push(q[0]);}I.push(v,v+1,v+2,v,v+2,v+3);v+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aCell',new THREE.Float32BufferAttribute(A,2));g.setAttribute('aFace',new THREE.Float32BufferAttribute(F,1));g.setIndex(I);
  const m=new THREE.ShaderMaterial({uniforms:{uMerY:JADE_U.uMerY,uEauT:skyU.uEauT,uN:{value:N},uO:{value:new THREE.Vector2()},uSous:{value:0},uK:{value:0},uFogN:{value:2},uFogF:{value:200},
    uFogC:{value:new THREE.Color()},uCielH:{value:new THREE.Color()},uCielZ:{value:new THREE.Color()},uSunDir:{value:SUN_DIR}},vertexShader:JADE_MERP_VS,fragmentShader:JADE_MERP_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true}});
  m.dispose=function(){};const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=8;me.visible=false;me.matrixAutoUpdate=false;scene.add(me);JSOUS.peau=me;return me;}
function jadeSousTick(dt){ // fin de jadeTick (après la caméra et la brume de updateClouds, juste avant le rendu)
  const f=scene.fog,W=JSOUS.w;
  if(W.ok&&f&&f.near===W.n&&f.far===W.f&&f.color.equals(W.c)){f.color.copy(JSOUS.base.c);f.near=JSOUS.base.n;f.far=JSOUS.base.f;} // personne n'a réécrit la brume depuis l'image d'avant : on rend la sienne
  W.ok=false;
  const ok=jadeEauOk()&&started;let sous=false,prof=0;
  if(ok){const cp=camera.position;prof=jadeSurfCase(cp.x,cp.z)-cp.y;sous=prof>0;}
  JSOUS.sous=sous;JSOUS.prof=prof;skyU.uSous.value=sous?1:0;JADE_U.uSous.value=sous?1:0;
  if(sous!==JSOUS.sous0){if(JSOUS.bascT>.25&&ok){if(sous){lensEntree();jadeBullesJet(camera.position,70,5);}else lensSortie(Math.min(1,Math.abs(fallVel.y)/150));}JSOUS.bascT=0;JSOUS.sous0=sous;}JSOUS.bascT+=dt; // l'objectif passe la surface : mouillé en sortant, un voile en entrant
  eauFiltre(sous&&ok,false); // le son passe sous l'eau avec l'objectif
  JEAU.sorti+=dt;JEAU.k+=(((JEAU.dans||sous)?1:0)-JEAU.k)*Math.min(1,dt*6);
  if(sous&&f){JSOUS.base.c.copy(f.color);JSOUS.base.n=f.near;JSOUS.base.f=f.far;
    const dp=Math.min(1,prof/260);JSOUS.c.copy(JSOUS.cA).lerp(JSOUS.cB,dp);
    {const h=BIO.cur.jdH||[.9,.9,.85];JSOUS.c.r=JSOUS.c.r*.9+h[0]*.1*(1-dp);JSOUS.c.g=JSOUS.c.g*.9+h[1]*.1*(1-dp);JSOUS.c.b=JSOUS.c.b*.9+h[2]*.1*(1-dp);} // près de la surface, un peu du ciel
    f.color.copy(JSOUS.c);f.near=2;f.far=230-80*dp;W.c.copy(f.color);W.n=f.near;W.f=f.far;W.ok=true;
    skyU.uSousC.value.set(JSOUS.c.r,JSOUS.c.g,JSOUS.c.b);}
  const want=ok&&(sous||JEAU.dans||(mode==='fall'&&JEAU.sorti<.8));
  JSOUS.uK+=((want?1:0)-JSOUS.uK)*Math.min(1,dt*(want?12:3));
  if(JSOUS.uK>.01||want){const pe=jadePeau(),u=pe.material.uniforms,cp=camera.position,N=JSOUS.N;pe.visible=true;
    u.uO.value.set(Math.floor(cp.x/4)-N/2,Math.floor(cp.z/4)-N/2);u.uSous.value=sous?1:0;u.uK.value=JSOUS.uK;
    if(f){u.uFogC.value.copy(f.color);u.uFogN.value=f.near;u.uFogF.value=f.far;}
    const h=BIO.cur.jdH||[.9,.9,.85],z=BIO.cur.jdZ||[.48,.66,.8];u.uCielH.value.setRGB(h[0],h[1],h[2]);u.uCielZ.value.setRGB(z[0],z[1],z[2]);}
  else if(JSOUS.peau&&JSOUS.peau.visible)JSOUS.peau.visible=false;
  if(JEAU.im){if(!ok&&JEAU.bul.length)JEAU.bul.length=0;jadeBullesTick(dt);}
  eauPTick(dt);eauRideTick(dt);eauCouronneTick(dt);sillonTick(dt);eauBTick(dt);if(!paused)lensTick(dt);}
window.dbgEau=function(o){if(o==='profil'&&JADE.root){const r=[];for(let k=0;k<=40;k++){const i=Math.min(NP-1,Math.round(k/40*(NP-1)));r.push(Math.round(pts[i].y-JADE.eauY));}return r;} // (banc) o = {h:hauteur au-dessus de l'eau, vy, vh} : lâche la caisse au-dessus de la mer ; sans argument : l'état
  if(o&&jadeEauOk()){const p=carGroup.position,sy=jadeSurf(p.x,p.z);if(mode!=='fall')startFall(0,0,false);fallPos.set(p.x,sy+(o.h==null?40:o.h),p.z);fallVel.y=o.vy==null?0:o.vy;if(o.vh!=null){const hx=Math.hypot(fallVel.x,fallVel.z)||1;fallVel.x*=o.vh/hx;fallVel.z*=o.vh/hx;fallVH0=Math.max(fallVH0,o.vh);}carGroup.position.copy(fallPos);}
  const p=mode==='fall'?fallPos:carGroup.position;
  return {ok:jadeEauOk(),mode:mode,cause:mortCause,dans:JEAU.dans,n:JEAU.n,t:+JEAU.t.toFixed(2),prof:+JEAU.prof.toFixed(1),vIn:+JEAU.vIn.toFixed(1),vRef:+JEAU.vRef.toFixed(1),
    y:+p.y.toFixed(1),surf:JADE.root?+(isFinite(JEAU.syF)?JEAU.syF:jadeSurf(p.x,p.z)).toFixed(1):null,vy:+fallVel.y.toFixed(1),fallTR:+fallTR.toFixed(2),camSous:JSOUS.sous,camProf:+JSOUS.prof.toFixed(1),peau:+JSOUS.uK.toFixed(2),bulles:JEAU.bul.length,rico:JEAU.rico,f:+JEAU.f.toFixed(2),wB:+JEAU.wB.toFixed(2),flot:+JEAU.flotT.toFixed(1),hv:+Math.hypot(fallVel.x,fallVel.z).toFixed(1),gouttes:EAUP.L.length,ondes:EAUR.L.filter(function(r){return r.t<r.l;}).length,vitre:LENS.g.length,nappe:+LENS.nappe.toFixed(2),filtre:MASTER&&MASTER._eauLp?Math.round(MASTER._eauLp.frequency.value):null,
    brume:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far),'#'+scene.fog.color.getHexString()]:null};};
function jadeChuteRaz(){for(const c of JCH.L){if(c.orig)for(const o of c.orig)o.F.M.set(o.m,o.si*16);if(c.fo)FIN.mats.delete(c.pi);c.t0=0;c.fin=false;c.spl=false;c.orig=null;c.fo=null;}
  if(JADE.col&&JADE.col.mort)JADE.col.mort.clear();JCH.sp.length=0;if(JCH.splash)JCH.splash.count=0;for(const c of JCH.L)c.vu=false;JADE.sig=0;}
/* L'ARRIVÉE : au portail, l'annonce (et le temps), puis — sous le volet — le niveau repart du départ, les montagnes remises debout */
function jadeAnn(){const h=document.documentElement;h.classList.add('jadeAnn');clearTimeout(jadeAnn.t);jadeAnn.t=setTimeout(function(){h.classList.remove('jadeAnn');},3600);}
function jadeFinale(){if(JADE.fini){if(s>L-6)s=L-6;return;}JADE.fini=true;jadeAnn();
  const tps=Math.max(0,(performance.now()-(JADE.t0||performance.now()))/1000),mm=Math.floor(tps/60),ss=Math.floor(tps%60);
  try{slam('ARRIVÉE',TR(JADE_JEU?JADE_NOM:'PICS DE JADE')+' · '+mm+':'+(ss<10?'0':'')+ss,null,null,null,3,true);}catch(e){}shake=Math.max(shake,.25);
  setTimeout(function(){if(!started||gameOver||mode==='boom')return;try{ecranWipe(jadeRedemarre);}catch(e){jadeRedemarre();}},2800);}
function jadeRedemarre(){if(!started||gameOver||mode==='boom')return; // (2026-10-12, passe qualité) JOUER lance le SOLEIL DE JADE : une caisse qui EXPLOSE (ou une partie finie) dans les 2,8 s après l'ARRIVÉE était remise en 'drive' au départ — ressuscitée sous l'écran de fin
  s=0;lat=0;psi=0;prevTvalid=false;mode='drive';vA=0;jadeChuteRaz();JADE.fini=false;JADE.t0=performance.now();} // (v17, « enlève les intros ») plus de « DÉPART » : on repart, c'est tout
/* une GRILLE posée dans un repère (o : coin, axes x = b, y = haut, z = −t ; en cubes de VX) — la muraille, l'arche */
function jadeRepere(o,b,t,sc){const m=new THREE.Matrix4(),z=t.clone().negate(),k=sc||VXG;
  m.set(b.x*k,0,z.x*k,o.x, b.y*k,k,z.y*k,o.y, b.z*k,0,z.z*k,o.z, 0,0,0,1);return m;}
function jadeMonument(root,g,Mr,jx,M9){ // un monument en verre de jade : ses trois passes (lumière, absorption, profondeur) — rend les trois maillages
  const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=jx;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));
  /* (v17, « ça bugue énormément ») MESURÉ : la porte du ciel (519 k triangles × 3 passes) était dessinée À CHAQUE IMAGE, de n'importe où dans
     le niveau (frustumCulled faux). Désormais chaque monument vit dans un groupe éteint au-delà de la brume, et le champ le trie. */
  if(!g.boundingSphere)g.computeBoundingSphere();const gr=new THREE.Group();gr.matrixAutoUpdate=false;root.add(gr);
  const L9=[];for(const k of ([[M9.vrM,3],[M9.vrXM,2],[M9.vrPM,2.5]])){const m=new THREE.Mesh(g,k[0]);m.matrixAutoUpdate=false;m.matrix.copy(Mr);m.matrixWorldNeedsUpdate=true;m.renderOrder=k[1];m.frustumCulled=true;if(!L9.length)m.userData.jeter=true;gr.add(m);L9.push(m);}
  const c=g.boundingSphere.center.clone().applyMatrix4(Mr);(JADE.monu||(JADE.monu=[])).push({g:gr,c:c,r:g.boundingSphere.radius*Mr.getMaxScaleOnAxis(),L:L9,loin:false});
  return L9;}
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN, ALLÉGÉ — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : la Porte du ciel, seule en
   matière opaque au-delà de 450 m, pesait ~158 000 triangles à CHAQUE image (grille 224×218×34 en cubes de 5 m, maillée avec ses faces
   intérieures — qu'on ne voit qu'à travers le verre, donc jamais en opaque). De loin, elle prend un 4e maillage : la DEMI-grille (voxDemi,
   le niveau de détail des montagnes) SANS faces intérieures, posée à l'échelle ×2 — le sommet (x,y,z) de la demi-grille tombe sur
   o+2·VXG·(x,y,z), là où tombait (2x,2y,2z) de la grille : même endroit, même taille, des cubes de 10 m — ~30 000 triangles (calculé hors
   navigateur sur la même grille : 158 k → 29-31 k). De près (< 450 m) : le verre en trois passes, intact. Bâti UNE fois, dans la chauffe du
   niveau (jadeChauffeNiveau, l'image déjà sacrifiée 120 ms après newTrack) — jamais au palier RÉCENT, jamais en course ; tant qu'il n'est
   pas bâti, le maillage plein reste (comme avant). 1 = allégé, 0 = comme avant. */
PAL.B.jadeMonuLoin=[1,1,0];
/* (2026-10-14, passe perf mobile) LE VERRE DU MONUMENT, DE TOUT PRÈS SEULEMENT — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : à 1 250 m du
   centre de la Porte du ciel la scène prenait +729 000 triangles d'un coup (469 k → 1 198 k) : la bascule comparait « distance au CENTRE −
   RAYON de la sphère » à 450 m, et la sphère de la Porte (1 120 × 1 090 × 170 m) a ~790 m de rayon — le verre en trois passes (3 × 158 k)
   s'allumait donc à 1 240 m, et restait allumé ~1 240 m après (la sphère coupe toujours le champ) : ~30 s à 300 km/h. Deux leviers, par palier :
   · jadePorteVerre : le seuil (m) à la place du 450 en dur, pour tous les monuments ;
   · pour la Porte allégée (celle qui a son maillage de loin, o.dP), la distance est celle de sa FAÇADE le long de la route (|u| − D/2, la
     route la traverse droit), et passé 30 m derrière sa face arrière elle est tout entière dans le dos de la caméra : opaque allégée aussitôt.
   Reste en verre plein : 150 m (300 m) avant la façade + les 170 m de l'arche + 30 m ≈ 350 m (500 m), soit ~4 s (~6 s) à 300 km/h.
   Palier RÉCENT : 450 m sur la sphère, comme avant (o.dP n'y existe pas). */
PAL.B.jadePorteVerre=[150,300,450];JADE_LOD.mv=PAL.b('jadePorteVerre',450);
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN EN TRANCHES. MESURÉ (node, Mac) : voxDemi ~17 ms + voxMesh ~18 ms d'un seul bloc dans
   la chauffe, soit ~150 ms figés sur iPhone 7 — au ras du voile du portail (~280 ms). voxDemiG et voxMeshG sont déjà des GÉNÉRATEURS à
   échéance (JF.lim, état tout local) : jadeMonuLoin ne fait plus que préparer la file (o.loIt), jadeTick en mène UNE tranche par image
   (jadeMonuLoinPas, budget jadeMonuLoinMs), JF.lim posé le temps de la tranche puis rendu. Même maillage au bit près (banc node : un trait
   contre des tranches forcées à chaque échéance). Tant que ce n'est pas fini, le maillage plein reste (o.lo absent : jadeTick ne bascule pas).
   Carte rangée (JADE_GARDE) : la file attend (jadeTick ne voit que la carte en place) et reprend avec elle ; carte jetée : jadeJette ferme la
   file (le finally de voxMeshG rend VOXM). Cible ~40 tranches ≈ 1,3 s sur iPhone 7 au lieu d'un bloc de ~150 ms. dbgMonuLoin() : l'état. */
PAL.B.jadeMonuLoinMs=[4,3,3];
function* jadeMonuLoinG(G){const H=yield* voxDemiG(G);return yield* voxMeshG(H);} // = voxMesh(voxDemi(G)), en tranches
function jadeMonuLoin(o){if(!o||!o.dG||o.lo||!o.L||o.loIt)return;const G=o.dG;o.dG=null; // (une seule tentative : une exception laisse le maillage plein)
  o.loIt=jadeMonuLoinG(G);o.loS={t0:performance.now(),ms:0,n:0,mur:0,err:null};}
function jadeMonuLoinPas(o){const it=o.loIt,S=o.loS,t=performance.now(),l0=JF.lim;let r;
  JF.lim=t+PAL.b('jadeMonuLoinMs',3);
  try{r=it.next();}catch(e){o.loIt=null;S.err=String(e);console.warn('monument de loin',e);return;}finally{JF.lim=l0;S.ms+=performance.now()-t;S.n++;}
  if(!r.done)return;o.loIt=null;S.mur=performance.now()-S.t0;
  try{jadeMonuLoinPose(o,r.value);}catch(e){S.err=String(e);console.warn('monument de loin',e);}}
window.dbgMonuLoin=function(){return (JADE.monu||[]).filter(function(o){return o.loS||o.dG;}).map(function(o){const S=o.loS||{};
  return {etat:o.lo?'pret':o.loIt?'tranche '+S.n:S.err?'erreur':S.n?'vide':'en attente',tranches:S.n||0,msTravail:+(S.ms||0).toFixed(1),msMur:Math.round(S.mur||0),tri:o.loTri||0,loin:!!o.loin,err:S.err||null};});};
function jadeMonuLoinPose(o,g){
  if(!g.index||!g.index.count)return;
  const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=o.dJ;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));
  const m=new THREE.Mesh(g,jadeMats().vrOM);m.matrixAutoUpdate=false;m.matrix.copy(o.dM);m.matrixWorldNeedsUpdate=true;m.renderOrder=0;m.frustumCulled=true;m.userData.jeter=true;
  m.visible=!!o.loin;if(o.loin)o.L[0].visible=false;o.g.add(m);o.lo=m;o.loTri=g.index.count/3;}
function jadeDansGrille(R,p){const dx=p.x-R.o.x,dy=p.y-R.o.y,dz=p.z-R.o.z; // un point du monde est-il dans un cube de cette grille ?
  return voxAt(R.G,Math.floor((dx*R.b.x+dz*R.b.z)/VXG),Math.floor(dy/VXG),Math.floor(-(dx*R.t.x+dz*R.t.z)/VXG))>0;}
/* LA PORTE DU CIEL — un massif FLOTTANT en cubes, percé d'une arche (176 m) : faces bosselées, crête en pitons, un DESSOUS en pointes
   d'escalier d'où pendent des lianes ; rouille, herbe, touffes ; rogné si la route repasse derrière ; des montagnes soudées à ses faces. */
function* jadePorte(root,i0,jr,M9,pose){ // (LE PRÉ-BÂTI) un générateur : ses cubes (voxMeshG, colMeshG) rendent la main à l'échéance JF.lim
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),D=170;
  let wG=560,wD=560;
  for(let i=0;i<NP;i+=4){if(Math.abs(i-i0)<Math.round(420/(L/(NP-1))))continue;const q=pts[i],dx=q.x-p.x,dz=q.z-p.z,u=dx*t.x+dz*t.z,v=dx*b.x+dz*b.z;
    if(Math.abs(u)>D/2+ROAD_HALF+40)continue;if(v>0)wD=Math.min(wD,v-ROAD_HALF-50);else wG=Math.min(wG,-v-ROAD_HALF-50);}
  if(wG<180||wD<180)return;
  wG=Math.floor(wG/VXG)*VXG;wD=Math.floor(wD/VXG)*VXG;
  const y0=p.y,hb=-55,ht=215,hw=88,top=520,W=wG+wD,ab=ht-hw*.9;
  const ph=[jr()*6.28,jr()*6.28,jr()*6.28],crete=f=>{const cr=Math.sin(Math.max(0,Math.min(1,f))*Math.PI);return top*(.62+.38*Math.sqrt(cr))-(1-cr)*90+
      70*Math.pow(Math.abs(Math.sin(f*5.1+ph[0])),2.5)+35*Math.sin(f*13.7+ph[1])+18*Math.sin(f*31.+ph[2]);};
  const vn=rocNoise2(jr()*100),vb=rocNoise2(jr()*100);
  const oy=Math.floor((y0-440)/VXG)*VXG,nx=Math.round(W/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+top+130-oy)/VXG),G=voxG(nx,ny,nz);
  const cretes=new Float32Array(nx);for(let x=0;x<nx;x++)cretes[x]=crete((x+.5)/nx)+(jr()-.5)*10;
  const basT=new Float32Array(nx*nz);for(let x=0;x<nx;x++){const v=-wG+(x+.5)*VXG,xn=(v-(wD-wG)/2)/(W/2);for(let z=0;z<nz;z++)basT[x*nz+z]=-300+180*xn*xn+90*(vb(x*VXG/5*.09,z*VXG/5*.12)-.5);} // le DESSOUS, en pointes : le massif flotte
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const v=-wG+(x+.5)*VXG;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr>cretes[x])break;
      if(Math.abs(v)<hw&&yr>hb&&(yr<ab||(v/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=x*VXG/5,ys=y*VXG/5,kz=5/VXG,z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3)*kz),z1=nz-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3)*kz); // les faces BOSSELÉES (en mètres) + (v7) une rugosité fine : la façade se lit en petits cubes, comme les montagnes
      for(let z=z0;z<z1;z++)if(yr>=basT[x*nz+z])G.d[x+nx*(z+nz*y)]=JM.roche;}}
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const ru=vn(x*VXG/5*.3,3.3)>.83;
    for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;const yr=oy+(y+.5)*VXG-y0;
      if(!voxAt(G,x,y+1,z)&&yr>-60){G.d[k0]=JM.herbe;continue;}
      if(ru&&(!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&jr()<.9)G.d[k0]=JM.rouille;}}
  const o=p.clone().addScaledVector(b,-wG).addScaledVector(t,D/2);o.y=oy;
  JADE.porte={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,hw:hw,hb:y0+hb,ht:y0+ht,G:G,o:o,i:i0,tri:0};
  // (v8) LES CUBES MINUSCULES de la porte : la RÉGION que la route traverse (l'arche ± 110 m, de 140 m sous la route à 360 m au-dessus) devient
  // FANTÔME dans la muraille (ni faces ni trou, voxMesh) ; elle a deux habits : de LOIN ses cubes de 2,5 m (une petite grille découpée autour
  // d'elle), de PRÈS (< 780 m) ses colonnes fines (colMesh, les marches avec la muraille posées des deux côtés). Les chocs lisent toujours G.
  let fin9=false;const T0=performance.now(),TT=JADE.tPorte={};
  if(FIN.on){try{const K=FIN.k,RW=hw+110,xa=Math.max(0,Math.floor((wG-RW)/VXG)),xb=Math.min(nx,Math.ceil((wG+RW)/VXG)),ya=Math.max(0,Math.floor((y0-140-oy)/VXG)),yb=Math.min(ny,Math.ceil((y0+360-oy)/VXG));
    const Gc={nx:nx,ny:ny,nz:nz,d:G.d.slice()};for(let y=ya;y<yb;y++)for(let z=0;z<nz;z++)for(let x=xa;x<xb;x++){const k=x+nx*(z+nz*y);if(Gc.d[k])Gc.d[k]=255;}
    TT.ghost=Math.round(performance.now()-T0);const gA=yield* voxMeshG(Gc,4);TT.A=Math.round(performance.now()-T0);
    const x0=Math.max(0,Math.floor((xa-1)/4)*4),y09=Math.max(0,Math.floor((ya-1)/4)*4),x1=Math.min(nx,xb+1),y1=Math.min(ny,yb+1),Gb=voxG(x1-x0,y1-y09,nz); // la région seule, en 2,5 m (de loin)
    for(let y=y09;y<y1;y++)for(let z=0;z<nz;z++)for(let x=x0;x<x1;x++){const m9=G.d[x+nx*(z+nz*y)];if(!m9)continue;Gb.d[(x-x0)+Gb.nx*(z+nz*(y-y09))]=(x>=xa&&x<xb&&y>=ya&&y<yb)?m9:255;}
    const gB=yield* voxMeshG(Gb,4);TT.B=Math.round(performance.now()-T0);const oB=o.clone().addScaledVector(b,x0*VXG);oB.y+=y09*VXG;
    const NU=(xb-xa)*K,NV=(yb-ya)*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),kz=5/VXG;
    for(let v=0;v<NV;v++){if(performance.now()>JF.lim)yield;for(let u=0;u<NU;u++){const x=(xa*K+u+.5)/K,y=(ya*K+v+.5)/K,vv=-wG+x*VXG,yr=oy+y*VXG-y0;
      const xi=Math.min(nx-1,Math.max(0,Math.floor(x-.5))),fx=Math.min(1,Math.max(0,x-.5-xi)),cr=cretes[xi]*(1-fx)+cretes[Math.min(nx-1,xi+1)]*fx;if(yr>=cr)continue;
      if(Math.abs(vv)<hw&&yr>hb&&(yr<ab||(vv/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=(x-.5)*VXG/5,ys=(y-.5)*VXG/5;
      const z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3+.5*vn(xs*2.3+7,ys*1.8+2))*kz*K),
            z1=nz*K-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3+.5*vn(xs*2.3+17,ys*1.8+9))*kz*K);
      if(z1>z0){LO[u+NU*v]=z0;HI[u+NU*v]=z1;}}}
    TT.cols=Math.round(performance.now()-T0);const cache=new Map(),nb=(u,v)=>{const cx=Math.floor((xa*K+u)/K),cy=Math.floor((ya*K+v)/K);if(cx<0||cy<0||cx>=nx||cy>=ny)return null;const kk=cx*4096+cy;
      if(!cache.has(kk)){let z0=-1,z1=-1;for(let z=0;z<nz;z++)if(G.d[cx+nx*(z+nz*cy)]){if(z0<0)z0=z;z1=z;}cache.set(kk,z0<0?null:[z0*K,(z1+1)*K]);}return cache.get(kk);};
    const mat=(kind,u,v,sg)=>{if(kind==='w')return vn((xa*K+u)/K*VXG/5*.3,3.3)>.83?JM.rouille:1;if(kind==='v'&&sg>0)return oy+(ya*K+v+1)/K*VXG-y0>-60?JM.herbe:1;return 1;};
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,1,2],mat,nb,12);TT.F=Math.round(performance.now()-T0);const oF=o.clone().addScaledVector(b,xa*VXG);oF.y+=ya*VXG;
    jadeMonument(root,gA,jadeRepere(o,b,t),.37,M9);JADE.porte.mL=jadeMonument(root,gB,jadeRepere(oB,b,t),.37,M9);JADE.porte.mF=jadeMonument(root,gF,jadeRepere(oF,b,t,VXG/K),.37,M9);
    for(const m of JADE.porte.mF)m.visible=false;JADE.porte.pres=false;JADE.porte.tri=gA.index.count/3+gB.index.count/3;JADE.porte.triF=gF.index.count/3;fin9=true;}catch(e){console.warn('porte fine',e);}}
  if(!fin9){const g=yield* voxMeshG(G,4);jadeMonument(root,g,jadeRepere(o,b,t),.37,M9);JADE.porte.tri=g.index.count/3;
    if(PAL.b('jadeMonuLoin',0)){const e9=JADE.monu[JADE.monu.length-1];e9.dG=G;e9.dM=jadeRepere(o,b,t,VXG*2);e9.dJ=.37;e9.dP=JADE.porte;}} // (2026-10-14, passe perf mobile) de loin : la demi-grille posée ×2 (voir jadeMonuLoin)
  if(pose){for(const sg of [-1,1]){const W9=sg<0?wG:wD;
      for(const fa of [-1,1])pose(p.x+b.x*sg*(hw+62)+t.x*fa*(D*.5-18),p.z+b.z*sg*(hw+62)+t.z*fa*(D*.5-18),40,y0+crete(.5+sg*(hw+62)/W)+40+jr()*80);
      for(let v=hw+140;v<W9-40;v+=75+jr()*60)for(const fa of [-1,1])if(jr()<.7){const r=24+jr()*26,f9=(v*sg+wG)/W;
        pose(p.x+b.x*sg*v+t.x*fa*(D*.5-r*.3),p.z+b.z*sg*v+t.z*fa*(D*.5-r*.3),r,y0+crete(f9)-60+jr()*170);}}}
}
/* LE PONT DU CIEL — deux montagnes flottantes en cubes, une arche de cubes qui les relie (72-150 m au-dessus de la route), herbe,
   touffes et pins peints dessus, lianes dessous. */
function* jadePont(root,i0,jr,M9,pose,ARB){ // (LE PRÉ-BÂTI) un générateur (voir jadePorte)
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),y0=p.y;
  const ec=ROAD_HALF+66,G9=JADE.geos,tp=jadeTplDe(40),Tp=G9.p[tp];
  for(const sg of [-1,1]){const cx=Math.round((p.x+b.x*sg*ec)/VX)*VX,cz=Math.round((p.z+b.z*sg*ec)/VX)*VX,yt=Math.floor((y0+205+(sg>0?24:0))/VX)*VX;
    pose([cx,cz,Tp.rmax*VX,yt-Tp.yTop*VX,yt,tp,(jr()*4)|0,jr(),ec]);}
  const xa=Math.ceil((ec+12)/VXG)*VXG,D=66,PR={b0:72,bC:104,t0:132,tC:150};
  const yB=f=>PR.b0+(PR.bC-PR.b0)*Math.sin(f*Math.PI),yH=f=>PR.t0+(PR.tC-PR.t0)*Math.pow(Math.sin(f*Math.PI),.6);
  const oy=Math.floor((y0+PR.b0-12)/VXG)*VXG,nx=Math.round(2*xa/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+PR.tC+20-oy)/VXG),G=voxG(nx,ny,nz);
  for(let x=0;x<nx;x++){const f=(x+.5)/nx,a=yB(f)+(jr()-.5)*5,c=yH(f)+(jr()-.5)*5;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr<a||yr>c)continue;for(let z=0;z<nz;z++){if((z===0||z===nz-1)&&jr()<.3)continue;G.d[x+nx*(z+nz*y)]=JM.roche;}}}
  const tops=[];
  for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;
    if(!voxAt(G,x,y+1,z)){G.d[k0]=JM.herbe;tops.push([x,y,z]);}
    else if((!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&x%7===3&&jr()<.8)G.d[k0]=JM.rouille;}
  const o=p.clone().addScaledVector(b,-xa).addScaledVector(t,D/2);o.y=oy;
  const g=yield* voxMeshG(G,4),Mr=jadeRepere(o,b,t),mL=jadeMonument(root,g,Mr,.81,M9);
  const V3=new THREE.Vector3();
  for(let k=0;k<14&&tops.length;k++){const c=tops[(jr()*tops.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(Mr);const h=9+jr()*9,pin=jr()<.7;ARB.push({x:V3.x,y:V3.y,z:V3.z,j:[h*(pin?.95:1.35),h,pin?(jr()*4)|0:4,jr()]});}
  JADE.pont={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,xa:xa,yB:yB,yH:yH,G:G,o:o,i:i0,tri:g.index.count/3,mL:mL};
  // (v8) LES CUBES MINUSCULES du pont : l'arche entière en colonnes fines (de près, < 650 m)
  if(FIN.on){try{const K=FIN.k,cv=VXG/K,NU=nx*K,NV=nz*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),na=rocNoise2(31.7),nc=rocNoise2(77.1);
    const hs=(u,v,s9)=>{const x=Math.sin(u*127.1+v*311.7+s9)*43758.5453;return x-Math.floor(x);};
    for(let u=0;u<NU;u++){const f=(u+.5)/NU,a=yB(f)+5*(na(u*cv*.07,1.3)-.5)*2,c=yH(f)+5*(nc(u*cv*.07,4.1)-.5)*2;
      for(let v=0;v<NV;v++){if((v<2||v>=NV-2)&&hs(u,v,1)<.3)continue;const a9=a+(hs(u,v,2)-.5)*1.2,c9=c+(hs(u,v,3)-.5)*1.2;
        const lo=Math.ceil((a9+y0-oy)/cv-.5),hi=Math.floor((c9+y0-oy)/cv-.5)+1;if(hi>lo){LO[u+NU*v]=lo;HI[u+NU*v]=hi;}}}
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,2,1],function(kind,u,v,sg){return kind==='w'&&sg>0?JM.herbe:1;},null,12);
    JADE.pont.mF=jadeMonument(root,gF,jadeRepere(o,b,t,cv),.81,M9);for(const m of JADE.pont.mF)m.visible=false;JADE.pont.pres=false;JADE.pont.triF=gF.index.count/3;}catch(e){console.warn('pont fin',e);}}
}
/* ---- LE TRI : à chaque rendu (chaîné sur scene.onBeforeRender), les quartiers dans le champ et en deçà de la brume, chacun à sa BANDE
   de distance (jadeBande) ; chaque famille dessine les bandes qui sont les siennes. Les tampons ne repartent que si la liste a changé. ---- */
const JT={fr:new THREE.Frustum(),pv:new THREE.Matrix4(),vis:null,ms:0,n:0,up:0,fam:0};
/* (v8) LES MONTAGNES PROCHES (≤ FIN.D, +25 m pour en sortir) passent aux cubes minuscules — rend une signature (le tri ne recopie que si elle change) */
function finProches(cp){
  if(!FIN.on||!JADE.col||!FIN.stamp)return 7;FIN.veut.clear();
  const C=JADE.col,P=C.P,D=FIN.D,r=Math.ceil((D+110)/C.CG),bx=Math.floor(cp.x/C.CG),bz=Math.floor(cp.z/C.CG),gen=++FIN.gen,o=FIN.near,par=FIN.par||(FIN.par=[]);
  o.length=0;par.length=0;
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=C.g.get((bx+dx)+','+(bz+dz));if(!a)continue;
    for(let j=0;j<a.length;j++){const k=a[j];if(k<0||FIN.stamp[k]===gen)continue;FIN.stamp[k]=gen;const q=P[k];if(!FIN.fam[q[5]]){FIN.veut.add(q[5]);continue;}
      const dh=Math.max(0,Math.hypot(q[0]-cp.x,q[1]-cp.z)-q[2]),dv=cp.y<q[3]?q[3]-cp.y:cp.y>q[4]?cp.y-q[4]:0;
      if(Math.hypot(dh,dv)<(FIN.was[k]?D+25:D))o.push(k);}}
  for(const k of FIN.dans)FIN.was[k]=0;FIN.dans.clear();
  o.sort(function(a,b){return a-b;});const n9=new Map();let sg=7;
  for(const k of o){const t=P[k][5],c=n9.get(t)||0;if(c>=FIN.fam[t].cap)continue;n9.set(t,c+1);FIN.dans.add(k);FIN.was[k]=1;sg=(Math.imul(sg,31)+k+1)|0;}
  return sg;}
function finFamille(t){const T9=JADE.geos.p[t],cap=FIN.cap&&FIN.cap[t];if(!T9||!T9.fin||!cap||!JADE.root||FIN.fam[t])return; // la famille fine d'un gabarit (quand il est prêt)
  const M9=jadeMats(),g=jadeVueGeo(T9.fin),aJ=new THREE.InstancedBufferAttribute(new Float32Array(cap*4),4);aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aJ',aJ);
  const mk=(mat,ro)=>{const im=new THREE.InstancedMesh(g,mat,cap);im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=ro;im.count=0;im.visible=false;JADE.root.add(im);return im;};
   // (v10) les ÉCAILLES du vitrail : une passe opaque
  const im=mk(M9.vr,3),im2=mk(M9.vrX,2),im3=mk(M9.vrP,2.5);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im2.instanceMatrix=im.instanceMatrix;im3.instanceMatrix=im.instanceMatrix;
  FIN.fam[t]={t:t,im:im,im2:im2,im3:im3,aJ:aJ,cap:cap,tri:T9.fin.index.count/3};}
function finTravail(budget){ // (v8) les gabarits fins se bâtissent À LA VOLÉE, quelques ms par image (le départ n'attend pas) — d'abord ceux qu'on approche
  if(!FIN.on||!JADE.geos||!JADE.root)return;const P9=JADE.geos.p,t0=performance.now();
  while(performance.now()-t0<budget){
    if(!FIN.job){let t=-1;for(const k of FIN.veut)if(!P9[k].fin&&!P9[k].finX){t=k;break;}
      if(t<0)for(let k=0;k<P9.length;k++)if(!P9[k].fin&&!P9[k].finX&&FIN.cap&&FIN.cap[k]){t=k;break;}
      if(t<0)return;FIN.job={t:t,it:voxPilierFin(P9[t]),t0:performance.now(),ms:0};}
    const j9=FIN.job,a9=performance.now();let r;
    try{r=j9.it.next();}catch(e){P9[j9.t].finX=1;FIN.job=null;console.warn('cubes fins',e);continue;}
    j9.ms+=performance.now()-a9;
    if(r.done){P9[j9.t].fin=r.value;P9[j9.t].finMs=Math.round(j9.ms);FIN.job=null;finFamille(j9.t);JADE.sig=0;}}}
function finMat(pi){let m=FIN.mats.get(pi);if(m)return m;const q=JADE.col.P[pi],T9=JADE.geos.p[q[5]],K=FIN.k;
  m=new Float32Array(new THREE.Matrix4().makeTranslation(q[0],q[3],q[1]).multiply(new THREE.Matrix4().makeRotationY(q[6]*Math.PI/2)).multiply(new THREE.Matrix4().makeScale(VX/K,VX/K,VX/K)).multiply(new THREE.Matrix4().makeTranslation(-T9.M*K,0,-T9.M*K)).elements);
  FIN.mats.set(pi,m);return m;}
function jadeTri(cam){
  if(!JADE.root||!JADE.quart||!JADE.fam.length)return;const t0=performance.now();
  JT.fr.setFromProjectionMatrix(JT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const f=scene.fog,ff=(f&&f.isFog)?f.far:9000,cp=cam.position,Qs=JADE.quart,S=JT._s||(JT._s=new THREE.Sphere());
  if(!JT.vis||JT.vis.length!==Qs.length)JT.vis=new Int8Array(Qs.length);
  let sig=finProches(cp);
  for(let k=0;k<Qs.length;k++){const q=Qs[k];S.center.copy(q.c);S.radius=q.r;let v=-1;
    if(JT.fr.intersectsSphere(S)){const b=q.b,ex=Math.max(b[0]-cp.x,0,cp.x-b[1]),ey=Math.max(b[2]-cp.y,0,cp.y-b[3]),ez=Math.max(b[4]-cp.z,0,cp.z-b[5]),d=Math.sqrt(ex*ex+ey*ey+ez*ez);if(d<ff+60)v=jadeBande(d);} // (v17) la distance à la BOÎTE du quartier (la sphère comptait la hauteur des montagnes : tout restait en détail max à 700 m)
    JT.vis[k]=v;if(v>=0)sig=(Math.imul(sig,31)+k*8+v+1)|0;}
  /* (v17, Léo : « ça bugue énormément ») — MESURÉ : un tiers du temps de l'image partait dans bufferSubData — à chaque quartier qui changeait de
     bande, TOUTES les familles renvoyaient TOUT leur tampon (les 60 000 arbres compris). Désormais une famille ne se réécrit que si SA liste
     change (sa signature : ses quartiers retenus + ses montagnes cédées) ou si l'effondrement l'a salie, et n'envoie que la partie utile
     (updateRange). Les montagnes cédées aux cubes fins sont RETIRÉES de la liste (l'ordre des instances ne compte pas : multiplier, ajouter,
     écrire la profondeur ne dépendent pas de l'ordre) — écrasées en un point, leurs sommets passaient encore trois fois par le GPU. */
  if(sig!==JADE.sig||JADE.sale){const tout=JADE.sig===0;JADE.sig=sig;JADE.sale=false;JT.up++;
    for(const F of JADE.fam){let fs=7;
      const RK=F.rK,RA=F.rA,RB=F.rB,nR=RK.length; /* (2026-10-14, passe mobile) MESURÉ (échantillonneur du tas, course au pilote) : jadeTri jetait ~7 Mo/s — `for(const [k,r] of F.r)`
         fabrique un tableau [clé, valeur] par quartier, pour chaque famille, à chaque changement de signature. Le ramasse-miettes passait
         sans cesse (des à-coups). Mêmes quartiers, même ordre (celui de la Map), lus dans trois tableaux d'entiers. */
      for(let i=0;i<nR;i++){const k=RK[i],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;fs=(Math.imul(fs,31)+k+1)|0;}
      if(F.pidx&&FIN.dans.size)for(const pi of FIN.dans)if(F.pidx.has(pi))fs=(Math.imul(fs,17)+pi+3)|0;
      if(!tout&&!F.sale&&fs===F.sig)continue;F.sig=fs;F.sale=false;JT.fam++;
      let w=0;const A=F.im.instanceMatrix.array,J=F.aJ.array;
      for(let i=0;i<nR;i++){const k=RK[i],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;if(F.dst)F.dst.set(k,w);const r0=RA[i],r1=RB[i];
        A.set(F.M.subarray(r0*16,r1*16),w*16);J.set(F.J.subarray(r0*4,r1*4),w*4);w+=r1-r0;}
      if(F.pidx&&FIN.dans.size){const ds=JT.ds||(JT.ds=[]);ds.length=0;
        for(const pi of FIN.dans){const si=F.pidx.get(pi);if(si===undefined)continue;const k=F.qk[si],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;const d0=F.dst.get(k);if(d0===undefined)continue;ds.push(d0+si-F.r.get(k)[0]);}
        ds.sort(function(a,b){return b-a;});
        for(const d of ds){w--;if(d!==w){A.copyWithin(d*16,w*16,w*16+16);J.copyWithin(d*4,w*4,w*4+4);}}}
      F.im.count=w;if(F.im2){F.im2.count=w;F.im3.count=w;}
      /* (2026-10-14, passe mobile) VIDE = INVISIBLE. MESURÉ (dbgAppels, départ du Soleil de jade) : 47 des 269 appels de dessin de l'image
         étaient des familles à ZÉRO montagne — three les prépare quand même (programme, uniformes, tampons) et lance un dessin de 0 exemplaire :
         17 % du travail de rendu du processeur pour rien. Les cubes fins (FIN, plus bas) le faisaient déjà. F.coupe = les bancs dbgJadePoste. */
      F.im.visible=w>0&&!F.coupe;if(F.im2)F.im2.visible=F.im3.visible=w>0&&!F.coupe&&!F.coupeV;
      if(w){F.im.instanceMatrix.updateRange.offset=0;F.im.instanceMatrix.updateRange.count=w*16;F.im.instanceMatrix.needsUpdate=true;F.aJ.updateRange.offset=0;F.aJ.updateRange.count=w*4;F.aJ.needsUpdate=true;}}
    for(const FF of FIN.fam){if(!FF)continue;let n=0,fs=7;for(const pi of FIN.dans)if(JADE.col.P[pi][5]===FF.t)fs=(Math.imul(fs,31)+pi+1)|0; // les CUBES MINUSCULES
      if(!tout&&!FIN.sale&&fs===FF.sig)continue;FF.sig=fs;const A=FF.im.instanceMatrix.array,J=FF.aJ.array;
      for(const pi of FIN.dans){const q=JADE.col.P[pi];if(q[5]!==FF.t)continue;A.set(finMat(pi),n*16);J[n*4]=q[7];J[n*4+1]=q[8]<2000||q[8]===1e9?1:.85;J[n*4+2]=0;J[n*4+3]=0;n++;}
      FF.im.count=FF.im2.count=FF.im3.count=n;FF.im.visible=FF.im2.visible=FF.im3.visible=n>0;
      if(n){FF.im.instanceMatrix.updateRange.offset=0;FF.im.instanceMatrix.updateRange.count=n*16;FF.im.instanceMatrix.needsUpdate=true;FF.aJ.updateRange.offset=0;FF.aJ.updateRange.count=n*4;FF.aJ.needsUpdate=true;}}
    FIN.sale=false;}
  JT.ms+=performance.now()-t0;JT.n++;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{jadeTri(cam);if(JADE.root&&NUVOX.L)nuvoxTri(cam);}catch(e){window.__jadeErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* ---- LA LUMIÈRE FANTÔME (v5) ----
   · LES RAYONS : de longs pans de lumière pâle qui tombent en biais à travers la brume entre les montagnes (additifs, tournés vers la
     caméra autour de leur axe, effilés aux deux bouts, qui ondulent lentement) — posés le long de la route à chaque vallée (`jadeRayons`).
   · LES ESPRITS : des poussières de lumière qui flottent et montent doucement autour de la caméra, scintillent, s'éteignent près de
     l'objectif (un nuage de points qui se replie autour d'elle : l'espace en est rempli sans en poser des millions). */
const JADE_RAYON_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{uTime:JADE_U.uTime,uAx:{value:new THREE.Vector3(SUN_DIR.x,.55,SUN_DIR.z).normalize()},uCol:{value:new THREE.Color(1,.96,.86)}},
  vertexShader:['attribute vec3 aC;attribute vec4 aW;uniform vec3 uAx;varying vec2 vP;varying vec4 vWw;varying float vF;',
    'void main(){vec3 tc=normalize(cameraPosition-aC),W=normalize(cross(uAx,tc)+vec3(1e-4,0.,0.));',
    '  vec3 wp=aC+uAx*position.y*aW.y+W*position.x*aW.x*(1.+.6*(position.y+.5));vP=position.xy;vWw=aW;',
    '  float d=length(cameraPosition-wp);vF=smoothstep(2600.,900.,d)*smoothstep(40.,220.,d);',
    '  gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}'].join('\n'),
  fragmentShader:['uniform float uTime;uniform vec3 uCol;varying vec2 vP;varying vec4 vWw;varying float vF;',
    'void main(){float ac=1.-abs(vP.x*2.),al=sin((vP.y+.5)*3.1416);float n=.55+.45*sin(vP.y*6.+uTime*.25+vWw.z*20.)*sin(vP.x*9.+vWw.z*7.+uTime*.15);',
    '  float a=ac*ac*al*n*vWw.w*vF;gl_FragColor=vec4(mix(vec3(1.,.62,.84),uCol,smoothstep(0.,.55,ac))*a,a);}'].join('\n')});m.dispose=function(){};return m;})(); /* (2026-10-21, embellie) deux températures : le cœur du rai prend la couleur du soleil (jadeTick : doré au soir, bleu pâle la nuit), ses franges le rose */
function jadeRayons(L9){ // [x, y, z, largeur, longueur, graine, intensité]
  const P=[],C=[],W=[],I=[];
  for(let k=0;k<L9.length;k++){const q=L9[k],b=P.length/3;for(const v of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){P.push(v[0],v[1],0);C.push(q[0],q[1],q[2]);W.push(q[3],q[4],q[5],q[6]);}I.push(b,b+1,b+2,b,b+2,b+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aC',new THREE.Float32BufferAttribute(C,3));
  g.setAttribute('aW',new THREE.Float32BufferAttribute(W,4));g.setIndex(I);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);return g;}
const JADE_ESPRITS=(function(){const N=TEL_NATIF?900:2400,S=700,P=new Float32Array(N*3),A=new Float32Array(N),rg=mulberry32(0xE5B1);
  for(let k=0;k<N;k++){P[k*3]=(rg()-.5)*S;P[k*3+1]=(rg()-.5)*S;P[k*3+2]=(rg()-.5)*S;A[k]=rg();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aS',new THREE.BufferAttribute(A,1));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);
  /* (2026-10-21, embellie — le DÉTAIL VIVANT de Jade) la même volée de points, trois genres : les lucioles d'avant (elles montent, rondes) ; des PÉTALES rose et or
     (aS < .16 : ils TOMBENT en tournoyant, ovales) ; des ÉCLATS DE JADE CARRÉS (aS > .90 : de petits pixels de lumière verte, l'écho des cubes). Aucun point de plus,
     aucun programme de plus, aucun travail par point côté processeur : tout est dans le vertex shader (le genre sort de aS). */
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uTime:JADE_U.uTime,uCam:{value:new THREE.Vector3()},uPx:{value:1},uK:{value:0}},
    vertexShader:['attribute float aS;uniform vec3 uCam;uniform float uTime,uPx;varying float vA,vG,vR;varying vec3 vC;',
      'void main(){vec3 p=position;float pe=step(aS,.16),px=step(.90,aS);',
      '  p.y+=uTime*mix(1.5+aS*3.5,-(1.1+aS*6.),pe);p.x+=sin(uTime*.3+aS*30.)*14.*(1.+pe*.9);p.z+=cos(uTime*.25+aS*20.)*14.*(1.+pe*.9);',
      '  vec3 rel=mod(p-uCam+350.,700.)-350.;vec4 mv=viewMatrix*vec4(uCam+rel,1.);float d=-mv.z;',
      '  vA=(.35+.65*(.5+.5*sin(uTime*(.8+aS*2.)+aS*50.)))*smoothstep(345.,140.,length(rel))*smoothstep(3.,14.,d);',
      '  float h9=fract(aS*7.31);vC=h9<.45?vec3(1.,.82,.45):h9<.75?vec3(1.,.60,.86):vec3(.62,.96,1.);', // (v17) FÉERIQUE : des lucioles d or, de rose et de turquoise
      '  if(pe>.5)vC=h9<.5?vec3(1.,.60,.80):vec3(1.,.84,.46);if(px>.5)vC=vec3(.40,1.,.72);',                // les pétales : le rose et l or de la marque ; les éclats : le vert jade
      '  vG=pe+2.*px;vR=uTime*(.7+aS*2.2)+aS*40.;',
      '  gl_PointSize=uPx*(1.9+aS*3.2)*(1.+pe*.7)*min(8.,340./max(d,1.));gl_Position=projectionMatrix*mv;}'].join('\n'),
    fragmentShader:['uniform float uK;varying float vA,vG,vR;varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float a;',
      '  if(vG>1.5){q=abs(q)*2.;float r=max(q.x,q.y);a=(smoothstep(1.,.6,r)*.8+exp(-r*r*3.)*.25)*vA*uK;}',                                  // l éclat : un carré net
      '  else if(vG>.5){float c=cos(vR),s=sin(vR);q=vec2(c*q.x-s*q.y,s*q.x+c*q.y)*2.;q.y*=2.3;float r=length(q);a=(exp(-r*r*3.5)+.3*exp(-r*r*20.))*vA*uK;}', // le pétale : un ovale qui tourne
      '  else{float r=length(q)*2.;a=(exp(-r*r*4.5)+.35*exp(-r*r*40.))*vA*uK;}',
      '  gl_FragColor=vec4(vC*a*1.25,a);}'].join('\n')});
  const pt=new THREE.Points(g,m);pt.frustumCulled=false;pt.renderOrder=6;pt.visible=false;scene.add(pt);return pt;})();
const JADE_C9=new THREE.Color();
const JADE_NUAGE_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uTex:{value:null},uTime:JADE_U.uTime,uTeinte:{value:new THREE.Color(1,1,1)},uFogC:{value:new THREE.Color(.8,.86,.88)},uSunD:JADE_U.uSunDir,uSunC:JADE_U.uSunC},
  vertexShader:['attribute vec4 aJ;uniform float uTime;varying vec2 vUv;varying float vD,vFl,vC;varying vec3 vR,vU,vF;',
    'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float sd=fract(aJ.w);vC=floor(aJ.w);', // la graine ; la couche (0 devant, 1 le voile de derrière)
    '  c.y+=sin(uTime*.07+sd*40.)*aJ.y*.03;c.x+=sin(uTime*.013+sd*9.)*40.;',
    '  vec3 f=normalize(c-cameraPosition),R=normalize(cross(f,vec3(0.,1.,0.))+vec3(1e-4,0.,0.)),U=cross(R,f);vR=R;vU=U;vF=-f;', // face à la caméra, debout
    '  vec3 wp=c+R*position.x*aJ.x+U*position.y*aJ.y;vD=length(wp-cameraPosition);',
    '  float k=aJ.z,col=mod(k,4.),row=floor(k/4.),u=position.x+.5;vFl=1.;if(sd>.5){u=1.-u;vFl=-1.;}',
    '  vUv=vec2((col+u)*.25,1.-(row+1.)*.25+(position.y+.5)*.25);',
    '  gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}'].join('\n'),
  fragmentShader:['uniform sampler2D uTex;uniform vec3 uTeinte,uFogC,uSunD,uSunC;varying vec2 vUv;varying float vD,vFl,vC;varying vec3 vR,vU,vF;',
    'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.01)discard;',
    '  vec2 e=vec2(1.5/2048.,1.5/1024.);',
    '  float hx=(texture2D(uTex,vUv+vec2(e.x,0.)).r-texture2D(uTex,vUv-vec2(e.x,0.)).r)*vFl,hy=texture2D(uTex,vUv+vec2(0.,e.y)).r-texture2D(uTex,vUv-vec2(0.,e.y)).r;',
    '  vec3 n=normalize(vec3(-hx*18.,-hy*18.,1.)),L=normalize(vec3(dot(uSunD,vR),dot(uSunD,vU),dot(uSunD,vF)));', // la normale du relief, le soleil dans le repère du panneau
    '  float h=t.r,dif=max((dot(n,L)+.3)/1.3,0.);',
    '  vec3 amb=mix(vec3(.50,.64,.70),vec3(.93,.96,.97),n.y*.5+.5);',                     // l ombre jade-bleue dessous, le ciel dessus
    '  vec3 col=vec3(.97,.97,.94)*(amb*.62+uSunC*dif*.48);',
    '  col*=1.-t.g*.2;col+=uSunC*pow(1.-h,3.)*max(-L.z,0.)*.22;',                        // la spirale un peu plus sombre ; le contre-jour dans les bords minces
    '  col*=uTeinte;col=mix(col,uFogC,smoothstep(1500.,7500.,vD)*.55+vC*.2);',
    '  float a=t.a*(.22+.58*smoothstep(0.,.45,h))*(1.-vC*.5);',                          // l opacité suit l épaisseur ; le voile de derrière à moitié
    '  gl_FragColor=vec4(col,a*smoothstep(80.,320.,vD)*(1.-smoothstep(7800.,9400.,vD)));}'].join('\n')});m.dispose=function(){};return m;})();
/* (v13, Léo : « les nuages en cubes minuscules ») LES VOLUTES EN CUBES — les seize dessins en relief deviennent de vrais VOLUMES de petits
   cubes : la grille 96 × 48 relit la carte de hauteur (épaisseur = la hauteur, de part et d'autre d'un plan médian : des lobes ronds, la
   base en coussins, la queue en tube), les spirales creusées gardent leur ombre (matière 2), le maillage glouton pose l'ombre aux coins
   (`aAO`). Un cube = la largeur du nuage ÷ 96 (8-20 m). Chaque nuage est TOURNÉ vers la route (sa face large vers qui passe) ; le
   « miroir » d'un dessin, c'est le même vu de l'autre côté (le volume est symétrique). Éclairés au soleil de la map, une ombre jade-lavande,
   chaque cube sa nuance, la perspective aérienne du loin. */
const NUVOX={GX:96,GY:48,geos:null};
/* (2026-10-14, passe perf mobile) LES VOLUTES PAR PALIER — MESURÉ (iPhone 7 émulé, Soleil de jade) : 353 000 triangles par image rien que
   pour les nuages en cubes (un tiers de l'image ; la puce d'un iPhone 7 souffre au-delà de ~300 000 en tout). On garde TOUS les nuages, à
   la même place et à la même taille ; seuls leurs cubes grossissent sur les vieux appareils (chaque cran = ¼ des triangles) :
     jadeNuvoxPres  : en deçà, les petits cubes (avant : 2 500 m). De là à 2 500 m, les cubes DOUBLES posés à l'échelle ×2 (même volume).
     jadeNuvoxQuart : au-delà, les cubes QUADRUPLES (grille ÷ 4, posés ×2 : la carrure exacte du nuage lointain d'avant, 1/16 des triangles).
   Palier 2 : 2 500 / jamais = le tri d'avant, au triangle près (le 3e jeu de maillages n'est même pas construit). */
PAL.B.jadeNuvoxPres=[0,1500,2500];PAL.B.jadeNuvoxQuart=[2500,5000,1e9];
NUVOX.pres=PAL.b('jadeNuvoxPres',2500);NUVOX.qd=PAL.b('jadeNuvoxQuart',1e9);NUVOX.pas=NUVOX.qd<1e8?3:2; // pas = maillages par dessin (petits, doubles[, quadruples])
/* LE TRI DES VOLUTES (à chaque rendu, chaîné sur jadeTri) : seules celles dans le champ partent au GPU, de près en petits cubes, de loin en gros */
function nuvoxM2(n){const m=n.m2=Float32Array.from(n.m);for(let i=0;i<12;i++)m[i]*=2;return m;} // la même pose, les trois axes doublés (la grille ÷ 2 retrouve sa taille) — fait une fois par nuage, à la demande
function nuvoxTri(cam){const N9=NUVOX.L;if(!N9||!N9.length)return;let sg=7;
  for(let i=0;i<N9.length;i++){const n=N9[i];NUVOX.S.center.copy(n.c);NUVOX.S.radius=n.r;let v=0;if(JT.fr.intersectsSphere(NUVOX.S)){const d9=cam.position.distanceTo(n.c);v=d9<NUVOX.pres?1:d9<2500?(NUVOX.pres<2500?3:1):d9<NUVOX.qd?2:4;}n.v=v;sg=(Math.imul(sg,31)+v)|0;}
  if(sg===NUVOX.sig)return;NUVOX.sig=sg;
  for(const im of NUVOX.ims){im.count=0;}
  for(const n of N9){if(!n.v)continue;const v=n.v,im=NUVOX.ims[n.t*NUVOX.pas+(v===1?0:v===4?2:1)];im.instanceMatrix.array.set(v>2?(n.m2||nuvoxM2(n)):n.m,im.count*16);im.count++;} // (2026-10-14, passe perf mobile) v : 1 petits cubes · 2 doubles (le lointain d'avant) · 3 doubles à l'échelle ×2 · 4 quadruples à l'échelle ×2
  for(const im of NUVOX.ims){imEnvoi(im,im.count);im.visible=im.count>0;}} // (2026-10-14, passe perf mobile) [0,count) vient d'être réécrit : seul ce bout part (et rien pour un jeu vide)
const JADE_NUVOX_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:true,
  uniforms:{uTeinte:JADE_NUAGE_M.uniforms.uTeinte,uFogC:JADE_NUAGE_M.uniforms.uFogC,uSunD:JADE_U.uSunDir,uSunC:JADE_U.uSunC},
  vertexShader:['attribute float aM,aAO;varying vec3 vO,vNo,vN;varying float vM,vAO,vD;',
    'void main(){mat4 mw=modelMatrix*instanceMatrix;vec4 wp=mw*vec4(position,1.);vO=position;vNo=normal;vN=normalize(mat3(mw)*normal);vM=aM;vAO=aAO;',
    '  vD=length(wp.xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
  fragmentShader:['uniform vec3 uTeinte,uFogC,uSunD,uSunC;varying vec3 vO,vNo,vN;varying float vM,vAO,vD;',
    'void main(){vec3 N=normalize(vN);float dif=max((dot(N,uSunD)+.35)/1.35,0.);',
    '  vec3 c=mix(vec3(.62,.68,.78),vec3(1.,.98,.94)*uTeinte,dif)*mix(.72,1.,vAO);',                    // (v17) féerique : le ventre lilas, le dessus crème doré                   // la lumière dessus, l ombre jade-lavande dessous, l ombre des coins
    '  vec3 q=floor(vO-vNo*.5+.001);c*=.95+.09*fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);', // chaque cube sa nuance
    '  if(vM>1.5)c*=.80;c*=mix(vec3(1.),uSunC*.6+.4,.25);',                               // la spirale creusée ; le soleil de la map
    '  c+=vec3(.06,.01,.05)*(1.-dif)*(1.-dif);',                                                       // une pointe de rose dans l ombre
    '  c=mix(c,uFogC,smoothstep(1500.,7500.,vD)*.55);',
    '  gl_FragColor=vec4(c,.88*smoothstep(80.,320.,vD)*(1.-smoothstep(7800.,9400.,vD)));}'].join('\n')});m.dispose=function(){};return m;})();
/* ---- CHAQUE IMAGE : les lumières du niveau dans la matière (une Lambert les lirait d'elle-même), l'horloge, la brume ---- */
function jadeTick(dt){
  {const on=!!JADE.root&&LVL.cur&&LVL.cur.id==='jade'&&!JADE_SOBRE;if(JADE_ESPRITS.visible!==on)JADE_ESPRITS.visible=on;if(on){const u=JADE_ESPRITS.material.uniforms;u.uCam.value.copy(camera.position);u.uPx.value=renderer.getPixelRatio();u.uK.value=Math.min(1,u.uK.value+dt*.5);}}
  if(!JADE.root)return;
  if(JADE.photo&&paused&&acesPass){acesPass.uniforms.uSpeed.value=0;loop._sfx=0;}
  if(BALADE&&running&&!gameOver){
    {const m9=Math.min(ENGINE_TIERS.length-1,BALADE_MOTEUR);if(engTier!==m9){engTier=m9;coinsGot=ENGINE_TIERS[m9].coins;}} // le moteur de la balade, posé tel quel (sans la scène du palier)
    if(!nitroOn)nitroR=Math.min(nitroCap(),nitroR+.30*dt);} // sans pièces ni fruits, la nitro se recharge seule // (dev) dbgJadeVue : une image NETTE (le flou de vitesse figé par la pause)
  JADE_U.uTime.value+=dt;if(!paused)skyU.uEauT.value+=dt;
  finTravail(paused?12:4);
  try{jadeEauTick(dt);}catch(e){window.__jadeErr=e;}
  if(!paused){try{jadeChuteTick(dt);}catch(e){window.__jadeErr=e;}}
  if(!JADE.t0&&started)JADE.t0=performance.now();
  if(JADE.monu)for(const o of JADE.monu)if(o.loIt){jadeMonuLoinPas(o);break;} // (2026-10-14, passe perf mobile) une tranche du monument de loin par image (voir jadeMonuLoinPas)
  if(JADE.monu){const ff=(scene.fog&&scene.fog.far)||2600;for(const o of JADE.monu){const d9=camera.position.distanceTo(o.c)-o.r,v=d9<ff+80;if(o.g.visible!==v)o.g.visible=v; // (v17) au-delà de la brume : pas dessinés…
    let dv9=d9;if(o.dP){const P9=o.dP,cp=camera.position,u9=(cp.x-P9.c.x)*P9.t.x+(cp.z-P9.c.z)*P9.t.z;dv9=Math.max(d9,u9<0?-u9-P9.D/2:(u9-P9.D/2>30?1e9:0));} /* (2026-10-14, passe perf mobile) la Porte allégée : la distance à sa façade, et rien derrière soi (voir jadePorteVerre) */
    const lo=dv9>(JADE_LOD.mv||450);if(o.L&&lo!==o.loin){o.loin=lo;o.L[1].visible=o.L[2].visible=!lo;o.L[0].material=lo?JADE_M.vrOM:JADE_M.vrM;o.L[0].renderOrder=lo?0:3;if(o.lo){o.lo.visible=lo;o.L[0].visible=!lo;}/* (2026-10-14, passe perf mobile) de loin, le maillage allégé à la place du plein (jadeMonuLoin) */}}} // …et à plus de 450 m, une seule passe opaque (le verre en trois passes, de près)
  for(let i9J=0;i9J<2;i9J++){const M9=i9J?JADE.pont:JADE.porte;/* (2026-10-14, passe perf mobile) même ordre (porte, pont), sans tableau neuf par image */if(!M9||!M9.mF)continue;const d=camera.position.distanceTo(M9.c),n=d<(M9===JADE.porte?780:650)+(M9.pres?40:0); // (v8) de près, les cubes fins
    if(n!==M9.pres){M9.pres=n;for(const m of M9.mF)m.visible=n;for(const m of M9.mL)m.visible=!n;}}
  JADE_U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);
  {const rc=JADE_RAYON_M.uniforms.uCol.value,v9=JADE_U.uSunC.value,m9=Math.max(v9.r,v9.g,v9.b,1e-3),k9=Math.min(1,.5+.5*m9)/m9;rc.setRGB(v9.r*k9,v9.g*k9,v9.b*k9);} /* (2026-10-21, embellie) les rais prennent la couleur du soleil du moment (doré au soir, bleu pâle la nuit) — trois flottants, rien d'alloué */
  JADE_U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);JADE_U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  JADE_U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);JADE_U.uFillD.value.copy(fill.position).normalize().negate();
  JADE_U.uMist.value.fromArray(BIO.cur.jdB||[.86,.87,.82]);
  {const b=JADE_U.uMist.value,fc=scene.fog&&scene.fog.color;if(fc)b.lerp(fc,.25);}
  {const h=BIO.cur.jdH||[.9,.9,.85],z=BIO.cur.jdZ||[.48,.66,.8];JADE_VIT_U.uCielH.value.setRGB(h[0],h[1],h[2]);JADE_VIT_U.uCielZ.value.setRGB(z[0],z[1],z[2]);} // (v10) le ciel qui se reflète dans la peau de verre
  {const u=JADE_NUAGE_M.uniforms,h=BIO.cur.jdH||[.9,.9,.85],sc=BIO.cur.jdS||[1,.95,.85],fc=scene.fog&&scene.fog.color; // les volutes suivent le ciel du niveau
   u.uTeinte.value.setRGB(.42+.58*(h[0]*.45+sc[0]*.55),.42+.58*(h[1]*.45+sc[1]*.55),.42+.58*(h[2]*.45+sc[2]*.55)); /* (v17) plus blanc : le ciel rose-or teintait les nuages en saumon */if(fc)u.uFogC.value.copy(fc).lerp(JADE_C9.setRGB(h[0],h[1],h[2]),.4);}
}
/* LES GRUES (2026-10-09) — l'oiseau des rouleaux peints : des vols de grues du Japon (blanches, rémiges noires, calotte rouge, pattes
   tendues derrière) qui traversent la vallée en V, battent lentement puis planent. Lambert à couleurs par sommet sur des facettes (géométrie
   sans index : normales plates), trois maillages par oiseau, au plus deux vols à la fois. Hors des PICS DE JADE : rien. */
const GRUE={L:[],t:9,M:null,gC:null,gA:null};
function grueGeos(){if(GRUE.gC)return;
  const K=jadeKit(),bl=[.94,.94,.92],no=[.08,.08,.09],ro=[.85,.12,.10],be=[.62,.58,.42],pa=[.20,.20,.22];
  K.tube([0,0,-.55],[0,.02,.42],.16,.13,6,bl);K.tube([0,.01,-.56],[0,.03,-.98],.15,.02,6,no);   // le corps, la queue noire (les tertiaires) qui s'effile
  K.tube([0,.04,.40],[0,.13,.85],.07,.045,5,no);K.tube([0,.13,.85],[0,.15,1.05],.045,.05,5,no); // le cou noir
  K.tube([0,.15,1.05],[0,.16,1.17],.06,.05,5,bl);K.tube([0,.205,1.08],[0,.205,1.15],.03,.025,4,ro); // la tête, la calotte rouge
  K.tube([0,.15,1.17],[0,.13,1.42],.025,.006,4,be);                                            // le bec
  for(const sd of [-1,1])K.tube([sd*.05,-.08,-.35],[sd*.04,-.12,-1.15],.018,.012,4,pa);         // les pattes tendues
  const toC=g=>{g.setAttribute('color',g.getAttribute('aCol'));g.deleteAttribute('aCol');g.computeVertexNormals();return g;};
  GRUE.gC=toC(K.geo());
  const A=jadeKit(); // UNE AILE (le côté +x) : bras blanc, main aux rémiges noires — deux pans, une articulation
  A.tri([0,0,.18],[.75,.02,.12],[.75,.0,-.30],bl);A.tri([0,0,.18],[.75,0,-.30],[0,0,-.28],bl);
  A.tri([.75,.02,.12],[1.45,.03,-.08],[1.38,0,-.46],no);A.tri([.75,.02,.12],[1.38,0,-.46],[.75,0,-.30],no);
  A.tri([0,0,-.28],[.75,0,-.30],[.55,0,-.42],no);
  GRUE.gA=toC(A.geo());
  GRUE.M=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});}
function grueVol(){grueGeos();
  const fw=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);fw.y=0;if(fw.lengthSq()<1e-4)fw.set(0,0,1);fw.normalize();
  const rt=new THREE.Vector3(fw.z,0,-fw.x),sg=Math.random()<.5?-1:1;
  const base=carGroup.position.clone().addScaledVector(fw,260+Math.random()*260).addScaledVector(rt,sg*(260+Math.random()*120));base.y+=10+Math.random()*70;
  const dir=rt.clone().multiplyScalar(-sg).addScaledVector(fw,(Math.random()-.3)*.6).normalize(),n=5+((Math.random()*5)|0),sp=15+Math.random()*5,S=5.5+Math.random()*1.5;
  const side=new THREE.Vector3(dir.z,0,-dir.x);
  for(let k=0;k<n;k++){const g=new THREE.Group(),rang=Math.ceil(k/2),cote=k%2?1:-1;
    const c=new THREE.Mesh(GRUE.gC,GRUE.M),wl=new THREE.Mesh(GRUE.gA,GRUE.M),wr=new THREE.Mesh(GRUE.gA,GRUE.M);
    wr.position.set(.12,.05,.2);wl.position.set(-.12,.05,.2);wl.scale.x=-1;g.add(c,wl,wr);g.scale.setScalar(S);
    g.position.copy(base).addScaledVector(dir,-rang*S*2.6).addScaledVector(side,cote*rang*S*2.2);g.position.y+=rang*S*.25;
    g.lookAt(g.position.clone().add(dir));scene.add(g);
    GRUE.L.push({g:g,wl:wl,wr:wr,v:dir.clone().multiplyScalar(sp),ph:k*.35+Math.random()*.3,life:42});}
}
function grueTick(dt){
  const ici=!!JADE.root&&LVL.cur&&LVL.cur.id==='jade'&&mode!=='boom'&&!JADE_SOBRE;
  GRUE.t-=dt;if(ici&&GRUE.t<=0&&GRUE.L.length<20){grueVol();GRUE.t=16+Math.random()*16;}
  const t=JADE_U.uTime.value;
  for(let i=GRUE.L.length-1;i>=0;i--){const b=GRUE.L[i];b.life-=dt;if(!ici)b.life=0;
    b.g.position.addScaledVector(b.v,dt);b.g.position.y+=Math.sin(t*.6+b.ph)*.6*dt;
    const pl=Math.max(0,Math.sin(t*.35+b.ph*.5)),a=(.15+.55*(1-pl))*Math.sin(t*5.2+b.ph*2.4)+.08*pl; // battements lents… puis le vol plané
    b.wr.rotation.z=a;b.wl.rotation.z=-a;
    if(b.life<=0){scene.remove(b.g);GRUE.L.splice(i,1);}}
}
/* ---- EN VOL : les CUBES sont durs — la montagne et le rocher (la grille de leur gabarit, au quart de tour près), la muraille, l'arche.
   La caisse compte pour cinq points (son centre et ±1,4 m de chaque côté). ---- */
const JH=[[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]];
function jadePilierDans(q,x,y,z){const T9=JADE.geos.p[q[5]],a=-q[6]*Math.PI/2,c=Math.round(Math.cos(a)),s=Math.round(Math.sin(a)),lx=(x-q[0])/VX,lz=(z-q[1])/VX;
  return voxAt(T9.G,Math.floor(lx*c+lz*s+T9.M),Math.floor((y-q[3])/VX),Math.floor(-lx*s+lz*c+T9.M))>0;}
const V9J=new THREE.Vector3();
function jadeHeurt(p){
  const C=JADE.col;if(!C||!JADE.root)return false;
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1];
    const a=C.g.get(Math.floor(x/C.CG)+','+Math.floor(z/C.CG));
    if(a)for(let j=0;j<a.length;j++){if(C.mort&&C.mort.has(a[j]))continue;const q=C.P[a[j]];if(p.y<q[3]-1||p.y>q[4]+1)continue;const dx=x-q[0],dz=z-q[1];if(dx*dx+dz*dz>(q[2]+1)*(q[2]+1))continue;
      if(jadePilierDans(q,x,p.y,z))return true;}
    /* (2026-10-21, Léo : « on traverse les montagnes qui tombent ») les montagnes en chute gardent leur hitbox : le point est ramené dans leur repère d'origine */
    for(const c of JCH.L){if(!c.t0||c.fin||!c.inv)continue;const q=c.q;V9J.set(x,p.y,z).applyMatrix4(c.inv);
      if(V9J.y<q[3]-1||V9J.y>q[4]+1)continue;const dx=V9J.x-q[0],dz=V9J.z-q[1];if(dx*dx+dz*dz>(q[2]+1)*(q[2]+1))continue;
      if(jadePilierDans(q,V9J.x,V9J.y,V9J.z))return true;}
    V9J.set(x,p.y,z);
    if(JADE.porte&&jadeDansGrille(JADE.porte,V9J))return true;
    if(JADE.pont&&jadeDansGrille(JADE.pont,V9J))return true;}
  return false;
}
/* (2026-10-14, passe mobile) LE SOLEIL DE JADE NE COMPILE PLUS EN PLEINE COURSE. MESURÉ (dbgProgsListe, course au pilote) : un programme
   naissait vers 8 s (les GRUES, fabriquées à leur premier vol) et TROIS d'un coup vers 3 km (les matières du MONUMENT, cachées jusqu'à ce qu'on
   l'approche — `chauffeRendu` laisse caché ce qui n'a jamais été compilé). Sur iPhone, chacun fige l'image ~0,1-0,3 s. Au départ du niveau
   (avec la chauffe de la piste, 120 ms après newTrack) : tout le sous-arbre de la map, caché compris, plus une grue, compilé et dessiné une
   fois hors écran — sous l'éclairage de la course, donc les mêmes programmes. */
function jadeChauffeNiveau(){ if(!JADE.root||!JADE.root.parent)return;
  try{for(const o of JADE.monu||[])jadeMonuLoin(o);}catch(e){console.warn('monument de loin',e);} // (2026-10-14, passe perf mobile) le monument allégé de loin, paliers 0-1 (une fois par carte)
  let g=null;const eau=[],vu=[];
  try{grueGeos();g=new THREE.Group();g.add(new THREE.Mesh(GRUE.gC,GRUE.M));
    const m0=JADE.monu&&JADE.monu.find(function(o){return o.L&&o.L[0];}); // les monuments changent de matière à 450 m (vrOM au loin → vrM de près) : la matière de PRÈS aussi
    if(m0)g.add(new THREE.Mesh(m0.L[0].geometry,m0.L[0].material===JADE_M.vrM?JADE_M.vrOM:JADE_M.vrM));
    scene.add(g);
    // LA MER : ses effets naissent au PREMIER PLONGEON (couronne, rides, gouttes, bulles, brume, sillon, peau) — mesuré : deux programmes
    // compilés pile au moment de l'éclaboussure. Fabriqués ici (comme jadeChauffe, qui n'était appelée nulle part) et compilés avec le reste.
    try{eau.push(jadePeau(),sillonMesh(),jadeBullesIm(),eauPIm(),eauBIm());eauRide(0,-1e5,0,0);eauCouronne(0,-1e5,0,{r0:1,r1:2,h:1,fl:0,d:1,fx:0,fz:0});
      for(const r9 of EAUR.L)eau.push(r9.m);for(const r9 of COUR.L)eau.push(r9.m);}catch(e){}
    const haut=function(o){while(o&&o.parent&&o.parent!==scene)o=o.parent;return o&&o.parent===scene?o:null;},Q=[JADE.root,g];
    for(const o of eau){if(!o)continue;vu.push([o,o.visible]);o.visible=true;const h=haut(o);if(h&&Q.indexOf(h)<0)Q.push(h);}
    chauffeRendu(Q);}
  catch(e){console.warn('jadeChauffeNiveau',e);}
  finally{if(g)scene.remove(g);for(const v of vu)v[0].visible=v[1];
    try{for(const r9 of EAUR.L){r9.t=9;r9.m.visible=false;}for(const r9 of COUR.L){r9.t=9;r9.m.visible=false;}}catch(e){}} }
/* (2026-10-14, passe perf mobile) LES PROGRAMMES DU SOLEIL DE JADE COMPILÉS AU MENU, SANS BÂTIR LA CARTE. MESURÉ (iPhone 7 émulé, ×4) : au
   portail ville → jade, 17 programmes naissaient d'un coup (163 → 180 liens, une image de ~580 ms ; 6,1 s vue au REJOUER tiré sur le jade) —
   jadeChauffeNiveau ne compile la carte qu'une fois BÂTIE, donc sous le voile du portail. Ici : les MÊMES instances de matière (jadeMats,
   JADE_*_M, la mer, la grue) posées sur de petits maillages du MÊME GENRE (instancié ou seul : USE_INSTANCING change le programme), compilées
   sous les lumières de la scène par chauffeRendu (comme cryptoChauffe) : au portail la clé est la même, le programme est déjà là. Quatre étapes
   de chauffeDivers (~4 programmes chacune). Les objets de la mer sont ceux que jadeChauffeNiveau fabrique (dans la scène, cachés : l'état
   d'après une course au jade). La Lambert de l'écume des effondrements (JCH.splash, instanciée sans teinte) : une jumelle gardée (jamais
   libérée : libérer une matière peut détruire son programme). `dbgJadeProgs()` (banc) : attendus, compilés, manquants. */
const JADE_CHP={fait:0,lam:null,m:new THREE.Matrix4(),v:new THREE.Vector3()};
function jadeChauffeLots(){const M9=jadeMats();return [
  [['vr','I',M9.vr],['vrX','I',M9.vrX],['vrP','I',M9.vrP],['vrO','I',M9.vrO]],                  // les familles des montagnes (verre en trois passes ; opaque au loin) et les cubes fins
  [['arb','I',M9.arb],['vrM','M',M9.vrM],['vrXM','M',M9.vrXM],['vrPM','M',M9.vrPM]],              // la forêt peinte ; la Porte du ciel et les monuments de près
  [['vrOM','M',M9.vrOM],['chute','M',JADE_CHUTE_M],['rayon','M',JADE_RAYON_M],['brume','I',JADE_BRUME_M]], // le monument de loin, les cascades, les rayons, la brume
  [['mer','E',null]]];}                                                                           // la mer (peau, sillon, bulles, écume, brume d'eau, rides, couronnes), la grue, l'écume des chutes
function jadeChauffeProgs(k){const lots=jadeChauffeLots();if(k>=lots.length)return;
  const L9=[],tmp=[],vu=[];let box=null;
  try{box=new THREE.BoxGeometry(1,1,1);
    if(lots[k][0][1]==='E'){
      try{grueGeos();tmp.push(new THREE.Mesh(GRUE.gC,GRUE.M));}catch(e){}
      try{if(!JADE_CHP.lam)JADE_CHP.lam=new THREE.MeshLambertMaterial({color:0xf4f8fa,emissive:0x2a3238});const im=new THREE.InstancedMesh(box,JADE_CHP.lam,1);im.setMatrixAt(0,JADE_CHP.m.identity());tmp.push(im);}catch(e){}
      try{const eau=[jadePeau(),sillonMesh(),jadeBullesIm(),eauPIm(),eauBIm()];eauRide(0,-1e5,0,0);eauCouronne(0,-1e5,0,{r0:1,r1:2,h:1,fl:0,d:1,fx:0,fz:0});
        for(const r9 of EAUR.L)eau.push(r9.m);for(const r9 of COUR.L)eau.push(r9.m);
        for(const o of eau){if(!o||o.parent!==scene||L9.indexOf(o)>=0)continue;vu.push([o,o.visible]);o.visible=true;L9.push(o);}}catch(e){}}
    else for(const q of lots[k]){if(!q[2])continue;let o;
      if(q[1]==='I'){o=new THREE.InstancedMesh(box,q[2],1);o.setMatrixAt(0,JADE_CHP.m.identity());}else o=new THREE.Mesh(box,q[2]);tmp.push(o);}
    camera.getWorldDirection(JADE_CHP.v);
    for(const o of tmp){o.frustumCulled=false;o.position.copy(camera.position).addScaledVector(JADE_CHP.v,30);scene.add(o);L9.push(o);}
    if(L9.length)chauffeRendu(L9);}
  catch(e){console.warn('jadeChauffeProgs',e);}
  finally{for(const o of tmp){scene.remove(o);if(o.isInstancedMesh&&o.dispose)o.dispose();}if(box)box.dispose();for(const v of vu)v[0].visible=v[1];
    if(lots[k][0][1]==='E')try{for(const r9 of EAUR.L){r9.t=9;r9.m.visible=false;}for(const r9 of COUR.L){r9.t=9;r9.m.visible=false;}}catch(e){}
    JADE_CHP.fait=Math.max(JADE_CHP.fait,k+1);} }
window.dbgJadeProgs=function(){ // (banc) les programmes du jade attendus et déjà compilés — au portail ville → jade, `liens` ne doit pas bouger
  const L=[],nb=function(m){const p=m&&renderer.properties.get(m);return p&&p.programs?(p.programs.size!==undefined?p.programs.size:1):0;};
  try{for(const lot of jadeChauffeLots())for(const q of lot)if(q[1]!=='E')L.push({nom:q[0],genre:q[1]==='I'?'instancie':'seul',programmes:nb(q[2])});
    for(const q of [['peau',JSOUS.peau],['sillon',SILL.mesh],['bulles',JEAU.im],['ecume',EAUP.im],['brumeEau',EAUB.im],['ride',EAUR.L[0]&&EAUR.L[0].m],['couronne',COUR.L[0]&&COUR.L[0].m],['grue',GRUE.M&&{material:GRUE.M}],['ecumeChute',JADE_CHP.lam&&{material:JADE_CHP.lam}]])
      L.push({nom:q[0],genre:'mer/grue',programmes:nb(q[1]&&q[1].material)});}catch(e){L.push({nom:'erreur',programmes:0,e:String(e)});}
  return {liens:renderer.info.programs?renderer.info.programs.length:-1,etapes:JADE_CHP.fait+'/4',attendus:L.length,manquants:L.filter(function(o){return !o.programmes;}).map(function(o){return o.nom;}),liste:L};};
window.dbgFin=function(v,nu){ // (banc) v : les cubes minuscules on/off ; nu : les nuages en volutes on/off
  if(v!==undefined&&v!==null){FIN.on=!!v&&!TEL_NATIF;if(!FIN.on){FIN.dans.clear();for(const FF of FIN.fam)if(FF)FF.im.visible=FF.im2.visible=FF.im3.visible=false;}JADE.sig=0;}
  if(nu!==undefined&&JADE.root)for(const o of JADE.root.children)if(o.material===JADE_NUAGE_M)o.visible=!!nu;
  return {on:FIN.on,dans:FIN.dans.size,D:FIN.D};};
window.dbgJadePoste=function(k,on){if(!JADE.root)return 'pas de map';on=!!on;
  if(k==='bandes'){const o={};for(const F of JADE.fam){const kk=F.b0+'-'+F.b1+(F.im2?'v':'');o[kk]=(o[kk]||0)+F.im.count*F.tri*(F.im2?3:1);}for(const FF of FIN.fam)if(FF)o.fins=(o.fins||0)+FF.im.count*FF.tri*3;for(const kk in o)o[kk]=Math.round(o[kk]/1000)+'k';return o;}
  if(k==='ramasse'){const o={pieces:0,fruits:{},pouvoirs:0};for(const p of pickups){if(p.pow)o.pouvoirs++;else if(p.nitro){const n9=(FRUIT_DEFS[p.fruit]||{}).n||'?';o.fruits[n9]=(o.fruits[n9]||0)+1;}else o.pieces++;}o.pads=PADS.length;o.flaques=OILS.length;o.coinIM=coinIM.count;o.fruitsS=pickups.filter(function(p){return p.nitro&&p.face===1;}).map(function(p){return [Math.round(p.s),+p.lat.toFixed(1),(FRUIT_DEFS[p.fruit]||{}).n];});o.coinVis=coinIM.visible;o.s=Math.round(s);o.prochaines=pickups.filter(function(p){return p.s>s;}).slice(0,4).map(function(p){const m=p.mesh;return {s:Math.round(p.s),lat:+p.lat.toFixed(1),vis:m&&m.visible,par:!!(m&&m.parent),y:m?Math.round(m.position.y):null,sc:m?+m.scale.x.toFixed(2):null};});const P9=new THREE.Vector3();frameAt(s,F);o.routeY=Math.round(F.p.y);return o;}
  if(k==='bitume'){scene.traverse(function(o){if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.bitume)o.visible=on;});return 'bitume '+on;}
  if(k==='lod'){JADE_LOD.r0=+arguments[1];JADE.sig=0;return JADE_LOD.r0;}
  if(k==='gros'){const o=[],seuil=+arguments[1]||20000;scene.traverse(function(x){if(!(x.isMesh||x.isPoints||x.isLine)||!x.geometry)return; // (banc, 2026-10-22) les plus gros objets VISIBLES de la scène : triangles, nom, genre, matière, parent
    let v=true,p=x;while(p){if(!p.visible){v=false;break;}p=p.parent;}if(!v)return;const g=x.geometry,n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3*(x.isInstancedMesh?x.count:1);if(n<seuil)return;
    o.push([Math.round(n/1000)+'k',x.name||'',x.type+(x.isInstancedMesh?'[I'+x.count+']':''),x.material&&(x.material.type+(x.material.name?':'+x.material.name:'')),x.parent===scene?'scène':x.parent===JADE.root?'jade':(x.parent&&x.parent.name)||'sous',x.frustumCulled?'cull':'-',x.castShadow?'ombre':'',(function(){const ch=[];let q=x.parent;while(q&&q!==scene){ch.push((q.name||q.type)+(q.children?'('+q.children.length+')':''));q=q.parent;}return ch.join('<');})(),Object.keys(x.userData||{}).join(','),x.geometry.attributes?Object.keys(x.geometry.attributes).join(','):'',x.geometry.boundingSphere?Math.round(x.geometry.boundingSphere.radius):'',[x.position.x,x.position.y,x.position.z].map(Math.round).join(','),x.renderOrder]);});
    o.sort(function(a,b){return parseFloat(b[0])-parseFloat(a[0]);});return o.slice(0,40);}
  if(k==='temps'){const n=+arguments[1]||20,gl=renderer.getContext(),px=new Uint8Array(4); // (banc, 2026-10-22) ms d'une image de la scène (sans post), la puce attendue par une lecture d'un pixel : à faire sur une image figée, un poste éteint puis rallumé
    renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return +((performance.now()-t0)/n).toFixed(2);}
  if(k==='monu'){const t9=function(m){return m&&m.geometry?Math.round((m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3/1000)+'k'+(m.visible?'+':'-'):'∅';},d9=function(o){return o?Math.round(camera.position.distanceTo(o.c)):null;}; // (banc, 2026-10-22) la Porte et le Pont : leurs maillages, leur taille, lequel est dessiné
    return {monu:(JADE.monu||[]).map(function(o){return {d:Math.round(camera.position.distanceTo(o.c)),g:o.g.visible,loin:!!o.loin,L:o.L&&o.L.map(t9),lo:o.lo?t9(o.lo):null,r:Math.round(o.r||0)};}),
      porte:JADE.porte&&{d:d9(JADE.porte),pres:!!JADE.porte.pres,mL:(JADE.porte.mL||[]).map(t9),mF:(JADE.porte.mF||[]).map(t9)},pont:JADE.pont&&{d:d9(JADE.pont),pres:!!JADE.pont.pres,mL:(JADE.pont.mL||[]).map(t9),mF:(JADE.pont.mF||[]).map(t9)}};}
  if(k==='liste'){const o=[];JADE.root.traverse(function(x){if(!x.visible||!x.isMesh||x.isInstancedMesh)return;const g=x.geometry;const n=(g.index?g.index.count:g.attributes.position.count)/3;if(n>5000)o.push([x.name||(x.material&&x.material.type),Math.round(n/1000)+'k',x.frustumCulled,x.parent===JADE.root?'root':'sous',JADE.porte&&JADE.porte.mF&&JADE.porte.mF.indexOf(x)>=0?'porteF':JADE.porte&&JADE.porte.mL&&JADE.porte.mL.indexOf(x)>=0?'porteL':JADE.pont&&JADE.pont.mF&&JADE.pont.mF.indexOf(x)>=0?'pontF':JADE.pont&&JADE.pont.mL&&JADE.pont.mL.indexOf(x)>=0?'pontL':'']);});return o;}
  if(k==='scene'){const o={};scene.traverse(function(x){if(!x.visible||!(x.isMesh||x.isPoints||x.isLine))return;const g=x.geometry;if(!g)return;const n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3*(x.isInstancedMesh?x.count:1);const kk=(x.material&&x.material.type)+(x.isInstancedMesh?'I':'')+(x.parent===JADE.root?'J':'');o[kk]=(o[kk]||0)+n;});for(const kk in o)o[kk]=Math.round(o[kk]/1000)+'k';return o;}
  if(k==='cout'){const r=renderer.info;r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true;return [r.render.calls,r.render.triangles];}
  if(k==='coutOmbre'){const r=renderer.info,au=renderer.shadowMap.autoUpdate;r.autoReset=false;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;r.reset();renderer.render(scene,camera);const sans=[r.render.calls,r.render.triangles];renderer.shadowMap.needsUpdate=true;r.reset();renderer.render(scene,camera);const avec=[r.render.calls,r.render.triangles];renderer.shadowMap.autoUpdate=au;r.autoReset=true;const L={};scene.traverse(function(o){if(!o.visible||!o.castShadow||!(o.isMesh))return;const g=o.geometry;const n=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);const kk=(o.name||o.material&&o.material.type||'?')+(o.isInstancedMesh?'I':'')+(o.parent===JADE.root?'J':'');L[kk]=(L[kk]||0)+Math.round(n);});return {passeOmbre:[avec[0]-sans[0],avec[1]-sans[1]],ecran:sans,lanceurs:L};} // (2026-10-14, banc) ce que coûte la passe d'ombre, et qui y jette son ombre // (banc) éteindre un poste pour mesurer ce qu'il coûte
  if(k==='mer'){if(!on){if(JADE.merSv===undefined)JADE.merSv=skyU.uJMerY.value;skyU.uJMerY.value=-1e7;}else if(JADE.merSv!==undefined){skyU.uJMerY.value=JADE.merSv;JADE.merSv=undefined;}}
  else if(k==='ciel'){skyDome.visible=on;}
  else if(k==='verre'){for(const F of JADE.fam){F.coupeV=!on;if(F.im2){F.im2.visible=on&&F.im.count>0;F.im3.visible=on&&F.im.count>0;}}}
  else if(k==='piliers'){for(const F of JADE.fam){F.coupe=!on;F.im.visible=on&&F.im.count>0;if(F.im2){F.im2.visible=on&&F.im.count>0&&!F.coupeV;F.im3.visible=on&&F.im.count>0&&!F.coupeV;}}}
  else if(k==='fins')dbgFin(on);
  else if(k==='nuages'){JADE_NUVOX_M.visible=on;JADE.root.children.forEach(function(o){if(o.material===JADE_NUAGE_M)o.visible=on;});}
  else if(k==='brume'){if(JADE.brume)JADE.brume.visible=on;}
  else if(k==='rayons'||k==='chutes'){const M=k==='rayons'?JADE_RAYON_M:JADE_CHUTE_M;JADE.root.children.forEach(function(o){if(o.material===M)o.visible=on;});}
  else if(k==='esprits'){JADE_ESPRITS.material.visible=on;}
  else if(k==='monuments'){for(const o of JADE.monu||[])o.g.visible=on;} // (banc) la Porte et le Pont (jadeTick les remet à chaque image : éteindre et mesurer dans le même appel)
  else if(k==='coton'){if(typeof COTON!=='undefined'&&COTON.root)COTON.root.visible=on;} // (banc) le coton des nuages
  else if(k==='singes'){JSG.node.visible=on&&!!JSG.cur;} // (banc) la rencontre de singe en cours
  return k+' '+on;};
window.dbgTemps=function(n){const gl=renderer.getContext(),px=new Uint8Array(4);n=n||20; // (banc, 2026-10-22) ms d'une image de la scène (sans post), la puce attendue par une lecture d'un pixel : à faire sur une image figée (n'importe quelle map)
  renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return +((performance.now()-t0)/n).toFixed(2);};
window.dbgAppels=function(n){ // (2026-10-14, banc) QUI fait les appels de dessin d'une image : chaque appel compté par objet (nom, matière, parent) — n = combien en rendre
  const o=renderer.renderBufferDirect,C={};let tot=0,tri=0;
  renderer.renderBufferDirect=function(cam,sc,geo,mat,obj,grp){tot++;const g=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0);const t=g/3*(obj.isInstancedMesh?obj.count:1);tri+=t;
    let p=obj.parent,ch=obj.name||'';for(let k=0;k<3&&p&&!ch;k++){ch=p.name||'';p=p.parent;}
    if(!ch&&typeof JADE!=='undefined'&&JADE.fam){for(const F of JADE.fam){if(F.im===obj||F.im2===obj||F.im3===obj){ch='jade '+F.b0+'-'+F.b1+(F.im2===obj?' absorption':F.im3===obj?' profondeur':'');break;}}if(!ch&&typeof NUVOX!=='undefined'&&NUVOX.ims&&NUVOX.ims.indexOf(obj)>=0)ch='nuages-cubes';if(!ch&&typeof FIN!=='undefined'&&FIN.fam&&FIN.fam.some(function(F){return F&&F.im===obj;}))ch='cubes-fins';}
    if(obj.isInstancedMesh&&obj.count===0)ch+=' VIDE';
    if(window.__appelsDetail&&obj.parent===scene)ch+=' {'+(geo.type||'')+' ro'+obj.renderOrder+(mat.transparent?' T':'')+(mat.blending===THREE.AdditiveBlending?' add':'')+' '+Object.keys(obj.userData||{}).join(',')+' '+(mat.color?mat.color.getHexString():'')+'}';
    const kk=(mat.type||'?')+(mat.name?':'+mat.name:'')+(obj.isInstancedMesh?'[I]':'')+(ch?' <'+ch+'>':'')+(obj.parent===scene?' (scène)':'');const e=C[kk]||(C[kk]={n:0,tri:0});e.n++;e.tri+=t;
    return o.apply(this,arguments);};
  try{renderer.render(scene,camera);}finally{renderer.renderBufferDirect=o;}
  const L=Object.keys(C).map(function(k){return [C[k].n,Math.round(C[k].tri/1000)+'k',k];}).sort(function(a,b){return b[0]-a[0];});
  return {appels:tot,triangles:Math.round(tri/1000)+'k',liste:L.slice(0,n||40)};};
window.dbgJadeRegle=function(){if(!JADE.root)return null;const ds=L/(NP-1),st=Math.max(1,Math.round(5/ds)),V9=new THREE.Vector3();let n=0,t=0;const ex=[]; /* (2026-10-20, banc) LA RÈGLE D'OR : aucun pilier ni rocher sur la route — la caisse tous les 5 m, à 3 places de la largeur, à 0,5 et 3 m */
  for(let i=0;i<NP;i+=st)for(const f of [-.9,0,.9])for(const h of [.5,3]){V9.copy(pts[i]).addScaledVector(B[i],f*ROAD_HALF).addScaledVector(Nn[i],h);t++;if(jadeHeurt(V9)){n++;if(ex.length<6)ex.push([Math.round(i*ds),f,h]);}}
  return {essais:t,heurts:n,ex:ex};};
window.dbgJade=function(){let tri=0;for(const F of JADE.fam)tri+=F.im.count*F.tri;
  let triF=0;for(const FF of FIN.fam)if(FF)triF+=FF.im.count*FF.tri;
  return Object.assign({},JADE.n,{deco:JADE.deco||null,mods:JADE.mk||null,fins:FIN.dans.size,triFins:Math.round(triF),finPrets:JADE.geos?JADE.geos.p.filter(function(T9){return T9.fin;}).length+'/'+JADE.geos.p.length:0,finMs:JADE.geos&&JADE.geos.p.map(function(T9){return T9.finMs||0;}),triFinGab:JADE.geos&&JADE.geos.p.map(function(T9){return T9.fin?T9.fin.index.count/3:0;}),triangles:Math.round(tri+triF)+(JADE.porte?JADE.porte.tri:0)+(JADE.pont?JADE.pont.tri:0),porteFin:JADE.porte&&JADE.porte.triF,nuTri:JADE.nuTri,msPorte:JADE.msPorte,tPorte:JADE.tPorte,msPont:JADE.msPont,pontFin:JADE.pont&&JADE.pont.triF,appels:JADE.fam.filter(function(F){return F.im.count>0;}).length,
    tri:{ms:JT.n?+(JT.ms/JT.n).toFixed(3):0,envois:JT.up},garde:{reprises:JADE_GARDE.reprises,msReprise:JADE_GARDE.ms,rangee:!!JADE_GARDE.m},grues:GRUE.L.length,balade:BALADE,niveau:LVL.cur&&LVL.cur.id,err:window.__jadeErr?String(window.__jadeErr):null});};
window.dbgJadeAller=function(k,d){if(typeof k==='number'){if(!started||gameOver)return 'non';if(paused)togglePause();s=Math.max(0,Math.min(L-40,k));lat=0;psi=0;prevTvalid=false;mode='drive';return Math.round(s);} // (v14) un nombre : la caisse à s m
  const P=k==='pont'?JADE.pont:JADE.porte;if(!P||!started||gameOver)return 'non';if(paused)togglePause(); // (dev) la caisse d m avant un monument, sur la route
  s=Math.max(0,P.i/(NP-1)*L-(d||350));lat=0;psi=0;prevTvalid=false;mode='drive';return Math.round(s);};
// `dbgJadeVue(k,d,h)` (dev) : MODE PHOTO — 'route' (derrière la caisse, haut), 'porte', 'pont', 'haut' (vue plongeante), 'loin'
window.dbgJadeVue=function(k,d,h,cap){if(!JADE.root)return 'pas de map';
  if(started&&!gameOver&&!paused)togglePause();JADE.photo=true;
  const C=new THREE.Vector3(),V=new THREE.Vector3();
  if(k&&typeof k==='object'&&k.p){C.fromArray(k.p);V.fromArray(k.c);if(k.fov){camera.fov=k.fov;camera.updateProjectionMatrix();}} /* (2026-10-20, banc) un cadrage donné : {p, c, fov} (les photos du décor au hasard) */
  else if((k==='porte'&&JADE.porte)||(k==='pont'&&JADE.pont)){const P=k==='porte'?JADE.porte:JADE.pont,sP=P.i/(NP-1)*L; // depuis la ROUTE, d m avant le monument
    frameAt(Math.max(0,sP-(d||600)),F);C.copy(F.p).addScaledVector(F.n,h||12);V.copy(P.c);V.y+=k==='porte'?110:90;}
  else if(k==='grue'&&GRUE.L.length){const g=GRUE.L[0].g.position;V.copy(g);C.copy(g).addScaledVector(GRUE.L[0].v.clone().normalize(),-(d||120));C.y+=(h||25);}
  else if(k==='pres'&&JADE.col){frameAt(Math.min(L-10,s),F);const o9=F.p;let bq=null,bd=1e9;for(const q of JADE.col.P){if(q[5]>=JADE_NTPL)continue;const e=Math.hypot(q[0]-o9.x,q[1]-o9.z)-q[2];if(e<bd&&o9.y>q[3]+20&&o9.y<q[4]-10){bd=e;bq=q;}} // (dev) la montagne la plus proche de la route, de près
    if(bq){const a9=(cap||0)+Math.atan2(o9.z-bq[1],o9.x-bq[0]);C.set(bq[0]+Math.cos(a9)*(bq[2]+(d||40)),o9.y+(h||0),bq[1]+Math.sin(a9)*(bq[2]+(d||40)));V.set(bq[0],C.y-(h||0)*.3,bq[1]);}}
  else if(k==='eau'&&JADE.eauPil&&JADE.eauPil.length){const o9=carGroup.position;let be=null,bd=-1;for(const e of JADE.eauPil){const d9=(e.x-o9.x)*(e.x-o9.x)+(e.z-o9.z)*(e.z-o9.z);if(d9<1500*1500&&e.r>bd){bd=e.r;be=e;}}if(!be)be=JADE.eauPil[0]; // (v17, dev) le pied d'une montagne que l'eau frappe
    const a9=(cap||0)+Math.atan2(o9.z-be.z,o9.x-be.x);C.set(be.x+Math.cos(a9)*(be.r+(d||110)),JADE.eauY+(h||22),be.z+Math.sin(a9)*(be.r+(d||110)));V.set(be.x,JADE.eauY+(h||22)*.6,be.z);camera.position.copy(C);JADE.eauT=0;jadeEauTick(0);}
  else if(k==='bord'){frameAt(Math.min(L-10,s+(d||0)),F);C.copy(F.p).addScaledVector(F.b,ROAD_HALF+(cap||6)).addScaledVector(F.n,h||3).addScaledVector(F.t,-6);V.copy(F.p).addScaledVector(F.b,ROAD_HALF-2).addScaledVector(F.t,30);} // (dev) le BORD de la route, de côté
  else if(k==='haut'){C.copy(carGroup.position);C.y+=(h||260);V.copy(carGroup.position).addScaledVector(new THREE.Vector3(Math.sin(cap||0),0,Math.cos(cap||0)),600);}
  else if(k==='loin'){C.copy(carGroup.position);C.y+=(h||30);V.copy(carGroup.position).addScaledVector(new THREE.Vector3(Math.sin(cap||0),0,Math.cos(cap||0)),1000);V.y+=(d||0);}
  else{frameAt(Math.min(L-10,s+(d||0)),F);C.copy(F.p).addScaledVector(F.t,-18).addScaledVector(F.n,(h||8));V.copy(F.p).addScaledVector(F.t,120);}
  camera.position.copy(C);camera.up.set(0,1,0);camera.lookAt(V);camera.updateMatrixWorld();skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);
  if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:C.toArray().map(Math.round)};};
/* ---- LA BALADE (`?map=jade`) : le départ se lance seul (le PLAY de l'accueil, son chemin), le HUD du jeu se tait ---- */
const BALADE_CSS=[
  'html.balade #flowHud,html.balade #auraV2,html.balade #avGain,html.balade #avList,html.balade #triade,html.balade #frenTitre,html.balade #frenTraits,html.balade #frenChrono,',
  'html.balade #airHud,html.balade #airPie,html.balade #pwrChip,html.balade #pwrFx,html.balade #misBan,html.balade #coach,html.balade #campChip,html.balade #popTxt,',
  'html.balade #slam9,html.balade #lvlBan,html.balade #engBig,html.balade #chainHud,html.balade #caseHud,html.balade #msg,html.balade .trick,',
  'html.balade #launchLogo,html.balade #launchGlow,html.balade #verdict,html.balade #carCard,html.balade #survHud,html.balade #lastAlert,html.balade #juiceCv,html.balade .bill,html.balade #money,html.balade #cashHud,html.balade #ajCourse,html.balade #ajVols',
  '{display:none!important}',
  'html.balade.jadeAnn #slam9{display:block!important}'].join(''); // (v14) le DÉPART et l'ARRIVÉE du niveau, seuls à parler
function baladeDepart(){
  if(!BALADE)return;
  try{const st=document.createElement('style');st.id='baladeCss';st.textContent=BALADE_CSS;document.body.appendChild(st);}catch(e){}
  let n9=0;
  const tente=function(){
    try{if(started&&!gameOver){SANDBOX=true;return;}}catch(e){setTimeout(tente,200);return;}
    if(document.getElementById('splash')||!window.__gameReady){setTimeout(tente,200);return;}
    if(n9++>40)return;
    SANDBOX=true;
    /* (2026-10-11, Léo : « enlève les intros, lance juste la voiture dans la map ») plus de menu, de fondu, de garage ni de sortie par la
       porte : la course part TOUT DE SUITE (start), la caméra se pose d'un coup derrière la caisse (un écart de plus de 50 m = un saut,
       pas un travelling depuis la vitrine) */
    try{if(garageOn)closeGarage();start();camera.position.copy(carGroup.position);camera.position.y+=900;loop._camDriveT=0;setTimeout(function(){document.documentElement.classList.add('parti');},120);}catch(e){console.warn('balade',e);}
    setTimeout(tente,600); // (si le départ n'a pas pris : on retente)
  };
  setTimeout(tente,60);
}
addEventListener('load',function(){setTimeout(baladeDepart,0);});
function buildVoxCity(seed,accC){
  for(const F of CITY.fam||[])for(const x of [F.im,F.imL])x.dispose(); // (passe perf) les tampons d'instances de l'ancienne ville (les géométries sont parties avec trackMeshes)
  CITY.root=null;CITY.n={};CITY.col=null;CITY.dz=null;CITY.deco=null;CITY.ens=[];CITY.solY=null;CITY.imC=CITY.imN=null;CITY.fam=null;CITY.lampes=null;cryptoVide(); // (CRYPTOCITY) ce que la ville d'avant avait de crypto part avec elle // (l'ancien cratère s'éteint avec son quartier)
  if(PARK.on)return; // le parc a sa prairie
  if(LVL.cur&&LVL.cur.id!=='ville')return; // NIVEAUX : la ville n'existe qu'au niveau VILLE
  if(!(NP>1))return;
  const VI=!!(LVL.cur&&LVL.cur.vitre);if(VI)VIT.neuf=true;const VS=VI&&VIT_SOL; // VS : (2026-10-18) LA VILLE VITRÉE AU SOL (voir VIT_SOL) // (2026-10-17) LA VILLE VITRÉE : la même ville (mêmes tirages), des tours de verre — voir « LA VILLE VITRÉE »
  const CR=!!(LVL.cur&&LVL.cur.crypto); // (2026-10-13) CRYPTOCITY : la même ville (mêmes tirages), un autre air — voir cryptoPlace / cryptoTour / cryptoBatit
  const t00=performance.now();
  const vr=mulberry32(seed^0x5EED10C1); // flux DÉRIVÉ (voir ⚠ ci-dessus)
  /* (2026-10-20) LES VILLES AU HASARD — LE DÉCOR (voir villeDecoTire) : DZ nul = le décor d'avant, au tirage `vr` près */
  const DZ=villeDecoTire(seed,VI?'vitree':CR?'crypto':'ville');CITY.dz=DZ;CITY.deco=DZ?DZ.li:null;
  const dk=(k,d)=>DZ&&DZ[k]!=null?DZ[k]:d,dsP=L/(NP-1);let nPl=0,nRep=0;
  const place9=(i,sg)=>{const s9=i*dsP;for(const t of DZ.trou)if(Math.abs(s9-t.f*L)<t.l*.5&&(t.c===0||t.c===sg))return true;return false;}; // (DZ) dans une PLACE : les deux premiers rangs s'effacent
  const root=new THREE.Group();scene.add(root);CITY.root=root;trackMeshes.push(root);
  const snap=v=>Math.max(1,Math.round(v/VOX_CITY))*VOX_CITY; // tout atterrit sur la trame, jamais entre deux
  // LA GRILLE DE HACHAGE DE LA PISTE : un point tous les ~12 m, rangé par cases de 120 m (horizontales)
  const HB=120,grille=new Map(),pasP=Math.max(1,Math.round(12/(L/(NP-1))));
  let yMin=1e9,yMax=-1e9;
  for(let i=0;i<NP;i+=pasP){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);
    if(p.y<yMin)yMin=p.y;if(p.y>yMax)yMax=p.y;}
  const GS=yMin-VIT_SOL_H;if(VS)CITY.solY=GS; // (AU SOL) le sol de la ville : VIT_SOL_H sous le point le plus bas de la route
  // (AU SOL) les tours ne se chevauchent pas (une géante DANS une autre percerait sa façade : la profondeur est en 16 bits) ; aucune ne pousse sous la route
  const PLC=new Map(),plcK=(x,z)=>Math.floor(x/90)*100003+Math.floor(z/90);
  const chev=(cx,cz,hd)=>{const bx=Math.floor(cx/90),bz=Math.floor(cz/90);for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const a=PLC.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j+=3){const ex=a[j]-cx,ez=a[j+1]-cz,rr=a[j+2]+hd+4;if(ex*ex+ez*ez<rr*rr)return true;}}return false;};
  const chevPose=(cx,cz,hd)=>{const k=plcK(cx,cz);let a=PLC.get(k);if(!a)PLC.set(k,a=[]);a.push(cx,cz,hd);};
  const routePres=(cx,cz,hd)=>{const clr=hd+ROAD_HALF+24,c2=clr*clr;let h=false;proches(cx,cz,clr,function(i){if(h)return;const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz<=c2)h=true;});return h;};
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  // LA RÈGLE D'OR : [pied, toit] rognés pour que la route ne traverse JAMAIS la tour (null s'il ne reste rien)
  const tourLibre=(cx,cz,hd,b,t)=>{const clr=hd+ROAD_HALF+24,c2=clr*clr; // (2026-09-26, user : « les immeubles ne doivent JAMAIS toucher la route ») marges élargies
    for(let pass=0;pass<4;pass++){let ok=true;
      proches(cx,cz,clr,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz>c2)return;
        if(p.y>t+60||p.y<b-40)return;ok=false;
        if(p.y>(b+t)*.5)t=Math.min(t,p.y-60);else b=Math.max(b,p.y+44);});
      if(ok)return t-b>=40?[b,t]:null;if(t-b<40)return null;}
    return null;}; // (2026-10-20, Sacha : « le sommet des tours traverse la route ») 4 passes sans solution = pas de tour (avant : elle restait, rognée à moitié)
  const routeAuDessus=(cx,cz,hd,t)=>{let m=1e9;const clr=hd+ROAD_HALF+24,c2=clr*clr; // la route la plus basse au-dessus du toit, sous l'emprise : borne le mât (il montait jusque dans le bitume)
    proches(cx,cz,clr,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz<=c2&&p.y>t&&p.y<m)m=p.y;});return m;};
  // LES CELLULES : maille SERRÉE près du ruban (le canyon), lâche au large ; chaque cellule retient le point de piste le plus proche
  const R_CAN=330,R_VIL=ALLEGE?1700:2100,SN=ALLEGE?66:54,SF=ALLEGE?230:200; // (2026-09-26) la forêt va jusqu'au brouillard
  const cellules=(S,R,garde)=>{const m=new Map(),rr=Math.ceil(R/S),pas=Math.max(1,Math.round(S*.6/(L/(NP-1))));
    for(let i=0;i<NP;i+=pas){const cx0=Math.round(pts[i].x/S),cz0=Math.round(pts[i].z/S);
      for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const gx=(cx0+dx)*S,gz=(cz0+dz)*S,d=Math.hypot(gx-pts[i].x,gz-pts[i].z);if(d>R)continue;
        const k=(cx0+dx)+','+(cz0+dz),o=m.get(k);if(!o||d<o[0])m.set(k,[d,i,gx,gz]);}}
    const out=[];for(const v of m.values())if(garde(v[0]))out.push(v);return out;};
  const corps=[],genre=[],neon=[],neonC=[],pubs=[],tqC=[],tqN=[],VTW=[]; // VTW (VILLE VITRÉE) : [1er volume, fin, 1er néon, fin, route, forme] par tour // tqC/tqN (passe perf) : le centre de la TOUR à laquelle appartient chaque volume / néon (son quartier, voir fam)
  // (2026-09-26, vague 2) les ENSEIGNES parlent MAGENTA et CYAN (#ff3ec8 / #3ee8ff et leurs deux voisins) : le jaune, le vert et le violet
  // en faisaient une guirlande. Cinq teintes comme avant (le tirage `vr` ne bouge pas), le feu d'antenne au rouge DANGER, la couronne à l'accent.
  CITY.uPied.value=1;
  const VV9=VILLE_VERRE_V&&!VI&&!CR;VV.on=VV9;VV.n=VV.nv=0;let gvDer=false; // (2026-10-18) LA VILLE, NÉON ET VERRE : ses géantes de verre (voir VILLE_VERRE_V) · gvDer : la dernière tour bâtie en est une
  const NEON=VI?[new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff), // (VILLE VITRÉE) pas d'enseigne (voir batir) ;
                 new THREE.Color(VIT_PLAFOND?0xff3b3b:0x5ab8ff),new THREE.Color(0xe6f0ff)]: // le feu d'antenne (CLEAN CITY : BLEU — Léo : « les trucs rouges au-dessus, ça ressemble trop à Crypto City »), la couronne en bandeau de lumière blanche
           CR?[new THREE.Color(0x2bff88),new THREE.Color(0xffd23e),new THREE.Color(0xf7931a),new THREE.Color(0x6dffc8), // CRYPTO CITY : le vert profit, l'or, l'orange bitcoin, la menthe…
                 new THREE.Color(0xfff2c8),new THREE.Color(0xff3b5c),new THREE.Color(0xffc63a)]: // …un blanc chaud, le feu d'antenne, la couronne en OR
             (!villeRose())?[new THREE.Color(0xffb04a),new THREE.Color(0xe8eef2),new THREE.Color(0xffb04a),new THREE.Color(0xe8eef2), // (2026-10-14, passe graphismes · facades-jour)
              new THREE.Color(0xffb04a),new THREE.Color(0xe5484d),new THREE.Color(0xe8eef2)]: // DIRECTION §2.2 : enseignes ambre #FFB04A / blanc de bureau #E8EEF2, feu d'antenne rouge de balise #E5484D (l'unique accent saturé), couronne blanche — mêmes indices, même tirage `vr`
             [new THREE.Color(0xff3ec8),new THREE.Color(0x3ee8ff),new THREE.Color(0xff4f9e),new THREE.Color(0x52c8ff),
              new THREE.Color(0xff3ec8),new THREE.Color(0xff3b5c),accC];
  if(DZ&&DZ.neon&&(CR||villeRose()))for(let i=0;i<5;i++)NEON[i].setHex(DZ.neon[i]); // (DZ) la PALETTE des néons tirée (la teinte de la ville la remappe ensuite)
  if(!VI){const T9=vtCur();if(T9)for(let i=0;i<6;i++)vtCol(NEON[i],T9);} // (2026-10-16) LES TEINTES DE LA VILLE : magenta et rose des enseignes → la couleur de la ville (le cyan et le rouge des balises restent ; accC l'est déjà)
  if(VV9)VV.acc.copy(NEON[0]); // (NÉON ET VERRE) les filets, les logos et le parapet du verre : le néon de la teinte
  let nT=0;
  // UNE TOUR : (cx,cz) son centre, d sa distance à l'axe, yN l'altitude du tronçon qu'elle BORDE, yLo le plus bas de ce tronçon
  /* L'ENTRÉE SURÉLEVÉE (voir VILLE_ENTREE) : `eEnt(i)` vaut 1 le long de la droite, glisse à 0 au pied de la rampe. Les tours qui bordent
     ces tronçons ont leurs toits ramenés SOUS la route (de `toit` à `toit`+`etage` m plus bas, les plus hautes restant les plus hautes) : sans aucun
     tirage `vr` de plus, la ville garde ses tours, ses teintes et ses néons — elle est juste plus basse là où l'on arrive.
     ⚠ ENTRÉE v2 (2026-10-04, Léo : « les niveaux villes ne sont pas tous des villes ») : MESURÉ (banc villepos.mjs, scratchpad 83e03bdc) —
     sur ~1 km (la droite + la rampe, ~10 s de jeu) TOUTES les tours (les trois rangs ET la forêt proche) passaient sous la route : AU-DESSUS
     DE LA VILLE et MINUIT EN VILLE commençaient par un ciel vide et une route mouillée, aucune tour à l'écran ; plus loin la ville est
     là (1 500-1 700 tours). Désormais seul le MUR (1er rang, au bord de la route) passe dessous — la route reste droite et SURÉLEVÉE au-dessus
     de lui (Sacha, 29/09) ; le 2e et le 3e rang et la forêt gardent leur hauteur : on arrive ENTRE les gratte-ciel. Mêmes tirages. */
  let iEA=-1,iEB=-1;
  if(VILLE_ENTREE){let dA=1e18,dB=1e18;const lim=Math.min(NP,Math.ceil(NP*.45));
    for(let i=0;i<lim;i++){const a=pts[i].distanceToSquared(VILLE_ENTREE.pA),b=pts[i].distanceToSquared(VILLE_ENTREE.pB);if(a<dA){dA=a;iEA=i;}if(b<dB){dB=b;iEB=i;}}
    if(!(iEB>iEA))iEA=iEB=-1;}
  const eEnt=i=>iEA<0?0:i<=iEA?1:i>=iEB?0:1-THREE.MathUtils.smoothstep((i-iEA)/(iEB-iEA),.25,1);
  CITY.entree=iEA<0?null:[iEA,iEB];
  if(CR)cryptoPlace(seed,proches); // (CRYPTOCITY) les taureaux, les bougies, les pièces géantes… se réservent leur place AVANT les tours
  const batir=(cx,cz,d,yN,yLo,canyon,w,p,eE)=>{
    const hd=Math.hypot(w,p)*.5+5,l0=corps.length,lg=genre.length,lq=tqC.length,ln=neon.length,lnc=neonC.length,lqn=tqN.length,le=CITY.ens.length;
    let t;
    if(VS){if(chev(cx,cz,hd))return;const k=canyon?1-Math.min(1,(d-54)/(R_CAN-54)):0,r1=vr(),r2=vr(); // (AU SOL) LES GÉANTES, posées sur le sol : 170 à 1 300 m au bord de la route (une sur six passe le kilomètre), 90 à 470 m au large
      t=GS+(canyon?170+(840-250*k)*Math.pow(r1,1.5)+(r2<.18?260:0):90+380*r1*r2);if(DZ&&canyon)t=GS+(t-GS)*DZ.haut;} // (le 1er rang un peu moins haut : les géantes de derrière se lisent au-dessus)
    else if(canyon){const k=1-Math.min(1,(d-54)/(R_CAN-54));           // LE CANYON : les murs montent AU-DESSUS de la route
      t=yN-50+290*Math.pow(vr(),.75)*(.55+.45*k);if(k>.5&&vr()<.22)t+=160;if(DZ)t=yN-50+(t-yN+50)*DZ.haut;}
    else t=yN-230+vr()*vr()*470;                                   // AU LARGE : la forêt du village
    if(eE>0&&!VS){const u9=THREE.MathUtils.clamp((t-yN+50)/450,0,1),tE=yN-VILLE_ENTREE_R.toit-(1-u9)*VILLE_ENTREE_R.etage;t+=(tE-t)*eE;} // (2026-09-29) L'ENTRÉE SURÉLEVÉE : le toit passe SOUS la route (juste sous elle pour les plus hautes : on les voit défiler au ras du bitume)
    if(VI&&VIT_PLAFOND&&t>yN)t=yN+(VIT_HC-40)*(1-Math.exp(-(t-yN)/(VIT_HC-40))); // (VILLE VITRÉE) la hauteur AU-DESSUS de la route se tasse en douceur sous le plafond (jamais plus de 110 m) : la route passe ENTRE les deux villes, chaque reflet pend au-dessus de sa tour
    let b=VS?GS-3:Math.min(yLo,yN)-330-vr()*120;if(!VS&&t-b>1000)b=t-1000;
    const bt=VS?(routePres(cx,cz,hd)?null:[b,t]):tourLibre(cx,cz,hd,b,t);if(!bt)return;b=bt[0];t=bt[1];
    if(VS)chevPose(cx,cz,hd);
    const H=t-b,km=(b+t)/2;nT++;
    const GV=VV9&&(DZ&&DZ.verre?villeVerreTourD(cx,cz,t-yN,canyon,DZ.verre):villeVerreTour(cx,cz,t-yN,canyon)),VIt=VI||GV;gvDer=GV;if(VV9){VV.n++;if(GV)VV.nv++;} // (NÉON ET VERRE) une GÉANTE DE VERRE : bâtie comme dans la ville vitrée (VIt) — aucun tirage `vr` de plus ni de moins
    const fo=VIt?(VI&&DZ&&DZ.fo?vitreFormeD(cx,cz,H,canyon,DZ.fo):vitreForme(cx,cz,H,canyon)):0; // (VILLE VITRÉE) la FORME de la tour (0 = droite, à retraits empilés)
    // LES RETRAITS : volumes EMBOÎTÉS qui partent tous du pied (la brume se lit pareil sur tous), plus étroits et plus hauts
    const et=H>260?(vr()<.55?3:2):(vr()<.4?2:1);
    let wk=w,pk=p,yV=b,h0=H; // (VILLE VITRÉE) yV : le haut du dernier volume EMPILÉ · h0 : la hauteur du volume du pied
    for(let k=0;k<et;k++){
      const fr=k===et-1?1:(.5+.36*(k+1)/et+(vr()-.5)*.08);
      /* (2026-10-17, VILLE VITRÉE) les retraits EMPILÉS, pas emboîtés : la profondeur de l'image est en 16 bits (24 m de pas à 400 m) — un volume
         caché DANS un autre, dessiné après lui, perçait sa façade par bandes (mesuré au rayon : le mât à 12 m derrière le verre). Même silhouette. */
      if(VIt&&fo>0){h0=H;yV=t;} // une tour de forme : un seul volume (ci-dessous) — les tirages des retraits ont lieu quand même
      else if(VIt){const y1=b+H*fr;if(y1>yV+1){corps.push(cx,(yV+y1)/2,cz,wk,y1-yV,pk);genre.push(0);tqC.push(cx,km,cz);}if(k===0)h0=H*fr;yV=Math.max(yV,y1);}
      else{corps.push(cx,b+H*fr/2,cz,wk,H*fr,pk);genre.push(0);tqC.push(cx,km,cz);yV=Math.max(yV,b+H*fr);} /* (2026-10-18, DEBUGGING : ville) yV = le VRAI toit de la tour de béton : quand le dernier retrait est trop fin (19,2 m → 12,8 → 6,4 : break), elle s'arrête vers 0,74 H, pas à t */
      wk=snap(wk*.72);pk=snap(pk*.72);if(wk<VOX_CITY*2||pk<VOX_CITY*2)break;
    }
    if(VIt&&fo>0){corps.push(cx,km,cz,w,H,p);genre.push(0);tqC.push(cx,km,cz);}
    // LES TUYAUX : ils DESCENDENT le long d'une façade jusque dans la brume
    if(H>220&&vr()<(canyon?.7:.5)*dk('tuy',1)){
      const nt=1+((vr()*(ALLEGE?2:3))|0),tk=snap(3+vr()*2.5);
      for(let t9=0;t9<nt;t9++){const face=(vr()*4)|0,ht=VIt?Math.min(H*(.5+vr()*.45),h0):H*(.5+vr()*.45),gl=(vr()-.5)*.7; // (VILLE VITRÉE) la lame s'arrête au toit du volume qu'elle longe
        const ox=face<2?(face?1:-1)*(w/2+tk/2):gl*w,oz=face<2?gl*p:(face===2?1:-1)*(p/2+tk/2);
        if(VIt&&fo>0)continue; // (VILLE VITRÉE) une tour de forme n'a pas de lame plaquée (sa façade s'effile ou tourne)
        corps.push(cx+ox,b+ht/2,cz+oz,tk,ht,tk);genre.push(1);tqC.push(cx,km,cz);}
    }
    // L'ANTENNE et son FEU ROUGE — sinon, parfois, la COURONNE à l'accent de la zone
    if(H>320&&vr()<dk('ant',.5)){let ha=24+vr()*56;if(VIt){if(fo===5)ha=0;else{corps.push(cx,yV+ha/2,cz,1.4,ha,1.4);genre.push(2);tqC.push(cx,km,cz);neon.push(cx,yV+ha,cz,2.2,2.2,2.2);neonC.push(5);tqN.push(cx,km,cz);}} // (VILLE VITRÉE) le mât part du TOIT — pas de mât sur une LAME (son toit est en biais) (il ne traverse plus la tour)
      else{ha=Math.min(ha,routeAuDessus(cx,cz,hd,t)-t-12);if(ha>=8){corps.push(cx,(b+yV+ha)/2,cz,2.4,yV-b+ha,2.4);genre.push(2);tqC.push(cx,km,cz);neon.push(cx,yV+ha,cz,4.5,4.5,4.5) /* (DEBUGGING : ville) au bout du mât posé sur le vrai toit */;neonC.push(5);tqN.push(cx,km,cz);}}}
    else if(vr()<dk('cour',.32)){if(!VIt||(fo===0&&!vitreBiseau(cx,cz))){neon.push(cx,yV-1.4,cz, /* (2026-10-18, DEBUGGING : ville) la COURONNE sur le vrai toit : à t, 5 à 15 % d'entre elles flottaient 95 à 256 m au-dessus de la tour (banc, 16 villes) */wk/.72*1.05,2.8,pk/.72*1.05);neonC.push(6);tqN.push(cx,km,cz);}} // (VILLE VITRÉE) pas de couronne carrée sur une tour biseautée
    if(VIt)VTW.push([l0/6,corps.length/6,ln/6,neon.length/6,yN,fo,t]); // (VILLE VITRÉE) la tour, pour la forme et pour son reflet au plafond
    // L'ENSEIGNE VERTICALE : le long du canyon, une tour sur deux porte son néon, à hauteur de ROUTE (on la voit passer)
    if(vr()<(canyon?.5:.18)*dk('ens',1)){
      const hs=Math.min(H*.3,30+vr()*60),ys=Math.max(b+hs/2+20,Math.min(t-hs/2-6,yN+(vr()-.3)*80)),fx=vr()<.5,sg=vr()<.5?-1:1;
      const c5=(vr()*5)|0;if(VIt)return; /* (NÉON ET VERRE) ni sur une géante de verre */ // (VILLE VITRÉE) un quartier d'affaires : pas d'enseigne (le tirage a eu lieu, la suite de la ville ne bouge pas)
      neon.push(cx+(fx?sg*(w/2+1.2):0),ys,cz+(fx?0:sg*(p/2+1.2)),fx?1.8:7.5,hs,fx?7.5:1.8);neonC.push(c5);tqN.push(cx,km,cz);
      if(canyon&&CITY.ens.length<24)CITY.ens.push([cx+(fx?sg*(w/2+1.2):0),ys,cz+(fx?0:sg*(p/2+1.2)),fx?sg:0,fx?0:sg,hs]); // (dev) quelques enseignes à photographier (dbgEnseigne)
    }
    // (CRYPTOCITY) la tour tombe sur un site réservé, ou devient une bougie : bâtie (ses tirages ont eu lieu), puis retirée
    if(CR&&cryptoTour(cx,cz,hd,b,t,canyon)){corps.length=l0;genre.length=lg;tqC.length=lq;neon.length=ln;neonC.length=lnc;tqN.length=lqn;CITY.ens.length=le;}
  };
  /* LE CANYON, BÂTI LE LONG DU RUBAN — et non par cases au sol : la piste de la ville descend en SPIRALE sur 7 à 9 km, plusieurs
     étages de route se superposent à la verticale d'un même point ; une grille horizontale ne voyait que l'étage le plus proche,
     les autres roulaient dans le vide (capture v3-b du 26/09). Chaque tour se pose par rapport au TRONÇON qu'elle borde : trois
     rangs de chaque côté (le mur, la deuxième ligne, le fond de rue). Les autres étages de route, `tourLibre` s'en charge.
     LE BUDGET (iPhone) : une piste de 30 km ferait 20 000 volumes — au-delà du plafond, on éclaircit au hasard, sans trou régulier. */
  const pasC=Math.max(1,Math.round(SN/(L/(NP-1)))),ROWS=[[28,40,.9],[100,60,.7],[190,130,.5]],BUD=ALLEGE?1300:2300;
  const kC=Math.min(1,BUD/Math.max(1,(NP/pasC)*2*2.1));
  for(let i=0;i<NP;i+=pasC){const T9=T[i],hl=Math.hypot(T9.x,T9.z);if(hl<.5)continue; // haut des loopings : pas de mur
    const px=-T9.z/hl,pz=T9.x/hl,tx=T9.x/hl,tz=T9.z/hl;
    let yLo=pts[i].y;for(let j=Math.max(0,i-pasC*5);j<=Math.min(NP-1,i+pasC*5);j+=pasC)if(pts[j].y<yLo)yLo=pts[j].y; // le pied se noie sous le point le plus bas du tronçon
    for(const sg of [-1,1])for(const rw of ROWS){if(vr()>rw[2]*kC*dk('dens',1))continue;
      if(DZ&&DZ.trou.length&&rw!==ROWS[2]&&place9(i,sg)){nPl++;continue;} // (DZ) LA PLACE
      const w=snap(VS?30+vr()*42:16+vr()*26),p=snap(VS?30+vr()*42:16+vr()*26),hd=Math.hypot(w,p)*.5,lat=ROAD_HALF+rw[0]*(VS?1.7:1)+hd+vr()*rw[1]*(VS?1.6:1),al=(vr()-.5)*SN*.6; // (AU SOL) des géantes : plus larges, plus loin (le ciel et leurs pieds se voient entre elles)
      const nt0=nT,eI=eEnt(i);batir(pts[i].x+px*sg*lat+tx*al,pts[i].z+pz*sg*lat+tz*al,lat,pts[i].y,yLo,true,w,p,rw===ROWS[0]?eI:0); // (2026-10-04) seul le MUR (1er rang) passe sous la route à l'entrée — voir ENTRÉE v2
      // LE PANNEAU : un mur sur quatre du 1er rang porte une réclame, tournée VERS la route, un peu au-dessus d'elle
      if(rw===ROWS[0]&&nT>nt0&&vr()<(ALLEGE?.22:.3)*dk('pub',1)){const pw=24+vr()*16,ph=pw*(.75+vr()*.25),d9=lat-hd*.72-1.5;
        (eI>.3||VI||gvDer||CR&&cryptoReserve(pts[i].x+px*sg*d9+tx*al,pts[i].z+pz*sg*d9+tz*al,pw*.6)?[]:pubs).push(pts[i].x+px*sg*d9+tx*al,pts[i].y+16+vr()*40,pts[i].z+pz*sg*d9+tz*al,Math.atan2(-px*sg,-pz*sg),pw,ph);}} // (entrée surélevée : pas de réclame en l'air au-dessus des toits — les tirages restent)
  }
  // AU LARGE : la forêt du village, par cases au sol (le fond de scène), calée sur le point de piste le plus proche
  const cF=cellules(SF,R_VIL,d=>d>R_CAN),kF=Math.min(1,BUD*.55/Math.max(1,cF.length));
  for(const v of cF){if(vr()>kF*.8*dk('dens',1))continue;const cx=v[2]+(vr()-.5)*SF*.4,cz=v[3]+(vr()-.5)*SF*.4;
    let d2=1e12,yN=pts[v[1]].y,yLo=yN,iN=v[1];
    proches(cx,cz,360,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz,e=dx*dx+dz*dz;if(e<d2){d2=e;yN=p.y;iN=i;}if(e<129600&&p.y<yLo)yLo=p.y;});
    const dF=d2<1e12?Math.sqrt(d2):v[0];batir(cx,cz,dF,yN,yLo,false,snap(VS?32+vr()*48:20+vr()*30),snap(VS?32+vr()*48:20+vr()*30),0);} // (2026-10-04, ENTRÉE v2) la forêt garde sa hauteur à l'entrée (elle baissait près de la droite)
  /* (DZ) LES TOURS REPÈRES : des géantes qu'on voit venir de loin — trois volumes emboîtés (à la vitrée : une seule, posée au sol), le mât et son feu,
     parfois la couronne ; elles passent par la règle d'or comme les autres (tourLibre, routePres, chev, la réserve de crypto) */
  if(DZ)for(const R of DZ.rep){const i=Math.max(2,Math.min(NP-3,Math.round(R.f*(NP-1)))),T9=T[i],hl=Math.hypot(T9.x,T9.z)||1,px=-T9.z/hl,pz=T9.x/hl;
    const w=snap(VS?62+R.h*30:34+R.h*14),p=snap(VS?62+R.h*30:34+R.h*14),hd=Math.hypot(w,p)*.5+5,lat=ROAD_HALF+(VS?160:110)+hd+R.lat*120,cx=pts[i].x+px*R.sg*lat,cz=pts[i].z+pz*R.sg*lat,yN=pts[i].y;
    let yLo=yN;for(let j=Math.max(0,i-40);j<=Math.min(NP-1,i+40);j+=4)if(pts[j].y<yLo)yLo=pts[j].y;
    if(VS&&chev(cx,cz,hd))continue;if(CR&&cryptoReserve(cx,cz,hd))continue;
    let b=VS?GS-3:Math.min(yLo,yN)-330,t=VS?GS+1300+R.h*500:yN+400+R.h*300;
    const bt=VS?(routePres(cx,cz,hd)?null:[b,t]):tourLibre(cx,cz,hd,b,t);if(!bt||bt[1]-bt[0]<300)continue;b=bt[0];t=bt[1];if(VS)chevPose(cx,cz,hd);
    const H=t-b,km=(b+t)/2,l0=corps.length,ln=neon.length;nT++;nRep++;
    if(VI){corps.push(cx,km,cz,w,H,p);genre.push(0);tqC.push(cx,km,cz);}
    else{let wk=w,pk=p;for(let k=0;k<3;k++){const fr=k===2?1:.55+.17*k;corps.push(cx,b+H*fr/2,cz,wk,H*fr,pk);genre.push(0);tqC.push(cx,km,cz);wk=snap(wk*.74);pk=snap(pk*.74);}}
    const ha=40+R.h*50;corps.push(cx,t+ha/2,cz,VI?1.4:2.4,ha,VI?1.4:2.4);genre.push(2);tqC.push(cx,km,cz);neon.push(cx,t+ha,cz,4.5,4.5,4.5);neonC.push(5);tqN.push(cx,km,cz);
    if(R.cour&&!VI){neon.push(cx,t-1.4,cz,w*.74*.74*1.05,2.8,p*.74*.74*1.05);neonC.push(6);tqN.push(cx,km,cz);}
    if(VI)VTW.push([l0/6,corps.length/6,ln/6,neon.length/6,yN,0,t]);}
  CITY.nC=Math.round(NP/pasC);CITY.nF=cF.length;
  if(VS)vitreSolPose(root,GS); // (AU SOL) le sol de la ville et les piliers de la voie express
  /* (2026-10-17, VILLE VITRÉE v2) LA VILLE D'EN HAUT — Léo : « le plafond de glace, l'effet miroir : une ville qui vient du ciel ». Chaque tour a son
     REFLET accroché au plafond : ses volumes (et ses feux) retournés par rapport au plan à VIT_HC au-dessus de la route qu'elle borde — l'instance
     est RETOURNÉE (échelle −x, −y : un demi-tour, les faces restent à l'endroit) ; sa forme et sa façade sont les mêmes (même centre, même graine).
     La règle d'or tient aussi là-haut (tourLibre) : un reflet qui couperait un étage de route est écourté par sa pointe, ou omis. Les tours d'en
     haut sont DURES, comme celles d'en bas (CITY.col). */
  const nBas=genre.length,formV=new Array(nBas).fill(0),mirOf=[];
  VIT.tours=VI?VTW.map(function(r){const o=r[0]*6;return [corps[o],corps[o+2],r[4],r[5],corps[o+1]+corps[o+4]/2,r[6]];}):null; // (banc) les tours : x, z, route, forme
  const piedV=new Array(nBas).fill(0); // (CLEAN CITY) le volume du PIED de chaque tour, et ses lames : leur pied se noie (VIT_PIED)
  if(VI||VV9)for(const r of VTW)for(let i=r[0];i<r[1];i++){if(genre[i]===0)formV[i]=r[5];if(i===r[0]||genre[i]===1)piedV[i]=1;}
  const verreV=new Uint8Array(nBas);if(VV9)for(const r of VTW)verreV.fill(1,r[0],r[1]); // (NÉON ET VERRE) les volumes des géantes de verre
  if(VI&&VIT_PLAFOND){
    for(const r of VTW){const yC=r[4]+VIT_HC;
      for(let i=r[0];i<r[1];i++){const o=i*6,x=corps[o],z=corps[o+2],w9=corps[o+3],h9=corps[o+4],p9=corps[o+5],yt=2*yC-(corps[o+1]-h9/2);let yb=yt-h9;
        const bt9=tourLibre(x,z,Math.hypot(w9,p9)*.5+5,yb,yt);if(!bt9||bt9[1]<yt-1)continue;yb=bt9[0];
        corps.push(x,(yb+yt)/2,z,w9,yt-yb,p9);genre.push(genre[i]);tqC.push(tqC[i*3],2*yC-tqC[i*3+1],tqC[i*3+2]);formV.push(formV[i]);mirOf.push(i);}
      for(let q=r[2];q<r[3];q++){const o=q*6;neon.push(neon[o],2*yC-neon[o+1],neon[o+2],neon[o+3],neon[o+4],neon[o+5]);neonC.push(neonC[q]);tqN.push(tqN[q*3],2*yC-tqN[q*3+1],tqN[q*3+2]);}}}
  // (2026-09-26, user : « enlève les carrés qui bougent en l'air ») : la CIRCULATION VOLANTE est retirée
  // LES TOURS SONT DURES (2026-09-26, user : « si le joueur entre en collision avec un immeuble, il meurt ») : chaque volume est rangé
  // dans une grille de 60 m ; la boucle de vol demande `villeHeurt(position)` — quelques boîtes testées par image, rien de plus.
  {const CG=60,g9=new Map(),cc=CR?corps.concat(cryptoColBougies()):corps,fo9=new Uint8Array(cc.length/6); /* (2026-10-18, DEBUGGING : ville) fo9 : la FORME de chaque volume de verre (1 + vitreForme ; 0 = une boîte), lue par villeForme */ // (CRYPTO CITY) les bougies sont dures aussi
   for(let k=0;k<cc.length/6;k++){if(k<genre.length&&genre[k]>=2)continue;const f9=k<nBas&&genre[k]===0&&(VI||verreV[k])?formV[k]+1:0,E9=f9===3?1.42:f9===4?1.17:1;fo9[k]=f9; /* la vrillée tourne, le fuseau s'enfle : leur verre déborde de la boîte */
     const o=k*6,x0=cc[o]-cc[o+3]/2*E9,x1=cc[o]+cc[o+3]/2*E9,z0=cc[o+2]-cc[o+5]/2*E9,z1=cc[o+2]+cc[o+5]/2*E9;
     for(let gx=Math.floor(x0/CG);gx<=Math.floor(x1/CG);gx++)for(let gz=Math.floor(z0/CG);gz<=Math.floor(z1/CG);gz++){const kk=gx+','+gz;let a=g9.get(kk);if(!a)g9.set(kk,a=[]);a.push(o);}}
   CITY.col={g:g9,CG:CG,c:Float32Array.from(cc),f:fo9};}
  // ---- LA POSE (2026-09-28, passe perf iPhone) : par QUARTIERS, en deux vitesses — voir villeTri ----
  const CUBE=new THREE.BoxGeometry(1,1,1),M=new THREE.Matrix4();
  const col=new THREE.Color(),colT=new Float32Array(genre.length*3),colN=new Float32Array(neonC.length*3);
  for(let i=0;i<genre.length;i++){const t9=.8+vr()*.45,g=genre[i]; // (le tirage `vr` dans le MÊME ordre qu'avant : chaque tour garde sa teinte)
    if(VI&&i>=nBas){const j=mirOf[i-nBas];colT[i*3]=colT[j*3];colT[i*3+1]=colT[j*3+1];colT[i*3+2]=colT[j*3+2];continue;} // (VILLE VITRÉE) le reflet a la teinte (et la forme) de sa tour
    if(VI||verreV[i]){const o9=i*6,sd9=((corps[o9]*.0131+corps[o9+2]*.0173)%1+1)%1,q9=(sd9*29.37)%1,st9=VI?(q9<.26?0:q9<.50?1:q9<.66?2:q9<.76?3:4):(q9<.34?0:q9<.44?1:q9<.56?2:q9<.78?3:4),k9=.9+(t9-.8)*.35; /* (NÉON ET VERRE) les seuils de VV_STY */ // (mêmes seuils que le sommet) // (VILLE VITRÉE) la STRUCTURE (la façade, c'est le shader : mêmes seuils)
      if(g===0){let P9=[[.66,.70,.76],[.94,.95,.96],[.93,.94,.95],[.20,.22,.25],[.80,.83,.87]][st9],m9=VI&&DZ&&DZ.mont&&(st9===0||st9===3||st9===4)?DZ.mont:null;if(m9)P9=[P9[0]*m9[0],P9[1]*m9[1],P9[2]*m9[2]]; /* (DZ) les MONTANTS tirés */ /* (CLEAN CITY) le BLANC des tours blanches et des lames */col.setRGB(P9[0]*k9,P9[1]*k9,P9[2]*k9);} // montants d'alu · béton clair · lames blanches · montants noirs · alu argent
      else if(g===1)col.setRGB(.93*k9,.94*k9,.95*k9);else col.setRGB(.88,.90,.93);col.toArray(colT,i*3);colT[i*3]+=8*formV[i];colT[i*3+1]+=8*piedV[i];continue;} // + la FORME (r + 8 × forme, lue au sommet) // les tuyaux deviennent des LAMES de béton clair ; les mâts, acier clair
    if(CR){const o9=i*6,sd9=((corps[o9]*.0131+corps[o9+2]*.0173)%1+1)%1,q9=(sd9*29.37)%1,st9=q9<.26?0:q9<.44?1:q9<.64?2:q9<.80?3:4,k9=Math.min(1.12,t9); // CRYPTO CITY : la STRUCTURE de la tour (la façade, c'est le shader)
      if(g===0){const P9=[[.30,.40,.46],[.74,.62,.36],[.70,.74,.80],[.38,.40,.44],[.94,.94,.92]][st9];col.setRGB(P9[0]*k9,P9[1]*k9,P9[2]*k9);} // VERRE · OR · ARGENT · MÉTAL · BLANC (2026-10-15, Sacha)
      else if(g===1)col.setRGB(.76*k9,.78*k9,.82*k9);else col.setRGB(.16,.16,.18);}               // tuyaux de chrome, mâts sombres
    else if(g===0){if(DZ&&DZ.bet)col.setRGB(DZ.bet[0]*t9,DZ.bet[1]*t9,DZ.bet[2]*t9);else col.setRGB(.20*t9,.21*t9,.26*t9);} // (DZ) le BÉTON tiré                   // le BÉTON du village : gris-bleu, mouillé
    else if(g===1)col.setRGB(.32*t9,.33*t9,.37*t9);              // le MÉTAL des tuyaux : il accroche le néon
    else col.setRGB(.10,.10,.12);                                // le mât : une ligne sombre
    col.toArray(colT,i*3);}
  for(let i=0;i<neonC.length;i++)NEON[neonC[i]].toArray(colN,i*3);
  const fam=(arr,kT,cols,mat,matL,geo,flip,colL)=>{ // (2026-10-18, NÉON ET VERRE) colL : l'instance AU LOIN a aussi sa couleur (le drapeau du pied des géantes de verre)
    // (2026-10-17) flip : les instances RETOURNÉES (la ville d'en haut de la VILLE VITRÉE) // (2026-10-17) geo : la géométrie des tours PRÈS (la VILLE VITRÉE : ses coins biseautés) ; au loin, toujours le cube // une FAMILLE : tableau maître rangé par quartiers + l'instance complète (PRÈS) et l'instance nue (AU LOIN)
    // ⚠ le quartier se choisit par la TOUR (kT), pas par le volume : les pièces d'une même tour (retraits emboîtés, tuyaux, mât, néons) restent
    // ensemble et dans leur ordre d'origine — là où deux d'entre elles se croisent, la profondeur tombe à égalité sur une ligne de pixels et
    // c'est l'ORDRE qui tranche (mesuré : 5 pixels changeaient de camp quand un retrait partait dans un autre quartier)
    const nb=arr.length/6,cle=new Map();
    for(let i=0;i<nb;i++){const o=i*3,k=Math.floor(kT[o]/VT.QC)+','+Math.floor(kT[o+1]/VT.QC)+','+Math.floor(kT[o+2]/VT.QC);let L=cle.get(k);if(!L)cle.set(k,L=[]);L.push(i);}
    const F={n:nb,M:new Float32Array(nb*16),C:new Float32Array(nb*3),rang:new Int32Array(nb),Q:new Float64Array(cle.size*6),e:new Uint8Array(cle.size),
      z:new Float64Array(cle.size),pP:new Int32Array(cle.size),pL:new Int32Array(cle.size),fP:0,fL:0,d:new Int32Array([2e9,-1,2e9,-1]),vide:[false,false],refait:false};
    let p=0,j=0;
    for(const L of cle.values()){const a=p;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
      for(const i of L){const o=i*6;if(flip&&flip[i])M.makeScale(-arr[o+3],-arr[o+4],arr[o+5]);else M.makeScale(arr[o+3],arr[o+4],arr[o+5]);M.setPosition(arr[o],arr[o+1],arr[o+2]);M.toArray(F.M,p*16); // la matrice d'AVANT, au bit près
        F.C[p*3]=cols[i*3];F.C[p*3+1]=cols[i*3+1];F.C[p*3+2]=cols[i*3+2];F.rang[i]=p++;
        x0=Math.min(x0,arr[o]-arr[o+3]/2);x1=Math.max(x1,arr[o]+arr[o+3]/2);y0=Math.min(y0,arr[o+1]-arr[o+4]/2);y1=Math.max(y1,arr[o+1]+arr[o+4]/2);
        z0=Math.min(z0,arr[o+2]-arr[o+5]/2);z1=Math.max(z1,arr[o+2]+arr[o+5]/2);}
      F.Q[j]=a;F.Q[j+1]=p;F.Q[j+2]=(x0+x1)/2;F.Q[j+3]=(y0+y1)/2;F.Q[j+4]=(z0+z1)/2;F.Q[j+5]=Math.hypot(x1-x0,y1-y0,z1-z0)/2+1;j+=6;}
    F.im=new THREE.InstancedMesh(geo||CUBE,mat,nb);F.imL=new THREE.InstancedMesh(CUBE,matL,nb);
    F.im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(nb*3),3);if(colL)F.imL.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(nb*3),3);
    for(const a of [F.im.instanceMatrix,F.im.instanceColor,F.imL.instanceMatrix,F.imL.instanceColor])if(a)a.setUsage(THREE.DynamicDrawUsage);
    for(const x of [F.im,F.imL]){x.frustumCulled=false;root.add(x);trackMeshes.push(x);} // (le tri, c'est villeTri) — ⚠ la GÉOMÉTRIE part au rebuild (trackMeshes), les MATÉRIAUX sont partagés et gardés
    F.e.fill(1);villeRefait(F);villePousse(F); // tout PRÈS tant qu'aucun rendu n'a trié (= la ville d'avant)
    return F;};
  CITY.fam=[];
  if(VI){const A={a:[],k:[],c:[],f:[]},B={a:[],k:[],c:[],f:[]}; // (VILLE VITRÉE) deux familles : les tours à étages (VRILLÉE, FUSEAU) et toutes les autres
    for(let i=0;i<genre.length;i++){const R=(genre[i]===0&&(formV[i]===2||formV[i]===3))?B:A;for(let q=0;q<6;q++)R.a.push(corps[i*6+q]);for(let q=0;q<3;q++){R.k.push(tqC[i*3+q]);R.c.push(colT[i*3+q]);}R.f.push(i>=nBas?1:0);}
    for(const RG of [[A,vitreGeo()],[B,vitreGeoR()]])if(RG[0].a.length){const F=fam(RG[0].a,RG[0].k,RG[0].c,vitreMatTours(),vitreMatToursLoin(),RG[1],RG[0].f);if(!CITY.imC)CITY.imC=F.im;CITY.fam.push(F);}}
  else if(VV9&&VV.nv){const Cb={a:[],k:[],c:[]},A={a:[],k:[],c:[]},B={a:[],k:[],c:[]}; // (NÉON ET VERRE) le béton de la ville, puis ses géantes de verre (droites · à étages) — chaque tour garde ses pièces ensemble et dans leur ordre
    for(let i=0;i<genre.length;i++){const R=!verreV[i]?Cb:(genre[i]===0&&(formV[i]===2||formV[i]===3))?B:A;for(let q=0;q<6;q++)R.a.push(corps[i*6+q]);for(let q=0;q<3;q++){R.k.push(tqC[i*3+q]);R.c.push(colT[i*3+q]);}}
    if(Cb.a.length){const F=fam(Cb.a,Cb.k,Cb.c,villeMatTours(),villeMatToursLoin());CITY.imC=F.im;CITY.fam.push(F);}
    for(const RG of [[A,vitreGeo()],[B,vitreGeoR()]])if(RG[0].a.length){const F=fam(RG[0].a,RG[0].k,RG[0].c,vitreMatToursNeon(),vitreMatToursNeonLoin(),RG[1],null,true);if(!CITY.imC)CITY.imC=F.im;CITY.fam.push(F);}}
  else if(corps.length){const F=fam(corps,tqC,colT,CR?cryptoMatTours():villeMatTours(),CR?cryptoMatToursLoin():villeMatToursLoin());CITY.imC=F.im;CITY.fam.push(F);}
  if(neon.length){const F=fam(neon,tqN,colN,villeMatNeon(),villeMatNeonLoin());CITY.imN=F.im;CITY.fam.push(F);}
  if(pubs.length){if(!CR)villePubAtlas(); /* (2026-10-16) repeint si la teinte de la ville a changé */ const Qp=new THREE.Quaternion(),Pp=new THREE.Vector3(),Sp=new THREE.Vector3(),Ay=new THREE.Vector3(0,1,0),PL=new THREE.PlaneGeometry(1,1),n9=pubs.length/6;
    const imP=new THREE.InstancedMesh(PL,CR?cryptoMatPub():villeMatPub(),n9);
    for(let i=0;i<n9;i++){const o=i*6;Qp.setFromAxisAngle(Ay,pubs[o+3]);Pp.set(pubs[o],pubs[o+1],pubs[o+2]);Sp.set(pubs[o+4],pubs[o+5],1);M.compose(Pp,Qp,Sp);imP.setMatrixAt(i,M);}
    imP.instanceMatrix.needsUpdate=true;imP.frustumCulled=false;imP.renderOrder=3;root.add(imP);trackMeshes.push(imP);}
  if(CR)cryptoBatit(root); // (CRYPTOCITY) les taureaux, le graphique, les pièces, les diamants, les dirigeables
  if(!VI&&!CR)try{villeRais(root,seed,corps,genre,NEON);}catch(e9){console.warn('rais',e9);} /* (2026-10-20, VILLE EMBELLIE) les rais de projecteur — hasard LOCAL (voir ville-embellie.js), aucun tirage `vr` ni `rnd` */
  CITY.n={pubs:pubs.length/6,tours:nT,reperes:nRep,places:nPl,volumes:corps.length/6,neons:neon.length/6,routeY:[Math.round(yMin),Math.round(yMax)],ms:Math.round(performance.now()-t00),L:Math.round(L),cellsC:CITY.nC,cellsF:CITY.nF};
}
for(const f of [villeMatTours,villeMatNeon,villeMatToursLoin,villeMatNeonLoin])f().dispose=function(){}; // partagés sur toute la partie : le rebuild ne les jette pas
/* L'HORIZON DE LA VILLE : le cylindre peint (2026-09-25) est RETIRÉ le 2026-09-26 — net derrière des tours noyées de brume, il se
   lisait comme un décor de théâtre, et en vol libre on en voyait les BORDS. La skyline vit désormais dans le dôme du ciel
   (`villeCiel`), calculée par direction du monde : aucune couture, fondue dans la brume comme le reste du lointain. */
function villeChauffe(){ // une instance de chaque, compilée hors écran puis retirée — les vraies réutilisent le programme
  const g=new THREE.Group(),geo=new THREE.BoxGeometry(1,1,1),c=new THREE.Color(1,1,1);
  /* ⚠ LA CHAUFFE DOIT RESSEMBLER AU VRAI (2026-09-26, bug mesuré) : three r128 garde le PREMIER programme compilé pour un matériau, et
     ne le recompile pas quand un objet a ou n'a pas de couleur par instance. Chauffés AVEC `setColorAt`, les panneaux (qui n'en ont
     pas) héritaient d'un programme qui réclame `instanceColor` → `attributes.get(null)` → le rendu jetait à CHAQUE image dès que la
     ville arrivait après la chauffe (auto-école, puis ville : l'écran gelait). Tours et néons ont une couleur par instance, les pubs non. */
  const vv9=VILLE_VERRE_V?[vitreMatToursNeon(),vitreMatToursNeonLoin()]:[]; // (2026-10-18, NÉON ET VERRE) le verre de la ville et sa géante au loin (couleur par instance toutes les deux) — APRÈS les tours, AVANT les néons
  for(const m of [villeMatTours(),villeMatToursLoin()].concat(vv9,[villeMatNeon(),villeMatNeonLoin(),villeMatPub()])){const im=new THREE.InstancedMesh(m===vv9[0]?vitreGeo():geo,m,1);im.setMatrixAt(0,new THREE.Matrix4());if(m===CITY.matT||m===CITY.matN||vv9.indexOf(m)>=0)im.setColorAt(0,c);g.add(im);}
  // (passe perf) les deux matières NUES n'ont pas de couleur par instance. ⚠ L'ORDRE DE COMPILATION fait l'ordre de dessin (three trie les opaques par
  // numéro de programme) : TOUTES les tours avant TOUS les néons, comme avant — le dessus d'une couronne est au ras du toit, à égalité c'est le néon qui gagne.
  g.add(villeRaisChauffe()); /* (2026-10-20, VILLE EMBELLIE) le programme des rais, compilé au menu avec les autres */
  scene.add(g);try{renderer.compile(scene,camera);}catch(e){}scene.remove(g);geo.dispose();
}
/* (2026-09-28, passe perf iPhone) LE TRI PAR QUARTIERS — chaîné sur scene.onBeforeRender (après pisteLoin : caméra et lumières
   ont leurs matrices de l'image). Chaque quartier (cube de 320 m du monde, sphère englobante de ses boîtes) est jugé à chaque rendu :
   HORS du champ (0), PRÈS (1), ou entièrement AU-DELÀ du brouillard (2 : profondeur de vue − rayon > fogFar, la même profondeur que
   le brouillard de three). Hystérésis, toujours du côté sûr : on ne quitte le champ qu'à `M` m de marge, on ne part au loin qu'à `H` m.
   ⚠ MESURÉ : tout ranger à chaque changement remontait les tampons 40 à 115 fois par seconde (0,1-0,3 ms de copies par image sur PC,
   le double sur iPhone, plus l'envoi à la puce). Donc on ne fait QUE l'OBLIGATOIRE, et petit :
     · un quartier qui doit être dessiné et ne l'est pas → AJOUTÉ au bout de son tampon (on n'envoie que ces quelques instances) ;
     · un quartier AU LOIN qui revient PRÈS → ajouté au tampon complet ET effacé du tampon nu (repliée en un point : sinon les deux
       copies se battraient à profondeur égale) ;
     · tout le reste est PARESSEUX : un quartier sorti du champ ou parti au loin reste où il est — le tampon complet le dessine juste
       (VILLE_TRI le replie ou lui épargne la lumière, au pixel près) ;
     · quand ces restes dépassent la moitié de l'utile (ou qu'un tampon déborde), LE MÉNAGE (`villeRefait`) : tout se range, les
       quartiers PRÈS d'avant en arrière (le test de profondeur précoce écarte le reste — hors puces Apple, qui le font seules). */
function villeTri(cam){
  const Fs=CITY.fam;if(!Fs||CITY.ab||!CITY.root||!CITY.root.visible)return;
  const t00=performance.now();villeLampes();
  VT.fr.setFromProjectionMatrix(VT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const P9=VT.pl,pl=VT.fr.planes;for(let i=0;i<6;i++){const n=pl[i].normal;P9[i*4]=n.x;P9[i*4+1]=n.y;P9[i*4+2]=n.z;P9[i*4+3]=pl[i].constant;} // (mesuré : le test de three appel par appel coûtait le double)
  const f=scene.fog,ff=(f&&f.isFog)?f.far:Infinity,e=cam.matrixWorldInverse.elements;
  for(let q=0;q<Fs.length;q++){const F=Fs[q],Q=F.Q,E=F.e,Z=F.z,pP=F.pP,pL=F.pL;let uP=0,uL=0;
    for(let k=0,j=0;k<E.length;k++,j+=6){const w=E[k],r=Q[j+5],cx=Q[j+2],cy=Q[j+3],cz=Q[j+4],z=-(e[2]*cx+e[6]*cy+e[10]*cz+e[14]),rr=-(r+(w===0?0:VT.M));Z[k]=z;
      let s=1;for(let i=0;i<24;i+=4)if(P9[i]*cx+P9[i+1]*cy+P9[i+2]*cz+P9[i+3]<rr){s=0;break;} // la sphère entièrement hors d'un plan du champ
      if(s===1&&z-r>ff+(w===2?0:VT.H))s=2;
      const sz=Q[j+1]-Q[j];E[k]=s;
      if(F.refait)continue;
      if(s===1){if(pL[k]>=0)villeTue(F,k);if(pP[k]<0){if(F.fP+sz>F.n){F.refait=true;continue;}villeMet(F,k,false);}uP+=sz;}
      else if(s===2){if(pL[k]>=0)uL+=sz;else if(pP[k]<0){if(F.fL+sz>F.n){F.refait=true;continue;}villeMet(F,k,true);uL+=sz;}}}
    if(F.refait||F.fP+F.fL-uP-uL>Math.max(VT.G,(uP+uL)*VT.K))villeRefait(F); // LE MÉNAGE
    villePousse(F);}
  VT.ms+=performance.now()-t00;VT.im++; // (banc) le coût processeur du tri, lu par dbgCity
}
function villeMet(F,k,loin){ // AJOUTE le quartier k au bout d'un tampon (copie du tableau maître)
  const j=k*6,d=F.Q[j],g=F.Q[j+1],sz=g-d;
  if(loin){F.imL.instanceMatrix.array.set(F.M.subarray(d*16,g*16),F.fL*16);if(F.imL.instanceColor)F.imL.instanceColor.array.set(F.C.subarray(d*3,g*3),F.fL*3);F.pL[k]=F.fL;villeSale(F,1,F.fL,F.fL+sz);F.fL+=sz;}
  else{F.im.instanceMatrix.array.set(F.M.subarray(d*16,g*16),F.fP*16);F.im.instanceColor.array.set(F.C.subarray(d*3,g*3),F.fP*3);F.pP[k]=F.fP;villeSale(F,0,F.fP,F.fP+sz);F.fP+=sz;}
}
function villeTue(F,k){ // EFFACE le quartier k du tampon nu : ses instances repliées en un point (matrice nulle → zéro pixel)
  const j=k*6,sz=F.Q[j+1]-F.Q[j],p=F.pL[k];F.imL.instanceMatrix.array.fill(0,p*16,(p+sz)*16);F.pL[k]=-1;villeSale(F,1,p,p+sz);
}
function villeSale(F,w,a,b){const D=F.d;if(a<D[w*2])D[w*2]=a;if(b>D[w*2+1])D[w*2+1]=b;}
function villeRefait(F){ // LE MÉNAGE : les deux tampons refaits d'après le dernier jugement
  const E=F.e,Z=F.z;F.pP.fill(-1);F.pL.fill(-1);F.fP=F.fL=0;F.refait=false;VT.n++;
  if(CITY.ab){const a=F.im.instanceMatrix.array,c=F.im.instanceColor.array; // (banc) l'ANCIEN chemin : tout, dans l'ordre d'origine
    for(let i=0;i<F.n;i++){const p=F.rang[i];a.set(F.M.subarray(p*16,p*16+16),i*16);c.set(F.C.subarray(p*3,p*3+3),i*3);}F.fP=F.n;villeSale(F,0,0,F.n);return;}
  const L=VT.ord;L.length=0;for(let k=0;k<E.length;k++)if(E[k]===1)L.push(k);
  if(VT.avAr)L.sort(function(x,y){return Z[x]-Z[y];}); // d'avant en arrière
  for(let i=0;i<L.length;i++)villeMet(F,L[i],false);
  for(let k=0;k<E.length;k++)if(E[k]===2)villeMet(F,k,true);
}
function villePousse(F){ // n'envoie à la puce QUE la plage touchée (updateRange) — et toujours au moins UNE instance par matière (repliée :
  const D=F.d;              // zéro pixel) pour que chauffeRendu prépare l'état de pipeline de chacune
  for(let w=0;w<2;w++){const im=w?F.imL:F.im,fin=w?F.fL:F.fP,A=im.instanceMatrix,C=im.instanceColor||null; // (NÉON ET VERRE) l'instance au loin peut avoir sa couleur (colL)
    if(!fin){if(!F.vide[w]){A.array.fill(0,0,16);villeSale(F,w,0,1);F.vide[w]=true;}im.count=1;}else{F.vide[w]=false;im.count=fin;}
    let a=D[w*2],b=D[w*2+1];D[w*2]=2e9;D[w*2+1]=-1;if(b<=a)continue;
    if(A.updateRange.count>0){const pa=A.updateRange.offset/16;b=Math.max(b,pa+A.updateRange.count/16);a=Math.min(a,pa);} // une plage pas encore partie : on l'englobe
    A.updateRange.offset=a*16;A.updateRange.count=(b-a)*16;A.needsUpdate=true;
    if(C){C.updateRange.offset=a*3;C.updateRange.count=(b-a)*3;C.needsUpdate=true;}
    VT.nu++;VT.ko+=(b-a)*(C?76:64)/1024;}
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);villeTri(cam);};} // CHAÎNÉ (jamais réassigné)
/* (2026-10-18, DEBUGGING : ville) LES GÉANTES DE VERRE SONT DURES SELON LEUR FORME. La grille rangeait leur BOÎTE (w × H × p) : une effilée finit à 45-60 % de sa
   largeur, une ronde à 80 % (et ses pans de coin à 29 %), une lame a le toit en biais (5 à 13 % de H), les coins biseautés (jusqu'à 7 m) — on mourait contre
   l'air à côté du verre (banc, 16 villes : 100 % des effilées, rondes et lames, 5 à 31 m de vide dur) ; la vrillée et le fuseau débordaient de leur boîte
   (leur verre se traversait). Le calcul du sommet de vitreMatFab (vitreSF, la vrille, le biseau, le toit de la lame), à la hauteur de la caisse ; entre deux
   anneaux de la géométrie (vitreGeoFab : 1 bande, 6 pour la vrillée et le fuseau), linéaire comme elle. f = 1 + vitreForme. Rien d'alloué. */
function villeSS(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);} // smoothstep
function villeSFj(f,sv,h){ // vitreSF, en JS
  if(f===1)return 1+(-.55+.15*sv)*villeSS(.4,1,h);if(f===2)return 1-.28*villeSS(.3,1,h);if(f===3)return (1+.16*Math.sin(3.1416*Math.min(1,Math.max(0,(h-.4)/.45))))*(1-.5*villeSS(.8,1,h));if(f===4)return 1-.2*villeSS(.4,1,h);return 1;}
function villeForme(p,c,o,f9){
  const cx=c[o],cy=c[o+1],cz=c[o+2],w=c[o+3],H=c[o+4],d=c[o+5],dy=p.y-cy,f=f9-1;if(Math.abs(dy)>H/2+.5)return false;
  const s0=cx*.0131+cz*.0173,sd=s0-Math.floor(s0),s1=sd*41.7,sv=s1-Math.floor(s1),hh=Math.min(1,Math.max(0,dy/H+.5)); // la graine de l'instance (vSeed9, sv9)
  const NR=f===2||f===3?6:1,q=Math.min(NR-1e-6,hh*NR),r=Math.floor(q),t=q-r,h0=r/NR,h1=(r+1)/NR;
  const s=villeSFj(f,sv,h0)*(1-t)+villeSFj(f,sv,h1)*t,aK=f===2?(1.6+1.2*sv)*(sv<.5?-1:1):0;
  const a=aK?aK*(villeSS(.25,1,h0)*(1-t)+villeSS(.25,1,h1)*t):0,ca=Math.cos(a),sa=Math.sin(a),dx=p.x-cx,dz=p.z-cz,ax=Math.abs(ca*dx+sa*dz),az=Math.abs(-sa*dx+ca*dz);
  const hw=s*w/2,hd=s*d/2;if(ax>hw+.9||az>hd+.9)return false;
  const b9=sd*71.3,ch=s*(f===4?.29*Math.min(w,d):(b9-Math.floor(b9))<=.6?Math.min(Math.min(w,d)*(f===2?.08:.16),7):0); // le biseau (vCh9)
  if(ch>0&&ax+az>hw+hd-ch+1.27)return false;
  if(f===5&&dy>H*(.5-(.05+.08*sv)*(.5+Math.min(.5,Math.max(-.5,dx/w))))+.5)return false; // la LAME : au-dessus de son toit en biais
  return true;}
function villeHeurt(p){ // la caisse est-elle DANS une tour de la ville ? (marge : la demi-caisse)
  const C=CITY.col;if(!C||!CITY.root)return false;if(CRYPTO.taureaux.length&&cryptoHeurt(p))return true; // (CRYPTOCITY) les taureaux sont durs
  const a=C.g.get(Math.floor(p.x/C.CG)+','+Math.floor(p.z/C.CG));if(!a)return false;const c=C.c;
  for(let j=0;j<a.length;j++){const o=a[j],f9=C.f?C.f[o/6]:0;if(f9){if(villeForme(p,c,o,f9))return true;continue;}if(Math.abs(p.x-c[o])<c[o+3]/2+.9&&Math.abs(p.z-c[o+2])<c[o+5]/2+.9&&Math.abs(p.y-c[o+1])<c[o+4]/2+.5)return true;}
  return false;
}
function cityTick(dt,camY){
  CITY.uT.value+=dt; // l'horloge des néons et de la circulation
  if(!CITY.chaud&&CITY.uT.value>2.5){CITY.chaud=true;villeChauffe();} // au menu, 2,5 s après le chargement
}
// `dbgVille()` (dev, 2026-09-26) : le coût de l'image qu'on regarde (appels de rendu, triangles, programmes) + le CAP de la caméra (pour
// cadrer `dbgCiel` dans l'axe de la route) — la ville se juge au budget autant qu'à l'œil.
window.dbgVille=function(){const r=renderer.info,d=camera.getWorldDirection(new THREE.Vector3());
  r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true; // UNE passe de scène mesurée seule (le composer remettrait les compteurs à zéro à chaque passe)
  return {appels:r.render.calls,triangles:r.render.triangles,programmes:r.programs?r.programs.length:null,cap:+Math.atan2(-d.x,-d.z).toFixed(3),site:+Math.asin(d.y).toFixed(3),pluie:+LVL.pluie.toFixed(2),route:+LVL.route.toFixed(2)};};
/* LA LIGNE PARFAITE (2026-09-29, Sacha : « il faut alterner la génération d'items entre fruit et booster pour pouvoir aller à fond tout
   le temps si on a une trajectoire de route parfaite »). Avant : des pads au hasard tous les 280-560 m, des fruits glissés au hasard dans
   les motifs de pièces — même en prenant TOUT, la nitro tenue (−1/s, +0,2/s de recharge) finissait par s'éteindre. Désormais UNE file :
   FRUIT, PAD, FRUIT, PAD… posée EN COURSE (ligneTick), LIGNE.voir secondes devant la caisse, espacée de LIGNE.dt secondes à la vitesse
   RÉELLE du moment — le rythme est le même à 150 et à 600 km/h (MESURÉ : une file précalculée sur la croisière du moteur mettait un objet
   tous les 38 m, soit 4 par seconde à 527 km/h). Posée sur la TRAJECTOIRE : au centre dans les lignes droites, à la corde dans les virages.
   Chaque objet rend LIGNE.don secondes de nitro, un peu PLUS que ce qu'on brûle d'un objet à l'autre : qui les prend tous tient la nitro
   sans la lâcher, qui en rate voit la jauge baisser. Deux faces (miroir), comme tout le reste. ⚠ Aucun rnd() : le flux seedé ne bouge pas.
   Un objet qui tombe sur un trou, un tremplin, une porte de plots ou une chaîne de néon glisse plus loin ; s'il n'a pas de place il saute,
   et le suivant garde SON type (l'alternance tient). */
/* (2026-10-20, Léo : « les boosts de la route disparaissent, on booste non-stop en attrapant des fruits ; des petits fruits qu'on peut mettre partout ») : PLUS DE PLAQUES — la file ne porte que des FRUITS,
   un toutes les 0,45 s (c'était fruit + plaque toutes les 1,2 s) qui rendent chacun 1,05 × ce qu'on brûle entre deux : qui les prend tous tient la nitro, qui en rate un la voit baisser. */
const LIGNE={on:false,cnt:0,npow:20,prem:false,dt:.45,don:.48,voir:3.5,prochS:0,k:0,pts:[],padI:new Set(),padPris:new Set(),n:[0,0],pris:[0,0],vP:0,acc:0}; // n : posés · pris : ramassés (fruits, pads) — pour le banc
const LF0={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      LF1={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      LF2={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
function ligneLat(s9,H9){ // la CORDE : le virage tire l'objet vers l'intérieur (R 150 m → ~11 m), la ligne droite le laisse au centre
  frameAt(s9,LF0);frameAt(s9-40,LF1);frameAt(s9+40,LF2);
  const k=(LF2.t.dot(LF0.b)-LF1.t.dot(LF0.b))/80; // courbure latérale (1/m), signe = côté de l'intérieur
  return THREE.MathUtils.clamp(k*1600,-H9,H9);
}
/* (2026-10-20, Léo : « si les fruits sont en ligne, c'est pas bon » puis « pas des groupes de neuf : le jeu doit être PAS RÉPÉTITIF ») LES GROUPES TIRÉS AU HASARD.
   Pas de cycle : chaque GROUPE de fruits tire SA longueur (4 à 15), SA forme (vague de fréquence et de phase libres, marches de 2 à 4, arc, balayage en diagonale, S, ligne de repos),
   SON amplitude, SON espacement (0,8 à 1,35 × la cadence, la nitro rendue suit : qui les prend tous tient toujours), son fruit dominant ; entre deux groupes, 1 fois sur 4, un REPOS
   (un à deux secondes sans rien : on respire). Le décalage latéral d'un fruit à l'autre est borné (~7 m par pas) et le 1er d'un groupe repart de là où l'on en était : toujours jouable.
   Hasard `Math.random` (comme fruitPick) — jamais le `rnd` seedé de la piste. Le motif s'ajoute à la corde : dans un virage la file reste sur la trajectoire. */
function ligneGroupe(){ // un nouveau groupe, tout tiré au hasard
  const R=Math.random,forme=['vague','vague','marches','arc','balayage','S','repos'][(R()*7)|0];
  LIGNE.grp={left:4+((R()*12)|0),len:0,forme:forme,A:.3+R()*.5,f:.5+R()*1.1,ph:R()*6.283,k:2+((R()*3)|0),sd:R()<.5?-1:1,mult:.8+R()*.55,fi:fruitPick()};
  LIGNE.grp.len=LIGNE.grp.left;
}
function ligneMotif(base,H9){ // la position latérale du prochain fruit (+ son espacement et son fruit via LIGNE.grp)
  let g=LIGNE.grp;if(!g||g.left<=0){
    const ancien=g;ligneGroupe();g=LIGNE.grp;
    if(ancien&&Math.random()<.25)LIGNE.repos=true; // un REPOS avant ce groupe : on saute de la piste sans fruit
  }
  const j=g.len-g.left,u=g.len>1?j/(g.len-1):0;g.left--;
  let o=0;const A=g.A*H9;
  if(g.forme==='vague')o=A*Math.sin(6.283*g.f*u*1.4+g.ph);
  else if(g.forme==='marches')o=(Math.floor(j/g.k)%2?1:-1)*g.sd*A*.8;
  else if(g.forme==='arc')o=g.sd*A*Math.sin(Math.PI*u);
  else if(g.forme==='balayage')o=g.sd*A*(2*u-1);
  else if(g.forme==='S')o=A*Math.sin(Math.PI*(2*u-1))*g.sd;
  let lt=THREE.MathUtils.clamp(base+o,-(ROAD_HALF-4),ROAD_HALF-4);
  if(LIGNE.prevLat!=null){const mx=.45*H9;lt=THREE.MathUtils.clamp(lt,LIGNE.prevLat-mx,LIGNE.prevLat+mx);} // jamais plus de ~7 m d'un fruit au suivant
  LIGNE.prevLat=lt;return lt;
}
function ligneBloque(s9,k){
  if(enTrou(s9,8))return true; // (LES TROUS) jamais un fruit ni un pad dans le vide entre deux segments de route
  for(const o of OILS)if(o.face===1&&Math.abs(o.s-s9)<(o.r||4)+7)return true; // jamais dans une flaque
  if(BANQ.obst&&LVL.cur&&LVL.cur.id==='banquise')for(const o of BANQ.obst)if(Math.abs(o.s-s9)<o.r+12)return true; // (2026-10-17) ni dans un pic de la piste du glacier
  return false;
}
function ligneOnPour(){return !PARK.on&&!(LVL.cur&&LVL.cur.piste==='tuto')&&!BALADE;} // (LE PRÉ-BÂTI) la règle de LIGNE.on, lue aussi par pisteRoute (sur la map d'en face)
function ligneRaz(){ // à chaque piste neuve (buildTrack) : la file repart du début
  LIGNE.dt=PADS_OFF?.45:1.2;LIGNE.don=PADS_OFF?.48:1.15; /* (2026-10-21, Sacha) l'ancien système : fruit, plaque, fruit, plaque… toutes les 1,2 s, 1,15 de nitro chacun (?pads=0 : les fruits serrés de Léo) */
  LIGNE.cnt=0;LIGNE.npow=14+((Math.random()*20)|0);LIGNE.prem=false;LIGNE.grp=null;LIGNE.prevLat=null;LIGNE.repos=false; // (fruits-pouvoirs) la file repart : le 1er pouvoir arrive après 16-24 fruits
  LIGNE.pts.length=0;LIGNE.padI.clear();LIGNE.padPris.clear();LIGNE.prochS=240;LIGNE.k=0;LIGNE.n[0]=LIGNE.n[1]=LIGNE.pris[0]=LIGNE.pris[1]=0;LIGNE.vP=0;LIGNE.acc=20;LIGNE.sPk=null;LIGNE.sPd=0; // acc : l'élan d'un départ lancé, supposé d'avance (les premiers objets se posent avant qu'on l'ait mesuré)
  LIGNE.on=ligneOnPour(); // le parc et l'auto-école gardent leur monde — (2026-10-09) la BALADE aussi : rien sur la route
}
function lignePad(sp,pl){ // un pad d'OR, deux faces (même recette que la boucle des pads de buildTrack)
  LIGNE.padI.add(PADS.length);PADS.push(sp);PADL.push(pl);
  for(const fy of [1,-1]){frameAt(sp,F);const m=new THREE.Mesh(padGeo,PAD_MAT);
    m.quaternion.setFromRotationMatrix(LM4.makeBasis(LV1.copy(F.b).multiplyScalar(-fy),F.t,LV2.copy(F.n).multiplyScalar(fy)));
    m.position.copy(F.p).addScaledVector(F.b,pl).addScaledVector(F.n,fy>0?.1:-THICK-.1);scene.add(m);trackMeshes.push(m);}
}
function ligneFruit(sp,lt){ // un fruit, deux faces (même recette que `place` dans spawnPickups) — il rend LIGNE.don de nitro (× l'espacement du groupe : plus espacé, plus généreux)
  const g9=LIGNE.grp,fi=(g9&&Math.random()<.7)?g9.fi:fruitPick(),lv=fruitLeve(fi),don9=LIGNE.don*((g9&&g9.mult)||1);frameAt(sp,F);
  for(const face of [1,-1]){
    const m=mkFruit(fi);m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?lv:-(THICK+lv)); // petits (FRUIT_K) : on les sème partout sans gêner la vue
    if(face<0)LM4.makeBasis(LV1.copy(F.b).negate(),LV2.copy(F.n).negate(),F.t);else LM4.makeBasis(F.b,F.n,F.t);
    m.quaternion.setFromRotationMatrix(LM4);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:sp,lat:lt,face:face,nitro:true,fruit:fi,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face),ligne:true,don:don9});
  }
}
const LM4=new THREE.Matrix4(),LV1=new THREE.Vector3(),LV2=new THREE.Vector3();
/* un FRUIT-POUVOIR au bout de la file (2026-10-20) : même recette que ligneFruit, mais c'est un pouvoir (`pwrPrend` le prend), les deux faces */
function lignePower(sp,lt,kind){
  frameAt(sp,F);
  for(const face of [1,-1]){
    const m=mkPower(kind,face),lev9=m.userData.lev||2.1;
    m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?lev9:-(THICK+lev9));
    if(face<0)LM4.makeBasis(LV1.copy(F.b).negate(),LV2.copy(F.n).negate(),F.t);else LM4.makeBasis(F.b,F.n,F.t);
    m.quaternion.setFromRotationMatrix(LM4);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:sp,lat:lt,face:face,nitro:false,pow:kind,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)});
  }
}
function ligneTick(dt){ // chaque image de course : la file s'allonge devant la caisse, au rythme de SA vitesse
  if(!LIGNE.on||!running||gameOver)return;
  const b0=Math.max(30,Math.abs(vA)*SPD),mul=vitMult(),v0=b0*mul,H9=Math.max(4,(ROAD_HALF-3)*.62); // m de piste par seconde : la vraie avance de `s` = la vitesse PHYSIQUE × les multiplicateurs d'avance (NITROOO, VITESSE ×2 — MESURÉ : sans eux la file arrivait 1,5× trop serrée)
  /* la vitesse À L'ARRIVÉE sur l'objet, pas celle d'aujourd'hui : un départ lancé passe de 126 à 500 km/h en 12 s (MESURÉ) — espacée sur la
     vitesse du moment, la file arrivait tassée (un pad tous les 0,4 s, bloqués par les 1,5 s de recharge du pad) */
  /* ⚠ (audit DEBUGGING) l'accélération se dérive sur la vitesse PHYSIQUE, jamais sur l'avance multipliée : ramasser VITESSE doublait v0 en
     UNE image → ~9 000 m/s² estimés, la file posait 3 objets à 1 190 m l'un de l'autre (MESURÉ en VILLE 11). Plafond 40 m/s² (un départ
     lancé ~9, la rampe NITROOO ~15) ; les multiplicateurs s'appliquent APRÈS. */
  if(LIGNE.vP>0&&dt>0)LIGNE.acc+=(Math.min(40,(b0-LIGNE.vP)/dt)-LIGNE.acc)*Math.min(1,dt*2);LIGNE.vP=b0;
  const v=(b0+Math.max(0,LIGNE.acc)*LIGNE.voir*.7)*mul;
  if(LIGNE.prochS<s+60)LIGNE.prochS=s+60; // jamais derrière soi (portail, replacement)
  const hz=s+Math.max(220,v*LIGNE.voir);
  let n9=0;
  while(LIGNE.prochS<hz&&LIGNE.prochS<L-120&&n9<3){n9++; // au plus 3 par image (un départ lancé n'empile pas tout d'un coup)
    let s9=-1;
    for(let d=0;d<=160;d+=20){const q=LIGNE.prochS+d;if(q>=L-120)break;if(!ligneBloque(q,LIGNE.k)){s9=q;break;}}
    if(s9<0){LIGNE.prochS+=180;continue;}
    const lt=PADS_OFF?ligneMotif(ligneLat(s9,H9),H9):ligneLat(s9,H9); // (2026-10-21) l'ancien système : sur la corde, sans les groupes de Léo
    if(LIGNE.k){if(!(LVL.cur&&LVL.cur.piste==='banquise'))lignePad(s9,lt);}
    else if(PWR_LIGNE&&LIGNE.cnt>=LIGNE.npow){ // le BOUT D'UNE LONGUE FILE : un fruit-pouvoir (le 1er d'un débutant : l'aimant, sans le chercher)
      let kd='n';if(!LIGNE.prem&&pwrPremier()){kd='m';LIGNE.prem=true;}else kd=pwrTire(Math.random(),pwrPoids());
      lignePower(s9,kd==='m'&&LIGNE.prem&&LIGNE.cnt===LIGNE.npow?lt*.2:lt,kd);LIGNE.cnt=0;LIGNE.npow=14+((Math.random()*20)|0);
    }else{ligneFruit(s9,lt);LIGNE.cnt++;} // (2026-10-15) LE GLACIER : pas de pad d'or (ses fruits gardent leur cadence)
    LIGNE.pts.push({s:s9,lat:lt,k:LIGNE.k});LIGNE.n[LIGNE.k]++;if(LIGNE.pts.length>40)LIGNE.pts.shift();
    if(!PADS_OFF)LIGNE.k^=1; // (plus de plaques : toujours un fruit)
    LIGNE.prochS=s9+Math.max(PADS_OFF?12:40,v*LIGNE.dt*((PADS_OFF&&LIGNE.grp&&LIGNE.grp.mult)||1));
    if(PADS_OFF&&LIGNE.repos){LIGNE.repos=false;LIGNE.prochS+=Math.max(30,v*(1.2+Math.random()*1.4));} // un REPOS : un à deux secondes de route vide
  }
}
function frameAt(s,out){
  s=THREE.MathUtils.clamp(s,0,L-.01);
  const f=s/L*(NP-1),i=Math.floor(f),j=Math.min(i+1,NP-1),u=f-i;
  out.p.lerpVectors(pts[i],pts[j],u);
  out.t.lerpVectors(T[i],T[j],u).normalize();
  out.n.lerpVectors(Nn[i],Nn[j],u);
  out.n.addScaledVector(out.t,-out.n.dot(out.t)).normalize();
  out.b.crossVectors(out.n,out.t);
}
const F={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const padGeo=new THREE.PlaneGeometry(5.5,9);
/* (2026-09-26, passe perf) LES PLAQUES TURBO ne se redessinent plus à chaque image (8 tracés Canvas2D avec `shadowBlur` par image,
   renvoyés au GPU). (2026-09-26, vague 2 « L'ENCRE ET L'OR ») … et elles deviennent de L'OR. Elles tiraient leur couleur au hasard
   (bleu / blanc / rouge, sans aucun sens) et leurs chevrons étaient des traits flous (`shadowBlur`) de 64×128 agrandis au plus proche :
   des marches d'escalier baveuses, et 42 textures pré-dessinées (~1,8 Mo) pour faire défiler le motif. Désormais :
     · UNE texture 128×256 dessinée SUR LA GRILLE (des blocs de 4 px, zéro flou) : plaque à l'encre #1c0430, deux rails d'or qui la
       bordent (le LISERÉ de ce qui rapporte), chevrons d'or à arête claire et talon d'ombre, suivis de leur écho ;
     · le motif tombe juste sur 256 px (4 périodes) : `RepeatWrapping` + défilement par `map.offset.y` — une seule image, un seul
       envoi au GPU, jamais plus (−41 textures) ; mipmaps PEINTES + anisotropie : plus de chevrons qui grouillent au loin, et la
       plaque lointaine luit d'or au lieu de tourner au brun ;
     · UNE matière or PARTAGÉE par toutes les plaques (jamais libérée : son programme — MeshBasic + map, celui d'avant — reste chaud).
   Le turbo, c'est de l'argent qui accélère : il porte la couleur de l'argent. */
const PAD_FR=[],PAD_MATS=[]; // (vague 2) vestiges vides : plus d'images pré-dessinées ni de matière par plaque (voir PAD_MAT)
const padTex=(function(){
  const W=128,H=256;
  const dessine=function(fond,grille){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
    const R=(x,y,w,h,col)=>{c.fillStyle=col;for(const dy of [0,-H,H])c.fillRect(x,y+dy,w,h);}; // posé 3 fois : le motif se REPLIE sans couture
    R(0,0,W,H,fond);                                                                          // la plaque
    if(grille)for(let y=0;y<H;y+=8)R(16,y,96,4,grille);                                       // la grille de la plaque (un souffle, pas un motif)
    const OR='#fff27a',OR_C='#fffefa',OR_O='#d8a412'; // (2026-10-14, bords-route) l'arête des chevrons : blanc franc (blanc + or) // l'or CITRON en texture = l'or #ffd75e à l'écran, une fois passé l'ACES et le grade (même étalonnage que la pièce)
    for(const x of [4,116]){R(x,0,8,H,OR);R(x===4?x:x+6,0,2,H,OR_O);R(x===4?x+6:x,0,2,H,OR_C);} // les RAILS d'or : ombre dehors, lumière dedans
    for(let k=-1;k<=4;k++){const A=k*64+10;                                                   // 4 chevrons par tour de texture (période 64 px = 2,25 m)
      for(let cx=0;cx<11;cx++){const y=A+cx*2;
        for(const x of cx?[64+cx*4,60-cx*4]:[60,64]){ // (la colonne 0 : les deux blocs du sommet)
          R(x,y,4,14,OR);R(x,y,4,2,OR_C);R(x,y+12,4,2,OR_O);                               // le chevron : arête claire devant, talon d'ombre derrière
          R(x,y+20,4,6,OR_O);}}}                                                            // son ÉCHO, en or d'ombre
    return cv;};
  /* LES MIPMAPS SONT PEINTES À LA MAIN. Moyennée par la carte réduite, la plaque (un tiers d'or sur deux tiers d'encre) devenait au
     loin — vue rasante — un PAVÉ BRUN à peine plus clair que le bitume : on ne voyait plus la cible. Les deux premiers niveaux sont la
     plaque telle quelle ; à partir du 3e (la plaque fait moins de 32 pixels de large à l'écran) son fond passe à l'or sombre : de loin
     elle LUIT d'or, de près on lit ses chevrons sur l'encre. Le fondu entre les niveaux (trilinéaire) fait la transition, sans saut. */
  const pres=dessine('#2e2c29','#37352f'),loin=dessine('#9a6a0e',null),niv=[pres]; // (2026-10-14, bords-route) la plaque turbo sur BÉTON sombre (c'était l'encre violette)
  for(let w=W>>1,h=H>>1,k=1;w>=1||h>=1;w>>=1,h>>=1,k++){const cv=document.createElement('canvas');cv.width=Math.max(1,w);cv.height=Math.max(1,h);
    const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(k<2?niv[k-1]:(k===2?loin:niv[k-1]),0,0,cv.width,cv.height);niv.push(cv);
    if(cv.width===1&&cv.height===1)break;}
  const t=new THREE.CanvasTexture(pres);t.mipmaps=niv;t.generateMipmaps=false;t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter; // de près : les vrais pixels ; au loin : la plaque qui luit, stable
  t.anisotropy=Math.min(ALLEGE?2:4,renderer.capabilities.getMaxAnisotropy()); // la plaque se voit à plat, rasante
  return t;
})();
const PAD_MAT=new THREE.MeshBasicMaterial({map:padTex,color:new THREE.Color(1.45,1.45,1.45),polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}); // ×1,45 : la plaque ÉMET au-delà du blanc (le bloom la prend), elle reste d'or au loin au lieu d'un pavé brun // (2026-09-26) décalage de profondeur : le pad lointain ne clignote plus à travers le bitume
PAD_MAT.dispose=function(){}; // partagée par toutes les pistes : la piste suivante la reprend, MAT_SURSIS ne la jette jamais
function updatePadTex(t){ // les chevrons FILENT vers l'avant (6,7 m/s, le rythme d'avant) : on fait glisser la texture, on ne la redessine pas
  padTex.offset.y=1-((t*.742)%1);
}
updatePadTex(0);

// ---------- VOITURES & ÉCONOMIE ----------
// 15 caisses, UNE SILHOUETTE CHACUNE (2026-08-05) — l'ancien roster de 24 faisait sortir 10 caisses
// du même moule `rocket` : 20 paires au-dessus de 90 % de recouvrement. Mieux vaut 15 formes qu'on
// reconnaît que 24 variantes d'une seule. ⚠ toutes au-dessus de l'ex-reine
// (657 km/h) et de plus en plus extrêmes. Le skin = le palier visuel ; `desc` = la carte de déblocage.
const CARS=[
 // ---- LA GAMME (2026-08-05, ramenée à 6 le 2026-09-24) : UNE SILHOUETTE PAR CAISSE, point. -----
 // ⚠ RÈGLE FONDATRICE, mesurée puis gravée : `shape` est DÉCLARÉ ici, une valeur unique par
 // caisse, et le constructeur refuse de deviner. L'ancienne gamme de 24 tirait son gabarit d'une
 // échelle de niveaux (`lvl>=14?'rocket':…`) : 10 caisses partageaient `rocket` et 4 `gt`, ce qui
 // donnait 20 paires au-dessus de 90 % de recouvrement de silhouette et une pire paire à 99,0 %
 // (ANTIMATIÈRE × ÉCLIPSE VII — deux caisses séparées par une teinte). Voir `voitures.html`,
 // bouton DOUBLONS : c'est là qu'on vérifie qu'on n'a pas recréé le problème.
 // Chaque ligne a une RÉFÉRENCE réelle (ou assumée fantastique) et un trait qui se lit de loin.
 {name:'LA HONTE',        shape:'epave',   color:0x7a4a2b,accent:0x4d2e1a,maxKmh:190,accel:22,turn:2.4, h:.75,w:1.90,l:4.0,spoiler:0,
  desc:'Elle démarre par pitié. Fais des thunes et oublie-la vite.'},
 // ---- LES CINQ (2026-09-24) : la gamme repart de zéro. Verdict du user : « à part la honte, tout
 // est un peu fade ». Cinq voitures VRAIES, que l'argent a rendues célèbres, cinq silhouettes qui
 // n'ont rien en commun, cinq couleurs franches — modelées au kit low-poly (voir `lpKit`).
 // `l`/`w`/`h` = les cotes RÉELLES du modèle : le hors-tout de la caisse en briques les respecte,
 // parce que les flaques de lumière, les traînées et la plume s'y calent.
 {name:'ELDORADO',        shape:'eldorado',color:0xff6fae,accent:0xe8ebef,maxKmh:232,accel:26,turn:2.6, h:1.30,w:2.02,l:5.70,spoiler:0,rar:'rare', /* (2026-10-14) à 10 000 $, carRar l'aurait classée COMMUNE */
  desc:'Rose bonbon, ailerons de requin et une banquette pour trois avocats.'},
 {name:'LE CAÏD',         shape:'caid',    color:0xd2d5d9,accent:0x16171b,maxKmh:275,accel:31,turn:2.7, h:2.01,w:2.20,l:5.51,spoiler:0, /* (2026-10-19, Léo : « sans le toit, comme sur la photo exactement ») le pick-up blanc nacré de sa photo (avant : 0x7cb83f, le SUV 1,98 × 5,00) */
  desc:'Trois tonnes de cube. Personne ne t\'a jamais demandé de te pousser.'},
 {retire:1,name:'SA MAJESTÉ'},
 {name:'ROSSO 40',        shape:'rosso',   color:0xe8121c,accent:0x131417,maxKmh:420,accel:48,turn:3.05,h:1.12,w:1.98,l:4.36,spoiler:0,rar:'epique', /* (2026-10-22, Sacha : « tableau des voitures » ROSSO 40 épique à 400 000 $ : sans cette ligne le prix la ferait RARE) */
  desc:'Rouge course, aileron plateau. La caisse de rêve : 1,5 million, et chaque dollar se voit.'},
 {name:'POSTER 84',       shape:'poster',  color:0xffc414,accent:0x131417,maxKmh:480,accel:55,turn:3.15,h:1.07,w:2.00,l:4.14,spoiler:0,
  desc:'Elle était punaisée au mur de ta chambre. Maintenant, c\'est toi qui la conduis.'},
 // ---- LES CAISSES DE CONTRAT (2026-09-25) : elles ne s'achètent PAS — chacune est la récompense d'un
 // carnet de trois missions (voir `CARNETS`). Des silhouettes que tout le monde reconnaît de loin, sans
 // leur nom ni leur logo : la bulle, le combi, l'inox à portes papillon. Ajoutées EN FIN de gamme : les
 // index 0-5 des sauvegardes existantes ne bougent pas.
 {name:'LE SCARABÉE',     shape:'bulle',   color:0x93cfd6,accent:0xf3ead6,maxKmh:215,accel:24,turn:2.75,h:1.55,w:1.57,l:4.07,spoiler:0,rar:'commun', // (2026-10-18, Léo) COMMUNE (était RARE : contrat 1) ; (même jour, Léo, sur la planche) LA BULLE → LE SCARABÉE · (2026-10-18, RONDES) refaite sur le plan coté de la 1962 : cotes réelles, le bleu de l'annonce
  desc:'Ronde comme un sou neuf. Tout le monde lui sourit, même la police.'},
 {name:'LE COMBI',        shape:'combi',   color:0x86c9b1,accent:0xf4ecd8,maxKmh:245,accel:27,turn:2.55,h:1.94,w:1.72,l:4.28,spoiler:0,rar:'commun', // (2026-10-18, Léo : « il est rare actuellement : le passer en commune ») (2026-10-18, BOÎTES) refait au plan coté, façon Fillmore — `yeux:1` = les yeux dans le pare-brise
  desc:'Des fleurs sur la tôle, la paix sur le nez, et 45 chevaux qui font de leur mieux.'},
 {name:'LA DOLORÈS',      shape:'dolores', color:0xc3c7cc,accent:0x141518,maxKmh:360,accel:40,turn:2.9, h:1.14,w:1.86,l:4.22,spoiler:0,
  desc:'Inox brossé, portes papillon. À 88 à l\'heure elle remonte le temps, paraît-il. Toi, tu vas plus vite.'},
 // ---- LES CAISSES PREMIUM (2026-09-25) : la gamme des 15 retrouvée, en BOUTIQUE (vrai argent). Hors du garage tant
 // qu'elles ne sont pas achetées (voir `garageListe`). Fiches reprises de la branche `appstore-backlog`, emojis retirés.
 {name:'CHAT POP-TART',   shape:'poptart', color:0xf6b98a,accent:0xf78fb8,maxKmh:560,accel:64,turn:3.2, h:1.35,w:1.88,l:2.85,spoiler:0, // (2026-10-09) encore un peu plus grande : ×,95 (h 1,22 · w 1,7 · l 2,58 avant) · plus volumineuse : ×,86, ailes +12 cm (h 1,14 · w 1,5 · l 2,4 avant) · la mini de rallye : plus basse, plus large (h 1,2 · w 1,36 avant)
  // (2026-10-09, Léo, fiche de la salle blanche) « plus petite » : tout le chat ×NY_K (,8) — h 1,5 · w 1,7 · l 3,0 avant
  // (2026-10-06) en voxels : 1,7 × 3 m, oreilles à 1,5 m — plus de bandes néon (`glow`) : elles barraient les murs noirs
  fx:{jet:0xff64d2,core:0xffd8f2,trail:[1.5,.35,1.1],light:0xff5ec8}, // (2026-10-07) son arc-en-ciel EN FEU DE PIXELS (voir ARC_*) + ses pixels qui scintillent (NY_PIX), à la nitro et en vol — branché par NYAN.on
  desc:'Une pâtisserie industrielle avec une tête de chat et quatre roulettes. Personne n\'a demandé pourquoi. Tout le monde a demandé comment.'},
 {retire:1,name:'REQUIN'}, /* (2026-10-21, Sacha : « suprime la voiture shark dans la boutique ») RETIRÉ : remplacé en boutique par LE SQUALE (le requin de Léo) ; sa ligne reste (index de sauvegarde) */
 {retire:1,name:'COMÈTE',          shape:'proto',   color:0x0a0a12,accent:0xffd75e,maxKmh:657,accel:75,turn:3.25,h:.36,w:2.08,l:5.05,spoiler:1,glow:0xffffff,rocket:1,
  desc:'Coin furtif, bulle de verre, dérive dorsale. La reine du ciel, et elle le sait. Personne ne l\'a jamais vue de face.'},
 {retire:1,name:'FORMULE OR'},
 {retire:1,name:'LE MANS 24'},
 {retire:1,name:'EL PATRON'},
 {rar:'epique',name:'ACIDE',           shape:'tuner',   color:0x5cff1e,accent:0x123a08,maxKmh:520,accel:60,turn:3.18,h:.62,w:1.88,l:4.1,spoiler:0,glow:0x8dff2a,
  fx:{jet:0x7cff28,core:0xe8ffb4,trail:[.52,1.55,.10],light:0x6fe81e},
  desc:'Compacte japonaise passée au bain d\'acide : capot vitré sur le bloc, aileron de table à repasser, échappement qui crache vert.'},
/* ===== LES FICHES DES 50 — DÉBUT ===== */
 /* (2026-10-02, Sacha, capture du garage : « supprimer ces 6 voitures du jeu, elles sont pas intéressantes ») SIX COMMUNES RETIRÉES —
    la pizza, le monospace, le break suédois, la boule, le glacier, le tout-terrain soviétique : `retire:1`. Elles ne sont plus NULLE
    PART pour le joueur (garage, compteurs des familles, objectif, pastille « à ta portée », équipement — voir carRetiree). ⚠ Leur
    LIGNE reste : la sauvegarde désigne les caisses par leur INDEX (`equipped`, `owned`) — ôter six lignes ici décalerait toutes les
    suivantes et donnerait à chacun la caisse d'un autre. Qui en avait acheté une est remboursé au chargement (voir `san`).
    (2026-10-18) Toutes les caisses retirées sont RÉDUITES à `{retire:1,name:'…'}` : plus de cotes, de couleurs ni de punchline — aucune boucle
    ne lit la fiche d'une retirée (carRetiree d'abord). Le NOM reste : la mission qui la donne et le message de remboursement l'écrivent. */
 {retire:1,name:'LA POSTIÈRE'},
 {retire:1,name:'LA DEUCHE'},
 {retire:1,name:'LE TAXI JAUNE'},
 {name:'LA PIZZA EXPRESS',color:0xf4f1ea,accent:0xd8261e,maxKmh:190,accel:21,turn:2.9,h:1.45,w:1.5,l:3.4,spoiler:0,shape:'b_pizza',rar:'legendaire',
  desc:'30 minutes chrono ou la pizza est offerte. Spoiler : elle n\'a jamais été offerte.'},
 {retire:1,name:'LE MONOSPACE'},
 {retire:1,name:'LE BREAK SUÉDOIS'},
 {retire:1,name:'LA BOULE'},
 {retire:1,name:'LE GLACIER'},
 {retire:1,name:'LE TOUT-TERRAIN SOVIÉTIQUE'},
 {retire:1,name:'LE GRILLE-PAIN'},
 {name:'LE CORBILLARD',color:0x0d0d10,accent:0xe9ecf0,maxKmh:200,accel:22,turn:2.4,h:1.55,w:2,l:6,spoiler:0,shape:'d_corbillard',rar:'rare',
  desc:'Six mètres de classe funèbre. Ceux qu\'il double finissent à l\'arrière, c\'est la tradition.'},
 {retire:1,name:'LA SANS-PERMIS'},
 {retire:1,name:'L\'AUTO-ÉCOLE'},
 {retire:1,name:'LE PICK-UP DU FERMIER'},
 {retire:1,name:'L\'AMBASSADEUR'},
 {name:'LE CHARGEUR',color:0x050608,accent:0x121316,maxKmh:290,accel:32,turn:2.6,h:1.48,w:1.9,l:5.1,spoiler:0,shape:'a_chargeur',rar:'rare',
  desc:'Quatre portes, parce qu\'il faut bien emmener quelqu\'un pour voir la tête des autres.'},
 {name:'LE DÉFIEUR',color:0xffd000,accent:0x121212,maxKmh:310,accel:34,turn:2.5,h:1.45,w:1.92,l:5.02,spoiler:0,shape:'a_defieur',rar:'rare', // (2026-10-17, Sacha : « la voiture de Transformers, la bonne couleur de base ») orange 0xff7a14 → JAUNE RALLYE, voir SHAPES.a_defieur
  desc:'Né en 1970, jamais sorti de la puberté. Il te défie au feu rouge, puis au suivant, puis au suivant.'},
 {name:'LA BAVAROISE',color:0xf2f2f0,accent:0x3a2a8c,maxKmh:280,accel:31,turn:2.9,h:1.37,w:1.68,l:4.35,spoiler:0,shape:'b_bavaroise',rar:'rare',
  desc:'Homologuée pour la route, élevée sur circuit. Elle perd patience avant toi.'},
 {retire:1,name:'LA SUÉDOISE TURBO'},
 {retire:1,name:'LE QUATTRO'},
 {name:'LA SILENCIEUSE',color:0xeef0f2,accent:0x121418,maxKmh:290,accel:32,turn:2.7,h:1.45,w:1.96,l:4.97,spoiler:0,shape:'c_silencieuse',rar:'rare',
  desc:'Zéro bruit, zéro goutte d’essence, zéro excuse : ils ne t’entendent même pas les doubler.'},
 {retire:1,name:'LE TRIDENT'},
 {retire:1,name:'LA HUIT'},
 {name:'LE SAMOURAÏ',color:0x3b2c4e,accent:0x16181c,maxKmh:300,accel:33,turn:2.9,h:1.36,w:1.79,l:4.6,spoiler:0,shape:'d_samourai',rar:'rare',
  desc:'Quatre feux ronds, un aileron, zéro pitié. Tu le vois une fois : dans ton rétro, en train de partir.'},
 {name:'LA VETTE',color:0xd01a22,accent:0x141414,maxKmh:290,accel:32,turn:2.8,h:1.18,w:1.8,l:4.48,spoiler:0,shape:'d_vette',rar:'rare',
  desc:'Phares cachés, V8 pas caché du tout. Elle se lève pour voir la route, puis elle la mange.'},
 {retire:1,name:'LE CHÂTELAIN'},
 {name:'LA GRANDE ANGLAISE',color:0x1a3d2a,accent:0xe9ecf0,maxKmh:320,accel:35,turn:2.6,h:1.4,w:1.94,l:4.8,spoiler:0,shape:'e_anglaise',rar:'rare',ordre:1e8, /* (10/10, Léo, salle blanche : la DERNIÈRE des RARES, après LA ZED — son prix ne bouge pas) */
  desc:'Deux tonnes et demie de cuir, de noyer et de W12. Elle ne dépasse pas : elle congédie.'},
 {name:'LE CHARGEUR 69',color:0x0e0e10,accent:0xe9ecf0,maxKmh:360,accel:40,turn:2.55,h:1.35,w:1.95,l:5.28,spoiler:0,shape:'a_chargeur69',rar:'rare',
  desc:'Phares cachés, intentions aussi. Quand la calandre s\'ouvre dans ton rétro, c\'est déjà trop tard.'},
 {retire:1,name:'L\'ÉTALON'},
 {name:'LA QUEUE DE CANARD',color:0xf2efe6,accent:0x1f5fd8,maxKmh:340,accel:37,turn:3,h:1.32,w:1.65,l:4.15,spoiler:0,shape:'b_canard',rar:'epique', // (2026-10-18, Léo : « mets-la en Epic ») ÉPIQUE (était RARE)
  desc:'Le moteur est derrière, le becquet aussi. Toi, tu seras devant — c\'est tout ce qui compte.'},
 // (2026-10-18, Léo : « enlève la daytona du main ») RETIRÉE : la ligne reste (les index de sauvegarde ne bougent pas), qui l'avait
 // achetée est remboursé (550 000 $) et repart en LA HONTE s'il roulait avec (voir LES CAISSES RETIRÉES dans SAVE).
 {retire:1,name:'LA DAYTONA',color:0xd01a1a,accent:0x121316,maxKmh:360,accel:40,turn:2.8,h:1.25,w:1.76,l:4.42,spoiler:0,shape:'b_daytona',rar:'epique',
  desc:'Deux mètres de capot, douze cylindres dessous. Le reste de la voiture est juste là pour le suivre.'},
 {name:'LA TAURINE',color:0xff8a14,accent:0x121212,maxKmh:370,accel:41,turn:2.9,h:1.05,w:1.78,l:4.36,spoiler:0,shape:'c_taurine',rar:'epique',
  desc:'Elle a des cils. Et un V12 juste derrière ta nuque. Elle te fait les yeux doux, pas de cadeaux.'},
 {name:'LA STRATOS',color:0xf4f4f0,accent:0x1ea050,maxKmh:340,accel:38,turn:3.2,h:1.11,w:1.75,l:3.71,spoiler:0,shape:'c_stratos',rar:'epique',
  desc:'Trois titres mondiaux, un mètre onze de haut. La visière, c’est pour voir les autres dans le rétro.'},
 {name:'LA NOCTAMBULE',color:0xf4f4f0,accent:0x3b2a8c,maxKmh:360,accel:40,turn:2.9,h:1.37,w:1.73,l:4.63,spoiler:0,shape:'d_batmobile',rar:'rare',
  desc:'Un aileron si grand qu\'on l\'a interdite sur route. Toi, tu roules dans le ciel : personne ne dira rien.'},
 {retire:1,name:'LA PAGODE'},
 {retire:1,name:'LA DÉESSE'},
 {name:'L\'AIGLE DE FEU',color:0x0f0f11,accent:0xd9a520,maxKmh:340,accel:38,turn:2.6,h:1.25,w:1.85,l:5.1,spoiler:0,shape:'e_aigle',rar:'rare', // (2026-10-09, Léo, fiche de la salle blanche) ÉPIQUE → RARE
  desc:'Un oiseau d\'or sur le capot, un shérif dans le rétro. Le shérif n\'a jamais rattrapé l\'oiseau.'},
 {retire:1,name:'LA ZED'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 {name:'LA FÉLINE',color:0xeee3c6,accent:0xe9ecf0,maxKmh:320,accel:36,turn:2.8,h:1.22,w:1.66,l:4.45,spoiler:0,shape:'e_feline',rar:'legendaire',
  desc:'Un capot si long qu\'il arrive au virage avant toi. Élue plus belle du monde, et elle le sait.'},
 {name:'LA RAIE',color:0xc4161c,accent:0x131417,maxKmh:360,accel:40,turn:2.7,h:1.21,w:1.75,l:4.64,spoiler:0,shape:'e_raie',rar:'epique', // (2026-10-18, Sacha) REMISE dans le jeu (retirée le 14/10) : épique à 2,5 M, comme avant le 6/10
  desc:'Une taille de guêpe, des hanches de starlette et un V8 sous le capot. Hollywood a pris la route.'},
 {name:'L\'ÉTERNELLE',color:0x1d4fd8,accent:0x121418,maxKmh:620,accel:69,turn:3,h:1.21,w:2.04,l:4.54,spoiler:0,shape:'a_eternelle',rar:'legendaire',
  desc:'Seize cylindres, quatre turbos, zéro remords. Le temps, lui, attend qu\'elle passe.'},
 {name:'LE TRÔNE CENTRAL',color:0xff7a10,accent:0x121316,maxKmh:560,accel:62,turn:3,h:1.14,w:1.82,l:4.29,spoiler:0,shape:'b_trone',rar:'legendaire',
  desc:'Un seul siège, au milieu. Les passagers regardent de côté : ils ne sont pas là pour conduire.'},
 {name:'LE SPECTRE',color:0x1a1d22,accent:0x5cff1e,maxKmh:560,accel:62,turn:3,h:1.13,w:2,l:4.5,spoiler:0,shape:'c_spectre',rar:'epique',
  desc:'Tu l’as vu passer ? Non. Personne ne l’a jamais vu passer. D’où le nom.'},
 {name:'LE BLINDÉ NOIR',color:0x17181b,accent:0x4a4e56,maxKmh:520,accel:58,turn:2.6,h:1.6,w:2.6,l:4.6,spoiler:0,shape:'d_chevalier',rar:'legendaire',
  desc:'Pas de capot, pas de pitié, pas de feu rouge. Quand il passe, la rue se range toute seule.'},
 {name:'LE MUR DU SON',color:0xf4f4f0,accent:0xd9a520,maxKmh:620,accel:68,turn:2.4,h:1.4,w:2.2,l:6,spoiler:0,shape:'e_murduson',rar:'legendaire',
  desc:'Deux réacteurs de chasseur, zéro complexe. Le bang que tu entends, c\'est elle qui passe.'},
 {name:'LE DRAGON D\'OR',color:0xd9a520,accent:0x121316,maxKmh:650,accel:72,turn:2.9,h:1.1,w:2.1,l:4.7,spoiler:0,shape:'e_dragon',rar:'legendaire',
  desc:'Il dormait sur un tas d\'or. Maintenant il roule dessus, et il crache du feu à chaque rapport.'},
 {name:'LE MASTODONTE',color:0x1463ff,accent:0xff7a14,maxKmh:280,accel:31,turn:2.4,h:3,w:2.6,l:4.8,spoiler:0,shape:'a_mastodonte',rar:'defi',
  desc:'Il ne double personne : il passe dessus. Les dos d\'âne, c\'est lui qui les fabrique.'},
 {retire:1,name:'LA GROUPE B'}, /* (2026-10-18 soir, Sacha : « enlève la groupe B ») RETIRÉE : sa ligne reste (index de sauvegarde), qui l'avait est remboursé par `san` ; son gabarit b_groupeb reste dans SHAPES */
 {name:'LE HOT ROD',color:0xc8141c,accent:0xe9ecf0,maxKmh:380,accel:42,turn:2.5,h:1.4,w:1.7,l:3.9,spoiler:0,shape:'c_hotrod',rar:'defi',
  desc:'Un capot ? Pour cacher un compresseur pareil ? Tu rigoles. Même les flammes sont d’époque.'},
 {retire:1,name:'LA PUCE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
/* ===== LES FICHES DES 50 — FIN ===== */
 // (2026-09-27) LA CAISSE-NUAGE — la récompense de la CAMPAGNE NUAGES : un petit cumulus monté comme une vraie voiture (châssis, roues,
 // feux sobres), taillé dans la même ouate que le ciel. Elle ne s'achète pas : on la CHASSE au niveau 10 (voir fantomeTick) et elle
 // devient à toi quand tu tiens son sillage une seconde. Ajoutée APRÈS le bloc généré des 50 : aucun index existant ne bouge.
 {retire:1,name:'LA CAISSE-NUAGE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-09-27) LE LINGOT — la récompense de la CAMPAGNE VILLE : un lingot d'or de 1 kg (poinçon 999,9) monté sur roues. Il ne s'achète
 // pas : on le GAGNE en battant le banquier au portail du niveau 10 (voir banquierTick). Ajouté en dernier : aucun index ne bouge.
 {retire:1,name:'LE LINGOT'}, /* (2026-10-18 soir, Sacha : « enlève la gold bar ») RETIRÉ : sa ligne reste (index de sauvegarde), qui l'avait est remboursé par `san` ; son gabarit `lingot` reste dans SHAPES */
 // (2026-10-02) L'ORIGAMI — Sacha, photo du pick-up d'inox : « mets cette voiture dans le jeu, fais-la exceptionnellement belle et parfaite ».
 // Le pick-up plié dans une feuille d'acier, sans son nom ni son logo (comme toute la gamme). Cotes réelles : 5,68 × 2,03 × 1,79 m.
 // Ajoutée EN DERNIER : aucun index de sauvegarde ne bouge. Son sillage est un courant froid (elle est électrique).
 {name:'L\'ORIGAMI',shape:'origami',color:0xc9cdd2,accent:0x16181c,maxKmh:380,accel:42,turn:2.6,h:1.79,w:2.03,l:5.68,spoiler:0,rar:'epique',
  fx:{jet:0xa8dcff,core:0xffffff,trail:[.62,1.08,1.5],light:0x9fd4ff},
  desc:'Une feuille d\'inox, sept plis, zéro courbe. Vitres incassables, paraît-il : on a essayé avec une boule, on n\'en parle plus.'},
 // (2026-10-06) ATCHOUM — Léo : « la voiture tuning McQueen orange qui crache du feu et éternue des flammes, elle ressemble un peu à la
 // cabossée ». Un stock-car de piste ovale, tuné et cabossé (voir SHAPES.atchoum) ; son feu : ATCH / atchTick. Ajoutée EN DERNIER.
 {name:'ATCHOUM',shape:'atchoum',color:0xff9020,accent:0x141417,maxKmh:300,accel:34,turn:2.7,h:1.24,w:1.95,l:4.32,spoiler:0,rar:'epique', // (2026-10-09, Léo, fiche de la salle blanche) RARE → ÉPIQUE
  fx:{jet:0xff7a24,core:0xffe08a,trail:[1.5,.62,.18],light:0xff8030},
  desc:'Elle a pris froid au dernier tour : depuis, elle éternue du feu. Ne reste jamais devant elle.'},
 // (2026-10-08) LE SQUALE — Léo : la voiture au sourire de requin de son sketch du garage, bleu clair, sportive, carrée aux angles
 // arrondis, les phares en yeux (voir SHAPES.squale). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {name:'SQUALE',shape:'squale',color:0x5e666d,accent:0x2a3036,maxKmh:340,accel:40,turn:2.7,h:1.66,w:2.52,l:4.5,spoiler:0,rar:'legendaire', // (2026-10-21, Sacha) ÉPIQUE → LÉGENDAIRE : elle est en boutique payante, où toutes les caisses le sont (carRar lit cette fiche avant le prix) — (2026-10-09, Léo, fiche de la salle blanche) RARE → ÉPIQUE
  fx:{jet:0xbfe4ff,core:0xffffff,trail:[.75,.85,.95],light:0xcfe8ff},
  desc:'Toujours le sourire. Surtout quand elle te double.'},
 // (2026-10-09, Léo : « fais-en une hyper abstraite mais travaillée, concept, ajoute-la à la liste ») L'ABSTRAITE (voir SHAPES.abstraite). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {retire:1,name:'L\'ABSTRAITE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-10-10, Léo : « une nouvelle abstraite, en glace, genre iceberg, stylisée, dynamique ») L'ICEBERG (voir SHAPES.iceberg). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {name:'L\'ICEBERG',shape:'iceberg',color:0x52c8f0,accent:0xf4faff,maxKmh:415,accel:49,turn:3.1,h:1.15,w:2.1,l:4.75,spoiler:0,rar:'epique',
  fx:{jet:0x9fe8ff,core:0xffffff,trail:[.75,1.15,1.45],light:0x8fe0ff},
  desc:'Un iceberg fendu en trois : deux blocs de glace sur les roues, une bulle au milieu pour un seul pilote. Le vent passe entre.'},
 // (2026-10-10, Léo : « une voiture flamme — dur, vas-y dur ; une autre technique ; une forme de voiture originale, associée au feu ») LA FOURNAISE (voir SHAPES.fournaise). Ajoutée EN DERNIER.
 {retire:1,name:'LA FOURNAISE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-10-10, Léo : « une abstraite type EAU — l'élément, pas une bouteille ; quelque chose de vraiment méchant ») LA DÉFERLANTE. RETIRÉE le 2026-10-15 (Sacha : « elle ne respecte pas les règles du low-poly », comme LA MERCURE) : son gabarit est effacé, la ligne reste pour les index.
 {retire:1,name:'LA DÉFERLANTE'},
 // (2026-10-11, Léo, « retoucheur de voitures » : la planche générée, « génère la mercure », « génère-la en 3D dans mon jeu ») LA MERCURE
 // : l'hypercar en mercure liquide. RETIRÉE le 2026-10-15 (Sacha : hors des règles du low-poly) : son gabarit est effacé, la ligne reste pour les index.
 {retire:1,name:'LA MERCURE'},
 // (2026-10-14, Léo : « fais une voiture tête de doge » · « dans le même esprit que la nyan cat ») LE DOGE (voir SHAPES.doge) : le mème du
 // shiba en voxels, regard en coin, queue en tire-bouchon, et les phrases du mème qui surgissent autour de lui. Ajoutée EN DERNIER.
 {name:'LE DOGE',shape:'doge',color:0xd99545,accent:0xf6e6c6,maxKmh:440,accel:53,turn:3.1,h:2.0,w:2.0,l:2.3,spoiler:0,rar:'epique',
  fx:{jet:0xffc83a,core:0xfff2c0,trail:[1.5,1.1,.3],light:0xffb43a,wow:1}, // sa traînée : les phrases du mème (voir LA TRAÎNÉE WOW)
  desc:'Wow. Très tête. Beaucoup roues. Il te regarde de côté, et il a raison.'},
 // (2026-10-16, Léo : « fais une belle Porsche Cayenne rose Barbie », puis « un rose plus pâle, vraiment Cayenne ») LA POUPÉE (voir SHAPES.poupee) :
 // le grand SUV de luxe allemand, en rose poupée pâle. Pas de marque (ni le nom, ni le blason) : un petit cœur à la place. Ajoutée EN DERNIER.
 // (2026-10-17, Léo : « enlève la barbie » → « du jeu ») elle avait été RETIRÉE, et remboursée (4,2 M$) à qui l'avait achetée ; (2026-10-18, Sacha) la
 // voilà REMISE dans le jeu : les remboursements déjà versés restent acquis, on peut la racheter 4,2 M$.
 // (2026-10-18) RETIRÉE À NOUVEAU : Sacha l'avait remise dans le jeu (allègement, 20cda983) ; Léo : « on l'enlève ». Qui l'avait achetée est
 // remboursé (4,2 M$) et repart en LA HONTE s'il roulait avec (voir LES CAISSES RETIRÉES dans SAVE).
 {retire:1,name:'LA POUPÉE',shape:'poupee',color:0xf49bcb,accent:0xfdf0f6,maxKmh:445,accel:54,turn:3.1,h:1.7,w:2.0,l:4.93,spoiler:0,rar:'epique',
  fx:{jet:0xff5cb0,core:0xffe2f1,trail:[1.5,.5,1.05],light:0xff5cb0},
  desc:'Rose poupée, cuir crème, 650 chevaux. Elle se gare en double file, et c\'est la file qui s\'excuse.'},
 // (2026-10-16, Léo : « Taycan 4S » ; puis « trop style jouet, mimétisme » → « blanche, laquée comme une vraie, lissée, tous les traits
 // du plan », nom « la perle ») LA PERLE (voir SHAPES.perle) : la berline électrique, BLANC LAQUÉ, refaite sur un plan coté. Elle
 // remplace L'ONYX (noire). Pas de marque (ni le nom, ni le blason). Électrique : pas de pots, deux fentes bleues dans le diffuseur.
 {name:'LA PERLE',shape:'perle',color:0xf3f3f1,accent:0xd31f2a,maxKmh:450,accel:56,turn:3.2,h:1.38,w:1.97,l:4.96,spoiler:0,rar:'epique',
  fx:{jet:0x6fd6ff,core:0xe8fbff,trail:[.3,1.0,1.5],light:0x46c8ff},
  desc:'Blanc laqué, zéro bruit, 571 chevaux. Elle passe sans un son, et tout le monde se retourne quand même.'},
 /* ===== LES NOUVELLES VOITURES (2026-10-18, Léo : « actuellement la seule commune du jeu est LA HONTE, ajoute… ») — HUIT PLACES RÉSERVÉES
    (index 79-86), CACHÉES (`retire:1`) jusqu'à ce que la discussion qui modèle la caisse la livre : elle remplace SA ligne (nom, gabarit,
    fiche) et retire `retire:1`. Les commentaires « · » entre les places sont là pour que trois discussions en parallèle fusionnent sans conflit.
    ⚠ NE PAS prendre ces index pour une autre caisse : la suivante est la 87. ===== */
 /* · */
 /* · */
 /* · */
 {name:'LA CABOSSÉE',shape:'simpson',color:0xd090d0,accent:0x4b474f,maxKmh:205,accel:23,turn:2.5,h:1.56,w:1.84,l:4.95,spoiler:0,rar:'commun', // 79 — discussion BOITES : la berline rose des Simpson, telle que dans la série (SHAPES.simpson)
  desc:'Rose bonbon, l\'aile avant gauche froissée depuis toujours, l\'antenne en zigzag. Elle démarre une fois sur deux, mais elle démarre.'},
 /* · */
 /* · */
 /* · */
 {name:'LA DOLCE VITA',shape:'cinq',color:0x8eb2df,accent:0xf3f1ea,maxKmh:200,accel:22,turn:2.9,h:1.50,w:1.63,l:3.57,spoiler:0,rar:'commun', // 80 — discussion RONDES : la 500 (2007) en finition « 1957 » de la photo de Léo — bleu ciel, toit blanc, rétros blancs, jantes à cercle crème (SHAPES.cinq, sur le plan coté)
  desc:'Toit blanc, robe céleste, moustache chromée. Elle se gare dans un mouchoir de poche, et elle repart avec le mouchoir.'},
 /* · */
 /* · */
 /* · */
 {name:'LA FIDÈLE',shape:'corolla',color:0x9fa3a9,accent:0x17181b,maxKmh:215,accel:24,turn:2.7,h:1.44,w:1.78,l:4.63,spoiler:0,rar:'commun', // 81 — discussion JAPONAISES : la berline compacte de 2019 (la ligne de la Toyota Corolla E210), argent (SHAPES.corolla)
  desc:'La voiture la plus vendue de la planète. Elle ne tombe jamais en panne, ce qui est presque suspect.'},
 /* · */
 /* · */
 /* · */
 {name:'LE BAROUDEUR',shape:'wrangler',color:0x464950,accent:0x141414,maxKmh:210,accel:23,turn:2.4,h:1.85,w:1.89,l:4.59,spoiler:0,rar:'commun', // 82 — discussion BOITES : Jeep Wrangler JL 4 portes (2018), relevée sur son élévation (SHAPES.wrangler)
  desc:'Sept fentes, quatre roues motrices, zéro route nécessaire. Il ne contourne pas les obstacles : il monte dessus.'},
 /* · */
 /* · */
 /* · */
 {name:'LA CERISE',shape:'mx5na',color:0xc8151d,accent:0x141416,maxKmh:225,accel:26,turn:3,h:1.23,w:1.68,l:3.97,spoiler:0,rar:'commun', // 83 — discussion JAPONAISES : le roadster d'Hiroshima de 1989 (la ligne de la Mazda MX-5 NA), rouge classique, capote repliée, PHARES ESCAMOTABLES qui se lèvent (SHAPES.mx5na, `MX5PH`)
  desc:'Elle ouvre les yeux à chaque coup de nitro. Une tonne, cent quinze chevaux, et le plus grand sourire du parking.'},
 /* · */
 /* · */
 /* · */
 {name:'LE ROUGE-GORGE',shape:'robin',color:0x2289dc,accent:0x1a1a1d,maxKmh:230,accel:26,turn:2.6,h:1.35,w:1.42,l:3.37,spoiler:0,rar:'rare', // 84 — discussion RONDES : la Reliant Robin Mk1 (1973-81), trois roues, la roue AVANT seule au milieu (SHAPES.robin, `w1F`)
  desc:'Trois roues, de la fibre de verre et une confiance aveugle. Dans les virages, elle penche ; toi, tu pries.'},
 /* · */
 /* · */
 /* · */
 {name:'LA LAME',shape:'mx5rf',color:0x868b92,accent:0x141416,maxKmh:275,accel:31,turn:3,h:1.24,w:1.73,l:3.92,spoiler:0,rar:'rare', // 85 — discussion JAPONAISES : le roadster d'Hiroshima en targa « fastback » (la ligne de la Mazda MX-5 RF, 2016), argent, toit fermé : ses deux arceaux et la lunette au fond du tunnel (SHAPES.mx5rf)
  desc:'Le même petit roadster, avec un toit qui se range en treize secondes. Il ne pleut jamais assez vite pour la rattraper.'},
 /* · */
 /* · */
 /* · */
 {retire:1,name:'LE TOFU'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 /* · */
 /* · */
 /* · */
 {name:'LA BÊTE',shape:'pikes',color:0xf1f2f4,accent:0x1a2240,maxKmh:380,accel:46,turn:3.2,h:1.30,w:2.0,l:4.5,spoiler:0,rar:'epique', // 87 — discussion JAPONAISES : la bête de course de côte de 2013 (la ligne de la Peugeot 208 T16 Pikes Peak), livrée « un peu boisson énergisante » sans logo (SHAPES.pikes)
  desc:'875 chevaux pour 875 kilos, et un aileron plus large qu\'un canapé. Elle a avalé la montagne en huit minutes : le sommet ne s\'en est jamais remis.'},
 /* · */
 /* · */
 /* · */
 {name:'LA ZAGAIE',shape:'zagato',color:0xc7753c,accent:0x2a2c31,maxKmh:500,accel:58,turn:3.1,h:1.17,w:1.93,l:4.22,spoiler:0,rar:'epique', // 88 — (2026-10-22, Léo : « zagato imite exactement la forme de la voiture orange ») la 5-95 de Zagato (2014, un exemplaire) : gueule creuse, vitrage noir qui s'enroule, nacelle de toit, queue coupée net, cuivre mat (SHAPES.zagato)
  desc:'Une pièce unique, taillée comme une lance : la gueule grande ouverte, le toit noir qui s\'enroule, la queue coupée net.'},
 /* · */
 /* · */
 /* · */
 {name:'LE LOUP',shape:'countach',color:0xb4b9c2,accent:0x2a2c31,maxKmh:500,accel:58,turn:3.0,h:1.07,w:2.0,l:4.46,spoiler:0,rar:'legendaire', // 89 — (2026-10-22, Léo : « genere la blanche ressemblance 11/10 ») la Countach blanche du film, l'ÉPAVE : aile avant gauche écrasée et son phare entrouvert, phare droit arraché, pare-chocs déchiré et sa lame basse qui pend, portière et quartiers froissés, portes à ciseaux (SHAPES.countach ; `?epave=0` : la Countach intacte)
  desc:'Blanche, basse, taillée à la hache, et passée sous un camion. Les portes se lèvent encore.'},
 /* · */
 /* · */
 /* · */
 {retire:1,name:'NOUVELLE 90',shape:'epave',rar:'epique', // 90 — RÉSERVÉE, LIBRE (22/10 : LE LOUP a pris la 89) — la prochaine caisse la prend
  desc:'(place réservée)'},
];
// ---- VALEUR D'UNE PIÈCE — UNE ENTRÉE PAR PALIER MOTEUR (30) ---------------------------------
// ⚠ Cette table est indexée par `engTier` depuis que les PIÈCES portent la progression, mais elle
// avait gardé les 24 entrées taillées pour les 24 VOITURES : avec 30 paliers elle saturait sur les
// six derniers, et surtout ses valeurs hautes (jusqu'à 15 milliards) étaient calibrées pour un
// palier de VOITURE, pas de moteur — les 10 anciens paliers n'en touchaient que les 10 premières
// cases (10 → 40 000). La reprendre telle quelle aurait multiplié la valeur d'une pièce par 375.
// RECALAGE À EFFORT ÉGAL : le palier 18 (731 pièces) vaut 39 000, soit ce que valait l'ancien
// dernier palier (760 pièces → 40 000). Ce qui est en dessous est inchangé à effort comparable ;
// ce qui est au-dessus prolonge la rampe. Série 1-1,6-2,5-4-6,2 par décade (ratio ×1,585,
// 5 marches par décade) : des nombres qui se lisent, sur 6 décades.
/* ⚠ ÉCONOMIE v4 — ALIGNÉE SUR LE PRIX DES CAISSES (2026-09-26, user : « après un bon score j'ai gagné trop d'argent, équilibrage
   à faire pour rester aligné sur la valeur des voitures »). Mesuré sur sa capture : une grande partie (palier moteur 30, niveau 6,
   119 figures) versait 401 MILLIARDS — la pièce valait ×1,585 par palier (6,2 M au palier 30) alors que la caisse la plus chère
   coûte 2,5 M. Désormais la pièce monte DOUCEMENT (×1,06 par palier : 3 → 16 $). Une partie de débutant rapporte ~1-2 k (une
   COMMUNE en une à trois parties), une très grande partie ~1 M (une ÉPIQUE en deux ou trois) — les 16 k des rares se méritent. */
const DENOMS=[3,3,3,4,4,4,4,5,5,5,
              5,6,6,6,7,7,8,8,9,9,
              10,11,11,12,12,13,14,15,16,16]; // 30 paliers moteur
/* ================= ÉCONOMIE — VAGUE 3 (2026-09-27, Sacha : « on gagne de l'argent trop rapidement, réajuste l'équilibrage
   global du système d'argent ») =================
   MESURÉ (banc scratchpad v3-eco : 23 parties entières jouées par un pilote automatique à 4 niveaux de jeu, chaque dollar compté à
   sa source, puis rejouées hors ligne sous d'autres formules) : le pilote SANS AUCUN geste gagnait ~1 300 $ la première minute
   (une COMMUNE par minute de conduite passive) ; débutant (75 s) 3 450 $/partie · moyen (2,3 min) 11 300 · bon (7 min, ORBITE)
   148 k · très bon (12 min, niveau 5) 442 k. Un bon joueur s'offrait TOUTES les communes en une partie, TOUTE la gamme en ~110.
   91 à 99 % venaient des PIÈCES : RÉCOLTE ×4 (série de pièces) × FLOW ×3 = ×12 sur CHAQUE pièce, et sur une route dense la
   récolte ne retombe jamais — la 10e minute d'une grande partie rapportait ~170× la 1re. Côté poses, FLOW × CHAÎNE × POSE × FACE
   × SÉRIE montait à ×108, et la SÉRIE (×2) ne retombait jamais non plus.
   CE BLOC EST TOUT LE RÉGLAGE : d'abord les trois FUITES (des multiplicateurs qui se composaient), puis UN bouton de niveau.
   RÉSULTAT (re-mesuré, jeu modifié) : débutant ~560 $/partie · moyen ~1 750 · bon ~17 k · très bon ~55-73 k — la 1re caisse
   après l'auto-école + 1 à 2 parties, la 5e en ~5 parties moyennes, les communes en ~5 bonnes parties, la caisse à 2,5 M en ~35-45
   très bonnes. Le talent paie toujours autant : un très bon joueur gagne ~100-130× un débutant par partie (c'était ~130×). */
const ECO3={
  gain:.25,     // LE BOUTON : la valeur du dollar gagné EN COURSE — pièces et portail passent par denom() (les poses et l'assurance ne paient plus : 29/09)
  prime:1,      // les PRIMES DE CONTRAT (versées en banque) — (2026-10-14, équilibrage) PLEINES (c'était la moitié) : sans les communes retirées le 06/10, ce salaire d'accueil rapproche la 1re caisse
  defi:{1000:200,20000:2500,100000:12000,500000:60000}, // les défis « ENCAISSE X » (ancien seuil → nouveau), calés sur les parties mesurées
  flow:[1,1.3,1.5,1.8,3], // FUITE 1 — le FLOW paie ×1,3 · ×1,5 · ×1,8 · ×3 à la FRÉNÉSIE (c'était +0,5 par palier, jusqu'à ×3) ; des valeurs
                //   qui s'écrivent juste avec une décimale : la bande du FLOW affiche flowMult() tel quel, elle ne doit pas arrondir
                //   (2026-09-29, Sacha : « en mode frénésie on doit gagner 3× l'argent ») : la FRÉNÉSIE repasse à ×3 (elle payait ×2) — elle
                //   seule, les paliers d'avant gardent leur prix. En échange elle se gagne plus vite et TOMBE plus vite (FLOW2, loi 16) : le
                //   ×3 n'est plus une rente, c'est une rafale qu'on relance. Toute la paie de course passe par flowMult() (pièces, portail,
                //   butins de la ville, fins de monde) ; les figures, elles, ne paient plus qu'en aura (session GAMEPLAY, même jour).
  recolte:2.5,  // FUITE 2 — la RÉCOLTE monte de ×0,5 toutes les 5 pièces et plafonne à ×2,5 (c'était +1 par 5, jusqu'à ×4)
  serie:.5      // FUITE 3 — la SÉRIE de poses : +5 % par pose, plafond +50 % (c'était +10 %, plafond ×2 dès la 10e pose)
};
function ecoSerie(){return streak>=2?1+Math.min(ECO3.serie,streak*.05):1;} // la SÉRIE : lue par la pose ET par la mallette (chainEst) — un seul endroit
// ⚠ `THRESH` A ÉTÉ RETIRÉ (2026-08-03) — c'était l'échelle de 23 seuils d'argent qui faisait tomber
// les caisses EN COURS de partie. Depuis que les voitures se débloquent sur des exploits persistants
// (voir CAR_UNLOCK), plus une seule ligne ne la lisait : la laisser aurait fait croire qu'elle pilote
// encore quelque chose. Son dernier seuil valait 1,9e13, hors d'atteinte — c'est précisément ce qui
// rendait les dernières caisses inaccessibles et ce qui a motivé de nouvelles règles.
let level=0; // la caisse CONDUITE (choisie au garage). Fixe pendant toute une partie — ce n'est plus un « niveau ».
// ⚠ LA VALEUR DES PIÈCES SUIT LE MOTEUR, PLUS LA VOITURE (2026-08-02). La voiture est désormais
// PUREMENT COSMÉTIQUE : l'indexer sur `level` faisait qu'équiper une belle caisse donnait d'emblée
// des pièces à 40 000 — d'où la tirelire à 320 000 dès le premier écran. Le moteur, lui, part
// toujours de zéro : l'économie repart donc au même point à chaque partie.
function denom(){return DENOMS[Math.min(engTier,DENOMS.length-1)]*ECO3.gain*ECOD.k;} // clamp sur la table elle-même : la liste de paliers peut grandir sans qu'un 23 codé en dur la tronque · ×ECO3.gain (vague 3) : tous les seuils relatifs (mallette « chaude », caisse enregistreuse, verdicts) suivent seuls
/* (2026-10-14, GAMEPLAY — Sacha : « le premier achat — la PEINTURE la moins chère — doit tomber à la 4e PARTIE d'un joueur MOYEN, sans toucher aux PRIX de Léo ; les gains du début sont relevés, et ce relèvement s'éteint après le 1er achat ») L'ARGENT DU DÉBUT.
   LE LEVIER : denom() × ECOD.k. Toute la paie de COURSE (pièces, portail, fins de monde, butins de la ville) passe déjà par denom() × flowMult() : on ne crée pas
   de deuxième chemin d'argent, on règle le robinet qui existe. Les PRIMES (permis, défis) et les PRIX (COSM, CAR_UNLOCK) ne bougent pas.
   QUAND IL VAUT — décidé au DÉPART de chaque partie (runxReset → ecoDebutMaj), donc constant pendant toute la partie : ECOD.coup (×1,5) tant que
   (1) rien n'a été acheté en boutique (caisse, peinture, aile, traînée, figure : voir ecoDebutAchat — un habillage GAGNÉ par un carnet n'est pas un achat) ;
   (2) la banque n'atteint pas la peinture la moins chère (le filet : qui peut déjà se l'offrir n'a plus besoin d'aide, même s'il garde son argent pour autre chose) ;
   (3) ni `?eco=ancien` (strictement l'ancienne économie) ni le code cousin. Un achat, quel qu'il soit, l'éteint pour toujours : aucun champ de sauvegarde, tout se relit sur l'état.
   LE CALCUL (outils/eco-debut-modele.cjs : les constantes sont LUES dans ce fichier, les comportements sont des hypothèses écrites) — le joueur MOYEN tient 45-90 s, prend la
   moitié des pièces, entre dans le flow I vers 40 s, remplit le carnet 1 vers la 1re-3e partie : ~175 $ par partie. Sans relèvement la MENTHE GLACÉE (2 500 $) tombe à la 6e
   partie (médiane, 11 % des joueurs avant la 5e) ; avec ×1,5 à la 4e (25 % dès la 3e, 62 % au plus tard à la 4e, 89 % à la 5e). ⚠ Le résultat dépend surtout des PRIMES, pas des
   pièces : si ce joueur fait aussi la moitié des défis du carnet 2 (1 800 $), il l'a déjà à la 3e même sans relèvement — ECOD.coup est LE bouton à reprendre après un vrai test
   (`dbgEcoDebut()` dit où l'on en est). Le joueur qui meurt avant 45 s (25-30 $ par partie) n'y arrive pas par les pièces : son plancher est un autre chantier. */
const ECO_ANCIEN=/[?&]eco=ancien\b/.test(location.search); // `?eco=ancien` : ECOD.k reste à 1, l'économie d'avant au dollar près
const ECOD={coup:1.5,k:1,raison:'depart'}; // coup : LE réglage · k : ce que la partie en cours applique · raison : pourquoi (actif · achat · assez · cousin · ancien · erreur)
function ecoDebutPrix(){let m=1e30;for(const c of ['peinture','aile','trainee'])for(const x of COSM[c])if(x.p>0&&x.p<m&&!x.sec&&!x.mis&&!x.retire&&!x.eur)m=x.p;for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(u&&u.p>0&&u.p<m&&!carRetiree(i))m=u.p;}return m;} /* la 1re chose qui s'achète EN DOLLARS, LUE sur COSM et CAR_UNLOCK : si les prix changent, le seuil suit — ni les SECRÈTES, ni celles d'un carnet, ni les retirées, ni celles en euros. (2026-10-24) toutes les peintures sont passées en euros (boutique.js leur retire p) : le seuil valait 1e30 et « assez » ne tombait plus jamais ; caisses, ailes et traînées en $ prennent le relais (aujourd'hui LA CABOSSÉE, 2 500 $, le prix de l'ancienne MENTHE GLACÉE) */
function ecoDebutAchat(){ // vrai dès qu'UN achat a été fait : caisse (owned), figure (figs — le TAIL WHIP est offert ; le TONNEAU l'était avant le 15/10), habillage payant (shop.own — ceux d'un carnet n'ont pas de `p`)
  const d=SAVE.d;if(d.owned&&d.owned.length)return true;if(d.figs&&d.figs.some(function(id){return id!=='tailwhip'&&!(id==='tonneau'&&d.figT0)&&!(id==='saltov'&&d.figS);}))return true; // (2026-10-15) le TAIL WHIP offert, et le tonneau offert des sauvegardes d'avant, ne sont pas des achats
  const o=d.shop&&d.shop.own;if(o)for(let i=0;i<o.length;i++){const a=String(o[i]).split(':'),l=COSM[a[0]],x=l&&l.find(function(y){return y.id===a[1];});if(x&&x.p>0)return true;}
  return false;
}
function ecoDebutEtat(){ // {k, raison} — pur : ne touche à rien
  try{
    if(ECO_ANCIEN)return {k:1,raison:'ancien'};
    if(cousin())return {k:1,raison:'cousin'};
    if(ecoDebutAchat())return {k:1,raison:'achat'};
    if(bank()>=ecoDebutPrix())return {k:1,raison:'assez'};
    return {k:ECOD.coup,raison:'actif'};
  }catch(e){return {k:1,raison:'erreur'};} // SAVE ou COSM pas encore déclarés (le tout premier buildCar tourne avant eux) : l'ancienne économie
}
function ecoDebutMaj(){const e=ecoDebutEtat();ECOD.k=e.k;ECOD.raison=e.raison;return e.k;} // appelée par runxReset : UNE fois par partie
window.dbgEcoDebut=function(){const e=ecoDebutEtat(),p=ecoDebutPrix(),b=bank(); // (2026-10-14, GAMEPLAY) l'état du relèvement : `k` = ce que la partie en cours applique, `prochain` = ce que la suivante appliquerait
  return {actif:ECOD.raison==='actif',k:ECOD.k,raison:ECOD.raison,prochain:e.k,raisonProchaine:e.raison,coup:ECOD.coup,parties:(SAVE.d.ex&&SAVE.d.ex.runs)|0,achatFait:ecoDebutAchat(),banque:b,peintureMin:p,manque:Math.max(0,p-b),ancien:ECO_ANCIEN};};
// LANGUE & DEVISE (2026-09-03) : la devise est désormais UNIQUE — le dollar, quelle que soit la
// langue d'affichage (avant : le français comptait en euros). `CUR()` ne dépend donc plus de `LANG` ;
// seul `LOC()` (le séparateur des milliers/décimales) suit encore la langue.
// ⚠ DEUX LANGUES (FR/EN) : `LANG_CYCLE` est la SEULE liste à tenir à jour — le
// sélecteur (desktop ET mobile) boucle dessus via `langNext()`, un seul écrivain pour ne pas
// diverger entre les deux (même piège que `modeLbl`).
// (2026-10-14, Sacha : « enlève le chinois ») un `ccLang` qui n'est plus proposé (l'ancien 'zh') retombe sur la langue de l'appareil (`langAuto`).
const LANG_CYCLE=['fr','en'];
/* (2026-09-28, passe de lancement) LA LANGUE DU TÉLÉPHONE PAR DÉFAUT : sans choix enregistré, TOUT LE MONDE démarrait en anglais —
   un iPhone réglé en français compris. On lit les langues préférées de l'appareil, la 1re que le jeu parle gagne (sinon l'anglais) ;
   le choix fait dans les réglages (`langNext` → `ccLang`) reste maître, et l'automatique n'est jamais écrit : il suit l'appareil. */
const LANG_AUTO=['fr','en'];
function langAuto(){
  try{const L=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||''];
    for(const l of L){const c=String(l).toLowerCase().slice(0,2);if(LANG_AUTO.indexOf(c)>=0)return c;}}catch(e){}
  return 'en';
}
function decFr(x,d){const t=(+x).toFixed(d);return LANG==='fr'?t.replace('.',','):t;} // (passe qualité) « 5,3 » en français, « 5.3 » ailleurs
let LANG=(function(){try{const c=localStorage.ccLang;if(LANG_CYCLE.indexOf(c)>=0)return c;}catch(e){}return langAuto();})();
function langNext(){
  const i=LANG_CYCLE.indexOf(LANG);
  LANG=LANG_CYCLE[(i+1)%LANG_CYCLE.length];
  try{localStorage.ccLang=LANG;}catch(err){}
  return LANG;
}
const CUR=()=>'$';
const LOC=()=>LANG==='fr'?'fr-FR':'en-US';
const fmt=v=>CUR()+' '+Math.round(v).toLocaleString(LOC());
/* ============================================================================
   TRADUCTION FR / EN (2026-08-03)
   La mécanique de langue existait (sélecteur + devise) mais TOUS les textes étaient en français.
   PARTI PRIS : la clé du dictionnaire est LA PHRASE FRANÇAISE elle-même. Le code reste donc lisible
   (`showMsg('CATAPULTE !')`), rien ne casse si une traduction manque — on retombe sur le français —
   et il n'y a pas 400 constantes `MSG_042` à maintenir en parallèle.
   ⚠ TR() fait une correspondance EXACTE, sans magie de remplacement partiel : une substitution de
   fragments mangerait « COMÈTE » dans « COMÈTE 👑 ». Les phrases composées à l'exécution
   (« ⚙ »+nom du moteur) appellent donc TR() sur CHAQUE morceau, à la composition.
   ========================================================================== */
const I18N={
 // ---- la conduite (les textes qui jaillissent au-dessus de la caisse) ----
 'FRÔLÉ !':'CLOSE CALL!','PORTE !':'GATE!','PARFAIT !':'PERFECT!','DIVIN !!':'DIVINE!!',
 'AU CHEVEU !!':'CLOSE ONE!!','ARRACHÉE !':'JUST IN TIME!','NOUVEAU RECORD !':'NEW RECORD!','PLUS QUE':'ONLY','ENCORE':'NEED',
 'QUITTER LA PARTIE ?':'QUIT THE RUN?','RECOMMENCER ?':'RESTART?','Tes gains sont versés au compte.':'Your winnings go to your account.',
 'Les gains de cette partie ne seront PAS versés.':'This run\'s winnings will NOT be paid.','CONTINUER':'CONTINUE','RASE-BORD':'EDGE RIDER','FRÉNÉSIE !':'FRENZY!','FRÉNÉSIE':'FRENZY',
 // ---- interface ----
 'GARAGE':'GARAGE','ÉQUIPER':'EQUIP','✓ ÉQUIPÉE':'✓ EQUIPPED','🔒 VERROUILLÉE':'🔒 LOCKED',
 'glisse pour tourner · molette pour zoomer':'drag to turn · scroll to zoom',
 'clique sur CASH CAR — le son s\'allume avec toi':'click on CASH CAR — sound comes alive with you',
 'cours après le cash · ne tombe jamais':'chase the cash · never fall',
 'GAME OVER':'GAME OVER','VALIDER':'CONFIRM','★ NOUVEAU RECORD — TON NOM':'★ NEW RECORD — YOUR NAME',
 'Prêt à repartir ?':'Ready to go again?','NIVEAU':'LEVEL','AU-DESSUS DE LA VILLE':'ABOVE THE CITY','MER DE NUAGES':'SEA OF CLOUDS','EN ORBITE':'IN ORBIT','TOURNE TON TELEPHONE':'TURN YOUR PHONE','CASH CAR SE JOUE A LA VERTICALE':'CASH CAR IS PLAYED UPRIGHT','Jouer':'Play','Garage':'Garage','Réglages':'Settings','Survivant · off':'Survivor · off',
 'Langue':'Language','Freestyle':'Freestyle','Survivant':'Survivor','on':'on','off':'off',
 'Audio':'Audio','Effets sonores':'Sound effects','Devise':'Currency',
 'Commandes':'Controls','Sauvegarde':'Save','📋 Copier ma sauvegarde':'📋 Copy my save',
 'conduire · piloter en vol':'drive · steer in flight','nitro · double-tap = DÉCOLLAGE':'nitro · double-tap = LIFT-OFF',
 'drift':'drift','replacer la caisse':'respawn the car','pause':'pause','rejouer':'play again',
 'Espace':'Space','Entrée':'Enter','Pad gauche':'Left pad','Pad + frein':'Pad + brake','En vol':'In flight',
 'volant · tirer vers le bas = frein':'steering · pull down = brake',
 'le pad devient un joystick (haut/bas)':'the pad becomes a joystick (up/down)',
 'pouce droit · double-tap = DÉCOLLAGE':'right thumb · double-tap = LIFT-OFF',
