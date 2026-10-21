/* ============================== LES NUAGES QUI SE DÉGAGENT (2026-10-20, Léo) ==============================
   « Ce qui serait cool, c'est qu'ils soient interactifs quand la voiture les touche : ça les dégage. Les plus gros blocs se cassent en petits
   blocs. Et ils sont fluides, donc ça bouge. » Deux gestes, tous les deux de la matière des cumulus en cubes (voir nuage8Calc, opt.vox) :
     · LA TROUÉE : à l'entrée dans un banc, puis tous les ~0,22 s tant qu'on y roule, une sphère de monde (NHOLE, huit places) où la ouate est
       effacée PAR MARCHES DE CUBES ; elle s'ouvre en 0,3 s, tient ~1,4 s, se referme en ~1,2 s (le tunnel derrière la caisse, qui se rebouche) ;
     · LES BLOCS : une gerbe de cubes (NCB, une seule InstancedMesh, ≤ 420) éclairés comme la ouate (mêmes uniformes N8_U) — les GROS (3-13 m, selon
       le nuage) éclatent en QUATRE plus petits (×.58) après ~0,35-0,9 s, jusqu'à ~1 m ; chacun tournoie, suit un remous (sinus lents), est tiré dans
       le sillage de la caisse, puis rétrécit et disparaît. Aucun ne touche au jeu : tout est visuel (la défonce de gameplay, brokenT, n'a pas changé).
   Le matériau est compilé au menu (la mesh existe, à zéro instance, dès que la matière des nuages existe : count 0 compile quand même). */
const NCB={cap:700,n:0,mesh:null,P:new Float32Array(700*3),V:new Float32Array(700*3),R:new Float32Array(700*3),W:new Float32Array(700*3),S:new Float32Array(700),A:new Float32Array(700),L:new Float32Array(700),SP:new Float32Array(700),PH:new Float32Array(700),B:new Float32Array(700),ct:new Map(),
  lp:new THREE.Vector3(),cv:new THREE.Vector3(),has:false,acc:0,hs:[],hi:0,tm:new THREE.Matrix4(),tq:new THREE.Quaternion(),te:new THREE.Euler(),tp:new THREE.Vector3(),ts:new THREE.Vector3()};
function nuCasseInit(){
  if(NCB.mesh||!COTON.mat8||!N8_U.uSunC.value)return;
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k of ['uSunW','uSunC','uSky','uGnd','uLav','uK','uR'])U[k]=N8_U[k];
  const m=new THREE.ShaderMaterial({uniforms:U,fog:true,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','varying vec3 vN,vT;',
      'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);',
      '#ifdef USE_INSTANCING','  nn=mat3(instanceMatrix)*nn;tr=(instanceMatrix*vec4(tr,1.)).xyz;','#endif',
      '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
      '  vN=normalize(mat3(modelMatrix)*nn);vec4 mvPosition=viewMatrix*modelMatrix*vec4(tr,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uSunC,uSky,uGnd,uLav;uniform vec4 uK,uR;varying vec3 vN,vT;',
      'void main(){vec3 N=normalize(vN);float lit=smoothstep(uR.x,uR.y,dot(N,uSunW));', // la lumière de la ouate (nuage8Mat), sans le modelé cuit : un cube = une face
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(uLav*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',
      '  vec3 ombre=ciel*uR.z*(.78+.22*max(dot(N,normalize(vec3(-uSunW.x,.55,-uSunW.z))),0.));',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
      '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',
      '  gl_FragColor=vec4(vT*mix(ombre,soleil,lit),1.);','#include <fog_fragment>','}'].join('\n')});
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,NCB.cap);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NCB.cap*3).fill(1),3);im.instanceColor.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled=false;im.count=0;im.castShadow=im.receiveShadow=false;im.matrixAutoUpdate=false;scene.add(im);NCB.mesh=im;
  for(let i=0;i<8;i++)NCB.hs.push({t:9,d:1,R:0,x:0,y:0,z:0});}
