/* ================= L'IDENTITÉ DE CHAQUE MOTEUR (2026-10-26, Léo : « chaque moteur aura une identité à lui — aquatique,
   élémentaire, animaux, des références familières avec une touche d'originalité ; toujours une intensité plus grande : le
   premier a de la gueule, le 30e mille fois plus » ; « même plus drôle, des rêves, n'importe ») =================
   QUATRE CHAPITRES : le VIVANT (2-11) → la PUISSANCE (12-16 : électrique, grenade, vitrail, soleil, roquette) → les LÉGENDES (17-25) → l'AU-DELÀ (26-30 : alien, porte de distorsion, comète, naissance, l'infini). Chaque palier a sa
   PALETTE (`TH30` remplace la laque et la flamme du palier) et sa SIGNATURE (`theme30`), posée sur le moteur — ⚠ RÈGLE : chaque
   pièce TOUCHE le moteur (aucun bout en l'air), aucune matière transparente hors du verre voulu. */
const TH30=[null,
 [0x1f8a6a,0x9affc8],[0x1fb8b0,0xc8a8ff],[0x2a1c14,0xffb030],[0x9a6430,0xffc040],[0x4a6680,0x9ad8ff],   // 2 scarabée · 3 colibri · 4 scorpion · 5 hibou · 6 requin
 [0xff6a3c,0xffb070],[0xff5f8a,0xffe0ea],[0x15171c,0xd8f4ff],[0x5f7d3c,0xd8ff90],[0xd8282a,0xffa030],   // 7 étoile de mer · 8 corail · 9 orques · 10 tortue · 11 roquette
 [0x1f4aff,0x9af0ff],[0x4f5f2a,0xffb030],[0x2a3a8a,0xffe08a],[0xffb000,0xfff0a0],[0x1f5a3a,0xff5030],   // 12 électrique · 13 grenade · 14 vitrail · 15 soleil · 16 dragon
 [0xc0201e,0xffd070],[0x3a2a6a,0x6affd8],[0xd9a441,0x5a8aff],[0xff4a1a,0xffc040],[0x13a8a8,0x8affff],   // 17 pagode · 18 kraken · 19 sphinx · 20 phénix · 21 atlantide
 [0x7a8aa0,0x8ad8ff],[0xb81a3a,0xff6a80],[0x16161c,0xff4a14],[0xffc030,0xfff6c0],[0x10a86e,0xb0ffe0],   // 22 lance d'Odin · 23 cœur battant · 24 dragon cosmique · 25 Hélios · 26 alien
 [0xb4bccb,0xbfe8ff],[0x9ad8ff,0xff9a40],[0xff6ea0,0xffd0f0],[0xf5f6fa,0xffd780]];                        // 27 ouroboros · 28 Halley · 29 naissance · 30 l'infini
function th30Kit(E,i){const t=TH30[i];return t?Object.assign({},E,{col:t[0],flam:t[1]}):E;}
/* ===== LES OUTILS DE L'ARTISTE 4 (paliers 22-29 : cœur, dragon, Hélios, alien, ouroboros, comète, naissance, l'infini) — préfixe h4_ =====
   h4_loft : une SCULPTURE par sections — chaque section est un anneau (superellipse) dans le plan YZ à la position x ; reliées, elles
             donnent un crâne, un museau, un pétale, un fuseau. p = carrure (1 losange · 2 ellipse · 4 presque carré). Fermé aux deux bouts.
   h4_tubeV: un tube à rayon VARIABLE le long d'une courbe (serpent, corne, veine, aorte) ; rf(t) = rayon de 0 à 1.
   h4_pose : pose une pièce construite en +x (avant) / +y (haut) sur une direction et un haut donnés. */
function h4_loft(secs,n,cap){
  n=n||10;const pos=[],idx=[];
  for(const s of secs){const p=s.p||2,e=2/p;
    for(let j=0;j<n;j++){const t=j/n*2*Math.PI,c=Math.cos(t),sn=Math.sin(t);
      pos.push(s.x,(s.y||0)+Math.sign(sn)*Math.pow(Math.abs(sn),e)*(sn>=0?s.hu:s.hd),(s.z||0)+Math.sign(c)*Math.pow(Math.abs(c),e)*s.w);}}
  for(let k=0;k<secs.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c2=(k+1)*n+j,d=(k+1)*n+(j+1)%n;idx.push(a,c2,b,b,c2,d);}
  if(cap!==false){const s0=secs[0],s1=secs[secs.length-1],i0=pos.length/3;
    pos.push(s0.x,s0.y||0,s0.z||0);pos.push(s1.x,s1.y||0,s1.z||0);
    for(let j=0;j<n;j++){idx.push(i0,(j+1)%n,j);const o=(secs.length-1)*n;idx.push(i0+1,o+j,o+(j+1)%n);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function h4_tubeV(pts,rf,seg,rad,cap){
  const cu=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'centripetal');seg=seg||24;rad=rad||6;
  const fr=cu.computeFrenetFrames(seg,false),pos=[],idx=[];
  for(let i=0;i<=seg;i++){const t=i/seg,P=cu.getPointAt(t),N=fr.normals[i],Bn=fr.binormals[i],r=Math.max(.0008,rf(t));
    for(let j=0;j<rad;j++){const a=j/rad*2*Math.PI,c=Math.cos(a)*r,s=Math.sin(a)*r;pos.push(P.x+N.x*c+Bn.x*s,P.y+N.y*c+Bn.y*s,P.z+N.z*c+Bn.z*s);}}
  for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*rad+j,b=i*rad+(j+1)%rad,c2=(i+1)*rad+j,d=(i+1)*rad+(j+1)%rad;idx.push(a,c2,b,b,c2,d);}
  if(cap){const P0=cu.getPointAt(0),P1=cu.getPointAt(1),i0=pos.length/3;pos.push(P0.x,P0.y,P0.z,P1.x,P1.y,P1.z);
    for(let j=0;j<rad;j++){idx.push(i0,(j+1)%rad,j);const o=seg*rad;idx.push(i0+1,o+j,o+(j+1)%rad);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  g.userData.cu=cu;return g;
}
function h4_pose(B,geo,mat,p,fw,up,sc){
  const x=fw.clone().normalize(),z=new THREE.Vector3().crossVectors(x,up).normalize(),y=new THREE.Vector3().crossVectors(z,x),
    e=new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z),'XYZ');
  B.add(geo,mat,p.x,p.y,p.z,e.x,e.y,e.z,sc||1,sc||1,sc||1);
}

/* LE DRAGON NOIR v2 : la tête est SCULPTÉE par sections (crâne large, arcades, museau qui s'effile, mâchoire ouverte sur la braise),
   crocs inégaux (les canines), narines de braise cerclées d'or, deux grandes cornes annelées, fraise d'épines, crête d'or */
function h4_dragon(K,g){
  const B=bat10();B.f=true;B.plat();const noir=K.col,or=K.or,P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const sec=(x,y,w,hu,hd,p,z)=>({x:x,y:y,w:w,hu:hu,hd:hd,p:p,z:z||0});
  const crane=[sec(0,.12,.20,.20,.20,2.6),sec(.10,.14,.33,.31,.25,3.2),sec(.36,.14,.37,.34,.24,3.2),sec(.58,.10,.29,.26,.17,3),sec(.82,.08,.22,.18,.13,3),sec(1.06,.06,.20,.15,.11,3),sec(1.22,.06,.22,.14,.10,3),sec(1.31,.06,.13,.08,.06,2.5)];
  const at=(k,x)=>{for(let j=0;j<crane.length-1;j++){const a=crane[j],b=crane[j+1];if(x>=a.x&&x<=b.x){const t=(x-a.x)/(b.x-a.x);return a[k]+(b[k]-a[k])*t;}}return crane[crane.length-1][k];};
  B.add(h4_loft(crane,10),noir,0,0,0);
  // la mâchoire inférieure, ouverte de 24° autour de la charnière
  const hx=.28,hy=-.10,th=-.42,cs=Math.cos(th),sn=Math.sin(th),jp=(lx,ly,lz)=>P(hx+lx*cs-ly*sn,hy+lx*sn+ly*cs,lz);
  const mach=[sec(-.10,0,.20,.10,.10,3),sec(.12,0,.30,.09,.12,3),sec(.45,0,.25,.07,.10,3),sec(.80,0,.18,.06,.08,3),sec(1.00,.01,.15,.07,.07,3),sec(1.08,.02,.09,.05,.05,2.5)];
  const jw=(x)=>{for(let j=0;j<mach.length-1;j++){const a=mach[j],b=mach[j+1];if(x>=a.x&&x<=b.x){const t=(x-a.x)/(b.x-a.x);return {w:a.w+(b.w-a.w)*t,hu:a.hu+(b.hu-a.hu)*t};}}return {w:.1,hu:.05};};
  B.add(h4_loft(mach,10),noir,hx,hy,0,0,0,th);
  // le palais et la langue de braise
  B.add(h4_loft([sec(.55,-.045,.15,.012,.012,2),sec(1.15,-.05,.16,.012,.012,2)],6),K.glow,0,0,0);
  B.add(h4_loft([sec(.20,.07,.13,.02,.02,2),sec(.80,.075,.10,.02,.02,2)],6),K.glow,hx,hy,0,0,0,th);
  // les crocs : canines en tête, rangée qui s'use vers le fond
  const tl=[.09,.10,.17,.12,.10,.085,.07];
  for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<7;k++){const x=1.16-k*.10,yb=.06-at('hd',x)+.012,zz=sd*at('w',x)*.80,l=tl[k];
    vers10(B,cone10(.026+l*.12,l,6),K.blanc,P(x,yb,zz),D(.18,-1,sd*.08),1);
    const lx=.22+k*.115,q=jw(lx),pp=jp(lx,q.hu-.01,sd*q.w*.78);
    const d2=new THREE.Vector3(-sn,cs,sd*.08).normalize();   // « vers le haut » de la mâchoire, tournée avec elle
    vers10(B,cone10(.022+(k===5?.015:0),.07+(k%3===1?.05:0),6),K.blanc,pp,d2,1);}
  // les arcades, les yeux de braise sous leur voûte
  for(let sd=-1;sd<=1;sd+=2){
    B.add(h4_loft([sec(.14,.44,.09,.06,.05,2.4,sd*.25),sec(.40,.46,.11,.07,.06,2.4,sd*.29),sec(.66,.36,.07,.045,.035,2.4,sd*.20)],8),K.noir,0,0,0);
    B.add(G10.box,K.noir,.43,.345,sd*.318,0,0,0,.02,.075,.012);   // la pupille : une fente verticale
    B.add(G10.sph,K.glow,.42,.33,sd*.305,0,0,0,.07,.034,.03);
    B.add(h4_loft([sec(.10,.22,.08,.04,.04,2,sd*.32),sec(.30,.18,.10,.05,.05,2,sd*.33),sec(.50,.16,.07,.03,.03,2,sd*.27)],6),K.lame,0,0,0);   // la joue
    // les cornes : annelées, qui balaient vers l'arrière
    B.add(h4_tubeV([[.30,.40,sd*.26],[.20,.62,sd*.36],[-.02,.80,sd*.50],[-.34,.86,sd*.66]],t=>(.085*Math.pow(1-t,.85)+.004)*(1+.16*Math.sin(t*44)),36,6,true),or,0,0,0);
    B.add(h4_tubeV([[.26,.04,sd*.34],[.08,-.02,sd*.50],[-.12,.06,sd*.66]],t=>(.05*(1-t)+.004)*(1+.14*Math.sin(t*30)),20,6,true),noir,0,0,0);
    corne(P(.55,-.30,sd*.22),D(-.3,-1,sd*.5),.035,.20,noir);
    const nx=1.20;B.add(G10.sph,K.glow,nx,.17,sd*.09,0,0,0,.032,.022,.032);B.add(new THREE.TorusGeometry(.046,.011,5,10),or,nx,.185,sd*.09,Math.PI/2,0,0);
    // la fraise : une nageoire d'épines derrière la joue
    B.add(plan10([[.10,.30],[-.10,.58],[-.02,.30],[-.28,.46],[-.12,.20],[-.36,.20],[-.12,.04],[-.30,-.14],[-.02,-.08],[.10,-.12]],.03,.006),K.lame,.04,0,sd*.26,0,sd*.38,0);
  }
  // la crête d'or sur le museau et le crâne, l'arête de l'or sur le nez
  B.add(h4_tubeV([[.50,.06+at('hu',.50)+.006,0],[.80,.06+at('hu',.80)+.006,0],[1.04,.06+at('hu',1.04)+.006,0],[1.26,.075,0]],t=>.012,12,4),or,0,0,0);
  for(let k=0;k<5;k++)vers10(B,cone10(.055-k*.006,.26-k*.03,6),or,P(.58-k*.12,.06+.28-k*.012,0),D(-.4,1,0),1);
  corne(P(1.06,.06+at('hu',1.06)-.02,0),D(-.35,1,0),.05,.20,or);                        // la corne du nez
  const hg=new THREE.Group();B.fin(hg);hg.scale.setScalar(2.0);hg.position.set(.30,-.02,0);g.add(hg);
  function corne(p,d,r,l,m){vers10(B,cone10(r,l,8),m,p,d,1);}
}

