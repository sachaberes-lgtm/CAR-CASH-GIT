/* ===== LA VOÛTE (2026-11-13, Sacha : « la route pourrait être torsadée et longer les parois des canyons par moments, jouer sur le côté sans dessus dessous ») =====
   Le relief du canyon est un TERRAIN (une hauteur par point) : il ne sait pas faire un plafond. La route ne peut donc passer à l'envers que dans une STRUCTURE — un TUBE de grès cuit autour d'elle,
   comme la mine, l'arche ou le tunnel d'arrivée. Ici le tube TOURNE AVEC LA DALLE : sa section (un rectangle arrondi, une super-ellipse de 44 m de demi-largeur et 26 m de demi-hauteur, son fond à 2 m
   sous la surface de la route) est fixe dans le repère de la route — quand la dalle fait un tour complet (cyVouBank : 0 → 360°, 10 s de route), le tube tourne autour d'elle : on roule sur le fond,
   sur une paroi, au plafond, sur l'autre paroi, et de nouveau sur le fond. Le chemin, lui, reste droit (c'est le « coucher de la dalle » : la route ne dérive pas).
   · `cyVoute([s0, s1])` bâtit le maillage (cuit, sans éclairage : couleurs de sommet — le dedans est sombre, les deux bouches éclairées, le dehors au soleil) : une peau intérieure, une peau
     extérieure à 14 m, un anneau de façade à chaque bout. Il se pose dans CY.grp (libéré avec le reste) et se relit dans CY.vouT = {s0, s1}.
   · `cyVouteHeurt(p, V)` : en vol, la roche tue — un point dont la section (g > 1) sort du creux sans sortir de la coque (g < 5,5). Les deux bouches sont ouvertes (rien à s < s0 ni à s > s1).
   · le gabarit `tonneau` de cyBatitG écarte le relief (parois à 170 m, rivière à 120 m) et coupe le plan de roche des murs (S.mu = 0) ; `?sans=canyonvoute` retire la pièce.
   Console : `dbgCanyonVoute()` (où, combien) · `dbgCanyonVoute('test')` (les points de la section contre le creux) · `dbgCanyonVoute('vue', k)` (une photo de l'intérieur, au tiers k/4 du tube). */
const CY_VOU={A:44,B:26,hc:20,p:4,ep:14,R:40,G2:5.5,m:null};
/* (2026-11-15, le vérificateur : « le tube rouge saturé, une zigzag noire du haut de l'image jusqu'à la route » — g1 soir s6000, g4 pluie s6000) REPRODUIT : depuis la première passe, le tube
   prenait le CARRÉ des strates (l'albédo du relief) mais pas ses deux planchers : un lit sombre (lie-de-vin, ardoise) au carré tombait vers 0,01 et sortait noir sur toute la hauteur,
   et les lits clairs, au carré sans plancher de vert et de bleu, sortaient rouge pur (violet vif sous la pluie). Le tube reprend les planchers de la roche (cyFS) : vert ≥ 0,5 et bleu
   ≥ 0,42 × la luminance, puis les lits sombres relevés (pow(0,42/L, 0,75), comme l'ombre de la roche) et un plancher de luminance (0,15) : l'étalonnage écrase au noir tout
   canal sous ~0,09, et la lumière du tube (cyVouLum, 0,4-0,6) × la bouche (~0,5) y menait les lits sombres. Le carré lui-même était de trop : la roche le compense par son
   soleil et son rebond, que le tube (sans éclairage, à l'ombre) n'a pas → exposant 1,15, saturation 0,62. ESSAYÉ en photo (g1 soir et g4 pluie s6000, g11 nuit et orage
   s10150/10250) : carré + planchers → la zigzag reste noire ; exposant 1 → plus de noir mais rouge vif ; 1,15/0,62 → brun-rouge et violet de la roche, la nuit violet sombre
   lisible (ni beige ni noir). Aucun coût : les couleurs sont cuites une fois au tirage. `?sans=cyvoualb` = le tube de la première passe. */
