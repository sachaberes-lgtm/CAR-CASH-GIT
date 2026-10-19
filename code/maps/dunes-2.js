/* ---- LE SABLE À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const DN_TB='vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}';
const DN_VS=['attribute vec4 aN;uniform sampler2D uTC,uTZ,uTS,uNZ;uniform vec4 uFD,uZD,uSD,uOA,uW;uniform vec2 uFN,uZN,uSN;uniform vec3 uCam;uniform float uG,uR0,uLam;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_vertex>',DN_TB,
  'float gU,gP,gV;',
  'float dnDune(vec2 x){vec2 W=uW.xy;float u=dot(x,W)/uLam,v=dot(x,vec2(-W.y,W.x)),w1=texture2D(uNZ,x/30000.).r-.5,w2=texture2D(uNZ,x/11000.+vec2(.37,.61)).r-.5,w3=texture2D(uNZ,x/5200.+vec2(.83,.17)).r-.5;',
  '  float a=u+1.4*w1+1.05*w2+.34*w3,f=fract(a);',
  '  float p=f<.72?pow(max(f/.72,1e-5),1.5):pow(max((1.-f)/.28,1e-5),1.15),m=.30+.70*clamp((texture2D(uNZ,vec2(v/9000.+.13,a*.13+.5)).r-.22)*1.9,0.,1.);',
  '  float a2=dot(x,uW.zw)/(uLam*.40)+1.6*w2+.5*w3,f2=fract(a2);',
  '  float p2=f2<.68?pow(max(f2/.68,1e-5),1.4):pow(max((1.-f2)/.32,1e-5),1.1);',
  '  gU=p*m;return p*m+.08*p2*(1.-.75*p);}',
  'vec4 dnHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float h=Z.r+Z.b*(dnDune(x)-.35)*(1.-.85*Z.a);gP=Z.a;gV=0.;',
  '  vec2 fp=(x-uFD.xy)*uFD.zw;if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);h=min(max(h,C.g),C.r);}',
  '  float w=0.,dep=0.;if(uOA.z>0.){float rr=length(x-uOA.xy)/uOA.z;if(rr<2.4){float o=rr<1.?uOA.w-12.*(1.-rr*rr):uOA.w+(rr-1.)*uOA.z*.2;h=min(h,o);',
  '    gV=smoothstep(.95,1.06,rr)*(1.-smoothstep(1.30,1.62,rr));if(h<uOA.w-.05){dep=uOA.w-h;h=uOA.w;w=1.;}}}',
  '  return vec4(h,w,dep,0.);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=dnHt(x);float pu=gU,pa=gP,vg=gV,e=S/uG*(1.+k)*2.2;',
  '  float hx=dnHt(x+vec2(e,0.)).x,hz=dnHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-3.,hs+8.,A.x);}',
  '  vA=vec4(A.y,A.z,pu,lit);vB=vec4(pa,0.,0.,vg);',
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const DN_FS=['uniform sampler2D uNZ;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uSaA,uSaB,uSaL,uShd,uClay,uVeg,uHaze,uSkH,uSkZ,uWS,uWD,uPhP,uPhD,uPhC;uniform vec4 uQ,uK,uW;uniform float uTime,uFlash;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN),Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/max(dist,.001);',
  '  float wat=vA.x,dep=vA.y,du=clamp(vA.z,0.,1.),lit=clamp(vA.w,0.,1.),pan=clamp(vB.x,0.,1.),veg=clamp(vB.w,0.,1.)*(1.-wat);',
  '  vec4 n0=texture2D(uNZ,vW.xz/1900.),n1=texture2D(uNZ,vW.xz/260.),n2=texture2D(uNZ,vW.xz/37.);',
  /* LES RIDES DU VENT : la normale ondule en travers du vent (aucune géométrie), de près, sur le sable seulement */
  '  if(dist<70.&&wat<.5){float kr=(1.-smoothstep(25.,70.,dist))*(1.-.85*pan)*(1.-veg)*uK.y;float ph=dot(vW.xz,uW.xy)*3.1+4.*n2.r+1.6*texture2D(uNZ,vW.xz/9.).g;',
  '    N=normalize(N-vec3(uW.x,0.,uW.y)*cos(ph)*.12*kr);}', /* (de près seulement : au-delà de 70 m, la ride de 2 m crénelait en damier — MESURÉ à la photo) */
  '  float stp=clamp(1.-N.y,0.,1.);',
  '  vec3 sa=mix(uSaA,uSaB,clamp(.5+(n0.r-.5)*1.5+(n1.g-.5)*.6,0.,1.))*(.96+.08*n2.b);',
  '  sa=mix(sa,uSaL,smoothstep(.80,1.,du)*.40);', // la crête, plus claire
  '  float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));', // l'argile blanche et ses craquelures
  '  vec3 col=mix(sa,clay,cl);col=mix(col,uVeg*(.80+.35*n2.g),veg);',
  '  float ndl=dot(N,uSunD),wr=clamp((ndl+uK.z)/(1.+uK.z),0.,1.);',
  '  vec3 Lc=uSunC*wr*lit+mix(uGnd,uSky,N.y*.5+.5)*1.15+uFillC*max(dot(N,uFillD),0.)*.5+uSunC*.10*(1.-lit)*(.6+.4*N.y);', /* + le REBOND : le sable à l'ombre reçoit la lumière des dunes au soleil (jamais de creux noir) */
  '  vec3 c=col*Lc;',
  '  c=mix(c,c*uShd,(1.-lit*clamp(ndl*2.5+.2,0.,1.))*.45);', // l'ombre du sable tire au VIOLET (la bible)
  '  float fr=pow(1.-max(dot(N,V),0.),4.);c+=(uSky*.22+uSunC*.16*max(ndl,0.)*lit)*fr*uK.x*(1.-wat);', // le SATIN du sable au rasant
  '  if(dist<80.&&wat<.5){vec2 ce=floor(vW.xz*2.6);float hh=fract(sin(dot(ce,vec2(12.9898,78.233)))*43758.5453);vec3 R9=reflect(-uSunD,N);',
  '    c+=uSunC*pow(max(dot(R9,V),0.),50.)*step(.982,hh)*lit*uQ.w*(1.-smoothstep(30.,80.,dist))*3.;}', // les PAILLETTES
  '  if(wat>.01){vec4 nw=texture2D(uNZ,mat2(.8,.6,-.6,.8)*vW.xz/57.+uTime*vec2(.006,.010)),nw2=texture2D(uNZ,vW.xz/143.-uTime*vec2(.004,.002));', /* (des bruits LARGES et tournés : à 18 m la tuile du bruit se répétait en grille sur le lac) */
  '    vec3 Nw=normalize(vec3(0.,6.,0.)+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.));',
  '    float f9=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));',
  '    vec3 cw=wc*(uSunC*(.3+.7*max(dot(Nw,uSunD),0.))*lit+mix(uGnd,uSky,.7))*.9+sk*f9+uSunC*pow(max(dot(R,uSunD),0.),160.)*1.2*lit;c=mix(c,cw,wat);}',
  '  if(uPhC.r+uPhC.g>.001){vec3 lv=vW-uPhP;float dl=length(lv);vec3 ld=lv/max(dl,.01);c+=col*uPhC*smoothstep(.80,.95,dot(ld,uPhD))*max(dot(N,-ld),0.)/(1.+dl*dl/9000.);}', // les PHARES sur le sable
  /* LE MIRAGE : au loin, le sable presque à plat, vu en rasant, renvoie le ciel — et tremble */
  '  {float mi=uQ.y*smoothstep(800.,3200.,dist)*(1.-smoothstep(.02,.10,abs(V.y)))*(1.-smoothstep(.06,.25,stp));',
  '   float sh=texture2D(uNZ,vec2(vW.x/260.+uTime*.04,vW.z/260.-uTime*.03)).r;c=mix(c,mix(uSkH,uSkZ,.25)*(.92+.16*sh),mi*(.55+.45*sh));}',
  '  c=mix(c,uHaze,uQ.x*smoothstep(150.,4500.,dist)*.65);', // la poussière en suspension
  '  c+=uFlash*col*vec3(.75,.78,1.)*(.35+.65*max(N.y,0.));',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
