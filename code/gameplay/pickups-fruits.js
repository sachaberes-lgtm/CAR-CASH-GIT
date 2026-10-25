// ---------- PICKUPS : la PIÈCE PIXEL (2026-09-25) ----------
/* ⚠ POURQUOI ELLE A CHANGÉ. L'ancienne pièce était un disque lisse à 24 pans, un « $ » en Arial et TROIS matières
   (tranche + deux faces) : trois appels de dessin par pièce, ×2 faces de route, sur des centaines de pièces — et une
   facture « clip-art » au milieu d'un jeu en pixels et en facettes. Désormais : un OCTOGONE épais (la coupe low-poly
   des caisses), frappé d'un « $ » en VRAIS pixels (texture 16×16, filtrage au plus proche), UNE matière, UN appel. */
const COIN_CV=document.createElement('canvas');COIN_CV.width=COIN_CV.height=16;
/* (2026-10-14, passe graphismes) LA SAPÈQUE DES PICS DE JADE — Sacha : « dans la map montagne chinoise, change les pièces qui sont pour
   l'instant vertes en pièces chinoises avec un carré, un trou carré à l'intérieur ». Le vert venait de la palette 'Y' de coinPeint (champ
   de jade #6ff0ae). Sur la piste jade (mode classique ET Soleil de Jade : la clé 'Y' de coinSymbole, l'appel de buildJade ne bouge pas) la
   MÊME toile 16 × 16 est repeinte en sapèque de LAITON doré : liseré d'encre, listel (lumière en haut à gauche, ombre en bas à droite),
   champ, quatre marques en relief (haut · bas · droite · gauche : l'inscription d'une monnaie, sans prétendre se lire), listel du trou,
   et le TROU CARRÉ en encre sombre très nette (4 px : le quart du diamètre). Rien de plus pour la puce : ni géométrie, ni texture, ni
   alphaTest. ⚠ Palette PEINTE, pas celle de l'écran : la pièce émet sa texture et l'étalonnage pousse le jaune vers l'orange (coinPeint). */
const SAPEQUE={k:'#3a2006',l:'#fff0b0',h:'#f6d065',g:'#d2a23c',d:'#8a5a22',t:'#1e1003',
  M:{'6,3':1,'7,3':1,'9,3':1,'6,12':1,'8,12':1,'9,12':1,'3,6':1,'3,8':1,'3,9':1,'12,6':1,'12,7':1,'12,9':1}}; // les quatre marques (x,y)
function sapequePeint(c){
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    const dx=x-7.5,dy=y-7.5,r=Math.hypot(dx,dy),a=Math.max(Math.abs(dx),Math.abs(dy));let k;
    if(r>6.9)k='k';                                   // le liseré d'encre
    else if(r>5.7)k=(dx+dy<-1)?'l':(dx+dy>2?'d':'h'); // le listel, biseauté comme la tranche du « $ »
    else if(a<2)k='t';                                // le TROU CARRÉ
    else if(a<3)k=(dx+dy<0)?'l':'h';                  // le listel du trou
    else if(SAPEQUE.M[x+','+y])k='l';                 // une marque en relief
    else if(SAPEQUE.M[(x-1)+','+(y-1)]||(a<4&&dx+dy>1))k='d'; // son ombre, et l'ombre portée du listel du trou
    else k='g';                                       // le champ
    c.fillStyle=SAPEQUE[k];c.fillRect(x,y,1,1);}
}
function coinPeint(sym){ // (2026-10-12) le symbole frappé : « $ » partout, « ¥ » au niveau SOLEIL DE JADE (voir coinSymbole)
  const N=16,cv=COIN_CV;const c=cv.getContext('2d');
  if(sym==='Y'){sapequePeint(c);return;} // (2026-10-14, passe graphismes) sur la piste jade : la SAPÈQUE de laiton (même toile 16 × 16, repeinte)
  /* (2026-09-26, vague 2) L'OR DE LA BIBLE À L'ÉCRAN : #ffd75e. MESURÉ en course (pixels lus après l'ACES et le grade) : l'ancienne pièce
     (#ffc12e, émissif blanc ×.42, et surtout éclairée par la scène) sortait #fe8004 au couchant — ORANGE pur, la teinte des plots
     et de la flamme — et BRONZE sombre (#682800) dans la nuit de la ville. Deux causes : (1) elle vivait de la lumière de la scène,
     orange au couchant, magenta en ville ; (2) le grade (saturation ×1,4 puis ×1,12, coude des hautes lumières) pousse tout jaune
     vif vers l'orange : le vert tient à la luminance, le rouge s'envole et `roule` divise par lui. D'où une pièce qui ÉMET (voir
     pickMat) et un champ peint en or CITRON #fff27a : c'est lui qui ressort OR à l'écran (mesuré : #fcb120 au couchant au lieu de
     #fe8004, un or franc au lieu du bronze dans la ville) — et plus jamais de la teinte des plots. */
  const COL=sym==='B'?{k:'#5a2600',d:'#d8780c',g:'#ffab2e',l:'#fff1d0',h:'#ffd38a',s:'#fffaf0'}: /* (2026-10-13) CRYPTOCITY : la pièce BITCOIN — champ orange, ₿ blanc */sym==='Y'?{k:'#073a20',d:'#e0a818',g:'#6ff0ae',l:'#fff6c8',h:'#d6ffe8',s:'#0a4428'}:{k:'#6e3c00',d:'#d8a412',g:'#fff27a',l:'#fffbe6',h:'#fffbd0',s:'#8a4a00'}; // (2026-10-12) au SOLEIL DE JADE : le champ en JADE, la tranche d'OR, le ¥ en vert sombre (une pièce d'or se perdait sur la route en pièces d'or)
  const DOL=sym==='B'?['.#.#.','####.','#...#','#...#','####.','#...#','#...#','####.','.#.#.']:sym==='Y'?['#...#','#...#','.#.#.','..#..','#####','..#..','#####','..#..','..#..']:['..#..','.####','#.#..','#.#..','.###.','..#.#','..#.#','####.','..#..'];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const dx=x-7.5,dy=y-7.5,r=Math.hypot(dx,dy);let k;
    if(r>6.9)k='k';                                   // le liseré sombre (il découpe la pièce sur n'importe quel ciel)
    else if(r>5.7)k=(dx+dy<-1)?'l':(dx+dy>2?'d':'h'); // la tranche biseautée : lumière en haut à gauche, ombre en bas à droite
    else k=(dx+dy<-6)?'h':'g';                         // le champ, avec son reflet
    c.fillStyle=COL[k];c.fillRect(x,y,1,1);
  }
  for(let y=0;y<9;y++)for(let x=0;x<5;x++)if(DOL[y][x]==='#'){c.fillStyle=COL.s;c.fillRect(6+x,3+y,1,1);}
}
const coinTex=(function(){coinPeint('$');const cv=COIN_CV;
  /* (2026-09-26, vague 2) LES PIÈCES NE SCINTILLENT PLUS AU LOIN. Filtrée au plus proche EN RÉDUCTION et sans mipmaps, la pièce de
     16 pixels tirait un texel au hasard à chaque image dès 40 m : moiré, et une rangée de pièces clignotait comme des lampadaires.
     Désormais des mipmaps (la pièce lointaine devient un disque d'or moyen, stable) ; en AGRANDISSEMENT on garde le plus proche : de
     près, la pièce reste en vrais pixels. */
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;
  return t; // (pas d'anisotropie : sous D3D/ANGLE elle force un filtrage LINÉAIRE à l'agrandissement — adieu les vrais pixels de près)
})();
function coinSymbole(yen){const k=yen===true?'Y':yen||'$';if(coinSymbole.k===k)return;coinSymbole.k=k;coinPeint(k);coinTex.needsUpdate=true;
  try{coinIM.geometry=k==='Y'?pickGeoY:pickGeo;}catch(e){}} // (2026-10-14, passe graphismes, Sacha : « le vrai trou percé ») la piste jade troque aussi la FORME : deux géométries bâties UNE fois au chargement, la même instance, la même matière, le même programme
