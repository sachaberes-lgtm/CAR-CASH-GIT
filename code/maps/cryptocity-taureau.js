// LE TAUREAU : verre d'or — une baie tous les 3,4 m, un étage tous les 4,6 m (dans le monde), le ciel et le soleil dans les vitres
// (2026-10-18, LE TAUREAU v2) les vitres ne sont plus que sur les TOURS sous les sabots (`aVit` = 1), allumées la nuit ; le CORPS est une statue d'OR POLI
// à facettes : chaque facette renvoie SON morceau de ciel, l'éclat du soleil court de l'une à l'autre (la grille de baies, vue de 300 m, ne faisait qu'un grain orange)
const TAUREAU_VERRE=
  '{vec3 N9=normalize(vN9);float vert=1.-smoothstep(.55,.85,abs(N9.y));vec3 V9=normalize(vW9-cameraPosition);'+
  'vec3 Th=normalize(vec3(-N9.z,0.,N9.x)+vec3(1e-4,0.,0.));vec2 uv=vec2(dot(vW9,Th)/3.4,vW9.y/4.6),fw=max(fwidth(uv),vec2(1e-4));'+
  'vec2 f=fract(uv),dd=(vec2(.40,.35)-abs(f-.5))/fw;float far=smoothstep(.3,.75,max(fw.x,fw.y)),pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),.56,far)*vert*vV9;'+
  'vec3 R9=reflect(V9,N9);float ry=R9.y;vec3 sky=ry>0.?mix(mix(uHor9,uMid9,smoothstep(0.,.16,ry)),uZen9,smoothstep(.12,.92,ry)):mix(uHor9*.7,vec3(.12,.1,.07),smoothstep(0.,-.28,ry));'+
  'float sd=max(dot(R9,uSun9),0.),gl=pow(sd,240.)*6.+pow(sd,16.)*.35,fr=clamp(.22+.78*pow(1.-abs(dot(V9,N9)),3.),0.,1.),ph=fract(sin(dot(floor(uv),vec2(12.9898,78.233)))*43758.5453);'+
  'vec3 rf=vec3(dot(sky,vec3(.3,.59,.11)));'+ // le miroir d'or : la LUMIÈRE du ciel, teintée d'or
  'vec3 glass=mix(vec3(.16,.09,.02)*(.7+.6*ph),rf*vec3(1.,.82,.42)*1.1,fr*(.85+.3*ph*(1.-far)))+gl*vec3(1.,.92,.7)+vec3(1.,.84,.5)*.4*step(.95,ph)*(1.-far)+uNuit9*vec3(1.,.8,.5)*step(.45,ph)*(.35+.4*ph)*(1.-.5*far);'+ // la nuit, les bureaux des tours restent allumés
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,glass,pane*.86);'+
  // L'OR POLI du corps : un MÉTAL — presque plus de diffus, le ciel teinté d'or (au carré : l'horizon clair et le zénith sombre se séparent, chaque
  // facette tranche sur sa voisine), plus fort de biais (Fresnel), l'éclat franc du soleil ; la nuit, des projecteurs l'éclairent d'en bas
  'float st=1.-vV9,L9=rf.x;vec3 orP=vec3(1.,.78,.36)*(.10+1.35*L9*L9)*(.75+.55*fr)+gl*vec3(1.,.9,.66)*1.8+uNuit9*vec3(.5,.32,.1)*(.35+.65*clamp(.5-.5*N9.y,0.,1.));'+
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,orP,st*.85);'+
  // LE BANDEAU DU TAUREAU : un ruban de cours vert tout autour du ventre (à hauteur de route : on le lit en passant)
  'float yy=vW9.y-uBand9;if(abs(yy)<4.2&&vert>.5){float ps=1.15,gx=(dot(vW9,Th)-uT9*14.)/ps,gy=floor((yy+4.)/ps),ch=floor(gx/6.),cx=floor(mod(gx,6.));'+
  ' float on=mod(ch,4.)<.5?step(0.,gy-1.)*step(gy-1.,4.)*step(abs(cx-2.),2.-(gy-1.)*.5+.01):step(cx,4.)*step(1.,gy)*step(gy,5.)*step(.4,fract(sin(dot(vec3(cx,gy,ch),vec3(12.9898,78.233,37.719)))*43758.5453));'+
  ' float lo=smoothstep(.4,1.2,fwidth(gx));on=mix(on,.35,lo);gl_FragColor.rgb=vec3(.01,.03,.015)+vec3(.15,1.7,.55)*on;}'+
  '}\n';