/* LE CŒUR BATTANT v2 : le moteur EST un cœur — deux ventricules de rubis facettés (la pointe devant), les oreillettes, l'aorte qui
   s'arque et plonge dans le tube-colonne, l'artère pulmonaire, la veine cave, les coronaires d'or dans le sillon ; les veines
   s'enroulent le long des anneaux jusqu'à la tuyère */
function h4_coeur(K,g){
  const B=bat10();B.f=true;B.plat();
  const boule=(m,x,y,z,sx,sy,sz)=>B.add(G10.sph,m,x,y,z,0,0,0,sx,sy||sx,sz||sx),P=(x,y,z)=>new THREE.Vector3(x,y,z),sec=(x,y,w,hu,hd,p,z)=>({x:x,y:y,w:w,hu:hu,hd:hd,p:p,z:z||0});
  B.add(h4_loft([sec(.20,.06,.28,.32,.30,2.6,.07),sec(.46,.08,.44,.50,.46,2.3,.07),sec(.76,.04,.41,.45,.40,2.3,.06),sec(1.00,-.03,.29,.30,.28,2.3,.05),sec(1.16,-.07,.15,.15,.14,2.2,.04),sec(1.27,-.10,.03,.03,.03,2,.03)],10),K.col,0,0,0);
  B.add(h4_loft([sec(.22,.10,.24,.32,.30,2.6,-.23),sec(.46,.10,.33,.44,.38,2.3,-.23),sec(.72,.06,.28,.34,.30,2.3,-.22),sec(.94,0,.18,.19,.18,2.2,-.18),sec(1.06,-.04,.05,.05,.05,2,-.15)],10),K.colD,0,0,0);
  boule(K.col,.30,.46,.32,.22,.12,.16);boule(K.colD,.26,.44,-.36,.26,.14,.18);                         // les deux oreillettes
  const aorte=t=>.115-.02*t,pulm=t=>.088-.014*t;
  B.add(h4_tubeV([[.56,.38,.02],[.58,.74,.0],[.40,.98,.0],[.10,.94,0],[-.14,.66,0],[-.28,.32,0],[-.42,.10,0]],aorte,28,8,true),K.col,0,0,0);    // l'aorte : elle s'arque et plonge dans la colonne
  B.add(h4_tubeV([[.62,.30,-.22],[.52,.62,-.30],[.24,.72,-.32],[-.04,.54,-.26],[-.30,.20,-.10]],pulm,24,7,true),K.colD,0,0,0);                 // l'artère pulmonaire
  B.add(h4_tubeV([[.40,-.36,-.06],[.16,-.56,-.04],[-.16,-.46,0],[-.44,-.12,0]],t=>.09-.01*t,22,7,true),K.colD,0,0,0);                             // la veine cave
  B.add(h4_tubeV([[.60,.46,-.02],[.86,.45,-.04],[1.06,.30,-.05],[1.22,.04,-.05]],t=>.016,16,5),K.or,0,0,0);                                          // la coronaire, dans le sillon
  B.add(h4_tubeV([[.56,.30,.48],[.82,.20,.47],[1.02,.04,.34],[1.14,-.06,.18]],t=>.014,16,5),K.or,0,0,0);
  B.add(new THREE.TorusGeometry(.53,.022,5,24),K.or,.43,.05,0,0,PI10/2,0);                              // le sillon auriculo-ventriculaire, cerclé d'or
  boule(K.glow,1.28,-.10,0,.05);                                                                          // la pointe qui bat
  for(let sd=-1;sd<=1;sd+=2)B.add(G10.box,K.glow,.70,.04,sd*.485,0,0,sd*.18,.46,.014,.014);          // deux filets de braise sur le flanc
  const hg=new THREE.Group();B.fin(hg);hg.scale.setScalar(1.3);hg.position.set(-.12,0,0);g.add(hg);
}

/* HÉLIOS v2 : le tokamak devient le SOLEIL-DIEU — un masque d'or aux deux visages (un de chaque côté, le regard braise) tenu dans l'anneau
   par six rayons, et la couronne héraldique : douze rayons-flammes qui ondulent, entre eux douze lances droites */
