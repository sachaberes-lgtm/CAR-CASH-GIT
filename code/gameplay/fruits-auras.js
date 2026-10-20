/* LES AURAS DES FRUITS-POUVOIRS (2026-10-20, Léo : « piment = aura flamme bien visible, citron = aura électrique, fruit du dragon = aura hypnotique,
   raisin angélique, pomme dorée ») — de VRAIS effets du moteur, pas des dessins : UN seul programme (`FAURA.mat`), cinq comportements choisis par `uKind`.
   Chaque aura est un nuage de points CARRÉS (la DA pixel du jeu) dont TOUT le mouvement est calculé dans le vertex shader à partir de `uT` et d'un
   grain tiré une fois (`aSeed`) : zéro travail processeur par image, zéro allocation, additif (le bloom du jeu fait le reste).
   0 : PIMENT — langues de feu qui montent autour du fruit (blanc-jaune → orange → rouge sombre)
   1 : CITRON — arcs électriques brisés qui claquent à 11 Hz, étincelles
   2 : DRAGON — vortex hypnotique : bras en spirale qui tournent + anneaux qui s'élargissent, teintes qui glissent (disque face à la caméra, DERRIÈRE le fruit)
   3 : RAISIN — halo d'ange incliné au-dessus + poussière d'or qui monte en scintillant
   4 : POMME DORÉE — étincelles en croix qui orbitent et montent
   Usage : `const a=fauraNew(kind);scene.add(a);` puis `fauraTick(a,tSecondes,camera)` à chaque image. */
