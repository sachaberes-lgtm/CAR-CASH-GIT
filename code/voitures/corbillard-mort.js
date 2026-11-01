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
    W:{g:'l',c:0xe8f4ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xffffff},E:{g:'m',c:0x1a1030},I:{g:'l',c:0xff3f8e}});   /* E, I : l'œil kawaii (le grand noir, le CŒUR rose qui brille) */   /* Q : la place de la plaque (plqDessinee) */                               /* b : l'os, B : l'os dans l'ombre (sutures, dents du fond), A : le laiton du cercueil */
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
  /* LE CRÂNE v2 (2026-11-01, Léo : « le crâne ça va pas comparé au reste, refonte ») : un VOLUME sculpté, plus un dessin sur une boîte.
     Une coque à facettes posée sur la tête du cercueil (z = ZC) : un champ de relief sur une grille (s, y) où la silhouette (wY) fait
     le crâne de face — voûte ronde, tempes, pommettes larges, mâchoire étroite — et la profondeur (dY) son profil — front, arcades, face, menton.
     Les orbites, le nez et la bouche sont CREUSÉS dans la coque (vrais creux, os sombre au bord, noir au fond) ; les dents s'y posent. */
  const ZB=1.90;                                                                                       /* le plan du dos du crâne : la voûte recouvre le bout du capot */
  const wY=y=>U.lin([[.16,.26],[.24,.38],[.30,.46],[.36,.50],[.42,.50],[.48,.58],[.54,.74],[.62,.78],[.70,.75],[.79,.73],[.97,.78],[1.12,.82],[1.28,.78],[1.40,.66],[1.50,.42],[1.55,.04]],y),   /* (v3, « plus propre, réel ») la mandibule, le maxillaire étroit, les pommettes, les tempes, la voûte */
        dY=y=>U.lin([[.16,.55],[.24,.92],[.36,1.00],[.48,1.02],[.56,1.05],[.70,.98],[.88,1.00],[1.05,1.05],[1.15,.98],[1.28,.86],[1.40,.64],[1.50,.36],[1.55,0]],y);
  /* une grille LARGE (les grosses facettes du jeu) dont les lignes tombent sur les bords des orbites, du nez et de la bouche :
     on creuse en enfonçant les sommets intérieurs — orbites et nez taillés à facettes, nets */
  const XS=[-.80,-.70,-.62,-.52,-.42,-.32,-.22,-.12,-.05,0,.05,.12,.22,.32,.42,.52,.62,.70,.80],
        YS=[.16,.24,.30,.36,.42,.48,.54,.62,.70,.79,.88,.97,1.05,1.12,1.20,1.28,1.36,1.44,1.50,1.55];
  const dans=(v,a,b)=>v>a-1e-6&&v<b+1e-6,ds=(v,a,b)=>v>a+1e-6&&v<b-1e-6;
  const creux=(x,y)=>{const ax=Math.abs(x);let d=0;
    if(ds(ax,.12,.52)&&ds(y,.70,1.05))d+=ax===.32&&y===.88?.26:.18;                                 /* l'orbite */
    if(ax<.42-1e-6&&y===.42)d+=.08;                                                                 /* la bouche */
    if(ax===.62&&(y===.54||y===.62))d-=.06;                                                         /* la pommette */
    if(ax===.70&&dans(y,.88,1.05))d+=.05;                                                           /* la tempe */
    return d;};
  const relief=(x,y)=>Math.max(0,dY(y)*Math.pow(Math.max(0,1-(x/.80)**2),.42)-creux(x,y));
  const cle=(x0,x1,y0,y1)=>{const ax=Math.min(Math.abs(x0),Math.abs(x1)),bx=Math.max(Math.abs(x0),Math.abs(x1));
    if(dans(ax,.12,.52)&&dans(bx,.12,.52)&&dans(y0,.70,1.05)&&dans(y1,.70,1.05)){
      return 'N';}                          /* l'orbite : noire, ses coins coupés en os d'ombre */
    if(bx<.43&&dans(y0,.36,.48)&&dans(y1,.36,.48))return 'N';                                        /* la bouche */
    return 'b';};                                                                                    /* (v3) plus de bande d'ombre sur le tour : la lumière fait le volume */
  {const pt=(x,y)=>[x*wY(y)/.80,y,ZB+relief(x,y)];
   for(let r=0;r<YS.length-1;r++)for(let i=0;i<XS.length-1;i++){const y0=YS[r],y1=YS[r+1],x0=XS[i],x1=XS[i+1];
     const a=pt(x0,y0),b=pt(x1,y0),c=pt(x1,y1),d=pt(x0,y1),k=cle(x0,x1,y0,y1);P.tri(k,a,b,c);P.tri(k,a,c,d);}
   for(let i=0;i<XS.length-1;i++){const a=pt(XS[i],YS[0]),b=pt(XS[i+1],YS[0]),A2=[a[0],a[1],ZB],B2=[b[0],b[1],ZB];P.tri('B',a,A2,B2);P.tri('B',a,B2,b);}  /* le dessous du menton */
   const tour=[];for(const y of YS)tour.push([wY(y),y]);for(let r=YS.length-1;r>=0;r--)tour.push([-wY(YS[r]),YS[r]]);
   const o=[0,.85,ZB];for(let i=0;i<tour.length-1;i++){const a=tour[i],b=tour[i+1];P.tri('B',o,[b[0],b[1],ZB],[a[0],a[1],ZB]);}}  /* le dos du crâne, fermé */
  {const sur=(x,y)=>[x*wY(y)/.80,y,ZB+relief(x,y)+.008],c9=sur(0,.625),                               /* (v3) le nez : un petit cœur renversé, net, posé sur la face */
     nz=[[0,.54],[.075,.62],[.07,.67],[.04,.695],[0,.67],[-.04,.695],[-.07,.67],[-.075,.62]].map(p=>sur(p[0],p[1]));
   for(let i=0;i<nz.length;i++)P.tri('N',c9,nz[i],nz[(i+1)%nz.length]);}
  /* LES YEUX KAWAII (2026-11-01, Léo : « les yeux du crâne plus kawaii ») : un grand œil rond qui remplit l'orbite, penché comme la face,
     noir profond, une lueur violette en bas et deux reflets blancs (le gros en haut à gauche, le petit en bas à droite, pareils sur les deux yeux) */
  P.sym(sd=>{const th=sd*.49,cx=sd*.30,cy=.875,cz=ZB+.86,co=Math.cos(th),si=Math.sin(th);
    const disque=(k,r,dx,dy,dz)=>{const g=new THREE.CylinderGeometry(r,r,.012,14);g.rotateX(Math.PI/2);
      P.put(k,g,cx+dx*co+dz*si,cy+dy,cz-dx*si+dz*co,0,th,0);};
    disque('E',.168,0,0,0);
    /* (Léo : « avec des cœurs dans les yeux ») le cœur rose à la place de l'iris, et son reflet */
    {const sh=new THREE.Shape(),n=24;for(let i=0;i<n;i++){const t=i/n*Math.PI*2,x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
       const v=new THREE.Vector2(x*.0072,y*.0072+.012);if(i)sh.lineTo(v.x,v.y);else sh.moveTo(v.x,v.y);}
     const g=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false,curveSegments:1}),dz=.008;
     P.put('I',g,cx+dz*si,cy,cz+dz*co,0,th,0);}
    disque('W',.034,-.055,.05,.024);disque('W',.016,.03,.075,.024);});                     /* au fond des orbites, les yeux qui brillent (les phares) */
  for(let r=0;r<2;r++)for(let i=0;i<7;i++){const x=(i/6-.5)*.62,y=r?.39:.45,X=x*wY(y)/.80;            /* les dents, posées dans la bouche creusée */
    P.box(Math.abs(x)>.22?'B':'b',.075,.05,.07,X,y,ZB+relief(x,.42)+.035);}
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
  return {hl:[.30,.88,2.70],tl:[.64,.80,-2.97],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe6dcc4}};
};}