function h4_helios(B,K){
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize(),TL=.55;
  B.cadre(0,TL);                                                                                    // tout ce qui suit est dans le plan de l'anneau
  for(let k=0;k<12;k++){const a=k/12*2*PI10,pts=[],n=9;
    for(let j=0;j<=n;j++){const x=.82*j/n,c=.075*Math.sin(x*6.2),w=.095*Math.pow(1-j/(n+.6),.85);pts.push([x,c+w]);}
    for(let j=n;j>=0;j--){const x=.82*j/n,c=.075*Math.sin(x*6.2),w=.095*Math.pow(1-j/(n+.6),.85);pts.push([x,c-w]);}
    B.add(plan10(pts,.034,.007),K.or,Math.cos(a)*.80,Math.sin(a)*.80,0,0,0,a);                       // une flamme d'or qui ondule
    const b=a+PI10/12;vers10(B,cone10(.055,.72,6),k%2?K.blanc:K.chrome,P(Math.cos(b)*.82,Math.sin(b)*.82,0),D(Math.cos(b),Math.sin(b),0),1);}   // la lance droite entre deux flammes
  for(let k=0;k<6;k++){const a=k/6*2*PI10+PI10/6;BXg(B,K.or,Math.cos(a)*.39,Math.sin(a)*.39,0,0,0,a,.24,.05,.055);}   // six rayons qui tiennent le masque à l'anneau
  for(let sz=-1;sz<=1;sz+=2){const ry=sz>0?-PI10/2:PI10/2;
    B.add(tourX([[.001,.062],[.14,.074],[.30,.050],[.37,.0]],28),K.or,0,0,0,0,ry,0);                // le disque d'or, bombé
    B.add(new THREE.TorusGeometry(.355,.018,5,32),K.chrome,0,0,sz*.012);
    vers10(B,cone10(.050,.15,4),K.or,P(0,-.03,sz*.06),D(0,0,sz),1);                                  // le nez
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.noir,sd*.135,.115,sz*.078,0,0,sd*.30,.17,.026,.028);                                     // le sourcil
      B.add(G10.sph,K.glow,sd*.135,.062,sz*.072,0,0,0,.062,.020,.020);                                   // l'œil de braise
      BXg(B,K.noir,sd*.062,-.135,sz*.074,0,0,sd*-.45,.075,.020,.024);}                                  // les coins de la bouche
    BXg(B,K.noir,0,-.150,sz*.074,0,0,0,.13,.022,.026);
  }
  B.plat();
}

/* L'ALIEN v2 — technologie étrangère : la soucoupe est une CRÉATURE. Sa verrière abrite un œil immense (iris de braise, pupille en fente)
   qui regarde devant ; une écriture inconnue court sur le plateau ; des organes lumineux ceinturent la jante ; sous le ventre un anneau
   d'aspiration et cinq tentacules à nœuds qui se terminent en bulbes de lumière */
function h4_alien(B,K){
  const sec=null,P=(x,y,z)=>new THREE.Vector3(x,y,z);
  B.add(tourY10([[.001,-.11],[.50,-.07],[.95,-.015],[1.06,0],[.90,.04],[.62,.075],[.34,.10],[.001,.115]],24),K.col,0,-.02,0);             // la coque : une lentille à 24 facettes
  B.add(new THREE.TorusGeometry(1.05,.034,6,48),K.chrome,0,-.02,0,PI10/2,0,0);                                                          // la jante de chrome
  for(let k=0;k<12;k++){const a=(k+.5)/12*2*PI10;B.add(G10.sph,k%3?K.glow:K.blanc,Math.cos(a)*1.065,-.02,Math.sin(a)*1.065,0,0,0,.05,.04,.05);}   // les organes de jante
  // l'écriture : 20 glyphes de 1 à 3 traits qui ceinturent le plateau
  for(let k=0;k<20;k++){const a=k/20*2*PI10,v=(k*7)%4,c=Math.cos(a),sn=Math.sin(a),r0=.80,y0=.04,rr=-a,tg=-a+PI10/2;
    const bar=(dr,dt,len,tang)=>BXg(B,K.glow,c*(r0+dr)-sn*dt,y0,sn*(r0+dr)+c*dt,0,tang?tg:rr,0,len,.016,.020);
    if(v===0){bar(0,0,.12,false);bar(.05,.0,.05,true);}
    else if(v===1){bar(0,-.03,.10,false);bar(0,.03,.10,false);}
    else if(v===2){bar(0,0,.12,true);B.add(G10.sph,K.glow,c*(r0+.08)-sn*0,y0,sn*(r0+.08),0,0,0,.02,.016,.02);}
    else{bar(-.03,0,.07,false);bar(.03,.03,.07,true);bar(.03,-.03,.07,true);}}
  // la verrière et l'œil (incliné : il regarde devant ET vers le haut, pour se lire de côté comme de dessus)
  B.add(new THREE.TorusGeometry(.62,.035,6,32),K.chrome,0,.075,0,PI10/2,0,0);
  const ye=.31,er=.235,tt=.30;                                                                                                            // DEUX yeux, tournés vers l'avant et le dehors : de côté, l'un te regarde toujours
  for(let sd=-1;sd<=1;sd+=2){const ez=sd*.255,ex=.10,bt=-sd*.85;
    B.add(G10.sph,K.blanc,ex,ye,ez,0,0,0,er,er,er);
    B.add(new THREE.SphereGeometry(er*1.012,20,7,0,2*PI10,0,.95).rotateZ(-PI10/2),K.glowC,ex,ye,ez,0,bt,tt);                                  // l'iris
    B.add(new THREE.SphereGeometry(er*1.03,16,6,0,2*PI10,0,.52).rotateZ(-PI10/2),K.glow,ex,ye,ez,0,bt,tt);                                  // son anneau de braise
    B.add(new THREE.SphereGeometry(er*1.05,12,5,0,2*PI10,0,.20).rotateZ(-PI10/2),K.noir,ex,ye,ez,0,bt,tt,1,2.4,.5);}                         // la pupille en fente
  const verre=new THREE.MeshPhongMaterial({color:K.verre.color,transparent:true,opacity:.17,shininess:300,specular:0xffffff,envMap:envTex,reflectivity:.55,combine:THREE.MixOperation,depthWrite:false});   // une vraie verrière claire : on voit l'œil
  B.add(new THREE.SphereGeometry(.62,24,10,0,PI10*2,0,PI10/2),verre,0,.075,0);
  // le dessous : l'anneau d'aspiration, ses rayons, et cinq tentacules à nœuds
  B.add(new THREE.TorusGeometry(.42,.04,6,32),K.chrome,0,-.115,0,PI10/2,0,0);
  B.add(tourY10([[.001,0],[.38,0]],24),K.glow,0,-.125,0);
  for(let k=0;k<5;k++){const a=k/5*2*PI10+.3,c=Math.cos(a),sn=Math.sin(a),sg=k%2?1:-1;
    const pts=[[c*.62,-.08,sn*.62],[c*.82,-.38,sn*.82],[c*.62+sn*.12*sg,-.74,sn*.62-c*.12*sg],[c*.86,-1.0,sn*.86],[c*.74,-1.22,sn*.74]];
    B.add(h4_tubeV(pts,t=>(.062*(1-t)+.014)*(1+.22*Math.sin(t*34)),34,6,true),K.colD,0,0,0);
    B.add(G10.sph,K.glow,pts[4][0],pts[4][1]-.02,pts[4][2],0,0,0,.07,.07,.07);}
}

/* L'OUROBOROS D'ARGENT v2 (Léo : « un moteur argenté en boucles infinies ») — le NŒUD EST le serpent : un trèfle (torus-knot 2,3) de chrome
   écaillé, qui s'amincit en queue, s'épaissit au cou, et dont la TÊTE sculptée (crâne à arcades, museau effilé, mâchoire ouverte,
   deux longs crocs, cornes et crête d'or, yeux de glace) mord la pointe de sa propre queue. La nacelle traverse le nœud, tenue par quatre haubans. */