function dnTerrain(){ if(DN.mesh)return;
  cyBruits();
  const G=PAL.b('dnGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];DN.G=G;DN.R0=PAL.b('dnR0',118);
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  DN.aN=new THREE.InstancedBufferAttribute(new Float32Array(DN.maxN*4),4);DN.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',DN.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);DN.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;
  const C3=()=>({value:new THREE.Color()});
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTZ:{value:z1},uTS:{value:z1},uNZ:{value:CY.tNz},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uOA:{value:new THREE.Vector4(0,0,0,0)},uW:{value:new THREE.Vector4(1,0,1,0)},uLam:{value:560},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:DN.R0},uTime:{value:0},uFlash:{value:0},uSunD:{value:SUN_DIR},
    uSunC:C3(),uSky:C3(),uGnd:C3(),uFillC:C3(),uFillD:{value:new THREE.Vector3(0,-1,0)},uSaA:C3(),uSaB:C3(),uSaL:C3(),uShd:C3(),uClay:C3(),uVeg:C3(),uHaze:C3(),uSkH:C3(),uSkZ:C3(),uWS:C3(),uWD:C3(),
    uQ:{value:new THREE.Vector4()},uK:{value:new THREE.Vector4(.5,1,.25,1)},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  DN.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_VS,fragmentShader:DN_FS,fog:true});DN.mat.dispose=function(){};
  const m=new THREE.Mesh(g,DN.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='dunes';m.renderOrder=-1;scene.add(m);DN.mesh=m;
  const gr=new THREE.Group();gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);DN.grp=gr;
}
/* LE QUADTREE (CDLOD), à chaque rendu — celui du canyon (cySelect), sur la grille des dunes */
function dnSelect(cam){const M=DN.mesh;if(!M||!M.visible)return;
  DN.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);DN.fr.setFromProjectionMatrix(DN.pm);
  const cx=cam.position.x,cz=cam.position.z,R0=DN.R0,A=DN.aN.array,MAX=DN.maxN,y0=DN.yMin,y1=DN.yMax,bx=DN.box,L9=DN.lods;let n=0;
  const dR=(x0,z0,s)=>{const dx=Math.max(x0-cx,0,cx-x0-s),dz=Math.max(z0-cz,0,cz-z0-s);return Math.sqrt(dx*dx+dz*dz);};
  const add=(x0,z0,s,l)=>{if(n>=MAX)return;const o=n*4;A[o]=x0;A[o+1]=z0;A[o+2]=s;A[o+3]=l;n++;};
  const sel=(x0,z0,s,l)=>{const d=dR(x0,z0,s);if(d>R0*Math.pow(2,l))return false;
    bx.min.set(x0,y0,z0);bx.max.set(x0+s,y1,z0+s);if(!DN.fr.intersectsBox(bx))return true;
    if(l===0||d>R0*Math.pow(2,l-1)){add(x0,z0,s,l);return true;}
    const h=s/2;for(let q=0;q<4;q++){const qx=x0+(q&1)*h,qz=z0+(q>>1)*h;if(!sel(qx,qz,h,l-1))add(qx,qz,h,l-1);}return true;};
  const SR=DN.S0*Math.pow(2,L9),reach=Math.min(R0*Math.pow(2,L9),(cam.far||9800)+400);
  for(let ix=Math.floor((cx-reach)/SR);ix<=Math.floor((cx+reach)/SR);ix++)for(let iz=Math.floor((cz-reach)/SR);iz<=Math.floor((cz+reach)/SR);iz++){
    if(dR(ix*SR,iz*SR,SR)>reach)continue;if(!sel(ix*SR,iz*SR,SR,L9))add(ix*SR,iz*SR,SR,L9);}
  DN.n=n;DN.geo.instanceCount=n;DN.aN.updateRange.offset=0;DN.aN.updateRange.count=n*4;DN.aN.needsUpdate=true;
  DN.mat.uniforms.uCam.value.copy(cam.position);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{if(DN.on)dnSelect(cam);}catch(e){window.__dnErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* chaque image : les lumières de la scène dans la matière du sable, l'ambiance des dunes (BIO.cur.dn*), l'éclair — et l'ombre des crêtes SUR LA
   CAISSE (la clé baisse quand on passe à l'ombre d'une dune : seul écrit du soleil hors de bioApply, et seulement ici — comme canyonTick, qu'il suit) */
function dunesTick(dt){
  if(!DN.mat)return;const U=DN.mat.uniforms,c=BIO.cur,k=LVL.dunes||0;
  if(DN.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(DN.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const f=(u,k9)=>{const a=c[k9];if(a)u.value.fromArray(a);};
    f(U.uSaA,'dnA');f(U.uSaB,'dnB');f(U.uSaL,'dnL');f(U.uShd,'dnS');f(U.uClay,'dnC');f(U.uVeg,'dnV');f(U.uHaze,'dnH');f(U.uWS,'dnW');f(U.uWD,'dnX');f(U.uSkH,'cyH');f(U.uSkZ,'cyZ');
    const Q9=c.dnQ||[0,0,0,0],K9=c.dnK||[.5,1,.25,1];U.uQ.value.set(Q9[0],Q9[1],Q9[2],Q9[3]);U.uK.value.set(K9[0],K9[1],K9[2],K9[3]);
    U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value;
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et dans la tempête
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}}
  let ombre=1;
  if(DN.on&&DN.O&&started&&!gameOver){const p=carGroup.position,O=DN.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/12));}}
  DN.ombre+=(ombre-DN.ombre)*Math.min(1,dt*5);dnPartTick(dt,c);
  if(k>.001||DN.ecrit){const e=DN.on?k:0;sun.intensity=c.sunI*(1-.62*(1-DN.ombre)*e);DN.ecrit=e>.001;}
  dnCaravane(dt);}
