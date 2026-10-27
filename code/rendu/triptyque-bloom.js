/* ============ TRIPTYQUE VISUEL : ACES + BLOOM + OMBRES DE CONTACT ============ */
// --- OMBRES LONGUES (golden hour) : une seule casteuse — le soleil — dans une fenêtre ortho serrée qui SUIT la caisse.
// Soleil à ~5,9° → l'ombre fait ~9,7× la hauteur de l'objet : le rasant étire tout au sol.
renderer.shadowMap.enabled=true;
/* (2026-10-14, passe perf mobile) LE FILTRE DE L'OMBRE, PAR PALIER. L'ombre douce (PCFSoft) lit la carte 36 fois par pixel éclairé (9 prises
   interpolées à la main × 4) ; l'ombre PCF simple, 17 fois, sans les interpolations — même carte, même biais, bord un peu moins fondu.
   Le type entre dans le #define des matières : il se choisit ICI, avant toute compilation, et plus personne ne le change ensuite.
   RÉCENT : ombre douce, comme avant. (`?palier=2` pour comparer.) */
PAL.B.postOmbreDouce=[0,0,1];
renderer.shadowMap.type=PAL.b('postOmbreDouce',1)?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
sun.castShadow=true;
sun.shadow.mapSize.set(IS_MOBILE||IS_LOW_END?1024:1280,IS_MOBILE||IS_LOW_END?1024:1280); // 1280 : l'ortho ±34 m est si serrée que 1536 était du luxe — passe d'ombre ~30 % moins chère
const SUNC=sun.shadow.camera;
SUNC.left=-34;SUNC.right=34;SUNC.top=30;SUNC.bottom=-64;SUNC.near=40;SUNC.far=340;SUNC.updateProjectionMatrix(); // fond profond : l'ombre atteint la dalle même très haut au-dessus de la route
sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.08; // normalBias en MÈTRES (~2 texels) : assez pour tuer l'acné, pas de quoi décoller l'ombre
scene.add(sun.target);
const SUN_UP=new THREE.Vector3().crossVectors(SUN_PERP,SUN_DIR).normalize(),shadV=new THREE.Vector3(); // base du plan lumière (snap texel)
// --- Étalonnage GTA-VICE (réglables d'un coup d'œil) : saturé, contrasté, teal-orange ---
let POST_EXPO=0.71;        // exposition BASSE : la nuit gagne — le sol s'éteint pour que nitro/boost/phares RAYONNENT dessus (let : les BIOMES la pilotent, le contre-jour la relit chaque frame)
const POST_SAT=1.40;       // SATURATION forte : néons Vice City (valeur d'init — les biomes écrivent acesPass.uniforms.uSat en direct)
const POST_CONTRAST=1.23;  // CONTRASTE : noirs profonds, hautes lumières franches
let POST_PIVOT=.5;          // (2026-10-14, passe graphismes · chaîne de couleur) le PIVOT du contraste. À .5 (l'image d'avant, au bit près) tout ce qui sort de l'ACES sous ~.14 est écrêté à 0 dès que le contraste dépasse 1,3 : des noirs BOUCHÉS (seuil = 25 à 35/255 en valeur de scène). Plus bas (.35) les ombres gardent leur dégradé — mais toute l'image monte de (con−1)·(.5−pivot) : à régler avec l'exposition. INTERRUPTEUR ÉTEINT (.5) : `dbgGfx({pivot:.35})` pour essayer à chaud ; uniforme `uKC` calculé en JS, coût nul.
const POST_VIVID=0.74;     // 0 = ACES sobre (désature les hautes lumières) · 1 = tonemap qui PRÉSERVE la couleur (les néons restent des néons)
const POST_WB=new THREE.Vector3(1.02,0.985,1.03);       // voile MAGENTA subtil : le rose Vice City infuse toute l'image
const POST_SHADOW=new THREE.Vector3(0.004,-0.008,0.062); // OMBRES → bleu-violet nuit (place au néon)
const POST_HI=new THREE.Vector3(0.052,0.008,-0.014);      // LUMIÈRES → or rosé (le couchant qui s'accroche aux tôles)
// Grade cinéma en PASSE FINALE : tonemap préservant la chroma + contraste + saturation + split-tone. Scène en amont inchangée.
const GRADE_ACES=IS_MOBILE; // (2026-09-25) l'étalonnage final (ex-filtre CSS du canvas) passe DANS l'ACES : plus de passe de compositeur plein écran, à la résolution de l'écran, sur téléphone
const FXAA_ON=IS_MOBILE||IS_LOW_END||devicePixelRatio>=1.5; // (2026-09-26, audit rendu) là où il n'y a PAS de MSAA (téléphone : aucun anticrénelage, chaque marche = 3 px physiques)
const ACES_N=IS_MOBILE?6:8;   // flou radial du boost : 18 lectures de texture au téléphone au lieu de 24 (le grain animé fond les copies)
/* LA PASSE FINALE ALLÉGÉE (2026-09-27, passe perf iPhone, tour 2 — « le post-traitement »). MESURÉ au micro-banc (la passe seule, rejouée
   sur une image figée, 585×1266 comme l'iPhone en NETTE ; rendu logiciel SwiftShader ET vraie carte, chronomètre de la puce) : en rendu
   logiciel, ce qui coûte ce sont les LECTURES de texture (FXAA ~45 %, halo ~20 %, calcul ~15 %) ; sur une vraie puce, le CALCUL de
   l'étalonnage pèse ~35 % et les lectures FILTRÉES le reste. Quatre allègements, même image (écart ≤ 1/255, 0 sur la plupart des pixels) :
   · FXAA : le centre et ses 4 voisins tombent PILE sur des texels (même taille que l'image) — lus par `texelFetch` (un texel, ni
     filtrage ni dérivées ; bord de l'image : coordonnées bornées = ce que faisait le « clamp to edge »). Identique au bit près ;
   · toutes les autres lectures (flou radial, bords du FXAA, halo) en `textureLod(…,0)` : ces cibles n'ont pas de mips et filtrent en
     linéaire à toutes les échelles — même résultat au bit près, sans le calcul de dérivées qui précède chaque `texture()` (−20 % sur
     vraie carte à lui seul) ;
   · le HALO : les 5 mips étaient relus à CHAQUE pixel de l'écran — ils sont désormais sommés UNE fois dans une petite cible à la
     taille du 1er mip (voir « LE HALO COMPOSÉ » sous le compositeur) : 1 lecture au lieu de 5 (PC : 2 au lieu de 10) ;
   · l'étalonnage : exposition × balance et contraste pré-calculés par image (`uWE`, `uKC`), tunnel et lueur de nitro sautés quand
     ils valent 0 (branche sur un uniforme : toute l'image prend le même chemin), la vignette ne tire sa racine qu'au-delà de l'ellipse
     où elle commence, et le grade du téléphone replié en 2 opérations.
   WebGL1 (très vieux appareils) : `texelFetch`/`textureLod` n'y existent pas — mêmes calculs en `texture2D`, comme avant. */
const W2_POST=!!(renderer.capabilities&&renderer.capabilities.isWebGL2);
const TXL=(s,u)=>W2_POST?'textureLod('+s+','+u+',0.0)':'texture2D('+s+','+u+')'; // une lecture filtrée, sans dérivées quand on peut
/* LE FLOU DE VITESSE SANS MOTIF (2026-10-15, Léo : « sur iPhone, des parties de l'écran se répétaient, un peu les pixels », photo à
   l'ORBITE en vol, NITROOO). MESURÉ au banc (même image rendue deux fois, zoom ×6) : là où le flou file loin de la caisse, l'image portait
   une TRAME RÉGULIÈRE — colonnes d'un pixel sur deux, diagonales — absente sans le flou. C'était le chemin du téléphone : 6 prises
   décalées par le bruit entrelacé (fait pour être lissé d'une image à l'autre, ce que le jeu ne fait pas). Loin de la caisse les prises
   sont espacées de dizaines de pixels : chaque pixel en tirait 6 échantillons au hasard du motif → la trame, qui scintille en 2-3 px
   d'écran (la 3D en NETTE est à ×1,5 sur un écran ×3). L'ordi n'a pas ce chemin (8 prises fixes).
   Désormais, téléphone et WebGL2 : chaque prise lit l'image PRÉ-FLOUTÉE à la taille de son intervalle + ½ niveau (mipmaps de la cible
   de la scène, générés seulement quand le flou joue — `flouMips`) : les prises se fondent, plus besoin de décalage (essayé au banc, même
   image : un bruit sans motif laissait du grain au bord de la lune, sans pré-flou les sourcils se dédoublaient en stries) ; une prise
   qui sortirait de l'image se replie en MIROIR au lieu de répéter le pixel du bord (~5 % de chaque bord au boost). Image STABLE d'une
   image à l'autre. Près de la caisse (intervalle sous ~0,7 texel) : lecture au niveau 0, image identique. Même nombre de lectures. `?flou=ancien` = le chemin d'avant (comparer sur le
   téléphone). */
const FLOU_MIPS=ACES_N<8&&W2_POST&&!/[?&]flou=ancien\b/.test(location.search);
/* LA CAISSE RESTE NETTE (2026-09-30, niveau 1 v2) : où est la caisse à l'écran (uCtr, en coordonnées d'image 0-1), quelle taille y fait-elle
   (uSafe : le rayon de son disque net), et l'échelle qui ramène la distance à la caisse à celle d'avant (uRn : le coin le plus loin de la
   caisse compte comme le coin de l'image comptait depuis le milieu). Hors cadre (derrière la caméra) : le milieu, comme avant. */
