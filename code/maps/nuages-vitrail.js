/* ============================== LES NUAGES EN VITRAIL (2026-10-18, Léo) ==============================
   « Sacha avait beaucoup de mal à avoir les nuages comme il voulait : essaie la technique des mini-cubes et de la couche transparente lisse
   — la glisse transparente peut embrasser la forme des cubes — garde toutes les qualités qu'on a déjà, et crée encore plus de relief, de
   profondeur, d'immersion. » (au questionnaire : TOUS les nuages.) La recette VITRAIL (voir la mémoire « vitrail ») sur la v8, sans rien
   lui retirer : du MÊME champ que la surface v8 (nuage8Calc, opt.vit), trois maillages par nuage, de près (finesses 2 et 3) :
     · LES ÉCAILLES (`nuVitCub`) : des cubes de ext/NUVIT.nc à 89 %, OPAQUES, éclairés par la lumière v8 (`n8lum`, la même fonction) sur le
       gradient du champ en leur centre, un peu de leur face (`uRel` : le relief), une nuance chacun, un biseau, un éclat de temps en temps ;
     · LE CŒUR (`nuVitCoe`) : la surface v8 rentrée de 1,15 cube, de la LUMIÈRE pure (le soleil de l'ambiance) — c'est elle qu'on voit
       dans les joints ;
     · LA PEAU (`nuVitPea`) : l'isosurface des cubes adoucis (elle EMBRASSE leurs marches), transparente de face (`uCoqA0`) et opaque sur la
       silhouette (`uCoqA1`), la ouate v8 en lumière + le ciel au bord + l'éclat du soleil + un film irisé ;
     · L'ONDE (`uScan`) qui monte le long du nuage (chacun la sienne) et allume les joints, les arêtes, la peau.
   De LOIN (finesses 0 et 1) : le nuage v8 tel quel (de loin lisse et brillant, de près le pixel — le juste milieu de Léo). Tri, fondu
   près de l'objectif (la trame) et fondu d'une zone neuve gardés. `dbgNuVit(0|1,{…})` = A/B sur la même image. */
/* LE FONDU (2026-10-18, Sacha : « c'est bien l'effet des nuages pixelisés mais ça bug par moment, quand on s'éloigne ou on se rapproche les
   nuages ont parfois l'ancienne texture parfois les pixels ») : les seuils de distance (de loin → la v8, puis 40 % des fantômes, puis tous ;
   tout près → la v8) BASCULAIENT un nuage d'une image à l'autre — mesuré : ~100 nuages bien vus basculés d'un coup sur 4 km de route, autant en vol.
   Chaque nuage a maintenant DEUX PARTS (`nuvPoids`, x = (d−R)/R, c = un cube à l'écran en rad) : celle du CORPS (v8 → corps rentré, ou
   vitrail) et celle des CUBES. En vitrail, une seule rampe, de x = `bLoin` (4,06 : l'ancien seuil du lot 2) à 2,53. En fantôme, les deux
   PALIERS de Léo gardés, en fondu : 0 → 37 % des cubes (et le corps) de x 4,06 à 3,5, puis 37 → 100 % de 2,05 à 1,78 (l'ancien seuil du
   lot 3) — le lot lointain (40 % des fantômes) prend tout le palier : le coût reste celui d'avant. Tout près, tout redescend quand un cube
   dépasse `bPres` à l'écran (vitrail 0,06 → 0,09 rad ; fantôme 0,035 → 0,09 : ses cubes sont petits, la rampe en mètres serait trop
   courte) ; jamais plus gros qu'avant. Entre les deux, la v8 et le corps (ou le vitrail) se partagent les points de la MÊME trame
   (complémentaires : jamais deux fois le même point) ; les fantômes arrivent un par un dans leur ordre tiré au hasard (le rang : `cu/uFN`
   dans la texture `NUF_TEX`, l'attribut `aR` sinon ; un cube se montre quand la part le dépasse) ; la peau du vitrail suit en alpha. Les parts voyagent dans la ligne du bas de la matrice
   d'instance (inutilisée : les shaders ne gardent que xyz) : [0][3] = le corps (≥ 0 pour la v8, en négatif pour le corps rentré et le
   vitrail), [1][3] = −les cubes ; une matrice ordinaire = rien ne change. Nuages seuls fantômes (`mkCloud`) : les cubes
   s'effacent tout près (`uNvW`, posé par objet dans `onBeforeRender`), le corps reste. Écarté : le vitrail PARTOUT (dalles grises de près,
   bords carrés de loin, jusqu'à ×6 triangles). `?sans=nuvitfondu` = les bascules d'avant ; `dbgNuVit(1,{fondu:0|1})` = A/B. */
const CDENS=(function(){const m=/[?&]cdens=([0-9.]+)/.exec(location.search);return m?+m[1]:.14;})(); // (2026-10-20, Léo : « trop de nuages… trop chaotique, plus paisible »)
const GROS=(function(){const m=/[?&]gros=([0-9.]+)/.exec(location.search);return m?+m[1]:.4;})(); // la part gardée des GRANDES masses (cathédrales, massifs, titans, tours) sur la map NUAGES // (2026-10-20, Léo : « il y a trop de nuages, c'est un peu vomitif ») la part des nuages de décor gardée sur la map NUAGES (1 = le semis d'avant ; ?cdens=)
const ARC_ON=!/[?&]arc=0\b/.test(location.search);
const KIDS_ARC=(function(){const m=/[?&]kids=([0-9.]+)/.exec(location.search);return m?+m[1]:.4;})(); // la part du chou-fleur gardée sur les gabarits de nuages (1 = d'avant) // (2026-10-19, essai ARC) le fond en photo + la mer de cumulus + les nuages en VERRE ; ?arc=0 = le main d avant
const NUVIT={on:true,nc:36,iso:.3,ang:.09,nsk:0,ecart:.47,
  fondu:!/[?&]sans=([^&]*,)?nuvitfondu(,|&|$)/.test(location.search),bLoin:4.06,bPres:[.06,.09],bPresF:[.035,.09]}; // (2026-10-18) LE FONDU : voir au-dessus
function nuvLisse(a,b,v){const q=Math.min(1,Math.max(0,(v-a)/(b-a)));return q*q*(3-2*q);}
const NUVP=new Float32Array(2); // [le corps, les cubes]
function nuvPoids(x,c){const b=NUVIT.fant?NUVIT.bPresF:NUVIT.bPres,n=1-nuvLisse(b[0],b[1],c); // les deux parts d'un nuage (dans NUVP) : x = (d−R)/R, c = un cube à l'écran (rad)
  if(NUVIT.fant){const p=NUVIT.loin*.93,wc=p*(1-nuvLisse(3.5,NUVIT.bLoin,x))+(1-p)*(1-nuvLisse(1.78,2.05,x));NUVP[0]=Math.min(1,wc/p)*n;NUVP[1]=wc*n;} // les paliers de Léo, en fondu (p < 40 % : le lot lointain suffit)
  else NUVP[0]=NUVP[1]=(1-nuvLisse(2.53,NUVIT.bLoin,x))*n;return NUVP;}
const NV_U={uLueur:{value:1.08},uScan:{value:.7},uScanV:{value:.07},uCoqA0:{value:.5},uCoqA1:{value:.92},uRel:{value:.12},uEcl:{value:1},uBis:{value:.08},uTache:{value:0},uChaud:{value:0},uTrans:{value:0},uBordC:{value:0},uFant:{value:1},uPeint:{value:1},uVerre:{value:0}};
const NV_DOSES={doux:{uCoqA0:.5,uCoqA1:.92,uRel:.12,uLueur:1.08,uBis:.08,uTache:0,uChaud:0,uTrans:0,uBordC:0},moyen:{uCoqA0:.3,uCoqA1:.9,uRel:.3,uLueur:1.16,uBis:.13,uTache:0,uChaud:0,uTrans:0,uBordC:0},fort:{uCoqA0:.12,uCoqA1:.85,uRel:.45,uLueur:1.26,uBis:.18,uTache:0,uChaud:0,uTrans:0,uBordC:0},
  verre:{uCoqA0:.2,uCoqA1:.86,uRel:.3,uLueur:1.16,uBis:.13,uTache:0,uChaud:0,uTrans:.25,uBordC:.6,uVerre:.5}, // (2026-10-19, Léo : « les nuages devant, c'était mieux l'avant-dernière version [le vitrail MOYEN] ; joue plus la transparence ») : les écailles et le cœur s'ouvrent de FACE (trame), pleins sur la silhouette ; la peau plus claire
  fantome:{uFant:1,uPeint:1}, // (2026-10-18, Léo : « encore plus minuscules, encore plus fantomatiques, construire de nouveaux nuages, les teintes comme un peintre »)
  peintre:{uCoqA0:.34,uCoqA1:.9,uRel:.05,uLueur:1.2,uBis:0,uTache:.12,uChaud:.6,uTrans:.55,uBordC:.85}}; // (2026-10-18, Léo : « pas comme Minecraft ; triche pour obtenir une sorte de réalisme ; fais le peintre ») chaque cube une TOUCHE (chaude au soleil, froide à l ombre), plus de faces dures, le contour en vapeur, la lumière qui TRAVERSE à contre-jour // (2026-10-18) trois dosages du vitrail, à montrer à Léo
{const m9=/[?&]nuvit=(doux|moyen|fort|peintre|fantome|verre|voxel)\b/.exec(location.search);NUVIT.dose=m9?m9[1]:(ARC_ON?'voxel':'fantome');if(NUVIT.dose==='voxel'){NUVIT.on=false;NUVIT.vox={k:+((/[?&]vk=([0-9.]+)/.exec(location.search)||[0,2.4])[1]),kn:+((/[?&]vkn=([0-9.]+)/.exec(location.search)||[0,.9])[1]),jit:+((/[?&]vjit=([0-9.]+)/.exec(location.search)||[0,.045])[1]),det:.22,t0:.42,t1:.84,hb:.35};} /* (2026-10-20, Léo : « le niveau nuage a l'air déchiqueté… entre réalisme et cubes pixel de tailles variables ») LE CUMULUS EN CUBES : un seul corps opaque, voir nuage8Calc (opt.vox) ; ?nuvit=fantome = l'avant */if(NUVIT.dose==='fantome'){NUVIT.fant=ARC_ON?(function(){const q=/[?&]fant=(\d+)/.exec(location.search);return q?+q[1]:1400;})():8000;NUVIT.fsz=ARC_ON?100:110;NUVIT.loin=.4;if(ARC_ON)NUVIT.fdeh=.4;} /* (2026-10-20, Sacha : « trop chelou, il y a trois types de nuages différents ») le vitrail en verre ne vivait qu'entre deux distances (lisse près, grille de verre au milieu, lisse loin) : trois aspects dans une vue. UN type : le corps lisse v8 et sa poussière de cubes, partout */if(NUVIT.dose==='verre'){NUVIT.mix=(function(){const m=/[?&]mix=(\d+)/.exec(location.search);return m?+m[1]:2400;})();NUVIT.fsz=95;NUVIT.loin=.5;NUVIT.fdeh=.75;} /* (2026-10-19, Léo : « reste sur ce que tu as fait, mais un tout petit peu éparpillé — le côté trash de la version d'avant, les petits cubes qui s'éparpillent : le gros nuage condensé qui se sépare en plein de trucs ») LE MÉLANGE : le vitrail en verre + des cubes fantômes, surtout DEHORS */if(NUVIT.dose==='peintre'){NUVIT.nc=48;NUVIT.nsk=34;NUVIT.ecart=.52;NUVIT.jit=.3;NUVIT.coeur=.25;} /* (2026-10-18, Léo : « essaie en mode vitrail » → au questionnaire : PLUS VISIBLE, le dosage FORT par défaut — MOYEN le 18/10 au matin) */for(const q in NV_DOSES[NUVIT.dose])NV_U[q].value=NV_DOSES[NUVIT.dose][q];} // ?nuvit=doux|moyen|fort
function nuVitGLSL(){ // les déclarations et la lumière v8 (copie de nuage8Mat : SANS la vapeur du palier 2)
  return ['uniform vec3 uSunW,uAlb,uSunC,uSky,uGnd'+(',uLav')+';uniform vec2 uNearF;uniform vec4 uK,uR;uniform float uFondu,uTps,uLueur,uScan,uScanV,uCoqA0,uCoqA1,uRel,uEcl,uBis,uTache,uChaud,uTrans,uBordC,uFant,uPeint,uVerre;',
    'float nvVerre(vec3 N,vec3 V){return mix(1.-uVerre,1.,smoothstep(.12,.8,1.-abs(dot(N,V))));}', // (essai ARC) LE VERRE : ouvert de face, plein sur la silhouette
    'vec3 n8lum(vec3 N,vec3 V,vec3 A,vec3 T,out float fr,out float lit){',
    '  float ao=A.r,tv=A.g,hh=A.b,nl=dot(N,uSunW),sh=smoothstep(-.1,.5,uSunW.y);',
    '  lit=smoothstep(uR.x,uR.y,nl);lit*=mix(1.,tv,.6*sh)*mix(.32,1.,ao);',
    '  vec3 alb=uAlb*mix(vec3(1.),T,.3)*uK.x;',
    '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
    '  vec3 ciel=mix('+('uLav')+'*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',
    '  vec3 Fd=normalize(vec3(-uSunW.x,.55,-uSunW.z));float fl=.72+.38*max(dot(N,Fd),0.)+.12*max(-N.y,0.);',
    '  vec3 ombre=ciel*uR.z*fl*mix(.55,1.,ao)*mix(.84,1.,hh);',
    '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
    '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',
    '  vec3 col=alb*mix(ombre,soleil,lit);',
    '  fr=1.-max(dot(N,V),0.);float bk=pow(max(dot(-V,uSunW),0.),3.);',
    '  col+=soleil*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;',
    '  col+=alb*soleil*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);',
    '  return col;}',
    'vec3 n8glow(){return mix(vec3(1.,.97,.9),uSunC/max(max(uSunC.r,uSunC.g),.01),.35)*(.4+.75*min(1.,dot(uSunC,vec3(.3,.59,.11))));}', // le cœur : la lumière de l ambiance (la nuit, plus sourde)
    'float n8onde(float h,float ph){return uScan*exp(-pow((h-fract(uTps*uScanV+ph))/.09,2.));}'].join('\n');}
function nuVitVS(k){ // k : 0 écailles · 1 cœur · 2 peau
  return ['#include <common>','#include <fog_pars_vertex>','uniform float uTps;varying vec3 vN,vW,vA,vT;varying float vPh,vNvF;',...(k===0?['attribute vec3 aG;attribute vec4 aCu;varying vec3 vG,vL;varying float vH;']:[]),
    'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);float ph=0.;vNvF=1.;',
    '#ifdef USE_INSTANCING','  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));{float s9=instanceMatrix[0][3];vNvF=s9<0.?-s9:1.;}','#endif',
    ...(k?['  tr+=nn*(sin(uTps*.33+ph+dot(position,vec3(3.1,4.7,2.3)))*.011+sin(uTps*.19-ph+dot(position,vec3(-5.3,2.9,3.7)))*.007)*step(-.33,position.y);']:[]), // la ouate qui bouillonne (pas les cubes : leurs faces se sépareraient)
    ...(k===0?['  vec3 gg=aG;vL=aCu.xyz;vH=aCu.w;']:[]),
    '#ifdef USE_INSTANCING',
    '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz,iv=1./vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2));',
    '  nn=mat3(instanceMatrix)*(nn*iv);',...(k===0?['  gg=mat3(instanceMatrix)*(gg*iv);']:[]),
    '  tr=(instanceMatrix*vec4(tr,1.)).xyz;',
    '#endif',
    '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
    '  vA=color;vPh=fract(ph*3.7);vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);',...(k===0?['  vG=normalize(mat3(modelMatrix)*gg);']:[]),
    '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');}
