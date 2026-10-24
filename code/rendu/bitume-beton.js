/* ================= LE BITUME v2 (2026-09-25) =================
   User : « retravaille complètement les shaders, j'aime pas cette tache rose sur la route ». MESURÉ en rendu, source par
   source (inventaire : scratchpad/lumieres.md) : la grosse tache rose à cœur blanc derrière la caisse était le reflet de
   `carLight` (la lumière d'appoint de la carrosserie) sur un bitume au spéculaire SAUMON 0x8a524a et au lobe ÉNORME
   (shininess 40 : ±10° de demi-vecteur) ; la grande nappe magenta, le même lobe sous la directionnelle `kick` du biome ;
   le bloom, le WB magenta et le split-tone rosé finissaient le travail. Le bitume change donc de nature :
     · un vrai GRAIN d'asphalte (texture cuite une fois, granulats clairs) qui module le diffus ET le spéculaire : les reflets
       deviennent un scintillement de matière, plus jamais une flaque ;
     · un spéculaire FROID et SOMBRE, plus serré (0x2c2a3a, shininess 80) : chaque lumière garde sa couleur, en petit ;
     · une BRILLANCE D'HORIZON (fresnel) à la couleur du brouillard : la route luit vers le lointain, elle se lit ;
     · une CLARTÉ PAR NIVEAU (`uLift`) : la VILLE a un bitume plus clair, qui se détache de la ville sombre (user).
   Les uniformes vivent dans ROAD_U, PARTAGÉS par toutes les pistes : routeTick() les écrit une fois par image. */
const BETON={col:0xa39c8e,t:[1,1,1],lift0:.012,lift:.13,amb:.22,sheen:0,mouille:.24,ville:1,espace:1}; /* (2026-10-14, passe graphismes) LE BÉTON BRUT, ses réglages : col = le gris minéral de la matière · t = teinte globale · lift0/lift = la clarté de niveau (neutre, × LVL.route) · amb = la part de l'air du lieu (la brume) dans cette clarté · sheen = brillance d'horizon À SEC (0 : mat) · mouille = ce que la pluie fonce · ville/espace = teinte par monde — voir routeTick, dbgBeton */
const ROAD_U={uLift:{value:new THREE.Color(0,0,0)},uSheen:{value:.1},uSheenCol:{value:new THREE.Color(.4,.3,.5)},uWet:{value:0},uAcc:{value:new THREE.Color(0xf24aa0)},uVil:{value:0},uEcl:{value:0},
  uGlace:{value:0},uSunW:{value:SUN_DIR},uTeinte:{value:new THREE.Color(1,1,1)},uBmM:{value:new THREE.Vector3(1,.28,.66)}}; // (2026-10-16) uBmM : le MAGENTA des enseignes que renvoient les flaques (bmCol) — remappé dans une ville teintée (VTEINTES) // (passe graphismes mobile) uGlace/uSunW : le BITUME GLACÉ des routes sèches (voir roadMat) — la direction du soleil est SUN_DIR lui-même (même objet) // uWet/uAcc : le bitume MOUILLÉ de la ville (voir BITUME_MOUILLE)
/* ================= LE BÉTON BRUT (2026-10-14, passe graphismes) — Sacha : « retravaille la texture de la route pour que ça soit un beau béton bien brut et bien, bien mat » =====
   GRATUIT pour la puce : la MÊME texture 256² (même lecture, même shader), REPEINTE en béton — granulat serré, laitance et coulures en paliers nets, micro-fissures, bullage,
   et les JOINTS DE DALLE sur les bords de la tuile. ASPH_K 1,7 → .57 : une tuile = une dalle de 7 m (la route de 56 m = 8 dalles pile, un joint sous la ligne centrale). */