/* LES LÈVRES DES VAGUES (2026-10-19, Sacha : « je veux qu'on décolle sur les vagues des dunes même sans nitro, de crête en crête ») — au sol la caisse
   reste COLLÉE au ruban (elle ne quitte la route que par le bord, le saut nitro, une figure ou un tremplin) : MESURÉ au pilote, aucune cassure de
   pente ne la faisait décoller. La crête de chaque vague est donc une LÈVRE, comme les tremplins du glacier : franchie en roulant (dans le sens de
   la course, sur la dalle, au-dessus de 70 km/h), elle lance la caisse juste ce qu'il faut pour retomber sur SA face d'avalanche, vers 72 % de sa
   longueur, à n'importe quelle vitesse : t = 0,72 × la face / la vitesse (entre 0,9 et 2,4 s), la montée = ½ g t − la pente × la vitesse (g monde
   ~23 m/s², FALL_G × SPD), moins ce que la crête (+4 %) donne déjà. rampCd : une lèvre à la fois. DN.sauts = le compte (banc). */
const DN_LF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
function dnLevre(s0){if(rampCd>0||side<0||introD||driveDir<0)return;const a=Math.min(s0,s),b=Math.max(s0,s);
  for(const k of DN.lev){if(k.s<a||k.s>b)continue;if(Math.abs(lat)>ROAD_HALF)return;const vm=vitMult(),vx=Math.abs(vA)*SPD*vm;if(vx*3.6<70)return; /* au pas : on roule sur la crête */
    /* (v2, MESURÉ au pilote : à l'élan de la pente MOYENNE, la caisse ne volait que 0,3-0,5 s — juste après la crête le ruban lissé descend encore à peine,
       et la pose se déclare dès 0,35 s si la caisse est à moins de 3 m du bitume) : la face est relue dans la route (DN.S) — l'élan qui pose la caisse à
       72 % de la face, et au moins celui qui la tient à plus de 4 m du bitume au bout de 0,35 s */
    const S9=DN.S,yAt=q=>{const f=Math.max(0,Math.min(S9.n-1.001,q/S9.ds)),i=Math.floor(f);return S9.y[i]+(S9.y[i+1]-S9.y[i])*(f-i);},g2=FALL_G*SPD*.5,y0=yAt(k.s);
    const t=Math.max(.9,Math.min(2.6,.72*Math.max(40,k.e-k.s)/Math.max(1,vx))),D=y0-yAt(k.s+vx*t),d35=y0-yAt(k.s+vx*.35);
    frameAt(k.s,DN_LF);const ty=DN_LF.t.y; /* (v3) la pente RÉELLE du ruban à la lèvre : lissée, elle plonge déjà un peu — compter +4 % retirait jusqu'à 7 m/s à l'élan */
    const vy=Math.min(24,Math.max((g2*t*t-D)/t,(4+g2*.1225-d35)/.35)),u=THREE.MathUtils.clamp(vy/SPD-ty*Math.abs(vA)*vm,0,60);DN.dbgLev={vx:+vx.toFixed(1),vy:+vy.toFixed(1),u:+u.toFixed(1),ty:+ty.toFixed(3),t:+t.toFixed(2),D:+D.toFixed(1),d35:+d35.toFixed(1)};
    rampCd=1.2;startFall(u,1);shake=Math.max(shake,.35);try{hap([8,14]);}catch(e){}DN.sauts=(DN.sauts|0)+1;return;}}
