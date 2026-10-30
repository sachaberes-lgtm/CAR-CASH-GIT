/* ================= L'IDENTITÉ DE CHAQUE MOTEUR (2026-10-26, Léo : « chaque moteur aura une identité à lui — aquatique,
   élémentaire, animaux, des références familières avec une touche d'originalité ; toujours une intensité plus grande : le
   premier a de la gueule, le 30e mille fois plus » ; « même plus drôle, des rêves, n'importe ») =================
   QUATRE CHAPITRES : le VIVANT (2-11) → la PUISSANCE (12-16 : électrique, grenade, vitrail, soleil, roquette) → les LÉGENDES (17-25) → l'AU-DELÀ (26-30 : alien, porte de distorsion, comète, naissance, l'infini). Chaque palier a sa
   PALETTE (`TH30` remplace la laque et la flamme du palier) et sa SIGNATURE (`theme30`), posée sur le moteur — ⚠ RÈGLE : chaque
   pièce TOUCHE le moteur (aucun bout en l'air), aucune matière transparente hors du verre voulu. */
const TH30=[null,
 [0x1f8a6a,0x9affc8],[0xd0201c,0xffd890],[0x2a1c14,0xffb030],[0x9a6430,0xffc040],[0x4a6680,0x9ad8ff],   // 2 scarabée · 3 coccinelle · 4 scorpion · 5 hibou · 6 requin
 [0xff6a3c,0xffb070],[0xff5f8a,0xffe0ea],[0x15171c,0xd8f4ff],[0x5f7d3c,0xd8ff90],[0xd8282a,0xffa030],   // 7 étoile de mer · 8 corail · 9 orques · 10 tortue · 11 roquette
 [0x1f4aff,0x9af0ff],[0x4f5f2a,0xffb030],[0x0e7a54,0xff5ac8],[0xffb000,0xfff0a0],[0x1f5a3a,0xff5030],   // 12 électrique · 13 grenade · 14 colibri · 15 soleil · 16 dragon
 [0xc0201e,0xffd070],[0x3a2a6a,0x6affd8],[0xd9a441,0x5a8aff],[0xff4a1a,0xffc040],[0x4b8688,0x8affff],   // 17 pagode · 18 kraken · 19 sphinx · 20 phénix · 21 atlantide
 [0x2b2f8f,0x39e6ff],[0xb81a3a,0xff6a80],[0x16161c,0xff4a14],[0xffc030,0xfff6c0],[0x10a86e,0xb0ffe0],   // 22 Raijin · 23 cœur battant · 24 dragon cosmique · 25 Hélios · 26 alien
 [0xb4bccb,0xbfe8ff],[0x9ad8ff,0xff9a40],[0xff6ea0,0xffd0f0],[0xf5f6fa,0xffd780]];                        // 27 ouroboros · 28 Halley · 29 naissance · 30 l'infini
function th30Kit(E,i){const t=TH30[i];return t?Object.assign({},E,{col:t[0],flam:t[1]}):E;}

/* ===== LA COCCINELLE KAWAII DU 3 (30/10, Léo : « remplace le trois escargot pour autre chose » — coccinelle) — le moteur 3 garde sa forme (le bloc facetté du palier) en rouge laqué ; sur le dessus, sept points noirs posés et
   une raie ; deux antennes à bout rond ; deux grands yeux blancs à pupille luisante, joues roses et petit sourire sur la cloche d'embrayage ===== */
function h5_coccinelle(B,K,L,XE,top){
  const noirM=new THREE.MeshPhongMaterial({color:0x0c0a14,shininess:200,specular:0xffffff,flatShading:true}),blancM=new THREE.MeshPhongMaterial({color:0xfdfdfd,shininess:120,specular:0xffffff}),luisM=new THREE.MeshBasicMaterial({color:0xffffff}),joue=new THREE.MeshBasicMaterial({color:0xff8fb0}),bouche=new THREE.MeshBasicMaterial({color:0x2a1218});
  const sp=function(m,x,y,z,sx,sy,sz){B.add(G10.sph,m,x,y,z,0,0,0,sx,sy==null?sx:sy,sz==null?sx:sz);};
  const rx=.82,ry=.6,rz=.55,cx=.05,cy=.18,rouge=new THREE.MeshPhongMaterial({color:0xd0201c,shininess:140,specular:0xffd0c0,flatShading:true});
  B.add(G10.sph,rouge,cx,cy,0,0,0,0,rx,ry,rz);                                                                      // la carapace rouge laquée, posée sur les trois cylindres
  [[0,0],[.5,.5],[.5,-.5],[-.12,.58],[-.12,-.58],[-.55,.3],[-.55,-.3]].forEach(function(p){   // les sept points : posés SUR la carapace
    const u=p[0]*rx*.9,v=p[1]*rz*.95,y=cy+ry*Math.sqrt(Math.max(0,1-(u/rx)*(u/rx)-(v/rz)*(v/rz)));
    sp(noirM,cx+u,y-.01,v,.12,.05,.12);});
  B.add(G10.box,noirM,cx,cy+ry-.015,0,0,0,0,rx*1.5,.02,.03);                                                     // la raie du milieu
  for(let sd=-1;sd<=1;sd+=2){
    B.add(h1_tube([[-.7,.5,sd*.12],[-.8,.7,sd*.2],[-.92,.82,sd*.3]],[.04,.032,.03],6,8),noirM,0,0,0);   // l'antenne
    sp(noirM,-.92,.84,sd*.3,.07);                                                                          // son bout rond
    const ex=-.72,ey=.34,ez=sd*.22;
    sp(blancM,ex-.06,ey,ez,.15,.16,.13);                                                                         // le grand œil blanc
    sp(noirM,ex-.15,ey-.01,ez+sd*-.005,.085,.1,.085);                                                            // la pupille
    sp(luisM,ex-.21,ey+.04,ez-sd*.02,.032,.036,.032);                                                            // son reflet
    sp(joue,-XE-.04,-.14,sd*.3,.07,.05,.04);                                                                     // la joue rose
  }
  for(let q=0;q<7;q++){const a=(q/6-.5)*1.5;sp(bouche,-XE-.055,-.2-.045*Math.cos(a)+.045,Math.sin(a)*.10,.017);}   // le petit sourire
}
/* ===== LE LAPIN BLANC DE L'ÉPAVE (30/10, Léo : « les oreilles lapin je les veux identiques à avant ») — le palier 1 reste l'épave rouillée, avec JUSTE les deux oreilles de la première version
   (celle du 28/10 sur le main) : deux grands ellipsoïdes blancs plantés dans le dessus du bloc, intérieur rose, une bien droite, l'autre un peu molle. Le groupe s'appelle 'lapin' ===== */
function lapin0(g,L,M){
  const top=new THREE.Box3().setFromObject(g).max.y,grp=new THREE.Group();grp.name='lapin';
  const mat=function(col,sh,sp){return new THREE.MeshPhongMaterial({color:col,shininess:sh,specular:sp,side:THREE.DoubleSide,flatShading:true});};
  const fur=mat(0xf7f4ee,14,0x333333),rose=mat(0xff9fbc,30,0x553344);
  const ell=function(m,x,y,z,rx,ry,rz,ax,az){const e=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),m);e.position.set(x,y,z);e.scale.set(rx,ry,rz);e.rotation.order='ZXY';e.rotation.set(ax||0,0,az||0);grp.add(e);return e;};
  const eh=.62;
  [[-1,.16,-.1],[1,-.1,.14]].forEach(function(o){      /* [côté, penché de côté, penché en arrière] */
    const zc=o[0]*.14,y0=top-eh*.2;
    ell(fur,-.04,y0+eh*.86,zc,.085,eh,.17,o[0]*o[1],o[2]);                              /* l'oreille : ellipsoïde haut et large */
    ell(rose,-.1,y0+eh*.8,zc,.05,eh*.8,.105,o[0]*o[1],o[2]);                             /* l'intérieur rose, un peu en avant */
  });
  g.add(grp);
}
/* ============ ARTISTE 1 — LES OUTILS DE SCULPTURE (h1_*) : crânes lofts, tubes effilés, plumes posées ============
   h1_loft : un solide balayé le long de X — chaque section [x, cy, demi-largeur z, demi-hauteur y, décalage z, aplat du dessous] ; `pw` > 2 = carré
   h1_tube : un tube EFFILÉ qui suit une courbe (cornes, pattes, tentacules, becs) — rayons [r0,…,rN] le long du chemin, la pointe peut valoir ~0
   h1_pose : pose une pièce plane (plume, nageoire) selon son axe et la normale de son plan */
