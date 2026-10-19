// ============================================================================
//  NUAGES — MESH SIMPLES (refonte 2026-07-20, décision de Sacha)
//  Le raymarch volumétrique est SUPPRIMÉ. Pourquoi, précisément : après six rondes
//  de correctifs ratés sur le clignotement, la capture vidéo a montré la panne
//  réelle — quand la caméra entrait dans la MATIÈRE d'un nuage, le shader basculait
//  l'alpha à 1.0 D'UN COUP (`if(tHit<=t0+0.002)a=1.0`), donc PLEIN ÉCRAN blanchi sur
//  une frame, puis retour. Mesuré sur la vidéo : 10 frames blanchies sur 411, soit un
//  flash toutes les ~1,3 s. Aucun réglage ne pouvait corriger ça : ce n'était pas un
//  réglage, c'était une marche d'escalier dans le shader.
//  Avec des mesh OPAQUES, ce bug devient STRUCTURELLEMENT impossible : plus de
//  transparence (donc plus d'ordre de tri entre nuages), plus de gl_FragDepth, plus
//  de discard, plus de raymarch, plus d'uniformes poussés à chaque frame.
//  Un nuage = quelques SPHÈRES FUSIONNÉES en UN seul mesh, éclairé par les lumières
//  du biome (Lambert → il suit les 10 ambiances tout seul). On le TRAVERSE toujours :
//  DoubleSide et aucune collision — dedans, on voit sa paroi, c'est le white-out.
//  ⚠ NE PAS réintroduire de transparence ni de shader ici sans demande explicite.
// ============================================================================
// BRILLANCE (2026-07-30) : Lambert → Phong. Un spéculaire LARGE et doux (shininess bas) fait NAPPER la
// lumière sur les bourgeons au lieu de piquer — c'est ce qui donne l'ourlet lumineux des vraies photos.
// + un soupçon d'emissive pour que la ouate ne meure jamais en gris dans les biomes sombres.
/* LE MODELÉ DES NUAGES v2 (2026-09-26) — MESURÉ sur captures : les nuages se lisaient en PILES D'ASSIETTES (des stries horizontales
   dans chaque boule) et on voyait leur intérieur. Deux causes, aucune n'était un réglage :
   (1) DoubleSide + transparent : les faces ARRIÈRE de chaque sphère se peignaient dans l'ordre des triangles, tantôt devant tantôt
       derrière les faces avant de l'anneau voisin → des bandes. Hors du nuage, on n'a AUCUNE raison de voir l'envers de la ouate :
       `CLOUD_MAT` est en FrontSide (moitié moins de pixels à mélanger : un titan plein écran ne se paie plus deux fois).
       DEDANS (la caméra dans l'ellipsoïde, voir updateClouds), le nuage prend `CLOUD_MAT_IN` — la même matière en DoubleSide :
       le white-out d'avant, paroi comprise. Les DEUX programmes sont chauffés au menu (`nuageChauffe`).
   (2) les boules fusionnées gardaient leurs morceaux ENFOUIS dans les voisines : à 82 % d'opacité on les voyait par transparence.
       `mergeSpheres` jette désormais tout triangle entièrement noyé dans une autre boule (moins de sommets, en prime).
   LE MODELÉ : une couleur par sommet cuite une fois (ventre ombré bleuté → sommet blanc, creux entre deux bourgeons assombris)
   et, dans le shader, la LISIÈRE D'ARGENT — face au soleil, le bord de la ouate s'embrase (diffusion avant) — plus un bord
   à peine plus léger. Coût : zéro par image côté CPU, quelques instructions par pixel côté GPU (et deux fois moins de pixels). */