/* EN VOL : le sable, l'eau de l'oasis, les obélisques et la pyramide tuent (5 points de caisse) — renvoie la cause, ou '' */
const DN_H9={};
function dunesHeurt(p){if(!DN.on||!DN.Z)return '';
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1],h=dnHauteur(x,z,DN_H9);if(p.y<h+.7)return DN_H9.eau?'oasis':'sable';}
  return dnMonuHeurt(p);}
function dnMonuHeurt(p){
  for(const b of DN.ob){const dx=p.x-b.x,dz=p.z-b.z,t=Math.max(0,Math.min(1,(p.y-b.y)/b.h)),rr=b.r*(1.35-.69*t)+1.2;if(dx*dx+dz*dz<rr*rr&&p.y>b.y-2&&p.y<b.y+b.h+1)return 'obelisque';}
  const P=DN.pyr;if(P){const dx=p.x-P.x,dz=p.z-P.z,ca=Math.cos(P.a),sa=Math.sin(P.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca));
    if(p.y>P.y-20&&p.y<P.y+P.h+1&&e<P.hw*(1-(p.y-P.y)/P.h)+1.5)return 'pyramide';}
  return '';}
/* ---- LES DÉCORS (low-poly à facettes : une face, une normale) — la même lumière que le sable et la même ombre (DN_MVS lit la grille de l'ombre) ---- */
const DN_MVS=['uniform sampler2D uTS;uniform vec4 uSD;uniform vec2 uSN;varying vec3 vW,vN,vCol;varying float vLit;','#include <fog_pars_vertex>',DN_TB,
  'void main(){','#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(mw)*normal);',
  '#ifdef USE_COLOR','  vCol=color;','#else','  vCol=vec3(1.);','#endif',
  '  float lit=1.;vec2 sp=(wp.xz-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-3.,hs+8.,wp.y);}vLit=lit;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const DN_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uShd,uFillC,uFillD;uniform float uFlash;varying vec3 vW,vN,vCol;varying float vLit;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;float ndl=max(dot(N,uSunD),0.);vec3 c=vCol*vCol;c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,1.25),0.);',
  '  vec3 L=uSunC*ndl*vLit+mix(uGnd,uSky,N.y*.5+.5)+uFillC*max(dot(N,uFillD),0.)*.5;vec3 o=c*L;o=mix(o,o*uShd,(1.-vLit*min(1.,ndl*3.))*.45);',
  '#ifdef DN_OR','  {vec3 V=normalize(cameraPosition-vW),R=reflect(-uSunD,N);o+=c*uSunC*pow(max(dot(R,V),0.),24.)*1.8*vLit+c*mix(uGnd,uSky,.6)*.4*pow(1.-max(dot(N,V),0.),2.);}','#endif',
  '  o+=uFlash*c*.4;gl_FragColor=vec4(o,1.);','#include <fog_fragment>','}'].join('\n');
