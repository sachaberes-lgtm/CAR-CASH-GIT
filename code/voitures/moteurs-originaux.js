/* ================= LES MOTEURS ORIGINAUX (2026-10-26, Léo : « garde le style POLI. L'idée, ce n'est pas d'avoir des
   moteurs hyper-réalistes, plutôt inspirés de certains éléments, mais de fabriquer toi-même des moteurs originaux aux formes
   impressionnantes au fur et à mesure des niveaux. Fais-les tous d'un coup. ») =================
   LA RÈGLE : du métal POLI, de la laque, de l'or, du verre, du feu — jamais de grain, jamais de saleté, jamais de boulon pour
   le boulon. Un moteur = UNE idée de forme qu'on lit de loin, et qui grandit avec l'échelle :
     1-10  la mécanique, mais « dessinée » : trompes chromées, plénums, escargots lisses, couvre-culasses à nervures ;
     11-18 les COURONNES : une grande pièce sculptée posée sur le bloc (orgue, cathédrale, aileron, étoile, épine, tour, quadruple
           escargot, rotors de Reuleaux) ;
     19-30 plus de bloc du tout : turbine ouverte, plasma, statoréacteur, pulsoréacteur, cuve nucléaire, tokamak, antimatière,
           tunnel de distorsion, comète, supernova, trou noir.
   Les dessins se bâtissent avec `bat10` (une géométrie par matière : 100 pièces = 8 appels de dessin). Axe du moteur = X ;
   l'ÉCHAPPEMENT sort vers -x pour les paliers 19-30 (ancre `userData.echap`). */
const PI10=Math.PI;
// LE KIT POLI : les matières d'un palier, toutes lisses, toutes réfléchissantes
function kit10(E){
  const poli=(c,sh,rf)=>new THREE.MeshPhongMaterial({color:c,shininess:sh||240,specular:0xffffff,envMap:envTex,
    reflectivity:rf==null?.5:rf,combine:THREE.MixOperation});
  const sombreCol=new THREE.Color(E.col).multiplyScalar(.40).getHex();
  const profond=(()=>{const c=new THREE.Color(E.col),h={};c.getHSL(h);c.setHSL(h.h,Math.min(1,h.s*1.15+.12),Math.min(h.l,.54));return c.getHex();})();   // une laque PROFONDE, pas un pastel plastique
  const G=guil10(),laque=(c,rf)=>new THREE.MeshPhongMaterial({color:c,map:G.map,bumpMap:G.bump,bumpScale:.006,specularMap:G.spec,
    shininess:300,specular:0xffffff,envMap:envTex,reflectivity:rf,combine:THREE.MixOperation});
  const halo=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,
    depthWrite:false,side:THREE.DoubleSide});
  const carterC=new THREE.Color(0x4b5266).lerp(new THREE.Color(sombreCol),.35).getHex();
  return {chrome:poli(0xeef3f9,340,.9),metal:poli(0xc4ccdc,240,.62),carter:poli(carterC,210,.5),lame:poli(0x242834,270,.58),alu:M10.alu(0xcdd4e0,190),
    fonte:M10.sable(new THREE.Color(carterC).lerp(new THREE.Color(0x3a3d46),.35).getHex()),brosse:M10.alu(0xd6dce8,200),soud:M10.soudure(),laiton:M10.laiton(),noir:poli(0x14161c,170,.24),or:poli(0xffcf5a,300,.64),
    ti:poli(0x8397c4,260,.58),cu:poli(0xd98a4e,260,.55),col:laque(profond,.40),colD:laque(sombreCol,.30),
    glow:new THREE.MeshBasicMaterial({color:E.flam}),glowC:new THREE.MeshBasicMaterial({color:E.col}),
    blanc:new THREE.MeshBasicMaterial({color:0xffffff}),halo:halo,
    haloF:halo(E.flam,.55),haloC:halo(E.col,.45),verre:M9.cristal(E.col)};
}
// ---- les pièces de base ----
function plan10(pts,th,bev){      // un profil de CÔTÉ (x,y), épaissi sur z : aileron, nageoire, pale
  const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)sh.lineTo(pts[k][0],pts[k][1]);sh.closePath();
  const b=bev==null?.010:bev;
  const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:1,steps:1});
  g.translate(0,0,-th/2);return g;
}
function cone10(r,h,seg){          // un cône d'axe X : base en x=0, pointe en x=h
  const g=new THREE.ConeGeometry(r,h,seg||12);g.translate(0,h/2,0);g.rotateZ(-PI10/2);return g;
}
function reul10(R,len){            // le TRIANGLE DE REULEAUX : le rotor d'un Wankel, extrudé sur X
  const V=[90,210,330].map(a=>[Math.cos(a*PI10/180)*R,Math.sin(a*PI10/180)*R]),pts=[],s=R*Math.sqrt(3);
  for(let k=0;k<3;k++){const A=V[k],Bv=V[(k+1)%3],C=V[(k+2)%3];
    const a0=Math.atan2(A[1]-C[1],A[0]-C[0]);let d=Math.atan2(Bv[1]-C[1],Bv[0]-C[0])-a0;
    while(d>PI10)d-=2*PI10;while(d<-PI10)d+=2*PI10;
    for(let j=0;j<12;j++){const t=a0+d*j/12;pts.push(new THREE.Vector2(C[0]+Math.cos(t)*s,C[1]+Math.sin(t)*s));}}
  const g=new THREE.ExtrudeGeometry(new THREE.Shape(pts),{depth:len,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,steps:1});
  g.translate(0,0,-len/2);g.rotateY(PI10/2);return g;
}
function helix10(R,x0,x1,turns,ph,r,seg){   // un fil qui s'enroule autour de l'axe X
  const p=[],n=Math.max(12,Math.round(turns*14));
  for(let k=0;k<=n;k++){const t=k/n,a=ph+t*turns*2*PI10;p.push([x0+(x1-x0)*t,Math.sin(a)*R,Math.cos(a)*R]);}
  return tube10(p,r,n*2,seg||6);
}
function dirs10(n){                // n directions bien réparties sur la sphère (spirale de Fibonacci)
  const o=[];for(let k=0;k<n;k++){const y=1-2*(k+.5)/n,r=Math.sqrt(1-y*y),f=k*2.39996;o.push(new THREE.Vector3(y,r*Math.cos(f),r*Math.sin(f)));}return o;
}
const EUL10=new THREE.Euler(),QUA10=new THREE.Quaternion(),AX10=new THREE.Vector3(1,0,0);
function vers10(B,geo,mat,p,d,sc){ // pose une pièce d'axe X sur la direction d, à la position p
  QUA10.setFromUnitVectors(AX10,d);EUL10.setFromQuaternion(QUA10,'XYZ');
  B.add(geo,mat,p.x,p.y,p.z,EUL10.x,EUL10.y,EUL10.z,sc,sc,sc);
}
const TX=(B,m,pts,x,y,z,ry,seg,rx)=>B.add(tourX(pts,seg||28),m,x,y,z,rx||0,ry||0,0);       // pièce tournée d'axe X (ry=π : elle s'ouvre vers -x)
const TY=(B,m,pts,x,y,z,rx,rz,seg)=>B.add(tourY10(pts,seg||24),m,x,y,z,rx||0,0,rz||0);      // pièce tournée verticale
const ANN=(B,m,R,r,x,y,z,rx,ry)=>B.add(new THREE.TorusGeometry(R,r,8,40),m,x,y,z,rx||0,ry==null?PI10/2:ry,0);  // anneau d'axe X
const BAR=(B,m,r,x0,x1,y,z)=>B.add(G10.axeX,m,x0,y,z,0,0,0,x1-x0,r,r);                    // une barre pleine le long de X
function pales10(B,m,n,r0,r1,w,t,x,pitch,ph){                                              // un rotor : n pales radiales vrillées
  const rm=(r0+r1)/2;
  for(let k=0;k<n;k++){const a=(ph||0)+k/n*2*PI10;
    BXg(B,m,x,Math.cos(a)*rm,Math.sin(a)*rm,a,pitch,0,w,r1-r0,t);}
}
function trompe10(B,m,x,y,z,h,r,rx,rz){                                                     // un cornet d'admission, évasé, avec sa gorge sombre
  B.add(tourY10([[r*.52,0],[r*.58,h*.04],[r*.68,h*.46],[r*1.0,h*.88],[r*1.16,h]],8),m,x,y,z,rx||0,0,rz||0);
}
function roul10(B,K,x,y,z,R,ax){   // un ROULEMENT À BILLES : deux bagues et une couronne de billes polies (axe 'x' ou 'y')
  const rx=ax==='y'?PI10/2:0,ry=ax==='y'?0:PI10/2,n=Math.max(8,Math.min(18,Math.round(R*40)));
  B.add(new THREE.TorusGeometry(R+R*.22,R*.07,6,32),K.chrome,x,y,z,rx,ry,0);B.add(new THREE.TorusGeometry(R-R*.22,R*.06,6,32),K.alu,x,y,z,rx,ry,0);
  for(let k=0;k<n;k++){const t=k/n*2*PI10,a=Math.cos(t)*R,b=Math.sin(t)*R;
    if(ax==='y')B.add(G10.ico||(G10.ico=new THREE.IcosahedronGeometry(1,1)),K.chrome,x+a,y,z+b,0,0,0,R*.16,R*.16,R*.16);else B.add(G10.ico||(G10.ico=new THREE.IcosahedronGeometry(1,1)),K.chrome,x,y+a,z+b,0,0,0,R*.16,R*.16,R*.16);}
}
function prop10(B,K,x,y,z,R,n,s){  // une GRAPPE de n propulseurs autour de l'axe, tournés vers -x : la puissance se COMPTE
  for(let k=0;k<n;k++){const t=k/n*2*PI10+.4,yy=y+Math.cos(t)*R,zz=z+Math.sin(t)*R;
    TX(B,K.chrome,[[.06*s,0],[.08*s,.05*s],[.14*s,.18*s],[.19*s,.30*s]],x,yy,zz,PI10,16);
    B.add(new THREE.TorusGeometry(.19*s,.012*s,4,16),K.or,x-.30*s,yy,zz,0,PI10/2,0);
    TX(B,K.glow,[[.001,0],[.16*s,0],[.16*s,.012]],x-.29*s,yy,zz,0,14);
    B.add(cone10(.13*s,.55*s,12),K.haloF,x-.30*s,yy,zz,0,PI10,0);}
}
function sphN10(r,seg){return new THREE.SphereGeometry(r,seg||14,10);}
/* LA FINESSE (2026-10-26, Léo : « tout est encore un peu brut, ajoute une bonne touche de finesse, on fait de l'art là »).
   (1) PLUS AUCUN CUBE BRUT : chaque boîte a ses arêtes CHANFREINÉES (biseau absolu, pas mis à l'échelle : une plaque fine garde un
       biseau fin) — c'est l'arête qui attrape le filet de lumière, comme sur une pièce de joaillerie.
   (2) LA LAQUE GUILLOCHÉE : les laques du palier portent une gravure fine en vagues, celle des cadrans de montre. */