let COLIB14=false;function setColib14(v){COLIB14=v;}   /* (29/10) vrai pendant la fabrication du palier 14 : le palier 3 d'origine (bloc de 3 cylindres + colibri) y est refait tel quel, sur la palette du 14 */
const H1PI=Math.PI;
function h1_loft(sc,n,pw){
  n=n||10;const pos=[],idx=[],uv=[],m=sc.length,e=2/(pw||2);
  for(let a=0;a<m;a++){const s=sc[a];
    for(let k=0;k<n;k++){const t=k/n*2*H1PI,c=Math.cos(t),sn=Math.sin(t);
      const z=(c<0?-1:1)*Math.pow(Math.abs(c),e)*s[2];let y=(sn<0?-1:1)*Math.pow(Math.abs(sn),e)*s[3];if(y<0&&s[5]!=null)y*=s[5];
      pos.push(s[0],s[1]+y,(s[4]||0)+z);uv.push(a/Math.max(1,m-1)*2,k/n*2);}}
  for(let a=0;a<m-1;a++)for(let k=0;k<n;k++){const k2=(k+1)%n,A=a*n+k,Bb=a*n+k2,C=(a+1)*n+k,D=(a+1)*n+k2;idx.push(A,C,Bb,Bb,C,D);}
  const c0=pos.length/3;pos.push(sc[0][0],sc[0][1],sc[0][4]||0);uv.push(0,0);const c1=c0+1;pos.push(sc[m-1][0],sc[m-1][1],sc[m-1][4]||0);uv.push(2,0);
  for(let k=0;k<n;k++){const k2=(k+1)%n;idx.push(c0,k2,k);idx.push(c1,(m-1)*n+k,(m-1)*n+k2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function h1_ell(cx,cy,cz,rx,ry,rz,n,m){      // un ellipsoïde à facettes (n pans, m tranches)
  const sc=[];m=m||7;for(let j=0;j<m;j++){const t=(j+.5)/m*H1PI;sc.push([cx-rx*Math.cos(t),cy,rz*Math.sin(t),ry*Math.sin(t),cz]);}
  return h1_loft(sc,n||10,2);
}
function h1_tube(pts,rr,seg,rad,flat){
  const cv=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'catmullrom',.5);
  const N=seg||14,R=rad||6,fr=cv.computeFrenetFrames(N,false),pos=[],idx=[],uv=[];
  const ra=t=>{const f=t*(rr.length-1),a=Math.min(rr.length-1,Math.floor(f)),b=Math.min(rr.length-1,a+1);return rr[a]+(rr[b]-rr[a])*(f-a);};
  for(let a=0;a<=N;a++){const t=a/N,p=cv.getPointAt(t),r=ra(t),nn=fr.normals[a],bn=fr.binormals[a];
    for(let k=0;k<R;k++){const th=k/R*2*H1PI,c=Math.cos(th)*r,s=Math.sin(th)*r*(flat||1);
      pos.push(p.x+nn.x*c+bn.x*s,p.y+nn.y*c+bn.y*s,p.z+nn.z*c+bn.z*s);uv.push(t*3,k/R*2);}}
  for(let a=0;a<N;a++)for(let k=0;k<R;k++){const k2=(k+1)%R,A=a*R+k,Bb=a*R+k2,C=(a+1)*R+k,D=(a+1)*R+k2;idx.push(A,C,Bb,Bb,C,D);}
  const c0=pos.length/3,p0=cv.getPointAt(0),p1=cv.getPointAt(1);pos.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z);uv.push(0,0,3,0);
  for(let k=0;k<R;k++){const k2=(k+1)%R;idx.push(c0,k2,k);idx.push(c0+1,N*R+k,N*R+k2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
const H1M=new THREE.Matrix4(),H1X=new THREE.Vector3(),H1Y=new THREE.Vector3(),H1Z=new THREE.Vector3(),H1E=new THREE.Euler();
function h1_pose(B,geo,mat,p,xd,nz,sc){        // axe de la pièce = xd, normale du plan = nz
  H1X.copy(xd).normalize();H1Z.copy(nz);H1Z.addScaledVector(H1X,-H1Z.dot(H1X)).normalize();H1Y.crossVectors(H1Z,H1X);
  H1M.makeBasis(H1X,H1Y,H1Z);H1E.setFromRotationMatrix(H1M,'XYZ');
  B.add(geo,mat,p.x,p.y,p.z,H1E.x,H1E.y,H1E.z,sc||1,sc||1,sc||1);
}
function h1_plume(len,w,th){return plan10([[0,-w*.5],[len*.55,-w*.5],[len*.9,-w*.28],[len,0],[len*.9,w*.28],[len*.55,w*.5],[0,w*.5]],th||.02,.004);}
function h1_ico(){return G10.ico1||(G10.ico1=new THREE.IcosahedronGeometry(1,0));}
const h1_v=(x,y,z)=>new THREE.Vector3(x,y,z);
const h1_dent=(B,m,p,d,r,l,seg)=>vers10(B,cone10(r,l,seg||5),m,p,d.clone().normalize(),1);
const h1_mix=(a,b,t)=>a+(b-a)*t;
function h1_seg(B,m,p,dir,len,r){vers10(B,tourX([[.001,0],[r*.78,len*.12],[r,len*.5],[r*.8,len*.9],[.001,len]],10),m,p,dir.clone().normalize(),1);}  // un anneau de queue, bombé
function h1_oeil(B,K,x,y,z,r,sd,rim){B.add(G10.sph,rim||K.or,x,y,z-sd*r*.1,0,0,0,r*1.18,r*1.18,r*1.18);B.add(G10.sph,K.noir,x,y,z+sd*r*.12,0,0,0,r,r,r);B.add(G10.sph,K.glow,x-r*.42,y+r*.38,z+sd*r*.55,0,0,0,r*.3,r*.3,r*.3);}

/* ===== P1 — LE SCARABÉE : le moteur EST le coléoptère. Élytres = le couvre-culasse, corselet, tête à corne de rhinocéros, mandibules, six pattes ===== */
function h1_p1(B,K,L,XE,top){
  const X0=-XE+.26,X1=XE+.20,cyE=top-.10;
  const ep=t=>({w:.20*Math.pow(Math.sin(H1PI*(.10+.85*t)),.6)+.012,h:.20*Math.pow(Math.sin(H1PI*(.04+.92*t)),.7)+.02+.10});
  const surf=(h,w,o)=>h*Math.pow(Math.max(0,1-Math.pow(Math.abs(o)/w,2.4)),1/2.4);
  for(let sd=-1;sd<=1;sd+=2){const sc=[],dz=t=>sd*(.19-.02*t);
    for(let k=0;k<=10;k++){const t=k/10,p=ep(t);sc.push([X0+(X1-X0)*t,cyE,p.w,p.h,dz(t),.40]);}
    B.add(h1_loft(sc,12,2.4),K.col,0,0,0);
    for(const o of [-.085,.085]){const pts=[];for(let k=1;k<=9;k++){const t=k/10,p=ep(t);pts.push([X0+(X1-X0)*t,cyE+surf(p.h,p.w,o)+.004,dz(t)+o]);}
      B.add(h1_tube(pts,[.009,.009,.009],10,4),K.or,0,0,0);}
    B.add(h1_tube([[X1-.02,cyE+.02,sd*.17],[X1+.10,cyE-.06,sd*.15],[X1+.16,cyE-.16,sd*.10]],[.06,.05,.012],6,6),K.col,0,0,0);}   // la pointe des élytres
  BXg(B,K.or,(X0+X1)/2,top-.015,0,0,0,0,X1-X0,.030,.040);                                                                              // la suture d'or
  // le corselet
  B.add(h1_loft([[-XE-.14,.50,.12,.10,0,.6],[-XE+.02,.62,.30,.19,0,.5],[-XE+.20,.70,.37,.20,0,.5],[-XE+.40,.70,.38,.19,0,.5],[-XE+.50,.62,.32,.12,0,.5]],12,2.3),K.col,0,0,0);
  B.add(h1_tube([[-XE-.04,.80,0],[X0+.16,.83,0]],[.014,.014],4,4),K.or,0,0,0);
  // la tête, en coin plongeant
  B.add(h1_loft([[-XE+.12,.30,.37,.27,0,.6],[-XE-.12,.31,.38,.26,0,.6],[-XE-.34,.28,.34,.21,0,.55],[-XE-.54,.24,.26,.16,0,.5],[-XE-.70,.21,.14,.10,0,.5]],10,2.4),K.colD,0,0,0);
  B.add(h1_loft([[-XE-.30,.46,.20,.025,0],[-XE-.52,.40,.24,.04,0],[-XE-.74,.30,.14,.03,0]],8,2),K.col,0,0,0);                              // le chaperon, laqué
  for(let sd=-1;sd<=1;sd+=2){
    B.add(h1_ell(-XE-.26,.38,sd*.30,.13,.11,.09,8,5),K.noir,0,0,0);B.add(G10.sph,K.glow,-XE-.30,.39,sd*.345,0,0,0,.07,.075,.05);   // l'œil composé
    B.add(h1_tube([[-XE-.50,.20,sd*.15],[-XE-.84,.22,sd*.27],[-XE-1.10,.26,sd*.07]],[.07,.055,.007],10,6),K.lame,0,0,0);              // la mandibule
    h1_dent(B,K.or,h1_v(-XE-.74,.24,sd*.15),h1_v(-.2,.1,-sd*.8),.02,.1,4);
    B.add(h1_tube([[-XE-.34,.40,sd*.10],[-XE-.62,.54,sd*.22],[-XE-.84,.58,sd*.30]],[.016,.013,.010],6,4),K.or,0,0,0);                   // l'antenne
    for(let q=0;q<3;q++){const f=h1_v(-XE-.84-q*.035,.58+q*.02,sd*.30+q*.04);B.add(h1_plume(.17,.05,.014),K.or,f.x,f.y,f.z,0,PI10,sd*(.5+q*.35));}
    // les pattes
    for(let k=0;k<3;k++){const x=(k-1)*L*.30,dv=(k-1)*.20;
      B.add(G10.sph,K.or,x,-.02,sd*.32,0,0,0,.07,.07,.07);
      B.add(h1_tube([[x,-.02,sd*.32],[x+dv*.4,.10,sd*.62],[x+dv*.8,.02,sd*.78]],[.055,.05,.04],6,6),K.or,0,0,0);
      B.add(h1_tube([[x+dv*.8,.02,sd*.78],[x+dv*1.1,-.22,sd*.86],[x+dv*1.25,-.50,sd*.84]],[.04,.03,.016],6,6),K.or,0,0,0);
      B.add(G10.sph,K.or,x+dv*.8,.02,sd*.78,0,0,0,.055,.055,.055);
      for(let q=0;q<3;q++)h1_dent(B,K.or,h1_v(x+dv*(.9+q*.11),-.12-q*.12,sd*.86),h1_v(0,-.2,sd),.014,.07,4);
      h1_dent(B,K.lame,h1_v(x+dv*1.25,-.50,sd*.84),h1_v(dv*.3,-1,sd*.3),.02,.1,4);}
  }
  h1_dent(B,K.or,h1_v(-XE-.04,.36,0),h1_v(-.15,1,0),.10,.30,8);                                                                          // la corne du corselet
  B.add(h1_tube([[-XE-.30,.40,0],[-XE-.46,.62,0],[-XE-.56,.92,0],[-XE-.36,1.20,0]],[.11,.085,.055,.008],14,8),K.or,0,0,0);                // LA corne de rhinocéros
  B.add(h1_tube([[-XE-.44,.30,0],[-XE-.50,.36,0]],[.10,.09],2,8),K.colD,0,0,0);
  for(let k=0;k<3;k++)B.add(new THREE.TorusGeometry(.13+k*.0,.02,5,10),K.or,XE+.20+k*.17,.14,0,0,PI10/2,0);                                // l'abdomen annelé autour de la tuyère
}
/* ===== P2 — LE COLIBRI : tête ronde au long bec d'or, gorge qui brille, ailes en V qui battent, queue en ciseaux ===== */
function h1_p2(B,K,L,XE,top){
  /* RETOUCHE 27/10 : le moteur est un VRAI colibri — un torse en fuseau plumeux et irisé qui recouvre le bloc, une gorge qui flambe, un bec fin et net,
     et DEUX VRAIES AILES : un bras à l'avant-bord, des primaires longues en éventail serré, des secondaires qui raccourcissent vers l'épaule, relevées en V. */
  const LY=.34,BS=[[.0,.66,-.04,.32],[.35,.94,-.18,.43],[.80,.98,-.20,.46],[1.20,.84,-.18,.40],[1.55,.58,-.04,.25],[1.80,.42,.06,.15]];   // ox, dessus, dessous, demi-largeur
  const bs=(ox,j)=>{for(let k=0;k<BS.length-1;k++){if(ox>=BS[k][0]&&ox<=BS[k+1][0]){const t=(ox-BS[k][0])/(BS[k+1][0]-BS[k][0]);return BS[k][j]+(BS[k+1][j]-BS[k][j])*t;}}return BS[ox<BS[0][0]?0:BS.length-1][j];};
  B.add(h1_loft(BS.map(q=>[-XE+q[0],LY,q[3],q[1]-LY,0,.16]),12,2.4),K.col,0,0,0);                                                         // le DOS irisé, qui cache le couvre-culasse
  B.add(h1_loft(BS.map(q=>[-XE+q[0],LY,q[3]*.994,.04,0,(LY-q[2])/.04]),12,3.4),K.blanc,0,0,0);                                          // le ventre pâle (une demi-coquille : le haut ne dépasse jamais du dos)
  // la tête : ronde, calot qui luit, joue sombre
  B.add(h1_ell(-XE-.22,.34,0,.44,.30,.30,12,8),K.col,0,0,0);
  B.add(h1_ell(-XE-.18,.52,0,.28,.10,.21,10,6),K.colD,0,0,0);                                                                             // le front, plus sombre
  B.add(h1_ell(-XE-.04,.50,0,.20,.08,.14,8,5),K.glow,0,0,0);                                                                              // le calot irisé
  B.add(h1_loft([[-XE-.50,.22,.06,.05],[-XE-.30,.20,.28,.14],[-XE-.0,.17,.35,.19],[-XE+.34,.14,.37,.20],[-XE+.60,.12,.26,.12]],10,2),K.glow,0,0,0);   // la GORGE qui flambe
  B.add(h1_tube([[-XE-.52,.33,0],[-XE-.95,.30,0],[-XE-1.42,.20,0]],[.058,.030,.003],12,6),K.or,0,0,0);                                  // le bec : long, fin, net
  B.add(h1_tube([[-XE-.52,.28,0],[-XE-.88,.24,0],[-XE-1.22,.16,0]],[.040,.018,.003],10,6),K.lame,0,0,0);                                // la mandibule du bas
  for(let sd=-1;sd<=1;sd+=2){h1_oeil(B,K,-XE-.36,.44,sd*.245,.055,sd,K.or);
    B.add(h1_ell(-XE-.14,.20,sd*.27,.18,.10,.07,8,5),K.colD,0,0,0);                                                                      // la joue
    // L'AILE : bras à l'avant-bord, primaires en éventail, couvertures, relevée en V
    const S=h1_v(-XE+.42,bs(.42,1)-.10,sd*.30),wd=h1_v(.34,.74,sd*.56).normalize(),ct=h1_v(1,0,0).addScaledVector(wd,-wd.x).normalize(),nz=new THREE.Vector3().crossVectors(wd,ct).multiplyScalar(sd);
    const AL=.92,T=S.clone().addScaledVector(wd,AL);
    B.add(G10.sph,K.colD,S.x,S.y,S.z,0,0,0,.13,.11,.12);                                                                                  // l'épaule
    B.add(h1_tube([[S.x,S.y,S.z],[S.x+wd.x*AL*.5,S.y+wd.y*AL*.5+.03,S.z+wd.z*AL*.5],[T.x,T.y,T.z]],[.062,.040,.010],10,6),K.colD,0,0,0);    // le bras : l'avant-bord de l'aile
    B.add(h1_tube([[S.x,S.y+.01,S.z],[S.x+wd.x*AL*.5,S.y+wd.y*AL*.5+.04,S.z+wd.z*AL*.5],[T.x,T.y+.005,T.z]],[.012,.010,.004],10,4),K.glow,0,0,0);   // le filet irisé de l'avant-bord
    for(let r=0;r<2;r++)for(let k=0;k<10;k++){const f=k/9,s0=(r?.06:.10)+f*.84,ph=((1-f)*52+4+r*5)*H1PI/180,len=(r?.40:.48)+(r?.26:.46)*Math.pow(f,.8),
        dir=wd.clone().multiplyScalar(Math.cos(ph)).addScaledVector(ct,Math.sin(ph)),bp=S.clone().addScaledVector(wd,AL*s0).addScaledVector(nz,(r?.026:-.004));
      h1_pose(B,h1_plume(len,.15-.045*f+(r?.0:.012),.018),((k+r)%2)?K.colD:K.col,bp,dir,nz);}
    // le dos plumeux : des rangs de plumes qui se recouvrent, comme des écailles irisées, couchées vers l'arrière
    for(let q=0;q<3;q++)for(let k=0;k<6;k++){const ox=.36+k*.19+q*.07,zz=sd*(.10+q*.115),w=bs(ox,3),yy=LY+(bs(ox,1)-LY)*Math.pow(Math.max(0,1-Math.pow(Math.abs(zz)/w,2.4)),1/2.4)+.012;
      h1_pose(B,h1_plume(.30,.16,.016),(k+q)%2?K.col:K.colD,h1_v(-XE+ox,yy,zz),h1_v(1,-.20,sd*.22),h1_v(sd*.0,1,sd*Math.abs(zz)/w*.9));}
  }
  BXg(B,K.glow,0,bs(.8,1)+.004,0,0,0,0,L*.45,.012,.05);                                                                                   // la raie irisée de l'échine
  B.add(h1_loft([[XE-.10,.44,.16,.10],[XE+.14,.46,.14,.08],[XE+.30,.48,.09,.05]],10,2),K.colD,0,0,0);                                     // le croupion
  for(let k=0;k<7;k++){const f=(k-3)/3,a=f*.55,len=.70+.60*Math.abs(f),dir=h1_v(Math.cos(a),.10+Math.abs(f)*.10,Math.sin(a));              // la queue en ciseaux, au-dessus de la tuyère
    h1_pose(B,h1_plume(len,.20,.022),k%2?K.col:K.colD,h1_v(XE+.05,.50,f*.06),dir,h1_v(0,1,0));}
}
/* ===== P3 — LE SCORPION : carapace à tergites, deux grosses pinces, huit pattes, la queue née de l'échappement et recourbée sur le dos ===== */
function h1_p3(B,K,L,XE,top){
  const n=5,xa=-XE+.12,xb=XE-.04,w=(xb-xa)/n;
  for(let k=0;k<n;k++){const x0=xa+k*w,x1=x0+w+.04,xm=(x0+x1)/2,r=.30-k*.012;
    B.add(h1_loft([[x0,top-.06,.16,.03],[x0+w*.35,top-.02,r,.13,0,.4],[xm+w*.2,top-.01,r,.14,0,.4],[x1,top-.07,r*.8,.04,0,.5]],10,2.2),k%2?K.colD:K.col,0,0,0);
    BXg(B,K.glow,xm,top+.115,0,0,0,0,w*.55,.014,.03);
    for(let sd=-1;sd<=1;sd+=2)h1_dent(B,K.or,h1_v(xm,top-.03,sd*(r-.02)),h1_v(0,.1,sd),.03,.11,4);}
  B.add(h1_loft([[-XE-.16,.50,.14,.10,0,.5],[-XE+.04,.74,.30,.16,0,.5],[-XE+.30,.84,.30,.14,0,.5]],10,2),K.col,0,0,0);                       // le front
  B.add(h1_ell(-XE-.0,.98,0,.10,.07,.075,8,4),K.col,0,0,0);                                                                                     // la bosse des yeux
  for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.glow,-XE-.06,1.015,sd*.04,0,0,0,.04,.04,.04);B.add(G10.sph,K.glow,-XE-.20,.68,sd*.22,0,0,0,.028,.028,.028);B.add(G10.sph,K.glow,-XE-.26,.62,sd*.12,0,0,0,.024,.024,.024);}
  B.add(h1_loft([[-XE+.10,.24,.30,.28,0,.7],[-XE-.18,.28,.28,.22,0,.6],[-XE-.34,.30,.20,.13,0,.5],[-XE-.42,.28,.10,.08,0,.5]],10,2.2),K.colD,0,0,0);   // le museau
  for(let sd=-1;sd<=1;sd+=2){
    const a=h1_v(-XE+.08,.22,sd*.28),b=h1_v(-XE-.30,.20,sd*.62),c=h1_v(-XE-.56,.22,sd*.58);
    B.add(h1_tube([[a.x,a.y,a.z],[b.x,b.y,b.z],[c.x,c.y,c.z]],[.13,.115,.105],10,8),K.col,0,0,0);
    B.add(G10.sph,K.or,b.x,b.y,b.z,0,0,0,.13,.13,.13);
    B.add(h1_ell(c.x-.22,c.y,sd*.50,.34,.19,.22,10,6),K.col,0,0,0);                                                                              // la paume
    B.add(h1_loft([[c.x-.26,.34,.17,.03,sd*.50],[c.x-.48,.33,.14,.03,sd*.48],[c.x-.64,.31,.08,.02,sd*.44]],8,2),K.colD,0,0,0);
    B.add(h1_tube([[c.x-.40,.22,sd*.62],[c.x-.78,.22,sd*.64],[c.x-1.06,.22,sd*.42]],[.12,.085,.014],12,7),K.col,0,0,0);                         // le doigt fixe
    B.add(h1_tube([[c.x-.38,.22,sd*.36],[c.x-.74,.22,sd*.28],[c.x-1.04,.22,sd*.38]],[.10,.075,.014],12,7),K.colD,0,0,0);                       // le doigt mobile
    h1_dent(B,K.or,h1_v(c.x-1.04,.22,sd*.395),h1_v(-.6,0,0),.02,.08,4);
    for(let k=0;k<4;k++){const x=-XE+.42+k*(L-.8)/3,dv=(k-1.5)*.16;
      B.add(h1_tube([[x,.04,sd*.30],[x+dv*.5,.18,sd*.72],[x+dv*.9,.0,sd*1.0],[x+dv*1.1,-.48,sd*1.04]],[.06,.05,.04,.014],10,5),K.colD,0,0,0);
      B.add(G10.sph,K.or,x+dv*.5,.18,sd*.72,0,0,0,.065,.065,.065);}
  }
  const path=new THREE.CatmullRomCurve3([h1_v(XE-.10,.36,0),h1_v(XE+.30,.40,0),h1_v(XE+.62,.76,0),h1_v(XE+.54,1.18,0),h1_v(XE+.14,1.52,0),h1_v(-XE*.35,1.54,0),h1_v(-XE*.80,1.34,0)]);
  const ns=7;
  for(let k=0;k<ns;k++){const t0=k/ns,t1=Math.min(1,(k+1)/ns+.035),p0=path.getPointAt(t0),p1=path.getPointAt(t1),r=.22-k*.017;
    h1_seg(B,k%2?K.colD:K.col,p0,p1.clone().sub(p0),p1.distanceTo(p0),r);}
  for(let k=1;k<ns;k++){const p=path.getPointAt(k/ns);B.add(G10.sph,K.or,p.x,p.y,p.z,0,0,0,.075,.075,.075);}
  const pe=path.getPointAt(1);
  B.add(h1_ell(pe.x-.06,pe.y-.05,0,.19,.14,.12,10,6),K.col,0,0,0);                                                                              // l'ampoule du dard
  B.add(h1_tube([[pe.x-.12,pe.y-.08,0],[pe.x-.34,pe.y-.12,0],[pe.x-.46,pe.y-.36,0],[pe.x-.40,pe.y-.58,0]],[.07,.06,.04,.004],10,7),K.glow,0,0,0);   // l'aiguillon, d'ambre
  B.add(h1_tube([[XE-.12,.26,0],[XE-.02,.30,0],[XE+.20,.38,0]],[.17,.15,.13],4,8),K.colD,0,0,0);
}
/* ===== P4 — LE HIBOU : le disque facial EST la face du moteur ; dos rond, grandes ailes déployées en doigts de plumes, serres, queue en éventail ===== */
function h1_p4(B,K,L,XE,top){
  const yE=.42;
  B.add(h1_ell(-XE+.10,.56,0,.40,.36,.50,14,7),K.col,0,0,0);                                                                              // le crâne, large et rond
  B.add(h1_loft([[-XE+.30,.14,.36,.14,0,.8],[-XE+.02,.18,.46,.24,0,.8],[-XE-.10,.22,.44,.20,0,.8]],12,2.2),K.col,0,0,0);                   // le menton / le jabot
  // le dos, arrondi, sur le couvre-culasse
  B.add(h1_loft([[-XE+.30,top-.02,.20,.06,0],[-XE+.60,top+.04,.34,.20,0,.4],[XE-.50,top+.04,.35,.21,0,.4],[XE-.10,top-.02,.26,.12,0,.4],[XE+.12,top-.10,.12,.05,0]],12,2.2),K.col,0,0,0);
  for(let k=0;k<7;k++){const x=-XE+.50+k*(L-.8)/6;for(let sd=-1;sd<=1;sd+=2)h1_pose(B,h1_plume(.30,.13,.02),(k)%2?K.colD:K.or,h1_v(x,top+.17,sd*.07),h1_v(1,.04,sd*.5),h1_v(0,1,-sd*.3));}
  for(let sd=-1;sd<=1;sd+=2){const zc=sd*.25;
    TX(B,K.col,[[.001,.14],[.16,.12],[.30,.07],[.40,.02],[.44,.0],[.46,.08],[.44,.20],[.001,.20]],-XE-.20,yE,zc,0,20);
    B.add(new THREE.TorusGeometry(.44,.03,5,24),K.or,-XE-.20,yE,zc,0,PI10/2,0);
    TX(B,K.or,[[.001,0],[.185,0],[.20,.03],[.185,.06],[.001,.06]],-XE-.19,yE,zc,0,20);
    TX(B,K.glow,[[.001,0],[.15,0],[.15,.02],[.001,.02]],-XE-.225,yE,zc,0,20);
    TX(B,K.noir,[[.001,0],[.075,0],[.075,.02],[.001,.02]],-XE-.245,yE,zc,0,16);
    B.add(G10.sph,K.blanc,-XE-.26,yE+.06,zc-sd*.04,0,0,0,.022,.022,.022);
    B.add(h1_ell(-XE-.20,yE+.285,zc+sd*.03,.15,.035,.13,8,5),K.colD,0,0,0);
    for(let q=0;q<3;q++){const d=h1_v(-.22+q*.14,1,sd*(.52-q*.16));h1_pose(B,h1_plume(.66-q*.12,.14,.022),q%2?K.col:K.colD,h1_v(-XE+.08+q*.04,.86,sd*(.34+q*.04)),d,h1_v(0,-sd*.2,1));}
    // l'aile déployée : un bras, deux rangées de plumes qui font le doigt
    const sh=h1_v(-XE+.62,top-.04,sd*.26);B.add(G10.sph,K.colD,sh.x,sh.y,sh.z,0,0,0,.13,.11,.13);
    const T=.28,nz=h1_v(0,Math.cos(T),-sd*Math.sin(T));
    for(let r=0;r<2;r++)for(let k=0;k<(r?6:8);k++){const f=k/(r?5:7),psi=(-14+f*84)*H1PI/180,len=(r?.55:.80)+(r?.25:.55)*Math.sin(.25+f*2.7),
        dir=h1_v(-Math.sin(psi)*-1*0+Math.sin(psi),Math.sin(T)*.9,sd*Math.cos(psi)).normalize();
      h1_pose(B,h1_plume(len,.21-r*.03,.024),(k+r)%2?K.colD:K.col,sh.clone().addScaledVector(nz,(r*.04+k*.004)),dir,nz);}
    B.add(h1_tube([[sh.x,sh.y,sh.z],[sh.x-.04,sh.y+.08,sh.z+sd*.45],[sh.x-.12,sh.y+.16,sh.z+sd*.82]],[.06,.045,.02],6,6),K.or,0,0,0);
    // les serres
    const g0=h1_v(-XE+.40,-.30,sd*.22);
    B.add(h1_tube([[g0.x,g0.y,g0.z],[g0.x-.06,-.52,sd*.26]],[.08,.06],2,6),K.col,0,0,0);
    for(let q=0;q<3;q++){const a=(q-1)*.34;B.add(h1_tube([[g0.x-.06,-.52,sd*.26],[g0.x-.32,-.58,sd*(.26+a*.5)],[g0.x-.52,-.52,sd*(.26+a*.9)]],[.036,.028,.01],6,5),K.or,0,0,0);
      h1_dent(B,K.noir,h1_v(g0.x-.52,-.52,sd*(.26+a*.9)),h1_v(-.1,-1,0),.022,.1,4);}
    // les plumes du flanc
    for(let r=0;r<3;r++)for(let k=0;k<5;k++)h1_pose(B,h1_plume(.34,.15,.02),(k+r)%2?K.col:K.colD,h1_v(-XE+.42+k*(L-.9)/4+r*.07,.34-r*.17,sd*(.36+r*.012)),h1_v(1,-.20,0),h1_v(0,0,sd));
  }
  B.add(h1_tube([[-XE-.14,.52,0],[-XE-.46,.44,0],[-XE-.62,.22,0]],[.11,.08,.006],10,8),K.or,0,0,0);
  B.add(h1_loft([[-XE-.02,.58,.06,.14,0],[-XE-.14,.54,.08,.16,0],[-XE-.30,.48,.06,.10,0]],8,2),K.colD,0,0,0);
  for(let k=0;k<7;k++){const f=(k-3)/3,a=f*.62,dir=h1_v(Math.cos(a),.12,Math.sin(a));
    h1_pose(B,h1_plume(.95-Math.abs(f)*.25,.21,.022),k%2?K.col:K.colD,h1_v(XE-.10,.50,f*.05),dir,h1_v(0,1,0));}
}
/* ===== P5 — LE REQUIN : un crâne sculpté (museau large, gueule ouverte, dents en rangées, narines, arcade, œil), ouïes, nageoires, queue en deux lobes de part et d'autre de la tuyère ===== */
function h1_p5(B,K,L,XE,top){
  const H=[[.78,.86,.28],[.50,.78,.34],[.24,.66,.40],[-.08,.56,.42],[-.34,.47,.42],[-.60,.38,.37],[-.85,.30,.28],[-1.04,.22,.18],[-1.17,.15,.06]];     // ox, dessus, demi-largeur
  const yM=ox=>ox>-.30?-.06:-.06+(-.30-ox)*.04;                                                                          // la ligne de gueule
  const ia=(a,ox,j)=>{for(let k=0;k<a.length-1;k++){if(ox<=a[k][0]&&ox>=a[k+1][0]){const t=(a[k][0]-ox)/(a[k][0]-a[k+1][0]);return a[k][j]+(a[k+1][j]-a[k][j])*t;}}return a[a.length-1][j];};
  const gape=ox=>Math.max(0,(-.10-ox))*.24;
  const up=H.map(h=>[-XE+h[0],(h[1]+yM(h[0]))/2,h[2],(h[1]-yM(h[0]))/2,0,.35]);
  B.add(h1_loft(up,12,2.5),K.col,0,0,0);                                                                                   // le crâne et le museau
  const LJ=[[.20,.37],[-.10,.37],[-.34,.35],[-.60,.31],[-.84,.23],[-1.00,.14],[-1.07,.05]];
  B.add(h1_loft(LJ.map(a=>{const top2=yM(a[0])-gape(a[0])-.005,bot=top2-.20+(a[0]<-.5?(-.5-a[0])*.18:0);return [-XE+a[0],(top2+bot)/2,a[1],(top2-bot)/2,0,.7];}),12,2.3),K.blanc,0,0,0);   // la mâchoire
  B.add(h1_loft(LJ.slice(1,6).map(a=>[-XE+a[0],yM(a[0])-gape(a[0])/2,a[1]*.9,gape(a[0])/2+.03,0]),8,2),K.noir,0,0,0);        // la gorge, sombre
  for(let sd=-1;sd<=1;sd+=2){
    for(let k=0;k<10;k++){const ox=-.16-k*.105,w=ia(H,ox,2)*.86,l=.10+.05*Math.sin(Math.min(1,k/7)*3.1)-.004*k;
      h1_dent(B,K.blanc,h1_v(-XE+ox,yM(ox)+.005,sd*w),h1_v(0,-1,0),.032,l,5);
      const o2=ox-.05,w2=ia(LJ,o2,1)*.82;h1_dent(B,K.blanc,h1_v(-XE+o2,yM(o2)-gape(o2)-.01,sd*w2),h1_v(0,1,0),.026,l*.82,5);}
    // l'œil, sous son arcade
    B.add(G10.sph,K.glow,-XE-.30,.30,sd*.395,0,0,0,.095,.095,.075);B.add(G10.sph,K.noir,-XE-.31,.30,sd*.425,0,0,0,.068,.068,.05);
    B.add(G10.sph,K.blanc,-XE-.325,.325,sd*.455,0,0,0,.016,.016,.016);
    B.add(h1_ell(-XE-.30,.445,sd*.335,.27,.045,.075,8,5),K.colD,0,0,0);                                                                  // l'arcade
    // les narines
    BXg(B,K.noir,-XE-.96,.245,sd*.065,0,sd*.5,0,.07,.014,.022);
    // les narines déjà posées plus haut ; le reste du corps est un REVÊTEMENT (voir plus bas)
  }
  /* RETOUCHE 27/10 : LE BLOC DISPARAÎT sous un corps de requin en torpille — dos facetté (K.col), ventre blanc net, ligne latérale, cinq ouïes marquées,
     pectorales larges, deux dorsales, anale, pédoncule qui file vers la tuyère et la caudale à deux lobes. La tête, elle, n'est pas touchée. */
  const BS=[[.12,.62,-.30,.37],[.45,.80,-.32,.40],[.85,.99,-.36,.46],[1.25,1.00,-.38,.48],[1.65,.96,-.36,.45],[1.95,.66,-.22,.31],[2.20,.40,-.10,.18],[2.38,.28,-.02,.13]];   // ox, dessus, dessous, demi-largeur
  const bs=(ox,j)=>{for(let k=0;k<BS.length-1;k++){if(ox>=BS[k][0]&&ox<=BS[k+1][0]){const t=(ox-BS[k][0])/(BS[k+1][0]-BS[k][0]);return BS[k][j]+(BS[k+1][j]-BS[k][j])*t;}}return BS[ox<BS[0][0]?0:BS.length-1][j];};
  const LY=.12;
  B.add(h1_loft(BS.map(q=>[-XE+q[0],LY,q[3],q[1]-LY,0,.12]),12,2.5),K.col,0,0,0);                                                       // le DOS et les flancs
  B.add(h1_loft(BS.map(q=>[-XE+q[0],LY,q[3]*.994,LY-q[2],0,1]),12,2.5),K.blanc,0,0,0);                                                  // le VENTRE blanc
  for(let sd=-1;sd<=1;sd+=2){
    // les cinq ouïes : des fentes inclinées, ourlées de chrome, qui s'allongent vers le haut
    for(let k=0;k<5;k++){const ox=.62+k*.082,w=bs(ox,3)*.985,hh=.50-k*.02;
      BXg(B,K.noir,-XE+ox,LY+.16,sd*(w+.012),0,0,sd*.20,.020,hh,.022);
      BXg(B,K.chrome,-XE+ox-.026,LY+.16,sd*(w+.006),0,0,sd*.20,.007,hh+.03,.016);}
    // la ligne latérale, qui court de l'opercule à la queue
    {const pts=[];for(const ox of [.80,1.05,1.35,1.65,1.90,2.10])pts.push([-XE+ox,LY,sd*(bs(ox,3)*.99+.008)]);B.add(h1_tube(pts,[.011,.011,.011,.011,.011,.008],16,4),K.glow,0,0,0);}
    // les plaques du flanc : deux filets chromés qui suivent la torpille (dessus du flanc, limite du ventre)
    {const pts=[],q2=[];for(const ox of [.80,1.10,1.40,1.70,1.95,2.15]){const w=bs(ox,3);pts.push([-XE+ox,LY+.30*(bs(ox,1)-LY)/.80+.10,sd*(w*.90+.01)]);q2.push([-XE+ox,LY-.12,sd*(w*.96+.008)]);}
      B.add(h1_tube(pts,[.008,.008,.008,.008,.008,.006],16,4),K.chrome,0,0,0);B.add(h1_tube(q2,[.009,.009,.009,.009,.009,.007],16,4),K.chrome,0,0,0);}
    // la pectorale : large, en faux, qui part du flanc juste derrière l'ouïe
    B.add(plan10([[0,.20],[.46,.08],[1.04,-.34],[1.42,-1.02],[.88,-.76],[.40,-.50],[0,-.24]],.05,.012),K.col,-XE+.54,.0,sd*(bs(.56,3)*.92),-sd*1.05,0,0);
        // la pelvienne
    B.add(plan10([[0,0],[.30,-.04],[.40,-.34],[.14,-.22]],.03,.008),K.col,-XE+1.46,-.26,sd*bs(1.46,3)*.78,-sd*.8,0,0);
  }
  B.add(plan10([[-.50,0],[.60,0],[.44,.22],[.20,.55],[-.05,1.0],[-.24,.76],[-.42,.40]],.05,.012),K.col,-XE+.98,bs(.98,1)-.07,0);   // la dorsale
  B.add(plan10([[0,0],[.40,0],[.26,.42],[.06,.36]],.03,.008),K.col,-XE+1.38,bs(1.50,1)-.05,0);                                         // la 2e dorsale
  B.add(plan10([[0,0],[.34,0],[.16,-.30],[.0,-.22]],.03,.008),K.blanc,-XE+1.46,bs(1.6,2)+.04,0);                                       // l'anale, sous la queue
  {const pts=[];for(const ox of [.52,.85,1.25,1.65,1.95])pts.push([-XE+ox,bs(ox,1)-.012,0]);B.add(h1_tube(pts,[.016,.016,.016,.016,.012],14,4),K.or,0,0,0);}                                                                          // le filet d'or de l'échine
  // la caudale : deux lobes de part et d'autre de la tuyère, nés du pédoncule
  B.add(plan10([[-.14,.40],[.32,.54],[.66,.70],[.84,.98],[1.02,1.40],[.78,1.02],[.64,.80],[.50,.62],[.24,.50],[-.14,.34]],.05,.012),K.col,XE,0,0);
  B.add(plan10([[-.14,-.06],[.30,-.20],[.52,-.40],[.70,-.80],[.46,-.62],[.30,-.50],[-.14,-.34]],.05,.012),K.col,XE,0,0);
}
/* ===== P6 — L'ÉTOILE DE MER : la face du moteur est la face orale de l'étoile (bouche, cinq bras à sillon et pieds ambulacraires), le dos hérissé de piquants, la tuyère en étoile ===== */
function h1_p6(B,K,L,XE,top){
  const x0=-XE+.06,cy=.28;B.add(h1_ell(x0-.10,cy,0,.24,.44,.44,12,6),K.col,0,0,0);
  const arm=(dy,dz,t)=>h1_v(x0-.22*t*t-.04,cy+dy*t*.98,dz*t*.98);
  for(let k=0;k<5;k++){const a=(90+k*72)*H1PI/180,dy=Math.sin(a),dz=Math.cos(a),lat=h1_v(0,-dz,dy),P=[],R=[],rp=t=>.30*(1-.82*t)+.025;
    for(let j=0;j<=12;j++){const t=j/12,p=arm(dy,dz,t);P.push([p.x,p.y,p.z]);R.push(rp(t));}
    B.add(h1_tube(P,R,16,8),k%2?K.col:K.col,0,0,0);
    const G=[];for(let j=1;j<=11;j++){const t=j/12,p=arm(dy,dz,t);G.push([p.x-rp(t)*.92,p.y,p.z]);}
    B.add(h1_tube(G,G.map((q,j)=>.034*(1-j/14)),12,4),K.noir,0,0,0);
    for(let j=1;j<=10;j++){const t=j/11,p=arm(dy,dz,t),r=rp(t);
      for(let s=-1;s<=1;s+=2){const q=p.clone().add(h1_v(-r*.82,0,0)).addScaledVector(lat,s*r*.46);B.add(h1_ico(),K.or,q.x,q.y,q.z,0,0,0,.034*(1-t*.5),.034*(1-t*.5),.034*(1-t*.5));
        const e=p.clone().addScaledVector(lat,s*r*.96);h1_dent(B,K.blanc,e,lat.clone().multiplyScalar(s).add(h1_v(-.4,0,0)),.026*(1-t*.4),.09*(1-t*.4),5);}}
    const pt=arm(dy,dz,1);B.add(G10.sph,K.glow,pt.x-.01,pt.y,pt.z,0,0,0,.045,.045,.045);}
  B.add(tourX([[.001,.0],[.14,.0],[.15,.05],[.001,.05]],10),K.noir,x0-.50,cy,0,0,PI10,0);
  for(let k=0;k<5;k++){const a=k/5*2*H1PI+.3;h1_dent(B,K.blanc,h1_v(x0-.48,cy+Math.cos(a)*.15,Math.sin(a)*.15),h1_v(-.5,-Math.cos(a)*.7,-Math.sin(a)*.7),.045,.11,4);}
  // le dos
  for(let k=0;k<7;k++){const u=(k/6-.5)*(L-.5);h1_dent(B,K.blanc,h1_v(u,top+.01,0),h1_v(0,1,0),.045,.15,5);B.add(G10.sph,K.or,u,top+.008,0,0,0,0,.05,.03,.05);
    for(let sd=-1;sd<=1;sd+=2){h1_dent(B,K.or,h1_v(u+.08,top-.05,sd*.15),h1_v(.1,1,sd*.5),.03,.10,5);h1_dent(B,K.blanc,h1_v(u,.40,sd*.355),h1_v(0,.3,sd),.032,.10,5);}}
  for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<7;k++)h1_dent(B,K.or,h1_v((k/6-.5)*(L-.45),-.34,sd*.22),h1_v(0,-1,sd*.6),.03,.14,4);   // les pieds ambulacraires
  // la tuyère en étoile
  const xr=L*.46+.42;B.add(new THREE.TorusGeometry(.135,.05,5,10),K.col,xr,.14,0,0,PI10/2,0);
  for(let k=0;k<5;k++){const a=(90+k*72)*H1PI/180,dy=Math.sin(a),dz=Math.cos(a);
    B.add(h1_tube([[xr,.14+.10*dy,.10*dz],[xr+.12,.14+.34*dy,.34*dz],[xr+.30,.14+.62*dy,.62*dz]],[.075,.05,.01],8,6),K.col,0,0,0);
    B.add(G10.sph,K.or,xr+.30,.14+.62*dy,.62*dz,0,0,0,.035,.035,.035);}
}
/* ===== P7 — LE CORAIL, plus VIVANT (la forme aimée reste intacte : branches roses et perles) : polypes aux tentacules, anémone en proue, colonies encroûtantes, vers de mer ===== */
function h1_p7(B,K,L,XE,top){
  // RETOUCHE 27/10 — la proue : un ÉVENTAIL DE GORGONE (le boule rose à tentacules rappelait un oursin) : un pied sur la cloche, un moyeu, sept branches maîtresses qui se divisent
  // deux fois dans un seul plan, et une DENTELLE de filets qui relie les pointes ; chaque bout porte son polype de nacre
  {const hx=-XE-.02,hy=.06,hub=[hx-.20,hy+.34,0];
    B.add(h1_tube([[hx+.06,hy-.02,0],[hx-.08,hy+.12,0],hub],[.070,.055,.040],8,6),K.col,0,0,0);                       // le pied, né de la cloche d'embrayage
    B.add(new THREE.TorusGeometry(.085,.016,4,10),K.or,hx-.02,hy+.04,0,0,PI10/2,0);
    const tips=[],L0=.45,P=(u,v)=>[hub[0]-.16*v+u*.64,hub[1]+v,u*.77];                                                         // plan de l'éventail : (u = largeur, v = hauteur), penché vers l'avant
    const br=(u,v,ang,len,n,r)=>{const u2=u+Math.sin(ang)*len,v2=v+Math.cos(ang)*len;
      B.add(h1_tube([P(u,v),P((u+u2)/2+Math.cos(ang)*.012,(v+v2)/2),P(u2,v2)],[r,r*.72,r*.55],4,4),K.col,0,0,0);
      if(n>0){br(u2,v2,ang-.42,len*.70,n-1,r*.62);br(u2,v2,ang+.42,len*.70,n-1,r*.62);}else tips.push([u2,v2,ang]);};
    for(let k=0;k<6;k++){const ang=(k-2.5)*.40;br(0,0,ang,L0,2,.036);}
    tips.sort((a,b)=>a[0]-b[0]);
    for(let k=0;k<tips.length-1;k++){const A=tips[k],C=tips[k+1];if(Math.abs(A[0]-C[0])<.20&&Math.abs(A[1]-C[1])<.2)
      B.add(h1_tube([P(A[0],A[1]-.012),P((A[0]+C[0])/2,(A[1]+C[1])/2-.05),P(C[0],C[1]-.012)],[.007,.007,.007],3,3),K.blanc,0,0,0);}                // la dentelle
    for(let k=0;k<tips.length;k+=1){const q=P(tips[k][0],tips[k][1]);B.add(h1_ico(),K.blanc,q[0],q[1],q[2],0,0,0,.028,.028,.028);}             // les polypes de nacre
  }
  // les colonies encroûtantes sur les flancs
  for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<5;k++){const x=-XE*.62+k*(L*.26),y=-.20+(k%2)*.07;
      for(let q=0;q<3;q++)B.add(h1_ico(),(k+q)%2?K.col:K.blanc,x+(q-1)*.07,y+q*.035,sd*(.33+q*.02),0,0,0,.075-q*.012,.07-q*.01,.06);
      h1_dent(B,K.col,h1_v(x,y-.06,sd*.37),h1_v(0,-.2,sd),.03,.12,5);}
    // les vers de mer : un tube et sa couronne spiralée
    for(let k=0;k<2;k++){const x=XE*.32+k*.26,y=-.02+k*.07,d=h1_v(.3,.8,sd*.9).normalize();
      B.add(h1_tube([[x,y,sd*.34],[x+.05,y+.14,sd*.42],[x+.10,y+.30,sd*.46]],[.055,.045,.04],6,6),K.blanc,0,0,0);
      for(let q=0;q<3;q++){const t=q/3*2*H1PI;B.add(h1_plume(.16,.06,.012),q%2?K.col:K.or,x+.10,y+.30,sd*.46,0,t,.9+q*.1);}}
  }
}