function nuCubeNew(x,y,z,vx,vy,vz,s,life,spl,br){ // un bloc de plus ; -1 s'il n'y a plus de place
  if(NCB.n>=NCB.cap)return -1;const i=NCB.n++,j=i*3;
  NCB.P[j]=x;NCB.P[j+1]=y;NCB.P[j+2]=z;NCB.V[j]=vx;NCB.V[j+1]=vy;NCB.V[j+2]=vz;
  NCB.R[j]=Math.random()*6.28;NCB.R[j+1]=Math.random()*6.28;NCB.R[j+2]=Math.random()*6.28;
  const w=(1.4+Math.random()*2.2)/Math.max(.6,Math.sqrt(s*.35));NCB.W[j]=(Math.random()-.5)*w;NCB.W[j+1]=(Math.random()-.5)*w;NCB.W[j+2]=(Math.random()-.5)*w; // les gros tournent lentement
  NCB.S[i]=s;NCB.A[i]=0;NCB.L[i]=life;NCB.SP[i]=spl;NCB.PH[i]=Math.random()*6.28;NCB.B[i]=br;return i;}
function nuCubeOut(i){const l=--NCB.n;if(i===l)return;const a=i*3,b=l*3;
  for(let k=0;k<3;k++){NCB.P[a+k]=NCB.P[b+k];NCB.V[a+k]=NCB.V[b+k];NCB.R[a+k]=NCB.R[b+k];NCB.W[a+k]=NCB.W[b+k];}
  NCB.S[i]=NCB.S[l];NCB.A[i]=NCB.A[l];NCB.L[i]=NCB.L[l];NCB.SP[i]=NCB.SP[l];NCB.PH[i]=NCB.PH[l];NCB.B[i]=NCB.B[l];}
function nuCasseTrouee(x,y,z,R){const h=NCB.hs[NCB.hi=(NCB.hi+1)%8];h.t=0;h.d=2.3;h.R=R;h.x=x;h.y=y;h.z=z;} // une trouée de plus (la plus vieille cède sa place)
function nuCasseBurst(cp,k,c){ // le COUP : la trouée s'ouvre d'un coup, une gerbe de blocs PROPULSÉS (30-70 m/s) dans toutes les directions + dans le sens de la caisse, qui se cassent aussitôt
  if(!NCB.mesh)return;const s0=Math.min(7,Math.max(2,c.r*.05)),n0=16+Math.round(14*k),R=Math.min(34,Math.max(12,c.r*.17));
  nuCasseTrouee(cp.x,cp.y,cp.z,R);try{shake=Math.max(shake,.5*k+.2);}catch(e9){}
  for(let q=0;q<n0;q++){const a=Math.random()*6.283,u=Math.random()*2-1,rr=Math.sqrt(1-u*u),sp=22+Math.random()*48*k;
    nuCubeNew(cp.x+Math.cos(a)*rr*R*.4,cp.y+u*R*.35,cp.z+Math.sin(a)*rr*R*.4,Math.cos(a)*rr*sp+NCB.cv.x*.75,u*sp*.9+NCB.cv.y*.75+3,Math.sin(a)*rr*sp+NCB.cv.z*.75,
      s0*(.45+Math.random()*.75),2.1+Math.random()*1.3,.16+Math.random()*.34,.9+Math.random()*.1);}}
function nuCasseDans(c,k,cp){ // on roule DANS le banc : une trouée tous les ~0,22 s (le tunnel), quelques blocs détachés
  if(!NCB.mesh)return;NCB.acc+=NCB.dtc;if(NCB.acc<.22)return;NCB.acc=0;
  const R=Math.min(20,Math.max(7,c.r*.11));nuCasseTrouee(cp.x+NCB.cv.x*.08,cp.y+NCB.cv.y*.08,cp.z+NCB.cv.z*.08,R);
  const s0=Math.min(9,Math.max(2,c.r*.06));
  for(let q=0;q<2;q++){const a=Math.random()*6.283,sp=5+Math.random()*9;
    nuCubeNew(cp.x+Math.cos(a)*R*.7,cp.y+(Math.random()-.3)*R*.6,cp.z+Math.sin(a)*R*.7,Math.cos(a)*sp+NCB.cv.x*.4,2+Math.random()*3,Math.sin(a)*sp+NCB.cv.z*.4,s0*(.6+Math.random()*.5),2.2+Math.random(),.3+Math.random()*.5,.9+Math.random()*.1);}}