const NV_TRAME=['#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
  '  {vec2 q9=floor(gl_FragCoord.xy),h9=floor(q9*.5);float b9=fract(h9.x*.5+h9.y*h9.y*.75)*.25+fract(q9.x*.5+q9.y*q9.y*.75);if(a<=b9+.03125)discard;}'].join('\n'); // opaque ou jeté (la trame de la v8 : l ordre de dessin ne compte pas)
function nuVitFS(k){
  const tete=['#include <common>','#include <fog_pars_fragment>',nuVitGLSL(),'varying vec3 vN,vW,vA,vT;varying float vPh,vNvF;',...(k===0?['varying vec3 vG,vL;varying float vH;']:[])];
  if(k===0)return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(mix(normalize(vG),normalize(vN),uRel));float fr,lit;',
    '  vec3 col=n8lum(N,V,vA,vT,fr,lit)*(.96+.08*vH);',                                                                         // chaque écaille sa nuance
    '  {float h1=fract(vH*13.7),h2=fract(vH*71.3);col*=mix(vec3(1.),mix(vec3(.93,.97,1.07),vec3(1.05,1.01,.93),lit),uChaud);col*=1.+uTache*((h2-.5)*vec3(1.)+(h1-.5)*vec3(.5,.05,-.5));}',
    '  vec3 qb=abs(vL);qb/=max(max(qb.x,max(qb.y,qb.z)),1e-5);float eb=smoothstep(.6,1.,qb.x+qb.y+qb.z-1.-min(qb.x,min(qb.y,qb.z)));',  // le biseau : on lit le cube
    '  float sc=n8onde(vA.b,vPh);vec3 gl=n8glow();',
    '  col=col*(1.-uBis*eb)+gl*(eb*(.04*uLueur+1.1*sc)+sc*.1);',
    '  if(vH>.975)col+=vec3(1.)*pow(.5+.5*sin(uTps*(3.+4.*fract(vH*13.1))+vH*80.),8.)*.6*uEcl;',                                 // un éclat de temps en temps
    '  float a=uFondu*vNvF*(1.-uBordC*smoothstep(.5,.82,1.-abs(dot(normalize(vG),V))))*nvVerre(normalize(vN),V);',NV_TRAME,'  gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}']).join('\n');
  if(k===1)return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW);float fr,lit,sc=n8onde(vA.b,vPh);vec3 gl=n8glow();',
    '  vec3 col=n8lum(normalize(vN),V,vA,vT,fr,lit)*uLueur*(.93+.07*sin(uTps*1.7+vPh*6.2832))+gl*1.5*sc+uSunC*uTrans*pow(max(dot(-V,uSunW),0.),3.)*(1.2-vA.r*.6);',
    '  float a=uFondu*vNvF*nvVerre(normalize(vN),V);',NV_TRAME,'  gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}']).join('\n');
  return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(vN);float fr,lit;vec3 base=n8lum(N,V,vA,vT,fr,lit);',
    '  vec3 rf=reflect(-V,N),sky=mix(uGnd*.85,uSky*1.15,smoothstep(-.3,.5,rf.y));float sc=n8onde(vA.b,vPh);',
    '  vec3 col=mix(base,sky,.18*fr)+uSunC*pow(max(dot(rf,uSunW),0.),220.)*1.6+(.5+.5*cos(6.2832*(fr*1.4+vW.y*.004+vec3(0.,.33,.67))))*fr*.05+n8glow()*sc*.25;', // le ciel au bord, l éclat, le film irisé
    '  float a=min(1.,mix(uCoqA0,uCoqA1,pow(fr,1.5))*(1.-uBordC*.55*smoothstep(.8,1.,fr))+sc*.1)*uFondu*vNvF;',
    '#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
    '  gl_FragColor=vec4(col,a);','#include <fog_fragment>','}']).join('\n');}
/* (2026-10-18, Léo : « le même rendu avec moins de RAM ») LES FANTÔMES EN TEXTURE (`NUF_TEX`, WebGL2) : MESURÉ, les cubes fantômes coûtaient
   ~90 Mo de tampons au GPU et autant de copies en JavaScript — chaque cube était écrit QUATRE fois (un sommet par coin : 240 octets). Désormais
   un cube = 3 texels en demi-précision (24 octets) dans une texture par gabarit ; le sommet retrouve son cube et son coin par gl_VertexID ; un
   seul tampon d'indices pour tous (`NUF_IDX`) ; les copies JavaScript sont jetées une fois envoyées (`nuLibre`). Même image. Sans WebGL2 : les
   attributs d'avant. `?fant=attr` force l'ancien chemin (A/B). */
const NUF_TEX=!!(renderer.capabilities&&renderer.capabilities.isWebGL2)&&!/[?&]fant=attr\b/.test(location.search),NUF_W=1024;
function NU_LIBRE(){this.array=null;} // une fois au GPU, la copie JavaScript ne sert plus (la page se recharge si le contexte est perdu)
function nuLibre(a){if(a&&a.array&&!a.__bpe){a.__bpe=a.array.BYTES_PER_ELEMENT;a.onUpload(NU_LIBRE);}return a;}
let NUF_IDX=null;
function nufIdx(){if(NUF_IDX)return NUF_IDX;const M=10920,I=new Uint16Array(M*6); // les indices de 10 920 carrés : UN tampon pour tous les nuages
  for(let i=0;i<M;i++){const b=i*4,o=i*6;I[o]=b;I[o+1]=b+1;I[o+2]=b+2;I[o+3]=b;I[o+4]=b+2;I[o+5]=b+3;}return (NUF_IDX=nuLibre(new THREE.BufferAttribute(I,1)));}
function nuFantVS(tex){return ['#include <common>','#include <fog_pars_vertex>','uniform float uTps,uNvW;varying vec3 vN,vW,vA,vT;varying vec4 vQ;varying vec2 vUv;varying float vPh;',
  ...(tex?['uniform highp sampler2D uFTex;uniform float uFN;']:['attribute vec4 aQ;attribute vec2 aCo;attribute float aR;']),
  'void main(){',
  ...(tex?['  int cu=gl_VertexID/4,co=gl_VertexID-cu*4,t9=cu*3;',
           '  vec4 T0=texelFetch(uFTex,ivec2(t9%'+NUF_W+',t9/'+NUF_W+'),0),T1=texelFetch(uFTex,ivec2((t9+1)%'+NUF_W+',(t9+1)/'+NUF_W+'),0),T2=texelFetch(uFTex,ivec2((t9+2)%'+NUF_W+',(t9+2)/'+NUF_W+'),0);',
           '  vec3 P9=T0.xyz,N9=T1.xyz,C9=T2.xyz;vec4 Q9=vec4(T0.w,T1.w,T2.w,0.);vec2 O9=vec2(co==1||co==2?1.:-1.,co>=2?1.:-1.);float rk=float(cu)/uFN;']  // le cube : sa place et sa taille, sa normale et son voile, son modelé et sa teinte ; le coin
        :['  vec3 P9=position,N9=normal,C9=color;vec4 Q9=aQ;vec2 O9=aCo;float rk=aR;']), // rk : le RANG du cube (ils sont tirés dans le désordre) — le fondu les montre un par un
  '  vec3 tr=P9;vec3 nn=N9;vT=vec3(1.);float ph=0.,sc=1.,w9=uNvW;',
  '#ifdef USE_INSTANCING','  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));{float s9=instanceMatrix[1][3];w9=s9<0.?-s9:1.;}','#endif',
  '  tr+=nn*sin(uTps*.45+Q9.z*31.+ph)*Q9.x*.7;',                                                         // le fantôme RESPIRE (chacun son temps)
  '#ifdef USE_INSTANCING',
  '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz,iv=1./vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2));nn=mat3(instanceMatrix)*(nn*iv);tr=(instanceMatrix*vec4(tr,1.)).xyz;sc=length(c0);',
  '#endif',
  '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
  '  vA=C9;vQ=Q9;vQ.y*=clamp((w9*1.06-rk)/.06,0.,1.);vUv=O9;vPh=fract(ph*3.7);vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);sc*=length(modelMatrix[0].xyz);',
  '  vec4 mvPosition=viewMatrix*wp;mvPosition.xy+=O9*Q9.x*sc;gl_Position=projectionMatrix*mvPosition;if(vQ.y<=0.)gl_Position=vec4(2.,2.,2.,1.);','#include <fog_vertex>','}'].join('\n');}  // un petit carré face à l objectif : le cube minuscule
function nuFantFS(){return ['#include <common>','#include <fog_pars_fragment>',nuVitGLSL(),'varying vec3 vN,vW,vA,vT;varying vec4 vQ;varying vec2 vUv;varying float vPh;',
  'void main(){vec3 V=normalize(cameraPosition-vW);float fr,lit;vec3 col=n8lum(normalize(vN),V,vA,vT,fr,lit);',
  '  float r=vQ.z;vec3 chaud=mix(vec3(1.08,1.,.9),vec3(1.06,.93,.97),step(.74,r)),froid=mix(vec3(.9,.92,1.05),vec3(.92,.99,1.05),step(.5,r));', // LES TEINTES DU PEINTRE : crème ou rose au soleil, lavande ou bleu ciel à l ombre
  '  col*=mix(vec3(1.),mix(froid,chaud,smoothstep(.12,.62,lit)),uPeint)*1.05;col*=.95+.1*fract(r*7.3);',
  '  vec2 e=abs(vUv);float ed=max(e.x,e.y);col*=(1.-.14*smoothstep(.55,1.,ed))*(1.+.035*(vUv.y-vUv.x));',  // le cube minuscule : un biseau, la lumière d en haut
  '  float sc=n8onde(vA.b,vPh);col+=n8glow()*sc*.2;',
  '  float a=vQ.y*uFant*uFondu*(1.-smoothstep(.88,1.,ed));',
  '#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
  '  if(a<.004)discard;gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n');}
/* (2026-10-24, passe perf 3e tour) LES FANTÔMES CONVERTIS DANS LE TRAVAILLEUR : la toile des cubes fantômes (3 texels demi-précision par cube,
   NUF_TEX) se remplissait sur le fil principal à l'arrivée de chaque nuage — ~8 000 cubes × 12 conversions (toHalfFloat de three) : plusieurs
   nuages arrivés dans la même image la figeaient. nufDemi fait la MÊME conversion (la même formule que THREE.DataUtils.toHalfFloat de r128, bit à
   bit, vérifié sur 6 millions de valeurs) dans l'ouvrier des nuages, qui l'envoie avec le calcul (F.D, pour le décalage F.Dy) ; sans ouvrier, ou
   pour un autre décalage, nuFantGeo la refait ici comme avant. */
function nufDemi(F,dy,W){const n=F.q.length/4,H=Math.ceil(n*3/W),D=new Uint16Array(W*H*4),f=new Float32Array(1),u=new Int32Array(f.buffer);
  const h=function(t){f[0]=t;const e=u[0];let b=e>>16&32768,m=e>>12&2047;const x=e>>23&255;return x<103?b:x>142?(b|=31744,b|=(255==x?0:1)&&8388607&e,b):x<113?(m|=2048,b|=(m>>114-x)+(m>>113-x&1),b):(b|=x-112<<10|m>>1,b+=1&m,b);}; // = THREE.DataUtils.toHalfFloat (r128)
  for(let i=0;i<n;i++){const o=i*12;D[o]=h(F.pos[i*3]);D[o+1]=h(F.pos[i*3+1]+(dy||0));D[o+2]=h(F.pos[i*3+2]);D[o+3]=h(F.q[i*4]);
    D[o+4]=h(F.nor[i*3]);D[o+5]=h(F.nor[i*3+1]);D[o+6]=h(F.nor[i*3+2]);D[o+7]=h(F.q[i*4+1]);D[o+8]=h(F.col[i*3]);D[o+9]=h(F.col[i*3+1]);D[o+10]=h(F.col[i*3+2]);D[o+11]=h(F.q[i*4+2]);}
  return D;}
function nuFantGeo(r,dy,g8){ // les cubes fantômes d'un calcul (r.fant) et le CORPS rentré — g8 : la géométrie v8 de ce calcul (le corps en partage les normales, le modelé, les indices)
  const F=r.fant;if(!F)return null;const n=F.q.length/4,BA=function(a,k){return nuLibre(new THREE.BufferAttribute(a,k));},g=new THREE.BufferGeometry();let tex=null;
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=0;i<n;i++){const x=F.pos[i*3],y=F.pos[i*3+1]+(dy||0),z=F.pos[i*3+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
  if(NUF_TEX){const H=Math.ceil(n*3/NUF_W),D=F.D&&F.Dy===(dy||0)&&F.D.length===NUF_W*H*4?F.D:nufDemi(F,dy,NUF_W);F.D=null; // (converti par l'ouvrier, s'il l'a fait pour CE décalage)
    tex=new THREE.DataTexture(D,NUF_W,H,THREE.RGBAFormat,THREE.HalfFloatType);tex.minFilter=tex.magFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
    tex.onUpdate=function(x){x.image.data=null;}; // (la copie JavaScript jetée une fois envoyée)
    g.setIndex(nufIdx());g.setDrawRange(0,n*6);g.userData.idxPartage=true;}
  else{const P=new Float32Array(n*12),N=new Float32Array(n*12),C=new Float32Array(n*12),Q=new Float32Array(n*16),O=new Float32Array(n*8),RK=new Float32Array(n*4),I=n*4<65535?new Uint16Array(n*6):new Uint32Array(n*6),CO=[-1,-1,1,-1,1,1,-1,1];
    for(let i=0;i<n;i++){for(let c=0;c<4;c++){const v=i*4+c;for(let j=0;j<3;j++){P[v*3+j]=F.pos[i*3+j]+(j===1?(dy||0):0);N[v*3+j]=F.nor[i*3+j];C[v*3+j]=F.col[i*3+j];}for(let j=0;j<4;j++)Q[v*4+j]=F.q[i*4+j];O[v*2]=CO[c*2];O[v*2+1]=CO[c*2+1];RK[v]=i/n;}
      const b=i*4,o=i*6;I[o]=b;I[o+1]=b+1;I[o+2]=b+2;I[o+3]=b;I[o+4]=b+2;I[o+5]=b+3;}
    g.setAttribute('position',BA(P,3));g.setAttribute('normal',BA(N,3));g.setAttribute('color',BA(C,3));g.setAttribute('aQ',BA(Q,4));g.setAttribute('aCo',BA(O,2));g.setAttribute('aR',BA(RK,1));g.setIndex(BA(I,1));}
  const e9=F.k*3;g.boundingSphere=new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+e9); // (posée à la main : sans attribut de position three ne la calcule pas)
  const c=new THREE.BufferGeometry();
  if(g8){const P0=g8.attributes.position.array,N0=g8.attributes.normal.array,PB=new Float32Array(P0.length);for(let i=0;i<PB.length;i++)PB[i]=P0[i]-N0[i]*F.k; // le corps PARTAGE normales, modelé et indices de la surface v8 (déjà à sa place)
    c.setAttribute('position',BA(PB,3));c.setAttribute('normal',g8.attributes.normal);c.setAttribute('color',g8.attributes.color);c.setIndex(g8.index);c.userData.partage=true;}
  else{const PB=new Float32Array(r.pos.length);for(let i=0;i<PB.length;i++)PB[i]=r.pos[i]-r.nor[i]*F.k;c.setAttribute('position',BA(PB,3));c.setAttribute('normal',BA(r.nor,3));c.setAttribute('color',BA(r.col,3));c.setIndex(BA(r.idx,1));if(dy)c.translate(0,dy,0);}
  c.computeBoundingSphere();
  return {fan:g,corps:c,tex:tex,n:n,tri:(n*6+(c.index.count))/3};}