/* ---- h2_ : les OUTILS de l'artiste 2 (hybrides 9-15 : orque, tortue, roquette, électrique, grenade, vitrail, soleil) ----
   h2_loft : un SOLIDE SCULPTÉ — des sections elliptiques (ou carrées arrondies) tenues le long de X : [[x, yCentre, demiHauteur, demiLargeur, boxité?]…]
   (boxité 2 = ellipse, 4 = presque un carré) : c'est ce qui fait un crâne, un fuselage, une carapace — pas un cône ni une boîte. */
function h2_loft(S,seg,cap,half){
  seg=seg||10;const pos=[],idx=[],R=half?seg+1:seg;   // half : seulement la moitié HAUTE (un dôme à fond plat, pour la carapace)
  for(let k=0;k<S.length;k++){const s=S[k],ex=2/(s[4]||2);
    for(let j=0;j<R;j++){const a=half?-Math.PI/2+j/seg*Math.PI:j/seg*2*Math.PI,c=half?Math.sin(a+Math.PI/2):Math.cos(a),n=half?Math.sin(a):Math.sin(a);
      pos.push(s[0],s[1]+Math.sign(c)*Math.pow(Math.abs(c),ex)*s[2],Math.sign(n)*Math.pow(Math.abs(n),ex)*s[3]);}}
  for(let k=0;k<S.length-1;k++)for(let j=0;j<R;j++){const a=k*R+j,b=k*R+(j+1)%R,c=a+R,d=b+R;idx.push(a,b,c,b,d,c);}
  if(cap!==false){const n0=pos.length/3,o=(S.length-1)*R;pos.push(S[0][0],S[0][1],0,S[S.length-1][0],S[S.length-1][1],0);
    for(let j=0;j<R;j++){idx.push(n0,(j+1)%R,j);idx.push(n0+1,o+j,o+(j+1)%R);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
/* h2_pose : pose une pièce (axe Y local = sa normale) à la position p, tournée sur la direction n — les écailles hexagonales d'une carapace */
const H2_Q=new THREE.Quaternion(),H2_E=new THREE.Euler(),H2_Y=new THREE.Vector3(0,1,0);
function h2_pose(B,geo,mat,p,n,sx,sy,sz){H2_Q.setFromUnitVectors(H2_Y,n.clone().normalize());H2_E.setFromQuaternion(H2_Q,'XYZ');B.add(geo,mat,p.x,p.y,p.z,H2_E.x,H2_E.y,H2_E.z,sx,sy,sz);}
/* h2_orient : pose une pièce à plat dans un plan — son axe X sur `ex`, sa normale (l'épaisseur d'un plan10) sur `ez` : les lancettes d'une aile */
function h2_orient(B,geo,mat,p,ex,ez){const X=ex.clone().normalize(),Y=new THREE.Vector3().crossVectors(ez,X).normalize(),Z=new THREE.Vector3().crossVectors(X,Y).normalize();
  H2_E.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z),'XYZ');B.add(geo,mat,p.x,p.y,p.z,H2_E.x,H2_E.y,H2_E.z,1,1,1);}
const h2_ANN=(B,m,R,r,x,y,z,rx,ry)=>B.add(new THREE.TorusGeometry(R,r,5,Math.max(16,Math.min(30,Math.round(R*44)))),m,x,y,z,rx||0,ry==null?PI10/2:ry,0);   // un anneau d'axe X, léger (les 40 pans d'ANN coûtaient 640 triangles pièce)
function h2_poli(c,sh,rf){return new THREE.MeshPhongMaterial({color:c,shininess:sh||220,specular:0xffffff,envMap:envTex,side:THREE.DoubleSide,reflectivity:rf==null?.35:rf,combine:THREE.MixOperation});}
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
  // la verrière : une CAGE de nervures de chrome et un chapeau plein (retouche 27/10 : plus aucune matière transparente — les yeux se voient entre les nervures)
  {const Rd=.62,yd=.075;
   for(let k=0;k<8;k++){const th=k/8*2*PI10+.2,pts=[];for(let j=0;j<=8;j++){const ph=j/8*PI10/2*.93;pts.push([Rd*Math.cos(ph)*Math.cos(th),yd+Rd*Math.sin(ph),Rd*Math.cos(ph)*Math.sin(th)]);}
     B.add(h4_tubeV(pts,t=>.026-.008*t,22,5,true),k%2?K.chrome:K.or,0,0,0);}
   for(const ph of [.38,.80]){const rr=Rd*Math.cos(ph);B.add(new THREE.TorusGeometry(rr,.020,5,24),K.chrome,0,yd+Rd*Math.sin(ph),0,PI10/2,0,0);}
   B.add(new THREE.SphereGeometry(Rd*1.01,16,4,0,2*PI10,0,.30),K.col,0,yd,0);                                        // le chapeau de la verrière, plein
   B.add(G10.sph,K.glow,0,yd+Rd*1.0+.03,0,0,0,0,.05,.05,.05);}                                                          // sa lampe de pointe
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
  // le corps : une âme d'acier sombre (queue fine, cou épais) sous des PLAQUES DE CHROME qui se chevauchent comme des tuiles (retouche 27/10)
  // la QUEUE ENTRE DANS LA GUEULE : son bout est repris dans le repère de la tête, glissé entre la mâchoire haute et la basse (retouche 27/10)
  const hF=dv.clone().normalize(),hU=V(0,Ph.y,Ph.z).normalize(),hZ=new THREE.Vector3().crossVectors(hF,hU).normalize(),hY=new THREE.Vector3().crossVectors(hZ,hF),
    toW=(a,b,c)=>Ph.clone().addScaledVector(hF,a*Lh).addScaledVector(hY,b*Lh).addScaledVector(hZ,c*Lh);
  const pts=[];for(const q of [toW(.52,-.27,0),toW(.72,-.28,0),toW(.96,-.31,-.03)])pts.push([q.x,q.y,q.z]);
  for(let k=7;k<=150;k++){const q=Kt(U1*k/150);pts.push([q.x,q.y,q.z]);}
  const rb=t=>{const base=t<.06?.03+.08*t/.06:.11+.016*Math.sin(t*9);const neck=t>.86?.034*(t-.86)/.14:0;return (base+neck)*1.35;};
  B.add(h4_tubeV(pts,t=>rb(t)*.78,150,8,true),K.lame,0,0,0);
  {const pl=(()=>{const L=1,Wd=1,T=1,v=[[0,0,0],[0,0,0]],g=new THREE.BufferGeometry(),A=[.58,0,0],Bk=[-.5,0,0],Lt=[-.1,0,-.5],Rt=[-.1,0,.5],Tp=[.2,.40,0],Bt=[.0,-.15,0],P=[];
      for(const [a1,b1] of [[Lt,Tp],[Tp,Rt],[Rt,Bt],[Bt,Lt]]){P.push(...A,...a1,...b1);P.push(...Bk,...b1,...a1);}
      g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;})();
   const NS=96,mats=[K.chrome,K.metal,K.chrome,K.alu];
   for(let row=0;row<3;row++){const rot=row===0?0:(row===1?1.05:-1.05);
     for(let k=5;k<NS;k++){const t=k/NS,u=U1*t,c=Kt(u),a=Kt(u-.002),b=Kt(u+.002),tg=a.clone().sub(b),rr=rb(t),radial=V(0,c.y,c.z).normalize();
       const fwv=tg.clone().normalize();                                   // la pointe de chaque plaque regarde la queue, comme une écaille de serpent
       const upv=radial.clone().applyAxisAngle(fwv,rot*(k%2?1:1));
       const pos=c.clone().addScaledVector(upv,rr*.66);
       const e=new THREE.Euler();const x=fwv,zz=new THREE.Vector3().crossVectors(x,upv).normalize(),yy=new THREE.Vector3().crossVectors(zz,x);
       e.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,yy,zz),'XYZ');
       B.add(pl,(row===0&&k%9===0)?K.or:mats[(k+row)%4],pos.x,pos.y,pos.z,e.x,e.y,e.z,.34+rr*.9,rr*1.25,rr*1.55);}}}
  {const c=toW(.84,-.29,-.01),a=toW(.78,-.285,0),b=toW(.90,-.30,-.02);h4_pose(B,new THREE.TorusGeometry(.075,.02,5,14).rotateY(PI10/2),K.or,c,a.clone().sub(b),V(0,c.y,c.z),1);const q=toW(.50,-.27,0);B.add(G10.sph,K.glow,q.x,q.y,q.z,0,0,0,.05,.05,.05);}   // la bague d'or où la queue entre dans la gueule, et la braise de son bout
  // la tête, construite en longueur 1 dans son repère (+x devant, +y haut), posée au cou
  const fw=dv.clone().normalize(),up=V(0,Ph.y,Ph.z).normalize(),sec=(x,y,w,hu,hd,p,z)=>({x:x,y:y,w:w,hu:hu,hd:hd,p:p||2.6,z:z||0});
  const HK=1.45,put=(geo,m,tx,ty,tz,rz)=>{if(rz)geo.rotateZ(rz);geo.scale(1,HK,HK);geo.translate(tx||0,(ty||0)*HK,(tz||0)*HK);h4_pose(B,geo,m,Ph,fw,up,Lh);};   // HK : une tête plus lourde, lisible de loin
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

/* ===== RAIJIN (30/10, Léo : « essaye quelque chose de nouveau, plus beau, là c'est toy ») — le dieu japonais du tonnerre, en statoréacteur : un fuselage laqué INDIGO à prise d'air de démon (huit crocs, deux cornes d'or),
   un cône de choc de chrome, la couronne de HUIT TAMBOURS (bords d'or, peau de foudre) tenue au fuselage par huit rayons d'or, la foudre blanche qui saute de tambour en tambour, une écharpe de rubans qui flotte derrière ===== */
function h5_raijin(B,K){
  const PI=H1PI,R=1.08,XR=.10,laque=h2_poli(0x2b2f8f,260,.45),laque2=h2_poli(0x4a52d8,260,.45),peau=new THREE.MeshBasicMaterial({color:0x7fefff}),foudre=new THREE.MeshBasicMaterial({color:0xffffff});
  // le fuselage et sa tuyère
  TX(B,laque,[[.32,0],[.44,.45],[.50,1.20],[.42,1.75],[.34,1.90]],-.92,0,0,0,32);
  TX(B,K.or,[[.52,0],[.52,.05],[.50,.10]],-.30,0,0,0,32);TX(B,K.or,[[.52,0],[.52,.05],[.50,.10]],.62,0,0,0,32);                             // deux bagues d'or
  TX(B,K.chrome,[[.46,0],[.42,.14],[.50,.40],[.66,.70]],-.92,0,0,PI,32);TX(B,K.glow,[[.001,0],[.46,0],[.46,.02]],-.94,0,0,0,24);ANN(B,K.haloF,.60,.06,-1.30,0,0);   // la tuyère : cloche de chrome, cœur de foudre
  // la prise d'air de démon : lèvre de chrome, cône de choc, huit crocs, deux cornes d'or
  TX(B,K.chrome,[[.36,0],[.42,.06],[.40,.20],[.34,.26]],.98,0,0,0,32);
  vers10(B,cone10(.26,.95,18),K.chrome,new THREE.Vector3(1.05,0,0),new THREE.Vector3(1,0,0),1);                                              // le cône de choc
  for(let k=0;k<8;k++){const a=k/8*2*PI+.2,c=Math.cos(a),s=Math.sin(a);vers10(B,cone10(.045,.30,5),foudre,new THREE.Vector3(1.20,c*.40,s*.40),new THREE.Vector3(1,c*.10,s*.10),1);}   // les crocs
  for(let sd=-1;sd<=1;sd+=2)vers10(B,cone10(.07,.70,7),K.or,new THREE.Vector3(.95,.40,sd*.30),new THREE.Vector3(.35,1,sd*.55),1);                // les cornes
  // la couronne de huit tambours + son anneau d'or
  B.add(new THREE.TorusGeometry(R,.04,6,48),K.or,XR,0,0,0,PI/2,0);
  const ctr=[];
  for(let k=0;k<8;k++){const a=k/8*2*PI,c=Math.cos(a),s=Math.sin(a),y=c*R,z=s*R;ctr.push([XR,y,z]);
    B.add(new THREE.CylinderGeometry(.21,.21,.30,18),laque2,XR,y,z,0,0,PI/2);                                                                 // le fût du tambour
    B.add(new THREE.CylinderGeometry(.215,.215,.02,18),K.or,XR+.17,y,z,0,0,PI/2);B.add(new THREE.CylinderGeometry(.215,.215,.02,18),K.or,XR-.17,y,z,0,0,PI/2);   // les cercles d'or
    B.add(new THREE.CylinderGeometry(.17,.17,.02,18),peau,XR+.175,y,z,0,0,PI/2);                                                              // la peau
    for(let q=0;q<3;q++){const b=q/3*2*PI+k;B.add(G10.sph,K.or,XR+.19,y+Math.cos(b)*.075,z+Math.sin(b)*.075,0,0,0,.04,.04,.04);}              // les trois virgules d'or (tomoe)
    B.add(h1_tube([[0,0,0],[XR,c*R*.40,s*R*.40],[XR,c*(R-.22),s*(R-.22)]],[.03,.025,.025],4,4),K.or,0,0,0);                                  // le rayon d'or
  }
  // la foudre : un éclair en zigzag entre deux tambours voisins
  for(let k=0;k<8;k++){const A=ctr[k],Bq=ctr[(k+1)%8],pts=[[A[0]+.16,A[1],A[2]]];
    for(let q=1;q<5;q++){const f=q/5,o=(q%2?1:-1)*.11;pts.push([XR+.20+Math.sin(k*2.3+q)*.06,A[1]+(Bq[1]-A[1])*f+o*Math.cos((k+.5)/8*2*PI),A[2]+(Bq[2]-A[2])*f+o*Math.sin((k+.5)/8*2*PI)]);}
    pts.push([Bq[0]+.16,Bq[1],Bq[2]]);
    B.add(h1_tube(pts,[.012,.016,.012,.016,.012,.012],12,4),foudre,0,0,0);B.add(h1_tube(pts,[.04,.05,.04,.05,.04,.04],12,5),K.haloC,0,0,0);}
  // l'écharpe : douze rubans qui partent des tambours et flottent vers l'arrière
  for(let k=0;k<12;k++){const a=k/12*2*PI,c=Math.cos(a),s=Math.sin(a);
    h3_leaf(B,k%3===0?peau:k%3===1?laque2:K.blanc,[[XR-.10,c*(R+.05),s*(R+.05)],[XR-.80,c*(R+.30)+Math.sin(k)*.12,s*(R+.30)+Math.cos(k)*.12],[XR-1.85,c*(R+.62)+Math.sin(k*1.7)*.2,s*(R+.62)+Math.cos(k*1.7)*.2]],.16,{ribMat:K.or});}
}
/* ===== LA COMÈTE v3 (28/10, Léo : « améliore et refonds le moteur 28 » ; la traînée viendra plus tard, pour les paliers 20+) — le renard de glace, étoffé :
   un cœur de glace brûlant tenu dans l'anneau d'or, deux couronnes d'éclats de crinière, une gueule ouverte à crocs, une gorgerette de cristaux, des éclats d'or aux pointes ===== */