function betonPeint(N){ // PUR (aucun canvas) : les octets RGBA d'une tuile N×N de BÉTON BRUT qui se raccorde sur ses 4 bords — une tuile = UNE DALLE de 7 m (voir ASPH_K) ; rejoué tel quel par gfx/banc/route-beton/apercu.cjs
  const d=new Uint8ClampedArray(N*N*4);let sd=20261014;
  const r=function(){sd=(sd*16807)%2147483647;return sd/2147483647;};
  const grille=function(px,py){const g=new Float32Array(px*py);for(let i=0;i<g.length;i++)g[i]=r();return {g:g,px:px,py:py};}; // bruit de valeur BOUCLÉ
  const lit=function(G,u,v){const x=u*G.px,y=v*G.py,xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    const x0=xi%G.px,x1=(xi+1)%G.px,y0=(yi%G.py)*G.px,y1=((yi+1)%G.py)*G.px,g=G.g;
    return (g[y0+x0]*(1-fx)+g[y0+x1]*fx)*(1-fy)+(g[y1+x0]*(1-fx)+g[y1+x1]*fx)*fy;};
  // LA LAITANCE (nuages de ciment, 3 échelles) et LES COULURES (étirées dans le sens de la route : elles ne scintillent pas quand on file), en PALIERS nets (pas un flou de photo)
  const A=grille(3,3),B=grille(7,7),C=grille(15,15),S1=grille(34,2),S2=grille(90,4),S3=grille(18,1),W=grille(2,2),V=new Float32Array(N*N);let mn=9,mx=-9;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5)/N,v=(y+.5)/N,
      w=.60*(.50*lit(A,u,v)+.32*lit(B,u,v)+.18*lit(C,u,v))+.40*(.45*lit(S1,u,v)+.20*lit(S2,u,v)+.35*lit(S3,u,v));
    V[y*N+x]=w;if(w<mn)mn=w;if(w>mx)mx=w;}
  let mV=0;for(let i=0;i<V.length;i++){const w=Math.round((V[i]-mn)/(mx-mn)*7)/7;V[i]=w;mV+=w;}mV/=V.length; // 8 paliers
  // LES MICRO-FISSURES (marches au hasard, un texel de large, qui bifurquent) et LE BULLAGE (trous d'air en grappes)
  const F=new Float32Array(N*N),pose=function(x,y,a){x=((Math.floor(x)%N)+N)%N;y=((Math.floor(y)%N)+N)%N;const k=y*N+x;if(a>F[k])F[k]=a;};
  const fis=[];for(let f=0;f<3;f++)fis.push([r()*N,r()*N,r()*6.283,50+r()*90,.55+r()*.4]);
  while(fis.length){const f=fis.pop();let x=f[0],y=f[1],th=f[2];const len=f[3],a=f[4];
    for(let s=0;s<len;s++){th+=(r()-.5)*.55;if(r()<.03)th+=(r()-.5)*2.;x+=Math.cos(th);y+=Math.sin(th);
      pose(x,y,a*Math.min(1,s/8,(len-s)/8)*(.7+.3*r()));if(len>60&&r()<.012)fis.push([x,y,th+(r()<.5?1:-1)*(.6+r()*.7),18+r()*len*.4,a*.8]);}}
  for(let c=0;c<12;c++){const cx=r()*N,cy=r()*N,n=3+Math.floor(r()*8),R0=4+r()*16;
    for(let i=0;i<n;i++){const an=r()*6.283,q=r()*R0;pose(cx+Math.cos(an)*q,cy+Math.sin(an)*q,.4+r()*.5);}}
  // LES JOINTS DE DALLE, sur les bords de la tuile (ils se raccordent avec la tuile voisine) : le joint EN LONG (franc : il file vers l'horizon sans jamais clignoter)
  // et le joint EN TRAVERS (plus discret : c'est lui qui défile) ; une arête claire d'un côté (le chanfrein prend la lumière), la salissure qui s'accumule autour
  const JL=.36,JT=.22,jd=function(p){return Math.min(p,N-1-p);}; // p : distance (texels) au bord ; joint = 2 texels à cheval sur le raccord
  for(let i=0;i<N*N;i++){const x=i%N,y=(i-x)/N,o=i*4,u=(x+.5)/N,v=(y+.5)/N;
    let g=(r()-.5)*.20;const q=r();if(q<.045)g+=.10+r()*.10;else if(q<.075)g-=.20; // LE GRANULAT : grain serré, granulats clairs, petits trous
    let b=1+g+(V[i]-mV)*.30-F[i]*.34;
    const dx=jd(x),dy=jd(y);
    b*=1-.07*Math.max(Math.max(0,1-dx/9),Math.max(0,1-dy/9)*.7);                 // la salissure autour des joints
    if(x===1||x===N-2)b+=.05;if(y===1||y===N-2)b+=.03;                           // l'arête du chanfrein
    if(dx<1)b*=1-JL;else if(dy<1)b*=1-JT;                                        // le joint (2 texels ≈ 5,5 cm)
    const t=lit(W,u,v)-.5,k=204*b;                                               // la teinte : un rien plus chaude ou plus froide par grandes plages (gris minéral, jamais coloré)
    d[o]=k*(1+t*.035);d[o+1]=k;d[o+2]=k*(1-t*.05);d[o+3]=255;}
  return d;
} // fin betonPeint
let ASPH_TEX=null;const ASPH_K=.57; // (2026-10-14, passe graphismes) une tuile = une DALLE de 7 m (4 ÷ .57) — (vague 2) c'était 1,7 : la finesse du grain d'asphalte
function asphTex(){ if(ASPH_TEX)return ASPH_TEX;
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d'),im=c.createImageData(N,N);im.data.set(betonPeint(N));
  c.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=Math.min(IS_MOBILE?4:8,renderer.capabilities.getMaxAnisotropy()); // la route se regarde RASANTE : sans anisotropie le grain devient une bouillie
  return (ASPH_TEX=t);
}
/* (2026-09-26, audit rendu) LES LUMIÈRES PONCTUELLES NE TOUCHENT QUE LA CAISSE. r128 fait tourner la boucle de CHAQUE PointLight dans
   CHAQUE pixel Phong — même à intensité 0 — et le bitume couvre la moitié de l'écran : ~20 % du GPU mesuré, pour dessiner… les taches
   rondes du verdict (carLight, nitroLight, portail). Le bloc des lumières ponctuelles est retiré du chunk pour la route et les nuages ;
   les phares (SpotLight), le soleil et l'hémisphère restent. ⚠ r128 remplace NUM_POINT_LIGHTS par sa valeur dans le texte du shader :
   on ne peut pas le redéfinir, on retire donc la boucle elle-même. */