const CY_VOUALB=!/[?&]sans=([^&]*,)?cyvoualb(,|&|$)/.test(location.search);
/* (2026-11-15, le critique du tour 1 : « des programmes de shader en plus, non attribués ») ATTRIBUÉ : clés de programme comparées une à une à v1596 (g6 soir ordi, g12 orage
   téléphone, g11 nuit) ; le seul programme propre au canyon en plus était celui du tube (`customProgramCacheKey` « cyVouIn » : la lumière du dedans = celle du dehors + aIn ×
   le filet de phares). Les autres écarts (Phong, Lambert, Sprite des étiquettes de pouvoirs…) changent d'un passage à l'autre, des deux côtés : l'état de la page, pas la carte.
   TROUVÉ en le retirant : depuis le passage de `aIn` en Uint8 normalisé (passe 2), le dedans valait 1/255 et non 1 — le filet de phares du dedans était déjà ÉTEINT (photos :
   deux passages du programme cyVouIn identiques entre eux, et identiques au tube sans programme). Le programme ne servait donc plus à rien : le tube reprend la matière blanche à
   couleurs de v1596 (son programme est déjà celui d'autres objets) — même image, 0 programme et 0 appel en plus, l'attribut aIn en moins (1 octet par sommet, ~66 Ko à g11).
   `?cyvouin=1` : le filet de phares du dedans d'origine (reprise 2), CUIT dans les couleurs du dedans par météo (il ne bouge pas pendant une course : LVL.nuit et le soleil de
   l'heure ; seul le « boom » l'éteint), MESURÉ à g11 s10150 (1 + 0,03 × uPhC / la lumière du tube) : le dedans de nuit +27 %, plus clair — une affaire de DA, à juger par Sacha.
   `?sans=cyvouin1` = le programme cyVouIn (avec son aIn à 1/255). */
const CY_VOUIN1=!/[?&]sans=([^&]*,)?cyvouin1(,|&|$)/.test(location.search),CY_VOUIN=/[?&]cyvouin=1\b/.test(location.search)?{nuit:[1.268,1.265,1.167],orage:[1.090,1.060,1.029],pluie:[1.028,1.022,1.014]}:{};
/* (2026-11-14, Sacha : « canyon est très buggé dans les textures ») LE TUBE SUIT LA LUMIÈRE. MESURÉ (graine 11, nuit et orage) : la bouche et la lèvre sortaient crème et jaune, comme en
   plein jour, contre une roche presque noire — la matière est sans éclairage, ses couleurs cuites prenaient l'octet des strates SANS le carré que fait le relief (bien plus pâle), le
   « dehors au soleil » était cuit à 0,70-1, et aucune météo n'entrait dans le calcul. Les sommets portent maintenant l'ALBÉDO du relief (le carré, la saturation ×1,32, le plancher de
   vert et de bleu : cyFS) × l'occlusion cuite (le dedans sombre, les bouches claires), et `material.color` porte la LUMIÈRE de l'heure, posée chaque image par canyonTick (soleil,
   ciel, sol, un peu des phares) : aucun programme en plus. Le DEDANS a sa matière à lui (le même programme, un appel de dessin de plus par tube) : la lumière du dehors, un fond qui ne
   s'éteint pas, et les phares la nuit et sous l'orage — sinon il tombait au noir. La couleur est un peu moins saturée que la paroi au soleil (0,86 autour de la luminance) : le tube
   est presque toujours à l'ombre, où le relief tire vers l'ardoise. Le damier du dedans (±15 % de hasard par facette, une rangée sur deux à 0,78) se lisait comme une texture
   manquante : ±8 %, rangées à 0,88. `?sans=cytex` = le tube d'avant. */