const BOITE10={};
function boite10(w,h,d){
  const b=Math.min(.022,Math.min(w,h,d)*.24),k=w.toFixed(3)+'|'+h.toFixed(3)+'|'+d.toFixed(3);
  if(BOITE10[k])return BOITE10[k];
  const sh=new THREE.Shape(),x=w/2-b,y=h/2-b;sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.0005,d-2*b),bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:1,steps:1});
  g.translate(0,0,-(d-2*b)/2);BOITE10[k]=g;return g;
}
const BXg=(B,m,x,y,z,rx,ry,rz,sx,sy,sz)=>(Math.min(sx,sy,sz)<.009?B.add(G10.box,m,x,y,z,rx,ry,rz,sx,sy,sz):B.add(boite10(sx,sy,sz),m,x,y,z,rx,ry,rz));
let GUIL10=null;
function guil10(){
  if(GUIL10)return GUIL10;
  const S=256,mk=()=>{const c=document.createElement('canvas');c.width=c.height=S;return c;},cs=[mk(),mk(),mk()],im=cs.map(c=>c.getContext('2d').createImageData(S,S));
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const j=(y*S+x)*4,
      w=.5+.5*Math.sin(2*PI10*(y/5.33+.42*Math.sin(2*PI10*x/42.67))),           // les vagues du guilloché
      g=.5+.5*Math.sin(2*PI10*(x/3.2)),h=Math.pow(w,.7)*.85+g*.15,c=.90+.10*w;
    im[0].data[j]=im[0].data[j+1]=im[0].data[j+2]=c*255;im[0].data[j+3]=255;
    im[1].data[j]=im[1].data[j+1]=im[1].data[j+2]=h*255;im[1].data[j+3]=255;
    im[2].data[j]=im[2].data[j+1]=im[2].data[j+2]=(.55+.45*w)*255;im[2].data[j+3]=255;}
  cs.forEach((c,i)=>c.getContext('2d').putImageData(im[i],0,0));
  const t=cs.map(c=>{const x=new THREE.CanvasTexture(c);x.wrapS=x.wrapT=THREE.RepeatWrapping;x.anisotropy=8;x.repeat.set(2.5,2.5);return x;});
  return GUIL10={map:t[0],bump:t[1],spec:t[2]};
}

/* ============ LE BLOC FACETTÉ — la base COMMUNE des paliers 2-18 (un seul langage, de la moto au W12) ============
   Ce que Léo a demandé (26/10, 2e retour : « c'est un peu simplet, utilise les reflets FACETTE et MÈCHE comme sur les voitures ;
   les moteurs doivent se suivre indépendamment mais logiquement ») : plus de vagues. Tous les blocs sont taillés pareil — normales
   PLATES (comme `facetteCaisse`), pots à 8 pans, couvre-culasses laqués à la couleur du palier, bande de MÈCHES de carbone sur le
   dessus, collecteurs facettés — et la PUISSANCE se lit à trois choses qui montent d'un cran à chaque palier : la masse, les
   filets lumineux (dès le 8e), et la pièce unique posée dessus (`crown30`). */