const POST_CV=new THREE.Vector3(),POST_CV2=new THREE.Vector3();
function postCaisse(U){
  let x=.5,y=.5,rs=0;
  if(started&&!gameOver&&carGroup.visible){POST_CV.copy(carGroup.position).project(camera);
    if(POST_CV.z<1&&Math.abs(POST_CV.x)<1.4&&Math.abs(POST_CV.y)<1.4){x=POST_CV.x*.5+.5;y=POST_CV.y*.5+.5;
      const R9=.55*((CARS[level]&&CARS[level].l)||4.2);POST_CV2.setFromMatrixColumn(camera.matrixWorld,0).multiplyScalar(R9).add(carGroup.position).project(camera);
      rs=Math.min(.32,Math.hypot((POST_CV2.x-POST_CV.x)*.5,(POST_CV2.y-POST_CV.y)*.5));}}
  x=Math.min(.85,Math.max(.15,x));y=Math.min(.85,Math.max(.15,y));
  U.uCtr.value.set(x,y);U.uSafe.value=rs;
  U.uRn.value=.7071/Math.max(Math.hypot(Math.max(x,1-x),Math.max(y,1-y)),.5);
}
const ACESShader={
  uniforms:{tDiffuse:{value:null},uExposure:{value:POST_EXPO},uSat:{value:POST_SAT},uContrast:{value:POST_CONTRAST},
            uVivid:{value:POST_VIVID},uWB:{value:POST_WB},uSh:{value:POST_SHADOW},uHi:{value:POST_HI},uSpeed:{value:0},uJit:{value:0},uRes:{value:new THREE.Vector2(1/1024,1/1024)},
            uVigK:{value:.52},uVigC:{value:new THREE.Vector3(.149,.047,.212)}, // (2026-09-26, vague 2) la VIGNETTE du niveau (ex-calque DOM #vig), posée par bioApply
            uWE:{value:new THREE.Vector3(1,1,1)},uKC:{value:new THREE.Vector2(1,0)},
            uCtr:{value:new THREE.Vector2(.5,.5)},uSafe:{value:0},uRn:{value:1}}, // (2026-09-30, niveau 1 v2) le flou de vitesse part de la CAISSE et la garde nette (voir « LA CAISSE RESTE NETTE ») // (tour 2, post) uWB×uExposure et le contraste (pente, décalage) — posés par acesPass.render à chaque image
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:['uniform sampler2D tDiffuse;uniform float uExposure,uSat,uContrast,uVivid,uSpeed,uJit,uVigK,uSharp;uniform vec3 uWB,uSh,uHi,uVigC,uWE;uniform vec2 uRes,uKC,uCtr;uniform float uSafe,uRn;varying vec2 vUv;',
    'uniform sampler2D uBc;uniform float uBa;', // (2026-09-27, passe perf iPhone) le BLOOM FUSIONNÉ — le halo déjà composé (voir « LE HALO COMPOSÉ » sous le compositeur) ; uBa = 0 : pas de halo
    'uniform vec4 uNit;uniform float uNitF;uniform float uTrame;', // (vague 3, NITRO) la couleur de la poussée sur les bords (rgb + part) et le coup d'allumage — posés par nfxTick
    // (2026-09-26, audit rendu) LES HAUTES LUMIÈRES ROULENT au lieu de s'écraser : en NUAGES, 98 % du haut de l'image avait un canal au
    // plafond (un aplat bleu électrique, des nuages brûlés). Le coude garde la TEINTE (on divise les trois canaux ensemble) : tout ce
    // qui tenait déjà sous .86 ne bouge pas d'un iota — seuls les pixels qui saturaient retrouvent leur dégradé.
    'vec3 roule(vec3 c){float m=max(c.r,max(c.g,c.b));if(m>0.86){float k=0.86+0.14*(1.0-exp(-(m-0.86)/0.14));c*=k/m;}return c;}',
    'vec3 aces(vec3 x){const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}',
    /* (2026-10-27, Léo : « les traits d'effet de vitesse, joue sur le flou des côtés, ultra propre, hypergaming ») LES TRAITS DE VITESSE : des filets FINS (~1 px) qui
       jaillissent du point de fuite vers les bords, longueurs et opacités variables, naissant après .4 du rayon (le centre et la caisse restent libres), plus vifs
       vers les bords ; deux couches (fine et rare). Procédural : aucune lecture de texture. uTL = (horloge, force) ; ?traits=0 les éteint. */
    'uniform vec2 uTL;float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}',
    'float filets(vec2 q,float rn,float N,float sd,float t){float ang=atan(q.y,q.x)*(N/6.2831853)+N*.5,id=floor(ang),f=fract(ang)-.5;',
    '  float s2=h11(id*1.37+sd+9.1),s3=h11(id*2.11+sd+3.3),ph=s2+t*(.8+s3*1.0),cy=floor(ph),hd=ph-cy,k=id+cy*13.1+sd;',
    '  float g=step(h11(k+1.7),.30+.35*s3),len=.10+h11(k+4.4)*.30,d=hd*1.15-rn,al=.30+.70*h11(k+6.6);',
    '  f-=(h11(k+5.5)-.5)*.5; float fw=min(N*.9*uRes.y/(6.2831853*max(length(q),.05)),.45);',
    '  float lin=1.0-smoothstep(0.0,fw,abs(f)), cola=(d>0.0&&d<len)?pow(1.0-d/len,1.5):0.0;',
    '  return g*al*lin*cola*smoothstep(.40,.72,rn)*(.55+.45*rn);}',
    'const vec3 LUM=vec3(.2126,.7152,.0722);',
    'void main(){',
    // (tour 2, post) `r` (une racine) ne sert qu'au flou, au tunnel et à la lueur : calculé seulement quand l'un d'eux joue (`fx`, même
    // valeur pour toute l'image). Sans poussée, tunnel ×1 et lueur +0 exactement : les sauter ne change pas un bit.
    '  vec2 dir=vUv-0.5; vec3 x; vec2 bu=vUv,bd=vec2(0.0);',
    '  bool fx=uSpeed>0.0||uNit.a+uNitF>0.0; float r=0.0; if(fx)r=length(dir);',
    '  if(uSpeed>0.004){',                                    // + flou radial + aberration chromatique (fuite vers les bords)
    /* LA CAISSE RESTE NETTE (2026-09-30, niveau 1 v2 — mesuré sur les captures : en portrait la caisse est en BAS de l'image, le flou
       partait du MILIEU, elle était le premier objet étalé, à la moindre plaque BOOST). Le flou part désormais de la caisse (uCtr, sa
       position à l'écran) ; sa force suit la distance à la caisse ramenée à la même échelle qu'avant (uRn : le coin le plus loin vaut
       le coin d'avant) ; et un disque de la taille de la caisse (uSafe) reste NET — le monde file, la caisse jamais. */
    '    vec2 dc=vUv-uCtr; float rb=length(dc)*uRn, ms=smoothstep(uSafe,uSafe*2.2+.02,length(dc));',
    '    vec2 buv=uCtr+dc*(1.0+uSpeed*0.60*rb*rb*ms);',            // WARP AU BOOST : le monde S INCURVE FORT autour de la caisse (centre stable → jouable)
    '    float amt=uSpeed*(0.04+rb*rb*1.7)*ms; vec3 acc=vec3(0.0);', // r² : centre NET, filé TRÈS FRANC vers les bords
    FLOU_MIPS?'    float lodF=max(log2(max(length(dc*amt*(0.62/'+ACES_N+'.0)/uRes),1e-4))+0.5,0.0);':'', // (FLOU SANS MOTIF) l intervalle entre deux prises, en texels → le niveau de mip qui le couvre, + ½ (les copies se fondent) ; 0 tant qu il tient sous ~0,7 texel : la caisse reste NETTE
    FLOU_MIPS?'    float jt=0.5;': // (FLOU SANS MOTIF) plus de décalage : les prises pré-floutées se fondent, l image ne grésille plus d une image à l autre
    '    float jt=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))+uJit);', // grain ANIMÉ : moins de prises sans dessiner de copies (statique = saleté collée)
    '    for(int i=0;i<'+ACES_N+';i++){ float t='+(ACES_N<8?'(float(i)+jt)/'+ACES_N+'.0':'float(i)/7.0')+'; vec2 off=dc*amt*t*0.62;',
    FLOU_MIPS?'      acc+=textureLod(tDiffuse,1.0-abs(1.0-abs(buv-off)),lodF).rgb; }': // (FLOU SANS MOTIF) la prise pré-floutée, repliée en miroir au bord
    '      acc+='+TXL('tDiffuse','buv-off')+'.rgb; }',        // (2026-09-26) UNE lecture par prise (il y en avait trois : 18 lectures par pixel au téléphone)
    '    x=acc/'+ACES_N+'.0; bu=buv-dc*amt*0.31;'+(IS_MOBILE?'':' bd=dc*amt*0.155;'), // le halo se lit au milieu de la traînée (PC : aux deux quarts, il FILE comme l'image ; téléphone : une lecture — mesuré invisible, 5 lectures de moins au boost)
    // L'ABERRATION CHROMATIQUE (2026-09-26, vague 2) — MESURÉ : au boost, chaque bord de nuage et chaque fenêtre de la ville s'ourlait
    // d'un ARC-EN-CIEL rose/jaune/cyan de 10-12 px (×.05 de l'amplitude du flou, dès le centre). Réduite au TIERS et seulement au-delà de
    // 45 % du rayon (le bord de l'image fuit, le centre reste propre) — et COUPÉE au téléphone : deux lectures de texture en moins par pixel.
    IS_MOBILE?'':'    { vec2 mid=buv-dc*amt*0.31, ca=dc*amt*0.015*smoothstep(.45,.9,rb);'+
    '      x.r=mix(x.r,'+TXL('tDiffuse','mid-ca')+'.r,0.5); x.b=mix(x.b,'+TXL('tDiffuse','mid+ca')+'.b,0.5); }',
    '  } else {',
    FXAA_ON?[ // ANTICRÉNELAGE LÉGER (FXAA simplifié) — seulement image nette (le flou de boost lisse déjà) ; hors bord, 5 lectures et on sort
    // (tour 2, post) le centre et ses 4 voisins sont des TEXELS entiers : `texelFetch`, coordonnées bornées au cadre (= clamp to edge)
    W2_POST?'    ivec2 tm=textureSize(tDiffuse,0)-1,ip=min(ivec2(vUv*vec2(tm+1)),tm);'+
      ' vec3 cM=texelFetch(tDiffuse,ip,0).rgb,cNW=texelFetch(tDiffuse,clamp(ip+ivec2(-1,-1),ivec2(0),tm),0).rgb,cNE=texelFetch(tDiffuse,clamp(ip+ivec2(1,-1),ivec2(0),tm),0).rgb,'+
      'cSW=texelFetch(tDiffuse,clamp(ip+ivec2(-1,1),ivec2(0),tm),0).rgb,cSE=texelFetch(tDiffuse,clamp(ip+ivec2(1,1),ivec2(0),tm),0).rgb;':
    '    vec3 cM=texture2D(tDiffuse,vUv).rgb,cNW=texture2D(tDiffuse,vUv+vec2(-1.,-1.)*uRes).rgb,cNE=texture2D(tDiffuse,vUv+vec2(1.,-1.)*uRes).rgb,cSW=texture2D(tDiffuse,vUv+vec2(-1.,1.)*uRes).rgb,cSE=texture2D(tDiffuse,vUv+vec2(1.,1.)*uRes).rgb;',
    '    float lM=dot(cM,LUM),lNW=dot(cNW,LUM),lNE=dot(cNE,LUM),lSW=dot(cSW,LUM),lSE=dot(cSE,LUM);',
    '    float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))),lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));',
    // (2026-09-27, tour 2) LE PIQUÉ QUI COMPENSE LA RÉSOLUTION : quand l'échelle QL descend sous le plafond, `uSharp` > 0 rend aux
    // détails fins (grain du bitume, liserés, tôles) le contraste que le rééchantillonnage leur a pris — accentuation adaptative façon
    // CAS, dosée par le contraste LOCAL (elle ne s'emballe jamais sur les bords : ceux-là partent dans le FXAA juste en dessous) et
    // bornée par le voisinage (aucun halo possible). Ses 4 lectures sont CELLES du FXAA : coût nul. À pleine résolution uSharp = 0 :
    // l'image est identique au bit près.
    '    if(lMax-lMin<max(0.0312,lMax*0.125)){ x=cM;',
    '      if(uSharp>0.001){ vec3 av=(cNW+cNE+cSW+cSE)*0.25, mn=min(min(cNW,cNE),min(cSW,cSE)), mx=max(max(cNW,cNE),max(cSW,cSE));',
    '        x=clamp(cM+(cM-av)*uSharp*2.0,min(mn,cM),max(mx,cM)); }',
    '    } else {',
    '      vec2 d=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));',
    '      float dr=max((lNW+lNE+lSW+lSE)*0.03125,0.0078125); float rc=1.0/(min(abs(d.x),abs(d.y))+dr);',
    '      d=clamp(d*rc,vec2(-8.0),vec2(8.0))*uRes;',
    '      vec3 a=0.5*('+TXL('tDiffuse','vUv+d*(1.0/3.0-0.5)')+'.rgb+'+TXL('tDiffuse','vUv+d*(2.0/3.0-0.5)')+'.rgb);',
    '      vec3 b=a*0.5+0.25*('+TXL('tDiffuse','vUv-d*0.5')+'.rgb+'+TXL('tDiffuse','vUv+d*0.5')+'.rgb);',
    '      float lB=dot(b,LUM); x=(lB<lMin||lB>lMax)?a:b; }'].join('\n'):'    x='+TXL('tDiffuse','vUv')+'.rgb;',
    '  }',
    // le HALO, déjà composé (poids, écrêtage à 1 et ×alpha compris) : UNE lecture — deux au PC quand il file au boost
    IS_MOBILE?'  if(uBa>0.0)x+='+TXL('uBc','bu')+'.rgb;':'  if(uBa>0.0)x+=(bd.x!=0.0||bd.y!=0.0)?0.5*('+TXL('uBc','bu-bd')+'.rgb+'+TXL('uBc','bu+bd')+'.rgb):'+TXL('uBc','bu')+'.rgb;',
    '  x*=uWE;',                                          // = x·uWB·uExposure (produit posé par image)
    'float L=dot(x,LUM);',
    'vec3 perCh=aces(x);',                              // ACES par canal : sûr mais désature les hautes lumières
    'vec3 lumB=x*(clamp((L*(2.51*L+.03))/(L*(2.43*L+.59)+.14),0.,1.)/max(L,1e-4));', // ACES sur la LUMINANCE seule (en scalaire) → la chroma est conservée (néon)
    'vec3 c=max(mix(perCh,lumB,uVivid),0.);',           // dosage entre les deux (plus d'écrêtage ici : voir `roule`)
    'c=max(c*uKC.x+uKC.y,0.);',                         // CONTRASTE : noirs profonds — (c−.5)·k+.5 = c·k + (.5−.5k)
    'float l2=dot(c,LUM);c=mix(vec3(l2),c,uSat);',      // SATURATION
    'c+=uSh*(1.-smoothstep(0.,0.5,l2));',               // split-tone : ombres TEAL
    'c+=uHi*smoothstep(0.5,1.0,l2);',                   // split-tone : lumières OR
    'if(fx){',
    'c*=1.0-uSpeed*smoothstep(0.30,0.85,r)*0.55;',      // TUNNEL DE VITESSE : les bords plongent dans le noir, l'œil file au centre
    '{float kS=smoothstep(.12,.6,uSpeed)*uTL.y;if(kS>0.001){vec2 q=vUv-vec2(.5,.57);float as=uRes.y/uRes.x;q.x*=as;float rn=length(q)/length(vec2(.5*as,.6));',
    '  float li=filets(q,rn,96.,0.,uTL.x)+0.7*filets(q,rn,150.,41.,uTL.x*1.3);',
    '  c+=mix(vec3(.80,.92,1.),uNit.rgb*.9+.25,clamp(uNit.a*1.5,0.,1.))*min(li,1.0)*kS*.55;}}',
    // (vague 3, NITRO) LES BORDS S'ALLUMENT DE LA COULEUR DE LA POUSSÉE — une LUEUR ajoutée (pas un voile : un mélange vers l'orange
    // délavait le rose en brun, mesuré), plus forte sur le sombre que sur le clair (elle ne brûle jamais le ciel), + le COUP d'allumage.
    // Le centre (la caisse, la route devant) reste intact : tout se joue au-delà du quart de l'image. Zéro lecture de texture.
    '{float ne=smoothstep('+('0.46,0.80')+',r);c+=uNit.rgb*(ne*(uNit.a*(1.0-0.6*min(1.0,dot(c,LUM)))+uNitF));}}',
    // = saturate(1.12) contrast(1.05) brightness(.97) du CSS, même ordre — mix(l,c,1.12) = 1.12c − .12l ; ((c−.5)·1.05+.5)·.97 = 1.0185c − .02425
    GRADE_ACES?'c=max(c,0.);c=max(c*1.12-dot(c,LUM)*.12,0.);c=max(c*1.0185-.02425,0.);':'',
    // LA VIGNETTE (2026-09-26, vague 2) — c'était un calque DOM plein écran (#vig) : violet, fixe à 52 %, même en plein jour cobalt. Elle
    // vit ici, par niveau (uVigK/uVigC, posés par bioApply). Même dessin au pixel que l'ancien dégradé CSS (ellipse centrée à 44 % du
    // haut, taille « coin le plus loin », transparente jusqu'à mi-chemin puis linéaire) : la VILLE garde exactement son cadre.
    // (tour 2, post) nulle DANS l'ellipse (|vq|·1,2354 ≤ 1, soit |vq|² ≤ 0,655218) : la racine et le mélange ne se font qu'au-delà.
    'c=clamp(roule(c),0.,1.);',
    '{vec2 vq=vec2((vUv.x-.5)/.5,(vUv.y-.56)/.44);float q=dot(vq,vq);',
    'if(q>0.6552)c=mix(c,uVigC,uVigK*clamp(sqrt(q)*1.2354-1.,0.,1.));',
    // LE TRAMAGE DE SORTIE (2026-09-28, « plus beau sur iPhone sans coût en plus ») : tout est calculé en demi-flottant, mais l'écran
    // reçoit 8 bits — les grands dégradés (le ciel des NUAGES, la brume, la vignette, la nuit de la VILLE) s'y rangeaient en MARCHES
    // de 1/255 bien visibles sur un OLED. Un demi-niveau de bruit (le même bruit entrelacé que le flou, animé par uJit) casse les
    // marches : l'œil moyenne, le dégradé redevient continu. Le noir pur reste noir (arrondi à 0), l'ORBITE garde son noir complet.
    '{float dn9=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))+uJit);c+=(dn9-.5)*uTrame;}',
    'gl_FragColor=vec4(c,1.0);}}'].join('\n')
};
ACESShader.uniforms.uBc={value:null};ACESShader.uniforms.uBa={value:0}; // (posé sur acesPass APRÈS sa création : ShaderPass CLONE les uniforms, une texture clonée serait une autre texture)
ACESShader.uniforms.uTL={value:new THREE.Vector2(0,/[?&]traits=0\b/.test(location.search)?0:1)}; // (2026-10-27) les traits de vitesse : horloge, force
ACESShader.uniforms.uSharp={value:0}; // (tour 2) le piqué qui compense la résolution — posé par applyDPR
ACESShader.uniforms.uTrame={value:1/255}; // (passe graphismes mobile) le tramage de sortie — 0 = l'ancienne sortie, voir dbgGfx
ACESShader.uniforms.uNit={value:new THREE.Vector4(1,.478,.141,0)};ACESShader.uniforms.uNitF={value:0}; // (vague 3, NITRO) la poussée sur les bords — voir nfxTick
/* (2026-10-14, passe graphismes — flou-vitesse) UN FLOU DE VITESSE PROPRE : il DIT la vitesse sans détruire l'image. MESURÉ sur les
   planches de la nuit : au boost (uSpeed .6) le coin de l'image filait sur ~200 px (amt = uSpeed·(.04+1,7·rb²)), le warp agrandissait
   le bord de 30 %, le tunnel noircissait les coins de moitié — les tours de la ville, les pics, les cumulus n'étaient plus que des
   traînées ; et en simple croisière (le voile CAM_HEROS, uSpeed .075-.2) le bord filait déjà de 30 px, sans FXAA. V2 :
   · la force suit une courbe `sp` (uFv.w) : croisière → presque rien (sous .02 l'image reste NETTE et repasse par le FXAA), boost
     → ~ moitié, nitro pleine → plein ;
   · flou ET warp ne commencent qu'au-delà d'un rayon (uFv.x, distance à la caisse ramenée au coin) et montent en carré : la caisse,
     la route devant et le point de fuite restent nets, seuls les bords filent ;
   · force max (uFv.y) et warp (uFv.z) à ~la moitié d'avant ; aberration chromatique (ordi seul) ÷ 2,5 et repoussée au bord ; tunnel
     .55 → .30 et plus loin du centre.
   Même nombre de lectures, même programme pour tous les paliers (palier 0 : FLOU_OK coupe déjà tout), aucune compilation en course. Banc : dbgFlou({v,s,fv}). */
