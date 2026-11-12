/* ==========================================================================
   LE SOLEIL DE L'ORBITE : UN POINT DE LUMIÈRE (2026-11-11, Sacha : « dans l'espace rajoute un point lumineux pour faire un soleil ultra réaliste qui envoie une
   lumière rasante, pour avoir une source de lumière plus logique sur la route et la voiture. Tu le designes pas, ça doit être juste comme la vraie vie : un point de lumière »)
   ----------------------------------------------------------------------------
   · OÙ : une direction FIXE du monde (`ORB.sun`), choisie une fois à la pose de la piste (`soleilPose`, appelé par orbiteBuild) : 65° sur la gauche du cap du départ,
     18° au-dessus de l'horizon — rasant, loin de la planète (28° à gauche) et de ses anneaux. Il ne suit pas le joueur : comme les planètes, seule la caméra tourne.
   · CE QU'IL ÉCLAIRE : la clé de la scène (route, caisse, ombres portées, satellites, roches) vient de CETTE direction (orbiteLumiere), et la planète aussi (planeteSoleil).
   · CE QU'ON VOIT (`SOLEIL`) : rien de dessiné — ni rayons, ni étoile à branches, ni reflet d'objectif (retirés le 24/10). Un disque blanc de quelques pixels, très au-dessus
     du blanc de l'écran (la chaîne de rendu est en demi-flottant : c'est le bloom du jeu qui fait son éblouissement, comme un capteur), et une lueur qui s'éteint vite autour
     pour les appareils sans bloom. Un quad en espace écran, sur le plan lointain (la route, la caisse, les roches le cachent), additif, UN appel de rendu, invisible hors orbite.
   Hook : `dbgSoleilOrb()` (direction, place à l'écran, cosinus de la clé sur la dalle).
   (2026-11-12, L'ORBITE FAÇON GRAVITY) LES TROIS MOMENTS DE L'ORBITE : la place du soleil se lit dans la fiche de l'ambiance (`astre.sol`, niveaux.js) — haut et de côté (plein jour), juste
   au-dessus du bord de la Terre (lever de soleil : sa hauteur est calculée sur le limbe, à cet azimut), ou caché derrière elle (face nuit). Un soleil derrière la Terre ne se dessine pas
   (l'éclipse : `soleilVu`). La planète (cap, soleil du globe) vit ici ; sa rotation et l'axe des anneaux de Saturne, dans orbite-saturne.js. `dbgTerre()` : le moment, le soleil, la Terre.
   ========================================================================== */
function planeteCap(){ /* (orbiteBuild) le cap de la planète pour TOUT le niveau : 28° sur la gauche du cap du DÉPART (la moyenne des 500 premiers mètres : on la voit en arrivant) */
  let x=0,z=0;const n=Math.max(1,Math.min(NP,Math.round(NP*500/Math.max(500,L))));
  for(let i=0;i<n;i++){x+=T[i].x;z+=T[i].z;}
  if(x*x+z*z<n*n*.04){x=NP>0?T[0].x:0;z=NP>0?T[0].z:0;} /* un départ en épingle : le cap du tout premier mètre */
  if(x*x+z*z<1e-8){x=0;z=-1;}
  return Math.atan2(x,z)+.5;}
function planeteSoleil(){ /* (orbBeau) le soleil du globe : le soleil qu'on voit (ORB.sun), ramené vers l'œil de `kSol` (le plein jour : le disque ne passe pas en nuit ; 0 aux autres moments : le vrai) */
  const d=ORB.terre,a=LVL.cur&&LVL.cur.astre,k=a&&a.kSol!=null?a.kSol:OBEAU.kSol;
  if(ORB.sunOk){OBEAU.sunP.copy(ORB.sun).addScaledVector(d,-k).normalize();OBEAU.sunOk=true;return;}
  const h=OBEAU.t1.set(d.x,0,d.z);if(h.lengthSq()<1e-6)h.set(0,0,-1);h.normalize();
  OBEAU.sunP.crossVectors(h,ORB.haut).multiplyScalar(-.92).addScaledVector(ORB.haut,.34).addScaledVector(d,-OBEAU.kSol).normalize();OBEAU.sunOk=true;}
function orbRho(sc){return Math.asin(Math.min(.999,Math.max(.02,sc)*PLANET_R/PLANET_D));} /* le rayon apparent de la Terre (rad) à l'échelle sc */
ORB.sun=new THREE.Vector3(-.55,.31,.4).normalize();ORB.sunOk=false;
const SOLEIL=(function(){
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,blending:THREE.AdditiveBlending,
    uniforms:{uD:{value:ORB.sun},uPx:{value:new THREE.Vector2(.1,.1)},uR:{value:140},uOp:{value:0}},
    vertexShader:['uniform vec3 uD;uniform vec2 uPx;varying vec2 vQ;',
      'void main(){vQ=position.xy;vec4 c=projectionMatrix*viewMatrix*vec4(cameraPosition+uD*1000.,1.);',
      '  if(c.w<=0.){gl_Position=vec4(0.,0.,2.,1.);return;}',                                  /* derrière l œil : hors champ */
      '  gl_Position=c+vec4(position.xy*uPx,0.,0.)*c.w;gl_Position.z=gl_Position.w;}'].join('\n'), /* le plan lointain */
    fragmentShader:['uniform float uR,uOp;varying vec2 vQ;',
      'void main(){float r=length(vQ)*uR;if(r>uR)discard;',                                    /* r : en pixels CSS depuis le centre */
      '  float disque=1.-smoothstep(2.6,4.4,r);',                                              /* le disque : ~7 px de diamètre (un demi-degré au champ moyen, un rien grossi par l éblouissement) */
      '  float lueur=(1.7*exp(-r/7.)+.34*exp(-r/30.))*(1.-smoothstep(uR*.6,uR,r));',           /* la diffusion dans l optique : elle tombe vite */
      '  gl_FragColor=vec4(vec3(1.,.975,.93)*(disque*26.+lueur)*uOp,1.);}'].join('\n')});
  const me=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m);me.frustumCulled=false;me.visible=false;me.renderOrder=-6; /* après les astres (−9 … −7), avant tout le reste */
  scene.add(me);return me;})();
