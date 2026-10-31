/* ===== CRYPTO CITY : L'HORIZON DU BULL RUN ET LES PROJECTEURS DE LA NUIT (2026-10-21, Sacha : « amélioration visuelle des maps », passe CRYPTO CITY) =====
   Ce que la route voyait au loin : un ciel, une mer de nuages, et RIEN — la ville s'arrête à 2 km. Deux objets, un seul programme de shader, deux
   appels de dessin, ~2 500 triangles, aucune texture, aucune lumière :
   · L'HORIZON (pilier 1 : la profondeur en trois plans) — une couronne de tours LOINTAINES et trois GRAPHIQUES en bougies japonaises (le cours qui
     monte vers la lune : l'horizon EST le graphique du bull run), centrés sur la caméra comme un ciel et recalés à chaque image sur la brume
     (échelle de la couronne = une part fixe de la portée de la brume : à l'écran elle ne bouge pas, seule la brume dit la distance). La couleur
     se calcule dans le shader à partir du ciel du moment (`skyU.uJ*`) : une seule géométrie sert le matin, le midi, le soir, la nuit. Le jour, des
     silhouettes bleu froid dans la brume d'or, la tête éclairée ; la nuit, des tours sombres aux bureaux allumés (or, cyan, rose) et des bougies
     qui brillent. Les bougies sont l'éclat CASH discret du plan lointain (vert profit / rouge, jamais dans le couloir de jeu).
   · LES PROJECTEURS (pilier 2 : la lumière-vedette de la NUIT) — neuf rais étroits, rose / cyan / or, qui montent de la ville vers le ciel et
     tournent très lentement autour de la caméra (un seul changement de rotation par image). Ce sont trois rubans croisés (6 triangles), fondus
     sur leur largeur et sur leur longueur dans le shader, additifs, derrière tout le reste ; visibles la nuit seulement (`uNuit`).
   Tout se tire dans un générateur LOCAL (`mulberry32(seed ^ …)`, la graine de la piste est `CRYPTO.sd`) : la piste ne bouge pas d'un bit.
   Paliers (`PAL.B`) : tours [36, 72, 110] · bougies par graphique [10, 16, 24] · projecteurs [0, 5, 9] (aucun au palier ancien).
   Crochets : `dbgCrypto('horizon')` (état), `dbgCrypto('masque','horizon'|'faisceaux')`, `dbgCrypto('route',{f,h,av,fov,cap,pitch,sec})` (la caméra posée sur la route :
   `f` la part de la piste, `h` la hauteur, `av` m en arrière, `cap` rad de rotation vers la droite, `sec` : rend les coordonnées sans dessiner) et `dbgCrypto('cout')` (appels/triangles d'UNE image). */
