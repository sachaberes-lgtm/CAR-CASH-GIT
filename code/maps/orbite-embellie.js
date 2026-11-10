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
     un cône autour de l'axe de la caméra reste vide. (2026-11-09, Sacha : « trop de couleur » : les rares grains d'or et de rose sont retirés, la poussière est un blanc froid / neutre.)
   ⚠ Piste IDENTIQUE : aucun tirage dans le `rnd` de la piste. La poussière naît de `mulberry32(0x0C0510F)` ; la Terre de `planetesAlea(2161)`.
   ⚠ Hors orbite : tout est gardé par `uOrb` / `uSpace` (0 ailleurs) — le menu et les autres cartes rendent EXACTEMENT ce qu'ils rendaient.
   Paliers : orbPous [220,420,700] (grains), orbVed [0,1,1] (étoiles-vedettes), orbQ [0,1,1] (l'aube et la coquille d'atmosphère).
   Hooks : `dbgBeau()` (état + réglages à chaud), `dbgBeau('photo',{vid,ved,pous,pl,yaw,pitch,fov})` (UNE image rendue, renvoie le JPEG), `dbgBeau('cout')` (appels/triangles de la poussière). */
PAL.B.orbPous=[220,420,700];PAL.B.orbVed=[0,1,1];PAL.B.orbQ=[0,1,1];
const OBEAU={u:{uOrb:{value:0},uOrbQ:{value:PAL.b('orbQ',1)},uSunO:{value:new THREE.Vector3(-.55,.7,.4).normalize()},uTyp:{value:0}},kPl:1,kSol:.6,sunP:new THREE.Vector3(-.55,.7,.4).normalize(),sunOk:false,t2:new THREE.Vector3(),kPous:1,rate:[],cp:new THREE.Vector3(),vel:new THREE.Vector3(),t1:new THREE.Vector3(),ok:false,
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
    /* (2026-10-31, Sacha : « l'espace est trop bleu, les versions d'hier étaient plus sombres et plus réalistes — Gravity, Soul »)
       LE VIDE REDEVIENT PRESQUE NOIR : un noir quasi pur au zénith (à peine une trace froide), la Terre ne jette plus un voile
       bleu électrique à l'horizon mais une lueur grise très faible — le noir domine, comme un vrai ciel d'orbite. */
    '  vec3 v=mix(vec3(.004,.004,.009),vec3(.006,.007,.013),smoothstep(0.,.72,h));',                        /* zénith quasi noir → un souffle plus clair sur l\'horizon */
    '  float yy=(y-.03)/.30;v+=vec3(.009,.013,.028)*exp(-yy*yy);',                                                 /* le voile de la Terre, au ras de l\'horizon : discret */
    '  v+=vec3(.005,.004,.008)*smoothstep(.55,1.,h)*smoothstep(.0,.3,y);',                                  /* un fond très sombre au-dessus */
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
  /* (2026-11-10, Sacha : « rebosse les shaders pour avoir une lumière vraiment spatiale ») LE SOLEIL DE LA PLANÈTE EST LE SOLEIL DE LA CAISSE. Le globe et sa coquille d'air prenaient un soleil
     « de décor » (au-dessus, derrière l'œil) : la caisse, la route, les satellites et les roches étaient éclairés du côté gauche, la planète d'en haut. `uSunO` (le monde, par image,
     OBEAU.sol : ORB.cle + un peu de la direction planète → œil, pour que le disque ne passe jamais en nuit) remplace ce soleil EN ORBITE SEULEMENT (mélange par uOrb : à 0, au bit près le même),
     et le globe sait quel CORPS il est (`uTyp` : 0 Terre · 1 Mars · 2 Jupiter) :
       · TERRE : l'air épais — terminateur large, couchant ; sa face de NUIT s'allume des LUMIÈRES DES VILLES (sur les terres seulement, en amas) ;
       · MARS  : un air fin à peine — terminateur NET, nuit presque noire, un voile de poussière ocre dans le disque ;
       · JUPITER : une atmosphère de 5 000 km — terminateur doux, nuit chaude et sombre, ASSOMBRISSEMENT DU BORD marqué (le centre brille, le limbe s'éteint).
     Le liseré bleu-blanc et l'aube or-rose du limbe ne sont plus qu'à la Terre : Mars garde son ocre, Jupiter sa crème. */
  gm.onBeforeCompile=function(sh){ob(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;sh.uniforms.uSunO=OBEAU.u.uSunO;sh.uniforms.uTyp=OBEAU.u.uTyp;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vWN9,vWP9,vL9;','varying vec3 vWN9,vWP9,vL9;uniform float uOrb;uniform vec3 uSunO;','globe vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vL9=normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);','vL9=normalize(mix(normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45),uSunO,uOrb));','globe vsoleil');
    let f=orbRempl(sh.fragmentShader,'#include <common>','#include <common>\nuniform float uOrb,uOrbQ,uTyp;float hG9(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}','globe def');
    f=orbRempl(f,'  outgoingLight=c; }',[
      '  if(uOrb>0.){float nv=max(dot(N,V),0.);',
      '    if(uTyp>.5){',                                                                                      /* MARS et JUPITER : leur propre jour et leur propre nuit, à la place de ceux de la Terre */
      '      float jr=uTyp<1.5?smoothstep(-.05,.10,ndl):smoothstep(-.30,.45,ndl);',                           /* net (air fin) · doux (air épais) */
      '      vec3 cn=uTyp<1.5?c0*vec3(.045,.040,.055)+vec3(.002,.002,.004):c0*vec3(.11,.085,.07)+vec3(.003,.002,.002);',
      '      vec3 ct=mix(cn,c0*(uTyp<1.5?1.18:1.06),jr);',
      '      ct+=rim9*pow(1.-nv,3.)*(.08+.26*jr);',                                                           /* la poussière / les nuages vus par la tranche, DANS le disque */
      '      if(uTyp>1.5)ct*=.40+.60*pow(nv,.55);',                                                           /* JUPITER : l\'assombrissement du bord */
      '      c=mix(c,ct,uOrb);}',
      '    else{float lnd=smoothstep(.02,.10,max(c0.g,c0.r)-c0.b),cl=hG9(floor(N*8.)+5.);',                   /* TERRE : des villes sur les terres, en amas, côté nuit */
      '      float vil=step(.88,hG9(floor(N*95.)))*smoothstep(.30,.75,cl)*lnd;',
      '      c+=uOrb*vec3(1.,.72,.36)*vil*(1.-jour)*(1.-jour)*1.05;}',
      '    c*=mix(1.,.46+.54*smoothstep(0.,.85,nv),uOrb);',                                                  /* le VOLUME : l\'air épais assombrit le disque vers le limbe */
      '    float fil=pow(1.-nv,5.),so=smoothstep(-.1,.8,ndl);',
      '    vec3 froid=mix(rim9,vec3(.80,.92,1.),.45*step(uTyp,.5));',
      '    c+=uOrb*fil*froid*(.35+1.15*so);',                                                                /* le fil du limbe : bleu-blanc côté soleil (Terre) */
      '    if(uOrbQ>.5&&uTyp<.5)c+=uOrb*fil*mix(vec3(1.,.58,.30),vec3(1.,.36,.62),.35)*1.05*(1.-smoothstep(0.,.55,abs(ndl-.10)));}', /* l\'AUBE : or sodium → rose, là où le jour finit */
      '  outgoingLight=c; }'].join('\n'),'globe limbe');
    sh.fragmentShader=f;};
  gm.customProgramCacheKey=function(){return 'globeJourNuit5';};
  am.onBeforeCompile=function(sh){oa(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;sh.uniforms.uKh=this.userData.kh;sh.uniforms.uSunO=OBEAU.u.uSunO;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb;uniform vec3 uSunO;','atmo vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vV9a=-mvPosition.xyz;','vV9a=-mvPosition.xyz;vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vS9a=mat3(viewMatrix)*normalize(mix(normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45),uSunO,uOrb));','atmo vsoleil');
    let f=orbRempl(sh.fragmentShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb,uOrbQ,uKh;','atmo fdef');
    f=orbRempl(f,'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));',[
      'float so9=dot(normalize(vN9a),normalize(vS9a));',
      'float ka9=mix(1.,.40+1.0*smoothstep(-.35,.65,so9),uOrb)*mix(1.,.55,uKh*uOrb);',                                           /* la coquille brille côté soleil */
      'vec3 dc9=mix(diffuse,mix(diffuse,vec3(1.,.55,.30),.55),uOrb*uOrbQ*(1.-smoothstep(0.,.42,abs(so9-.05))));', /* … et prend l\'aube au terminateur */
      'float pf9=smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9));pf9=mix(pf9,mix(.4545,pf9,uOrb),uKh);',  /* le halo (uKh=1) garde son aplat hors orbite, prend le dégradé en orbite */
      'vec4 diffuseColor=vec4(dc9,opacity*2.2*pf9*ka9);'].join('\n'),'atmo corps');
    sh.fragmentShader=f;};
  am.customProgramCacheKey=function(){return 'atmoDegrade3';};
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
      '  vec3 c=k<.70?vec3(.70,.78,.96):vec3(.94,.93,.90);',                                                  /* (2026-11-09, Sacha : « trop de couleur ») de la poussière GRISE : un blanc froid, un blanc neutre — plus de grains d\'or ni de rose */
      '  vC=c*(.45+.95*aS.x*aS.x)*uOp*cone*fade*tw*(1.-.75*aE);',                                             /* la tête brille, la queue s\'éteint */
      '  gl_Position=projectionMatrix*vec4(mat3(viewMatrix)*q,1.);}'].join('\n'),
    fragmentShader:'varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}'});
  const o=new THREE.LineSegments(g,m);o.frustumCulled=false;o.visible=false;o.renderOrder=3;scene.add(o);return o;})();
