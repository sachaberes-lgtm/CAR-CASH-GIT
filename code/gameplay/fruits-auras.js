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
const FDISC_FS=`uniform float uT;varying vec2 vUv;
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
  gl_FragColor=vec4(col,a*disc);}`;
/* fauraFruit(kind, geo) : le groupe d'aura d'un fruit-pouvoir (kind = 0 piment · 1 citron · 2 dragon · 4 pomme dorée ; 3 raisin = rien) — à ajouter COMME ENFANT du mesh du fruit */
function fauraFruit(kind,geo){
  const g=new THREE.Group();if(kind===3)return g;
  const nS=kind===0?3:2;
  for(let i=0;i<nS;i++){
    const m=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uKind:{value:kind},uS:{value:i}},vertexShader:FSH2_VS,fragmentShader:FSH2_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const ms=new THREE.Mesh(geo,m);ms.renderOrder=20+i;g.add(ms);}
  if(kind===2){
    const dm=new THREE.ShaderMaterial({uniforms:{uT:FAURAU.uT,uSize:{value:7.5}},vertexShader:FDISC_VS,fragmentShader:FDISC_FS,transparent:true,depthWrite:false});
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