function cryptoMatTaureau(){
  if(CRYPTO.mat.taureau)return CRYPTO.mat.taureau;
  const m=new THREE.MeshPhongMaterial({color:0xe0b44a,specular:0xffffff,shininess:110,emissive:0x0a0702});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CRYPTO.uT,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,uSun9:CRYPTO.uSun,uBand9:m.userData.uBand,uNuit9:CRYPTO.uNuit});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aVit;varying vec3 vW9,vN9;varying float vV9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvW9=(modelMatrix*vec4(transformed,1.)).xyz;vN9=normalize(mat3(modelMatrix)*objectNormal);vV9=aVit;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uBand9,uNuit9;uniform vec3 uZen9,uMid9,uHor9,uSun9;varying vec3 vW9,vN9;varying float vV9;')
      .replace('#include <fog_fragment>',TAUREAU_VERRE+'#include <fog_fragment>');};
  m.userData.uBand={value:-1e5}; // la hauteur du ruban (celle du taureau le plus proche : cryptoTick)
  m.customProgramCacheKey=function(){return 'taureauCrypto2';};m.dispose=function(){};
  CRYPTO.mat.taureau=m;return m;
}
function cryptoMats(){ // les petites matières, une fois
  const M=CRYPTO.mat;if(M.corne)return M;
  M.corne=new THREE.MeshPhongMaterial({color:0xfff4dc,specular:0xffffff,shininess:90,emissive:0x3a3326});
  M.oeil=new THREE.MeshBasicMaterial({color:new THREE.Color(4,.35,.25)});
  M.laser=new THREE.MeshBasicMaterial({color:new THREE.Color(3.2,.18,.12),transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending});
  M.laserC=new THREE.MeshBasicMaterial({color:new THREE.Color(4,2.2,1.8),transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
  M.anneau=new THREE.MeshPhongMaterial({color:0xffcf4a,specular:0xffffff,shininess:120,emissive:0x5a3a00});
  M.ballon=new THREE.MeshPhongMaterial({color:0xf3f5f9,specular:0xffffff,shininess:60,emissive:0x1a1a20});
  M.or=new THREE.MeshPhongMaterial({color:0xffc63a,specular:0xfff3c0,shininess:100,emissive:0x4a3000});
  M.diam=new THREE.MeshPhongMaterial({color:0x8fefff,specular:0xffffff,shininess:140,emissive:0x1c4a7a,flatShading:true});
  M.fusee=new THREE.MeshPhongMaterial({color:0xf6f6f8,specular:0xffffff,shininess:70,emissive:0x141418});
  M.fuseeR=new THREE.MeshPhongMaterial({color:0xff3a3a,specular:0xffd0d0,shininess:60,emissive:0x300404});
  M.flamme=new THREE.SpriteMaterial({map:lampTex,color:new THREE.Color(3,1.5,.5),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const k in M)if(M[k]&&M[k].isMaterial)M[k].dispose=function(){};
  return M;
}
/* ---- LES FORMES ---- */
// un triangle tourné vers l'EXTÉRIEUR (ref = un point à l'intérieur du volume) : toutes nos formes sont des volumes convexes par tranche
function crTri(P,a,b,c,ref){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  const gx=(a[0]+b[0]+c[0])/3-ref[0],gy=(a[1]+b[1]+c[1])/3-ref[1],gz=(a[2]+b[2]+c[2])/3-ref[2];
  if(nx*gx+ny*gy+nz*gz<0)P.push(a[0],a[1],a[2],c[0],c[1],c[2],b[0],b[1],b[2]);else P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);}
/* LE TAUREAU v2 (2026-10-18, Sacha : « dans la map crypto city retravaille le design du toreau géant et vérifie bien que la hit box dans la
   map fonctionne ») — UNE SEULE DESCRIPTION pour ce qu'on VOIT et ce qui est DUR : `taureauForme` rend une liste de VOLUMES (des anneaux
   le long d'un axe : le corps, la tête, les pattes, les tours ; ou le long d'une courbe : cornes, oreilles, queue) ; `crVolume` en tire les
   triangles, `crDans` dit si un point est dedans. Retoucher la forme déplace la collision avec elle. (Avant : neuf boîtes posées à la main —
   un trou de 35 m dans l'encolure, des cornes sans collision, et autour des pattes et du corps des murs FANTÔMES : 74 % du volume visible
   en plus, du vide où l'on mourait.)
   Un ANNEAU : un centre c, une demi-largeur w (le long de u), deux demi-hauteurs hT/hB (le long de +v / −v), son axe f (perpendiculaire
   à son plan). Une SECTION : n sommets d'une super-ellipse normalisée (e = 2 ovale, 3 muscle carré), la même pour tout le volume. */
function crAnneau(x,y,z,w,hT,hB,p){const sp=Math.sin(p||0),cp=Math.cos(p||0); // p = le tangage de l'axe : 0 = vers la tête (+z), π/2 = vers le bas
  return {c:[x,y,z],w:w,hT:hT,hB:hB,f:[0,-sp,cp],u:[1,0,0],v:[0,cp,sp]};}
function crSection(n,e,rot){const S=[];for(let j=0;j<n;j++){const t=(rot||0)+j/n*6.2832,c=Math.cos(t),s=Math.sin(t);
  S.push([Math.sign(c)*Math.pow(Math.abs(c),2/e),Math.sign(s)*Math.pow(Math.abs(s),2/e)]);}return S;}
function crPoint(A,s){const h=s[1]>0?A.hT:A.hB,a=s[0]*A.w,b=s[1]*h;return [A.c[0]+a*A.u[0]+b*A.v[0],A.c[1]+a*A.u[1]+b*A.v[1],A.c[2]+a*A.u[2]+b*A.v[2]];}
// un volume d'anneaux : sa boîte englobante (la collision ne regarde dedans que si la caisse y est)
function crVol(A,S,cl){const bb=[1e9,1e9,1e9,-1e9,-1e9,-1e9];
  for(const a of A)for(const s of S){const q=crPoint(a,s);for(let k=0;k<3;k++){bb[k]=Math.min(bb[k],q[k]);bb[k+3]=Math.max(bb[k+3],q[k]);}}
  return {A:A,S:S,cl:cl,bb:bb};}
// un TUBE effilé le long d'une courbe : des anneaux ronds posés sur la courbe, du rayon r0 au rayon r1 (kn : la courbe de l'effilé)
function crTubeV(pts9,r0,r1,n,cl,kn){const cu=new THREE.CatmullRomCurve3(pts9.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);})),tg=new THREE.Vector3(),A=[];
  for(let i=0;i<=n;i++){const u=i/n,p=cu.getPointAt(u);cu.getTangentAt(u,tg);const r=r0+(r1-r0)*Math.pow(u,kn||.8);
    let ux=tg.z,uz=-tg.x;const l=Math.hypot(ux,uz);if(l<1e-4){ux=1;uz=0;}else{ux/=l;uz/=l;} // u : l'horizontale perpendiculaire à la courbe
    A.push({c:[p.x,p.y,p.z],w:r,hT:r,hB:r,f:[tg.x,tg.y,tg.z],u:[ux,0,uz],v:[tg.y*uz,tg.z*ux-tg.x*uz,-tg.y*ux]});} // v = f×u
  return crVol(A,crSection(6,2,0),cl);}
function crVolume(P,V,o,vit){ // les triangles d'un volume, faces dehors, fermé aux deux bouts ; V reçoit le drapeau « vitres » de chaque sommet
  const S=o.S,n=S.length,R=o.A.map(function(A){return S.map(function(s){return crPoint(A,s);});}),n0=P.length;
  for(let k=0;k<R.length-1;k++){const a=o.A[k].c,b=o.A[k+1].c,ref=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
    for(let j=0;j<n;j++){const j2=(j+1)%n;crTri(P,R[k][j],R[k+1][j],R[k+1][j2],ref);crTri(P,R[k][j],R[k+1][j2],R[k][j2],ref);}}
  for(const e of [0,R.length-1]){const c=o.A[e].c,d=e?-3:3,f=o.A[e].f,ref=[c[0]+f[0]*d,c[1]+f[1]*d,c[2]+f[2]*d];
    for(let j=0;j<n;j++)crTri(P,c,R[e][j],R[e][(j+1)%n],ref);}
  if(V)for(let i=n0;i<P.length;i+=3)V.push(vit);}
/* DEDANS ? — le point (x,y,z) dans le volume o, avec une marge m. Entre deux anneaux, le point se place par ses distances aux deux plans
   (t), l'anneau est interpolé là, et le point est comparé à la section (un polygone convexe, symétrique) : exactement la surface dessinée. */
function crDans(o,x,y,z,m){const b=o.bb;
  if(x<b[0]-m||x>b[3]+m||y<b[1]-m||y>b[4]+m||z<b[2]-m||z>b[5]+m)return false;
  const A=o.A,S=o.S,n=S.length,last=A.length-2;
  for(let k=0;k<=last;k++){const a=A[k],c=A[k+1];
    const sa=(x-a.c[0])*a.f[0]+(y-a.c[1])*a.f[1]+(z-a.c[2])*a.f[2],sb=(x-c.c[0])*c.f[0]+(y-c.c[1])*c.f[1]+(z-c.c[2])*c.f[2];
    if(sa<(k?0:-m)||sb>(k<last?0:m))continue;
    const dn=sa-sb,t=dn>1e-6?Math.min(1,Math.max(0,sa/dn)):0,t1=1-t;
    const qx=x-(a.c[0]*t1+c.c[0]*t),qy=y-(a.c[1]*t1+c.c[1]*t),qz=z-(a.c[2]*t1+c.c[2]*t);
    const ua=Math.abs(qx*(a.u[0]*t1+c.u[0]*t)+qy*(a.u[1]*t1+c.u[1]*t)+qz*(a.u[2]*t1+c.u[2]*t)),vb=qx*(a.v[0]*t1+c.v[0]*t)+qy*(a.v[1]*t1+c.v[1]*t)+qz*(a.v[2]*t1+c.v[2]*t);
    const X=ua/(a.w*t1+c.w*t+m),Y=vb/((vb>0?a.hT*t1+c.hT*t:a.hB*t1+c.hB*t)+m);
    let ok=true;for(let j=0;j<n&&ok;j++){const p=S[j],q=S[(j+1)%n];if((q[0]-p[0])*(Y-p[1])-(q[1]-p[1])*(X-p[0])<0)ok=false;}
    if(ok)return true;}
  return false;}