function dnMats(){if(DN.mm)return DN.mm;const U=DN.mat.uniforms;
  const mk=or=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_MVS,fragmentShader:DN_AFS,fog:true,vertexColors:true,side:THREE.DoubleSide});if(or)m.defines={DN_OR:''};m.dispose=function(){};return m;};
  DN.mm={t:mk(false),g:mk(true)};return DN.mm;}
function dnGeo(){const P=[],C=[];
  const tri=(a,b,c,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const v=.92+.16*Math.abs(Math.sin(P.length*.731));for(let k=0;k<3;k++)C.push(col[0]*v,col[1]*v,col[2]*v);};
  const quad=(a,b,c,d,col)=>{tri(a,b,c,col);tri(a,c,d,col);};
  // un tronc de prisme à n pans : du rayon r0 (hauteur y0, centre o0) au rayon r1 (y1, o1) — r1 = 0 : une pointe
  const prisme=(n,y0,y1,r0,r1,col,o0,o1,rot)=>{o0=o0||[0,0];o1=o1||o0;rot=rot||0;const p=(a,y,r,o)=>[o[0]+Math.cos(a)*r,y,o[1]+Math.sin(a)*r];
    for(let k=0;k<n;k++){const a1=rot+k/n*6.2832,a2=rot+(k+1)/n*6.2832;if(r1>0)quad(p(a1,y0,r0,o0),p(a1,y1,r1,o1),p(a2,y1,r1,o1),p(a2,y0,r0,o0),col);else tri(p(a1,y0,r0,o0),[o1[0],y1,o1[1]],p(a2,y0,r0,o0),col);}};
  const fin=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;};
  return {tri:tri,quad:quad,prisme:prisme,fin:fin};}
