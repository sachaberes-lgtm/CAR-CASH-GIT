/* ===== LA LOUPE : LA CAISSE NETTE À LA RÉSOLUTION DE L'ÉCRAN (2026-11-13, finition iPhone, Sacha : « la voiture EN JEU pourrait être plus belle et plus NETTE ») =====
   CE QUI RENDAIT LA CAISSE MOLLE (vu au banc, iPhone 13 Pro, zooms ×3) : ni le modèle ni les matières — l'AGRANDISSEMENT. La 3D est calculée à 1055×487 (DPR 1,25)
   puis c'est le NAVIGATEUR qui l'étire ×2,4 en bilinéaire sur les 2532×1170 de l'écran : chaque arête de cube devient une rampe de 3 à 5 pixels d'écran.
   Désormais, en course et téléphone FROID : la toile garde la taille de l'ÉCRAN (jusqu'à ×3) ; la scène, le halo et l'étalonnage restent calculés à la
   résolution d'avant (curDPR, l'échelle QL : rien ne change pour eux), l'étalonnage écrit dans une cible 8 bits de cette taille, et une dernière passe
   l'agrandit ELLE-MÊME sur la toile :
   · partout : une lecture bilinéaire par pixel d'écran (exactement l'image que le navigateur fabriquait) ;
   · dans le disque de la caisse (son centre et son rayon projetés, bord fondu) : une reconstruction qui SUIT LES ARÊTES (12 texels lus, filtre orienté le
     long du contour, borné par ses 4 voisins : aucun halo) — une arête de cube sort en un pixel d'écran au lieu de trois à cinq.
   La toile ne change plus de taille quand l'échelle QL bouge (seules les cibles du compositeur sont retaillées).
   COMMENT, SANS RIEN CASSER AILLEURS : three continue de croire que la toile fait la taille de la SCÈNE (getPixelRatio, getDrawingBufferSize, et
   `domElement.width/height` rendent la taille de la scène : toutes les matières qui comptent en pixels restent justes) ; la vraie taille est posée par les
   accesseurs natifs ; un rendu direct sur l'écran (les calques dessinés après le compositeur) reçoit la toile entière (setRenderTarget enveloppé).
   (Le seul compte en pixels d'ÉCRAN du jeu, la coupe de la carte du moteur qui plonge dans le capot — pose-verdict.js — lit LOUPE.k quand la loupe est posée.)
   À CHAUD : rien. État thermique serious/critical, palier 2+ du gouverneur ou échelle effondrée → la toile reprend la taille de la scène et l'étalonnage
   écrit dessus comme avant (au bit près) ; elle ne revient qu'après 20 s au frais. Hors course (menu, garage, mort) : comme avant.
   Téléphone récent (palier 2) et WebGL2 seulement : l'ordinateur ne change pas d'un pixel. `?sans=loupe` = avant · `?loupe=2` : la toile à ×2 au lieu de
   l'écran entier · `?loupe=tout` : la reconstruction sur toute l'image (pour comparer) · dbgLoupe() : l'état, dbgLoupe({on:0|1,voir:1,k:…,r:…}). */
const LOUPE={ok:false,on:false,force:null,k:1,tout:false,rt:null,quad:null,U:null,vp:new THREE.Vector4(),sz:new THREE.Vector2(),lw:0,lh:0,bw:0,bh:0,
  chaudT:-1e9,n:0,bascules:0,r:1.35,v:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),pique:1,natW:null,natH:null};