const GFX_U={uCoeur:{value:1.16},uNearF:{value:new THREE.Vector2(10,40)},uUpV:{value:new THREE.Vector3(0,1,0)},uNuSun:{value:new THREE.Vector3(1.1,.98,.84)},uNuSky:{value:new THREE.Vector3(.9,.98,1.2)},uNuGnd:{value:new THREE.Vector3(.98,.94,1.2)},uDragon:{value:new THREE.Vector3(1,.92,1.08)}}; // uNearF : le fondu des nuages de coton près de l'objectif (m) — 10-40 au sol, 30-110 en vol (posé par la boucle) // (2026-09-28, passe graphismes mobile) le cœur plein des nuages (1 = l'ancienne ouate à 82 % partout) — voir dbgGfx
function nuageShader(sh){
  sh.uniforms.uSunV=RIM_U.uSunV;sh.uniforms.uSunC={value:sun.color};sh.uniforms.uCoeur=GFX_U.uCoeur;sh.uniforms.uNearF=GFX_U.uNearF;
  sh.uniforms.uUpV=GFX_U.uUpV;sh.uniforms.uNuSun=GFX_U.uNuSun;sh.uniforms.uNuSky=GFX_U.uNuSky;sh.uniforms.uNuGnd=GFX_U.uNuGnd;sh.uniforms.uDragon=GFX_U.uDragon; // (Dragons) la lumière de peintre // la direction du soleil en espace vue (posée chaque image pour les caisses) et SA couleur de biome
  sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',LFB_SANS_PL) // (2026-09-26) les nuages ne paient plus les lumières ponctuelles (voir LFB_SANS_PL)
    .replace('#include <common>','#include <common>\nuniform vec3 uSunV,uSunC,uUpV,uNuSun,uNuSky,uNuGnd,uDragon;uniform float uCoeur;uniform vec2 uNearF;')
    .replace('#include <envmap_fragment>',[
      '#ifdef NUAGE_DEDANS',                                              // DEDANS : ni liseré ni bord — la paroi se fond dans la brume du nuage (white-out uni)
      '#ifdef USE_FOG',
      '  outgoingLight=mix(outgoingLight,fogColor,.55);',
      '#endif',
      '#else',
      '{ vec3 V9=normalize(vViewPosition);float fr9=1.-abs(dot(normal,V9));',
      '  float cs9=max(dot(-V9,uSunV),0.);',                              // 1 = on regarde droit vers le soleil
      // LA LUMIÈRE DE PEINTRE (2026-09-29, « Dragons ») : la ouate garde SA luminance (Phong + modelé cuit) mais sa TEINTE suit la lumière
      // du film — côté soleil crème-or (uNuSun), côté ombre bleu ciel sur les flancs (uNuSky) et lavande sous le ventre (uNuGnd), avec
      // une frontière douce (wr9) et un vrai contraste (.84 à l ombre, ×1,1 au soleil). Couleurs du biome, normalisées en luminance (bioApply).
      '  { float nl9=dot(normal,uSunV),wr9=smoothstep(-.3,.75,nl9),up9=smoothstep(.15,.85,dot(normal,uUpV)*.5+.5);',
      '    float lm9=dot(outgoingLight,vec3(.299,.587,.114));',
      '    vec3 pt9=lm9*mix(mix(uNuGnd,uNuSky,up9)*uDragon.y,uNuSun*uDragon.z,wr9)*mix(vec3(1.),outgoingLight/max(lm9,.001),.5);', // (v6) la moitié de la teinte PROPRE du nuage reste (sa couleur par instance)
      '    outgoingLight=mix(outgoingLight,pt9,uDragon.x);}',
      '  outgoingLight+=uSunC*pow(fr9,2.6)*(.07+.75*cs9*cs9*cs9);',     // LA LISIÈRE D ARGENT : le bord s embrase à contre-jour
      // LE CŒUR PLEIN (2026-09-28, « plus beau sur iPhone sans coût en plus ») : à 82 % partout, un bourgeon peint AVANT son voisin
      // de devant restait visible au travers — on lisait les boules empilées dans la ouate (arcs et bords internes, mesuré sur captures).
      // Le cœur, vu de face, monte à ~95 % ; la vapeur garde ses 82 % là où la ouate tourne (fr9 > .62) puis s allège au liseré.
      '  diffuseColor.a=min(1.,diffuseColor.a*mix(uCoeur,1.,smoothstep(.12,.62,fr9)))*(1.-pow(fr9,7.)*.45);', // le tout dernier liseré de la silhouette s allège
      '#ifdef NUAGE_INST',
      '  diffuseColor.a*=smoothstep(uNearF.x,uNearF.y,length(vViewPosition));',     // (ciel de coton) traversé, le nuage s efface AUTOUR de l objectif au lieu de claquer (10-40 m : à 60 m de l accueil il restait fantôme)
      '#endif',
      '}',
      '#endif',
      '#include <envmap_fragment>'].join('\n'));
}
// plus VAPOREUX (.9→.82) et un éclat un peu plus net sur les bourgeons
const CLOUD_MAT=new THREE.MeshPhongMaterial({color:0xeae6f2,side:THREE.FrontSide,transparent:true,opacity:.82,depthWrite:true,vertexColors:true,
  shininess:14,specular:0x8f89a4,emissive:0x201d2c,emissiveIntensity:.62,flatShading:false});