function bloc30(g,i,E,KT,rnd,K,S){
  const B=bat10();B.f=true;B.plat();
  const L=S.L,XE=L/2,a=K.a,pb=S.pb,metal=KT.metal,col=KT.col,plat=(a==='fl'||a==='h'),haut=(a==='h');
  const sec=a==='fl'?[[-.30,.20],[.30,.20],[.26,-.10],[.16,-.24],[-.16,-.24],[-.26,-.10]]
    :haut?[[-.24,.50],[.24,.50],[.22,-.50],[-.22,-.50]]:[[-.34,.26],[.34,.26],[.30,-.02],[.20,-.26],[-.20,-.26],[-.30,-.02]];
  B.add(profX(sec,L,.04),KT.fonte,0,-.02,0);
  B.add(profX([[-.22,.02],[.22,.02],[.17,-.20],[-.17,-.20]],L*.88,.025),KT.noir,0,-.30,0);
  B.add(tourX([[.06,0],[.27,0],[.31,.05],[.33,.16],[.27,.22],[.08,.24]],8),KT.noir,-(XE+.02),-.02,0,0,0,0);        // la cloche, à huit pans
  B.add(tourX([[.05,0],[.22,0],[.24,.05],[.20,.17]],8),KT.chrome,XE,-.02,0,0,0,0);                                  // la poulie
  if(!plat)for(let k=0;k<3+Math.floor(L*1.6);k++){const u=(k/(2+Math.floor(L*1.6))-.5)*(L-.34);
    for(let sd=-1;sd<=1;sd+=2)BXg(B,KT.fonte,u,-.04,sd*.335,0,0,0,.038,.40,.045);}                              // les nervures
  if(i>=11)for(let sd=-1;sd<=1;sd+=2)BXg(B,KT.glow,0,.12,sd*.352,0,0,0,L*.70,.014,.014);                   // le filet lumineux du carter
  const tw=.20-.0035*i,ch=.13+.007*i,top=.67+ch;       // le couvre-culasse s'AFFINE et se dresse avec la puissance : de la boîte à la lame
  let echap=null;
  for(let b=0;b<S.BK.length;b++){
    const inc=S.BK[b][0],et=S.BK[b][1],n=Math.min(pb,K.c-b*pb);if(n<=0)break;
    B.cadre(et*.28,inc);
    const U=k=>((n>1?k/(n-1):.5)-.5)*(L-.42);
    for(let k=0;k<n;k++){const u=U(k);
      B.add(tourY10([[.001,0],[.175,.02],[.175,.30],[.21,.33],[.21,.40],[.001,.40]],8),KT.brosse,u,.10,0);                  // le fût, à huit pans
      if(K.f)for(let j=0;j<K.f+1;j++)B.add(tourY10([[.001,0],[.28,0],[.28,.022],[.001,.022]],8),KT.alu,u,.12+j*.055,0);// les ailettes, plaques à huit pans
    }
    B.add(profX([[-.25,0],[.25,0],[.235,.15],[-.235,.15]],L*.93,.03),KT.brosse,0,.52,0);                                    // la culasse
    B.add(profX([[-.235,0],[.235,0],[tw,ch],[-tw,ch]],L*.97,.035),col,0,.67,0);
    for(let k=0;k<n;k++){const u=U(k);
      for(let dx=-1.5;dx<=1.5;dx+=1)for(let sd=-1;sd<=1;sd+=2)BXg(B,KT.brosse,u+dx*.07,.585,sd*.272,0,0,0,.014,.15,.075);   // les ailettes de refroidissement de la culasse
      for(let j=0;j<6;j++){const t=j/6*2*PI10;B.add(G10.cyl6,KT.chrome,u+Math.cos(t)*.19,.315,Math.sin(t)*.19,0,0,0,.018,.03,.018);}         // les six boulons de bride du fût
      B.add(new THREE.TorusGeometry(.176,.008,4,18),KT.chrome,u,.20,0,PI10/2,0,0);B.add(new THREE.TorusGeometry(.176,.008,4,18),KT.chrome,u,.26,0,PI10/2,0,0); // deux rainures usinées
    }
    for(let k=0;k<=n;k++){const u=((k/n)-.5)*(L-.40);BXg(B,KT.colD,u,top+.002,0,0,0,0,.028,.022,tw*1.75);}   // les nervures transversales du couvre-culasse                                     // le couvre-culasse laqué
    BXg(B,KT.lame,0,top+.006,0,0,0,0,L*.78,.010,tw*1.5);
    for(let k=0;k<n;k++){B.add(tourY10([[.001,0],[.12,0],[.001,.07+.006*i]],4),k%2?KT.or:KT.chrome,U(k),top+.01,0,0,PI10/4,0);}   // des pyramides d'or et de chrome, plus hautes avec le palier                                                              // la bande de MÈCHES de carbone
    if(i>=7)for(let sd=-1;sd<=1;sd+=2)BXg(B,KT.glow,0,.67+ch*.5,sd*(.235-(.235-tw)*.5+.004),0,0,0,L*.90,.010,.010);               // les filets lumineux, dès le 8e
    if(i>=14)for(let k=0;k<n;k++)BXg(B,KT.glow,U(k),top+.022,0,0,0,0,.05,.012,tw*1.9);                                 // un trait par cylindre
    for(let k=0;k<n;k++){const u=U(k);B.add(tourY10([[.001,0],[.042,0],[.046,.018],[.046,.095],[.032,.115],[.012,.13],[.001,.13]],12),KT.noir,u+.12,top+.01,0);B.add(new THREE.TorusGeometry(.047,.006,4,16),KT.or,u+.12,top+.06,0,PI10/2,0,0);}   // les bobines, fines, cerclées d'or // les bobines
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.axeX8,KT.or,-L*.485,.672,sd*.238,0,0,0,L*.97,.006,.006);B.add(G10.axeX8,KT.or,-L*.465,.522,sd*.252,0,0,0,L*.93,.005,.005);}   // les FILETS D'OR des jointures
    // L'ÉCHAPPEMENT, lisible : un petit coude par cylindre, UN gros collecteur facetté sur toute la longueur, une tuyère évasée à braise
    const clamp=Math.abs(inc)>1,dec=clamp?(inc<0?-1:1)*.62:inc,my=.30,mz=.50;
    if(clamp)B.cadre(et*.28,dec);
    const faisceau=(i>=10&&i<=15),E0=faisceau?[L*.46+.38,-.38,.44]:[L*.46+.38,my,mz];
    if(faisceau){                                    // LE FAISCEAU (fusion avec l'ancien dessin) : un tube poli par cylindre, qui s'écarte, plonge et se rejoint
      for(let k=0;k<n;k++){const u=U(k),ph=k/Math.max(1,n);
        B.add(tube10([[u,.58,.24],[u*.94,.40+ph*.10,.58+ph*.12],[u*.52,.04-ph*.05,.68+ph*.10],[u*.18,-.24,.57],[0,-.33,.43]],.05,12,7),KT.chrome,0,0,0);
        B.add(new THREE.TorusGeometry(.056,.008,4,14),KT.or,u*.94,.40+ph*.10,.58+ph*.12,0,0,0);
        BXg(B,KT.chrome,u,.58,.262,0,0,0,.15,.10,.022);}
      B.add(tube10([[0,-.33,.43],[L*.25,-.37,.47],[E0[0]-.02,E0[1],E0[2]]],.10,10,8),KT.soud,0,0,0);
      B.add(new THREE.TorusGeometry(.12,.02,5,18),KT.or,0,-.33,.43,0,PI10/2,0);
    }else{
      for(let k=0;k<n;k++){const u=U(k);B.add(tube10([[u,.58,.24],[u,.50,.42],[u,my+.06,mz-.02]],.062,8,8),KT.soud,0,0,0);
        BXg(B,KT.chrome,u,.58,.262,0,0,0,.15,.10,.022);
        for(let sx=-1;sx<=1;sx+=2)B.add(G10.cyl6,KT.chrome,u+sx*.062,.58,.285,PI10/2,0,0,.014,.03,.014);}
      B.add(tube10([[-L*.46,my,mz],[L*.46+.42,my,mz]],.115,8,8),KT.soud,0,0,0);
      for(let k=0;k<3+(i>=7?2:0);k++)B.add(new THREE.TorusGeometry(.125,.024,5,10),KT.or,-L*.34+k*L*.20,my,mz,0,PI10/2,0);
    }
    // LES SORTIES SE MULTIPLIENT avec le palier : une, puis deux (palier 9), puis trois (palier 14) — la puissance se compte de loin
    const nt=1+(i>=8?1:0)+(i>=13?1:0);
    for(let t=0;t<nt;t++){const ty=E0[1]-t*.17,tz=E0[2]+t*.05;
      if(t>0)B.add(tube10([[E0[0]-.34,E0[1],E0[2]],[E0[0]-.14,ty+.04,tz],[E0[0],ty,tz]],.07,10,8),KT.soud,0,0,0);
      B.add(tourX([[.11,0],[.15,.05],[.24,.22],[.30,.32]],12),KT.chrome,E0[0],ty,tz,0,0,0);
      B.add(new THREE.TorusGeometry(.30,.012,4,20),KT.or,E0[0]+.32,ty,tz,0,PI10/2,0);
      B.add(tourX([[.001,0],[.22,0],[.22,.02],[.001,.02]],12),KT.glow,E0[0]+.30,ty,tz,0,0,0);}
    if(b===0){const ca=Math.cos(dec),sa=Math.sin(dec),ex=E0[0]+.34,ey=E0[1],ez=E0[2];
      echap=[ex,ey*ca-ez*sa+et*.28,ey*sa+ez*ca];}
  }
  B.plat();
  /* LE KIT DE PUISSANCE : des pièces qui s'AJOUTENT palier après palier — c'est ça qui fait qu'on ne revient jamais en arrière */
  for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<5+Math.floor(L*1.5);k++){const x=((k+.5)/(5+Math.floor(L*1.5))-.5)*(L-.3);B.add(G10.cyl6,KT.chrome,x,.52,sd*.275,PI10/2,0,0,.016,.03,.016);}  // la rangée de boulons de culasse
  for(let sd=-1;sd<=1;sd+=2)B.add(G10.axeX8,KT.or,-L*.5,.245,sd*.342,0,0,0,L,.006,.006);   // le filet d'or du plan de joint
  for(let k=0;k<9;k++)BXg(B,KT.brosse,(k/8-.5)*(L*.8),-.38,0,0,0,0,.014,.10,.34);                                                                            // les ailettes du carter d'huile
  B.add(G10.cyl6,KT.chrome,-L*.30,-.46,0,0,0,0,.045,.05,.045);                                                                                                        // le bouchon de vidange
  if(i>=3){B.add(tourX([[.001,0],[.105,0],[.115,.04],[.115,.30],[.10,.33],[.001,.33]],8),KT.col,XE*.30,-.10,-.45,0,0,0);                                                 // le filtre à huile, à la couleur du palier
    for(let k=0;k<3;k++)B.add(new THREE.TorusGeometry(.118,.014,4,8),KT.chrome,XE*.30+.07+k*.08,-.10,-.45,0,PI10/2,0);
    B.add(G10.cyl6,KT.laiton,XE*.30-.04,-.10,-.45,0,0,PI10/2,.05,.05,.05);}
  if(i>=3)for(let sd=-1;sd<=1;sd+=2){const nl=2+Math.floor(i/3),rk=.25+.03*i;                                                                       // PERSIENNES : des lames facettées qui s'ouvrent plus largement à chaque palier
    for(let k=0;k<nl;k++){const y=-.20+k*(.36/nl);BXg(B,k%2?KT.lame:KT.col,0,y,sd*(.37+k*.012),sd*rk,0,0,L*.68-k*.04,.012,.10);
      if(i>=8)BXg(B,KT.glow,0,y,sd*(.37+.05+k*.012),sd*rk,0,0,L*.66-k*.04,.008,.008);}}
  if(i>=9)for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[-L*.40,0],[L*.34,0],[L*.16,.40],[-L*.34,.18]],.025,.006),i%2?KT.col:KT.meche,0,-.22,sd*.46,sd*.5,0,0);   // les ailes
  if(i>=15)for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[-L*.5,0],[L*.5,0],[L*.30,.5],[-L*.5,.22]],.018,.004),KT.col,0,-.10,sd*.60,sd*.9,0,0);                 // les ailes de lumière
  crown30(B,K,S,KT,i,E,rnd,g);
  B.fin(g);
  g.userData.echap={p:echap||[L*.64,-.40,.36],d:[1,0,0]};
}