ACESShader.uniforms.uFv={value:new THREE.Vector4(.26,2.0,.8,.25)}; // rayon où le flou commence · force · warp · courbe de vitesse (part linéaire)
const FLOU_R=[['uniform float uSafe,uRn;','uniform float uSafe,uRn;uniform vec4 uFv;'],
  ['  if(uSpeed>0.004){','  float sp=uSpeed*(uFv.w+(1.0-uFv.w)*uSpeed); if(sp>0.02){'],
  ['    vec2 buv=uCtr+dc*(1.0+uSpeed*0.60*rb*rb*ms);','    float e=max(rb-uFv.x,0.0); e*=e; vec2 buv=uCtr+dc*(1.0+sp*uFv.z*e*ms);'],
  ['    float amt=uSpeed*(0.04+rb*rb*1.7)*ms; vec3 acc=vec3(0.0);','    float amt=sp*uFv.y*e*ms; vec3 acc=vec3(0.0);'],
  ['c*=1.0-uSpeed*smoothstep(0.30,0.85,r)*0.55;','c*=1.0-sp*smoothstep(0.42,0.95,r)*0.30;']],
  FLOU_RO=[['ca=dc*amt*0.015*smoothstep(.45,.9,rb);','ca=dc*amt*0.006*smoothstep(.55,.95,rb);']]; // (ordi seul : absente du programme du téléphone)
function flouFS(f,v){const a=v?0:1,b=v?1:0;for(const r of FLOU_R)if(f.indexOf(r[a])<0)return f; // une ligne retouchée ailleurs : on ne touche à rien
  for(const r of FLOU_R.concat(FLOU_RO))f=f.replace(r[a],r[b]);return f;}
ACESShader.fragmentShader=flouFS(ACESShader.fragmentShader,1);
/* (2026-10-13, Léo : « l'effet écran quand tu ressors de l'eau, travaille-le encore plus ») L'OBJECTIF MOUILLÉ RÉFRACTE : une petite toile de
   NORMALES (LENS.cvN, au tiers de l'écran : R/G = le décalage de chaque pixel, en pixels de la toile ÷ 16) dit où chaque goutte et la nappe
   dévient l'image — la goutte agit comme une lentille (l'image derrière elle est retournée et grossie), la nappe qui s'égoutte ondule. Une
   seule lecture de texture, et seulement quand l'objectif est mouillé (uLensK) : sinon l'image est identique au bit près. */
ACESShader.uniforms.uLens={value:null};ACESShader.uniforms.uLensK={value:0};ACESShader.uniforms.uLensA={value:new THREE.Vector2(.05,.1)};
{const fs=ACESShader.fragmentShader,k=fs.indexOf('void main(){')+12;
 ACESShader.fragmentShader=fs.slice(0,k).replace('varying vec2 vUv;','varying vec2 vUv;uniform sampler2D uLens;uniform float uLensK;uniform vec2 uLensA;')+
   '\n  vec2 uvL=vUv;if(uLensK>0.001){vec2 ln9=texture2D(uLens,vUv).rg*2.-1.;if(dot(ln9,ln9)>.0004)uvL=clamp(vUv-ln9*uLensA*uLensK,vec2(.001),vec2(.999));}'+
   fs.slice(k).replace(/vUv/g,'uvL');}
/* (FLOU SANS MOTIF) les mipmaps de la cible que l'ACES relit, le temps d'une passe : three la garde en filtre LINÉAIRE sans mips (aucun
   coût ailleurs) ; quand le flou joue, on les génère et on passe en LINÉAIRE ENTRE MIPS pour cette seule lecture, puis on rend le filtre
   d'origine (la passe est déjà émise : elle garde ses mips). Une cible neuve (retaillée) repart sans mips : la 1re image du flou les crée. */