CLOUD_MAT.onBeforeCompile=nuageShader;
CLOUD_MAT.customProgramCacheKey=function(){return 'nuageV2';};
const CLOUD_MAT_IN=CLOUD_MAT.clone();CLOUD_MAT_IN.side=THREE.DoubleSide;CLOUD_MAT_IN.opacity=.93;CLOUD_MAT_IN.defines={NUAGE_DEDANS:''}; // DEDANS : la même ouate, paroi comprise (white-out) — une seule épaisseur de paroi (les boules enfouies ont sauté) : plus dense, et fondue dans la brume du nuage, sinon on y lisait les facettes
CLOUD_MAT_IN.color=CLOUD_MAT.color;CLOUD_MAT_IN.emissive=CLOUD_MAT.emissive;CLOUD_MAT_IN.specular=CLOUD_MAT.specular; // MÊMES objets couleur : bioApply teinte les deux d'un coup
CLOUD_MAT_IN.onBeforeCompile=nuageShader;CLOUD_MAT_IN.customProgramCacheKey=function(){return 'nuageV2dedans';};
const CLOUD_MAT_IN8=CLOUD_MAT_IN.clone();CLOUD_MAT_IN8.vertexColors=false;CLOUD_MAT_IN8.color=CLOUD_MAT.color;CLOUD_MAT_IN8.emissive=CLOUD_MAT.emissive;CLOUD_MAT_IN8.specular=CLOUD_MAT.specular;CLOUD_MAT_IN8.onBeforeCompile=nuageShader;CLOUD_MAT_IN8.customProgramCacheKey=function(){return 'nuageV2dedans8';}; // (v8) le white-out d'un nuage v8 : ses couleurs de sommet sont un MODELÉ cuit (creux, ombre, hauteur), pas une teinte
let nuageChaud=false,nuageFondu=1; // nuageFondu : 0→1, la ouate d'une nouvelle zone APPARAÎT au lieu de surgir (voir buildClouds)
function nuageChauffe(){ // (2026-09-26) les deux programmes de nuage compilés AU MENU — jamais au premier nuage traversé en pleine course
  nuageChaud=true;cotonInit(); // (ciel de coton) ses instances sont dans la scène : renderer.compile les prend avec
  const g=mergeSpheres([[0,0,0,.6,1],[.4,.1,0,.45,1]],2,2,2),a=new THREE.Mesh(g,CLOUD_MAT),b=new THREE.Mesh(g,CLOUD_MAT_IN),c9=new THREE.Mesh(g,nuage8Solo()),d9=new THREE.Mesh(g,CLOUD_MAT_IN8);
  a.position.copy(camera.position);b.position.copy(camera.position);a.frustumCulled=b.frustumCulled=false;if(c9){c9.position.copy(camera.position);c9.frustumCulled=false;scene.add(c9);d9.position.copy(camera.position);d9.frustumCulled=false;scene.add(d9);} // (v8) la matière des maillages seuls
  const vt9=[];{const MS=nuVitMats(true);for(const m9 of [MS.cub,MS.coe,MS.pea,MS.fan]){const x=new THREE.Mesh(g,m9);x.position.copy(camera.position);x.frustumCulled=false;scene.add(x);vt9.push(x);}} // (vitrail) les trois matières des nuages seuls
  scene.add(a);scene.add(b);try{renderer.compile(scene,camera);}catch(e){}scene.remove(a);scene.remove(b);if(c9){scene.remove(c9);scene.remove(d9);}for(const x of vt9)scene.remove(x);g.dispose();
}
// FINESSE : à 16×11 les grosses boules (r 200-700) montraient leurs FACETTES — d'où les « formes
// triangulaires ». On monte la définition sur desktop (mobile reste au gabarit léger).
const CLOUD_SPH_LO=new THREE.SphereGeometry(1,10,7); // (2026-09-30) l'ÉBAUCHE d'un coussin ou d'une tour, le temps que l'ouvrier rende la forme fine
const CLOUD_SPH=new THREE.SphereGeometry(1,(IS_MOBILE||IS_LOW_END)?16:20,(IS_MOBILE||IS_LOW_END)?11:14); // gabarit recopié/fusionné (24×16 mangeait 25 fps : 20×14 lisse assez)
// Fusionne N sphères (x,y,z,rayon en coords locales) en UNE géométrie : un nuage = un draw call.
function mergeSpheres(blobs,rx,ry,rz){
  const src=CLOUD_SPH, sp=src.attributes.position.array, sn=src.attributes.normal.array, si=src.index.array;
  const nv=sp.length/3, nb=blobs.length;
  const pos=new Float32Array(nv*3*nb), nor=new Float32Array(nv*3*nb), col=new Float32Array(nv*3*nb);
  const idx=(nv*nb<65535)?new Uint16Array(si.length*nb):new Uint32Array(si.length*nb),noy=new Uint8Array(nv*nb);let ni=0;
  // les boules en coordonnées locales : centre + demi-axes (pour savoir si un sommet est ENFOUI dans une voisine, ou s'il la frôle)
  const E=blobs.map(function(B){const fy=(B[4]===undefined?1:B[4]);return [B[0]*rx,B[1]*ry,B[2]*rz,B[3]*rx,B[3]*ry*fy,B[3]*rz];});
  const VR=.72,VG=.76,VB=.93; // (2026-09-26) le VENTRE : un bleu-lavande, l'ombre du ciel sous la ouate (jamais un gris sale)
  for(let b=0;b<nb;b++){
    // 5e composante = APLATISSEMENT VERTICAL de CETTE boule : c'est elle qui donne les bases plates
    // de cumulus et l'ENCLUME étalée du cumulonimbus (sans elle, tout est sphérique = bonbons).
    const B=blobs[b], fy=(B[4]===undefined?1:B[4]);
    const ox=B[0]*rx, oy=B[1]*ry, oz=B[2]*rz, sx=B[3]*rx, sy=B[3]*ry*fy, sz=B[3]*rz;
    const vo=b*nv*3, vb=b*nv, Eb=E[b], rb=Math.max(Eb[3],Eb[4],Eb[5]);
    const voi=[];for(let c=0;c<nb;c++){if(c===b)continue;const Ec=E[c],dx=Ec[0]-Eb[0],dy=Ec[1]-Eb[1],dz=Ec[2]-Eb[2],rc=Math.max(Ec[3],Ec[4],Ec[5]);
      if(dx*dx+dy*dy+dz*dz<(rb+rc*1.4)*(rb+rc*1.4))voi.push(Ec);} // seules les voisines qui peuvent toucher cette boule
    for(let i=0;i<nv;i++){
      const px=sp[i*3]*sx+ox, py=sp[i*3+1]*sy+oy, pz=sp[i*3+2]*sz+oz;
      pos[vo+i*3]=px; pos[vo+i*3+1]=py; pos[vo+i*3+2]=pz;
      // normale corrigée du non-uniforme (inverse des échelles), sinon l'éclairage ment sur les nuages aplatis
      let nx=sn[i*3]/sx, ny=sn[i*3+1]/sy, nz=sn[i*3+2]/sz;
      const l=Math.hypot(nx,ny,nz)||1; nor[vo+i*3]=nx/l; nor[vo+i*3+1]=ny/l; nor[vo+i*3+2]=nz/l;
      // (2026-09-26) ENFOUI dans une voisine → noté (le triangle entier sautera) ; À LA FRONTIÈRE d'une voisine → le creux s'assombrit
      let ao=0;
      for(let k=0;k<voi.length;k++){const e=voi[k],dx=(px-e[0])/e[3],dy=(py-e[1])/e[4],dz=(pz-e[2])/e[5],d2=dx*dx+dy*dy+dz*dz;
        if(d2<.9409){noy[vb+i]=1;break;} if(d2<1.96)ao+=(1.4-Math.sqrt(d2))/.43;} // (.97² et 1,4² : la racine seulement quand elle sert)
      const h=Math.max(0,Math.min(1,(py/ry+.85)/1.2)),hh=h*h*(3-2*h),o=1-.26*Math.min(1,ao); // hh : 0 au ventre, 1 passé la mi-hauteur
      col[vo+i*3]=(VR+(1-VR)*hh)*o; col[vo+i*3+1]=(VG+(1-VG)*hh)*o; col[vo+i*3+2]=(VB+(1-VB)*hh)*o;
    }
    for(let i=0;i<si.length;i+=3){const a=si[i]+vb,c1=si[i+1]+vb,c2=si[i+2]+vb;
      if(noy[a]&&noy[c1]&&noy[c2])continue; // triangle entièrement ENFOUI dans une voisine : invisible, on ne le dessine plus
      idx[ni++]=a;idx[ni++]=c1;idx[ni++]=c2;}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); // (2026-09-28, chasse aux gels) tableaux neufs et à nous : posés TELS QUELS (Float32BufferAttribute en refaisait une copie chacun)
  g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3)); // (2026-09-26) le modelé cuit (ventre, creux)
  g.setIndex(new THREE.BufferAttribute(idx.slice(0,ni),1));
  sphere9(g); // = computeBoundingSphere, au flottant près (voir pisteTranches)
  return g;
}
/* LE CIEL DE COTON — NUAGES v3 (2026-09-28, Sacha : « lance une refonte des nuages : plus de nuages, plus jolis, plus dans la forme
   classique qu'on imagine ; il faut qu'ils soient magnifiques et un peu partout autour de la route — donc ils doivent être légers »).
   AVANT : ~90 nuages, chacun SON maillage (5 à 20 boules souvent APLATIES : des « piles d'assiettes »), ~90 appels de dessin, jusqu'à
   6 000 triangles pièce même au bout du ciel.
   · LA FORME CLASSIQUE (`cotonBlobs`) : le nuage qu'on dessine enfant — une rangée de BASE aux bourgeons aplatis (le dessous plat, le
     niveau de condensation), un étage de bourgeons RONDS, un DÔME qui domine et de petits bourgeons qui débordent. Six gabarits :
     classique, bas et large, tour (congestus), flocon, banc, double dôme. Au-dessus de la base, plus aucune boule aplatie.
   · LE MODELÉ (`cotonGeo`, cuit une fois) : ventre lavande → sommet blanc sur la HAUTEUR du nuage, creux assombris entre deux
     bourgeons, le liseré d'argent du shader des nuages (inchangé) ; les faces enfouies dans une voisine ne sont pas gardées.
   · LÉGER : le décor devient des INSTANCES de six gabarits × quatre finesses (7×5 · 10×7 · 16×11 · 22×15) — ~12 appels de dessin
     pour ~350 nuages. À chaque rendu (`cotonTick`, chaîné sur scene.onBeforeRender) : hors du champ = pas envoyé, la finesse suit la
     TAILLE À L'ÉCRAN (une facette sous ~1,7° : un titan au loin garde sa rondeur, un petit nuage au loin se contente de 7×5), et
     chaque lot TRIÉ du plus loin au plus près (la ouate est translucide). Programme compilé au menu (`nuageChauffe`), 0 en course.
   · PARTOUT AUTOUR DE LA ROUTE, JAMAIS DESSUS : une couronne proche (50-350 m du bord, du dessous au-dessus du ruban), des nuages
     au-dessus et en dessous de la route, une couronne du milieu (0,4-1,3 km) et le lointain (1,3-3 km) ; les massifs et les titans du
     ciel organisé y passent aussi (gabarit tour). Garde `cotonTouche` = nuageTouche sur une grille de 120 m.
   · Restent des maillages À PART (ils ont un rôle) : les bancs SUR la route, les coussins de VOL (recharge d'airtime) et les tours
     géantes qu'on traverse (white-out) — eux aussi prennent la forme classique —, la mer, les voiles et tout ce que pose la campagne.
   · Traversé, un nuage de coton s'efface autour de l'objectif (fondu 10-40 m dans le shader) au lieu de claquer.
   Hook : `dbgCoton()` (nuages, envoyés près/loin, triangles, ms). */