function h4_ouro(B,K){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),R=1.0,r0=.46,tau=.45;
  const Kt=u=>{const t=u*2*Math.PI,rr=R+r0*Math.cos(3*t),x=r0*1.1*Math.sin(3*t),y=rr*Math.cos(2*t),z=rr*Math.sin(2*t);
    return V(x*Math.cos(tau)-y*Math.sin(tau),x*Math.sin(tau)+y*Math.cos(tau),z);};
  const U1=.955,Ph=Kt(U1),Pt=Kt(.012),dv=Pt.clone().sub(Ph),Lh=dv.length()*1.18+.04;
  // le corps : 0 → .935, écailles (anneaux), queue fine, cou épais
  const pts=[];for(let k=0;k<=150;k++){const q=Kt(U1*k/150);pts.push([q.x,q.y,q.z]);}
  const rb=t=>{const base=t<.06?.03+.08*t/.06:.11+.016*Math.sin(t*9);const neck=t>.86?.034*(t-.86)/.14:0;return (base+neck)*(1+.11*Math.sin(t*400));};
  B.add(h4_tubeV(pts,rb,300,8,true),K.chrome,0,0,0);
  for(const u of [.14,.26,.38,.50,.62,.74]){const a=Kt(u-.002),b=Kt(u+.002),c=Kt(u),tg=b.clone().sub(a),gg=new THREE.TorusGeometry(.150,.020,5,14).rotateY(PI10/2);   // les bagues d'or du corps
    h4_pose(B,gg,K.or,c,tg,V(0,c.y,c.z),1);}
  // la tête, construite en longueur 1 dans son repère (+x devant, +y haut), posée au cou
  const fw=dv.clone().normalize(),up=V(0,Ph.y,Ph.z).normalize(),sec=(x,y,w,hu,hd,p,z)=>({x:x,y:y,w:w,hu:hu,hd:hd,p:p||2.6,z:z||0});
  const put=(geo,m,tx,ty,tz,rz)=>{if(rz)geo.rotateZ(rz);geo.translate(tx||0,ty||0,tz||0);h4_pose(B,geo,m,Ph,fw,up,Lh);};
  const vc=(r,l,m,x,y,z,dx,dy,dz)=>{const g=cone10(r,l,6),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),new THREE.Vector3(dx,dy,dz).normalize());g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));put(g,m,x,y,z);};
  put(h4_loft([sec(-.04,0,.12,.11,.11),sec(.12,.01,.24,.19,.14),sec(.32,.0,.25,.19,.12),sec(.55,-.01,.18,.13,.09),sec(.80,-.02,.13,.09,.07),sec(.97,-.03,.10,.07,.05),sec(1.04,-.03,.05,.04,.03,2.2)],10),K.chrome,0,0,0);
  put(h4_loft([sec(.00,-.02,.12,.05,.05),sec(.20,-.05,.15,.05,.06),sec(.55,-.07,.11,.04,.05),sec(.82,-.06,.07,.035,.04),sec(.92,-.05,.04,.03,.03,2.2)],8),K.alu,.05,-.10,0,-.30);   // la mâchoire, ouverte
  for(let sd=-1;sd<=1;sd+=2){
    put(new THREE.SphereGeometry(.045,8,6),K.glow,.30,.12,sd*.215);                                                                    // l'œil de glace
    put(h4_loft([sec(.14,.20,.05,.025,.025,2.4,sd*.20),sec(.34,.205,.06,.03,.03,2.4,sd*.24),sec(.52,.15,.04,.02,.02,2.4,sd*.15)],6),K.or,0,0,0);   // l'arcade d'or
    vc(.030,.24,K.or,.62,-.05,sd*.07,.20,-1,sd*.06);                                                                                  // les deux longs crocs
    vc(.026,.10,K.or,.36,-.05,sd*.17,.10,-1,sd*.10);vc(.026,.10,K.or,.50,-.04,sd*.13,.10,-1,sd*.10);
    vc(.028,.14,K.chrome,.58,-.19,sd*.05,.30,1,sd*.05);                                                                                  // les crocs du bas
    vc(.045,.42,K.or,.10,.14,sd*.13,-1,.50,sd*.35);                                                                                      // les cornes qui balaient vers l'arrière
    vc(.028,.20,K.or,.88,.0,sd*.04,1,.15,sd*.15);}                                                                                       // les naseaux : deux pointes
  for(let k=0;k<4;k++)vc(.035-.005*k,.20-.025*k,K.or,.34-k*.09,.19-k*.006,0,-.45,1,0);                                                    // la crête d'or sur le crâne
  put(h4_loft([sec(.55,-.052,.035,.012,.012,2),sec(.98,-.06,.04,.012,.012,2)],5),K.glow,.05,-.10,0,-.30);                                  // la langue de braise
  // la nacelle qui traverse le nœud, ses bandes d'or, son anneau de braise, ses quatre haubans (ils touchent le nœud ET la nacelle)
  TX(B,K.chrome,[[.001,0],[.16,.04],[.28,.30],[.33,.78],[.28,1.22],[.16,1.58],[.001,1.84]],-.80,0,0,0,18);
  for(const x of [-.36,.42])B.add(new THREE.TorusGeometry(.30,.032,5,20),K.or,x,0,0,0,PI10/2,0);
  B.add(new THREE.TorusGeometry(.335,.022,5,20),K.glow,.03,0,0,0,PI10/2,0);
  B.add(G10.sph,K.blanc,1.06,0,0,0,0,0,.10,.10,.10);
  for(const u of [.10,.34,.60,.84]){const q=Kt(u);B.add(tube10([[0,0,0],[q.x,q.y,q.z]],.034,1,6),K.chrome,0,0,0);}
}

/* LA COMÈTE v2 — le noyau est une TÊTE DE RENARD DE GLACE (Léo : « tête de comète / renard de feu ») : crâne facetté, museau long et fin,
   deux oreilles de cristal à cœur de braise, fraise de joues, crinière d'éclats de glace qui se couche vers la queue, moustaches ;
   les trois cônes de feu partent de son cou, un anneau d'or le tient, l'ancienne queue d'ions bleue le suit */
function h4_comete(B,K){
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize(),k=1.9,x0=.10;
  const sec=(x,y,w,hu,hd,p,z)=>({x:x0+x*k,y:y*k,w:w*k,hu:hu*k,hd:hd*k,p:p||2.6,z:(z||0)*k});
  B.add(h4_loft([sec(-.05,0,.28,.28,.26),sec(.15,.0,.42,.34,.28),sec(.40,-.01,.30,.24,.19),sec(.68,-.03,.18,.14,.11),sec(.90,-.05,.11,.09,.07),sec(1.0,-.06,.06,.05,.04,2.2)],8),K.col,0,0,0);
  B.add(h4_loft([sec(.20,-.15,.20,.05,.07),sec(.55,-.12,.14,.04,.05),sec(.85,-.11,.08,.03,.04,2.2)],6),K.blanc,0,0,0);             // le dessous du museau, clair
  B.add(G10.sph,K.glow,x0+1.0*k,-.06*k+.01,0,0,0,0,.06,.05,.06);                                                                 // le nez de braise
  const pk=(x,y,z,d,r,l,m,sg)=>vers10(B,cone10(r*k,l*k,sg||4),m,P(x0+x*k,y*k,z*k),d,1);
  B.add(h4_loft([sec(.34,.235,.035,.022,.02),sec(.68,.115,.028,.018,.016),sec(.96,.0,.02,.012,.012)],5),K.blanc,0,0,0);              // l'arête du nez, claire
  for(let sd=-1;sd<=1;sd+=2){
    pk(.10,.24,sd*.24,D(-.15,1,sd*.60),.17,.85,K.metal);pk(.12,.26,sd*.23,D(-.15,1,sd*.60),.095,.64,K.glow);                       // l'oreille de cristal et son cœur de braise
    pk(.22,-.02,sd*.34,D(-.55,-.10,sd*1.0),.10,.40,K.col);pk(.20,-.10,sd*.32,D(-.60,-.35,sd*.9),.08,.34,K.col);pk(.18,.07,sd*.34,D(-.45,.25,sd*1.0),.08,.32,K.col);   // la fraise des joues
    B.add(G10.sph,K.noir,x0+.43*k,.15*k,sd*.19*k,0,0,0,.10*k,.065*k,.045*k);                                                          // l'orbite
    B.add(G10.box,K.glow,x0+.46*k,.155*k,sd*.222*k,0,sd*-.32,sd*.25,.15*k,.032*k,.020*k);                                           // l'œil : une fente de braise
    B.add(h4_loft([sec(.28,.215,.075,.034,.026,2.4,sd*.185),sec(.44,.225,.085,.036,.028,2.4,sd*.20),sec(.60,.17,.05,.028,.022,2.4,sd*.13)],6),K.blanc,0,0,0);   // l'arcade
    for(let j=0;j<3;j++)pk(.72,-.04-j*.02,sd*.10,D(-.9,-.05+j*.14,sd*(.5+j*.3)),.014,.52+j*.08,K.blanc,4);}                       // les moustaches
  for(let j=0;j<12;j++){const a=j/12*2*Math.PI,c=Math.cos(a),sn=Math.sin(a);pk(-.02,sn*.27,c*.27,D(-1,sn*.45,c*.45),.07,.62+(j%3)*.10,j%2?K.metal:K.col);}   // la crinière : douze éclats couchés vers la queue
  // l'anneau d'or, penché, tenu au cou par quatre rayons
  {const tau=.5,Rr=.62*k;B.add(new THREE.TorusGeometry(Rr,.036,6,40).rotateY(PI10/2).rotateZ(tau),K.or,x0-.04,0,0);
   for(let j=0;j<4;j++){const a=j/4*2*PI10+.4,c=Math.cos(a),sn=Math.sin(a);
     B.add(tube10([[x0-.04,sn*.27*k,c*.27*k],[x0-.04-Rr*sn*Math.sin(tau),Rr*sn*Math.cos(tau),Rr*c]],.02,1,6),K.or,0,0,0);}}
  B.add(cone10(.20,3.0,16),K.halo(0x6ab8ff,.40),x0-.02,.05,.05,0,PI10*.97,.06);                                                      // la queue d'ions, bleue
}

/* LA NAISSANCE v2 — un LOTUS DE LUMIÈRE : trois couronnes de pétales facettés (argent, rose, or) s'ouvrent sur une étoile qui vient de naître,
   la tige se creuse en tuyère ; derrière lui, les grands anneaux de l'ancienne supernova s'élargissent en reculant, tenus aux
   pétales et entre eux par des tirants d'or */