function nuCasseTick(dt,t){
  if(!NCB.mesh){nuCasseInit();return;}
  NCB.dtc=dt;const cp=carGroup.position;nuPouTick(dt,t);
  if(NCB.has&&dt>0){NCB.cv.set((cp.x-NCB.lp.x)/dt,(cp.y-NCB.lp.y)/dt,(cp.z-NCB.lp.z)/dt);const l=NCB.cv.length();if(l>140)NCB.cv.multiplyScalar(140/l);} // la vitesse de la caisse, mesurée (jamais une téléportation : bornée)
  NCB.lp.copy(cp);NCB.has=true;
  for(const h of NCB.hs){ // les trouées : elles s'ouvrent vite, tiennent, se referment (la ouate revient)
    let r=0;if(h.t<h.d){h.t+=dt;const u=h.t/h.d,e=function(a){return a*a*(3-2*a);};r=u<.03?h.R*e(u/.03):u<.5?h.R*(1+.06*Math.sin(t*9+h.x)):h.R*(1-e(Math.min(1,(u-.5)/.5)));h.x+=NCB.cv.x*.12*dt;h.z+=NCB.cv.z*.12*dt;} // le remous tire un peu la trouée dans le sillage
    NCB.hv=NCB.hv||NHOLE.uHole.value;const idx=NCB.hs.indexOf(h);NHOLE.uHole.value[idx].set(h.x,h.y,h.z,r);}
  const P=NCB.P,V=NCB.V,R=NCB.R,W=NCB.W,m=NCB.tm,q=NCB.tq,e=NCB.te,pp=NCB.tp,ss=NCB.ts,cv=NCB.cv,im=NCB.mesh;
  for(let i=NCB.n-1;i>=0;i--){const j=i*3;NCB.A[i]+=dt;const age=NCB.A[i],life=NCB.L[i];
    if(age>=life){nuCubeOut(i);continue;}
    if(NCB.S[i]>1.15&&age>NCB.SP[i]&&NCB.n+3<NCB.cap){ // LE GROS BLOC SE CASSE : quatre plus petits, chacun sa vitesse
      const s=NCB.S[i]*.58,x=P[j],y=P[j+1],z=P[j+2],vx=V[j],vy=V[j+1],vz=V[j+2],rem=life-age;NCB.S[i]=0;NCB.L[i]=0; // le parent disparaît
      for(let c9=0;c9<4;c9++){const a=Math.random()*6.283,sp=5+Math.random()*13;nuCubeNew(x+Math.cos(a)*s*.4,y+(Math.random()-.5)*s*.6,z+Math.sin(a)*s*.4,vx+Math.cos(a)*sp,vy+(Math.random()-.4)*sp,vz+Math.sin(a)*sp,s*(.85+Math.random()*.3),Math.max(.9,rem*(.7+Math.random()*.5)),age+.3+Math.random()*.5,.9+Math.random()*.1);}
      continue;}
    const dr=Math.exp(-dt*1.25),ph=NCB.PH[i];
    V[j]=V[j]*dr+(Math.sin(P[j+1]*.23+t*1.4+ph)*7)*dt;V[j+1]=V[j+1]*dr+(Math.sin(P[j+2]*.21-t*1.1+ph*2)*5+1.3)*dt;V[j+2]=V[j+2]*dr+(Math.sin(P[j]*.19+t*.9-ph)*7)*dt; // le remous : des sinus lents, chacun sa phase
    const dx=P[j]-cp.x,dy=P[j+1]-cp.y,dz=P[j+2]-cp.z,dd=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(dd<46){const k=(1-dd/46)*dt*1.3;V[j]+=(cv.x*.6-V[j])*k;V[j+1]+=(cv.y*.6-V[j+1])*k;V[j+2]+=(cv.z*.6-V[j+2])*k;} // le sillage les emporte
    P[j]+=V[j]*dt;P[j+1]+=V[j+1]*dt;P[j+2]+=V[j+2]*dt;R[j]+=W[j]*dt;R[j+1]+=W[j+1]*dt;R[j+2]+=W[j+2]*dt;}
  const n=NCB.n;im.count=n;
  for(let i=0;i<n;i++){const j=i*3,age=NCB.A[i],life=NCB.L[i],cx=P[j]-camera.position.x,cy=P[j+1]-camera.position.y,cz=P[j+2]-camera.position.z,dc=Math.sqrt(cx*cx+cy*cy+cz*cz),fc=Math.min(1,Math.max(0,(dc-4)/13)),sz=NCB.S[i]*Math.min(1,.25+age*8)*Math.min(1,(life-age)/.45)*fc*fc*(3-2*fc); // près de l'objectif un bloc rétrécit (jamais un mur de cube sur l'écran)
   
    e.set(R[j],R[j+1],R[j+2]);q.setFromEuler(e);pp.set(P[j],P[j+1],P[j+2]);ss.set(sz,sz,sz);m.compose(pp,q,ss);im.setMatrixAt(i,m);const b=NCB.B[i];im.instanceColor.setXYZ(i,b,b,b);}
  im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}