const COTON={S:[],im:[],I:null,n:0,cap:560,mat:null,grid:null,root:null,L:null,M:new THREE.Matrix4(),Q:new THREE.Quaternion(),Sc:new THREE.Vector3(), // (v4) 420 → 480 : les petits nuages en plus
  P:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0),fr:new THREE.Frustum(),pv:new THREE.Matrix4(),nN:0,nF:0,tri:0,ms:0,
  SEG:[[7,5],[10,7],[16,11],[22,15]],FAC:73,CH:.45}; // les QUATRE finesses d'un gabarit ; FAC : on prend la plus légère dont une facette reste sous ~1,7° à l'écran (segments ≥ 73·R/d)
/* (2026-10-14, passe graphismes — Sacha : « dans la map chinoise il faut les mêmes nuages que dans la map normale ») LES PICS DE JADE
   PRENNENT LE CIEL DE COTON : les volutes en cubes (NUVOX, 353 000 triangles / 26 appels) ne sont plus bâties ni dessinées ; à leur place,
   les cumulus de la Mer de nuages (mêmes gabarits, mêmes instances, même matière déjà compilée au menu — rien de neuf pour la puce),
   posés par `cotonJade` ENTRE et DERRIÈRE les pics, à l'altitude de la brume. `?nucubes=1` (ou true ici) : les cubes reviennent, tels quels. */