function flouMips(rd,rt,on){ try{
  const p=rt&&rt.texture&&rd.properties.get(rt.texture),gl=rd.getContext();if(!p||!p.__webglTexture)return false;
  rd.state.bindTexture(gl.TEXTURE_2D,p.__webglTexture);
  if(on)gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,on?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);return true;
}catch(e){return false;} }
const CAN_POST=typeof THREE.EffectComposer==='function'&&typeof THREE.RenderPass==='function'&&typeof THREE.UnrealBloomPass==='function'&&typeof THREE.ShaderPass==='function';
if(CAN_POST){ try{
  const w=innerWidth,h=innerHeight;
  let rt; // MSAA seulement sur desktop musclé (sinon double AA + coût MSAA inutile)
  // RT en HALF-FLOAT : un RT 8 bits + grade contrasté (SAT 1.40/VIVID) POSTERISE les grands dégradés
  // doux — sur les nuages volumétriques ça dessinait des ANNEAUX « agate » (lignes de niveau) que
  // AUCUN réglage du raymarch ne pouvait tuer. En 16 bits flottants, le banding est impossible.
  /* (2026-09-26, vérif iPhone) FILET : un tampon demi-flottant que le pilote ne sait pas REMPLIR (pas d'EXT_color_buffer_float) ne lève
     aucune erreur — il donne un écran NOIR. On l'essaie donc une fois, en 4×4 : s'il n'est pas complet, repli 8 bits (un peu de banding
     dans les grands dégradés, mais une image). Sans effet là où il marche (PC, Android, iPhone récents). */
  const f16ok=(function(){if(!(renderer.capabilities&&renderer.capabilities.isWebGL2))return false;
    try{const t=new THREE.WebGLRenderTarget(4,4,{format:THREE.RGBAFormat,type:THREE.HalfFloatType});renderer.setRenderTarget(t);
      const gl=renderer.getContext(),ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;renderer.setRenderTarget(null);t.dispose();return ok;}
    catch(e){try{renderer.setRenderTarget(null);}catch(e2){}return false;}})();
  const rtType=f16ok?THREE.HalfFloatType:THREE.UnsignedByteType;
  if(!IS_MOBILE&&!IS_LOW_END&&devicePixelRatio<1.5&&typeof THREE.WebGLMultisampleRenderTarget==='function')rt=new THREE.WebGLMultisampleRenderTarget(w,h,{format:THREE.RGBAFormat,type:rtType}); // MSAA réservé aux écrans 1× (où le crénelage se voit) — sur Retina le resolve coûte cher pour rien
  else rt=new THREE.WebGLRenderTarget(w,h,{format:THREE.RGBAFormat,type:rtType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
  composer=new THREE.EffectComposer(renderer,rt);
  composer.setPixelRatio(curDPR);composer.setSize(w,h);
  composer.addPass(new THREE.RenderPass(scene,camera));
  // BLOOM demi-résolution partout : gros gain GPU, halation quasi identique à l'œil.
  const HALO_REF=2,HALO_LOG=[3,10,28,72,176].map(Math.log2); // (2026-10-14, chaîne de couleur) la résolution où le halo a été réglé (banc : DPR 2) et le rayon de chaque étage, en log2 de texels de la base
  const bSc=IS_MOBILE?.42:IS_LOW_END?.52:.55; // bloom demi-résolution un cran plus bas sur desktop : le flou EST le produit, personne ne voit la différence
  const bRes=new THREE.Vector2(Math.max(320,Math.round(w*bSc)),Math.max(240,Math.round(h*bSc)));
  bloomPass=new THREE.UnrealBloomPass(bRes,IS_MOBILE?0.44:0.54,IS_MOBILE?0.44:.5,0.92);
  // (2026-09-26, audit rendu) `addPass` rappelle setSize(largeur×DPR) : la résolution `bSc` était IGNORÉE (mesuré : ½ au lieu de .42).
  // UnrealBloomPass prend la moitié de ce qu'on lui donne — on lui donne donc 2×bSc.
  /* LE HALO COMPOSÉ (2026-09-27, passe perf iPhone, tour 2 — « le post-traitement »). Le halo fusionné dans l'ACES relisait ses 5 mips
     à CHAQUE pixel de l'écran (740 000 × 5 lectures sur iPhone en NETTE). Ils sont désormais sommés UNE fois par image dans une petite
     cible à la taille du 1er mip (~250×530 sur iPhone : 18 % des pixels de l'écran) — mêmes poids, même écrêtage à 1, même ×alpha —
     et l'ACES n'en lit plus qu'UNE texture. C'est le « composite » d'origine d'UnrealBloomPass, mais en demi-flottant (pas l'arrondi
     8 bits d'avant) et sans la copie plein écran qui le suivait. MESURÉ (images figées, 3 niveaux, sol/vol/nitro) : ≤ 1/255, 0,005/255
     en moyenne — le 1er mip est lu pile sur ses texels, les 4 autres, déjà très flous, passent par une interpolation de plus. */
  bloomPass._cRT=new THREE.WebGLRenderTarget(2,2,{format:THREE.RGBAFormat,type:rtType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false});
  bloomPass._cRT.texture.generateMipmaps=false;
  bloomPass._cMat=new THREE.ShaderMaterial({uniforms:{t1:{value:null},t2:{value:null},t3:{value:null},t4:{value:null},t5:{value:null},w:{value:new THREE.Vector4()},w5:{value:0},a:{value:0}},
    depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec2 vUv;uniform sampler2D t1,t2,t3,t4,t5;uniform vec4 w;uniform float w5,a;void main(){gl_FragColor=vec4(clamp(w.x*'+TXL('t1','vUv')+'.rgb+w.y*'+TXL('t2','vUv')+'.rgb+w.z*'+
      TXL('t3','vUv')+'.rgb+w.w*'+TXL('t4','vUv')+'.rgb+w5*'+TXL('t5','vUv')+'.rgb,0.,1.)*a,1.0);}'});
  bloomPass._a=0; // l'alpha du halo de l'image (strength·Σpoids écrêté à 1) — relu par l'ACES
  bloomPass._wn=[0,0,0,0,0];bloomPass.norme=!/[?&]halo=large/.test(location.search); // (2026-10-14, passe graphismes · chaîne de couleur) le halo à largeur d'écran constante — voir « LE HALO GARDE SA LARGEUR » dans son rendu
  {const s0=bloomPass.setSize.bind(bloomPass);bloomPass.setSize=function(W,H){this._W=W;this._H=H;s0(Math.max(2,Math.round(W*bSc*2*BLOOM_RES)),Math.max(2,Math.round(H*bSc*2*BLOOM_RES)));
    const v0=this.renderTargetsVertical[0];if(this._cRT&&(this._cRT.width!==v0.width||this._cRT.height!==v0.height))this._cRT.setSize(v0.width,v0.height);};} // (_W/_H retenus : l'échelle QL retaille le bloom seul) — le halo composé suit le 1er mip
  /* (2026-10-14, passe perf mobile) LES ÉTAGES DU HALO, PAR PALIER. Le halo, c'est 5 étages de flou (½, ¼ … 1/32 de sa base), 2 passes
     chacun, + la passe qui les somme : 11 changements de cible par image. Sur un iPhone 7 l'image entière fait 667×375 : les deux derniers
     étages n'y pèsent que ~200 et ~50 pixels — leurs 4 passes ne coûtent pas des pixels mais 4 allers-retours de cible sur une puce à
     tuiles. ANCIEN : 3 étages (7 passes), MOYEN : 4 (9 passes), RÉCENT : 5 (11 passes, comme avant). Le poids des étages retirés se
     reporte sur le dernier calculé (même énergie, même alpha, même écrêtage) : le halo garde sa force, il s'étale juste un peu moins loin.
     Console : `bloomPass._nM=5` rend les 5 étages. Ne vaut que pour le chemin fusionné (`?bloom=ancien` garde tout). */
  PAL.B.postBloomMips=[3,4,5];bloomPass._nM=PAL.b('postBloomMips',5);
  if(REDUCED_MOTION)bloomPass.enabled=false; // reduced-motion : bloom coupé
  composer.addPass(bloomPass);
  acesPass=new THREE.ShaderPass(ACESShader);acesPass.renderToScreen=true;composer.addPass(acesPass);
  /* FUSION DU BLOOM (2026-09-27, passe perf iPhone). UnrealBloomPass finissait par DEUX passes : un « composite » qui somme ses 5 mips
     dans une cible 8 bits, puis une COPIE additive de cette cible sur l'image entière — un aller-retour plein écran en demi-flottant
     rien que pour ajouter le halo, sur un GPU à tuiles (Apple) le plus cher des deux. L'ACES relisait ensuite cette même image. Le halo
     est désormais sommé DANS l'ACES (5 lectures bilinéaires de petites textures) : deux passes de moins, dont une plein écran.
     MÊME CALCUL que ce qui se voyait (écart mesuré : 0,3/255 en moyenne au sol, au niveau du bruit en nitro) : poids `strength·mix(f,1.2−f,radius)` (= lerpBloomFactor, facteurs 1/.8/.6/.4/.2,
     teintes blanches), somme ÉCRÊTÉE à 1 (la cible 8 bits du composite l'écrêtait), puis ×alpha — la copie additive mélangeait en
     SRC_ALPHA, et l'alpha du composite valait strength·Σpoids écrêté à 1 : sous strength ≈ .29 le halo s'atténuait deux fois, ici aussi.
     Seule nuance : le halo s'ajoute APRÈS le FXAA / le flou radial au lieu d'avant (il est déjà flou : invisible — captures comparées).
     `bloomPass.fuse=false` rend l'ancien chemin (repli, banc). */
  {const R0=THREE.UnrealBloomPass.prototype.render;
   if(!R0.__fus){THREE.UnrealBloomPass.prototype.render=function(rd,wb,rb,dT,mask){
      if(!this.fuse||this.renderToScreen)return R0.apply(this,arguments);
      rd.getClearColor(this._oldClearColor);this.oldClearAlpha=rd.getClearAlpha();const oa=rd.autoClear;rd.autoClear=false;rd.setClearColor(this.clearColor,0);
      if(mask)rd.state.buffers.stencil.setTest(false);
      const pl=this.plie!==false&&this.nMips===5&&bloomPlieMat(this); // (voir PLIAGE ci-dessous ; `bloomPass.plie=false` = les 11 passes d'origine)
      if(!pl){this.highPassUniforms.tDiffuse.value=rb.texture;this.highPassUniforms.luminosityThreshold.value=this.threshold;
        this.fsQuad.material=this.materialHighPassFilter;rd.setRenderTarget(this.renderTargetBright);rd.clear();this.fsQuad.render(rd);}
      let inp=pl?rb:this.renderTargetBright;
      const nM=Math.min(this.nMips,this._nM||this.nMips); // (2026-10-14, passe perf mobile) les étages de flou de ce palier — voir postBloomMips
      for(let i=0;i<nM;i++){const m=this.separableBlurMaterials[i],hz=this.renderTargetsHorizontal[i],vt=this.renderTargetsVertical[i];
        if(pl&&i>=3&&this.plie2d!==false){const q=this._p2[i];q.uniforms.colorTexture.value=inp.texture;q.uniforms.texSize.value=m.uniforms.texSize.value; // mips 3-4 : le flou 2D en UNE passe
          this.fsQuad.material=q;rd.setRenderTarget(vt);rd.clear();this.fsQuad.render(rd);inp=vt;continue;}
        const mh=(pl&&i===0)?this._p0:m;if(mh!==m){mh.uniforms.texSize.value=m.uniforms.texSize.value;mh.uniforms.thr.value=this.threshold;mh.uniforms.sw.value=this.highPassUniforms.smoothWidth.value;}
        this.fsQuad.material=mh;mh.uniforms.colorTexture.value=inp.texture;mh.uniforms.direction.value=THREE.UnrealBloomPass.BlurDirectionX;rd.setRenderTarget(hz);rd.clear();this.fsQuad.render(rd);
        const mv=(pl&&this._pv)?this._pv[i]:m; // (tour 2, post) la passe VERTICALE lit pile ses texels : texelFetch (voir bloomPlieMat)
        this.fsQuad.material=mv;mv.uniforms.colorTexture.value=hz.texture;m.uniforms.direction.value=THREE.UnrealBloomPass.BlurDirectionY;rd.setRenderTarget(vt);rd.clear();this.fsQuad.render(rd);
        inp=vt;}
      if(this._cMat&&this.nMips===5){ // LE HALO COMPOSÉ (voir sa création) : poids `strength·mix(f,1.2−f,radius)` = lerpBloomFactor, facteurs 1/.8/.6/.4/.2
        const cu=this._cMat.uniforms,s=this.strength,r=this.radius,w0=s*(1-.8*r),w1=s*(.8-.4*r),w2=s*.6,w3=s*(.4+.4*r),w4=s*(.2+.8*r);
        for(let i=0;i<5;i++)cu['t'+(i+1)].value=this.renderTargetsVertical[Math.min(i,nM-1)].texture; // (2026-10-14) un étage non calculé lit le dernier calculé : son poids s'y reporte
        /* (2026-10-14, passe graphismes · chaîne de couleur) LE HALO GARDE SA LARGEUR À L'ÉCRAN, QUELLE QUE SOIT LA RÉSOLUTION. Les flous du halo
           se comptent en TEXELS de sa cible, et sa cible suit la résolution (curDPR × BLOOM_RES) : à DPR 1 (un iPhone en RAPIDE) le halo
           s'étalait donc DEUX FOIS plus large à l'écran qu'à DPR 2 (le banc où les ambiances ont été réglées), et il s'élargissait encore à
           chaque cran de résolution perdu — un voile laiteux autour de chaque clair, que personne n'avait réglé. Les POIDS des étages sont
           redistribués pour retrouver le profil de la référence (DPR 2, halo plein) : chaque étage de référence verse son poids sur les
           étages réels de même rayon à l'écran (rayons 3·10·28·72·176 texels de la base ; ce qui est plus fin que le 1er étage y reste).
           Même somme (même force, même alpha), que des uniformes, aucune passe ni lecture en plus. `bloomPass.norme=false` (ou
           `?halo=large`, `dbgGfx({haloNorme:0})`) rend le halo d'avant. */
        if(this.norme&&this._W){const L9=HALO_LOG,o9=this._wn,d9=Math.log2(HALO_REF/Math.max(.05,curDPR*BLOOM_RES));
          if(Math.abs(d9)>.03){const e9=[w0,w1,w2,w3,w4];o9[0]=o9[1]=o9[2]=o9[3]=o9[4]=0;
            for(let j=0;j<5;j++){const t9=L9[j]-d9;let x9=0;if(t9>=L9[4])x9=4;else if(t9>L9[0]){let i9=0;while(i9<3&&t9>L9[i9+1])i9++;x9=i9+(t9-L9[i9])/(L9[i9+1]-L9[i9]);}
              const i0=Math.floor(x9),f9=x9-i0;o9[i0]+=e9[j]*(1-f9);if(f9>0)o9[Math.min(4,i0+1)]+=e9[j]*f9;}
            cu.w.value.set(o9[0],o9[1],o9[2],o9[3]);cu.w5.value=o9[4];cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}
          else{cu.w.value.set(w0,w1,w2,w3);cu.w5.value=w4;cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}}
        else{cu.w.value.set(w0,w1,w2,w3);cu.w5.value=w4;cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}
        this.fsQuad.material=this._cMat;rd.setRenderTarget(this._cRT);rd.clear();this.fsQuad.render(rd);}
      else this._a=0;
      if(mask)rd.state.buffers.stencil.setTest(true);
      rd.setClearColor(this._oldClearColor,this.oldClearAlpha);rd.autoClear=oa;};
    THREE.UnrealBloomPass.prototype.render.__fus=true;}
   /* PLIAGE (2026-09-27, passe perf iPhone) — trois passes de moins, MÊME calcul :
      · le SEUIL (la passe « bright ») est plié dans le 1er flou horizontal : ce flou lisait la cible « bright » PILE aux centres de ses
        texels (même taille, décalages entiers), et chaque texel valait seuil(scène lue au même point) écrêté à [0,1] par la cible 8 bits.
        Il applique donc le seuil lui-même à chacune de ses 5 lectures de la scène (écrêtage compris) — une cible de moins à remplir ;
      · les deux plus petits mips (1/16 et 1/32 de la base : ~2 000 et ~500 pixels sur iPhone) font leur gaussienne en 2D en une passe
        au lieu de H puis V. Une gaussienne est séparable : Σᵢⱼ wᵢwⱼ·I = la passe V de la passe H, au même point, lue aux mêmes endroits —
        seul l'arrondi 8 bits intermédiaire disparaît. 17² et 21² lectures sur si peu de pixels : moins cher qu'un aller-retour de cible.
      13 passes plein cadre à l'origine (seuil + 10 flous + composite + copie) → 8. Compilé au 1er rendu du bloom (au menu).
      ⚠ (2026-09-27, tour 2 — « le post-traitement ») LES MIPS 3-4 REDEVIENNENT SÉPARABLES (`plie2d=false`). MESURÉ (image figée, bloom
      seul, A/B dans la même page) : le flou 2D était PLUS LENT que les deux passes qu'il remplaçait — 17² et 21² prises par pixel,
      chacune pondérée par une gaussienne recalculée (≈ 800 000 prises par image), contre 2×17 et 2×21 prises en deux passes. Chrono
      de la puce (carte PC, 585×1266) : 0,32 → 0,25 ms au sol, 0,31 → 0,23 en vol ; rendu logiciel : −5 à −10 %.
      Le seuil, lui, reste plié dans le 1er flou (sa passe séparée était plus lente sur la puce, et s'écartait jusqu'à 7/255 en nitro).
      Écart : ≤ 1-2/255 (0,03 en moyenne — l'arrondi 8 bits entre H et V d'origine revient). `?bloom=plie2d` rend le flou 2D (banc). */
   function bloomPlieMat(p){ if(p._p0)return true; try{
     const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
       gp='float gp(float x,float s){return 0.39894*exp(-0.5*x*x/(s*s))/s;}';
     p._p0=new THREE.ShaderMaterial({defines:{KR:3},uniforms:{colorTexture:{value:null},texSize:{value:new THREE.Vector2(1,1)},direction:{value:new THREE.Vector2(1,0)},thr:{value:.9},sw:{value:.01}},vertexShader:vs,
       fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;uniform vec2 texSize,direction;uniform float thr,sw;'+gp+
         'vec3 hp(vec2 u){vec4 t='+(W2_POST?'textureLod(colorTexture,u,0.0)':'texture2D(colorTexture,u)')+';float v=dot(t.xyz,vec3(0.299,0.587,0.114));return clamp(t.rgb*smoothstep(thr,thr+sw,v),0.0,1.0);}'+
         'void main(){vec2 inv=1.0/texSize;float fs=float(KR),ws=gp(0.0,fs);vec3 s=hp(vUv)*ws;for(int i=1;i<KR;i++){float x=float(i),w=gp(x,fs);vec2 o=direction*inv*x;s+=(hp(vUv+o)+hp(vUv-o))*w;ws+=2.0*w;}gl_FragColor=vec4(s/ws,1.0);}'});
     p._p2=[];for(const i of [3,4]){const K=[3,5,7,9,11][i];
       p._p2[i]=new THREE.ShaderMaterial({defines:{KR:K},uniforms:{colorTexture:{value:null},texSize:{value:new THREE.Vector2(1,1)}},vertexShader:vs,
         fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;uniform vec2 texSize;'+gp+
           'void main(){vec2 inv=1.0/texSize;float fs=float(KR),ws=0.0;vec3 s=vec3(0.0);for(int j=1-KR;j<KR;j++){float wj=gp(float(j),fs);for(int i=1-KR;i<KR;i++){float w=wj*gp(float(i),fs);s+=texture2D(colorTexture,vUv+vec2(float(i),float(j))*inv).rgb*w;ws+=w;}}gl_FragColor=vec4(s/ws,1.0);}'});}
     /* (2026-09-27, tour 2 — « le post-traitement ») LES FLOUS SANS FILTRE NI DÉRIVÉES. La passe VERTICALE de chaque mip lit une cible
        de SA taille, à des décalages entiers : chacune de ses prises tombe pile sur un texel → `texelFetch` (bord : coordonnée bornée
        = clamp to edge), même gaussienne calculée dans le même ordre : identique au bit près. Les passes HORIZONTALES réduisent (elles
        lisent le mip d'au-dessus, ou l'image) : elles gardent le filtre linéaire, mais en `textureLod(…,0)` — cibles sans mips, même
        résultat, sans le calcul de dérivées. WebGL1 : rien ne change. */
     if(W2_POST){
       p._pv=[3,5,7,9,11].map(K=>new THREE.ShaderMaterial({defines:{KERNEL_RADIUS:K,SIGMA:K},uniforms:{colorTexture:{value:null}},vertexShader:vs,
         fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;float gaussianPdf(in float x,in float sigma){return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;}'+
           'void main(){ivec2 tm=textureSize(colorTexture,0)-1,ip=min(ivec2(vUv*vec2(tm+1)),tm);float fSigma=float(SIGMA);float weightSum=gaussianPdf(0.0,fSigma);'+
           'vec3 diffuseSum=texelFetch(colorTexture,ip,0).rgb*weightSum;for(int i=1;i<KERNEL_RADIUS;i++){float x=float(i);float w=gaussianPdf(x,fSigma);'+
           'vec3 sample1=texelFetch(colorTexture,ivec2(ip.x,min(ip.y+i,tm.y)),0).rgb;vec3 sample2=texelFetch(colorTexture,ivec2(ip.x,max(ip.y-i,0)),0).rgb;'+
           'diffuseSum+=(sample1+sample2)*w;weightSum+=2.0*w;}gl_FragColor=vec4(diffuseSum/weightSum,1.0);}'}));
       for(const m of p.separableBlurMaterials)m.fragmentShader=m.fragmentShader.replace(/texture2D\( colorTexture, (vUv[^)]*)\)/g,'textureLod( colorTexture, $1, 0.0 )');}
     return true;}catch(e){p.plie=false;return false;} }
   const U9=acesPass.uniforms,bp9=bloomPass;
   U9.uBc.value=bp9._cRT.texture; // setSize garde le même objet texture : posé une fois
   bp9.fuse=bp9.plie=!/[?&]bloom=ancien/.test(location.search); // `?bloom=ancien&perf=1` : les 13 passes d'origine, pour comparer SUR le téléphone
   bp9.plie2d=/[?&]bloom=plie2d/.test(location.search); // (tour 2, post) mips 3-4 séparables par défaut (voir PLIAGE) — `?bloom=plie2d` : le flou 2D du tour 1, pour comparer sur le téléphone
   acesPass.render=function(rd,wb,rb){ // (appelle le prototype À CHAQUE FOIS, pas une copie : les bancs qui l'enveloppent continuent de mesurer l'ACES)
     U9.uBa.value=(bp9.enabled&&bp9.fuse)?bp9._a:0; // bloom éteint (réduire les animations, palier ultime) : le halo composé n'est plus à jour — on ne le lit plus
     U9.uWE.value.copy(U9.uWB.value).multiplyScalar(U9.uExposure.value); // (tour 2, post) exposition × balance, une fois par image au lieu d'une fois par pixel
     U9.uKC.value.set(U9.uContrast.value,POST_PIVOT-POST_PIVOT*U9.uContrast.value);      // …et le contraste en pente + décalage
     const mip9=FLOU_MIPS&&U9.uSpeed.value>.004&&flouMips(rd,rb,true); // (FLOU SANS MOTIF) l'image pré-floutée, seulement quand le flou joue
     try{return THREE.ShaderPass.prototype.render.apply(this,arguments);}finally{if(mip9)flouMips(rd,rb,false);}};}
  POST_ON=true;
  {const v9=document.getElementById('vig');if(v9)v9.style.display='none';} // (2026-09-26, vague 2) la vignette est dans l'ACES : un calque plein écran de moins (si le post échoue, #vig reste le repli)
  if(GRADE_ACES)document.body.classList.add('post'); // le shader étalonne → le CSS se retire (si le post échoue, la classe n'est jamais posée : le filtre reste le repli)
}catch(e){composer=null;POST_ON=false;} }

// OMBRE DE CONTACT : un blob dégradé posé au sol sous la caisse — ancre la voiture au monde (coût ~1 draw, mobile-friendly).
const contactTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,3,64,64,64);
  // (2026-09-26, vague 2) BLANC en couleur, l'alpha porte l'ombre : c'est la matière qui la TEINTE (encre). Peint en noir, la teinte de la
  // matière était multipliée par zéro — l'ombre sortait noir neutre, un trou gris sur le bitume violet.
  g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(.55,'rgba(255,255,255,.32)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(64,64,64,0,7);c.fill();return new THREE.CanvasTexture(cv);
})();
/* L'ENCRE (bible vague 2) : toute ombre du jeu est #1c0430, jamais un gris — celle qui colle la caisse au bitume la première.
   ⚠ PAS EN MÉLANGE NORMAL : l'encre (28,4,48) est plus CLAIRE que le bitume d'ORBITE (~0,0,18) — posée par-dessus, elle y aurait
   dessiné une tache violette sous la caisse (exactement ce que Sacha a banni). Elle MULTIPLIE donc le sol : dst × (1 − a·(1 − encre)).
   Une ombre qui ne peut qu'assombrir, teintée : le vert s'éteint le plus, le bleu le moins → un noir violet. La matière porte (1 − encre)
   et `premultipliedAlpha` fait ×a dans le shader ; l'opacité (fondu du télégraphe en vol) garde tout son sens. */
const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
  new THREE.MeshBasicMaterial({map:contactTex,color:new THREE.Color(1-28/255,1-4/255,1-48/255),transparent:true,depthWrite:false,fog:false,opacity:1,
    premultipliedAlpha:true,blending:THREE.CustomBlending,blendSrc:THREE.ZeroFactor,blendDst:THREE.OneMinusSrcColorFactor}));
contactShadow.renderOrder=1;contactShadow.visible=false;scene.add(contactShadow);
const Fsh={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const shTmpP=new THREE.Vector3(),shMat4=new THREE.Matrix4();
/* L'EMPREINTE (2026-09-26) — l'ombre de contact n'est plus un DISQUE : c'est l'occlusion d'une VOITURE. Un rectangle aux coins
   ronds, mou, à la taille de CETTE caisse (voie, empattement, largeur des pneus) et quatre appuis plus noirs sous les roues —
   c'est ce qui colle une caisse au bitume. L'ancien rond de 3,8 × 5,4 m, identique pour une kei-car et un mastodonte, se lisait
   comme une tache sous la voiture et ne tournait pas avec elle en glisse. Recalculée UNE fois par caisse (`userData.gen`, posé par
   buildCar) : 64 × 128 px, moins d'une milliseconde, au menu. Noir PUR en alpha : jamais une lueur. */
const EMPR={cv:null,tex:null,cvA:null,texA:null,gen:-1,PW:3.8,PL:5.4,f:new THREE.Vector3(),n:new THREE.Vector3(),r:new THREE.Vector3()};
function emprPeint(){
  if(!EMPR.cv){EMPR.cv=document.createElement('canvas');EMPR.cv.width=64;EMPR.cv.height=128;EMPR.tex=new THREE.CanvasTexture(EMPR.cv);
    EMPR.cvA=document.createElement('canvas');EMPR.cvA.width=64;EMPR.cvA.height=128;EMPR.texA=new THREE.CanvasTexture(EMPR.cvA);} // (2026-10-23) la même empreinte SANS les quatre appuis et plus floue : celle d'une caisse qui a décollé (voir garage-ombre.js)
  const sp=CARS[carGroup.userData.lvl]||CARS[0];
  let wx=sp.w*.42,wzF=sp.l*.32,wzR=sp.l*.32,tw=.3;
  let wxR=wx;if(wheels.length>=4){wx=Math.abs(wheels[1].position.x);wxR=Math.abs(wheels[3].position.x);wzF=Math.abs(wheels[1].position.z);wzR=Math.abs(wheels[3].position.z);tw=wheels[0].userData.large||.3;} // (2026-10-08) la voie de CHAQUE essieu (SQUALE : la roue unique du milieu)
  const BW=Math.max(sp.w,2*Math.max(wx,wxR)+tw)*.5,BL=Math.max(sp.l*.5,Math.max(wzF,wzR)+.35);           // demi-empreinte de la caisse
  EMPR.PW=2*BW+1.3;EMPR.PL=2*BL+1.5;                                                         // + la pénombre tout autour
  const c=EMPR.cv.getContext('2d'),im=c.createImageData(64,128),D=im.data,rc=Math.min(BW,.55),cA=EMPR.cvA.getContext('2d'),imA=cA.createImageData(64,128),DA=imA.data;
  for(let j=0;j<128;j++)for(let i=0;i<64;i++){
    const x=((i+.5)/64-.5)*EMPR.PW,z=(.5-(j+.5)/128)*EMPR.PL;                               // ligne 0 = le NEZ (le haut du canvas = +Y du plan = l'avant)
    const qx=Math.abs(x)-(BW-rc),qz=Math.abs(z)-(BL-rc);                                      // distance signée au rectangle aux coins ronds
    const dd=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-rc;
    const t=Math.min(1,Math.max(0,(dd+.3)/.9));let a=.46*(1-t*t*(3-2*t));                     // le corps : plein dessous, fondu sur ~90 cm
    const o=(j*64+i)*4,tA=Math.min(1,Math.max(0,(dd+.3)/.95)),sA=1-tA*tA*(3-2*tA);DA[o]=DA[o+1]=DA[o+2]=255;DA[o+3]=Math.round(.72*sA*255); // (2026-10-23) en l'air : le même corps, sans les quatre appuis, un peu plus dense (l'ombre d'une caisse qui vole doit se LIRE sur un plateau clair)
    const zw=z>0?wzF:wzR,ex=(Math.abs(x)-(z>0?wx:wxR))/(tw*.9),ez=(Math.abs(z)-zw)/.55;                // les quatre appuis
    a=1-(1-a)*(1-.5*Math.exp(-(ex*ex+ez*ez)*1.6));
    D[o]=D[o+1]=D[o+2]=255;D[o+3]=Math.round(a*255); // (vague 2) blanc : l'encre vient de la matière (voir contactShadow)
  }
  c.putImageData(im,0,0);EMPR.tex.needsUpdate=true;cA.putImageData(imA,0,0);EMPR.texA.needsUpdate=true;
}
function updateContactShadow(){ // appelée juste avant le rendu
  if(CHUTE&&CHUTE.on){contactShadow.visible=false;return;} // (2026-09-30) LA CHUTE : pas de sol sous elle (CHUTE est un var : undefined avant sa ligne)
  const gen9=carGroup.userData.gen||0;
  if(EMPR.gen!==gen9){EMPR.gen=gen9;emprPeint();}
  // AU GARAGE ET À LA VITRINE DU MENU aussi : la caisse posée sur son plateau ou sur la route n'avait RIEN sous elle
  const vitrine=garageOn||(((!running&&!started)||MENUV.retour)&&carGroup.visible); // (2026-09-28) l'accueil d'après-mort aussi (accueilRetour)
  if(!SHADOW_ON||(mode==='boom'&&!garageOn)||(!running&&!vitrine)){contactShadow.visible=false;return;}
  if(garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut||Math.abs(GBQ.lev||0)>.02)){contactShadow.visible=false;return;} /* (2026-10-14, Léo : « la plate sous la voiture : l'ombre se pose sur un sol invisible ») en BOUTIQUE la caisse lévite : l'empreinte la suivait en l'air ; l'ombre au sol, c'est GBQ.omb */
  const M9=contactShadow.material;
  if(vitrine||mode==='drive'){
    EMPR.f.set(0,0,1).applyQuaternion(carGroup.quaternion);                                   // le nez de la caisse (glisse et drift compris)
    const FO=garageOn&&vitrine&&typeof figOmbre==='function'?figOmbre.O:null,air9=!!(FO&&FO.on&&FO.h>.02&&performance.now()-FO.t<150); /* (2026-10-23, Léo : « une ombre plate suit la voiture pendant que ça saute ») AU GARAGE, la caisse qui a quitté le plateau laisse son ombre SUR le plateau, sous son centre, au cap — voir garage-ombre.js */
    if(air9){EMPR.n.set(0,1,0);EMPR.f.set(Math.sin(FO.psi),0,Math.cos(FO.psi));shTmpP.set(FO.x,FO.solY+.018,FO.z);}
    else if(vitrine){EMPR.n.set(0,1,0).applyQuaternion(carGroup.quaternion);shTmpP.copy(carGroup.position).addScaledVector(EMPR.n,.018);}
    else{
      frameAt(s,Fsh);
      if(side<0){Fsh.n.multiplyScalar(-1);Fsh.b.multiplyScalar(-1);}
      EMPR.n.copy(Fsh.n);
      shTmpP.copy(Fsh.p).addScaledVector(Fsh.b,lat).addScaledVector(Fsh.n,(side<0?THICK:0)+0.03); // pile sur la surface (sans le hopY : l'ombre reste au sol quand la caisse saute)
    }
    EMPR.f.addScaledVector(EMPR.n,-EMPR.f.dot(EMPR.n));
    if(EMPR.f.lengthSq()<1e-6)EMPR.f.copy(Fsh.t);EMPR.f.normalize();
    EMPR.r.crossVectors(EMPR.f,EMPR.n);                                                       // X = droite, Y = nez, Z = normale : le plan épouse la route ET suit le cap
    shMat4.makeBasis(EMPR.r,EMPR.f,EMPR.n);
    contactShadow.position.copy(shTmpP);
    contactShadow.quaternion.setFromRotationMatrix(shMat4);
    if(air9){const g9=1+.22*Math.min(FO.h,2.5);M9.map=FO.h>.05?EMPR.texA:EMPR.tex;contactShadow.scale.set(EMPR.PW*FO.kx*g9,EMPR.PL*FO.kz*g9,1);const u9=Math.min(1,Math.max(0,(FO.h-.05)/.55));M9.opacity=(.575+(.9/(1+.18*FO.h)-.575)*u9*u9*(3-2*u9));} /* .575 × .72 = .9 × .46 : le centre de l'ombre garde sa noirceur d'au sol au moment du décollage (aucun saut), puis elle s'éclaircit à peine avec l'altitude */ // en l'air : plus elle monte, plus l'ombre s'étale et s'éclaircit ; les appuis des roues s'éteignent au décollage
    else{if(M9.map!==EMPR.tex)M9.map=EMPR.tex;
      contactShadow.scale.set(EMPR.PW*carGroup.scale.x,EMPR.PL*carGroup.scale.z,1);
      M9.opacity=vitrine?.9:(side<0?1:.72);} // (2026-09-26) l'empreinte porte sa propre densité (≤ .46 sous le corps, ~.7 aux roues) ; sous la dalle elle est seule (l'ombre réelle part dans le vide)
    contactShadow.visible=true;
  }else if(mode==='fall'){
    const hgt=VOLR.on?curHOff:fallPos.y-lastNearY; // hauteur au-dessus de la route la plus proche → télégraphe d'atterrissage — (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas : le long de la normale de la dalle
    if(hgt>0.4&&hgt<46&&(VOLR.on?curLatOff*curLatOff:lastNearH2)<(ROAD_HALF+1.5)*(ROAD_HALF+1.5)){ // ...mais RIEN à survoler au-dessus d'un trou : pas d'ombre suspendue dans le vide — (route ÷2) 560 = 23,7² était la demi-route ×1,7 d'AVANT : sur la route ÷2 l'ombre « tu es au-dessus du bitume » s'allumait jusqu'à 16 m dans le vide ; désormais la dalle + une demi-caisse
      if(M9.map!==contactTex)M9.map=contactTex; // en vol, le télégraphe d'atterrissage reste le disque qui grandit avec la hauteur
      const bi9=tryLand._bi,k=1+hgt*0.05;
      if(bi9!=null&&bi9>=0&&Nn[bi9]&&curHOff>0){ // (2026-09-28) posée SUR la dalle survolée, dans son plan (sur une pente, le disque à plat s'y enfonçait à moitié)
        contactShadow.position.copy(fallPos).addScaledVector(Nn[bi9],.06-curHOff);
        contactShadow.quaternion.setFromRotationMatrix(shMat4.makeBasis(T[bi9],B[bi9],Nn[bi9]));contactShadow.scale.set(6.6*k,5.4*k,1);}
      else{contactShadow.position.set(fallPos.x,lastNearY+0.06,fallPos.z);
        contactShadow.quaternion.setFromRotationMatrix(shMat4.makeRotationX(-Math.PI/2));contactShadow.scale.set(5.4*k,6.6*k,1);} // à plat
      M9.opacity=Math.max(0,Math.min(0.7*(1-hgt/46),(hgt-.4)*1.2));contactShadow.visible=true; // (2026-09-28) en FONDU au décollage (il surgissait à .69 d'un coup)
    }else contactShadow.visible=false;
  }else contactShadow.visible=false;
}
/* LA CAISSE VIT (2026-09-26) — roues et feux, une fois par image juste avant le rendu (appelée à côté d'updateContactShadow).
   LES ROUES : elles tournaient à « vF × 2,5 » pour tout le monde — plus de deux fois trop vite, une roue de kei-car comme une roue
   de mastodonte. Désormais vitesse du SOL (posée par la conduite, `ROUES.v`) ÷ RAYON de la roue. En l'air elles filent sur leur
   élan et s'essoufflent ; au menu, au garage, à l'explosion : arrêtées ; en pause : figées (la photo garde son flou). Le pas par
   image est BORNÉ à .3 rad : au-delà l'œil ne suit plus les rayons (stroboscope) — c'est le disque de FLOU qui prend le relais.
   LES FEUX : un phare n'éblouit que celui qui le regarde EN FACE (vu de profil, un point ; vu de dos, rien) ; les feux arrière
   brillent vers la caméra de poursuite et S'EMBRASENT au frein — pouce tiré vers le bas (drift) ou ↓. La nuit (ville, orbite)
   les halos s'élargissent. Zéro allocation : tout passe par VIT9. */
const VIT9={f:new THREE.Vector3(),v:new THREE.Vector3(),frein:0,tC:new THREE.Color(0xff2818),tF:new THREE.Color(0xff5a36),trC:new THREE.Color(0xff2818),trK:0,clB:1,clW:-1,phT:{matin:0,midi:0,aprem:0,golden:.3,soir:1,nuit:1}}; // phT : les phares selon l'heure du titre (voir plus bas) · clB/clW : la lampe de carrosserie (valeur posée par la boucle / valeur dosée)
function carVit(dt){
  const boom=mode==='boom';
  if(!running||garageOn||boom)ROUES.v=0;
  else if(!paused&&mode!=='drive')ROUES.v*=Math.exp(-dt*.7);
  if(!paused&&wheels.length){
    const R0=wheels[wheels.length-1].userData.R||.45,pas=Math.max(-.3,Math.min(.3,ROUES.v/R0*dt));
    if(pas){for(const w of wheels)w.rotation.x+=pas*R0/(w.userData.R||R0);for(const e of ESSIEUX)e.rotation.x+=pas;} // (2026-09-27) les roues d'origine (hors scène, lues ailleurs) + les essieux soudés qu'on VOIT
  }
  const nuit=Math.max(LVL.pluie||0,LVL.espace||0); // (Paris) la nuit, la lampe de carrosserie reste
  /* LA LAMPE DE CARROSSERIE SE RETIRE AU SOLEIL (2026-09-26, vague 2). `carLight` (blanche, 3 m au-dessus du toit) est la clé de la caisse
     la NUIT — sans elle, en ville, une caisse noire sort #0e010f. Mais de jour elle s'ajoutait au soleil : MESURÉ au pixel en poursuite
     (banc des laques), c'est elle — plus que le vernis — qui délavait les laques (L'ÉTALON #4f8578 → #77ab98 à midi, L'AIGLE DE FEU noir
     → gris #625567) et aplatissait les volumes (une deuxième source dure, par le dessus : plus d'ombre propre). La bible : UNE source dure
     par niveau, le ciel remplit. Elle tombe donc à 38 % de jour, reste pleine la nuit. Le JOUR se lit à la lumière du ciel (`hemi`,
     posée par les biomes : .78-.95 de jour, .6 en golden, .32-.46 la nuit, sous la pluie, en orbite) — la carrière a des nuits sans
     pluie. La boucle la repose chaque image (couleur, clignotement du DERNIER, braquage) : on MÉMORISE sa valeur (`clB`) et on la dose,
     sans jamais la faire dériver en pause. */
  const j9=Math.min(1-nuit,THREE.MathUtils.smoothstep(hemi.intensity,.42,.62)); // 1 = plein jour, 0 = nuit (ville, orbite, nuits de carrière)
  if(running&&!garageOn){if(carLight.intensity!==VIT9.clW)VIT9.clB=carLight.intensity;VIT9.clW=VIT9.clB*(1-.62*j9);carLight.intensity=VIT9.clW;}
  if(ROUES.flou){let k=Math.min(.45,Math.max(0,(Math.abs(ROUES.v)-5)/14)); // (vague 2) .62 → .45 : les rayons qui tournent DESSOUS doivent transparaître, sinon on lit un enjoliveur, pas une roue lancée
   if(mode==='fall')k*=.5;                                                   // en l'air la roue file sur son élan : un voile, plus un disque
   const M9=ROUES.flou.material;M9.opacity=k;ROUES.flou.visible=k>.02;
   // le disque est NON ÉCLAIRÉ : la nuit il brillait plus fort que la roue qu'il recouvre — il suit l'obscurité (sa teinte de base dans userData)
   if(k>.02){if(!M9.userData.c0)M9.userData.c0=M9.color.clone();M9.color.copy(M9.userData.c0).multiplyScalar(.5+.5*j9);}}
  if(!HALO.h.length&&!HALO.t.length)return;
  if(!paused){const fr=((running&&!boom&&mode==='drive'&&(keys.ArrowDown||keys.KeyS||driftEnCours))||(garageOn&&BURN.feuxK>.3))?1:0; // (2026-10-07) au BURN-OUT du garage on tient le frein : les feux stop s'allument
    VIT9.frein+=(fr-VIT9.frein)*Math.min(1,dt*(fr>VIT9.frein?20:5));}
  carGroup.getWorldDirection(VIT9.f);
  VIT9.v.copy(camera.position).sub(carGroup.position);
  const d=VIT9.f.dot(VIT9.v)/Math.max(1e-3,VIT9.v.length());   // +1 : on regarde la calandre · −1 : on regarde les feux
  const fr9=VIT9.frein;
  const av=THREE.MathUtils.smoothstep(d,-.2,.8),ar=THREE.MathUtils.smoothstep(-d,-.2,.8);
  /* (2026-10-16, Léo, deux photos à l'appui : la caisse noire vue de trois-quarts — « des boules de lumière comme ça, c'est pas réaliste, ça
     cache » — et l'orange vue de face — « un peu lumineux, mais pas trop ») EN BOUTIQUE le halo des phares ne s'allume qu'en FACE : opacité et
     taille suivent av² (de face ≈ comme avant, de trois-quarts un quart, de profil rien) — la boule qui débordait du nez a disparu, la lueur sur
     le phare reste. `VIT9.bqK` fond le passage (0,25 s) ; en course et au garage, rien ne change. */
  const bqV=garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut||Math.abs(GBQ.lev||0)>.02);
  VIT9.bqK=(VIT9.bqK||0)+((bqV?1:0)-(VIT9.bqK||0))*Math.min(1,dt*4);const bk9=VIT9.bqK,av2=av*av;
  /* (2026-10-18, Sacha : « en journée les phares avant des voitures n'ont pas besoin d'être allumés ») LES PHARES S'ÉTEIGNENT AU SOLEIL : le halo
     des phares suit la NUIT DU LIEU — en course celle des lumières v2 (`LUM.nuit` : la lumière du ciel mesurée + le drapeau `nuit` du niveau,
     0 de jour, ~0,4 au soir et sous la pluie, 1 la nuit) ; sur l'écran titre (⚠ `garageOn` y vaut VRAI : le titre passe par garageRender) l'HEURE
     du titre (`VIT9.phT` : éteints du matin à l'après-midi, en veilleuse à la golden hour, allumés le soir et la nuit) ; ailleurs (la mort) le
     jour lu au ciel (`j9`). Ils s'allument à la nuit tombante, en fondu (`VIT9.ph`). Au garage et en boutique, rien ne change (le choix de Léo
     du 16/10). Les feux arrière restent. */
  const phT=CHUTE.on?VIT9.phT[TITRE_HF.h]:null;
  const ph9=phT!=null?phT:garageOn?1:LUM.actif?LUM.nuit:1-j9;VIT9.ph=VIT9.ph==null||garageOn?ph9:VIT9.ph+(ph9-VIT9.ph)*Math.min(1,dt*3);
  const phK=CAR_PHK==null?1:CAR_PHK; // (2026-10-18) des phares ESCAMOTABLES n'éclairent que levés (LA VETTE, voir CAR_PHK)
  HALO.hM.opacity=boom?0:(.95*(.3+.7*av)*(1-bk9)+.9*av2*bk9)*VIT9.ph*phK;
  for(const s9 of HALO.h)s9.visible=HALO.hM.opacity>.01;
  for(const s9 of HALO.h){const k=s9.userData.k*((.55+.5*av)*(1-bk9)+(.3+.6*av2)*bk9)*(1+.3*nuit)*(1+.45*LVL.nuit);s9.scale.set(k,k,1);} // (2026-09-30) MINUIT EN VILLE : des phares PUISSANTS
  // LES FAISCEAUX AU SOL (CARPOOL.head) : en plein jour, un phare ne dessine rien sur le bitume — la nappe chaude se retire de moitié ;
  // la nuit (ville, orbite) elle mord pour de bon. Ce sont les seuls à rester au sol, et ils sont DEVANT la caisse.
  if(CARPOOL.head&&CARPOOL.head.userData.op!=null)CARPOOL.head.material.opacity=Math.min(1,CARPOOL.head.userData.op*(.5+.6*nuit)*(1+1.1*LVL.nuit))*phK;
  /* (2026-10-16, Léo : « dans la boutique, enlève le rayon plat lumineux des phares ; les phares doivent rester un peu lumineux ») EN BOUTIQUE la
     nappe des faisceaux se retire : la caisse lévite, le plan peint restait au ras du plateau et traînait un rayon sur le sol blanc. Les HALOS des
     phares (HALO.h, plus haut) restent, adoucis : ce sont eux qui gardent les phares allumés. Rendue à la sortie (la course la repose de toute façon). */
  if(CARPOOL.head){
    if(bqV){if(CARPOOL.head.visible){CARPOOL.head.visible=false;VIT9.phBq=1;}}else if(VIT9.phBq){CARPOOL.head.visible=true;VIT9.phBq=0;}}
  HALO.tM.opacity=boom?0:Math.min(1,.85*(.35+.65*ar)+.2*fr9);
  /* (2026-10-18, traînées — Sacha : « améliore toutes les traînées ») LE FEU PREND LA COULEUR DE SA TRAÎNÉE : la traînée naît dans le feu arrière,
     mais au nitro un ruban vert, rose ou bleu sortait d'une boule ROUGE — la source et sa lumière ne se répondaient pas. Le halo du feu prend la
     teinte de la traînée à la mesure de son énergie (`VIT9.trK`/`trC`, posés par la boucle avec les traînées de lumière) et enfle d'un tiers :
     la lumière sort d'une lampe de sa couleur. Lâché, il retourne au rouge avec elle ; au garage et à l'explosion, rien ne change. */
  const tk9=(running&&!garageOn&&!boom)?VIT9.trK:0;
  HALO.tM.color.copy(VIT9.tC).lerp(VIT9.tF,fr9);if(tk9>.01)HALO.tM.color.lerp(VIT9.trC,tk9);
  for(const s9 of HALO.t){const k=s9.userData.k*(.85+.2*ar+.65*fr9)*(1+.2*nuit)*(1+.35*tk9);s9.scale.set(k,k,1);}
}
/* LES LUMIÈRES DE LA CAISSE v2 — LE PILOTE (2026-10-17, voir LUM_GLSL). `lumTick` pose chaque image, EN COORDONNÉES MONDE, ce que la caisse éclaire :
   les phares, les deux feux arrière, le feu du nitro (un trait par côté), les traînées de lumière (trois traits chacune) ; `lumVue`, chaîné sur
   scene.onBeforeRender, les passe dans le repère de LA caméra qui rend (poursuite, mode photo, chauffe) — les flaques de lumière ne glissent jamais.
   LA NUIT (`LUM.nuit`) se lit à la lumière du lieu (le ciel et le soleil posés par bioApply : ~0,55 de jour, 0,34 au soir et sous la pluie, 0,10-0,16
   la nuit, mesuré sur les 32 couples map × météo) et au drapeau `nuit` du niveau : phares et feux ne MORDENT qu'à la nuit tombante ; le feu du nitro
   éclaire toujours un peu (c'est du feu). Réglages vivants : `LUMK` (dbgLum). */