window.dbgCasse=function(o){o=o||{};nuCasseInit();if(!NCB.mesh)return 'pas prêt'; // (banc) dbgCasse({c:1}) = une trouée + une gerbe devant la caisse
  if(o.c){const cp=carGroup.position.clone();if(o.d)cp.addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion),o.d);nuCasseBurst(cp,o.k==null?1:o.k,{r:o.r||120});}
  if(o.pas)for(let i=0;i<o.pas;i++)nuCasseTick(1/60,performance.now()/1000+i/60); // (banc, en pause) fait avancer la gerbe de o.pas images
  if(o.sonde){const v=new THREE.Vector3(NCB.P[0],NCB.P[1],NCB.P[2]),w=v.clone().project(camera);return {n:NCB.n,p:v.toArray().map(Math.round),cam:camera.position.toArray().map(Math.round),ecran:[w.x.toFixed(2),w.y.toFixed(2),w.z.toFixed(3)],cnt:NCB.mesh.count,vis:NCB.mesh.visible,par:!!NCB.mesh.parent,progs:renderer.info.programs.length};}
  return {n:NCB.n,trouees:NCB.hs.map(function(h){return +(h.t<h.d?h.R*(1-h.t/h.d):0).toFixed(1);}),v:NCB.cv.toArray().map(Math.round)};};
window.dbgPlanNuages=function(pas){ // (banc, 2026-10-21) LE PLAN D'AVION : la piste (un point tous les `pas` m) et tous les nuages (centre, demi-largeur, demi-hauteur) + la part de route DANS un nuage / frôlant un nuage
  pas=pas||15;const st=Math.max(1,Math.round(pas/Math.max(.5,L/Math.max(1,NP-1)))),P=[],C=[];
  for(let i=0;i<NP;i+=st)P.push([Math.round(pts[i].x),Math.round(pts[i].y),Math.round(pts[i].z)]);
  for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,I=COTON.I,r=I[o+3],S=COTON.S[I[o+5]];C.push([Math.round(I[o]),Math.round(I[o+1]+S.base*r*I[o+9]+I[o+7]*.5),Math.round(I[o+2]),Math.round(r*I[o+8]),Math.round((S.top-S.base)*r*I[o+9]*.5),0]);}
  for(const c of CLOUDS)C.push([Math.round(c.g.position.x),Math.round(c.g.position.y),Math.round(c.g.position.z),Math.round(c.r),Math.round(c.ry),c.onRoad?2:1]);
  let dans=0,pres=0,tot=0,cam=0;for(const p of P){tot++;let mn=1e9;for(const c of C){const dx=(p[0]-c[0])/c[3],dz=(p[2]-c[2])/c[3],dy=((p[1]+4)-c[1])/Math.max(1,c[4]);mn=Math.min(mn,Math.sqrt(dx*dx+dz*dz+dy*dy));}
    if(mn<1)dans++;else if(mn<1.4)pres++;}
  return {pas:pas,n:C.length,banc:C.filter(function(c){return c[5]===2;}).length,dans:+(dans/tot).toFixed(3),pres:+(pres/tot).toFixed(3),roadHalf:ROAD_HALF,P:P,C:C};};