function h5_comete(B,K){
  h4_comete(B,K);
  const k=1.9,x0=.10,P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const pk=(x,y,z,d,r,l,m,sg)=>vers10(B,cone10(r*k,l*k,sg||4),m,P(x0+x*k,y*k,z*k),d,1);
  // la gueule : une mâchoire inférieure entrouverte, quatre crocs, la langue de braise
  B.add(h4_loft([{x:x0+.62*k,y:-.17*k,w:.07*k,hu:.022*k,hd:.04*k,p:2.4,z:0},{x:x0+.82*k,y:-.20*k,w:.05*k,hu:.018*k,hd:.03*k,p:2.4,z:0},{x:x0+.98*k,y:-.20*k,w:.025*k,hu:.012*k,hd:.02*k,p:2.4,z:0}],6),K.blanc,0,0,0);
  for(let sd=-1;sd<=1;sd+=2){pk(.90,-.075,sd*.045,D(.2,-1,sd*.15),.018,.17,K.chrome,5);pk(.80,-.19,sd*.04,D(.15,1,sd*.1),.014,.10,K.chrome,5);}
  B.add(G10.sph,K.glow,x0+.84*k,-.13*k,0,0,0,0,.05*k,.025*k,.04*k);
  // la crinière : une seconde couronne d'éclats, plus petits et plus nombreux, décalée
  for(let j=0;j<16;j++){const a=(j+.5)/16*2*PI10,c=Math.cos(a),sn=Math.sin(a);pk(-.14,sn*.36,c*.36,D(-1,sn*.9,c*.9),.045,.50+(j%4)*.07,j%2?K.chrome:K.col);}
  // la gorgerette : une grappe de cristaux sous le museau
  for(let j=0;j<5;j++){const a=(j-2)*.42;pk(.16,-.19,Math.sin(a)*.20,D(.30+.1*Math.abs(j-2),-1,Math.sin(a)*.9),.075-.012*Math.abs(j-2),.38-.04*Math.abs(j-2),j%2?K.metal:K.col,5);}
  // le cœur : une gemme à facettes brûlante, tenue au centre de l'anneau (elle touche le cou)
  B.add(new THREE.IcosahedronGeometry(.17*k,0),K.glow,x0-.04,0,0);
  B.add(new THREE.OctahedronGeometry(.26*k,0),K.halo(0xffd0a0,.30),x0-.04,0,0);
  // l'anneau d'or : douze crans runiques
  for(let j=0;j<12;j++){const a=j/12*2*PI10,tau=.5,Rr=.62*k,cn=Math.cos(a)*Rr,sn=Math.sin(a)*Rr;
    B.add(G10.box,K.glow,x0-.04-sn*Math.sin(tau),sn*Math.cos(tau)*0+sn*Math.cos(tau),cn,0,0,tau,.03,.03,.07);}
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
  case 1:{ // LE SCARABÉE — HYBRIDE : élytres = couvre-culasse, corne de rhinocéros, mandibules, pattes
    h1_p1(B,K,L,XE,top);break;}
  case 2:{ // LA COCCINELLE KAWAII (30/10 : le lapin reste au 1, la coccinelle remplace l'escargot au 3) — le bloc du palier garde sa forme, rouge à points noirs, antennes, grands yeux, joues roses et sourire
    if(COLIB14)h1_p2(B,K,L,XE,top);else h5_coccinelle(B,K,L,XE,top);break;}
  case 3:{ // LE SCORPION — HYBRIDE : tergites, pinces, huit pattes, la queue née de l'échappement
    h1_p3(B,K,L,XE,top);break;}
  case 4:{ // LE HIBOU — HYBRIDE : le disque facial est la face, ailes repliées, serres, queue en éventail
    h1_p4(B,K,L,XE,top);break;}
  case 5:{ // LE REQUIN — HYBRIDE : crâne sculpté (museau, gueule, dents, narines, arcade, œil), ouïes, nageoires, caudale en deux lobes
    h1_p5(B,K,L,XE,top);break;}
  case 6:{ // L'ÉTOILE DE MER — HYBRIDE : la face orale de l'étoile, cinq bras à sillon, dos hérissé, tuyère en étoile
    h1_p6(B,K,L,XE,top);break;}
  case 7:{ // LE CORAIL — des branches roses qui poussent au-dessus du vé, perles de nacre au bout
    const br=(p,d,l,n)=>{const q=p.clone().addScaledVector(d,l);tige(p,q,.022+.016*n,K.col);if(n<=1){B.add(G10.ico||(G10.ico=new THREE.IcosahedronGeometry(1,1)),K.blanc,q.x,q.y,q.z,0,0,0,.05,.05,.05);for(let u=0;u<5;u++){const a=u/5*2*PI10;corne(q.clone().addScaledVector(D(Math.cos(a)*.6,.5,Math.sin(a)*.6),.04),D(Math.cos(a)*.7,.9,Math.sin(a)*.7),.016,.10,K.col);}return;}
      br(q,D(d.x+.35,d.y,d.z+.45),l*.78,n-1);br(q,D(d.x-.35,d.y,d.z-.45),l*.78,n-1);};
    for(let k=0;k<3;k++)br(P((k-1)*L*.30,top-.02,(k-1)*.04),D(0,1,0),.30,3);
    h1_p7(B,K,L,XE,top);
    break;}
  case 8:{ // L'ORQUE (h2, retouché) — LE MOTEUR EST l'orque : un revêtement NOIR LAQUÉ lisse recouvre tout le dessus du bloc (une vraie ligne d'orque : melon, nuque, dos qui monte
    //   à l'aileron puis file vers le pédoncule), le ventre BLANC dessous, la selle grise nette derrière l'aileron, les taches d'œil blanches, la cloche d'embrayage = la tête sculptée,
    //   et l'échappement = le pédoncule qui finit en queue à nageoires horizontales autour de la tuyère à braise
    const W=h2_poli(0xffffff,150,.22),G=new THREE.MeshPhongMaterial({color:0x5f6b82,shininess:30,specular:0x10141c,side:THREE.DoubleSide}),hx=-XE-.02,
      T=new THREE.MeshPhongMaterial({color:0x0b0d13,shininess:70,specular:0x2c3444,envMap:envTex,side:THREE.DoubleSide,reflectivity:.12,combine:THREE.MixOperation});   // le noir laqué : un reflet qui accroche, pas un miroir
    // la ligne du dos : des clés [x, hauteur du sommet, demi-largeur] lissées (Catmull-Rom) — monte de la nuque à l'aileron, s'affine vers le pédoncule
    const KY=[[-.78,.40,.30],[-.55,.60,.37],[-.30,.68,.41],[0,.75,.42],[.28,.71,.41],[.52,.60,.39],[.74,.47,.35],[.98,.24,.17]];
    const dos=x=>{let q=0;while(q<KY.length-2&&x>KY[q+1][0])q++;const t=Math.max(0,Math.min(1,(x-KY[q][0])/(KY[q+1][0]-KY[q][0])));
      const p0=KY[Math.max(0,q-1)],p1=KY[q],p2=KY[q+1],p3=KY[Math.min(KY.length-1,q+2)],cr=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
      return [x,-.04,cr(p0[1],p1[1],p2[1],p3[1]),cr(p0[2],p1[2],p2[2],p3[2])];};
    // le dos : UNE demi-coque noire laquée (équateur y=-.04), échantillonnée finement
    const DS=[];for(let x=-.78;x<=.981;x+=.115)DS.push(dos(x));
    B.add(h2_loft(DS.map(d=>[d[0],d[1],d[2]+.04,d[3]]),14,true,true),T,0,0,0);
    // le ventre blanc : un fuseau plein, plus étroit que le dos, qui n'apparaît que sous l'équateur
    B.add(h2_loft([[-.60,-.12,.38,.34],[-XE+.42,-.14,.50,.43],[0,-.16,.54,.44],[L*.20,-.14,.50,.42],[.52,-.12,.42,.39],[.74,-.08,.31,.31],[.98,-.04,.20,.18],[1.15,-.02,.08,.09]],12,true),W,0,0,0);
    // la tête : le melon qui prolonge la nuque, puis le rostre court
    B.add(h2_loft([[hx+.34,.10,.50,.39,2.5],[hx+.06,.13,.45,.42,2.5],[hx-.20,.12,.40,.41,2.4],[hx-.44,.09,.31,.33,2.4],[hx-.64,.03,.20,.23,2.4],[hx-.80,-.03,.10,.13,2.4]],12),T,0,0,0);
    // la mâchoire inférieure et la gorge : BLANCHES
    B.add(h2_loft([[hx+.30,-.25,.17,.34,2.6],[hx+.0,-.26,.16,.355,2.6],[hx-.30,-.24,.13,.30,2.5],[hx-.56,-.19,.10,.21,2.4],[hx-.76,-.14,.05,.11,2.4]],12),W,0,0,0);
    // la selle grise derrière l'aileron : une coque fine posée sur le dos (même ligne, plus étroite et un peu plus haute), ses bouts s'enfoncent dans le dos
    const sad=(x,k,e)=>{const d=dos(x);return [x,-.04,d[2]+.04+e,d[3]*k];};
    const SX=[[.02,.62,-.08],[.10,1.02,.02],[.24,1.03,.026],[.38,1.03,.026],[.50,1.02,.02],[.62,.66,-.07]];
    B.add(h2_loft(SX.map(q=>sad(q[0],q[1],q[2])),12,true,true),G,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      // la tache blanche derrière l'œil (oblique, qui monte vers l'arrière, comme l'orque) — grande, pour qu'elle se lise de loin
      B.add(G10.sph,W,hx-.25,.20,sd*.385,0,0,.30,.25,.085,.05);
      B.add(G10.sph,K.noir,hx-.47,.11,sd*.315,0,0,0,.045,.045,.034);B.add(G10.sph,K.glow,hx-.475,.115,sd*.332,0,0,0,.026,.026,.022);
      // la ligne de bouche : un trait sombre du rostre aux joues
      B.add(tube10([[hx-.80,-.07,sd*.08],[hx-.56,-.09,sd*.20],[hx-.28,-.10,sd*.35],[hx+.02,-.07,sd*.42]],.012,12,4),K.noir,0,0,0);
      // les dents : une rangée blanche, haut et bas
      for(let k=0;k<6;k++){const x=hx-.12-k*.11,z=sd*(.36-k*.04);vers10(B,cone10(.022,.085,5),W,P(x,-.115,z),D(0,-1,0),1);vers10(B,cone10(.020,.075,5),W,P(x-.03,-.085,z*.96),D(0,1,0),1);}
      // la tache blanche de la hanche, au ras du flanc
      B.add(G10.sph,W,L*.30,-.02,sd*.405,0,0,sd*.1,.30,.10,.04);
      // la palette pectorale : large, arrondie, qui part du flanc
      B.add(plan10([[0,0],[.20,.40],[.46,.70],[.70,.58],[.62,.24],[.32,-.02]],.05,.01),T,-XE+.50,-.12,sd*.36,sd*PI10/2,0,-.35);
    }
    B.add(G10.sph,K.noir,hx+.10,.60,0,0,0,0,.08,.016,.035);                                                              // l'évent
    // le grand aileron dorsal, en faucille, planté dans le dos
    B.add(plan10([[-.34,0],[-.14,.36],[.18,.98],[.14,.56],[.42,0]],.07,.012),T,-L*.04,.60,0);
    B.add(plan10([[-.34,.02],[-.14,.36],[.18,.98],[.145,.92],[-.10,.34],[-.28,.05]],.09,.004),K.glow,-L*.04,.60,0);       // le liseré de glace du bord d'attaque
    // la queue : le pédoncule qui s'affine, les deux nageoires horizontales, la tuyère à braise au milieu
    B.add(h2_loft([[XE-.10,.0,.32,.30,2.6],[XE+.18,.03,.24,.22,2.5],[XE+.42,.05,.13,.14,2.4]],10),T,0,0,0);
    const tx=XE+.40;
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.18,.46],[.40,.80],[.52,.70],[.34,.30],[.38,0]],.05,.01),T,tx,.05,0,sd*PI10/2,0,0);
    TX(B,K.chrome,[[.10,0],[.15,.06],[.25,.24],[.31,.34]],tx+.06,.05,0,0,12);B.add(new THREE.TorusGeometry(.31,.012,4,20),K.or,tx+.40,.05,0,0,PI10/2,0);
    TX(B,K.glow,[[.001,0],[.23,0],[.23,.02],[.001,.02]],tx+.38,.05,0,0,12);
    c.echap=[tx+.42,.05,0];
    break;}
  case 9:{ // LA TORTUE (h2) — LE MOTEUR EST la tortue : les deux couvre-culasses du boxer = les écailles marginales de la carapace (dôme + écailles hexagonales),
    //   la cloche d'embrayage = la TÊTE qui sort du carter (crâne, bec, arcade, œil), les quatre nageoires = des bras de piston articulés à l'épaule chromée,
    //   la queue = l'échappement : petite queue d'écailles et tuyère à braise
    const hx=-XE,DM=[[-XE+.08,-.08,.26,.40],[-XE+.28,-.08,.56,.88],[-XE+.55,-.08,.68,1.02],[-.04,-.08,.72,1.06],[XE-.32,-.08,.66,1.02],[XE-.02,-.07,.52,.86],[XE+.20,-.06,.28,.48]];
    B.add(h2_loft(DM,16,true,true),K.colD,0,0,0);                                                     // la carapace : un dôme à fond plat
    const sec=x=>{for(let k=0;k<DM.length-1;k++){const a=DM[k],b=DM[k+1];if(x>=a[0]&&x<=b[0]){const t=(x-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}}return DM[DM.length-1].slice(1);};
    const ecaille=(x,z,r)=>{const q=sec(x),yc=q[0],ry=q[1],rz=q[2],f=Math.sqrt(Math.max(0,1-(z/rz)*(z/rz)));if(f<.15)return;const y=yc+ry*f,n=new THREE.Vector3(0,1,z*ry/(rz*rz*f));
      h2_pose(B,G10.cyl6,K.col,P(x,y+.012,z),n,r,.045,r);h2_pose(B,G10.cyl6,K.or,P(x,y+.034,z),n,r*.5,.02,r*.5);};
    for(let k=0;k<4;k++)ecaille(-XE+.35+k*(L-.55)/3,0,.17);                                           // la colonne vertébrale : quatre grandes
    for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<3;k++)ecaille(-XE+.46+k*(L-.74)/2,sd*.42,.15);for(let k=0;k<4;k++)ecaille(-XE+.30+k*(L-.40)/3,sd*.70,.11);}   // les côtes, puis les marginales
    // RETOUCHE 27/10 : la tête devient une VRAIE tête de tortue — cou plissé qui sort de la carapace, crâne bombé aux joues larges, museau court et franc,
    // bec corné crochu, paupière lourde ; les nageoires sont des PALETTES qui jaillissent sous le bord de la carapace et filent en arrière
    {const pr=[];for(let k=0;k<DM.length;k++)pr.push([DM[k][0],DM[k][1],-DM[k][3]*.995]);pr.push([DM[DM.length-1][0]+.04,DM[DM.length-1][1],0]);for(let k=DM.length-1;k>=0;k--)pr.push([DM[k][0],DM[k][1],DM[k][3]*.995]);pr.push([DM[0][0]-.03,DM[0][1],0]);pr.push(pr[0]);
      B.add(h1_tube(pr,[.03,.03],40,6),K.or,0,0,0);}                                                                             // le filet d'or qui ceint le bord de la carapace
    const HH=[[hx+.30,.0,.29,.31],[hx+.0,.02,.29,.31],[hx-.14,.04,.27,.29],[hx-.24,.07,.29,.33],[hx-.36,.07,.30,.36],[hx-.48,.05,.26,.32],[hx-.58,.02,.20,.24],[hx-.66,-.01,.15,.17],[hx-.72,-.03,.11,.12]];
    const hT=x=>{for(let k=0;k<HH.length-1;k++){const a=HH[k],b=HH[k+1];if(x<=a[0]&&x>=b[0]){const t=(a[0]-x)/(a[0]-b[0]);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}}return HH[HH.length-1].slice(1);};
    B.add(h2_loft(HH.map(q=>[q[0],q[1],q[2],q[3],2.3]),12),K.col,0,0,0);                                                          // cou + crâne : voûte bombée, joues larges, museau court
    for(let k=0;k<4;k++){const x=hx+.12-k*.075;B.add(new THREE.TorusGeometry(.316-k*.006,.028,5,12),k%2?K.col:K.colD,x,.02,0,0,PI10/2,0);}   // le cou PLISSÉ : quatre bourrelets
    [[-.30,.085],[-.45,.075],[-.58,.05]].forEach(q=>{const x=hx+q[0],t=hT(x),y=t[0]+t[1]-.012;h2_pose(B,G10.cyl6,K.colD,P(x,y,0),D(0,1,.02),q[1],.03,q[1]);h2_pose(B,G10.cyl6,K.or,P(x,y+.02,0),D(0,1,.02),q[1]*.45,.018,q[1]*.45);});   // la voûte : trois plaques cornées
    B.add(h1_tube([[hx-.56,.03,0],[hx-.70,.02,0],[hx-.78,-.04,0],[hx-.80,-.11,0]],[.11,.082,.050,.006],10,8,.95),K.or,0,0,0);        // le bec : le crochet corné
    B.add(h2_loft([[hx-.44,-.10,.07,.19,2.4],[hx-.62,-.10,.055,.12,2.4],[hx-.74,-.09,.035,.07,2.4]],8),K.colD,0,0,0);              // le bec inférieur
    B.add(h2_loft([[hx-.12,-.13,.07,.20,2.4],[hx-.34,-.13,.07,.25,2.4],[hx-.50,-.11,.06,.18,2.4]],8),K.glow,0,0,0);                // la gorge claire
    for(let sd=-1;sd<=1;sd+=2){
      B.add(G10.sph,K.noir,hx-.47,.10,sd*.272,0,0,0,.075,.075,.05);B.add(G10.sph,K.glow,hx-.485,.105,sd*.296,0,0,0,.034,.034,.02);       // l'œil : braise sur fond noir
      B.add(new THREE.TorusGeometry(.080,.013,4,12),K.or,hx-.47,.10,sd*.288,0,0,0);                                                       // le bord de la paupière
      B.add(h1_ell(hx-.47,.145,sd*.262,.095,.034,.06,8,4),K.colD,0,0,0);                                                                 // la PAUPIÈRE : un bourrelet qui retombe sur le haut de l'œil
      B.add(G10.sph,K.noir,hx-.69,.04,sd*.045,0,0,0,.022,.022,.02);                                                                      // la narine
      B.add(tube10([[hx-.74,-.02,sd*.05],[hx-.62,-.04,sd*.17],[hx-.46,-.05,sd*.30],[hx-.36,-.02,sd*.32]],.012,8,4),K.noir,0,0,0);        // la ligne de la bouche, relevée au coin
      B.add(h1_ell(hx-.30,.0,sd*.325,.07,.10,.03,7,4),K.colD,0,0,0);                                                                      // le tympan (la plaque ronde derrière l'œil)
      for(let r=0;r<2;r++){const xr=r?XE-.22:-XE+.42,z0=sd*.84,big=r?.62:1;
        B.add(G10.sph,K.chrome,xr,-.10,z0,0,0,0,.15*big+.03,.15*big+.03,.15*big+.03);B.add(new THREE.TorusGeometry(.16*big+.03,.016,5,16),K.or,xr,-.10,z0,0,PI10/2,0);
        B.add(plan10(r?[[-.12,0],[-.02,.10],[.10,.22],[.26,.28],[.38,.22],[.30,.10],[.24,0]]:[[-.14,0],[-.04,.12],[.08,.26],[.24,.40],[.46,.48],[.58,.40],[.46,.26],[.40,.12],[.32,0]],.06,.012),K.col,xr,-.10,z0,sd*(PI10/2+.5),0,0);
        tige(P(xr,-.10,z0),P(xr+(r?.14:.24),-.10,z0+sd*(r?.14:.22)),.032,K.chrome);}}
    // la queue et l'échappement : une petite queue d'écailles, la tuyère à braise au bout
    B.add(h2_loft([[XE-.10,.0,.17,.20,2.4],[XE+.18,.02,.12,.14,2.4],[XE+.34,.04,.08,.09,2.4]],8),K.col,0,0,0);
    const tx=XE+.26;TX(B,K.chrome,[[.07,0],[.11,.05],[.19,.18],[.24,.26]],tx,.05,0,0,12);B.add(new THREE.TorusGeometry(.24,.012,4,18),K.or,tx+.28,.05,0,0,PI10/2,0);TX(B,K.glow,[[.001,0],[.18,0],[.18,.02],[.001,.02]],tx+.26,.05,0,0,12);
    c.echap=[tx+.30,.05,0];
    break;}
  case 10:{ // LA ROQUETTE (h2) — LE MOTEUR EST la fusée vivante : le V8 est le fuselage blanc, la cloche d'embrayage = le NEZ-VISAGE (hublots-yeux de braise,
    //   sourcils en colère, large sourire à dents de requin), les deux nacelles latérales = ses poumons (tenues au fuselage par des bras), l'échappement =
    //   la grande tuyère à braise cernée de quatre ailerons
    const Wh=h2_poli(0x8791b0,110,.10),yc=.30,nx=-XE-.80;
    const FS=[[nx,yc,.02,.02],[nx+.12,yc,.13,.13],[nx+.32,yc,.26,.26],[nx+.55,yc,.37,.37],[-XE+.12,yc,.52,.52]];
    B.add(h2_loft(FS,14),K.col,0,0,0);                                                              // l'ogive rouge, qui bombe
    const rN=x=>{for(let k=0;k<FS.length-1;k++){const a=FS[k],b=FS[k+1];if(x>=a[0]&&x<=b[0])return a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]);}return FS[FS.length-1][2];};
    B.add(h2_loft([[-XE+.10,yc,.52,.52],[-XE+.35,yc,.60,.60],[0,yc,.62,.62],[XE-.15,yc,.60,.60],[XE+.10,yc,.48,.48]],14),Wh,0,0,0);   // le fuselage blanc
    for(const x of [-XE+.24,-L*.18,L*.14,XE-.12])TX(B,K.col,[[.625,0],[.625,.07]],x,yc,0,0,14);        // les bandes rouges
    for(const x of [-XE+.12,XE+.08])h2_ANN(B,K.or,.56,.014,x,yc,0);
    // la peau rivetée : deux rangs de rivets d'or de part et d'autre de chaque bande rouge, et le long couturage d'or du dos et du ventre
    for(const x of [-XE+.24,-L*.18,L*.14,XE-.12])for(const dx of [-.06,.06])for(let k=0;k<16;k++){const a=k/16*2*PI10;B.add(G10.cyl6,K.or,x+dx,yc+Math.cos(a)*.62,Math.sin(a)*.62,a,0,0,.026,.03,.026);}
    for(const a of [0,PI10/2,PI10,PI10*1.5])B.add(G10.axeX8,K.or,-XE+.14,yc+Math.cos(a)*.625,Math.sin(a)*.625,0,0,0,L-.1,.008,.008);   // quatre coutures d'or : dos, flancs, ventre
    // le visage : yeux-hublots, sourcils, sourire
    for(let sd=-1;sd<=1;sd+=2){const ex=-XE-.30,ey=yc+.12,ez=sd*Math.sqrt(Math.max(.01,rN(ex)*rN(ex)-.0144))+sd*.01;
      B.add(new THREE.TorusGeometry(.115,.022,6,14),K.chrome,ex,ey,ez,0,sd*.30,0);B.add(G10.sph,K.glow,ex,ey,ez+sd*.01,0,0,0,.10,.10,.04);B.add(G10.sph,K.noir,ex-.03,ey-.01,ez+sd*.03,0,0,0,.045,.05,.02);
      BXg(B,K.colD,ex+.02,ey+.15,ez-sd*.02,0,sd*.30,-.45,.26,.055,.08);                              // le sourcil en colère
      const gp=[];for(let k=0;k<=6;k++){const x=nx+.22+k*.11,dy=-.17+(k/6)*.02,r=rN(x);gp.push([x,yc+dy,sd*(Math.sqrt(Math.max(.002,r*r-dy*dy))+.012)]);}
      B.add(tube10(gp,.016,16,5),K.noir,0,0,0);
      for(let k=0;k<7;k++){const q=gp[k];vers10(B,cone10(.026,.095,5),K.blanc,P(q[0],q[1],q[2]),D(0,-1,sd*.15),1);}
      // la nacelle-poumon, tenue par deux bras
      const bz=sd*.86,by=yc-.10;
      B.add(h2_loft([[-XE+.05,0,.02,.02],[-XE+.20,0,.12,.12],[-XE+.50,0,.17,.17],[XE-.20,0,.17,.17],[XE+.05,0,.12,.12]],10),Wh,0,by,bz);
      B.add(h2_loft([[-XE-.28,0,.02,.02],[-XE-.15,0,.10,.10],[-XE+.05,0,.17,.17]],10),K.col,0,by,bz);
      for(const x of [-XE+.45,XE-.35])tige(P(x,yc-.02,sd*.42),P(x,by,sd*.80),.035,K.chrome);
      TX(B,K.chrome,[[.08,0],[.12,.05],[.19,.16]],XE+.05,by,bz,0,10);TX(B,K.glow,[[.001,0],[.15,0],[.15,.02]],XE+.20,by,bz,0,10);
    }
    // les quatre ailerons de la queue
    for(let k=0;k<4;k++)B.add(plan10([[-.30,.40],[.38,.40],[.10,1.00],[-.06,1.00]],.05,.01),K.col,XE-.10,yc,0,k*PI10/2,0,0);
    // la tuyère : un grand pavillon évasé, le disque de braise
    const tx=XE+.02;TX(B,K.chrome,[[.20,0],[.25,.08],[.38,.34],[.50,.50]],tx,yc,0,0,14);h2_ANN(B,K.or,.50,.018,tx+.50,yc,0);TX(B,K.glow,[[.001,0],[.40,0],[.40,.02],[.001,.02]],tx+.48,yc,0,0,14);
    c.echap=[tx+.54,yc,0];
    break;}
  case 11:{ // L'ÉLECTRIQUE (h2, retouché) — LA BÊTE D'ORAGE : le V8 est son corps (flancs bobinés de cuivre = ses muscles), la cloche d'embrayage = une TÊTE DE TAUREAU MASSIVE
    //   (crâne large, arcades en colère, museau carré à anneau de nez d'or, naseaux, yeux d'ÉCLAIR qui brillent, oreilles), deux CORNES-BOBINES qui partent des tempes, courbent vers
    //   l'extérieur puis montent comme des cornes de taureau, un arc qui claque entre leurs boules — et l'échappement = sa queue en éclairs autour de la tuyère
    const hx=-XE,yc=.30;
    const coil=(p,d,len,r)=>{const pts=[[r*.7,0],[r*.7,.03]];const n=Math.round(len/.075);for(let k=0;k<n;k++){const x=.03+k*.075;pts.push([r*.9,x+.01],[r*1.18,x+.03],[r*1.18,x+.055],[r*.9,x+.07]);}pts.push([r*.7,len]);vers10(B,tourX(pts,10),K.cu,p,d,1);
      const e=p.clone().addScaledVector(d,len);B.add(G10.sph,K.chrome,e.x,e.y,e.z,0,0,0,r*1.7,r*1.7,r*1.7);B.add(G10.sph,K.glow,e.x,e.y,e.z,0,0,0,r*1.0,r*1.0,r*1.0);return e;};
    const arc=(a,b,n,amp,r)=>{const p=[];for(let k=0;k<=n;k++){const t=k/n,j=(k&&k<n)?(k%2?1:-1):0;p.push([a.x+(b.x-a.x)*t+j*amp*.5,a.y+(b.y-a.y)*t+j*amp,a.z+(b.z-a.z)*t+(k&&k<n?(k%3-1)*amp*.6:0)]);}B.add(tube10(p,r||.016,n*3,4),K.glow,0,0,0);};
    // le corps : le torse laqué, bobiné de cuivre
    B.add(h2_loft([[hx+.10,yc,.36,.40,2.5],[hx+.40,yc,.52,.54,2.5],[-L*.2,yc,.55,.58,2.6],[L*.2,yc,.55,.58,2.6],[XE-.05,yc,.46,.48,2.5],[XE+.25,yc,.30,.32,2.5]],12),K.col,0,0,0);
    for(let k=0;k<8;k++){const x=hx+.38+k*(L-.50)/7;h2_ANN(B,K.cu,.575,.032,x,yc,0);}
    // la tête de taureau : un crâne large et haut (laqué), puis le museau carré d'alu clair qui plonge vers l'avant
    const HS=1.22,hl=S=>S.map(q=>[q[0],q[1]+.05,q[2]*HS,q[3]*HS,q[4]]);   // la tête est plus grosse que le corps : c'est elle qui fait le taureau
    B.add(h2_loft(hl([[hx+.24,yc+.10,.54,.52,2.5],[hx-.08,yc+.17,.58,.57,2.4],[hx-.36,yc+.15,.52,.52,2.4],[hx-.60,yc+.06,.43,.45,2.3],[hx-.80,yc-.04,.35,.38,2.3]]),12),K.col,0,0,0);
    B.add(h2_loft(hl([[hx-.60,yc-.02,.34,.40,2.2],[hx-.90,yc-.08,.30,.35,2.1],[hx-1.08,yc-.11,.27,.32,2.1],[hx-1.20,yc-.12,.23,.28,2.1]]),10),K.alu,0,0,0);
    // la mâchoire d'acier, profonde, à éclateurs
    B.add(h2_loft(hl([[hx-.15,yc-.34,.15,.38,2.5],[hx-.50,yc-.35,.15,.35,2.5],[hx-.82,yc-.34,.13,.30,2.4],[hx-1.06,yc-.31,.10,.24,2.4],[hx-1.16,yc-.30,.07,.19,2.4]]),10),K.chrome,0,0,0);
    // le mufle : la plaque de nez, les naseaux, l'anneau d'or du taureau
    B.add(G10.sph,K.chrome,hx-1.20,yc-.14,0,0,0,0,.065,.24,.34);
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.noir,hx-1.26,yc-.10,sd*.14,0,0,0,.045,.065,.09);h2_ANN(B,K.or,.07,.016,hx-1.27,yc-.10,sd*.14);}
    B.add(new THREE.TorusGeometry(.14,.028,6,18),K.or,hx-1.26,yc-.29,0,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      // l'arcade : une grosse bosse en colère en travers de l'orbite, son bout extérieur plus haut que son bout intérieur
      BXg(B,K.colD,hx-.46,yc+.43,sd*.31,-sd*.35,0,0,.26,.17,.50);
      // l'œil d'ÉCLAIR : une fente en zigzag qui luit sous l'arcade, son cœur blanc-chaud
      B.add(plan10([[-.26,.05],[.18,.12],[.06,.009],[.27,-.018],[-.18,-.105],[-.03,-.009]],.06,.004),K.glow,hx-.66,yc+.22,sd*.475,0,-sd*.55,0);
      B.add(G10.sph,K.blanc,hx-.675,yc+.225,sd*.49,0,-sd*.55,0,.045,.034,.026);
      B.add(G10.sph,K.col,hx-.40,yc-.03,sd*.60,0,0,0,.12,.16,.08);     // la pommette
      // l'oreille : une grande feuille à plat qui part vers l'extérieur et retombe
      B.add(plan10([[0,0],[.12,.26],[.34,.36],[.46,.16],[.30,.0]],.04,.008),K.col,hx+.02,yc+.26,sd*.60,sd>0?PI10/2:-PI10/2,0,-.25);
      B.add(plan10([[.04,.02],[.13,.20],[.30,.28],[.38,.14],[.26,.02]],.045,.004),K.cu,hx+.02,yc+.26,sd*.605,sd>0?PI10/2:-PI10/2,0,-.25);     // l'intérieur cuivré
      for(let k=0;k<6;k++){const x=hx-.22-k*.13;vers10(B,cone10(.018,.09,5),K.chrome,P(x,yc-.18,sd*(.37-k*.03)),D(0,1,0),1);}   // les éclateurs : des dents de conducteur
      // la corne-bobine : née de la tempe, elle part vers l'extérieur puis monte et s'avance, comme une corne de taureau
      const hp=t=>P(hx-.04-.50*t*t,yc+.36+.86*(1-Math.cos(t*PI10*.5)),sd*(.50+.60*Math.sin(t*PI10*.5)));
      const N=13;
      for(let k=0;k<N;k++){const t0=k/N,t1=(k+1)/N,a=hp(t0),b=hp(t1),dir=b.clone().sub(a),len=dir.length(),r=.16-.09*t0;
        vers10(B,tourX([[r*.80,0],[r*1.15,len*.15],[r*1.15,len*.55],[r*.80,len*.85],[r*.8,len]],10),k%2?K.cu:K.or,a,dir.normalize(),1);}
      for(let k=0;k<N;k++){const a=hp(k/N),b=hp((k+1)/N);B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],.055,1,6),K.chrome,0,0,0);}   // l'âme chromée de la corne
      const e=hp(1);B.add(G10.sph,K.chrome,e.x,e.y,e.z,0,0,0,.16,.16,.16);B.add(G10.sph,K.glow,e.x,e.y,e.z,0,0,0,.105,.105,.105);
      const b0=hp(0);B.add(G10.cyl6,K.or,b0.x,b0.y-.02,b0.z,0,0,sd*.5,.23,.12,.23);     // la collerette d'or de la tempe
    }
    // l'arc qui claque entre les deux boules des cornes, et l'étincelle de la gueule
    const tipL=P(hx-.04-.50,yc+.36+.86,-1.10),tipR=P(hx-.04-.50,yc+.36+.86,1.10);
    arc(tipL,tipR,10,.12,.02);
    arc(P(hx-.62,yc-.20,-.14),P(hx-.62,yc-.20,.14),4,.04,.012);
    // l'éclair d'or gravé sur le front, couché sur la pente du crâne (visible de dessus comme de face)
    h2_orient(B,plan10([[.17,.50],[-.20,0],[-.03,0],[-.24,-.50],[.24,.07],[.06,.07],[.24,.50]],.05,.008),K.or,P(hx-.47+(-.64)*.07,yc+.78+.77*.07,0),new THREE.Vector3(0,0,1),new THREE.Vector3(-.64,.77,0));
    // l'échine : cinq petites bobines sur le dos, reliées par des arcs
    const tops=[];for(let k=0;k<5;k++){const x=-L*.36+k*L*.20,b=P(x,.86,0);tops.push(coil(b,D(0,1,0),.30+.04*Math.sin(k/4*PI10),.045));}
    for(let k=0;k<4;k++)arc(tops[k],tops[k+1],4,.05,.012);
    // la queue : deux éclairs de tôle, la tuyère
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.34,.46],[.20,.46],[.60,1.0],[.26,.60],[.40,.60],[.10,.0]],.05,.01),K.col,XE-.05,yc+(sd>0?.30:-.30),0,sd>0?0:PI10,0,0);
    const tx=XE+.12;TX(B,K.chrome,[[.12,0],[.17,.06],[.27,.22],[.34,.34]],tx,yc,0,0,12);h2_ANN(B,K.or,.34,.014,tx+.35,yc,0);TX(B,K.glow,[[.001,0],[.26,0],[.26,.02],[.001,.02]],tx+.33,yc,0,0,12);
    c.echap=[tx+.38,yc,0];
    break;}
  case 12:{ // LA GRENADE (h2) — LA GRENADE VIVANTE : le V10 est le corps ovoïde quadrillé en ananas, la cloche d'embrayage = la FACE (yeux jaunes de braise, sourcils,
    //   sourire à crocs), le col de fusée sur le dos porte la goupille et son anneau d'or, le grand levier épouse tout le dos jusqu'à la queue — et l'échappement
    //   est le culot de la grenade : la tuyère à braise
    const yc=.30,hx=-XE,FS=[[hx-.34,yc,.16,.16],[hx-.22,yc,.36,.36],[hx+.05,yc,.55,.55],[hx+.40,yc,.68,.68],[0,yc,.72,.72],[XE-.40,yc,.68,.68],[XE-.05,yc,.50,.50],[XE+.15,yc,.32,.32]];
    const rA=x=>{for(let k=0;k<FS.length-1;k++){const a=FS[k],b=FS[k+1];if(x>=a[0]&&x<=b[0])return a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]);}return FS[FS.length-1][2];};
    B.add(h2_loft(FS,16),K.col,0,0,0);
    // l'ananas : des anneaux et des méridiens en relief, cernés d'or
    for(let k=0;k<10;k++){const x=hx-.10+k*(L+.10)/9,r=rA(x);TX(B,K.colD,[[r+.028,0],[r+.028,.065]],x,yc,0,0,16);}
    for(let k=0;k<12;k++){const a=k/12*2*PI10,pp=[];for(let j=0;j<=9;j++){const x=hx-.16+j*(L+.2)/9,r=rA(x)+.028;pp.push([x,yc+Math.cos(a)*r,Math.sin(a)*r]);}B.add(tube10(pp,.020,18,4),K.colD,0,0,0);}
    for(let k=0;k<12;k++){const x=hx+.25+(k%6)*(L-.6)/5,r=rA(x),a=(Math.floor(k/6)?.28:-.28)+(k%2)*PI10;B.add(G10.sph,K.or,x,yc+Math.cos(a)*(r+.03),Math.sin(a)*(r+.03),0,0,0,.022,.022,.022);}   // les rivets d'or
    // la face : yeux jaunes en colère, sourcils, sourire à crocs
    for(let sd=-1;sd<=1;sd+=2){const ex=hx-.10,ey=yc+.20,ez=sd*(Math.sqrt(Math.max(.01,rA(ex)*rA(ex)-.04))+.01);
      B.add(new THREE.TorusGeometry(.17,.03,6,14),K.chrome,ex,ey,ez,0,sd*.55,0);B.add(G10.sph,K.glow,ex,ey,ez+sd*.012,0,0,0,.15,.15,.055);BXg(B,K.noir,ex-.03,ey,ez+sd*.06,0,sd*.55,0,.04,.20,.02);
      BXg(B,K.colD,ex+.0,ey+.24,ez-sd*.02,0,sd*.55,-.42,.42,.08,.13);
      const gp=[];for(let k=0;k<=7;k++){const x=hx-.28+k*.12,dy=-.16-(k/7)*.04,r=rA(x);gp.push([x,yc+dy,sd*(Math.sqrt(Math.max(.002,r*r-dy*dy))+.012)]);}
      B.add(tube10(gp,.018,16,5),K.noir,0,0,0);
      for(let k=0;k<8;k++){const q=gp[k];vers10(B,cone10(.03,.11,5),K.blanc,P(q[0],q[1],q[2]),D(0,k%2?-1:1,sd*.1),1);}}
    // le col de fusée, la goupille, l'anneau d'or
    const nx=hx+.55,ny=yc+rA(nx)-.04;
    B.add(tourY10([[.001,0],[.17,0],[.20,.05],[.17,.30],[.12,.42],[.001,.44]],12),K.chrome,nx,ny,0);
    B.add(new THREE.TorusGeometry(.17,.03,6,24),K.or,nx,ny+.30,.0,0,0,0);
    tige(P(nx,ny+.26,-.24),P(nx,ny+.26,.16),.03,K.or);B.add(new THREE.TorusGeometry(.14,.028,6,22),K.or,nx,ny+.26,.30,PI10/2,0,0);
    // le levier : une cuillère d'acier qui épouse le dos jusqu'au culot
    const LV=[];for(let k=0;k<=8;k++){const x=nx+.05+k*(XE-nx+.12)/8,r=rA(Math.min(x,XE+.1));LV.push([x,yc+r*(1-.0008*k*k)+.035-(k>6?(k-6)*.09:0),.022,.15,2.6]);}
    B.add(h2_loft(LV,8),K.metal,0,0,0);
    for(const q of [LV[0],LV[4],LV[8]])BXg(B,K.or,q[0],q[1]-.01,0,0,0,0,.05,.03,.2);
    // le culot : la tuyère
    const tx=XE+.10;TX(B,K.chrome,[[.12,0],[.18,.06],[.30,.22],[.38,.34]],tx,yc,0,0,12);ANN(B,K.or,.38,.014,tx+.35,yc,0);TX(B,K.glow,[[.001,0],[.30,0],[.30,.02],[.001,.02]],tx+.34,yc,0,0,12);
    c.echap=[tx+.38,yc,0];
    break;}
  case 13:{ // LE COLIBRI (29/10, Léo : « le colibri prend la place du moteur 14 ») — HYBRIDE : tête ronde, long bec, gorge qui brille, ailes en V, queue en ciseaux
    h1_p2(B,K,L,XE,top);break;}
  case 14:{ // LE SOLEIL (h2, retouché) — LE SOLEIL-LION : le W12 est son torse d'ambre, la cloche d'embrayage = le VISAGE d'ivoire et d'or du soleil (arcades, grands yeux blancs aux pupilles
    //   noires, nez, bouche à crocs) posé sur une LENTILLE épaisse d'ambre sombre ; sa crinière EST la couronne : trois rangs de rayons-pointes plantés sur le bord de la lentille, dans le plan
    //   et inclinés vers l'avant et vers l'arrière — le soleil se lit de TOUS les côtés ; l'échappement = un petit soleil de queue autour de la tuyère à braise
    const yc=.30,hx=-XE,GOLD=h2_poli(0xe9b844,240,.45),LENS=h2_poli(0x7c4208,200,.28),IVO=h2_poli(0xfff2cc,200,.2);
    const ray=(x,R,len,a,m,r,t)=>{const rh=new THREE.Vector3(0,Math.cos(a),Math.sin(a)),d=rh.clone().multiplyScalar(Math.cos(t)).add(new THREE.Vector3(Math.sin(t),0,0)).normalize();
      vers10(B,cone10(r,len,6),m,P(x,yc+Math.cos(a)*R,Math.sin(a)*R),d,1);};
    // le torse
    B.add(h2_loft([[hx+.06,yc,.42,.46,2.5],[hx+.34,yc,.52,.56,2.5],[-L*.1,yc,.55,.58,2.6],[L*.2,yc,.54,.57,2.6],[XE-.05,yc,.44,.47,2.5],[XE+.22,yc,.27,.28,2.5]],12),K.col,0,0,0);
    for(let k=0;k<7;k++){const x=hx+.42+k*(L-.55)/6;h2_ANN(B,K.or,.58,.022,x,yc,0);}
    // la lentille : un disque ÉPAIS à deux faces bombées, d'ambre sombre, cerclé d'or — elle se lit de face, de profil et de dessus
    const cx=hx+.02;
    B.add(tourX([[.001,-.30],[.30,-.27],[.60,-.18],[.86,-.08],[1.0,.03],[.86,.14],[.60,.23],[.30,.31],[.001,.34]],28),LENS,cx,yc,0,0,0,0);
    h2_ANN(B,K.or,1.0,.05,cx+.03,yc,0);h2_ANN(B,K.or,.78,.022,cx-.12,yc,0);h2_ANN(B,K.or,.52,.018,cx-.21,yc,0);
    // la crinière : trois rangs de rayons-pointes — dans le plan (longs et courts, en alternance), inclinés vers l'avant, inclinés vers l'arrière
    for(let k=0;k<28;k++){const a=k/28*2*PI10;ray(cx+.03,.95,k%2?.40:.72,a,k%2?K.col:K.or,k%2?.09:.115,0);}
    for(let k=0;k<14;k++){const a=(k+.5)/14*2*PI10;ray(cx+.0,.90,.62,a,K.or,.09,-.62);}
    for(let k=0;k<14;k++){const a=(k+.5)/14*2*PI10;ray(cx+.07,.90,.52,a,K.col,.085,.62);}
    // le visage : un dôme d'ivoire sur la face de la lentille, sculpté
    B.add(h2_loft([[hx+.22,yc,.62,.62,2.4],[hx-.12,yc,.69,.69,2.3],[hx-.36,yc,.64,.64,2.3],[hx-.56,yc-.01,.48,.48,2.3],[hx-.70,yc-.02,.30,.30,2.3]],14),GOLD,0,0,0);
    const fx=hx-.56;
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.colD,fx-.06,yc+.31,sd*.26,-sd*.30,0,0,.14,.12,.42);                                                                          // l'arcade, épaisse et en colère (bout extérieur plus haut)
      B.add(G10.sph,IVO,fx-.06,yc+.13,sd*.26,0,0,0,.06,.12,.16);B.add(G10.sph,K.noir,fx-.115,yc+.13,sd*.26,0,0,0,.035,.085,.09);    // le grand œil blanc, sa pupille noire
      B.add(G10.sph,K.col,fx+.04,yc-.08,sd*.40,0,0,0,.09,.14,.12);                                                                         // la pommette d'ambre
      B.add(tube10([[fx-.14,yc-.24,sd*.02],[fx-.12,yc-.28,sd*.19],[fx-.03,yc-.20,sd*.38]],.026,10,5),K.noir,0,0,0);                         // le sourire
      for(let k=0;k<3;k++)vers10(B,cone10(.03,.11,5),IVO,P(fx-.14+k*.02,yc-.255-k*.012,sd*(.07+.10*k)),D(-.1,-1,0),1);}               // les crocs
    vers10(B,cone10(.14,.34,6),K.col,P(fx-.10,yc-.03,0),D(-1,-.15,0),1);                                                                    // le nez d'ambre
    // la queue : un petit soleil autour de la tuyère
    const tx=XE+.14;h2_ANN(B,K.or,.30,.026,tx,yc,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10;vers10(B,cone10(.05,.30,5),k%2?K.or:K.col,P(tx,yc+Math.cos(a)*.30,Math.sin(a)*.30),new THREE.Vector3(0,Math.cos(a),Math.sin(a)),1);}
    for(let k=0;k<4;k++){const a=(k+.5)/4*2*PI10;tige(P(XE-.05,yc+Math.cos(a)*.26,Math.sin(a)*.26),P(tx,yc+Math.cos(a)*.30,Math.sin(a)*.30),.022,K.or);}
    TX(B,K.chrome,[[.10,0],[.14,.05],[.21,.20],[.26,.30]],tx,yc,0,0,12);TX(B,K.glow,[[.001,0],[.20,0],[.20,.02],[.001,.02]],tx+.30,yc,0,0,12);
    c.echap=[tx+.34,yc,0];
    break;}
  case 15:{ // LE DRAGON (artiste 3) — le V16 EST le dragon : la tête sculptée forme l'avant du bloc (crâne, arcades, mâchoire ouverte sur la braise, crocs,
    //   naseaux fumants, cornes d'or), l'épine dorsale court dans la vallée du V, deux ailes de chauve-souris aux doigts d'or, la queue finit en tuyère
    const dr=-1,X0=XE+.02,hx=s=>-(X0+s);
    const crane=[{s:0,yt:.92,yb:-.20,w:.36,yw:.56},{s:.28,yt:1.04,yb:-.17,w:.42,yw:.66},{s:.60,yt:.92,yb:-.14,w:.41,yw:.56,wt:.30},{s:.92,yt:.72,yb:-.08,w:.31,yw:.42,wt:.19},
      {s:1.28,yt:.60,yb:-.02,w:.27,wt:.16},{s:1.52,yt:.58,yb:.02,w:.25,wt:.16},{s:1.68,yt:.50,yb:.07,w:.16,wt:.10}];
    B.add(h3_loft(crane.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.col,0,0,0);
    const mach=[{s:.30,yt:-.02,yb:-.40,w:.33},{s:.80,yt:-.14,yb:-.48,w:.28},{s:1.25,yt:-.23,yb:-.54,w:.22},{s:1.58,yt:-.30,yb:-.54,w:.13}];
    B.add(h3_loft(mach.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.colD,0,0,0);
    boule(K.glow,hx(.62),-.10,0,.17,.07,.20);boule(K.glow,hx(1.05),-.17,0,.16,.025,.12);                 // la braise au fond de la gueule
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<7;k++){const s=.62+k*.14,yy=-.05+(s-.62)*.05,l=(k===3?.27:.15)-k*.004;corne(P(hx(s),yy,sd*(.20-k*.015)),D(0,-1,0),.032,l,K.blanc);                  // crocs du haut
        corne(P(hx(s+.05),-.38-(s-.30)*.12,sd*(.16-k*.012)),D(0,1,0),.026,k===4?.24:.13,K.blanc);}                                                          // crocs du bas
      B.add(h3_tube([[hx(.95),.84,sd*.19],[hx(.62),1.02,sd*.34],[hx(.34),.98,sd*.38]].map(q=>[-q[0],q[1],q[2]]),.06,.05,{dir:dr,sides:6}),K.or,0,0,0);          // l'arcade sourcilière
      B.add(G10.sph,K.glow,hx(.60),.76,sd*.385,0,0,0,.075,.06,.045);B.add(new THREE.TorusGeometry(.085,.016,5,10),K.or,hx(.60),.76,sd*.38,0,0,0);          // l'œil de braise
      B.add(h3_tube([[X0+.34,.92,sd*.30],[X0+.02,1.22,sd*.42],[X0-.38,1.52,sd*.62],[X0-.88,1.62,sd*.62]],.10,.012,{dir:dr,sides:6}),K.or,0,0,0);              // la grande corne
      B.add(h3_tube([[X0+.14,.46,sd*.36],[X0-.10,.52,sd*.58],[X0-.40,.40,sd*.72],[X0-.62,.22,sd*.74]],.065,.01,{dir:dr,sides:6}),K.col,0,0,0);               // la corne de joue
      B.add(h3_tube([[X0+1.05,-.40,sd*.20],[X0+.88,-.62,sd*.22],[X0+.70,-.80,sd*.20]],.04,.008,{dir:dr,sides:5}),K.or,0,0,0);                                 // l'épine du menton
      corne(P(hx(1.70),.50,sd*.07),D(-1,.02,0),.05,.08,K.noir);
      boule(K.halo(0xe8f0ff,.22),hx(1.86),.68,sd*.08,.09,.07,.07);boule(K.halo(0xe8f0ff,.14),hx(2.02),.86,sd*.12,.12,.09,.09);                  // la fumée des naseaux
    }
    for(let k=0;k<6;k++){const s=.10+k*.20;B.add(plan10([[-.10,0],[.10,0],[.05,.18-k*.014]],.035,.005),k%2?K.col:K.or,hx(s)+.0,.915+(s>.4?-(s-.28)*.30:.08),0);}  // la crête de la tête
    const ep=(k)=>-1.12+k*.27;                                            // l'ÉPINE : un rail dans la vallée du V, onze plaques d'or et de laque
    B.add(G10.axeX8,K.chrome,-1.12+.0,.62,0,0,0,0,2.60,.05,.05);
    for(let k=0;k<11;k++){const x=ep(k),h=.84-Math.abs(k-3)*.07;B.add(plan10([[-.11,0],[.11,0],[.09,h*.95],[.0,h]],.04,.006),k%2?K.col:K.or,x,.60,0);
      if(k%2===0)tige(P(x,.62,0),P(x,.18,0),.035,K.chrome);}
    for(let sd=-1;sd<=1;sd+=2){                                          // LES AILES : bras d'or, quatre doigts, membrane laquée, veines de braise
      const Sh=[-.62,.70,sd*.26],El=[-.42,1.28,sd*.56],Wr=[-.05,1.90,sd*1.00],T=[[-.60,2.25,sd*1.55],[.55,2.40,sd*1.95],[1.50,1.85,sd*1.90],[2.15,1.05,sd*1.40]],Rr=[1.70,.62,sd*.30];
      const N=[0,1,2].map(k=>[(T[k][0]+T[k+1][0])*.5-.12,(T[k][1]+T[k+1][1])*.5-.34,(T[k][2]+T[k+1][2])*.5-.12*sd]);
      const tr=[[Wr,T[0],N[0]],[Wr,N[0],T[1]],[Wr,T[1],N[1]],[Wr,N[1],T[2]],[Wr,T[2],N[2]],[Wr,N[2],T[3]],[Wr,T[3],Rr],[Wr,Rr,Sh],[Sh,Rr,[Rr[0],.50,sd*.20]]];
      B.add(h3_tris(tr),K.col,0,0,0);
      B.add(h3_tube([Sh,El,Wr],.07,.045,{sides:6}),K.or,0,0,0);boule(K.or,Wr[0],Wr[1],Wr[2],.075);boule(K.or,El[0],El[1],El[2],.06);
      for(const t of T)B.add(h3_tube([Wr,[ (Wr[0]+t[0])/2,(Wr[1]+t[1])/2+.06,(Wr[2]+t[2])/2],t],.04,.008,{sides:5}),K.or,0,0,0);
      for(const n of N)B.add(h3_tube([Wr,n],.014,.012,{sides:4}),K.glow,0,0,0);
      B.add(h3_tube([Sh,[0.4,.76,sd*.30],Rr],.03,.03,{sides:5}),K.or,0,0,0);}
    {const tq=[[XE-.1,.14,0],[XE+.40,.10,.10],[XE+.90,.18,-.10],[XE+1.40,.26,.04],[XE+1.62,.28,0]];                       // LA QUEUE : elle s'effile puis s'évase en tuyère
      B.add(h3_tube(tq,.30,.085,{sides:8}),K.col,0,0,0);
      for(let k=0;k<5;k++){const t=tq[k+0],h=.30-k*.045;B.add(plan10([[-.09,0],[.09,0],[.07,h]],.035,.005),k%2?K.col:K.or,t[0]+.05,t[1]+.22-k*.032,t[2]);}
      B.add(tourX([[.085,0],[.12,.04],[.22,.18],[.30,.30]],10),K.chrome,XE+1.62,.28,0,0,0,0);B.add(new THREE.TorusGeometry(.30,.014,4,16),K.or,XE+1.92,.28,0,0,PI10/2,0);
      B.add(tourX([[.001,0],[.26,0],[.26,.02],[.001,.02]],10),K.glow,XE+1.90,.28,0,0,0,0);
      for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.50,0],[.0,.30]],.03,.005),K.or,XE+.95,.12,sd*.14,sd*1.0,0,-.15);}
    break;}
  case 16:{ // LA PAGODE (artiste 3) — le temple-GARDIEN : la façade du H16 est un lion-gardien (shishi) à la crinière de flammes d'or qui tient la perle de feu dans la
    //   gueule ; la tour de quatre toits aux coins relevés est son chapeau, les lanternes ses boucles d'oreille
    const dr=-1,X0=XE-.02,hx=s=>-(X0+s),cy=.22;
    const face=[{s:0,yt:cy+.74,yb:cy-.62,w:.54,yw:cy+.16},{s:.22,yt:cy+.88,yb:cy-.64,w:.62,yw:cy+.24},{s:.44,yt:cy+.70,yb:cy-.54,w:.54,yw:cy+.12,wt:.42},
      {s:.62,yt:cy+.40,yb:cy-.38,w:.42,wt:.30},{s:.76,yt:cy+.30,yb:cy-.32,w:.34,wt:.24},{s:.84,yt:cy+.22,yb:cy-.26,w:.26,wt:.18}];
    B.add(h3_loft(face.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.col,0,0,0);
    const gu=[{s:.34,yt:cy-.44,yb:cy-.74,w:.46},{s:.62,yt:cy-.46,yb:cy-.80,w:.38},{s:.82,yt:cy-.44,yb:cy-.78,w:.26}];
    B.add(h3_loft(gu.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.colD,0,0,0);                                 // la mâchoire
    boule(K.glow,hx(.60),cy-.42,0,.20);B.add(new THREE.TorusGeometry(.22,.03,5,12),K.or,hx(.62),cy-.42,0,0,PI10/2,0);   // la PERLE de feu tenue entre les crocs
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<4;k++){corne(P(hx(.46+k*.11),cy-.28,sd*(.22-k*.02)),D(0,-1,0),.04,k%3===1?.30:.18,K.blanc);corne(P(hx(.50+k*.11),cy-.56,sd*(.20-k*.02)),D(0,1,0),.032,.15,K.blanc);}
      B.add(h3_tris(h3_prism([hx(.36),cy+.46,sd*.20],[hx(.74),cy+.50,sd*.34],[hx(.68),cy+.28,sd*.14],[0,.05,0])),K.or,0,0,0);   // le sourcil lourd
      B.add(G10.sph,K.glow,hx(.60),cy+.28,sd*.27,0,0,0,.10,.15,.15);B.add(new THREE.TorusGeometry(.17,.032,5,12),K.or,hx(.62),cy+.28,sd*.27,0,PI10/2,0);boule(K.noir,hx(.69),cy+.28,sd*.27,.03,.11,.04);   // l'œil rond
      B.add(h3_tube([[X0+.50,cy+.04,sd*.50],[X0+.36,cy-.06,sd*.72],[X0+.28,cy-.30,sd*.84]],.07,.03,{dir:dr,sides:6}),K.or,0,0,0);boule(K.glow,hx(.28),cy-.34,sd*.84,.07);   // l'oreille et son pendant de feu
      boule(K.noir,hx(.84),cy+.02,sd*.08,.05);}
    B.add(h3_tube([[X0+.30,cy+.78,0],[X0+.16,cy+1.04,0],[X0-.06,cy+1.30,0]],.08,.012,{dir:dr,sides:6}),K.or,0,0,0);        // la corne du front
    for(let k=0;k<14;k++){const a=k/14*2*PI10+.22,ca=Math.cos(a),sa=Math.sin(a),rw=.78,rh=.84,l=k%2?.40:.64;       // LA CRINIÈRE : quatorze flammes autour du visage
      const A1=[hx(.06),cy+sa*rh*.80-.04,ca*rw*.80],B1=[hx(.06),cy+Math.sin(a+.40)*rh*.80-.04,Math.cos(a+.40)*rw*.80],tip=[hx(-.06),cy+Math.sin(a+.20)*(rh+l)-.04,Math.cos(a+.20)*(rw+l*.8)];
      B.add(h3_tris(h3_prism(A1,B1,tip,[.07,0,0])),k%2?K.colD:K.or,0,0,0);}
    // LA TOUR : quatre étages, chacun son toit relevé, ses fenêtres de braise, ses lanternes
    tige(P(0,.70,0),P(0,2.70,0),.07,K.or);
    for(let k=0;k<4;k++){const y0=1.02+k*.40,r=.78-k*.12,w=.34-k*.05;
      BXg(B,K.col,0,y0+.10,0,0,0,0,w*2.0,.22,w*2.0);BXg(B,K.glow,0,y0+.10,0,0,0,0,w*2.0+.02,.07,.10);BXg(B,K.glow,0,y0+.10,0,0,0,0,.10,.07,w*2.0+.02);
      const T=h3_toit(r,.20,.15);B.add(h3_tris(T.top),k%2?K.or:K.col,0,y0+.22,0);B.add(h3_tris(T.under),K.colD,0,y0+.22,0);
      for(let q=0;q<8;q++){const a=T.ring[q],b=T.ring[(q+1)%8];B.add(h3_tube([[a[0],a[1]+y0+.22,a[2]],[b[0],b[1]+y0+.22,b[2]]],.016,.016,{sides:4,seg:2}),K.or,0,0,0);}
      for(const q of [0,2,4,6]){const c=T.ring[q];tige(P(c[0],c[1]+y0+.22,c[2]),P(c[0],c[1]+y0+.10,c[2]),.008,K.or);boule(K.glow,c[0],c[1]+y0+.06,c[2],.05,.06,.05);}}   // les lanternes aux coins relevés
    corne(P(0,2.50,0),D(0,1,0),.05,.50,K.or);for(let k=0;k<5;k++)B.add(new THREE.TorusGeometry(.065-k*.007,.014,4,10),K.or,0,2.56+k*.08,0,PI10/2,0,0);boule(K.glow,0,3.10,0,.05);
    break;}
  case 17:{ // LE KRAKEN (artiste 3) — le quadriturbo EST le kraken : un grand MANTEAU laqué couvre le V8 (arête d'or, taches de bioluminescence, deux nageoires), la tête à bec
    //   forme l'avant du bloc, deux YEUX dont l'iris est une roue de turbo, huit tentacules en spirale à ventouses d'or, le tuyau d'échappement est son siphon
    const dr=-1,X0=XE-.04,hx=s=>-(X0+s);
    const man=[{x:-.62,yt:1.04,yb:.50,w:.34,yw:.78},{x:-.20,yt:1.52,yb:.44,w:.52,yw:.92},{x:.40,yt:1.78,yb:.46,w:.58,yw:1.02},{x:.95,yt:1.60,yb:.50,w:.50,yw:.96},{x:1.45,yt:1.30,yb:.56,w:.33,yw:.86},{x:1.92,yt:1.08,yb:.70,w:.10,yw:.88}];
    B.add(h3_loft(man.map(c=>({x:c.x,r:h3_ring(c)})),1),K.col,0,0,0);
    const yTop=x=>{for(let k=0;k<man.length-1;k++)if(x<=man[k+1].x){const t=(x-man[k].x)/(man[k+1].x-man[k].x);return man[k].yt+(man[k+1].yt-man[k].yt)*Math.max(0,t);}return man[man.length-1].yt;};
    const wAt=x=>{for(let k=0;k<man.length-1;k++)if(x<=man[k+1].x){const t=(x-man[k].x)/(man[k+1].x-man[k].x);return man[k].w+(man[k+1].w-man[k].w)*Math.max(0,t);}return .1;};
    {const pr=[];for(let k=0;k<=12;k++){const x=-.55+k*.2;pr.push([x,yTop(x)+.012,0]);}B.add(h3_tube(pr,.028,.014,{sides:6}),K.or,0,0,0);}                    // l'arête d'or du manteau
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<5;k++){const x=-.10+k*.38;const ww=wAt(x),yy=.88+(k===2?.12:0)-k*.03;boule(K.glow,x,yy,sd*(ww*.98),.05,.05,.045);boule(K.or,x,yy,sd*(ww*1.0),.07,.07,.025);}   // les taches de bioluminescence cerclées d'or
      B.add(plan10([[0,0],[.60,.18],[.92,.02],[.52,-.24]],.035,.006),K.colD,.62,1.02,sd*.56,sd*.55,0,0);                                                    // les nageoires du manteau
      B.add(h3_tube([[.62,1.02,sd*.52],[1.05,1.12,sd*.82],[1.52,1.04,sd*.96]],.030,.012,{sides:5}),K.or,0,0,0);
      const E=bat10();E.f=true;E.plat();                                     // L'ŒIL : une boule de braise, une roue de turbo pour iris, une pupille en fente, des lids d'or
      E.add(G10.sph,K.colD,0,0,0,0,0,0,.30,.28,.28);E.add(G10.sph,K.glow,.15,0,0,0,0,0,.24,.24,.24);
      E.add(new THREE.TorusGeometry(.27,.036,6,16),K.or,.0,0,0,0,PI10/2,0);
      E.add(new THREE.TorusGeometry(.16,.016,5,16),K.or,.27,0,0,0,PI10/2,0);
      for(let q=0;q<10;q++){const a=q/10*2*PI10;E.add(plan10([[0,-.02],[.15,-.045],[.17,.02]],.012,.002),K.chrome,.285,Math.sin(a)*.12,Math.cos(a)*.12,a-PI10/2,PI10/2,.5);}
      E.add(G10.box,K.noir,.385,0,0,0,0,0,.02,.05,.34);
      E.add(plan10([[-.30,.10],[.22,.34],[.34,.22],[-.10,.10]],.03,.004),K.or,0,.04,0,0,0,0);                                                            // le sourcil
      const eg=new THREE.Group();E.fin(eg);eg.position.set(hx(.22),.22,sd*.46);eg.rotation.y=-sd*(PI10-1.0);eg.scale.setScalar(1.3);g.add(eg);}
    B.add(h3_loft([{x:X0-.10,r:h3_ring({yt:.64,yb:-.26,w:.36,yw:.22})},{x:X0+.22,r:h3_ring({yt:.60,yb:-.24,w:.42,yw:.18})},{x:X0+.48,r:h3_ring({yt:.46,yb:-.20,w:.36,yw:.14})},{x:X0+.64,r:h3_ring({yt:.30,yb:-.10,w:.22,yw:.10})}],dr),K.col,0,0,0);   // la tête
    corne(P(hx(.62),.12,0),D(-1,-.55,0),.11,.26,K.or);corne(P(hx(.62),.04,0),D(-1,.55,0),.09,.20,K.or);              // le bec
    for(let k=0;k<8;k++){const a=k/8*2*PI10+.2,swirl=k%2?1:-1,pts=[],sk=[];
      const pt=t=>{const ra=.24+t*.70,an=a+swirl*t*1.5;return [hx(.50+t*1.15),.04+Math.sin(an)*ra*.8-t*t*.16+(t>.8?(t-.8)*1.2:0),Math.cos(an)*ra];};
      for(let j=0;j<=7;j++)pts.push(pt(j/7));
      B.add(h3_tube(pts,.13,.014,{sides:6,seg:28,prof:t=>.15*(1-t)+.016*t+.02*Math.sin(t*3)}),K.col,0,0,0);
      for(let j=1;j<7;j++){const q=pt(j/7);boule(K.or,q[0],q[1]-.09*(1-j/7)-.02,q[2],.045+.022*(1-j/7));}}
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
  case 18:{ // LE SPHINX (artiste 3) — les trois chambres de verre sont son dos, trois pyramides de Gizeh y dorment ; la TÊTE (nemès rayé or et lapis, visage fin aux yeux de kohl, uræus,
    //   fausse barbe) regarde droit devant, les pattes de lion s'allongent sous elle, la poitrine tient tout le corps au rotor
    for(let k=0;k<3;k++){const x=-.52+k*.52;B.add(new THREE.ConeGeometry(.42,.50,4),K.or,x,.86,0,0,PI10/4,0);
      for(let j=0;j<4;j++)B.add(new THREE.TorusGeometry(.64,.025,5,32),j%2?K.or:K.colD,x-.11+j*.075,0,0,0,PI10/2,0);}
    h3_sphinx(B,K);
    break;}
  case 19:{ // LE PHÉNIX (artiste 3) — la turbine ouverte est le corps de l'oiseau de feu : une TÊTE sculptée (crête de plumes, bec crochu, œil de braise) remplace le cône d'entrée,
    //   deux ailes de plumes aux couleurs de la flamme jaillissent des longerons, la queue est une gerbe de plumes autour de la tuyère
    const y0=0;
    B.add(h3_loft([{x:.86,r:h3_ring({yt:.42,yb:-.42,w:.42,yw:.04})},{x:1.12,r:h3_ring({yt:.44,yb:-.34,w:.36,yw:.06})},{x:1.38,r:h3_ring({yt:.40,yb:-.22,w:.28,yw:.08,wt:.18})},{x:1.60,r:h3_ring({yt:.26,yb:-.10,w:.18,wt:.12})},{x:1.76,r:h3_ring({yt:.18,yb:-.04,w:.10,wt:.07})}],1),K.col,0,0,0);
    B.add(h3_tube([[1.70,.12,0],[1.98,.12,0],[2.20,-.02,0],[2.28,-.26,0]],.11,.012,{sides:4}),K.or,0,0,0);                                                       // le bec crochu
    B.add(h3_tube([[1.68,-.04,0],[1.90,-.07,0],[2.02,-.14,0]],.07,.012,{sides:4}),K.or,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      B.add(G10.sph,K.glow,1.44,.14,sd*.24,0,0,0,.07,.07,.05);B.add(new THREE.TorusGeometry(.085,.018,5,12),K.or,1.45,.14,sd*.24,0,PI10/2,0);                              // l'œil de braise, cerclé d'or
      B.add(h3_tube([[1.62,.28,sd*.10],[1.40,.34,sd*.22],[1.20,.30,sd*.28]],.045,.03,{sides:5}),K.or,0,0,0);                                                                 // l'arcade
      boule(K.noir,1.72,.12,sd*.04,.025);
      for(let k=0;k<7;k++){const t=k/6,len=1.35-Math.abs(k-3)*.10-(k>3?.1:0);                                                                                             // L'AILE : sept plumes en éventail
        const m=k<2?K.or:(k<5?K.col:K.glow),rx=.50-k*.10,tz=sd*(.95+.78*Math.sin(t*2.4+.1)*.7+k*.14),tx=.55-k*.34-.15,ty=.15+.55*Math.cos(t*2.0)*.8-k*.07;
        h3_leaf(B,m,[[rx,.0,sd*.50],[rx-.15,.12+.2*(1-t),sd*(.80+k*.04)],[tx,ty,tz]],.17+.018*(6-k),{ribMat:K.or});}
      for(let k=0;k<5;k++){const x0=-.5+k*.22;h3_leaf(B,k%2?K.glow:K.or,[[x0,.04,sd*.56],[x0-.2,.10,sd*.82],[x0-.46,.18-k*.02,sd*(.98+k*.03)]],.12,{ribMat:K.or});}}          // les couvertures de l'aile
    for(let k=0;k<5;k++){const z=(k-2)*.10,up=1-Math.abs(k-2)*.22;                                                                                                     // LA CRÊTE : cinq plumes qui se couchent vers l'arrière
      h3_plume(B,k%2?K.or:K.glow,[[1.34,.40,z*.6],[1.10,.68+.12*up,z*1.4],[.66,.96+.3*up,z*2.2],[.20,.96+.22*up,z*3.0]],.075);}
    for(let k=0;k<12;k++){const a=k/12*2*PI10,A1=[.90,Math.cos(a)*.40,Math.sin(a)*.40],B1=[.90,Math.cos(a+.52)*.40,Math.sin(a+.52)*.40],T=[.64,Math.cos(a+.26)*.56,Math.sin(a+.26)*.56];
      B.add(h3_tris(h3_prism(A1,B1,T,[.03,0,0])),k%2?K.or:K.col,0,0,0);}                                                                                              // la collerette de plumes
    for(let k=0;k<7;k++){const a=k/7*2*PI10+.2,ca=Math.cos(a),sa=Math.sin(a);                                                                                        // LA QUEUE : des plumes de feu autour de la tuyère
      h3_leaf(B,k%3===0?K.or:(k%3===1?K.col:K.glow),[[-1.0,ca*.40,sa*.40],[-1.55,ca*.78,sa*.78+.1],[-2.15,ca*1.05+.12*Math.sin(k),sa*1.15],[-2.85,ca*1.12,sa*1.26+.2]],.17,{side:[0,-sa,ca],ribMat:K.or});}
    break;}
  case 20:{ // L'ATLANTIDE (artiste 3) — POSÉIDON : le tube de plasma est sa nuque, quatre colonnes doriques l'encadrent, son visage de bronze marin (cheveux et barbe de vagues, yeux
    //   de glace) regarde devant lui, et le TRIDENT forme sa couronne
    const HX=1.12;
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4,y=Math.sin(a)*.42,z=Math.cos(a)*.42;B.add(new THREE.CylinderGeometry(.05,.05,1.6,10).rotateZ(PI10/2),K.or,0,y,z);
      B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,.80,y,z);B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,-.80,y,z);}
    h3_poseidon(B,K);
    break;}
  case 21:{ // RAIJIN (30/10, Léo : « Pégase : essaye quelque chose de nouveau, plus beau, là c'est toy ») — le dieu du tonnerre : un statoréacteur laqué indigo, la couronne de huit tambours, la foudre qui saute entre eux
    h5_raijin(B,K);
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
    h5_comete(B,K);
    break;}
  case 28:{ // LA NAISSANCE v2 — un lotus de lumière sur une étoile qui vient de naître, les anneaux de supernova qui s'élargissent derrière (h4_naissance)
    fx3_naissance(B,K);
    break;}
  case 29:{ // L'INFINI v2 — le trou noir à cage, en grand : disque penché, méridiens, couronnes d'or aux pôles, le signe ∞ (h4_infini)
    h4_infini(B,K);
    break;}

  }
  B.plat();
}