/* LE BUDGET (session OPTIMISATION) : palier 0 ≤ 40 000 triangles / 6 appels · 1 ≤ 90 000 / 10 · 2 ≤ 180 000 / 16, par image. Tenu par
   construction : `K` = les gabarits permis (3 pour la 1re tranche, 5 ensuite), `f` = la finesse la plus fine permise par palier (donc
   3×2, 5×2, 5×3 lots au plus), `n` = nuages par km de piste dans chaque TRANCHE — les tranches sont posées l'une après l'autre et
   cotonTick n'envoie que les `lim[palier]` premiers : le palier peut changer en course sans rien rebâtir. */
const COTON_JADE={n:[3.6,3.8,5],f:[1,1,2],K:[[1,4,0],[1,4,0,2,3]],lim:[0,0,0],force:null}; // gabarits : 1 humilis · 4 stratocumulus · 0 mediocris · 2 congestus · 3 humilis
function cotonPalier(){ // 0 ancien iPhone · 1 moyen · 2 récent — `PAL.n` (socle de la passe perf) s'il existe, sinon les crans de qualité
  if(COTON_JADE.force!=null)return COTON_JADE.force;
  try{if(typeof PAL==='object'&&PAL&&typeof PAL.n==='number')return Math.max(0,Math.min(2,PAL.n|0));}catch(e){}
  return QUAL_LOW?0:QUAL_MED?1:2;}