/* (2026-10-21, Léo : « chaque nuage adapté à sa météo ; le matin est le plus réussi, pars de lui ») LES HUMEURS DES CUMULUS : le MATIN est la référence (rien ne change). Pour les autres météos de la map, deux
   réglages de la matière (voir nuage8Mat : uMood, uInC) — la TRANSPARENCE en trame (x : part opaque) et la LUMIÈRE DE L'INTÉRIEUR (y, de la couleur uInC ; z monte aux éclairs). Lissés d'une image à l'autre. */
const NU_MOOD={ // [part opaque, lumière intérieure, couleur]
  matin:[1,0,[.8,.85,1]],midi:[1,0,[.8,.88,1]],aprem:[1,0,[1,.9,.75]],soir:[1,.06,[1,.62,.55]],nuit:[1,.1,[.45,.6,1]],
  pluie:[1,.1,[.55,.72,.98]],orage:[1,.14,[.62,.55,1]]}; /* (2026-10-21, « un nuage est allumé presque constamment en violet ») la lueur de fond baisse (.5 → .14) : la lumière vient des fils et des coups, localement */ /* (2026-10-21, Léo : « flouter les nuages, pas trop, ne pas les rendre transparents ») plus de trame : TOUS opaques (part 1) — l'humeur ne garde que la lumière de l'intérieur */
const NU_MOOD_S={x:1,y:0,c:new THREE.Vector3(.8,.85,1),f:0};
function nuMoodTick(dt){
  const c=LVL&&LVL.cur,k=c&&(c.carte==='nuages'||c.id==='orage')&&started&&!gameOver&&mode!=='boom'?(c.carte==='nuages'?c.meteo:'orage'):null,M=NU_MOOD[k]||[1,0,NU_MOOD.matin[2]],S=NU_MOOD_S,e=Math.min(1,dt*2.2),U=N8_U;
  S.x+=(M[0]-S.x)*e;S.y+=(M[1]-S.y)*e;S.c.x+=(M[2][0]-S.c.x)*e;S.c.y+=(M[2][1]-S.c.y)*e;S.c.z+=(M[2][2]-S.c.z)*e;
  let fl=0;try{fl=Math.min(1,Math.max(0,CAMP_FLASH||0));}catch(e9){}S.f+=(fl-S.f)*Math.min(1,dt*18);
  U.uMood.value.set(S.x,S.y,S.f*.12,0);U.uInC.value.copy(S.c);nuCasseDecor();}

/* (2026-10-21, Léo : « propulsé et dispersé lorsque touché par la voiture, de manière brusque ») LE CONTACT AVEC LE DÉCOR : les nuages en instances (COTON) n'avaient aucune collision — seuls les bancs réagissaient.
   La caisse (au sol, ou en vol à travers un cumulus du bord) qui entre dans l'ellipsoïde d'un nuage (x1,02) le fait éclater, une fois par nuage et par ~3 s. Visuel seulement. */