/* (2026-11-14, reprise après les vérificateurs : « la bouche du tube reste beige clair la nuit ») MESURÉ (graine 11, s 10150) : la lumière du tube valait 0,34/0,37/0,52 la nuit
   (dedans 0,47/0,50/0,66) contre 0,60/0,44/0,48 au soir — la nuit presque aussi claire que le soir. Les coupables : le fond fixe de 0,08 et les PHARES (uPhC ≈ 2,2 la nuit,
   ×0,04 dehors, ×0,10 dedans : la moitié de la lumière), alors que la roche ne les reçoit que dans leur cône. La lumière suit maintenant l'OMBRE de la roche (cyFS : le ciel
   et le sol, le plancher soleil/ciel/rebond) plus une part de soleil, sans fond fixe, et un filet de phares. Au soir elle ne bouge presque pas ; la nuit elle tombe de ~40 %.
   Le tube d'avant la V3 (?sans=canyonv3 : couleurs non cuites au carré) garde sa matière blanche. */
function cyVouLum(U){const m=CY_VOU.m;if(!m||!CY_TEX||!CY_V3.on)return;const S=U.uSunC.value,K=U.uSky.value,G=U.uGnd.value,P=U.uPhC.value,B=U.uBnc.value;
  const r=(G.r*.4+K.r*.6)*.9+S.r*.30+K.r*.22+B.r*.18+P.r*.015,g=(G.g*.4+K.g*.6)*.9+S.g*.30+K.g*.22+B.g*.18+P.g*.015,b=(G.b*.4+K.b*.6)*.9+S.b*.30+K.b*.22+B.b*.18+P.b*.015;
  m.color.setRGB(r,g,b);CY_VOU.uPhI.value.setRGB(P.r*.03,P.g*.03,P.b*.03);}
/* (2026-11-14, l'optimisation du canyon : le dedans avait sa matière, UN APPEL DE DESSIN DE PLUS par tube, au-dessus du budget de Sacha) UN SEUL MAILLAGE, UNE SEULE MATIÈRE : chaque sommet
   porte `aIn` (1 au dedans) et la lumière du dedans = celle du dehors + aIn × le filet de phares (uPhI) — la même couleur qu'avec deux matières, en un appel. */
CY_VOU.uPhI={value:new THREE.Color(0,0,0)};
function cyVouMat(){if(CY_VOU.m)return CY_VOU.m;const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:true});m.dispose=function(){};CY_VOU.m=m;
  if(CY_TEX&&CY_V3.on&&!CY_VOUIN1){m.onBeforeCompile=function(sh){const a='vec4 diffuseColor = vec4( diffuse, opacity );';if(sh.fragmentShader.split(a).length!==2){console.warn('canyon : tube, ancre absente');return;}
    sh.uniforms.uPhI=CY_VOU.uPhI;sh.vertexShader='attribute float aIn;\nvarying float vIn;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n\tvIn=aIn;');
    sh.fragmentShader='uniform vec3 uPhI;\nvarying float vIn;\n'+sh.fragmentShader.split(a).join('vec4 diffuseColor = vec4( diffuse+uPhI*vIn, opacity );');};m.customProgramCacheKey=function(){return 'cyVouIn';};}
  return m;}
/* la section du creux : g(lat, up) ≤ 1 dedans (lat : en travers, up : le long de la normale de la dalle, 0 = la surface de la route) */
function cyVouG(lat,up){const V=CY_VOU;return Math.pow(Math.abs(lat)/V.A,V.p)+Math.pow(Math.abs(up-V.hc)/V.B,V.p);}
/* (V3, la supervision après les photos : « la bouche ressemble à un autocollant flou… l'intérieur est un flou olive et gris ») LE TUBE EN ROCHE : des FACETTES (une couleur par
   case : les gros pixels des parois), la couleur des STRATES à la hauteur de chaque case, des ANNEAUX (deux rangées sur quatre plus sombres : la vitesse et le sens du roulis
   se lisent), une LUEUR chaude qui monte vers la sortie (le soleil y entre), et à chaque bouche une LÈVRE de roche en relief — un collier déchiqueté qui déborde de la façade,
   plus épais en haut (le linteau), dans l'ombre vers le dedans. Une seule matière, sans lumière : les couleurs sont cuites. */