// des anneaux le long d'une patte qui descend, coupés à la hauteur du pied (une route passe parfois juste dessous : la patte s'arrête au-dessus)
function crCoupe(R,pl){const o=[];for(let i=0;i<R.length;i++){const r=R[i];if(r.c[1]>pl+1){o.push(r);continue;}
    if(i){const a=R[i-1],t=(a.c[1]-pl)/(a.c[1]-r.c[1]),L=function(k){return a[k]+(r[k]-a[k])*t;};
      o.push({c:[a.c[0]+(r.c[0]-a.c[0])*t,pl,a.c[2]+(r.c[2]-a.c[2])*t],w:L('w'),hT:L('hT'),hB:L('hB'),f:r.f,u:r.u,v:r.v});}
    break;}
  return o.length>1?o:null;}
// coupé au pied, le bout d'une patte ou d'une tour s'effile (×k sur les 14 derniers mètres du repère) : une pointe suspendue, pas une coupe franche
function crPointe(R,pl,k){const L=R[R.length-1],P=R[R.length-2];if(L.c[1]!==pl||P.c[1]-pl<24)return R;
  const t=14/(P.c[1]-pl),M={c:[L.c[0]+(P.c[0]-L.c[0])*t,pl+14,L.c[2]+(P.c[2]-L.c[2])*t],w:L.w,hT:L.hT,hB:L.hB,f:L.f,u:L.u,v:L.v};
  return R.slice(0,-1).concat([M,{c:L.c,w:L.w*k,hT:L.hT*k,hB:L.hB*k,f:L.f,u:L.u,v:L.v}]);}
/* LE TAUREAU QUI CHARGE (celui de Wall Street, en gratte-ciel d'or) — repère local : +z = la tête, +y = le haut, le dessous du poitrail à y ≈ 0.
   La silhouette : une croupe ronde, des hanches larges, la taille qui se creuse, un poitrail profond sous la BOSSE du garrot (le plus haut),
   l'encolure épaisse, et la TÊTE BASSE (son axe plonge à 63°) : le front fait face à la caisse, le mufle est en bas. Les cornes sortent de
   côté puis viennent en AVANT (c'est elles qui disent « taureau » de loin), les oreilles dessous ; la queue en fouet. Les pattes sont des
   pattes jusqu'au sabot (l'avant lancée, le jarret de l'arrière qui pousse), puis des TOURS à gradins Art déco qui plongent dans la brume. */
function taureauForme(pl){
  const F=[],S16=crSection(16,2.6,0),S12=crSection(12,2.4,0),S8=crSection(8,2,Math.PI/8),PI2=Math.PI/2;
  const Y=function(y,z){return y-.13*z;}; // LA CHARGE : tout le taureau penche de 7° vers l'avant (la croupe haute, le mufle bas)
  // LE CORPS, de la croupe à l'encolure : [z, le dos, le dessous, demi-largeur] — le centre de l'anneau aux 44 % (la masse en bas : le poitrail)
  F.push(crVol([[-208,186,124,28],[-196,204,92,62],[-170,228,50,92],[-130,234,30,100],[-86,224,38,86],[-38,232,22,92],[12,254,8,104],
    [60,288,-6,116],[102,308,-10,118],[138,294,4,106],[166,262,28,90],[196,226,54,72]]
    .map(function(r){const c=r[2]+.44*(r[1]-r[2]);return crAnneau(0,Y(c,r[0]),r[0],r[3],r[1]-c,c-r[2],0);}),S16,0));
  // LA TÊTE, basse : de la nuque (entre les cornes) au mufle, le long d'un axe qui plonge — [t, demi-largeur, côté front, côté gorge]
  const z0=192,y0=Y(152,192),z1=236,y1=Y(-2,236),p=Math.atan2(y0-y1,z1-z0),T9=function(t){return [y0+(y1-y0)*t,z0+(z1-z0)*t];};
  F.push(crVol([[0,70,44,62],[.1,82,58,68],[.26,86,64,66],[.45,70,58,56],[.62,58,50,46],[.8,62,48,44],[.92,62,44,38],[1,50,30,26]]
    .map(function(r){const q=T9(r[0]);return crAnneau(0,q[0],q[1],r[1],r[2],r[3],p);}),crSection(16,3,0),0));
  {const q=T9(.26),sp=Math.sin(p),cp=Math.cos(p);F.yeux=[-1,1].map(function(s){return [s*72,q[0]+24*cp,q[1]+24*sp];}); // les yeux : sur les côtés du front
   const n=T9(.97);F.nez=[0,n[0]-14*cp,n[1]-14*sp+6];} // l'anneau : sous les naseaux
  for(const s of [-1,1]){
    // LES PATTES jusqu'au sabot, courtes et épaisses : [x, y, z, demi-largeur, devant, derrière, tangage] — l'avant lancée, le genou plié ;
    // l'arrière qui POUSSE (le jarret en arrière, le canon qui revient)
    const av=[[54,Y(118,100),100,50,62,62,1.2],[55,Y(40,128),128,46,52,56,1.2],[56,-14,150,37,41,43,1.25],[57,-34,158,38,41,41,1.5],[57,-66,162,30,32,34,1.62],[57,-84,160,29,31,31,1.62],[57,-96,159,31,33,33,1.57]],
      ar=[[56,Y(132,-128),-128,56,72,72,1.95],[57,Y(56,-160),-160,50,58,62,1.95],[58,4,-186,37,40,46,1.9],[58,-22,-194,35,37,44,1.6],[59,-60,-184,29,31,31,1.33],[59,-84,-178,28,29,29,1.45],[59,-96,-176,30,31,31,1.57]];
    for(const P9 of [av,ar]){const R=crCoupe(P9.map(function(r){return crAnneau(s*r[0],r[1],r[2],r[3],r[4],r[5],r[6]);}),pl);if(R)F.push(crVol(crPointe(R,pl,.55),S12,0));
      // …le sabot pose sur LE TOIT D'UNE TOUR : la corniche, puis le fût à vitres (cl 1) qui s'élargit par gradins jusqu'au pied, dans la brume
      const h=P9[P9.length-1],T=[[-92,30],[-96,46],[-104,46],[-105,40],[-180,40],[-181,46],[-290,46],[-291,52],[-1e4,56]],x=s*h[0],z=h[2];
      const RT=crCoupe(T.map(function(r){return crAnneau(x,r[0],z,r[1],r[1],r[1],PI2);}),pl);if(RT)F.push(crVol(crPointe(RT,pl,.4),S8,1));}
    // LA CORNE : grosse à la base, sur les coins du front, de côté puis en AVANT, la pointe qui remonte vers le centre (ivoire, cl 2)
    F.push(crTubeV([[64,146,208],[108,154,210],[148,170,226],[166,194,254],[160,220,286],[136,234,312]].map(function(q){return [s*q[0],Y(q[1],q[2]),q[2]];}),30,4,16,2,.85));
    // L'OREILLE, sous la corne
    F.push(crTubeV([[66,132,200],[100,120,194],[116,108,190]].map(function(q){return [s*q[0],Y(q[1],q[2]),q[2]];}),13,3,6,0,.7));}
  // LA QUEUE en fouet (un grand S qui monte) et sa touffe
  F.push(crTubeV([[0,186,-200],[0,210,-226],[6,242,-238],[16,272,-228],[24,290,-204],[28,296,-178]].map(function(q){return [q[0],Y(q[1],q[2]),q[2]];}),11,5,14,0,1));
  F.push(crTubeV([[27,296,-184],[31,301,-164],[33,301,-148]].map(function(q){return [q[0],Y(q[1],q[2]),q[2]];}),15,2,6,0,1.6));
  return F;}