function orbBeau(t,dt9,vr){ /* chaque image, depuis orbiteTick : l'intensité du niveau, la vitesse de la caméra — zéro allocation */
  const e=Math.min(1,LVL.espace),u=POUS.material.uniforms,on=vr&&e>.01;
  OBEAU.u.uOrb.value=e*OBEAU.kPl;OBEAU.u.uTyp.value=planetGroup.userData.typ|0;
  if(e>.001){OBEAU.t2.copy(ORB.cle).addScaledVector(OBEAU.t1.subVectors(camera.position,planetGroup.position).normalize(),OBEAU.kSol).normalize(); /* le soleil de la planète = celui de la caisse (voir plus haut)… */
    if(!OBEAU.sunOk){OBEAU.sunP.copy(OBEAU.t2);OBEAU.sunOk=true;}else OBEAU.sunP.lerp(OBEAU.t2,Math.min(1,dt9*.25)).normalize(); /* … mais LISSÉ (4 s) : le terminateur ne glisse plus à chaque virage (2026-11-10) */
    OBEAU.u.uSunO.value.copy(OBEAU.sunP);}else OBEAU.sunOk=false;
  POUS.visible=on;if(!on){OBEAU.ok=false;return;}
  const cp=camera.position;
  if(OBEAU.ok&&dt9>1e-4){OBEAU.t1.subVectors(cp,OBEAU.cp).multiplyScalar(1/dt9);if(OBEAU.t1.lengthSq()>22500)OBEAU.t1.setLength(150);OBEAU.vel.lerp(OBEAU.t1,Math.min(1,dt9*8));}
  OBEAU.cp.copy(cp);OBEAU.ok=true;
  u.uCam.value.set(cp.x-Math.floor(cp.x/128)*128,cp.y-Math.floor(cp.y/128)*128,cp.z-Math.floor(cp.z/128)*128);u.uVel.value.copy(OBEAU.vel);u.uT.value=t%1024;u.uOp.value=e*OBEAU.kPous;}
