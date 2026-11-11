/* ==========================================================================
   SATURNE ET SES ANNEAUX · LES PLANÈTES IMMOBILES (2026-11-11, Sacha : « dans les maps espace enlève Jupiter et crée une jolie Saturne mais optimisée ;
   bug récurrent : les planètes se déplacent avec le joueur — c'est comme la lune sauf que la lune c'est un choix — les planètes doivent être immobiles
   et fixes dans l'espace »)
   ----------------------------------------------------------------------------
   · SATURNE (le SOIR de l'orbite, à la place de Jupiter) : le même globe que les autres (une toile repeinte à la naissance du niveau, `planetesSaturne` :
     bandes douces or pâle, zone équatoriale claire, pôles gris-bleu, l'ombre des anneaux sur l'hémisphère sud), plus petit et plus haut dans le ciel
     (fiche PLANETES : taille ,42, site ,13) pour que les anneaux tiennent dans l'image.
   · LES ANNEAUX (`SATU.ann`) : UN maillage plat (96 secteurs), UN appel de rendu, UNE texture de 512 × 1 (le profil : anneau C, B, division de Cassini,
     A, lacune d'Encke, annelets). Pas de profondeur à trier : le fragment calcule lui-même s'il passe DERRIÈRE le globe (rayon œil → fragment contre la
     sphère) et s'il est dans l'OMBRE du globe (fragment → soleil contre la sphère). Sur le plan lointain comme le globe : la route et les caisses les cachent.
     Invisibles hors Saturne (zéro pixel, zéro appel).
   · IMMOBILES : la direction d'une planète est fixée à la pose de la piste (`planeteCap`, appelé par orbiteBuild : sur la gauche du cap du départ) et ne change plus (voir lvlPlanete) ;
     son soleil est bâti sur CETTE direction (`planeteSoleil`), plus sur le cap de la caméra : ni l'astre ni son terminateur ne suivent le joueur.
     Seule la caméra tourne. L'axe de Saturne et le plan des anneaux sont fixes eux aussi (`planeteTourne`).
   Hook : `dbgSaturne()` (état, direction, cap, soleil, anneaux).
   ========================================================================== */
