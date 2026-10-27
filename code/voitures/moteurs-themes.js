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