/* (2026-11-10, Sacha : « rebosse les shaders pour avoir une lumière vraiment spatiale ») LES LUMIÈRES DE LA SCÈNE EN ORBITE. Dans le vide il n'y a pas de ciel qui éclaire : un SOLEIL dur,
   et pour tout le reste la lueur de la planète. Les trois ambiances de l'orbite (Terre, Mars, Jupiter) avaient un hémisphère à 0,4 qui remplissait la route d'un voile uniforme (la dalle
   sortait d'un violet plat, sans côté soleil ni côté ombre). L'hémisphère est ramené de moitié, le remplissage d'un sixième, le soleil monte d'un sixième : l'ombre se creuse, le flanc
   éclairé de la caisse et de la dalle ressort, la couleur de l'ombre reste celle de la planète (hemiG, fillC). Posé APRÈS l'équilibre des maps (qui a fixé `lum`), une seule fois. */
{const FAIT9=new Set();for(const k of ['espaceMatin','espace','espaceSoir'])if(BIOMES[k]&&!FAIT9.has(BIOMES[k])){const b=BIOMES[k];FAIT9.add(b);
  if(typeof b.hemiI==='number')b.hemiI=+(b.hemiI*.5).toFixed(3);if(typeof b.fillI==='number')b.fillI=+(b.fillI*.85).toFixed(3);if(typeof b.sunI==='number')b.sunI=+(b.sunI*1.17).toFixed(3);}}
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
