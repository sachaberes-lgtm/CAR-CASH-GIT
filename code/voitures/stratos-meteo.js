/* ===== LA STRATOS, STATION MÉTÉO (2026-10-22, Léo : « retouche stratos : ajoute plusieurs gadgets cyber-futuristes de prédiction météorologique sur la voiture, répartition abstrait / technique, voiture épique » · puis « design cohérent à la Stratos ») =====
   « Stratos » vient de la STRATOSPHÈRE : la berlinette lit le ciel. La caisse ne bouge pas (ni livrée, ni feux, ni jantes, ni profil) : on lui POSE du matériel dans SA langue — même palette (le blanc, le
   vert et le rouge de la livrée, l'or des jantes, le noir mat, le chrome, le blanc chaud des phares), mêmes facettes (cylindres à 8-12 pans, boîtes), même montage que la rampe de phares : une platine
   noire, un collier d'or, la pièce par-dessus. Deux moitiés :
   · LA TECHNIQUE (du vrai matériel, dur et lisible) : l'ANÉMOMÈTRE à trois coupelles blanche / verte / rouge (mât de gauche), la MANCHE À AIR tricolore (mât de droite) — deux mâts rayés vert / blanc /
     rouge, comme la livrée —, les deux RADARS DOPPLER qui tournent en sens contraire sur la plage arrière, les deux PARATONNERRES aux bouts du becquet, les deux CADRANS (baromètre, hygromètre) au bout
     de la rampe de phares, et l'ABRI À PERSIENNES (les persiennes du capot moteur) qui porte le gyroscope ;
   · L'ABSTRAIT (de la lumière) : le GYROSCOPE (trois anneaux d'or qui basculent sur trois axes, billes verte / blanche / rouge, et l'ICÔNE du jour au centre : soleil, nuage, pluie, orage — un carrousel
     au garage, la vraie météo de la zone en course : `LVL.pluie`, `LVL.brume`, `LVL.mer`, `LVL.nuit`), la BARRE DE PRÉVISION du becquet (une courbe de pression qui défile, vert → or → rouge), le
     SCANNER sous les phares et l'ARC qui claque d'un paratonnerre à l'autre.
   Tout le fixe est versé dans le kit de la caisse (zéro dessin de plus) ; ce qui BOUGE vit dans UN groupe (`BLING.anim`, voir ailes.js ; `userData.anime` pour la salle blanche) : dix dessins de plus,
   et aucune allocation par image (tampons préparés une fois : les pièces qui changent de forme réécrivent leurs sommets en place).
   `?stratos=ancien` = la Stratos d'avant · `dbgStratos({t,icone,vit,eclair,arc,avance,course,ancien})` fige un état pour les photos (rend l'état courant). */
var STRATOS_METEO=!/[?&]stratos=ancien\b/.test(location.search);
const STRATOS_M={force:{},etat:{t:0,vit:0,icone:0,k0:0,k1:0,arc:0}};
window.dbgStratos=function(o){if(o){if(o.ancien!=null)STRATOS_METEO=!o.ancien;Object.assign(STRATOS_M.force,o);}const e=STRATOS_M.etat,r=x=>Math.round(x*100)/100;return {meteo:STRATOS_METEO,t:r(e.t),vit:r(e.vit),icone:e.icone,eclair:[r(e.k0),r(e.k1)],arc:r(e.arc)};}; // {ancien:1} : la Stratos d'avant, à chaud (le banc AVANT | APRÈS)
function stratosPal(){return {
  o:{g:'c',c:0xe0b84a},                       // l'or des jantes
  V:{g:'l',c:0x20e06c},                       // le vert de la livrée, allumé
  A:{g:'l',c:0xffc02e},                       // l'or, allumé
  w:{g:'l',c:0xfff6dc},                       // le blanc chaud des phares, à blanc
  d:{g:'p',c:0x1b1c20,f:0},                   // laque noire (les pièces qui tournent)
  y:{g:'p',c:0xe0b84a,f:0}};}                 // laque dorée
var STRATOS_LAMPE=null;
function stratosLampe(){ /* la matière des pièces lumineuses qui BOUGENT : une lampe comme les autres (Basic, couleurs de sommets), mais SANS `userData.lp` — la passe des feux (feux-led.js) relit les couleurs des pièces « l » aux deux bouts de la caisse et en tire des coques de lueur FIXES : sur des barres qui montent et descendent, elles resteraient en l'air · `plq` : partagée, jamais libérée (voir buildCar) */
  if(!STRATOS_LAMPE){STRATOS_LAMPE=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});STRATOS_LAMPE.userData.plq=1;}return STRATOS_LAMPE;}
