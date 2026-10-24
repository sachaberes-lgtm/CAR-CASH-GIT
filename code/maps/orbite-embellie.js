/* ===== L'ORBITE EMBELLIE (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures, améliorer les lumières ») =====
   Sacha avait déjà fait de l'orbite un lieu (la lune au visage de troll, les Starlink, le soleil dur) ; il restait un VIDE : un noir mort derrière une Terre un peu
   « dessin animé », sans rien qui défile. Cinq touches, aucune lumière dynamique, aucune passe, UN seul programme de shader neuf (la poussière) :
   · LE FOND DU VIDE (pilier 1, la profondeur) : le ciel d'orbite n'est plus un noir mort mais une nuit bleue-violette (`orbVide`) — indigo au zénith, un voile bleu de Terre
     qui monte de l'horizon : le plan lointain est plus clair et plus froid, il SÉPARE la planète du noir. Un nombre dans le shader du ciel (zéro texture, zéro appel).
   · LES ÉTOILES-VEDETTES (pilier 3 + 5) : en plus du semis fin, quelques grosses étoiles à quatre pointes, de deux tailles et de deux températures (bleu-blanc,
     blanc chaud) ; une sur sept, l'éclat CASH : or ou rose. Même passe nette que les autres étoiles (`cielVedettes`).
   · LA PLANÈTE (pilier 2 + 3) : le globe prenait le soleil mais restait un disque plat. Il s'assombrit maintenant vers le limbe (du volume), le limbe s'allume en deux
     températures — le bleu-blanc de l'air côté soleil, l'AUBE or-rose là où le jour finit — et la coquille d'atmosphère suit le même soleil. La Terre est REPEINTE (`orbTerre` :
     océans profonds, plateaux turquoise le long des côtes, vrais continents zonés par la latitude, chaînes de montagnes) : la même toile 1024 × 512, peinte une fois au
     portail. Mars et Jupiter gardent leurs peintures et gagnent le volume et le limbe.
   · LA POUSSIÈRE COSMIQUE (pilier 4 + 5) : des grains de glace qui FILENT autour de la caméra (un seul `LineSegments`, tout dans le vertex shader : la boîte de poussière
     est enroulée autour de la caméra, la traînée s'étire avec la vitesse) — c'est ce qui dit la vitesse dans un décor qui ne défile pas. Jamais dans le couloir de jeu :
     un cône autour de l'axe de la caméra reste vide. De temps en temps un grain d'or ou de rose (le clin d'œil CASH).
   ⚠ Piste IDENTIQUE : aucun tirage dans le `rnd` de la piste. La poussière naît de `mulberry32(0x0C0510F)` ; la Terre de `planetesAlea(2161)`.
   ⚠ Hors orbite : tout est gardé par `uOrb` / `uSpace` (0 ailleurs) — le menu et les autres cartes rendent EXACTEMENT ce qu'ils rendaient.
   Paliers : orbPous [220,420,700] (grains), orbVed [0,1,1] (étoiles-vedettes), orbQ [0,1,1] (l'aube et la coquille d'atmosphère).
   Hooks : `dbgBeau()` (état + réglages à chaud), `dbgBeau('photo',{vid,ved,pous,pl,yaw,pitch,fov})` (UNE image rendue, renvoie le JPEG), `dbgBeau('cout')` (appels/triangles de la poussière). */
PAL.B.orbPous=[220,420,700];PAL.B.orbVed=[0,1,1];PAL.B.orbQ=[0,1,1];
const OBEAU={u:{uOrb:{value:0},uOrbQ:{value:PAL.b('orbQ',1)}},kPl:1,kPous:1,rate:[],cp:new THREE.Vector3(),vel:new THREE.Vector3(),t1:new THREE.Vector3(),ok:false,
  q:new THREE.Quaternion(),fov:0};
function orbRempl(src,cherche,par,qui){ /* remplace TOUTES les occurrences ; si le texte cherché a bougé (un autre morceau l'a réécrit), on le note : l'effet manque, rien ne casse */
  if(src.indexOf(cherche)<0){OBEAU.rate.push(qui);return src;}
  return src.split(cherche).join(par);}