function nuCasseDecor(){
  if(!NCB.mesh||!started||gameOver||mode==='boom'||!(COTON.n>0)||!COTON.I)return;const I=COTON.I,cp=carGroup.position,now=performance.now();
  for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,r=I[o+3];if(r<20)continue;const S=COTON.S[I[o+5]],rx=r*I[o+8]*1.02,ry=Math.max(8,(S.top-S.base)*r*I[o+9]*.5)*1.02,
      dx=cp.x-I[o],dz=cp.z-I[o+2],dy=cp.y-(I[o+1]+S.base*r*I[o+9]+I[o+7]*.5);if(Math.abs(dx)>rx||Math.abs(dz)>rx||Math.abs(dy)>ry)continue;
    const d2=(dx*dx+dz*dz)/(rx*rx)+dy*dy/(ry*ry);if(d2>=1)continue;const t0=NCB.ct.get(j);if(t0!==undefined&&now-t0<3000)continue;NCB.ct.set(j,now);nuCasseBurst(cp,Math.min(1,.55+(1-Math.sqrt(d2))),{r:rx});}}
/* ============================== LA PEAU (2026-10-21, Léo : « enlève tous les ronds qui n'ont plus rien à voir avec les nouveaux nuages » · « appliquer une couche transparente épaisse qui va permettre de polir le tout ») ==============================
   Sur les nuages en cubes : une COUCHE TRANSPARENTE ÉPAISSE — la surface lisse du MÊME champ (calculée dans l'ouvrier avec les cubes), gonflée d'environ 1,2 cube, qui recouvre les marches comme un vernis de verre : on voit les cubes à travers,
   mais leurs arêtes sont polies, la silhouette adoucie. Matière : la lumière de la ouate (mêmes uniformes), un voile blanc-lavande (`uSk.z`), plus opaque sur le bord (Fresnel `uSk.y`), fondue comme le corps entre deux finesses (`instanceMatrix[0][3]`)
   et près de l'objectif, trouée là où la voiture a frappé (NHOLE). Un maillage par lot (mêmes instances que le corps : `COTON.skin`). `?peau=0` = sans ; `dbgSkin(base, bord, voile)` pour régler. */
const NUSKIN={on:!/[?&]peau=0\b/.test(location.search),uSk:{value:new THREE.Vector4(.2,.45,.06,0)},mat:null};
function nuVide(){ // un triangle dégénéré : une géométrie qui ne dessine rien (le nuage arrive fini ; plus de boules provisoires)
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array([0,1,0,0,1,0,0,1,0]),3));
  g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(9).fill(1),3));g.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2]),1));return g;}
function nuSkinGeo(sk,dy){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sk.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(sk.nor,3));g.setIndex(new THREE.BufferAttribute(sk.idx,1));if(dy)g.translate(0,dy,0);g.computeBoundingSphere();return g;}
function nuSkinMat(){
  if(NUSKIN.mat)return NUSKIN.mat;const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);
  for(const k of ['uSunW','uSunC','uSky','uGnd','uLav','uK','uR','uHole','uHoleC','uNearF'])U[k]=N8_U[k];U.uSk=NUSKIN.uSk;
  NUSKIN.mat=new THREE.ShaderMaterial({uniforms:U,fog:true,transparent:true,depthWrite:false,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','varying vec3 vN,vW;varying float vF;',
      'void main(){vec3 tr=position;vec3 nn=normal;vF=0.;',
      '#ifdef USE_INSTANCING','  vF=instanceMatrix[0][3];nn=mat3(instanceMatrix)*nn;tr=(instanceMatrix*vec4(tr,1.)).xyz;','#endif',
      '  vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uSunC,uSky,uGnd,uLav;uniform vec4 uK,uR,uSk,uHole[8];uniform vec2 uNearF;uniform float uHoleC;varying vec3 vN,vW;varying float vF;',
      'void main(){',
      '  for(int i9=0;i9<8;i9++){vec4 h9=uHole[i9];if(h9.w>.01&&distance((floor(vW/uHoleC)+.5)*uHoleC,h9.xyz)<h9.w)discard;}',
      '  vec3 N=normalize(vN),V=normalize(cameraPosition-vW);float lit=smoothstep(uR.x,uR.y,dot(N,uSunW));',
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(uLav*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',
      '  vec3 ombre=ciel*uR.z*(.78+.22*max(dot(N,normalize(vec3(-uSunW.x,.55,-uSunW.z))),0.));',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
      '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',
      '  vec3 col=mix(vec3(1.,.985,.96)*(.8+.2*lit),mix(ombre,soleil,lit),.3)+vec3(.9,.92,1.)*uSk.z;', // le voile laiteux du verre : surtout BLANC (la lumière à 30 % seulement) — plus de voile bleu
      '  float fr=1.-abs(dot(N,V));float a=uSk.x+uSk.y*pow(fr,2.2);',                               // plus épais sur le bord : un vernis, pas un brouillard
      '  a*=(vF<0.?-vF:1.-vF)*smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));',            // fondue comme le corps entre deux finesses, et près de l objectif
      '  gl_FragColor=vec4(col,clamp(a,0.,.85));','#include <fog_fragment>','}'].join('\n')});
  return NUSKIN.mat;}
