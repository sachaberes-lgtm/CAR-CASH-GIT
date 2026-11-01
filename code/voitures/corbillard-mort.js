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
  const U=LPU,R=.40,ZF=1.76,ZR=-1.98,ZC=2.25;                                 /* ZC : où finit le cercueil et commence le crâne */
  const P=K.kit({p:{g:'p',c:0x0d0d10},k:{g:'m',c:0x141518},K:{g:'g',c:0x050507},V:{g:'g',c:0x030304},g:{g:'g',c:0x16202a},
    b:{g:'s',c:0xe6dcc4,f:0},B:{g:'s',c:0xb8ab8c,f:0},A:{g:'c',c:0xc9a45a},
    W:{g:'l',c:0xe8f4ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xffffff}});   /* Q : la place de la plaque (plqDessinee) */                               /* b : l'os, B : l'os dans l'ombre (sutures, dents du fond), A : le laiton du cercueil */
  const AR=[[0,2*R+.06],[R*.70,2*R+.02],[R+.06,R*1.18],[R+.18,.40]];
  const zs=[-2.95,-2.85,-2.60,-.30,.10,1.00,ZC-.04,ZC,2.45,2.62,2.80,2.90,2.95];
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.06,R+.18])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const xW=z=>U.lin([[-2.95,.74],[-2.85,.80],[.90,1.00],[1.10,1.00],[2.62,.88],[2.80,.82],[2.90,.74],[2.95,.70]],z),        /* l'hexagone du cercueil */
        yC=z=>U.lin([[-2.95,1.20],[-2.85,1.34],[-2.60,1.42],[.10,1.44],[1.00,1.16],[ZC,1.12],[2.45,1.20],[2.62,1.22],[2.80,1.17],[2.90,1.06],[2.95,.98]],z);   /* le crâne bombe au-dessus du capot */
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,z>2.40?.22:.32),xw=xW(z),c=yC(z),cr=z>ZC;   /* devant les roues, la MÂCHOIRE descend ; le crâne s'arrondit (pans plus coupés) */
    return [[0,yb],[xw-.06,yb],[xw,Math.max(yb+.06,.42)],[xw,Math.max(yb+.10,.98)],[xw+.035,Math.max(yb+.11,1.00)],[xw+.035,1.06],[xw-.01,1.07],
            [xw*(cr?.80:.86),Math.max(1.08,c-(cr?.10:.06))],[xw*(cr?.52:.70),c],[0,c+.01]];
  },(j,z)=>{
    if(j===0)return 'k';
    if(z>ZC||j===-1)return 'b';                                                 /* la tête : tout en os */
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
  /* LE CRÂNE : la face, à z = 2.95 */
  const zF=2.952;
  P.sym(sd=>{
    P.plate('K',[[sd*.10,.84],[sd*.30,.90],[sd*.52,.85],[sd*.58,.72],[sd*.48,.58],[sd*.24,.58],[sd*.10,.70]],.012,zF);  /* l'orbite */
    P.cyl('W',.04,.02,6,sd*.34,.73,zF+.012,'z');                        /* l'œil qui brille au fond */
    P.box('b',.48,.07,.10,sd*.34,.93,2.92,0,0,sd*.18);                                                                 /* l'arcade qui fronce */
    P.box('B',.14,.10,.10,sd*.62,.50,2.90,0,0,sd*.5);                                                                    /* la pommette */
  });
  P.plate('K',[[0,.56],[.09,.41],[.035,.38],[0,.40],[-.035,.38],[-.09,.41]],.012,zF);                                  /* la cavité du nez */
  P.box('K',.90,.13,.012,0,.30,zF+.004);                                                                             /* la bouche : le noir entre les dents */
  for(let r=0;r<2;r++)for(let i=0;i<9;i++){const x=(i/8-.5)*.80,h=.055-Math.abs(i/8-.5)*.02;P.box(Math.abs(x)>.30?'B':'b',.075,h,.04,x,r?.30-.004-h/2:.30+.004+h/2,zF+.02);} /* les dents */
  P.box('B',.012,.30,.012,0,1.02,2.60,-.35,0,0);P.box('B',.012,.012,.40,.18,1.10,2.55,0,.4,0);P.box('B',.012,.012,.32,-.20,1.10,2.45,0,-.3,0); /* les sutures du crâne */
  /* LES FÉMURS en pare-chocs */
  os([-.90,.19,3.04],[.90,.19,3.04],.07,.075);
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
  return {hl:[.34,.73,2.96],tl:[.64,.80,-2.97],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe6dcc4}};
};}