function h4_naissance(B,K){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),PI=Math.PI;
  const cal=[[8,.24,1.60,.20,K.chrome,0,.08],[8,.60,1.38,.22,K.glow,PI/8,.14],[10,1.12,1.04,.22,K.or,PI/10,.18]];   // [nombre, ouverture (rad), longueur, demi-largeur, matière, phase, relevé du bout]
  for(let L=0;L<3;L++){const c=cal[L];
    for(let k=0;k<c[0];k++){const f=k/c[0]*2*PI+c[5],cf=Math.cos(f),sf=Math.sin(f),al=c[1],r0=.14+.05*L;
      h4_pose(B,h4_petale(c[2],c[3],.045,c[6],1.4),c[4],V(-.05+L*.02,r0*cf,r0*sf),V(Math.cos(al),Math.sin(al)*cf,Math.sin(al)*sf),V(0,cf,sf),1);}}
  for(let k=0;k<6;k++){const f=k/6*2*PI+.3,cf=Math.cos(f),sf=Math.sin(f);                                                  // les sépales : le calice, vers l'arrière
    h4_pose(B,h4_petale(.62,.12,.035,.2,1.4),K.colD,V(-.12,.16*cf,.16*sf),V(-.8,.6*cf,.6*sf),V(0,cf,sf),1);}
  // la tige qui se creuse en tuyère
  TX(B,K.chrome,[[.34,0],[.30,.20],[.22,.55],[.17,.90],[.20,1.05],[.34,1.25]],-.05,0,0,PI,24);
  for(const d of [.22,.62,.98]){const rr=d<.4?.31:d<.8?.20:.19;B.add(new THREE.TorusGeometry(rr+.02,.026,5,24),K.or,-.05-d,0,0,0,PI/2,0);}
  TX(B,K.haloF,[[.001,0],[.32,.12],[.001,.46]],-1.30,0,0,PI,16);
  // l'étoile qui naît au creux de la fleur, son halo, son faisceau
  B.add(G10.sph,K.blanc,.34,0,0,0,0,0,.30,.30,.30);B.add(new THREE.SphereGeometry(.58,16,12),K.halo(0xffe6a0,.20),.30,0,0);
  B.add(cone10(.14,1.5,12),K.haloC,.35,0,0,0,0,0);B.add(cone10(.045,1.9,8),K.blanc,.35,0,0,0,0,0);
  // les grands anneaux de supernova : le premier touche les pointes des pétales, les tirants d'or tiennent les autres
  const rg=[[1.12,.34,K.or,0xffd780,0],[1.36,.22,K.chrome,0xffffff,.55],[1.60,.10,K.col,0xff8ac0,-.55]];
  const rp=(r,a)=>{const st=Math.sin(a),sn=Math.sin(r[4]),cs=Math.cos(r[4]);return [r[1]-r[0]*st*sn,r[0]*st*cs,r[0]*Math.cos(a)];};
  for(const r of rg){B.add(new THREE.TorusGeometry(r[0],.034,6,64).rotateY(PI/2).rotateZ(r[4]),r[2],r[1],0,0);B.add(new THREE.TorusGeometry(r[0],.07,6,64).rotateY(PI/2).rotateZ(r[4]),K.halo(r[3],.30),r[1],0,0);}
  const dist=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1],u[2]-v[2]);
  for(let q=0;q<2;q++){const A=rg[q],Bq=rg[q+1];                                                                                // les tirants : là où deux anneaux se frôlent (deux endroits par paire)
    for(let h=0;h<2;h++){let best=9,pa=null,pb=null;
      for(let i=0;i<72;i++)for(let j=0;j<72;j++){const a=(i/72+h)*PI,b=(j/72+h)*PI,u=rp(A,a),v=rp(Bq,b),d=dist(u,v);if(d<best){best=d;pa=u;pb=v;}}
      B.add(tube10([pa,pb],.022,1,6),K.or,0,0,0);B.add(G10.sph,K.or,pa[0],pa[1],pa[2],0,0,0,.05,.05,.05);B.add(G10.sph,K.or,pb[0],pb[1],pb[2],0,0,0,.05,.05,.05);}}
  for(let k=0;k<16;k++){const a=k/16*2*PI,p2=rp(rg[2],a),c=rg[2][1];vers10(B,cone10(.05,.30,5),K.or,V(p2[0],p2[1],p2[2]),V(p2[0]-c,p2[1],p2[2]).normalize(),1);}   // des rayons au bord de l'onde
}

/* L'INFINI v2 — le sommet : le trou noir À CAGE de l'ancien (Léo : « mieux comme avant »), en grand et dans l'axe du moteur. Une singularité,
   son disque d'accrétion tout un spectre de lumière (penché, les jets le traversent en son centre), l'anneau de photons, la cage de
   méridiens (argent et or) qui se rejoignent à deux COURONNES d'or aux pôles (devant : le diadème ; derrière : la tuyère), et le SIGNE ∞ en
   or massif posé à plat : ses deux boucles enlacent les jets, son croisement est la singularité elle-même */
