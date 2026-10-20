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
const FAURA={mat:null,px:1,N:[240,280,420,0,150]};
function fauraMat(kind){
  const m=new THREE.ShaderMaterial({
    uniforms:{uT:{value:0},uKind:{value:kind},uPx:{value:600}},
    vertexShader:`uniform float uT,uKind,uPx;attribute vec4 aSeed;varying vec4 vCol;varying float vShape;
float h(float x){return fract(sin(x*127.1)*43758.5453);}
vec3 ramp(float l){return mix(mix(vec3(1.,.96,.62),vec3(1.,.52,.08),smoothstep(0.,.42,l)),vec3(.78,.06,.03),smoothstep(.4,1.,l));}
void main(){
  vec3 p=vec3(0.);float size=.2;vec4 col=vec4(0.);float shape=0.;vec4 s=aSeed;
  if(uKind<.5){ // PIMENT : un feu FANTÔME — des volutes molles, translucides, nées sur TOUT le corps du fruit (le long de sa courbe) qui montent en l'enveloppant
    float u=s.x;float a=-1.05+u*2.9;float R=1.15-.5*u;
    vec2 c=.8*vec2(R*sin(a),-R*cos(a)+.55);vec2 nr=vec2(sin(a),-cos(a));
    float life=fract(uT*(.32+.28*s.y)+s.w);
    float q=s.z*6.2832;float rad=(.38+.5*s.y)*(1.+life*.45);
    p=vec3(c+nr*cos(q)*rad,sin(q)*rad*.9);
    p+=vec3(sin(uT*1.7+s.x*20.+life*5.)*.28*life,life*(1.5+1.3*s.y),cos(uT*1.3+s.y*17.)*.22*life);
    size=(.55+.5*s.y)*(1.-life*.5)+.14;shape=3.;
    float fl=.65+.35*sin(uT*4.+s.x*40.+s.z*9.);
    col=vec4(ramp(life*.9),(1.-life)*(1.-life)*.5*fl);
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
  } else if(uKind<2.5){ // DRAGON : GENJUTSU — l'oeil qui hypnotise : anneaux écarlates, trois tomoe qui tournent, brume violette, plumes noires (disque face à la caméra, derrière le fruit)
    float br=1.+.04*sin(uT*2.2);float w=s.w;vec2 q2=vec2(0.);float al=1.;vec3 cc=vec3(.85,.06,.12);float sz=.15;float sh2=0.;
    if(w<.34){ // les tomoe : une tête ronde + une queue qui s'enroule en arrière
      float arm=floor(s.x*3.);float th=arm*2.0944+uT*1.15;
      if(s.y<.34){float ra=sqrt(s.z)*.55,an=s.w*60.;q2=3.3*vec2(cos(th),sin(th))+ra*vec2(cos(an+s.x*40.),sin(an+s.x*40.));sz=.2;}
      else{float tt=(s.y-.34)/.66;float ph=th-tt*1.25;float r=3.3-tt*1.0;vec2 nm=vec2(cos(ph),sin(ph));q2=r*nm+vec2(-nm.y,nm.x)*(1.-tt)*.5*(s.z-.5)*1.4;sz=.2-.09*tt;}
      cc=mix(vec3(.9,.05,.1),vec3(1.,.28,.16),s.z);
    } else if(w<.58){ // trois anneaux fins, sens opposés
      float rg=floor(s.x*3.);float R=2.0+rg*1.35+.07*sin(uT*3.+s.z*30.);float an=s.z*6.2832+uT*(rg==1.?-.6:.5);
      q2=R*vec2(cos(an),sin(an));sz=.12;cc=mix(vec3(.55,.02,.1),vec3(1.,.15,.2),h(s.y*91.));
    } else if(w<.8){ // la brume : de grands disques mous violets et rouges qui tournent
      float rr=s.y*5.6;float an=s.z*6.2832+uT*.3+rr*.4;q2=rr*vec2(cos(an),sin(an));sz=1.5;sh2=3.;
      cc=mix(vec3(.45,.08,.7),vec3(.9,.08,.2),s.x);al=.13+.07*sin(uT*2.+s.z*30.);
    } else { // les plumes noires qui tombent en tournoyant
      float lf=fract(uT*.22+s.x);float an=s.z*6.2832+lf*3.;float rr=1.5+s.y*4.2;
      q2=vec2(cos(an)*rr+sin(uT+s.x*20.)*.3,(1.-2.*lf)*5.6);sz=.17;cc=vec3(.08,.0,.12);al=.95*sin(lf*3.1416);
    }
    p=vec3(q2*br,-1.6);size=sz;shape=sh2;col=vec4(cc,al);
  } else if(uKind<3.5){ // RAISIN : halo d'ange et poussière d'or
    if(s.w<.3){float a=s.z*6.2832+uT*.9;p=vec3(cos(a)*1.3,2.75+sin(a)*.17+sin(uT*1.6)*.08,sin(a)*.62);size=.14;col=vec4(1.,.93,.55,.95);}
    else{float life=fract(uT*.3+s.x);float a=s.z*6.2832+uT*.5;float r=1.1+2.*s.y;float tw=.5+.5*sin(uT*7.+s.x*50.);
      p=vec3(cos(a)*r,-1.+life*5.2,sin(a)*r*.8);size=.2*(.45+tw);col=vec4(1.,.96,.74,(1.-life)*tw);shape=1.;}
  } else { // POMME DORÉE : les étincelles
    float life=fract(uT*.42+s.x);float a=s.z*6.2832+uT*(.9+s.y);float r=1.25+1.5*s.y+life*.8;float tw=.45+.55*abs(sin(uT*6.+s.x*40.));
    p=vec3(cos(a)*r,-1.2+life*4.+sin(a*2.)*.3,sin(a)*r*.7);size=.24*tw*(1.-life*.4);col=vec4(1.,.8,.26,tw*(1.-life*.5));shape=1.;}
  vCol=col;vShape=shape;
  vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;if(col.a<.01)gl_Position=vec4(9.,9.,9.,1.);
  gl_PointSize=clamp(size*uPx/max(.1,-mv.z),2.,90.);
}`,
    fragmentShader:`varying vec4 vCol;varying float vShape;
void main(){vec2 c=gl_PointCoord-.5;float v=max(abs(c.x),abs(c.y))*2.;
  if(vShape>2.5){float r=length(c)*2.;float al=smoothstep(1.,.1,r)*vCol.a;if(al<.01)discard;gl_FragColor=vec4(min(vCol.rgb*1.15+.05,vec3(1.)),al);return;}
  if(vShape>.5&&vShape<1.5){float ax=abs(c.x),ay=abs(c.y);if(!(min(ax,ay)<.09||ax+ay<.17))discard;}
  vec3 core=min(vCol.rgb*1.35+.15,vec3(1.));vec3 edge=vCol.rgb*vec3(.85,.5,.62);
  gl_FragColor=vec4(v>.62&&vShape<.5?edge:(vShape>1.5?min(vCol.rgb*1.1+.05,vec3(1.)):core),clamp(vCol.a,0.,1.));}`,
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

/* LA COQUE DE FEU (2026-10-20, Léo : « il y a mieux que les particules ?? ») — la technique des vrais jeux : une COPIE de la géométrie du fruit, gonflée le long de ses normales
   et tirée vers le haut par un bruit qui monte, dont le fragment découpe la flamme (bruit 3D qui défile vers le haut, cœur blanc-jaune → orange → rouge, bord fondu).
   Le feu épouse le fruit au lieu de flotter autour. 3 coques (`uS` 0..2) = de la profondeur ; UN programme, 3 appels de dessin, zéro particule. */
const FSHELL_VS=`uniform float uT,uS;varying vec3 vP;varying float vF;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 p=position;vec3 n=normalize(normal);float up=clamp(n.y*.6+.5,0.,1.);
  float nn=n3(p*2.4+vec3(0.,-uT*1.8,0.));
  vec3 q=p+n*(.07+.13*uS)+vec3(0.,1.,0.)*(.18+.6*nn)*up*(.45+.55*uS)+vec3(sin(uT*3.+p.y*4.)*.05,0.,cos(uT*2.6+p.x*3.)*.04);
  vP=q;vF=up;gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`;
const FSHELL_FS=`uniform float uT,uS;varying vec3 vP;varying float vF;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){float f=n3(vP*3.+vec3(0.,-uT*2.2,0.))*.6+n3(vP*6.2+vec3(0.,-uT*3.5,.7))*.4;
  float m=smoothstep(.30,.62,f+vF*.28-uS*.2);
  vec3 c=mix(vec3(.85,.1,.04),vec3(1.,.62,.12),smoothstep(.34,.56,f));c=mix(c,vec3(1.,.96,.66),smoothstep(.56,.78,f));
  float a=m*(.62-.14*uS);if(a<.02)discard;gl_FragColor=vec4(c,a);}`;
function fauraShell(geo,n){
  const g=new THREE.Group();
  for(let i=0;i<(n||3);i++){
    const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uS:{value:i}},vertexShader:FSHELL_VS,fragmentShader:FSHELL_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const ms=new THREE.Mesh(geo,m);ms.renderOrder=20+i;ms.frustumCulled=false;g.add(ms);}
  g.userData.fshell=true;return g;
}
function fauraShellTick(g,t){for(const c of g.children)c.material.uniforms.uT.value=t;}

/* ===== LES AURAS EN SHADER SUR LE FRUIT (la version qui va EN JEU) =====
   Une COQUE par fruit-pouvoir (copie de sa géométrie, gonflée le long des normales) : le shader dessine l'aura SUR la forme du fruit.
   `uKind` : 0 PIMENT feu qui lèche vers le haut · 1 CITRON éclairs vifs qui courent sur la coque (claquent à 13 Hz) · 2 DRAGON bandes hypnotiques qui tournent
   (et le DISQUE GENJUTSU derrière : un shader dessine l'oeil — anneaux, trois tomoe, pupille — sur un carré toujours face à la caméra, calculé dans le vertex shader
   donc valable pour un objet GELÉ) · 4 POMME DORÉE reflet doré + étincelles. Le RAISIN n'a pas d'aura (Léo : « les ailes blanches sans halo »).
   UN temps partagé (`FAURAU.uT`, avancé UNE fois par image) : tous les fruits de la route battent ensemble, zéro travail par fruit. */
const FAURAU={uT:{value:0}};FAURAU.t=0;
const FSH2_NOISE=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
const FSH2_VS=`uniform float uT,uKind,uS;varying vec3 vP;varying vec3 vN;varying vec3 vV;varying float vF;
`+FSH2_NOISE+`
void main(){vec3 p=position;vec3 n=normalize(position+vec3(0.,.001,0.)); /* gonflé le long de la direction RADIALE, pas des normales : la géométrie est à facettes plates, des normales différentes en un même sommet la déchireraient en éclats */
  vec3 nrm=normalize(normal);float up=clamp(n.y*.6+.5,0.,1.);vec3 q;
  if(uKind<.5){float nn=n3(p*2.4+vec3(0.,-uT*1.8,0.));
    q=p+n*(.07+.13*uS)+vec3(0.,1.,0.)*(.18+.6*nn)*up*(.45+.55*uS)+vec3(sin(uT*3.+p.y*4.)*.05,0.,cos(uT*2.6+p.x*3.)*.04);}
  else if(uKind<1.5){q=p+n*(.05+.1*uS+.03*sin(uT*30.+p.x*20.));}
  else q=p+n*(.045+.07*uS);
  vP=q;vF=up;vN=normalize(normalMatrix*nrm);vec4 mv=modelViewMatrix*vec4(q,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
const FSH2_FS=`uniform float uT,uKind,uS;varying vec3 vP;varying vec3 vN;varying vec3 vV;varying float vF;
`+FSH2_NOISE+`
void main(){vec3 nv=normalize(vN),vv=normalize(vV);float rim=pow(1.-abs(dot(nv,vv)),2.2);vec4 col=vec4(0.);
  if(uKind<.5){float f=n3(vP*3.+vec3(0.,-uT*2.2,0.))*.6+n3(vP*6.2+vec3(0.,-uT*3.5,.7))*.4;
    float m=smoothstep(.30,.62,f+vF*.28-uS*.2);
    vec3 c=mix(vec3(.85,.1,.04),vec3(1.,.62,.12),smoothstep(.34,.56,f));c=mix(c,vec3(1.,.96,.66),smoothstep(.56,.78,f));
    col=vec4(c,m*(.62-.14*uS));}
  else if(uKind<1.5){float f=n3(vP*4.+vec3(uT*2.4,uT*1.7,-uT*1.1)),g=n3(vP*9.-vec3(uT*3.,0.,uT*2.));
    float line=pow(1.-abs(2.*f-1.),16.)+.6*pow(1.-abs(2.*g-1.),22.);
    float flick=step(.25,fract(sin(floor(uT*13.)*91.7)*437.5));
    float a=clamp(line*1.1*flick+rim*.28*(.6+.4*flick),0.,1.)*(1.-uS*.35);
    col=vec4(mix(vec3(.35,.85,1.),vec3(1.,1.,.8),clamp(line,0.,1.)),a);}
  else if(uKind<2.5){float ang=atan(vP.z,vP.x);float b=.5+.5*sin(ang*3.+vP.y*8.-uT*3.2+uS*2.);
    vec3 c=.55+.45*cos(6.2832*(vec3(0.,.2,.4)+.5*b+uT*.1));c=mix(c,vec3(.9,.1,.35),.4);
    col=vec4(c,(b*.32+rim*.45)*(1.-uS*.3));}
  else{float sp=step(.965,n3(vP*20.+vec3(0.,floor(uT*7.),0.)));
    col=vec4(mix(vec3(1.,.78,.25),vec3(1.,.95,.7),sp),clamp(rim*.55+sp*.9,0.,1.)*(1.-uS*.3));}
  if(col.a<.02)discard;gl_FragColor=col;}`;
const FDISC_VS=`uniform float uSize;varying vec2 vUv;
void main(){vUv=position.xy*2.;vec4 c=modelViewMatrix*vec4(0.,0.,0.,1.);vec4 mv=c+vec4(position.xy*uSize,-1.8,0.);gl_Position=projectionMatrix*mv;}`;
const FDISC_FS=`uniform float uT,uA;varying vec2 vUv;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float tomoe(vec2 q){float d=length(q-vec2(.5,0.));float head=1.-smoothstep(.085,.1,d);
  float r=length(q),ph=atan(q.y,q.x);float inArc=step(-1.2,ph)*step(ph,.02);float th=.085*(1.+ph/1.2);
  float tail=inArc*(1.-smoothstep(th*.8,th,abs(r-.5)));return max(head,tail);}
void main(){vec2 p=vUv;float r=length(p);if(r>1.)discard;float t=uT;float disc=smoothstep(1.,.88,r);
  vec3 col=vec3(.04,0.,.08);float a=.78*disc;
  for(float i=0.;i<3.;i++){float rr=.92-i*.17;float rg=1.-smoothstep(0.,.022,abs(r-rr));col=mix(col,vec3(.95,.08,.14),rg);a=max(a,rg*.95);}
  float sw=.5+.5*sin(atan(p.y,p.x)*4.+r*8.-t*1.5);col+=vec3(.35,.05,.5)*sw*.35*disc;
  float tm=0.;for(float k=0.;k<3.;k++){vec2 q=rot(t*1.1+k*2.0944)*p;tm=max(tm,tomoe(q));}
  col=mix(col,vec3(1.,.12,.16),tm);a=max(a,tm*.95);
  float pu=1.-smoothstep(.12,.14,r);col=mix(col,vec3(0.),pu);a=max(a,pu*.9);
  gl_FragColor=vec4(col,a*disc*uA);}`;
/* fauraFruit(kind, geo) : le groupe d'aura d'un fruit-pouvoir (kind = 0 piment · 1 citron · 2 dragon · 4 pomme dorée ; 3 raisin = rien) — à ajouter COMME ENFANT du mesh du fruit */
function fauraFruit(kind,geo){
  const g=new THREE.Group();if(kind===3)return g;
  const nS=kind===0?3:2;
  for(let i=0;i<nS;i++){
    const m=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uKind:{value:kind},uS:{value:i}},vertexShader:FSH2_VS,fragmentShader:FSH2_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const ms=new THREE.Mesh(geo,m);ms.renderOrder=20+i;g.add(ms);}
  if(kind===2){
    const dm=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uSize:{value:7.5},uA:{value:1}},vertexShader:FDISC_VS,fragmentShader:FDISC_FS,transparent:true,depthWrite:false});
    const d=new THREE.Mesh(FDISC_GEO||(FDISC_GEO=new THREE.PlaneGeometry(1,1)),dm);d.renderOrder=18;d.frustumCulled=false;g.add(d);}
  return g;
}
let FDISC_GEO=null;
function fauraGlobalTick(dt){FAURAU.t+=Math.min(dt,.1);FAURAU.uT.value=FAURAU.t;}
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
  let a;if(window.__faAncien){a=fauraNew(kind);g.add(a);}else{a=fauraFruit(kind,geo);m.add(a);a.userData.jeu=true;}scene.add(g);window.__fa={g,a,m};
  if(ang==='course'){ // le cadre du jeu : le fruit posé sur la route devant la caisse, vu par la caméra de poursuite telle quelle (à `dist` m)
    camera.getWorldDirection(FAURA_Q.w===1?new THREE.Vector3():new THREE.Vector3());const fw=new THREE.Vector3();camera.getWorldDirection(fw);fw.y=0;fw.normalize();
    g.position.copy(carGroup.position).addScaledVector(fw,dist||26).add(new THREE.Vector3(0,2.2,0));m.scale.setScalar(2.7);
  } else {const aa=ang==null?.35:ang,d=dist||22,p=g.position;
    camera.position.set(p.x+Math.sin(aa)*d,p.y+1.6,p.z+Math.cos(aa)*d);camera.lookAt(p.x,p.y+.6,p.z);camera.updateMatrixWorld();}
  g.updateMatrixWorld(true);if(a.userData.jeu){FAURAU.uT.value=t||0;}else if(a.userData.fshell)fauraShellTick(a,t||0);else fauraTick(a,t||0,camera);
  m.rotation.y=(t||0)*.8;g.updateMatrixWorld(true);
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  return renderer.domElement.toDataURL('image/png');
};

/* banc (dev) : `dbgPwrDevant(k, ds, lat)` pose un fruit-pouvoir `k` ('n','v','x','a','m') à `ds` m devant la caisse, côté route — pour le voir EN COURSE, à sa vraie place. */
window.dbgPwrDevant=function(k,ds,lat){
  const sp=s+(ds||70);frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
  const m=mkPower(k,1),lev9=m.userData.lev||2.1;
  m.position.copy(F.p).addScaledVector(F.b,lat||0).addScaledVector(F.n,lev9);m.quaternion.setFromRotationMatrix(mat4b);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
  pickups.push({s:sp,lat:lat||0,face:1,nitro:false,pow:k,mesh:m,taken:false,ax:F.n.clone()});return sp;
};
/* banc (dev) : `dbgLigneFruits()` — l'état de la file de fruits (posés / pris), la nitro (normale, réserve bleue), le nombre de fruits devant la caisse. */
window.dbgLigneFruits=function(){let ah=0,ap=0;for(const p of pickups)if(!p.taken&&p.ligne&&p.face===1&&p.s>s&&p.s<s+700)ah++;let pw=0,pwp=0;for(const p of pickups)if(p.pow&&p.face===1){pw++;if(p.taken)pwp++;}return {progs:renderer.info.programs?renderer.info.programs.length:null,rai:RAI.stage,heat:+NINF.h.toFixed(2),rgb:NINF.rgb,nitroOn:!!nitroOn,pouvoirsPosés:pw,pouvoirsPris:pwp,posés:LIGNE.n.slice(),pris:LIGNE.pris.slice(),devant700m:ah,nitroR:+nitroR.toFixed(2),nitroX:+nitroX.toFixed(2),s:Math.round(s),pads:PADS.length};};

/* ===== LE PIMENT : LA NITRO INFINIE QUI CHAUFFE (2026-10-20, Léo) =====
   7 s de nitro infinie (au lieu de 9). La couleur du feu ÉVOLUE avec le temps de boost accumulé, dans l'ordre de la TEMPÉRATURE d'une flamme (la chimie) :
   rouge feu → orange → jaune → blanc → bleu → violet. `NINF.h` (0 → 1) monte pendant qu'on boost (plein régime : ~8 s pour finir violet), redescend doucement
   sinon, retombe à 0 quand le pouvoir finit. La plume, le cœur, la racine, le ruban (NINF, lus par la boucle) et les BORDS d'ÉCRAN suivent — discrets au début
   (« un peu enflammés, pas un truc énorme ») et plus forts à mesure que ça chauffe. */
PWR_DEFS.n.t=7;PWR_DEFS.n.msg='PIMENT — NITRO INFINIE 7 s À FOND !';PWR_DEFS.n.sous='7 S A FOND';
const NINF_STOPS=[[0,0xff2208],[.2,0xff7a18],[.4,0xffd02a],[.58,0xfff2d8],[.8,0x4f8bff],[1,0x9d4dff]];
const NINF_C=new THREE.Color(),NINF_A=new THREE.Color(),NINF_B=new THREE.Color(),NINF_W=new THREE.Color(0xffffff);
NINF.h=0;NINF.rgb=[255,34,8];
function ninfCouleur(h,out){let i=0;while(i<NINF_STOPS.length-2&&h>NINF_STOPS[i+1][0])i++;const a=NINF_STOPS[i],b=NINF_STOPS[i+1],u=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0])));
  NINF_A.setHex(a[1]);NINF_B.setHex(b[1]);return out.copy(NINF_A).lerp(NINF_B,u);}
function ninfTick(dt){
  if(!(pwrNitroT>0)){if(NINF.h!==0){NINF.h=0;NINF.jet=0x9d4dff;NINF.core=0xf3e6ff;NINF.rac=0xd8b8ff;NINF.trail=[.95,.45,1.6];}return;}
  if(nitroOn)NINF.h=Math.min(1,NINF.h+dt/8);else NINF.h=Math.max(0,NINF.h-dt*.15);
  ninfCouleur(NINF.h,NINF_C);
  NINF.jet=NINF_C.getHex();NINF.core=NINF_B.copy(NINF_C).lerp(NINF_W,.62).getHex();NINF.rac=NINF_B.copy(NINF_C).lerp(NINF_W,.35).getHex();
  NINF.trail=[NINF_C.r*1.25,NINF_C.g*1.25,NINF_C.b*1.25];NINF.rgb=[Math.round(NINF_C.r*255),Math.round(NINF_C.g*255),Math.round(NINF_C.b*255)];
}

/* ===== LA POMME DORÉE : L'AIMANT À PIÈCES EN SPIRALE (2026-10-20, Léo : « les objets filent en spirale dorée ») =====
   Seules les PIÈCES sont attirées (voir `gros9` dans ramassage). Chaque pièce attirée tourne autour de la caisse en s'en rapprochant (une composante
   tangente, dans le plan de la route) et sème une étincelle dorée de temps en temps. La plaque, les bords d'écran et le nom passent à l'OR. */
const MAGV=new THREE.Vector3(),MAGT=new THREE.Vector3();
function magSpirale(p,d9,dt){
  const P=p.mesh.position;MAGV.copy(carGroup.position).sub(P);MAGT.crossVectors(MAGV,p.ax);const l=MAGT.length();if(l<1e-4)return;
  MAGT.multiplyScalar(Math.min(d9,18)/l*dt*5.5);P.add(MAGT);
  if(Math.random()<.04)sparkBurst(sparkGold,P,1,2);
}
Object.assign(PWR_DEFS.m,{col:0xffd24a,core:0xfff2c8,tint:'#ffd75e',c2:'#e0a010',fx:'rgba(255,210,74,.7)',fx2:'rgba(224,160,16,.25)',msg:'POMME DORÉE — LES PIÈCES VIENNENT À TOI !',sous:'LES PIECES VIENNENT A TOI'});
{const f9=function(c){return c.replace(/,([.\d]+)\)$/,function(m,a){return ','+(+a*PWR_BORD_K).toFixed(3)+')';});};PWR_DEFS.m.bd=f9(PWR_DEFS.m.fx);PWR_DEFS.m.bd2=f9(PWR_DEFS.m.fx2);}

/* ===== LE FRUIT DU DRAGON : AURA ×2 → ×3 · GENJUTSU · JUS (2026-10-20, Léo) =====
   · ×2, et ×3 tant qu'on ENCHAÎNE (au moins 3 gestes différents dans la chaîne : `CHA.x ≥ 3`) — lu par les trois endroits qui doublaient l'aura (`auraDragonK`).
   · À CHAQUE TRICK pendant l'effet : le fruit GICLE, jus vert et rose-rouge (le système de jus des fruits : taches à l'écran + gerbe 3D).
   · GENJUTSU dans le DÉCOR : un immense oeil (le shader du disque : anneaux écarlates, tomoe, pupille) dans le ciel, loin devant, qui apparaît en fondu ;
     les bords d'écran passent au carmin ; le compteur d'aura devient hypnotique (spirale qui tourne derrière le chiffre, classe `hyp`). */
function auraDragonK(){return pwrAurT>0?(CHA.x>=3?3:2):1;}
const DRG={t:0};
function dragonJus(){
  const n9=performance.now();if(n9-DRG.t<260)return;DRG.t=n9; // pas plus de ~4 giclées par seconde
  try{const p2=new THREE.Vector3().copy(carGroup.position);p2.y+=1.1;
    juiceScreen(0xe0157a,.8,1);juiceScreen(0x7ad040,.55,1);juiceSplash(p2,(n9&1)?0xe0157a:0x7ad040,.85);}catch(e){}
}
Object.assign(PWR_DEFS.x,{col:0xe0157a,core:0xffd6ea,tint:'#ff5a9a',c2:'#8a0c4a',fx:'rgba(220,20,90,.8)',fx2:'rgba(120,20,160,.35)',msg:'FRUIT DU DRAGON — AURA ×2 · ×3 SI TU ENCHAÎNES !',sous:'AURA x2, x3 SI TU ENCHAINES'});
{const f9=function(c){return c.replace(/,([.\d]+)\)$/,function(m,a){return ','+(+a*PWR_BORD_K).toFixed(3)+')';});};PWR_DEFS.x.bd=f9(PWR_DEFS.x.fx);PWR_DEFS.x.bd2=f9(PWR_DEFS.x.fx2);}
let DRG_DEC=null;const DRG_V=new THREE.Vector3(),DRG_EL={e:null};
function dragonDecorBuild(){
  const mat=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uSize:{value:300},uA:{value:0}},vertexShader:FDISC_VS,fragmentShader:FDISC_FS,transparent:true,depthWrite:false});
  const m=new THREE.Mesh(FDISC_GEO||(FDISC_GEO=new THREE.PlaneGeometry(1,1)),mat);m.frustumCulled=false;m.renderOrder=-3;m.visible=false;scene.add(m);DRG_DEC={m:m,a:0};
}
function dragonDecor(dt){
  const on=pwrAurT>0&&!(mode==='boom'||gameOver);
  if(!DRG_DEC){if(!on)return;dragonDecorBuild();}
  const D=DRG_DEC;D.a+=((on?.5:0)-D.a)*Math.min(1,dt*2.5);D.m.visible=D.a>.01;D.m.material.uniforms.uA.value=D.a;
  if(D.m.visible){camera.getWorldDirection(DRG_V);D.m.position.copy(camera.position).addScaledVector(DRG_V,620);D.m.position.y+=190;D.m.updateMatrixWorld(true);}
  // le compteur d'aura hypnotique
  if(!DRG_EL.e)DRG_EL.e=document.getElementById('auraV2');
  if(DRG_EL.e){const h9=pwrAurT>0;if(DRG_EL._h!==h9){DRG_EL._h=h9;DRG_EL.e.classList.toggle('hyp',h9);}}
}
{const st=document.createElement('style');st.textContent='#auraV2.hyp #avVal{animation:drgHue 1.8s linear infinite}@keyframes drgHue{0%{filter:hue-rotate(0deg) drop-shadow(0 0 6px #e0157a)}50%{filter:hue-rotate(90deg) drop-shadow(0 0 9px #7ad040)}100%{filter:hue-rotate(0deg) drop-shadow(0 0 6px #e0157a)}}';document.head.appendChild(st);}

/* ===== LE CITRON : VITESSE ×2 ÉLECTRIQUE (2026-10-20, Léo) =====
   Effet de jeu « comme avant » (8 s, l'avance ×2, voir `pwrSpdT`). Visuel : de PETITS ÉCLAIRS vifs qui zappent la carrosserie (rubans brisés toujours de face,
   calculés dans le vertex shader, repris au hasard 14 fois par seconde — un éclair qui claque, pas qui flotte) + une ONDE DE CHOC (anneau qui s'élargit
   depuis la caisse) toutes les ~0,55 s + le COMPTEUR km/h qui devient électrique (jaune-cyan, il tremble). Un seul objet partagé, créé au 1er citron. */
const ZAP_NB=9,ZAP_NS=7;
const ZAP_VS=`uniform float uT,uOn;attribute vec3 aSeg;varying float vA;varying float vK;
float h(float x){return fract(sin(x*127.1)*43758.5453);}
vec3 pt(float bolt,float stp,float t,vec3 S,vec3 d,float L,vec3 pe,vec3 pf){float seg=floor(t*7.+.5);
  float j1=(h(seg*3.3+bolt+stp*.7)-.5)*.5,j2=(h(seg*7.1+bolt*2.+stp*.9)-.5)*.5;
  return S+d*L*t+(pe*j1+pf*j2)*sin(t*3.1416)*L*.6;}
void main(){float bolt=aSeg.x,seg=aSeg.y,corner=aSeg.z;float stp=floor(uT*14.+bolt*3.7);
  float on=step(.35,h(bolt*17.1+stp*1.3))*uOn;
  vec3 S=vec3((h(bolt*3.1+stp)-.5)*1.7,.45+h(bolt*5.3+stp*2.)*.9,(h(bolt*7.7+stp*3.)-.5)*4.2);
  float ang=h(bolt*9.1+stp*1.7)*6.2832,el=(h(bolt*2.3+stp*4.)-.3)*1.2;vec3 d=normalize(vec3(cos(ang)*.9,el+.35,sin(ang)));
  float L=.9+1.8*h(bolt*4.4+stp*5.);vec3 pe=normalize(cross(d,vec3(0.,1.,.001))),pf=cross(d,pe);
  float t=seg/7.,t2=min(1.,t+.143);vec3 p=pt(bolt,stp,t,S,d,L,pe,pf),pn=pt(bolt,stp,t2,S,d,L,pe,pf);
  vec4 mv=modelViewMatrix*vec4(p,1.);vec3 dv=(modelViewMatrix*vec4(pn,1.)).xyz-mv.xyz;
  vec3 sd=normalize(cross(dv,vec3(0.,0.,1.))+vec3(1e-4));mv.xyz+=sd*corner*(.05*(1.-t*.6));
  gl_Position=projectionMatrix*mv;vA=on*(1.-t*.45);vK=h(bolt+stp*.37);}`;
const ZAP_FS=`varying float vA;varying float vK;void main(){if(vA<.01)discard;gl_FragColor=vec4(mix(vec3(.45,.92,1.),vec3(1.,1.,.82),vK),vA);}`;
const ZAP={grp:null,mat:null,ring:null,rmat:null,on:0,rt:0,age:9};
function zapBuild(){
  const nv=ZAP_NB*(ZAP_NS+1)*2,pos=new Float32Array(nv*3),sg=new Float32Array(nv*3),ix=[];let v=0;
  for(let b=0;b<ZAP_NB;b++){for(let k=0;k<=ZAP_NS;k++)for(const c of [-1,1]){sg[v*3]=b;sg[v*3+1]=k;sg[v*3+2]=c;v++;}
    const base=b*(ZAP_NS+1)*2;for(let k=0;k<ZAP_NS;k++){const a=base+k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSeg',new THREE.BufferAttribute(sg,3));g.setIndex(ix);
  ZAP.mat=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uOn:{value:0}},vertexShader:ZAP_VS,fragmentShader:ZAP_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const m=new THREE.Mesh(g,ZAP.mat);m.frustumCulled=false;m.renderOrder=22;
  ZAP.rmat=new THREE.ShaderMaterial({uniforms:{uA:{value:0}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uA;void main(){gl_FragColor=vec4(.55,.95,1.,uA);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const r=new THREE.Mesh(new THREE.RingGeometry(.9,1,64),ZAP.rmat);r.frustumCulled=false;r.renderOrder=22;r.visible=false;
  const grp=new THREE.Group();grp.add(m);ZAP.grp=grp;ZAP.ring=r;scene.add(grp);scene.add(r);
}
function zapTick(dt){
  const on=pwrSpdT>0&&!(mode==='boom'||gameOver);
  if(!ZAP.grp){if(!on)return;zapBuild();}
  ZAP.on+=((on?1:0)-ZAP.on)*Math.min(1,dt*8);ZAP.mat.uniforms.uOn.value=ZAP.on;ZAP.grp.visible=ZAP.on>.02;
  if(ZAP.grp.visible){ZAP.grp.position.copy(carGroup.position);ZAP.grp.quaternion.copy(carGroup.quaternion);}
  // l'onde de choc : un anneau qui part de la caisse, toutes les ~0,55 s, face à la caméra
  if(on){ZAP.rt+=dt;if(ZAP.rt>.55){ZAP.rt=0;ZAP.age=0;try{if(SONV2)sfx('citron.zap',{rate:.92+Math.random()*.2});}catch(e){}}else if(ZAP.rt-dt<.27&&ZAP.rt>=.27){try{if(SONV2)sfx('citron.zap',{rate:1.1+Math.random()*.25,vol:-4});}catch(e){}}} // le crépitement : un zap à chaque onde, un petit écho au milieu
  if(ZAP.age<.5){ZAP.age+=dt;const u=Math.min(1,ZAP.age/.5);ZAP.ring.visible=true;ZAP.ring.position.copy(carGroup.position);ZAP.ring.position.y+=.9;
    ZAP.ring.quaternion.copy(camera.quaternion);ZAP.ring.scale.setScalar(1.5+9*u);ZAP.rmat.uniforms.uA.value=.5*Math.pow(1-u,1.6);}
  else ZAP.ring.visible=false;
  // le compteur km/h électrique
  const e=ZAP.el||(ZAP.el=document.getElementById('speedo'));if(e&&ZAP._h!==on){ZAP._h=on;e.classList.toggle('elec',on);}
}
Object.assign(PWR_DEFS.v,{col:0x7af0ff,core:0xfffbc8,tint:'#7af0ff',c2:'#ffe83a',fx:'rgba(122,240,255,.8)',fx2:'rgba(255,232,58,.35)',msg:'⚡ CITRON — VITESSE ×2 — 8 s !'});
{const f9=function(c){return c.replace(/,([.\d]+)\)$/,function(m,a){return ','+(+a*PWR_BORD_K).toFixed(3)+')';});};PWR_DEFS.v.bd=f9(PWR_DEFS.v.fx);PWR_DEFS.v.bd2=f9(PWR_DEFS.v.fx2);}
{const st=document.createElement('style');st.textContent='#speedo.elec #speedVal,#speedo.elec #speedUnit{color:#7af0ff!important;text-shadow:0 0 6px #5ee6ff,0 0 2px #fff;animation:elecJit .1s steps(2) infinite}@keyframes elecJit{0%{transform:translate(0,0)}50%{transform:translate(1px,-1px)}100%{transform:translate(-1px,1px)}}';document.head.appendChild(st);}

/* ===== LE RAISIN ANGÉLIQUE : AIRTIME ×2, DOUBLE JAUGE (2026-10-20, Léo) =====
   Armé (14 s, il s'use au quart au sol : `pwrAirK`) le raisin ne rend plus l'airtime INFINI : il DOUBLE la jauge. Jauge 1 = l'airtime normal (6 s, 10,2 en orbite) ;
   quand elle est vide, la voiture PERD SES AILES D'ANGE (elles explosent en plumes, la caisse reste en vie) et la jauge 2 démarre, de même durée ; vide à son tour : explosion
   comme d'habitude. `RAI.stage` : 0 = jauge 1, 1 = jauge 2 (remis à 0 à chaque décollage, startFall). L'airtime PRÊTÉ par l'auto-école (`TUTO.pa`) reste infini.
   Les ailes blanches (sans halo : verdict de Léo) sont posées sur la caisse tant que le raisin est armé et que les ailes ne sont pas perdues.
   HUD : la barre du chrono de vol (#airHud) a une 2e barre, plus fine, dessous : la jauge 2. */
const RAI={stage:0,wings:null,vis:false};
function airDepasse(){ // la jauge est-elle vide ? (remplace `fallTR>airMax()&&pwrAirT<=0`)
  if(fallTR<=airMax())return false;
  if(pwrAirT>0){
    if(TUTO.pa)return false;                       // l'auto-école : airtime infini
    if(RAI.stage===0){RAI.stage=1;fallTR=0;airFlash=.6;raisinAilesBoom();return false;} // la 1re jauge est vide : les ailes explosent, la 2e démarre
  }
  return true;
}
const RAI_PLUME=function(K,sg,bx,by,bz,ang,L,W,cur,k1,k2,kT){
  const dx=sg*Math.cos(ang),dy=Math.sin(ang),px=-dy,py=dx*sg*sg,NS=7,pts=[],CUP=.42,FOLD=.5;
  for(let i=0;i<=NS;i++){const u=i/NS,l=L*u,cx=bx+dx*l+px*cur*l*u,cy=by+dy*l+py*cur*l*u,cz=bz+CUP*l*l*.5,hw=W*Math.pow(Math.sin(Math.PI*Math.pow(u,.72)),.62)+.004;
    pts.push({m:[cx,cy,cz+FOLD*hw*.6],l:[cx-px*hw,cy-py*hw,cz-FOLD*hw*.4],r:[cx+px*hw,cy+py*hw,cz-FOLD*hw*.4]});}
  for(let i=0;i<NS;i++){const A=pts[i],B=pts[i+1],kk=(i>=NS-2&&kT)?kT:null;
    K.tri(kk||k1,A.m,A.l,B.l);K.tri(kk||k1,A.m,B.l,B.m);K.tri(kk||k2,A.m,B.m,B.r);K.tri(kk||k2,A.m,B.r,A.r);}
};
function raisinAiles(){ // la paire d'ailes (une géométrie, trois rangs de plumes par aile), posée au-dessus des épaules de la caisse
  if(RAI.wings)return RAI.wings;
  const K=lpKit(FRUIT_PAL);
  for(const sg of [1,-1]){const bx=sg*.30,by=.36;
    for(let i=0;i<6;i++)RAI_PLUME(K,sg,bx,by,.02,.45+i*.2,.26+.03*Math.sin(i*1.3),.10,.10,'wgW','wgw',null);
    for(let i=0;i<6;i++)RAI_PLUME(K,sg,bx,by+.02,-.02,.35+i*.21,.42+.07*Math.sin(i*.9+.4),.11,.14,'wgW','wgw',null);
    for(let i=0;i<6;i++)RAI_PLUME(K,sg,bx,by+.04,-.06,.25+i*.22,.62+.12*Math.sin(i*.8+.3),.12,.16,'wgW','wgw','wgG');}
  const geo=K.done().f;if(!FRUIT_MAT){FRUIT_MAT=lpMat('f');FRUIT_MAT.userData.lp=0;}
  const m=new THREE.Mesh(geo,FRUIT_MAT);m.scale.setScalar(2.4);m.frustumCulled=false;
  const g=new THREE.Group();g.add(m);m.position.set(0,.55,-.2);g.visible=false;scene.add(g);RAI.wings=g;return g;
}
function raisinAilesBoom(){ // les ailes explosent en plumes : un flash blanc, une secousse, une gerbe qui part des épaules
  try{shake=Math.max(shake,.9);flashEcran('rgba(255,255,255,.75)');hap([20,40,30]);
    const p=crV1.copy(carGroup.position);p.y+=1.6;sparkBurst(sparkGold,p,26,13);sparkBurst(sparkBlue,p,16,9);
    if(SONV2)sfx('pwr.bouclierCasse');}catch(e){}
  RAI.vis=false;if(RAI.wings)RAI.wings.visible=false;
}
function raisinTick(dt){
  const arme=pwrAirT>0&&!TUTO.pa&&!(mode==='boom'||gameOver),vis=arme&&RAI.stage===0;
  if(vis||RAI.wings){const g=raisinAiles();if(g.visible!==vis)g.visible=vis;
    if(vis){g.position.copy(carGroup.position);g.quaternion.copy(carGroup.quaternion);const w=Math.sin(FAURAU.t*9)*.06;g.children[0].rotation.z=w*0+0;g.children[0].position.y=.55+Math.sin(FAURAU.t*5)*.05;}}
}
function raisinHud(double,fr2){ // la 2e barre sous le chrono de vol
  const el=raisinHud.el||(raisinHud.el=document.getElementById('airHud'));if(!el)return;
  if(!raisinHud.b){const bar=el.querySelector('.ahBar');if(!bar)return;const b2=bar.cloneNode(true);b2.classList.add('ahBar2');bar.after(b2);raisinHud.b=b2;
    const st=document.createElement('style');st.textContent='#airHud .ahBar2{display:none;height:9px;margin-top:3px;padding:2px}#airHud[data-d="1"] .ahBar2{display:block}#airHud .ahBar2 .ahF{width:calc(var(--a2,1)*100%);background:linear-gradient(90deg,#ff9ec2,#ffffff)}#airHud .ahBar2 .ahF::after{display:none}';document.head.appendChild(st);}
  const d=double?'1':'0';if(el.dataset.d!==d)el.dataset.d=d;
  if(double){const q=fr2.toFixed(2);if(raisinHud._q!==q){raisinHud._q=q;el.style.setProperty('--a2',q);}}
}
Object.assign(PWR_DEFS.a,{col:0xffffff,core:0xfff4e8,tint:'#ffd6f0',c2:'#d070d0',fx:'rgba(255,214,240,.8)',fx2:'rgba(208,112,208,.3)',msg:'🍇 RAISIN — AIRTIME ×2 : DEUX JAUGES !',sous:'AIRTIME x2, 2 JAUGES'});
{const f9=function(c){return c.replace(/,([.\d]+)\)$/,function(m,a){return ','+(+a*PWR_BORD_K).toFixed(3)+')';});};PWR_DEFS.a.bd=f9(PWR_DEFS.a.fx);PWR_DEFS.a.bd2=f9(PWR_DEFS.a.fx2);}
/* banc (dev) : `dbgRaisin()` l'état de la double jauge ; `dbgRaisin('vide')` vide la jauge en cours (pour voir les ailes exploser / la 2e jauge démarrer). */
window.dbgRaisin=function(k){if(k==='vide')fallTR=airMax()+.05;return {stage:RAI.stage,fallTR:+fallTR.toFixed(2),airMax:airMax(),pwrAirT:+pwrAirT.toFixed(2),mode:mode,ailes:!!(RAI.wings&&RAI.wings.visible)};};

/* ===== LA CHAUFFE DES SHADERS DES FRUITS (0 programme compilé en course) =====
   Quelques secondes après le chargement, au menu : un exemplaire de chaque fruit-pouvoir (et son aura), l'objet des éclairs, l'anneau de l'onde de choc et le disque du
   décor Genjutsu sont posés une fois dans la scène, compilés hors écran, puis retirés — le 1er citron de la partie ne fait pas saccader l'image. */
function fruitsChauffe(){
  if(fruitsChauffe.ok||(started&&!gameOver))return;fruitsChauffe.ok=true;
  try{const g=new THREE.Group();for(const k of ['n','v','x','a','m']){const m=mkPower(k,1);g.add(m);}
    if(!ZAP.grp)zapBuild();if(!DRG_DEC)dragonDecorBuild();
    scene.add(g);ZAP.ring.visible=true;ZAP.grp.visible=true;DRG_DEC.m.visible=true;raisinAiles().visible=true;
    renderer.compile(scene,camera);
    ZAP.ring.visible=false;ZAP.grp.visible=false;DRG_DEC.m.visible=false;raisinAiles().visible=false;scene.remove(g);}catch(e){}
}
setTimeout(fruitsChauffe,9000);
window.dbgChauffeFruits=function(){fruitsChauffe.ok=false;const n0=renderer.info.programs?renderer.info.programs.length:0;fruitsChauffe();return {avant:n0,apres:renderer.info.programs?renderer.info.programs.length:0};};