const N8_FIN=[12,18,26,48]; // (SON, mesuré : de près, en vol, une surface lisse « en plastique ») la finesse du tout près monte à 48 : les petits bourgeons s'y dessinent // (mesuré, banc perf de DEBUGGING : 14/22/32/46 avec des seuils trop fins = 449 k triangles au sol, contre 153 k avant)
const N8_GENRE6=['mediocris','humilis','congestus','humilis','stratocumulus','mediocris'];
const N8_GENRE_V={champignon:'congestus'}; // (v8) le « champignon » (une tête sur un cou) se lisait comme un ARBRE de près : un congestus de plus ; l'ENCLUME est réservée aux titans lointains (kind 24) // (v8) le « champignon » (une tête sur un cou) se lisait comme un ARBRE : c'est un congestus de plus // (v8) les six gabarits « classiques » deviennent des cumulus de ces genres
const N8_OPT={K:5.5,det:.3,fq:1}; // (v8) le champ : netteté des bourgeons, force et finesse du chou-fleur // les quatre finesses de la surface (cellules sur la plus grande dimension du nuage)
const COTON_KINDS=25; // (v8) + le 25e : le CUMULONIMBUS des titans et du colosse (jamais tiré au hasard, jamais près de la route) // (v6) les 6 gabarits classiques + 18 tirés au hasard (cotonAleat : neuf genres)
const COTON_ST=13;    // (v4) une instance = x, dessous, z, r, cap, gabarit, phase, hauteur, ÉTIREMENT largeur, ÉTIREMENT hauteur — (v6) + sa TEINTE r, v, b
function cotonBlobs(k,rng){ // un gabarit : [x,y,z,rayon,aplatissement] en unités du nuage (demi-largeur ~1), base à y = −.35
  const B=[],J=function(a){return (rng()-.5)*a;},base=-.35;
  const bas=function(x,z,r,fy){fy=fy||.55;B.push([x+J(.06),base+r*fy,z+J(.1),r,fy]);};    // bourgeon de BASE : aplati, posé sur le niveau de condensation
  const rond=function(x,y,z,r){B.push([x+J(.05),y+J(.05),z+J(.08),r*(.92+rng()*.16),1]);}; // bourgeon ROND
  if(k===0){ // CLASSIQUE
    for(const x of [-.66,-.33,0,.33,.66])bas(x,0,Math.abs(x)>.5?.25:.31);bas(0,.26,.3,.6);bas(-.1,-.24,.28,.6);
    rond(-.40,-.02,0,.35);rond(-.04,.02,.05,.40);rond(.33,-.03,0,.34);
    rond(-.08,.32,0,.40);rond(.27,.24,.02,.26);rond(-.44,.16,-.02,.22);}
  else if(k===1){ // BAS ET LARGE
    for(const x of [-.8,-.48,-.16,.16,.48,.8])bas(x,J(.2),Math.abs(x)>.6?.22:.27);
    rond(-.35,-.08,0,.30);rond(.05,-.05,0,.33);rond(.42,-.1,0,.27);rond(-.02,.16,0,.30);}
  else if(k===2){ // TOUR (congestus) : elle monte à ~1,2
    for(const x of [-.5,-.17,.17,.5])bas(x,J(.2),.30,.6);
    rond(-.3,.05,0,.38);rond(.25,.07,0,.37);rond(0,.12,.12,.34);
    rond(-.16,.44,0,.36);rond(.18,.46,0,.33);
    rond(0,.78,0,.34);rond(-.26,.66,0,.22);rond(.27,.64,0,.20);rond(.06,.98,0,.20);}
  else if(k===3){ // FLOCON
    for(const x of [-.4,0,.4])bas(x,0,.30,.6);
    rond(-.2,.06,0,.34);rond(.22,.08,0,.32);rond(0,.30,0,.33);}
  else if(k===4){ // BANC
    for(let i=0;i<8;i++)bas(-.88+i*.25,J(.3),.22);
    for(let i=0;i<5;i++)rond(-.66+i*.33,-.1,J(.1),.25);
    rond(-.2,.08,0,.26);rond(.28,.06,0,.24);}
  else{ // DOUBLE DÔME
    for(const x of [-.7,-.36,0,.36,.7])bas(x,0,Math.abs(x)>.5?.25:.30);
    rond(-.42,0,0,.34);rond(0,-.04,0,.33);rond(.42,0,0,.34);
    rond(-.36,.30,0,.34);rond(.38,.28,0,.32);rond(0,.20,0,.24);}
  let top=base;for(const b of B)top=Math.max(top,b[1]+b[3]*b[4]);
  return {B:B,base:base,top:top};
}
const COTON_GENRES=['humilis','humilis','mediocris','mediocris','mediocris','congestus','congestus','congestus','castellanus','castellanus','fractus',
  'stratocumulus','stratocumulus','altocumulus','altocumulus','cisaille','cisaille','champignon']; // (v6) les 18 gabarits tirés (indices 6 à 23)