/* ============ LA PIÈCE UNIQUE DE CHAQUE PALIER : une idée de forme par moteur, de plus en plus grande ============ */
function crown30(B,K,S,KT,i,E,rnd,g){
  const L=S.L,XE=L*.5,horn=(x,y,z,h,r,rx,rz,m)=>B.add(tourY10([[r*.52,0],[r*.58,h*.04],[r*.68,h*.46],[r*1.0,h*.88],[r*1.16,h]],12),m||KT.chrome,x,y,z,rx||0,0,rz||0);
  let C=B,cg=null;const CS={1:1.12,2:1.30,3:1.22,4:1.28,5:1.12,6:1.35,7:1.35,8:1.18,9:1.18,10:1.35,11:1.30,12:1.35,13:1.45,14:1.7,15:1.30,16:1.7},k2=CS[i];
  if(k2){C=bat10();C.f=true;C.plat();}                     // paliers 11-17 : la couronne est GRANDIE autour de sa base (y .8)
  const goldRing=(x,y,z,R,rx)=>C.add(new THREE.TorusGeometry(R,R*.12,6,20),KT.or,x,y,z,rx||PI10/2,0,0);
  switch(i){
  case 1:{ // BICYLINDRE — LE MÉGAPHONE : un tube qui s'enroule et s'ouvre en cornet, deux pavillons d'admission
    C.add(tube10([[XE*.2,-.30,.44],[XE*.8,-.20,.62],[XE+.2,.20,.64],[XE+.34,.50,.52]],.07,12,6),KT.chrome,0,0,0);
    horn(XE+.36,.46,.52,.52,.15);goldRing(XE+.36,.52,.52,.16,0);
    for(let k=0;k<2;k++){const u=(k-.5)*(L-.42);horn(u,.60,-.26,.52,.11,-PI10/2,0);goldRing(u,.60,-.30,.12,0);}
    C.add(G10.cyl6,KT.or,0,.30,-.5,0,0,PI10/2,.04,.9,.04);
    break;}
  case 2:{ // 3 CYLINDRES — LA VOILE : trois cornets alignés et une voile de carbone qui les couvre
    for(let k=0;k<3;k++){const u=(k-1)*(L-.5)/2;horn(u,.66,-.33,.52,.10);goldRing(u,.72,-.33,.11);}
    C.add(plan10([[-L*.45,0],[L*.45,0],[L*.30,.52],[-L*.40,.34]],.03,.008),KT.lame,0,.86,.12);
    C.add(plan10([[-L*.45,0],[L*.45,0],[L*.30,.52],[-L*.40,.34]],.036,.004),KT.col,0,.86,.12,0,0,0,1,.04,1);
    break;}
  case 3:{ // 4 EN LIGNE — LE COIN : un boîtier d'air en mèches, taillé en coin, et sa trompe d'entrée
    C.add(plan10([[-L*.5,0],[L*.5,0],[L*.34,.60],[-L*.40,.44]],.34,.02),KT.lame,0,.84,0);
    for(let k=0;k<5;k++)BXg(C,KT.glow,-L*.30+k*L*.15,1.08-k*.012,0,0,0,0,.02,.14,.35);
    C.add(plan10([[-L*.5,0],[L*.5,0],[L*.34,.60],[-L*.40,.44]],.20,.01),KT.col,0,.845,0,0,0,0,1,1,1.02);
    horn(L*.5+.05,.98,0,.55,.15,0,-PI10/2);goldRing(L*.5+.10,.98,0,.17,0);
    for(let k=0;k<4;k++){const u=(k/3-.5)*(L-.5);C.add(G10.cyl6,KT.chrome,u,.88,-.22,0,0,0,.05,.12,.05);}
    break;}
  case 4:{ // 4 SOUPAPES — LES DEUX ARBRES : deux longs capots d'arbre à cames à six pans, l'engrenage de distribution en or
    for(let sd=-1;sd<=1;sd+=2){C.add(tourX([[.13,0],[.15,.03],[.15,L*.88],[.13,L*.91]],6),KT.col,-L*.455,.94,sd*.15);
      for(let k=0;k<4;k++)goldRing(-L*.30+k*.26,.94,sd*.15,.15,PI10/2*1);}
    C.add(tourX([[.001,0],[.30,0],[.32,.03],[.32,.06],[.001,.07]],8),KT.or,XE+.06,.82,0,0,0,0);
    C.add(tourX([[.001,0],[.20,0],[.20,.02],[.001,.02]],8),KT.glow,XE+.14,.82,0,0,0,0);
    break;}
  case 5:{ // 4 EN LIGNE TURBO — LE SOUFFLE : un escargot facetté, un échangeur en mèches, les tuyaux de charge
    turbo10(C,{alu:KT.alu,sombre:KT.noir,chrome:KT.chrome,soudure:KT.ti},XE-.02,.10,.50,1);
    C.add(profX([[-.43,-.28],[.43,-.28],[.43,.28],[-.43,.28]],.13,.025),KT.lame,XE+.36,.02,0);
    for(let k=0;k<6;k++)BXg(C,KT.col,XE+.43,-.22+k*.088,0,0,0,0,.02,.025,.84);
    C.add(tube10([[XE-.06,.52,.60],[XE+.18,.46,.52],[XE+.34,.20,.34]],.055,10,6),KT.chrome,0,0,0);
    break;}
  case 6:{ // 5 CYLINDRES — LE PENTAGONE : un plénum à CINQ pans, cinq descentes, un anneau d'or
    C.add(tourX([[.001,0],[.26,0],[.29,.04],[.29,L*.80],[.26,L*.84],[.001,L*.84]],5),KT.chrome,-L*.42,1.0,0);
    for(let k=0;k<5;k++){const u=(k/4-.5)*(L-.42);C.add(tube10([[u,.96,-.06],[u,.82,-.20],[u,.64,-.24]],.052,10,5),KT.chrome,0,0,0);goldRing(-L*.42+(k+.5)*L*.84/5,1.0,0,.30,PI10/2);}
    break;}
  case 7:{ // V6 — L'ARÊTE : une épine chromée sur la vallée, six cornets en éventail, trois arceaux
    C.add(G10.axeX8,KT.chrome,-L*.47,.80,0,0,0,0,L*.94,.075,.075);
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++){const u=(k/2-.5)*(L-.5);horn(u,.84,sd*.17,.50,.095,sd*.34,0);goldRing(u,.9,sd*.19,.10,sd*.34);}
    for(let k=0;k<3;k++)C.add(new THREE.TorusGeometry(.38,.03,5,10,PI10),KT.alu,(k-1)*L*.36,.52,0,0,PI10/2,0);
    break;}
  case 8:{ // V6 BITURBO — LES DEUX SOUFFLES : un escargot par flanc, un boîtier de mèches sur la vallée
    for(let sd=-1;sd<=1;sd+=2)turbo10(C,{alu:KT.alu,sombre:KT.noir,chrome:KT.chrome,soudure:KT.ti},XE-.02,.02,sd*.74,sd);
    C.add(profX([[-.30,0],[.30,0],[.26,.34],[-.26,.34]],L*.62,.045),KT.colD,0,.82,0);
    for(let sd=-1;sd<=1;sd+=2)C.add(G10.axeX8,KT.or,-L*.31,.83,sd*.30,0,0,0,L*.62,.006,.006);
    BXg(C,KT.glow,0,1.16,0,0,0,0,L*.58,.012,.30);
    for(let sd=-1;sd<=1;sd+=2)C.add(tube10([[XE-.10,.46,sd*.74],[XE*.5,.90,sd*.30],[L*.2,1.0,sd*.14]],.06,10,6),KT.chrome,0,0,0);
    break;}
  case 9:{ // BOXER À PLAT — LE CARÉNAGE : un ventilateur sous capot à huit pans, un plénum central et ses becs
    C.add(tourX([[.40,0],[.52,.03],[.54,.14],[.54,.24],[.42,.32],[.34,.36]],8),KT.col,-(XE+.34),0,0);
    pales10(C,KT.chrome,8,.10,.40,.07,.02,-(XE+.20),.5,0);
    C.add(G10.axeX8,KT.chrome,-L*.40,.44,0,0,0,0,L*.80,.11,.11);
    for(let k=0;k<4;k++){const u=(k/3-.5)*(L*.72);for(let sd=-1;sd<=1;sd+=2)C.add(tube10([[u,.44,sd*.08],[u,.38,sd*.30],[u,.22,sd*.46]],.04,10,5),KT.chrome,0,0,0);goldRing(u,.44,0,.12,PI10/2);}
    break;}
  case 10:{ // V8 ATMO — L'ORGUE : huit trompes chromées en éventail au-dessus de la vallée, deux rails, des collerettes d'or
    for(let sd=-1;sd<=1;sd+=2){C.add(G10.axeX8,KT.chrome,-L*.45,.78,sd*.17,0,0,0,L*.90,.04,.04);
      for(let k=0;k<4;k++){const u=(k/3-.5)*(L-.5);horn(u,.80,sd*.17,.62,.095,sd*.30,0);goldRing(u,.86,sd*.185,.10,sd*.30);}}
    C.add(tourX([[.001,0],[.16,0],[.20,.05],[.20,.16],[.001,.18]],8),KT.col,-L*.52,.90,0);
    for(let sd=-1;sd<=1;sd+=2){roul10(C,KT,L*.47,.78,sd*.17,.075,'x');roul10(C,KT,-L*.47,.78,sd*.17,.075,'x');}
    break;}
  case 11:{ // V8 COMPRESSÉ — LE CARILLON : un gros tambour à pans, son rotor vrillé, une trompe d'admission
    C.add(tourX([[.001,0],[.22,0],[.30,.05],[.31,.50*L],[.30,.54*L],[.22,.58*L],[.001,.58*L]],10),KT.chrome,-L*.30,.98,0);
    for(let k=0;k<5;k++)goldRing(-L*.30+.06+k*.115*L,.98,0,.315,PI10/2);
    pales10(C,KT.col,3,.04,.24,.30,.04,-L*.30+.58*L+.01,.9,0);
    roul10(C,KT,-L*.30+.58*L+.04,.98,0,.20,'x');roul10(C,KT,-L*.30-.01,.98,0,.20,'x');
    C.add(tourX([[.14,0],[.18,.06],[.30,.30],[.40,.48]],8),KT.chrome,XE*.55+.38,.98,0,0,PI10);
    break;}
  case 12:{ // V10 — LES DEUX COURONNES : deux disques-plénums laqués, chacun couronné de cinq cornets qui s'écartent comme des pétales, un cœur de lumière
    for(let c=-1;c<=1;c+=2){const cx=c*L*.24;
      C.add(tourY10([[.001,0],[.44,0],[.50,.05],[.40,.13],[.001,.18]],10),KT.col,cx,.92,0);
      C.add(new THREE.TorusGeometry(.47,.03,5,10),KT.or,cx,.95,0,PI10/2,0,0);
      for(let k=0;k<5;k++){const t=k/5*2*PI10+(c>0?.3:0),cs=Math.cos(t),sn=Math.sin(t);
        horn(cx+cs*.34,1.02,sn*.34,.62,.10,sn*.38,-cs*.38);goldRing(cx+cs*.38,1.10,sn*.38,.11);}
      C.add(tourY10([[.001,0],[.10,0],[.001,.46]],5),KT.or,cx,1.08,0);C.add(G10.sph,KT.glow,cx,1.56,0,0,0,0,.07,.07,.07);}
    for(let k=0;k<10;k++){const u=(k/9-.5)*(L-.40);C.add(G10.cyl6,KT.or,u,.90,0,0,0,0,.034,.10,.034);}
    break;}
  case 13:{ // V12 — LA CATHÉDRALE : trois arches facettées, douze piliers d'or dans la nef, une flèche
    for(let k=0;k<3;k++){const u=(k-1)*L*.36;C.add(new THREE.TorusGeometry(.60,.05,5,12,PI10),KT.chrome,u,.44,0,0,PI10/2,0);
      C.add(new THREE.TorusGeometry(.60,.014,4,12,PI10),KT.glow,u,.44,0,0,PI10/2,0);}
    C.add(G10.axeX8,KT.chrome,-L*.46,1.02,0,0,0,0,L*.92,.045,.045);
    roul10(C,KT,L*.47,1.02,0,.08,'x');roul10(C,KT,-L*.47,1.02,0,.08,'x');
    for(let k=0;k<12;k++){const u=(k/11-.5)*(L-.5),s2=k%2?1:-1;horn(u,.80,s2*.16,.38,.06,s2*.12,0,KT.or);}
    C.add(cone10(.06,.5,6),KT.or,0,1.1,0,0,0,PI10/2);
    break;}
  case 14:{ // W12 — L'ÉTOILE : un moyeu lenticulaire, douze ailettes d'or, quatre bras qui descendent aux bancs
    C.add(tourY10([[.001,0],[.34,0],[.46,.05],[.40,.16],[.001,.21]],12),KT.chrome,0,1.00,0);
    roul10(C,KT,0,.97,0,.38,'y');
    for(let k=0;k<12;k++){const t=k/12*2*PI10;BXg(C,k%2?KT.or:KT.col,Math.cos(t)*.50,1.10,Math.sin(t)*.50,0,-t,0,.30,.07,.02);}
    C.add(G10.cyl6,KT.or,0,1.30,0,0,0,0,.05,.20,.05);C.add(G10.sph,KT.glow,0,1.42,0,0,0,0,.08,.08,.08);
    for(let k=0;k<4;k++){const t=(k+.5)/4*2*PI10;C.add(tube10([[Math.cos(t)*.34,1.0,Math.sin(t)*.34],[Math.cos(t)*.58,.80,Math.sin(t)*.58],[Math.cos(t)*.50,.62,Math.sin(t)*.50]],.045,10,5),KT.chrome,0,0,0);}
    break;}
  case 15:{ // V16 — L'ÉPINE : deux rails géants, seize trompes, un dos de dragon en or
    for(let sd=-1;sd<=1;sd+=2){C.add(G10.axeX8,KT.chrome,-L*.48,.92,sd*.17,0,0,0,L*.96,.05,.05);
      for(let k=0;k<8;k++){const u=(k/7-.5)*(L-.4);horn(u,.94,sd*.17,.36,.07,sd*.2,0);}}
    for(let k=0;k<9;k++){const u=(k/8-.5)*(L-.3),h=.30+.34*Math.sin(k/8*PI10);C.add(plan10([[-.09,.0],[.09,.0],[.03,h],[-.03,h*.92]],.035,.006),k%2?KT.or:KT.col,u,1.0,0);}
    goldRing(L*.5,.80,0,.30);goldRing(-L*.5,.80,0,.30);
    break;}
  case 16:{ // H16 F1 — LA TOUR : un arbre cannelé, six disques de refroidissement, une hélice d'or
    C.add(tourY10([[.001,0],[.16,0],[.12,.06],[.16,.14],[.12,.22],[.16,.30],[.12,.38],[.16,.46],[.12,.54],[.16,.62],[.10,.70],[.001,.76]],8),KT.chrome,0,.92,0);
    for(let k=0;k<6;k++)C.add(tourY10([[.001,0],[.34-k*.03,0],[.34-k*.03,.014],[.001,.014]],10),k%2?KT.col:KT.alu,0,.98+k*.10,0);
    C.add(tube10((function(){const p=[];for(let k=0;k<=60;k++){const t=k/60,a=t*PI10*8;p.push([Math.cos(a)*.26,.90+t*.62,Math.sin(a)*.26]);}return p;})(),.016,120,4),KT.or,0,0,0);
    for(let sd=-1;sd<=1;sd+=2)C.add(tube10([[0,.96,sd*.1],[0,.76,sd*.40],[0,.52,sd*.58]],.04,10,5),KT.chrome,0,0,0);
    break;}
  case 17:{ // QUADRITURBO — LE CARREFOUR : quatre escargots en croix, un anneau collecteur, un cœur lumineux
    const M={alu:KT.alu,sombre:KT.noir,chrome:KT.chrome,soudure:KT.ti},tp=[[.50,.46],[-.50,.46],[.50,-.10],[-.50,-.10]];
    for(const q of tp)turbo10(C,M,XE-.10,q[1],q[0],q[0]>0?1:-1);
    C.add(new THREE.TorusGeometry(.52,.055,6,12),KT.chrome,XE+.30,.20,0,0,PI10/2,0);C.add(new THREE.TorusGeometry(.52,.016,4,12),KT.glow,XE+.30,.20,0,0,PI10/2,0);
    C.add(G10.sph,KT.col,XE+.30,.20,0,0,0,0,.22,.22,.22);C.add(G10.sph,KT.glow,XE+.30,.20,0,0,0,0,.10,.10,.10);
    for(const q of tp)C.add(tube10([[XE+.10,q[1],q[0]*.9],[XE+.24,q[1]*.6+.08,q[0]*.6],[XE+.30,.20,q[0]*.2]],.05,10,5),KT.chrome,0,0,0);
    break;}
  }
  if(k2){cg=new THREE.Group();C.fin(cg);cg.scale.setScalar(k2);cg.position.y=.8*(1-k2);g.add(cg);}
}