const FAURA={mat:null,px:1,N:[320,280,360,0,150]};
function fauraMat(kind){
  const m=new THREE.ShaderMaterial({
    uniforms:{uT:{value:0},uKind:{value:kind},uPx:{value:600}},
    vertexShader:`uniform float uT,uKind,uPx;attribute vec4 aSeed;varying vec4 vCol;varying float vShape;
float h(float x){return fract(sin(x*127.1)*43758.5453);}
vec3 ramp(float l){return mix(mix(vec3(1.,.96,.62),vec3(1.,.52,.08),smoothstep(0.,.42,l)),vec3(.78,.06,.03),smoothstep(.4,1.,l));}
void main(){
  vec3 p=vec3(0.);float size=.2;vec4 col=vec4(0.);float shape=0.;vec4 s=aSeed;
  if(uKind<.5){ // PIMENT : une nappe de feu sur tout le corps du fruit
    float life=fract(uT*(.7+.8*s.y)+s.x);
    float bx=(s.z-.5)*4.6;float arch=-.55+.9*(1.-pow(abs(bx)/2.4,2.));
    p=vec3(bx*(1.-.35*life)+sin(uT*4.+s.w*30.+life*6.)*.22*life,arch+life*(3.1+1.6*s.y),(s.w-.5)*1.3);
    p.x+=sin(uT*6.+s.x*50.)*.25*life;
    size=(1.-life*.8)*(.34+.30*s.w)+.06;
    col=vec4(ramp(life),(1.-pow(life,3.)));
    } else if(uKind<1.5){ // CITRON : l'arc claque
    float spark=step(1.5,s.x);float bolt=spark>.5?floor(s.z*8.):floor(s.x*8.+.5);float st=floor(uT*11.+bolt*3.7);
    float on=step(.22,h(bolt*17.1+st*1.3));
    float ang=h(bolt*5.7+st*3.1)*6.2832;float el=(h(bolt*9.3+st*2.2)-.5)*1.6;
    vec3 d=normalize(vec3(cos(ang),el,sin(ang)));
    vec3 pe=normalize(cross(d,vec3(0.,1.,.0013)));vec3 pf=cross(d,pe);
    float t=s.y;float sg=floor(t*9.);
    float j1=(h(sg*3.3+bolt+st*.7)-.5)*1.5,j2=(h(sg*7.1+bolt*2.+st*.9)-.5)*1.5;
    p=d*(1.6+t*3.8)+(pe*j1+pf*j2)*(.3+sin(t*3.1416)*.9);
    size=.20+.07*h(s.z*91.+st);
    col=vec4(mix(vec3(.45,.9,1.),vec3(1.,1.,.8),h(bolt+st*.37)),on);
    if(spark>.5){float lf=fract(uT*2.2+s.z);p=d*(1.7+3.*s.y)+vec3(h(s.z*3.)-.5,h(s.z*5.)-.5-lf*.5,h(s.z*7.)-.5)*lf*2.2;size=.15*(1.-lf);col=vec4(1.,1.,.7,on*(1.-lf));}
  } else if(uKind<2.5){ // DRAGON : le vortex
    float arm=floor(s.x*3.);float hue;float al=1.;
    if(s.w<.62){float rho=1.2+s.y*5.6;float a=arm*2.0944+rho*.95-uT*1.5+s.z*.12;
      p=vec3(cos(a)*rho,sin(a)*rho*.95,-1.6);size=.18+.22*(rho/6.8)+.05*sin(uT*5.+rho*3.);hue=fract(rho*.15-uT*.3+arm*.16);al=1.;}
    else{float rr=fract(uT*.4+s.y)*7.;float a=s.z*6.2832;p=vec3(cos(a)*rr,sin(a)*rr*.95,-1.6);size=.17;hue=fract(rr*.14-uT*.25);al=(1.-rr/7.)*.95;}
    vec3 pc=.52+.48*cos(6.2832*(hue*.55+vec3(.0,.2,.42)));col=vec4(pc*vec3(1.,.8,1.),al);
  } else if(uKind<3.5){ // RAISIN : halo d'ange et poussière d'or
    if(s.w<.3){float a=s.z*6.2832+uT*.9;p=vec3(cos(a)*1.3,2.75+sin(a)*.17+sin(uT*1.6)*.08,sin(a)*.62);size=.14;col=vec4(1.,.93,.55,.95);}
    else{float life=fract(uT*.3+s.x);float a=s.z*6.2832+uT*.5;float r=1.1+2.*s.y;float tw=.5+.5*sin(uT*7.+s.x*50.);
      p=vec3(cos(a)*r,-1.+life*5.2,sin(a)*r*.8);size=.2*(.45+tw);col=vec4(1.,.96,.74,(1.-life)*tw);shape=1.;}
  } else { // POMME DORÉE : les étincelles
    float life=fract(uT*.42+s.x);float a=s.z*6.2832+uT*(.9+s.y);float r=1.25+1.5*s.y+life*.8;float tw=.45+.55*abs(sin(uT*6.+s.x*40.));
    p=vec3(cos(a)*r,-1.2+life*4.+sin(a*2.)*.3,sin(a)*r*.7);size=.24*tw*(1.-life*.4);col=vec4(1.,.8,.26,tw*(1.-life*.5));shape=1.;}
  vCol=col;vShape=shape;
  vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp(size*uPx/max(.1,-mv.z),2.,90.);
}`,
    fragmentShader:`varying vec4 vCol;varying float vShape;
void main(){vec2 c=gl_PointCoord-.5;float v=max(abs(c.x),abs(c.y))*2.;
  if(vShape>.5){float ax=abs(c.x),ay=abs(c.y);if(!(min(ax,ay)<.09||ax+ay<.17))discard;}
  vec3 core=min(vCol.rgb*1.35+.15,vec3(1.));vec3 edge=vCol.rgb*vec3(.85,.5,.62);
  gl_FragColor=vec4(v>.62&&vShape<.5?edge:core,clamp(vCol.a,0.,1.));}`,
    blending:THREE.NormalBlending,transparent:true,depthWrite:false,depthTest:true});
  return m;
}
function fauraNew(kind){
  const n=FAURA.N[kind],pos=new Float32Array(n*3),sd=new Float32Array(n*4);let q=kind*7919+13;
  const r=()=>{q=(q*16807)%2147483647;return q/2147483647;};
  for(let i=0;i<n;i++){sd[i*4]=r();sd[i*4+1]=r();sd[i*4+2]=r();sd[i*4+3]=r();
    if(kind===1){if(i<224){sd[i*4]=Math.floor(i/28)/8;sd[i*4+1]=(i%28)/27;}else sd[i*4]=2;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSeed',new THREE.BufferAttribute(sd,4));
  const pts=new THREE.Points(g,fauraMat(kind));pts.frustumCulled=false;pts.renderOrder=20;pts.visible=n>0; // n=0 : pas d'aura (le RAISIN ne garde que ses ailes blanches)
  const grp=new THREE.Group();grp.add(pts);grp.userData.faura={kind,pts};return grp;
}
const FAURA_Q=new THREE.Quaternion();
function fauraTick(grp,t,cam){
  const u=grp.userData.faura;u.pts.material.uniforms.uT.value=t;
  u.pts.material.uniforms.uPx.value=renderer.domElement.height/(2*Math.tan(cam.fov*Math.PI/360));
  if(u.kind===2){grp.parent&&grp.parent.updateMatrixWorld();grp.quaternion.copy(cam.quaternion);} // le disque regarde la caméra
}
/* banc (dev) : `dbgFruitAura(kind, t, nom)` — en pause, pose le fruit `nom` (recette FV2/FV3/FV5 de l'atelier, ou un fruit du jeu par son numéro) devant la caisse
   avec son aura et rend UNE image du vrai jeu (bloom compris). `dbgFruitAura(null)` retire tout. Rend l'image en dataURL. */
window.dbgFruitAura=function(kind,t,nom,ang,dist){
  if(window.__fa){scene.remove(window.__fa.g);window.__fa=null;}
  if(kind==null)return 'ok';
  if(started&&!gameOver&&!paused)togglePause();
  const g=new THREE.Group();g.position.copy(carGroup.position).add(new THREE.Vector3(0,3.4,0));
  let geo;try{fruitGeo(0);const pal=Object.assign({},FRUIT_PAL,window.FV2_PAL||{},window.FV3_PAL||{},window.FV4_PAL||{},window.FV5_PAL||{});
    const f=(window.FV5||{})[nom]||(window.FV4||{})[nom]||(window.FV3||{})[nom]||(window.FV2||{})[nom];
    if(typeof nom==='number'){geo=fruitGeo(nom);}else{const K=lpKit(pal);f(K);geo=K.done().f;}}catch(e){return 'ERR '+e.message;}
  const m=new THREE.Mesh(geo,FRUIT_MAT);m.scale.setScalar(kind===0||kind===1||kind===2||kind===3||kind===4?3.1:2.7);g.add(m);
  const a=fauraNew(kind);g.add(a);scene.add(g);window.__fa={g,a,m};
  if(ang==='course'){ // le cadre du jeu : le fruit posé sur la route devant la caisse, vu par la caméra de poursuite telle quelle (à `dist` m)
    camera.getWorldDirection(FAURA_Q.w===1?new THREE.Vector3():new THREE.Vector3());const fw=new THREE.Vector3();camera.getWorldDirection(fw);fw.y=0;fw.normalize();
    g.position.copy(carGroup.position).addScaledVector(fw,dist||26).add(new THREE.Vector3(0,2.2,0));m.scale.setScalar(2.7);
  } else {const aa=ang==null?.35:ang,d=dist||22,p=g.position;
    camera.position.set(p.x+Math.sin(aa)*d,p.y+1.6,p.z+Math.cos(aa)*d);camera.lookAt(p.x,p.y+.6,p.z);camera.updateMatrixWorld();}
  g.updateMatrixWorld(true);fauraTick(a,t||0,camera);
  m.rotation.y=(t||0)*.8;g.updateMatrixWorld(true);
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  return renderer.domElement.toDataURL('image/png');
};
