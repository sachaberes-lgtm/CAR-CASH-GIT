/* LA HAUTEUR DU RELIEF — la même que la puce (cyHt du shader), lue dans les mêmes données. `o` (facultatif) reçoit la roche, l'eau, le fond.
   `sans` : sans les corniches (le balayage de l'ombre). */
const CY_O9={};
function cyBil(d,nx,nz,stride,ch,px,pz){const qx=px-.5,qz=pz-.5,i=Math.floor(qx),j=Math.floor(qz),fx=qx-i,fz=qz-j,c=(a,b)=>d[(Math.max(0,Math.min(nz-1,b))*nx+Math.max(0,Math.min(nx-1,a)))*stride+ch];
  const A=c(i,j),B9=c(i+1,j),C9=c(i,j+1),D9=c(i+1,j+1);return (A+(B9-A)*fx)*(1-fz)+(C9+(D9-C9)*fx)*fz;}
function cyHauteur(x,z,o,sans){const Z=CY.Z,F=CY.F;o=o||CY_O9;
  const zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts,P0=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz);o.fond=cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz);
  let P=P0+(16*(cyNz(x/620,z/620,2)-.5)+6*(cyNz(x/190,z/190,3)-.5))*Math.max(0,Math.min(1,(P0-o.fond)/200)),rk=cyBil(Z.d,Z.nx,Z.nz,4,3,zx,zz);o.plat=P;o.eau=0;
  if(cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz)>.003){const r9={rk:rk};P+=cyButtesH(x,z,r9);rk=r9.rk;}
  let h=P,dep=0,cb=1e5;
  const fx=(x-(F.x0-F.ts*.5))/(F.nx*F.ts),fz=(z-(F.z0-F.ts*.5))/(F.nz*F.ts);
  if(fx>0&&fz>0&&fx<1&&fz<1){const px=fx*F.nx,pz=fz*F.nz,c=cyBil(F.c,F.nx,F.nz,2,0,px,pz),g=cyBil(F.c,F.nx,F.nz,2,1,px,pz);
    if(c<P+8||g>P-8){const mg=cyBil(F.m,F.nx,F.nz,4,1,px,pz)/255;
      if(c<P+8){const k=Math.max(0,Math.min(1,(P-c)/6+.5));rk=rk+(mg-rk)*k;h=Math.min(P,c);dep=cyBil(F.m,F.nx,F.nz,4,0,px,pz)/10*k;cb=c;}
      if(g>h){h=g;rk=mg;dep=0;}}}
  if(!sans&&rk>.01){const n0=cyNz(x/2300,z/2300,0),n1=cyNz(x/2300,z/2300,1),S9=15+11*n0,of=70*n1,u=(h+of)/S9,f=u-Math.floor(u),e=f<.5?0:f>.93?1:((f-.5)/.43)*((f-.5)/.43)*(3-2*(f-.5)/.43);
    h=h+(((Math.floor(u)+e)*S9-of)-h)*rk;}
  if(dep>.03){const W=cb+dep;if(W>h){o.eau=1;h=W;}}
  o.rk=rk;return h;}
function cyHauteurVite(x,z){const Z=CY.Z,F=CY.F,zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts;let P=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz);
  if(cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz)>.003)P+=cyButtesH(x,z,CY_O9);
  const px=(x-(F.x0-F.ts*.5))/F.ts,pz=(z-(F.z0-F.ts*.5))/F.ts;if(px>0&&pz>0&&px<F.nx&&pz<F.nz){const i=Math.floor(px),j=Math.floor(pz),o=(j*F.nx+i)*2,c=F.c[o],g=F.c[o+1];if(c<P)P=c;if(g>P)P=g;}
  return P;}
function cyButtesH(x,z,o){const CS=760,c0x=Math.floor(x/CS),c0z=Math.floor(z/CS),BG=CY.bg;let hb=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const gx=c0x+i-BG.cx0,gz=c0z+j-BG.cz0;if(gx<0||gz<0||gx>=BG.nx||gz>=BG.nz)continue;const bi=BG.i[gz*BG.nx+gx];if(bi<0)continue;const b=CY.buttes[bi];
    const qx=x-b.x,qz=z-b.z,an=Math.atan2(qz,qx);let d=Math.hypot(qx,qz)/b.rad;d*=1+.10*Math.sin(an*3+b.p3*6.2832)+.05*Math.sin(an*7+b.p4*6.2832);
    const bb=d<.9?1:(d<1.05?1-.72*(d-.9)/.15:.28*Math.pow(Math.max(0,1-(d-1.05)/.85),2)),hh=bb*b.ht;
    if(hh>hb){hb=hh;o.rk=Math.max(o.rk,d<.86?.2:(d<1.12?1:.45));}}
  return hb;}
/* (2026-10-15, Sacha : « retravaille les textures du canyon, des trucs plus lisses avec des couleurs plus saturées ») LA ROCHE LISSE :
   le grain fin (5 m), le bruit de 31 m et le litage sombre tous les 2,4 m faisaient du SABLE à l'écran — ils sont ramenés à un souffle, la
   variation passe au bruit large (170 m) ; les bruits et les strates ont leurs MIPMAPS (plus de scintillement au loin) ; la pierre et le
   sable sont SATURÉS (×1,32 autour de la luminance), le maquis plus vert. Les hauteurs ne bougent pas (le sommet lit toujours le niveau 0).
   */