const LFB_SANS_PL=THREE.ShaderChunk.lights_fragment_begin.replace(/#if \( NUM_POINT_LIGHTS > 0 \) && defined\( RE_Direct \)[\s\S]*?#pragma unroll_loop_end\s*#endif/,'');
/* LE BITUME NE CALCULE QUE CE QUI SE VOIT (2026-09-27, passe perf iPhone, tour 2 — « le bitume, les néons et les ombres »). MESURÉ au banc
   logiciel (SwiftShader : le temps y suit le travail par pixel ; piste seule à l'écran, image figée, A/B alternés) : le bitume coûtait ~285 ms
   sur ~600, et sa face CACHÉE autant que la face vue (dessus seul 172 ms, dessous seul 174 ms, les deux 310) — la dalle est dessinée en
   DoubleSide, dessus et dessous dans le même maillage, et chaque tranche peignait les deux faces. Deux économies, image identique :
     · LA FACE CACHÉE N'EST PLUS DESSINÉE (`BITUME.face`) : la dalle est un solide FERMÉ (dessus, dessous, flancs, bords du vide en rouge),
       une face vue de dos est donc toujours derrière une face vue de face. Le bloc du DESSOUS est retourné (sens des triangles inversé,
       normales et couleurs NIÉES — le signe de la couleur porte l'orientation) et la matière passe en FrontSide : le GPU jette la face de
       dos avant de la tramer, ~la moitié des triangles du bitume, y compris dans les loopings et les dalles qui vrillent (le test est
       par TRIANGLE, gratuit). Le shader du dessous reçoit exactement ce qu'il recevait : la normale retournée par `faceDirection` y
       arrivait déjà niée (−n interpolé = −(n interpolé), au bit près), la couleur est relue en valeur absolue, et le décalage d'ombre
       (`normalBias`, calculé au SOMMET avec la normale non retournée) reprend son signe d'origine.
     · LES LUMIÈRES QUI N'ÉCLAIRENT PAS NE SE CALCULENT PAS (`LFB_ROUTE`) : r128 évalue le Blinn-Phong complet (deux normalisations, une
       puissance, un Schlick) de chaque lumière, même quand elle vaut ZÉRO ici — le phare hors de son cône (presque tout l'écran), le fill
       bleu qui vient d'EN DESSOUS sur la face du dessus, le soleil sur une face qui lui tourne le dos (et son ombre : 16 lectures de carte).
       Un `if` exact : hors du cône la couleur vaut 0, dos à la lumière le cosinus vaut 0 — l'apport sautée était 0 × quelque chose.
   `dbgBitume(face,sauts)` : l'ancien bitume (DoubleSide, toutes les lumières) sur la piste en cours, pour comparer au pixel et au banc. */
const BITUME={face:true,sauts:true};
const LFB_ROUTE=(function(){
  const sp=/(getSpotDirectLightIrradiance\( spotLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        di=/(getDirectionalDirectLightIrradiance\( directionalLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/;
  const t=LFB_SANS_PL.replace(sp,'$1\n\t\tif ( directLight.visible && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}')
    .replace(di,'$1\n\t\tif ( dot( geometry.normal, directLight.direction ) > 0.0 && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}');
  if(!sp.test(LFB_SANS_PL)||!di.test(LFB_SANS_PL)){console.warn('CASH CAR : lumières du bitume non greffées (chunk inattendu)');return LFB_SANS_PL;}
  return t;})();
/* ===================== LES LUMIÈRES DE LA CAISSE v2 (2026-10-17, session « Système d'éclairage » — Sacha : « on retravaille complètement comment les
   lumières fonctionnent : les flammes de nitro doivent faire de la lumière, les feux arrière doivent faire de la lumière quand il fait nuit, sur la route ;
   on retravaille comment les phares fonctionnent, comment la lumière des feux arrière se reflète dans le pare-brise arrière ; il faut que la lumière marche
   très bien, que ce soit parfait — optimisé quand même, pas de ray tracing : magnifique, mais compréhensible pour un iPhone ») =====================
   L'ancien éclairage de la caisse sur la route : UN projecteur three (headSpot) au milieu du capot, une NAPPE PEINTE plate (CARPOOL.head, le trapèze blanc
   qu'on voit devant la caisse la nuit) — et RIEN derrière : la flaque rouge des feux et le halo nitro, des plans additifs, faisaient des « taches rondes »
   (verdict du 25-26/09) et avaient été retirés. Les PointLights ne touchent plus le bitume depuis le 26/09 (LFB_SANS_PL : ~20 % du GPU).
   LA RECETTE NEUVE : les lumières de la caisse sont CALCULÉES DANS LE SHADER DU BITUME, en quelques lignes, sans aucune lumière three de plus :
     · LES PHARES (`uHl*`) : deux lampes, chacune un vrai faisceau de croisement — un éventail large, une COUPURE nette à l'horizon de la lampe, un point
       chaud juste dessous qui porte loin, l'inverse du carré de la distance et le cosinus de la surface (une bosse, une rampe s'allument plus fort). Les
       deux lobes se croisent devant le capot. Le projecteur three ne touche plus le bitume (la boucle des spots est retirée de son shader, comme celle
       des points) : il reste pour le décor (tours, rochers, arbres). La nappe peinte est éteinte.
     · DES LAMPES-SEGMENTS (`uLmA/B/C`, LM_N au plus) : un point (A = B) ou un trait (A → B) de lumière — l'éclairement vient du point le plus proche du
       trait, le REFLET (pellicule d'eau, flaques — le béton sec est mat : sauté) du point du trait le plus proche du rayon réfléchi (« point représentatif »,
       Karis 2013), dans un lobe ÉTIRÉ (fin en travers, long vers l'œil) : sur une route mouillée chaque lumière s'étire en TRAÎNÉE vers la caméra, comme
       sur une vraie route de nuit sous la pluie (un lobe rond y faisait des taches). Les FEUX ARRIÈRE (deux points rayonnés vers l'arrière, embrasés au
       frein), le FEU DU NITRO (un trait par côté, de la bouche du pot le long du jet, à la couleur de sa flamme, qui tremble avec elle) — hors nitro la
       FLAMME DU MOTEUR, qui crépite —, les TRAÎNÉES DE LUMIÈRE (un trait sur leurs 12 premiers mètres, à leur couleur et à leur éclat).
   Tout est en espace VUE (lumTick pose en monde, lumVue transforme pour la caméra qui rend) ; hors d'une sphère de 18 m autour de la caisse, le pixel ne
   paie qu'un test ; les phares sautent tout ce qui est derrière eux, hors de l'éventail ou au-dessus de la coupure. Rien n'est alloué, aucun programme de
   plus (la clé du bitume change : UN programme remplacé). MESURÉ (temps GPU) : sous le bruit, comme l'éclairage d'avant. Crochets : `dbgLum()`, `dbgLumVue()`. */
const LM_N=6; /* deux feux, deux traits de nitro (ou la flamme du moteur), une traînée par feu — MESURÉ : à 10 (trois traits par traînée) le bitume coûtait trop, pour une lueur qu'on ne distinguait pas */
const LUM_U={uLmA:{value:[]},uLmB:{value:[]},uLmC:{value:[]},uLmN:{value:0},uLmS:{value:new THREE.Vector4(0,0,0,0)},uLmK:{value:new THREE.Vector3(0,0,1)},
  uLmW:{value:new THREE.Vector4(260,.1,.6,1.4)}, /* le reflet : x = finesse du lobe en travers (en long : ×0,05, la traînée) · y = béton sec · z = pellicule d'eau · w = flaques */
  uHlP:{value:[new THREE.Vector4(),new THREE.Vector4()]},uHlF:{value:new THREE.Vector3(0,0,-1)},uHlR:{value:new THREE.Vector3(1,0,0)},uHlU:{value:new THREE.Vector3(0,1,0)},
  uHlN:{value:1},uHlC:{value:new THREE.Color(0,0,0)},uHlK:{value:new THREE.Vector4(-.012,.6,4,3)}}; /* les phares : x = la coupure (tangente) · y = la demi-ouverture de l'éventail (tangente) · z = le point chaud · w = l'adoucissement de près (m²) */
for(let i=0;i<LM_N;i++){LUM_U.uLmA.value.push(new THREE.Vector4());LUM_U.uLmB.value.push(new THREE.Vector4());LUM_U.uLmC.value.push(new THREE.Vector4());}
const LUM_GLSL=['#define LM_N '+LM_N,
  'uniform vec4 uLmA[LM_N],uLmB[LM_N],uLmC[LM_N],uLmS,uLmW,uHlP[2],uHlK;uniform vec3 uLmK,uHlF,uHlR,uHlU,uHlC;uniform float uLmN,uHlN;',
  'vec3 lmSp9=vec3(0.);float bmP9=0.;',
  'vec3 lmRoute(vec3 P,vec3 N,vec3 V){',
  '  vec3 E=vec3(0.);',
  '  if(uHlC.r+uHlC.g+uHlC.b>0.){',                                                              // LES PHARES — trois tests bon marché d abord : devant, dans l éventail, sous la coupure
  '    for(int j=0;j<2;j++){vec3 v=P-uHlP[j].xyz;float fw=dot(v,uHlF);',
  '      if(fw>1.5){float iw=1./fw,hx=abs(dot(v,uHlR))*iw;',                                      // les tangentes du rayon : en travers…
  '        if(hx<uHlK.y){float vy=dot(v,uHlU)*iw;',                                               // …et en hauteur
  '          if(vy<uHlK.x+mix(.02,.06,uHlN)){float d2=dot(v,v);',
  '            float I=(1.-smoothstep(uHlK.y*mix(.55,.12,uHlN),uHlK.y,hx))*(mix(.5,.45,uHlN)+mix(.5,.55,uHlN)*exp(-hx*hx*mix(9.,7.,uHlN)))*(1.-smoothstep(uHlK.x-mix(.006,.045,uHlN),uHlK.x+mix(.02,.05,uHlN),vy))*pow(.03/(.03+max(-vy,0.)),uHlK.z)*smoothstep(1.5,7.,fw)*exp(-fw*.008*uHlN);', // l éventail (des BORDS nets : on lit un faisceau projeté, pas une lueur) · la coupure · le point chaud qui porte loin · presque rien sous le pare-chocs (vu de la poursuite, c était un halo autour du capot)
  '            E+=uHlC*(I*uHlP[j].w*max(dot(N,-v),0.)*inversesqrt(d2)/(d2+uHlK.w));}}}}}',
  '  vec3 dq=P-uLmS.xyz;',
  '  if(uLmN>.5&&dot(dq,dq)<uLmS.w){vec3 R=reflect(-V,N),T=normalize(cross(N,V)+vec3(1e-5,0.,0.)),B=cross(R,T);', // LES LAMPES-SEGMENTS (feux, nitro, traînées) — T : le travers de la route vu d ici, B : le long (vers l œil)
  '    for(int i=0;i<LM_N;i++){if(float(i)>=uLmN)break;',
  '      vec4 a=uLmA[i],b=uLmB[i],c=uLmC[i];vec3 Q=P-a.xyz;',                                     // a : départ + rayon² (+100 : rayonné vers l arrière) · b : le trait A→B + 1/|AB|² (posés par lumVue)
  '      vec3 L=b.xyz*clamp(dot(Q,b.xyz)*b.w,0.,1.)-Q;float d2=dot(L,L)+1e-4;vec3 l=L*inversesqrt(d2);', // le point du trait le plus proche
  '      float r2=a.w,lob=1.;if(r2>50.){r2-=100.;lob=smoothstep(-.35,.6,-dot(l,uLmK));}',         // les feux rayonnent vers l arrière (branche UNIFORME : la même pour tout l écran)
  '      E+=c.rgb*(max(dot(N,l),0.)*lob/(d2+r2));',
  '      if(c.w>0.){float DD=dot(b.xyz,b.xyz),RD=dot(R,b.xyz);',                                 // le REFLET (sur l eau seulement) : le point du trait le plus proche du rayon réfléchi
  '        vec3 Ls=b.xyz*clamp((dot(R,-Q)*RD+dot(Q,b.xyz))/max(DD-RD*RD,1e-4),0.,1.)-Q;float s2=dot(Ls,Ls);',
  '        vec3 e=Ls*inversesqrt(s2)-R;float et=dot(e,T),eb=dot(e,B);',                               // l écart angulaire, en travers et en long
  '        lmSp9+=c.rgb*(c.w*lob*step(0.,dot(R,Ls))*exp(-et*et*uLmW.x-eb*eb*uLmW.x*.05)/(1.+.08*s2+r2));}}}', // un lobe ÉTIRÉ : fin en travers, long vers l œil — la TRAÎNÉE d une lumière sur l eau (un lobe rond faisait des taches)
  '  return E;}',''].join('\n');
const LUM_APPEL='\n{vec3 lmE9=lmRoute(geometry.position,geometry.normal,geometry.viewDir);reflectedLight.directDiffuse+=lmE9*diffuseColor.rgb;}\n';
const LFB_ROUTE_LUM=LFB_ROUTE.replace(/#if \( NUM_SPOT_LIGHTS > 0 \) && defined\( RE_Direct \)[\s\S]*?#pragma unroll_loop_end\s*#endif/,''); // les phares du bitume sont les nôtres : le projecteur three n'y entre plus
function roadMat(){
  /* (2026-09-26, vague 2) UNE LECTURE DE TEXTURE DE MOINS PAR PIXEL DE ROUTE. Le grain servait deux fois — en `map` ET en `specularMap`,
     la même image lue deux fois dans chaque pixel du bitume (la moitié de l'écran). Le spéculaire prend désormais le rouge du texel
     déjà lu (`specularStrength=texelColor.r`, la carte est en niveaux de gris et en espace linéaire : c'est la même valeur).
     Et le grain est lu 1,7 fois plus FIN (`ASPH_K`) : à 1,6 cm le texel, de près il faisait des pâtés sous le nez de la caisse ; les
     mipmaps et l'anisotropie tiennent le lointain. Les flaques et les impacts de pluie (vUv) gardent leur échelle. */
  const face=BITUME.face,sauts=BITUME.sauts; // (tour 2) figés à la construction : la matière et la géométrie de la piste vont ensemble (voir BITUME)
  const m=new THREE.MeshPhongMaterial({color:BETON.col,side:face?THREE.FrontSide:THREE.DoubleSide,vertexColors:true,map:asphTex(),
    shininess:30,specular:0x000000,envMap:envTex,reflectivity:0}); /* (2026-10-14, passe graphismes) LE BÉTON EST MAT : gris minéral (c'était l'indigo 0x322e40), lobe spéculaire à ZÉRO (0x16141e), plus de mélange du cube (.03) — la lumière s'y pose en diffus pur ; la pluie garde son eau (BITUME_MOUILLE a son propre reflet) */ // (2026-09-26, user : « un peu trop brillante, gère mal le reflet du soleil ») : 80/0x2c2a3a faisait une traînée de soleil DURE et granuleuse — un bitume renvoie une nappe large et sourde
  m.userData.bitume=face?2:1;m.userData.sauts=sauts; // 2 = face cachée jetée (bloc du dessous retourné), 1 = l'ancien DoubleSide
  m.onBeforeCompile=function(sh){
    sh.uniforms.uLift=ROAD_U.uLift;sh.uniforms.uSheen=ROAD_U.uSheen;sh.uniforms.uSheenCol=ROAD_U.uSheenCol;
    for(const k in LUM_U)sh.uniforms[k]=LUM_U[k]; // (2026-10-17) LES LUMIÈRES DE LA CAISSE v2 (voir LUM_GLSL)
    sh.uniforms.uTeinte=ROAD_U.uTeinte;sh.uniforms.uBmM9=ROAD_U.uBmM;sh.uniforms.uWet=ROAD_U.uWet;sh.uniforms.uAcc9=ROAD_U.uAcc;sh.uniforms.uT9=CITY.uT;sh.uniforms.uVil9=ROAD_U.uVil;sh.uniforms.uEcl9=ROAD_U.uEcl;sh.uniforms.uGlace=ROAD_U.uGlace;sh.uniforms.uSunW=ROAD_U.uSunW;
    if(face)sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>','#include <color_vertex>\nvColor=abs(vColor);') // le dessous porte des couleurs NIÉES : on relit leur valeur
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.split('inverseTransformDirection( transformedNormal, viewMatrix )')
        .join('inverseTransformDirection( transformedNormal*(color.r<0.?-1.:1.), viewMatrix )')); // …et le décalage d'ombre reprend la normale d'avant le retournement
    sh.fragmentShader='uniform vec3 uTeinte;uniform vec3 uBmM9;uniform vec3 uLift;uniform float uSheen;uniform vec3 uSheenCol;uniform float uWet;uniform vec3 uAcc9;uniform float uT9;uniform float uGlace;uniform vec3 uSunW;uniform float uVil9,uEcl9;\n'+
      sh.fragmentShader.replace('void main() {',(LUM_GLSL+BITUME_MOUILLE.replace('  col*=1.-uWet*.2*P;','  bmP9=P;col*=1.-uWet*.2*P;'))+'void main() {').replace('#include <lights_fragment_begin>',sauts?LFB_ROUTE_LUM:LFB_SANS_PL)
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+(LUM_APPEL))
      .replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv*'+ASPH_K.toFixed(2)+');float spec9=texelColor.r;texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;diffuseColor.rgb*=uTeinte;')
      .replace('#include <specularmap_fragment>','float specularStrength=spec9;').replace('#include <envmap_fragment>',
      '#include <envmap_fragment>\n{float fr9=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),4.0);float lk9=1.;\n'+
      '#if defined(USE_ENVMAP)&&defined(ENVMAP_TYPE_CUBE)\nif(uWet>.001){vec4 w9=bitumeMouille(outgoingLight,reflectVec,normal,normalize(vViewPosition));outgoingLight=w9.rgb;lk9=w9.a;}\n'+
      /* LE BITUME GLACÉ (2026-09-28, « plus beau sur iPhone sans coût en plus ») — la route sèche des NUAGES n'était qu'un aplat indigo
         sous un ciel éclatant : rien ne la reliait au monde. Une route vue en rasant renvoie le ciel (Fresnel) : le cube du biome, DÉJÀ
         lu par ce pixel (le mélange d'origine à 3 %), s'y pose désormais selon l'angle — presque rien sous le nez de la caisse, le
         dégradé du ciel et la bande rose de l'horizon vers le lointain et sur les dalles qui tournent. Le reflet du SOLEIL en est retiré
         (la traînée dure que Sacha avait refusée le 26/09) ; la pluie de la VILLE garde son eau (uGlace y vaut 0). Zéro lecture de plus. */
      'if(uGlace>.001){float cg9=clamp(abs(dot(normal,normalize(vViewPosition))),0.,1.),g9=1.-cg9;g9=g9*g9*g9*g9*g9;'+
      'outgoingLight+=envColor.rgb*(g9*uGlace*(1.-smoothstep(.90,.985,dot(normalize(reflectVec),uSunW))));}\n'+
      '#endif\n'+
      'outgoingLight+=uLift*lk9+uSheenCol*(uSheen*fr9);}'+
      ('\noutgoingLight+=lmSp9*(uLmW.y*(.4+spec9)+uWet*(uLmW.z+uLmW.w*bmP9));')); // (2026-10-17) le REFLET des lampes de la caisse : le béton sec en garde un voile, la pellicule d'eau et les FLAQUES le font miroir (voir LUM_GLSL)
  };
  m.customProgramCacheKey=function(){return 'bitumeV5'+(face?'f':'')+(sauts?'s':'')+('L');}; // UNE compilation pour toutes les pistes (L : les lumières de la caisse v2)
  return m;
}
/* LE BITUME MOUILLÉ DE LA VILLE (2026-09-26) — sous la pluie, la route n'était qu'un aplat violet : c'est pourtant LA surface qui fait
   une ville cyberpunk. Tout vit dans le shader du bitume, SANS aucune lumière (la route n'écoute plus les PointLights : LFB_SANS_PL),
   et ne coûte rien ailleurs (`uWet` = LVL.pluie, branche uniforme coupée hors de la pluie) :
     · une PELLICULE D'EAU : un reflet de Fresnel (celui de l'eau, F0 = 0,02) renvoie le ciel et la brume de la ville
       (le cube d'environnement du biome, ses bandes néon magenta/cyan) — la route prend la couleur de la nuit au lieu d'un aplat ;
     · des FLAQUES : un bruit étiré dans le sens de la route (repère de la dalle, `vUv` en m/4) où l'eau fait miroir et le bitume noircit ;
     · les REFLETS ÉTIRÉS DES ENSEIGNES : des colonnes de lumière (ambre des fenêtres, cyan, magenta, l'accent de la zone) tirées de
       l'AZIMUT du reflet — ancrées dans le monde comme de vrais reflets de lumières lointaines, elles restent en place pendant que le
       bitume défile dessous, et c'est l'eau (flaques + pellicule qui frissonne) qui les découpe et les fait vivre ;
     · les IMPACTS DE PLUIE : des cercles de 10 cm qui s'ouvrent et s'éteignent (une cellule de 67 cm), visibles de près seulement.
   Des traînées et des cercles d'eau fins : aucune tache ronde de lumière (verdict), aucune passe de plus. ⚠ La route de la ville DESCEND
   (spirale de ~9 km) : ses reflets rasants plongent SOUS l'horizon — on ne coupe donc que le zénith et le fond, pas le bas du ciel. */
const BITUME_MOUILLE=['#if defined(USE_ENVMAP)&&defined(ENVMAP_TYPE_CUBE)',
  'float bmH(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'float bmN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bmH(i),bmH(i+vec2(1.,0.)),f.x),mix(bmH(i+vec2(0.,1.)),bmH(i+vec2(1.,1.)),f.x),f.y);}',
  'vec3 bmCol(float h){return h>.93?uBmM9:h>.82?vec3(.40,.86,1.):h>.74?uAcc9:vec3(1.,.62,.30);}', // ambre des fenêtres surtout, puis cyan, accent, magenta
  'vec4 bitumeMouille(vec3 col,vec3 R,vec3 nV,vec3 vV){',
  '  float cv=clamp(abs(dot(nV,vV)),0.,1.),F=.02+.98*pow(1.-cv,5.);',                                   // Fresnel de l eau
  '  float dz=length(vViewPosition);',
  '  vec2 u=vUv*vec2(1.,.25);',                                                                           // (m/4 en travers, m/16 en long) : bruits étirés dans le sens de la route
  '  float P=smoothstep(.58,.72,.6*bmN(u*vec2(1.1,1.8)+3.1)+.4*bmN(u*vec2(3.1,4.4)-7.3));',             // les FLAQUES
  '  float film=.55+.45*bmN(vUv*vec2(3.,.6)+vec2(0.,uT9*.35));',                                          // la pellicule qui frissonne (défile avec le bitume)
  // les impacts : un cercle par cellule de 67 cm, qui s ouvre et s éteint — de près seulement
  '  vec2 q=vUv*6.,ci=floor(q),cf=fract(q)-.5;float hr=bmH(ci+17.),ph=fract(uT9*1.6+hr*7.3);',
  '  float ring=smoothstep(.04,0.,abs(length(cf-(vec2(hr,fract(hr*37.3))-.5)*.4)-ph*.16))*(1.-ph)*(1.-ph)*step(.45,hr)*(1.-smoothstep(3.,12.,dz));',
  // les reflets étirés : colonnes de lumière selon l azimut du reflet (fines + larges), éteintes vers le zénith
  '  float az=atan(R.z,R.x);',
  '  float x1=az*28.+uAcc9.r*9.,i1=floor(x1),f1=fract(x1)-.5,h1=bmH(vec2(i1,5.7));',
  '  vec3 st=bmCol(h1)*step(.55,h1)*exp(-f1*f1*12.)*(.6+.4*sin(uT9*(.6+h1*2.)+h1*50.));',
  '  float x2=az*9.+1.7,i2=floor(x2),f2=fract(x2)-.5,h2=bmH(vec2(i2,-2.3));',
  '  st+=bmCol(h2)*step(.45,h2)*exp(-f2*f2*6.)*.55;',
  '  st*=smoothstep(.8,.15,abs(R.y))*smoothstep(3.,22.,dz)*uVil9;',                                   /* (2026-09-30, Sacha : « dans l orage on voit le reflet de la ville dans les flaques, c est pas normal, il n y a pas de ville ») : les enseignes ne se reflètent que s il y a une VILLE (LVL.ville, au fondu du portail) */                                            // ni le zénith ni le fond de l abîme (la route de la ville DESCEND : ses reflets rasants plongent sous l horizon, et les tours y sont aussi) ; pas sous le nez
  '  vec4 ec=textureCube(envMap,vec3(flipEnvMap*R.x,R.yz),1.5);ec=envMapTexelToLinear(ec);',              // le ciel de la ville, un peu flou
  '  float wet=uWet*(.24+.76*P);', /* (2026-10-14, passe graphismes) béton mouillé : .45/.55 → .24/.76 — les FLAQUES font miroir, hors d'elles le béton reste peu brillant */
  '  col*=1.-uWet*.2*P;',                                                                                  // la flaque fonce (⚠ pas le reste : l étalonnage de la pluie ÉCRASE les sombres — 10 % de moins et le bitume proche devenait noir)
  '  vec3 refl=(ec.rgb*.7+uSheenCol*.55+st*(.9+1.7*P)*film)*F*wet;',
  '  refl+=(uSheenCol+st*.5+vec3(.04,.05,.07))*ring*uWet*.3;',
  '  refl+=vec3(.66,.72,1.)*uEcl9*(F*(1.2+2.6*P)+.10*P)*uWet;',                                        /* (2026-09-30) L ORAGE : ce que les flaques renvoient, c est L ÉCLAIR — un miroir froid qui s allume avec le ciel (CAMP_FLASH) */
  '  return vec4(col+refl,1.-uWet*.22*P);}',                                                               // la flaque garde moins de clarté de niveau : c est un miroir, pas une craie
'#endif',''].join('\n');
/* (2026-09-26) LES TRAITS DE LA ROUTE TIENNENT JUSQU'À L'HORIZON. Rails néon (60 cm), nappes de lueur et ligne centrale (un trait GL
   d'UN pixel, épaisseur fausse de près) tombaient sous le pixel passé ~400 m : ils s'émiettaient en POINTILLÉS qui grouillaient au moindre
   mouvement, et le bord de la route se perdait dans la nuit. Le vertex shader ÉLARGIT désormais chaque trait juste assez pour couvrir
   `minPx` pixels à l'écran (jamais moins que sa vraie largeur) et baisse son éclat d'autant : un trait continu qui file jusqu'au bout de
   la route, sans surbrillance. La géométrie porte `aLat` (le vecteur qui va du milieu du trait vers CE bord) ; `TRAIT_U.uPx` (taille d'un
   pixel à 1 m de l'œil) est écrit par routeTick. Coût : une poignée d'opérations par SOMMET, zéro par pixel.
   `pal` : 0 = opaque (on assombrit), 1 = additif (on divise l'énergie), 2 = alpha (on éclaircit l'alpha). */