/* ---- LE CIEL : le fond du vide et les étoiles-vedettes (les matériaux du dôme sont patchés AVANT leur 1re compilation) ---- */
skyU.uVid={value:1};skyU.uVed={value:PAL.b('orbVed',1)};
(function(){
  const C=skyDome.userData.ciel;
  const FOND=['uniform float uVid;',
    'vec3 orbVide(float y){',
    '  float h=1.-clamp(abs(y),0.,1.);',                                                                    /* 1 à l'horizon, 0 au zénith */
    '  vec3 v=mix(vec3(.014,.009,.046),vec3(.010,.018,.066),smoothstep(0.,.72,h));',                        /* zénith indigo-violet → bleu nuit */
    '  float yy=(y-.03)/.30;v+=vec3(.024,.062,.210)*exp(-yy*yy);',                                                 /* le voile bleu de la Terre, au ras de l\'horizon */
    '  v+=vec3(.020,.008,.040)*smoothstep(.55,1.,h)*smoothstep(.0,.3,y);',                                  /* un fond de lilas au-dessus */
    '  return v*uVid;}'].join('\n');
  const VED=['uniform float uVed;',
    'void cielVedettes(inout vec3 col,float y,float az){',
    '  vec2 sg=vec2(az*4.19,y*9.2),sid=floor(sg),sfr=fract(sg);',                                           /* cellules de ~14° × 6° : une étoile sur cinq en porte une */
    '  float h=hash21(sid+17.3);if(h<.80)return;',
    '  float k=fract(h*47.31),k2=fract(h*13.77);',
    '  vec2 stp=vec2(fract(h*91.7),fract(h*57.3))*.5+.25;',
    '  vec2 d=vec2((sfr.x-stp.x)/4.19*sqrt(max(0.,1.-y*y)),(sfr.y-stp.y)/9.2);',                            /* la distance en ANGLE (des étoiles rondes) */
    '  float r=length(d),s=.0016+.0016*k2,ax=abs(d.x),ay=abs(d.y),lg=.009+.011*k2;',
    '  float tw=.80+.20*sin(uTime*(1.1+k*2.3)+h*60.);',
    '  float cr=exp(-ay/.0011)*exp(-ax/lg)+exp(-ax/.0011)*exp(-ay/lg);',                                    /* les quatre pointes */
    '  float no=exp(-r*r/(s*s))*1.2+exp(-r*r/(s*s*14.))*.20;',                                              /* le noyau et son halo */
    '  vec3 c=k<.55?vec3(.74,.84,1.):(k<.86?vec3(1.,.90,.74):(fract(h*5.9)<.5?vec3(1.,.80,.38):vec3(1.,.42,.74)));', /* bleu-blanc · blanc chaud · l\'éclat CASH : or ou rose */
    '  col+=c*(no+cr*.62)*tw*uVed*uSpace*uNeb;}'].join('\n');
  for(const nom of ['plein','basN','netN']){const m=C[nom];if(!m)continue;let f=m.fragmentShader;
    if(nom!=='netN'){f=orbRempl(f,'vec3 cielFond(float y){',FOND+'\nvec3 cielFond(float y){','vide def '+nom);
      f=orbRempl(f,'col=mix(col,vec3(0.),uSpace);','col=mix(col,orbVide(y),uSpace);','vide '+nom);}
    if(nom!=='basN'){f=orbRempl(f,'void main(){',VED+'\nvoid main(){','vedettes def '+nom);
      f=orbRempl(f,'cielPoussiere(col,y,atan(vDir.x,-vDir.z));','cielPoussiere(col,y,atan(vDir.x,-vDir.z));if(uVed>.001&&uSpace>.001)cielVedettes(col,y,atan(vDir.x,-vDir.z));','vedettes appel '+nom);}
    m.fragmentShader=f;}
})();
/* ---- LA PLANÈTE : le volume, le limbe en deux températures, l'atmosphère qui suit le soleil ---- */
(function(){
  const g=planetGroup.userData,gm=g.globe.material,am=g.atmo.material,ob=gm.onBeforeCompile,oa=am.onBeforeCompile;
  gm.onBeforeCompile=function(sh){ob(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;
    let f=orbRempl(sh.fragmentShader,'#include <common>','#include <common>\nuniform float uOrb,uOrbQ;','globe def');
    f=orbRempl(f,'  outgoingLight=c; }',[
      '  if(uOrb>0.){float nv=max(dot(N,V),0.);',
      '    c*=mix(1.,.46+.54*smoothstep(0.,.85,nv),uOrb);',                                                  /* le VOLUME : l\'air épais assombrit le disque vers le limbe */
      '    float fil=pow(1.-nv,5.),so=smoothstep(-.1,.8,ndl);',
      '    vec3 froid=mix(rim9,vec3(.80,.92,1.),.45);',
      '    c+=uOrb*fil*froid*(.35+1.15*so);',                                                                /* le fil du limbe : bleu-blanc côté soleil */
      '    if(uOrbQ>.5)c+=uOrb*fil*mix(vec3(1.,.58,.30),vec3(1.,.36,.62),.35)*1.05*(1.-smoothstep(0.,.55,abs(ndl-.10)));}', /* l\'AUBE : or sodium → rose, là où le jour finit */
      '  outgoingLight=c; }'].join('\n'),'globe limbe');
    sh.fragmentShader=f;};
  gm.customProgramCacheKey=function(){return 'globeJourNuit4';};
  am.onBeforeCompile=function(sh){oa(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;sh.uniforms.uKh=this.userData.kh;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;','atmo vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vV9a=-mvPosition.xyz;','vV9a=-mvPosition.xyz;vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vS9a=mat3(viewMatrix)*normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);','atmo vsoleil');
    let f=orbRempl(sh.fragmentShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb,uOrbQ,uKh;','atmo fdef');
    f=orbRempl(f,'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));',[
      'float so9=dot(normalize(vN9a),normalize(vS9a));',
      'float ka9=mix(1.,.40+1.0*smoothstep(-.35,.65,so9),uOrb)*mix(1.,.55,uKh*uOrb);',                                           /* la coquille brille côté soleil */
      'vec3 dc9=mix(diffuse,mix(diffuse,vec3(1.,.55,.30),.55),uOrb*uOrbQ*(1.-smoothstep(0.,.42,abs(so9-.05))));', /* … et prend l\'aube au terminateur */
      'float pf9=smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9));pf9=mix(pf9,mix(.4545,pf9,uOrb),uKh);',  /* le halo (uKh=1) garde son aplat hors orbite, prend le dégradé en orbite */
      'vec4 diffuseColor=vec4(dc9,opacity*2.2*pf9*ka9);'].join('\n'),'atmo corps');
    sh.fragmentShader=f;};
  am.customProgramCacheKey=function(){return 'atmoDegrade2';};
  am.userData.kh={value:0};const hm=g.halo.material;hm.userData.kh={value:1};hm.onBeforeCompile=am.onBeforeCompile;hm.customProgramCacheKey=am.customProgramCacheKey; /* le HALO (2e coquille, à bord dur) reprend le profil en dégradé, en orbite seulement */
})();
/* (2026-10-24, Sacha) LA TERRE REPEINTE (orbTerre) est retirée : l'orbite reprend la Terre d'avant (celle du menu). */
/* ---- LA POUSSIÈRE COSMIQUE : des grains qui filent autour de la caméra (un LineSegments, tout dans le vertex shader) ---- */
const POUS=(function(){
  const N=PAL.b('orbPous',700),r=mulberry32(0x0C0510F),P=new Float32Array(N*6),E=new Float32Array(N*2),S=new Float32Array(N*8);
  for(let i=0;i<N;i++){const a=r(),b=r(),c=r(),s0=r(),s1=r(),s2=r(),s3=r();
    for(let k=0;k<2;k++){const j=i*2+k;P[j*3]=a;P[j*3+1]=b;P[j*3+2]=c;E[j]=k;S[j*4]=s0;S[j*4+1]=s1;S[j*4+2]=s2;S[j*4+3]=s3;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aE',new THREE.BufferAttribute(E,1));g.setAttribute('aS',new THREE.BufferAttribute(S,4));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:false,
    uniforms:{uCam:{value:new THREE.Vector3()},uVel:{value:new THREE.Vector3()},uT:{value:0},uOp:{value:0}},
    vertexShader:['attribute float aE;attribute vec4 aS;uniform vec3 uCam,uVel;uniform float uT,uOp;varying vec3 vC;',
      'void main(){const float B=64.;',
      '  vec3 p0=position*(2.*B)+(aS.xyz-.5)*uT*1.6;',
      '  vec3 rel=mod(p0-uCam,2.*B)-B;',                                                                       /* la boîte enroulée autour de la caméra : un grain qui sort d\'un côté rentre de l\'autre */
      '  vec3 q=rel+aE*(uVel*.028+vec3(0.,.12,0.));',                                                          /* la traînée : où le grain était il y a 34 ms (et un minimum : un point reste un trait) */
      '  vec3 v=mat3(viewMatrix)*rel;float fw=max(-v.z,.001);',
      '  float cone=v.z<0.?smoothstep(.42,.80,length(v.xy)/fw):1.;',                                           /* le COULOIR de jeu reste vide : un cône autour de l\'axe de la caméra */
      '  float fade=(1.-smoothstep(.62,1.,max(max(abs(rel.x),abs(rel.y)),abs(rel.z))/B))*smoothstep(5.,16.,fw);',  /* un grain qui frôle la caméra s\'éteint : pas de long trait blanc en travers de l\'écran */
      '  float tw=.62+.38*sin(uT*(1.4+aS.y*3.)+aS.z*40.),k=aS.w;',
      '  vec3 c=k<.62?vec3(.56,.70,1.):(k<.90?vec3(1.,.88,.68):(fract(aS.x*7.3)<.5?vec3(1.,.82,.34):vec3(1.,.38,.70)));', /* glace bleue · glace chaude · un grain d\'OR ou de ROSE, rare */
      '  vC=c*(.45+.95*aS.x*aS.x)*uOp*cone*fade*tw*(1.-.75*aE);',                                             /* la tête brille, la queue s\'éteint */
      '  gl_Position=projectionMatrix*vec4(mat3(viewMatrix)*q,1.);}'].join('\n'),
    fragmentShader:'varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}'});
  const o=new THREE.LineSegments(g,m);o.frustumCulled=false;o.visible=false;o.renderOrder=3;scene.add(o);return o;})();
function orbBeau(t,dt9,vr){ /* chaque image, depuis orbiteTick : l'intensité du niveau, la vitesse de la caméra — zéro allocation */
  const e=Math.min(1,LVL.espace),u=POUS.material.uniforms,on=vr&&e>.01;
  OBEAU.u.uOrb.value=e*OBEAU.kPl;
  POUS.visible=on;if(!on){OBEAU.ok=false;return;}
  const cp=camera.position;
  if(OBEAU.ok&&dt9>1e-4){OBEAU.t1.subVectors(cp,OBEAU.cp).multiplyScalar(1/dt9);if(OBEAU.t1.lengthSq()>22500)OBEAU.t1.setLength(150);OBEAU.vel.lerp(OBEAU.t1,Math.min(1,dt9*8));}
  OBEAU.cp.copy(cp);OBEAU.ok=true;
  u.uCam.value.set(cp.x-Math.floor(cp.x/128)*128,cp.y-Math.floor(cp.y/128)*128,cp.z-Math.floor(cp.z/128)*128);u.uVel.value.copy(OBEAU.vel);u.uT.value=t%1024;u.uOp.value=e*OBEAU.kPous;}
window.dbgBeau=function(k,o){o=o||{};
  if(o.vid!=null)skyU.uVid.value=+o.vid;if(o.ved!=null)skyU.uVed.value=+o.ved;if(o.pous!=null)OBEAU.kPous=+o.pous;if(o.pl!=null)OBEAU.kPl=+o.pl;
  if(k==='cout'){const r=renderer.info,m=function(){r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true;return [r.render.calls,r.render.triangles];};
    const a=m(),v=POUS.visible;POUS.visible=false;const s=m();POUS.visible=v;return {appels:a[0]-s[0],triangles:a[1]-s[1],grains:POUS.geometry.attributes.aE.count/2};}
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();
    OBEAU.q.copy(camera.quaternion);OBEAU.fov=camera.fov;
    if(o.yaw)camera.rotateOnWorldAxis(ORB.haut,+o.yaw*Math.PI/180);if(o.pitch)camera.rotateX(+o.pitch*Math.PI/180);
    if(o.planete)camera.lookAt(planetGroup.position);
    if(o.fov){camera.fov=+o.fov;camera.updateProjectionMatrix();}
    orbiteTick(skyU.uTime.value);camera.updateMatrixWorld();if(acesPass)acesPass.uniforms.uSpeed.value=0;
    if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    const url=renderer.domElement.toDataURL('image/jpeg',.9);
    camera.quaternion.copy(OBEAU.q);camera.fov=OBEAU.fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();return url;}
  return {vid:skyU.uVid.value,ved:skyU.uVed.value,pous:OBEAU.kPous,pl:OBEAU.kPl,grains:POUS.geometry.attributes.aE.count/2,visible:POUS.visible,patchsRates:OBEAU.rate.slice(),vel:OBEAU.vel.toArray().map(function(v){return +v.toFixed(1);}),peint:planetGroup.userData.peint};};