function taureauDur(F,x,y,z,m){for(let i=0;i<F.length;i++)if(crDans(F[i],x,y,z,m))return true;return false;}
function taureauLibre(F,x,y,z,cap,proches){ // (cryptoPlace) aucun point de la route — au bitume et 6 m au-dessus — à moins de 30 m de la forme posée en (x,y,z), tournée de cap
  const K=TAUREAU_K,co=Math.cos(cap),si=Math.sin(cap),m=30/K;let ok=true;
  proches(x,z,560,function(i){if(!ok)return;const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz>560*560)return;const lx=(dx*co-dz*si)/K,lz=(dx*si+dz*co)/K;
    if(taureauDur(F,lx,(p.y-y)/K,lz,m)||taureauDur(F,lx,(p.y+6-y)/K,lz,m))ok=false;});
  return ok;}
function crGeo(P,V){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));if(V)g.setAttribute('aVit',new THREE.Float32BufferAttribute(V,1));
  g.computeVertexNormals();g.computeBoundingSphere();return g;}
function cryptoTaureauGeo(F){ // l'or (le corps, cl 0 ; les tours à vitres, cl 1) et l'ivoire (les cornes, cl 2)
  const P=[],V=[],Pc=[];for(const o of F){if(o.cl===2)crVolume(Pc,null,o,0);else crVolume(P,V,o,o.cl);}
  return {corps:crGeo(P,V),cornes:crGeo(Pc)};}