/* ================= ARTISTE 3 — les HYBRIDES des paliers 16-22 (dragon, pagode, kraken, sphinx, phénix, atlantide, lance d'Odin) =================
   Les outils de sculpture `h3_*` : une géométrie bâtie triangle par triangle (normales plates : facettes), jamais d'indexation ; les
   pièces sont des fonctions pures qui rendent une BufferGeometry à poser avec `B.add(geo,mat,0,0,0)`. `dir` = -1 : la pièce regarde vers -x. */
function h3_geo(T){const p=[],u=[];for(const t of T)for(const v of t){p.push(v[0],v[1],v[2]);u.push(.3,.3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.computeVertexNormals();return g;}
function h3_ring(st){      // une SECTION de crâne = huit points [y,z] : dessus plat, flanc haut, joue, mâchoire, dessous plat
  const yt=st.yt,yb=st.yb,w=st.w,yw=st.yw==null?yb+(yt-yb)*.62:st.yw,wt=st.wt==null?w*.55:st.wt,wb=st.wb==null?w*.5:st.wb,y2=yb+(yw-yb)*.4;
  return [[yt,wt],[yw,w],[y2,w*.88],[yb,wb],[yb,-wb],[y2,-w*.88],[yw,-w],[yt,-wt]];}
function h3_loft(S,dir){   // S = [{x,r}] sections de même nombre de points, fermées aux deux bouts
  dir=dir||1;const T=[],n=S[0].r.length,V=(s,j)=>{const q=s.r[j%n];return [s.x*dir,q[0],q[1]];};
  for(let k=0;k<S.length-1;k++)for(let j=0;j<n;j++){const a=V(S[k],j),b=V(S[k],j+1),c=V(S[k+1],j+1),d=V(S[k+1],j);T.push([a,b,c],[a,c,d]);}
  for(const s of [S[0],S[S.length-1]]){const c=[s.x*dir,0,0];for(const q of s.r){c[1]+=q[0]/n;c[2]+=q[1]/n;}for(let j=0;j<n;j++)T.push([c,V(s,j),V(s,j+1)]);}
  return h3_geo(T);}
function h3_tube(P,r0,r1,o){   // un tube qui s'effile le long d'une courbe (queue, corne, tentacule, bec) — P = [[x,y,z]…]
  o=o||{};const dir=o.dir||1,sd=o.sides||6,seg=o.seg||Math.max(6,P.length*4),
    cv=new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(p[0]*dir,p[1],p[2]))),fr=cv.computeFrenetFrames(seg,false),T=[],R=[];
  for(let k=0;k<=seg;k++){const t=k/seg,c=cv.getPoint(t),r=(o.prof?o.prof(t):r0+(r1-r0)*t),N=fr.normals[k],Bn=fr.binormals[k],row=[];
    for(let j=0;j<sd;j++){const a=j/sd*2*PI10+(o.ph||0),ca=Math.cos(a),sa=Math.sin(a);row.push([c.x+(ca*N.x+sa*Bn.x)*r,c.y+(ca*N.y+sa*Bn.y)*r,c.z+(ca*N.z+sa*Bn.z)*r]);}R.push(row);}
  for(let k=0;k<seg;k++)for(let j=0;j<sd;j++){const a=R[k][j],b=R[k][(j+1)%sd],c=R[k+1][(j+1)%sd],d=R[k+1][j];T.push([a,b,c],[a,c,d]);}
  const c0=cv.getPoint(0),c1=cv.getPoint(1);for(let j=0;j<sd;j++){T.push([[c0.x,c0.y,c0.z],R[0][(j+1)%sd],R[0][j]]);T.push([[c1.x,c1.y,c1.z],R[seg][j],R[seg][(j+1)%sd]]);}
  return h3_geo(T);}