function dnGeos(){if(DN.geos)return DN.geos;const G9={};
  {const g=dnGeo(),pi4=Math.PI/4,pierre=[.30,.44,.78],sombre=[1,.80,.34]; /* (MESURÉ à la photo : en grès, l'obélisque se perdait dans le sable — LAPIS-LAZULI cerclé d'or : le teal contre l'or de la DA) */g.prisme(4,0,.04,1.42,1.36,sombre,null,null,pi4);     // L'OBÉLISQUE (r = 1, h = 1) : le socle, le fût en trois tambours
    g.prisme(4,.04,.36,1,.89,pierre,null,null,pi4);g.prisme(4,.36,.38,.89,.885,sombre,null,null,pi4);g.prisme(4,.38,.64,.885,.79,pierre,null,null,pi4);g.prisme(4,.64,.66,.79,.785,sombre,null,null,pi4);g.prisme(4,.66,.90,.785,.70,pierre,null,null,pi4);G9.ob=g.fin();}
  {const g=dnGeo();g.prisme(4,.90,1,.70,0,[1,.80,.32],null,null,Math.PI/4);G9.obOr=g.fin();}                                      // son pyramidion d'or
  {const g=dnGeo(),pi4=Math.PI/4,c1=[.98,.80,.54],c2=[.92,.72,.46];                                                                  // LA PYRAMIDE (demi-base 1, h 1) : des assises en gradins doux
    for(let k=0;k<6;k++){const y0=k*.155,y1=(k+1)*.155,r0=(1-y0)*1.4142,r1=(1-y1)*1.4142;g.prisme(4,y0,y1,r0,r1,k&1?c2:c1,null,null,pi4);}
    g.prisme(4,.93,.94,.07*1.4142,.06*1.4142,c2,null,null,pi4);G9.pyr=g.fin();}
  {const g=dnGeo();g.prisme(4,.94,1,.06*1.4142,0,[1,.82,.30],null,null,Math.PI/4);G9.pyrOr=g.fin();}                               // la coiffe d'or
  {const g=dnGeo(),n9=[.13,.09,.07],n8=[.18,.12,.09];g.prisme(5,0,.42,.06,.04,n9,[0,0],[.05,.02]);                                   // L'ACACIA MORT (h = 1) : le tronc tordu, les branches
    for(const [ax,az,l,y] of [[.9,.3,.55,.40],[-.7,.6,.5,.38],[.2,-.95,.45,.42],[-.4,-.5,.38,.55],[.6,.75,.35,.6]]){const ex=.05+ax*l,ez=.02+az*l;g.prisme(4,y,y+.28+l*.4,.03,.012,n8,[.05,.02],[ex,ez]);}
    G9.arb=g.fin();}
  {const g=dnGeo(),tr=[.52,.38,.24],tr2=[.44,.31,.19],ve=[.22,.52,.16],ve2=[.16,.42,.12];let ox=0;                                    // LE PALMIER (h = 1) : le stipe qui penche, sept palmes qui retombent
    for(let k=0;k<5;k++){const y0=k*.18,y1=(k+1)*.18,o0=ox;ox+=.025+k*.012;g.prisme(5,y0,y1,.032-k*.003,.029-k*.003,k&1?tr2:tr,[o0,0],[ox,0]);}
    for(let k=0;k<7;k++){const a=k/7*6.2832+.3,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,c0=[ox,.90,0],m=[ox+ca*.22,.98,sa*.22],e=[ox+ca*.42,.80,sa*.42],w=.07;
      g.tri(c0,[m[0]+px*w,m[1],m[2]+pz*w],m,k&1?ve:ve2);g.tri(c0,m,[m[0]-px*w,m[1],m[2]-pz*w],k&1?ve2:ve);g.tri(m,[m[0]+px*w,m[1],m[2]+pz*w],e,ve2);g.tri(m,e,[m[0]-px*w,m[1],m[2]-pz*w],ve);}
    G9.pal=g.fin();}
  {const g=dnGeo(),ro=[.80,.58,.36],ro2=[.70,.48,.28],q=(x,y,z,sx,sy,sz,col)=>g.prisme(4,y,y+sy,Math.hypot(sx,sz)*.5,Math.hypot(sx,sz)*.5,col,[x,z],[x,z],Math.PI/4); // LE CHAMEAU (h ≈ 1, long ≈ 1,1, vers +z)
    q(0,.52,0,.30,.22,.62,ro);g.prisme(4,.74,.96,.17,.0,ro2,[0,-.02],[0,.0]);                                                         // le corps, la bosse
    g.prisme(4,.62,.92,.07,.05,ro,[0,.30],[0,.44]);g.prisme(4,.92,1,.06,.05,ro2,[0,.44],[0,.56]);                                     // le cou, la tête
    for(const [x,z] of [[.10,.22],[-.10,.22],[.10,-.22],[-.10,-.22]])g.prisme(4,0,.54,.035,.045,ro2,[x,z],[x,z]);                    // les quatre jambes
    G9.cha=g.fin();}
  DN.geos=G9;return G9;}