const TAUREAU_K=1.35; // l'échelle du taureau : la bosse ~320 m au-dessus de la route, les cornes pointées vers elle
function cryptoTaureau(root,t){
  const M=cryptoMats(),F=t.F||taureauForme((t.pied-t.y)/TAUREAU_K),G=cryptoTaureauGeo(F),g=new THREE.Group(); // F : la forme déjà posée par cryptoPlace
  g.position.set(t.x,t.y,t.z);g.rotation.y=t.cap;g.scale.setScalar(TAUREAU_K);
  const c=new THREE.Mesh(G.corps,cryptoMatTaureau()),k=new THREE.Mesh(G.cornes,M.corne);g.add(c);g.add(k);CRYPTO.jeter.push(c,k);
  const an=new THREE.Mesh(CRYPTO_G.tore,M.anneau);an.position.fromArray(F.nez);an.scale.setScalar(14);g.add(an); // l'anneau dans le mufle
  const yeux=[],lasers=[];
  for(const e of F.yeux){const o=new THREE.Mesh(CRYPTO_G.oeil,M.oeil);o.position.fromArray(e);o.scale.setScalar(8);g.add(o);yeux.push(o);
    const L9=new THREE.Group();L9.position.copy(o.position);g.add(L9);
    const b=new THREE.Mesh(CRYPTO_G.laser,M.laser);b.scale.set(5,1700,5);L9.add(b);const b2=new THREE.Mesh(CRYPTO_G.laser,M.laserC);b2.scale.set(1.3,1700,1.3);L9.add(b2);
    b.frustumCulled=b2.frustumCulled=false;lasers.push(L9);}
  root.add(g);g.updateMatrixWorld(true);
  return {k:TAUREAU_K,g:g,x:t.x,y:t.y,z:t.z,co:Math.cos(t.cap),si:Math.sin(t.cap),F:F,pl:(t.pied-t.y)/TAUREAU_K,lasers:lasers,ph:t.ph,s:t.s};
}
function cryptoHeurt(p){ // la caisse est-elle DANS un taureau ? (comme villeHeurt : en vol) — la forme dessinée elle-même, marge 0,7 m (la demi-caisse)
  for(const b of CRYPTO.taureaux){const dx=p.x-b.x,dz=p.z-b.z;if(dx*dx+dz*dz>480*480)continue; // le bout des cornes est à ~460 m du centre
    const lx=(dx*b.co-dz*b.si)/b.k,lz=(dx*b.si+dz*b.co)/b.k,ly=(p.y-b.y)/b.k; // rotation.y = cap (et l'échelle) : le local se lit par la transformation inverse
    if(taureauDur(b.F,lx,ly,lz,.7/b.k))return true;}
  return false;
}
/* ---- LES GÉOMÉTRIES PARTAGÉES (une fois) ---- */
const CRYPTO_G={};
function cryptoGeos(){
  if(CRYPTO_G.cube)return CRYPTO_G;
  CRYPTO_G.cube=new THREE.BoxGeometry(1,1,1);
  CRYPTO_G.tore=new THREE.TorusGeometry(1,.17,6,14);
  CRYPTO_G.oeil=new THREE.OctahedronGeometry(1,1);
  {const g=new THREE.CylinderGeometry(1,1,1,6,1,true);g.translate(0,.5,0);g.rotateX(Math.PI/2);CRYPTO_G.laser=g;} // le long de +z, depuis l'œil
  {const g=plaGeoPiece(40,.16);g.rotateX(Math.PI/2);CRYPTO_G.piece=g;} // la pièce ₿ géante : celle de la pluie, plus ronde, DEBOUT (ses faces regardent ±z ; elle tourne sur la verticale)
  {const g=new THREE.OctahedronGeometry(1,0);g.scale(1,1.45,1);CRYPTO_G.diam=g;}
  {const g=new THREE.SphereGeometry(1,24,14);g.scale(16,16,60);CRYPTO_G.ballon=g;}
  CRYPTO_G.plan=new THREE.PlaneGeometry(1,1);
  {const g=new THREE.CylinderGeometry(1,1,1,12);CRYPTO_G.cyl=g;const c=new THREE.ConeGeometry(1,1,12);CRYPTO_G.cone=c;}
  for(const k in CRYPTO_G)CRYPTO_G[k].dispose=function(){};
  return CRYPTO_G;
}
// LE BANDEAU DU COURS (dirigeables) : une bande LED qui défile — la police du jeu, les ▲ dessinés
function cryptoTickerTex(){
  if(CRYPTO.mat.tick)return CRYPTO.mat.tick;
  const W=2048,H=96,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#020604';x.fillRect(0,0,W,H);x.fillStyle='rgba(61,255,154,.08)';for(let i=0;i<W;i+=4)x.fillRect(i,0,1,H);
  const L9=[['BTC','$1 000 000','+420 %'],['ETH','$69 000','+69 %'],['CASH','$161 000','+161 %'],['DOGE','$4,20','+1 000 %'],['SOL','$9 000','+88 %'],['MOON','',''],['HODL','','']];
  x.textBaseline='middle';x.font='34px "Press Start 2P",monospace';let px=20;
  for(const l of L9){x.fillStyle='#ffd75e';x.fillText(l[0],px,H/2);px+=x.measureText(l[0]).width+22;
    if(l[1]){x.fillStyle='#ffffff';x.fillText(l[1],px,H/2);px+=x.measureText(l[1]).width+22;}
    if(l[2]){x.fillStyle='#3dff9a';x.beginPath();x.moveTo(px,H/2+14);x.lineTo(px+16,H/2-16);x.lineTo(px+32,H/2+14);x.fill();px+=44;x.fillText(l[2],px,H/2);px+=x.measureText(l[2]).width;}
    px+=70;if(px>W-200)break;}
  const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.NearestFilter;t.anisotropy=4;
  texLibere(t); // (2026-10-14, passe perf mobile) 2048 × 96 : 0,8 Mo (le défilement = `offset`, la toile n'est jamais repeinte)
  CRYPTO.mat.tick=t;CRYPTO.mat.ecran=new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.5,1.5,1.5)});CRYPTO.mat.ecran.dispose=function(){};return t;
}
/* LES CONSTRUCTIONS DU NIVEAU — après les tours (buildVoxCity) : tout dans le groupe de la ville (il part avec la piste) */
function cryptoBatit(root){
  const S=CRYPTO.sites;if(!S)return;CRYPTO.root=root;const M=cryptoMats(),G=cryptoGeos(),M4=CRYPTO.m4,c=CRYPTO.c;cryptoInit();
  const nb=S.bougies.length;
  if(nb){const im=new THREE.InstancedMesh(G.cube,cryptoMatBougie(),nb*2);
    for(let k=0;k<nb;k++){const b=S.bougies[k];
      M4.makeScale(b.w,b.y1-b.y0,b.w);M4.setPosition(b.x,(b.y0+b.y1)/2,b.z);im.setMatrixAt(2*k,M4);c.setRGB(b.rouge?1.3:.12,b.rouge?.12:1,b.rouge?.18:.42);im.setColorAt(2*k,c);
      const yb=b.y0-b.mb,yt=b.y1+b.mh;M4.makeScale(3,yt-yb,3);M4.setPosition(b.x,(yb+yt)/2,b.z);im.setMatrixAt(2*k+1,M4);c.setRGB(b.rouge?1.2:.35,b.rouge?.35:1.2,b.rouge?.4:.6);im.setColorAt(2*k+1,c);}
    im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;root.add(im);CRYPTO.bougies=im;CRYPTO.jeter.push(im);}
  for(const t of S.taureaux)CRYPTO.taureaux.push(cryptoTaureau(root,t));
  if(S.pieces.length){const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),S.pieces.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.pieces=im;CRYPTO.jeter.push(im);
    for(const p of S.pieces)CRYPTO.pInfo.push(p);}
  if(S.diam.length){const im=new THREE.InstancedMesh(G.diam,M.diam,S.diam.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.diam=im;CRYPTO.jeter.push(im);
    for(const d of S.diam)CRYPTO.dInfo.push(d);}
  if(S.dirig.length){cryptoTickerTex();
    for(const d of S.dirig){const g=new THREE.Group();g.position.set(d.x,d.y,d.z);g.rotation.y=d.cap;
      g.add(new THREE.Mesh(G.ballon,M.ballon));
      for(const a of [0,1,2,3]){const f=new THREE.Mesh(G.cube,M.or);const s9=a<2?(a?1:-1):0,u9=a>=2?(a===2?1:-1):0;f.position.set(s9*12,u9*12,-52);f.scale.set(s9?16:1.6,u9?16:1.6,18);g.add(f);} // les ailerons d'or
      const go=new THREE.Mesh(G.cube,M.or);go.position.set(0,-17,6);go.scale.set(8,5,22);g.add(go); // la nacelle
      for(const s of [-1,1]){const e=new THREE.Mesh(G.plan,CRYPTO.mat.ecran);e.position.set(s*16.4,1,2);e.rotation.y=s*Math.PI/2;e.scale.set(56,9,1);g.add(e);} // les écrans du cours
      root.add(g);CRYPTO.dirig.push({g:g,y:d.y,ph:d.ph});}}
  CRYPTO.ath.t=22;CRYPTO.fusT=3;CRYPTO.feuT=2;
  crhBatit(); /* (2026-10-21) l'horizon du bull run et les projecteurs de la nuit : voir cryptocity-embellie */
}
function cryptoMatPiece(){
  if(CRYPTO.mat.piece)return CRYPTO.mat.piece;
  const m=new THREE.MeshPhongMaterial({map:plaTexPieces(),color:0xffffff,specular:0xffe7a8,shininess:90,emissive:0x2c1a04});
  m.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv.y=vUv.y*.5+.5;\n#endif');}; // la moitié ₿ de l'atlas des pièces
  m.customProgramCacheKey=function(){return 'pieceGeante1';};m.dispose=function(){};
  CRYPTO.mat.piece=m;return m;
}
/* ---- LES OBJETS DU CIEL (une fois pour toute la session : la lune ₿, trois fusées, les feux d'artifice) ---- */
function cryptoInit(){
  if(CRYPTO.lune)return;const M=cryptoMats(),G=cryptoGeos();
  // LA LUNE ₿ : la face de la pièce, qui tourne lentement, posée à l'endroit de la lune du dôme
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),src=plaTexPieces().image;
    const g=x.createRadialGradient(256,256,150,256,256,256);g.addColorStop(0,'rgba(255,214,120,.55)');g.addColorStop(.62,'rgba(255,190,90,.18)');g.addColorStop(1,'rgba(255,180,80,0)');
    x.fillStyle=g;x.fillRect(0,0,512,512);x.save();x.beginPath();x.arc(256,256,158,0,6.283);x.clip();x.drawImage(src,8,2,240,240,98,98,316,316);x.restore();
    const t=texLibere(new THREE.CanvasTexture(cv));t.anisotropy=4; // (2026-10-14, passe perf mobile) 512² : 1 Mo
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false,color:new THREE.Color(1.25,1.18,1.05)}));
    s.renderOrder=24;s.frustumCulled=false;s.visible=false;scene.add(s);CRYPTO.lune=s;}
  // LES FUSÉES « TO THE MOON » : le corps blanc, la coiffe et les ailerons rouges, la flamme, et un sillage de fumée (ruban de 56 points)
  for(let k=0;k<3;k++){const g=new THREE.Group();
    const b=new THREE.Mesh(G.cyl,M.fusee);b.scale.set(2.2,17,2.2);g.add(b);
    const n=new THREE.Mesh(G.cone,M.fuseeR);n.scale.set(2.2,7,2.2);n.position.y=12;g.add(n);
    for(let a=0;a<3;a++){const f=new THREE.Mesh(G.cube,M.fuseeR);const r=a/3*6.283;f.position.set(Math.cos(r)*2.6,-7,Math.sin(r)*2.6);f.rotation.y=-r;f.scale.set(3.4,6,.5);g.add(f);}
    const fl=new THREE.Sprite(M.flamme);fl.position.y=-12;fl.scale.set(9,16,1);g.add(fl);
    g.scale.setScalar(1.5);g.visible=false;scene.add(g);
    const NT=56,pos=new Float32Array(NT*2*3),al=new Float32Array(NT*2),sd9=new Float32Array(NT*2),idx=[];for(let i=0;i<NT*2;i++)sd9[i]=i%2;for(let i=0;i<NT-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aA',new THREE.BufferAttribute(al,1).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aS',new THREE.BufferAttribute(sd9,1));tg.setIndex(idx);
    const tm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,vertexShader:'attribute float aA,aS;varying float vA;varying float vS;void main(){vA=aA;vS=aS;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying float vA;varying float vS;void main(){float e=1.-pow(abs(vS*2.-1.),2.);gl_FragColor=vec4(vec3(1.,.98,.95),vA*e*.62);}'});
    const tr=new THREE.Mesh(tg,tm);tr.frustumCulled=false;tr.visible=false;tr.renderOrder=8;scene.add(tr);
    CRYPTO.fus.push({g:g,fl:fl,tr:tr,pos:pos,al:al,NT:NT,hist:[],on:false,t:0,p:new THREE.Vector3(),v:new THREE.Vector3(),dT:0});}
  // LES FEUX D'ARTIFICE : dix gerbes de 120 étoiles, calculées par la puce (l'origine et l'heure de chaque gerbe en uniforms)
  {const K=10,NP9=120,n=K*NP9,aB=new Float32Array(n),aD=new Float32Array(n*3),aR=new Float32Array(n),po=new Float32Array(n*3);
    for(let i=0;i<n;i++){aB[i]=Math.floor(i/NP9);let x,y,z,l;do{x=Math.random()*2-1;y=Math.random()*2-1;z=Math.random()*2-1;l=x*x+y*y+z*z;}while(l>1||l<.05);l=Math.sqrt(l);
      const r=.82+Math.random()*.18;aD[i*3]=x/l*r;aD[i*3+1]=y/l*r;aD[i*3+2]=z/l*r;aR[i]=Math.random();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(po,3));g.setAttribute('aB',new THREE.BufferAttribute(aB,1));g.setAttribute('aD',new THREE.BufferAttribute(aD,3));g.setAttribute('aR',new THREE.BufferAttribute(aR,1));
    const uO=[],uC=[];for(let k=0;k<K;k++){uO.push(new THREE.Vector4(0,0,0,-99));uC.push(new THREE.Vector3(1,1,1));}
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
      uniforms:{uO:{value:uO},uC:{value:uC},uT:{value:0},uPx:{value:600}},
      vertexShader:'uniform vec4 uO['+K+'];uniform vec3 uC['+K+'];uniform float uT,uPx;attribute float aB,aR;attribute vec3 aD;varying vec3 vC;varying float vA;'+
        'void main(){int b=int(aB+.5);vec4 o=uO[b];float t=uT-o.w;if(t<0.||t>2.8){gl_Position=vec4(0.,0.,2.,1.);gl_PointSize=0.;vA=0.;return;}'+
        'float v=(150.+120.*aR)*(1.-exp(-t*2.6))/2.6;vec3 p=o.xyz+aD*v+vec3(0.,-4.2*t*t,0.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;'+
        'float k=1.-t/2.8;vA=k*k*(.6+.4*sin(uT*31.+aR*40.))*smoothstep(0.,.08,t);vC=mix(uC[b],vec3(1.,.95,.8),step(.86,aR))*3.2;gl_PointSize=max(1.5,(7.+6.*aR)*k*uPx/max(1.,-mv.z));}',
      fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=dot(d,d);if(r>.25)discard;gl_FragColor=vec4(vC*vA*(1.-r*3.2),1.);}'});
    const p=new THREE.Points(g,m);p.frustumCulled=false;p.visible=false;p.renderOrder=9;p.userData.K=K;p.userData.k=0;scene.add(p);CRYPTO.feux=p;}
}
function cryptoFeu(x,y,z){const F=CRYPTO.feux;if(!F)return;const U=F.material.uniforms,k=F.userData.k=(F.userData.k+1)%F.userData.K;
  U.uO.value[k].set(x,y,z,U.uT.value);const C=[[.2,1,.5],[1,.8,.25],[1,.95,.85],[1,.55,.12],[.45,1,.85]][(Math.random()*5)|0];U.uC.value[k].set(C[0],C[1],C[2]);
  F.visible=true;}