function nufMat(base,G){if(!G.tex)return base;const K=base===nuVitMats(true).fan?'mS':'mI';if(G[K])return G[K]; // la matière d'un gabarit : la même (même programme), avec SA texture
  const m=base.clone();m.uniforms=Object.assign({},base.uniforms,{uFTex:{value:G.tex},uFN:{value:G.n}});m.defines=Object.assign({},base.defines);m.customProgramCacheKey=base.customProgramCacheKey;return (G[K]=m);}
function nufJette(m){ // un nuage seul qui disparaît : sa texture, sa matière ; le tampon d'indices partagé n'est JAMAIS détruit
  const g=m.geometry;if(g&&g.userData.idxPartage)g.setIndex(null);const u=m.material&&m.material.uniforms;if(u&&u.uFTex&&u.uFTex.value){u.uFTex.value.dispose();m.material.dispose();}}
function nuVitMats(solo){ const cle=solo?'s':'i',K='mv'+cle;if(COTON[K])return COTON[K];
  const m8=nuage8Mat(),U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k in N8_U)U[k]=m8.uniforms[k]||N8_U[k];for(const k in NV_U)U[k]=NV_U[k];U.uNvW={value:1}; /* (2026-10-18, fondu) la part de cubes d'un nuage SEUL (posée par objet) */
  const R={};['cub','coe','pea','fan'].forEach(function(n,k){
    const tx=k===3&&NUF_TEX;if(tx)U.uFTex={value:null};
    const m=new THREE.ShaderMaterial({uniforms:U,vertexColors:!tx,fog:true,transparent:k>=2,depthWrite:k<2,vertexShader:k===3?nuFantVS(tx):nuVitVS(k),fragmentShader:k===3?nuFantFS():nuVitFS(k)});
    m.defines=solo?{}:{NUAGE8_INST:''};const ck='nuvit'+n+cle+(tx?'t':'');m.customProgramCacheKey=function(){return ck;};R[n]=m;});
  R.corps=solo?nuage8Solo():nuage8Mat(); // (fantôme) le corps rentré garde la matière v8
  return (COTON[K]=R);}
function nuVitGeo(r,dy){ // les trois maillages d'un calcul (r.vit) — dy : le décalage vertical d'un nuage seul
  const v=r.vit;if(!v)return null;const BA=function(a,n){return new THREE.BufferAttribute(a,n);};
  const c=new THREE.BufferGeometry();c.setAttribute('position',BA(v.cpos,3));c.setAttribute('normal',BA(v.cnor,3));c.setAttribute('aG',BA(v.cg,3));c.setAttribute('color',BA(v.ccol,3));c.setAttribute('aCu',BA(v.ccu,4));c.setIndex(BA(v.cidx,1));
  const P=new Float32Array(r.pos.length),k9=v.hc*(NUVIT.coeur||.6);for(let i=0;i<P.length;i++)P[i]=r.pos[i]-r.nor[i]*k9; // le cœur : la surface v8 rentrée
  const o=new THREE.BufferGeometry();o.setAttribute('position',BA(P,3));o.setAttribute('normal',BA(r.nor,3));o.setAttribute('color',BA(r.col,3));o.setIndex(BA(r.idx,1));
  const s=new THREE.BufferGeometry();s.setAttribute('position',BA(v.spos,3));s.setAttribute('normal',BA(v.snor,3));s.setAttribute('color',BA(v.scol,3));s.setIndex(BA(v.sidx,1));
  for(const g of [c,o,s]){if(dy)g.translate(0,dy,0);g.computeBoundingSphere();}
  return {cub:c,coe:o,pea:s,tri:(v.cidx.length+r.idx.length+v.sidx.length)/3};}
function nuVitPose(k,f,r){const V=COTON.vit&&COTON.vit[k*4+f];if(!V)return;const G=r._nv||(r._nv=nuVitGeo(r,0));if(!G)return; // le vitrail d'un gabarit est arrivé : ses trois maillages (les mêmes géométries pour les deux lots fins)
  V.c.geometry=G.cub;V.o.geometry=G.coe;V.p.geometry=G.pea;V.tri=G.tri;V.ok=true;}
function nuFantPose(k,f,r,g8){const V=COTON.vit&&COTON.vit[k*4+f];if(!V)return;const G=r._nf||(r._nf=nuFantGeo(r,0,g8));if(!G)return;V.g.material=nufMat(V.g.material,G); // les cubes fantômes d'un gabarit : les mêmes pour les deux lots fins
  if(NUVIT.mix&&r.vit){const nl9=Math.floor(G.n*NUVIT.loin);let gf=G.fan;if(f===2){gf=new THREE.BufferGeometry();for(const a in G.fan.attributes)gf.setAttribute(a,G.fan.attributes[a]);gf.setIndex(G.fan.index);gf.setDrawRange(0,nl9*6);gf.boundingSphere=G.fan.boundingSphere;gf.userData.idxPartage=!!G.tex;}
    V.g.geometry=gf;V.gOk=true;V.tri+=(f===2?nl9:G.n)*2;return;} // (mélange) le vitrail garde son cœur : seuls les cubes éparpillés s'ajoutent
  const nl9=Math.floor(G.n*NUVIT.loin);let gf=G.fan;if(f===2){gf=new THREE.BufferGeometry();for(const a in G.fan.attributes)gf.setAttribute(a,G.fan.attributes[a]);gf.setIndex(G.fan.index);gf.setDrawRange(0,nl9*6);gf.boundingSphere=G.fan.boundingSphere;gf.userData.idxPartage=!!G.tex;} // (perf) le lot LOINTAIN : une partie des fantômes (mêmes tampons, même texture)
  V.b.geometry=G.corps;V.g.geometry=gf;V.tri=(G.corps.index.count+(f===2?nl9:G.n)*6)/3;V.ok=true;V.fan=true;}
window.dbgRamNuages=function(){ // (banc, 2026-10-18) la mémoire des NUAGES : octets des tampons et textures envoyés au GPU (uniques) et copies gardées côté JavaScript
  const A=new Set(),T=new Set();let gpu=0,js=0,tg=0,tj=0,nG=0;
  const at=function(x){if(!x||A.has(x))return;A.add(x);const bpe=x.array?x.array.BYTES_PER_ELEMENT:(x.__bpe||4);gpu+=x.count*x.itemSize*bpe;if(x.array)js+=x.array.byteLength;};
  const vu=function(o){o.traverse(function(m){if(!m.geometry)return;nG++;const g=m.geometry;for(const k in g.attributes)at(g.attributes[k]);at(g.index);if(m.isInstancedMesh){at(m.instanceMatrix);at(m.instanceColor);}
    const u=m.material&&m.material.uniforms;if(u)for(const k in u){const v=u[k]&&u[k].value;if(v&&v.isDataTexture&&!T.has(v)){T.add(v);const im=v.image;tg+=im.width*im.height*(v.type===THREE.HalfFloatType?8:16);if(im.data)tj+=im.data.byteLength;}}});};
  if(COTON.root)vu(COTON.root);for(const c of CLOUDS)if(c.g)vu(c.g);
  const Mo=function(x){return +(x/1048576).toFixed(1);};return {gpuMo:Mo(gpu+tg),jsMo:Mo(js+tj),tamponsMo:Mo(gpu),texturesMo:Mo(tg),maillages:nG,nuagesApart:CLOUDS.length};};
window.dbgNuVue=function(k,a,p,h){ // (banc) la même vue, vitrail 0/1 : la caméra posée à h m au-dessus de la caisse, tournée de a (rad) par rapport à son cap, levée de p (rad)
  if(started&&!gameOver&&!paused)togglePause();
  if(typeof a==='string'&&a.indexOf('nuage')===0){const n9=+a.slice(5)||0,L9=[];for(let j=0;j<COTON.n;j++)L9.push(j);L9.sort(function(x,y){return COTON.I[y*COTON_ST+3]-COTON.I[x*COTON_ST+3];}); // (banc) 'nuageN' : le N-ième plus grand nuage, vu à h × son rayon, de l angle p
    const o=L9[Math.min(n9,L9.length-1)]*COTON_ST,r=COTON.I[o+3],S=COTON.S[COTON.I[o+5]],cx=COTON.I[o],cz=COTON.I[o+2],cy=COTON.I[o+1]+S.base*r*COTON.I[o+9]+COTON.I[o+7]*.5,d=(+h||2.5)*r,an=+p||0;
    const x=cx+Math.sin(an)*d,z=cz+Math.cos(an)*d,y=cy+d*.12;dbgNuVue.v={x:x,y:y,z:z,yaw:Math.atan2(cx-x,cz-z),p:Math.atan2(cy-y,Math.hypot(cx-x,cz-z))};}
  else   if(a!=null){const cp=carGroup.position,f=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);f.y=0;f.normalize();dbgNuVue.v={x:cp.x,y:cp.y+(+h||6),z:cp.z,yaw:Math.atan2(f.x,f.z)+(+a),p:+p||0};}
  const v=dbgNuVue.v;if(v){camera.position.set(v.x,v.y,v.z);camera.up.set(0,1,0);camera.lookAt(v.x+Math.sin(v.yaw)*Math.cos(v.p)*100,v.y+Math.sin(v.p)*100,v.z+Math.cos(v.yaw)*Math.cos(v.p)*100);camera.updateMatrixWorld();}
  return dbgNuVit(k,{rendre:1});};
window.dbgNuVit=function(k,o){o=o||{};if(k!=null)NUVIT.on=!!+k;if(o.fondu!=null)NUVIT.fondu=!!+o.fondu; /* (banc) fondu 0 = les bascules d'avant */if(o.dose&&NV_DOSES[o.dose]){NUVIT.dose=o.dose;for(const q in NV_DOSES[o.dose])NV_U[q].value=NV_DOSES[o.dose][q];}for(const n in o)if(NV_U[n])NV_U[n].value=+o[n]; // (banc) A/B sur la même image : 0 = la v8 seule, 1 = en vitrail ; {uLueur, uScan, uCoqA0, uCoqA1, uRel…}
  for(const c of CLOUDS){const m=c.mesh;if(!m||!m.userData.vit)continue;const on=NUVIT.on;m.userData.vitOn=on;for(const o9 of m.userData.vit)o9.visible=on;m.geometry=on?m.userData.gVit:m.userData.g8;m.material=on?m.userData.mVit:nuage8Solo();m.userData.m8=m.material;}
  if(COTON.root)cotonTick(camera);if(paused||o.rendre){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  if(o.banc){const gl=renderer.getContext(),px=new Uint8Array(4),T=[];for(let i=0;i<o.banc;i++){const t0=performance.now();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-t0);}T.sort((a,b)=>a-b);return +T[T.length>>1].toFixed(1);} // (banc) ms d une image synchronisée
  let n=0;if(COTON.vit)for(const V of COTON.vit)if(V&&V.ok)n++;
  if(o.detail&&COTON.vit){const D=[];for(let q=0;q<COTON.vit.length;q++){const V=COTON.vit[q];if(V&&V.ok)D.push([q>>2,q&3,V.c.geometry.index.count/3,V.o.geometry.index.count/3,V.p.geometry.index.count/3,COTON.im[q].userData.tri]);}return D;} // (banc) [gabarit, finesse, écailles, cœur, peau, v8]
  return {on:NUVIT.on,fondu:NUVIT.fondu,lotsPrets:n,tri:COTON.tri,seuls:CLOUDS.filter(function(c){return c.mesh&&c.mesh.userData.vit;}).length,u:Object.keys(NV_U).reduce(function(a,q){a[q]=NV_U[q].value;return a;},{})};};
window.dbgNet=function(on){FLOU_OK=!on;if(on&&acesPass)acesPass.uniforms.uSpeed.value=0;return !FLOU_OK;}; // (dev) une image NETTE pour les bancs (le flou de vitesse coupé)
let FLOU_ON=true;window.dbgFlou=function(o){o=o||{};if(!acesPass)return null;const U=acesPass.uniforms; // (2026-10-14, flou-vitesse) BANC : v = le flou v2/v1 (une recompilation : jamais en course), s = une vitesse d'effet forcée sur l'image figée, fv = [rayon,force,warp,courbe]
  if(o.v!=null&&!!o.v!==FLOU_ON){FLOU_ON=!!o.v;acesPass.material.fragmentShader=flouFS(acesPass.material.fragmentShader,FLOU_ON);acesPass.material.needsUpdate=true;}
  if(o.fv)U.uFv.value.fromArray(o.fv);if(o.s!=null){loop._sfx=+o.s;U.uSpeed.value=+o.s;postCaisse(U);}
  if(o.s!=null&&paused&&POST_ON&&composer)composer.render();return {v:FLOU_ON,s:+U.uSpeed.value.toFixed(3),fv:U.uFv.value.toArray()};};