function cyVouteV3(iv){
  const V=CY_VOU,len=iv[1]-iv[0];if(!(len>60)||!CY.grp)return null;
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},step=Math.max(9,len/220),n=Math.ceil(len/step),R=V.R,P=[],C=[],st=[0,0,0],TW=[1,.80,.50];
  const hsh=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  const ray=[];for(let k=0;k<R;k++){const a=2*Math.PI*k/R,c=Math.cos(a),s=Math.sin(a);ray.push([c,s,1/Math.pow(Math.pow(Math.abs(c),V.p)+Math.pow(Math.abs(s),V.p),1/V.p)]);}
  const pt=(lat,up,fw)=>[F9.p.x+F9.b.x*lat+F9.n.x*up+F9.t.x*fw,F9.p.y+F9.b.y*lat+F9.n.y*up+F9.t.y*fw,F9.p.z+F9.b.z*lat+F9.n.z*up+F9.t.z*fw];
  const anneau=(i,m)=>{frameAt(iv[0]+len*i/n,F9);const o=[];for(let k=0;k<R;k++){const ry=ray[k],j=m?(hsh(i*.37+1,k*1.3)-.5)*5:0,A=V.A+m*V.ep+j,B=V.B+m*V.ep+j;o.push(pt(A*ry[2]*ry[0],V.hc+B*ry[2]*ry[1],0));}return o;};
  const KIN=CY_TEX&&CY_VOUIN1?(CY_VOUIN[LVL.cur&&LVL.cur.meteo]||null):null; /* le rapport dedans/dehors cuit (voir CY_VOUIN) */
  const AI=[],quad=(a,b,c,d,col,dd)=>{if(dd&&KIN)col=[Math.min(1,col[0]*KIN[0]),Math.min(1,col[1]*KIN[1]),Math.min(1,col[2]*KIN[2])];P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(let q=0;q<6;q++){C.push(col[0],col[1],col[2]);AI.push(dd?1:0);}}; /* dd : une face du DEDANS (sa lumière : aIn) */
  const met9=LVL.cur&&LVL.cur.meteo,JR=CY_TEX?(T2_JOUR[met9]!=null?T2_JOUR[met9]:.8):1; /* le jour qui entre par les bouches, selon l'heure (cuit, comme le tunnel d'arrivée) : la nuit, une bouche n'est pas plus claire que le fond */
  const TX=CY_TEX,K0=TX?.55:.20,H0=TX?.92:.84,H1=TX?.16:.3,WK=TX?.5:1,BD=TX?.88:.78,TL=[.85,.62,.40];
  const AL=CY_VOUALB,SA=AL?.62:.86,EX=AL?1.15:2,KL=.68,LF=.15;
  const teinte=TX?(y,br,w)=>{cyT2Strate(y,st);let r=Math.pow(st[0],EX),g=Math.pow(st[1],EX),b=Math.pow(st[2],EX);
      if(AL){const L0=r*.3+g*.55+b*.15;g=Math.max(g,L0*.5);b=Math.max(b,L0*.42);r=Math.max(r,L0*.6);} /* le plancher de vert et de bleu de la roche */
      const m=r*.3+g*.55+b*.15;r=m+(r-m)*SA;g=m+(g-m)*SA;b=m+(b-m)*SA;
      if(AL){const k=Math.pow(.42/Math.min(.42,Math.max(m,.10)),.75)*KL;r=Math.max(r,(r+m)*.5*k);g=Math.max(g,(g+m)*.5*k);b=Math.max(b,(b+m)*.5*k);const m2=r*.3+g*.55+b*.15;if(m2<LF){const f=LF/Math.max(m2,.005);r=Math.min(1,r*f);g=Math.min(1,g*f);b=Math.min(1,b*f);}} /* les lits sombres relevés, comme l'ombre de la roche */ /* l'albédo du relief (le carré), un peu moins saturé : l'ombre */
      return [Math.min(1,(r*(1-w)+TL[0]*w)*br),Math.min(1,(g*(1-w)+TL[1]*w)*br),Math.min(1,(b*(1-w)+TL[2]*w)*br)];}
    :(y,br,w)=>{cyT2Strate(y,st);const o=[0,0,0];for(let c=0;c<3;c++){const v=st[c]*br;o[c]=Math.min(1,v*(1-w)+TW[c]*br*1.25*w);}return o;};
  let A0=[anneau(0,0),anneau(0,1)];const Z0=A0;
  for(let i=1;i<=n;i++){const A1=[anneau(i,0),anneau(i,1)],d0=len*(i-.5)/n,jour=Math.exp(-Math.min(d0,len-d0)/70),lueur=Math.exp(-(len-d0)/190),bande=((i>>1)&1)?BD:1;
    for(let k=0;k<R;k++){const k1=(k+1)%R,h=hsh(i,k);
      quad(A0[0][k],A1[0][k],A1[0][k1],A0[0][k1],teinte((A0[0][k][1]+A1[0][k1][1])/2,(K0+(.70*jour+.30*lueur)*JR)*(H0+H1*h)*bande,Math.min(.8,lueur*.9)*WK),TX); /* le dedans */
      quad(A0[1][k],A0[1][k1],A1[1][k1],A1[1][k],teinte((A0[1][k][1]+A1[1][k1][1])/2,TX?.86+.14*h:.70+.3*h,0));} /* le dehors, au soleil */
    A0=A1;}
  const ZN=A0;
  for(const e of [0,1]){const iE=e?n:0,rin=e?ZN[0]:Z0[0],sgT=e?1:-1,NR=4,rows=[rin];frameAt(iv[0]+len*iE/n,F9); /* LA LÈVRE : quatre rangées de cases du creux au collier déchiqueté, en avant de la
       bouche, plus épaisse en haut (le linteau), plus sombre vers le dedans (l'ombre s'y enfonce) — d'une seule rangée, ses longs quartiers alternés se lisaient comme un soleil */
    for(let r9=1;r9<=NR;r9++){const u=r9/NR,o=[];for(let k=0;k<R;k++){const ry=ray[k],lin=ry[1]>.35?(12+14*(ry[1]-.35))*u:0,j=(hsh(iE*7+r9,k)-.5)*(3+6*u),A=V.A+(V.ep+12)*u+lin+j,B=V.B+(V.ep+12)*u+lin+j;
        o.push(pt(A*ry[2]*ry[0],V.hc+B*ry[2]*ry[1],sgT*(u*(4+hsh(iE+3,k)*6)+(hsh(iE+r9*3,k)-.5)*3)));}rows.push(o);}
    for(let r9=0;r9<NR;r9++){const a=rows[r9],b=rows[r9+1];for(let k=0;k<R;k++){const k1=(k+1)%R;quad(a[k],b[k],b[k1],a[k1],teinte((a[k][1]+b[k1][1])/2,(.34+.40*(r9+1)/NR)*(.86+.24*hsh(iE*13+r9,k)),0));}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',cyVouCoul(C));if(CY_TEX&&!CY_VOUIN1)g.setAttribute('aIn',new THREE.BufferAttribute(new Uint8Array(AI),1,true)); /* (2026-11-15) un octet par sommet (normalisé : 0 ou 1) au lieu de quatre */g.computeBoundingSphere();
  if(typeof memLibere==='function')memLibere(g); /* (2026-11-15, le budget mémoire de Sacha) la copie JavaScript du tube (positions, couleurs, aIn : ~1,26 Mo à g11) est jetée une fois envoyée
     à la puce, comme les géométries propres aux autres pistes (palier-appareil.js) : rien ne la relit (la collision du tube est analytique, cyVouteHeurt). Elle payait les bornes
     du relief (+262 Ko) côté processeur. `?memoire=ancien` = gardée. */
  const m=new THREE.Mesh(g,cyVouMat());m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);
  return {s0:iv[0],s1:iv[1],tri:P.length/9};}
