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
 [0x7a8aa0,0x8ad8ff],[0xb81a3a,0xff6a80],[0x16161c,0xff4a14],[0xffc030,0xfff6c0],[0x2adf8a,0xb0ffe0],   // 22 lance d'Odin · 23 cœur battant · 24 dragon cosmique · 25 Hélios · 26 alien
 [0xb4bccb,0xbfe8ff],[0x9ad8ff,0xff9a40],[0xff6ea0,0xffd0f0],[0xf5f6fa,0xffd780]];                        // 27 ouroboros · 28 Halley · 29 naissance · 30 l'infini
function th30Kit(E,i){const t=TH30[i];return t?Object.assign({},E,{col:t[0],flam:t[1]}):E;}
/* ============ ARTISTE 1 — LES OUTILS DE SCULPTURE (h1_*) : crânes lofts, tubes effilés, plumes posées ============
   h1_loft : un solide balayé le long de X — chaque section [x, cy, demi-largeur z, demi-hauteur y, décalage z, aplat du dessous] ; `pw` > 2 = carré
   h1_tube : un tube EFFILÉ qui suit une courbe (cornes, pattes, tentacules, becs) — rayons [r0,…,rN] le long du chemin, la pointe peut valoir ~0
   h1_pose : pose une pièce plane (plume, nageoire) selon son axe et la normale de son plan */
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
  B.add(h1_ell(-XE-.22,.32,0,.44,.30,.30,12,8),K.col,0,0,0);                                                                              // la tête
  B.add(h1_ell(-XE-.20,.54,0,.26,.10,.20,10,6),K.colD,0,0,0);                                                                             // le front, plus sombre
  B.add(h1_ell(-XE-.05,.50,0,.20,.08,.14,8,5),K.glow,0,0,0);                                                                              // le calot irisé
  B.add(h1_loft([[-XE-.52,.07,.05,.025],[-XE-.30,.06,.18,.05],[-XE-.02,.05,.24,.07],[-XE+.18,.05,.14,.05]],10,2),K.glow,0,0,0);          // la gorge qui brille
  B.add(h1_tube([[-XE-.52,.31,0],[-XE-.90,.28,0],[-XE-1.36,.18,0]],[.064,.034,.004],12,6),K.or,0,0,0);                                  // le bec
  B.add(h1_tube([[-XE-.52,.25,0],[-XE-.86,.21,0],[-XE-1.18,.13,0]],[.05,.022,.004],10,6),K.lame,0,0,0);                                 // la mandibule du bas
  for(let sd=-1;sd<=1;sd+=2){h1_oeil(B,K,-XE-.36,.42,sd*.245,.055,sd,K.or);
    B.add(h1_ell(-XE-.14,.18,sd*.26,.18,.10,.07,8,5),K.colD,0,0,0);                                                                       // la joue
    const sh=h1_v(-XE*.10,top-.02,sd*.20),u=h1_v(-.10,.50,sd*1).normalize(),v=h1_v(1,0,0),nz=new THREE.Vector3().crossVectors(u,v);
    B.add(G10.sph,K.colD,sh.x,sh.y,sh.z,0,0,0,.11,.10,.11);
    for(let r=0;r<2;r++)for(let k=0;k<(r?6:8);k++){const f=k/(r?5:7),psi=(r?8+f*65:6+f*88)*H1PI/180,len=(r?.65:.90)+(r?.30:.42)*Math.sin(.4+f*2.5),
        dir=u.clone().multiplyScalar(Math.cos(psi)).addScaledVector(v,Math.sin(psi));
      h1_pose(B,h1_plume(len,.17-r*.03,.022),(k+r)%2?K.col:K.colD,sh.clone().addScaledVector(nz,(r*.035+k*.004)*sd),dir,nz);
      if(!r&&k>=2&&k<7)B.add(G10.sph,K.glow,sh.x+dir.x*len,sh.y+dir.y*len,sh.z+dir.z*len,0,0,0,.03,.03,.03);}
    B.add(h1_tube([[sh.x,sh.y,sh.z],[sh.x+.10,sh.y+.32,sh.z+sd*.30],[sh.x+.22,sh.y+.56,sh.z+sd*.52]],[.05,.036,.018],6,5),K.or,0,0,0);        // le bras de l'aile
    for(let q=0;q<2;q++)for(let k=0;k<5;k++)h1_pose(B,h1_plume(.30,.13,.02),(k+q)%2?K.colD:K.col,h1_v(-XE+.20+k*.17+q*.08,top-.07-q*.07,sd*(.20+q*.05)),h1_v(1,-.08,sd*.30),h1_v(0,1,-sd*.20));
    for(let q=0;q<3;q++)for(let k=0;k<6;k++)h1_pose(B,h1_plume(.30,.15,.02),(k+q)%2?K.colD:K.col,h1_v(-XE+.12+k*(L-.5)/5+q*.07,.20-q*.17,sd*(.33+q*.012)),h1_v(1,-.18,0),h1_v(0,0,sd));
  }
  B.add(h1_loft([[-XE+.10,top-.02,.22,.05],[-XE+.40,top+.03,.30,.17,0,.4],[XE-.30,top+.03,.28,.16,0,.4],[XE+.0,top-.04,.18,.07]],12,2.2),K.col,0,0,0);   // le dos, bombé : le couvre-culasse devient plumage
  BXg(B,K.glow,0,top+.20,0,0,0,0,L*.55,.012,.05);
  B.add(h1_loft([[XE-.30,.46,.16,.10],[XE-.05,.46,.17,.10],[XE+.20,.48,.12,.06],[XE+.34,.50,.05,.03]],10,2),K.colD,0,0,0);              // le croupion
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
    // les cinq ouïes, en courbe
    for(let k=0;k<5;k++){const ox=.30+k*.09;BXg(B,K.noir,-XE+ox,.16+k*.01,sd*(ia(H,ox,2)*.96+.012),0,0,sd*(.20-k*.02),.022,.40-k*.03,.02);}
        // la ligne latérale
    BXg(B,K.glow,.30,.13,sd*.352,0,0,0,L*.30,.012,.012);
    // les pectorales
    B.add(plan10([[0,.14],[.34,.04],[.76,-.28],[1.0,-.70],[.64,-.54],[.30,-.36],[0,-.18]],.04,.01),K.col,-XE+.50,.0,sd*.34,sd*.85,0,0);
    B.add(plan10([[0,0],[.26,-.04],[.34,-.30],[.14,-.22]],.03,.008),K.col,XE-.46,-.16,sd*.26,sd*.8,0,0);
  }
  B.add(plan10([[-.50,0],[.55,0],[.42,.22],[.20,.55],[-.05,1.0],[-.22,.76],[-.40,.40]],.05,.012),K.col,-L*.06,top+.01,0);                    // la dorsale
  B.add(plan10([[0,0],[.34,0],[.22,.34],[.06,.30]],.03,.008),K.col,XE-.46,top+.01,0);
  // la caudale : deux lobes de part et d'autre de la tuyère
  B.add(plan10([[-.14,.40],[.32,.54],[.66,.70],[.84,.98],[1.02,1.40],[.78,1.02],[.64,.80],[.50,.62],[.24,.50],[-.14,.34]],.05,.012),K.col,XE,0,0);
  B.add(plan10([[-.14,-.06],[.30,-.20],[.52,-.40],[.70,-.80],[.46,-.62],[.30,-.50],[-.14,-.34]],.05,.012),K.col,XE,0,0);
  BXg(B,K.blanc,0,-.345,0,0,0,0,L*.96,.04,.54);
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
  // la proue : une anémone-polype — disque rose, deux couronnes de tentacules fins qui ondulent, bouche d'or
  const xa=-XE+.04,ya=.10;
  TX(B,K.col,[[.001,.22],[.14,.18],[.22,.08],[.24,.0],[.22,.16],[.001,.22]],xa,ya,0,PI10,14);
  B.add(new THREE.TorusGeometry(.19,.026,5,16),K.or,xa-.05,ya,0,0,PI10/2,0);
  for(let k=0;k<10;k++){const t=k/10*2*H1PI,cs=Math.cos(t),sn=Math.sin(t),R=.17+(k%2)*.06,sw=.03*Math.sin(k*2.3);
    B.add(h1_tube([[xa-.02,ya+cs*R*.8,sn*R*.8],[xa-.18,ya+cs*(R+.10),sn*(R+.10)+sw],[xa-.30-(k%2)*.06,ya+cs*(R+.22),sn*(R+.22)-sw],[xa-.34-(k%2)*.06,ya+cs*(R+.34),sn*(R+.34)]],[.030,.022,.014,.006],10,4),k%2?K.blanc:K.col,0,0,0);
    B.add(G10.sph,K.or,xa-.34-(k%2)*.06,ya+cs*(R+.34),sn*(R+.34),0,0,0,.02,.02,.02);}
  B.add(tourX([[.001,.0],[.09,.0],[.09,.04],[.001,.04]],10),K.glow,xa-.14,ya,0,0,PI10,0);
  // les colonies encroûtantes sur les flancs
  for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<5;k++){const x=-XE*.62+k*(L*.26),y=-.20+(k%2)*.07;
      for(let q=0;q<3;q++)B.add(G10.sph,(k+q)%2?K.col:K.blanc,x+(q-1)*.07,y+q*.035,sd*(.33+q*.02),0,0,0,.075-q*.012,.07-q*.01,.06);
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
  case 2:{ // LE COLIBRI — HYBRIDE : tête ronde, long bec, gorge qui brille, ailes en V, queue en ciseaux
    h1_p2(B,K,L,XE,top);break;}
  case 3:{ // LE SCORPION — HYBRIDE : tergites, pinces, huit pattes, la queue née de l'échappement
    h1_p3(B,K,L,XE,top);break;}
  case 4:{ // LE HIBOU — HYBRIDE : le disque facial est la face, ailes repliées, serres, queue en éventail
    h1_p4(B,K,L,XE,top);break;}
  case 5:{ // LE REQUIN — HYBRIDE : crâne sculpté (museau, gueule, dents, narines, arcade, œil), ouïes, nageoires, caudale en deux lobes
    h1_p5(B,K,L,XE,top);break;}
  case 6:{ // L'ÉTOILE DE MER — HYBRIDE : la face orale de l'étoile, cinq bras à sillon, dos hérissé, tuyère en étoile
    h1_p6(B,K,L,XE,top);break;}
  case 7:{ // LE CORAIL — des branches roses qui poussent au-dessus du vé, perles de nacre au bout
    const br=(p,d,l,n)=>{const q=p.clone().addScaledVector(d,l);tige(p,q,.022+.016*n,K.col);if(n<=1){boule(K.blanc,q.x,q.y,q.z,.05);for(let u=0;u<5;u++){const a=u/5*2*PI10;corne(q.clone().addScaledVector(D(Math.cos(a)*.6,.5,Math.sin(a)*.6),.04),D(Math.cos(a)*.7,.9,Math.sin(a)*.7),.016,.10,K.col);}return;}
      br(q,D(d.x+.35,d.y,d.z+.45),l*.78,n-1);br(q,D(d.x-.35,d.y,d.z-.45),l*.78,n-1);};
    for(let k=0;k<3;k++)br(P((k-1)*L*.30,top-.02,(k-1)*.04),D(0,1,0),.30,3);
    h1_p7(B,K,L,XE,top);
    break;}
  case 8:{ // L'ORQUE (h2) — LE MOTEUR EST l'orque : le bloc = le corps (dos noir laqué, ventre blanc), la cloche d'embrayage = la tête sculptée (melon bombé,
    //   rostre, ligne de bouche, tache blanche, œil de glace, dents), le grand aileron au dos, les palettes pectorales, et l'échappement = le PÉDONCULE
    //   qui finit en queue à nageoires horizontales autour de la tuyère à braise
    const W=h2_poli(0xf4f8ff,160,.28),G=h2_poli(0x8e9aae,200,.4),hx=-XE-.02,T=K.col;
    // la tête : le melon (front bombé qui monte), puis le rostre court
    B.add(h2_loft([[hx+.30,.0,.38,.40,2.6],[hx+.04,.04,.42,.43,2.6],[hx-.22,.09,.41,.41,2.5],[hx-.46,.08,.32,.33,2.4],[hx-.66,.02,.20,.23,2.4],[hx-.82,-.03,.09,.13,2.4]],12),T,0,0,0);
    // la mâchoire inférieure et la gorge : BLANCHES, plus basses que le crâne
    B.add(h2_loft([[hx+.30,-.23,.17,.34,2.6],[hx+.0,-.24,.16,.35,2.6],[hx-.30,-.22,.13,.30,2.5],[hx-.56,-.17,.10,.21,2.4],[hx-.76,-.12,.05,.11,2.4]],12),W,0,0,0);
    // le torse noir qui habille le carter, et le ventre blanc qui le déborde par le bas et les flancs
    B.add(h2_loft([[-XE+.05,.0,.30,.36,2.8],[-L*.3,.08,.35,.43,2.8],[L*.2,.08,.35,.43,2.8],[XE-.02,.04,.30,.36,2.8],[XE+.20,.04,.22,.25,2.5]],12),T,0,0,0);
    B.add(h2_loft([[-XE+.02,-.22,.26,.34,2.7],[-L*.3,-.22,.30,.455,2.7],[L*.2,-.22,.30,.455,2.7],[XE-.02,-.20,.26,.37,2.7],[XE+.22,-.10,.16,.24,2.5],[XE+.34,-.03,.07,.12,2.4]],12),W,0,0,0);
    B.add(h2_loft([[hx+.10,.22,.38,.43,2.6],[hx+.50,.44,.50,.52,2.7],[-L*.20,.52,.42,.57,2.9],[L*.25,.52,.42,.57,2.9],[XE+.04,.30,.36,.42,2.6]],12),T,0,0,0);   // la bosse du dos : la nuque monte jusqu'au dos, la culasse en sort comme une armure
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,W,L*.20,-.02,sd*.43,0,0,sd*.1,.34,.10,.05);}                                                  // la tache blanche de la hanche
    for(let sd=-1;sd<=1;sd+=2){
      // la tache blanche derrière l'œil (oblique, comme l'orque), l'œil de glace, le sourcil
      B.add(G10.sph,W,hx-.28,.20,sd*.375,0,0,sd*.30,.20,.068,.04);
      B.add(G10.sph,K.noir,hx-.47,.11,sd*.315,0,0,0,.045,.045,.034);B.add(G10.sph,K.glow,hx-.475,.115,sd*.332,0,0,0,.026,.026,.022);
      // la ligne de bouche : un trait sombre du rostre aux joues
      B.add(tube10([[hx-.80,-.07,sd*.08],[hx-.56,-.09,sd*.20],[hx-.28,-.10,sd*.35],[hx+.02,-.07,sd*.42]],.012,12,4),K.noir,0,0,0);
      // les dents : une rangée blanche, haut et bas
      for(let k=0;k<6;k++){const x=hx-.12-k*.11,z=sd*(.36-k*.04);vers10(B,cone10(.022,.085,5),W,P(x,-.115,z),D(0,-1,0),1);vers10(B,cone10(.020,.075,5),W,P(x-.03,-.085,z*.96),D(0,1,0),1);}
      // la selle grise derrière l'aileron
      B.add(G10.sph,G,L*.22,.80,sd*.34,0,0,sd*.55,.36,.06,.17);
      // la palette pectorale : large, arrondie, qui part du flanc
      B.add(plan10([[0,0],[.20,.40],[.46,.70],[.70,.58],[.62,.24],[.32,-.02]],.05,.01),T,-XE+.50,-.12,sd*.36,sd*PI10/2,0,-.35);
    }
    B.add(G10.sph,K.noir,hx+.02,.46,0,0,0,0,.08,.016,.035);                                                              // l'évent
    // le grand aileron dorsal, en faucille, planté dans la vallée du V
    B.add(plan10([[-.40,0],[-.20,.55],[.14,1.30],[.17,.78],[.52,0]],.07,.012),T,-L*.04,top-.40,0);
    B.add(plan10([[-.40,.02],[-.20,.55],[.14,1.30],[.125,1.22],[-.17,.55],[-.34,.05]],.09,.004),K.glow,-L*.04,top-.40,0);       // le liseré de glace du bord d'attaque
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
    const hx=-XE,DM=[[-XE-.02,.14,.16,.38],[-XE+.22,.17,.42,.82],[-XE+.55,.18,.54,.98],[-.04,.18,.58,1.02],[XE-.32,.18,.52,.98],[XE-.02,.16,.38,.80],[XE+.20,.14,.16,.44]];
    B.add(h2_loft(DM,16,true,true),K.colD,0,0,0);                                                     // la carapace : un dôme à fond plat
    const sec=x=>{for(let k=0;k<DM.length-1;k++){const a=DM[k],b=DM[k+1];if(x>=a[0]&&x<=b[0]){const t=(x-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}}return DM[DM.length-1].slice(1);};
    const ecaille=(x,z,r)=>{const q=sec(x),yc=q[0],ry=q[1],rz=q[2],f=Math.sqrt(Math.max(0,1-(z/rz)*(z/rz)));if(f<.15)return;const y=yc+ry*f,n=new THREE.Vector3(0,1,z*ry/(rz*rz*f));
      h2_pose(B,G10.cyl6,K.col,P(x,y+.012,z),n,r,.045,r);h2_pose(B,G10.cyl6,K.or,P(x,y+.034,z),n,r*.5,.02,r*.5);};
    for(let k=0;k<4;k++)ecaille(-XE+.35+k*(L-.55)/3,0,.17);                                           // la colonne vertébrale : quatre grandes
    for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<3;k++)ecaille(-XE+.46+k*(L-.74)/2,sd*.42,.15);for(let k=0;k<4;k++)ecaille(-XE+.30+k*(L-.40)/3,sd*.70,.11);}   // les côtes, puis les marginales
    // la tête : un crâne en plusieurs plans (voûte, arcade, joues, bec) qui sort du carter
    const H=[[hx+.12,.0,.27,.29,2.4],[hx-.14,.02,.27,.28,2.4],[hx-.36,.06,.23,.28,2.4],[hx-.54,.07,.22,.28,2.3],[hx-.70,.03,.17,.21,2.3],[hx-.82,-.01,.09,.12,2.3]];
    B.add(h2_loft(H,10),K.col,0,0,0);
    B.add(h2_loft([[hx-.56,-.10,.08,.19,2.4],[hx-.74,-.09,.06,.12,2.4],[hx-.86,-.06,.03,.06,2.4]],8),K.colD,0,0,0);                    // le bec inférieur
    vers10(B,cone10(.07,.20,5),K.or,P(hx-.78,.0,0),D(-1,-.55,0),1);                                                             // le crochet du bec, en or
    B.add(h2_loft([[hx-.32,.23,.05,.22],[hx-.56,.26,.06,.24],[hx-.72,.18,.05,.15]],8),K.colD,0,0,0);                              // l'arcade sourcilière
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.noir,hx-.55,.11,sd*.265,0,0,0,.065,.065,.045);B.add(G10.sph,K.glow,hx-.57,.115,sd*.285,0,0,0,.038,.038,.024);   // l'œil : braise
      B.add(G10.sph,K.noir,hx-.85,.01,sd*.04,0,0,0,.02,.02,.02);                                                             // la narine
      B.add(tube10([[hx-.82,-.04,sd*.05],[hx-.60,-.04,sd*.2],[hx-.32,-.02,sd*.29]],.01,8,4),K.noir,0,0,0);                       // la ligne de la bouche
      // les nageoires : épaule chromée (le turbo), tige de piston, palette en V
      const ax=sd>0?1:1;
      for(let r=0;r<2;r++){const xr=r?XE-.20:-XE+.36,big=r?.62:1,z0=sd*.84;
        B.add(G10.sph,K.chrome,xr,.02,z0,0,0,0,.15*big+.03,.15*big+.03,.15*big+.03);B.add(new THREE.TorusGeometry(.16*big+.03,.016,5,16),K.or,xr,.02,z0,0,PI10/2,0);
        B.add(plan10(r?[[-.18,0],[-.04,.22],[.12,.52],[.30,.58],[.26,.22],[.18,0]]:[[-.20,0],[-.02,.30],[.30,.68],[.54,.76],[.56,.54],[.40,.24],[.26,0]],.06,.012),K.col,xr,.0,z0,sd*PI10/2,0,r?0:0);
        tige(P(xr,.02,z0),P(xr+(r?.2:.40),.05,z0+sd*(r?.36:.62)),.032,K.chrome);}}
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
  case 11:{ // L'ÉLECTRIQUE (h2) — LA BÊTE D'ORAGE : le V8 est son corps (flancs bobinés de cuivre = ses muscles), la cloche d'embrayage = la tête de taureau
    //   d'orage — deux BOBINES TESLA en guise de cornes, un arc qui claque entre leurs boules, yeux d'éclair, mâchoire à éclateurs — et l'échappement = sa
    //   queue en éclairs autour de la tuyère
    const hx=-XE,yc=.30;
    const coil=(p,d,len,r)=>{const pts=[[r*.7,0],[r*.7,.03]];const n=Math.round(len/.075);for(let k=0;k<n;k++){const x=.03+k*.075;pts.push([r*.9,x+.01],[r*1.18,x+.03],[r*1.18,x+.055],[r*.9,x+.07]);}pts.push([r*.7,len]);vers10(B,tourX(pts,10),K.cu,p,d,1);
      const e=p.clone().addScaledVector(d,len);B.add(G10.sph,K.chrome,e.x,e.y,e.z,0,0,0,r*1.7,r*1.7,r*1.7);B.add(G10.sph,K.glow,e.x,e.y,e.z,0,0,0,r*1.0,r*1.0,r*1.0);return e;};
    const arc=(a,b,n,amp,r)=>{const p=[];for(let k=0;k<=n;k++){const t=k/n,j=(k&&k<n)?(k%2?1:-1):0;p.push([a.x+(b.x-a.x)*t+j*amp*.5,a.y+(b.y-a.y)*t+j*amp,a.z+(b.z-a.z)*t+(k&&k<n?(k%3-1)*amp*.6:0)]);}B.add(tube10(p,r||.016,n*3,4),K.glow,0,0,0);};
    // le corps : le torse laqué, bobiné de cuivre
    B.add(h2_loft([[hx+.10,yc,.36,.40,2.5],[hx+.40,yc,.52,.54,2.5],[-L*.2,yc,.55,.58,2.6],[L*.2,yc,.55,.58,2.6],[XE-.05,yc,.46,.48,2.5],[XE+.25,yc,.30,.32,2.5]],12),K.col,0,0,0);
    for(let k=0;k<8;k++){const x=hx+.38+k*(L-.50)/7;h2_ANN(B,K.cu,.575,.032,x,yc,0);}
    // la tête de taureau : crâne, arcade, museau large, mâchoire d'acier à éclateurs
    B.add(h2_loft([[hx+.22,yc+.10,.40,.42,2.5],[hx-.08,yc+.17,.40,.43,2.4],[hx-.34,yc+.19,.34,.40,2.4],[hx-.58,yc+.12,.26,.34,2.4],[hx-.80,yc+.03,.19,.28,2.4],[hx-.93,yc-.02,.13,.21,2.4]],12),K.col,0,0,0);
    B.add(h2_loft([[hx-.20,yc-.22,.09,.31,2.5],[hx-.50,yc-.19,.08,.28,2.5],[hx-.80,yc-.14,.07,.21,2.5],[hx-.92,yc-.11,.04,.14,2.5]],10),K.chrome,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.colD,hx-.34,yc+.40,sd*.20,0,sd*.28,0,.50,.10,.14);                                          // l'arcade
      B.add(G10.sph,K.glow,hx-.50,yc+.27,sd*.33,0,sd*.35,-.5*sd,.17,.045,.04);B.add(G10.sph,K.blanc,hx-.52,yc+.27,sd*.345,0,sd*.35,-.5*sd,.095,.02,.025);   // l'œil d'éclair
      B.add(plan10([[0,0],[.22,.14],[.30,-.02],[.10,-.10]],.03,.006),K.col,hx+.02,yc+.28,sd*.40,sd*PI10/2*.0,sd*.9,0);   // l'oreille
      h2_ANN(B,K.or,.05,.016,hx-.94,yc-.01,sd*.10);
      B.add(G10.sph,K.noir,hx-.93,yc-.02,sd*.10,0,0,0,.04,.035,.035);                                    // la narine
      for(let k=0;k<5;k++){const x=hx-.28-k*.11;vers10(B,cone10(.018,.09,5),K.chrome,P(x,yc-.12,sd*(.28-k*.03)),D(0,1,0),1);}   // les éclateurs : des dents de conducteur
      const base=P(hx-.08,yc+.50,sd*.22);coil(base,D(-.25,1,sd*.55),.78,.07);                            // la corne : une bobine Tesla
      B.add(G10.cyl6,K.or,base.x,base.y-.02,base.z,0,0,0,.13,.08,.13);}
    // l'arc qui claque entre les deux boules, et l'étincelle de la gueule
    const eL=P(hx-.08,yc+.50,-.22).addScaledVector(D(-.25,1,-.55),.78),eR=P(hx-.08,yc+.50,.22).addScaledVector(D(-.25,1,.55),.78);
    arc(eL,eR,8,.09,.02);
    arc(P(hx-.62,yc-.17,-.14),P(hx-.62,yc-.17,.14),4,.04,.012);
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
  case 13:{ // LE VITRAIL (h2) — L'OISEAU-CATHÉDRALE : le V12 est la nef (voûte bleue nervurée d'or), la cloche d'embrayage = la tête d'oiseau (bec d'or, œil de verre rouge,
    //   huppe de lancettes), les deux ailes = des éventails de lancettes de verre sertis de plomb et d'or, plantés dans les épaules, et l'échappement perce
    //   la GRANDE ROSACE qui lui sert de queue en roue — tenue au corps par quatre haubans d'or
    const yc=.30,hx=-XE,V=[0xff3a4a,0x3a6aff,0xffc030,0x2ad08a,0xb04aff,0xff7a2a];
    const GL=V.map(c=>new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.55,shininess:300,specular:0xffffff,side:THREE.DoubleSide}));
    const lanc=(l,w)=>[[0,-w],[l*.55,-w*.95],[l*.82,-w*.55],[l,0],[l*.82,w*.55],[l*.55,w*.95],[0,w]];     // une lancette : un arc brisé
    // le corps : la nef, ses nervures d'or
    B.add(h2_loft([[hx+.10,yc,.34,.40,2.5],[hx+.40,yc,.52,.56,2.5],[-L*.2,yc,.56,.60,2.6],[L*.2,yc,.56,.60,2.6],[XE-.10,yc,.46,.50,2.5],[XE+.20,yc,.24,.26,2.5]],12),K.col,0,0,0);
    for(let k=0;k<9;k++){const x=hx+.40+k*(L-.60)/8;h2_ANN(B,K.or,.585,.022,x,yc,0);}
    // la tête : crâne d'oiseau sculpté, bec d'or, œil de verre, huppe
    B.add(h2_loft([[hx+.22,yc+.08,.34,.36,2.5],[hx-.10,yc+.14,.34,.34,2.4],[hx-.34,yc+.14,.28,.28,2.4],[hx-.54,yc+.08,.18,.19,2.4],[hx-.66,yc+.02,.09,.10,2.4]],12),K.col,0,0,0);
    vers10(B,cone10(.13,.34,6),K.or,P(hx-.58,yc+.06,0),D(-1,-.28,0),1);vers10(B,cone10(.10,.26,6),K.or,P(hx-.56,yc-.03,0),D(-1,.18,0),1);        // le bec : mandibule haute et basse
    for(let sd=-1;sd<=1;sd+=2){B.add(new THREE.TorusGeometry(.085,.022,6,14),K.or,hx-.34,yc+.20,sd*.265,0,sd*.25,0);B.add(G10.sph,GL[0],hx-.34,yc+.20,sd*.275,0,0,0,.07,.07,.03);B.add(G10.sph,K.noir,hx-.36,yc+.20,sd*.29,0,0,0,.032,.032,.02);
      B.add(G10.sph,K.noir,hx-.70,yc+.10,sd*.05,0,0,0,.018,.018,.018);}
    for(let k=0;k<5;k++){const rz=.45+k*.20,len=.50-k*.04,x=hx+.0-k*.06,y=yc+.38;
      B.add(plan10(lanc(len+.05,.075),.05,.006),K.or,x,y,0,0,0,rz);B.add(plan10(lanc(len,.060),.065,.004),GL[(k*2+1)%6],x+.01,y+.008,0,0,0,rz+.01);}   // la huppe de lancettes
    // les ailes : un éventail de sept lancettes de verre par épaule
    const tau=.80;
    for(let sd=-1;sd<=1;sd+=2){const S=P(-.10,.72,sd*.50);
      B.add(G10.sph,K.or,S.x,S.y,S.z,0,0,0,.13,.13,.13);                                                                          // l'épaule d'or
      for(let k=0;k<7;k++){const th=.05+k*.20,l=1.45-k*.12,d=new THREE.Vector3(Math.sin(th),Math.sin(tau)*Math.cos(th),sd*Math.cos(tau)*Math.cos(th)).normalize();
        const n=new THREE.Vector3(0,-sd*Math.cos(tau),Math.sin(tau)).normalize();
        h2_orient(B,plan10(lanc(l+.05,l*.12),.03,.006),K.or,S,d,n);
        h2_orient(B,plan10(lanc(l,l*.102),.044,.004),GL[(k+(sd>0?0:3))%6],S.clone().addScaledVector(n,.002*(k%2)),d,n);}}
    // la rosace-queue : douze secteurs de verre, des rayons de plomb, deux couronnes d'or ; elle est percée par la tuyère
    const rx=XE+.46,R=.74;
    for(let k=0;k<12;k++)B.add(new THREE.CircleGeometry(R,5,k/12*2*PI10,2*PI10/12-.025),GL[k%6],rx,yc,0,0,PI10/2,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10,ca=Math.cos(a),sa=Math.sin(a);tige(P(rx+.012,yc+sa*.25,ca*.25),P(rx+.012,yc+sa*R,ca*R),.011,K.noir);
      B.add(G10.sph,K.or,rx+.01,yc+sa*.50,ca*.50,0,0,0,.06,.06,.025);B.add(G10.sph,GL[(k+3)%6],rx+.03,yc+sa*.50,ca*.50,0,0,0,.038,.038,.02);}
    B.add(new THREE.TorusGeometry(R+.01,.04,6,36),K.or,rx,yc,0,0,PI10/2,0);B.add(new THREE.TorusGeometry(.25,.03,6,24),K.or,rx,yc,0,0,PI10/2,0);
    for(let k=0;k<4;k++){const a=(k+.5)/4*2*PI10,ca=Math.cos(a),sa=Math.sin(a);tige(P(XE-.12,yc+sa*.40,ca*.40),P(rx,yc+sa*R,ca*R),.026,K.or);}   // les haubans d'or : la rosace tient au corps
    const tx=XE+.08;TX(B,K.chrome,[[.12,0],[.16,.06],[.22,.34],[.30,.56]],tx,yc,0,0,12);TX(B,K.glow,[[.001,0],[.24,0],[.24,.02],[.001,.02]],tx+.54,yc,0,0,12);
    c.echap=[tx+.58,yc,0];
    break;}
  case 14:{ // LE SOLEIL (h2) — LE SOLEIL-LION : le W12 est son torse d'ambre, la cloche d'embrayage = le VISAGE d'or du soleil (arcade, yeux blancs-chauds, nez, bouche
    //   à crocs), et sa crinière EST la couronne : deux rangs de rayons flammés plantés autour de la face ; l'échappement = un petit soleil de queue autour de
    //   la tuyère à braise
    const yc=.30,hx=-XE,GOLD=h2_poli(0xf3dc96,240,.45);
    const ray=(x,R,len,a,m,w,t)=>{const rh=new THREE.Vector3(0,Math.cos(a),Math.sin(a)),d=rh.clone().multiplyScalar(Math.cos(t)).add(new THREE.Vector3(Math.sin(t),0,0)).normalize(),td=new THREE.Vector3(0,-Math.sin(a),Math.cos(a)),n=new THREE.Vector3().crossVectors(d,td);
      h2_orient(B,plan10([[0,-w],[0,w],[len*.62,w*.55],[len,0],[len*.62,-w*.55]],.045,.008),m,P(x,yc+Math.cos(a)*R,Math.sin(a)*R),d,n);};
    // le torse
    B.add(h2_loft([[hx+.06,yc,.42,.46,2.5],[hx+.34,yc,.52,.56,2.5],[-L*.1,yc,.55,.58,2.6],[L*.2,yc,.54,.57,2.6],[XE-.05,yc,.44,.47,2.5],[XE+.22,yc,.27,.28,2.5]],12),K.col,0,0,0);
    for(let k=0;k<7;k++){const x=hx+.42+k*(L-.55)/6;h2_ANN(B,K.or,.58,.022,x,yc,0);}
    // la couronne : un grand disque d'or gravé de cercles, cerclé de rayons flammés (un long, un court)
    const cx=hx-.02;
    B.add(tourX([[.46,.02],[.60,0],[.88,0],[.96,.035],[.88,.07],[.60,.07],[.46,.05]],28),K.col,cx,yc,0,0,0,0);
    for(const R of [.62,.76,.88])h2_ANN(B,K.or,R,.014,cx-.005,yc,0);h2_ANN(B,K.or,.97,.036,cx+.035,yc,0);
    for(let k=0;k<28;k++){const a=k/28*2*PI10;ray(cx+.035,.96,k%2?.34:.62,a,k%2?K.col:K.or,k%2?.075:.12,.10);}
    // le visage : crâne sculpté, arcade, yeux, nez, bouche
    B.add(h2_loft([[hx+.24,yc,.50,.52,2.4],[hx-.10,yc,.54,.54,2.3],[hx-.34,yc,.50,.50,2.3],[hx-.50,yc-.01,.36,.36,2.3],[hx-.55,yc-.02,.24,.24,2.3]],14),GOLD,0,0,0);
    const fx=hx-.46;
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.col,fx-.04,yc+.19,sd*.17,0,0,-sd*.22,.07,.07,.24);                                                                         // l'arcade, en colère
      B.add(G10.sph,K.blanc,fx-.07,yc+.09,sd*.17,0,0,0,.035,.065,.095);B.add(G10.sph,K.noir,fx-.10,yc+.09,sd*.17,0,0,0,.02,.04,.04);   // l'œil blanc-chaud, sa pupille
      B.add(G10.sph,K.col,fx-.04,yc-.07,sd*.27,0,0,0,.07,.10,.10);                                                                       // la pommette
      B.add(tube10([[fx-.08,yc-.19,sd*.02],[fx-.05,yc-.22,sd*.14],[fx+.02,yc-.14,sd*.28]],.014,10,4),K.noir,0,0,0);                         // le sourire
      for(let k=0;k<3;k++)vers10(B,cone10(.022,.075,5),K.blanc,P(fx-.08+k*.02,yc-.195-k*.012,sd*(.05+k*.07)),D(-.1,-1,0),1);}               // les crocs
    vers10(B,cone10(.085,.26,5),K.col,P(fx-.04,yc-.03,0),D(-1,-.15,0),1);                                                                   // le nez
    // la queue : un petit soleil autour de la tuyère
    const tx=XE+.14;h2_ANN(B,K.or,.30,.026,tx,yc,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10;B.add(plan10([[-.05,0],[.05,0],[0,.30]],.04,.006),k%2?K.or:K.col,tx,yc+Math.cos(a)*.30,Math.sin(a)*.30,a,PI10/2,0);}
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
    const HX=1.00,hy=.46;                                                    // le plan arrière du visage, le centre du visage
    BXg(B,K.colD,HX-.06,hy-.55,0,0,0,0,.60,.90,.62);                          // la poitrine
    B.add(h3_loft([{x:HX-.30,r:h3_ring({yt:hy+.22,yb:hy-.60,w:.30})},{x:HX+.05,r:h3_ring({yt:hy+.30,yb:hy-.48,w:.30})}],1),K.col,0,0,0);                 // le cou
    B.add(h3_loft([{x:HX,r:h3_ring({yt:hy+.50,yb:hy-.42,w:.34,yw:hy+.05})},{x:HX+.20,r:h3_ring({yt:hy+.52,yb:hy-.40,w:.33,yw:hy+.05})},{x:HX+.27,r:h3_ring({yt:hy+.44,yb:hy-.36,w:.27,yw:hy+.0,wt:.22})}],1),K.col,0,0,0);   // le visage
    {const nm=[{x:HX-.52,yt:hy+.72,yb:hy-.66,w:.62,yw:hy-.10,wt:.40,wb:.28},{x:HX-.12,yt:hy+.74,yb:hy-.70,w:.58,yw:hy-.10,wt:.42,wb:.24},{x:HX+.14,yt:hy+.66,yb:hy-.76,w:.46,yw:hy-.15,wt:.34,wb:.20},{x:HX+.20,yt:hy+.60,yb:hy-.78,w:.34,yw:hy-.20,wt:.32,wb:.16}];
      B.add(h3_loft(nm.map(c=>({x:c.x,r:h3_ring(c)})),1),K.colD,0,0,0);                                 // le NEMÈS : un trapèze sombre qui s'évase derrière le visage
      const zp=y=>{const d=y-hy;return d>=-.10?.58-(d+.10)/.84*.16:d>=-.46?.51+(d+.46)/.36*.07:.24+(d+.70)/.24*.27;};      // la demi-largeur du nemès à la hauteur y
      for(let k=0;k<9;k++){const yy=hy-.62+k*.17;for(let sd=-1;sd<=1;sd+=2)BXg(B,k%2?K.glow:K.or,HX-.30,yy,sd*(zp(yy)*1.0+.012),0,0,0,.52,.07,.045);}   // les rayures or et lapis, posées sur les pans
      BXg(B,K.or,HX-.26,hy+.74,0,0,0,0,.50,.04,.76);}                                                   // le dessus du nemès, un filet d'or
    for(let sd=-1;sd<=1;sd+=2){BXg(B,K.colD,HX+.04,hy-.64,sd*.42,0,0,0,.12,.84,.24);for(let k=0;k<4;k++)BXg(B,k%2?K.glow:K.or,HX+.105,hy-.30-k*.17,sd*.42,0,0,0,.03,.075,.24);   // les pans du nemès qui tombent sur la poitrine
      B.add(plan10([[0,-.07],[.20,-.095],[.34,0],[.20,.095],[0,.07]],.025,.004),K.or,HX+.12,hy+.18,sd*.265,0,sd*.18,0);   // l'œil de kohl, en amande
      B.add(G10.sph,K.glow,HX+.30,hy+.18,sd*.23,0,0,0,.035,.04,.04);
      B.add(plan10([[0,0],[.46,.04],[.50,.075],[0,.07]],.03,.004),K.or,HX+.10,hy+.31,sd*.265,0,sd*.18,0);                // le sourcil allongé
      B.add(plan10([[0,0],[.30,-.02],[.36,-.07],[0,-.06]],.02,.004),K.or,HX+.12,hy+.08,sd*.265,0,sd*.18,0);}            // le fard sous l'œil
    B.add(h3_tris(h3_prism([HX+.20,hy+.14,0],[HX+.34,hy-.08,.075],[HX+.34,hy-.08,-.075],[0,0,0]).concat(h3_prism([HX+.20,hy+.14,0],[HX+.34,hy-.14,.075],[HX+.20,hy-.14,0],[0,0,0]))),K.col,0,0,0);   // le nez
    BXg(B,K.colD,HX+.27,hy-.24,0,0,0,0,.04,.035,.30);BXg(B,K.or,HX+.28,hy-.31,0,0,0,0,.035,.03,.24);                      // les lèvres
    B.add(h3_tube([[HX+.25,hy-.40,0],[HX+.31,hy-.62,0],[HX+.30,hy-.92,0],[HX+.44,hy-1.08,0]],.06,.04,{sides:4}),K.or,0,0,0);BXg(B,K.glow,HX+.44,hy-1.10,0,0,0,0,.10,.10,.10);   // la fausse barbe
    B.add(h3_tube([[HX+.18,hy+.50,0],[HX+.30,hy+.62,0],[HX+.34,hy+.80,0],[HX+.32,hy+.92,0]],.045,.03,{sides:6}),K.or,0,0,0);                 // l'uræus
    B.add(h3_tris(h3_prism([HX+.30,hy+.84,.0],[HX+.36,hy+.74,.07],[HX+.36,hy+.74,-.07],[0,0,0])),K.or,0,0,0);boule(K.glow,HX+.38,hy+.80,0,.025);
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.col,HX+.50,-.52,sd*.30,0,0,0,.72,.20,.22);BXg(B,K.col,HX+.48,-.38,sd*.30,0,0,0,.50,.14,.20);                                         // l'avant-bras et la patte
      for(let q=0;q<3;q++)corne(P(HX+.86,-.52,sd*.30+(q-1)*.07),D(1,-.1,0),.026,.10,K.blanc);
      tige(P(.62,-.30,sd*.30),P(HX+.2,-.5,sd*.30),.07,K.or);}
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
    B.add(h3_loft([{x:HX-.10,r:h3_ring({yt:.54,yb:-.54,w:.48,yw:.08})},{x:HX+.20,r:h3_ring({yt:.58,yb:-.56,w:.50,yw:.10})},{x:HX+.46,r:h3_ring({yt:.54,yb:-.58,w:.46,yw:.04,wt:.30})},{x:HX+.60,r:h3_ring({yt:.44,yb:-.58,w:.36,yw:.0,wt:.26})}],1),K.cu,0,0,0);   // le visage
    for(let sd=-1;sd<=1;sd+=2){
      B.add(h3_tube([[HX+.62,.30,sd*.06],[HX+.58,.30,sd*.22],[HX+.46,.34,sd*.36]],.05,.04,{sides:5}),K.or,0,0,0);                                                             // l'arcade
      B.add(G10.sph,K.glow,HX+.56,.18,sd*.22,0,0,0,.05,.055,.07);B.add(new THREE.TorusGeometry(.085,.02,5,12),K.or,HX+.59,.18,sd*.22,0,PI10/2,0);                              // l'œil de glace
      B.add(h3_tube([[HX+.62,-.14,sd*.10],[HX+.78,-.30,sd*.34],[HX+.70,-.60,sd*.40],[HX+.82,-.80,sd*.30]],.07,.02,{sides:5}),K.col,0,0,0);                                     // la moustache de vagues
      for(let k=0;k<4;k++){const z=sd*(.08+k*.11);B.add(h3_tube([[HX+.52,-.50,z],[HX+.74,-.78,z*1.2],[HX+.58,-1.00,z*.9],[HX+.80,-1.20-.06*k,z*.5],[HX+.66,-1.40-.05*k,z*.3]],.08,.012,{sides:5}),k%2?K.col:K.colD,0,0,0);
        boule(K.glow,HX+.66,-1.42-.05*k,z*.3,.03);}}                                                                                                                               // la barbe : des vagues qui finissent en perles
    B.add(h3_tris(h3_prism([HX+.62,.16,0],[HX+.78,-.12,.07],[HX+.78,-.12,-.07],[0,0,0]).concat(h3_prism([HX+.62,.16,0],[HX+.78,-.16,.07],[HX+.62,-.16,0],[0,0,0]))),K.cu,0,0,0);   // le nez
    for(let k=0;k<8;k++){const z=(k-3.5)*.115,w=Math.abs(k-3.5);                                                                                                                    // LES CHEVEUX : des vagues rejetées en arrière
      B.add(h3_tube([[HX+.50,.46,z*.9],[HX+.15,.70+.1*(3.5-w)/3.5,z*1.3],[HX-.35,.62,z*1.8],[HX-.85,.28,z*2.2]],.08,.012,{sides:5}),k%2?K.col:K.colD,0,0,0);}
    for(const [x,w] of [[HX+.46,0],[HX+.52,.30],[HX+.52,-.30]]){const hy=w===0?1.55:1.30;                                                                                         // LE TRIDENT : la couronne
      B.add(h3_tube([[HX+.40,.50,w],[HX+.40,.80,w],[HX+.40,hy-.1,w]],.045,.03,{sides:6}),K.or,0,0,0);corne(P(HX+.40,hy-.12,w),D(0,1,0),.07,.30,K.or);}
    B.add(h3_tube([[HX+.40,.74,-.34],[HX+.40,.68,0],[HX+.40,.74,.34]],.03,.03,{sides:5}),K.or,0,0,0);
    for(const w of [-.30,.30])B.add(h3_tube([[HX+.40,.50,w],[HX+.40,.60,w*.0+w*.9],[HX+.40,.64,0]],.03,.03,{sides:4}),K.or,0,0,0);
    break;}
  case 21:{ // LA LANCE D'ODIN (artiste 3) — Munin le corbeau borgne : son bec est la pointe de Gungnir, sa collerette de plumes ceint l'épaule, ses ailes sont les empennages,
    //   les runes brillent sur le fût, l'orbite vide porte une rune
    B.add(h3_loft([{x:.56,r:h3_ring({yt:.40,yb:-.40,w:.40,yw:.0})},{x:.88,r:h3_ring({yt:.42,yb:-.36,w:.38,yw:.02})},{x:1.14,r:h3_ring({yt:.36,yb:-.22,w:.30,yw:.04,wt:.20})},{x:1.36,r:h3_ring({yt:.24,yb:-.10,w:.18,wt:.12})}],1),K.col,0,0,0);
    B.add(h3_loft([{x:1.30,r:h3_ring({yt:.20,yb:-.04,w:.14,wt:.10})},{x:1.72,r:h3_ring({yt:.14,yb:-.05,w:.10,wt:.07})},{x:2.10,r:h3_ring({yt:.06,yb:-.07,w:.05,wt:.04})},{x:2.50,r:h3_ring({yt:-.02,yb:-.09,w:.012,wt:.01})}],1),K.chrome,0,0,0);   // le bec = la pointe
    B.add(h3_loft([{x:1.30,r:h3_ring({yt:-.06,yb:-.20,w:.10,wt:.07})},{x:1.70,r:h3_ring({yt:-.10,yb:-.19,w:.06,wt:.04})},{x:1.96,r:h3_ring({yt:-.12,yb:-.16,w:.012,wt:.01})}],1),K.alu,0,0,0);
    B.add(new THREE.TorusGeometry(.12,.022,5,12),K.or,1.34,.0,0,0,PI10/2,0);
    for(let sd=-1;sd<=1;sd+=2){
      B.add(h3_tube([[1.34,.24,sd*.10],[1.12,.32,sd*.22],[.92,.28,sd*.30]],.05,.03,{sides:5}),K.or,0,0,0);
      if(sd>0){B.add(G10.sph,K.glow,1.08,.12,.27,0,0,0,.065,.065,.045);B.add(new THREE.TorusGeometry(.08,.018,5,12),K.or,1.09,.12,.27,0,PI10/2,0);}   // l'œil de glace
      else{B.add(G10.box,K.noir,1.08,.12,-.28,0,0,0,.12,.14,.03);BXg(B,K.glow,1.08,.12,-.30,0,0,0,.02,.12,.012);BXg(B,K.glow,1.08,.14,-.30,0,0,.9,.02,.08,.012);}      // l'orbite vide et sa rune
      B.add(h3_tube([[.70,.28,sd*.12],[.40,.52,sd*.34],[.10,.70,sd*.40]],.08,.012,{sides:5}),K.colD,0,0,0);                                                                          // les plumes de la nuque
      for(let k=0;k<7;k++){const t=k/6,rx=.30-k*.20,m=k%2?K.col:K.colD;                                                                                                                 // L'AILE : sept rémiges
        h3_leaf(B,m,[[rx,.0,sd*.44],[rx-.22,.06+.10*t,sd*(.80+k*.04)],[rx-.62-.1*k,.14-.18*t,sd*(1.20+.55*Math.cos(t*1.5)-k*.07)]],.15,{ribMat:K.chrome});}}
    for(let r=0;r<3;r++)for(let k=0;k<10;k++){const a=k/10*2*PI10+r*.3,A1=[.62+r*.10,Math.cos(a)*.38,Math.sin(a)*.38],B1=[.62+r*.10,Math.cos(a+.62)*.38,Math.sin(a+.62)*.38],T=[.30+r*.10,Math.cos(a+.31)*(.52+r*.04),Math.sin(a+.31)*(.52+r*.04)];
      B.add(h3_tris(h3_prism(A1,B1,T,[.03,0,0])),(k+r)%2?K.colD:K.col,0,0,0);}                                                                                                           // la collerette
    for(let k=0;k<4;k++){const x=-.85+k*.42;for(let j=0;j<6;j++){const a=j/6*2*PI10;B.add(G10.box,K.glow,x+.12,Math.sin(a)*.448,Math.cos(a)*.448,a,0,0,.08,.012,.012);}}
    break;}
  case 22:{ // LE CŒUR BATTANT — un cœur laqué à la tête, aorte et veines qui courent jusqu'à la tuyère
    boule(K.col,1.18,.12,.12,.26);boule(K.col,1.18,.12,-.12,.26);corne(P(1.18,0,0),D(0,-1,0),.33,.48,K.col);tige(P(.95,0,0),P(1.10,0,0),.12,K.colD);
    tige(P(1.18,.32,0),P(1.02,.58,0),.08,K.colD);B.add(new THREE.TorusGeometry(.18,.08,8,16,PI10),K.colD,.84,.58,0,0,0,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10;B.add(tube10([[.70,Math.sin(a)*.2,Math.cos(a)*.2],[.2,Math.sin(a)*.27,Math.cos(a)*.27],[-.6,Math.sin(a+.5)*.35,Math.cos(a+.5)*.35],[-1.1,Math.sin(a)*.20,Math.cos(a)*.20]],.02,20,5),K.colD,0,0,0);}
    break;}
  case 23:{ // LE DRAGON NOIR (Léo : « un dragon noir, la tête qui fait la tête du réacteur, pas besoin de corps, une tête de T-rex avec des
    //   cornes ») — la gueule REMPLACE le dôme : crâne massif, museau long et carré, mâchoire inférieure ouverte sur la braise du cœur,
    //   rangées de crocs, arcades sourcilières lourdes, yeux de braise, deux grandes cornes qui balaient vers l'arrière, crête de pointes
    const B0=B;B=bat10();B.f=true;B.plat();                                             // la tête est bâtie à part puis GRANDIE (×1,6) devant le dôme
    const X0=.62,noir=K.col;
    BXg(B,noir,X0+.30,.12,0,0,0,-.08,.72,.66,.70);                                      // le crâne
    BXg(B,noir,X0+.88,.10,0,0,0,-.04,.62,.36,.46);                                      // le museau
    BXg(B,noir,X0+1.20,.09,0,0,0,0,.18,.30,.40);
    for(let sd=-1;sd<=1;sd+=2)boule(K.or,X0+1.27,.18,sd*.12,.04);                       // les naseaux cerclés d'or
    BXg(B,noir,X0+.80,-.36,0,0,0,-.42,.80,.14,.40);                                     // la mâchoire inférieure, ouverte
    B.add(tourX([[.001,0],[.22,0],[.22,.02],[.001,.02]],12),K.glow,X0+.95,-.12,0,0,0,-.21);   // la braise au fond de la gueule
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<6;k++){const x=X0+.62+k*.11;
      corne(P(x,-.08,sd*.20),D(0,-1,0),.028,.13-k*.008,K.blanc);                      // crocs du haut
      corne(P(x-.02,-.40+(k*.11)*.45,sd*.18),D(0,1,0),.024,.10,K.blanc);}              // crocs du bas
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,noir,X0+.52,.44,sd*.24,0,0,-.25,.40,.12,.16);                              // l'arcade sourcilière
      boule(K.glow,X0+.62,.34,sd*.30,.06,.045,.045);                                   // l'œil de braise
      const c0=P(X0+.30,.46,sd*.30),c1=P(X0-.05,.85,sd*.55);tige(c0,c1,.08,K.or);       // la grande corne
      corne(c1,D(-1,.55,sd*.35),.075,.55,K.or);
      corne(P(X0+.05,.20,sd*.36),D(-1,-.1,sd*.6),.05,.35,noir);                         // les cornes de joue
      corne(P(X0+.55,-.30,sd*.22),D(-.3,-1,sd*.5),.035,.20,noir);}                      // les épines de mâchoire
    for(let k=0;k<5;k++)corne(P(X0+.55-k*.16,.46-k*.02,0),D(-.4,1,0),.05,.26-k*.03,K.or);    // la crête
    {const hg=new THREE.Group();B.fin(hg);hg.scale.setScalar(1.6);hg.position.set(-.45,.02,0);g.add(hg);}B=B0;
    break;}


  case 24:{ // HÉLIOS — une couronne de rayons d'or plantés tout autour du tore : le soleil captif
    const TL=.55,ct=Math.cos(TL),st=Math.sin(TL);
    for(let k=0;k<28;k++){const a=k/28*2*PI10,cx=Math.cos(a),sy=Math.sin(a),d=D(cx,sy*ct,sy*st);corne(P(cx*.84,sy*.84*ct,sy*.84*st),d,.05,k%2?.30:.55,k%2?K.or:K.blanc);}
    break;}
  case 25:{ // L'ALIEN — la soucoupe qui ceinture le noyau, son dôme de verre, ses feux de bord, des glyphes inconnus, trois pattes souples
    B.add(tourY10([[.001,-.08],[.70,-.03],[1.05,0],[.70,.05],[.30,.10],[.001,.12]],32),K.col,0,-.02,0);
    B.add(new THREE.TorusGeometry(1.04,.035,6,48),K.chrome,0,-.02,0,PI10/2,0,0);
    for(let k=0;k<16;k++){const a=k/16*2*PI10;boule(k%2?K.glow:K.blanc,Math.cos(a)*1.04,-.02,Math.sin(a)*1.04,.045);
      BXg(B,K.glow,Math.cos(a)*.62,.05,Math.sin(a)*.62,0,-a,(k%3)*.5,.12,.012,.03);}
    B.add(new THREE.SphereGeometry(.46,20,10,0,PI10*2,0,PI10/2),K.verre,0,.10,0);
    for(let k=0;k<3;k++){const a=k/3*2*PI10+.4,c=Math.cos(a),sn=Math.sin(a);
      B.add(tube10([[c*.45,-.06,sn*.45],[c*.75,-.40,sn*.75],[c*.60,-.80,sn*.60],[c*.80,-1.0,sn*.80]],.035,16,6),K.colD,0,0,0);boule(K.glow,c*.80,-1.0,sn*.80,.06);}
    break;}
  case 26:{ // L'OUROBOROS D'ARGENT (Léo : « un moteur argenté en boucles infinies ») — trois NŒUDS DE CHROME imbriqués autour de la nacelle (trèfle,
    //   cinq lobes, anneau), et sur la boucle extérieure un serpent d'argent qui se mord la queue ; un cœur blanc, un rayon de plasma, quatre haubans
    const R=.90,tk=(p,q,r,rad,m,rx,ry,rz)=>B.add(new THREE.TorusKnotGeometry(r,rad,90,8,p,q),m,0,0,0,rx,ry,rz);
    tk(2,3,R*.88,.10,K.chrome,0,PI10/2,0);B.add(new THREE.TorusGeometry(R*.40,.045,8,48),K.alu,0,0,0,0,PI10/2,0);   // UN grand trèfle net + son anneau de cœur
    B.add(new THREE.TorusGeometry(R*1.30,.022,6,64),K.or,0,0,0,0,PI10/2,0);
    const RS=R*1.30,N=44;for(let k=0;k<N;k++){const t=k/(N-1),a=t*2*PI10*.93,r=.05+.075*Math.sin(Math.min(1,t*1.6)*PI10/2);
      B.add(G10.sph,K.chrome,0,Math.sin(a)*RS,Math.cos(a)*RS,0,0,0,r,r,r);}
    {const ah=2*PI10*.955,hp=P(0,Math.sin(ah)*RS,Math.cos(ah)*RS),fw=D(0,Math.cos(ah),-Math.sin(ah)),up=D(0,Math.sin(ah),Math.cos(ah));
      boule(K.chrome,hp.x,hp.y,hp.z,.13,.10,.10);corne(hp.clone().addScaledVector(fw,.08),fw,.07,.20,K.chrome);
      for(let sd=-1;sd<=1;sd+=2){boule(K.glow,hp.x+sd*.07,hp.y+up.y*.05,hp.z+up.z*.05,.03);corne(hp.clone().addScaledVector(up,.06).add(P(sd*.06,0,0)),up.clone().addScaledVector(fw,-.7),.025,.2,K.or);}
      const tl=P(0,Math.sin(2*PI10*.93)*RS,Math.cos(2*PI10*.93)*RS);corne(tl,D(0,Math.cos(2*PI10*.93),-Math.sin(2*PI10*.93)),.04,.12,K.chrome);}
    TX(B,K.chrome,[[.001,0],[.16,.02],[.20,.22],[.18,.60],[.10,.92],[.001,1.0]],-.60,0,0,0,18);BAR(B,K.chrome,.06,-1.2,1.1,0,0);
    boule(K.blanc,0,0,0,.14);boule(K.haloF,0,0,0,.26);B.add(cone10(.06,2.4,12),K.haloC,.14,0,0,0,0,0);B.add(cone10(.06,2.4,12),K.haloC,-.14,0,0,0,PI10,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4;tige(P(0,0,0),P(0,Math.sin(a)*R,Math.cos(a)*R),.03,K.chrome);}
    break;}



  case 27:{ // HALLEY — des aiguilles de glace hérissent le noyau, une 2e queue d'ions bleue, et ses deux anneaux (tenus par des rayons)
    for(const d of dirs10(14))corne(P(.60,0,0).addScaledVector(d,.30),d,.04,.28,K.blanc);
    B.add(cone10(.16,2.5,16),K.halo(0x6ab8ff,.40),.60,.05,.05,0,PI10*.97,.06);
    B.add(new THREE.TorusGeometry(.62,.032,8,40),K.or,.60,0,0,.5,PI10/2,0);B.add(new THREE.TorusGeometry(.52,.022,8,40),K.chrome,.32,0,0,0,PI10/2,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10;tige(P(.60,Math.sin(a)*.30,Math.cos(a)*.30),P(.60+Math.sin(a)*.62*Math.sin(.5)*0,Math.sin(a)*.62*Math.cos(.5),Math.cos(a)*.62),.012,K.or);
      tige(P(.45,Math.sin(a)*.25,Math.cos(a)*.25),P(.32,Math.sin(a)*.52,Math.cos(a)*.52),.010,K.chrome);}
    break;}
  case 28:{ // LA NAISSANCE — la double corolle, et les grands anneaux de l'ancienne supernova, en lumière
    for(let r=0;r<2;r++)for(let k=0;k<12;k++){const a=k/12*2*PI10+r*.26;
      B.add(plan10([[0,-.13],[.55+r*.35,-.11],[.85+r*.40,0],[.55+r*.35,.11],[0,.13]],.025,.006),r?K.or:K.blanc,0,Math.sin(a)*.26,Math.cos(a)*.26,a,PI10/2,0);}
    for(let k=0;k<3;k++){B.add(new THREE.TorusGeometry(1.15+k*.28,.03,6,64),K.halo(k%2?0xffd780:0xff8ac0,.75),-.12*k,0,0,0,PI10/2,0);
      B.add(new THREE.TorusGeometry(1.15+k*.28,.010,4,64),K.blanc,-.12*k,0,0,0,PI10/2,0);}
    break;}
  case 29:{ // L'INFINI (Léo : « le trou noir était mieux comme avant… fais encore mieux dans cette version ») — la CAGE de l'ancien,
    //   en grand : douze méridiens d'acier sombre qui enserrent la bille ET son disque, couronnes d'or aux pôles avec leurs flèches,
    //   l'anneau de photons blanc bien net au ras du disque, des braises accrochées aux arcs
    for(let k=0;k<6;k++){const a=k/6*PI10;B.add(new THREE.TorusGeometry(1.0,.026,6,64),k%3?K.noir:K.or,0,0,0,0,a,0);}   // six grands cercles verticaux = douze méridiens
    for(let sd=-1;sd<=1;sd+=2){B.add(new THREE.TorusGeometry(.12,.035,6,20),K.or,0,sd*1.0,0,PI10/2,0,0);corne(P(0,sd*1.03,0),D(0,sd,0),.06,.55,K.or);
      B.add(new THREE.TorusGeometry(.70,.018,6,48),K.noir,0,sd*.71,0,PI10/2,0,0);}
    B.add(new THREE.TorusGeometry(1.0,.024,6,72),K.or,0,0,0,PI10/2,0,0);
    for(let k=0;k<12;k++){const a=k/12*PI10*2+.13;boule(K.glow,Math.cos(a)*.71,(k%2?1:-1)*.71,Math.sin(a)*.71,.03);}
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
