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
   (2026-11-12, L'ORBITE FAÇON GRAVITY) les ÉTOILES-VEDETTES et la POUSSIÈRE COSMIQUE sont RETIRÉES, Mars et Jupiter aussi (plus de `uTyp`) ; la Terre est recomposée (nuit noire, villes,
   nuages, fil d'air fin : voir le patch du globe). Paliers : orbQ [0,1,1] (l'aube, la 3e octave des nuages ; les nuages à 60 % au palier 0).
   Hooks : `dbgBeau()` (état + réglages à chaud : vid, pl, nua), `dbgBeau('photo',{vid,pl,nua,yaw,pitch,fov,planete})` (UNE image rendue, renvoie le JPEG). */
PAL.B.orbQ=[0,1,1]; /* (2026-11-12, L'ORBITE FAÇON GRAVITY) les étoiles-vedettes et la poussière cosmique sont retirées : voir plus bas */
const OBEAU={u:{uOrb:{value:0},uOrbQ:{value:PAL.b('orbQ',1)},uSunO:{value:new THREE.Vector3(-.55,.7,.4).normalize()},uNua:{value:PAL.b('orbQ',1)?1:.6}},kPl:1,kSol:.6,sunP:new THREE.Vector3(-.55,.7,.4).normalize(),sunOk:false,t2:new THREE.Vector3(),kPous:1,rate:[],cp:new THREE.Vector3(),vel:new THREE.Vector3(),t1:new THREE.Vector3(),ok:false,
  q:new THREE.Quaternion(),fov:0};
function orbRempl(src,cherche,par,qui){ /* remplace TOUTES les occurrences ; si le texte cherché a bougé (un autre morceau l'a réécrit), on le note : l'effet manque, rien ne casse */
  if(src.indexOf(cherche)<0){OBEAU.rate.push(qui);return src;}
  return src.split(cherche).join(par);}