function nuSkinPose(k,f,sk){ // une finesse arrive : sa peau pour SON lot et les lots plus fins encore en attente
  if(!NUSKIN.on||!COTON.root)return;const g=nuSkinGeo(sk,0),m9=nuSkinMat();COTON.skin=COTON.skin||[];
  for(let f2=f;f2<4;f2++){const j=k*4+f2;if(f2>f&&COTON.pret[j])break;const im=COTON.im[j];if(!im)continue;let S=COTON.skin[j];
    if(!S){const m=new THREE.InstancedMesh(g,m9,COTON.cap);m.instanceMatrix=im.instanceMatrix;m.instanceColor=im.instanceColor;m.frustumCulled=false;m.count=0;m.renderOrder=1;m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;COTON.root.add(m);COTON.skin[j]=S={m:m};}
    else S.m.geometry=g;}}
window.dbgSkin=function(a,b,c){const u=NUSKIN.uSk.value;if(a!=null)u.x=+a;if(b!=null)u.y=+b;if(c!=null)u.z=+c;return u.toArray();}; // (banc) base · bord · voile ; dbgSkin(0,0,0) = invisible
/* ============================== LE NUAGE QUI FLOTTE (2026-10-21, Léo : « dans l'air aussi, peut-être ajouter des petits cubes qui se promènent, comme des particules ; le nuage qui flotte ») ==============================
   Sur la map nuages (en course et au titre) : ~240 PETITS CUBES (0,5-2,3 m, blancs, éclairés comme la ouate — la matière des blocs de la collision, une seule InstancedMesh) en suspension dans l'air autour de la caisse :
   ils dérivent au vent, tournent lentement, ondulent (sinus à phases propres), montent un peu ; ceux qui passent derrière ou trop loin renaissent devant, à 60-420 m, fondus (taille 0 → pleine) pour ne jamais « apparaître ».
   `?air=0` = sans. */
const NPOU={n:240,mesh:null,on:!/[?&]air=0\b/.test(location.search),P:new Float32Array(240*3),V:new Float32Array(240*3),R:new Float32Array(240*3),W:new Float32Array(240*3),S:new Float32Array(240),PH:new Float32Array(240),B:new Float32Array(240),init:false,
  f:new THREE.Vector3(0,0,1),c:new THREE.Vector3(),rt:new THREE.Vector3()};
function nuPouInit(){
  if(NPOU.mesh)return;if(!NCB.mesh)nuCasseInit();if(!NCB.mesh)return;const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),NCB.mesh.material,NPOU.n);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NPOU.n*3).fill(1),3);im.instanceColor.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;im.count=0;im.castShadow=im.receiveShadow=false;im.matrixAutoUpdate=false;scene.add(im);NPOU.mesh=im;
  for(let i=0;i<NPOU.n;i++){NPOU.S[i]=1+Math.pow(Math.random(),1.8)*4.2;NPOU.PH[i]=Math.random()*6.28;NPOU.B[i]=.82+Math.random()*.18;const j=i*3;for(let k=0;k<3;k++){NPOU.R[j+k]=Math.random()*6.28;NPOU.W[j+k]=(Math.random()-.5)*.9;}}}