/* ---- LE TERRAIN À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const CY_VS=['attribute vec4 aN;uniform sampler2D uTC,uTM,uTZ,uTS,uRND,uNZ;uniform vec4 uFD,uZD,uSD;uniform vec2 uFN,uZN,uSN;uniform vec3 uCam;uniform float uG,uR0;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_vertex>',
  'vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}',
  'float gF,gP,gV,gO;',
  'float cyButte(vec2 x,inout float rk){const float CS=760.;vec2 c0=floor(x/CS);float hb=0.;',
  '  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=c0+vec2(float(i),float(j));vec4 R=texture2D(uRND,(mod(c,256.)+.5)/256.);',
  '    vec2 ct=(c+.22+.56*R.yz)*CS;vec2 zq=clamp(floor((ct-uZD.xy)*uZD.zw*uZN),vec2(0.),uZN-1.);float dc=texture2D(uTZ,(zq+.5)/uZN).b;',
  '    if(dc<.01||R.x>dc*.85)continue;vec4 R2=texture2D(uRND,(mod(c+vec2(101.,37.),256.)+.5)/256.);',
  '    float rad=70.+200.*R2.x*R2.x,ht=(150.+300.*R2.y)*(rad<115.?1.3:1.);vec2 q=x-ct;float an=atan(q.y,q.x),d=length(q)/rad;',
  '    d*=1.+.10*sin(an*3.+R2.z*6.2832)+.05*sin(an*7.+R2.w*6.2832);',
  '    float b=d<.9?1.:(d<1.05?1.-.72*(d-.9)/.15:.28*pow(max(0.,1.-(d-1.05)/.85),2.));float hh=b*ht;if(hh>hb){hb=hh;rk=max(rk,d<.86?.2:(d<1.12?1.:.45));}}',
  '  return hb;}',
  'vec4 cyHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float rk=Z.a,P=Z.r+(16.*(texture2D(uNZ,x/620.).b-.5)+6.*(texture2D(uNZ,x/190.).a-.5))*clamp((Z.r-Z.g)/200.,0.,1.);if(Z.b>.003)P+=cyButte(x,rk);',
  '  float h=P,dep=0.,cb=1e5;gF=Z.g;gP=Z.r;gV=0.;gO=0.;vec2 fp=(x-uFD.xy)*uFD.zw;',
  '  if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);',
  '    if(C.r<P+8.||C.g>P-8.){vec4 M=tB(uTM,fp*uFN,uFN);',
  '      if(C.r<P+8.){float k=clamp((P-C.r)/6.+.5,0.,1.);rk=mix(rk,M.g,k);h=min(P,C.r);dep=M.r*25.5*k;cb=C.r;gV=M.b*k;gO=M.a*k;}',
  '      if(C.g>h){h=C.g;rk=M.g;dep=0.;}}}',
  '  if(rk>.01){vec4 n=texture2D(uNZ,x/2300.);float S=15.+11.*n.r,o=70.*n.g,u=(h+o)/S,f=fract(u);h=mix(h,(floor(u)+smoothstep(.50,.93,f))*S-o,rk);}',
  '  float w=0.;if(dep>.03){float W=cb+dep;if(W>h){w=clamp((W-h)*3.,0.,1.);h=W;}}',
  '  return vec4(h,rk,w,dep);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=cyHt(x);float fl=gF,pl=gP,vg=gV,fo=gO,e=S/uG*(1.+k)*'+('2.2')+';',
  '  float hx=cyHt(x+vec2(e,0.)).x,hz=cyHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-4.,hs+10.,A.x);}',
  '  vA=vec4(A.z,A.w,A.y,lit);vB=vec4(vg,fo,clamp((pl-A.x)/max(pl-fl,40.),0.,1.),fl);',
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const CY_FS=['uniform sampler2D uNZ,uSTR;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uBnc,uRkT,uWS,uWD,uSkH,uSkZ,uMist,uMud,uPhP,uPhD,uPhC;uniform vec4 uQ;uniform float uTime,uFlash,uWet;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN),Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/max(dist,.001);',
  '  float wat=vA.x,dep=vA.y,rk=clamp(vA.z,0.,1.),lit=clamp(vA.w,0.,1.),veg=vB.x,fo=vB.y,dk=clamp(vB.z,0.,1.),fl=vB.w,stp=clamp(1.-N.y,0.,1.);',
  '  float uw=dot(vW.xz,normalize(vec2(-N.z,N.x)+1e-4)),wl=smoothstep(.10,.30,stp);vec4 n0=texture2D(uNZ,vW.xz/2600.),n1=mix(texture2D(uNZ,vW.xz/170.),texture2D(uNZ,vec2(uw,vW.y)/170.),wl),n2=mix(texture2D(uNZ,vW.xz/31.),texture2D(uNZ,vec2(uw,vW.y)/31.),wl),nv=texture2D(uNZ,vec2(uw/140.,vW.y/70.));', /* sur une paroi le bruit se déroule le long du mur : plus de fenêtres étirées */
  /* LES STRATES : la colonne relue à la hauteur, gondolée par deux bruits (les couches ondulent et plongent doucement) */
  '  float sy=(vW.y+34.*(n0.r-.5)+4.*(n1.g-.5))/'+('3.7')+';vec4 st=texture2D(uSTR,vec2(.5,sy/1024.));'+('vec3 rc=st.rgb*st.rgb*(.95+.10*n1.b);rc=max(mix(vec3(dot(rc,vec3(.3,.55,.15))),rc,1.32),0.);'),
  '  float lb=fract(vW.y*.42+n1.b*.6);rc*=1.-'+('(.025+.035*st.a)*smoothstep(.65,1.,lb)')+'*rk;', // le litage des grès, horizontal
  '  float vr=smoothstep(.55,.82,nv.r)*smoothstep(.35,.8,stp)*rk;rc=mix(rc,rc*vec3(.74,.62,.60),vr*.28);', // le VERNIS du désert
  '  vec3 sab='+('vec3(.95,.50,.29)*(.96+.08*n1.r)')+';float top=smoothstep(.72,.9,N.y);vec3 col=mix(rc,mix(rc,sab,.62),top*rk);',
  '  col=mix(col,'+('vec3(.10,.19,.03),smoothstep(.64,.86,n1.a)*top*.55')+');', // le maquis sur les replats
  '  float bas=1.-smoothstep(.2,.5,rk);vec3 sol=sab*('+('.98+.03')+'*sin(dot(vW.xz,vec2(.83,.41))*1.6+n2.g*5.));col=mix(col,sol,bas*(1.-wat));',
  '  col=mix(col,mix(vec3(.05,.10,.03),vec3(.16,.24,.06),n1.r),veg*smoothstep(.42,.58,n2.g)*(1.-wat));', // la ripisylve
  '  col*=uRkT*(1.-.35*uWet*(1.-wat));',
  '  float ndl=max(dot(N,uSunD),0.);',
  '  vec3 Lc=uSunC*ndl*lit+mix(uGnd,uSky,N.y*.5+.5)*(1.-.5*dk)+uBnc*(1.-.65*lit)*(.35+.65*dk)*(.55+.45*stp)+uFillC*max(dot(N,uFillD),0.)*.6+(uSunC*.10+uSky*.22+uBnc*.18)*(.55+.45*stp);', /* le plancher : l'ombre d'un désert reste claire (ciel + rebond), jamais noire */
  '  if(dist<220.){float gr=texture2D(uNZ,vec2(uw,vW.y)/5.3).g*wl+texture2D(uNZ,vW.xz/5.3).g*(1.-wl);col*=1.+(gr-.5)*'+('.06')+'*(1.-smoothstep(90.,220.,dist));}',
  '  vec3 c=max(col*Lc,col*vec3(.36,.26,.25)*(.5+.5*lit)+col*uSky*.22);', /* jamais de noir franc : un grès à l'ombre reste brun */
  '  c*=mix(vec3(1.),vec3(.80,.70,1.04),(1.-lit)*.55*rk);', // l'ombre de la roche tire au VIOLET (la bible)
  '  if(wat>.01){vec4 nw=texture2D(uNZ,vW.xz/16.+uTime*vec2(.021,.033)),nw2=texture2D(uNZ,vW.xz/41.-uTime*vec2(.013,.008));',
  '    vec3 Nw=normalize(N*3.+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.)*(1.-stp));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.5));wc=mix(wc,uMud,uQ.w);',
  '    float fr=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));sk=mix(sk,uBnc*1.6+col*.4,dk*.55);',
  '    vec3 cw=wc*(uSunC*(.25+.75*ndl)*lit+mix(uGnd,uSky,.7))*.9+sk*fr+uSunC*pow(max(dot(R,uSunD),0.),180.)*2.*lit;',
  '    float ec=max(fo,smoothstep(.22,.55,stp)),sk2=smoothstep(.35,.75,texture2D(uNZ,vec2(dot(vW.xz,normalize(vec2(-N.z,N.x)+1e-4))/23.,vW.y/31.+uTime*.55)).r);',
  '    cw=mix(cw,vec3(.92,.94,.95)*(mix(uGnd,uSky,.6)+uSunC*.7*lit),clamp(ec*(.55+.45*sk2)+smoothstep(1.2,.2,dep)*.25,0.,1.));c=mix(c,cw,wat);}',
  '  if(uWet>.01&&wat<.5){vec2 ce=floor(vW.xz/40.),cc=(ce+.2+.6*vec2(fract(sin(dot(ce,vec2(12.9,78.2)))*43758.5),fract(sin(dot(ce,vec2(39.3,11.7)))*43758.5)))*40.;',
  '    float hf=fract(sin(dot(ce,vec2(7.1,113.3)))*43758.5),dd=length(vW.xz-cc),cf=step(hf,.20*uWet)*(1.-smoothstep(1.8,4.5,dd))*smoothstep(.45,.75,stp)*rk;',
  '    float fs=smoothstep(.30,.80,texture2D(uNZ,vec2(dd*.09+hf,vW.y/38.+uTime*1.25)).g);c=mix(c,vec3(.80,.84,.88)*(mix(uGnd,uSky,.6)*1.2+uSunC*.4),cf*(.45+.55*fs));',
  '    c*=1.-.25*uWet*smoothstep(.55,.8,nv.g)*stp*rk;}', // et les coulées sombres de l'averse sur la pierre
      '  c+=uFlash*col*vec3(.70,.76,1.)*(.35+.65*max(N.y,0.));',
      '  if(uPhC.r+uPhC.g>.001){vec3 lv=vW-uPhP;float dl=length(lv);vec3 ld=lv/max(dl,.01);c+=col*uPhC*smoothstep(.80,.95,dot(ld,uPhD))*max(dot(N,-ld),0.)/(1.+dl*dl/9000.);}', // les PHARES sur la roche
  '  c=mix(c,uMist,uQ.x*(1.-smoothstep(fl+4.,fl+uQ.y,vW.y))*(.35+.65*smoothstep(0.,450.,dist)));',
  '  c+=uWet*(1.-wat)*mix(uSkH,uSkZ,.5)*pow(1.-max(dot(V,N),0.),4.)*.25;',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
function cyTerrain(){ if(CY.mesh)return;
  cyBruits();
  const G=PAL.b('cyGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];CY.G=G;CY.R0=PAL.b('cyR0',118);
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  CY.aN=new THREE.InstancedBufferAttribute(new Float32Array(CY.maxN*4),4);CY.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',CY.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);CY.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTM:{value:CY.tRnd},uTZ:{value:z1},uTS:{value:z1},uRND:{value:CY.tRnd},uNZ:{value:CY.tNz},uSTR:{value:CY.tStr},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:CY.R0},uTime:{value:0},uFlash:{value:0},uWet:{value:0},uSunD:{value:SUN_DIR},
    uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},uFillC:{value:new THREE.Color()},uFillD:{value:new THREE.Vector3(0,-1,0)},
    uBnc:{value:new THREE.Color()},uRkT:{value:new THREE.Color(1,1,1)},uWS:{value:new THREE.Color()},uWD:{value:new THREE.Color()},uSkH:{value:new THREE.Color()},uSkZ:{value:new THREE.Color()},
    uMist:{value:new THREE.Color()},uMud:{value:new THREE.Color(.42,.27,.17)},uQ:{value:new THREE.Vector4()},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  CY.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_VS,fragmentShader:CY_FS,fog:true});CY.mat.dispose=function(){};
  const m=new THREE.Mesh(g,CY.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='canyon';m.renderOrder=-1;scene.add(m);CY.mesh=m;
  const gr=new THREE.Group();gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);CY.grp=gr;
}
/* LE QUADTREE (CDLOD), à chaque rendu (scene.onBeforeRender, chaîné) : un nœud se dessine à son niveau s'il est hors de la portée du niveau
   plus fin ; sinon il descend dans ses quatre enfants — un enfant hors de SA portée se dessine au niveau de l'enfant, entièrement morphé
   (il a alors la densité de son parent : pas de fissure). Portée du niveau l : R0·2^l (2D) ; nœuds de 64 m au niveau 0. */