function h3_poly(V,dir){   // une feuille facettée (membrane, voile) : polygone en éventail depuis son centre
  dir=dir||1;const c=[0,0,0],n=V.length,T=[];for(const v of V){c[0]+=v[0]*dir/n;c[1]+=v[1]/n;c[2]+=v[2]/n;}
  for(let k=0;k<n;k++){const a=V[k],b=V[(k+1)%n];T.push([c,[a[0]*dir,a[1],a[2]],[b[0]*dir,b[1],b[2]]]);}return h3_geo(T);}
function h3_tris(L,dir){dir=dir||1;return h3_geo(L.map(t=>t.map(v=>[v[0]*dir,v[1],v[2]])));}

function h3_prism(A,Bq,C,d){   // une plaque PLEINE (triangle épaissi le long de d) : une écaille, un pétale, une flamme de crinière
  const f=v=>[v[0]+d[0],v[1]+d[1],v[2]+d[2]];
  return [[A,Bq,C],[f(A),f(C),f(Bq)],[A,Bq,f(Bq)],[A,f(Bq),f(A)],[Bq,C,f(C)],[Bq,f(C),f(Bq)],[C,A,f(A)],[C,f(A),f(C)]];}
function h3_toit(r,hh,lift,m){   // un TOIT de pagode : quatre coins relevés, quatre creux, une arête vive ; rend [dessus, dessous, anneau]
  m=m||.80;const R=[[r,r,lift],[r*m,0,0],[r,-r,lift],[0,-r*m,0],[-r,-r,lift],[-r*m,0,0],[-r,r,lift],[0,r*m,0]],T=[],U=[],A=[0,hh,0],C0=[0,-.04,0];
  for(let k=0;k<8;k++){const a=R[k],b=R[(k+1)%8],pa=[a[0],a[2],a[1]],pb=[b[0],b[2],b[1]];T.push([A,pa,pb]);U.push([C0,[pb[0],pb[1]-.035,pb[2]],[pa[0],pa[1]-.035,pa[2]]]);}
  return {top:T,under:U,ring:R.map(q=>[q[0],q[2],q[1]])};}