function h4_infini(B,K){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),PI=Math.PI,R=1.16;
  B.add(new THREE.SphereGeometry(.44,24,16),new THREE.MeshBasicMaterial({color:0x010106}),0,0,0);   // la singularité : NOIRE (un noir qui ne reflète rien, sans halo additif qui la grise)                  // la singularité et sa lueur
  // le disque d'accrétion : seize anneaux de lumière, du blanc au violet, penchés sur les jets
  const sp=[0xffffff,0xfff8e0,0xfff2c0,0xffe2a0,0xffd780,0xffc060,0xffb050,0xff9a44,0xff8a3c,0xff6a48,0xff5a50,0xf04a80,0xe03ca0,0xb02ac8,0x7a22c8,0x401890];
  for(let k=0;k<16;k++){const t=k/15,r=.60+t*.92;B.add(new THREE.TorusGeometry(r,.036+.013*t,6,48).rotateY(PI/2),K.halo(sp[k],.64-.26*t),0,0,0,0,.52,0,.30,1,1);}
  B.add(new THREE.TorusGeometry(.49,.016,6,56).rotateY(PI/2),K.blanc,0,0,0,0,.52,0,.9,1,1);                                  // l'anneau de photons
  // la cage : six grands cercles passant par les pôles (X) = douze méridiens, deux parallèles par hémisphère, l'équateur d'or
  for(let k=0;k<6;k++){B.add(new THREE.TorusGeometry(R,.028,6,64),k%2?K.or:K.chrome,0,0,0,k/6*PI,0,0);}
  B.add(new THREE.TorusGeometry(R,.034,6,64).rotateY(PI/2),K.or,0,0,0);
  for(const sd of [-1,1])for(const fr of [.50,.80]){const rr=R*Math.sqrt(1-fr*fr);B.add(new THREE.TorusGeometry(rr,.020,6,48).rotateY(PI/2),K.chrome,sd*R*fr,0,0);}
  for(let k=0;k<14;k++){const a=k/14*2*PI+.13,fr=.80,rr=R*Math.sqrt(1-fr*fr);B.add(G10.sph,K.glow,(k%2?1:-1)*R*fr,Math.cos(a)*rr,Math.sin(a)*rr,0,0,0,.04,.04,.04);}   // des braises accrochées aux parallèles
  // les couronnes d'or des deux pôles : devant le diadème (huit pointes), derrière la tuyère
  for(const sd of [-1,1]){const x=sd*R;
    B.add(new THREE.TorusGeometry(.17,.042,6,24).rotateY(PI/2),K.or,x,0,0);
    for(let k=0;k<8;k++){const a=k/8*2*PI,c=Math.cos(a),sn=Math.sin(a);vers10(B,cone10(.036,sd>0?.46:.26,6),K.or,V(x,c*.17,sn*.17),V(sd,c*.34,sn*.34).normalize(),1);}
    B.add(G10.sph,K.blanc,x+sd*.04,0,0,0,0,0,.09,.09,.09);}
  // l'∞ : un lemniscate d'or, à plat, dont le croisement est la singularité (les deux bouts s'y perdent)
  const pts=[],a0=2.15;for(let k=0;k<=96;k++){const t=PI/2+k/96*2*PI,d=1+Math.sin(t)*Math.sin(t);pts.push([a0*Math.cos(t)/d,0,a0*Math.sin(t)*Math.cos(t)/d*1.18]);}
  B.add(h4_tubeV(pts,t=>.052+.012*Math.sin(t*2*PI*2),160,8,false),K.or,0,0,0);
  B.add(h4_tubeV(pts,t=>.020,160,6,false),K.chrome,0,.05,0);                                                                 // un filet d'argent sur le dessus
  // les deux jets : le trait de lumière dans l'axe — le plus long file en arrière (la poussée)
  B.add(cone10(.12,1.9,14),K.haloC,.30,0,0,0,0,0);B.add(cone10(.12,2.5,14),K.haloC,-.30,0,0,0,PI,0);
  B.add(cone10(.045,2.1,10),K.blanc,.30,0,0,0,0,0);B.add(cone10(.045,2.7,10),K.blanc,-.30,0,0,0,PI,0);
}
function h4_petale(L,W,T,curl,p){      // un pétale facetté : fuseau plat, relevé en bout (curl), pointu
  const s=[];for(let k=0;k<=7;k++){const u=k/7;s.push({x:L*u,y:curl*L*u*u,w:W*Math.pow(Math.sin(Math.PI*Math.pow(u,.62)),.9)+.004,hu:T*(1-.5*u)+.003,hd:T*(1-.5*u)+.003,p:p||1.4});}
  return h4_loft(s,6);
}
function theme30(B,i,K,c,g){
  const L=c.L||2,XE=L*.5,top=c.top||.85,tw=c.tw||.18;
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const tige=(a,b,r,m)=>B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],r,1,8),m,0,0,0);                                   // un fût droit entre deux points
  const corne=(p,d,r,l,m)=>vers10(B,cone10(r,l,10),m,p,d,1);                                   // une pointe le long de d
  const boule=(m,x,y,z,sx,sy,sz)=>B.add(G10.sph,m,x,y,z,0,0,0,sx,sy||sx,sz||sx);
  const plume=(m,x,y,z,len,larg,rx,ry,rz)=>B.add(plan10([[0,-larg*.5],[len*.75,-larg*.35],[len,0],[len*.75,larg*.35],[0,larg*.5]],.02,.004),m,x,y,z,rx||0,ry||0,rz||0);
  const oeil=(x,y,z,r,ry)=>{B.add(new THREE.CylinderGeometry(r,r,.02,14),K.or,x,y,z,0,0,PI10/2+0,1,1,1);};
  B.plat();
  switch(i){
  case 1:{ // LE SCARABÉE — deux élytres émeraude bombées sur le couvre-culasse, la corne de rhinocéros, six pattes d'or articulées
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.col,-L*.04,top+.04,sd*.105,0,sd*.06,0,L*.46,.15,.125);
      B.add(G10.axeX8,K.or,-L*.46,top+.17,sd*.002,0,0,0,L*.86,.010,.010);}
    corne(P(XE-.10,top+.10,0),D(.55,1,0),.08,.50,K.lame);corne(P(XE-.02,top+.04,0),D(1,.35,0),.05,.22,K.lame);
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++){const x=(k-1)*L*.32,a=P(x,.0,sd*.33),b=P(x+.06,-.18,sd*.55),e=P(x+.14,-.40,sd*.62);
      tige(a,b,.035,K.or);tige(b,e,.028,K.or);boule(K.or,b.x,b.y,b.z,.045);corne(e,D(.3,-1,sd*.2),.03,.08,K.or);}
    break;}
  case 2:{ // LE COLIBRI — trois paires d'ailes irisées qui battent en éventail, un long bec d'or, une queue en ciseaux
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++)plume(k%2?K.col:K.colD,-L*.10+k*.03,top-.06,sd*.24,.70-k*.12,.20,sd*(.9-k*.35),0,PI10/2.6+k*.28);
    corne(P(XE+.02,top-.05,0),D(1,-.08,0),.035,.75,K.or);boule(K.colD,XE-.02,top-.04,0,.10,.09,.09);
    for(let sd=-1;sd<=1;sd+=2)plume(K.colD,-XE,top-.10,sd*.04,.55,.12,0,PI10,sd*.25);
    break;}
  case 3:{ // LE SCORPION — la queue articulée qui se dresse au-dessus du moteur, le dard d'ambre, deux pinces devant
    const pts=[P(-XE+.05,top-.12,0),P(-XE-.22,top+.12,0),P(-XE-.20,top+.48,0),P(-XE+.08,top+.74,0),P(-XE+.42,top+.82,0),P(-XE+.70,top+.70,0)];
    for(let k=0;k<pts.length;k++){const q=pts[k],r=.16-k*.016;boule(K.col,q.x,q.y,q.z,r,r*.85,r);if(k>0)tige(pts[k-1],q,r*.6,K.col);B.add(new THREE.TorusGeometry(r*.9,.014,4,16),K.or,q.x,q.y,q.z,0,PI10/2,0);}
    corne(pts[5],D(.6,-1,0),.07,.38,K.or);boule(K.glow,pts[5].x+.20,pts[5].y-.33,0,.035);
    for(let sd=-1;sd<=1;sd+=2){const a=P(XE,.05,sd*.22),b=P(XE+.36,.16,sd*.40);tige(a,b,.07,K.col);boule(K.col,b.x,b.y,b.z,.11);
      corne(b,D(1,.3,sd*.2),.09,.40,K.col);corne(b,D(1,-.2,sd*.4),.07,.32,K.col);}
    break;}
  case 4:{ // LE HIBOU — deux grands yeux d'ambre en façade, aigrettes de plumes, ailes repliées sur les flancs
    for(let sd=-1;sd<=1;sd+=2){const z=sd*.24,x=L*.485+.08;
      B.add(tourX([[.001,0],[.24,0],[.27,.04],[.24,.07],[.001,.07]],20),K.or,x,.90,z);B.add(tourX([[.001,0],[.19,0],[.19,.02],[.001,.02]],20),K.glow,x+.06,.90,z);
      B.add(tourX([[.001,0],[.08,0],[.08,.02],[.001,.02]],14),K.noir,x+.075,.90,z);
      plume(K.colD,-L*.40,top+.05,sd*.12,.48,.12,0,0,1.25);}
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<4;k++)plume(k%2?K.col:K.colD,XE*.6,.35-k*.10,sd*.40,L*.75,.13,0,PI10,-.12+k*.04);
    break;}
  case 5:{ // LE REQUIN, PILOTE HYBRIDE (Léo : « pas un objet décoré : l'animal doit être l'objet lui-même, presque transformeur ») — LE MOTEUR EST le
    //   requin : le bloc = le corps, la cloche d'embrayage (-X) = le museau (gueule, dents, yeux), l'échappement (+X) = la queue (deux lames de
    //   nageoire caudale autour de la tuyère), le ventre blanc = le carter d'huile, l'aileron = sur le dos, les ouïes sur les flancs
    const yC=.20,hx=-XE-.04;
    TX(B,K.col,[[.42,0],[.38,.18],[.24,.55],[.08,.92],[.001,1.02]],hx,yC,0,PI10,22);                                   // le museau
    BXg(B,K.blanc,-XE-.30,yC-.18,0,0,0,.16,.70,.05,.50);                                                              // le dessous du museau, blanc
    BXg(B,K.noir,-XE-.44,yC-.28,0,0,0,.16,.62,.05,.40);                                                               // la mâchoire inférieure
    for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<6;k++){const x=-XE-.16-k*.10;corne(P(x,yC-.17,sd*(.20-k*.012)),D(0,-1,0),.032,.13,K.blanc);corne(P(x-.04,yC-.27,sd*(.18-k*.012)),D(0,1,0),.028,.11,K.blanc);}
      boule(K.noir,-XE-.36,yC+.12,sd*.27,.05);boule(K.glow,-XE-.385,yC+.13,sd*.285,.022);
      B.add(plan10([[0,0],[.42,-.08],[.14,-.22],[0,-.12]],.03,.006),K.col,-XE+.28,yC-.06,sd*.36,PI10/2,0,-.5*sd);}  // nageoires pectorales
    B.add(plan10([[-.40,0],[.45,0],[-.02,.80],[-.30,.72]],.05,.012),K.col,-L*.04,top+.01,0);                           // l'aileron dorsal
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<5;k++)BXg(B,K.noir,-XE+.30+k*.09,.10,sd*.355,0,0,0,.022,.32-k*.02,.02);   // les ouïes
    BXg(B,K.blanc,0,-.345,0,0,0,0,L*.96,.04,.54);                                                                      // le ventre blanc
    const tx=L*.46+.50;B.add(plan10([[0,0],[.30,.55],[.12,.0],[.30,-.55]],.05,.012),K.col,tx,.30,.50,0,0,0);          // la queue en croissant, autour de la tuyère
    break;}
  case 6:{ // L'ÉTOILE DE MER — cinq bras corail en façade, granuleux, un cœur doré
    const cx=XE+.12,cy=.32;boule(K.or,cx,cy,0,.14,.14,.08);
    for(let k=0;k<5;k++){const a=PI10/2+k*2*PI10/5,d=D(.10,Math.sin(a),Math.cos(a));corne(P(cx,cy,0),d,.13,.72,K.col);
      for(let j=1;j<6;j++){const q=P(cx,cy,0).addScaledVector(d,j*.11);boule(K.or,q.x+.05,q.y,q.z,.024);}}
    break;}
  case 7:{ // LE CORAIL — des branches roses qui poussent au-dessus du vé, perles de nacre au bout
    const br=(p,d,l,n)=>{const q=p.clone().addScaledVector(d,l);tige(p,q,.022+.016*n,K.col);if(n<=1){boule(K.blanc,q.x,q.y,q.z,.05);return;}
      br(q,D(d.x+.35,d.y,d.z+.45),l*.78,n-1);br(q,D(d.x-.35,d.y,d.z-.45),l*.78,n-1);};
    for(let k=0;k<3;k++)br(P((k-1)*L*.30,top-.02,(k-1)*.04),D(0,1,0),.30,3);
    break;}
  case 8:{ // L'ORQUE, PILOTE HYBRIDE — LE MOTEUR EST l'orque : le bloc noir = le corps, la cloche = la tête ronde (melon), les taches blanches sur
    //   les flancs, le ventre blanc = le carter, le grand aileron au dos, les nageoires larges, et l'échappement (+X) = la queue à nageoires horizontales
    const yC=.18,hx=-XE-.02;
    boule(K.col,hx-.14,yC,0,.46,.38,.40);                                                                              // la tête ronde
    BXg(B,K.blanc,hx-.22,yC-.20,0,0,0,.14,.60,.05,.46);                                                                // la gorge blanche
    for(let sd=-1;sd<=1;sd+=2){boule(K.blanc,hx-.30,yC+.14,sd*.30,.13,.06,.03);boule(K.noir,hx-.40,yC+.10,sd*.30,.035);   // tache et œil
      B.add(plan10([[0,0],[.50,-.10],[.46,-.30],[.06,-.24]],.04,.01),K.col,-XE+.20,yC-.06,sd*.36,PI10/2,0,-.4*sd);      // nageoires larges
      boule(K.blanc,-XE+.60,.60,sd*.265,.20,.07,.02);}                                                                  // taches blanches sur les flancs
    B.add(plan10([[-.40,0],[.40,0],[.05,.95],[-.20,.80]],.05,.012),K.col,-L*.02,top+.01,0);                            // le grand aileron
    BXg(B,K.blanc,0,-.345,0,0,0,0,L*.96,.04,.54);                                                                      // le ventre blanc
    const tx=L*.46+.46;for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.42,.22*sd],[.30,.0],[.42,-.22*sd]],.04,.01),K.col,tx,.30+(sd>0?.16:-.16),.50,PI10/2,0,0);   // flukes horizontales
    break;}
  case 9:{ // LA TORTUE — une carapace d'écailles hexagonales posée sur le boxer, la tête qui sort, quatre nageoires
    B.add(new THREE.SphereGeometry(1,18,8,0,PI10*2,0,PI10/2),K.colD,0,.30,0,0,0,0,L*.52,.38,.62);
    for(let k=0;k<11;k++){const a=k/11*2*PI10,r=k===0?0:(k<5?.45:.85),aa=k*2.4;const x=Math.cos(aa)*r*L*.40,z=Math.sin(aa)*r*.50,y=.30+.38*Math.sqrt(Math.max(0,1-(x/(L*.52))**2-(z/.62)**2))+.005;
      B.add(new THREE.CylinderGeometry(.11,.12,.03,6),K.col,x,y,z,0,0,0);}
    boule(K.col,XE+.30,.20,0,.16,.13,.13);tige(P(XE,.18,0),P(XE+.22,.20,0),.08,K.col);boule(K.noir,XE+.40,.24,.08,.025);boule(K.noir,XE+.40,.24,-.08,.025);
    for(let sx=-1;sx<=1;sx+=2)for(let sd=-1;sd<=1;sd+=2)plume(K.col,sx*L*.32,.05,sd*.55,.45,.18,0,sd>0?-.6:PI10+.6,0);
    break;}
  case 10:{ // LA ROQUETTE — quatre fusées blanches à nez rouge montées sur rails le long du bloc, une ogive en proue, des ailerons
    for(let sd=-1;sd<=1;sd+=2)for(let h=0;h<2;h++){const y=.05+h*.30,z=sd*(.48+h*.06);
      B.add(G10.axeX8,K.blanc,-L*.38,y,z,0,0,0,L*.70,.10,.10);corne(P(L*.32,y,z),D(1,0,0),.10,.28,K.col);
      for(let f=0;f<4;f++){const a=f/4*2*PI10+PI10/4;B.add(plan10([[0,0],[.22,0],[.05,.14],[0,.14]],.015,.004),K.col,-L*.38,y+Math.sin(a)*.10,z+Math.cos(a)*.10,a-PI10/2,PI10,0);}
      TX(B,K.chrome,[[.06,0],[.08,.04],[.11,.12]],-L*.38,y,z,PI10,10);TX(B,K.glow,[[.001,0],[.08,0],[.08,.01]],-L*.38-.10,y,z,0,10);
      BXg(B,K.chrome,0,y,sd*(.37+h*.03),0,0,0,L*.5,.04,(z*sd)-.33);}
    corne(P(XE+.04,.30,0),D(1,0,0),.30,.55,K.col);B.add(new THREE.TorusGeometry(.30,.03,6,24),K.blanc,XE+.05,.30,0,0,PI10/2,0);
    break;}
  case 11:{ // L'ÉLECTRIQUE — deux bobines Tesla de cuivre dressées sur le moteur, leurs tores chromés, des arcs bleus qui claquent
    for(let sd=-1;sd<=1;sd+=2){const x=sd*L*.36;tige(P(x,top,0),P(x,top+.75,0),.06,K.noir);
      for(let k=0;k<12;k++)B.add(new THREE.TorusGeometry(.09,.018,5,16),K.cu,x,top+.08+k*.055,0,PI10/2,0,0);
      B.add(new THREE.TorusGeometry(.20,.07,10,28),K.chrome,x,top+.82,0,PI10/2,0,0);boule(K.glow,x,top+.82,0,.06);}
    const arc=(a,b,n)=>{const p=[];for(let k=0;k<=n;k++){const t=k/n,j=k%2?1:-1;p.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t+(k&&k<n?j*.06:0),a.z+(b.z-a.z)*t+(k&&k<n?(k%3-1)*.06:0)]);}B.add(tube10(p,.016,n*2,4),K.glow,0,0,0);};
    arc(P(-L*.36+.2,top+.82,0),P(L*.36-.2,top+.82,0),9);arc(P(-L*.36,top+.62,.18),P(-L*.36+.30,top+.02,.15),5);arc(P(L*.36,top+.62,-.18),P(L*.36-.30,top+.02,-.15),5);
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.14,.20],[.06,.20],[.20,.42],[.02,.16],[.10,.16],[-.04,-.04]],.02,.004),K.or,0,.05,sd*.37,0,sd>0?0:PI10,0);
    break;}
  case 12:{ // LA GRENADE — le bloc quadrillé comme un ananas kaki, le grand levier qui l'enjambe, la goupille et son anneau d'or
    for(let sd=-1;sd<=1;sd+=2)for(let r=0;r<3;r++)for(let k=0;k<7;k++)BXg(B,K.col,(k/6-.5)*L*.82,-.14+r*.13,sd*.35,0,0,0,L*.09,.10,.04);
    const lv=[[XE+.10,top-.05,0],[XE+.25,top+.35,0],[0,top+.62,0],[-XE+.10,top+.45,0],[-XE-.05,top+.10,0]];B.add(tube10(lv,.05,24,4),K.colD,0,0,0);
    for(const q of [lv[0],lv[4]])BXg(B,K.colD,q[0],q[1],0,0,0,0,.14,.10,.16);
    tige(P(XE+.12,top-.08,.10),P(XE+.30,top-.08,.10),.022,K.or);B.add(new THREE.TorusGeometry(.17,.03,8,28),K.or,XE+.46,top-.08,.10,0,0,0);
    break;}
  case 13:{ // LE VITRAIL — une rosace de verre coloré dressée en proue, cerclée de plomb et d'or, sur son pied
    const V=[0xff3a4a,0x3a6aff,0xffc030,0x2ad08a,0xb04aff,0xff7a2a],X=XE+.02,Y=top+.62;
    for(let k=0;k<12;k++){const m=new THREE.MeshPhongMaterial({color:V[k%6],emissive:V[k%6],emissiveIntensity:.5,shininess:300,specular:0xffffff,side:THREE.DoubleSide});
      B.add(new THREE.CircleGeometry(.50,6,k/12*2*PI10,2*PI10/12-.03),m,X,Y,0,0,PI10/2,0);}
    B.add(new THREE.TorusGeometry(.51,.035,6,32),K.or,X,Y,0,0,PI10/2,0);B.add(new THREE.TorusGeometry(.17,.022,6,24),K.or,X,Y,0,0,PI10/2,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10;tige(P(X+.01,Y+Math.sin(a)*.17,Math.cos(a)*.17),P(X+.01,Y+Math.sin(a)*.50,Math.cos(a)*.50),.01,K.noir);}
    tige(P(X,top,0),P(X,Y-.50,0),.05,K.or);B.add(tourY10([[.001,0],[.14,0],[.10,.06],[.001,.08]],10),K.or,X,top,0);
    break;}
  case 14:{ // LE SOLEIL — un disque d'or rayonnant dressé derrière l'étoile, vingt-quatre rayons alternés
    B.add(tourX([[.001,0],[.40,0],[.42,.03],[.40,.06],[.001,.06]],24),K.or,-.03,1.60,0,0,PI10/2,0);
    for(let k=0;k<24;k++){const a=k/24*2*PI10,l=k%2?.30:.55;B.add(plan10([[-.05,0],[.05,0],[0,l]],.03,.004),k%2?K.or:K.col,0,1.60+Math.sin(a)*.40,Math.cos(a)*.40,a-PI10/2,0,0);}
    B.add(tourX([[.001,0],[.24,0],[.24,.02],[.001,.02]],20),K.glow,.03,1.60,0,0,PI10/2,0);tige(P(0,1.18,0),P(0,1.20,0),.04,K.or);
    break;}
  case 15:{ // LE DRAGON — la tête cornue aux yeux de braise et aux crocs, la queue en fer de lance, les ailes repliées
    const h=P(XE+.24,top-.02,0);BXg(B,K.col,h.x,h.y,0,0,0,0,.62,.30,.42);corne(P(XE+.55,top-.02,0),D(1,-.1,0),.17,.38,K.col);tige(P(XE-.05,top-.05,0),P(XE+.05,top-.04,0),.12,K.col);
    for(let sd=-1;sd<=1;sd+=2){corne(P(XE+.12,top+.12,sd*.14),D(-1,.8,sd*.35),.06,.55,K.or);boule(K.glow,XE+.40,top+.06,sd*.21,.05);
      for(let k=0;k<4;k++)corne(P(XE+.30+k*.09,top-.17,sd*.15),D(0,-1,0),.03,.12,K.blanc);
      B.add(plan10([[0,0],[L*.35,.05],[L*.30,.40],[L*.15,.18],[L*.05,.32]],.02,.004),K.colD,-L*.20,.30,sd*.40,sd*.4,0,0);}
    const tq=[P(-XE,.40,0),P(-XE-.35,.35,.15),P(-XE-.65,.25,-.10),P(-XE-.90,.30,.05)];B.add(tube10(tq.map(q=>[q.x,q.y,q.z]),.06,16,8),K.col,0,0,0);
    corne(tq[3],D(-1,.1,0),.11,.25,K.or);
    break;}
  case 16:{ // LA PAGODE — quatre toits laqués aux bords relevés empilés sur la tour, la flèche d'or, deux lanternes
    for(let k=0;k<4;k++){const r=.70-k*.12,y=1.10+k*.24;B.add(tourY10([[.001,.10],[r*.55,.08],[r,0],[r*1.05,.04],[r*1.02,.05],[.001,.13]],8),k%2?K.or:K.col,0,y,0);}
    corne(P(0,2.0,0),D(0,1,0),.05,.45,K.or);for(let k=0;k<5;k++)B.add(new THREE.TorusGeometry(.06-k*.006,.012,4,14),K.or,0,2.06+k*.07,0,PI10/2,0,0);
    for(let sd=-1;sd<=1;sd+=2){tige(P(0,1.13,sd*.70),P(0,1.00,sd*.70),.008,K.or);boule(K.col,0,.93,sd*.70,.07,.09,.07);}
    break;}
  case 17:{ // LE KRAKEN — huit tentacules qui s'enroulent depuis le nez, ventouses dorées, un œil immense
    for(let k=0;k<8;k++){const a=k/8*2*PI10,p=[];for(let j=0;j<=5;j++){const t=j/5;p.push([XE+.25+t*.15-Math.sin(t*3)*.25*t,.20+Math.sin(a)*(.30+t*.55)+(-t*t*.4),Math.cos(a)*(.30+t*.55)]);}
      B.add(tube10(p,.05,16,7),K.col,0,0,0);const e=p[5];corne(P(e[0],e[1],e[2]),D(-.4,-.6,Math.cos(a)*.3),.05,.20,K.col);
      for(let j=1;j<5;j++){const q=p[j];boule(K.or,q[0]+.02,q[1]-.04,q[2],.018);}}
    B.add(tourX([[.001,0],[.17,0],[.19,.03],[.001,.05]],16),K.or,XE+.48,.20,0);B.add(tourX([[.001,0],[.12,0],[.12,.02],[.001,.02]],16),K.glow,XE+.52,.20,0);
    BXg(B,K.noir,XE+.535,.20,0,0,0,0,.01,.16,.04);
    break;}
  }
  B.plat();
}
/* LES LÉGENDES ET LE COSMOS (19-30) : les mêmes règles, posées sur les objets d'`orig10` */
function theme30b(B,i,K,g){   // (B est réassignable : le dragon noir bâtit sa tête à part)
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const tige=(a,b,r,m)=>B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],r,1,8),m,0,0,0),corne=(p,d,r,l,m)=>vers10(B,cone10(r,l,10),m,p,d,1);
  const boule=(m,x,y,z,sx,sy,sz)=>B.add(G10.sph,m,x,y,z,0,0,0,sx,sy||sx,sz||sx);
  const plume=(m,x,y,z,len,larg,rx,ry,rz)=>B.add(plan10([[0,-larg*.5],[len*.75,-larg*.35],[len,0],[len*.75,larg*.35],[0,larg*.5]],.02,.004),m,x,y,z,rx||0,ry||0,rz||0);
  B.plat();
  switch(i){
  case 18:{ // LE SPHINX — une pyramide d'or sur chaque chambre, les bandes du némès or et lapis, l'œil d'Horus en façade
    for(let k=0;k<3;k++){const x=-.52+k*.52;B.add(new THREE.ConeGeometry(.42,.50,4),K.or,x,.86,0,0,PI10/4,0);
      for(let j=0;j<4;j++)B.add(new THREE.TorusGeometry(.64,.025,5,32),j%2?K.or:K.colD,x-.11+j*.075,0,0,0,PI10/2,0);}
    B.add(tourX([[.001,0],[.22,0],[.24,.03],[.001,.05]],16),K.colD,1.0,0,0);B.add(tourX([[.001,0],[.10,0],[.10,.02],[.001,.02]],14),K.or,1.04,0,0);
    tige(P(1.05,-.14,.08),P(1.05,-.32,.20),.02,K.colD);tige(P(1.05,-.14,-.10),P(1.05,-.26,-.28),.02,K.colD);
    break;}
  case 19:{ // LE PHÉNIX — deux grandes ailes de plumes de feu sur le cadre, une crête, une traîne de plumes
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<9;k++){const m=k<3?K.or:(k<6?K.col:K.colD);plume(m,-.6+k*.12,.58,sd*.55,1.0-Math.abs(k-4)*.08,.16,sd*(.55+k*.06),0,PI10/2+.3-k*.11);}
    for(let k=0;k<3;k++)plume(K.or,.95,.50,(k-1)*.12,.45,.08,0,0,PI10/2.4-(k-1)*.3);
    for(let k=0;k<5;k++)plume(k%2?K.col:K.or,-1.15,0,(k-2)*.10,1.1,.10,0,PI10,(k-2)*.10);
    break;}
  case 20:{ // L'ATLANTIDE — quatre colonnes de bronze cannelées autour du cœur, une vague d'écume en cimier
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4,y=Math.sin(a)*.42,z=Math.cos(a)*.42;B.add(new THREE.CylinderGeometry(.05,.05,1.6,10).rotateZ(PI10/2),K.or,0,y,z);
      B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,.80,y,z);B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,-.80,y,z);}
    tige(P(0,.15,0),P(0,1.15,0),.035,K.or);BXg(B,K.or,0,1.15,0,0,0,0,.06,.05,.46);           // le TRIDENT de Poséidon qui transperce le cœur
    for(const z of [-.22,0,.22]){tige(P(0,1.15,z),P(0,1.42,z),.025,K.or);corne(P(0,1.42,z),D(0,1,0),.05,.16,K.or);}
    break;}
  case 21:{ // LA LANCE D'ODIN — un fer de lance runique à la place de la pointe, les runes qui brillent, deux plumes de corbeau
    vers10(B,new THREE.OctahedronGeometry(.30,0).scale(1.8,.5,.18),K.or,P(1.95,0,0),D(1,0,0),1);
    for(let k=0;k<4;k++){const x=-.85+k*.42;for(let j=0;j<6;j++){const a=j/6*2*PI10;B.add(G10.box,K.glow,x+.12,Math.sin(a)*.448,Math.cos(a)*.448,a,0,0,.08,.012,.012);}}
    for(let sd=-1;sd<=1;sd+=2)plume(K.noir,-1.10,sd*.44,0,.80,.18,0,PI10,sd*.35);
    break;}
  case 22:{ // LE CŒUR BATTANT v2 — le réacteur EST un cœur (h4_coeur) : ventricules de rubis, aorte qui plonge dans la colonne, veines le long des anneaux
    h4_coeur(K,g);
    for(let j=0;j<5;j++){const pts=[];for(let k=0;k<10;k++){const a=j/5*2*PI10+k*.27,R=.19+k*.045-.03;pts.push([.30-k*.17,Math.cos(a)*R,Math.sin(a)*R]);}
      pts.unshift([.46,Math.cos(j/5*2*PI10)*.16,Math.sin(j/5*2*PI10)*.16]);
      B.add(h4_tubeV(pts,t=>.034-.012*t,40,6,true),K.colD,0,0,0);}                                       // une veine par anneau, qui s'enroule jusqu'à la tuyère
    break;}
  case 23:{ // LE DRAGON NOIR (Léo : « la tête qui fait la tête du réacteur, pas besoin de corps, une tête de T-rex avec des cornes ») — v2 : la tête
    //   est SCULPTÉE par sections (h4_dragon) : crâne, arcades, museau, mâchoire ouverte sur la braise, crocs inégaux, cornes annelées
    h4_dragon(K,g);
    break;}


  case 24:{ // HÉLIOS v2 — le soleil-dieu : un masque d'or à deux visages dans l'anneau, douze flammes qui ondulent, douze lances (h4_helios)
    h4_helios(B,K);
    break;}
  case 25:{ // L'ALIEN v2 — la soucoupe EST la créature : un œil de braise sous la verrière, des glyphes, des organes de jante, cinq tentacules (h4_alien)
    h4_alien(B,K);
    break;}
  case 26:{ // L'OUROBOROS D'ARGENT v2 — le nœud de chrome EST le serpent, sa tête sculptée mord sa queue (h4_ouro)
    h4_ouro(B,K);
    break;}



  case 27:{ // LA COMÈTE v2 — un renard de glace dont la queue est le feu (h4_comete)
    h4_comete(B,K);
    break;}
  case 28:{ // LA NAISSANCE v2 — un lotus de lumière sur une étoile qui vient de naître, les anneaux de supernova qui s'élargissent derrière (h4_naissance)
    h4_naissance(B,K);
    break;}
  case 29:{ // L'INFINI v2 — le trou noir à cage, en grand : disque penché, méridiens, couronnes d'or aux pôles, le signe ∞ (h4_infini)
    h4_infini(B,K);
    break;}

  }
  B.plat();
}