function cySelect(cam){const M=CY.mesh;if(!M||!M.visible)return;
  CY.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);CY.fr.setFromProjectionMatrix(CY.pm);
  const cx=cam.position.x,cz=cam.position.z,R0=CY.R0,A=CY.aN.array,MAX=CY.maxN,y0=CY.yMin,y1=CY.yMax,bx=CY.box,L9=CY.lods;let n=0;
  const dR=(x0,z0,s)=>{const dx=Math.max(x0-cx,0,cx-x0-s),dz=Math.max(z0-cz,0,cz-z0-s);return Math.sqrt(dx*dx+dz*dz);};
  const add=(x0,z0,s,l)=>{if(n>=MAX)return;const o=n*4;A[o]=x0;A[o+1]=z0;A[o+2]=s;A[o+3]=l;n++;};
  const sel=(x0,z0,s,l)=>{const d=dR(x0,z0,s);if(d>R0*Math.pow(2,l))return false;
    bx.min.set(x0,y0,z0);bx.max.set(x0+s,y1,z0+s);if(!CY.fr.intersectsBox(bx))return true;
    if(l===0||d>R0*Math.pow(2,l-1)){add(x0,z0,s,l);return true;}
    const h=s/2;for(let q=0;q<4;q++){const qx=x0+(q&1)*h,qz=z0+(q>>1)*h;if(!sel(qx,qz,h,l-1))add(qx,qz,h,l-1);}return true;};
  const SR=CY.S0*Math.pow(2,L9),reach=Math.min(R0*Math.pow(2,L9),(cam.far||9800)+400);
  for(let ix=Math.floor((cx-reach)/SR);ix<=Math.floor((cx+reach)/SR);ix++)for(let iz=Math.floor((cz-reach)/SR);iz<=Math.floor((cz+reach)/SR);iz++){
    if(dR(ix*SR,iz*SR,SR)>reach)continue;if(!sel(ix*SR,iz*SR,SR,L9))add(ix*SR,iz*SR,SR,L9);}
  CY.n=n;CY.geo.instanceCount=n;CY.aN.updateRange.offset=0;CY.aN.updateRange.count=n*4;CY.aN.needsUpdate=true;
  CY.mat.uniforms.uCam.value.copy(cam.position);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{if(CY.on)cySelect(cam);}catch(e){window.__cyErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* LE SOLEIL DE L'HEURE — dans la boucle, avant les ombres : SUN_DIR = SUN_DIR0 → la direction de `cyA` (hauteur, azimut depuis +z vers +x),
   au fondu du niveau. Hors du canyon : SUN_DIR0 recopié au bit près (et ses deux vecteurs de base recalculés par les MÊMES opérations). */
function canyonSoleil(){const k=LVL.canyon||0,kv=VIT.solK||0; // (2026-10-17) + LA VILLE VITRÉE : le soleil de son heure (VIT_MET.sol) ; ailleurs, inchangé au bit près
  if(k<.001&&kv<.001){if(!SUN_DIR.equals(SUN_DIR0)){SUN_DIR.copy(SUN_DIR0);SUN_PERP.crossVectors(SUN_DIR,CY_UP).normalize();SUN_UP.crossVectors(SUN_PERP,SUN_DIR).normalize();
    RIM_DIR.copy(SUN_DIR).lerp(KICK_DIR,BIO.cur.rimK).normalize();}return;}
  const a=k>=kv?(BIO.cur.cyA||[6,-110,0,0]):VIT.sol,el=a[0]*Math.PI/180,az=a[1]*Math.PI/180;CY_SD.set(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  SUN_DIR.copy(SUN_DIR0).lerp(CY_SD,Math.max(k,kv)).normalize();SUN_PERP.crossVectors(SUN_DIR,CY_UP).normalize();SUN_UP.crossVectors(SUN_PERP,SUN_DIR).normalize();
  RIM_DIR.copy(SUN_DIR).lerp(KICK_DIR,BIO.cur.rimK).normalize();}
/* chaque image : les lumières de la scène dans la matière du relief, l'ambiance du canyon (BIO.cur.cy*), l'éclair — et l'ombre des parois
   SUR LA CAISSE (la clé baisse quand on passe dans l'ombre, le ciel quand on s'enfonce : seuls écrits du soleil et de l'hémisphère hors de
   bioApply, et seulement dans le canyon — rendus à leur valeur d'ambiance en sortant). */
function canyonTick(dt){
  if(!CY.mat)return;const U=CY.mat.uniforms,c=BIO.cur,k=LVL.canyon||0;
  if(CY.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(CY.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const q=c.cyL||[1,.6,.4];U.uBnc.value.setRGB(q[0],q[1],q[2]).multiplyScalar(sun.intensity*.16);
    if(c.cyT)U.uRkT.value.fromArray(c.cyT);if(c.cyW)U.uWS.value.fromArray(c.cyW);if(c.cyX)U.uWD.value.fromArray(c.cyX);if(c.cyH)U.uSkH.value.fromArray(c.cyH);if(c.cyZ)U.uSkZ.value.fromArray(c.cyZ);if(c.cyF)U.uMist.value.fromArray(c.cyF);
    const Q9=c.cyQ||[0,100,0,0];U.uQ.value.set(Q9[0],Q9[1],Q9[2],Q9[3]);U.uWet.value=Q9[2];U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value; /* l'éclair allume aussi le plafond du ciel */
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et sous l'orage
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}
    if(CY.rais){const N9=c.cyN||[0,1,1,0],ru=CY_RAI_M.uniforms;ru.uC.value.copy(sun.color).multiplyScalar(.10*sun.intensity*Math.max(0,SUN_DIR.y-.2)*(1-N9[3]));if(!paused)ru.uT.value=(ru.uT.value+dt)%4096;}}
  // l'ombre des parois sur la caisse
  let ombre=1,prof=0;
  if(CY.on&&CY.O&&started&&!gameOver){const p=carGroup.position,O=CY.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/14));}
    const Z=CY.Z,zx=(p.x-(Z.x0-Z.ts*.5))/Z.ts,zz=(p.z-(Z.z0-Z.ts*.5))/Z.ts,pl=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz),fo=cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz);prof=Math.max(0,Math.min(1,(pl-p.y)/Math.max(60,pl-fo)));}
  if(CY.mineT&&cyMineIci()){const M9=CY.mineT,d9=Math.min(s-M9.i0*CY.S.ds,M9.i1*CY.S.ds-s);if(d9>25){ombre=Math.min(ombre,.08);prof=1;}} // dans la MINE : le soleil et le ciel s'éteignent sur la caisse (passé 25 m de la bouche)
  if(CY.tunT&&CY.tunT.v2&&s>=CY.tunT.s0+25){ombre=Math.min(ombre,.3);prof=1;} // (2026-10-19) dans le TUNNEL DE GRÈS : à l'abri du soleil, sous ses anneaux
  CY.ombre+=(ombre-CY.ombre)*Math.min(1,dt*5);CY.prof+=(prof-CY.prof)*Math.min(1,dt*2);
  if(k>.001||CY.ecrit){const e=CY.on?k:0;sun.intensity=c.sunI*(1-.72*(1-CY.ombre)*e);hemi.intensity=c.hemiI*(1-.28*CY.prof*e);CY.ecrit=e>.001;}
}
/* EN VOL : la roche, l'eau et le fond tuent (5 points de caisse, comme les piliers de jade) — renvoie la cause, ou '' */
const CY_H9={};
function canyonHeurt(p){if(!CY.on||!CY.Z)return '';
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1],h=cyHauteur(x,z,CY_H9);if(p.y<h+.7)return CY_H9.eau?'riviere':CY_H9.rk>.35?'paroi':'canyon';}
  if(CY.monu&&cyMonuHeurt(p))return 'paroi';
  if(CY.couT&&cyCouloirHeurt(p,CY.couT))return 'paroi';
  if(CY.tunT){if(CY.tunT.v2){const c9=cyTun2Heurt(p,CY.tunT);if(c9)return c9;}else if(cyCouloirHeurt(p,CY.tunT))return 'paroi';} // (2026-10-19) le tunnel de grès : murs, voûte, dôme, fond du gouffre
  if(CY.mineT&&cyMineHeurt(p,CY.mineT))return 'paroi';
  return '';}
/* ---- LES MONUMENTS (2026-10-14, CANYON) — ce que le relief seul ne sait pas faire : LES MITAINES (les deux buttes à pouce de Monument
   Valley, de part et d'autre de la route au départ : des EMPREINTES dans la taille fine, canal G — elles montent du sol de la vallée), L'ARCHE
   (un pont naturel de grès qui enjambe la gorge, 120 m au-dessus de la dalle au plus bas) et LES CHEMINÉES DE FÉES (des centaines de
   colonnes à chapeau sur les gradins de l'amphithéâtre, en instances). Arche et cheminées prennent la MÊME matière que le relief (CY_FS,
   uniformes partagés) avec leur propre sommet (CY_MVS) : mêmes strates, même lumière, même ombre. Leur hauteur entre dans le balayage de
   l'ombre (elles ombrent la route), et elles TUENT en vol (cyMonuHeurt). Règle d'or : rien ne touche la dalle (vérifié par dbgCanyon('test')). */