/* (2026-09-26, user : « les items sur la route plus gros, plus beaux, mieux travaillés ») : la pièce grossit (Ø 2,6 m), passe à 12 pans
   et reçoit un JONC en relief — un tore fusionné à la galette, dont les UV lisent le pixel clair de la tranche : on voit une vraie
   pièce frappée, avec sa bordure qui accroche la lumière, et c'est toujours UNE matière, UN appel de dessin. */
function geoFusion(gs){ // fusionne des géométries (position/normale/uv) en une seule, non indexée
  const P=[],N=[],U=[];
  for(const g0 of gs){const g=g0.index?g0.toNonIndexed():g0;P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);U.push(...g.attributes.uv.array);}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  o.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return o;
}
const pickGeo=(function(){
  const g=new THREE.CylinderGeometry(1.18,1.18,.30,12);g.rotateX(Math.PI/2);
  const uv=g.attributes.uv;for(let i=0;i<26;i++)uv.setXY(i,.47,.16); // la TRANCHE : tout le pourtour lit un pixel « ombre d'or »
  const t=new THREE.TorusGeometry(1.18,.13,6,24);const tu=t.attributes.uv;for(let i=0;i<tu.count;i++)tu.setXY(i,.47,.91); // le JONC : le pixel clair
  return geoFusion([g,t]);
})();
/* (2026-10-14, passe graphismes, Sacha : « le vrai trou percé ») LA FORME DE LA SAPÈQUE : un disque à 16 pans PERCÉ d'un trou carré — de vraies
   parois, on voit la montagne au travers, sans alphaTest ni transparence. En relief : le listel du bord (chanfrein d'encre, plat, pente) et
   celui du trou. Les faces lisent la toile 16 × 16 À PLAT (1 px = R/8 m ; au dos en miroir), la tranche et les parois lisent UN pixel.
   304 triangles (la pièce « $ » : 336), mêmes attributs que pickGeo. Bâtie une fois ; coinSymbole la pose sur l'instance des pièces. */
const pickGeoY=(function(){
  const P=[],Nn=[],U=[],R=1.31,K=R/8,N=16,ZR=.15,ZE=.09,ZF=.08;
  const tri=(a,b,c,hx,hy,hz)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    if(nx*hx+ny*hy+nz*hz<0){const t=b;b=c;c=t;nx=-nx;ny=-ny;nz=-nz;}
    for(const p of [a,b,c]){P.push(p[0],p[1],p[2]);Nn.push(nx,ny,nz);U.push(p[3],p[4]);}};
  const quad=(a,b,c,d,hx,hy,hz)=>{tri(a,b,c,hx,hy,hz);tri(a,c,d,hx,hy,hz);};
  const pt=(q,z,sz)=>[q[0]*K,q[1]*K,sz*z,.5+sz*q[0]/16,.5+q[1]/16];
  const uni=(p,uv)=>[p[0],p[1],p[2],uv[0],uv[1]];
  const TR=[.47,.16],TP=[.47,.53]; // la tranche : le pixel d'ombre de laiton que lit déjà pickGeo · les parois : un pixel du trou (encre)
  const cer=(r,i)=>{const a=Math.PI/4+i*2*Math.PI/N;return [r*Math.cos(a),r*Math.sin(a)];};
  const car=(h,j)=>{const a=Math.PI/4+j*Math.PI/2;return [h*Math.SQRT2*Math.cos(a),h*Math.SQRT2*Math.sin(a)];};
  for(const sz of [1,-1]){
    for(let i=0;i<N;i++){
      quad(pt(cer(8,i),ZE,sz),pt(cer(8,i+1),ZE,sz),pt(cer(7.2,i+1),ZR,sz),pt(cer(7.2,i),ZR,sz),0,0,sz);
      quad(pt(cer(7.2,i),ZR,sz),pt(cer(7.2,i+1),ZR,sz),pt(cer(6.5,i+1),ZR,sz),pt(cer(6.5,i),ZR,sz),0,0,sz);
      quad(pt(cer(6.5,i),ZR,sz),pt(cer(6.5,i+1),ZR,sz),pt(cer(6,i+1),ZF,sz),pt(cer(6,i),ZF,sz),0,0,sz);}
    for(let q=0;q<4;q++){
      const A=pt(car(3.15,q),ZF,sz),B=pt(car(3.15,q+1),ZF,sz),v=[];for(let m=0;m<=4;m++)v.push(pt(cer(6,q*4+m),ZF,sz));
      tri(A,v[0],v[1],0,0,sz);tri(A,v[1],v[2],0,0,sz);tri(A,v[2],B,0,0,sz);tri(B,v[2],v[3],0,0,sz);tri(B,v[3],v[4],0,0,sz);
      const A2=pt(car(2.8,q),ZR,sz),B2=pt(car(2.8,q+1),ZR,sz);
      quad(A,B,B2,A2,0,0,sz);quad(A2,B2,pt(car(2,q+1),ZR,sz),pt(car(2,q),ZR,sz),0,0,sz);}}
  for(let i=0;i<N;i++){const e0=cer(8,i),e1=cer(8,i+1);
    quad(uni(pt(e0,ZE,1),TR),uni(pt(e1,ZE,1),TR),uni(pt(e1,ZE,-1),TR),uni(pt(e0,ZE,-1),TR),e0[0]+e1[0],e0[1]+e1[1],0);}
  for(let q=0;q<4;q++){const a=car(2,q),b=car(2,q+1);
    quad(uni(pt(a,ZR,1),TP),uni(pt(b,ZR,1),TP),uni(pt(b,ZR,-1),TP),uni(pt(a,ZR,-1),TP),-(a[0]+b[0]),-(a[1]+b[1]),0);}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
  o.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return o;
})();
/* (2026-09-26, vague 2) LA LUMIÈRE, C'EST L'ARGENT : la pièce ÉMET son or (émissif blanc × sa propre texture ×1,05) et ne prend plus que la
   moitié de la lumière de la scène (diffus ×.5) — elle garde son relief (facettes, jonc, reflet spéculaire) sans virer à l'orange au
   couchant ni au bronze la nuit. ⚠ Émissif BLANC et pas « teinté or » : l'or multiplié par une texture d'or, c'est de l'orange. */