window.dbgCotonV2=function(o){if(o&&N8_U.uVapK)for(const k of ['x','y','z','w'])if(o[k]!=null)N8_U.uVapK.value[k]=o[k];return {vap:N8_VAP,palier:PAL.n,k:N8_U.uVapK?N8_U.uVapK.value.toArray():null,tex:!!(N8_U.uVap&&N8_U.uVap.value)};}; // (banc, coton-blanc) doses de la vapeur à chaud : x érosion · y grain · z or · w tout
function cotonInit(){ if(COTON.root)return; // une fois par session : 24 gabarits × 4 finesses, en instances
  COTON.t0=performance.now();COTON.pret=new Uint8Array(COTON_KINDS*4);
  const rg=mulberry32(0xC07070),SPH=COTON.SEG.map(function(s){return new THREE.SphereGeometry(1,s[0],s[1]);}),m=nuage8Mat();
  COTON.root=new THREE.Group();COTON.root.name='coton';COTON.root.visible=false;scene.add(COTON.root);COTON.L=[];
  COTON.vit=[];const MV=nuVitMats(false); // (2026-10-18) LE VITRAIL : trois maillages de plus par lot fin (finesses 2 et 3), mêmes instances
  COTON.W=new Float32Array(COTON.cap);COTON.WC=new Float32Array(COTON.cap);COTON.LV=MV?Array.from({length:COTON_KINDS*2},function(){return {i:new Int32Array(COTON.cap),d:new Float32Array(COTON.cap),n:0};}):null; // (2026-10-18, LE FONDU) les parts (corps, cubes) de chaque nuage, et, par jeu de cubes (gabarit × lot 2|3), ceux qui en ont une
  const rgC=mulberry32(0xC0F1E5); // (v7) le hasard du chou-fleur, à part
  for(let k=0;k<COTON_KINDS;k++){let S;{S=cumulus8(k===24?'cumulonimbus':k<6?N8_GENRE6[k]:(N8_GENRE_V[COTON_GENRES[k-6]]||COTON_GENRES[k-6]),rg);S.fin=1;}COTON.S.push(S);
    const g0=NUVIT.vox?nuVide():cotonGeo(({B:S.B.slice(0,12),base:S.base,top:S.top}),SPH[0]);COTON.pret[k*4]=1; /* (2026-10-21, Léo : « enlève tous les ronds qui n'ont plus rien à voir avec les nouveaux nuages ») plus de BOULES provisoires : un nuage n'existe à l'image que fini */ /* (v8) l'ébauche sur les 12 premiers lobes (base et dôme) : 70 lobes coûtaient 160 ms au lancement */ // (2026-09-30) la finesse la plus LÉGÈRE tout de suite (7 % du calcul) : elle tient la place des trois autres, qui arrivent de l'ouvrier
    for(let f9=0;f9<4;f9++){const im=new THREE.InstancedMesh(g0,m,COTON.cap);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled=false;im.count=0;im.castShadow=im.receiveShadow=false;im.matrixAutoUpdate=false;im.userData.tri=im.geometry.index.count/3;
      im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*3).fill(1),3);im.instanceColor.setUsage(THREE.DynamicDrawUsage); // (v6) la teinte par nuage — sur TOUS les lots dès la création : un seul programme
      COTON.root.add(im);COTON.im.push(im);COTON.L.push({i:new Int32Array(COTON.cap),d:new Float32Array(COTON.cap),n:0});
      if(MV&&f9>=2){const V={g0:g0,ok:false,tri:0,A:new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*16),16),C:new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*3).fill(1),3)};V.A.setUsage(THREE.DynamicDrawUsage);V.C.setUsage(THREE.DynamicDrawUsage);
        for(const q9 of [['c',MV.cub],['o',MV.coe],['p',MV.pea],['b',MV.corps],['g',MV.fan]]){const x=new THREE.InstancedMesh(g0,q9[1],COTON.cap);x.instanceMatrix=V.A;x.instanceColor=V.C; // les trois maillages partagent LEURS instances (les nuages trop proches restent dans le lot v8)
        x.frustumCulled=false;x.count=0;x.visible=false;x.castShadow=x.receiveShadow=false;x.matrixAutoUpdate=false;COTON.root.add(x);V[q9[0]]=x;}COTON.vit[k*4+f9]=V;}}}
  {for(let k=0;k<COTON_KINDS;k++)COTON.S[k].seed=k*7+1;COTON.pret.fill(0); // (v8) les QUATRE finesses de la surface arrivent de l'ouvrier ; l'ébauche en sphères tient la place
    for(let f=0;f<4;f++)for(let k=0;k<COTON_KINDS;k++)nuage8Async(COTON.S[k],N8_FIN[f],function(r){const g9=cotonBuf(r);cotonFinesse(k,f,g9);if(r.skin)nuSkinPose(k,f,r.skin);if(r.vit){nuVitPose(k,2,r);nuVitPose(k,3,r);}if(r.fant){nuFantPose(k,2,r,g9);nuFantPose(k,3,r,g9);}},f===2?NUVIT.nc:0);} // (vitrail) calculé UNE fois par gabarit (avec la finesse 2 : le cœur n'est vu que dans les joints), les deux lots fins le partagent // les plus légères d'abord : le ciel s'affine en quelques instants, sans jamais geler
  for(const s of SPH)s.dispose();COTON.I=new Float32Array(COTON.cap*COTON_ST);COTON.msInit=performance.now()-COTON.t0;
}
function cotonGrille(){ // la piste en cases de 120 m : un point tous les ~18 m (la garde ne teste que les cases voisines)
  const st=Math.max(1,Math.round(18/Math.max(.5,L/Math.max(1,NP-1)))),g=new Map();
  for(let i=0;i<NP;i+=st){const p=pts[i],k=Math.floor(p.x/120)+','+Math.floor(p.z/120);let a=g.get(k);if(!a)g.set(k,a=[]);a.push(i);}
  return g;}
function cotonTouche(x,y,z,r,ry){ // ce nuage (ellipsoïde r × ry autour de x,y,z) mord-il sur la route ? — même mesure que nuageTouche
  const g=COTON.grid;if(!g)return false;const rh=r+ROAD_HALF+18+(COTON.corrH||0),rv=ry+22+(COTON.corrV||0),ih=1/(rh*rh),iv=1/(rv*rv),n=Math.ceil(rh/120),cx=Math.floor(x/120),cz=Math.floor(z/120);
  for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const L9=g.get((cx+a)+','+(cz+b));if(!L9)continue;
    for(let j=0;j<L9.length;j++){const p=pts[L9[j]],dx=p.x-x,dz=p.z-z,dy=p.y-y;if((dx*dx+dz*dz)*ih+dy*dy*iv<1)return true;}}
  return false;}
function cotonPose(x,yB,z,r,k,cr,syF){ // un nuage dont le DESSOUS est à yB — refusé s'il toucherait le ruban · syF : étirement vertical imposé (les colonnes des cathédrales)
  if(COTON.n>=COTON.cap)return false;const S=COTON.S[k];
  const gn=cotonGenre(k),sx=.86+cr()*.44,sy0=(gn==='fractus'||gn==='altocumulus'||gn==='stratocumulus')?.75+cr()*.25:.85+cr()*.3,sy=syF||sy0,h=(S.top-S.base)*r*sy; // (v4) chaque nuage a SON étirement : deux nuages du même gabarit ne se ressemblent plus
  if(cotonTouche(x,yB+h*.5,z,r*1.02*sx,h*.5+r*.05))return false;
  const o=COTON.n*COTON_ST,I=COTON.I;I[o]=x;I[o+1]=yB-S.base*r*sy;I[o+2]=z;I[o+3]=r;I[o+4]=cr()*6.2832;I[o+5]=k;I[o+6]=cr()*6.28;I[o+7]=h;I[o+8]=sx;I[o+9]=sy;
  {const l9=.82+cr()*.22,w9=(cr()-.5)*2,lourd=cr()<.12;{const g9=(.88+(l9-.82)*.727)*(lourd?.94:1);I[o+10]=I[o+11]=I[o+12]=g9;}} /* (coton-blanc) un BLANC neutre .83-1,04 (vu à 30 % par le shader : ±3 % de luminance, 0 % de teinte) — mêmes trois tirages `cr` */ // (v6) SA TEINTE : clair/sourd, chaud/froid, parfois lourd (la moitié passe la lumière de peintre)
  COTON.n++;return true;}
function cotonVide(){COTON.n=0;if(COTON.root){COTON.root.visible=false;for(const im of COTON.im)im.count=0;}}
// classique · bas · tour · flocon · banc · double | (v4) humilis ×2 · mediocris ×2 · congestus ×2 · castellanus · fractus
const COTON_POIDS=(function(){ // (v6) près · milieu · loin — les classiques pèsent moins (on les revoyait à chaque partie), chaque genre a sa distance
  const C={pres:[2,1,.3,2,.8,1.2],mil:[1.4,1,1,1,1,1.4],loin:[1,1.2,2,.4,1.2,1]},W={humilis:[2.2,1,.8],mediocris:[1.6,1.4,1.2],congestus:[.3,1.3,2.2],castellanus:[.8,1.2,1],fractus:[1.6,.6,.2],
    stratocumulus:[.8,1.3,1.6],altocumulus:[1.2,1.4,.6],cisaille:[.3,1,1.4],champignon:[.1,.6,1.6],
    arche:[.35,1,1.5],meduse:[.5,1.3,.9],anneau:[.35,1,1.3],spirale:[.25,.9,1.6],gateau:[.4,1.1,1.3],vague:[.3,1,1.5]},o={pres:[],mil:[],loin:[]};
  ['pres','mil','loin'].forEach(function(q,j){for(let k=0;k<6;k++)o[q].push(C[q][k]*.55);for(const g of COTON_GENRES)o[q].push(W[g][j]);});return o;})();
function cotonKind(cr,w){let s=0;for(const x of w)s+=x;let u=cr()*s;for(let k=0;k<w.length;k++){u-=w[k];if(u<=0)return k;}return 0;}
function cotonJade(cr){ // (2026-10-14, passe graphismes) le coton des PICS DE JADE — tiré sur `cr` (le flux des nuages : la piste et la vallée ne bougent pas)
  const J=COTON_JADE,km=L/1000,perp=function(i){const t=T[i],l=Math.hypot(t.x,t.z)||1;return [-t.z/l,t.x/l];};
  let yMin=1e9;for(let i=0;i<NP;i+=4)if(pts[i].y<yMin)yMin=pts[i].y;const sol=yMin-45+24; // l'eau est à yMin-45 (JADE.eauY, bâtie après) : aucun dessous de nuage dans le fleuve
  for(let pa=0;pa<3;pa++){const KS=J.K[pa?1:0],plats=KS.slice(0,2),N=Math.max(2,Math.round(J.n[pa]*km));
    for(let k=0;k<N;k++){const i=Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/N)*NP)),p=pts[i],q=perp(i),t9=T[i],sg=cr()<.5?-1:1,u=cr(),al=(cr()-.5)*420,x0=p.x+t9.x*al,z0=p.z+t9.z*al;
      if(u<.36){ // (a) LES BANCS ENTRE LES PICS : des cumulus plats, au niveau de la brume (du fleuve à la route), à 250-900 m du ruban
        const r=cotonR(cr,80,200,1.3),kk=cr()<.7?plats[cr()*2|0]:KS[cr()*KS.length|0],yB=Math.max(sol,p.y-150+cr()*170),sy=.68+cr()*.24;let d=ROAD_HALF+r+230+cr()*600;
        for(let t=0;t<3;t++,d+=150)if(cotonPose(x0+q[0]*sg*d,yB,z0+q[1]*sg*d,r,kk,cr,sy))break;}
      else if(u<.72){ // (b) LES MASSES DERRIÈRE LES PICS : 1-2,3 km, de grands cumulus dont la base trempe dans la brume
        const r=cotonR(cr,240,520,1.4),kk=KS[cr()*KS.length|0],d=1000+cr()*1300;cotonPose(x0+q[0]*sg*d,Math.max(sol,p.y-170+cr()*480),z0+q[1]*sg*d,r,kk,cr);}
      else{ // (c) CEUX D'EN HAUT, au-dessus des cimes, qui se découpent sur le ciel du rouleau — jamais au-dessus du ruban (≥ 450 m de côté) ; vus à l'image : sans eux le ciel restait vide, les pics cachent les bancs
        const r=cotonR(cr,160,380,1.4),d=450+cr()*1500;cotonPose(x0+q[0]*sg*d,p.y+330+cr()*500,z0+q[1]*sg*d,r,cr()<.6?plats[cr()*2|0]:KS[cr()*KS.length|0],cr,.7+cr()*.25);}}
    J.lim[pa]=COTON.n;}
  {const c=LVL.cur,t=c.nuit?([.14,.17,.19]):(c.orage?([.62,.66,.70]):null); // de NUIT, la ouate prenait la lune en plein (vue à l'image : lavande claire devant des pics noirs) — sa teinte par nuage la rentre dans l'ombre ; sous l'ORAGE, un peu
    if(t)for(let j=0;j<COTON.n;j++){const o=j*COTON_ST;COTON.I[o+10]*=t[0];COTON.I[o+11]*=t[1];COTON.I[o+12]*=t[2];}}
  COTON.jd=J;COTON.root.visible=COTON.n>0;}
/* ============================== LE PLAN D'AVION (2026-10-21, Léo : « tu te perds un peu, fais un point de vue avion vu de haut ; l'impression que tu n'arrives pas à bien
   ranger tout ça : la voiture se retrouve parfois dans un truc avec que des nuages, c'est trop chaotique ») ==============================
   Mesuré au plan (`dbgPlanNuages`, vue de dessus) sur la mer de nuages du matin : 56 nuages de toutes tailles semés au hasard par six couronnes superposées, la route
   à moins d'un demi-rayon d'un nuage 25 % du temps et dedans 2,4 %. Désormais, aux NUAGES (toutes les météos), un PLAN :
     · UN COULOIR LIBRE autour du ruban (NU_ORD : 95 m de côté, 55 m de haut en plus de la garde d'avant) — plus de nuage de décor sur la route ;
     · QUATRE RANGÉES, de chaque côté en alternance, au pas régulier le long de la piste (un peu de jeu) : PROCHE (r 55-90, ~230 m du bord, une île tous les 2,3 km),
       MILIEU (r 130-210, 480-640 m, tous les 1,9 km), LOINTAINE (r 260-420, 1,1-1,5 km, tous les 1,7 km), HAUTE (r 120-210, 700-1 100 m de côté, 240-300 m au-dessus,
       tous les 2,8 km) ; chaque rangée a SON plafond (le dessous des nuages suit la route : -100 · -190 · -280 m) et sa taille : plus on est loin, plus c'est gros ;
     · les cathédrales, massifs, titans et le colosse (ancres de fond) sont gardés. L'orage garde son plafond, perd ses murs au ras de la route.
   `?ordre=0` = le semis d'avant. */
const NU_ORD={corrH:95,corrV:55};
function cotonOrdonne(cr,perp){
  const R=[ // [pas (m), rayon min, rayon max, côté min, côté max, plafond (dessous du nuage par rapport à la route), poids]
    {pas:2300,r:[60,95],d:[210,300],y:-100,w:COTON_POIDS.pres},
    {pas:1900,r:[130,210],d:[480,640],y:-190,w:COTON_POIDS.mil},
    {pas:1700,r:[260,420],d:[1100,1500],y:-280,w:COTON_POIDS.loin},
    {pas:2800,r:[120,210],d:[700,1100],y:260,w:COTON_POIDS.mil}];
  const libre=function(x,y,z,r){ // jamais deux nuages qui se chevauchent à la même altitude (sinon : un tas, pas un plan)
    const I=COTON.I;for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,dx=I[o]-x,dz=I[o+2]-z,rr=(I[o+3]*I[o+8]+r)*.8;if(dx*dx+dz*dz<rr*rr&&Math.abs(I[o+1]+I[o+7]*.5-y)<(I[o+7]*.5+r*.5)+60)return false;}return true;};
  R.forEach(function(t){const K=Math.max(2,Math.round(L/t.pas)),ph=cr()<.5?0:1;
    for(let k=0;k<K;k++){const i=Math.max(0,Math.min(NP-1,Math.round(((k+.5+(cr()-.5)*.5)/K)*(NP-1)))),p=pts[i],q=perp(i),sg=((k+ph)&1)?1:-1,
      r=t.r[0]+(t.r[1]-t.r[0])*cr(),kk=cotonKind(cr,t.w);let d=t.d[0]+(t.d[1]-t.d[0])*cr();
      for(let e=0;e<3;e++,d*=1.25){const x=p.x+q[0]*sg*d,y=p.y+t.y+(cr()-.5)*40,z=p.z+q[1]*sg*d;if(libre(x,y+r*.35,z,r)&&cotonPose(x,y,z,r,kk,cr))break;}}});}