Object.assign(I18N,{"SATURNE":"SATURN"});
function planetesSaturne(x,W,H){ /* SATURNE : des bandes larges et douces (la brume d'ammoniac les fond), peu de turbulence, l'équateur clair, les pôles froids */
  const N=planetesBruitFab(1980),BD=[['#8e9c98',.05],['#a8a488',.04],['#c8b47c',.05],['#dcc890',.045],['#bfa56c',.04],['#e2d09a',.05],['#cdb67e',.04],['#ecdcaa',.06],['#f0e2b4',.07],['#e6d4a0',.05],['#c9b078',.045],['#dcc68e',.05],['#b89c64',.04],['#d2bc84',.05],['#b09a6c',.045],['#c4b080',.04],['#9c9478',.04],['#8a8c84',.05]]; /* nord → sud : (couleur, largeur) */
  let tot=0;for(const b of BD)tot+=b[1];const E=[],C=[];let acc=0;
  for(const b of BD){const c=parseInt(b[0].slice(1),16);acc+=b[1]/tot;E.push(acc);C.push([c>>16&255,c>>8&255,c&255]);}
  const LUT=new Float32Array(1024*4); /* latitude → couleur (bords très adoucis) et → turbulence (un peu plus forte au bord entre deux bandes) */
  for(let i=0;i<1024;i++){const y=(i+.5)/1024;let k=0;while(k<E.length-1&&y>E[k])k++;
    const h0=k>0?E[k-1]:0,dB=Math.min(Math.abs(y-h0),Math.abs(E[k]-y)),w=.016,vois=y<h0+w&&k>0?k-1:(E[k]-y<w&&k<E.length-1?k+1:k);
    const t=vois===k?0:.5*(1-Math.min(1,dB/w)),a=C[k],b=C[vois];
    LUT[i*4]=a[0]+(b[0]-a[0])*t;LUT[i*4+1]=a[1]+(b[1]-a[1])*t;LUT[i*4+2]=a[2]+(b[2]-a[2])*t;LUT[i*4+3]=.004+.014*Math.exp(-dB*dB/.0004);}
  const col=function(yy){return Math.max(0,Math.min(1023,(yy*1024)|0))*4;};
  planetesPixels(x,W,H,function(u,v,o){
    const lat=Math.abs(v*2-1),tb=planetesFbm(N,u,v,3,5,20,0);
    let i0=col(v);i0=col(v+(tb-.5)*2*LUT[i0+3]);let r=LUT[i0],g=LUT[i0+1],b=LUT[i0+2];
    const fl=.90+.20*planetesFbm(N,u,v,4,4,150,11);r*=fl;g*=fl;b*=fl;                      /* les filaments, étirés dans le sens des bandes */
    const po=planetesSmooth(.74,1,lat);r+=(112-r)*po*.5;g+=(124-g)*po*.5;b+=(132-b)*po*.5; /* les pôles : gris-bleu */
    const om=planetesSmooth(.585,.63,v)*(1-planetesSmooth(.80,.90,v))*.46;r*=1-om;g*=1-om;b*=1-om*.9; /* l'ombre des anneaux sur l'hémisphère sud (le soleil et l'axe sont fixes l'un par rapport à l'autre) */
    o[0]=r;o[1]=g;o[2]=b;});
}
PLANETES_PEINTRES.saturne=planetesSaturne;
const SATU=(function(){
  const RI=1.22,RE=2.30,NP9=512,cv=document.createElement('canvas');cv.width=NP9;cv.height=1;
  const cx=cv.getContext('2d'),im=cx.createImageData(NP9,1),D=im.data,R=planetesAlea(1610);
  let lent=R(),fin=R();
  const pas=function(a,b,v){const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  for(let i=0;i<NP9;i++){const r=RI+(RE-RI)*(i+.5)/NP9; /* le rayon, en rayons de Saturne */
    if(!(i%9))lent=R();fin=fin*.45+R()*.55;
    const cC=pas(1.235,1.27,r)*(1-pas(1.50,1.535,r)),cB=pas(1.515,1.56,r)*(1-pas(1.935,1.955,r)),cA=pas(2.02,2.04,r)*(1-pas(2.255,2.275,r));
    const enc=1-.85*Math.exp(-(r-2.214)*(r-2.214)/.00004),bInt=.80+.20*pas(1.62,1.90,r);       /* la lacune d'Encke ; l'anneau B plus dense vers l'extérieur */
    const a=Math.min(1,cC*.20+cB*.94*bInt+cA*.60*enc+pas(1.95,1.985,r)*(1-pas(1.985,2.02,r))*.05); /* (un voile dans la division de Cassini : elle n'est pas vide) */
    const g=(.80+.20*lent)*(.90+.10*fin),w=cB>cC&&cB>cA?1:cA>cC?.6:0;                          /* w : 1 crème (B) · ,6 beige (A) · 0 gris-brun (C) */
    D[i*4]=Math.round((108+w*98)*g);D[i*4+1]=Math.round((96+w*88)*g);D[i*4+2]=Math.round((84+w*62)*g);D[i*4+3]=Math.round(255*a*(.86+.14*fin));}
  cx.putImageData(im,0,0);
  const tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
  const geo=new THREE.RingGeometry(PLANET_R*RI,PLANET_R*RE,96,1);geo.rotateX(-Math.PI/2); /* à plat dans le plan équatorial (normale +Y) */
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,side:THREE.DoubleSide,extensions:{derivatives:true},
    uniforms:{uProf:{value:tex},uC:{value:new THREE.Vector3()},uN:{value:new THREE.Vector3(0,1,0)},uSun:OBEAU.u.uSunO,uR:{value:PLANET_R},uOp:{value:0},uLum:{value:.84}},
    vertexShader:['varying vec2 vL;varying vec3 vW;',
      'void main(){vL=position.xz;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z=gl_Position.w;}'].join('\n'), /* le plan lointain, comme le globe */
    fragmentShader:['uniform sampler2D uProf;uniform vec3 uC,uN,uSun;uniform float uR,uOp,uLum;varying vec2 vL;varying vec3 vW;',
      'void main(){',
      '  float u=(length(vL)/'+PLANET_R.toFixed(1)+'-'+RI.toFixed(2)+')/'+(RE-RI).toFixed(2)+';',
      '  vec4 p=texture2D(uProf,vec2(u,.5));float a=p.a*uOp;if(a<.004)discard;',
      '  vec3 o=cameraPosition-uC,d=vW-cameraPosition;float L=length(d);d/=L;',
      '  float b=dot(o,d),dr=sqrt(max(dot(o,o)-b*b,0.));',                                             /* la distance du centre du globe au rayon œil → fragment */
      '  if(-b>0.&&-b<L)a*=smoothstep(uR-fwidth(dr)*1.5,uR+fwidth(dr)*1.5,dr);',                       /* DERRIÈRE le globe : coupé (bord adouci) */
      '  if(a<.004)discard;',
      '  vec3 q=uC-vW;float s=dot(q,uSun),om=1.;',
      '  if(s>0.){float dl=sqrt(max(dot(q,q)-s*s,0.));om=smoothstep(uR*.95,uR*1.05,dl);}',            /* dans l OMBRE du globe */
      '  float face=dot(uSun,uN)*dot(o,uN)>0.?1.:.40;',                                                /* la face éclairée, ou la lumière qui traverse */
      '  gl_FragColor=vec4(p.rgb*uLum*face*mix(.07,1.,om),a);}'].join('\n')});
  const ann=new THREE.Mesh(geo,mat);ann.frustumCulled=false;ann.visible=false;ann.renderOrder=-7; /* transparent : après l'atmosphère et le halo (−8), sous tout le reste */
  planetGroup.add(ann);planetGroup.userData.ann=ann;
  return {ann:ann,axe:false,q:new THREE.Quaternion(),qs:new THREE.Quaternion(),A:new THREE.Vector3(),h:new THREE.Vector3(),c:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0)};})();