function nuPouTick(dt,t){
  if(!NPOU.on)return;if(!NPOU.mesh){nuPouInit();if(!NPOU.mesh)return;}
  const c9=LVL&&LVL.cur,run=started&&!gameOver,actif=run?!!(c9&&c9.carte==='nuages'&&mode!=='boom'):(typeof CHUTE!=='undefined'&&CHUTE.on&&!garageOn),im=NPOU.mesh;
  if(!actif){im.count=0;NPOU.init=false;return;}
  const F=NPOU.f,C=NPOU.c,RT=NPOU.rt;
  if(run){C.copy(carGroup.position);if(NCB.cv.lengthSq()>25)F.copy(NCB.cv).normalize();else F.set(0,0,1).applyQuaternion(carGroup.quaternion);}
  else{camera.getWorldDirection(F);C.copy(camera.position).addScaledVector(F,160);} // au titre : devant l'objectif
  F.y=run?F.y*.3:F.y*.5;F.normalize();RT.set(F.z,0,-F.x);{const l=Math.hypot(RT.x,RT.z)||1;RT.x/=l;RT.z/=l;}
  const P=NPOU.P,V=NPOU.V,R=NPOU.R,W=NPOU.W,m=NCB.tm,q=NCB.tq,e=NCB.te,pp=NCB.tp,ss=NCB.ts,cam=camera.position,reach=run?430:520;
  for(let i=0;i<NPOU.n;i++){const j=i*3;let dx=P[j]-C.x,dy=P[j+1]-C.y,dz=P[j+2]-C.z;const ahead=dx*F.x+dy*F.y+dz*F.z,dd=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(!NPOU.init||dd>reach||(run&&ahead<-120)){ // renaît devant, dans un volume large autour de la route
      const a=60+Math.random()*(reach-120),lat=(Math.random()-.5)*(run?520:700),up=(Math.random()-.4)*(run?240:320);P[j]=C.x+F.x*a+RT.x*lat;P[j+1]=C.y+F.y*a+up;P[j+2]=C.z+F.z*a+RT.z*lat;
      V[j]=(Math.random()-.5)*3;V[j+1]=.4+Math.random()*1.4;V[j+2]=(Math.random()-.5)*3;NPOU.b0=(NPOU.b0||0);NPOU.PH[i]=Math.random()*6.28;dx=P[j]-C.x;dy=P[j+1]-C.y;dz=P[j+2]-C.z;}
    const ph=NPOU.PH[i];V[j]+=(Math.sin(P[j+1]*.021+t*.5+ph)*1.6)*dt;V[j+1]+=(Math.sin(P[j+2]*.019-t*.4+ph*2)*1.1)*dt;V[j+2]+=(Math.sin(P[j]*.017+t*.45-ph)*1.6)*dt;
    const dr=Math.exp(-dt*.35);V[j]*=dr;V[j+1]*=dr;V[j+2]*=dr;P[j]+=V[j]*dt;P[j+1]+=V[j+1]*dt;P[j+2]+=V[j+2]*dt;R[j]+=W[j]*dt;R[j+1]+=W[j+1]*dt;R[j+2]+=W[j+2]*dt;
    const cx=P[j]-cam.x,cy=P[j+1]-cam.y,cz=P[j+2]-cam.z,dc=Math.sqrt(cx*cx+cy*cy+cz*cz),fn=Math.min(1,Math.max(0,(dc-25)/55)),ff=Math.min(1,Math.max(0,(reach-dd)/90)),sc=NPOU.S[i]*fn*fn*ff;
    e.set(R[j],R[j+1],R[j+2]);q.setFromEuler(e);pp.set(P[j],P[j+1],P[j+2]);ss.set(sc,sc,sc);m.compose(pp,q,ss);im.setMatrixAt(i,m);const b=NPOU.B[i];im.instanceColor.setXYZ(i,b,b,b);}
  NPOU.init=true;im.count=NPOU.n;im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}