/* (2026-11-15, l'optimisation du canyon : la mémoire) les couleurs du tube en entiers de 16 bits normalisés (6 octets par sommet au lieu de 12 ; un pas de 1/65 535, invisible) quand elles tiennent
   toutes entre 0 et 1 (le tube V3 : 0,06-0,98 mesuré) ; sinon en flottants comme avant. ~400 Ko de moins par tube, ce qui paie l'attribut aIn. */
function cyVouCoul(C){for(let i=0;i<C.length;i++)if(!(C[i]>=0&&C[i]<=1))return new THREE.Float32BufferAttribute(C,3);const u=new Uint16Array(C.length);for(let i=0;i<C.length;i++)u[i]=Math.round(C[i]*65535);return new THREE.BufferAttribute(u,3,true);}
function cyVoute(iv){
  if(CY_V3.on)return cyVouteV3(iv);
  const V=CY_VOU,len=iv[1]-iv[0];if(!(len>60)||!CY.grp)return null;
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},step=Math.max(10,len/200),n=Math.ceil(len/step),R=V.R,P=[],C=[],I=[];
  const hsh=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  const ray=[];for(let k=0;k<R;k++){const a=2*Math.PI*k/R,c=Math.cos(a),s=Math.sin(a);ray.push([c,s,1/Math.pow(Math.pow(Math.abs(c),V.p)+Math.pow(Math.abs(s),V.p),1/V.p)]);}
  const roche=[.70,.44,.29],st9=[0,0,0],V3T=typeof CY_V3!=='undefined'&&CY_V3.on; /* le grès : un ocre rosé — (V3) la COULEUR DES STRATES du canyon à la hauteur de chaque sommet (cyT2Strate, comme le relief) : orange uni, le tube se lisait comme un objet posé là */
  for(let i=0;i<=n;i++){frameAt(iv[0]+len*i/n,F9);const d0=len*i/n,jour=Math.exp(-Math.min(d0,len-d0)/55);
    for(let k=0;k<R;k++){const ry=ray[k],bande=.9+.14*Math.sin(i*.55+ry[1]*5+hsh(Math.floor(i/3),k>>2)*3);
      for(let m=0;m<2;m++){const A=V.A+m*V.ep,B=V.B+m*V.ep,lat=A*ry[2]*ry[0],up=V.hc+B*ry[2]*ry[1],b=m?(.78+.3*hsh(i,k))*bande:(.30+.62*jour)*(.88+.24*hsh(i,k))*bande; /* dedans : sombre, clair aux bouches ; dehors : au soleil */
        const y9=F9.p.y+F9.b.y*lat+F9.n.y*up;P.push(F9.p.x+F9.b.x*lat+F9.n.x*up,y9,F9.p.z+F9.b.z*lat+F9.n.z*up);const rc=V3T?cyT2Strate(y9,st9):roche,k9=V3T?.82:1;C.push(Math.min(1,rc[0]*b*k9),Math.min(1,rc[1]*b*k9),Math.min(1,rc[2]*b*k9));}}}
  const id=(i,k,m)=>(i*R+(k%R))*2+m;
  for(let i=0;i<n;i++)for(let k=0;k<R;k++)for(let m=0;m<2;m++){const a=id(i,k,m),b9=id(i,k+1,m),c=id(i+1,k+1,m),d=id(i+1,k,m);I.push(a,b9,c,a,c,d);}
  for(const e of [0,n])for(let k=0;k<R;k++){const a=id(e,k,0),b9=id(e,k+1,0),c=id(e,k+1,1),d=id(e,k,1);I.push(a,b9,c,a,c,d);} /* l'anneau de façade : du creux à la coque */
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyVouMat());m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);
  return {s0:iv[0],s1:iv[1],tri:I.length/3};}