function planeteCap(){ /* (orbiteBuild) le cap de la planète pour TOUT le niveau : 28° sur la gauche du cap du DÉPART (la moyenne des 500 premiers mètres : on la voit en arrivant).
     (MESURÉ au banc : la piste d'orbite part dans tous les sens — 3,6 rad de cap en 13 s — : son cap moyen sur tout le niveau ne veut rien dire, la planète se posait dans le dos.) */
  let x=0,z=0;const n=Math.max(1,Math.min(NP,Math.round(NP*500/Math.max(500,L))));
  for(let i=0;i<n;i++){x+=T[i].x;z+=T[i].z;}
  if(x*x+z*z<n*n*.04){x=NP>0?T[0].x:0;z=NP>0?T[0].z:0;} /* un départ en épingle : le cap du tout premier mètre */
  if(x*x+z*z<1e-8){x=0;z=-1;}
  return Math.atan2(x,z)+.5;}
function planeteSoleil(){ /* (orbBeau) le soleil du globe et des anneaux : à GAUCHE de la planète, un peu au-dessus, un peu vers l'œil — bâti sur la direction de la planète, donc FIXE */
  const d=ORB.terre,h=OBEAU.t1.set(d.x,0,d.z);if(h.lengthSq()<1e-6)h.set(0,0,-1);h.normalize();
  OBEAU.sunP.crossVectors(h,ORB.haut).multiplyScalar(-.92).addScaledVector(ORB.haut,.34).addScaledVector(d,-OBEAU.kSol).normalize();OBEAU.sunOk=true;}
function planeteTourne(t){ /* (boucle) la rotation propre du globe ; sous Saturne : l'axe des anneaux, fixe dans le monde */
  const g=planetGroup.userData,gl=g.globe,on=g.peint==='saturne'&&LVL.espace>.01&&planetGroup.visible;
  SATU.ann.visible=on;
  if(!on){if(SATU.axe){SATU.axe=false;gl.rotation.set(0,0,.28);}gl.rotation.y=t*.014;return;}
  SATU.axe=true;
  const d=SATU.c.subVectors(planetGroup.position,camera.position).normalize(),h=SATU.h.set(d.x,0,d.z);if(h.lengthSq()<1e-6)h.set(0,0,-1);h.normalize();
  const A=SATU.A.crossVectors(SATU.Y,h).multiplyScalar(.17).addScaledVector(SATU.Y,.89).addScaledVector(h,-.45).normalize(); /* le pôle nord penché de ~21° vers l'œil, roulé de 10° : les anneaux s'ouvrent */
  SATU.q.setFromUnitVectors(SATU.Y,A);SATU.ann.quaternion.copy(SATU.q);
  gl.quaternion.copy(SATU.q).multiply(SATU.qs.setFromAxisAngle(SATU.Y,(t*.02)%6.2832));
  const u=SATU.ann.material.uniforms;u.uC.value.copy(planetGroup.position);u.uN.value.copy(A);u.uR.value=PLANET_R*planetGroup.scale.x;u.uOp.value=Math.min(1,LVL.espace);}
window.dbgSaturne=function(){ /* (dev) dbgSaturne() : l'état de la planète du niveau (direction, cap, soleil, anneaux) et le cap de la caméra et de la piste */
  const d=new THREE.Vector3().subVectors(planetGroup.position,camera.position).normalize(),p=planetGroup.position.clone().project(camera);
  return {peint:planetGroup.userData.peint,anneaux:SATU.ann.visible,echelle:+planetGroup.scale.x.toFixed(3),az:LVL.az==null?null:+LVL.az.toFixed(4),site:LVL.site==null?null:LVL.site,
    dir:d.toArray().map(function(v){return +v.toFixed(4);}),soleil:OBEAU.sunP.toArray().map(function(v){return +v.toFixed(4);}),
    ecran:[+p.x.toFixed(2),+p.y.toFixed(2),p.z<1?'devant':'derriere'],orbite:ORB.actif,espace:+LVL.espace.toFixed(2),
    capCam:(function(){const v=camera.getWorldDirection(new THREE.Vector3());return +Math.atan2(v.x,v.z).toFixed(3);})(),capPiste:+(planeteCap()-.5).toFixed(3),cap0:NP>0?+Math.atan2(T[0].x,T[0].z).toFixed(3):null,np:NP};};