(function(){
  const q=location.search,m=/[?&]loupe=([0-9.]+|tout)/.exec(q);
  let pal=0;try{pal=PAL.n;}catch(e){}
  if(!ALLEGE||!LOOK_TEL||!W2_POST||pal<2||/[?&]sans=[^&]*\bloupe\b/.test(q)||!(devicePixelRatio>=1.9))return;
  LOUPE.k=Math.min(3,devicePixelRatio);if(m&&m[1]==='tout')LOUPE.tout=true;else if(m&&+m[1]>=1.5)LOUPE.k=Math.min(LOUPE.k,+m[1]);
  try{const P=HTMLCanvasElement.prototype;LOUPE.natW=Object.getOwnPropertyDescriptor(P,'width');LOUPE.natH=Object.getOwnPropertyDescriptor(P,'height');}catch(e){}
  LOUPE.ok=!!(LOUPE.natW&&LOUPE.natW.get&&LOUPE.natW.set&&LOUPE.natH&&LOUPE.natH.get&&LOUPE.natH.set);
})();
/* le disque de la caisse à l'écran : son centre (remonté d'une demi-hauteur de caisse) et son rayon, en pixels de la toile */
function loupeDisque(U){
  let x=-1e4,y=-1e4,r=0;
  if(carGroup.visible){const S9=CARS[level]||{},V=LOUPE.v,V2=LOUPE.v2;
    V.setFromMatrixColumn(carGroup.matrixWorld,1).normalize().multiplyScalar(.5*(S9.h||1.2)).add(carGroup.position);V2.copy(V);V.project(camera);
    if(V.z<1&&Math.abs(V.x)<1.3&&Math.abs(V.y)<1.3){x=(V.x*.5+.5)*LOUPE.bw;y=(V.y*.5+.5)*LOUPE.bh;
      const R9=.5*Math.hypot(S9.l||4.2,S9.w||2,S9.h||1.2);V2.addScaledVector(LOUPE.v3.setFromMatrixColumn(camera.matrixWorld,0),R9).project(camera);
      r=Math.min(.45*Math.max(LOUPE.bw,LOUPE.bh),Math.abs(V2.x-V.x)*.5*LOUPE.bw*LOUPE.r);}}
  U.uC.value.set(x,y,r,Math.max(8,r*.3));}
function loupeChaud(){let c=false;
  try{if(MOB_S.thermo>=2)c=true;}catch(e){}try{if(MOB_P.t>=2)c=true;}catch(e){}try{if(QL.effondre)c=true;}catch(e){}
  const n=performance.now();if(c)LOUPE.chaudT=n;return c||n-LOUPE.chaudT<20000;}
function loupeVeut(){if(!LOUPE.ok||!LOUPE.quad)return false;if(LOUPE.force!=null)return !!LOUPE.force;
  let hd=false;try{hd=VHD.on;}catch(e){}
  return started&&!gameOver&&!garageOn&&!hd&&!(typeof stallOn!=='undefined'&&stallOn)&&!loupeChaud();}
/* la vraie taille de la toile (accesseurs natifs) — appelée juste avant de dessiner : la toile vidée par un changement de taille est repeinte dans la même image */
function loupeToile(rd,act){const cv=rd.domElement;
  if(act){rd.getSize(LOUPE.sz);const bw=Math.max(1,Math.round(LOUPE.sz.x*LOUPE.k)),bh=Math.max(1,Math.round(LOUPE.sz.y*LOUPE.k));
    if(!LOUPE.on){LOUPE.lw=LOUPE.natW.get.call(cv);LOUPE.lh=LOUPE.natH.get.call(cv);LOUPE.on=true;LOUPE.bascules++;LOUPE.bw=LOUPE.bh=0;}
    if(bw!==LOUPE.bw||bh!==LOUPE.bh){LOUPE.natW.set.call(cv,bw);LOUPE.natH.set.call(cv,bh);LOUPE.bw=bw;LOUPE.bh=bh;LOUPE.vp.set(0,0,bw,bh);}}
  else if(LOUPE.on){LOUPE.on=false;LOUPE.bascules++;LOUPE.natW.set.call(cv,LOUPE.lw);LOUPE.natH.set.call(cv,LOUPE.lh);LOUPE.bw=LOUPE.bh=0;}}