function cryptoFeuDevant(){ // une gerbe au-dessus de la ville, DEVANT la caméra (300-800 m), dans le ciel
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=Math.max(.05,v.y*.4+.12);v.normalize();const d=300+Math.random()*500,s=CRYPTO.v2.set(-v.z,0,v.x).normalize().multiplyScalar((Math.random()-.5)*d*.9);
  cryptoFeu(camera.position.x+v.x*d+s.x,camera.position.y+v.y*d+60+Math.random()*160,camera.position.z+v.z*d+s.z);}
function cryptoFusee(){ // une fusée part d'un toit DEVANT la caméra (300-1 400 m) et file vers la lune ₿
  const f=CRYPTO.fus.find(function(q){return !q.on;}),T9=CRYPTO.toits;if(!f||T9.length<3)return;
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=0;v.normalize();
  for(let e=0;e<24;e++){const i=((Math.random()*T9.length/3)|0)*3,dx=T9[i]-camera.position.x,dz=T9[i+2]-camera.position.z,d=Math.hypot(dx,dz);
    if(d<300||d>1400||(dx*v.x+dz*v.z)/d<.45)continue;
    f.on=true;f.t=0;f.p.set(T9[i],T9[i+1]+12,T9[i+2]);f.v.set(0,14,0);f.hist.length=0;f.dT=0;f.g.visible=true;f.tr.visible=true;f.g.position.copy(f.p);
    for(let j=0;j<f.NT*2;j++)f.al[j]=0;f.tr.geometry.attributes.aA.needsUpdate=true;return;}}
