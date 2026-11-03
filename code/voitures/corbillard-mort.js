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
    b:{g:'s',c:0xb0a07e,f:0},B:{g:'s',c:0x6e6048,f:0},N:{g:'m',c:0x0a0806,f:0},A:{g:'c',c:0xc9a45a},c:{g:'c',c:0xe9ecf0},
    W:{g:'l',c:0xe8f4ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xffffff}});   /* Q : la place de la plaque (plqDessinee) */                               /* b : l'os, B : l'os dans l'ombre (sutures, dents du fond), A : le laiton du cercueil */
  const AR=[[0,2*R+.06],[R*.70,2*R+.02],[R+.06,R*1.18],[R+.18,.40]];
  const FA=2.95,zs=[-2.95,-2.85,-2.60,-.30,.10,1.00,ZC,2.85,FA];   /* FA : la face avant */
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.06,R+.18])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const xW=z=>U.lin([[-2.95,.74],[-2.85,.80],[.90,1.00],[1.10,1.00],[2.85,.93],[FA,.88]],z),        /* l'hexagone du cercueil */
        yC=z=>U.lin([[-2.95,1.20],[-2.85,1.34],[-2.60,1.42],[.10,1.44],[1.00,1.16],[2.85,1.14],[FA,1.10]],z);   /* (v6) le long capot plat de limousine */
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),xw=xW(z),c=yC(z);
    return [[0,yb],[xw-.06,yb],[xw,Math.max(yb+.06,.42)],[xw,Math.max(yb+.10,.98)],[xw+.035,Math.max(yb+.11,1.00)],[xw+.035,1.06],[xw-.01,1.07],
            [xw*.86,Math.max(1.08,c-.06)],[xw*.70,c],[0,c+.01]];
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
  /* L'AVANT DE LIMOUSINE (2026-11-01, Léo : « comme une Rolls-Royce sur le devant… le plus stylé et réussi ») : plus de crâne géant.
     La haute CALANDRE-TEMPLE en chrome (cadre épais, lames verticales, fronton), deux phares fins en lame, le bouclier à lame chromée ;
     et la mort en MASCOTTE : un crâne chromé aux ailes déployées, au bout de la colonne vertébrale qui court sur le capot. */
  {const zf=FA+.002,gx=.34,gb=.44,gh=1.08,gz=.11;
   P.box('N',gx*2,gh-gb,gz,0,(gb+gh)/2,zf+gz/2-.03);                                                  /* le fond noir de la calandre */
   for(let i=0;i<11;i++){const x=(i/10-.5)*(gx*2-.12);P.box('c',.022,gh-gb-.04,.05,x,(gb+gh)/2,zf+gz*.55);}  /* les lames verticales */
   for(const sd of [-1,1])P.box('c',.055,gh-gb+.04,gz+.03,sd*gx,(gb+gh)/2,zf+gz/2);                  /* les montants du cadre */
   P.box('c',gx*2+.11,.05,gz+.03,0,gb-.005,zf+gz/2);                                                  /* le seuil */
   P.box('c',gx*2+.13,.06,gz+.05,0,gh+.02,zf+gz/2-.005);P.box('c',gx*2+.05,.03,gz,0,gh+.065,zf+gz/2-.02);  /* le fronton, en deux marches */
   P.cyl('K',.035,.012,10,0,gh-.06,zf+gz+.01,'z');P.cyl('c',.026,.016,10,0,gh-.06,zf+gz+.012,'z');  /* le médaillon */
   P.sym(sd=>{
     P.box('K',.40,.075,.04,sd*.66,.95,FA+.01,0,0,-sd*.04);P.box('W',.36,.022,.045,sd*.66,.945,FA+.012,0,0,-sd*.04);  /* le phare en lame */
     P.box('W',.20,.012,.045,sd*.68,.885,FA+.012);                                                     /* le feu de jour, dessous */
     P.box('K',.24,.10,.03,sd*.62,.56,FA+.005);P.box('c',.24,.012,.035,sd*.62,.61,FA+.008);            /* la prise d'air basse */
   });
   P.box('c',1.72,.035,.08,0,.47,FA+.03);P.box('K',1.60,.06,.04,0,.40,FA+.01);                        /* la lame chromée du bouclier */
  }
  /* LA MASCOTTE : le crâne ailé, en chrome, sur son socle au-dessus du fronton */
  {const mz=FA-.04,my=1.36,ms=1.9;
   P.box('c',.10,.04,.10,0,1.13,mz);P.cyl('c',.03,.12,8,0,1.20,mz,'y');
   P.put('c',new THREE.IcosahedronGeometry(1,1),0,my,mz,0,0,0,.062*ms,.058*ms,.072*ms);                        /* la voûte */
   P.box('c',.075*ms,.045*ms,.05*ms,0,my-.055*ms,mz+.025*ms);                                                        /* la mâchoire */
   for(const sd of [-1,1])P.put('N',new THREE.IcosahedronGeometry(.019*ms,0),sd*.026*ms,my-.004*ms,mz+.058*ms);  /* les orbites */
   P.put('N',new THREE.IcosahedronGeometry(.011*ms,0),0,my-.03*ms,mz+.066*ms);                                 /* le nez */
   for(const sd of [-1,1]){const pts=[[0,0],[.08,.035],[.16,.085],[.23,.15],[.215,.105],[.19,.10],[.20,.07],[.16,.06],[.17,.035],[.12,.025],[.12,0],[.07,-.005],[.03,-.02]];
     const sh=new THREE.Shape(pts.map(q=>new THREE.Vector2(sd*q[0]*ms,q[1]*ms))),g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false,curveSegments:1});
     g.translate(0,0,-.006);P.put('c',g,sd*.045*ms,my-.01*ms,mz-.02*ms,0,sd*.85,0);}}                          /* les ailes, balayées vers l'arrière */
  os([-.78,.30,-3.00],[.78,.30,-3.00],.07,.075);P.box('Q',.52,.13,.01,0,.47,-2.955);   /* la plaque se pose sous les os en croix */
  /* LA COLONNE : du coccyx (la poupe) au crâne, sur le toit, le pare-brise et le capot */
  for(let z=-2.80;z<FA-.20;z+=.19){const y=yC(z)+.035,pe=z<-2.5?.6:1;
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
  return {hl:[.66,.95,2.97],tl:[.64,.80,-2.97],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe6dcc4}};
};}