const pickMat=new THREE.MeshPhongMaterial({map:coinTex,color:0x808080,emissive:0xffffff,emissiveMap:coinTex,emissiveIntensity:1.05,
  shininess:90,specular:0xfff0b0,flatShading:true});
// ---------- L'ÉTAL : les orbes bleues de boost deviennent des FRUITS ET LÉGUMES ----------
// Lisses, laqués, appétissants : shininess haut + spéculaire blanc + reflet du ciel (envMap).
// Géométries et matériaux PARTAGÉS (créés une fois) — un fruit ne coûte que 2-3 meshes.
const fgSph=new THREE.SphereGeometry(1,16,12),fgCone=new THREE.ConeGeometry(1,1,14),fgCyl=new THREE.CylinderGeometry(1,1,1,8),
      fgDisc=new THREE.CircleGeometry(1,28); // la CHAIR d'un fruit coupé (pastèque)
for(const g9 of [fgSph,fgCone,fgCyl,fgDisc])g9.userData.partage=true; // (2026-09-26) partagées par les moteurs : jeteEngin ne les libère pas
// (les matières vernies des anciens fruits — `FM`, `glossyM`, l'écorce peinte — sont parties avec eux : voir le kit low-poly plus bas)
// L'ÉTAL : chaque cageot a son NOM, sa recette 3D, son BOOST (nitro rendue) et sa FRÉQUENCE (poids
// de tirage). boost/freq sont réglables en jeu depuis la plateforme ÉTAL et persistés dans la sauvegarde.
/* ⚠ LES FRUITS PASSENT AU KIT LOW-POLY (2026-09-25). Ils étaient faits de sphères lisses VERNIES, une par morceau :
   la grenade seule empilait 41 meshes (34 arilles), la pastèque 13 — autant d'appels de dessin, par fruit, sur une
   route qui en aligne des dizaines, et un rendu « photo de primeur » à côté de caisses taillées à facettes.
   Désormais chaque recette est COULÉE une seule fois par l'atelier des caisses (`lpKit` : facettes, couleurs aux
   sommets, rim de soleil) en UNE géométrie partagée : un fruit = un mesh = un appel. `lp(K)` remplace `build(g)`. */
const FRUIT_PAL={P:{g:'f',c:0xff9ec2},p:{g:'f',c:0xfff0dc},B:{g:'f',c:0xffd63a},b:{g:'f',c:0x6b5320},
  R:{g:'f',c:0xc80f2a},r:{g:'f',c:0xf7e3c8},A:{g:'f',c:0xff2a58},O:{g:'f',c:0xff8b12},M:{g:'f',c:0x4b3bc0},
  m:{g:'f',c:0xa9a0ec},V:{g:'f',c:0x1f8a34},v:{g:'f',c:0x4cc25a},C:{g:'f',c:0xff2d4a},w:{g:'f',c:0xf1f8dc},
  n:{g:'f',c:0x1a1410},F:{g:'f',c:0x43b84e},T:{g:'f',c:0x7a5230},
  /* fruits v2 */ pe1:{g:'f',c:0x6c0412},pe2:{g:'f',c:0x94101a},pe3:{g:'f',c:0xb04400},pe4:{g:'f',c:0xb07a06},peT:{g:'f',c:0x3a1e08},peL:{g:'f',c:0x127a22},pel:{g:'f',c:0x07461a},ba1:{g:'f',c:0xb88400},ba2:{g:'f',c:0xa86400},ba3:{g:'f',c:0x2e6a08},ba6:{g:'f',c:0x7a8a04},ba4:{g:'f',c:0x1a0c04},ba5:{g:'f',c:0x4a2404},ba7:{g:'f',c:0x1e2a04},gr1:{g:'f',c:0x780800},gr2:{g:'f',c:0x460400},gr3:{g:'f',c:0x8e3000},gr4:{g:'f',c:0x300004},gr5:{g:'f',c:0xb00800},gr8:{g:'f',c:0xd02010},gr6:{g:'f',c:0x7a4010},gr7:{g:'f',c:0x140200},or1:{g:'f',c:0xb03400},or2:{g:'f',c:0xc84800},or3:{g:'f',c:0x8a2000},or4:{g:'f',c:0x1e5a0a},or5:{g:'f',c:0x2e3008},or6:{g:'f',c:0x0e6a1e},or7:{g:'f',c:0x06401a},my1:{g:'f',c:0x0a0a50},my2:{g:'f',c:0x2a3890},my3:{g:'f',c:0x040210},my4:{g:'f',c:0x120a36},myT:{g:'f',c:0x2a2a08},myL:{g:'f',c:0x127a22},myl:{g:'f',c:0x07461a},pa1:{g:'f',c:0x08380e},pa2:{g:'f',c:0x1a5a0c},pa3:{g:'f',c:0x9a0a00},pa4:{g:'f',c:0xb81400},pa6:{g:'f',c:0x4a7a22},pa7:{g:'f',c:0x120806},paT:{g:'f',c:0x2a2008}};
Object.assign(FRUIT_PAL,{ // (2026-10-12) les fruits du SOLEIL DE JADE
  jl1:{g:'f',c:0xc0223a},jl2:{g:'f',c:0xe8506a},jl3:{g:'f',c:0x7a0e22},jlT:{g:'f',c:0x5a3a18},jlL:{g:'f',c:0x2f7a2a},jll:{g:'f',c:0x1c561c},
  jk1:{g:'f',c:0xff7a12},jk2:{g:'f',c:0xffa640},jk3:{g:'f',c:0xc8520a},jkC:{g:'f',c:0x5e7426},jkc:{g:'f',c:0x3e5016},jkT:{g:'f',c:0x4a3412},
  jp1:{g:'f',c:0xe0157a},jp2:{g:'f',c:0xff4fa6},jp3:{g:'f',c:0xa00852},jpS:{g:'f',c:0x86d040},
  cb1:{g:'f',c:0xc8124a},cb2:{g:'f',c:0xe8306a},cb3:{g:'f',c:0xd85a22},cbS:{g:'f',c:0xf0d878},cbT:{g:'f',c:0x6a1a20}, // (2026-10-14) les fruits du CANYON DES GÉANTS : figue de barbarie, datte, melon du désert
  dt1:{g:'f',c:0x7a3010},dt2:{g:'f',c:0xb0581a},dt3:{g:'f',c:0x4a1a06},dtC:{g:'f',c:0xd8b070},me1:{g:'f',c:0xc8b46a},me2:{g:'f',c:0x8a8a4a},me3:{g:'f',c:0x5a6a30},meN:{g:'f',c:0xece2b8},me4:{g:'f',c:0x5a4a20},
  jm1:{g:'f',c:0x52123a},jm2:{g:'f',c:0x7a2456},jm3:{g:'f',c:0x2e0a22},jmC:{g:'f',c:0x4e8a2e},jmc:{g:'f',c:0x2e5e1c},jmT:{g:'f',c:0x5a4420}});