const LUMK={air:[.12,.9],hl:180000,hlC:[1,.88,.7],feu:.45,feuF:2,feuS:.7,feuR:.4,nit:.8,nitS:1.1,nitR:.5,nitL:2.4,mot:.22,tr:.1,trS:.5,trR:.8,trD:[0,12],amb:[.17,.45],nitJ:.35,car:.15,carF:1.8};
const LUM={on:false,nuit:0,hl:0,n:0,W:null /* Float32Array(LM_N*12), alloué au premier tour : LM_N est déclaré plus bas (avec le shader du bitume) */,hP:[new THREE.Vector3(),new THREE.Vector3()],hF:new THREE.Vector3(),hU:new THREE.Vector3(),hR:new THREE.Vector3(),
  k:new THREE.Vector3(),c:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Vector3(),f:0,actif:false,fA:new THREE.Vector3(),fB:new THREE.Vector3(),cc:new THREE.Color()};
function lumLampe(ax,ay,az,bx,by,bz,r,lob,cr,cg,cb,sp){ // une lampe-segment en coordonnées MONDE (voir LUM_GLSL) : A, B, rayon doux, lobe (1 = vers l'arrière), couleur × intensité, part de reflet
  if(LUM.n>=LM_N||cr+cg+cb<.004)return;const W=LUM.W,o=LUM.n*12;W[o]=ax;W[o+1]=ay;W[o+2]=az;W[o+3]=r*r;W[o+4]=bx;W[o+5]=by;W[o+6]=bz;W[o+7]=lob;W[o+8]=cr;W[o+9]=cg;W[o+10]=cb;W[o+11]=sp;LUM.n++;}