function soleilPose(){ /* (orbiteBuild) la direction du soleil pour TOUT le niveau ; la clé s'y cale d'un coup (pas de balayage d'ombres à l'arrivée) */
  const c=LVL.cur,a9=c&&c.astre,so=(a9&&a9.sol)||{da:.63,y:.31},az=planeteCap();let y=so.y;
  if(y==null){ /* au ras du LIMBE : la hauteur du bord de la Terre à cet azimut (dichotomie sur le cercle apparent), puis dy au-dessus (négatif : derrière elle) */
    const sy=a9&&a9.site!=null?a9.site:-.70,ec=Math.asin(Math.max(-.99,Math.min(.99,sy))),rho=orbRho((c&&c.planete)||1.35),cr=Math.cos(rho),cd=Math.cos(so.da||0);
    let lo=ec,hi=Math.min(1.5,ec+rho);for(let k=0;k<32;k++){const m=(lo+hi)/2;if(Math.sin(m)*Math.sin(ec)+Math.cos(m)*Math.cos(ec)*cd>cr)lo=m;else hi=m;}
    y=Math.sin(Math.max(-1.5,Math.min(1.5,lo+(so.dy||0))));}
  const a=az+(so.da||0),h=Math.sqrt(Math.max(0,1-y*y));
  ORB.sun.set(Math.sin(a)*h,y,Math.cos(a)*h);ORB.sunOk=true;ORB.cleOk=false;}
function soleilVu(ok){ /* (orbiteTick) visible en orbite seulement ; sa taille se compte en pixels CSS (la même sur tous les écrans) */
  const on=ok&&ORB.sunOk&&LVL.espace>.01&&!(planetGroup.visible&&ORB.sun.dot(ORB.terre)>Math.cos(orbRho(planetGroup.scale.x)));SOLEIL.visible=on;if(!on)return; /* (2026-11-12) l'ÉCLIPSE : derrière la Terre, le soleil ne se dessine pas (le quad additif passait par-dessus le globe) */
  const u=SOLEIL.material.uniforms,el=renderer.domElement,w=Math.max(1,el.clientWidth||el.width),h=Math.max(1,el.clientHeight||el.height);
  u.uPx.value.set(2*u.uR.value/w,2*u.uR.value/h);u.uOp.value=Math.min(1,LVL.espace);}
window.dbgTerre=function(){ /* (dev, 2026-11-12) le moment de l'orbite, le soleil, la Terre (taille, rayon apparent, direction), l'éclipse */
  const c=LVL.cur,a=c&&c.astre;return {meteo:c&&c.meteo,mt:c&&c.mt,sol:a&&a.sol,kSol:a&&a.kSol,echelle:+planetGroup.scale.x.toFixed(3),rhoDeg:+(orbRho(planetGroup.scale.x)*57.3).toFixed(1),
    soleil:ORB.sun.toArray().map(function(v){return +v.toFixed(3);}),terre:ORB.terre.toArray().map(function(v){return +v.toFixed(3);}),ecartDeg:+(Math.acos(Math.max(-1,Math.min(1,ORB.sun.dot(ORB.terre))))*57.3).toFixed(1),soleilVisible:SOLEIL.visible,az:LVL.az,site:LVL.site};};
window.dbgSoleilOrb=function(k){ /* (dev) dbgSoleilOrb() : où est le soleil, et sous quel angle il éclaire la dalle sous la caisse · dbgSoleilOrb('ici') : le pose dans l'image (25° à gauche du regard, 18° au-dessus de l'horizon), pour le photographier */
  if(k==='ici'){const v=camera.getWorldDirection(new THREE.Vector3()),a=Math.atan2(v.x,v.z)+.44,y=.31,h=Math.sqrt(1-y*y);ORB.sun.set(Math.sin(a)*h,y,Math.cos(a)*h);ORB.sunOk=true;}
  const p=new THREE.Vector3().copy(camera.position).addScaledVector(ORB.sun,1000).project(camera),hz=ORB.hz;
  return {pose:ORB.sunOk,visible:SOLEIL.visible,dir:ORB.sun.toArray().map(function(v){return +v.toFixed(4);}),cle:ORB.cle.toArray().map(function(v){return +v.toFixed(4);}),
    ecartCleSoleil:+ORB.cle.angleTo(ORB.sun).toFixed(4),cosDalleSoleil:hz?+ORB.sun.dot(hz).toFixed(3):null,cosDalleCle:hz?+ORB.cle.dot(hz).toFixed(3):null,
    lumiere:L_DIR.toArray().map(function(v){return +v.toFixed(4);}),ecran:[+p.x.toFixed(3),+p.y.toFixed(3),p.z<1?'devant':'derriere'],espace:+LVL.espace.toFixed(2),op:SOLEIL.material.uniforms.uOp.value,px:SOLEIL.material.uniforms.uPx.value.toArray(),ordre:SOLEIL.renderOrder,dansScene:SOLEIL.parent===scene};};