/* les outils des fruits (les mêmes que dans chaque fruit d'origine), pour les fruits du SOLEIL DE JADE */
function frH(K){const T=THREE,V3=T.Vector3;
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};
  return {T:T,V3:V3,hs:hs,D:D,P:P,LF:LF};}
const SPH=(w,h)=>new THREE.SphereGeometry(1,w||8,h||6);
const FRUIT_DEFS=[
  /* (2026-09-26, user : « les fruits plus gros, plus beaux, mieux travaillés dans leur design ») : les six fruits REDESSINÉS à l'atelier
     (scratchpad gamme/lots/fruits.js, banc fruits.js) — facettes colorées une à une, feuilles à nervure, arilles, pépins, quartier retiré.
     Noms, boost, fréquences et jus INCHANGÉS. */
  {n:'PÊCHE PLATE',boost:0.6,freq:10,jus:0xff9ec2,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const g=D(new T.SphereGeometry(1,20,12),v=>{
    const r=Math.hypot(v.x,v.z),a=Math.atan2(v.z,v.x),da=Math.atan2(Math.sin(a-1.5708),Math.cos(a-1.5708));
    const y=Math.sign(v.y)*Math.pow(Math.abs(v.y),.8)*.56-(v.y>0?.24:.14)*Math.exp(-r*r/.12),gr=1-.17*Math.exp(-da*da/.05)*(v.y>-.2?1:.4);
    v.set(v.x*.96*gr,y,v.z*.96*gr);});
  const B=new V3(-.6,.3,.75).normalize();
  P(g,(x,y,z,nx,ny,nz)=>{const a=Math.atan2(z,x),da=Math.abs(Math.atan2(Math.sin(a-1.5708),Math.cos(a-1.5708)));
    if(da<.17&&y>-.1&&Math.hypot(x,z)>.3)return 'pe1';                       // le sillon, en trait cramoisi
    const s=.35*(nx*B.x+ny*B.y+nz*B.z)+.6*ny+(hs(x,y,z)-.5)*.6;
    return s>.45?'pe1':s>.18?'pe2':s>-.08?'pe3':'pe4';});
  K.put('peT',new T.CylinderGeometry(.035,.055,.2,5),0,.38,0,0,0,.25);
  LF('peL','pel',.74,.12,.3,.16,.03,.46,0,.5,.5,.4,6);
  LF('peL','pel',.52,.1,.3,.1,0,.46,0,-.5,2.7,.5,5);
 }},
  {n:'BANANE',boost:0.5,freq:12,jus:0xffd63a,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const A=1.6,RC=1.0,E0=RC*Math.sin(A/2),F0=RC*(1-Math.cos(A/2));
  const rr=u=>LPU.lin([[0,.05],[.08,.065],[.18,.14],[.32,.17],[.66,.17],[.82,.14],[.93,.085],[1,.04]],u);
  const US=[0,.08,.18,.26,.34,.42,.5,.58,.66,.74,.82,.9,.96,1];
  const doigt=(fan,dy,sc)=>{
    const M=new T.Matrix4().compose(new V3(-.74,.12+dy,0),new T.Quaternion().setFromEuler(new T.Euler(0,fan,0)),new V3(sc,sc,sc));
    const sec=US.map(u=>{const a=-A/2+u*A,cx=RC*Math.sin(a)+E0,cy=RC*(1-Math.cos(a))-F0,nX=-Math.sin(a),nY=Math.cos(a),r=rr(u),pts=[];
      for(let k=0;k<5;k++){const q=k/5*6.2832+1.5708,c=Math.cos(q)*r,s=Math.sin(q)*r*.92;pts.push(new V3(cx+nX*c,cy+nY*c,s).applyMatrix4(M).toArray());}
      const tg=new V3(Math.cos(a),Math.sin(a),0).transformDirection(M);
      return {u,pts,c:new V3(cx,cy,0).applyMatrix4(M).toArray(),tg:tg.toArray()};});
    for(let i=0;i<sec.length-1;i++){const S0=sec[i],S1=sec[i+1],um=(S0.u+S1.u)/2;
      for(let k=0;k<5;k++){const k2=(k+1)%5,a=S0.pts[k],b=S0.pts[k2],c=S1.pts[k2],d=S1.pts[k];
        const mx=(a[0]+b[0]+c[0]+d[0])/4,my=(a[1]+b[1]+c[1]+d[1])/4,mz=(a[2]+b[2]+c[2]+d[2])/4;
        const oy=(my-(S0.c[1]+S1.c[1])/2)/(rr(um)||1);
        const key=um<.12?'ba3':um<.2?'ba6':um>.96?'ba5':oy>.2?'ba1':'ba2',sp=um>.25&&um<.9;
        K.tri(sp&&hs(a[0]+c[0],b[1],mz)>.955?'ba5':key,a,b,c);K.tri(sp&&hs(mx,d[1]+a[1],c[2])>.955?'ba5':key,a,c,d);}}
    const L=sec[sec.length-1],tp=[L.c[0]+L.tg[0]*.07*sc,L.c[1]+L.tg[1]*.07*sc,L.c[2]+L.tg[2]*.07*sc];
    for(let k=0;k<5;k++)K.tri('ba4',L.pts[k],L.pts[(k+1)%5],tp);
  };
  doigt(-.4,0,.95);doigt(.4,0,.95);doigt(0,.07,1.04);
  P(new T.CylinderGeometry(.075,.11,.26,7).rotateZ(1.1).translate(-.84,.2,0),(x,y,z,nx,ny,nz)=>(nx<-.6&&ny>.3)?'ba4':'ba7');
 }},
  {n:'GRENADE',boost:1,freq:4,cf:4,jus:0xd10f2b,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const ZC=.40;
  const g=D(new T.SphereGeometry(1,18,11),v=>{
    const a=Math.atan2(v.z,v.x),k=1+.05*Math.cos(6*a);
    let x=v.x*.84*k,z=v.z*.84*k,y=v.y*.80;
    if(v.y>.7){const t=(v.y-.7)/.3;x*=1-.35*t;z*=1-.35*t;y+=.05*t;}
    if(z>ZC)z=ZC;
    v.set(x,y,z);});
  P(g,(x,y,z,nx,ny,nz)=>{
    if(Math.abs(nz)>.97&&z>ZC-.01)return Math.hypot(x,y)>.62?'gr6':'gr4';
    const h=hs(x,y,z);
    if(ny<-.45)return h>.7?'gr1':'gr2';
    if(ny>.1&&h>.84)return 'gr3';
    return h<.14?'gr2':'gr1';});
  for(let i=0;i<19;i++){const rg=i<1?0:i<7?.2:.4,a=(i<1?0:i<7?(i-1)/6:(i-7)/12)*6.2832+(i<7?.3:0),x=Math.cos(a)*rg,y=Math.sin(a)*rg*.95;
    K.put(i%3?'gr5':'gr8',new T.OctahedronGeometry(1,0),x,y,ZC+.04,.3+i,.5*i,.2+i*.7,.1,.12,.085);}
  P(new T.CylinderGeometry(.14,.18,.2,7).translate(0,.88,0),(x,y,z,nx,ny,nz)=>ny>.9?'gr7':(hs(x,y,z)>.5?'gr1':'gr2'));
  for(let i=0;i<6;i++){const a=i/6*6.2832;K.put(i%2?'gr1':'gr2',new T.ConeGeometry(1,1,4),Math.cos(a)*.15,1.02,Math.sin(a)*.15,0,-a,-.55,.07,.26,.05);}
 }},
  {n:'ORANGE',boost:0.5,freq:11,jus:0xff8b12,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const g=D(new T.IcosahedronGeometry(1,3),v=>{const k=.80*(1+.035*(hs(v.x,v.y,v.z)-.5));v.set(v.x*k,v.y*k*.94,v.z*k);});
  P(g,(x,y,z,nx,ny,nz)=>{const h=hs(x*3,y*3,z*3);
    if(ny<-.55)return h>.6?'or1':'or3';
    return h>.84?'or2':h<.12?'or3':'or1';});
  for(let i=0;i<5;i++){const a=i/5*6.2832;K.put('or4',new T.ConeGeometry(1,1,3),Math.cos(a)*.09,.755,Math.sin(a)*.09,0,-a,-1.3,.06,.2,.025);}
  K.put('or5',new T.CylinderGeometry(.035,.05,.16,5),0,.82,0,0,0,.2);
  LF('or6','or7',.62,.24,.2,.12,.02,.86,0,.9,.35,.32,6);
 }},
  {n:'MYRTILLE',boost:0.35,freq:26,jus:0x6a4bd8,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const g=D(new T.IcosahedronGeometry(1,3),v=>{const r=Math.hypot(v.x,v.z),k=.62*(1+.03*(hs(v.x,v.y,v.z)-.5)),y=v.y*.9-(v.y>0?.2:0)*Math.exp(-r*r/.06);v.set(v.x*k,y*k,v.z*k);});
  P(g,(x,y,z,nx,ny,nz)=>{const r=Math.hypot(x,z);if(y>.3&&r<.14)return 'my3';const h=hs(x,y,z);
    if(ny>.35&&h>.45)return 'my2';if(ny<-.5)return 'my1';return h>.8?'my2':'my1';});
  for(let i=0;i<5;i++){const a=i/5*6.2832+.3;K.put('my4',new T.ConeGeometry(1,1,3),Math.cos(a)*.16,.5,Math.sin(a)*.16,0,-a,-.85,.14,.3,.05);}
  K.put('myT',new T.CylinderGeometry(.025,.035,.26,4),.05,.6,0,0,0,-.35);
  LF('myL','myl',.52,.18,.2,.08,.1,.72,0,.8,.4,.35,5);
 }},
  {n:'PASTÈQUE',boost:2,freq:1,jus:0xe8253f,lp:function(K){
  const T=THREE,V3=T.Vector3;
  // hachage stable d'un point → [0,1) : mouchetures, taches, pores — même point, même valeur (aucune fissure aux coutures)
  const hs=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
  // D : déforme une géométrie sommet par sommet (fonction de la POSITION seule)
  const D=(g,fn)=>{const p=g.attributes.position,v=new V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);}return g;};
  // P : verse une géométrie en choisissant la couleur PAR FACETTE — fn(centre x,y,z, normale nx,ny,nz) → clé de palette
  const P=(g,fn)=>{const gg=g.index?g.toNonIndexed():g,p=gg.attributes.position.array;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1;
      K.tri(fn((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3,nx/l,ny/l,nz/l),a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();};
  // LF : une FEUILLE à nervure — deux demi-limbes de deux verts, pliés en V le long de la nervure, pointe qui retombe.
  // Posée le long de +x puis roulée (rx), relevée (rz), orientée (ry).
  const LF=(kA,kB,L,W,fold,droop,x,y,z,rx,ry,rz,N)=>{N=N||5;
    const M=new T.Matrix4().compose(new V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YZX')),new V3(1,1,1));
    const pt=(u,s)=>{const w=W*Math.pow(Math.sin(Math.PI*u),.7)*(1-.35*u),v=new V3(u*L,-droop*u*u+fold*Math.abs(s)*w,s*w).applyMatrix4(M);return [v.x,v.y,v.z];};
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,m0=pt(u0,0),m1=pt(u1,0);
      for(const s of [-1,1]){const e0=pt(u0,s),e1=pt(u1,s),k=s<0?kA:kB;K.tri(k,m0,e0,e1);K.tri(k,m0,e1,m1);}}};

  const AX=1.0,BY=.80,CZ=.80,NT=12,NP=24,J0=6;           // quartier ôté : φ ∈ (0, π/2) — entre le haut (+y) et l'avant (+z)
  const S=(t,f,r)=>[AX*Math.cos(t),BY*Math.sin(t)*Math.cos(f)*r,CZ*Math.sin(t)*Math.sin(f)*r];
  for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(let j=J0;j<NP;j++){const f0=j/NP*6.2832,f1=(j+1)/NP*6.2832,a=S(t0,f0,1),b=S(t1,f0,1),c=S(t1,f1,1),d=S(t0,f1,1),m=j%3;
      const kA=m===0?'pa1':m===1?'pa2':(i%2?'pa1':'pa2'),kB=m===0?'pa1':m===1?'pa2':(i%2?'pa2':'pa1');
      K.tri(kA,a,b,c);K.tri(kB,a,c,d);}}
  const RG=[[0,.45,'pa4'],[.45,.8,'pa3'],[.8,.9,'pa6'],[.9,1,'pa1']];
  for(const f of [Math.PI/2,6.2832])for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(const q of RG){const a=S(t0,f,q[0]),b=S(t1,f,q[0]),c=S(t1,f,q[1]),d=S(t0,f,q[1]);K.tri(q[2],a,b,c);K.tri(q[2],a,c,d);}}
  const PE=[[.9,.62],[1.25,.66],[1.6,.6],[1.95,.64],[2.3,.62],[1.1,.4],[1.75,.38],[2.1,.42]];
  // un pépin : losange en pointe de diamant, couché sur la tranche (u = le long, v = vers l'écorce, n = hors de la tranche)
  const pep=(c,u,v,n)=>{const q=(a,b,h)=>[c[0]+u[0]*a+v[0]*b+n[0]*h,c[1]+u[1]*a+v[1]*b+n[1]*h,c[2]+u[2]*a+v[2]*b+n[2]*h];
    const A=q(-.036,0,.004),B=q(0,-.05,.004),C=q(.036,0,.004),E=q(0,.075,.004),H=q(0,0,.03);
    K.tri('pa7',A,B,H);K.tri('pa7',B,C,H);K.tri('pa7',C,E,H);K.tri('pa7',E,A,H);};
  for(const q of PE){const p=S(q[0],Math.PI/2,q[1]),w=S(q[0],0,q[1]),tw=.25*Math.sin(q[0]*7);
    pep(p,[Math.cos(tw),0,Math.sin(tw)],[-Math.sin(tw),0,Math.cos(tw)],[0,1,0]);
    pep(w,[Math.cos(tw),Math.sin(tw),0],[-Math.sin(tw),Math.cos(tw),0],[0,0,1]);}
  P(new T.CylinderGeometry(.04,.07,.14,5).rotateZ(1.5708).translate(-1.04,0,0),(x,y,z,nx)=>nx<-.8?'pa7':'paT');
 }},
  /* (2026-10-12) LES FRUITS DU SOLEIL DE JADE — freq 0 partout ailleurs (ils ne sortent jamais hors de ce niveau), `jf` = leur fréquence là-bas
     (voir fruitPick). Mêmes outils et même facture que les fruits d'origine (facettes colorées une à une, feuilles à nervure). */
  {n:'LITCHI',boost:.5,freq:0,jf:14,jus:0xf6e6ee,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.IcosahedronGeometry(1,3),v=>{const n=H.hs(Math.round(v.x*9),Math.round(v.y*9),Math.round(v.z*9)),k=.66*(1+.07*n)*(1+.06*v.y);v.set(v.x*k*.95,v.y*k*1.06,v.z*k*.95);});
  H.P(g,(x,y,z,nx,ny,nz)=>{if(y>.5&&Math.hypot(x,z)<.12)return 'jlT';const h=H.hs(Math.round(x*7),Math.round(y*7),Math.round(z*7));return h>.72?'jl2':h<.22?'jl3':'jl1';}); // l écorce en écailles
  K.put('jlT',new T.CylinderGeometry(.03,.045,.30,5),.03,.80,0,0,0,-.25);
  H.LF('jlL','jll',.55,.17,.18,.10,.06,.88,0,.6,.9,.45,5);
 }},
  {n:'KAKI',boost:.7,freq:0,jf:10,jus:0xff8a1e,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,20,12),v=>{const th=Math.atan2(v.z,v.x),r=Math.hypot(v.x,v.z),lob=1+.05*Math.cos(4*th);v.set(v.x*.80*lob,v.y*.60-(v.y>0?.10:0)*Math.exp(-r*r/.05),v.z*.80*lob);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x,y,z);if(ny>.55)return h>.5?'jk2':'jk1';if(ny<-.4)return 'jk3';return h>.85?'jk2':'jk1';});
  for(let i=0;i<4;i++){const a=i/4*6.2832+.4;H.LF('jkC','jkc',.32,.17,.05,.05,0,.50,0,0,-a,.12,4);} // le calice à quatre sépales
  K.put('jkT',new T.CylinderGeometry(.035,.05,.16,5),0,.58,0);
 }},
  {n:'PITAYA',boost:1.2,freq:0,jf:5,jus:0xe8187a,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,18,12),v=>{v.set(v.x*.62,v.y*.62*1.25,v.z*.62);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x,y,z);return ny>.4?(h>.5?'jp2':'jp1'):ny<-.5?'jp3':(h>.8?'jp2':'jp1');});
  for(let j=0;j<3;j++)for(let i=0;i<6;i++){const a=i/6*6.2832+j*.52,yy=-.40+j*.34,r=.60*Math.sqrt(Math.max(0,1-Math.pow(yy/.78,2)));
    H.LF('jp1','jpS',.34,.11,.25,-.06,Math.cos(a)*r,yy,Math.sin(a)*r,0,-a,.9,4);}                     // les écailles : rose, la pointe verte
  for(let i=0;i<4;i++){const a=i/4*6.2832+.3;H.LF('jpS','jp1',.26,.09,.2,-.05,0,.74,0,0,-a,1.2,4);}
 }},
  {n:'MANGOUSTAN',boost:.9,freq:0,jf:7,jus:0xf3eee6,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,18,12),v=>{v.set(v.x*.66,v.y*.58,v.z*.66);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x,y,z);return ny>.5?(h>.6?'jm2':'jm1'):ny<-.5?'jm3':(h>.85?'jm2':'jm1');});
  for(let i=0;i<4;i++){const a=i/4*6.2832;H.LF('jmC','jmc',.28,.17,.08,.02,0,.52,0,0,-a,.05,4);}        // le gros calice vert
  K.put('jmT',new T.CylinderGeometry(.04,.055,.22,5),0,.66,0);
 }},
  /* (2026-10-14) LES FRUITS DU CANYON DES GÉANTS — `cf` = leur fréquence là-bas, `cs` = on ne les trouve QUE là-bas (voir fruitPick) */
  {n:'FIGUE DE BARBARIE',boost:.8,freq:0,cf:12,cs:1,jus:0xe0306a,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,18,12),v=>{const y=v.y,k=.62*(1-.18*y);v.set(v.x*k*(1+.04*Math.sin(y*9)),y>.82?.70+(y-.82)*.4:y*.86,v.z*k*(1+.04*Math.cos(y*9)));}); // l'oeuf, le haut aplati
  H.P(g,(x,y,z,nx,ny,nz)=>{if(ny>.8&&y>.62)return 'cbT';const a=Math.atan2(z,x);if(Math.abs(Math.sin(a*3+y*7))<.12&&Math.abs(Math.sin(y*11))<.25)return 'cbS';const h=H.hs(x,y,z);return y>.2?(h>.6?'cb2':'cb1'):(h>.5?'cb3':'cb1');}); // les aréoles, leurs épines blondes
 }},
  {n:'DATTE',boost:.5,freq:0,cf:14,cs:1,jus:0xb0581a,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,16,12),v=>{const w=1+.05*Math.sin(v.y*14+Math.atan2(v.z,v.x)*3);v.set(v.x*.42*w,v.y*.86,v.z*.42*w);}); // longue, ridée
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x*3,y*3,z*3);if(ny>.86&&y>.8)return 'dtC';return ny>.3?(h>.55?'dt2':'dt1'):(h>.7?'dt1':'dt3');});
  K.put('dtC',new T.CylinderGeometry(.10,.14,.08,6),0,.86,0);
 }},
  {n:'MELON DU DÉSERT',boost:1.4,freq:0,cf:4,cs:1,jus:0xf0a050,lp:function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.IcosahedronGeometry(1,3),v=>{const k=.80*(1+.03*(H.hs(v.x,v.y,v.z)-.5));v.set(v.x*k,v.y*k*.92,v.z*k);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const a=Math.atan2(z,x);if(Math.abs(Math.sin(a*5))<.08)return 'me3';const h=H.hs(x*4,y*4,z*4);return h>.62?'meN':h<.2?'me2':'me1';}); // les côtes, le filet
  K.put('me4',new T.CylinderGeometry(.04,.06,.14,5),0,.76,0,0,0,.2);
 }},
];
// UNE GÉOMÉTRIE PAR FRUIT, coulée à la première demande et partagée par tous ses exemplaires (jamais libérée)
const FRUIT_GEO=[];let FRUIT_MAT=null;
function fruitGeo(i){
  if(!FRUIT_GEO[i]){const K=lpKit(FRUIT_PAL);FRUIT_DEFS[i].lp(K);FRUIT_GEO[i]=K.done().f;}
  if(!FRUIT_MAT){FRUIT_MAT=lpMat('f');FRUIT_MAT.userData.lp=0;} // ⚠ lp=0 : `buildCar` libère les matières marquées lp — pas celle-ci
  return FRUIT_GEO[i];
}
/* ============================================================================
   LES MOTEURS — plan de progression (2026-07-31)
   Les FRUITS ne remplissent plus seulement la nitro : ils font MONTER LE MOTEUR. Le moteur est la
   progression VERTICALE (ce qui pousse) ; la voiture reste la progression HORIZONTALE (ce qu'on pilote,
   à débloquer par challenges). Chaque palier donne de la poussée, un peu de réserve, et une IDENTITÉ.
   `fruits` = nombre de fruits croqués pour l'atteindre.
   ========================================================================== */