function buildCoton(cr){
  cotonInit();cotonVide();COTON.jd=null;COTON.corrH=0;COTON.corrV=0;if(!(NP>1)||!pts.length)return;COTON.grid=cotonGrille();
  if(LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&!LVL.cur.sansNuages){cotonJade(cr);return;} // (2026-10-14, passe graphismes) LES PICS DE JADE : le ciel de coton, à leur mesure
  const okD=lvlNuageOk({deco:true}),okG=lvlNuageOk({giant:true});if(!okD&&!okG)return;
  const ORD=!!(ARC_ON&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!/[?&]ordre=0\b/.test(location.search));if(ORD){COTON.corrH=NU_ORD.corrH;COTON.corrV=NU_ORD.corrV;} // (2026-10-21) LE PLAN D'AVION : voir cotonOrdonne
  const strat=function(k,K){return Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/K)*NP));};
  const perp=function(i){const t=T[i],l=Math.hypot(t.x,t.z)||1;return [-t.z/l,t.x/l];}; // le travers HORIZONTAL du ruban (jamais B[i] : piste inclinée)
  if(okD){
    const OR=LVL.cur&&LVL.cur.id==='orage',A9=ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?CDENS:1,M9=OR?1.6:1,KK=function(n){return Math.max(1,Math.round(n*M9*A9*(LVL.cur&&LVL.cur.id==='nuages'?.5:1)));}; // (2026-09-30) ×0,5 aux NUAGES (NZ, plus bas)
    /* (2026-09-30, Sacha : « retravaille les nuages dans le premier niveau, il en faut des plus gros ») GZ : aux NUAGES, les couronnes proche, du
       milieu, haute et lointaine grossissent de ~45 % (bornes de la loi de puissance ×1,45) — même nombre de nuages, mais des MASSES qui
       remplissent le cadre ; la garde de la route rejette toujours ceux qui la toucheraient (on en perd un peu : c'est voulu). */
    /* (2026-09-30, 2e passe, Sacha : « moins de nuages dans le premier niveau, mais il faut qu'ils soient plus gros ») : aux NUAGES, DEUX fois moins
       de nuages dans chaque couronne (NZ) et des tailles ×1,9 (GZ, 1,45 à la 1re passe) — de grandes masses, et du ciel entre elles. */
    const GZ=LVL.cur&&LVL.cur.id==='nuages'?1.9:1,NZ=(LVL.cur&&LVL.cur.id==='nuages'?.5:1)*A9; // (2026-09-29) L'ORAGE : plus de nuages partout — (2026-09-30, « au point que ça gêne la visibilité ») ×1,25 → ×1,6
    for(let k=0;k<(ORD?0:KK(30));k++){ // (1) LA COURONNE PROCHE, EN ARCHIPELS (Dragons) : des îlots de 2-3 nuages (un grand, ses satellites au même plafond),
      // et du CIEL OUVERT entre deux — 80 nuages semés un par un encombraient tout le champ (« liberté » = des vides qu'on traverse)
      const i=strat(k,KK(30)),p=pts[i],q=perp(i),sg=cr()<.5?-1:1,r=cotonR(cr,30*GZ,160*GZ,1.5),kk=cotonKind(cr,COTON_POIDS.pres),yB=p.y-130+cr()*300; // (v4) tailles en loi de puissance
      let d=ROAD_HALF+r+50+cr()*300,cx=0,cz=0,ok=false;for(let t=0;t<3;t++,d+=110){cx=p.x+q[0]*sg*d;cz=p.z+q[1]*sg*d;if(cotonPose(cx,yB,cz,r,kk,cr)){ok=true;break;}}
      if(ok){const ns=A9<1?(cr()*2|0):1+(cr()*2|0),t9=T[i];for(let m=0;m<ns;m++){const a=(m?-1:1)*(1.5+cr()*1.1)*r,rs=r*(.4+cr()*.3); // les satellites, le long de la route et un peu en travers
        cotonPose(cx+t9.x*a+q[0]*sg*(cr()-.3)*r,yB+(cr()-.5)*r*.3,cz+t9.z*a+q[1]*sg*(cr()-.3)*r,rs,cotonKind(cr,COTON_POIDS.pres),cr);}}}
    for(let k=0;k<(ORD?0:KK(26));k++){ // (2) AU-DESSUS et EN DESSOUS du ruban (la garde garde 18-22 m de ciel libre autour de la route)
      const i=strat(k,KK(26)),p=pts[i],q=perp(i),r=cotonR(cr,24*GZ,130*GZ,1.5),kk=cotonKind(cr,COTON_POIDS.pres),S=COTON.S[kk],h=(S.top-S.base)*r*1.3,lat=(cr()-.5)*120;
      const yB=cr()<.6?p.y+70+cr()*190:p.y-(THICK+60+cr()*170)-h;cotonPose(p.x+q[0]*lat,yB,p.z+q[1]*lat,r,kk,cr);}
    for(let k=0;k<(ORD?0:KK(116));k++){ // (3) LA COURONNE DU MILIEU : 0,35-1,3 km, tout autour, de la mer jusqu'à ~300 m au-dessus de la route
      const i=strat(k,KK(116)),p=pts[i],a=cr()*6.2832,d=(350+cr()*950)*(GZ>1?1.12:1),r=cotonR(cr,50*GZ,330*GZ,1.6);
      cotonPose(p.x+Math.cos(a)*d,p.y-210+cr()*520,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
    for(let k=0,K4=ORD?0:Math.round(44*NZ);k<K4;k++){ // (4) LA COUCHE HAUTE : des cumulus qui se DÉCOUPENT sur le ciel (le haut d'un écran portrait, c'est du ciel)
      const i=strat(k,K4),p=pts[i],a=cr()*6.2832,d=260+cr()*1700,r=cotonR(cr,60*GZ,300*GZ,1.5);
      cotonPose(p.x+Math.cos(a)*d,p.y+230+cr()*420,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
    if(OR&&!ORD)for(let k=0;k<30;k++){ // (2026-09-30) LES MURS : au RAS de la route (la garde lui laisse ses 18-22 m), de chaque côté, à hauteur de caisse — la route file dans un
      // couloir de ouate : on ne voit plus d'où vient le virage, seulement la route devant soi, et l'éclair qui éclaire le couloir
      const i=strat(k,30),p=pts[i],q=perp(i),sg=cr()<.5?-1:1,r=cotonR(cr,40,120,1.3),kk=cotonKind(cr,COTON_POIDS.pres);let dd=ROAD_HALF+r*.8+20+cr()*40;
      for(let t=0;t<3;t++,dd+=40)if(cotonPose(p.x+q[0]*sg*dd,p.y-r*.45+cr()*30,p.z+q[1]*sg*dd,r,kk,cr))break;}
    if(OR)for(let k=0;k<42;k++){ // (4 bis) L'ORAGE : LE PLAFOND — de grands nuages plats et bas (rouleaux, humilis) 110-240 m au-dessus de la route, sur elle et
      // autour : le ciel se referme (des trouées entre deux), la lumière passe par en dessous — et l'éclair les allume
      const i=strat(k,42),p=pts[i],q=perp(i),lat=(cr()-.5)*900,r=cotonR(cr,110,230,1.2); // (2026-09-30) 26 → 42, et plus BAS (70-170 m) : le ciel se ferme
      cotonPose(p.x+q[0]*lat,p.y+70+cr()*100,p.z+q[1]*lat,r,cotonDe(cr,['stratocumulus','stratocumulus','humilis',1,4]),cr,.8+cr()*.25);}
    for(let k=0,K5=ORD?0:Math.round(80*NZ);k<K5;k++){ // (5) LE LOINTAIN : 1,2-2,6 km — l'horizon a ses nuages
      const i=strat(k,K5),p=pts[i],a=cr()*6.2832,d=1200+cr()*1400,r=cotonR(cr,120*GZ,560*GZ,1.4);
      cotonPose(p.x+Math.cos(a)*d,p.y-260+cr()*700,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.loin),cr);}
    if(ORD)cotonOrdonne(cr,perp);
    if(TORD.on)for(let k=0,K6=Math.max(1,Math.round(56*A9));k<K6;k++){ // (2026-10-15) LA SPHÈRE : sur la route SANS HAUT NI BAS, des nuages dans TOUTES les directions — sous la dalle comme au zénith,
      // tirés uniformément sur la sphère autour de la route (plus de plafond ni de plancher : où que la route regarde, du ciel et de la ouate)
      const i=strat(k,K6),p=pts[i],u=cr()*2-1,a=cr()*6.2832,w=Math.sqrt(1-u*u),d=420+cr()*1500,r=cotonR(cr,70*GZ,320*GZ,1.5);
      cotonPose(p.x+w*Math.cos(a)*d,p.y+u*d,p.z+w*Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
  }
  if(okG){ // (7) LES CATHÉDRALES (2026-09-29, Sacha : « encore plus beau et artistique, qu'on ressente la LIBERTÉ comme dans Dragons 1 ») :
    // de GRANDS CONGESTUS qui montent de l'abîme (base 220-340 m sous la route) et dominent la route de ~150-250 m, à 300-650 m de son
    // bord — une PORTE (les deux côtés : on file entre deux géants) ou une FALAISE (un seul côté : on longe un mur de ouate). Toutes les
    // ~1,4 km. ⚠ Essayé puis retiré : étirer la tour en hauteur (×1,5) et lui poser une COURONNE — les bourgeons devenaient des œufs
    // empilés, une « chenille » ; la hauteur vient de la TAILLE (r 220-340), l'étirement reste celui des autres nuages (×1-1,15).
    const K7=Math.max(ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?2:3,Math.floor(L/(LVL.cur&&LVL.cur.id==='nuages'?2000:1400)*(ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?GROS:1))); // (2026-09-30) aux NUAGES : moins de cathédrales, plus grosses
    for(let k=0;k<K7;k++){const i=strat(k,K7),p=pts[i],q=perp(i),cotes=cr()<.45?[-1,1]:[cr()<.5?-1:1];
      for(const sg of cotes){const r=(220+cr()*120)*(LVL.cur&&LVL.cur.id==='nuages'?1.45:1),kk=cotonDe(cr,['congestus','cisaille','champignon',2]),yB=p.y-(220+cr()*120);let dd=ROAD_HALF+r*1.25+60+cr()*230;
        for(let t=0;t<3;t++,dd+=90)if(cotonPose(p.x+q[0]*sg*dd,yB,p.z+q[1]*sg*dd,r,kk,cr,1+cr()*.15))break;}}
  }
  if(okG){ // (6) MASSIFS et TITANS (ex-« ciel organisé ») : des tours de 300-1 200 m, au large, hors du couloir du couchant
    const sunAz=Math.atan2(SUN_DIR.z,SUN_DIR.x),loinSol=function(){for(let t=0;t<5;t++){const a=cr()*6.2832;let d9=(a-sunAz)%6.2832;if(d9>3.1416)d9-=6.2832;if(d9<-3.1416)d9+=6.2832;if(Math.abs(d9)>.62)return a;}return sunAz+3.1416;};
    const GN=ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?GROS:1,N6=Math.max(1,Math.round(6*GN)),N3=Math.max(1,Math.round(3*GN));
    for(let k=0;k<N6;k++){const i=strat(k,N6),p=pts[i],a=loinSol(),d=900+cr()*1300,r=280+cr()*300;cotonPose(p.x+Math.cos(a)*d,p.y-320+cr()*160,p.z+Math.sin(a)*d,r,cotonDe(cr,[2,0,'congestus','champignon','stratocumulus']),cr);} // (v4) les massifs piochent aussi dans les congestus tirés — (v6) et les champignons, les rouleaux
    for(let k=0;k<N3;k++){const i=strat(k,N3),p=pts[i],a=loinSol(),d=1700+cr()*1500,r=600+cr()*450,k9=cotonDe(cr,[2,'congestus','champignon']);cotonPose(p.x+Math.cos(a)*d,p.y-420+cr()*200,p.z+Math.sin(a)*d,(r*.7),24,cr);} // (v8) les titans : des CUMULONIMBUS à enclume (plus hauts que larges : r ×0,7)
    for(let k=0;k<N3;k++){const i=strat(k,N3),p=pts[i],a=loinSol(),d=520+cr()*380,r=(200+cr()*140)*(LVL.cur&&LVL.cur.id==='nuages'?1.5:1); // (v4) les TOURS HÉROÏQUES : trois congestus qui montent TOUT PRÈS du couloir — le niveau a ses montagnes
      for(let t=0;t<3;t++)if(cotonPose(p.x+Math.cos(a)*(d+t*160),p.y-300+cr()*80,p.z+Math.sin(a)*(d+t*160),r,cotonDe(cr,['congestus','cisaille']),cr))break;}
    {const i=Math.min(NP-1,Math.floor(NP*(.6+cr()*.15))),p=pts[i],a=sunAz+3.1416+(cr()-.5)*.9,d=1500+cr()*700;cotonPose(p.x+Math.cos(a)*d,p.y-380,p.z+Math.sin(a)*d,(760+cr()*300)*(.75),24,cr);} // LE COLOSSE, à l'opposé du couchant
  }
  COTON.root.visible=COTON.n>0;
}
const COTON_T0=performance.now();
function cotonInst(o,A,C,b,tt){const I=COTON.I,r=I[o+3];C[b*3]=I[o+10];C[b*3+1]=I[o+11];C[b*3+2]=I[o+12]; // une instance de nuage : sa teinte, la dérive au vent, son cap
  COTON.P.set(I[o]+Math.sin(tt*.05+I[o+6])*6,I[o+1],I[o+2]+Math.cos(tt*.04+I[o+6])*6);COTON.Q.setFromAxisAngle(COTON.Y,I[o+4]);COTON.Sc.set(r*I[o+8],r*I[o+9],r); // (v4) l'étirement du nuage
  COTON.M.compose(COTON.P,COTON.Q,COTON.Sc);COTON.M.toArray(A,b*16);}
function cotonTick(cam){ // à chaque rendu de la scène : ce qui est dans le champ, en quelle finesse, du plus loin au plus près
  if(!COTON.root||!COTON.root.visible)return;
  const t00=performance.now(),I=COTON.I,Ls=COTON.L,J=COTON.jd,pj=J?cotonPalier():2,fm=J?J.f[pj]:3,n=J?Math.min(COTON.n,J.lim[pj]):COTON.n,tt=(t00-COTON_T0)*.001; /* (2026-10-14, passe graphismes) J : les Pics de Jade — les `lim[palier]` premiers nuages, jusqu'à la finesse `fm` */N8_U.uTps.value=tt;for(let j=0;j<Ls.length;j++)Ls[j].n=0;
  COTON.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);COTON.fr.setFromProjectionMatrix(COTON.pv);
  const pl=COTON.fr.planes,cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;
  const LV=(NUVIT.on&&!J&&COTON.LV)?COTON.LV:null,W9=COTON.W,WC9=COTON.WC;if(LV)for(const Lv of LV)Lv.n=0; // (2026-10-18, LE FONDU) pas aux Pics de Jade
  const fF=((J||(LVL.cur&&LVL.cur.id==='orage'))&&scene.fog)?scene.fog.far*1.02:1e9; // (2026-09-29) L'ORAGE : sa brume est à ~1 km — un nuage ENTIÈREMENT au-delà est de la brume pure : pas envoyé (mesuré : 407k triangles → voir CLAUDE.md) ; l'éclair qui ouvre la brume les fait revenir
  for(let j=0;j<n;j++){const o=j*COTON_ST,r=I[o+3],h=I[o+7],ph=I[o+6],k=I[o+5],S=COTON.S[k];
    const x=I[o]+Math.sin(tt*.05+ph)*6,z=I[o+2]+Math.cos(tt*.04+ph)*6,yc=I[o+1]+S.base*r*I[o+9]+h*.5,R=Math.max(r*1.08*I[o+8],h*.56); // la ouate DÉRIVE au vent
    let vis=true;for(let q=0;q<6;q++){const P9=pl[q];if(P9.normal.x*x+P9.normal.y*yc+P9.normal.z*z+P9.constant<-R){vis=false;break;}}
    if(!vis)continue;
    const dx=x-cx,dy=yc-cy,dz=z-cz,d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d-R>fF)continue;const sg=COTON.FAC*R*(S.fin||1)/Math.max(1,d-R*.5); // les segments qu'il faut pour que la facette ne se voie pas — (v4) à la taille de SES bourgeons
    const fq=Math.min(fm,(sg<=10?0:sg<=16?1:sg<=32?2:3)),Lq=Ls[k*4+fq]; /* (v8) la surface : ~10 px par cellule à l'écran */
    let w=0,wc=0,vq=3;if(LV){const V9=COTON.vit[k*4+3];if(V9&&V9.ok){const x=Math.max(1,d-R)/R,c=2/((NUVIT.fant?NUVIT.fsz:NUVIT.nc)*x); /* (2026-10-18, Sacha) LE FONDU : les parts du corps (w) et des cubes (wc) ; avant, des bascules (lot 2 : 40 % des fantômes, lot 3 : tous, tout près : la v8) */
      if(NUVIT.fondu){const P9=nuvPoids(x,c);w=P9[0];wc=P9[1];vq=(NUVIT.fant&&wc*1.06<=NUVIT.loin)?2:3;}else if(fq>=2&&c<=NUVIT.ang){w=wc=1;vq=fq;}}} // le lot lointain (40 % des fantômes) suffit tant que les cubes n'en demandent pas plus
    W9[j]=w;WC9[j]=wc;if(w<1){Lq.i[Lq.n]=j;Lq.d[Lq.n]=d;Lq.n++;}if(w>0){const Lv=LV[k*2+vq-2];Lv.i[Lv.n]=j;Lv.d[Lv.n]=d;Lv.n++;}}
  let nN=0,nF=0,tri=0;
  for(let q=0;q<Ls.length;q++){const Lq=Ls[q],im=COTON.im[q],A=im.instanceMatrix.array,ii=Lq.i,dd=Lq.d,m=Lq.n;
    for(let a=1;a<m;a++){const vi=ii[a],vd=dd[a];let b=a-1;while(b>=0&&dd[b]<vd){ii[b+1]=ii[b];dd[b+1]=dd[b];b--;}ii[b+1]=vi;dd[b+1]=vd;} // du plus LOIN au plus près
    const Cq=im.instanceColor.array;let mA=0;
    for(let a=0;a<m;a++){const j9=ii[a];cotonInst(j9*COTON_ST,A,Cq,mA,tt);A[mA*16+3]=W9[j9];mA++;} // (2026-10-18, LE FONDU) la part de cubes dans la ligne du bas de la matrice : la v8 leur cède autant de points de sa trame
    im.count=mA;im.visible=mA>0;if(mA){im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=mA*16;im.instanceMatrix.needsUpdate=true;
      im.instanceColor.updateRange.offset=0;im.instanceColor.updateRange.count=mA*3;im.instanceColor.needsUpdate=true;} // (vide : pas d'appel de dessin)
    if((q&3)>=2)nN+=m;else nF+=m;tri+=mA*im.userData.tri;}
  if(COTON.vit)for(let q=0;q<COTON.vit.length;q++){const V9=COTON.vit[q];if(!V9)continue;const Lv=LV?LV[(q>>2)*2+(q&3)-2]:null,ii=Lv?Lv.i:null,dd=Lv?Lv.d:null,m=Lv?Lv.n:0; // (vitrail / fantôme) un jeu par gabarit et par lot fin : ses maillages partagent LEURS instances
    for(let a=1;a<m;a++){const vi=ii[a],vd=dd[a];let b=a-1;while(b>=0&&dd[b]<vd){ii[b+1]=ii[b];dd[b+1]=dd[b];b--;}ii[b+1]=vi;dd[b+1]=vd;} // du plus LOIN au plus près (la peau, les fantômes sont transparents)
    const AB=V9.A.array,CB=V9.C.array;for(let a=0;a<m;a++){const j9=ii[a];cotonInst(j9*COTON_ST,AB,CB,a,tt);AB[a*16+3]=-W9[j9];AB[a*16+7]=-WC9[j9];} // les parts en NÉGATIF : le corps rentré (matière v8) prend les points que la v8 cède ; les cubes, leur rang
    const fa9=!!V9.fan;V9.c.count=V9.o.count=V9.p.count=V9.b.count=V9.g.count=m;V9.c.visible=V9.o.visible=V9.p.visible=!fa9&&m>0;V9.b.visible=fa9&&m>0;V9.g.visible=(fa9||!!V9.gOk)&&m>0; // (fantôme) le corps rentré + les cubes fantômes
    if(m){V9.A.updateRange.offset=0;V9.A.updateRange.count=m*16;V9.A.needsUpdate=true;V9.C.updateRange.offset=0;V9.C.updateRange.count=m*3;V9.C.needsUpdate=true;}
    tri+=m*V9.tri;}
  if(COTON.skin)for(let q=0;q<COTON.skin.length;q++){const S9=COTON.skin[q];if(S9){S9.m.count=COTON.im[q].count;S9.m.visible=COTON.root.visible&&S9.m.count>0;}} // la peau suit son lot (mêmes instances) — (2026-10-22) VIDE = INVISIBLE : MESURÉ aux Pics de Jade, 92 des 316 appels de dessin d'une image étaient des peaux à ZÉRO nuage (three prépare programme, uniformes et tampons pour ne rien dessiner)
  COTON.nN=nN;COTON.nF=nF;COTON.tri=tri;COTON.ms=COTON.ms*.95+(performance.now()-t00)*.05;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);cotonTick(cam);};} // CHAÎNÉ (jamais réassigné)