function cotonGenre(k){return k<6?'classique':COTON_GENRES[k-6];}
function cotonDe(cr,gs){const L9=[];for(const g of gs){if(typeof g==='number')L9.push(g);else for(let k=0;k<COTON_GENRES.length;k++)if(COTON_GENRES[k]===g)L9.push(6+k);}return L9[cr()*L9.length|0];} // un gabarit parmi ces genres (ou ces classiques)
function cotonR(cr,a,b,p){return a*Math.pow(b/a,Math.pow(cr(),p||1.7));} // une TAILLE en loi de puissance : beaucoup de petits, quelques géants
function cotonCalc(Bb,base,top,sp,sn,si,CH){ // (2026-09-30) le CALCUL d'une forme de nuage, PUR (aucune variable du jeu, ni THREE) : il tourne aussi dans l'OUVRIER
  const nv=sp.length/3,nb=Bb.length;
  const pos=new Float32Array(nv*3*nb),nor=new Float32Array(nv*3*nb),col=new Float32Array(nv*3*nb),noy=new Uint8Array(nv*nb);
  const idx=(nv*nb<65535)?new Uint16Array(si.length*nb):new Uint32Array(si.length*nb);let ni=0;
  const H=Math.max(.1,top-base),VR=.70,VG=.74,VB=.93;
  for(let b=0;b<nb;b++){const e=Bb[b],ox=e[0],oy=e[1],oz=e[2],r=e[3],ry=e[3]*e[4],vo=b*nv*3,vb=b*nv;
    const voi=[];for(let c=0;c<nb;c++){if(c===b)continue;const q=Bb[c],dx=q[0]-ox,dy=q[1]-oy,dz=q[2]-oz,rr=r+q[3]*1.4;if(dx*dx+dy*dy+dz*dz<rr*rr)voi.push(q);}
    for(let i=0;i<nv;i++){const px=sp[i*3]*r+ox,py=sp[i*3+1]*ry+oy,pz=sp[i*3+2]*r+oz;
      pos[vo+i*3]=px;pos[vo+i*3+1]=py;pos[vo+i*3+2]=pz;
      const nx=sn[i*3]/r,ny=sn[i*3+1]/ry,nz=sn[i*3+2]/r,l=Math.hypot(nx,ny,nz)||1;
      /* (v7) LA NORMALE DE CHAMP : la lumière suit le gradient d'un champ LISSE (une gaussienne par bourgeon — le sien et ses voisins),
         mêlée à la normale de la boule (COTON.CH) — le nuage prend la lumière comme UNE masse de ouate aux bosses rondes, plus comme
         une grappe de ballons qui ont chacun leur reflet et une ligne sombre à chaque soudure. La silhouette ne change pas. */
      let gx=0,gy=0,gz=0;
      for(let k=-1;k<voi.length;k++){const q=k<0?e:voi[k],qy=q[3]*q[4],dx=(px-q[0])/q[3],dy=(py-q[1])/qy,dz=(pz-q[2])/q[3],w=Math.exp(-1.3*(dx*dx+dy*dy+dz*dz));gx+=w*dx/q[3];gy+=w*dy/qy;gz+=w*dz/q[3];}
      const lg=Math.hypot(gx,gy,gz),C9=CH;
      let mx=nx/l,my=ny/l,mz=nz/l;if(lg>1e-6){mx=mx*(1-C9)+gx/lg*C9;my=my*(1-C9)+gy/lg*C9;mz=mz*(1-C9)+gz/lg*C9;}
      const lm=Math.hypot(mx,my,mz)||1;nor[vo+i*3]=mx/lm;nor[vo+i*3+1]=my/lm;nor[vo+i*3+2]=mz/lm;
      let ao=0;for(let k=0;k<voi.length;k++){const q=voi[k],qy=q[3]*q[4],dx=(px-q[0])/q[3],dy=(py-q[1])/qy,dz=(pz-q[2])/q[3],d2=dx*dx+dy*dy+dz*dz;
        if(d2<.9409){noy[vb+i]=1;break;}if(d2<1.96)ao+=(1.4-Math.sqrt(d2))/.43;}
      const h=Math.max(0,Math.min(1,(py-base)/(H*.62))),hh=h*h*(3-2*h),o=1-.17*Math.min(1,ao); // (v7) le creux d'une soudure .3 → .17 : il dessinait une LIGNE entre deux bourgeons
      col[vo+i*3]=(VR+(1-VR)*hh)*o;col[vo+i*3+1]=(VG+(1-VG)*hh)*o;col[vo+i*3+2]=(VB+(1-VB)*hh)*o;}
    for(let i=0;i<si.length;i+=3){const a=si[i]+vb,c1=si[i+1]+vb,c2=si[i+2]+vb;if(noy[a]&&noy[c1]&&noy[c2])continue;idx[ni++]=a;idx[ni++]=c1;idx[ni++]=c2;}}
  return {pos:pos,nor:nor,col:col,idx:idx.slice(0,ni)};
}