// ⚠ CE SONT LES PIÈCES qui montent le moteur (pas les fruits — eux ne servent QU'au boost, ce qui
// explique qu'un moteur rouillé puisse déjà filer à une vitesse absurde). `coins` = pièces ramassées.
// La montée est ROCAMBOLESQUE : on part d'une épave qui tousse, on finit en comète en feu.
// ---- LA LONGUE LISTE : 30 PALIERS (2026-08-02) ----------------------------------------------
// COURBE DE COÛT — ⚠ un ratio 1,5× CONSTANT est impossible ici : 1,5^29 ≈ 100 000, le dernier palier
// coûterait des milliards de pièces. L'INTENTION est tenue autrement : l'écart entre deux paliers
// part à ×1,40 (les premiers tombent en quelques secondes — c'est l'accroche) et se détend vers ×1,09
// (l'endgame se mérite). IRRÉGULARITÉ VOLONTAIRE : quelques paliers arrivent plus tôt que la courbe
// ne le voudrait (9, 16, 23, 28) — le cadeau inattendu vaut mieux qu'une horloge suisse.
// Les 10 premiers paliers coûtent 145 pièces au total, là où l'ancienne liste en demandait 205 pour
// 9 paliers : le début est PLUS généreux, la liste est juste beaucoup plus longue derrière.
// `res` = réserve de nitro (2,0 → 3,6) : la capacité était documentée mais AUCUN palier ne la
// définissait, `.res||2` retombait donc toujours sur 2 — elle existe enfin. `cyl` = cylindres du
// modèle 3D (0 = plus de pistons du tout : turbines et réacteurs).
const ENGINE_TIERS=[
  {n:'MOTEUR ROUILLÉ',    d:'Il tousse, il fume, il prie. Mais il tourne.',        coins:0,   push:1.00,res:2.00,cyl:2, col:0x7a5a3c,flam:0x8a6a30},
  {n:'BICYLINDRE',        d:'Deux cylindres. Un qui pousse, un qui regarde.',      coins:5,   push:1.06,res:2.02,cyl:2, col:0x9fa8b0,flam:0xd08a3c},
  {n:'3 CYLINDRES',       d:'Deux qui toussent, un qui prie.',                     coins:12,  push:1.12,res:2.05,cyl:3, col:0x9a8f7a,flam:0xff8a30},
  {n:'4 EN LIGNE',        d:'Le premier moteur qui ne s\'excuse pas.',             coins:21,  push:1.19,res:2.08,cyl:4, col:0xa8a294,flam:0xffa040},
  {n:'4 SOUPAPES',        d:'Il respire enfin par le nez.',                        coins:33,  push:1.26,res:2.11,cyl:4, col:0xb4b0a2,flam:0xffb050},
  {n:'4 EN LIGNE TURBO',  d:'Le premier vrai souffle. Ça siffle.',                 coins:48,  push:1.34,res:2.15,cyl:4, col:0x6fd0ff,flam:0xffc23a},
  {n:'5 CYLINDRES',       d:'Un chiffre impair, un bruit inoubliable.',            coins:66,  push:1.42,res:2.19,cyl:5, col:0x5cc0f0,flam:0xffcc50},
  {n:'V6',                d:'La forme fait le son. Le son fait le reste.',         coins:88,  push:1.50,res:2.23,cyl:6, col:0x4a9cff,flam:0x8ad8ff},
  {n:'V6 BITURBO',        d:'Deux turbos, zéro patience.',                         coins:114, push:1.59,res:2.28,cyl:6, col:0x3f8cf5,flam:0x8ad8ff},
  {n:'BOXER À PLAT',      d:'Le centre de gravité au ras du bitume.',              coins:145, push:1.68,res:2.33,cyl:4, col:0x5a7ae0,flam:0x9ac0ff},
  {n:'V8 ATMO',           d:'Le grondement qui fait trembler la dalle.',           coins:181, push:1.78,res:2.38,cyl:8, col:0xff7a3c,flam:0xff5a2a},
  {n:'V8 COMPRESSÉ',      d:'Un compresseur, et la dalle demande grâce.',          coins:223, push:1.88,res:2.43,cyl:8, col:0xff8a48,flam:0xff6a30},
  {n:'V10',               d:'Dix cylindres, zéro argument.',                       coins:271, push:1.99,res:2.49,cyl:10,col:0xffa055,flam:0xff8038},
  {n:'V12',               d:'Douze cylindres qui hurlent à l\'unisson.',           coins:326, push:2.10,res:2.55,cyl:12,col:0xffd75e,flam:0xfff0a0},
  {n:'W12',               d:'Deux V6 mariés de force. Ça marche.',                 coins:389, push:2.21,res:2.61,cyl:12,col:0xffe27a,flam:0xfff4b8},
  {n:'V16',               d:'Seize. Parce que quinze, c\'était ridicule.',         coins:452, push:2.33,res:2.67,cyl:16,col:0xf2ecc8,flam:0xfff8d0},
  {n:'H16 F1',            d:'Seize cylindres en H. Interdit en course. Logique.',  coins:540, push:2.45,res:2.73,cyl:16,col:0xe8eef6,flam:0xbfe8ff},
  {n:'QUADRITURBO',       d:'Quatre escargots, une seule idée.',                   coins:630, push:2.58,res:2.80,cyl:8, col:0xd8e8ff,flam:0xa8d8ff},
  {n:'ROTATIF TRIPLE',    d:'Pas de pistons. Que du hurlement.',                   coins:731, push:2.71,res:2.87,cyl:3, col:0xc0e0ff,flam:0x90d0ff},
  {n:'TURBINE À GAZ',     d:'L\'hélicoptère a appelé. Il veut son moteur.',        coins:844, push:2.85,res:2.94,cyl:0, col:0xa8dcf0,flam:0x8ae0ff},
  {n:'TURBINE À PLASMA',  d:'Plus de pistons. Un souffle continu, bleu.',          coins:970, push:2.99,res:3.01,cyl:0, col:0x7dffec,flam:0x9fffe8},
  {n:'STATORÉACTEUR',     d:'Il n\'avale plus l\'air. Il l\'agresse.',             coins:1110,push:3.13,res:3.08,cyl:0, col:0x6affe0,flam:0x8affe8},
  {n:'PULSORÉACTEUR',     d:'Un battement par milliseconde. C\'est le tien qui suit.',coins:1265,push:3.28,res:3.15,cyl:0,col:0x8affc0,flam:0xb0ffd0},
  {n:'RÉACTEUR NUCLÉAIRE',d:'Tu roules avec un cœur de centrale sous le capot.',   coins:1420,push:3.44,res:3.23,cyl:0, col:0x9dff50,flam:0xd8ff7a},
  {n:'CŒUR À FUSION',     d:'Une petite étoile, sanglée sous le capot.',           coins:1624,push:3.60,res:3.31,cyl:0, col:0xd8ff60,flam:0xf0ff90},
  {n:'ANTIMATIÈRE',       d:'Un gramme. Un seul. Ne freine pas.',                  coins:1830,push:3.76,res:3.39,cyl:0, col:0xffe860,flam:0xfff2a0},
  {n:'MOTEUR À DISTORSION',d:'Ce n\'est plus toi qui avances. C\'est la route qui recule.',coins:2055,push:3.90,res:3.46,cyl:0,col:0xff9ad8,flam:0xffc0e8},
  {n:'COMÈTE',            d:'La caisse est EN FEU. Comme au premier jour.',        coins:2270,push:4.02,res:3.52,cyl:0, col:0xff3ec8,flam:0xff8a20},
  {n:'SUPERNOVA',         d:'Tu ne brûles plus le carburant. Tu brûles le ciel.',  coins:2566,push:4.12,res:3.56,cyl:0, col:0xff6ea0,flam:0xffb060},
  {n:'TROU NOIR',         d:'Plus rien ne s\'échappe. Même pas toi.',              coins:2854,push:4.20,res:3.60,cyl:0, col:0xf5f6fa,flam:0xffffff}
];
// SEUILS DES CAPACITÉS MOTEUR — nommés plutôt que semés en `engTier>=4` dans la boucle : la liste a
// triplé de longueur, des index nus se seraient décalés en silence (billets dès le 4e palier sur 30,
// soit presque tout de suite). Proportions d'origine conservées : 40 %, 50 %, 90 % de l'échelle.
const ENG_CAP={billets:12,aimant:15,comete:27};
/* LA VITESSE DE DÉPART (2026-10-19, Léo : « choisir le niveau du moteur auquel commencer, en tranches de 5 — six vitesses, dans le garage ;
   on peut toujours jouer en mode normal » · « progressif : en fonction des paliers qu'on débloque ; à la fin, le maximum disponible »).
   SIX CRANS : 1 = le départ normal (MOTEUR ROUILLÉ), puis les paliers 6 · 11 · 16 · 21 · 26 (index 5 · 10 · 15 · 20 · 25). LA FONCTION
   S'OUVRE AU PALIER 30 (Léo, même jour : « on débloque cette fonction seulement quand on a atteint le palier trente ») : le TROU NOIR atteint
   une fois en course (`SAVE.d.ex.eng`, le record de palier, versé à la fin de chaque partie) ouvre les six crans d'un coup ; avant, les six
   cases sont visibles sous CADENAS (son choix : « le joueur sait que ça existe »). Le code cousin ne l'ouvre PAS (Sacha, 20/10 : seul le palier 30 atteint, pour de vrai, la débloque). Le choix vit dans `SAVE.d.vdep` (0-5) ; il se pose au départ de chaque partie (resetGame, sous9 du 1er JOUER, la
   jade) À LA PLACE du moteur remis à zéro — pièces du palier comptées, réservoir de nitro plein —, AVANT que la piste se bâtisse : la 1re map
   a l'échelle de la vitesse choisie, et le DÉPART D'AVANCE se bâtit au même palier (prebDepCible). L'auto-école, le parc, la balade et le
   tout premier joueur (pas encore de permis) partent toujours du cran 1. Le moteur monte ensuite comme d'habitude. La grille (6 cases
   au-dessus du PLAY du garage) et l'étal du moteur soulevé (à gauche de la porte) : voir « LA VITESSE DE DÉPART AU GARAGE ». */