function cyMitaines(S,F,sQ,K,r){
  const a=sQ.depart!=null?sQ.depart:0,b=sQ.breche0!=null?sQ.breche0:Math.min(L,600);if(b-a<120)return;
  const s9=a+(b-a)*.55,i=Math.min(S.n-1,Math.round(s9/S.ds)),tx=S.tx[i],tz=S.tz[i],px=-tz,pz=tx,K4=Math.pow(K,.8);
  const th=Math.atan2(tx,tz),dA=Math.abs(th)>1e-6?th:0; // (2026-10-19, LE CANYON AU HASARD) le cap de la Route 67 : les Mitaines se tournent avec elle (plein nord : 0, rien ne change)
  const M=[]; // [x, z, axe x, axe z, rx, rz, hauteur, pouce : côté le long du grand axe]
  for(const sg of [-1,1]){const lat=(sg<0?430:390)*K4,av=(sg<0?40:-60)*K4,cx=S.x[i]+px*sg*lat+tx*av,cz=S.z[i]+pz*sg*lat+tz*av,an=(sg<0?.35:-.5)+(r()-.5)*.3-dA;
    M.push({x:cx,z:cz,ax:Math.cos(an),az:Math.sin(an),rx:(118+r()*20)*K4,rz:(64+r()*10)*K4,h:(320+r()*40)*K4,pouce:sg});}
  {const lat=820*K4,cx=S.x[i]+px*(r()<.5?-1:1)*lat+tx*260*K4,cz=S.z[i]+pz*lat*(r()<.5?-1:1)+tz*260*K4;M.push({x:cx,z:cz,ax:Math.cos(dA),az:-Math.sin(dA),rx:190*K4,rz:120*K4,h:280*K4,pouce:0});} // la troisième, massive (une mesa), plus loin
  /* (2026-10-19, LE CANYON AU HASARD) LA RÈGLE D'OR DES MITAINES : elles sont posées à côté de la Route 67, mais la route peut tourner ensuite vers elles (la brèche, une
     dérive, un coude : MESURÉ, 4 canyons sur 40 passaient DANS une butte, 360 à 830 m sous sa cime). Une butte dont le pied (1,65 × son grand rayon : là où
     son talus tombe sous ~15 m ; le pouce : rx + 100 m) approche une route s'écarte de 60 m en 60 m, au plus 12 fois — sinon elle n'est pas posée. Aucun tirage ;
     la recette d'avant n'en a jamais besoin (sa route file droit sous les Mitaines : 390 m et plus). */
  for(let k=M.length-1;k>=0;k--){const m=M[k],R9=Math.max(1.65*Math.max(m.rx,m.rz),m.pouce?m.rx+100*K4:0)+ROAD_HALF+10,pres=()=>{for(let j=0;j<S.n;j+=2){const dx=S.x[j]-m.x,dz=S.z[j]-m.z;if(dx*dx+dz*dz<R9*R9)return true;}return false;};
    if(!pres())continue;let ux=m.x-S.x[i],uz=m.z-S.z[i];const ul=Math.hypot(ux,uz)||1;ux/=ul;uz/=ul;let n9=0;while(n9<12&&pres()){m.x+=ux*60;m.z+=uz*60;n9++;}if(pres())M.splice(k,1);}
  const fc=F.c,fm=F.m,TF=F.ts;CY.mit=[];
  for(const m of M){const base=cyHauteurVite(m.x,m.z)-4,R9=Math.max(m.rx,m.rz)*2.1+60;CY.mit.push({x:m.x,z:m.z,r:Math.max(m.rx,m.rz)*1.1,y0:base,y1:base+m.h});
    const th={x:m.x+m.ax*(m.rx+48*K4)*(m.pouce||0),z:m.z+m.az*(m.rx+48*K4)*(m.pouce||0),r:26*K4,h:m.h*.93};
    const j0=Math.max(0,Math.floor((m.z-R9-F.z0)/TF)),j1=Math.min(F.nz-1,Math.ceil((m.z+R9-F.z0)/TF)),i0=Math.max(0,Math.floor((m.x-R9-F.x0)/TF)),i1=Math.min(F.nx-1,Math.ceil((m.x+R9-F.x0)/TF));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const x=F.x0+jx*TF,z=F.z0+jz*TF,qx=x-m.x,qz=z-m.z,u=(qx*m.ax+qz*m.az)/m.rx,v=(-qx*m.az+qz*m.ax)/m.rz;
      let d=Math.sqrt(u*u+v*v);const an=Math.atan2(v,u);d*=1+.07*Math.sin(an*5+m.x*.01)+.04*Math.sin(an*11+m.z*.01)+.05*(cyNz(x/70,z/70,2)-.5);
      const prof=dd=>dd<.9?1:dd<1.04?1-.70*(dd-.9)/.14:.30*Math.pow(Math.max(0,1-(dd-1.04)/.95),2);
      let h=m.h*prof(d),rkm=d<.86?.25:d<1.1?1:.4;
      if(m.pouce){const tdx=x-th.x,tdz=z-th.z,dt=Math.sqrt(tdx*tdx+tdz*tdz)/th.r*(1+.06*Math.sin(Math.atan2(tdz,tdx)*4));const ht=th.h*(dt<.85?1:dt<1.1?1-.75*(dt-.85)/.25:.25*Math.pow(Math.max(0,1-(dt-1.1)/1.6),2));
        if(ht>h){h=ht;rkm=dt<.8?.3:1;}}
      if(h<2)continue;const o=jz*F.nx+jx,y=base+h;if(y>fc[o*2+1]){fc[o*2+1]=y;fm[o*4+1]=Math.round(rkm*255);if(y>CY.yMaxM)CY.yMaxM=y;}}}
}
// les données (avant le balayage de l'ombre) : l'ARCHE au milieu de sa droite, les CHEMINÉES sur les gradins de l'amphithéâtre
function cyMonuPrevoir(S,sQ,K,r){
  CY.arche=null;CY.chem=[];CY.yMaxM=-1e9;
  const a0=sQ.arche0,a1=sQ.arche1;
  if(a0!=null&&a1!=null&&a1-a0>200){const s9=(a0+a1)/2,i=Math.round(s9/S.ds),tx=S.tx[i],tz=S.tz[i],px=-tz,pz=tx,y=S.y[i],wF=S.wF[i],K4=Math.pow(K,.5);
    const Ua=wF*1.08+70*K4,clear=Math.max(118,S.D[i]*0)+120*(K4-1),rise=(70+r()*25)*K4,yb=y+clear; // l'intrados : 120 m au-dessus de la dalle au milieu
    const P=[];const NK=34;for(let k=0;k<=NK;k++){const u=-Ua+2*Ua*k/NK,e=u/Ua,ys=yb+rise*(1-Math.pow(Math.abs(e),2.2))-(1-Math.pow(1-Math.abs(e),.5))*20*K4;
      P.push({x:S.x[i]+px*u,z:S.z[i]+pz*u,y:ys,u:u,e:e});}
    CY.arche={P:P,tx:tx,tz:tz,px:px,pz:pz,W:(44+r()*10)*K4,T:(34+r()*8)*K4,cx:S.x[i],cz:S.z[i],yb:yb,rise:rise,Ua:Ua};}
  const h0=sQ.amphi0,h1=sQ.amphi1;
  if(h0!=null&&h1!=null){const N=PAL.b('cyChem',300);let n=0;
    for(let k=0;k<4000&&n<N;k++){const s9=h0-120+r()*(h1-h0+380),i=Math.max(0,Math.min(S.n-2,Math.round(s9/S.ds))),sg=r()<.5?-1:1,tx=S.tx[i],tz=S.tz[i];
      if(S.zH[i]<.35)continue;const wF=S.wF[i]*(1-sg*S.as[i]),t=.08+r()*.82,lat=wF+t*S.wW[i]+(r()-.5)*30,x=S.x[i]-tz*sg*lat+tx*(r()-.5)*20,z=S.z[i]+tx*sg*lat+tz*(r()-.5)*20;
      const hg=cyHauteur(x,z),ht=(28+r()*r()*95)*Math.pow(K,.3),rad=ht*(.15+r()*.09);
      if(hg+ht>S.y[i]-6&&lat<ROAD_HALF+rad+40)continue; // la règle d'or
      CY.chem.push({x:x,z:z,y:hg-4,h:ht+4,r:rad,a:r()*6.28,v:r()<.5?0:1});n++;}}
}
const CY_MVS=['uniform sampler2D uTZ,uTS;uniform vec4 uZD,uSD;uniform vec2 uZN,uSN;varying vec3 vW,vN;varying vec4 vA,vB;','#ifdef USE_COLOR','varying vec3 vCol;','#endif','#include <fog_pars_vertex>',
  'vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}',
  'void main(){','#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(mw)*normal);vec4 Z=tB(uTZ,(wp.xz-uZD.xy)*uZD.zw*uZN,uZN);',
  '#ifdef USE_COLOR','  vCol=color;','#endif',
  '  float lit=1.;vec2 sp=(wp.xz-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-4.,hs+10.,wp.y);}',
  '  lit*=.55+.45*smoothstep(-.2,.6,dot(vN,vec3(0.,1.,0.)));', // le dessous d'une arche ne voit pas le soleil
  '  vA=vec4(0.,0.,1.,lit);vB=vec4(0.,0.,clamp((Z.r-wp.y)/max(Z.r-Z.g,40.),0.,1.),Z.g);',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const CY_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uBnc;uniform float uWet;varying vec3 vW,vN,vCol;varying vec4 vA,vB;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);float ndl=max(dot(N,uSunD),0.)*.75+.25;vec3 c=vCol*vCol*(1.-.25*uWet);'+('c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,1.3),0.);'),
  '  c*=uSunC*ndl*vA.w+mix(uGnd,uSky,N.y*.5+.5)*(1.-.45*vB.z)+uBnc*(1.-.6*vA.w)*.45;gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
function cyMonuMats(){if(CY.mm)return CY.mm;const U=CY.mat.uniforms;
  const mk=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_MVS,fragmentShader:CY_FS,fog:true});m.dispose=function(){};return m;};
  const mt=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_MVS,fragmentShader:CY_AFS,fog:true,vertexColors:true});m.dispose=function(){};return m;};
  CY.mm={a:mk(),i:mk(),b:(function(){const m=mk();m.side=THREE.DoubleSide;return m;})(),t:mt(),g:(function(){const m=mt();m.side=THREE.DoubleSide;return m;})()};return CY.mm;}
function cyArbreGeo(){const P=[],C=[],I=[],ad=(g,col,tx,ty,tz,sx,sy,sz)=>{const b=P.length/3,p=g.attributes.position,n=g.index;for(let k=0;k<p.count;k++){const v=.88+.24*Math.abs(Math.sin(k*12.9898));P.push(p.getX(k)*sx+tx,p.getY(k)*sy+ty,p.getZ(k)*sz+tz);C.push(col[0]*v,col[1]*v,col[2]*v);}
    if(n)for(let k=0;k<n.count;k++)I.push(b+n.getX(k));else for(let k=0;k<p.count;k++)I.push(b+k);g.dispose();};
  ad(new THREE.CylinderGeometry(.05,.09,1,5),[.42,.33,.24],0,.5,0,1,1,1);
  ad(new THREE.IcosahedronGeometry(1,0),[.40,.58,.18],0,1.05,0,.42,.34,.42);ad(new THREE.IcosahedronGeometry(1,0),[.34,.52,.14],.22,.86,.12,.30,.26,.30);ad(new THREE.IcosahedronGeometry(1,0),[.46,.62,.22],-.18,.92,-.16,.28,.24,.28);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();return g;}
// l'arche : un tube de grès à section arrondie qui suit sa courbe, plus épais aux culées, l'arête rongée
function cyArcheGeo(A){const P=A.P,NR=18,pos=[],idx=[],rg=mulberry32(0xA7C4E);
  for(let k=0;k<P.length;k++){const p=P[k],q=P[Math.min(P.length-1,k+1)],o=P[Math.max(0,k-1)];let ty=q.y-o.y,tu=q.u-o.u;const tl=Math.hypot(ty,tu)||1;ty/=tl;tu/=tl;
    const nu=-ty,ny=tu,ab=1+1.4*Math.pow(Math.abs(p.e),3);  // la normale de la courbe dans le plan de l'arche ; les culées s'épaississent
    for(let j=0;j<NR;j++){const an=j/NR*Math.PI*2,c=Math.cos(an),sn=Math.sin(an),sq=Math.pow(Math.abs(c),.55)*Math.sign(c),sq2=Math.pow(Math.abs(sn),.55)*Math.sign(sn);
      const w=A.W*.5*ab*(1+.10*(rg()-.5)),t=A.T*.5*ab*(1+.12*(rg()-.5)),ux=p.u+nu*t*sq2,uy=p.y+ny*t*sq2,al=w*sq;
      pos.push(A.cx+A.px*ux+A.tx*al,uy,A.cz+A.pz*ux+A.tz*al);}}
  for(let k=0;k<P.length-1;k++)for(let j=0;j<NR;j++){const a=k*NR+j,b=k*NR+(j+1)%NR,c=a+NR,d=b+NR;idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;}
// la cheminée de fée : un tour (lathe) — le pied évasé, deux renflements, le cou, le CHAPEAU plus large ; deux variantes
function cyChemGeo(v){const pts=[],N=18;for(let k=0;k<=N;k++){const y=k/N;let rr;
    if(v===0)rr=y<.12?.62-y*1.2:y<.86?.40+.07*Math.sin(y*9.5)+.04*Math.sin(y*23.):y<.9?.30:y<.97?.52:.40;
    else rr=y<.10?.55-y:y<.80?.34+.09*Math.sin(y*7.)-.05*y:y<.84?.26:y<.95?.46:.30;
    pts.push(new THREE.Vector2(Math.max(.05,rr),y));}
  const g=new THREE.LatheGeometry(pts,10);g.computeVertexNormals();return g;}
const CY_RAI_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:true,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uC:{value:new THREE.Color()},uT:{value:0}}),
  vertexShader:['varying vec2 vU;varying float vH;','#include <fog_pars_vertex>','void main(){vU=uv;vec4 wp=modelMatrix*vec4(position,1.);vH=wp.y;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform vec3 uC;uniform float uT;varying vec2 vU;varying float vH;','#include <fog_pars_fragment>',
    'void main(){float e=smoothstep(0.,.35,vU.x)*smoothstep(1.,.65,vU.x),v=smoothstep(0.,.25,vU.y)*smoothstep(1.,.7,vU.y),p=.75+.25*sin(vH*.08+uT*.7+vU.x*9.);',
    '  gl_FragColor=vec4(uC*e*e*v*p,1.);','#ifdef USE_FOG','  gl_FragColor.rgb*=1.-smoothstep(fogNear,fogFar,fogDepth);','#endif','}'].join('\n')});m.dispose=function(){};return m;})();