if(LOUPE.ok&&POST_ON&&acesPass){ try{
  const cv=renderer.domElement;
  Object.defineProperty(cv,'width',{configurable:true,enumerable:true,get:function(){return LOUPE.on?LOUPE.lw:LOUPE.natW.get.call(this);},
    set:function(v){if(LOUPE.on)LOUPE.lw=v|0;else LOUPE.natW.set.call(this,v);}});
  Object.defineProperty(cv,'height',{configurable:true,enumerable:true,get:function(){return LOUPE.on?LOUPE.lh:LOUPE.natH.get.call(this);},
    set:function(v){if(LOUPE.on)LOUPE.lh=v|0;else LOUPE.natH.set.call(this,v);}});
  const srt9=renderer.setRenderTarget;
  renderer.setRenderTarget=function(t){srt9.apply(this,arguments);if(LOUPE.on&&(t===null||t===undefined))this.state.viewport(LOUPE.vp);};
  LOUPE.rt=new THREE.WebGLRenderTarget(4,4,{format:THREE.RGBAFormat,type:THREE.UnsignedByteType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false});
  LOUPE.rt.texture.generateMipmaps=false;
  LOUPE.U={tL:{value:LOUPE.rt.texture},uC:{value:new THREE.Vector4(-1e4,-1e4,0,8)},uVoir:{value:0},uPq:{value:LOUPE.pique}};
  /* LA RECONSTRUCTION QUI SUIT LES ARÊTES : 12 texels autour du point (b c / e f g h / i j k l / n o), la direction et la raideur du contour estimées sur
     leurs clartés, un noyau étiré le long du contour et resserré en travers, le résultat borné par les 4 texels du milieu (f g j k). */
  const fs=['uniform sampler2D tL;uniform vec4 uC;uniform float uVoir,uPq;varying vec2 vUv;',
    'void lpS(inout vec2 dir,inout float len,float w,float lA,float lB,float lC,float lD,float lE){',
    '  float dc=lD-lC,cb=lC-lB,lx=1.0/max(max(abs(dc),abs(cb)),1e-5),dx=lD-lB;dir.x+=dx*w;lx=clamp(abs(dx)*lx,0.0,1.0);len+=lx*lx*w;',
    '  float ec=lE-lC,ca=lC-lA,ly=1.0/max(max(abs(ec),abs(ca)),1e-5),dy=lE-lA;dir.y+=dy*w;ly=clamp(abs(dy)*ly,0.0,1.0);len+=ly*ly*w;}',
    'void lpT(inout vec3 aC,inout float aW,vec2 off,vec2 dir,vec2 len,float lob,float clp,vec3 c){',
    '  vec2 v=vec2(off.x*dir.x+off.y*dir.y,off.y*dir.x-off.x*dir.y)*len;float d2=min(dot(v,v),clp),wB=0.4*d2-1.0,wA=lob*d2-1.0;',
    '  wB*=wB;wA*=wA;wB=1.5625*wB-0.5625;float w=wB*wA;aC+=c*w;aW+=w;}',
    'float lpL(vec3 c){return c.b*0.5+(c.r*0.5+c.g);}',
    'void main(){',
    '  vec3 x='+TXL('tL','vUv')+'.rgb;',
    '  vec2 dq=gl_FragCoord.xy-uC.xy;float w9='+(LOUPE.tout?'1.0':'1.0-smoothstep(uC.z-uC.w,uC.z,length(dq))')+';',
    '  if(w9>0.003){',
    '    ivec2 ts=textureSize(tL,0),tm=ts-1;vec2 pp=vUv*vec2(ts)-0.5,fp=floor(pp);pp-=fp;ivec2 ip=ivec2(fp);',
    '#define LPF(X,Y) texelFetch(tL,clamp(ip+ivec2(X,Y),ivec2(0),tm),0).rgb',
    '    vec3 b=LPF(0,-1),c=LPF(1,-1),e=LPF(-1,0),f=LPF(0,0),g=LPF(1,0),h=LPF(2,0),i=LPF(-1,1),j=LPF(0,1),k=LPF(1,1),l=LPF(2,1),n=LPF(0,2),o=LPF(1,2);',
    '    float bL=lpL(b),cL=lpL(c),eL=lpL(e),fL=lpL(f),gL=lpL(g),hL=lpL(h),iL=lpL(i),jL=lpL(j),kL=lpL(k),lL=lpL(l),nL=lpL(n),oL=lpL(o);',
    '    vec2 dir=vec2(0.0);float len=0.0;',
    '    lpS(dir,len,(1.0-pp.x)*(1.0-pp.y),bL,eL,fL,gL,jL);lpS(dir,len,pp.x*(1.0-pp.y),cL,fL,gL,hL,kL);',
    '    lpS(dir,len,(1.0-pp.x)*pp.y,fL,iL,jL,kL,nL);lpS(dir,len,pp.x*pp.y,gL,jL,kL,lL,oL);',
    '    float dr=dot(dir,dir);if(dr<3.0518e-5){dir=vec2(1.0,0.0);}else dir*=inversesqrt(dr);',
    '    len*=0.5;len*=len;float st=dot(dir,dir)/max(abs(dir.x),abs(dir.y));vec2 l2=vec2(1.0+(st-1.0)*len,1.0-0.5*len);',
    '    float lob=0.5+(0.21-0.5)*len,clp=1.0/lob;vec3 aC=vec3(0.0);float aW=0.0;',
    '    lpT(aC,aW,vec2(0.,-1.)-pp,dir,l2,lob,clp,b);lpT(aC,aW,vec2(1.,-1.)-pp,dir,l2,lob,clp,c);lpT(aC,aW,vec2(-1.,1.)-pp,dir,l2,lob,clp,i);lpT(aC,aW,vec2(0.,1.)-pp,dir,l2,lob,clp,j);',
    '    lpT(aC,aW,vec2(0.,0.)-pp,dir,l2,lob,clp,f);lpT(aC,aW,vec2(-1.,0.)-pp,dir,l2,lob,clp,e);lpT(aC,aW,vec2(1.,1.)-pp,dir,l2,lob,clp,k);lpT(aC,aW,vec2(2.,1.)-pp,dir,l2,lob,clp,l);',
    '    lpT(aC,aW,vec2(2.,0.)-pp,dir,l2,lob,clp,h);lpT(aC,aW,vec2(1.,0.)-pp,dir,l2,lob,clp,g);lpT(aC,aW,vec2(1.,2.)-pp,dir,l2,lob,clp,o);lpT(aC,aW,vec2(0.,2.)-pp,dir,l2,lob,clp,n);',
    /* LE PIQUÉ DE LA LOUPE : l'écart entre la reconstruction et la lecture bilinéaire (plus floue) est ce que l'agrandissement a pris — on le rend (uPq), toujours borné par les 4 texels du milieu */
    '    vec3 mn=min(min(f,g),min(j,k)),mx=max(max(f,g),max(j,k)),r=aC/aW;r=min(mx,max(mn,r+(r-x)*uPq));',
    '    x=mix(x,r,w9);if(uVoir>0.5)x=mix(x,vec3(1.0,0.0,0.6),0.25*w9);',
    '  }',
    '  gl_FragColor=vec4(x,1.0);}'].join('\n');
  LOUPE.quad=new THREE.FullScreenQuad(new THREE.ShaderMaterial({uniforms:LOUPE.U,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false,fog:false}));
  const r9=acesPass.render;
  acesPass.render=function(rd,wb,rb,dT,mk){
    let act=false;try{act=loupeVeut();}catch(e){}
    try{loupeToile(rd,act);}catch(e){act=false;LOUPE.ok=false;}
    if(!act)return r9.apply(this,arguments);
    if(LOUPE.rt.width!==rb.width||LOUPE.rt.height!==rb.height)LOUPE.rt.setSize(rb.width,rb.height);
    const s9=this.renderToScreen,c9=this.clear;this.renderToScreen=false;this.clear=false;
    try{r9.call(this,rd,LOUPE.rt,rb,dT,mk);}finally{this.renderToScreen=s9;this.clear=c9;}
    loupeDisque(LOUPE.U);LOUPE.n++;
    rd.setRenderTarget(null);LOUPE.quad.render(rd);};
}catch(e){LOUPE.ok=false;try{console.warn('loupe',e);}catch(e2){}} }
window.dbgLoupe=function(o){if(o){if('on' in o)LOUPE.force=o.on==null?null:(o.on?1:0);if('voir' in o&&LOUPE.U)LOUPE.U.uVoir.value=o.voir?1:0;if(o.k)LOUPE.k=Math.min(3,Math.max(1,+o.k));if(o.r)LOUPE.r=+o.r;if(o.pique!=null&&LOUPE.U)LOUPE.U.uPq.value=+o.pique;
    if(o.caisse!=null){try{level=o.caisse|0;buildCar(CARS[level]);}catch(e){}} /* (banc) une autre caisse sur la même route */
    if(o.rendre){try{if(POST_ON&&composer)composer.render();}catch(e){}}} /* (banc) la MÊME image redessinée, sans avancer la partie */
  let cv=null;try{cv=renderer.domElement;}catch(e){}
  return {ok:LOUPE.ok,on:LOUPE.on,k:LOUPE.k,tout:LOUPE.tout,toile:LOUPE.on?[LOUPE.bw,LOUPE.bh]:(cv?[cv.width,cv.height]:null),scene:LOUPE.rt?[LOUPE.rt.width,LOUPE.rt.height]:null,
    disque:LOUPE.U?LOUPE.U.uC.value.toArray().map(Math.round):null,pxDisque:LOUPE.U&&LOUPE.on?Math.round(Math.PI*Math.pow(LOUPE.U.uC.value.z,2)):0,images:LOUPE.n,bascules:LOUPE.bascules,chaud:loupeChaud()};};