const CY_VF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},CY_VD=new THREE.Vector3();
function cyVouteHeurt(p,V){const S=CY.S;if(!V||!S)return false;
  const i0=Math.max(0,Math.floor(V.s0/S.ds)-1),i1=Math.min(S.n-1,Math.ceil(V.s1/S.ds)+1);let bi=-1,bd=1e18;
  for(let i=i0;i<=i1;i++){const d=(p.x-S.x[i])**2+(p.y-S.y[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>130*130)return false;const s9=bi*S.ds;if(s9<V.s0||s9>V.s1)return false;
  frameAt(s9,CY_VF);CY_VD.subVectors(p,CY_VF.p);const g=cyVouG(CY_VD.dot(CY_VF.b),CY_VD.dot(CY_VF.n));return g>1&&g<CY_VOU.G2;}
window.dbgCanyonVoute=function(k,a,c){ /* c : le numéro du tube (la phrase du mur en pose un par route, la voûte d'avant un) */
  if(!CY.on)return 'pas de canyon';
  if(k==='vueS'){ /* (V3) dbgCanyonVoute('vueS', s) : l'œil du joueur à l'abscisse s de la piste — derrière la caisse, dans le repère de la DALLE (sur la paroi, tête en bas) */
    if(started&&!gameOver&&!paused)togglePause();const F8={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(Math.max(0,Math.min(L-1,+a||0)),F8);
    camera.position.copy(F8.p).addScaledVector(F8.n,9).addScaledVector(F8.t,-34);camera.up.copy(F8.n);camera.lookAt(F8.p.x+F8.t.x*120+F8.n.x*6,F8.p.y+F8.t.y*120+F8.n.y*6,F8.p.z+F8.t.z*120+F8.n.z*6);camera.fov=60;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    return {s:Math.round(+a||0),ny:+F8.n.y.toFixed(2),rouliDeg:Math.round(Math.atan2(F8.b.y,F8.n.y)*57.2958)};}
  const VL=CY.vouT||[],V=VL[Math.max(0,Math.min(VL.length-1,c|0))];if(!V)return {vou:CY.vou||null,tube:false};
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},mid=(V.s0+V.s1)/2,q=new THREE.Vector3();
  const pt=(s9,lat,up)=>{frameAt(s9,F9);return q.copy(F9.p).addScaledVector(F9.b,lat).addScaledVector(F9.n,up).clone();};
  if(k==='test'){const r={};for(const c of [['centre',0,2],['bord',26,2],['haut',0,40],['dans le mur',60,20],['sous la dalle',0,-12],['hors du tube',0,200]])r[c[0]]=cyVouteHeurt(pt(mid,c[1],c[2]),V);return r;}
  if(k==='vue'){ /* dbgCanyonVoute('vue', j) : l'œil dans la dalle, au quart j/4 du tube, regard vers l'avant — la section tourne avec le roulis, la caméra aussi */
    if(started&&!gameOver&&!paused)togglePause();const s9=V.s0+(V.s1-V.s0)*Math.max(0,Math.min(1,(a==null?2:a)/4));frameAt(s9,F9);
    camera.position.copy(F9.p).addScaledVector(F9.n,9).addScaledVector(F9.t,-34);camera.up.copy(F9.n);camera.lookAt(F9.p.x+F9.t.x*120+F9.n.x*6,F9.p.y+F9.t.y*120+F9.n.y*6,F9.p.z+F9.t.z*120+F9.n.z*6);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    return {s:Math.round(s9),ny:+F9.n.y.toFixed(2),rouliDeg:Math.round(Math.atan2(F9.b.y,F9.n.y)*57.2958)};}
  /* l'état : les abscisses, le triangle, et le profil du roulis (ny de la dalle tous les dixièmes du tube) */
  const roulis=[];for(let j=0;j<=10;j++){frameAt(V.s0+(V.s1-V.s0)*j/10,F9);roulis.push(+F9.n.y.toFixed(2));}
  return {vou:CY.vou,tube:true,tubes:VL.map(function(v){return [Math.round(v.s0),Math.round(v.s1)];}),s0:Math.round(V.s0),s1:Math.round(V.s1),long:Math.round(V.s1-V.s0),tri:V.tri,nY:roulis};};