const CY_COU={g:3.5,T:14};
const CY_SERRE={pied:30,k:.22,pied2:24,k2:.06,raide:.38}; // le canyon serré (buildCanyon) · pied2/k2/raide : le 2e serrage (15/10), hors raccourcis
const CY_TUN={l:460,vh:34,ap:104,fw:520,fh:520};  // longueur, hauteur des murs droits, sommet de la voûte (au-dessus de la route), façade (demi-largeur, hauteur)
const TUN2_ON=!/[?&]sans=tunnelcanyon\b/.test(location.search); // (2026-10-19) LE TUNNEL DE GRÈS (voir cyTunnel2) — `?sans=tunnelcanyon` = le tunnel du 14/10
const CY_TUN2={hw:16,ha:46,ev0:190,ev1:110,fin:40,fond:-48,A:78,B:82,pas:4,an:36,rgF:55,NQ:16,fw:520,vs:4.3,vR:5,vP:2.2}; // galerie (murs, clé) · la salle (début et fin du fondu avant le bout, mur du fond après, gouffre, ellipse A × B) · pas des rangées, des anneaux, dernier anneau avant le bout · façade, voussoirs
const T2_JOUR={nuit:.12,orage:.42,pluie:.5,soir:.72,matin:.85,midi:1}; // la force du jour qui entre par la bouche (cuite : la matière est sans éclairage)
const T2F={x:0,y:0,z:0,tx:0,tz:1},T2P=new Float32Array((CY_TUN2.NQ+2)*2);
function cyCouloirIci(){return CY.on&&((!!CY.cou&&s>=CY.cou[0]&&s<=CY.cou[1])||(!!CY.tun&&s>=CY.tun[0])||(!!CY.mineT&&s>=CY.mine[0]&&s<=CY.mine[1]));} // (la MINE aussi : ses murs frôlent la route)
function cyCouloir(){CY.couT=CY.cou?cyBandes(CY.cou,false):null;CY.tunT=CY.tun?(TUN2_ON?cyTunnel2(CY.tun):cyBandes(CY.tun,true)):null;CY.mineT=null;try{CY.mineT=CY.mine?cyMine(CY.mine):null;}catch(e){console.warn('canyon : mine',e);}}
function cyBandes(iv,tun){const S=CY.S;if(!S)return null;const i0=Math.max(0,Math.round(iv[0]/S.ds)),i1=Math.min(S.n-1,Math.round(iv[1]/S.ds));if(i1-i0<4)return null;
  const L0=ROAD_HALF+CY_COU.g,T=CY_COU.T,n=i1-i0+1,top=new Float32Array(n*2),bas=new Float32Array(n),o9={};
  for(let k=0;k<n;k++){const i=i0+k;bas[k]=Math.min(S.F[i],S.y[i]-THICK-8)-6;
    for(let c=0;c<2;c++){const sd=c?1:-1,l=sd*(L0+T+16),h=cyHauteur(S.x[i]-S.tz[i]*l,S.z[i]+S.tx[i]*l,o9);top[k*2+c]=tun?S.y[i]+CY_TUN.vh:Math.min(S.y[i]+420,Math.max(S.y[i]+50,h));}}
  if(!tun){const t2=top.slice();for(let k=0;k<n;k++)for(let c=0;c<2;c++){let a=0,m=0;for(let j=Math.max(0,k-4);j<=Math.min(n-1,k+4);j++){a+=t2[j*2+c];m++;}top[k*2+c]=a/m;}} // le haut lissé : pas de dents de scie
  const P=new Float32Array(n*2*4*3),N=new Float32Array(n*2*4*3),I=[];
  for(let c=0;c<2;c++){const sd=c?1:-1;for(let k=0;k<n;k++){const i=i0+k,nx=-S.tz[i]*sd,nz=S.tx[i]*sd,b=((c*n)+k)*4,t9=top[k*2+c];
    const V=(q,l,y,a,bb,cc)=>{const o=(b+q)*3;P[o]=S.x[i]+nx*l;P[o+1]=y;P[o+2]=S.z[i]+nz*l;N[o]=a;N[o+1]=bb;N[o+2]=cc;};
    V(0,L0,bas[k],-nx,0,-nz);V(1,L0,t9,-nx,0,-nz);V(2,L0,t9,0,1,0);V(3,L0+T,t9,0,1,0);  // la face (vers la route) et le dessus
    if(k<n-1){const b2=b+4;I.push(b,b2,b+1,b+1,b2,b2+1,b+2,b2+2,b+3,b+3,b2+2,b2+3);}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setIndex(I);g.computeBoundingSphere();
  if(tun){cyRocheSombre(g);cyRocheNeon(g,function(v){return S.y[i0+Math.min(n-1,(v>>2)%n)];});}const m=new THREE.Mesh(g,tun?cyMonuMats().g:cyMonuMats().b);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.frustumCulled=true;CY.grp.add(m);
  if(tun)cyGalerie(i0,i1,L0);
  return {i0:i0,i1:i1,top:top,bas:bas,L0:L0,tun:tun};}
/* LA VOÛTE (une demi-ellipse de L0 à L0, de la tête des murs au sommet), LA FAÇADE (un mur de falaise percé d'une bouche en fer à cheval,
   tourné vers celui qui arrive) et LES NÉONS (deux filets rose au pied des murs, un filet or sous la clé, la bouche cerclée de rose) */
const CY_NEON={r:null,o:null};
function cyRocheSombre(g){const p=g.attributes.position,C=new Float32Array(p.count*3);for(let k=0;k<p.count;k++){const y=p.getY(k),b=.5+.5*Math.sin(y*.9+Math.sin(y*.23)*2.);
  C[k*3]=.36+.10*b;C[k*3+1]=.22+.05*b;C[k*3+2]=.30+.06*b;}g.setAttribute('color',new THREE.BufferAttribute(C,3));}
/* (la matière simple met la couleur au CARRÉ et la galerie est à l'ombre : il faut des teintes claires pour lire la roche) — la galerie
   prend le reflet de ses néons : ROSE au pied des murs, OR vers la clé de voûte */
function cyRocheNeon(g,yr){const p=g.attributes.position,C=g.attributes.color.array;for(let k=0;k<p.count;k++){const h=p.getY(k)-yr(k),u=Math.max(0,Math.min(1,(h-CY_TUN.vh)/(CY_TUN.ap-CY_TUN.vh))),r=Math.exp(-Math.max(0,h-6)*Math.max(0,h-6)/900);
  C[k*3]=Math.min(1,.78+.20*r+.12*u*u);C[k*3+1]=Math.min(1,.50+.06*r+.30*u*u);C[k*3+2]=Math.min(1,.66+.18*r-.20*u*u);}g.attributes.color.needsUpdate=true;}
function cyGalerie(i0,i1,L0){const S=CY.S,n=i1-i0+1,NA=14,vh=CY_TUN.vh,ap=CY_TUN.ap,P=[],I=[];
  const pt=(i,a)=>{const l=-L0*Math.cos(a),y=S.y[i]+vh+(ap-vh)*Math.sin(a);return [S.x[i]-S.tz[i]*l,y,S.z[i]+S.tx[i]*l];}; // a = 0 (un mur) → π (l'autre)
  for(let k=0;k<n;k++)for(let q=0;q<=NA;q++){P.push.apply(P,pt(i0+k,q/NA*Math.PI));if(k<n-1&&q<NA){const a=k*(NA+1)+q,b=a+NA+1;I.push(a,b,a+1,a+1,b,b+1);}}
  const gv=new THREE.BufferGeometry();gv.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gv.setIndex(I);gv.computeVertexNormals();gv.computeBoundingSphere();
  cyRocheSombre(gv);cyRocheNeon(gv,function(v){return S.y[i0+Math.floor(v/(NA+1))];});const mv=new THREE.Mesh(gv,cyMonuMats().g);mv.userData.jeter=1;mv.matrixAutoUpdate=false;mv.updateMatrix();CY.grp.add(mv);
  // LA FAÇADE à la bouche : le contour de la bouche (murs + voûte) relié à un grand rectangle de falaise (en éventail)
  {const i=i0,tx=S.tx[i],tz=S.tz[i],W=CY_TUN.fw,H=Math.max(CY_TUN.fh,S.R[i]-S.y[i]+80),yb=Math.min(S.F[i],S.y[i]-40)-10,Q=[],J=[],B=[];
   const at=(l,y)=>[S.x[i]-tz*l,y,S.z[i]+tx*l];
   B.push([-L0,yb]);B.push([-L0,S.y[i]+vh]);for(let q=1;q<NA;q++){const a=q/NA*Math.PI;B.push([-L0*Math.cos(a),S.y[i]+vh+(ap-vh)*Math.sin(a)]);}B.push([L0,S.y[i]+vh]);B.push([L0,yb]); // le bord de la bouche
   const O=B.map(function(b){const l=b[0],y=b[1];const ang=Math.atan2(y-(S.y[i]+vh),l);const ex=Math.abs(Math.cos(ang))>1e-3?W/Math.abs(Math.cos(ang)):1e9,ey=Math.abs(Math.sin(ang))>1e-3?H/Math.abs(Math.sin(ang)):1e9,e=Math.min(ex,ey);
     return [Math.max(-W,Math.min(W,Math.cos(ang)*e)),Math.max(yb,Math.min(S.y[i]+vh+H,S.y[i]+vh+Math.sin(ang)*e))];}); // le même rayon, poussé jusqu'au cadre
   O[0]=[-W,yb];O[O.length-1]=[W,yb];
   for(let k=0;k<B.length;k++){Q.push.apply(Q,at(B[k][0],B[k][1]));Q.push.apply(Q,at(O[k][0],O[k][1]));if(k<B.length-1){const a=k*2;J.push(a,a+1,a+2,a+2,a+1,a+3);}}
   const nb=Q.length/3;Q.push.apply(Q,at(-W,S.y[i]+vh+H));Q.push.apply(Q,at(W,S.y[i]+vh+H));J.push(1,nb,3);for(let k=1;k<B.length-1;k++){const a=k*2+1;J.push(a,nb,a+2);}J.push((B.length-1)*2+1,nb,nb+1); // les coins du haut
   const gf=new THREE.BufferGeometry();gf.setAttribute('position',new THREE.Float32BufferAttribute(Q,3));gf.setIndex(J);gf.computeVertexNormals();gf.computeBoundingSphere();
   const mf=new THREE.Mesh(gf,cyMonuMats().b);mf.userData.jeter=1;mf.matrixAutoUpdate=false;mf.updateMatrix();CY.grp.add(mf);
   CY.tunF={x:S.x[i],y:S.y[i],z:S.z[i],tx:tx,tz:tz,B:B};}
  // LES NÉONS : des rubans additifs (deux filets rose au pied des murs, un filet or sous la clé, la bouche cerclée de rose)
  if(!CY_NEON.r){CY_NEON.r=new THREE.MeshBasicMaterial({color:0xff3fa6,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
    CY_NEON.o=new THREE.MeshBasicMaterial({color:0xffc24a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});CY_NEON.r.dispose=CY_NEON.o.dispose=function(){};}
  const ruban=(fn,w,mat)=>{const R=[],K=[];for(let k=0;k<n;k+=2){const a=fn(i0+k,-w),b=fn(i0+k,w);R.push.apply(R,a);R.push.apply(R,b);const m=R.length/3;if(m>=4)K.push(m-4,m-3,m-2,m-2,m-3,m-1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(R,3));g.setIndex(K);g.computeBoundingSphere();const me=new THREE.Mesh(g,mat);me.userData.jeter=1;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=3;CY.grp.add(me);};
  for(const sd of [-1,1])ruban(function(i,w){const l=sd*(L0-.3);return [S.x[i]-S.tz[i]*l,S.y[i]+6+w,S.z[i]+S.tx[i]*l];},.55,CY_NEON.r);
  ruban(function(i,w){return [S.x[i]-S.tz[i]*w*1.4,S.y[i]+ap-.6,S.z[i]+S.tx[i]*w*1.4];},1,CY_NEON.o);
  {const F9=CY.tunF,R=[],K=[];const at=(l,y,o)=>[F9.x-F9.tz*l-F9.tx*o,y,F9.z+F9.tx*l-F9.tz*o];
   for(let k=1;k<F9.B.length-1;k++){const b=F9.B[k],c=[b[0]*1.06,F9.y+CY_TUN.vh+(b[1]-F9.y-CY_TUN.vh)*1.06];R.push.apply(R,at(b[0],b[1],.8));R.push.apply(R,at(c[0],c[1]+(k===1||k===F9.B.length-2?0:0),.8));const m=R.length/3;if(m>=4)K.push(m-4,m-3,m-2,m-2,m-3,m-1);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(R,3));g.setIndex(K);g.computeBoundingSphere();const me=new THREE.Mesh(g,CY_NEON.r);me.userData.jeter=1;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=3;CY.grp.add(me);}}
function cyCouloirHeurt(p,C){const S=CY.S;if(!C)return false;let bi=-1,bd=1e18;
  for(let i=C.i0;i<=C.i1;i+=2){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>(C.L0+CY_COU.T+40)**2)return false;const lt=(p.x-S.x[bi])*-S.tz[bi]+(p.z-S.z[bi])*S.tx[bi],a=Math.abs(lt),k=bi-C.i0;
  if(C.tun){const yr=S.y[bi];if(p.y>yr+CY_TUN.vh&&a<C.L0){const u=a/C.L0;if(p.y>yr+CY_TUN.vh+(CY_TUN.ap-CY_TUN.vh)*Math.sqrt(Math.max(0,1-u*u))-1.5)return true;}}
  return a>C.L0-1.2&&a<C.L0+CY_COU.T+2&&p.y<C.top[k*2+(lt>0?1:0)]&&p.y>C.bas[k]-2;}
/* LE TUNNEL DE GRÈS (2026-10-19, Sacha : « le tunel d'arriver pour la map canyon est moche » — entre deux idées, le choix : « le tunnel de
   grès » : une galerie de grès à bandes, des anneaux de lumière dorée qui défilent, une grande salle en dôme où le portail tient en entier, une
   bouche en arc de pierre dans la falaise). Il remplace le TUNNEL D'ARRIVÉE du 14/10 (cyBandes/cyGalerie), sur les mêmes 460 derniers mètres.
   MESURÉ avant (banc photo, soir) : la façade était la matière du RELIEF posée sur un mur droit (strates et normales lues dans la grille du terrain :
   une tache rouge et noire baveuse) percée d'une fente de 104 m ; dedans, tout NOIR (la roche simple à l'ombre, la voûte à 104 m), deux bandes
   roses qui flottaient, un trait or ; et les murs, à 31,5 m de l'axe, COUPAIENT le portail de cubes (108 m de large, 17/10) : on n'en voyait qu'une tranche.
   · LA BOUCHE (`cyT2Facade`) : un arc rond net (le profil de la galerie) cerclé de VOUSSOIRS de grès, crème et terre cuite en alternance, une
     clé plus grosse ; la falaise autour en STRATES horizontales (les couleurs de cyStrates, à la hauteur où le relief les met), sculptée d'un
     relief doux loin de l'arc, éclairée comme les autres pièces du canyon (`.g` = CY_AFS : le soleil de l'heure, l'ombre des parois, la nuit).
   · LA GALERIE : murs droits de 16 m, clé de voûte à 46 m (cyT2Prof), le grès en lits pêche, crème et rose qu'on VOIT (les couleurs de cyStrates,
     serrées et adoucies dedans), des ANNEAUX de lumière dorée tous les 36 m (additifs, CY_T2M.o) dont la lumière est CUITE dans la roche
     (couleurs de sommet, une matière sans éclairage ni brume : `lum` dans cyTunnel2, réglages CY_T2L) — des flaques d'or, l'ombre violette entre
     deux anneaux ; le jour de la bouche entre sur ~30 m, à la force de l'heure (T2_JOUR). MESURÉ au banc : la chaîne de l'image sature déjà
     (CONTI) — le grès saturé et la lumière orangée faisaient un tube de lave ; les lits à leur vrai contraste, des rayures noires (con, sat).
   · LA SALLE DU PORTAIL : à 190 m du bout la galerie s'évase (fondu de 80 m, cyT2k) en un DÔME — une ellipse de 78 m de large × 82 m de haut
     autour du centre du portail — au-dessus d'un gouffre (fond à −48 m) : le portail (anneau de 54 m de rayon) y tient en entier ; les anneaux
     d'or continuent en grandes arches jusqu'à ~55 m du bout ; la salle prend la lumière de la fenêtre du portail (PCUBE.pal, la map d'en face,
     à moitié blanc chaud : le tilleul de la forêt sur le grès faisait du kaki) et un HALO de la couleur de ses cubes cerne l'anneau sur le mur
     du fond. Le relief s'écarte (buildCanyon : le pied des parois à 106 m de l'axe au
     bout de la route, sans asymétrie ni alcôve) et les arbres n'y poussent plus : rien ne traverse le dôme (`dbgTunnel('test')`).
   · Au volant rien ne change (on frotte au bord de la route : cyCouloirIci) ; EN VOL, murs, voûte, dôme et fond du gouffre sont durs
     (cyTun2Heurt → « ENCASTRÉ DANS LA PAROI », « AU FOND DU CANYON ») ; dedans, le soleil et le ciel baissent sur la caisse (canyonTick).
   Coût : trois maillages (la roche ~8,5 k triangles, les anneaux, la façade avec ses voussoirs : `dbgTunnel()` les compte), aucune lumière ; deux
   matières neuves chauffées au menu (canyonChauffe) + `.g` des pièces du canyon — MESURÉ : 0 programme compilé en course (211 au menu, 211 au
   fond de la salle ; couché, debout, dans le cadre de l'ordi). `?sans=tunnelcanyon` = le tunnel du 14/10, au bit près ; `dbgTunnel()`,
   `dbgTunnel('test')` (aucun relief dans la salle), `dbgTunnel('heurt',[[m avant le bout, côté, hauteur],…])`, `dbgTunnel('regle',{…})`. */
/* les deux matières du tunnel (chauffées au menu, canyonChauffe) : la roche en couleurs de sommet SANS brume (un tunnel n'a pas la brume du dehors :
   celle du soir la noyait de rouge), l'or additif des anneaux */
const CY_T2M={m:null,o:null};
function cyT2Mats(){if(!CY_T2M.m){CY_T2M.m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false});
    CY_T2M.o=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});CY_T2M.m.dispose=CY_T2M.o.dispose=function(){};}
  return CY_T2M;}
/* LES RÉGLAGES DE LA LUMIÈRE CUITE (dbgTunnel('regle',{…}) les change et rebâtit) : ambiance, couleur des anneaux, pic et lueur des anneaux,
   saturation du grès (la chaîne de l'image sature déjà), échelle des strates DEDANS (m par texel : plus serrées que dehors, pour voir des lits
   sur 46 m de voûte), lueur du portail (force, portée, fond), clarté de la façade */
const CY_T2L={amb:[.09,.07,.19],or:[1,.88,.72],kA:1.15,kB:.3,sat:.6,ech:2.4,con:.4,gl:1.6,glD:40,glB:.04,hal:1.1,fac:1.1}; // hal : le halo de la couleur du portail sur le mur du fond, autour de l'anneau // con : le contraste des lits DEDANS (1 = celui des falaises ; moins, des teintes douces autour du grès crème)
/* le repère de la route à l'abscisse s (échantillons de 8 m, interpolés) — au-delà du bout, la dernière tangente prolongée, à plat */
function cyT2Fr(s9,o){const S=CY.S,n=S.n,f=s9/S.ds,i=Math.min(n-2,Math.max(0,Math.floor(f))),u=Math.max(0,f-i),v=Math.min(1,u);
  o.x=S.x[i]+(S.x[i+1]-S.x[i])*u;o.z=S.z[i]+(S.z[i+1]-S.z[i])*u;o.y=S.y[i]+(S.y[i+1]-S.y[i])*v;
  const tx=S.tx[i]+(S.tx[i+1]-S.tx[i])*v,tz=S.tz[i]+(S.tz[i+1]-S.tz[i])*v,l=Math.hypot(tx,tz)||1;o.tx=tx/l;o.tz=tz/l;return o;}
function cyT2k(s9){const T=CY_TUN2,a=L-T.ev0,b=L-T.ev1;let u=(s9-a)/(b-a);u=u<0?0:u>1?1:u;return u*u*(3-2*u);} // 0 = la galerie, 1 = la salle
/* le DEMI-PROFIL (côté positif, l ≥ 0), fondu galerie → salle : [sous le bord de la route] puis la courbe du pied du mur à la clé (NQ+1 points).
   Galerie : le sol à −0,4 m (les trottoirs), le mur droit jusqu'à hw, la voûte en quart d'ellipse jusqu'à ha. Salle : l'ellipse (A, B) centrée sur
   le portail, coupée par le fond du gouffre (le sol court alors sous toute la largeur). */
function cyT2Prof(k,out){const T=CY_TUN2,W=ROAD_HALF+CY_COU.g,hc=PCUBE.H,f=-.4+(T.fond+.4)*k,p0=Math.asin(Math.max(-1,(T.fond-hc)/T.B));
  out[0]=(ROAD_HALF-1.5)*(1-k);out[1]=f;
  for(let q=0;q<=T.NQ;q++){const t=q/T.NQ;let gl,gh;
    if(t<.25){gl=W;gh=-.4+(T.hw+.4)*t/.25;}else{const a=(t-.25)/.75*Math.PI/2;gl=W*Math.cos(a);gh=T.hw+(T.ha-T.hw)*Math.sin(a);}
    const a2=p0+(Math.PI/2-p0)*t,sl=T.A*Math.cos(a2),sh=hc+T.B*Math.sin(a2);
    out[2+q*2]=gl+(sl-gl)*k;out[3+q*2]=gh+(sh-gh)*k;}
  return out;}
/* la couleur du grès à la hauteur y (cyStrates, lue comme le shader du relief : un texel = 3,7 m), en octets ramenés à 0..1 */
function cyT2Strate(y,o,e){const d=CY.tStr&&CY.tStr.image&&CY.tStr.image.data;if(!d){o[0]=.93;o[1]=.80;o[2]=.62;return o;}
  const v=y/(e||3.7)-.5,i=Math.floor(v),u=v-i,a=(((i%1024)+1024)%1024)*4,b=((((i+1)%1024)+1024)%1024)*4;
  for(let c=0;c<3;c++)o[c]=(d[a+c]+(d[b+c]-d[a+c])*u)/255;return o;}
function cyTunnel2(iv){const S=CY.S;if(!S||!(S.n>3))return null;
  const T=CY_TUN2,s0=iv[0],s1=L+T.fin,NQ=T.NQ,NP=2*NQ+3,hc=PCUBE.H,sP=L-25,P=[],C=[],I=[],st=[0,0,0];
  const pal=PCUBE.pal||null,cP=new THREE.Color(pal?pal[2]:0xffe0b8).lerp(new THREE.Color(1,.85,.7),.5),cH=new THREE.Color(pal?pal[0]:0xffb060),met=LVL.cur&&LVL.cur.meteo,jour=T2_JOUR[met]!=null?T2_JOUR[met]:.8;
  const RG=[];for(let a=s0+12;a<=L-T.rgF;a+=T.an)RG.push(a); // les anneaux : à 12 m de la bouche, puis tous les 36 m — dans la salle aussi, jusqu'à ~55 m du bout : de grandes arches d'or autour du portail
  /* LA LUMIÈRE CUITE d'un sommet : l'ambiance (violette, l'ombre commune des maps), les anneaux d'or, le jour de la bouche, la fenêtre du portail */
  const Q=CY_T2L,lum=(s9,l,h,k,fl)=>{let gA=0,gB=0;for(const a of RG){const d=s9-a;if(d>70||d<-70)continue;gA+=Math.exp(-d*d/40);gB+=Math.exp(-d*d/400);} // sous l'anneau, puis la lueur qui s'étale
    const jo=Math.exp(-Math.max(0,s9-s0)/28)*jour,dP=Math.sqrt((s9-sP)*(s9-sP)+l*l+(h-hc)*(h-hc)),gl=k*(Q.gl*Math.exp(-dP/Q.glD)+Q.glB),rr=Math.sqrt(l*l+(h-hc)*(h-hc)),hz=k*Math.max(0,Math.min(1,(s9-sP)/40))*Math.exp(-(rr-58)*(rr-58)/1000)*Q.hal,kA=1-.5*k,kO=(gA*Q.kA+gB*Q.kB)*(fl?.6:1);
    return [Q.amb[0]*kA+Q.or[0]*kO+jo+cP.r*gl+cH.r*hz,Q.amb[1]*kA+Q.or[1]*kO+.92*jo+cP.g*gl+cH.g*hz,Q.amb[2]*kA+Q.or[2]*kO+.85*jo+cP.b*gl+cH.b*hz];};
  const coul=(s9,l,h,k,fl,y)=>{cyT2Strate(y,st,Q.ech);st[0]=.92+(st[0]-.92)*Q.con;st[1]=.80+(st[1]-.80)*Q.con;st[2]=.62+(st[2]-.62)*Q.con;let r=st[0]*st[0],g=st[1]*st[1],b=st[2]*st[2];const m=r*.3+g*.55+b*.15; // le grès en linéaire (au carré, comme le relief), DÉSATURÉ (la chaîne de l'image sature déjà)
    r=m+(r-m)*Q.sat;g=m+(g-m)*Q.sat;b=m+(b-m)*Q.sat;const q=lum(s9,l,h,k,fl);
    C.push(Math.min(1,r*q[0]),Math.min(1,g*q[1]),Math.min(1,b*q[2]));};
  // ---- LA ROCHE : une rangée de NP sommets tous les 4 m, de la bouche au mur du fond ----
  const nR=Math.ceil((s1-s0)/T.pas)+1;
  for(let r=0;r<nR;r++){const s9=Math.min(s1,s0+r*T.pas),o=cyT2Fr(s9,T2F),k=cyT2k(s9);cyT2Prof(k,T2P);
    for(let j=0;j<NP;j++){const hp=j<=NQ+1?j:2*NQ+2-j,sg=j<=NQ+1?-1:1,l=sg*T2P[hp*2],h=T2P[hp*2+1];
      P.push(o.x-o.tz*l,o.y+h,o.z+o.tx*l);coul(s9,l,h,k,hp<=1,o.y+h);}
    if(r<nR-1)for(let j=0;j<NP-1;j++){const a=r*NP+j,b=a+NP;I.push(a,b,a+1,a+1,b,b+1);}}
  { // LE MUR DU FOND : un éventail depuis le centre du portail (il prend sa lumière en plein)
    const o=cyT2Fr(s1,T2F),c=P.length/3,b=(nR-1)*NP;P.push(o.x,o.y+hc,o.z);coul(s1,0,hc,1,false,o.y+hc);
    for(let j=0;j<NP-1;j++)I.push(c,b+j,b+j+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyT2Mats().m);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.name='tunnel';CY.grp.add(m);
  // ---- LES ANNEAUX D'OR : un ruban de 2,2 m qui suit la voûte, d'un mur à l'autre (3 m au-dessus du sol), 0,5 m en retrait de la roche ----
  {const R=[],K=[];for(const a of RG){const k=cyT2k(a);cyT2Prof(k,T2P);const hm=T.hw*.5+(hc-T.hw*.5)*k;
     for(const e of [-1.1,1.1]){const o=cyT2Fr(a+e,T2F);
       for(let j=2;j<NP-2;j++){const hp=j<=NQ+1?j:2*NQ+2-j,sg=j<=NQ+1?-1:1;let l=sg*T2P[hp*2],h=T2P[hp*2+1];if(h<T2P[1]+3)h=T2P[1]+3; // au pied du mur, l'anneau s'arrête à 3 m du sol
         const dl=-l,dh=hm-h,dn=Math.hypot(dl,dh)||1;l+=dl/dn*.5;h+=dh/dn*.5;R.push(o.x-o.tz*l,o.y+h,o.z+o.tx*l);}}
     const n9=NP-4,b0=R.length/3-2*n9;for(let j=0;j<n9-1;j++){const a0=b0+j,a1=b0+n9+j;K.push(a0,a1,a0+1,a0+1,a1,a1+1);}}
   const ga=new THREE.BufferGeometry();ga.setAttribute('position',new THREE.Float32BufferAttribute(R,3));ga.setIndex(K);ga.computeBoundingSphere();
   const ma=new THREE.Mesh(ga,cyT2Mats().o);ma.userData.jeter=1;ma.matrixAutoUpdate=false;ma.updateMatrix();ma.renderOrder=3;CY.grp.add(ma);}
  let triF=0;try{triF=cyT2Facade(s0);}catch(e){console.warn('canyon : façade du tunnel',e);}
  const i0=Math.max(0,Math.floor(s0/S.ds)),i1=S.n-1;
  return {v2:1,i0:i0,i1:i1,s0:s0,s1:s1,an:RG.length,tri:I.length/3,triA:RG.length*2*(NP-5),triF:triF};}
/* LA FAÇADE ET SES VOUSSOIRS (la matière `.g` des pièces du canyon : la couleur au carré, éclairée par l'heure). La falaise en tranches
   horizontales d'un texel de strate (3,7 m, la couleur nette d'un lit à l'autre), affinées à 1,2 m le long de la bouche ; un relief doux la creuse
   (jusqu'à 22 m, nul près de l'arc). Les voussoirs : des blocs de ~4,3 m le long du bord de la bouche, 5 m de large, 2,2 m en saillie. */
function cyT2Facade(s0){const S=CY.S,T=CY_TUN2,W=ROAD_HALF+CY_COU.g,o=Object.assign({},cyT2Fr(s0,T2F)),i=Math.min(S.n-1,Math.round(s0/S.ds));
  const FW=T.fw,yb=Math.min(S.F[i],S.y[i]-40)-10,yt=o.y+34+Math.max(520,S.R[i]-S.y[i]+80),bx=-o.tz,bz=o.tx; // (les dimensions de la façade d'avant)
  const wM=h=>h<-.4||h>T.ha?0:h<=T.hw?W:W*Math.sqrt(Math.max(0,1-((h-T.hw)/(T.ha-T.hw))*((h-T.hw)/(T.ha-T.hw)))); // la demi-largeur de la bouche à la hauteur h
  const D=(l,h)=>{const a=Math.min(1,Math.max(0,(Math.abs(l)-W-14)/90)+Math.max(0,(h-T.ha-14)/90));return a*a*(3-2*a)*22*cyNz((l+713)/260,(h+o.y)/210,1);}; // le recul de la roche (vers l'intérieur de la montagne)
  const P=[],N=[],C=[],I=[],st=[0,0,0],pt=(l,h,col)=>{const d=D(l,h),e=1.5,dl=(D(l+e,h)-D(l-e,h))/(2*e),dh=(D(l,h+e)-D(l,h-e))/(2*e);
      P.push(o.x+bx*l+o.tx*d,o.y+h,o.z+bz*l+o.tz*d);const nx=-o.tx+bx*dl,ny=dh,nz=-o.tz+bz*dl,nl=Math.hypot(nx,ny,nz)||1;N.push(nx/nl,ny/nl,nz/nl);C.push(col[0],col[1],col[2]);};
  // les colonnes : serrées près de la bouche, larges au loin
  const COL=[];for(let l=W+6;l<FW;l+=l<W+120?20:l<300?40:70)COL.push(l);COL.push(FW);
  // les tranches : un bord là où le lit change de couleur (ou tous les 24 m), plus un pas de 1,2 m dans la hauteur de la bouche
  const H=[];{let y=Math.floor(yb/3.7)*3.7,y0=y;const c0=[0,0,0],c1=[0,0,0];cyT2Strate(y+1.85,c0);H.push(y-o.y);
   while(y<yt){y+=3.7;cyT2Strate(y+1.85,c1);if(Math.max(Math.abs(c1[0]-c0[0]),Math.abs(c1[1]-c0[1]),Math.abs(c1[2]-c0[2]))>.03||y-y0>24){H.push(y-o.y);y0=y;c0[0]=c1[0];c0[1]=c1[1];c0[2]=c1[2];}}
   H.push(yt-o.y);for(let h=-.4;h<T.ha;h+=1.2)H.push(h);H.push(T.ha);H.sort((a,b)=>a-b);}
  const row=(h0,h1,ls,col)=>{const b=P.length/3;for(const l of ls){pt(l,h0,col);pt(l,h1,col);}for(let k=0;k<ls.length-1;k++){const a=b+k*2;I.push(a,a+1,a+2,a+2,a+1,a+3);}};
  for(let k=0;k<H.length-1;k++){const h0=H[k],h1=H[k+1];if(h1-h0<.05)continue;cyT2Strate(o.y+(h0+h1)/2,st);st[0]*=CY_T2L.fac;st[1]*=CY_T2L.fac;st[2]*=CY_T2L.fac; /* (la couleur passe au carré : ×1,2 de clarté, la falaise est à l'ombre au fond de la gorge) */
    const ouv=h1>-.4+.01&&h0<T.ha-.01,w0=ouv?Math.max(wM(h0),wM(h1)):0;
    if(!ouv){const ls=[-FW];for(let j=COL.length-2;j>=0;j--)ls.push(-COL[j]);ls.push(0);for(const l of COL)ls.push(l);row(h0,h1,ls,st);}
    else{const ls=[w0];for(const l of COL)if(l>w0+2)ls.push(l);ls[ls.length-1]=FW;row(h0,h1,ls,st);row(h0,h1,ls.map(v=>-v),st);
      // le bord de la bouche suit sa courbe : le coin de la tranche, côté bouche, à la largeur exacte de chaque hauteur
      const n0=P.length/3;for(const sd of [-1,1]){const bi=n0-(2*ls.length)*(sd<0?1:2);P[bi*3]=o.x+bx*sd*wM(h0);P[bi*3+2]=o.z+bz*sd*wM(h0);P[(bi+1)*3]=o.x+bx*sd*wM(h1);P[(bi+1)*3+2]=o.z+bz*sd*wM(h1);}}}
  // LES VOUSSOIRS : le bord de la bouche (de bas en haut, gauche → droite) découpé en blocs, crème et terre cuite en alternance, la clé en or pâle
  const B=[];{const NA=60;B.push([-W,-.4]);B.push([-W,T.hw]);for(let q=1;q<NA;q++){const a=q/NA*Math.PI;B.push([-W*Math.cos(a),T.hw+(T.ha-T.hw)*Math.sin(a)]);}B.push([W,T.hw]);B.push([W,-.4]);}
  const cum=[0];for(let k=1;k<B.length;k++)cum.push(cum[k-1]+Math.hypot(B[k][0]-B[k-1][0],B[k][1]-B[k-1][1]));const Lb=cum[cum.length-1];
  const at=u=>{u=Math.max(0,Math.min(Lb,u));let k=1;while(k<cum.length-1&&cum[k]<u)k++;const w=(u-cum[k-1])/Math.max(1e-6,cum[k]-cum[k-1]);
    const l=B[k-1][0]+(B[k][0]-B[k-1][0])*w,h=B[k-1][1]+(B[k][1]-B[k-1][1])*w,tl=B[k][0]-B[k-1][0],th=B[k][1]-B[k-1][1],tn=Math.hypot(tl,th)||1;
    return [l,h,-th/tn,tl/tn];}; // la normale SORTANTE (vers la falaise) : la tangente tournée d'un quart de tour
  const nb=Math.max(9,Math.round(Lb/T.vs)|1),CR=[1.2,1.12,.99],TC=[1.08,.64,.46],CLE=[1.3,1.1,.7]; // (au-delà de 1 : la couleur passe au carré, les voussoirs ressortent sur la falaise)
  const face=(A,col,nx,ny,nz)=>{const b=P.length/3;for(const v of A){P.push(v[0],v[1],v[2]);N.push(nx,ny,nz);C.push(col[0],col[1],col[2]);}I.push(b,b+1,b+2,b,b+2,b+3);};
  const W3=(l,h,av)=>[o.x+bx*l-o.tx*av,o.y+h,o.z+bz*l-o.tz*av]; // av : la saillie vers celui qui arrive
  for(let k=0;k<nb;k++){const cle=k===(nb>>1),u0=k/nb*Lb+.18,u1=(k+1)/nb*Lb-.18,R0=cle?T.vR*1.5:T.vR,pv=cle?T.vP*1.4:T.vP,col=cle?CLE:k%2?TC:CR;
    const a=at(u0),b=at(u1),ia=[a[0],a[1]],ib=[b[0],b[1]],oa=[a[0]+a[2]*R0,a[1]+a[3]*R0],ob=[b[0]+b[2]*R0,b[1]+b[3]*R0];
    face([W3(ia[0],ia[1],pv),W3(ib[0],ib[1],pv),W3(ob[0],ob[1],pv),W3(oa[0],oa[1],pv)],col,-o.tx,0,-o.tz); // la face
    {const nl=-(a[2]+b[2])/2,nh=-(a[3]+b[3])/2;face([W3(ia[0],ia[1],0),W3(ib[0],ib[1],0),W3(ib[0],ib[1],pv),W3(ia[0],ia[1],pv)],[col[0]*.86,col[1]*.86,col[2]*.86],bx*nl,nh,bz*nl);} // l'intrados (vers l'axe)
    {const nl=(a[2]+b[2])/2,nh=(a[3]+b[3])/2;face([W3(oa[0],oa[1],pv),W3(ob[0],ob[1],pv),W3(ob[0],ob[1],0),W3(oa[0],oa[1],0)],[col[0]*.9,col[1]*.9,col[2]*.9],bx*nl,nh,bz*nl);} // l'extrados
    for(const e of [[ia,oa,-1],[ib,ob,1]]){const tl=(b[0]-a[0]),th=(b[1]-a[1]),tn=Math.hypot(tl,th)||1;face([W3(e[0][0],e[0][1],0),W3(e[0][0],e[0][1],pv),W3(e[1][0],e[1][1],pv),W3(e[1][0],e[1][1],0)],[col[0]*.8,col[1]*.8,col[2]*.8],bx*tl/tn*e[2],th/tn*e[2],bz*tl/tn*e[2]);}} // les joints
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyMonuMats().g);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.name='tunnelFacade';CY.grp.add(m);return I.length/3;}
/* EN VOL dans le tunnel de grès : '' (libre, ou loin de la coque), 'paroi' (murs, voûte, dôme) ou 'canyon' (le fond du gouffre de la salle).
   La coque est un VOLUME : à la distance a de l'axe, on est dedans entre le bas (le sol, ou le bas du dôme qui s'évase) et le haut (la voûte) ;
   on ne heurte que DEHORS et à moins de 12 m de la coque — une caisse sur un autre bout de route qui passe sous la salle ou loin de la galerie
   n'a rien à craindre d'elle (le relief s'en charge). Les marges : 1,2 m aux murs, 1,5 m sous la voûte, 0,8 m au-dessus du sol. */
const T2B={lo:0,hi:0,sol:false,max:0};
function cyT2Bornes(a){const n=CY_TUN2.NQ+2;let jm=0,mx=-1;for(let j=0;j<n;j++)if(T2P[j*2]>mx){mx=T2P[j*2];jm=j;}
  let lo=-1e9,hi=1e9,sol=false;
  for(let j=0;j<n-1;j++){const l0=T2P[j*2],h0=T2P[j*2+1],l1=T2P[j*2+2],h1=T2P[j*2+3];if((a-l0)*(a-l1)>0)continue;
    const w=Math.abs(l1-l0)>1e-6?(a-l0)/(l1-l0):1,h=h0+(h1-h0)*w;
    if(j<jm){if(h>lo){lo=h;sol=j===0;}}else if(h<hi)hi=h;} // avant le point le plus large : le bas (le sol, le bas du dôme) ; après : la voûte
  T2B.lo=lo;T2B.hi=hi;T2B.sol=sol;T2B.max=mx;return T2B;}
function cyTun2Heurt(p,C){const S=CY.S;if(!C||!S)return '';let bi=-1,bd=1e18;
  for(let i=C.i0;i<=C.i1;i+=2){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>130*130)return '';
  const s9=bi*S.ds+(p.x-S.x[bi])*S.tx[bi]+(p.z-S.z[bi])*S.tz[bi];if(s9<C.s0||s9>C.s1)return '';
  const o=cyT2Fr(s9,T2F),a=Math.abs(-(p.x-o.x)*o.tz+(p.z-o.z)*o.tx),h=p.y-o.y;cyT2Prof(cyT2k(s9),T2P);
  const f=T2P[1],top=T2P[3+CY_TUN2.NQ*2],B=cyT2Bornes(a+1.2);
  if(a>B.max+12||h<f-12||h>top+12)return ''; // loin de la coque
  if(a+1.2<B.max&&h>B.lo+.8&&h<B.hi-1.5)return ''; // dedans
  if(a+1.2<B.max&&h<=B.lo+.8&&B.sol)return f<-8&&a>ROAD_HALF+.5?'canyon':''; // sous le sol : le fond du GOUFFRE tue ; les trottoirs de la galerie, non (une pose au ras du bord)
  return 'paroi';}
window.dbgTunnel=function(k,o){const C=CY.tunT;if(!C)return 'pas de tunnel';if(!C.v2)return {v2:0,i0:C.i0,i1:C.i1};
  if(k==='regle'){if(o)Object.assign(CY_T2L,o);cyMonuments(CY.job);return {regle:Object.assign({},CY_T2L),tunnel:!!CY.tunT};} // (banc) changer la lumière cuite et tout rebâtir
  if(k==='heurt')return (o||[]).map(function(q){const f=cyT2Fr(L-q[0],{}),p={x:f.x-f.tz*q[1],y:f.y+q[2],z:f.z+f.tx*q[1]};return q.join('/')+' '+(cyTun2Heurt(p,C)||'libre');}); // (banc) [[m avant le bout, côté, hauteur], …] → ce que la coque fait d'une caisse en vol là
  if(k==='test'){ // LA SALLE : aucun relief au-dessus de la moitié basse de la coque (le sol du gouffre, le bas du dôme) — sinon il traverse
    let n=0,pire=-1e9,ou=[];for(let s9=L-CY_TUN2.ev0;s9<=C.s1;s9+=8){const o=cyT2Fr(s9,T2F),k9=cyT2k(s9);cyT2Prof(k9,T2P);
      const pts=[];for(let l=-T2P[2];l<=T2P[2];l+=6)pts.push([l,T2P[1]]);for(let q=0;q<=CY_TUN2.NQ;q++){const h=T2P[3+q*2];if(h<PCUBE.H*k9+CY_TUN2.hw*(1-k9))for(const sg of [-1,1])pts.push([sg*T2P[2+q*2],h]);}
      for(const q of pts){const x=o.x-o.tz*q[0],z=o.z+o.tx*q[0],hr=cyHauteur(x,z)-(o.y+q[1]);if(hr>pire)pire=hr;if(hr>.5){n++;if(ou.length<20)ou.push(Math.round(s9-L)+':'+Math.round(q[0])+'/'+Math.round(q[1])+'(+'+hr.toFixed(1)+')');}}}
    return {intrus:n,pire:+pire.toFixed(1),ou:ou.join(' ')};}
  return {v2:1,s0:Math.round(C.s0),s1:Math.round(C.s1),L:Math.round(L),anneaux:C.an,triangles:{roche:C.tri,anneaux:C.triA,facade:C.triF},pal:PCUBE.pal?PCUBE.pal.map(v=>v.toString(16)):null,meteo:LVL.cur&&LVL.cur.meteo};};