const STRATOS_Y=new THREE.Vector3(0,1,0),STRATOS_Z=new THREE.Vector3(0,0,1),STRATOS_Q=new THREE.Quaternion(),STRATOS_E=new THREE.Euler(),STRATOS_V=new THREE.Vector3(),STRATOS_M4=new THREE.Matrix4();
function stratosOrient(dx,dy,dz){ // les angles qui couchent un objet d'axe y sur (dx,dy,dz)
  STRATOS_Q.setFromUnitVectors(STRATOS_Y,STRATOS_V.set(dx,dy,dz).normalize());STRATOS_E.setFromQuaternion(STRATOS_Q,'XYZ');return [STRATOS_E.x,STRATOS_E.y,STRATOS_E.z];}
function stratosSegment(Q,k,a,b,w){ // une baguette carrée de a à b
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);if(l<1e-6)return;
  STRATOS_Q.setFromUnitVectors(STRATOS_Z,STRATOS_V.set(dx,dy,dz).normalize());STRATOS_E.setFromQuaternion(STRATOS_Q,'XYZ');
  Q.put(k,new THREE.BoxGeometry(w,w,l),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,STRATOS_E.x,STRATOS_E.y,STRATOS_E.z);}
function stratosFacettes(Q,geo,tons,x,y,z,rx,ry,rz,s){ // une pièce THREE versée en facettes LUISANTES, ombrées à la main (4 teintes selon l'inclinaison : rien n'éclaire une matière « l »)
  STRATOS_M4.compose(STRATOS_V.set(x||0,y||0,z||0),STRATOS_Q.setFromEuler(STRATOS_E.set(rx||0,ry||0,rz||0)),new THREE.Vector3(s||1,s||1,s||1));
  const g=geo.index?geo.toNonIndexed():geo;g.applyMatrix4(STRATOS_M4);const p=g.attributes.position.array;
  for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    const l=(nx*.42+ny*.74+nz*.52)*.5+.5,j=Math.max(0,Math.min(tons.length-1,Math.floor(l*tons.length)));
    Q.tri(tons[j],a,b,c);}
  g.dispose();if(g!==geo)geo.dispose();}
/* une boîte (douze triangles) écrite en place dans un tampon de sommets (P : positions, C : couleurs), au rang `o` ; rend le rang suivant. Aucune allocation : appelée à chaque image. */
const STRATOS_CX=[0,1,1,0,0,1,1,0],STRATOS_CY=[0,0,0,0,1,1,1,1],STRATOS_CZ=[0,0,1,1,0,0,1,1];          // les huit coins : 0-3 en bas, 4-7 en haut
const STRATOS_TRI=[0,1,2,0,2,3, 4,7,6,4,6,5, 0,4,5,0,5,1, 1,5,6,1,6,2, 2,6,7,2,7,3, 3,7,4,3,4,0];     // six faces, deux triangles chacune
function stratosBoite(P,C,o,xa,xb,ya,yb,za,zb,r,g,b){
  for(let k=0;k<36;k++){const c=STRATOS_TRI[k];
    P[o]=STRATOS_CX[c]?xb:xa;P[o+1]=STRATOS_CY[c]?yb:ya;P[o+2]=STRATOS_CZ[c]?zb:za;C[o]=r;C[o+1]=g;C[o+2]=b;o+=3;}
  return o;}