function h3_plume(B,m,P,r,o){   // une PLUME : un tube en losange qui s'épaissit au milieu et s'effile en pointe (feu, corbeau, phénix)
  o=o||{};B.add(h3_tube(P,r,r,Object.assign({sides:4,prof:t=>r*(.55+.45*Math.sin(PI10*Math.pow(t,.7)))*(1-.9*t*t*t)},o)),m,0,0,0);}

function h3_leaf(B,m,P,wd,o){   // une PLUME PLATE : un ruban qui s'élargit puis s'effile le long d'une courbe, avec sa nervure (aile, queue, rémige)
  o=o||{};const sg=o.seg||14,cv=new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),T=[],A=[],Bq=[],up=o.up?new THREE.Vector3(o.up[0],o.up[1],o.up[2]):new THREE.Vector3(0,1,0);
  for(let k=0;k<=sg;k++){const t=k/sg,c=cv.getPoint(t),tg=cv.getTangent(t);let sd=o.side?new THREE.Vector3(o.side[0],o.side[1],o.side[2]):new THREE.Vector3().crossVectors(tg,up);
    sd.addScaledVector(tg,-sd.dot(tg));if(sd.length()<.05)sd.set(1,0,0);sd.normalize();
    const w=wd*(.18+.82*Math.pow(Math.sin(PI10*Math.min(1,.10+t*.9)),.75))*(1-.3*t);A.push([c.x+sd.x*w,c.y+sd.y*w,c.z+sd.z*w]);Bq.push([c.x-sd.x*w,c.y-sd.y*w,c.z-sd.z*w]);}
  for(let k=0;k<sg;k++){T.push([A[k],Bq[k],Bq[k+1]],[A[k],Bq[k+1],A[k+1]]);}
  B.add(h3_geo(T),m,0,0,0);B.add(h3_tube(P,(o.rib||.035),.008,{sides:4}),m===K_NULL?m:(o.ribMat||m),0,0,0);}
const K_NULL=null;

// <<<RETOUCHE3>>>
function fx3_lerp(T,v){if(v<=T[0][0])return T[0][1];for(let k=0;k<T.length-1;k++){const a=T[k],b=T[k+1];if(v<=b[0])return a[1]+(b[1]-a[1])*(v-a[0])/(b[0]-a[0]);}return T[T.length-1][1];}
function fx3_loftY(S,n){   // des sections [{y,pts:[[x,z]…]}] reliées : une bande de nemès (normales plates)
  const T=[];for(let k=0;k<S.length-1;k++){const a=S[k],b=S[k+1];for(let j=0;j<n;j++){const j2=(j+1)%n,
    A=[a.pts[j][0],a.y,a.pts[j][1]],B=[a.pts[j2][0],a.y,a.pts[j2][1]],C=[b.pts[j2][0],b.y,b.pts[j2][1]],D=[b.pts[j][0],b.y,b.pts[j][1]];T.push([A,B,C],[A,C,D]);}}
  for(const s of [S[0],S[S.length-1]]){const c=[0,s.y,0];for(const p of s.pts){c[0]+=p[0]/n;c[2]+=p[1]/n;}for(let j=0;j<n;j++){const p=s.pts[j],q=s.pts[(j+1)%n];T.push([c,[p[0],s.y,p[1]],[q[0],s.y,q[1]]]);}}
  return h3_geo(T);}

/* le relief d'un VISAGE : la profondeur x(y,z) autour du plan FX ; o règle le nez, l'arcade, les lèvres, la mâchoire */
function fx3_dep(o){
  const gs=(v,s)=>Math.exp(-v*v/(2*s*s)),sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);},WF=o.WF;
  return (y,z)=>{const w=fx3_lerp(WF,y),s=Math.min(1,Math.abs(z)/w),az=Math.abs(z);
    let d=-.10*Math.pow(s,2.2)-(o.fr==null?.09:o.fr)*sm(.12,.42,y)-.07*sm(-.18,-.38,y);
    const nh=(o.nh||.125)*sm(.19,-.04,y)*(1-sm(-.08,-.125,y)),ns=(o.ns||.020)+.03*sm(.10,-.06,y);
    d+=nh*gs(z,ns)+.028*gs(y+.07,.02)*gs(az-.055*(o.nw||1),.025)+.02*gs(y+.075,.025)*gs(z,.03);
    d+=(o.br||.045)*gs(y-.215,.03)*(1-Math.min(1,(az/.30)*(az/.30)))-.04*gs(y-.15,.04)*gs(az-.14,.065);
    d+=.03*gs(y+.04,.08)*gs(az-.20,.08);
    d+=(o.lp||1)*(.03*gs(y+.165,.016)*gs(z,.11)+.036*gs(y+.225,.02)*gs(z,.095)-.018*gs(y+.195,.011)*gs(z,.12));
    d+=(o.ch||.045)*gs(y+.315,.04)*gs(z,.085);
    return d;};}
function fx3_mesh(dep,WF,FX,hy,NY,NZ){const G=[],T=[];
  for(let j=0;j<=NY;j++){const y=-.37+.77*j/NY,w=fx3_lerp(WF,y),row=[];for(let i=0;i<=NZ;i++){const z=(i/NZ*2-1)*w;row.push([FX+dep(y,z),hy+y,z]);}G.push(row);}
  for(let j=0;j<NY;j++)for(let i=0;i<NZ;i++)T.push([G[j][i],G[j][i+1],G[j+1][i+1]],[G[j][i],G[j+1][i+1],G[j+1][i]]);
  return h3_geo(T);}
function fx3_poly(dep,FX,hy,P,sd,off,th){   // un motif POSÉ sur le relief (khôl, œil, sourcil) : un plateau mince qui suit la peau
  const V=P.map(p=>{const z=sd*p[0];return [FX+dep(p[1],z)+off,hy+p[1],z];}),n=V.length,c=[0,0,0],Tt=[];
  for(const v of V){c[0]+=v[0]/n;c[1]+=v[1]/n;c[2]+=v[2]/n;}const W2=V.map(v=>[v[0]-th,v[1],v[2]]);
  for(let k=0;k<n;k++){const a=V[k],b=V[(k+1)%n];Tt.push([c,a,b],[a,b,W2[(k+1)%n]],[a,W2[(k+1)%n],W2[k]]);}return h3_geo(Tt);}
/* une BANDE : un ruban épais (4 faces) qui suit une courbe, large au milieu, pointu au bout — mèche, vague, nageoire */
function fx3_band(H,mat,P,wd,th,up,o){
  o=o||{};const V=q=>new THREE.Vector3(q[0],q[1],q[2]),cv=new THREE.CatmullRomCurve3(P.map(V)),sg=o.seg||14,U=V(up||[1,0,0]),T=[],L=[],R=[];
  for(let k=0;k<=sg;k++){const t=k/sg,c=cv.getPoint(t),tg=cv.getTangent(t);let sd=new THREE.Vector3().crossVectors(tg,U);if(sd.length()<.05)sd.set(0,0,1);sd.normalize();
    const nn=new THREE.Vector3().crossVectors(sd,tg).normalize(),w=wd*(o.w0==null?.25:o.w0)+wd*(1-(o.w0==null?.25:o.w0))*Math.pow(Math.sin(Math.PI*Math.min(1,.12+t*.88)),.7)*(1-.35*t),h=th*(1-.3*t);
    const m=(a,b)=>[c.x+sd.x*w*a+nn.x*h*b,c.y+sd.y*w*a+nn.y*h*b,c.z+sd.z*w*a+nn.z*h*b];L.push([m(1,1),m(1,-1),m(-1,-1),m(-1,1)]);}
  for(let k=0;k<sg;k++)for(let j=0;j<4;j++){const j2=(j+1)%4,a=L[k][j],b=L[k][j2],c=L[k+1][j2],d=L[k+1][j];T.push([a,b,c],[a,c,d]);}
  H.add(h3_geo(T),mat,0,0,0);}
/* une MÈCHE DE VAGUE : une bande qui ondule (amp, nw ondes) le long de dir, et finit en SPIRALE (curl, en radians, dans son plan) */
function fx3_lock(H,mat,p0,dir,len,amp,nw,wd,o){
  o=o||{};const V=(a)=>new THREE.Vector3(a[0],a[1],a[2]),d=V(dir).normalize(),w=V(o.w||[0,0,1]).normalize(),g=o.g?V(o.g):new THREE.Vector3(),N=o.n||8,pts=[],P0=V(p0);
  for(let k=0;k<=N;k++){const t=k/N,q=P0.clone().addScaledVector(d,len*t).addScaledVector(w,amp*Math.sin(2*Math.PI*nw*t)*Math.min(1,t*3)).addScaledVector(g,t*t);pts.push(q);}
  fx3_curl(pts,d,w,len,o.curl,o.sg);
  fx3_band(H,mat,pts.map(q=>[q.x,q.y,q.z]),wd,o.th||.035,o.up,{seg:o.seg||16});}
function fx3_curl(pts,d,w,len,cu,sg){   // prolonge la liste de points par une spirale dans le plan (d,w)
  if(!cu)return;let e=pts[pts.length-1].clone(),st=len*.11;
  for(let k=1;k<=3;k++){const a=cu*k/3,dd=d.clone().multiplyScalar(Math.cos(a)).addScaledVector(w,Math.sin(a)*(sg||1));e=e.clone().addScaledVector(dd,st);st*=.8;pts.push(e);}}

/* ================= RETOUCHE 27/10 (retoucheur 3) — LE SPHINX v3 =================
   La tête est un RELIEF sculpté (grille y×z dont la profondeur suit front, arcades, orbites, nez droit, pommettes, lèvres, menton),
   le nemès est une pile de BANDES rayées or / lapis qui s'évasent (pas des boîtes posées), les pans tombent sur la poitrine,
   le collier de perles, la fausse barbe tressée, l'uræus ; les pattes de lion ont coude, poignet, orteils et griffes. */
function h3_sphinx(B0,K){
  const PI=Math.PI,HX=1.0,hy=.50,FX=HX+.30,KH=1.32,lap=h2_poli(0x1c3aa0,260,.5),ORF=h2_poli(0xf2b53c,110,.18);
  const H={add:(g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>B0.add(g,m,HX+KH*((x||0)-HX),hy+KH*((y||0)-hy),KH*(z||0),rx||0,ry||0,rz||0,KH*(sx==null?1:sx),KH*(sy==null?(sx==null?1:sx):sy),KH*(sz==null?(sx==null?1:sx):sz))};   // le groupe TÊTE : tout est mis à l'échelle autour du centre du visage
  const B=B0;
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize(),tige=(a,b,r,m)=>B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],r,1,8),m,0,0,0),corne=(p,d,r,l,m)=>vers10(B,cone10(r,l,10),m,p,d,1);
  const gs=(v,s)=>Math.exp(-v*v/(2*s*s)),sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
  // ---- LE VISAGE : un relief sculpté, facettes plates ----
  const WF=[[-.37,.13],[-.30,.18],[-.20,.255],[-.05,.31],[.14,.325],[.28,.295],[.40,.26]];
  const dep=(y,z)=>{const w=fx3_lerp(WF,y),s=Math.min(1,Math.abs(z)/w),az=Math.abs(z);
    let d=-.10*Math.pow(s,2.2)-.09*sm(.12,.42,y)-.07*sm(-.18,-.38,y);
    const nh=.125*sm(.19,-.04,y)*(1-sm(-.08,-.125,y)),ns=.020+.03*sm(.10,-.06,y);
    d+=nh*gs(z,ns)+.028*gs(y+.07,.02)*gs(az-.055,.025)+.02*gs(y+.075,.025)*gs(z,.03);
    d+=.045*gs(y-.215,.03)*(1-Math.min(1,(az/.30)*(az/.30)))-.04*gs(y-.15,.04)*gs(az-.14,.065);
    d+=.03*gs(y+.04,.08)*gs(az-.20,.08);
    d+=.03*gs(y+.165,.016)*gs(z,.11)+.036*gs(y+.225,.02)*gs(z,.095)-.018*gs(y+.195,.011)*gs(z,.12);
    d+=.045*gs(y+.315,.04)*gs(z,.085);
    return d;};
  const NY=30,NZ=12,G=[];
  for(let j=0;j<=NY;j++){const y=-.37+.77*j/NY,w=fx3_lerp(WF,y),row=[];for(let i=0;i<=NZ;i++){const z=(i/NZ*2-1)*w;row.push([FX+dep(y,z),hy+y,z]);}G.push(row);}
  const T=[];for(let j=0;j<NY;j++)for(let i=0;i<NZ;i++){T.push([G[j][i],G[j][i+1],G[j+1][i+1]],[G[j][i],G[j+1][i+1],G[j+1][i]]);}
  H.add(h3_geo(T),ORF,0,0,0);
  const sp=(P,sd,off,th)=>{const V=P.map(p=>{const z=sd*p[0];return [FX+dep(p[1],z)+off,hy+p[1],z];}),n=V.length,c=[0,0,0],Tt=[];
    for(const v of V){c[0]+=v[0]/n;c[1]+=v[1]/n;c[2]+=v[2]/n;}const W2=V.map(v=>[v[0]-th,v[1],v[2]]);
    for(let k=0;k<n;k++){const a=V[k],b=V[(k+1)%n];Tt.push([c,a,b],[a,b,W2[(k+1)%n]],[a,W2[(k+1)%n],W2[k]]);}return h3_geo(Tt);};
  for(let sd=-1;sd<=1;sd+=2){
    H.add(sp([[.045,.146],[.10,.205],[.18,.206],[.26,.18],[.33,.15],[.23,.112],[.15,.096],[.085,.106]],sd,.016,.016),K.noir,0,0,0);
    H.add(sp([[.07,.146],[.115,.186],[.18,.188],[.24,.162],[.18,.118],[.115,.118]],sd,.03,.018),K.blanc,0,0,0);
    const ez=sd*.15,ex=FX+dep(.152,ez);
    H.add(G10.sph,lap,ex+.04,hy+.152,ez,0,0,0,.036,.038,.018);H.add(G10.sph,K.noir,ex+.056,hy+.152,ez,0,0,0,.017,.018,.010);
    H.add(sp([[.05,.236],[.12,.276],[.21,.27],[.30,.232],[.30,.21],[.21,.24],[.12,.246],[.05,.212]],sd,.03,.02),lap,0,0,0);
    H.add(sp([[.17,-.04],[.215,-.075],[.215,-.065],[.17,-.025]],sd,.016,.01),K.col,0,0,0);}
  // ---- LE NEMÈS : des bandes or / lapis qui s'évasent de la calotte aux épaules ----
  const WN=[[-.50,.52],[-.30,.50],[-.05,.46],[.20,.42],[.40,.35],[.56,.22]],DN=[[-.50,.50],[-.30,.50],[-.05,.48],[.20,.44],[.40,.34],[.56,.22]];
  const pol=(t,gro)=>{const W=fx3_lerp(WN,t)+gro,xb=HX-fx3_lerp(DN,t)-gro,xF=(t>-.12?FX-.03:FX-.03+(HX+.0-FX+.03)*sm(-.12,-.34,t)),wF=t>-.08?.33:.33-.12*sm(-.08,-.34,t),dx=xF-xb;
    const h=[[0,wF],[.20,W],[.58,W*.98],[.86,W*.80],[1,W*.46]],p=[];
    for(const q of h)p.push([xF-dx*q[0],q[1]]);for(let k=h.length-1;k>=0;k--)p.push([xF-dx*h[k][0],-h[k][1]]);return p;};
  const NB=10,t0=-.50,t1=.56;
  for(let k=0;k<NB;k++){const ta=t0+(t1-t0)*k/NB,tb=t0+(t1-t0)*(k+1)/NB,g=k%2?.016:0;
    H.add(fx3_loftY([{y:hy+ta,pts:pol(ta,g)},{y:hy+tb,pts:pol(tb,g)}],10),k%2?lap:K.col,0,0,0);}
  H.add(fx3_loftY([{y:hy+t1,pts:pol(t1,0)},{y:hy+t1+.035,pts:pol(t1,-.05)}],10),K.or,0,0,0);
  // ---- L'URÆUS ----
  {const ux=FX-.06,uy=hy+.36;H.add(h3_tube([[ux-.02,uy-.02,0],[ux+.06,uy+.02,0],[ux+.07,uy+.10,0],[ux+.05,uy+.15,0]],.036,.03,{sides:5}),ORF,0,0,0);   // le cobra se dresse du front
   H.add(G10.sph,ORF,ux+.07,uy+.20,0,0,0,0,.03,.075,.065);H.add(G10.sph,lap,ux+.095,uy+.20,0,0,0,0,.012,.05,.04);                                  // le capuchon, son plastron de lapis
   H.add(G10.sph,ORF,ux+.075,uy+.30,0,0,0,0,.05,.045,.04);H.add(G10.sph,K.noir,ux+.115,uy+.305,0,0,0,0,.014,.014,.018);}
  // ---- LA BARBE : des tresses ----
  for(let k=0;k<9;k++){const y=hy-.38-k*.075,x=FX-.07+(k>6?(k-6)*.035:0);H.add(boite10(.10-k*.003,.074,.12-k*.004),k%2?lap:K.or,x,y,0,0,0,0);}
  // ---- LA POITRINE, LES PANS, LE COLLIER ----
  const XC=HX+.25;
  BXg(B,K.col,HX-.05,-.28,0,0,0,0,.60*2*.62,.80,.96);                                                                                       // la poitrine
  for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<8;k++)BXg(B,k%2?lap:K.col,XC+.06,.12-k*.095,sd*.45,0,0,0,.075,.090,.24);}                          // les pans du nemès
  for(let r=0;r<4;r++){const R=.20+r*.075;B.add(new THREE.TorusGeometry(R,.026,5,r%2?16:12,PI).rotateY(PI/2).rotateX(PI),r%2?lap:K.or,XC+.09+r*.012,.06,0,0,0,0);}
  // ---- LES PATTES DE LION ----
  const yb=-.62;
  for(let sd=-1;sd<=1;sd+=2){const z0=sd*.36,S=[[.95,-.10,.19],[1.25,-.20,.17],[1.55,-.30,.145],[1.75,-.36,.13],[1.92,-.40,.17],[2.06,-.47,.155],[2.14,-.55,.10]];
    B.add(h4_loft(S.map(s=>({x:s[0],y:(s[1]+yb)/2,w:s[2],hu:(s[1]-yb)/2,hd:(s[1]-yb)/2,p:2.6,z:z0})),8),K.col,0,0,0);
    B.add(G10.sph,K.col,1.06,-.30,sd*.40,0,0,0,.19,.19,.16);
    for(let q=0;q<4;q++){const zz=z0+(q-1.5)*.075;B.add(G10.sph,K.col,2.03,yb+.05,zz,0,0,0,.12,.055,.045);corne(P(2.12,yb+.05,zz),D(1,-.25,0),.024,.12,K.blanc);}
    tige(P(.60,-.30,sd*.30),P(1.0,-.34,sd*.36),.07,K.or);}
}