function lumNoeud(tr,d,o){ // le point de la traînée à `d` mètres de sa tête (le long du chemin), son éclat dans o.w : null au-delà de sa longueur
  const X=tr.X,Y=tr.Y,Z=tr.Z;if(d<=0){o.set(X[0],Y[0],Z[0]);return tr.K[0];}let ac=0;
  for(let i=1;i<tr.n;i++){const dx=X[i]-X[i-1],dy=Y[i]-Y[i-1],dz=Z[i]-Z[i-1],l=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(ac+l>=d){const u=l>1e-4?(d-ac)/l:0;o.set(X[i-1]+dx*u,Y[i-1]+dy*u,Z[i-1]+dz*u);return tr.K[i-1]+(tr.K[i]-tr.K[i-1])*u;}ac+=l;}
  return null;}
function lumTick(dt,kmh){
  if(!LUM.W)LUM.W=new Float32Array(LM_N*12);
  const actif=!LUMK.off&&running&&!garageOn&&started&&!gameOver; // la course seulement (LUMK.off : le banc coupe tout, dbgLum({off:1})) : le menu, le ciel du titre et le garage ont leur propre éclairage
  if(!actif){if(LUM.actif){LUM.actif=false;LUM.n=0;LUM.hl=0;LUM_U.uLmN.value=0;LUM_U.uHlC.value.setRGB(0,0,0);if(CARPOOL.head&&CARPOOL.head.userData.lumCache){CARPOOL.head.visible=true;CARPOOL.head.userData.lumCache=0;}}return;}
  LUM.actif=true;
  /* LA NUIT : la lumière du lieu (ciel + soleil, en luminance), et le drapeau du niveau (les nuits de lune claire) */
  const lu=function(c){return .2126*c.r+.7152*c.g+.0722*c.b;},amb=hemi.intensity*(lu(hemi.color)+lu(hemi.groundColor))*.5;
  const nv=Math.max(LVL.nuit||0,1-THREE.MathUtils.smoothstep(amb,LUMK.amb[0],LUMK.amb[1]));
  LUM.nuit+=(nv-LUM.nuit)*Math.min(1,dt*2);const nu=LUM.nuit,boom=mode==='boom';
  LUM.n=0;
  carGroup.getWorldDirection(LUM.hF);LUM.hU.set(0,1,0).applyQuaternion(carGroup.quaternion);LUM.hR.crossVectors(LUM.hF,LUM.hU);
  LUM.k.copy(LUM.hF).negate(); // l'ARRIÈRE de la caisse : le lobe des feux
  /* LES PHARES : sur les deux lampes du gabarit (les halos HALO.h) — une caisse sans phares (le chat) n'éclaire pas */
  const sp=CARS[level]||{w:2,l:4.4,h:1.3};
  LUM.hl+=(((boom?0:1)*nu*(CAR_PHK==null?1:CAR_PHK))-LUM.hl)*Math.min(1,dt*(boom?12:3)); // (2026-10-18) × le levé des escamotables (voir CAR_PHK)
  if(HALO.h.length){for(let j=0;j<2;j++){const h=HALO.h[Math.min(j,HALO.h.length-1)];potMonde(LUM.v.copy(h.position).setZ(h.position.z-.06),LUM.hP[j]);}}
  else{for(let j=0;j<2;j++)potMonde(LUM.v.set((j?1:-1)*sp.w*.32,.55,sp.l*.5),LUM.hP[j]);}
  if(HALO.h.length===1)LUM.hP[1].copy(LUM.hP[0]);
  /* LES FEUX ARRIÈRE : rouges, ils rayonnent vers l'arrière ; au FREIN ils s'embrasent (le même frein que leurs halos, VIT9.frein) */
  const fr=LUMK.frein!=null?LUMK.frein:(VIT9.frein||0),kf=nu*(boom?0:1)*LUMK.feu*(1+(LUMK.feuF-1)*fr);
  LUM.f=nu*(boom?0:1)*LUMK.car*(1+(LUMK.carF-1)*fr); // la lueur des feux SUR LA CAISSE (voir FEU_U)
  if(CAR_FEUX.length){potMonde(CAR_FEUX[0],LUM.fA).addScaledVector(LUM.k,.06);if(CAR_FEUX.length>1)potMonde(CAR_FEUX[1],LUM.fB).addScaledVector(LUM.k,.06);else LUM.fB.copy(LUM.fA);}else LUM.f=0;
  if(kf>.002)for(let i=0;i<Math.min(2,CAR_FEUX.length);i++){potMonde(CAR_FEUX[i],LUM.v);LUM.v.addScaledVector(LUM.k,.14);
    const k=CAR_FEUX.length===1?kf*1.6:kf;lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.v.x,LUM.v.y,LUM.v.z,LUMK.feuR,1,k*(1+.25*fr),k*(.05+.1*fr),k*.03,LUMK.feuS);}
  /* LE FEU DU NITRO : un trait par côté, de la bouche du pot le long du jet (il s'allonge avec la vitesse), à la couleur de la flamme (nitroLight :
     orange, bleu de réserve, violet de l'infini, l'or du pad, la traînée achetée…) et qui TREMBLE avec elle */
  let nI=(LUMK.nitF!=null?LUMK.nitF:nitroLight.intensity)*(boom?0:1),c=LUMK.nitF!=null?LUM.cc.setRGB(1,.48,.14):nitroLight.color; // (banc) LUMK.nitF force le feu du nitro, LUMK.frein le frein
  if(nI<.05&&MOTEUR_MINI&&!boom&&mode==='drive'&&FLM.L){let l=0;const np=Math.max(1,Math.min(4,CAR_POTS.length));for(let i=0;i<np;i++)l+=FLM.L[i]||0; // hors nitro, LA FLAMME DU MOTEUR (le mini feu de pixels) : une lueur qui crépite avec ses bouffées, la nuit
    const m=LUMK.mot*Math.min(1.6,l/np)*nu;if(m>nI){nI=m;c=LUM.cc.setRGB(1,.5,.16);}}
  if(nI>.01){const k=nI*LUMK.nit*(LUMK.nitJ+(1-LUMK.nitJ)*nu),ln=LUMK.nitL*(1+Math.min(1.4,Math.abs(kmh||0)/200));
    const pts=CAR_POT_1?[CAR_POT_C]:[CAR_POT_L,CAR_POT_R];
    for(const p of pts){potMonde(p,LUM.v);LUM.w.copy(LUM.v).addScaledVector(LUM.k,ln).addScaledVector(LUM.hU,-.05);LUM.v.addScaledVector(LUM.k,.12);
      const kk=k*(pts.length===1?1.5:1);lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.w.x,LUM.w.y,LUM.w.z,LUMK.nitR,0,c.r*kk,c.g*kk,c.b*kk,LUMK.nitS);}}
  /* LES TRAÎNÉES DE LUMIÈRE : un trait sur leurs 12 premiers mètres, à leur couleur et à leur éclat (rouge des feux au roulage, le feu du nitro) */
  const kt=QUAL_LOW?0:LUMK.tr*(.2+.8*nu)*(boom?0:1); // (qualité basse : la puce chauffe, les traînées n'éclairent plus — six lampes de moins)
  if(kt>.002)for(let i=0;i<Math.min(2,CAR_FEUX.length);i++){const tr=SILS[i];if(!tr||!tr.m.visible||tr.n<2)continue;
    const g=tr.emit?1:tr.g,cr=tr.CR[0],cg=tr.CG[0],cb=tr.CB[0];let ka=lumNoeud(tr,LUMK.trD[0],LUM.v);
    for(let s=1;s<LUMK.trD.length;s++){const kb=lumNoeud(tr,LUMK.trD[s],LUM.w);if(kb==null||ka==null)break;
      const kk=kt*g*.5*(ka+kb);lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.w.x,LUM.w.y,LUM.w.z,LUMK.trR,0,cr*kk,cg*kk,cb*kk,LUMK.trS);LUM.v.copy(LUM.w);ka=kb;}}
  /* la NAPPE PEINTE des phares (le trapèze blanc) se retire : la vraie lumière des phares est dans le bitume */
  if(CARPOOL.head&&CARPOOL.head.visible){CARPOOL.head.visible=false;CARPOOL.head.userData.lumCache=1;}
}
function lumVue(cam){ // (chaîné sur scene.onBeforeRender) monde → vue, pour LA caméra qui rend
  const U=LUM_U,e=cam.matrixWorldInverse.elements;
  const P=function(x,y,z,o,w){o.set(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14],w);};
  const D=function(v,o){o.set(e[0]*v.x+e[4]*v.y+e[8]*v.z,e[1]*v.x+e[5]*v.y+e[9]*v.z,e[2]*v.x+e[6]*v.y+e[10]*v.z);};
  if(!LUM.actif){U.uLmN.value=0;U.uHlC.value.setRGB(0,0,0);FEU_U.uFvC.value.setRGB(0,0,0);return;}
  {const f=LUM.f;FEU_U.uFvC.value.setRGB(f,f*.06,f*.03);if(f>0){P(LUM.fA.x,LUM.fA.y,LUM.fA.z,FEU_U.uFvA.value,.09);P(LUM.fB.x,LUM.fB.y,LUM.fB.z,FEU_U.uFvB.value,.09);}}
  const W=LUM.W,n=LUM.n,sp=ROAD_U.uWet.value>.01?1:0; // sp : le REFLET ne se calcule que sur l'eau — le béton sec est mat, la moitié du travail sautée
  for(let i=0;i<n;i++){const o=i*12,dx=W[o+4]-W[o],dy=W[o+5]-W[o+1],dz=W[o+6]-W[o+2],dd=dx*dx+dy*dy+dz*dz,Bv=U.uLmB.value[i];
    P(W[o],W[o+1],W[o+2],U.uLmA.value[i],W[o+3]+(W[o+7]>.5?100:0)); // le rayon² (+100 : la lampe rayonne vers l'arrière, voir LUM_GLSL)
    Bv.set(e[0]*dx+e[4]*dy+e[8]*dz,e[1]*dx+e[5]*dy+e[9]*dz,e[2]*dx+e[6]*dy+e[10]*dz,dd>1e-6?1/dd:0); // le trait A→B (en vue) et 1/|AB|² (une rotation garde les longueurs)
    U.uLmC.value[i].set(W[o+8],W[o+9],W[o+10],W[o+11]*sp);}
  U.uLmN.value=n;const c=carGroup.position;P(c.x,c.y,c.z,U.uLmS.value,324);D(LUM.k,U.uLmK.value); // la sphère utile : 18 m autour de la caisse (au-delà, un test et rien)
  const hl=LUM.hl*LUMK.hl;U.uHlC.value.setRGB(LUMK.hlC[0]*hl,LUMK.hlC[1]*hl,LUMK.hlC[2]*hl);
  if(hl>0){for(let j=0;j<2;j++){const p=LUM.hP[j];P(p.x,p.y,p.z,U.uHlP.value[j],j&&HALO.h.length===1?.4:1);} /* un seul phare (l'épave) : 1,4 lampe, pas 2 */D(LUM.hF,U.uHlF.value);D(LUM.hR,U.uHlR.value);D(LUM.hU,U.uHlU.value);}
}
window.dbgLumVue=function(d,h,az,vise){ // (banc) MODE PHOTO dans le repère de la CAISSE : d m derrière, h m au-dessus (son haut à elle), az rad autour, vise = m devant le point visé
  if(started&&!gameOver&&!paused)togglePause();
  const p=carGroup.position,F=LUM.v,U=LUM.w,R=LUM.q;carGroup.getWorldDirection(F);U.set(0,1,0).applyQuaternion(carGroup.quaternion);R.crossVectors(F,U);
  d=d==null?9:d;h=h==null?3.4:h;az=az||0;
  camera.position.copy(p).addScaledVector(F,-d*Math.cos(az)).addScaledVector(R,d*Math.sin(az)).addScaledVector(U,h);camera.up.copy(U);
  camera.lookAt(p.x+F.x*(vise||4)+U.x*.7,p.y+F.y*(vise||4)+U.y*.7,p.z+F.z*(vise||4)+U.z*.7);camera.updateMatrixWorld();camera.up.set(0,1,0);
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);};
window.dbgLumReprise=function(){if(paused)togglePause();return paused;}; // (banc) la photo a mis en pause : on repart
window.dbgLum=function(o){ // (banc) l'état des lumières de la caisse ; dbgLum({hl:12000,…}) règle LUMK à chaud ; dbgLum({hlK:[…],lmW:[…]}) les uniformes
  if(o){for(const k in o){if(k==='hlK')LUM_U.uHlK.value.fromArray(o.hlK);else if(k==='lmW')LUM_U.uLmW.value.fromArray(o.lmW);else LUMK[k]=o[k];}}
  return {actif:LUM.actif,nuit:+LUM.nuit.toFixed(2),halo:+HALO.hM.opacity.toFixed(2),halos:HALO.h.length,phK:CAR_PHK==null?null:+CAR_PHK.toFixed(2),ph:VIT9.ph==null?null:+VIT9.ph.toFixed(2),phares:+LUM.hl.toFixed(2),lampes:LUM.n,hP:LUM.hP.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),hF:LUM.hF.toArray().map(function(x){return +x.toFixed(2);}),
    uHlC:LUM_U.uHlC.value.toArray().map(function(x){return +x.toFixed(1);}),uHlP:LUM_U.uHlP.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),hlK:LUM_U.uHlK.value.toArray(),lmW:LUM_U.uLmW.value.toArray(),
    W:LUM.W?Array.from(LUM.W.slice(0,LUM.n*12)):[].map(function(x){return +x.toFixed(2);})};};