const TRAIT_U={uPx:{value:.002}};
const BMAP_U={uRgb:{value:0},uRgbT:{value:0},uRgbK:{value:0},uRgbM:{value:1},uPal:{value:Array.from({length:10},function(){return new THREE.Vector3(1,.45,.12);})},uCum:{value:new Float32Array([.1,.2,.3,.4,.5,.6,.7,.8,.9,1])}}; // (2026-10-18, Léo) LE BOOST RGB des bords (voir BMAP) : part d'arc-en-ciel, défilement (tours, l'horloge du scintillement ×16) — (2026-10-18, Sacha) uRgbM : 1 = le JEU DE LUMIÈRE de la traînée (uPal : ses 10 nuances, uCum : leur part cumulée dans le feu), 0 = l'arc-en-ciel
function traitMat(m,minPx,pal){
  const rgb9=pal<2; // (2026-10-18, Léo : « quand on booste, les côtés scintillent un peu en mode RGB ») les RAILS (0) et la NAPPE (1) — les seuls à porter ces deux programmes — peignent l'arc-en-ciel du boost (BMAP_U, à 0 hors boost : rien ne change)
  m.onBeforeCompile=function(sh){sh.uniforms.uPx9=TRAIT_U.uPx;if(rgb9){sh.uniforms.uRgb9=BMAP_U.uRgb;sh.uniforms.uRgbT9=BMAP_U.uRgbT;sh.uniforms.uRgbK9=BMAP_U.uRgbK;sh.uniforms.uRgbM9=BMAP_U.uRgbM;sh.uniforms.uPal9=BMAP_U.uPal;sh.uniforms.uCum9=BMAP_U.uCum;}
    sh.vertexShader='attribute vec3 aLat;uniform float uPx9;varying float vK9;\n'+(rgb9?'attribute float aS;varying float vS9;\n':'')+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z);'+
      'float k9=max(1.,'+minPx.toFixed(2)+'*.5*uPx9*d9/hw9);transformed+=aLat*(k9-1.);vK9=1./k9;}'+(rgb9?'vS9=aS;':''));
    sh.fragmentShader='varying float vK9;\n'+(rgb9?'varying float vS9;uniform float uRgb9,uRgbT9,uRgbK9,uRgbM9;uniform vec3 uPal9[10];uniform float uCum9[10];\n':'')+sh.fragmentShader.replace('#include <fog_fragment>',
      (pal===0?'gl_FragColor.rgb*=.35+.65*sqrt(vK9);':pal===1?'gl_FragColor.rgb*=vK9;':'gl_FragColor.a*=.25+.75*vK9;')+
      (rgb9?'if(uRgb9>.001){float I9=max(max(gl_FragColor.r,gl_FragColor.g),gl_FragColor.b);vec3 c9;'+
        'if(uRgbM9<.5){float h9=fract(vS9*.016+uRgbT9);c9=clamp(abs(mod(h9*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);'+ // (Léo) la teinte de l'arc-en-ciel à cet endroit de la route (tout le spectre en ~60 m)
        'float n9=fract(sin(mod(floor(vS9*.4),997.)*12.9898+floor(uRgbK9)*78.233)*43758.5453);'+ // le SCINTILLEMENT : chaque tronçon de ~2,5 m tire son éclat, 16 fois par seconde — un sur sept ÉCLATE (blanc vif) : le flou de vitesse du boost avalait un simple frémissement (vu au banc)
        'c9=mix(c9,vec3(1.),.45*step(.86,n9))*(.7+.3*n9+1.4*step(.86,n9));}'+
        'else{float g9=mod(floor(vS9*.5),997.),y9=floor(uRgbK9*.5+fract(sin(g9*7.137)*4375.85));'+ // (2026-10-18, Sacha : « le même jeu de lumière que la traînée ») chaque tronçon de 2 m est un PIXEL du feu : il change ~8 fois par seconde, chacun à son temps (ils ne clignotent pas tous ensemble)
        'float n9=fract(sin(g9*12.9898+mod(y9,997.)*78.233)*43758.5453);c9=uPal9[9];for(int i=0;i<10;i++){if(n9<uCum9[i]){c9=uPal9[i];break;}}'+ // il tire SA NUANCE dans la part qu'elle a dans le feu de la traînée (70 % de rose et 30 % de blanc dans le feu = 70 % et 30 % des pixels du bord)
        'c9*=.92+.16*fract(n9*91.7);}'+ // et son éclat (± 8 %), comme chaque cube du feu
        'gl_FragColor.rgb=mix(gl_FragColor.rgb,c9*I9,uRgb9);}':'')+'\n#include <fog_fragment>');
  };
  m.customProgramCacheKey=function(){return 'trait'+pal+'_'+minPx;};
  m.polygonOffset=true; // … et plus de Z-FIGHTING : 4 à 9 cm au-dessus du bitume, c'était sous la précision du tampon de profondeur dès 300 m
  return m;
}
/* ==========================================================================
   (2026-10-14, passe graphismes · agent bords-route) FIN DU NÉON DE BORD — flancs et rail en BÉTON.
   Sacha : « le néon violet/magenta fait trop IA ». Les bords de la route (rail cyan/rose/violet + nappe de lueur additive, flancs d'ENCRE
   violette, liseré et catadioptres à l'accent de la zone, ligne centrale lavande, plaques turbo sur encre violette) passent à la matière :
     · DE JOUR (matin, midi, soir, orbite) le rail n'est plus une lumière : c'est le CHANFREIN clair de la dalle (béton #C9C3B6), la nappe de
       lueur est éteinte ;
     · la NUIT, sous la PLUIE, à l'ORAGE : un rail BLANC doux (#E8E4DA à demi) — le bord du vide reste lisible — et une nappe très discrète ;
     · les flancs sont en béton sombre #3A3833 ; le liseré et les catadioptres (1,5 m tous les 6 m) sont AMBRE (#FFB04A ; or aux
       PICS DE JADE, blanc froid en orbite) ; la ligne centrale est un blanc cassé ; les plaques turbo ont un fond de béton sombre.
   Rien de plus pour la puce : des valeurs, des couleurs de matière existantes, les MÊMES programmes (le flanc change de clé : un programme
   remplacé, pas ajouté), aucune texture en plus.
   Mécanique : `bordsTick()` repeint la couleur du rail et l'opacité de la nappe à chaque image, JUSTE APRÈS la boucle « caméléon » de
   musicTick (qui les repeint depuis `userData.base`, laquelle reste l'accent ambre : le ciel musical, `lvlTick`, le lit toujours). Le rail
   blanc ne vire donc plus de teinte avec la musique. `villeApres` (minuit) baisse ensuite le rail ×kr : on le pré-divise pour qu'il reste lisible.
   Banc : `dbgBords({kNuit,kJ,glowN,jour:[r,g,b],nuit:[r,g,b]})`. ========================================================================== */