function cryptoFuseeTick(f,dt){
  f.t+=dt;const k=Math.min(1,f.t/5),dir=CRYPTO.v2.set(0,1,0).lerp(MOON_DIR,k*.85).normalize();
  f.v.addScaledVector(dir,(16+f.t*7)*dt);f.p.addScaledVector(f.v,dt);f.g.position.copy(f.p);
  CRYPTO.q.setFromUnitVectors(CRYPTO.ax,CRYPTO.v3.copy(f.v).normalize());f.g.quaternion.copy(CRYPTO.q);
  f.fl.scale.set(9+Math.random()*2,15+Math.random()*7,1);
  f.dT-=dt;if(f.dT<=0){f.dT=.11;f.hist.unshift(f.p.x,f.p.y,f.p.z,f.t);if(f.hist.length>f.NT*4)f.hist.length=f.NT*4;}
  const H=f.hist,n=H.length/4,cam=camera.position,P=f.pos,A=f.al,vw=CRYPTO.v3,sd=CRYPTO.s;
  for(let i=0;i<f.NT;i++){const j=Math.min(n-1,i);if(n<2){A[i*2]=A[i*2+1]=0;continue;}
    const a=j*4,b=Math.min(n-1,j+1)*4,age=f.t-H[a+3],w=3+age*5.5;
    sd.set(H[a]-H[b],H[a+1]-H[b+1],H[a+2]-H[b+2]);vw.set(H[a]-cam.x,H[a+1]-cam.y,H[a+2]-cam.z);sd.cross(vw).normalize().multiplyScalar(w);
    P[i*6]=H[a]+sd.x;P[i*6+1]=H[a+1]+sd.y;P[i*6+2]=H[a+2]+sd.z;P[i*6+3]=H[a]-sd.x;P[i*6+4]=H[a+1]-sd.y;P[i*6+5]=H[a+2]-sd.z;
    const al=i<n-1?Math.max(0,1-age/6.5)*Math.min(1,i/2)*(f.t>12?Math.max(0,1-(f.t-12)/2):1):0;A[i*2]=A[i*2+1]=al;}
  f.tr.geometry.attributes.position.needsUpdate=true;f.tr.geometry.attributes.aA.needsUpdate=true;
  if(f.t>14.5){f.on=false;f.g.visible=false;f.tr.visible=false;}
}
function cryptoAth(){ // LE NOUVEL ATH : le cours grimpe, la pluie redouble, le ciel tire ses feux
  const A=CRYPTO.ath;A.n++;A.prix=Math.round(A.prix*(1.18+Math.random()*.22)/100)*100;
  const pr=A.prix>=1e6?(A.prix/1e6).toFixed(A.prix>=1e7?1:2).replace('.',',')+' M':Math.round(A.prix/1000)+' K';
  try{slam(TR('NOUVEL ATH !'),'BTC $ '+pr,'#3dff9a','#ffd75e',30,1,true);}catch(e){}
  plaSurge(6);for(let i=0;i<5;i++)setTimeout(cryptoFeuDevant,i*260);
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoTick(dt,sim){
  const on=cryptoOn()&&!!CRYPTO.root;
  if(!on){crhTick(0,false);if(CRYPTO.lune&&(CRYPTO.lune.visible||CRYPTO.feux.visible)){CRYPTO.lune.visible=false;CRYPTO.feux.visible=false; /* (2026-10-18, DEBUGGING : les gerbes du NOUVEL ATH partent en setTimeout jusqu'à 1 s après lui — un ATH juste avant le portail rallumait les FEUX dans la map suivante, où la lune est déjà cachée : ils restaient dans la scène toute la map, un appel de dessin de 1 200 points. Mesuré : ATH à 60 m du portail → feux visibles sur toute la MER DE NUAGES suivante) */for(const f of CRYPTO.fus){f.on=false;f.g.visible=f.tr.visible=false;}}return;}
  const d=sim?dt:0,cam=camera.position;CRYPTO.uT.value+=d;const t=CRYPTO.uT.value;CRYPTO.uSun.value.copy(SUN_DIR);CRYPTO.uNuit.value=LVL.nuit||0;
  // la lune ₿
  {const L9=CRYPTO.lune;L9.visible=true;L9.position.copy(cam).addScaledVector(MOON_DIR,5200);L9.scale.setScalar(5200*.16);L9.material.rotation=Math.sin(t*.25)*.12;}
  // les pièces géantes : elles tournent, elles flottent ; la traverser en vol = JACKPOT
  if(CRYPTO.pieces){const im=CRYPTO.pieces,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1,cp=carGroup.position;
    for(let k=0;k<CRYPTO.pInfo.length;k++){const p=CRYPTO.pInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.7+p.ph)*4,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);
      if(p.cd>0)p.cd-=d;else if(sim&&mode==='fall'&&cp.distanceToSquared(pp)<p.r*p.r*.8){p.cd=8;cryptoJackpot(pp);}}
    im.instanceMatrix.needsUpdate=true;}
  if(CRYPTO.diam){const im=CRYPTO.diam,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1;
    for(let k=0;k<CRYPTO.dInfo.length;k++){const p=CRYPTO.dInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.9+p.ph)*3,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);}
    im.instanceMatrix.needsUpdate=true;}
  for(const b of CRYPTO.dirig){b.g.position.y=b.y+Math.sin(t*.4+b.ph)*3;b.g.rotation.z=Math.sin(t*.3+b.ph)*.03;}
  if(CRYPTO.mat.tick)CRYPTO.mat.tick.offset.x=(t*.045)%1;
  crhTick(t,true);
  // les yeux laser balaient le ciel ; le ruban du taureau le plus proche se pose à la hauteur de la route
  let bd=1e18;for(const b of CRYPTO.taureaux){for(let i=0;i<2;i++){const L9=b.lasers[i];L9.rotation.set(-.32-.12*Math.sin(t*.37+b.ph),.22*Math.sin(t*.5+b.ph+i*.4)+(i?-.06:.06),0);}
    const dd=(b.x-cam.x)*(b.x-cam.x)+(b.z-cam.z)*(b.z-cam.z);if(dd<bd){bd=dd;CRYPTO.mat.taureau.userData.uBand.value=b.y+78*b.k;}}
  // fusées, feux, ATH
  for(const f of CRYPTO.fus)if(f.on&&d>0)cryptoFuseeTick(f,d);
  if(CRYPTO.feux){const U=CRYPTO.feux.material.uniforms;U.uT.value+=d;U.uPx.value=(renderer.domElement.height||600)*.5*camera.projectionMatrix.elements[5];}
  if(sim&&started&&!gameOver){
    const DZ9=CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) la cadence des fusées et des feux tirée
    CRYPTO.fusT-=d*(DZ9?DZ9.fus:1);if(CRYPTO.fusT<=0){CRYPTO.fusT=5+Math.random()*5;cryptoFusee();}
    CRYPTO.feuT-=d*(DZ9?DZ9.feu:1);if(CRYPTO.feuT<=0){CRYPTO.feuT=1.6+Math.random()*2.6;cryptoFeuDevant();}
    CRYPTO.ath.t-=d;if(CRYPTO.ath.t<=0&&mode!=='boom'){CRYPTO.ath.t=32+Math.random()*14;cryptoAth();}}
}
function cryptoJackpot(p){ // traverser une pièce ₿ géante en vol
  try{chaineAura('JACKPOT',160);}catch(e){}
  try{popTexte(TR('JACKPOT !'),'#ffd75e',2);}catch(e){}
  plaSurge(3.5);try{cryptoFeu(p.x,p.y+20,p.z);}catch(e){}
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoChauffe(){ // au menu (chauffeDivers) : chaque matière de CRYPTOCITY compilée et dessinée une fois hors écran — 0 programme en course
  const G=cryptoGeos(),M=cryptoMats();cryptoInit();plaInit();
  const L9=[],add=function(o){o.position.copy(camera.position);camera.getWorldDirection(CRYPTO.v1);o.position.addScaledVector(CRYPTO.v1,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatTours(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatToursLoin(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.plan,cryptoMatPub(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatBougie(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.diam,M.diam,1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  add(new THREE.Mesh(G.cube,cryptoMatTaureau()));for(const k of ['corne','oeil','laser','laserC','anneau','ballon','or','fusee','fuseeR'])add(new THREE.Mesh(G.cube,M[k]));
  cryptoTickerTex();add(new THREE.Mesh(G.plan,CRYPTO.mat.ecran));crhChauffe(add);
  for(const o of [CRYPTO.lune,CRYPTO.feux,PLA.mB,PLA.mP])if(o){o.visible=true;L9.push(o);}
  for(const f of CRYPTO.fus){f.g.visible=f.tr.visible=true;L9.push(f.g,f.tr);}
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9){if(o===CRYPTO.lune||o===CRYPTO.feux||o===PLA.mB||o===PLA.mP||CRYPTO.fus.some(function(f){return f.g===o||f.tr===o;}))o.visible=false;else scene.remove(o);}
}
window.dbgCrypto=function(k,v){ // console : l'état de CRYPTOCITY · ('ath') un ATH tout de suite · ('feu') une gerbe · ('fusee') une fusée · ('pluie',s) une averse
  if(k==='ath'){cryptoAth();return CRYPTO.ath;}if(k==='feu'){cryptoFeuDevant();return 'gerbe';}if(k==='fusee'){cryptoFusee();return CRYPTO.fus.map(function(f){return f.on;});}
  if(k==='pluie'){plaSurge(v||6);return PLA.dens;}
  if(k==='sansPluie'){PLA.off=!PLA.off;return PLA.off;}
  if(k==='vue'&&CRYPTO.taureaux.length){const b=CRYPTO.taureaux[v|0]||CRYPTO.taureaux[0];return {x:Math.round(b.x),y:Math.round(b.y),z:Math.round(b.z)};}
  if(k==='cadre'&&CRYPTO.taureaux.length){ // (banc, 2026-10-18) LE TAUREAU EN PHOTO : v={n, vue:'profil'|'face'|'trois'|'dos'|'dessous'|'haut'|'cote'|'route'|'arrive', fov} — la caméra posée dans SON repère
    v=v||{};const b=CRYPTO.taureaux[v.n|0]||CRYPTO.taureaux[0],K=b.k,W=function(l){return [b.x+K*(l[0]*b.co+l[2]*b.si),b.y+K*l[1],b.z+K*(-l[0]*b.si+l[2]*b.co)];};
    const VUES={profil:[[760,170,40],[0,110,40]],face:[[90,150,900],[0,120,80]],trois:[[560,260,620],[0,120,40]],dos:[[-420,330,-620],[0,150,20]],dessous:[[300,-260,420],[0,60,40]],haut:[[640,560,720],[0,110,60]],cote:[[980,240,260],[0,110,60]],pres:[[210,250,150],[0,120,40]],pres2:[[-205,215,-135],[0,140,30]],tete:[[150,60,250],[0,100,190]]}; // pres, pres2, tete : DANS l'esplanade (aucune tour entre l'objectif et lui)
    if(VUES[v.vue])return dbgCrypto('photo',{p:W(VUES[v.vue][0]),c:W(VUES[v.vue][1]),fov:v.fov||(/^(pres|tete)/.test(v.vue)?74:50)});
    let iB=0,dB=1e18;for(let i=0;i<NP;i++){const dx=pts[i].x-b.x,dz=pts[i].z-b.z,d=dx*dx+dz*dz;if(d<dB){dB=d;iB=i;}} // le point de la route le plus proche
    const i9=v.vue==='arrive'?Math.max(0,iB-Math.round(260/(L/(NP-1)))):iB,p=pts[i9];
    return dbgCrypto('photo',{p:[p.x,p.y+(v.vue==='arrive'?6:4),p.z],c:W([0,140,60]),fov:v.fov||62});}
  if(k==='dur'){ // (banc, 2026-10-18) LA HITBOX DU TAUREAU : (1) la marge la plus courte entre la ROUTE (au bitume, à 2 et 5 m) et le taureau ;
    // (2) le repère de la collision = celui du maillage dessiné : 4 000 points au hasard autour de lui, cryptoHeurt contre taureauDur lu par worldToLocal
    const R=[],q=new THREE.Vector3(),rr=mulberry32(77);
    for(const b of CRYPTO.taureaux){let marge=1e9;
      for(let i=0;i<NP;i++){const p=pts[i],dx=p.x-b.x,dz=p.z-b.z;if(dx*dx+dz*dz>560*560)continue;const lx=(dx*b.co-dz*b.si)/b.k,lz=(dx*b.si+dz*b.co)/b.k;
        for(const hy of [0,2,5]){const ly=(p.y+hy-b.y)/b.k;let m=0;while(m<60&&!taureauDur(b.F,lx,ly,lz,m))m+=1;marge=Math.min(marge,m*b.k);}}
      const me=b.g.children[0];me.updateMatrixWorld(true);let ko=0,dans=0;
      for(let j=0;j<4000;j++){q.set(b.x+(rr()-.5)*900,b.y+(rr()-.62)*900,b.z+(rr()-.5)*900);const h=cryptoHeurt(q);me.worldToLocal(q);const d=taureauDur(b.F,q.x,q.y,q.z,.7/b.k);if(h!==d)ko++;if(d)dans++;}
      R.push({route:marge>=60*b.k?'plus de '+Math.round(60*b.k)+' m':Math.round(marge)+' m',pied:Math.round(b.pl*b.k),repere:{essais:4000,dedans:dans,ecarts:ko}});}
    return R;}
  if(k==='tir'){ // (banc) la caisse lancée EN VOL vers le point v.cible du taureau v.n (repère local), le long de v.dir (local), à v.vit m/s, v.d m AVANT la
    // première surface VUE sur cette ligne (v.passe : v.d m avant la cible, il n'y a rien à voir) — la boucle fait le reste
    if(!started||gameOver||mode==='boom')return 'pas de course';
    const b=CRYPTO.taureaux[v.n|0],me=b.g.children[0],c=me.localToWorld(new THREE.Vector3().fromArray(v.cible)),dr=new THREE.Vector3().fromArray(v.dir).normalize().applyQuaternion(b.g.quaternion);
    const hit=new THREE.Raycaster(c.clone().addScaledVector(dr,-900),dr,0,1800).intersectObjects([b.g.children[0],b.g.children[1]],false)[0]; // ce qu'on VOIT en premier sur la ligne
    const o9=(hit&&!v.passe?hit.point:c).clone().addScaledVector(dr,-(v.d||15));
    if(paused)togglePause();if(v.bouclier)CHANCE.inv=Math.max(CHANCE.inv,3); // v.bouclier : le bouclier de la seconde chance — le choc est détecté (impPrep) puis pardonné, la partie continue
    startFall(10,1);fallPos.copy(o9);fallVel.copy(dr).multiplyScalar((v.vit||120)/SPD);carGroup.position.copy(fallPos);graceT=0;
    return {depart:o9.toArray().map(Math.round),vu:hit?{d:+hit.distance.toFixed(1),p:hit.point.toArray().map(function(x){return +x.toFixed(1);})}:null};}
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();if(acesPass)acesPass.uniforms.uSpeed.value=0;camera.position.fromArray(v.p);camera.lookAt(v.c[0],v.c[1],v.c[2]);if(v.fov){camera.fov=v.fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld(); // (banc) MODE PHOTO libre : la caméra en p, qui regarde c
    try{plaTick(0,false);cryptoTick(0,false);}catch(e){}if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'photo';}
  if(k==='cam'){const d=camera.getWorldDirection(new THREE.Vector3());return {p:camera.position.toArray().map(Math.round),d:d.toArray().map(function(x){return +x.toFixed(3);}),car:carGroup.position.toArray().map(Math.round)};}
  if(k==='masque'){const T9={pla:[PLA.mB,PLA.mP],lune:[CRYPTO.lune],feux:[CRYPTO.feux],bougies:[CRYPTO.bougies],pieces:[CRYPTO.pieces],diam:[CRYPTO.diam],ville:[CITY.root]};
    for(const o of (T9[v]||[]))if(o)o.visible=!o.visible;if(v==='taureaux')for(const b of CRYPTO.taureaux)b.g.visible=!b.g.visible;if(v==='fam')for(const F of CITY.fam||[]){F.im.visible=!F.im.visible;F.imL.visible=!F.imL.visible;}
    if(POST_ON&&composer)composer.render();return v;}
  if(k==='progs')return renderer.info.programs.filter(function(p){return p.diagnostics&&!p.diagnostics.runnable;}).map(function(p){return [p.cacheKey.slice(0,60),JSON.stringify(p.diagnostics).slice(0,400)];});
  if(k==='pla')return {mB:!!PLA.mB,vis:PLA.mB&&PLA.mB.visible,dens:PLA.dens,u:PLA.u&&{d:PLA.u.uDens9.value,t:PLA.u.uT9.value,c:PLA.u.uC9.value.toArray().map(Math.round)},prog:renderer.info.programs.filter(function(p){return /plaBillet1|plaPiece1/.test(p.cacheKey||'');}).map(function(p){return [p.cacheKey.slice(0,40),p.diagnostics?JSON.stringify(p.diagnostics).slice(0,600):'ok'];}),
    pix:PLA.texB?Array.from(PLA.texB.image.getContext('2d').getImageData(256,128,1,1).data):null,pixP:PLA.texP?Array.from(PLA.texP.image.getContext('2d').getImageData(128,122,1,1).data):null,inst:PLA.mB.geometry.instanceCount,max:PLA.mB.geometry._maxInstanceCount};
  if(k==='sites'){const S=CRYPTO.sites;return S?{bougies:S.bougies.slice(0,40).map(function(b){return [Math.round(b.x),Math.round(b.y0),Math.round(b.z),Math.round(b.y1-b.y0)];}),pieces:S.pieces.map(function(p){return [Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.r)];}),dirig:S.dirig.map(function(d){return [Math.round(d.x),Math.round(d.y),Math.round(d.z)];})}:null;}
  if(k==='taureaux')return CRYPTO.taureaux.map(function(b){return {x:Math.round(b.x),y:Math.round(b.y),z:Math.round(b.z),cap:+Math.atan2(b.si,b.co).toFixed(2),s:Math.round(b.s),pied:Math.round(b.pl*b.k)};});
  const S=CRYPTO.sites;return {on:cryptoOn(),ville:!!CITY.root,deco:CITY.dz&&CITY.dz.genre==='crypto'?CITY.deco:null,taureaux:CRYPTO.taureaux.length,bougies:S?S.bougies.length:0,pieces:CRYPTO.pInfo.length,diamants:CRYPTO.dInfo.length,
    dirigeables:CRYPTO.dirig.length,toits:CRYPTO.toits.length/3,reserve:CRYPTO.res.length/3,fusees:CRYPTO.fus.filter(function(f){return f.on;}).length,
    ath:{dans:+CRYPTO.ath.t.toFixed(1),n:CRYPTO.ath.n,prix:CRYPTO.ath.prix},pluie:{dens:+PLA.dens.toFixed(2),surge:+PLA.surge.toFixed(1),n:PLA.N,np:PLA.NP},ville9:CITY.n};};
