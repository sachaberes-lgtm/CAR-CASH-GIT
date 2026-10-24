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
    '  vec3 v=mix(vec3(.020,.014,.070),vec3(.018,.030,.112),smoothstep(0.,.72,h));',                        /* zénith indigo-violet → bleu nuit */
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
  am.onBeforeCompile=function(sh){oa(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;','atmo vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vV9a=-mvPosition.xyz;','vV9a=-mvPosition.xyz;vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vS9a=mat3(viewMatrix)*normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);','atmo vsoleil');
    let f=orbRempl(sh.fragmentShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb,uOrbQ;','atmo fdef');
    f=orbRempl(f,'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));',[
      'float so9=dot(normalize(vN9a),normalize(vS9a));',
      'float ka9=mix(1.,.40+1.0*smoothstep(-.35,.65,so9),uOrb);',                                           /* la coquille brille côté soleil */
      'vec3 dc9=mix(diffuse,mix(diffuse,vec3(1.,.55,.30),.55),uOrb*uOrbQ*(1.-smoothstep(0.,.42,abs(so9-.05))));', /* … et prend l\'aube au terminateur */
      'vec4 diffuseColor=vec4(dc9,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9))*ka9);'].join('\n'),'atmo corps');
    sh.fragmentShader=f;};
  am.customProgramCacheKey=function(){return 'atmoDegrade2';};
})();
/* LA TERRE REPEINTE — la même toile 1024 × 512 (peinte UNE fois, au portail), des continents vrais zonés par la latitude. Pas de nuages (Sacha les a retirés de l'espace) :
   la Terre reste nette ; la profondeur vient des océans, des plateaux et du relief. */
