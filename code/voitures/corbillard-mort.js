/* ===== LE CORBILLARD DE LA MORT (2026-11-01, Léo : « refonte, c pas satisfaisant, ça doit rappeler la mort » — cercueil roulant + crâne à l'avant + squelette apparent) =====
   La caisse EST un cercueil : vue de dessus, l'hexagone du cercueil (étroit aux pieds, large aux épaules, la tête vers l'avant) ;
   de profil, le coffre droit, le rebord du couvercle (un jonc de laiton qui fait le tour) et le couvercle à pans coupés.
   La tête du cercueil est un CRÂNE en os : orbites noires où brillent les phares, cavité du nez, rangée de dents, arcades qui froncent.
   Le SQUELETTE dépasse : les côtes enserrent le salon (une vitre noire, le vide), la colonne vertébrale court du coccyx au crâne
   en passant sur le toit et le capot ; un fémur sert de pare-chocs à chaque bout ; trois poignées de cercueil en laiton par flanc.
   `?corbillard=ancien` = le corbillard d'avant · `dbgCorbillard(1)` le remet à chaud (le banc AVANT | APRÈS). */
var CORBILLARD_MORT=!/[?&]corbillard=ancien\b/.test(location.search);
window.dbgCorbillard=function(ancien){CORBILLARD_MORT=!ancien;return CORBILLARD_MORT;};
{const ancien=SHAPES.d_corbillard;
SHAPES.d_corbillard=function(K){
  if(!CORBILLARD_MORT)return ancien(K);
  const U=LPU,R=.40,ZF=1.76,ZR=-1.98,ZC=2.38;                                 /* ZC : où finit le cercueil et commence le crâne */
  const P=K.kit({p:{g:'p',c:0x0d0d10},k:{g:'m',c:0x141518},K:{g:'g',c:0x050507},V:{g:'g',c:0x030304},g:{g:'g',c:0x16202a},
    b:{g:'s',c:0xbfae88,f:0},B:{g:'s',c:0x6e6048,f:0},N:{g:'m',c:0x0a0806,f:0},A:{g:'c',c:0xc9a45a},
    W:{g:'l',c:0xe8f4ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xffffff}});   /* Q : la place de la plaque (plqDessinee) */                               /* b : l'os, B : l'os dans l'ombre (sutures, dents du fond), A : le laiton du cercueil */
  const AR=[[0,2*R+.06],[R*.70,2*R+.02],[R+.06,R*1.18],[R+.18,.40]];
  const zs=[-2.95,-2.85,-2.60,-.30,.10,1.00,ZC-.04,ZC];
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.06,R+.18])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const xW=z=>U.lin([[-2.95,.74],[-2.85,.80],[.90,1.00],[1.10,1.00],[ZC,.92]],z),        /* l'hexagone du cercueil */
        yC=z=>U.lin([[-2.95,1.20],[-2.85,1.34],[-2.60,1.42],[.10,1.44],[1.00,1.16],[ZC,1.12]],z);   /* le crâne bombe au-dessus du capot */
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),xw=xW(z),c=yC(z),cr=false;   /* devant les roues, la MÂCHOIRE descend ; le crâne s'arrondit (pans plus coupés) */
    return [[0,yb],[xw-.06,yb],[xw,Math.max(yb+.06,.42)],[xw,Math.max(yb+.10,.98)],[xw+.035,Math.max(yb+.11,1.00)],[xw+.035,1.06],[xw-.01,1.07],
            [xw*(cr?.80:.86),Math.max(1.08,c-(cr?.10:.06))],[xw*(cr?.52:.70),c],[0,c+.01]];
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===4)return 'A';                                                        /* le jonc de laiton du couvercle */
    if((j===7||j===8)&&z>.10&&z<1.00)return 'g';                               /* le pare-brise */
    if(j===6&&z>-.15&&z<.95)return 'g';                                         /* la vitre de portière */
    if(j===6&&z>-2.55&&z<-.30)return 'V';                                       /* le salon : le vide noir derrière les côtes */
    return 'p';});
  const V3=THREE.Vector3,AXZ=new V3(0,0,1);
  const barre=(k,a,b,t)=>{const v=new V3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=v.length();if(L<1e-4)return;     /* une tige carrée d'un point à l'autre */
    const g=new THREE.BoxGeometry(t,t,L+t*.6);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(AXZ,v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  const rotule=(k,r,x,y,z)=>P.put(k,new THREE.IcosahedronGeometry(r,0),x,y,z); /* une tête d'os, à facettes */
  const os=(a,b,t,r)=>{barre('b',a,b,t);for(const p of [a,b])for(const s of [-1,1])rotule('b',r,p[0],p[1]+s*r*.55,p[2]);}; /* un os long : le fût et ses deux têtes doubles */
  /* LE CRÂNE v3 (2026-11-01, Léo : « creux dans les yeux sans cœur, refonte totale du crâne ») : un ELLIPSOÏDE à facettes déformé
     — la voûte ronde qui recouvre le bout du capot, la face aplatie, les tempes creusées, les pommettes qui saillent, la mâchoire qui
     s'affine jusqu'au menton — sur une grille (θ du haut vers le bas, φ autour, 0 = devant) dont les lignes tombent sur les bords des trous.
     Les orbites et le nez sont de VRAIS CREUX : leurs cases sont ouvertes et un entonnoir noir à facettes plonge du bord vers le fond ;
     les coins du bord rentrent (l'orbite devient un octogone, le nez une poire renversée). Une fente de bouche, deux rangées de dents. */
  const CX=0,CY=.92,CZ=2.30,RX=.78,RY=.62,RZ=.66,dg=Math.PI/180;
  const TH=[0,16,30,44,56,68,80,92,104,116,128,134,142,152,164,180],
        PH=[-180,-150,-120,-95,-70,-55,-41,-27,-13,-8,0,8,13,27,41,55,70,95,120,150];
  const NT=TH.length,NP=PH.length,V=[];
  for(let i=0;i<NT;i++){V.push([]);for(let j=0;j<NP;j++){const t=TH[i]*dg,f=PH[j]*dg,af=Math.abs(PH[j]);
    let x=Math.sin(t)*Math.sin(f)*RX,y=Math.cos(t)*RY,z=Math.sin(t)*Math.cos(f)*RZ;
    if(TH[i]>=56&&TH[i]<=134&&af<=70)z=Math.min(z,RZ*.90);                                           /* la face, aplatie */
    if(af>=70&&af<=120&&TH[i]>=68&&TH[i]<=116)x*=.90;                                                 /* les tempes */
    if(af>=41&&af<=70&&TH[i]>=104&&TH[i]<=128)x*=1.08;                                                /* les pommettes */
    if(TH[i]>116){const k=Math.min(1,(TH[i]-116)/50);x*=1-.40*k;if(af<=70)z+=.06*k;}               /* la mâchoire s'affine, le menton avance */
    if(TH[i]===80&&af>=13&&af<=41)z+=.035;                                                            /* l'arcade au-dessus de l'orbite */
    V[i].push([CX+x,CY+y,CZ+z]);}}
  const iT=d=>TH.indexOf(d),iP=d=>PH.indexOf(d),
        trou=(i,j)=>{const t0=TH[i],t1=TH[i+1],p0=PH[j],p1=PH[(j+1)%NP];if(j===NP-1)return false;
          if(t0>=80&&t1<=104&&Math.abs(p0)>=13&&Math.abs(p1)>=13&&Math.abs(p0)<=41&&Math.abs(p1)<=41&&p0*p1>0)return true;   /* les orbites */
          if(t0>=104&&t1<=128&&p0>=-8&&p1<=8)return true;                                             /* le nez */
          return false;};
  const rentre=(i,j,c,k)=>{const v=V[i][j];for(let a=0;a<3;a++)v[a]+=(c[a]-v[a])*k;};
  const creux=(ti,pj,prof,cle9,coins,haut)=>{                                                         /* un trou : 8 sommets autour du centre (ti,pj), l'entonnoir */
    const c=V[ti][pj].slice(),R=[[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]];
    for(const [a,b] of R)if(a&&b)rentre(ti+a,pj+b,c,coins);
    if(haut)for(const b of [-1,1])rentre(ti-1,pj+b,c,haut);                                           /* la poire du nez : le haut plus étroit */
    const n=[c[0]-CX,(c[1]-CY)*.3,c[2]-CZ],l=Math.hypot(n[0],n[1],n[2]),fond=[c[0]-n[0]/l*prof,c[1]-n[1]/l*prof,c[2]-n[2]/l*prof];
    for(let k=0;k<8;k++){const A=V[ti+R[k][0]][pj+R[k][1]],B=V[ti+R[(k+1)%8][0]][pj+R[(k+1)%8][1]];
      const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],w=[fond[0]-A[0],fond[1]-A[1],fond[2]-A[2]],
            nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
      if(nn[0]*n[0]+nn[1]*n[1]+nn[2]*n[2]>0)P.tri(cle9,A,B,fond);else P.tri(cle9,A,fond,B);}};
  creux(iT(92),iP(27),.30,'N',.32,0);creux(iT(92),iP(-27),.30,'N',.32,0);
  creux(iT(116),iP(0),.20,'N',.10,.55);
  for(let i=0;i<NT-1;i++)for(let j=0;j<NP;j++){if(trou(i,j))continue;const j2=(j+1)%NP,a=V[i][j],b=V[i][j2],c=V[i+1][j2],d=V[i+1][j];
    const bouche=TH[i]===134&&Math.abs(PH[j])<41&&Math.abs(PH[j2])<41;
    P.tri(bouche?'N':'b',a,c,b);P.tri(bouche?'N':'b',a,d,c);}
  /* les dents : une rangée sur chaque lèvre de la fente, posées sur la courbe de la mâchoire */
  for(const [t9,dy] of [[133,-.028],[143,.028]])for(let f9=-33;f9<=33;f9+=11){
    const t=t9*dg,f=f9*dg,k=Math.min(1,(t9-116)/50),x=Math.sin(t)*Math.sin(f)*RX*(1-.40*k),y=Math.cos(t)*RY+dy,
          z=Math.min(Math.sin(t)*Math.cos(f)*RZ,RZ*.90)+.06*k;
    P.box(Math.abs(f9)>22?'B':'b',.075,.06,.05,CX+x,CY+y,CZ+z-.01,0,f,0);}
    /* LES OS EN CROIX derrière le crâne : leurs têtes dépassent de chaque côté */
  for(const s9 of [-1,1]){const a=[s9*-1.04,.22,ZC+.14],b=[s9*1.04,.98,ZC+.14];barre('b',a,b,.075);for(const p9 of [a,b])for(const t of [-1,1])rotule('b',.065,p9[0],p9[1]+t*.045,p9[2]);}
  os([-.78,.30,-3.00],[.78,.30,-3.00],.07,.075);P.box('Q',.52,.13,.01,0,.47,-2.955);   /* la plaque se pose sous les os en croix */
  /* LA COLONNE : du coccyx (la poupe) au crâne, sur le toit, le pare-brise et le capot */
  for(let z=-2.80;z<ZC-.05;z+=.19){const y=yC(z)+.035,pe=z<-2.5?.6:1;
    P.box('b',.11*pe,.06,.11,0,y,z);P.box('B',.12*pe,.02,.13,0,y-.035,z);                                               /* la vertèbre et son disque */
    P.box('b',.03,.07*pe,.05,0,y+.06,z-.02,-.5,0,0);                                                                     /* l'épine */
    if(z<.10&&z>-2.6)P.box('b',.26,.025,.035,0,y+.01,z);}                                                                /* les apophyses */
  /* LES CÔTES qui enserrent le salon, de la ceinture à la colonne */
  for(let i=0;i<7;i++){const z=-2.40+i*.30,xw=xW(z),c=yC(z),dz=.10;
    P.sym(sd=>{const p=[[sd*(xw+.045),1.075,z],[sd*(xw*.90+.03),(1.08+c)/2+.02,z+dz*.4],[sd*(xw*.80+.03),c-.02,z+dz*.7],[sd*(xw*.62),c+.035,z+dz*.9],[sd*.07,c+.04,z+dz]];
      for(let k=0;k<p.length-1;k++)barre('b',p[k],p[k+1],.05);});}
  /* LES POIGNÉES DU CERCUEIL, trois par flanc, et la plaque de laiton aux pieds */
  P.sym(sd=>{
    for(const z of [-1.15,-.35,.45]){const x=xW(z);P.box('A',.07,.05,.04,sd*(x+.03),.66,z-.13);P.box('A',.07,.05,.04,sd*(x+.03),.66,z+.13);
      P.cyl('A',.022,.32,6,sd*(x+.07),.62,z,'z');}
    P.box('K',.08,.40,.03,sd*.64,.80,-2.955);P.box('L',.06,.36,.03,sd*.64,.80,-2.965);                                  /* les feux, deux cierges rouges */
  });
  for(const s of [-1,1]){const a=[s*-.42,.64,-2.99],b=[s*.42,1.10,-2.99];barre('b',a,b,.065);for(const p of [a,b])for(const t of [-1,1])rotule('b',.055,p[0]+t*.04,p[1],p[2]);} /* les DEUX OS EN CROIX, aux pieds du cercueil */
  K.commit(P);
  return {hl:[.28,.86,2.80],tl:[.64,.80,-2.97],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe6dcc4}};
};}