/* ============ PALIERS 19-30 : PLUS DE BLOC — des objets ============ */
function orig10(g,i,E,K,rnd){
  const B=bat10(),croute=M9.croute(E.col);B.f=true;B.plat();
  let ech=[-1.5,0,0];
  switch(i){
  case 18:{ // ROTATIF TRIPLE — TROIS ROTORS DE REULEAUX sous verre, sur un arbre chromé
    const n=3,pas=.52,x0=-(n-1)*pas/2;
    for(let k=0;k<n;k++){const x=x0+k*pas;
      ANN(B,K.chrome,.63,.03,x-.15,0,0);ANN(B,K.chrome,.63,.03,x+.15,0,0);ANN(B,K.or,.645,.008,x,0,0);   // la chambre est en VERRE : on voit tourner le rotor
      for(let sd=-1;sd<=1;sd+=2)trompe10(B,K.chrome,x,.55*sd,.0,.40,.09,sd>0?0:PI10,0);                        // ses deux lumières d'admission
      TX(B,K.verre,[[.62,.02],[.62,.30]],x-.15,0,0,0,40);
      B.add(reul10(.50,.20),K.col,x,0,0,k*.62,0,0);
      B.add(reul10(.34,.22),K.glow,x,0,0,k*.62,0,0);
      B.add(G10.sph,K.or,x,0,0,0,0,0,.11,.11,.11);
      TX(B,K.noir,[[.52,0],[.64,0],[.64,.05],[.52,.05]],x+.17,0,0,0,40);}
    BAR(B,K.chrome,.07,x0-.50,-x0+.50,0,0);
    TX(B,K.chrome,[[.20,0],[.26,.06],[.40,.26],[.54,.44]],x0-.40,0,0,PI10,30);ANN(B,K.haloF,.52,.04,x0-.86,0,0);
    TX(B,K.or,[[.30,0],[.35,.02],[.35,.10],[.30,.12]],-x0+.40,0,0,0,26);
    ech=[x0-1.0,0,0];break;}
  case 19:{ // TURBINE À GAZ — UNE TURBINE OUVERTE : trois étages d'aubes sur un cadre de longerons, cône d'entrée, six chambres, tuyère
    for(let k=0;k<6;k++)ANN(B,K.chrome,.58,.035,-1.05+k*.42,0,0);
    for(let k=0;k<6;k++){const t=k/6*2*PI10;BAR(B,K.alu,.026,-1.05,1.05,Math.cos(t)*.58,Math.sin(t)*.58);}
    TX(B,K.chrome,[[.50,0],[.60,.05],[.64,.14],[.56,.21],[.50,.23]],.92,0,0,0,36);
    TX(B,K.chrome,[[.001,0],[.10,.06],[.16,.22],[.17,.46],[.14,.50]],1.18,0,0,PI10,22);
    const st=[[.50,.20,.52,22,K.alu,.5],[.10,.18,.48,26,K.ti,-.5],[-.30,.16,.44,30,K.col,.5]];
    for(const s2 of st){TX(B,K.noir,[[.001,0],[.20,0],[.20,.07],[.001,.07]],s2[0]-.03,0,0,0,24);pales10(B,s2[4],s2[3],s2[1],s2[2],.075,.016,s2[0],s2[5],0);}
    for(let k=0;k<6;k++){const t=(k+.5)/6*2*PI10;TX(B,K.col,[[.001,0],[.11,0],[.12,.04],[.12,.38],[.09,.44]],-.78,Math.cos(t)*.31,Math.sin(t)*.31,0,16);}
    pales10(B,K.glow,36,.14,.40,.07,.014,-1.02,.6,0);
    TX(B,K.chrome,[[.36,0],[.34,.10],[.42,.30],[.56,.56]],-1.10,0,0,PI10,32);ANN(B,K.haloF,.40,.05,-1.12,0,0);
    ech=[-1.75,0,0];break;}
  case 20:{ // TURBINE À PLASMA — UN CŒUR DE LUMIÈRE dans un tube de verre, six anneaux magnétiques, quatre fils qui s'enroulent
    B.add(G10.axeX,K.glowC,-1.05,0,0,0,0,0,2.2,.07,.07);B.add(G10.axeX,K.haloC,-1.05,0,0,0,0,0,2.2,.15,.15);
    TX(B,K.verre,[[.21,0],[.21,2.2]],-1.05,0,0,0,32);
    for(let k=0;k<6;k++){const x=-.80+k*.34,R=.34+(k%2)*.07;ANN(B,k%2?K.chrome:K.or,R,.052,x,0,0);ANN(B,K.haloF,R,.022,x,0,0);}
    for(let h=0;h<4;h++)B.add(helix10(.27,-.95,.95,2.2,h*PI10/2,.014,6),K.haloF,0,0,0);
    for(let k=0;k<4;k++){const t=k/4*2*PI10+.4;B.add(plan10([[-.9,.40],[.9,.40],[.55,.88],[-.45,.74]],.03,.008),k%2?K.lame:K.col,0,0,0,t,0,0);}
    TX(B,K.chrome,[[.20,0],[.26,.08],[.42,.34],[.58,.54]],-1.05,0,0,PI10,30);TX(B,K.haloF,[[.001,0],[.40,.20],[.001,.60]],-1.10,0,0,PI10,20);
    ech=[-1.72,0,0];break;}
  case 21:{ // STATORÉACTEUR — LE JAVELOT : une pointe de choc facettée, des bagues d'or qui coulent dessus, six dérives, une tuyère étoilée
    B.add(cone10(.17,1.25,8),K.chrome,.55,0,0,0,0,0);
    for(let k=0;k<3;k++)ANN(B,K.or,.14-k*.034,.024,.95+k*.2,0,0);
    TX(B,K.chrome,[[.31,0],[.37,.05],[.42,.22],[.44,.34]],.32,0,0,0,32);ANN(B,K.col,.44,.04,.30,0,0);
    TX(B,K.col,[[.44,0],[.44,1.50],[.39,1.60]],-1.18,0,0,0,32);
    for(let k=0;k<4;k++){const x=-.85+k*.42;ANN(B,K.or,.445,.030,x,0,0);ANN(B,K.haloF,.452,.012,x+.12,0,0);}
    for(let k=0;k<6;k++){const t=k/6*2*PI10;B.add(plan10([[-1.38,.40],[-.40,.44],[-.55,.98],[-1.52,.80]],.036,.008),K.lame,0,0,0,t,0,0);}
    for(let k=0;k<6;k++)BXg(B,K.alu,-1.22,Math.cos(k/6*2*PI10)*.18,Math.sin(k/6*2*PI10)*.18,k/6*2*PI10,0,0,.03,.34,.03);
    TX(B,K.chrome,[[.40,0],[.38,.10],[.44,.30],[.56,.54]],-1.18,0,0,PI10,32);TX(B,K.glow,[[.001,0],[.36,0],[.36,.02]],-1.20,0,0,0,24);
    ech=[-1.78,0,0];break;}
  case 22:{ // PULSORÉACTEUR — LE CŒUR QUI BAT : une tête hexagonale à pétales-clapets, un tube fin que des ondes de rings élargissent
    TX(B,K.colD,[[.001,0],[.50,0],[.54,.03],[.54,.34],[.001,.34]],.55,0,0,0,6);
    B.add(tourX([[.001,0],[.46,0],[.46,.02],[.001,.02]],6),K.noir,.89,0,0,0,0,0);
    pales10(B,K.or,12,.07,.42,.05,.014,.92,.55,0);pales10(B,K.chrome,12,.10,.44,.05,.014,.935,-.55,PI10/12);
    B.add(G10.sph,K.chrome,.95,0,0,0,0,0,.09,.09,.09);
    TX(B,K.chrome,[[.13,0],[.13,1.7]],-1.15,0,0,0,24);
    const rk=[.30,.18,.10,.04,-.03,-.09,-.14,-.19,-.23,-.27];
    for(let k=0;k<rk.length;k++){const x=.30-k*.17+.0,R=.19+k*.045;ANN(B,k%2?K.chrome:K.col,R,.04,x,0,0);ANN(B,K.haloF,R,.014,x-.04,0,0);}
    TX(B,K.chrome,[[.18,0],[.26,.10],[.46,.40]],-1.15,0,0,PI10,28);TX(B,K.haloF,[[.001,0],[.36,.14],[.001,.48]],-1.2,0,0,PI10,18);
    ech=[-1.70,0,0];break;}
  case 23:{ // RÉACTEUR NUCLÉAIRE — LA CUVE : dix-neuf barreaux incandescents dans un verre, un dôme laqué, une queue d'ailettes
    TX(B,K.verre,[[.64,0],[.64,1.35]],-.70,0,0,0,40);
    TX(B,K.chrome,[[.001,0],[.68,0],[.68,.10],[.001,.10]],-.78,0,0,0,40);
    const hx=[[0,0]];for(let k=0;k<6;k++){const t=k/6*2*PI10;hx.push([Math.cos(t)*.17,Math.sin(t)*.17]);hx.push([Math.cos(t)*.34,Math.sin(t)*.34]);hx.push([Math.cos(t+PI10/6)*.46,Math.sin(t+PI10/6)*.46]);}
    for(const p of hx){BAR(B,K.glow,.045,-.70,.62,p[0],p[1]);B.add(G10.cyl14,K.or,.66,p[0],p[1],0,0,PI10/2,.06,.06,.06);}
    ANN(B,K.or,.645,.034,-.35,0,0);ANN(B,K.or,.645,.034,.0,0,0);ANN(B,K.or,.645,.034,.35,0,0);
    const dm=[];for(let k=0;k<=8;k++){const t=k/8*PI10/2;dm.push([.68*Math.cos(t),.68*Math.sin(t)]);}
    TX(B,K.col,dm,.66,0,0,0,40);
    for(let k=0;k<6;k++){const t=k/6*2*PI10;BAR(B,K.chrome,.03,.66,1.12,Math.cos(t)*.14,Math.sin(t)*.14);}
    for(let k=0;k<9;k++)TX(B,k%2?K.chrome:K.alu,[[.001,0],[.74-k*.02,0],[.74-k*.02,.025],[.001,.025]],-1.00-k*.08,0,0,0,36);
    ANN(B,K.haloF,.50,.05,-1.78,0,0);
    ech=[-1.9,0,0];break;}
  case 24:{ // CŒUR À FUSION — LE TOKAMAK : un tore laqué cerclé de quatorze bobines d'or, son plasma, une étoile au centre
    const TL=.55,ct=Math.cos(TL),st2=Math.sin(TL),tl=(x,y,z)=>[x,y*ct-z*st2,y*st2+z*ct];
    B.add(new THREE.TorusGeometry(.66,.22,18,48),K.colD,0,0,0,TL,0,0);
    B.add(new THREE.TorusGeometry(.66,.13,12,48),K.haloF,0,0,0,TL,0,0);
    B.add(new THREE.TorusGeometry(.66,.03,8,48),K.chrome,0,0,0,TL,0,0);
    const bob=new THREE.TorusGeometry(.265,.034,8,24);bob.rotateY(PI10/2);
    for(let k=0;k<14;k++){const t=k/14*2*PI10,p=tl(Math.cos(t)*.66,Math.sin(t)*.66,0),tg=new THREE.Vector3(...tl(-Math.sin(t),Math.cos(t),0));
      vers10(B,bob,K.or,new THREE.Vector3(p[0],p[1],p[2]),tg,1);}
    B.add(sphN10(.17),K.blanc,0,0,0);B.add(sphN10(.32,16),K.haloF,0,0,0);
    for(let k=0;k<3;k++){const t=k/3*2*PI10+.5,p=tl(Math.cos(t)*.66,Math.sin(t)*.66,0);BAR(B,croute,.07,-.60,p[0],p[1],p[2]);}
    TX(B,K.chrome,[[.12,0],[.16,.10],[.30,.40],[.46,.70]],-.55,0,0,PI10,24);
    for(let k=0;k<8;k++){const t=rnd()*6.28,r2=.95+rnd()*.35;eclat9(g,croute,rnd,(rnd()-.5)*.9,Math.cos(t)*r2,Math.sin(t)*r2*.7,.05+rnd()*.05);}
    ech=[-1.2,0,0];break;}
  case 25:{ // ANTIMATIÈRE — LE NÉGATIF : une sphère noire dans trois anneaux croisés, douze aiguilles d'or, quatre cristaux
    B.add(sphN10(.34,26),K.noir,0,0,0);B.add(sphN10(.42,20),K.haloC,0,0,0);
    const rg=[[.62,0,0],[.74,PI10/3,0],[.86,-PI10/3,PI10/2]];
    for(let k=0;k<3;k++){const r=rg[k];B.add(new THREE.TorusGeometry(r[0],.036,10,56),k===1?K.or:K.chrome,0,0,0,r[1],PI10/2+r[2]*.5,0);
      B.add(new THREE.TorusGeometry(r[0],.012,6,56),K.haloF,0,0,0,r[1],PI10/2+r[2]*.5,0);
      for(let j=0;j<3;j++){const t=j/3*2*PI10;B.add(G10.sph,K.glow,Math.cos(t)*r[0]*.0,Math.sin(t)*r[0],Math.cos(t)*r[0],0,0,0,.05,.05,.05);}}
    for(const d of dirs10(12))vers10(B,cone10(.034,.52,8),K.or,d.clone().multiplyScalar(.36),d,1);
    for(let k=0;k<4;k++){const t=k/4*2*PI10+.78;B.add(new THREE.OctahedronGeometry(.13,0),K.verre,0,Math.cos(t)*.98,Math.sin(t)*.98,t,0,0,1,1.8,1);}
    TX(B,K.chrome,[[.06,0],[.10,.20],[.22,.70]],-.34,0,0,PI10,18);TX(B,K.haloF,[[.001,0],[.18,.2],[.001,.9]],-.50,0,0,PI10,14);
    ech=[-1.35,0,0];break;}
  case 26:{ // MOTEUR À DISTORSION — LE TUNNEL : sept cerceaux dont la taille respire, une hélice de lumière, une nacelle fuselée
    const R=[.30,.46,.62,.78,.62,.46,.30];
    for(let k=0;k<7;k++){const x=-1.08+k*.36;B.add(new THREE.TorusGeometry(R[k],.04+.01*(k===3),10,48),k%2?K.chrome:K.col,x,0,0,0,PI10/2,0);
      B.add(new THREE.TorusGeometry(R[k],.014,6,48),K.haloF,x,0,0,0,PI10/2,0);
      for(let j=0;j<3;j++){const t=j/3*2*PI10+k*.3;B.add(G10.cyl6,K.or,x,Math.cos(t)*R[k],Math.sin(t)*R[k],0,0,0,.03,.12,.03);}}
    for(let h=0;h<2;h++)B.add(helix10(.50,-1.08,1.08,3.2,h*PI10,.016,6),K.haloF,0,0,0);
    TX(B,K.chrome,[[.001,0],[.10,.10],[.19,.40],[.20,.80],[.11,1.12],[.04,1.30]],-.72,0,0,0,26);
    TX(B,K.glow,[[.001,0],[.10,.04],[.001,.12]],-.74,0,0,PI10,16);
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[-.5,0],[.5,0],[.25,.16],[-.5,.07]],.014,.004),K.or,-.15,sd*.20,0,sd>0?0:PI10,0,0);
    ech=[-1.55,0,0];break;}
  case 27:{ // COMÈTE — UN NOYAU DE ROCHE ET SA QUEUE : trois cônes de feu emboîtés, une nuée d'éclats qui se resserre, un anneau d'or
    const co=new THREE.Mesh(eroder9(new THREE.IcosahedronGeometry(.40,2),.22,2.5,27),croute);co.position.set(.60,0,0);g.add(co);
    B.add(sphN10(.30,16),K.haloF,.60,0,0);
    B.add(cone10(.46,2.1,24),K.haloF,.60,0,0,0,PI10,0);B.add(cone10(.34,1.7,24),K.haloC,.60,0,0,0,PI10,0);B.add(cone10(.20,1.3,20),K.halo(0xffffff,.45),.60,0,0,0,PI10,0);
    for(let k=0;k<26;k++){const x=-.10-rnd()*1.5,rad=(.12+(.60-x)*.12)*rnd(),t=rnd()*6.28;
      eclat9(g,croute,rnd,x,Math.cos(t)*rad,Math.sin(t)*rad,.035+rnd()*.06*(1-(.1-x)/1.6));}
    ANN(B,K.or,.58,.030,.60,0,0,.5,PI10/2);ANN(B,K.chrome,.50,.020,.30,0,0);
    ech=[-1.6,0,0];break;}
  case 28:{ // SUPERNOVA — L'INSTANT FIGÉ : un cœur blanc, vingt-huit épines polies, trois ondes de choc inclinées, des éclats en orbite
    B.add(sphN10(.30,22),K.blanc,0,0,0);B.add(sphN10(.46,18),K.haloF,0,0,0);B.add(sphN10(.64,16),K.haloC,0,0,0);
    const dd=dirs10(44);for(let k=0;k<dd.length;k++)vers10(B,cone10(.07,k%2?.78:1.10,10),k%3?K.or:K.chrome,dd[k].clone().multiplyScalar(.30),dd[k],1);
    for(let k=0;k<3;k++){B.add(new THREE.TorusGeometry(.88+k*.14,.016,6,56),K.haloF,0,0,0,k*.8,PI10/2+k*.5,0);}
    for(let k=0;k<10;k++){const d=dd[(k*2+1)%dd.length];eclat9(g,croute,rnd,d.x*1.25,d.y*1.25,d.z*1.25,.06+rnd()*.05);}
    ech=[-1.5,0,0];break;}
  case 29:{ // TROU NOIR — LA SINGULARITÉ : une bille d'encre, un disque d'accrétion à dix anneaux, un anneau de photons, deux jets, une cage
    B.add(sphN10(.40,30),K.noir,0,0,0);
    for(let k=0;k<16;k++){const t=k/15,R=.50+t*.80,c=[0xffffff,0xfff8e0,0xfff2c0,0xffe2a0,0xffd780,0xffc060,0xffb050,0xff9a44,0xff8a3c,0xff6a48,0xff5a50,0xf04a80,0xe03ca0,0xb02ac8,0x7a22c8,0x401890][k];
      B.add(new THREE.TorusGeometry(R,.05+.02*t,6,56),K.halo(c,.66-.2*t),0,0,0,1.0,0,0,1,1,.28);}
    B.add(new THREE.TorusGeometry(.44,.012,6,56),K.blanc,0,0,0,1.0,0,0);
    B.add(cone10(.10,2.1,14),K.haloC,.30,0,0,0,0,0);B.add(cone10(.10,2.1,14),K.haloC,-.30,0,0,0,PI10,0);B.add(cone10(.04,2.3,10),K.blanc,.30,0,0,0,0,0);B.add(cone10(.04,2.3,10),K.blanc,-.30,0,0,0,PI10,0);
    for(let k=0;k<4;k++){const t=k/4*2*PI10+.78;BAR(B,K.chrome,.018,-.6,.6,Math.cos(t)*1.05,Math.sin(t)*1.05);B.add(G10.sph,K.or,-.6,Math.cos(t)*1.05,Math.sin(t)*1.05,0,0,0,.05,.05,.05);B.add(G10.sph,K.or,.6,Math.cos(t)*1.05,Math.sin(t)*1.05,0,0,0,.05,.05,.05);}
    ech=[-1.6,0,0];break;}
  }
  const NP={18:4,19:5,20:6,21:6,22:7,23:8,24:8,25:9,26:10};          // la grappe de propulseurs grossit palier après palier
  if(NP[i])prop10(B,K,ech[0]+.55,0,0,i>=24?.62:.46,NP[i],i>=24?1.15:.9);
  B.fin(g);
  g.userData.echap={p:ech,d:[-1,0,0]};
}