const STRATOS_VR=[1.1,-1.55,2.2],STRATOS_KI=[1.2,1.55,1.55,1.2];                                      // la vitesse de chaque anneau ; la taille de chaque pictogramme
const STRATOS_DIR=[1,0,0,-1,0,0,0,1,0,0,-1,0,.7,.7,0,-.7,.7,0];                                      // les six branches d'une étincelle
function stratosMeteo(K,P,G){
  const yT=G.yT,PI=Math.PI,F0=STRATOS_M.force;
  const zF=-.32,yF=yT(-.28)+.06+.0125;                                       // le centre et le dessus de l'aileron de toit
  const yP=yF+.30,yG=yF+.34;                                                  // le haut des mâts, le centre du gyroscope
  const PA=Object.assign({p:{g:'p',c:0xe9eae4,grad:[0xa7aab0,0xdcded9,0xf4f4f0]},v:{g:'p',c:0x006b2c,f:0},r:{g:'p',c:0xc4000e,f:0},
    k:{g:'m',c:0x121317},c:{g:'c',c:0xe9ecf0}},stratosPal());
  /* ————— LA TECHNIQUE, FIXE (dans le kit de la caisse) ————— */
  for(const sd of [-1,1]){const x=sd*.46;                                     // les deux mâts : sur les bouts de l'aileron de toit, au droit de ses jambes
    P.cyl('k',.055,.03,8,x,yF+.015,zF);P.cyl('V',.058,.004,10,x,yF+.0295,zF);P.cyl('o',.063,.012,8,x,yF+.036,zF);   // la platine noire, son filet vert allumé, son collier d'or
    P.cyl('v',.019,.088,6,x,yF+.086,zF);P.cyl('p',.019,.088,6,x,yF+.174,zF);P.cyl('r',.019,.088,6,x,yF+.262,zF);     // le mât rayé vert / blanc / rouge, comme la livrée
    P.cyl('o',.027,.014,6,x,yP-.004,zF);}                                     // et son chapeau d'or
  {const x=.46;P.cyl('o',.008,.09,6,x,yP,zF-.045,'z');                        // la manche à air : un bras et un cerceau d'or
   P.lathe('o',[[.064,-.006],[.078,-.006],[.078,.006],[.064,.006],[.064,-.006]],12,x,yP,zF-.09,'z');}
  P.box('p',.28,.085,.21,0,yF+.0425,zF);                                      // l'ABRI À PERSIENNES : un caisson blanc, des fentes noires comme sur le capot moteur
  for(let i=0;i<3;i++){const y=yF+.019+i*.024;
    for(const sd of [-1,1]){P.box('k',.006,.011,.17,sd*.14,y,zF);P.box('k',.22,.011,.006,0,y,zF+sd*.105);}}
  P.box('o',.29,.01,.22,0,yF+.09,zF);                                         // son chapeau d'or
  P.cyl('c',.032,.045,10,0,yF+.1175,zF,'y',.052);P.cyl('V',.055,.006,12,0,yF+.14,zF);   // le berceau du gyroscope et son anneau vert allumé
  P.cyl('A',.0035,.075,6,0,yG+.2225,zF);P.put('w',new THREE.OctahedronGeometry(.017,0),0,yG+.28,zF);   // l'antenne polaire : une pointe allumée
  P.box('V',1.02,.007,.007,0,yF-.005,zF-.105);                                // le filet vert sous le bord arrière de l'aileron de toit
  for(const sd of [-1,1]){const x=sd*.52,z=-1.42;                             // les pieds des radars, sur la plage arrière
    P.cyl('k',.058,.07,8,x,.935,z);P.cyl('V',.07,.005,12,x,.968,z);P.cyl('o',.066,.012,8,x,.977,z);P.cyl('k',.028,.05,8,x,1.005,z);}
  for(const sd of [-1,1]){const x=sd*.745,z=-1.84;                            // les paratonnerres : une platine, trois isolateurs chromés, une tige d'or, une pointe allumée
    P.box('k',.07,.035,.07,x,.915,z);for(let i=0;i<3;i++)P.cyl('c',.028-i*.002,.012,8,x,.945+i*.03,z);
    P.cyl('o',.012,.34,6,x,1.06,z);P.put('w',new THREE.OctahedronGeometry(.026,0),x,1.245,z);}
  P.sym(sd=>{const x=sd*.585,y=.83,z=1.33;                                    // les deux CADRANS, au bout de la rampe de phares : même lunette chrome, plus petits
    P.box('k',.15,.035,.06,sd*.575,.761,1.30);P.box('k',.03,.08,.04,x,yT(1.30)+.03,1.30);P.box('k',.06,.03,.05,x,.79,1.32);
    P.cyl('c',.058,.05,12,x,y,z,'z');P.cyl('K',.048,.012,12,x,y,z+.028,'z');
    for(let i=0;i<7;i++){const a=(-120+i*40)*PI/180;P.box('A',.007,.011,.005,x+Math.sin(a)*.036,y+Math.cos(a)*.036,z+.036,0,0,-a);}   // les graduations, en or : un blanc pur à l'avant ferait des coques de lueur la nuit (feux-led.js)
    const an=sd>0?.62:-.95;P.box('A',.006,.034,.004,x+Math.sin(an)*.016,y+Math.cos(an)*.016,z+.0375,0,0,-an);P.cyl('A',.006,.005,6,x,y,z+.0385,'z');});  // l'aiguille : beau temps à droite, humide à gauche
  /* ————— LE QUI BOUGE : un seul groupe ————— */
  const MG=K.add(new THREE.Group());MG.userData.bouge=1;
  const mat=g=>{if(g==='l')return stratosLampe();const L=K.mats||(K.mats={});return L[g]||(L[g]=lpMat(g,typeof FSTU==='object'&&FSTU?FSTU.on:undefined));};
  const verse=(Q,g9)=>{const gs=Q.done();for(const g in gs){const m=new THREE.Mesh(gs[g],mat(g));m.userData.lp=1;g9.add(m);}};
  // l'ANÉMOMÈTRE (mât de gauche) : un moyeu, trois bras, trois coupelles — blanche, verte, rouge
  const AN=new THREE.Group();AN.position.set(-.46,yP+.03,zF);MG.add(AN);
  {const Q=K.kit(PA);Q.cyl('d',.03,.06,8,0,0,0);Q.cyl('y',.016,.03,6,0,.04,0);
   for(let i=0;i<3;i++){const a=i/3*PI*2,c=Math.cos(a),s=Math.sin(a),e=stratosOrient(s,0,c);
     Q.box('d',.15,.014,.016,c*.075,0,-s*.075,0,a,0);
     Q.put(['p','v','r'][i],new THREE.CylinderGeometry(.05,.02,.085,8),c*.19,0,-s*.19,e[0],e[1],e[2]);}   // la coupelle, ouverte à l'envers de son mouvement
   verse(Q,AN);}
  // la MANCHE À AIR (mât de droite) : cinq bandes vert / blanc / rouge / blanc / vert, qui flotte ou pend selon l'allure
  const SK=new THREE.Group();SK.position.set(.46,yP,zF-.09);MG.add(SK);
  const NS=8,NR=6,skR=[.07,.062,.054,.046,.038,.03],skZ=[0,-.07,-.14,-.21,-.28,-.35];
  const skPos=new Float32Array((NR-1)*NS*6*3),skCol=new Float32Array((NR-1)*NS*6*3),skGeo=new THREE.BufferGeometry(),skC=new THREE.Color();
  const skCs=new Float32Array(NS),skSn=new Float32Array(NS),skX=new Float32Array(NR),skY=new Float32Array(NR),skW=new Float32Array(NR);
  for(let s=0;s<NS;s++){skCs[s]=Math.cos(s/NS*PI*2);skSn[s]=Math.sin(s/NS*PI*2);}
  {const bandes=[0x0b7a35,0xeeeee8,0xcc0a18,0xeeeee8,0x0b7a35];
   for(let b=0;b<NR-1;b++){skC.setHex(bandes[b]);for(let j=0;j<NS*6;j++){const o=(b*NS*6+j)*3;skCol[o]=skC.r;skCol[o+1]=skC.g;skCol[o+2]=skC.b;}}
   skGeo.setAttribute('position',new THREE.BufferAttribute(skPos,3));skGeo.setAttribute('color',new THREE.BufferAttribute(skCol,3));
   const sock=new THREE.Mesh(skGeo,mat('p'));sock.userData.lp=1;sock.frustumCulled=false;SK.add(sock);}
  const skPut=(o,r,s)=>{skPos[o]=skX[r]+skCs[s]*skR[r];skPos[o+1]=skY[r]+skSn[s]*skR[r];skPos[o+2]=skW[r];return o+3;};
  const skPose=(t,v)=>{ // v : 0 (arrêt, garage : elle ondule à peine) → 1 (en course : elle se tend et claque)
    const tend=.72+.28*v;
    for(let r=0;r<NR;r++){skX[r]=Math.sin(t*(2.6+5*v)-r*.95)*.011*r*(.5+v);
      skY[r]=-(1-tend)*.012*r*r+Math.sin(t*(2.1+4*v)-r*.75+1.3)*.009*r*(.5+v);skW[r]=skZ[r]*(.9+.1*tend);}
    let o=0;
    for(let b=0;b<NR-1;b++)for(let s=0;s<NS;s++){const s1=(s+1)%NS;
      o=skPut(o,b,s);o=skPut(o,b+1,s);o=skPut(o,b+1,s1);o=skPut(o,b,s);o=skPut(o,b+1,s1);o=skPut(o,b,s1);}
    skGeo.attributes.position.needsUpdate=true;skGeo.computeVertexNormals();};
  // les deux RADARS DOPPLER : une cuvette blanche (creux sombre, lèvre d'or), trois haubans, un cornet ; elle tourne, se penche de 32° vers le ciel
  const RD=[];
  for(const sd of [-1,1]){const g9=new THREE.Group();g9.position.set(sd*.52,1.03,-1.42);g9.rotation.y=PI-sd*.5;MG.add(g9);RD.push(g9);
    const Q=K.kit(PA),th=PI/2-32*PI/180,O=[0,.075,.045],Tr=(x,y,z)=>{const c=Math.cos(th),s=Math.sin(th);return [O[0]+x,O[1]+y*c-z*s,O[2]+y*s+z*c];};
    const ext=[[0,0],[.035,.004],[.07,.015],[.105,.033],[.13,.054],[.145,.074]],int=ext.map(p=>[p[0],p[1]+.02]);
    Q.box('d',.07,.035,.06,0,.0175,0);                                         // le palier
    Q.put('p',new THREE.LatheGeometry(ext.map(p=>new THREE.Vector2(p[0],p[1])),12),O[0],O[1],O[2],th,0,0);   // la cuvette
    Q.put('d',new THREE.LatheGeometry(int.map(p=>new THREE.Vector2(p[0],p[1])),12),O[0],O[1],O[2],th,0,0);   // son creux sombre
    Q.put('y',new THREE.LatheGeometry([new THREE.Vector2(.146,.074),new THREE.Vector2(.146,.094)],12),O[0],O[1],O[2],th,0,0);   // la lèvre d'or
    stratosSegment(Q,'d',[0,.035,0],Tr(0,-.012,0),.018);                       // la chape, du palier au dos de la cuvette
    for(let i=0;i<3;i++){const a=i/3*PI*2+PI/2;stratosSegment(Q,'d',Tr(Math.cos(a)*.146,.094,Math.sin(a)*.146),Tr(0,.145,0),.007);}   // les trois haubans
    {const p=Tr(0,.13,0);Q.put('y',new THREE.CylinderGeometry(.006,.017,.034,8),p[0],p[1],p[2],th,0,0);} // le cornet
    verse(Q,g9);}
  // le GYROSCOPE : trois anneaux d'or qui basculent chacun sur son axe (x, y, z), deux billes par anneau (vert, blanc, rouge) ; l'icône du jour au centre
  const GY=new THREE.Group();GY.position.set(0,yG,zF);MG.add(GY);
  const anneaux=[];
  for(const def of [{R:.17,ax:'y',bille:'V',bx:[0,0,1],tourne:'x'},{R:.145,ax:'z',bille:'w',bx:[1,0,0],tourne:'y'},{R:.12,ax:'x',bille:'L',bx:[0,1,0],tourne:'z'}]){
    const rg=new THREE.Group();GY.add(rg);const Q=K.kit(Object.assign({L:{g:'l',c:0xff2a3a}},PA));
    Q.lathe('A',[[def.R-.013,-.010],[def.R+.013,-.010],[def.R+.013,.010],[def.R-.013,.010],[def.R-.013,-.010]],18,0,0,0,def.ax);
    for(const sg of [-1,1])Q.put(def.bille,new THREE.OctahedronGeometry(.03,0),def.bx[0]*def.R*sg,def.bx[1]*def.R*sg,def.bx[2]*def.R*sg);
    verse(Q,rg);anneaux.push({g:rg,ax:def.tourne});}
  // l'ICÔNE : quatre pictogrammes versés dans UNE géométrie ; on n'en dessine qu'un (drawRange), qui pousse, tient, rentre
  const PI9={s0:0xb86a10,s1:0xe89a1c,s2:0xffc02e,s3:0xffe58a,n0:0x8fa3c8,n1:0xc3d0e8,n2:0xe9f0fb,n3:0xffffff,g0:0x0d7a3a,g1:0x15b455,g2:0x20e06c,g3:0x9bffc0,r0:0x8a0a16,r1:0xcc1424,r2:0xff2a3a,r3:0xff9aa0};
  const palI={};for(const k in PI9)palI[k]={g:'l',c:PI9[k]};
  const plages=[];let icone;
  {const Q=K.kit(palI),n9=()=>{const gs=Q.done();const n=gs.l?gs.l.attributes.position.count:0;for(const g in gs)gs[g].dispose();return n;};
   const TS=['s0','s1','s2','s3'],TN=['n0','n1','n2','n3'],TG=['g0','g1','g2','g3'],TR=['r0','r1','r2','r3'];
   let p0=0;
   stratosFacettes(Q,new THREE.IcosahedronGeometry(.036,0),TS);                                  // LE SOLEIL : un noyau, six rayons, huit petits
   for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const e=stratosOrient(d[0],d[1],d[2]);stratosFacettes(Q,new THREE.ConeGeometry(.017,.055,5),TS,d[0]*.062,d[1]*.062,d[2]*.062,e[0],e[1],e[2]);}
   for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){const e=stratosOrient(sx,sy,sz);stratosFacettes(Q,new THREE.ConeGeometry(.011,.034,4),TS,sx*.047,sy*.047,sz*.047,e[0],e[1],e[2]);}
   let p1=n9();plages.push([p0,p1-p0]);p0=p1;
   for(const b of [[-.04,-.012,0,.030],[0,.012,0,.042],[.044,-.006,0,.033],[.012,-.022,.014,.028],[-.016,-.018,-.016,.027]])stratosFacettes(Q,new THREE.IcosahedronGeometry(1,0),TN,b[0],b[1],b[2],0,0,0,b[3]);   // LE NUAGE : cinq bulles
   p1=n9();plages.push([p0,p1-p0]);p0=p1;
   stratosFacettes(Q,new THREE.IcosahedronGeometry(1,1),TG,0,-.018,0,0,0,0,.034);stratosFacettes(Q,new THREE.ConeGeometry(.0295,.062,7),TG,0,.030,0);   // LA PLUIE : une goutte et deux petites
   for(const sx of [-1,1]){stratosFacettes(Q,new THREE.IcosahedronGeometry(1,1),TG,sx*.056,-.042,0,0,0,0,.016);stratosFacettes(Q,new THREE.ConeGeometry(.0142,.03,6),TG,sx*.056,-.027,0);}
   p1=n9();plages.push([p0,p1-p0]);p0=p1;
   {const sh=new THREE.Shape();[[-.010,.085],[.040,.085],[.012,.022],[.048,.022],[-.036,-.088],[-.006,-.008],[-.046,-.008]].forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
    const g=new THREE.ExtrudeGeometry(sh,{depth:.032,bevelEnabled:false});g.translate(0,0,-.016);stratosFacettes(Q,g,TR);}                    // L'ORAGE : l'éclair, et deux étincelles
   for(const sx of [-1,1])stratosFacettes(Q,new THREE.OctahedronGeometry(.014,0),['n2','n3','n3','n3'],sx*.066,.05*sx,0);
   p1=n9();plages.push([p0,p1-p0]);
   const gs=Q.done();icone=new THREE.Mesh(gs.l,mat('l'));icone.userData.lp=1;icone.frustumCulled=false;GY.add(icone);}
  // la BARRE DE PRÉVISION : vingt et une barres sur le becquet, une courbe de pression qui défile
  const BR=new THREE.Group();BR.position.set(0,.88,-1.84);BR.rotation.x=-.30;MG.add(BR);
  const NB=21,PB=.0605,WB=.042,brPos=new Float32Array(NB*36*3),brCol=new Float32Array(NB*36*3),brGeo=new THREE.BufferGeometry();
  brGeo.setAttribute('position',new THREE.BufferAttribute(brPos,3));brGeo.setAttribute('color',new THREE.BufferAttribute(brCol,3));
  {const m=new THREE.Mesh(brGeo,mat('l'));m.userData.lp=1;m.frustumCulled=false;BR.add(m);}
  const CV=new THREE.Color(0x20e06c),CA=new THREE.Color(0xffc02e),CR=new THREE.Color(0xff2a3a),CB=new THREE.Color(),CW=new THREE.Color(0xfff6dc);
  const brPose=(t,v)=>{let o=0;const sc=(.5+.5*Math.sin(t*1.1*(1+v)))*(NB-1);
    for(let i=0;i<NB;i++){
      const w=.5+.5*Math.sin(i*.55-t*(1.5+2.5*v)),u=.5+.5*Math.sin(i*.21+t*.7),h=.018+.062*w*(.55+.45*u),x0=(i-(NB-1)/2)*PB;
      const q=Math.max(0,Math.min(1,(h-.018)/.062));if(q<.5)CB.copy(CV).lerp(CA,q*2);else CB.copy(CA).lerp(CR,(q-.5)*2);
      CB.lerp(CW,.55*Math.exp(-((i-sc)*(i-sc))/6));
      o=stratosBoite(brPos,brCol,o,x0-WB/2,x0+WB/2,.02,.02+h,-WB*.45,WB*.45,CB.r,CB.g,CB.b);}
    brGeo.attributes.position.needsUpdate=true;brGeo.attributes.color.needsUpdate=true;};
  // les ÉTINCELLES des paratonnerres (deux étoiles à six branches qui claquent à tour de rôle), l'ARC qui saute de l'un à l'autre et le SCANNER du bouclier avant : sinon invisibles (réduits à un point)
  const NA=10,NC=11,OA=2*6*2*3*3,OC=OA+NA*2*6*3;                                                     // l'arc : deux rubans de dix tronçons ; OC : où commencent les cellules du scanner dans le tampon
  const EG=new THREE.BufferGeometry(),ePos=new Float32Array(OC+NC*36*3),eCol=new Float32Array(ePos.length);
  EG.setAttribute('position',new THREE.BufferAttribute(ePos,3));EG.setAttribute('color',new THREE.BufferAttribute(eCol,3));
  {const m=new THREE.Mesh(EG,mat('l'));m.userData.lp=1;m.frustumCulled=false;MG.add(m);}
  const aJ0=new Float32Array(NA+1),aJ1=new Float32Array(NA+1),aX=new Float32Array(NA+1),aY=new Float32Array(NA+1),aZ=new Float32Array(NA+1),CS=new THREE.Color(),CD=new THREE.Color(0x06271a);
  const sPose=(t,v)=>{let o=OC;const sp=(.5+.5*Math.sin(t*1.7*(1+v)))*(NC-1);                       // un point de lumière qui va et vient sous les phares, comme un balayage de radar
    for(let i=0;i<NC;i++){const b=Math.exp(-((i-sp)*(i-sp))/1.3),x0=(i-(NC-1)/2)*.12;
      CS.copy(CD).lerp(CV,b).lerp(CW,b*b*.55);
      o=stratosBoite(ePos,eCol,o,x0-.047,x0+.047,.292,.308,G.LF+.012,G.LF+.02,CS.r,CS.g,CS.b);}};
  const eTri=(o,ax,ay,az,bx,by,bz,cx,cy,cz,r,g,b)=>{ePos[o]=ax;ePos[o+1]=ay;ePos[o+2]=az;ePos[o+3]=bx;ePos[o+4]=by;ePos[o+5]=bz;ePos[o+6]=cx;ePos[o+7]=cy;ePos[o+8]=cz;
    for(let j=0;j<9;j+=3){eCol[o+j]=r;eCol[o+j+1]=g;eCol[o+j+2]=b;}return o+9;};
  let tqArc=-1;
  const ePose=(k0,k1,ka,tq)=>{let o=0;
    for(let s=0;s<2;s++){const k=s?k1:k0,cx=(s?1:-1)*.745,cy=1.245,cz=-1.84,L=.14*k,W=.014*k;
      for(let j=0;j<6;j++){const dx=STRATOS_DIR[j*3],dy=STRATOS_DIR[j*3+1],dz=STRATOS_DIR[j*3+2],px=-dy,py=dx;                // une pointe : un triangle de chaque côté de l'axe, vu de face et de profil
        o=eTri(o,cx+dx*L,cy+dy*L,cz+dz*L,cx+px*W,cy+py*W,cz,cx-px*W,cy-py*W,cz,1,.96,.78);
        o=eTri(o,cx+dx*L,cy+dy*L,cz+dz*L,cx,cy,cz+W,cx,cy,cz-W,1,.96,.78);}}
    if(ka>0&&tq!==tqArc){tqArc=tq;for(let i=0;i<=NA;i++){aJ0[i]=(Math.random()-.5)*.13;aJ1[i]=(Math.random()-.5)*.09;}}   // l'arc change de chemin 25 fois par seconde
    for(let j=0;j<=NA;j++){const u=j/NA,e=Math.sin(u*PI);aX[j]=-.745+1.49*u;aY[j]=1.245+(aJ0[j]+.04)*e*ka;aZ[j]=-1.84+aJ1[j]*e*ka;}
    const w=.016*ka;                                                                                   // l'arc : deux rubans en croix (vus de derrière et de dessus), du bout gauche au bout droit
    for(let i=0;i<NA;i++){const ax=aX[i],ay=aY[i],az=aZ[i],bx=aX[i+1],by=aY[i+1],bz=aZ[i+1];
      o=eTri(o,ax,ay-w,az,bx,by-w,bz,bx,by+w,bz,1,.95,.7);o=eTri(o,ax,ay-w,az,bx,by+w,bz,ax,ay+w,az,1,.95,.7);}
    for(let i=0;i<NA;i++){const ax=aX[i],ay=aY[i],az=aZ[i],bx=aX[i+1],by=aY[i+1],bz=aZ[i+1];
      o=eTri(o,ax,ay,az-w,bx,by,bz-w,bx,by,bz+w,1,.95,.7);o=eTri(o,ax,ay,az-w,bx,by,bz+w,ax,ay,az+w,1,.95,.7);}
    EG.attributes.position.needsUpdate=true;EG.attributes.color.needsUpdate=true;};
  // L'ANIMATION : une horloge, une allure (arrêt → course → nitro), l'icône du jour, les étincelles et l'arc
  const E=STRATOS_M.etat;
  let T=F0.t!=null?F0.t:0,vit=F0.vit!=null?F0.vit:0,ic=F0.icone!=null?F0.icone%4:0,tIc=.35,tE0=1.2+Math.random()*2,tE1=2.5+Math.random()*3,tA=3+Math.random()*3,k0=0,k1=0,ka=0;
  const rouleur=()=>{if(STRATOS_M.force.course!=null)return !!STRATOS_M.force.course;try{return !!(started&&!gameOver&&!garageOn);}catch(e){return false;}};   /* (banc) dbgStratos({course:1}) : comme en course */
  const nitro=()=>{try{return !!nitroOn;}catch(e){return false;}};
  const kmh=()=>{try{return Math.min(1.4,(loop._spK||0)/800);}catch(e){return 0;}};
  const ease=u=>u<=0?0:u>=1?1:1-Math.pow(1-u,3);                                                   // sortie douce
  const anime=dt=>{dt=Math.min(dt||0,.1);const F=STRATOS_M.force;T+=dt;
    const cible=F.vit!=null?F.vit:rouleur()?.35+.5*kmh()+(nitro()?.35:0):0;vit+=(cible-vit)*Math.min(1,dt*2.5);if(F.vit!=null)vit=F.vit;
    const v=Math.min(1,vit),a=1+vit*2.4;
    AN.rotation.y+=dt*(1.7+9*vit);
    RD[0].rotation.y+=dt*1.2*a;RD[1].rotation.y-=dt*1.2*a;
    for(let i=0;i<3;i++)anneaux[i].g.rotation[anneaux[i].ax]+=dt*STRATOS_VR[i]*a;
    // l'icône. EN COURSE : la météo de la zone (pluie → goutte, pluie de nuit → orage, brume ou mer de nuages → nuage, sinon soleil) ; elle pousse quand la zone change.
    // AU GARAGE : un carrousel, 2,4 s chacune — elle pousse, tient (elle tourne, elle ondule), rentre ; l'allure l'accélère
    let veut=-1;if(F.icone==null&&rouleur()){try{veut=LVL.pluie>.35?(LVL.nuit>.5?3:2):(LVL.brume>.35||LVL.mer>.35)?1:0;}catch(e){veut=-1;}}
    if(F.icone!=null)ic=F.icone%4;
    else if(veut>=0){if(ic!==veut){ic=veut;tIc=0;}tIc=Math.min(tIc+dt,1);}
    else{if(tIc>2.4)tIc%=2.4;tIc+=dt*(1+.6*vit);if(tIc>=2.4){tIc-=2.4;ic=(ic+1)%4;}}
    const u=F.icone!=null?1:veut>=0?Math.min(1,tIc/.3):Math.min(1,tIc/.3)*Math.min(1,(2.4-tIc)/.3);
    icone.geometry.setDrawRange(plages[ic][0],plages[ic][1]);icone.scale.setScalar(Math.max(.001,(F.icone!=null?1:ease(u))*STRATOS_KI[ic]));icone.rotation.y=T*1.3;icone.position.y=Math.sin(T*2.2)*.004;
    skPose(T,v);brPose(T,v);
    // les étincelles : un claquement bref, une retombée (0,22 s), puis un long silence ; l'arc : tous les 4 à 9 s, 0,22 s, les deux pointes claquent avec lui
    if(F.eclair!=null||F.arc!=null){k0=k1=F.eclair!=null?F.eclair:0;ka=F.arc!=null?F.arc:0;}else{
      tE0-=dt;tE1-=dt;tA-=dt;k0=Math.max(0,k0-dt/.22);k1=Math.max(0,k1-dt/.22);ka=Math.max(0,ka-dt/.22);
      if(tE0<=0){k0=1;tE0=1.4+Math.random()*3.2-vit*.8;}if(tE1<=0){k1=1;tE1=1.4+Math.random()*3.2-vit*.8;}
      if(tA<=0){ka=1;k0=k1=1;tA=4+Math.random()*5-vit*1.5;}}
    ePose(k0*k0,k1*k1,ka>0?Math.min(1,ka*3):0,Math.floor(T*25));sPose(T,v);
    E.t=T;E.vit=vit;E.icone=ic;E.k0=k0;E.k1=k1;E.arc=ka;};
  anime(0);MG.userData.anime=anime;
  if(F0.avance){for(let i=0,n=Math.round(F0.avance*30);i<n;i++)anime(1/30);}                        // (banc) dbgStratos({avance:s}) : la caisse naît s secondes plus tard
  if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);
}
