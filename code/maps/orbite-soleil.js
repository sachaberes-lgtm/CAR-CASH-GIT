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
   ========================================================================== */
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
  const a=planeteCap()-.5+1.13,y=.31,h=Math.sqrt(1-y*y);
  ORB.sun.set(Math.sin(a)*h,y,Math.cos(a)*h);ORB.sunOk=true;ORB.cleOk=false;}
function soleilVu(ok){ /* (orbiteTick) visible en orbite seulement ; sa taille se compte en pixels CSS (la même sur tous les écrans) */
  const on=ok&&ORB.sunOk&&LVL.espace>.01;SOLEIL.visible=on;if(!on)return;
  const u=SOLEIL.material.uniforms,el=renderer.domElement,w=Math.max(1,el.clientWidth||el.width),h=Math.max(1,el.clientHeight||el.height);
  u.uPx.value.set(2*u.uR.value/w,2*u.uR.value/h);u.uOp.value=Math.min(1,LVL.espace);}
window.dbgSoleilOrb=function(k){ /* (dev) dbgSoleilOrb() : où est le soleil, et sous quel angle il éclaire la dalle sous la caisse · dbgSoleilOrb('ici') : le pose dans l'image (25° à gauche du regard, 18° au-dessus de l'horizon), pour le photographier */
  if(k==='ici'){const v=camera.getWorldDirection(new THREE.Vector3()),a=Math.atan2(v.x,v.z)+.44,y=.31,h=Math.sqrt(1-y*y);ORB.sun.set(Math.sin(a)*h,y,Math.cos(a)*h);ORB.sunOk=true;}
  const p=new THREE.Vector3().copy(camera.position).addScaledVector(ORB.sun,1000).project(camera),hz=ORB.hz;
  return {pose:ORB.sunOk,visible:SOLEIL.visible,dir:ORB.sun.toArray().map(function(v){return +v.toFixed(4);}),cle:ORB.cle.toArray().map(function(v){return +v.toFixed(4);}),
    ecartCleSoleil:+ORB.cle.angleTo(ORB.sun).toFixed(4),cosDalleSoleil:hz?+ORB.sun.dot(hz).toFixed(3):null,cosDalleCle:hz?+ORB.cle.dot(hz).toFixed(3):null,
    lumiere:L_DIR.toArray().map(function(v){return +v.toFixed(4);}),ecran:[+p.x.toFixed(3),+p.y.toFixed(3),p.z<1?'devant':'derriere'],espace:+LVL.espace.toFixed(2),op:SOLEIL.material.uniforms.uOp.value,px:SOLEIL.material.uniforms.uPx.value.toArray(),ordre:SOLEIL.renderOrder,dansScene:SOLEIL.parent===scene};};