PAL.B.cryptoHor=[36,72,110];
PAL.B.cryptoBoug=[10,16,24];
PAL.B.cryptoFais=[0,5,9];
const CRH={mat:null,matF:null,tours:null,fais:null,D:2400,n:0};
function crhMat(add){ /* un shader, deux mélanges : l'opaque (couronne) et l'additif (projecteurs) partagent le même programme */
  const k=add?'matF':'mat';if(CRH[k])return CRH[k];
  const U=THREE.UniformsUtils.clone(THREE.UniformsLib.fog);
  U.uZen=skyU.uJZen;U.uMid=skyU.uJMid;U.uHor=skyU.uJHor;U.uNuit=CRYPTO.uNuit;U.uT=CRYPTO.uT;U.uSun=CRYPTO.uSun;
  const m=new THREE.ShaderMaterial({uniforms:U,fog:true,side:THREE.DoubleSide,transparent:!!add,depthWrite:!add,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,
    vertexShader:'attribute vec4 aK;varying vec4 vK;varying vec3 vP;varying float fogDepth;void main(){vK=aK;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);fogDepth=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uZen,uMid,uHor,uSun,fogColor;uniform float uNuit,uT,fogNear,fogFar;varying vec4 vK;varying vec3 vP;varying float fogDepth;\n'+
      'void main(){float h=vK.x,kd=vK.y,r=vK.z,ac=vK.w,ff=smoothstep(fogNear,fogFar,fogDepth);vec3 c;\n'+
      ' if(kd>2.5){ /* un PROJECTEUR : fondu sur la largeur (ac) et la longueur (h), plus fort à la base, la nuit seulement */\n'+
      '  vec3 hue=r<.34?vec3(1.,.30,.68):r<.67?vec3(.28,.88,1.):vec3(1.,.78,.32);float e=1.-abs(ac);e*=e*e;\n'+
      '  c=hue*e*(1.-h)*(1.-.4*h)*1.1*uNuit*(.8+.2*sin(uT*1.9+r*40.))*(1.-ff*.75);gl_FragColor=vec4(c,1.);return;}\n'+
      ' float roof=step(5.,ac);vec2 nn=roof>.5?vec2(0.,1.):vec2(cos(ac),sin(ac));float fc=roof>.5?.62:.5+.5*dot(nn,normalize(uSun.xz+vec2(1e-4))); /* la FACE : ac = son azimut (9 = le toit), fc = sa part de soleil */\n'+
      ' if(kd>.5){ /* une BOUGIE : verte (la hausse) ou rouge, plus claire vers le haut, un flanc plus clair que l\'autre ; un peu plus vive la nuit */\n'+
      '  c=(kd<1.5?vec3(.10,.80,.36):vec3(.95,.15,.22))*(.74+.3*h)*(.84+.3*fc)*(1.+.25*uNuit);}\n'+
      ' else { /* une TOUR : le pied fond dans la brume ; le jour une silhouette bleu froid, un flanc chaud (le soleil) et un flanc froid, la tête éclairée ; la nuit une masse sombre aux bureaux allumés */\n'+
      '  vec3 day=mix(fogColor,uMid*vec3(.50,.55,.70),smoothstep(0.,.5,h))+uHor*.55*smoothstep(.78,1.,h);\n'+
      '  day*=roof>.5?vec3(1.1,1.06,1.):mix(vec3(.70,.80,1.),vec3(1.22,1.1,.88),fc);\n'+
      '  vec2 tg=vec2(-nn.y,nn.x),cl=vec2(dot(vP.xz,tg)/24.,vP.y/34.),id=floor(cl),f9=fract(cl);float hs=fract(sin(dot(id+r*37.,vec2(12.9898,78.233)))*43758.5453);\n'+
      '  float win=step(.58,hs)*step(.2,f9.x)*step(f9.x,.8)*step(.25,f9.y)*step(f9.y,.75)*(1.-roof)*smoothstep(.04,.3,h)*(1.-.7*smoothstep(.9,1.,h));\n'+
      '  float pk=fract(hs*7.13+r*5.7);vec3 wn=r>.88?vec3(1.,.36,.66):r<.1?vec3(.38,.92,1.):pk<.1?vec3(1.,.36,.66):pk<.22?vec3(.38,.92,1.):vec3(1.,.76,.40);\n'+
      '  vec3 nuit=mix(fogColor,vec3(.03,.04,.11),smoothstep(0.,.4,h))*(.7+.6*fc)+wn*win*(.6+.9*fract(hs*9.3))*1.5;\n'+
      '  c=mix(day,nuit,uNuit);}\n'+
      ' c=mix(c,fogColor,ff);gl_FragColor=vec4(c,1.);}'});
  m.dispose=function(){};
  CRH[k]=m;return m;
}
/* une boîte (4 flancs + le toit) : x,z le centre, y0..y1 la hauteur, w × d la base, rot l'angle ; K = (hauteur 0..1, sorte, hasard, travers) */
function crhBoite(P,K,x,z,y0,y1,w,d,rot,sorte,r){
  const co=Math.cos(rot),si=Math.sin(rot),hx=w/2,hz=d/2,C=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(function(q){return [x+q[0]*co-q[1]*si,z+q[0]*si+q[1]*co];});
  let az=9; /* K.w : l'azimut du flanc (la normale sortante) ; 9 = le toit */
  const v=function(c,y,h){P.push(c[0],y,c[1]);K.push(h,sorte,r,az);};
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];let nx=b[1]-a[1],nz=a[0]-b[0];if(nx*((a[0]+b[0])/2-x)+nz*((a[1]+b[1])/2-z)<0){nx=-nx;nz=-nz;}az=Math.atan2(nz,nx);
    v(a,y0,0);v(b,y0,0);v(b,y1,1);v(a,y0,0);v(b,y1,1);v(a,y1,1);}
  az=9;v(C[0],y1,1);v(C[1],y1,1);v(C[2],y1,1);v(C[0],y1,1);v(C[2],y1,1);v(C[3],y1,1);
}
function crhGeo(P,K){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,4));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);return g;}
function crhVide(){
  for(const k of ['tours','fais']){const o=CRH[k];if(!o)continue;if(o.parent)o.parent.remove(o);try{o.geometry.dispose();}catch(e){}CRH[k]=null;}
}
function crhBatit(){
  crhVide();
  const sd=(CRYPTO.sd||0)^0x4B0C0DE5,rr=mulberry32(sd),NT=PAL.b('cryptoHor',110),NB=PAL.b('cryptoBoug',24),NF=PAL.b('cryptoFais',9),D=CRH.D,PI2=6.2832;
  {const P=[],K=[];
    /* la couronne de tours : des azimuts tirés par tranches (aucun trou), une distance de 100 à 500 m de plus que D, des hauteurs en carré (beaucoup de basses, quelques géantes) */
    for(let i=0;i<NT;i++){const a=(i+rr())/NT*PI2,d=D+(rr()-.35)*520,w=60+rr()*110,hgt=90+Math.pow(rr(),2.2)*420,y0=-260,rot=a+(rr()-.5)*.8,r=rr();
      crhBoite(P,K,Math.sin(a)*d,Math.cos(a)*d,y0,y0+hgt+120,w,w*(.7+rr()*.5),rot,0,r);
      if(rr()<.28){const w2=w*.55,h2=hgt*(.4+rr()*.4);crhBoite(P,K,Math.sin(a+.012)*d,Math.cos(a+.012)*d,y0+hgt+60,y0+hgt+120+h2*.35,w2,w2,rot,0,r);} /* un étage en retrait sur quelques-unes */
    }
    /* LES TROIS GRAPHIQUES : des bougies japonaises, un cours qui monte en dents de scie (un quart de rouges) — plus près que les tours, donc plus nettes dans la brume */
    for(let g=0;g<3;g++){const a0=(g+rr()*.6)/3*PI2,dA=.027,dg=D*.8+rr()*120,pente=8+rr()*5;let p9=-110+rr()*40;
      for(let i=0;i<NB;i++){const a=a0+i*dA,o=p9;let c=o+pente+(rr()-.5)*2*46;if(Math.abs(c-o)<14)c=o+(c<o?-14:14);
        const lo=Math.min(o,c),hi=Math.max(o,c),sorte=c<o?2:1,mf=10+rr()*38,mb=8+rr()*30,x=Math.sin(a)*dg,z=Math.cos(a)*dg,w=D*dA*.62;
        crhBoite(P,K,x,z,lo,hi,w,w*.8,a,sorte,rr());
        crhBoite(P,K,x,z,lo-mb,hi+mf,w*.12,w*.12,a,sorte,rr()); /* la mèche */
        p9=c;}}
    const m=new THREE.Mesh(crhGeo(P,K),crhMat(false));m.frustumCulled=false;m.renderOrder=-2;m.matrixAutoUpdate=true;m.visible=false;scene.add(m);CRH.tours=m;CRH.n=P.length/9;}
  if(NF>0){const P=[],K=[];
    /* les projecteurs : une base sur l'horizon, une direction qui penche vers l'extérieur ; trois rubans croisés à 60° (fondus sur leur largeur) */
    for(let i=0;i<NF;i++){const a=(i+.2+rr()*.6)/NF*PI2,d=1800+rr()*600,bx=Math.sin(a)*d,bz=Math.cos(a)*d,by=-140+rr()*60,lean=.18+rr()*.3,ph=rr()*PI2,
        dx=Math.sin(a+ph*.1)*lean,dz=Math.cos(a+ph*.1)*lean,dl=Math.hypot(dx,1,dz),dir=[dx/dl,1/dl,dz/dl],len=1700+rr()*500,wB=12+rr()*8,wT=wB*3,hue=(i%3)/3+.1;
      let ux=-dir[2],uy=0,uz=dir[0];const lu=Math.hypot(ux,uz)||1;ux/=lu;uz/=lu;const vx=dir[1]*uz-dir[2]*uy,vy=dir[2]*ux-dir[0]*uz,vz=dir[0]*uy-dir[1]*ux; /* (u, v) : le plan perpendiculaire à la direction */
      for(let q=0;q<3;q++){const f=q*Math.PI/3,sx=ux*Math.cos(f)+vx*Math.sin(f),sy=uy*Math.cos(f)+vy*Math.sin(f),sz=uz*Math.cos(f)+vz*Math.sin(f),
          tx=bx+dir[0]*len,ty=by+dir[1]*len,tz=bz+dir[2]*len,A=[bx-sx*wB,by-sy*wB,bz-sz*wB],B=[bx+sx*wB,by+sy*wB,bz+sz*wB],C=[tx+sx*wT,ty+sy*wT,tz+sz*wT],E=[tx-sx*wT,ty-sy*wT,tz-sz*wT];
        P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2],A[0],A[1],A[2],C[0],C[1],C[2],E[0],E[1],E[2]);
        K.push(0,3,hue,-1, 0,3,hue,1, 1,3,hue,1, 0,3,hue,-1, 1,3,hue,1, 1,3,hue,-1);}}
    const m=new THREE.Mesh(crhGeo(P,K),crhMat(true));m.frustumCulled=false;m.renderOrder=-1;m.visible=false;scene.add(m);CRH.fais=m;}
}
function crhTick(t,on){
  const T9=CRH.tours,F9=CRH.fais;if(!T9&&!F9)return;
  if(!on||!CRYPTO.root){if(T9)T9.visible=false;if(F9)F9.visible=false;return;}
  const fg=scene.fog,cp=camera.position;
  /* la couronne se recale sur la brume : sa distance = 58 % de la portée utile (entre 2 200 et 3 400 m) — la même image à l'écran, une brume qui change */
  const dist=fg?Math.min(3400,Math.max(2200,fg.near+.58*(fg.far-fg.near))):2800,sc=dist/CRH.D;
  if(T9){T9.visible=true;T9.position.set(cp.x,cp.y,cp.z);T9.scale.setScalar(sc);}
  if(F9){const nuit=CRYPTO.uNuit.value;F9.visible=nuit>.03;if(F9.visible){F9.position.set(cp.x,cp.y,cp.z);F9.scale.setScalar(sc);F9.rotation.y=t*.03;}}
}
function crhChauffe(add){ /* au menu : le programme (opaque et additif) compilé et dessiné une fois hors écran — 0 compilation en course */
  const g=crhGeo([0,0,0,1,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0]);for(const a of [false,true]){const o=new THREE.Mesh(g,crhMat(a));o.frustumCulled=false;add(o);}
}
(function(){ /* les crochets de banc, posés par-dessus ceux de cryptocity.js */
  const d0=window.dbgCrypto;
  window.dbgCrypto=function(k,v){
    if(k==='horizon')return {tours:!!CRH.tours,faisceaux:!!CRH.fais,tris:CRH.n,echelle:CRH.tours?+CRH.tours.scale.x.toFixed(3):null,brume:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far)]:null,nuit:CRYPTO.uNuit.value};
    if(k==='masque'&&(v==='horizon'||v==='faisceaux')){const o=v==='horizon'?CRH.tours:CRH.fais;if(o)o.userData.cache=!o.userData.cache;if(o)o.layers.mask=o.userData.cache?0:1;if(POST_ON&&composer)composer.render();return v;}
    if(k==='route'){ /* la caméra sur la route, à la part f de la piste, à h m au-dessus, av m en arrière, tournée de cap rad vers la droite */
      v=v||{};const i=Math.max(2,Math.min(NP-3,Math.floor((v.f==null?.3:v.f)*NP))),p=pts[i],q=pts[Math.min(NP-1,i+3)],tx=q.x-p.x,tz=q.z-p.z,tl=Math.hypot(tx,tz)||1,ux=tx/tl,uz=tz/tl,cap=v.cap||0,c=Math.cos(cap),s=Math.sin(cap),fx=ux*c-uz*s,fz=ux*s+uz*c,av=v.av==null?10:v.av;
      const V9={p:[p.x-ux*av,p.y+(v.h==null?5:v.h),p.z-uz*av],c:[p.x-ux*av+fx*100,p.y+(v.h==null?5:v.h)+100*Math.tan(v.pitch||0),p.z-uz*av+fz*100],fov:v.fov||70};
      return v.sec?V9:d0('photo',V9);} /* v.sec : rend les coordonnées sans dessiner (le banc les rejoue sur l'ancienne version) */
    if(k==='cout'){const r=renderer.info;r.autoReset=false;r.reset();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);const o={appels:r.render.calls,triangles:r.render.triangles,programmes:r.programs?r.programs.length:null,textures:r.memory.textures,geometries:r.memory.geometries};r.autoReset=true;return o;}
    return d0(k,v);};
})();
