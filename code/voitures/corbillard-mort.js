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
    b:{g:'s',c:0xb0a07e,f:0},B:{g:'s',c:0x6e6048,f:0},N:{g:'m',c:0x0a0806,f:0},A:{g:'c',c:0xc9a45a},
    W:{g:'l',c:0xe8f4ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xffffff}});   /* Q : la place de la plaque (plqDessinee) */                               /* b : l'os, B : l'os dans l'ombre (sutures, dents du fond), A : le laiton du cercueil */
  const AR=[[0,2*R+.06],[R*.70,2*R+.02],[R+.06,R*1.18],[R+.18,.40]];
  const FA=2.55,zs=[-2.95,-2.85,-2.60,-.30,.10,1.00,ZC-.04,ZC,2.48,FA];   /* FA : le plan de la face (le masque se pose devant) */
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.06,R+.18])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const xW=z=>U.lin([[-2.95,.74],[-2.85,.80],[.90,1.00],[1.10,1.00],[ZC,.92],[2.48,.88],[FA,.86]],z),        /* l'hexagone du cercueil */
        yC=z=>U.lin([[-2.95,1.20],[-2.85,1.34],[-2.60,1.42],[.10,1.44],[1.00,1.16],[ZC,1.12],[2.48,1.18],[FA,1.18]],z);   /* la voûte monte au bout du capot */
  /* la section du crâne : mâchoire étroite en bas, angle de la mâchoire, pommette, tempe en pan coupé, bord de la voûte */
  const secCrane=(xw,c)=>[[0,.32],[xw*.50,.32],[xw*.82,.50],[xw,.70],[xw,.78],[xw-.01,.86],[xw-.03,.94],[xw*.90,c-.12],[xw*.60,c],[0,c+.01]];
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),xw=xW(z),c=yC(z);
    if(z>ZC+.01)return secCrane(xw,c);                                          /* (v5) la tête du cercueil DEVIENT le crâne : même nombre de points, le loft passe de l'un à l'autre */
    return [[0,yb],[xw-.06,yb],[xw,Math.max(yb+.06,.42)],[xw,Math.max(yb+.10,.98)],[xw+.035,Math.max(yb+.11,1.00)],[xw+.035,1.06],[xw-.01,1.07],
            [xw*.86,Math.max(1.08,c-.06)],[xw*.70,c],[0,c+.01]];
  },(j,z)=>{
    if(z>ZC+.01)return j===0?'B':'b';
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
  /* LE CRÂNE v5 (2026-11-01, Léo : « bcp trop rond, corriger l'aspect trop incrusté et goofy ») : plus une tête posée devant la voiture —
     le bout du cercueil EST le crâne (le loft passe de la section du cercueil à celle du crâne : le jonc devient la pommette, le couvercle la
     voûte). Sur le plan de la face (FA), un MASQUE taillé à plat : grille large, la face droite, l'arcade qui avance, la mâchoire en retrait ;
     orbites et nez CREUSÉS en entonnoir noir. Proportions d'un vrai crâne, sans grimace ; les os en croix de l'avant sont retirés. */
  {const xw=xW(FA),c=yC(FA),sc=secCrane(xw,c),bordX=y=>{for(let i=1;i<sc.length-1;i++){const a=sc[i],b=sc[i+1];if(y<=b[1]+1e-9)return a[0]+(b[0]-a[0])*U.cl((y-a[1])/Math.max(1e-6,b[1]-a[1]),0,1);}return sc[sc.length-2][0];};
   const SS=[-1,-.86,-.72,-.62,-.38,-.16,-.10,0,.10,.16,.38,.62,.72,.86,1],
         YS=[.32,.38,.44,.50,.56,.62,.72,.87,1.02,1.08,1.13,1.18],
         DY=y=>U.lin([[.32,.10],[.38,.22],[.44,.26],[.50,.27],[.56,.30],[.62,.30],[.72,.28],[.87,.25],[1.02,.36],[1.08,.31],[1.13,.20],[1.18,0]],y);
   const M=YS.map(y=>SS.map(s9=>{const a=Math.abs(s9);let r=DY(y)*Math.sqrt(Math.max(0,1-a*a*a*a));
     if(a===.72&&(y===.62||y===.56))r+=.04;                                                           /* la pommette */
     if(a===.86&&y>=.72&&y<=1.02)r-=.05;                                                               /* la tempe */
     return [s9*bordX(y),y,FA+Math.max(0,r)];}));
   const iy=y=>YS.indexOf(y),is=x=>SS.indexOf(x);
   const rentre=(i,j,cc,k)=>{const v=M[i][j];for(let q=0;q<3;q++)v[q]+=(cc[q]-v[q])*k;};
   const creux=(yi,sj,prof,coins,haut,bas)=>{const cc=M[yi][sj].slice(),R=[[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]];
     for(const [q,w] of R)if(q&&w)rentre(yi+q,sj+w,cc,coins);
     if(haut)for(const w of [-1,1])rentre(yi+1,sj+w,cc,haut);                                         /* le haut du nez, plus étroit */
     if(bas)rentre(yi-1,sj+(M[yi][sj][0]>0?1:-1),cc,0),M[yi-1][sj+(M[yi][sj][0]>0?1:-1)][1]-=bas;     /* le coin extérieur de l'orbite tombe */
     const fond=[cc[0]*.9,cc[1],cc[2]-prof];
     for(let k=0;k<8;k++){const A=M[yi+R[k][0]][sj+R[k][1]],B=M[yi+R[(k+1)%8][0]][sj+R[(k+1)%8][1]],
       u=[B[0]-A[0],B[1]-A[1]],w=[fond[0]-A[0],fond[1]-A[1]],nz=u[0]*w[1]-u[1]*w[0];
       if(nz>0)P.tri('N',A,B,fond);else P.tri('N',A,fond,B);}};
   creux(iy(.87),is(.38),.30,.28,0,.04);creux(iy(.87),is(-.38),.30,.28,0,.04);
   creux(iy(.62),is(0),.18,.10,.40,0);
   const trou=(i,j)=>{const y0=YS[i],y1=YS[i+1],s0=SS[j],s1=SS[j+1];
     if(y0>=.72-1e-9&&y1<=1.02+1e-9&&s0*s1>0&&Math.abs(s0)>=.16-1e-9&&Math.abs(s1)>=.16-1e-9&&Math.abs(s0)<=.62+1e-9&&Math.abs(s1)<=.62+1e-9)return true;
     if(y0>=.56-1e-9&&y1<=.72+1e-9&&s0>=-.10-1e-9&&s1<=.10+1e-9)return true;return false;};
   for(let i=0;i<YS.length-1;i++)for(let j=0;j<SS.length-1;j++){if(trou(i,j))continue;
     const a=M[i][j],b=M[i][j+1],cq=M[i+1][j+1],d=M[i+1][j],k=YS[i]===.44&&Math.abs(SS[j])<.62&&Math.abs(SS[j+1])<.62?'N':'b';   /* la fente de la bouche */
     P.tri(k,a,b,cq);P.tri(k,a,cq,d);}
   for(let j=0;j<SS.length-1;j++){const a=M[0][j],b=M[0][j+1];P.tri('B',a,[b[0],b[1],FA],b);P.tri('B',a,[a[0],a[1],FA],[b[0],b[1],FA]);}  /* le dessous de la mâchoire */
   for(const [y9,dy] of [[.49,0],[.445,0]])for(let t=-6;t<=6;t++){const s9=t*.075,x=s9*bordX(y9),
       r=DY(y9)*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(s9),4)));                                     /* les dents, petites et serrées */
     P.box(Math.abs(t)>3?'B':'b',.058,.042,.06,x,y9+dy,FA+r+.01);}}
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
  return {hl:[.33,.87,2.44],tl:[.64,.80,-2.97],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe6dcc4}};
};}