window.dbgCoton=function(q){ // q = 'max' : le plus gros nuage (centre du dessous, rayon) — pour le photographier
  if(q==='max'){const st=COTON_ST;let b=-1;for(let j=0;j<COTON.n;j++)if(b<0||COTON.I[j*st+3]>COTON.I[b*st+3])b=j;if(b<0)return null;const o=b*st,S=COTON.S[COTON.I[o+5]];
    return {x:COTON.I[o],y:COTON.I[o+1]+S.base*COTON.I[o+3]*COTON.I[o+9],z:COTON.I[o+2],r:COTON.I[o+3],h:COTON.I[o+7]};}
  return {nuages:COTON.n,pres:COTON.nN,loin:COTON.nF,triangles:COTON.tri,ms:+COTON.ms.toFixed(3),visible:!!(COTON.root&&COTON.root.visible),
  maillagesApart:CLOUDS.length,gabarits:COTON.im.map(function(im){return im.userData.tri;}),
  initMs:COTON.msInit==null?null:Math.round(COTON.msInit),toutPretMs:COTON.msPret?Math.round(COTON.msPret):null,prets:COTON.pret?COTON.pret.reduce(function(a,b){return a+b;},0):0,finsApart:CLOUDS.filter(function(c){return c.mesh&&c.mesh.userData.fin;}).length,ouvrier:COTON_OUV.ko?'refuse':COTON_OUV.w?'oui':'non'};};
// Boules d'un nuage (metaballs) — coords LOCALES [-1,1] dans la boîte (x,y,z,rayon).
// Chaque famille a sa silhouette : cumulus bourgeonnant, tour empilée, mer plate, voile épars.
function mkBlobs(o,rng){
  const B=[];
  // ⚠⚠ CONNEXITÉ GARANTIE — c'était LE défaut des formes d'avant (« les nuages sont vides ») :
  // un bourgeon pouvait être posé à 0,99 du corps pour une somme de rayons de 0,72, donc
  // TOTALEMENT DÉTACHÉ. Le nuage se lisait comme des saucisses qui flottent côte à côte.
  // Ici, toute boule fille naît SOUDÉE à sa mère : distance = (r_mère+r_fille)×0.50, donc
  // recouvrement franc. Un nuage est une MASSE, jamais un tas de billes.
  const push=(x,y,z,r,fy)=>{const b=[x,y,z,r,fy===undefined?1:fy];B.push(b);return b;};
  const grow=(p,ax,ay,az,rm)=>{ // bourgeon soudé à sa mère
    const r=Math.max(0.10,p[3]*rm),L=Math.hypot(ax,ay,az)||1,d=(p[3]+r)*0.50;
    return push(p[0]+ax/L*d,p[1]+ay/L*d,p[2]+az/L*d,r);
  };
  const R=()=>rng()-0.5;
  if(o.giant){
    // ---- CUMULONIMBUS : socle lourd → colonne qui bourgeonne → ENCLUME étalée au sommet ----
    // La silhouette la plus spectaculaire du ciel réel, et la plus lisible de loin : on la
    // reconnaît à sa tête plate qui déborde. Elle PENCHE (cisaillement du vent), jamais droite.
    const lean=R()*0.34;
    push(0,-0.70,0,0.44,0.80);                                    // socle large, aplati par en dessous
    push(0.28,-0.68,R()*0.22,0.34,0.80); push(-0.27,-0.66,R()*0.22,0.34,0.80);
    let cur=push(lean*0.3,-0.44,0,0.42);
    const nE=4+Math.floor(rng()*2);
    for(let i=0;i<nE;i++){
      cur=grow(cur,lean+R()*0.30,1,R()*0.30,0.93);                // l'étage suivant, soudé au précédent
      if(rng()<0.5)grow(cur,R()*2,0.25,R()*2,0.50);               // bourgeon latéral : le chou-fleur
    }
    const ya=Math.min(0.78,cur[1]+cur[3]*0.45);                   // L'ENCLUME : la tour bute et s'étale
    const an=push(lean*1.1,ya,0,0.50,0.30);
    for(let k=0;k<4;k++){const a=k*1.5708+rng();
      push(an[0]+Math.cos(a)*0.36,ya-0.03,an[2]+Math.sin(a)*0.36,0.33,0.28);}
  }else if(o.sea){
    // ---- STRATUS : une NAPPE CONTINUE, pas des galettes éparpillées ----
    let cur=push(0,-0.35,0,0.46,0.42);
    for(let i=0;i<7;i++){const a=rng()*6.2832;
      cur=grow(cur,Math.cos(a),R()*0.10,Math.sin(a),0.95);cur[4]=0.42;} // chaînée : aucun trou possible
  }else if(o.veil){
    // ---- CIRRUS : un voile ÉTIRÉ dans le vent, en une seule traînée continue ----
    const a=rng()*6.2832,ux=Math.cos(a),uz=Math.sin(a);
    let cur=push(-ux*0.55,0,-uz*0.55,0.40,0.22);
    for(let i=0;i<5;i++){cur=grow(cur,ux+R()*0.5,R()*0.15,uz+R()*0.5,0.98);cur[4]=0.22;}
  }else{
    // ---- CUMULUS : BASE PLATE (le niveau de condensation) + chou-fleur qui bourgeonne ----
    // Le vrai cumulus a un dessous RECTILIGNE — c'est ça qui le rend crédible d'un coup d'œil.
    const nb=3+Math.floor(rng()*2),base=[];
    for(let i=0;i<nb;i++){const a=i/nb*6.2832+rng()*0.6,sp=(i===0?0:0.30+rng()*0.12);
      base.push(push(Math.cos(a)*sp,-0.42,Math.sin(a)*sp*0.85,0.40+rng()*0.10,0.78));}
    let lvl=base.slice();
    for(let g=0;g<2&&B.length<14;g++){ // deux générations : ça monte et ça s'arrondit
      const nxt=[];
      for(const p of lvl){ if(B.length>=14)break;
        if(rng()<(g?0.55:0.85))nxt.push(grow(p,R()*1.1,1,R()*1.1,0.80-g*0.08));}
      if(!nxt.length)break; lvl=nxt;
    }
  }
  // tout reste DANS la boîte : le test « dedans » (fog/white-out) et la dérive se basent sur r/ry
  return B.map(b=>{const m=Math.hypot(b[0],b[1],b[2]),mx=0.99;
    if(m+b[3]>mx){const s=(mx-b[3])/Math.max(m,1e-3);if(s<1){b[0]*=s;b[1]*=s;b[2]*=s;}}return b;}).slice(0,20);
}
/* (2026-09-26, user : « moins de nuages en contact avec la route ») LA GARDE DU RUBAN : ce nuage (ellipsoïde r × ry) mord-il sur la
   route, n'importe où ? On balaie la ligne centrale tous les ~18 m, avec la demi-largeur de la route et une marge. Seuls les BANCS
   (onRoad : la percée à l'aveugle, voulue) y échappent — tout le reste qui toucherait le ruban n'est simplement pas posé. */