window.dbgFeuxEtude=function(o){ /* (banc, 2026-10-20, l'étude des feux) les pièces qui ÉMETTENT de la caisse (matière 'l') : leurs couleurs et leur
     nombre de sommets ; o.masque='l'|'h'|'lh'|'' cache les pièces lumineuses ('l'), les halos ('h'), ou rend tout */
  const L9=[],C9={};carGroup.traverse(function(m){if(!m.isMesh||!m.material||!m.material.isMeshBasicMaterial||!m.material.vertexColors||!m.material.userData.lp)return;L9.push(m);
    const c=m.geometry.attributes.color;if(!c)return;for(let i=0;i<c.count;i++){const k=((Math.round(c.getX(i)*255)<<16)|(Math.round(c.getY(i)*255)<<8)|Math.round(c.getZ(i)*255)).toString(16).padStart(6,'0');C9[k]=(C9[k]||0)+1;}});
  if(o&&o.boite){const bx=new THREE.Box3();carGroup.updateMatrixWorld(true);carGroup.traverse(function(q){if(q.isMesh&&!q.isSprite&&FEUXL.fais.indexOf(q)<0&&!(q.userData&&q.userData.sol)){q.geometry.computeBoundingBox();const bb=q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld);bx.union(bb);}});const cam=o.cam==='gar'&&typeof GAR!=='undefined'&&GAR.camV?GAR.camV:camera,v=new THREE.Vector3();let x0=1,y0=1,x1=-1,y1=-1;
    for(let i=0;i<8;i++){v.set(i&1?bx.max.x:bx.min.x,i&2?bx.max.y:bx.min.y,i&4?bx.max.z:bx.min.z).project(cam);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
    return {x0:(x0+1)/2,x1:(x1+1)/2,y0:(1-y1)/2,y1:(1-y0)/2};}
  if(o&&o.masque!=null){const q=o.masque;for(const m of L9)m.material.visible=q.indexOf('l')<0;HALO.hM.visible=HALO.tM.visible=q.indexOf('h')<0;if(FEUXL.cM)for(const c of FEUXL.cM)c.visible=q.indexOf('h')<0;}
  return {pieces:L9.length,couleurs:C9,halo:{h:HALO.hM.color.getHexString(),hOp:+HALO.hM.opacity.toFixed(2),t:HALO.tM.color.getHexString(),tOp:+HALO.tM.opacity.toFixed(2),n:HALO.h.length},
    faisceau:CARPOOL.head?{c:CARPOOL.head.material.color.getHexString(),op:+CARPOOL.head.material.opacity.toFixed(2),vu:CARPOOL.head.visible}:null,hlC:LUMK.hlC,headSpot:headSpot.color.getHexString()};};