/* ================= RETOUCHE 27/10 (retoucheur 3) — POSÉIDON v3 =================
   Visage en RELIEF (même sculpteur que le sphinx : arcade lourde, nez large, orbites), cheveux, moustache et barbe en MÈCHES DE VAGUE
   (rubans plats qui ondulent et finissent en spirale, teal profond / écume / bleu nuit), trident planté dans un diadème d'or. */
function h3_poseidon(B0,K){
  const PI=Math.PI,HX=1.12,hy=.02,FX=HX+.28,KH=1.42,bronze=h2_poli(0xc98a5c,120,.2),ecume=h2_poli(0xcfeeea,200,.3),nuit=h2_poli(0x1d4f6e,200,.35),teal=h2_poli(0x2c8f94,180,.3);
  const H={add:(g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>B0.add(g,m,HX+KH*((x||0)-HX),hy+KH*((y||0)-hy),KH*(z||0),rx||0,ry||0,rz||0,KH*(sx==null?1:sx),KH*(sy==null?(sx==null?1:sx):sy),KH*(sz==null?(sx==null?1:sx):sz))};
  const WF=[[-.37,.14],[-.30,.20],[-.20,.27],[-.05,.32],[.14,.335],[.28,.31],[.40,.27]];
  const dep=fx3_dep({WF,nh:.12,ns:.026,nw:1.5,br:.07,lp:.7,ch:.05,fr:.07});
  H.add(fx3_mesh(dep,WF,FX,hy,30,12),bronze,0,0,0);
  // le crâne : une calotte sous les cheveux, et la nuque où le tube de plasma entre
  const sc=(x,y,w,hu,hd,p)=>({x:x,y:y,w:w,hu:hu,hd:hd,p:p||2.4,z:0});
  H.add(h4_loft([sc(.60,hy+.02,.34,.36,.34),sc(.82,hy+.08,.50,.60,.50),sc(1.08,hy+.12,.54,.68,.54),sc(1.28,hy+.10,.52,.66,.50),sc(FX-.10,hy+.08,.47,.58,.42,2.6)],10),nuit,0,0,0);
  for(let sd=-1;sd<=1;sd+=2){
    H.add(fx3_poly(dep,FX,hy,[[.05,.146],[.10,.205],[.18,.205],[.26,.18],[.33,.15],[.23,.112],[.15,.096],[.085,.106]],sd,.016,.016),K.colD,0,0,0);               // le cerne sombre de l'orbite
    H.add(fx3_poly(dep,FX,hy,[[.07,.146],[.115,.184],[.18,.186],[.24,.160],[.18,.118],[.115,.118]],sd,.03,.018),K.glow,0,0,0);                                  // l'œil de glace
    const ez=sd*.15,ex=FX+dep(.152,ez);H.add(G10.sph,K.noir,ex+.05,hy+.152,ez,0,0,0,.017,.02,.010);
    for(let k=0;k<2;k++)fx3_lock(H,k?ecume:teal,[FX-.02-k*.02,hy+.26+.03*k,sd*.06],[0,.35,sd],.30+.04*k,.035,1.2,.05,{w:[1,0,0],up:[0,0,sd],curl:2.4,sg:-1,th:.03,n:6});}   // les sourcils : une vague qui remonte
  // les cheveux : des mèches qui filent sur le crâne vers la nuque, en vagues, une spirale au bout
  const top=x=>fx3_lerp([[.55,.30],[.70,.58],[.95,.78],[1.15,.84],[1.30,.74]],x);
  for(let k=0;k<9;k++){const z=(k-4)*.118,f=Math.sqrt(Math.max(.06,1-(z/.60)*(z/.60))),pts=[];
    for(let j=0;j<=10;j++){const t=j/10,x=1.34-.70*t;pts.push(new THREE.Vector3(x,hy+top(x)*f+.045+(t>.75?-(t-.75)*.9:0),z*(1+.35*t)+.05*Math.sin(t*9+k)));}
    fx3_curl(pts,new THREE.Vector3(-1,-.9,0).normalize(),new THREE.Vector3(0,0,1),.7,2.6,z<0?-1:1);
    fx3_band(H,k%3===0?ecume:(k%2?teal:nuit),pts.map(q=>[q.x,q.y,q.z]),.15,.05,[0,1,0],{seg:20});}
  for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++)fx3_lock(H,k===1?ecume:(k?nuit:teal),[FX-.52-k*.08,hy+.26-.06*k,sd*(.47+.02*k)],[-.15-.05*k,-1,sd*.06],.80+.10*k,.05,1.6,.13,{w:[0,0,sd],up:[1,0,sd],curl:2.8,sg:-1,th:.05,n:10});   // les grandes mèches des tempes, qui tombent sur les épaules
  // la moustache et la barbe
  for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<2;k++)fx3_lock(H,k?ecume:teal,[FX+.02+k*.015,hy-.10-k*.03,sd*.06],[.28,-.30-.1*k,sd*1],.52+.1*k,.045,1.0,.09,{w:[0,1,0],up:[1,0,0],curl:2.6,sg:1,th:.04,n:8});}
  for(let k=0;k<9;k++){const z=(k-4)*.062,L=.78-.07*Math.abs(k-4)+(k%2?.06:0);
    fx3_lock(H,k%3===0?ecume:(k%2?teal:nuit),[FX-.02,hy-.28-.01*Math.abs(k-4),z],[.30-.04*Math.abs(k-4),-1,0],L+.25,.06,1.7,.10,{w:[0,0,1],up:[1,0,0],curl:2.6,sg:k%2?1:-1,th:.05,n:10,g:[.1,0,0]});}
  // le diadème d'or et le trident
  H.add(new THREE.TorusGeometry(1,.05,6,28).rotateX(PI/2),K.or,.98,hy+.50,0,0,0,0,.40,1,.52);
  const tx=1.34,ty=hy+.50;
  H.add(h3_tube([[tx,ty,0],[tx,ty+.25,0],[tx,ty+.55,0]],.05,.04,{sides:6}),K.or,0,0,0);
  for(const [w,hh] of [[0,.78],[-.28,.62],[.28,.62]]){
    if(w!==0)H.add(h3_tube([[tx,ty+.20,0],[tx,ty+.36,w*.7],[tx,ty+.48,w]],.04,.035,{sides:5}),K.or,0,0,0);
    H.add(h3_tube([[tx,ty+(w?.58:.50),w],[tx,ty+hh-.18,w]],.04,.035,{sides:5}),K.or,0,0,0);
    vers10(H,cone10(.075,.30,6),K.or,new THREE.Vector3(tx,ty+hh-.20,w),new THREE.Vector3(0,1,0),1);
    for(const sd of [-1,1])vers10(H,cone10(.03,.16,5),K.or,new THREE.Vector3(tx,ty+hh-.12,w+sd*.07),new THREE.Vector3(0,.7,sd*.5).normalize(),1);}
}

/* ================= RETOUCHE 27/10 (retoucheur 3) — LA COMÈTE v3 =================
   Le renard de glace est plus gros et plus sculpté (crête de cristaux, front à gemme d'or, oreilles à cœur de braise, mâchoire basse et crocs) ;
   la queue n'est plus trois cônes translucides mais une GERBE DE LANGUES DE FEU opaques (sept lobes ondulés, du blanc brûlant au magenta),
   enfilées dans trois anneaux d'or, hérissées d'éclats de glace. Aucune matière transparente. */
function fx3_comete(B,K){
  const PI=Math.PI,P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize(),k=2.3,x0=.05;
  const mb=c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide});
  const F={w:mb(0xfffbe8),j:mb(0xffe27a),o:mb(0xffa030),r:mb(0xff4a2a),m:mb(0xd0287a),v:mb(0x7a2a9a)};
  const sec=(x,y,w,hu,hd,p,z)=>({x:x0+x*k,y:y*k,w:w*k,hu:hu*k,hd:hd*k,p:p||2.6,z:(z||0)*k});
  // ---- LA TÊTE : crâne, museau, mâchoire ----
  B.add(h4_loft([sec(-.08,0,.26,.26,.24),sec(.06,.01,.38,.34,.27),sec(.24,.01,.44,.37,.28),sec(.44,-.01,.34,.27,.21),sec(.66,-.03,.22,.17,.13),sec(.86,-.05,.14,.11,.09),sec(1.0,-.065,.08,.06,.05,2.2)],8),K.col,0,0,0);
  B.add(h4_loft([sec(.22,-.16,.22,.045,.08),sec(.50,-.14,.17,.04,.06),sec(.78,-.115,.10,.03,.045),sec(.93,-.10,.05,.025,.03,2.2)],6),K.blanc,0,0,0);           // la mâchoire basse, claire
  B.add(h4_loft([sec(.36,.26,.045,.03,.02),sec(.66,.12,.032,.02,.016),sec(.98,.0,.022,.013,.012)],5),K.blanc,0,0,0);                                     // l'arête du nez
  B.add(G10.sph,K.glow,x0+1.0*k+.02,-.065*k+.02,0,0,0,0,.075,.06,.075);
  const pk=(x,y,z,d,r,l,m,sg)=>vers10(B,cone10(r*k,l*k,sg||4),m,P(x0+x*k,y*k,z*k),d,1);
  for(let sd=-1;sd<=1;sd+=2){
    pk(.12,.30,sd*.22,D(-.18,1,sd*.55),.22,.80,K.metal);pk(.14,.31,sd*.21,D(-.18,1,sd*.55),.12,.64,K.glow);pk(.04,.30,sd*.26,D(-.45,.9,sd*.9),.10,.55,K.or);   // l'oreille de cristal, son cœur de braise, sa corne d'or
    pk(.26,-.02,sd*.38,D(-.55,-.10,sd*1.0),.11,.46,K.col);pk(.24,-.11,sd*.36,D(-.60,-.35,sd*.9),.09,.40,K.col);pk(.22,.07,sd*.38,D(-.45,.25,sd*1.0),.09,.38,K.blanc);     // la fraise des joues
    B.add(G10.sph,K.noir,x0+.45*k,.16*k,sd*.20*k,0,0,0,.115*k,.075*k,.052*k);                                                                         // l'orbite
    B.add(G10.box,K.glow,x0+.49*k,.165*k,sd*.235*k,0,sd*-.32,sd*.25,.17*k,.045*k,.026*k);B.add(G10.sph,K.blanc,x0+.54*k,.165*k,sd*.25*k,0,0,0,.022*k,.022*k,.014*k);   // l'œil : une fente de braise, un éclat
    B.add(h4_loft([sec(.30,.23,.085,.038,.03,2.4,sd*.20),sec(.46,.245,.095,.04,.032,2.4,sd*.215),sec(.64,.185,.055,.03,.024,2.4,sd*.14)],6),K.blanc,0,0,0);   // l'arcade
    for(let j=0;j<3;j++)pk(.74,-.045-j*.02,sd*.10,D(-.9,-.05+j*.14,sd*(.5+j*.3)),.014,.56+j*.09,K.blanc,4);                                        // les moustaches
    pk(.80,-.10,sd*.045,D(.25,-1,sd*.05),.030,.20,K.blanc,5);pk(.62,-.12,sd*.08,D(.2,-1,sd*.1),.026,.16,K.blanc,5);}                                   // les crocs du bas
  // la crinière : un halo d'éclats couchés vers la queue, trois couleurs
  for(let j=0;j<18;j++){const a=j/18*2*PI,c=Math.cos(a),sn=Math.sin(a);pk(-.03,sn*.30,c*.30,D(-1,sn*.5,c*.5),.07,.42+(j%3)*.10,j%3===0?K.or:(j%2?K.metal:K.col));}
  // la crête : cinq grands cristaux balayés vers l'arrière, une gemme d'or au front
  for(let j=0;j<5;j++)pk(.34-j*.10,.34+.01*j,0,D(-.55-.12*j,1,0),.085-.01*j,.52-.06*j+.0,j%2?K.blanc:K.metal,5);
  B.add(G10.sph,K.or,x0+.56*k,.265*k,0,0,0,0,.055*k,.075*k,.045*k);
  // ---- LA QUEUE : sept langues de feu opaques, enfilées dans trois anneaux ----
  const rad=[[0,0,'w',.16,3.0],[1,0,'j',.17,2.8],[2,0,'o',.17,3.0],[3,0,'r',.18,2.7],[4,0,'m',.17,3.1],[5,0,'o',.16,2.5],[6,0,'v',.17,2.8]];
  const lobes=[];
  for(let n=0;n<6;n++){const a=n/6*2*PI+.3,ca=Math.cos(a),sa=Math.sin(a),L=[2.2,2.7,2.4,2.9,2.3,2.6][n];
    const path=t=>{const x=.02-L*t,r=.24+.40*Math.pow(t,.7),w=Math.sin(t*9+n*1.7)*.07*t;return [x,ca*(r+w),sa*(r+w)+Math.cos(t*7+n)*.06*t];};
    const pts=[];for(let j=0;j<=14;j++)pts.push(path(j/14));
    const col=[F.o,F.r,F.j,F.m,F.o,F.r][n];
    B.add(h4_tubeV(pts,t=>(.43*Math.pow(1-t,.75)+.014)*(1+.22*Math.sin(t*18+n)),44,6,true),col,0,0,0);
    lobes.push({path,n,ca,sa});
    for(const t of [.30,.52,.74]){const q=path(t),o=D(-.5,ca,sa);pk2(q,o,.05*(1-t*.5),.34*(1-t*.4),n%2?K.blanc:K.col);}}
  function pk2(q,d,r,l,m){vers10(B,cone10(r,l,4),m,P(q[0]+x0*0,q[1],q[2]),d,1);}
  // la langue centrale, la plus longue : du blanc brûlant au magenta, par bandes
  {const pts=[];for(let j=0;j<=16;j++){const t=j/16;pts.push([.04-3.2*t,Math.sin(t*8)*.05*t,Math.cos(t*6)*.05*t]);}
   const cu=new THREE.CatmullRomCurve3(pts.map(p=>P(p[0],p[1],p[2])));
   const bands=[[0,.22,F.w,.30],[.22,.45,F.j,.26],[.45,.68,F.o,.20],[.68,.86,F.r,.13],[.86,1,F.m,.07]];
   for(const bd of bands){const sub=[];for(let j=0;j<=6;j++){const t=bd[0]+(bd[1]-bd[0])*j/6,q=cu.getPoint(t);sub.push([q.x,q.y,q.z]);}
     B.add(h4_tubeV(sub,t=>{const T=bd[0]+(bd[1]-bd[0])*t;return bd[3]*(1-.85*Math.pow(T,1.3))*(.9+.1*Math.sin(T*30));},18,6,true),bd[2],0,0,0);}}
  // trois anneaux d'or : ils passent EN TRAVERS des langues (ils les touchent)
  for(const [x,R] of [[-.45,.36],[-1.05,.50],[-1.70,.66]]){const t=(.02-x)/2.9,rr=.24+.40*Math.pow(t,.7);
    B.add(new THREE.TorusGeometry(rr+.02,.034,6,34).rotateY(PI/2),K.or,x,0,0);}
  // le grand anneau d'or, penché, tenu au cou par quatre rayons (il touche le col ET les langues)
  {const tau=.38,Rr=1.32,cx=-.10;B.add(new THREE.TorusGeometry(Rr,.085,6,44).rotateY(PI/2).rotateZ(tau),K.or,cx,0,0);
   for(let j=0;j<4;j++){const a=j/4*2*PI+.4,c=Math.cos(a),sn=Math.sin(a);B.add(tube10([[.04,sn*.2,c*.2],[cx-Rr*sn*Math.sin(tau),Rr*sn*Math.cos(tau),Rr*c]],.05,1,6),K.or,0,0,0);}}
  // le col : la braise qui lie la tête aux langues
  B.add(G10.sph,F.j,.04,0,0,0,0,0,.32,.32,.32);B.add(G10.sph,F.w,.20,0,0,0,0,0,.20,.20,.20);
}

/* ================= RETOUCHE 27/10 (retoucheur 3) — LA NAISSANCE v3 =================
   Le lotus est plus profond (une coupe qui se lit de côté comme de dessus), ses pétales sont saturés (or, rose vif, perle), le cœur est une étoile
   incandescente à couronne de flammes, les grands anneaux de supernova ont un liseré lumineux. Plus de halo translucide : tout est opaque. */
function fx3_naissance(B,K){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),PI=Math.PI;
  const mb=c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}),or2=h2_poli(0xffb21c,210,.35),rose=h2_poli(0xff2a7a,230,.3),rose2=h2_poli(0xc2145a,200,.3),perle=h2_poli(0xfff4ea,300,.55);
  const Y={w:mb(0xffffff),j:mb(0xffe566),o:mb(0xff9a1c),r:mb(0xff4a3a),p:mb(0xff6aa8)};
  const cal=[[10,1.20,1.10,.28,or2,0,.20,.034],[8,.70,1.45,.27,rose,PI/8,.15,.04],[8,.28,1.70,.21,perle,PI/16,.08,.034],[6,.10,1.25,.13,Y.j,PI/6,.05,.03]];   // [n, ouverture, longueur, demi-largeur, matière, phase, relevé du bout, épaisseur]
  for(let L=0;L<cal.length;L++){const c=cal[L];
    for(let k=0;k<c[0];k++){const f=k/c[0]*2*PI+c[5],cf=Math.cos(f),sf=Math.sin(f),al=c[1],r0=.12+.05*L;
      h4_pose(B,h4_petale(c[2],c[3],c[7]+.01,c[6],1.4),c[4],V(-.05+L*.03,r0*cf,r0*sf),V(Math.cos(al),Math.sin(al)*cf,Math.sin(al)*sf),V(0,cf,sf),1);
      if(L===1||L===2){const e=V(-.05+L*.03+Math.cos(al)*c[2],r0*cf+Math.sin(al)*cf*c[2]+cf*c[6]*c[2]*.25,r0*sf+Math.sin(al)*sf*c[2]+sf*c[6]*c[2]*.25);
        vers10(B,cone10(.06,.20,4),L===1?or2:rose,e.clone().addScaledVector(V(Math.cos(al),Math.sin(al)*cf,Math.sin(al)*sf).normalize(),-.06),V(Math.cos(al),Math.sin(al)*cf,Math.sin(al)*sf).normalize(),1);}}}   // une pointe d'or ou de rose au bout des pétales
  for(let k=0;k<6;k++){const f=k/6*2*PI+.3,cf=Math.cos(f),sf=Math.sin(f);                                                  // les sépales : le calice, vers l'arrière
    h4_pose(B,h4_petale(.70,.14,.04,.2,1.4),rose2,V(-.12,.16*cf,.16*sf),V(-.8,.6*cf,.6*sf),V(0,cf,sf),1);}
  // la tige qui se creuse en tuyère
  TX(B,K.chrome,[[.36,0],[.31,.20],[.23,.55],[.18,.90],[.21,1.05],[.36,1.25]],-.05,0,0,PI,24);
  for(const d of [.22,.62,.98]){const rr=d<.4?.32:d<.8?.21:.20;B.add(new THREE.TorusGeometry(rr+.02,.03,5,24),or2,-.05-d,0,0,0,PI/2,0);}
  TX(B,Y.o,[[.001,0],[.33,.12],[.001,.46]],-1.30,0,0,PI,16);
  // l'ÉTOILE qui naît au creux de la fleur : un cœur blanc, une couronne de flammes opaques, un faisceau
  B.add(G10.sph,Y.w,.36,0,0,0,0,0,.30,.30,.30);
  const fib=dirs10(22);let nf=0;
  for(const d of fib){if(d.x<-.15)continue;const dd=d.clone().normalize(),m=[Y.j,Y.o,Y.r][nf%3];nf++;vers10(B,cone10(.085,.26+.14*(nf%2),5),m,V(.36+dd.x*.26,dd.y*.26,dd.z*.26),dd,1);}
  B.add(cone10(.15,1.5,12),Y.j,.50,0,0,0,0,0);B.add(cone10(.055,2.0,8),Y.w,.50,0,0,0,0,0);
  // les grands anneaux de supernova : le premier touche les pointes des pétales, les tirants d'or tiennent les autres
  const rg=[[1.12,.34,or2,Y.j,0],[1.36,.22,perle,Y.w,.55],[1.60,.10,rose,Y.p,-.55]];
  const rp=(r,a)=>{const st=Math.sin(a),sn=Math.sin(r[4]),cs=Math.cos(r[4]);return [r[1]-r[0]*st*sn,r[0]*st*cs,r[0]*Math.cos(a)];};
  for(const r of rg){B.add(new THREE.TorusGeometry(r[0],.05,6,64).rotateY(PI/2).rotateZ(r[4]),r[2],r[1],0,0);B.add(new THREE.TorusGeometry(r[0],.022,5,64).rotateY(PI/2).rotateZ(r[4]),r[3],r[1]+.055,0,0);}
  const dist=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1],u[2]-v[2]);
  for(let q=0;q<2;q++){const A=rg[q],Bq=rg[q+1];
    for(let h=0;h<2;h++){let best=9,pa=null,pb=null;
      for(let i=0;i<72;i++)for(let j=0;j<72;j++){const a=(i/72+h)*PI,b=(j/72+h)*PI,u=rp(A,a),v=rp(Bq,b),d=dist(u,v);if(d<best){best=d;pa=u;pb=v;}}
      B.add(tube10([pa,pb],.03,1,6),or2,0,0,0);B.add(G10.sph,or2,pa[0],pa[1],pa[2],0,0,0,.065,.065,.065);B.add(G10.sph,or2,pb[0],pb[1],pb[2],0,0,0,.065,.065,.065);}}
  for(let k=0;k<16;k++){const a=k/16*2*PI,p2=rp(rg[2],a),c=rg[2][1];vers10(B,cone10(.06,.34,5),k%2?or2:Y.p,V(p2[0],p2[1],p2[2]),V(p2[0]-c,p2[1],p2[2]).normalize(),1);}
}

// <<<FIN RETOUCHE3>>>