function dnMonuments(seed){
  if(DN.grp){for(const o of DN.grp.children.slice())DN.grp.remove(o);}
  const M9=dnMats(),G9=dnGeos(),S=DN.S,K=Math.sqrt(lvPiste()),rg=mulberry32((seed^0x7A55)>>>0),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0),v9=new THREE.Vector3(),s9=new THREE.Vector3();DN.grp.visible=true;
  const inst=(geo,mat,L9,nom)=>{if(!L9.length)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  // LES OBÉLISQUES et leurs pyramidions
  {const L9=DN.ob.map(function(b){return [b.x,b.y,b.z,b.r,b.a,b.h,b.r];});inst(G9.ob,M9.t,L9,'obélisques');inst(G9.obOr,M9.g,L9,'pyramidions');}
  // LA GRANDE PYRAMIDE
  if(DN.pyr){const P=DN.pyr,L9=[[P.x,P.y,P.z,P.hw,P.a,P.h,P.hw]];inst(G9.pyr,M9.t,L9,'pyramide');inst(G9.pyrOr,M9.g,L9,'coiffe');}
  // LES ACACIAS MORTS de la vallée (sur l'argile, sous la route)
  {const L9=[],N9=PAL.b('dnArbres',140),a0=DN.sQ.vlei0,a1=DN.sQ.vlei1,o9={};
   if(S&&a0!=null&&a1!=null)for(let k=0;k<N9*8&&L9.length<N9;k++){const s0=a0-200+rg()*(a1-a0+400),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+14+rg()*rg()*380*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=(6+rg()*7)*(1+.3*rg());if(o9.eau)continue;
     if(dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.4,z,ht,rg()*6.28]);}
   inst(G9.arb,M9.t,L9,'acacias');DN.nArb=L9.length;}
  // LES PALMIERS de l'oasis (sur la rive)
  {const L9=[],N9=PAL.b('dnPalmes',48),A9=DN.oa,o9={};
   if(A9)for(let k=0;k<N9*10&&L9.length<N9;k++){const an=rg()*6.2832,rr=(1.03+rg()*.42)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),ht=(13+rg()*10)*(1+.2*rg());
     if(o9.eau||dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}
   inst(G9.pal,M9.t,L9,'palmiers');DN.nPal=L9.length;}
  // LES CARAVANES : sept chameaux en file sur une crête, à 70-140 m de la route (la crête du Grand Erg, la vallée morte, la deuxième crête)
  DN.car=[];DN.carIm=null;
  {const L9=[];for(const nm of ['erg0','vlei0','cr2a']){const s0=DN.sQ[nm];if(s0==null||!S)continue;const i=Math.max(0,Math.min(S.n-1,Math.round((s0+160)/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+(70+rg()*70)*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,dir=Math.atan2(S.tx[i],S.tz[i])+(rg()<.5?0:Math.PI)+(rg()-.5)*.6;
     DN.car.push({x:x,z:z,a:dir,t:rg()*60,n:7});for(let k=0;k<7;k++)L9.push([x,0,z,3.4,dir]);}
   if(L9.length){DN.carIm=inst(G9.cha,M9.t,L9,'caravanes');if(DN.carIm){DN.carIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);DN.carT=0;dnCaravane(0,true);}}}
  DN.grp.updateMatrixWorld(true);}
function dnPresRoute(x,z,lat,y){const S=DN.S;if(!S)return false;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lat*lat&&y>S.y[i]-THICK-60)return true;}return false;} // un décor trop près d'une dalle (et pas loin dessous)
/* LES CARAVANES marchent (1,3 m/s, un pas qui balance) : la hauteur du sable relue chaque image pour les quatorze bêtes — seulement si on est assez près */
const DN_CT={m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),s:new THREE.Vector3(3.4,3.4,3.4)}; // (rien d'alloué dans la boucle)
function dnCaravane(dt,force){const im=DN.carIm;if(!im||!DN.on||!DN.Z)return;
  if(!force){if(paused)return;const p=carGroup.position;let pres=false;for(const c of DN.car)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<2200)pres=true;if(!pres)return;}
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.car){c.t=(c.t+dt*1.3)%140;const ca=Math.sin(c.a),cz=Math.cos(c.a);
    for(let j=0;j<c.n;j++){const d=c.t-j*8.5,x=c.x+ca*d,z=c.z+cz*d,ph=(c.t+j*2.3)*2.2,h=dnHauteur(x,z);
      e9.set(Math.sin(ph)*.035,c.a,Math.sin(ph*.5)*.03);q9.setFromEuler(e9);mt.compose(v9.set(x,h-.15+Math.abs(Math.sin(ph))*.12,z),q9,s9);im.setMatrixAt(k++,mt);}}
  im.instanceMatrix.needsUpdate=true;}
/* LE SABLE QUI VOLE (le VENT DE SABLE, la TEMPÊTE) : des grains dans une boîte de 260 m qui suit la caméra, poussés par le vent de la map (DN.vent), qui
   tourbillonnent un peu — leur force est dnQ.z de l'ambiance (0 ailleurs : invisibles). Une instance, le mouvement dans le sommet, aucune allocation. */
const DN_PART_VS=['attribute vec4 aR;uniform float uTime,uK,uPx;uniform vec3 uBoxC,uVent,uCol;varying float vA;varying vec3 vC;',
  'void main(){vec3 B=vec3(260.,70.,260.);',
  '  vec3 pa=uVent*uTime*(.7+.6*aR.w)+vec3(sin(uTime*1.3+aR.y*9.)*3.,sin(uTime*.9+aR.x*7.)*2.5,cos(uTime*1.1+aR.z*8.)*3.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  vA=smoothstep(0.,.10,e)*uK*(.35+.65*aR.w);vC=uCol*(.8+.4*aR.z);',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.003?0.:(1.4+aR.z*1.8)*uPx*300./max(1.,-mv.z);}'].join('\n');