/* ============ fin TRIPTYQUE ============ */

// ---------- GÉNÉRATEUR (45°, patterns pensés pour l'airtime) ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
/* ⚠ LA ROUTE S'ÉLARGIT, ET ELLE RÉTRÉCIT À CHAQUE NIVEAU (2026-09-24, user : « élargis la route ; pour les
   débutants elle réduit à chaque niveau »). `ROAD_HALF` n'est plus une constante : `lvlChoisir` la pose
   AVANT chaque `buildTrack` (voir `LARGEUR`). Tout ce qui la lit le fait à l'exécution (collisions, bords,
   pickups, bots, viseur) — sauf trois géométries PARTAGÉES bâties une fois (dos d'âne, tapis et lèvre
   du tremplin) : elles sont taillées sur `ROAD_HALF0` et chaque mesh se met à l'échelle en X. */
const ROAD_HALF0=14,THICK_ROUTE=5.2;let THICK=THICK_ROUTE; // (2026-10-15 soir, Sacha : « augmente l'épaisseur de la route ») 3,9 → 5,2 m (le double des 2,6 d'origine) — (2026-10-15, Sacha : « augmente de 50 % l'épaisseur des routes pour avoir plus de surface pour bump ») 2,6 → 3,9 m — (2026-10-12) THICK devient un let : le SOLEIL DE JADE roule sur une dalle de DEUX PIÈCES d'épaisseur (buildTrack) — // (2026-09-25 soir) la route avait été divisée par 2 (14 → 7, « réduis de moitié la largeur ») puis REDOUBLÉE à la demande (« double la largeur des routes ») : retour à 14. LARGEUR, CARR_LARG, parc ×1,4 et auto-école ×1,7 sont des MULTIPLES de ce gabarit — une ligne change toute la route
let ROAD_HALF=ROAD_HALF0*2.0;
let pts=[],T=[],Nn=[],B=[],L=0,NP=0,trackMinY=-1e9; // trackMinY : plancher du monde (référence du plongeon fatal)
/* NÉON RÉACTIF (2026-08-07) : on garde une poignée sur les matériaux des rails et de leur nappe
   pour les faire COGNER au beat. ⚠ ce sont des MATÉRIAUX, pas des meshes : la piste est rebâtie à
   chaque zone, donc ces listes se vident avec `trackMeshes` — sinon on garderait des références
   sur des matériaux disposés et le pouls s'appliquerait dans le vide. */
const NEON_RAILS=[],NEON_GLOW=[];
/* L'OVULE (portail d'arrivée) : géométrie et matériau PARTAGÉS, créés une fois — trackMeshes dispose géométrie ET matériau des
   meshes au rebuild, d'où les gardes `userData.garde` posées plus bas : ils survivent aux portails. */
const PORTAL={c:new THREE.Vector3(),R:55,noy:null,halo:null,geo:null,mat:null};