function nuageTouche(c,r,ry){
  if(!(NP>1)||!pts.length)return false;
  const st=Math.max(1,Math.round(18/Math.max(.5,L/(NP-1)))),rh=r+ROAD_HALF+18,rv=ry+22,ih=1/(rh*rh),iv=1/(rv*rv);
  for(let i=0;i<NP;i+=st){const p=pts[i],dx=p.x-c.x,dz=p.z-c.z,dy=p.y-c.y;if((dx*dx+dz*dz)*ih+dy*dy*iv<1)return true;}
  return false;
}
function mkCloud(center,r,o,rr){ // un nuage = ses boules fusionnées en UN mesh opaque, point.
  if(!lvlNuageOk(o))return; // LES NIVEAUX : chaque monde garde ses familles de nuages (voir NIVEAUX)
  let ry=r*(o.giant?.55+rr()*.18:o.veil?.16:o.sea?.15:.36+rr()*.16);
  if(o.baseY!==undefined)center.y=o.baseY+ry*0.64; // plafond de condensation commun
  if(!o.onRoad&&nuageTouche(center,r,ry))return; // (2026-09-26) jamais un nuage de décor posé SUR le ruban
  const g=new THREE.Group();g.position.copy(center);
  let geo9,fin9=null;const v8=!o.sea&&!o.veil&&!o.deco;
  if(v8){ /* (2026-09-30) LES NUAGES v8 : le banc de route, le coussin de vol, la tour — un cumulus sculpté (cumulus8), sa surface (nuage8Calc) dans
            l'ouvrier ; l'ÉBAUCHE en boules tient la place en attendant. Le maillage est à l'échelle du nuage (mesh.scale = r) : la ouate bouillonne. */
    cotonInit();const gn=o.onRoad?(r>34?'mediocris':'humilis'):o.giant?'congestus':['mediocris','humilis','mediocris','humilis','congestus'][Math.floor(rr()*5)];
    const S=cumulus8(gn,rr);S.seed=Math.floor(rr()*997);const dyU=-(S.base+S.top)*.5;
    if(!o.onRoad&&nuageTouche(center,r,(S.top-S.base)*r*.5)){rr();return;} /* (2026-10-18, DEBUGGING : la garde du ruban ci-dessus mesurait l'ellipsoïde PROVISOIRE — une tour v8 est ~2 fois plus haute (ry ≈ r au lieu de 0,55-0,73 r) : MESURÉ, 1 nuage de décor sur ~450 laissait passer la route DANS lui, que la caisse « défonçait » (la tour de 370 m réduite à rien puis reformée). On reteste avec sa VRAIE hauteur ; le rr() rend le tirage `ph` qu'il aurait pris : les nuages suivants ne bougent pas) */
    geo9=NUVIT.vox?nuVide():cotonGeo({B:S.B.slice(0,12),base:S.base,top:S.top},CLOUD_SPH_LO);geo9.translate(0,dyU,0);geo9.computeBoundingSphere();fin9={S:S,dyU:dyU,v8:1};
    ry=(S.top-S.base)*r*.5;}
  else if(!o.onRoad&&!o.sea&&!o.veil&&!o.deco){ // (ciel de coton) les COUSSINS de vol et les TOURS qu'on traverse : la forme classique,
    cotonInit();const S=cotonBlobs(o.giant?2:[0,5,3][Math.floor(rr()*3)],rr),h=(S.top-S.base)*r; // bourgeons ronds, ventre lavande (voir cotonBlobs)
    fin9={S:S,r:r,dy:-(S.base+S.top)*.5*r};geo9=cotonGeo(S,CLOUD_SPH_LO);geo9.scale(r,r,r);geo9.translate(0,fin9.dy,0);geo9.computeBoundingSphere(); // (2026-09-30) une ÉBAUCHE légère tout de suite, la forme fine arrive de l'ouvrier (≈10 ms par nuage : 0,2 s de gel à chaque portail)
    ry=h*.5;} // l'ellipsoïde « dedans » (white-out, airtime) suit la vraie hauteur du nuage
  else geo9=mergeSpheres(mkBlobs(o,rr),r,ry,r); // les 5-10 boules de CE nuage (RNG isolé : ne rebrasse pas la génération)
  const mesh=new THREE.Mesh(geo9,v8?nuage8Solo():CLOUD_MAT);if(v8){mesh.scale.set(r,r,r);mesh.updateMatrix();mesh.userData.m8=nuage8Solo();}
  // Opaque : il s'occlut par le z-buffer comme n'importe quel décor. Aucun tri, aucun mélange,
  // donc AUCUN ordre de dessin ne peut le faire clignoter. Le frustum culling de three.js
  // redevient sûr (la géométrie est réelle et sa sphère englobante est exacte).
  mesh.castShadow=false;mesh.receiveShadow=false; // la ouate ne projette rien : c'est du décor
  mesh.userData.trav=!!(o.onRoad||(!o.giant&&!o.sea&&!o.veil&&!o.deco));
  mesh.matrixAutoUpdate=false; // (2026-09-27, passe perf iPhone) le maillage ne bouge JAMAIS dans son groupe (repère identité) : c'est le groupe qui dérive — plus 90 matrices recomposées pour rien à chaque image
  g.add(mesh);scene.add(g);
  if(fin9&&fin9.v8)nuage8Async(fin9.S,r>150?N8_FIN[3]:N8_FIN[2],function(q){if(!g.parent)return;const g2=cotonBuf(q);g2.translate(0,fin9.dyU,0);g2.computeBoundingSphere();const o9=mesh.geometry;mesh.geometry=g2;o9.dispose();mesh.userData.fin=true;
    if(q.skin&&NUSKIN.on){const sk9=new THREE.Mesh(nuSkinGeo(q.skin,fin9.dyU),nuSkinMat());sk9.renderOrder=1;sk9.matrixAutoUpdate=false;sk9.frustumCulled=false;sk9.castShadow=sk9.receiveShadow=false;mesh.add(sk9);mesh.userData.peau=sk9.geometry; /* (2026-10-22, DEBUGGING : sa géométrie est NEUVE pour chaque nuage — disposeClouds la libère, voir u9.peau) */} // la peau du nuage seul (coussin, tour)
    if(q.vit){const G=nuVitGeo(q,fin9.dyU),MS=nuVitMats(true),c9=new THREE.Mesh(G.cub,MS.cub),p9=new THREE.Mesh(G.pea,MS.pea); /* (2026-10-18) LE VITRAIL des bancs, coussins et tours : le maillage du nuage devient son CŒUR, les écailles et la peau sont ses enfants */
      for(const x of [c9,p9]){x.castShadow=x.receiveShadow=false;x.updateMatrix();x.matrixAutoUpdate=false;mesh.add(x);}p9.renderOrder=1;
      const u9=mesh.userData;u9.vit=[c9,p9];u9.g8=g2;u9.hcw=q.vit.hc*r;u9.gVit=G.coe;u9.mVit=MS.coe;if(NUVIT.on){mesh.geometry=G.coe;if(mesh.material===nuage8Solo())mesh.material=MS.coe;u9.m8=MS.coe;}else c9.visible=p9.visible=false;
      if(q.fant&&NUVIT.mix){const G2=nuFantGeo(q,fin9.dyU,g2),f9=new THREE.Mesh(G2.fan,nufMat(MS.fan,G2));f9.castShadow=f9.receiveShadow=false;f9.updateMatrix();f9.matrixAutoUpdate=false;f9.renderOrder=2;mesh.add(f9);u9.vit.push(f9); /* (mélange) les cubes éparpillés du nuage seul */
        f9.onBeforeRender=function(r9,s9,c9b,g9,m9){m9.uniforms.uNvW.value=1;m9.uniformsNeedUpdate=true;};if(!NUVIT.on)f9.visible=false;}}
    else if(q.fant){const G=nuFantGeo(q,fin9.dyU,g2),MS=nuVitMats(true),f9=new THREE.Mesh(G.fan,nufMat(MS.fan,G)); /* (fantôme) les bancs, coussins et tours : le maillage devient le CORPS rentré, les cubes fantômes sont son enfant */
      f9.castShadow=f9.receiveShadow=false;f9.updateMatrix();f9.matrixAutoUpdate=false;mesh.add(f9);
      const u9=mesh.userData;u9.vit=[f9];u9.g8=g2;u9.hcw=r/NUVIT.fsz;u9.fan=true;u9.nvw=1;f9.onBeforeRender=function(r9,s9,c9,g9,m9){m9.uniforms.uNvW.value=u9.nvw;m9.uniformsNeedUpdate=true;}; /* (2026-10-18, LE FONDU) la part de cubes de CE nuage */u9.gVit=G.corps;u9.mVit=nuage8Solo();if(NUVIT.on)mesh.geometry=G.corps;else f9.visible=false;}},Math.max(NUVIT.nc,Math.min(40,Math.round(r/8))),fin9.dyU);
  else if(fin9)cotonCalcAsync(fin9.S,CLOUD_SPH,function(q){if(!g.parent)return; /* jeté entre-temps (portail) */ const g2=cotonBuf(q);g2.scale(fin9.r,fin9.r,fin9.r);g2.translate(0,fin9.dy,0);g2.computeBoundingSphere();const o9=mesh.geometry;mesh.geometry=g2;o9.dispose();mesh.userData.fin=true;});
  CLOUDS.push({g:g,c:center.clone(),r:r,ry:ry,onRoad:!!o.onRoad,puffs:[],mesh:mesh,ph:rr()*6.28,refT:0,fid:-1,wasIn:false});
}
// (le repli SPRITES a été supprimé avec le raymarch : il n'y a plus qu'UN seul chemin de nuage)
let BANC_LOG=[];
function bancCourbe(s){ // la courbure de la piste (rad/m) autour de s, mesurée sur ±8 m
  const ds=L/(NP-1),a=Math.max(1,Math.round(8/ds)),i=Math.round(Math.max(0,Math.min(L,s))/ds),i0=Math.max(0,i-a),i1=Math.min(NP-1,i+a);
  return Math.acos(Math.min(1,T[i0].dot(T[i1])))/Math.max(1,(i1-i0)*ds);}
function bancVirage(s0,deja){ // l'entrée du prochain VIRAGE (rayon < 200 m) précédé d'une portion DROITE (courbure moyenne < 1/330 sur 200 m), entre s0+150 et s0+1200 — ou −1
  /* ⚠ (banc bancs.js) la piste des NUAGES n'a presque pas de droite pure (courbure médiane 3,4 mrad/m, rayon ~290 m) : « droite » = en MOYENNE */
  for(let c=s0+150;c<Math.min(L-320,s0+1200);c+=8){
    if(bancCourbe(c)<1/200||bancCourbe(c-12)>=1/200)continue; if(Math.abs(c-deja)<120)continue; // l'ENTRÉE du virage (juste avant, ça ne tournait pas encore)
    let m=0,n=0;for(let q=c-210;q<c-10;q+=10){m+=bancCourbe(q);n++;}
    if(m/n<1/330)return c;}
  return -1;}
function buildClouds(rr){
  disposeClouds();
  nuageFondu=started?0:1; // (2026-09-26) en course (portail), les nuages de la nouvelle zone montent en fondu avec le ciel — au menu, tout de suite
  // RNG local : retoucher les nuages ne rebrasse plus la génération en aval (piège rnd séquentiel)
  const cr=mulberry32((rr()*1e9)|0);
  // RÉPARTITION HARMONIEUSE (2026-07-30) : les positions étaient tirées AU HASARD sur toute la piste
  // (`cr()*NP`) — donc en grappes, avec de longs vides entre. On passe à un ÉCHANTILLONNAGE STRATIFIÉ :
  // une tranche de piste par nuage + un jitter contenu → espacement régulier, sans régularité mécanique.
  const strat=(k,K)=>Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/K)*NP));
  const stratAz=(k,K)=>((k+.15+cr()*.7)/K)*6.2832; // idem pour les azimuts : le ciel est peuplé TOUT AUTOUR
  // bancs SUR la route — espacés : on en traverse PARFOIS, jamais en continu. Un MUR intégral (la caisse
  // disparaît dans le blanc) reste l'exception spectaculaire, pas la règle.
  const OR9=!!(LVL.cur&&LVL.cur.id==='orage'); // (2026-09-29) L'ORAGE : « plein de gros nuages sur la route » — le niveau dur se roule À L'AVEUGLE
  /* (2026-10-21, Léo : « évite de faire des gueules sur la route si tu n'arrives pas à les faire dégager de manière satisfaisante ») PLUS DE BANCS SUR LA ROUTE aux NUAGES (toutes les météos) :
     la voiture ne s'y noie plus (les nuages de décor restent hors du couloir libre). `?bancs=1` rend les bancs (la règle de Sacha « les nuages cachent les virages »). */
  const SANS_BANCS=!!(ARC_ON&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!/[?&]bancs=1\b/.test(location.search));
  let cBanc=-1e9;BANC_LOG=[]; // (2026-09-30) le dernier virage caché : deux bancs ne cachent jamais le même
  for(let sp=(OR9?420:1600)+cr()*(OR9?300:900);sp<L-300&&!SANS_BANCS;sp+=OR9?300+cr()*300:1900+cr()*1400){ /* (2026-09-30, Sacha : « beaucoup plus de nuages, au point que ça gêne la visibilité ») : à l'ORAGE un banc tous les 300-600 m (560-1180 avant) */ // (2026-09-26, user : « moins de nuages en contact avec la route ») : ~2× plus rares — à l'ORAGE ~3× plus serrés
    if(cr()<(OR9?.06:.4))continue; // 2 bancs sur 5 sautés (orage : ~1 sur 16)
    frameAt(sp,F);
    const mega=cr()<(OR9?.45:.1);
    const dl9=OR9&&!mega&&cr()<.5?(cr()<.5?-1:1)*ROAD_HALF*(.35+cr()*.3):0; // (2026-09-30) à l'orage, un banc sur quatre couvre UN côté de la route : on le frôle, on ne sait pas ce qu'il cache
    /* (2026-09-30, Sacha : « oui » — relevé par la revue de GAMEPLAY : ~la moitié des bancs tombaient EN virage) hors de l'ORAGE, le banc CACHE LE
       VIRAGE SUIVANT : au bout d'une vraie droite, son bord ~160 m avant l'entrée de la courbe — on le voit venir, on en ressort avec le temps
       de lire le virage (la règle du niveau 8 de la campagne). Aucun tirage de plus ni de moins : sans virage à cacher, il garde sa place. */
    let s9=sp;if(!OR9){const r9=mega?55:25,c9=bancVirage(sp,cBanc);if(c9>=0){cBanc=c9;s9=Math.max(sp,c9-160-r9);frameAt(s9,F);}
      else if(bancCourbe(sp)>=1/300){for(let q=sp+20;q<Math.min(L-320,sp+600);q+=20)if(bancCourbe(q)<1/330){s9=q;frameAt(s9,F);break;}}} // pas de virage à cacher : au moins PAS EN virage
    BANC_LOG.push([Math.round(s9),Math.round(bancCourbe(s9)*1e4)/10,Math.round(bancCourbe(sp)*1e4)/10]); // (banc) où il est tombé, sa courbure (mrad/m) — et celle de sa place d'avant
    mkCloud(cldV1.copy(F.p).addScaledVector(F.n,mega?6+cr()*4:2.5+cr()*2).addScaledVector(F.b,dl9),
      mega?(OR9?58+cr()*36:40+cr()*30):(OR9?30+cr()*18:18+cr()*14),{onRoad:true,dense:true},cr);
  }
  // CHAMPS de nuages de VOL : les coussins vont par 2-3, échelonnés le long de la piste —
  // une vraie FENÊTRE de recharge d'airtime qu'on lit de loin, pas des miettes perdues
  for(let k=0;k<5;k++){ // 5 champs au lieu de 6, mais des coussins qui se VOIENT
    const i0=strat(k,5),above=cr()<.62,n9=2+Math.floor(cr()*2);
    for(let m9=0;m9<n9;m9++){
      const i=Math.min(NP-1,i0+m9*(40+Math.floor(cr()*50)));
      // rayon 16-36 → 34-62 : à 16 d'envergure c'était du CONFETTI à côté de tours de 400.
      // Un coussin d'airtime doit se lire de loin pour qu'on aille le chercher.
      const r9=34+cr()*28; // (2026-09-26) décollé de la dalle d'au moins 30 m au-dessus de son ventre (il ne touche plus la route)
      mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*70)
        .addScaledVector(Nn[i],above?r9*.55+30+cr()*44:-(r9*.55+THICK+32+cr()*60)),r9,{},cr);
    }
  }
  // TOURS GÉANTES façon simulateur de vol : des montagnes de ouate — une sur quatre est
  // PLANTÉE sur la piste (rayon PLAFONNÉ : le white-out dure 2 s, pas 10)
  for(let k=0;k<5;k++){ // 8→5 : moins de tours (le ciel était trop chargé)
    const i=strat(k,5);
    cr();const cross=false; // (2026-09-26) plus de tour plantée sur la piste
    const r9=cross?Math.min(120+cr()*140,190):200+cr()*220; // les tours libres DOUBLENT de taille
    const off=cross?(cr()*2-1)*40:(r9+ROAD_HALF+60+cr()*420)*(k%2?1:-1); // ALTERNÉES gauche/droite — écartées de TOUT leur rayon (×0,68 : elles mordaient la route)
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],off)
      .addScaledVector(Nn[i],cross?-r9*.25+cr()*30:-140+cr()*330),r9,{giant:true,onRoad:cross,noFog:!cross},cr);
  }
  // MER DE NUAGES sous la piste : le tapis à perte de vue du vol au-dessus des nuages
  for(let k=0;k<6;k++){ // 10→6
    const i=strat(k,6);
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*1100)
      .addScaledVector(Nn[i],-(170+cr()*220)),170+cr()*150,{sea:true,noFog:true},cr);
  }
  // (ciel de coton, 2026-09-28) la ouate à mi-distance, les RUES de nuages, les électrons libres, le banc haut, les MASSIFS, les TITANS,
  // les coussins de décor du niveau NUAGES et l'ARCHIPEL sont devenus le CIEL DE COTON (buildCoton, plus bas) : trois fois plus de
  // nuages, en forme classique, pour une douzaine d'appels de dessin. Ne restent ici que les nuages qui ont une FORME à eux (mer, voiles).
  // voiles d'altitude : nappes roses étirées très haut — le plafond féerique
  for(let k=0;k<4;k++){ // 7→4
    const i=strat(k,4);
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*1400)
      .addScaledVector(Nn[i],230+cr()*220),150+cr()*120,{veil:true,noFog:true},cr);
  }
  const roadY=37; // altitude moyenne du ruban (repère stable pour poser le plancher de nuages)
  // L'OCÉAN : l'undercast — un tapis PLAT à perte de vue, loin sous la piste (bande d'altitude serrée : une MER avec un niveau)
  for(let k=0;k<7;k++){ // 12→7 : l'undercast reste un tapis, en moins dense
    const i=strat(k,7),a=stratAz(k,7),d=800+cr()*1600; // l'undercast couvre tout l'horizon, sans trou ni paquet
    cldV1.set(pts[i].x+Math.cos(a)*d,roadY-245+cr()*75,pts[i].z+Math.sin(a)*d);
    mkCloud(cldV1,200+cr()*180,{sea:true,noFog:true},cr);
  }
  /* LE NIVEAU NUAGES (2026-09-24) : la mer se referme sous la route — un second plancher, plus proche, qu'on survole au ras. Espace
     MONDE (jamais B[i]/Nn[i]), tiré sur `cr` : ça ne décale que les nuages, jamais la piste. */
  if(LVL.cur&&LVL.cur.id==='nuages'){
    for(let k=0;k<7;k++){
      const i=strat(k,7),a=stratAz(k,7),d=cr()*900;
      cldV1.set(pts[i].x+Math.cos(a)*d,pts[i].y-(130+cr()*110),pts[i].z+Math.sin(a)*d);
      mkCloud(cldV1,170+cr()*140,{sea:true,noFog:true},cr);
    }
  }
  buildCoton(cr); // LE CIEL DE COTON : tout le décor de nuages, en instances (voir cotonBlobs / cotonTick)
}
/* (2026-10-14, sensations ; Sacha : « oui pouf, mais travaille-le très bien ») LE POUF DE LA OUATE, dans la MAIN seulement — le nuage ne
   touche toujours pas à la caisse (Sacha, 30/09 : « juste bloquer la vue, rien d'autre ») : ni ressort, ni secousse, ni particule en plus.
   · ENTRER : la ouate cède puis se referme — un tic très doux, un silence, un tic un rien plus plein (« p…ouf »). Il se DOSE à la vitesse : traversé
     lentement, un seul tic à peine posé ; pris vite, le pouf entier (≥ 260 km/h). Jamais plus fort que LÉGER.
   · DÉFONCER un banc posé sur la route : un coup rond et son écho (le seul qui monte à MOYEN) — c'est un geste, il se paie.
   · RESSORTIR à l'air libre après un vrai passage (≥ 0,4 s dedans) : un tic minuscule, l'air qui se rouvre. Un banc juste effleuré n'en a pas.
   · JAMAIS DE BOURDON : un champ de bancs enfilés à pleine vitesse (l'ORAGE) ne donne qu'un pouf toutes les 0,5 s ; les autres sont muets. */