const DN_PART_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);if(vA*a<.004)discard;gl_FragColor=vec4(vC,min(1.,vA*a*1.4));}'].join('\n');
const DN_V=new THREE.Vector3();
function dnPart(){if(DN.part)return DN.part;const n=PAL.b('dnPart',1600),R=mulberry32(0x5AB1E),g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
  const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uK:{value:0},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uVent:{value:new THREE.Vector3(1,0,0)},uCol:{value:new THREE.Color()}},
    vertexShader:DN_PART_VS,fragmentShader:DN_PART_FS,transparent:true,depthWrite:false});m.dispose=function(){};
  const p=new THREE.Points(g,m);p.name='dunes sable';p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return DN.part=p;}
function dnPartTick(dt,c){const k9=DN.on&&started&&c.dnQ?c.dnQ[2]:0;if(!(k9>.01)&&!(DN.part&&DN.part.visible))return;
  const P9=dnPart(),u=P9.material.uniforms;P9.visible=k9>.01;if(!P9.visible)return;u.uK.value=k9;if(!paused)u.uTime.value=(u.uTime.value+dt)%600;u.uPx.value=renderer.getPixelRatio();
  camera.getWorldDirection(DN_V);u.uBoxC.value.copy(camera.position).addScaledVector(DN_V,60);u.uVent.value.set(DN.vent[0],-.04,DN.vent[1]).multiplyScalar(14+24*k9);if(c.dnH)u.uCol.value.fromArray(c.dnH).multiplyScalar(1.3);}
function dunesChauffe(){ // au menu (chauffeDivers) : le sable et les décors compilés et dessinés une fois hors écran — 0 programme en course
  if(!DUNES_OK)return;dnTerrain();const m=DN.mesh,v=m.visible,n=DN.geo.instanceCount;DN.geo.instanceCount=1;DN.aN.array[2]=64;m.visible=true;
  const M9=dnMats(),g9=new THREE.Group(),bx9=new THREE.BoxGeometry(1,1,1),c9=new Float32Array(bx9.attributes.position.count*3).fill(1);bx9.setAttribute('color',new THREE.BufferAttribute(c9,3));
  for(const mt of [M9.t,M9.g]){g9.add(new THREE.Mesh(bx9,mt));const im=new THREE.InstancedMesh(bx9,mt,1);im.setMatrixAt(0,new THREE.Matrix4());g9.add(im);}
  g9.traverse(function(o){o.frustumCulled=false;});scene.add(g9);const P9=dnPart(),pv=P9.visible;P9.visible=true;
  try{chauffeRendu([m,g9,P9]);}finally{m.visible=v;DN.geo.instanceCount=n;scene.remove(g9);bx9.dispose();P9.visible=pv;}}
window.dbgDunes=function(k,a,b,c,d){
  if(k==='test'){if(!DN.on)return 'pas de dunes';let dessus=0,dessous=0,pire=1e9,ou=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,h=dnHauteur(x,z);
      if(h>y-THICK-1.5){dessous++;if(ou.length<40)ou.push('D'+s9+(lt?(lt>0?'d':'g'):'c')+'('+(y-THICK-h).toFixed(1)+')');}if(h>y+1.5){dessus++;if(ou.length<40)ou.push(s9+(lt?(lt>0?'d':'g'):'c'));}pire=Math.min(pire,y-THICK-h);}}
    let mo=0;for(let s9=0;s9<L;s9+=10){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){F9.p.addScaledVector(F9.b,lt);F9.p.y+=1;if(dnMonuHeurt(F9.p))mo++;F9.p.y-=1;F9.p.addScaledVector(F9.b,-lt);}}
    return {dessus:dessus,dessous:dessous,margeMin:+pire.toFixed(1),decorsSurLaRoute:mo,sep:DN.sep,ou:ou.join(' ')};}
  if(k==='raccourcis')return DN.rac||[];
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='vue'||k==='vueA'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9);const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(d!=null?d:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  return {on:DN.on,ms:DN.ms,noeuds:DN.n,sep:DN.sep,rmin:DN.rmin,F:DN.F?[DN.F.nx,DN.F.nz,DN.F.ts]:null,Z:DN.Z?[DN.Z.nx,DN.Z.nz,DN.Z.ts]:null,O:DN.O?[DN.O.nx,DN.O.nz,DN.O.ts]:null,
    ciel:CIEL2.mode,attente:!!DN.attente,sQ:DN.sQ,L:Math.round(L),obelisques:DN.ob.length,pyramide:!!DN.pyr,acacias:DN.nArb|0,palmiers:DN.nPal|0,caravanes:DN.car.length,oasis:DN.oa?{r:Math.round(DN.oa.r),y:Math.round(DN.oa.y)}:null,
    levres:(DN.lev||[]).length,sauts:DN.sauts|0,levre:DN.dbgLev||null,vent:DN.vent.map(v=>+v.toFixed(2)),lam:Math.round(DN.lam),soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+DN.ombre.toFixed(2),dunes:+(LVL.dunes||0).toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    carHaut:DN.on?+(carGroup.position.y-dnHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
/* <<<FIN DUNES>>> */