const VDEP_PAL=[0,5,10,15,20,25];
let VDEP_TOUT=false; // (banc) dbgVdep('tout') : tous les crans ouverts le temps d'une page, rien de sauvé
function vdepFonction(){try{return VDEP_TOUT||((SAVE.d.ex&&SAVE.d.ex.eng)|0)>=ENGINE_TIERS.length-1;}catch(e){return false;}} // (Léo, même jour : « on débloque cette fonction seulement quand on a atteint le palier trente ») le TROU NOIR atteint une fois → les six crans d'un coup · (2026-10-20, Sacha) et RIEN d'autre : le code cousin ne l'ouvre plus
function vdepOuvert(n){if(!(n>0))return true;if(n>=VDEP_PAL.length)return false;return vdepFonction();}
function vdepN(){let n=0;try{n=SAVE.d.vdep|0;}catch(e){}n=Math.max(0,Math.min(VDEP_PAL.length-1,n));while(n>0&&!vdepOuvert(n))n--;return n;} // un cran fermé (sauvegarde importée…) retombe sur le plus haut ouvert
function vdepPal(){try{if(TUTO.on||PARK.on||BALADE||!(SAVE.d.tuto||SAVE.d.permis))return 0;}catch(e){return 0;}return VDEP_PAL[vdepN()];}
function vdepPose(){const p=vdepPal();engTier=p;coinsGot=p?(ENGINE_TIERS[p].coins|0):0;if(p)nitroR=Math.max(nitroR,ENGINE_TIERS[p].res||2);} // le plein = le moteur (nitroCap)