function orbTerre(x,W,H){
  const R=planetesAlea(2161),rd=function(a,b){return a+R()*(b-a);},px=function(lo){return (lo+180)/360*W;},py=function(la){return (90-la)/180*H;};
  const oc=x.createLinearGradient(0,0,0,H);
  oc.addColorStop(0,'#08224f');oc.addColorStop(.2,'#0c4592');oc.addColorStop(.5,'#1a7fd8');oc.addColorStop(.8,'#0c4592');oc.addColorStop(1,'#08224f');
  x.fillStyle=oc;x.fillRect(0,0,W,H);
  const tache=function(cx,cy,rx,ry,rot,col,a){for(let k=-1;k<=1;k++){const X=cx+k*W;if(X+rx<0||X-rx>W)continue;
    x.save();x.translate(X,cy);x.rotate(rot);x.scale(1,ry/rx);const gr=x.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba('+col+','+a+')');gr.addColorStop(.6,'rgba('+col+','+(a*.6)+')');gr.addColorStop(1,'rgba('+col+',0)');
    x.fillStyle=gr;x.beginPath();x.arc(0,0,rx,0,6.2832);x.fill();x.restore();}};
  for(let i=0;i<34;i++)tache(rd(0,W),rd(40,H-40),rd(60,170),rd(24,64),rd(-.5,.5),R()<.5?'5,28,76':'46,160,236',rd(.14,.28)); /* les grands courants : plus sombre, plus clair */
  const terres=[]; /* [x, y, rayon, couleur] */
  const zone=function(la){const a=Math.abs(la);if(a>74)return '#eef6ff';if(a<12)return R()<.8?'#1f7d3e':'#4c9a42';if(a<33)return R()<.62?'#d8b36b':'#7e9f48';if(a<56)return R()<.8?'#4c9a42':'#6c9a4a';return R()<.7?'#2f7058':'#3b7a52';};
  const echine=function(pts,r0,r1,pas,col){for(let s=0;s<pts.length-1;s++){const a=pts[s],b=pts[s+1],n=Math.max(2,Math.round(Math.hypot((b[0]-a[0])/360*W,(b[1]-a[1])/180*H)/pas));
    for(let i=0;i<=n;i++){const t=(s+i/n)/(pts.length-1),k=i/n,lo=a[0]+(b[0]-a[0])*k,la=a[1]+(b[1]-a[1])*k,r=(r0+(r1-r0)*t)*rd(.7,1.15);
      terres.push([px(lo)+rd(-1,1)*r*.5,py(la)+rd(-1,1)*r*.5,r,col||zone(la+rd(-4,4))]);}}};
  echine([[-165,62],[-140,62],[-120,58],[-100,55],[-85,50],[-68,47]],20,17,9);echine([[-125,48],[-105,42],[-90,37],[-78,33]],24,20,9);echine([[-108,30],[-100,22],[-90,16],[-80,9]],13,7,7);   /* Amérique du Nord */
  echine([[-52,68],[-42,76],[-30,72],[-40,63]],14,12,7,'#eef6ff');                                                                                                                              /* Groenland */
  echine([[-80,2],[-72,-6],[-60,-5],[-52,-10],[-48,-19],[-58,-31],[-66,-42],[-70,-54]],22,8,8);echine([[-72,9],[-62,8],[-54,3]],12,10,7);                                                /* Amérique du Sud */
  echine([[-10,38],[0,44],[10,48],[22,54],[35,57],[46,62]],13,12,7);echine([[8,58],[15,64],[22,68]],7,6,5);echine([[-6,52],[-3,57]],5,5,4);                                                    /* Europe */
  echine([[-10,28],[10,22],[28,16],[36,2],[28,-12],[24,-30]],32,15,8);echine([[-12,14],[0,8],[10,4]],18,16,7);echine([[42,8],[50,10]],7,6,5);echine([[47,-14],[49,-24]],5,5,4);          /* Afrique */
  echine([[40,58],[70,58],[100,60],[130,60],[160,64]],21,18,9);echine([[45,42],[70,40],[95,38],[115,36],[125,42]],21,17,9);echine([[74,26],[78,16],[80,10]],11,6,6);echine([[38,28],[48,24],[56,20]],13,11,7);
  echine([[98,18],[104,10],[102,2]],7,6,5);echine([[105,30],[118,28],[122,36]],13,11,7);echine([[130,32],[138,36],[142,42]],5,5,4);echine([[96,2],[106,-4],[116,-3],[126,-3],[135,-4]],6,5,4);   /* Asie */
  echine([[115,-24],[125,-22],[135,-20],[148,-22],[152,-30],[145,-38],[132,-33],[118,-34]],18,16,8);echine([[172,-38],[174,-44]],4,4,4);                                                   /* Océanie */
  const L=document.createElement('canvas');L.width=W;L.height=H;const l=L.getContext('2d');
  for(const t of terres)for(const ox of [-W,0,W]){const X=t[0]+ox;if(X+t[2]*1.7<0||X-t[2]*1.7>W)continue;x.fillStyle='rgba(70,214,228,.17)';x.beginPath();x.arc(X,t[1],t[2]*1.55,0,6.2832);x.fill();} /* les plateaux : un turquoise le long des côtes */
  for(const t of terres)for(const ox of [-W,0,W]){const X=t[0]+ox;if(X+t[2]<0||X-t[2]>W)continue;l.fillStyle=t[3];l.beginPath();l.arc(X,t[1],t[2],0,6.2832);l.fill();}
  l.globalCompositeOperation='source-atop'; /* tout ce qui suit ne se pose QUE sur la terre */
  const chaine=function(pts,col,w,a){l.strokeStyle=col;l.lineWidth=w;l.globalAlpha=a;l.lineCap='round';l.beginPath();for(let i=0;i<pts.length;i++){const X=px(pts[i][0]),Y=py(pts[i][1])+Math.sin(i*2.1)*2;if(i)l.lineTo(X,Y);else l.moveTo(X,Y);}l.stroke();l.globalAlpha=1;};
  for(const m of [[[-118,56],[-112,46],[-107,36],[-104,30]],[[-72,6],[-74,-8],[-70,-24],[-71,-42]],[[68,37],[78,34],[88,29],[98,28]],[[4,45],[10,47],[17,47]],[[-8,32],[0,34],[10,35]],[[30,44],[40,42],[48,38]]]){
    chaine(m,'#8a7556',6,.62);chaine(m,'#f4f8fc',2,.55);} /* les chaînes : un dos brun, une crête de neige */
  for(let i=0;i<520;i++){l.fillStyle=R()<.5?'rgba(20,50,30,.17)':'rgba(240,226,170,.13)';const s=1.5+R()*3.5;l.fillRect(rd(0,W),rd(0,H),s,s);} /* le grain du relief */
  l.globalCompositeOperation='source-over';
  x.drawImage(L,0,0);toileRend(L);
  x.fillStyle='rgba(238,248,255,.96)';for(const haut of [1,0]){const y0=haut?0:H;for(let i=0;i<40;i++){x.beginPath();x.arc(rd(0,W),y0+(haut?1:-1)*rd(0,10),rd(8,22),0,6.2832);x.fill();}x.fillRect(0,haut?0:H-12,W,12);} /* les calottes */
}
PLANETES_PEINTRES.terre2=orbTerre;
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
      '  vec3 q=rel+aE*(uVel*.034+vec3(0.,.12,0.));',                                                          /* la traînée : où le grain était il y a 34 ms (et un minimum : un point reste un trait) */
      '  vec3 v=mat3(viewMatrix)*rel;float fw=max(-v.z,.001);',
      '  float cone=v.z<0.?smoothstep(.42,.80,length(v.xy)/fw):1.;',                                           /* le COULOIR de jeu reste vide : un cône autour de l\'axe de la caméra */
      '  float fade=1.-smoothstep(.62,1.,max(max(abs(rel.x),abs(rel.y)),abs(rel.z))/B);',
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