/* ---- LE CIEL : le fond du vide et les étoiles-vedettes (les matériaux du dôme sont patchés AVANT leur 1re compilation) ---- */
skyU.uVid={value:1};
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
  for(const nom of ['plein','basN','netN']){const m=C[nom];if(!m)continue;let f=m.fragmentShader;
    if(nom!=='netN'){f=orbRempl(f,'vec3 cielFond(float y){',FOND+'\nvec3 cielFond(float y){','vide def '+nom);
      f=orbRempl(f,'col=mix(col,vec3(0.),uSpace);','col=mix(col,orbVide(y),uSpace);','vide '+nom);}
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
  gm.onBeforeCompile=function(sh){ob(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;sh.uniforms.uSunO=OBEAU.u.uSunO;sh.uniforms.uNua=OBEAU.u.uNua;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vWN9,vWP9,vL9;','varying vec3 vWN9,vWP9,vL9,vON9;uniform float uOrb;uniform vec3 uSunO;','globe vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vWN9=normalize(mat3(modelMatrix)*normal);','vWN9=normalize(mat3(modelMatrix)*normal);vON9=normal;','globe vobjet');
    sh.vertexShader=orbRempl(sh.vertexShader,'vL9=normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);','vL9=normalize(mix(normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45),uSunO,uOrb));','globe vsoleil');
    let f=orbRempl(sh.fragmentShader,'#include <common>','#include <common>\nvarying vec3 vON9;uniform float uOrb,uOrbQ,uNua;float hG9(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}'+
      'float nG9(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hG9(i),hG9(i+vec3(1.,0.,0.)),f.x),mix(hG9(i+vec3(0.,1.,0.)),hG9(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(hG9(i+vec3(0.,0.,1.)),hG9(i+vec3(1.,0.,1.)),f.x),mix(hG9(i+vec3(0.,1.,1.)),hG9(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}','globe def');
    f=orbRempl(f,'  outgoingLight=c; }',[
      '  if(uOrb>0.){float nv=max(dot(N,V),0.);',
      /* (2026-11-12, L'ORBITE FAÇON GRAVITY) LA TERRE VUE DE L'ORBITE BASSE, recomposée en orbite seulement (uOrb ; hors orbite le globe du menu, au bit près) :
         un terminateur NET (l'air ne fait que 100 km), une NUIT presque noire où les villes s'allument, des SYSTÈMES NUAGEUX (bruit 3D sur la sphère, ils tournent avec elle,
         plus denses aux latitudes moyennes, leur ombre posée à côté vers le soleil), le soleil qui brille sur la mer, l'assombrissement du bord, un fil d'air bleu-cyan FIN côté soleil,
         et la frange orangée du terminateur. Aucune texture de plus : le bruit est calculé au fragment, 3 octaves + un gauchissement (2 sur les paliers bas). */
      '    float jr=smoothstep(-.06,.14,ndl);vec3 on=normalize(vON9),q9=on*4.2;',
      '    q9+=(nG9(q9*.9+11.)-.5)*vec3(1.5,-1.1,1.3);',
      '    float cn=nG9(q9)*.50+nG9(q9*2.3+7.1)*.30+(uOrbQ>.5?nG9(q9*5.6+3.3)*.20:.10);',
      '    float la=abs(on.y),bande=.55+.45*smoothstep(.12,.42,la)-.25*smoothstep(.80,.97,la);',
      '    float nua=smoothstep(.53,.64,cn*bande+.06)*uNua;',
      '    float omb=smoothstep(.50,.66,(nG9(q9+vec3(.05,.03,.04))*.82)*bande+.06)*uNua;',
      '    float lnd=smoothstep(.02,.10,max(c0.g,c0.r)-c0.b),cl=hG9(floor(N*8.)+5.);',
      '    float vil=0.;if(jr<.97)vil=smoothstep(.60,.80,nG9(on*36.)*.6+nG9(on*85.+5.)*.4)*smoothstep(.50,.90,nG9(on*460.))*lnd;',
      '    float lu=dot(c0,vec3(.30,.59,.11));vec3 cj=mix(vec3(lu),c0,.40)*vec3(.80,.86,.94);',
      '    cj=mix(cj,vec3(.010,.030,.075)+lu*vec3(.05,.10,.17),(1.-lnd)*.88);',
      '    cj*=1.-.32*omb*(1.-nua);',
      '    cj=mix(cj,vec3(.70,.73,.78),nua*.92);',
      '    vec3 cnu=c0*vec3(.020,.024,.045)+vec3(.0004,.0006,.0018);',
      '    cnu=mix(cnu,vec3(.012,.014,.022),nua*.7)+vec3(1.,.70,.34)*vil*(1.-nua*.8)*.85;',
      '    vec3 ct=mix(cnu,cj,jr);',
      '    ct+=vec3(1.,.42,.16)*.20*(1.-smoothstep(0.,.12,abs(ndl-.01)))*(1.-.5*nua);',
      '    ct+=vec3(1.,.92,.80)*pow(max(dot(N,H),0.),90.)*mer*jr*(1.-nua)*.9;',
      '    ct*=.42+.58*smoothstep(0.,.80,nv);',
      '    float fil=pow(1.-nv,13.),so=smoothstep(-.15,.6,ndl);',
      '    ct+=fil*vec3(.40,.70,1.)*(.03+.95*so);',
      '    if(uOrbQ>.5)ct+=fil*vec3(1.,.50,.22)*.9*(1.-smoothstep(0.,.30,abs(ndl-.04)));',
      '    c=mix(c,ct,uOrb);}',
      '  outgoingLight=c; }'].join('\n'),'globe limbe');
    sh.fragmentShader=f;};
  gm.customProgramCacheKey=function(){return 'globeGravity1';};
  am.onBeforeCompile=function(sh){oa(sh);sh.uniforms.uOrb=OBEAU.u.uOrb;sh.uniforms.uOrbQ=OBEAU.u.uOrbQ;sh.uniforms.uKh=this.userData.kh;sh.uniforms.uSunO=OBEAU.u.uSunO;
    sh.vertexShader=orbRempl(sh.vertexShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb;uniform vec3 uSunO;','atmo vdef');
    sh.vertexShader=orbRempl(sh.vertexShader,'vV9a=-mvPosition.xyz;','vV9a=-mvPosition.xyz;vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vS9a=mat3(viewMatrix)*normalize(mix(normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45),uSunO,uOrb));','atmo vsoleil');
    let f=orbRempl(sh.fragmentShader,'varying vec3 vN9a,vV9a;','varying vec3 vN9a,vV9a,vS9a;uniform float uOrb,uOrbQ,uKh;','atmo fdef');
    f=orbRempl(f,'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));',[
      'float so9=dot(normalize(vN9a),normalize(vS9a));',
      'float ka9=mix(1.,.40+1.0*smoothstep(-.35,.65,so9),uOrb)*mix(1.,.55,uKh*uOrb);',                                           /* la coquille brille côté soleil */
      'vec3 dc9=mix(diffuse,mix(diffuse,vec3(1.,.55,.30),.55),uOrb*uOrbQ*(1.-smoothstep(0.,.42,abs(so9-.05))));', /* … et prend l\'aube au terminateur */
      'float pf9=smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9));pf9=mix(pf9,mix(.4545,pf9,uOrb),uKh);',  /* le halo (uKh=1) garde son aplat hors orbite, prend le dégradé en orbite */
      'pf9=mix(pf9,.62*smoothstep(.19,.285,nd9)*(1.-smoothstep(.29,.36,nd9)),uOrb*(1.-uKh));pf9*=mix(1.,.10,uOrb*uKh);dc9=mix(dc9,vec3(.70,.84,1.),.5*uOrb*(1.-uKh));',  /* (2026-11-12, GRAVITY) en orbite : l\'air est un FIL (≈ 1,5 % du rayon), le halo qui bat s\'éteint */
      'vec4 diffuseColor=vec4(dc9,opacity*2.2*pf9*ka9);'].join('\n'),'atmo corps');
    sh.fragmentShader=f;};
  am.customProgramCacheKey=function(){return 'atmoGravity2';};
  am.userData.kh={value:0};const hm=g.halo.material;hm.userData.kh={value:1};hm.onBeforeCompile=am.onBeforeCompile;hm.customProgramCacheKey=am.customProgramCacheKey; /* le HALO (2e coquille, à bord dur) reprend le profil en dégradé, en orbite seulement */
})();
/* (2026-10-24, Sacha) LA TERRE REPEINTE (orbTerre) est retirée : l'orbite reprend la Terre d'avant (celle du menu). */
/* (2026-11-12, L'ORBITE FAÇON GRAVITY) LA POUSSIÈRE COSMIQUE est retirée : dans le vide, rien ne file — c'est la Terre qui dit la vitesse. */
function orbBeau(t,dt9,vr){ /* chaque image, depuis orbiteTick : l'intensité du niveau et le soleil de la planète — zéro allocation */
  const e=Math.min(1,LVL.espace);OBEAU.u.uOrb.value=e*OBEAU.kPl;
  if(e>.001){planeteSoleil();OBEAU.u.uSunO.value.copy(OBEAU.sunP);}} /* le soleil de la planète est FIXE dans le monde (orbite-soleil.js) */
/* (2026-11-10, Sacha : « rebosse les shaders pour avoir une lumière vraiment spatiale ») LES LUMIÈRES DE LA SCÈNE EN ORBITE. Dans le vide il n'y a pas de ciel qui éclaire : un SOLEIL dur,
   et pour tout le reste la lueur de la planète. Les trois ambiances de l'orbite (Terre, Mars, Jupiter) avaient un hémisphère à 0,4 qui remplissait la route d'un voile uniforme (la dalle
   sortait d'un violet plat, sans côté soleil ni côté ombre). L'hémisphère est ramené de moitié, le remplissage d'un sixième, le soleil monte d'un sixième : l'ombre se creuse, le flanc
   éclairé de la caisse et de la dalle ressort, la couleur de l'ombre reste celle de la planète (hemiG, fillC). Posé APRÈS l'équilibre des maps (qui a fixé `lum`), une seule fois. */
{const FAIT9=new Set();for(const k of ['espaceMatin','espace','espaceSoir'])if(BIOMES[k]&&!FAIT9.has(BIOMES[k])){const b=BIOMES[k];FAIT9.add(b);
  if(typeof b.hemiI==='number')b.hemiI=+(b.hemiI*.5).toFixed(3);if(typeof b.fillI==='number')b.fillI=+(b.fillI*.85).toFixed(3);if(typeof b.sunI==='number')b.sunI=+(b.sunI*1.17).toFixed(3);}}
window.dbgBeau=function(k,o){o=o||{};
  if(o.vid!=null)skyU.uVid.value=+o.vid;if(o.pl!=null)OBEAU.kPl=+o.pl;if(o.nua!=null)OBEAU.u.uNua.value=+o.nua;
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();
    OBEAU.q.copy(camera.quaternion);OBEAU.fov=camera.fov;
    if(o.yaw)camera.rotateOnWorldAxis(ORB.haut,+o.yaw*Math.PI/180);if(o.pitch)camera.rotateX(+o.pitch*Math.PI/180);
    if(o.planete)camera.lookAt(planetGroup.position);
    if(o.fov){camera.fov=+o.fov;camera.updateProjectionMatrix();}
    orbiteTick(skyU.uTime.value);camera.updateMatrixWorld();if(acesPass)acesPass.uniforms.uSpeed.value=0;
    if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    const url=renderer.domElement.toDataURL('image/jpeg',.9);
    camera.quaternion.copy(OBEAU.q);camera.fov=OBEAU.fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();return url;}
  return {vid:skyU.uVid.value,pl:OBEAU.kPl,nua:OBEAU.u.uNua.value,patchsRates:OBEAU.rate.slice(),vel:OBEAU.vel.toArray().map(function(v){return +v.toFixed(1);}),peint:planetGroup.userData.peint};};