/* (2026-10-14, Sacha : « garde quand même la première map de la VILLE avec les NÉONS ROSES, elle était bien ») LA VILLE AU NÉON (ambiance `pluie`, le niveau VILLE d'origine)
   GARDE SON ROSE : bords de route roses, enseignes magenta/cyan, ambiance d'avant la passe graphismes — c'est la RÉFÉRENCE d'identité de CASH CAR. Elle seule. */
{BETON.t=[.86,.93,1.2];BETON.amb=.4;} // (vives) le béton n'est plus gris mort : un bleu d'ardoise franc, qui prend davantage la couleur de l'air du lieu (rose au soir, azur à midi) — chiffres de la COUCHE POP
function metroH(x,z){const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v);} // un hasard FIXÉ par la position (ne consomme pas `vr`)
function villeRose(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!(!!c&&c.id==='ville'&&!!c.bio))return false;const b=c.bioBase||c.bio[0];return b==='pluie'||b==='nuitNoire'||b==='villeOrage'||b==='villeBrume';} /* (Sacha, 20 h 50 : « la ville doit être en ROSE la nuit ») la nuit, la pluie ET l'orage — (2026-10-16) et le BROUILLARD ; une ville teintée (`pluie_vert`…) garde son ambiance de base dans `bioBase` (sfNiveau) */