const SENS_NU={t:-1e9,te:-1e9};
function sensNuage(k,casse){
  if(!SENS||!started||gameOver||paused||!running)return;
  const n9=performance.now();
  if(casse){SENS_NU.t=n9;sensHap([15,24,10],2);return;}
  if(n9-SENS_NU.t<500)return;
  SENS_NU.t=n9;
  const v9=(mode==='fall'?fallVel.length():Math.abs(vA))*3.6*SPD,d9=Math.min(1,v9/260); // dosé par la VITESSE seule : à l'image d'entrée la profondeur k ne vaut encore presque rien
  sensHap(d9<.35?6:[5,24+Math.round(10*(1-d9)),7+Math.round(4*d9)],1);
}
function sensNuageSort(c){
  if(!SENS||!started||gameOver||paused||!running)return;
  const n9=performance.now();
  if(n9-(c.sensT||0)<400||n9-SENS_NU.t<300||n9-SENS_NU.te<500)return;
  SENS_NU.te=n9;sensHap(5,1);
}
function updateClouds(dt,t){
  cloudIn=0;let prox=0; // prox : la CAMÉRA frôle un banc (0 = loin · 1 = à la paroi) — l'œil s'y prépare avant d'y entrer
  // Plus rien à pousser dans un shader : les nuages sont des mesh opaques ordinaires. On ne fait
  // plus que (1) les faire dériver doucement et (2) détecter qu'on est DEDANS (fog/son/airtime).
  // Le frustum culling de three.js s'occupe du reste : la géométrie est réelle, sa sphère
  // englobante est exacte, donc aucun pop possible.
  const cp=carGroup.position;
  if(nuageFondu<1){nuageFondu=Math.min(1,nuageFondu+dt/2.4);const e9=nuageFondu*nuageFondu*(3-2*nuageFondu);CLOUD_MAT.opacity=.82*e9;CLOUD_MAT_IN.opacity=.93*e9;CLOUD_MAT_IN8.opacity=.93*e9;if(COTON.mat)COTON.mat.opacity=.82*e9;N8_U.uFondu.value=e9;} // (2026-09-26) la ouate d'une nouvelle zone monte en fondu (2,4 s, le temps que le ciel bascule)
  for(const c of CLOUDS){
    cldV1.subVectors(cp,c.g.position);
    const dh2=cldV1.x*cldV1.x+cldV1.z*cldV1.z,dv=cldV1.y;
    const d2=dh2/(c.r*c.r)+(dv*dv)/(c.ry*c.ry);
    if(c.brokenT>0){ // DÉFONCÉ : éclate vite (×.08), reste en miettes, puis se reforme sur la fin
      c.brokenT-=dt;const bt=c.brokenT;
      const sc=bt>4.0?1-(4.5-bt)/0.5*0.92:bt>1.5?0.08:0.08+(1.5-bt)/1.5*0.92;
      if(!NUVIT.vox)c.g.scale.setScalar(bt<=0?1:Math.max(0.06,sc)); // (cubes) le banc ne rétrécit plus : il est TROUÉ (nuCasseBurst) et se referme
    }
    {const ex=camera.position.x-c.g.position.x,ey=camera.position.y-c.g.position.y,ez=camera.position.z-c.g.position.z,
      dc=(ex*ex+ez*ez)/(c.r*c.r)+(ey*ey)/(c.ry*c.ry);if(dc<2.6){const q=Math.min(1,(2.6-dc)/1.6);if(q>prox)prox=q;}
      c.mesh.material=dc<1.1?(c.mesh.userData.m8?CLOUD_MAT_IN8:CLOUD_MAT_IN):(c.mesh.userData.m8||c.mesh.userData.mm||CLOUD_MAT);if(c.mesh.userData.vit&&NUVIT.on){const u9=c.mesh.userData,dd9=Math.sqrt(ex*ex+ey*ey+ez*ez)-c.r,cq9=2*(u9.hcw||0)/Math.max(1,dd9),v9=!(dc<1.1)&&cq9<=NUVIT.ang;
      if(u9.fan&&NUVIT.fondu){u9.nvw=dc<1.1?0:1-nuvLisse(NUVIT.bPresF[0],NUVIT.bPresF[1],cq9);for(const o9 of u9.vit)o9.visible=u9.nvw>0;if(!(dc<1.1)&&c.mesh.geometry!==u9.gVit){c.mesh.geometry=u9.gVit;c.mesh.material=u9.mVit;}}else{ /* (2026-10-18, LE FONDU) le fantôme seul : ses cubes s'effacent en approchant, le corps reste (plus de bascule vers la v8) */ // (vitrail) dedans : le white-out seul ; TOUT PRÈS (écaille trop grosse à l écran) : le nuage lisse, comme les instances
      for(const o9 of u9.vit)o9.visible=v9;if(!(dc<1.1)){const m9=v9?u9.mVit:nuage8Solo(),g9=v9?u9.gVit:u9.g8;if(c.mesh.material!==m9)c.mesh.material=m9;if(c.mesh.geometry!==g9)c.mesh.geometry=g9;}}}} /* (vitrail) dedans : le white-out seul, sans écailles ni peau */ /* (2026-10-14, œil) mm : la laine plus blanche d'un mouton (moutonTete) */ // (2026-09-26) la caméra DANS l'ellipsoïde : la paroi intérieure se montre (white-out) ; dehors, l'endroit seul
    c.g.position.x=c.c.x+Math.sin(t*.07+c.ph)*4;   // le banc respire et dérive au vent
    c.g.position.z=c.c.z+Math.cos(t*.05+c.ph)*4;
    if(d2<1){ // ---- DEDANS ----
      const k=1-Math.sqrt(d2);
      if(k>cloudIn)cloudIn=k;
      if(!c.wasIn){
        c.wasIn=true;
        if(SONV2){if(!(mode==='drive'&&(c.brokenT||0)<=0))sfx('nuage.entre');}else noiseBurst(.5,.10,520); // on plonge dans la ouate (console de son : défoncé au sol, c'est nuage.defonce qui parle)
        /* (2026-09-30, Sacha : « les nuages doivent juste BLOQUER LA VUE, rien d'autre ») plus de budget d'airtime rendu par un banc (1,2 s — à l'ORAGE, un vol bas rechargeait toutes les 2-4 s) */
        if(NUVIT.vox)nuCasseBurst(cp,Math.min(1,k+.35),c);else shatterCloud(cp,Math.min(1,k+.35)); // MILLE MORCEAUX au point de contact (où l'on touche le banc)
        if(mode==='drive'&&(c.brokenT||0)<=0){c.brokenT=4.5;if(SONV2)sfx('nuage.defonce');else whoosh();addStyle(3);} // la caisse DÉFONCE le banc → il éclate puis se reforme
        if(SENS)try{c.sensT=performance.now();sensNuage(k,mode==='drive'&&c.brokenT===4.5);}catch(e){} // (2026-10-14, sensations) le POUF dans la main, dosé par la profondeur et la vitesse — la caisse, elle, ne sent rien
      }
      /* (2026-09-30, Sacha : « les nuages doivent juste bloquer la vue, rien d'autre ») le nuage ne touche plus à la CAISSE : plus de coussin
         d'air (portance), plus de turbulence (vitesse et vrille chahutées), plus de regain d'airtime ; au sol plus de tangage ni de frein.
         Il reste ce qui se VOIT et s'ENTEND : le voile blanc, la paroi vue de dedans, le son feutré — et la caméra qui tremble à peine. */
      shake=Math.max(shake,(mode==='fall'?.1:.07)*k);
      if(NUVIT.vox)nuCasseDans(c,k,cp);
      // (zéro particule à la traversée — demande de Sacha : la paroi du mesh fait tout le travail)
    }else if(c.wasIn&&d2>1.3){ // ---- SORTIE ----
      c.wasIn=false;
      if(SONV2)sfx('nuage.sort');else noiseBurst(.22,.07,1500); // l'air se rouvre d'un coup
      if(SENS)try{sensNuageSort(c);}catch(e){} // (2026-10-14, sensations) l'air se rouvre : un tic minuscule, seulement après un vrai passage
      if(c.onRoad&&mode==='drive'&&Math.abs(vA)*3.6*SPD>140)addStyle(7); // percée à l'aveugle
    }
  }
  if(NUVIT.vox)nuCasseTick(dt,t);
  if(NUVIT.vox)nuMoodTick(dt);
  cloudInS+=(cloudIn-cloudInS)*Math.min(1,dt*(cloudIn>cloudInS?9:3.5));
  if(cloudInS<.004)cloudInS=0;
  {const o9=(cloudInS*.26).toFixed(3);if(updateClouds._o!==o9){updateClouds._o=o9;cloudFxEl.style.opacity=o9;}} // (2026-09-27) écrit seulement quand il change (hors nuage : « 0.000 » à chaque image) // JOUABLE : voile discret (était .92 = white-out aveuglant, puis .40 — encore trop blanc sous le bloom)
  cloudNearS+=(prox-cloudNearS)*Math.min(1,dt*2.5);
  // CONTRE-JOUR : face au soleil (au carré : ±30° seulement), la brume se dore, l'horizon avance, l'expo respire
  camera.getWorldDirection(cjV);
  const cj9=Math.max(0,cjV.dot(SUN_DIR))*(1-LVL.pluie),cj2=cj9*cj9, // (ville sous la pluie : pas de soleil, pas de contre-jour)
        fogN9=FOG_N*(1-cj2*.18);
  scene.fog.near=fogN9-(fogN9-Math.min(fogN9,120))*cloudInS+CAMP_FOG*.5; /* (2026-09-30) jamais plus clair qu'avant d'entrer : à l'ORAGE (70/660) le banc ÉCLAIRCISSAIT la brume */   // on garde de la profondeur DANS le nuage (26→120 : la route reste lisible) · (2026-09-27) l'ÉCLAIR de l'orage ouvre le brouillard (CAMP_FOG)
  scene.fog.far=FOG_F-(FOG_F-Math.min(FOG_F,820))*cloudInS+CAMP_FOG;     // (340→820)
  fogTmp.copy(FOG_BASE).lerp(FOG_CJ,cj2*.5).lerp(FOG_CLOUD,cloudInS);
  scene.fog.color.copy(fogTmp);
  if(FUMEE_K>.002){scene.fog.near+=(Math.min(scene.fog.near,30)-scene.fog.near)*FUMEE_K;scene.fog.far+=(Math.min(scene.fog.far,FUMEE_F)-scene.fog.far)*FUMEE_K;scene.fog.color.lerp(FOG_FUMEE,FUMEE_K);} // (2026-10-14) LE ROYAUME DE FEU : dans un BANC DE FUMÉE la vue se referme (le défi de la map : voir) — les néons de la route, eux, percent encore quelques dizaines de mètres
  /* L'ADAPTATION DE L'ŒIL (2026-09-25, user : « la lumière peut être éblouissante, dans les nuages notamment »). Une ouate
     blanche éclairée plein soleil, c'est déjà du blanc pur AVANT le post ; le bloom l'étale et l'ACES le cloue au plafond :
     l'écran entier devenait blanc. Comme une vraie caméra, l'exposition BAISSE quand l'œil s'approche d'un banc, y entre,
     ou regarde le soleil — et le bloom se retient d'autant. Lissé : on ne voit pas le réglage, on voit que ça ne brûle plus. */
  GLARE=Math.min(1,Math.max(cloudInS,cloudNearS*.75,cj2*.45));
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO*(1+cj2*.07)*(1-.24*GLARE)*(1+CAMP_FLASH); // (2026-09-27) + le flash de l'éclair (niveau 9)
}
let cloudNearS=0,GLARE=0;
window.dbgProgs=function(cles){const P=renderer.info.programs||[];if(cles==='h')return P.map(function(p){const k=p.cacheKey;let h=5381;for(let i=0;i<k.length;i++)h=(h*33+k.charCodeAt(i))|0;return (h>>>0).toString(36)+' '+k.slice(0,40).replace(/\s+/g,' ')+' … '+k.slice(-50).replace(/\s+/g,' ');}); // (banc) chaque programme : une empreinte + son début et sa fin
  if(cles)return P.filter(function(p){return /nuageV\d|globeJourNuit/.test(p.cacheKey);}).map(function(p){return p.cacheKey;});return {n:P.length,ciel:P.filter(function(p){return /nuageV\d|globeJourNuit|an\*5\.-q\.y\*11/.test(p.cacheKey);}).map(function(p){return /nuageV\ddedans/.test(p.cacheKey)?'nuage-dedans':/nuageV\d/.test(p.cacheKey)?'nuage':/globe/.test(p.cacheKey)?'globe':'portail';})};};
