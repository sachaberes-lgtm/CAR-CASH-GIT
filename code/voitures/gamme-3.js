  b_daytona:function(K){
  /* LA DAYTONA v2 (13/10, « plus ressemblante ») — la berlinette de Maranello : un nez en LAME (le bandeau de plexi
     d'une aile à l'autre), un capot très long qui monte en pente douce, l'habitacle reculé en FASTBACK (pare-brise
     couché, pavillon court, lunette qui file vers une poupe tronquée), l'ARÊTE qui court le flanc à mi-hauteur et sous
     laquelle la coque rentre, des vitres qui rentrent fort sur une coque large. */
  const U=LPU,R=.33,ZF=1.08,ZR=-1.32;
  const P=K.kit({p:{g:'p',c:0xd01a1a},n:{g:'m',c:0x121316},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xe9ecf0},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    r:{g:'l',c:0x8a0c18},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) r le cœur des feux, w la plaque éclairée — aucune famille de plus
  const AR=[[0,2*R+.04],[R*.60,2*R+.01],[R*.95,R*1.20],[R+.10,.24]];
  const ZC=.05,ZM=-1.72;
  let zs=[-2.21,-2.17,-2.10,-1.95,ZM,-1.66,-1.30,-1.26,-1.15,-.95,-.80,-.75,-.62,-.50,-.30,-.10,ZC,.08,.20,.60,1.60,1.85,2.00,2.12,2.18,2.21];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.95,R+.10])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z<=ZC&&z>=ZM;
  const T=z=>U.lin([[-2.21,.90],[-2.17,.945],[-2.00,.955],[ZM,.975],[-1.15,1.235],[-.95,1.25],[-.62,1.245],[-.50,1.225],[ZC,.885],
                    [.20,.865],[.60,.815],[ZF,.765],[1.60,.70],[2.00,.635],[2.12,.60],[2.21,.56]],z),
        yB=z=>U.lin([[-2.21,.86],[-2.10,.90],[ZM,.93],[ZR,.94],[-.60,.92],[ZC,.885],[ZF,.80],[1.70,.71],[2.00,.65],[2.12,.60],[2.21,.545]],z),
        cR=z=>U.lin([[-2.21,.66],[ZR,.70],[0,.68],[ZF,.66],[2.00,.58],[2.21,.50]],z),            // l'ARÊTE de flanc
        xW=z=>U.lin([[-2.21,.80],[-2.15,.85],[ZR,.88],[0,.87],[ZF,.88],[1.70,.865],[2.00,.80],[2.12,.72],[2.21,.62]],z),
        xR=z=>U.lin([[ZM,.42],[-1.15,.52],[-.62,.55],[-.30,.58],[ZC,.68]],z);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.24),U.lin([[-2.21,.30],[-2.0,.24],[1.80,.24],[2.21,.31]],z)),xw=xW(z),t=T(z);
    const y3=Math.max(yb+.07,cR(z)),y2=Math.max(yb+.03,Math.min(.36,y3-.12)),y4=Math.max(y3+.02,(y3+yB(z))/2),y5=Math.max(y4+.02,yB(z));
    const s=[[0,yb],[xw-.09,yb],[xw-.05,y2],[xw,y3],[xw-.02,y4],[xw-.065,y5]];
    if(cab(z)){const y6=y5+.02,y7=Math.max(y6+.04,t-.065);                          // la vitre qui rentre, le pavillon arrondi
      s.push([xw-.13,y6],[Math.min(xR(z),xw-.24),y7],[xR(z)*.5,Math.max(y7+.01,t-.016)],[0,Math.max(t,y7+.015)]);}
    else{const tt=Math.max(t,y5+.006),xc=xw-.16;                                    // le capot (ou la plage arrière), à peine bombé
      s.push([xc,Math.max(y5+.004,Math.min(tt,y5+.012))],[xc*.65,Math.max(y5+.005,tt-.01)],[xc*.30,tt-.003],[0,tt]);}
    return s;
  },(j,z)=>{
    if(j<0)return 'p';
    if(j<=1)return 'n';
    if(cab(z)){
      if(j===6&&z>-1.26&&z<-.08)return (z>-.80&&z<-.75)?'p':'g';                    // vitre de porte, custode
      if((j===7||j===8)&&z>-.50)return 'g';                                         // le pare-brise
      if((j===7||j===8)&&z<-1.15&&z>-1.66)return 'g';                               // la lunette
    }
    return 'p';});
  // LE BANDEAU DE PLEXI : noir, d'une aile à l'autre, les quatre phares derrière ; la bouche fine dessous
  P.box('K',1.10,.07,.03,0,.485,2.20);P.box('c',1.12,.012,.035,0,.525,2.20);
  P.sym(sd=>{
    P.box('K',.03,.07,.14,sd*.60,.485,2.15,0,sd*.85,0);
    for(const x of [.18,.38])P.box('W',.15,.045,.02,sd*x,.485,2.218);
    P.box('c',.20,.04,.06,sd*.44,.385,2.19);P.box('c',.05,.04,.13,sd*.57,.385,2.14,0,sd*.85,0); // butoirs chromés
    P.box('O',.07,.03,.02,sd*.44,.435,2.205);
    // la poupe tronquée : quatre feux ronds cerclés, butoirs en deux
    // (17/10, l'arrière v2) LES FEUX EN VOLUME : la cuvette qui dépasse, le cerclage chromé, le verre bombé et son cœur ; la lame qui
    // tourne sur l'aile, le butoir de caoutchouc
    for(const x of [.48,.66]){P.cyl('n',.084,.05,12,sd*x,.78,-2.225,'z');P.put('c',new THREE.TorusGeometry(.08,.011,4,16),sd*x,.78,-2.25);
      P.lathe('L',[[.066,0],[.05,-.016],[0,-.022]],12,sd*x,.78,-2.248,'z');P.cyl('r',.026,.01,8,sd*x,.78,-2.268,'z');}
    P.box('c',.50,.05,.06,sd*.50,.58,-2.225);P.box('c',.05,.05,.16,sd*.76,.58,-2.15,0,sd*.6,0);P.box('n',.035,.09,.05,sd*.27,.585,-2.255);
    for(const x of [.30,.40])P.cyl('c',.035,.12,8,sd*x,.30,-2.24,'z');
    for(let i=0;i<2;i++)P.box('n',.26,.01,.12,sd*.30,T(.42-i*.17)+.006,.42-i*.17,.08); // les ouïes du capot
    P.put('c',new THREE.CylinderGeometry(.018,.03,.10,8),sd*.84,.95,-.08,0,0,Math.PI/2*sd); // rétro obus
    P.box('c',.012,.02,.12,sd*(xW(-.60)-.04),.86,-.60);                            // poignée
    P.box('O',.012,.035,.08,sd*(xW(1.75)-.004),.64,1.75);
  });
  P.box('n',.62,.05,.02,0,.38,2.215);                                          // la bouche
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « refais aussi l'arrière de : ROSSO 40, LE SAMOURAÏ, LA DAYTONA, LA FÉLINE, L'ICEBERG » — la revue des poupes, 2e tour) : quatre feux ronds et des baguettes chromées, correct, mais le bas était plat. Désormais
     les feux en volume, les retours de lame et les butoirs (dans le P.sym), et ici : la PLAQUE et sa lampe, le BOUCLIER sous les lames et
     son pli d'ombre, la JUPE noire à ailettes où s'encastrent les quatre sorties de Léo et leurs écrins (ECH_POTS.b_daytona, inchangé). */
  P.box('n',.40,.13,.02,0,.62,-2.215);P.box('w',.36,.10,.012,0,.62,-2.228);P.box('W',.10,.014,.01,0,.69,-2.222); // la plaque, sa lampe
  P.prism('p',[[-2.16,.54],[-2.245,.53],[-2.26,.46],[-2.25,.39],[-2.20,.37],[-2.16,.37]],1.56,0);                 // le bouclier…
  P.box('n',1.50,.014,.012,0,.535,-2.247);                                                                        // …son pli d'ombre
  P.box('n',1.36,.12,.05,0,.33,-2.245);for(const x of [0,-.13,.13,-.52,.52,-.64,.64])P.box('K',.016,.11,.07,x,.33,-2.26); // la jupe, ses ailettes
  P.cyl('c',.055,.02,10,-.60,T(-1.95)+.01,-1.95,'y');                          // le bouchon de réservoir
  K.commit(P);
  return {hl:[.38,.485,2.225],tl:[.66,.78,-2.23],wx:.74,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'multi',n:10,jante:0xe2e5ea}};
},
  c_taurine:function(K){
  /* LA TAURINE v2 (13/10, « plus ressemblante ») — la berlinette de Sant'Agata, relevée sur ses photos : une coque
     BASSE et galbée (rentrée sous la taille, ventre fuyant), le nez en goutte où les ailes bombent au-dessus du capot,
     le grand pare-brise couché, un pavillon court, les arcs-boutants qui encadrent le capot moteur à persiennes, et
     des hanches qui montent derrière la portière. Les phares à cils et les CORNES (Léo, 09/10) ne bougent pas. */
  const U=LPU,R=.33,ZF=1.26,ZR=-1.24,LF=2.18;
  /* (2026-10-20, Léo : « retente la correction sur les oranges, plus fort ») la laque à 42 % de la v707 (≈ 29 % de la teinte d'origine) :
     de jour la tôle orange ne brûle plus (84-89 % au plafond → 2-7 %), chaque pan se lit ; ni gris ni bleu ajoutés (c'est ce qui brunissait) */
  const P=K.kit({p:{g:'p',c:0x471802},k:{g:'m',c:0x121317},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.04],[R*.62,2*R+.02],[R*.98,R*1.18],[R+.12,.22]];
  let zs=[-LF,-2.15,-2.10,-1.95,-1.70,-1.40,-1.10,-.80,-.60,-.46,-.45,-.30,-.05,.30,.50,.55,.56,.80,1.00,1.60,1.80,1.95,2.08,2.14,LF];
  for(const w of [ZF,ZR])for(const d of [R*.62,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const yB=z=>U.lin([[-LF,.64],[-2.10,.72],[-1.80,.78],[ZR,.81],[-.60,.78],[-.30,.73],[.30,.69],[.56,.68],[ZF,.69],[1.70,.66],[1.95,.60],[2.08,.53],[LF,.45]],z),
        yF=z=>U.lin([[.56,.715],[1.00,.745],[ZF,.75],[1.60,.735],[1.95,.665],[2.08,.575],[LF,.47]],z),         // la crête des ailes avant
        yH=z=>U.lin([[.56,.70],[1.00,.675],[1.30,.655],[1.60,.625],[1.95,.57],[2.08,.52],[LF,.44]],z),         // le capot, creusé entre elles
        yT=z=>U.lin([[-.60,1.00],[-.45,1.03],[-.30,1.05],[-.05,1.045],[.30,.915],[.56,.74]],z),                // le pavillon
        yS=z=>U.lin([[-LF,.72],[-2.12,.80],[-1.95,.84],[-1.10,.92],[-.60,1.00],[-.45,1.02]],z),               // les arcs-boutants
        yE=z=>U.lin([[-LF,.70],[-2.12,.78],[-1.95,.81],[-1.10,.88],[-.60,.95],[-.45,.97]],z),                 // le capot moteur
        xW=z=>U.lin([[-LF,.76],[-2.12,.83],[-1.80,.875],[ZR,.89],[-.80,.87],[-.30,.85],[.30,.85],[.80,.86],[ZF,.875],[1.70,.86],[1.95,.80],[2.10,.70],[LF,.56]],z);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.20),U.lin([[-LF,.30],[-1.95,.20],[1.90,.20],[LF,.28]],z)),xw=xW(z),B=yB(z);
    const y3=Math.max(yb+.06,Math.min(.46,B-.16)),y2=Math.max(yb+.03,Math.min(.29,y3-.09)),y4=Math.max(y3+.02,B-.07),y5=Math.max(y4+.02,B);
    const s=[[0,yb],[xw-.08,yb],[xw-.03,y2],[xw,y3],[xw-.02,y4],[xw-.06,y5]];
    if(z>.55){const xc=xw-.11,yc=Math.max(y5+.015,yF(z)),yh=Math.min(yH(z),yc-.01);   // les ailes plus hautes que le capot
      s.push([xc,yc],[xc*.68,Math.max(y4+.01,yh)],[xc*.34,Math.max(y4+.012,yh+.012)],[0,Math.max(y4+.014,yh+.018)]);}
    else if(z>-.46){const t=yT(z),xr=U.lin([[-.45,.56],[-.05,.55],[.56,.70]],z);
      s.push([xw-.10,y5+.03],[Math.min(xr,xw-.20),Math.max(y5+.06,t-.035)],[xr*.5,Math.max(y5+.07,t-.008)],[0,Math.max(y5+.075,t)]);}
    else{const e=yE(z),xs=xw-.20;s.push([xw-.08,y5+.03],[xs,Math.max(y5+.05,yS(z))],[Math.min(.40,xs*.62),Math.max(y5+.03,e)],[0,Math.max(y5+.035,e+.012)]);}
    return s;
  },(j,z)=>{
    if(j===0||j===1)return 'k';
    if(j===-2)return 'k';                                                        // la poupe : une grille noire
    if(j<0)return 'p';
    if(z<.55&&z>-.46){
      if(j===6)return (z>-.30&&z<.50)?'g':'p';                                   // vitre de portière
      if(j>=7)return z>-.05?'g':'p';                                             // pare-brise très couché
    }
    return 'p';});
  // LES PHARES À CILS : l'optique couchée sur l'aile, et les lamelles noires qui lui font les paupières
  P.sym(sd=>{
    const X=sd*.64,Z=1.72,Y=yF(1.72)+.012;
    P.put('c',new THREE.CylinderGeometry(.115,.115,.02,10),X,Y,Z,.55,0,0);
    P.put('W',new THREE.CylinderGeometry(.09,.09,.03,10),X,Y+.004,Z+.002,.55,0,0);
    for(let i=0;i<5;i++){const a=(i-2)*.36;
      P.box('k',.026,.018,.16,X+Math.sin(a)*.17,Y+.02,Z-.15-Math.abs(Math.sin(a))*.03,-.25,a,0);}   // les cils du haut, en éventail
    for(let i=0;i<3;i++){const a=(i-1)*.40;
      P.box('k',.026,.016,.09,X+Math.sin(a)*.15,Y-.035,Z+.17,.30,-a,0);}                           // et ceux du bas
    // (19/10, l'affinement) LA LAME CHROMÉE qui épouse le coin du nez (un bloc de 18 cm qui flottait hors de la tôle là où le nez se resserre) ; le clignotant POSÉ sur la face
    bulleOutils.tube(P,'c',[[sd*.30,.36,LF+.02],[sd*.46,.36,LF+.02],[sd*.545,.36,LF+.008]].concat([2.16,2.13,2.10,2.06].map(z=>[sd*(xW(z)+.006),.36,z])),[[.02,0],[.014,.014],[0,.02],[-.014,.014],[-.02,0],[-.014,-.014],[0,-.02],[.014,-.014]],true);
    P.box('O',.10,.035,.012,sd*.40,.44,LF+.004);
    // LES OUÏES derrière la portière : six lamelles dans l'arc-boutant
    for(let k=0;k<6;k++){const z=-.50-k*.06,B9=yB(z)+.03,S9=Math.max(B9+.05,yS(z)),f=.42;   // (13/10) COUCHÉES sur l'arc-boutant (elles sortaient de la tôle en peigne)
      P.box('k',.012,(S9-B9)*.55,.035,sd*(xW(z)-.08-f*.12+.006),B9+f*(S9-B9),z,0,0,sd*Math.atan2(.12,S9-B9));}
    P.box('k',.012,.025,1.50,sd*(xW(0)-.025),.30,.10);                             // le jonc du bas de caisse
    {const xa=.755,ya=.665,xb=.866,yb=.84;P.put('c',new THREE.CylinderGeometry(.008,.008,Math.hypot(xb-xa,yb-ya),6),sd*(xa+xb)/2,(ya+yb)/2,.46,0,0,-sd*Math.atan2(xb-xa,yb-ya));}   // (2026-10-27, aucun rétro qui vole) la TIGE part de l'épaule (2,5 cm dedans) : droite, elle tombait à 9 cm à côté de la caisse
    P.lathe('p',[[0,.016],[.042,.016],[.047,.006],[.047,-.006],[.042,-.012],[0,-.012]],12,sd*.87,.855,.46,'z');P.cyl('g',.036,.004,12,sd*.87,.855,.446,'z');   // (19/10) le rétro : une tête ronde sur sa tige (un cube avant)
    // LA POUPE : feux aux coins, pare-chocs en deux morceaux
    P.box('L',.20,.07,.03,sd*.66,.64,-LF-.01);P.box('O',.10,.07,.03,sd*.49,.64,-LF-.01);
    bulleOutils.tube(P,'c',[[sd*.10,.40,-LF-.022],[sd*.45,.40,-LF-.022],[sd*.66,.40,-LF-.016]].concat([-2.16,-2.13,-2.09].map(z=>[sd*(xW(z)+.005),.40,z])),[[.02,0],[.014,.014],[0,.02],[-.014,.014],[-.02,0],[-.014,-.014],[0,-.02],[.014,-.014]],true);   // (19/10) la barre chromée suit la poupe et tourne au coin (une barre droite qui dépassait)
    for(const x of [.08,.18])P.cyl('c',.035,.08,6,sd*x,.36,-LF-.01,'z');
  });
  // LES PERSIENNES du capot moteur : des lames noires jetées en travers, entre les arcs-boutants
  for(let i=0;i<9;i++){const z=-.62-i*.145;P.box('k',.80,.016,.07,0,yE(z)+.02,z,-.12);}
  P.box('k',.70,.06,.03,0,.32,LF-.01);P.box('k',1.30,.05,.02,0,.40,LF-.035);   // la bouche avant
  for(let i=0;i<5;i++)P.box('c',1.10,.012,.02,0,.47+i*.04,-LF-.012);           // grille arrière chromée
  K.commit(P);
  /* (2026-10-09, Léo, fiche de la salle blanche) « à LA TAURINE, ajoute des cornes de toro » — LES CORNES : plantées sur la crête des ailes juste derrière les phares à
     cils (les YEUX de la caisse), elles partent de côté, remontent et pointent vers l'AVANT : le toro qui baisse la tête pour charger.
     Un tube à 7 pans qui s'effile le long d'une courbe de Bézier (repère transporté le long de la courbe, sans vrille), IVOIRE, la pointe
     NOIRE, une platine chromée au pied. */
  {const C=K.kit({H:{g:'s',c:0xf0e4c8},N:{g:'m',c:0x2a211c},c:{g:'c',c:0xe9ecf0}});
   const nz=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},vx=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
   const B=[[.74,.70,1.30],[1.08,.82,1.26],[1.24,1.10,1.42],[1.10,1.38,1.74]];   // la courbe de la corne droite : le pied, de côté, en haut, la pointe
   const at=t=>{const u=1-t;return [0,1,2].map(i=>u*u*u*B[0][i]+3*u*u*t*B[1][i]+3*u*t*t*B[2][i]+t*t*t*B[3][i]);};
   const NS=7,NR=12,A9=[];let n=null,Tg=null;
   for(let i=0;i<=NR;i++){const t=i/NR,p=at(t),a=at(Math.max(0,t-.02)),b=at(Math.min(1,t+.02));Tg=nz([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
     if(!n)n=nz(vx(Tg,[0,0,1]));else{const d=n[0]*Tg[0]+n[1]*Tg[1]+n[2]*Tg[2];n=nz([n[0]-Tg[0]*d,n[1]-Tg[1]*d,n[2]-Tg[2]*d]);}
     const bn=vx(Tg,n),r=.092*Math.pow(1-t,.85)+.004,R9=[];
     for(let j=0;j<NS;j++){const th=j/NS*Math.PI*2,c9=Math.cos(th)*r,s9=Math.sin(th)*r;R9.push([p[0]+n[0]*c9+bn[0]*s9,p[1]+n[1]*c9+bn[1]*s9,p[2]+n[2]*c9+bn[2]*s9]);}
     A9.push(R9);}
   const pt=at(1),apex=[pt[0]+Tg[0]*.03,pt[1]+Tg[1]*.03,pt[2]+Tg[2]*.03];
   for(const sd of [-1,1]){const m=q=>[sd*q[0],q[1],q[2]],tri=(k,a,b,c)=>sd>0?C.tri(k,m(a),m(b),m(c)):C.tri(k,m(a),m(c),m(b)); // à gauche, le miroir retourne les faces
     for(let i=0;i<NR;i++){const k=(i+.5)/NR>.8?'N':'H';
       for(let j=0;j<NS;j++){const j1=(j+1)%NS;tri(k,A9[i][j],A9[i][j1],A9[i+1][j1]);tri(k,A9[i][j],A9[i+1][j1],A9[i+1][j]);}}
     for(let j=0;j<NS;j++)tri('N',A9[NR][j],A9[NR][(j+1)%NS],apex);
     C.box('c',.22,.03,.26,sd*.74,yF(1.30)-.005,1.30);}                        // la platine du pied
   K.commit(C);}
  /* (19/10, l'affinement) LA JANTE CAMPAGNOLO de la Miura (des disques dentés plats) : la lèvre, le voile d'alliage doré creusé de DIX trous en
     goutte (le bout étroit vers le centre), le moyeu et son écrou papillon */
  const JW=.27,hw=JW/2,fx=hw-.03,J=lpKit({k:{g:'m',c:0x16171a},a:{g:'c',c:0xd8c9a2},s:{g:'s',c:0xc4b48a},d:{g:'m',c:0x111215},c:{g:'c',c:0xe9ecf0}});
  J.lathe('k',[[.215,-hw],[R*.86,-hw],[R*.97,-hw*.7],[R,-hw*.3],[R,hw*.3],[R*.97,hw*.7],[R*.86,hw],[.215,hw]],20,0,0,0,'x');
  J.lathe('a',[[.215,hw-.004],[.212,fx+.010],[.204,fx+.006]],24,0,0,0,'x');
  J.lathe('s',[[.204,fx+.006],[.19,fx-.004],[.12,fx-.014],[.07,fx-.006],[.055,fx+.004]],24,0,0,0,'x');
  J.lathe('d',[[.215,-hw+.02],[.215,fx-.05],[0,fx-.05]],20,0,0,0,'x');
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    J.cyl('d',.026,.016,8,fx-.012,c*.165,s*.165,'x');J.cyl('d',.016,.016,6,fx-.010,c*.122,s*.122,'x');}
  J.lathe('a',[[.055,fx+.004],[.05,fx+.016],[.03,fx+.022],[0,fx+.024]],14,0,0,0,'x');
  J.box('c',.016,.11,.02,fx+.03,0,0);J.box('c',.016,.02,.11,fx+.03,0,0);
  const JG=J.done();
  return {hl:[.64,.75,1.80],tl:[.66,.64,-2.20],wx:.76,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xd8c9a2}};
},
  c_stratos:function(K){
  /* (13/10, « plus ressemblante ») la berlinette de rallye de Turin : des AILES qui bombent au-dessus des roues (avant comme arrière)
     et un nez arrondi vu de dessus, autour de la visière. */
  const hmp=(z,w,r)=>{const d=Math.abs(z-w)/r;return d>=1?0:1-d*d;};
  const U=LPU,R=.33,ZF=1.07,ZR=-1.11,LF=1.855;
  const P=K.kit(Object.assign({p:{g:'p',c:0xe9eae4,grad:[0xa7aab0,0xdcded9,0xf4f4f0]},v:{g:'p',c:0x006b2c,f:0},r:{g:'p',c:0xc4000e,f:0},
    k:{g:'m',c:0x121317},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1c2733},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},Y:{g:'l',c:0xffe08a}},(STRATOS_METEO&&typeof stratosPal==='function')?stratosPal():{})); // (22/10) + l'or et les lueurs verte et dorée de la STATION MÉTÉO (stratos-meteo.js)
  const AR=[[0,2*R+.05],[R*.70,2*R+.04],[R+.04,R*1.15],[R+.14,.24]];
  const zs=[-LF,-1.848,-1.835,-1.81,-1.77,-1.66,-1.30,-.80,-.26,-.12,.15,.55,.97,1.40,1.62,1.72,1.76,1.80,LF];   // (affinement) -1,83 et -1,76 : la poupe tourne ses coins
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.04,R+.14])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yB=z=>U.lin([[-LF,.72],[-1.80,.80],[-1.66,.84],[-.26,.80],[.97,.72],[1.40,.66],[1.72,.58],[1.80,.52],[LF,.46]],z)+.06*hmp(z,ZF,.75)+.05*hmp(z,ZR,.8),
        yT=z=>U.lin([[-LF,.76],[-1.80,.84],[-1.66,.88],[-1.30,.95],[-.80,1.03],[-.26,1.095],[.15,1.105],[.55,.98],[.97,.76],
                     [1.40,.67],[1.72,.60],[1.80,.54],[LF,.47]],z),
        xW=z=>U.lin([[-LF,.68],[-1.848,.74],[-1.835,.785],[-1.81,.825],[-1.77,.852],[-1.30,.875],[-.60,.84],[.20,.83],[.80,.85],[1.40,.855],[1.62,.82],[1.76,.74],[LF,.58]],z)+.03*hmp(z,ZF,.6)+.03*hmp(z,ZR,.6),
        cab=z=>z>-.27&&z<.98;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.22),xw=xW(z),B=yB(z),t=yT(z),y2=Math.max(.32,yb+.05);
    // LA VISIÈRE : dans l'habitacle, le vitrage s'enroule d'un flanc à l'autre sans montant visible
    const x5=cab(z)?U.lin([[-.26,.58],[.15,.56],[.55,.62],[.97,.74]],z):xw-.10;
    const yv=U.lin([[-1.66,.66],[-1.10,.60],[1.00,.52],[1.60,.50]],z);
    return [[0,yb],[xw-.07,yb],[xw,y2],[xw+.005,Math.max(y2+.01,yv)],[xw+.004,Math.max(y2+.02,yv+.07)],[xw-.02,B],[xw-.09,Math.max(B+.03,Math.min(t-.05,B+.10))],
            [x5,Math.max(B+.05,t-.035)],[x5*.5,Math.max(B+.06,t-.008)],[0,Math.max(B+.065,t)]];
  },(j,z)=>{
    if(j===0||j===1)return 'k';
    if(j<0)return 'p';
    if(j===2)return (z>-1.70&&z<1.62)?'v':'p';                                  // la livrée : le ruban vert…
    if(j===3)return (z>-1.70&&z<1.62)?'r':'p';                                  // …et son filet rouge
    if(cab(z)){
      if(j===6)return (z>-.13&&z<.93)?'g':'p';                                   // la visière descend sur le flanc
      if(j>=7)return (z>.30)?'g':'p';
    }
    if(j>=6&&z<-.27&&z>-1.66)return 'k';                                        // capot moteur : grille noire
    return 'p';});
  for(let i=0;i<9;i++){const z=-.42-i*.135;P.box('p',.86,.014,.05,0,yT(z)+.006,z,-.20);} // les lamelles du capot moteur
  // L'AILERON DE TOIT, posé à la naissance de la poupe, et le becquet de queue
  P.box('k',1.10,.025,.20,0,yT(-.28)+.06,-.32,.10);P.sym(sd=>P.box('k',.03,.07,.12,sd*.50,yT(-.28)+.03,-.28));
  P.box('k',1.56,.04,.12,0,.88,-1.84,-.30);
  // LA RAMPE DE PHARES de rallye sur le capot, et les optiques escamotables rentrées
  P.box('k',1.00,.035,.06,0,yT(1.30)+.07,1.30);P.sym(sd=>P.box('k',.03,.08,.04,sd*.44,yT(1.30)+.03,1.30));
  for(const x of [-.36,-.12,.12,.36]){P.cyl('c',.09,.07,10,x,yT(1.30)+.155,1.33,'z');P.cyl('Y',.07,.075,10,x,yT(1.30)+.155,1.345,'z');}
  P.sym(sd=>{
    P.box('k',.34,.012,.34,sd*.52,yT(1.55)+.002,1.55,-.12);                    // trappes de phares
    P.box('k',.34,.08,.03,sd*.42,.38,LF-.005);P.box('O',.08,.05,.03,sd*.52,.46,LF-.02);
    P.box('W',.10,.05,.03,sd*.34,.46,LF-.01);
    // LA POUPE : deux feux ronds par côté dans la face noire, le pot unique
    for(const x of [.42,.58]){P.cyl('c',.075,.03,10,sd*x,.66,-LF-.005,'z');P.cyl('L',.058,.035,10,sd*x,.66,-LF-.01,'z');}   // (affinement) resserrés : la poupe arrondie
    P.box('k',.02,.14,.40,sd*(xW(-.70)+.004),.72,-.70);                      // prise d'air latérale
    P.box('p',.10,.06,.14,sd*.87,.80,.92);P.box('k',.05,.03,.08,sd*.83,.78,.92); // rétro
    P.box('c',.012,.025,.12,sd*(xW(-.05)+.003),.76,-.10);
  });
  P.box('k',1.34,.26,.02,0,.62,-LF-.004);                                      // la face arrière noire (1,34 : la poupe arrondie ne la laisse plus déborder)
  P.cyl('c',.05,.10,8,-.30,.38,-LF-.01,'z');P.cyl('c',.05,.10,8,.30,.38,-LF-.01,'z');
  P.box('k',1.30,.06,.03,0,.30,LF-.005);
  if(STRATOS_METEO&&typeof stratosMeteo==='function'){try{stratosMeteo(K,P,{yT:yT,LF:LF});}catch(e){console.warn('LA STRATOS, la station météo :',e);}} // (22/10) LA STATION MÉTÉO : voir stratos-meteo.js (?stratos=ancien = sans)
  K.commit(P);
  return {hl:[.36,1.02,1.37],tl:[.56,.66,-1.87],wx:.78,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.30,style:'rayons',n:5,jante:0xe0b84a,accent:0xe0b84a,branches:1}};
},
  d_batmobile:function(K){
  /* (13/10, « plus ressemblante ») le coupé de Munich a un capot À PLAT jusqu'au nez de requin (il plongeait en coin), une
     verrière haute et sans montant qui court jusqu'à la custode, et un coffre à plat. */
  const U=LPU,R=.32,ZF=1.35,ZR=-1.28;
  const P=K.kit({p:{g:'p',c:0xf4f4f0},B:{g:'p',c:0x4f9be8,f:0},V:{g:'p',c:0x3b2a8c,f:0},E:{g:'p',c:0xd01a22,f:0},
    k:{g:'m',c:0x131417},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x18212c},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.05],[R*.72,2*R+.03],[R+.07,R*1.14],[R+.15,.30]];
  const zs=[-2.315,-2.28,-2.22,-1.45,-.90,-.72,.05,.66,.70,2.05,2.18,2.25,2.315];
  for(const w of [ZF,ZR])for(const d of [R*.72,R+.07,R+.15])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-2.315,.93],[-2.28,.96],[-2.22,.975],[-1.45,.99],[-.90,1.35],[.05,1.37],[.70,.925],[1.40,.915],[2.05,.90],[2.18,.895],[2.315,.875]],z),
        yB=z=>U.lin([[-2.315,.90],[-2.22,.94],[-1.45,.95],[-.90,.885],[.70,.875],[2.05,.865],[2.18,.86],[2.315,.845]],z),
        xW=z=>U.lin([[-2.315,.80],[-2.26,.84],[-2.10,.855],[2.05,.855],[2.20,.82],[2.315,.76]],z),
        xR=z=>U.lin([[-1.45,.74],[-.90,.64],[.05,.63],[.70,.73]],z),
        cab=z=>z>-1.45&&z<.70,
        fl=z=>{const d=Math.min(Math.abs(z-ZF),Math.abs(z-ZR));return d<R+.16?.035:0;}, // les ailes élargies
        nez=z=>U.lin([[2.18,.30],[2.25,.48],[2.315,.70]],z);                       // le menton qui recule : NEZ DE REQUIN
  P.loft(zs,z=>{
    const yb=z>2.18?nez(z):U.arch(z,[ZF,ZR],AR,.30),xw=xW(z),c=yC(z),b=Math.max(yB(z),yb+.10),f=fl(z);
    const s=[[0,yb],[xw-.06,yb],[xw+f,Math.max(yb+.04,.38)],[xw+.012+f,Math.max(yb+.07,.64)],[xw,b],[xw-.07,b+.02]];
    if(cab(z)){const y6=Math.max(c-.035,b+.03);s.push([xR(z),y6],[xR(z)-.14,Math.max(y6+.004,c-.005)],[0,c]);}
    else s.push([xw-.25,Math.max(b+.03,c-.015)],[xw-.45,Math.max(b+.035,c-.006)],[0,Math.max(b+.04,c)]);
    return s;
  },(j,z)=>{
    if(j<=1&&z>2.18)return 'K';                                              // la face qui plonge : bandeau noir
    if(j===0)return 'k';
    if(j<0||j<=4||!cab(z))return 'p';
    if(j===5)return (z>-1.30&&z<.62)?'g':'p';                                // pavillon SANS montant, jusqu'à la custode
    return (z>.05||z<-.90)?'g':'p';});
  const TW=1.93,rx9=.36;                                                     // l'inclinaison de la face
  // LA FACE : deux haricots étroits, quatre phares ronds sur le bandeau qui penche
  P.sym(sd=>{
    P.box('c',.15,.30,.03,sd*.095,.56,2.275,rx9);P.box('K',.11,.26,.03,sd*.095,.56,2.282,rx9);
    for(let i=0;i<3;i++)P.box('c',.012,.24,.03,sd*(.065+i*.03),.56,2.286,rx9);
    /* (2026-10-19, BOÎTES : « la face, un panneau noir plat ») les LAMES CHROMÉES de la calandre, d'un haricot au bout de l'aile, couchées
       sur la pente du nez de requin (les phares passent devant) */
    for(const y of [.44,.52,.60]){const z=(y<.48?2.18+(y-.30)/.18*.07:2.25+(y-.48)/.22*.065)+.008;P.box('c',.54,.008,.012,sd*.44,y,z,rx9);}
    for(const [x,r] of [[.40,.075],[.62,.088]]){const y=.56,z=2.18+(y-.30)/.36*.135+.012;
      P.put('c',new THREE.CylinderGeometry(r+.014,r+.014,.02,10),sd*x,y,z,TW,0,0);
      P.put('W',new THREE.CylinderGeometry(r,r,.03,10),sd*x,y,z+.006,TW,0,0);}
    P.box('O',.10,.05,.02,sd*.66,.35,2.215,rx9);
    // LES AILETTES dressées sur les ailes avant
    P.box('p',.022,.09,.86,sd*.775,.885,1.66,.06);P.box('k',.032,.012,.86,sd*.775,.843,1.66,.06);
    // LES FILETS : bleu clair, violet, rouge
    // (13/10, Léo : « les barres chelou ») les trois filets de flanc RETIRÉS
    P.box('p',.10,.07,.14,sd*.90,.98,.60);P.box('k',.08,.03,.04,sd*.85,.95,.60); // rétro de course
    P.box('k',.03,.08,.04,sd*.83,.90,.60);   // (2026-10-27, aucun rétro qui vole) son PIED, planté 2 cm dans la portière (le bras flottait 5 cm au-dessus)
    // (13/10) le jonc de vitre chromé RETIRÉ
    // L'ÉNORME AILERON : deux grandes flasques qui montent du coffre
    P.prism('p',[[-1.86,.98],[-2.26,.98],[-2.30,1.30],[-1.98,1.30]],.03,sd*.77);
    P.box('L',.36,.10,.03,sd*.56,.80,-2.325);P.box('O',.10,.10,.03,sd*.30,.80,-2.325); // feux arrière
    P.box('L',.03,.10,.16,sd*.80,.80,-2.24);
    P.cyl('c',.045,.10,8,sd*.40,.30,-2.34,'z');
  });
  // (2026-10-19, BOÎTES : « l'aileron en boîte ») le plan porteur en PROFIL D'AILE : bord d'attaque rond, extrados bombé, bord de fuite fin
  P.prism('p',[[-1.93,1.278],[-1.97,1.298],[-2.07,1.312],[-2.20,1.306],[-2.31,1.282],[-2.31,1.272],[-2.14,1.262],[-1.97,1.266]],1.58,0);
  P.box('p',1.52,.035,.12,0,1.325,-2.30,-.45);                               // son volet
  P.prism('k',[[2.02,.30],[2.26,.30],[2.33,.19],[2.33,.16],[2.08,.15]],1.62,0);         // LE BEC, sous le menton
  P.box('p',1.08,.03,.13,0,1.36,-.93,.30);                                   // le becquet de pavillon
  P.box('c',1.50,.05,.06,0,.40,-2.33);P.box('K',1.40,.14,.02,0,.62,-2.322); // pare-chocs fin, bandeau de poupe
  K.commit(P);
  return {hl:[.62,.56,2.30],tl:[.56,.80,-2.34],wx:.76,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.28,style:'multi',n:12,jante:0xd4d8de}};
},
  e_aigle:function(K){
  /* L'AIGLE DE FEU v2 (13/10, « plus ressemblant ») — le grand coupé de Pontiac, millésime 77, relevé sur ses photos :
     la BOUTEILLE (taille pincée aux portières, ailes élargies, le COUP DE REIN de la ceinture derrière la vitre qui
     remonte vers la malle), le capot long entre deux ailes, le BEC et ses orbites carrées, la coque qui rentre sous la
     taille, des vitres qui rentrent sur un pavillon arrondi, la grande lunette couchée, le becquet en canard. */
  const U=LPU,R=.34,ZF=1.47,ZR=-1.27;
  const PAL9={p:{g:'p',c:0x0f0f11},o:{g:'o',c:0xd9a520},k:{g:'m',c:0x151619},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}},P=K.kit(PAL9);
  /* (2026-10-19, BOÎTES) LE DAMIER DU FLANC : sur ce noir laqué, chaque facette plate du flanc (elles s'inclinent un peu d'une station à
     l'autre, élargisseurs compris) renvoyait un morceau différent du ciel — en course, le flanc se couvrait de carrés gris et blancs.
     Les normales de la laque sont lissées entre facettes à moins de ~25° l'une de l'autre : le reflet coule, les arêtes vives restent. */
  {const gP=(typeof peintPal==='function'?peintPal(PAL9):PAL9).p.g,d0=P.done;P.done=function(){const o=d0.call(P),G9=o[gP];if(G9){
    const a=G9.attributes.position.array,n=G9.attributes.normal.array,M9=new Map(),N9=new Float32Array(n.length);
    for(let i=0;i<a.length;i+=3){const q=Math.round(a[i]*500)+','+Math.round(a[i+1]*500)+','+Math.round(a[i+2]*500);let L9=M9.get(q);if(!L9)M9.set(q,L9=[]);L9.push(i);}
    for(const L9 of M9.values())for(const i of L9){let x=0,y=0,z=0;for(const j of L9)if(n[i]*n[j]+n[i+1]*n[j+1]+n[i+2]*n[j+2]>.9){x+=n[j];y+=n[j+1];z+=n[j+2];}
      const l=Math.hypot(x,y,z)||1;N9[i]=x/l;N9[i+1]=y/l;N9[i+2]=z/l;}
    G9.setAttribute('normal',new THREE.Float32BufferAttribute(N9,3));}return o;};}
  const AR=[[0,2*R+.05],[R*.60,2*R+.01],[R*.98,R*1.12],[R+.14,.28]];
  let zs=[-2.55,-2.50,-2.45,-2.30,-1.72,-1.40,-1.10,-.95,-.90,-.70,-.55,-.50,-.30,0,.40,.46,.60,1.00,2.00,2.25,2.33,2.42,2.50,2.55];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.14])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z>-1.73&&z<.47;
  const fl=z=>{let f=0;for(const w of [ZF,ZR])f=Math.max(f,1-Math.abs(z-w)/(R+.34));return Math.min(1,f*1.8);}; // ÉLARGISSEURS d'ailes
  const T=z=>U.lin([[-2.55,.92],[-2.50,.99],[-2.45,1.00],[-2.30,.985],[-1.72,.985],[-.95,1.23],[-.30,1.25],[.46,.95],[.60,.93],[ZF,.905],[2.25,.87],[2.42,.79],[2.55,.66]],z),
        yB=z=>U.lin([[-2.55,.90],[-2.45,.955],[-1.72,.96],[-1.10,.95],[-.70,.875],[0,.86],[.46,.865],[ZF,.885],[2.25,.85],[2.42,.77],[2.55,.62]],z),
        xW=z=>U.lin([[-2.55,.84],[-2.45,.88],[-1.70,.905],[ZR,.915],[-.70,.875],[0,.855],[.80,.865],[ZF,.89],[2.20,.89],[2.40,.84],[2.55,.44]],z),
        xR=z=>U.lin([[-1.72,.64],[-.95,.60],[-.30,.61],[.46,.72]],z);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.28),U.lin([[-2.55,.34],[-2.35,.28],[2.30,.28],[2.55,.33]],z)),xw=xW(z),xl=xw+.035*fl(z),b=yB(z),t=T(z);
    const y3=Math.max(yb+.06,Math.min(.60,b-.24)),y2=Math.max(yb+.03,Math.min(.40,y3-.12)),y4=Math.max(y3+.02,b-.10),y5=Math.max(y4+.02,b);
    const s=[[0,yb],[xl-.08,yb],[xl-.03,y2],[xl,y3],[xl-.012,y4],[xw-.05,y5]];
    if(cab(z)){const y7=Math.max(y5+.06,t-.05);s.push([xw-.12,y5+.03],[Math.min(xR(z),xw-.20),y7],[xR(z)*.5,Math.max(y7+.01,t-.012)],[0,Math.max(t,y7+.015)]);}
    else{const xc=xw-(z>0?.10:.12),tt=Math.max(t,y5+.02);                                 // le capot entre les ailes / la malle
      s.push([xc,y5+.015],[xc*.62,Math.max(y5+.016,tt-.01)],[xc*.30,tt-.002],[0,tt]);}
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===6&&cab(z)&&z>-.90&&z<.40)return (z>-.55&&z<-.50)?'k':'g';
    if((j===7||j===8)&&z>-.30&&z<.46)return 'g';                                // pare-brise
    if((j===7||j===8)&&z>-1.72&&z<-.95)return 'g';                              // la grande lunette
    return 'p';});
  const hood=z=>T(z)+.004;
  // LE BEC : deux orbites noires en V, quatre phares carrés ; bouclier et lame noire
  P.sym(sd=>{
    const fz=x=>2.55-.325*(x-.44);                                                // le plan du V, vu de dessus
    P.box('k',.42,.20,.06,sd*.645,.62,fz(.645)-.012,0,sd*.315);
    for(const x of [.545,.745])P.box('W',.16,.12,.03,sd*x,.62,fz(x)+.028,0,sd*.315);
    P.box('O',.14,.05,.03,sd*.70,.42,fz(.70)+.01,0,sd*.315);
  });
  P.box('k',1.30,.08,.20,0,.27,2.46);                                             // la lame
  P.box('k',.50,.10,.02,0,.44,2.552);
  // LE SHAKER, qui sort du capot, bouche en avant, liseré d'or
  P.box('p',.54,.04,.80,0,hood(1.25)+.02,1.25);
  P.box('p',.44,.13,.46,0,hood(1.25)+.10,1.20);P.box('k',.38,.07,.02,0,hood(1.25)+.10,1.435);
  P.box('o',.46,.012,.48,0,hood(1.25)+.167,1.20);
  // L'OISEAU D'OR : tête, corps, et deux ailes en chevrons de plumes
  P.box('o',.12,.008,.12,0,hood(2.06),2.06,0,.785);P.box('o',.07,.008,.40,0,hood(1.82),1.80);
  P.sym(sd=>{for(let i=0;i<6;i++){const z=1.99-i*.075,L=.66-i*.07;
    P.box('o',L,.008,.045,sd*(.05+L*.46),hood(z)+.002*i,z-L*.17,0,sd*(.36+i*.06));}
    P.box('o',.24,.008,.05,sd*.11,hood(1.58),1.55,0,-sd*.6);});                    // la queue
  P.sym(sd=>{
    // flancs : filet d'or, ouïes d'aile, poignée, rétro sport
    {const Zs=[],X=z=>0;      // (13/10, Léo : « les barres chelou ») le filet d'or de flanc RETIRÉ
     for(let q=0;q<Zs.length-1;q++){const z0=Zs[q],z1=Zs[q+1],x0=X(z0),x1=X(z1);
       P.box('o',.012,.02,Math.hypot(z1-z0,x1-x0)+.01,sd*(x0+x1)/2,.80,(z0+z1)/2,0,Math.atan2(sd*(x1-x0),z1-z0),0);}}
    for(let i=0;i<3;i++)P.box('k',.02,.03,.22,sd*.90,.66+i*.05,ZF-.52);
    P.box('c',.02,.025,.14,sd*(xW(-.30)+.004),.78,-.30);
    P.box('p',.07,.08,.18,sd*.93,.98,.38,0,sd*.2);P.box('k',.06,.03,.05,sd*.87,.96,.40);
    // T-TOP : deux dalles de verre
    P.box('g',.40,.012,.62,sd*.31,1.243,-.62,0,0,-sd*.06);
    // (13/10) le filet d'or du T-top RETIRÉ
    // la poupe : bandeau de feux noir, pots
    P.box('L',.42,.10,.02,sd*.60,.76,-2.556);
    P.cyl('c',.05,.14,8,sd*.41,.30,-2.58,'z');
  });
  P.box('k',1.60,.20,.02,0,.76,-2.553); /* (13/10) ses liserés d'or retirés */
  P.box('k',1.70,.10,.14,0,.40,-2.54);
  P.box('p',1.74,.05,.22,0,1.035,-2.40,-.18); // le becquet (13/10 : sa bordure d'or retirée)
  K.commit(P);
  return {hl:[.64,.62,2.50],tl:[.60,.76,-2.56],wx:.77,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.28,style:'multi',n:10,jante:0xd9a520,creux:.06}}; // (19/10, JAPONAISES) la jante dorée « flocon » CREUSÉE (6 cm)
},
  e_zed:function(K){
  /* (13/10, « plus ressemblante ») le coupé de Yokohama a un capot LONG et presque à plat (il plongeait en coin vers 0,55),
     les phares au fond de leurs cuvettes au bout des ailes hautes, la bouche sous le nez. */
  const U=LPU,R=.31,ZF=1.19,ZR=-1.115;
  /* (2026-10-20, Léo : « retente la correction sur les oranges, plus fort ») la laque à 42 % de la v707 (≈ 29 % de la teinte d'origine) :
     de jour la tôle orange ne brûle plus (84-89 % au plafond → 2-7 %), chaque pan se lit ; ni gris ni bleu ajoutés (c'est ce qui brunissait) */
  const P=K.kit({p:{g:'p',c:0x4e2208},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    r:{g:'l',c:0x9a0f1a},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) r, w (la plaque éclairée) — aucune famille de plus
  const AR=[[0,2*R+.04],[R*.60,2*R+.01],[R*.98,R*1.14],[R+.12,.27]];
  let zs=[-2.07,-1.96,-1.45,-1.05,-.62,-.58,-.35,.25,.31,.40,1.80,1.95,2.03,2.07];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z>-1.97&&z<.32;
  const T=z=>U.lin([[-2.07,.93],[-1.96,.96],[-1.45,1.10],[-.55,1.265],[-.35,1.28],[.31,.92],[.40,.915],[1.20,.88],[1.80,.84],[1.95,.81],[2.07,.75]],z),
        yB=z=>U.lin([[-2.07,.91],[-1.96,.93],[-1.20,.90],[-.60,.86],[.31,.845],[1.20,.835],[1.80,.80],[1.95,.765],[2.07,.70]],z),
        xW=z=>U.lin([[-2.07,.76],[-1.95,.80],[-1.20,.815],[.50,.80],[1.60,.79],[2.07,.66]],z);
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.27),xw=xW(z),b=yB(z),t=T(z);
    const s=[[0,yb],[xw-.05,yb],[xw-.01,Math.max(.36,yb+.05)],[xw,Math.max(yb+.08,b-.22)],[xw-.02,b]];
    if(cab(z)){const xr=U.lin([[-1.96,.72],[-1.45,.64],[-.35,.62],[.31,.70]],z);s.push([xw-.10,b+.03],[xr,Math.max(b+.04,t-.05)],[0,t]);}
    else s.push([xw-.12,b+.012],[.36,(b+t)/2-.01],[0,t]);                        // les ailes se DRESSENT, le capot creuse entre elles
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===5&&cab(z)&&z>-1.05&&z<.25)return (z>-.62&&z<-.58)?'k':'g';
    if(j===6&&z>-.35&&z<.31)return 'g';                                          // pare-brise
    if(j===6&&z>-1.45&&z<-.55)return 'g';                                        // le hayon vitré du fastback
    return 'p';});
  P.sym(sd=>{
    // LES CUVETTES : un fût de tôle autour du phare, qui l'enfonce
    P.lathe('p',[[.128,0],[.128,.075],[.108,.075],[.108,0]],12,sd*.52,.645,2.04,'z');
    P.lathe('c',[[.130,.075],[.106,.075]],12,sd*.52,.645,2.04,'z');
    P.cyl('k',.108,.02,12,sd*.52,.645,2.05,'z');P.cyl('W',.078,.03,12,sd*.52,.645,2.055,'z');
    // pare-chocs en deux lames, butoirs, clignotants
    const lame=(Q,y,h,d)=>{for(let i=0;i<Q.length-1;i++){const [x0,z0]=Q[i],[x1,z1]=Q[i+1],dx=x1-x0,dz=z1-z0;     // (affinement) une lame EN TRONÇONS qui suit le plan du nez
      P.box('c',Math.hypot(dx,dz)+.02,h,d,sd*(x0+x1)/2,y,(z0+z1)/2,0,Math.atan2(-dz,sd*dx),0);}};                // et tourne le coin (c'était une barre droite posée devant)
    lame([[.17,2.115],[.56,2.115],[.68,2.07],[.725,1.96]],.47,.045,.08);P.box('c',.04,.12,.06,sd*.25,.48,2.12);
    P.box('O',.14,.05,.03,sd*.56,.39,2.075);
    // RÉTROS SUR LES AILES
    P.box('c',.015,.10,.015,sd*.66,.83,1.28);P.box('k',.05,.06,.10,sd*.66,.90,1.28,0,sd*.3);
    // flancs : répétiteur, poignée, bas de caisse
    P.box('O',.012,.03,.08,sd*.795,.66,1.75);
    P.box('c',.02,.025,.12,sd*.80,.78,-.44);
    P.box('k',.02,.05,1.20,sd*.79,.34,.04);
    // les ouïes du montant arrière
    for(let i=0;i<3;i++)P.box('k',.012,.016,.20,sd*(.695-i*.018),.96+i*.035,-1.28,0,0,sd*.46);
    // la POUPE TRONQUÉE : bandeau noir, feux, pare-chocs, pots — (17/10, l'arrière v2) LE FEU EN TROIS SEGMENTS EN RELIEF dans sa coque
    // et son cadre chromé : le stop strié, le feu, le recul ; les BUTOIRS des pare-chocs et leur caoutchouc
    P.box('K',.50,.15,.03,sd*.49,.74,-2.088);
    P.box('L',.20,.11,.02,sd*.60,.74,-2.106);P.box('r',.12,.11,.02,sd*.43,.74,-2.104);P.box('W',.07,.11,.02,sd*.315,.74,-2.104);
    for(const y of [.70,.74,.78])P.box('K',.20,.014,.006,sd*.60,y,-2.117);
    for(const y of [.663,.817])P.box('c',.50,.014,.012,sd*.49,y,-2.104);
    lame([[.17,-2.115],[.62,-2.115],[.785,-2.07],[.83,-1.96]],.48,.045,.08);
    P.box('c',.035,.13,.05,sd*.21,.49,-2.13);P.box('k',.04,.035,.03,sd*.21,.535,-2.155);
    P.cyl('c',.04,.12,8,sd*.36,.32,-2.12,'z');
  });
  P.box('k',.70,.14,.03,0,.43,2.07);P.box('c',.66,.02,.02,0,.44,2.09);          // la bouche et sa barrette
  P.box('k',1.24,.04,.16,0,.255,2.00,-.12);                                      // la lèvre de nez, noire
  // LES ÉLARGISSEURS noirs vissés sur les arches (la version course)
  // (13/10, « traits maladroits ») une LÈVRE qui épouse le passage de roue (c'était un trapèze noir posé autour, comme un trait de feutre)
  for(const w of [ZF,ZR])P.sym(sd=>P.prism('k',[[w-R-.18,.27],[w-R*.98-.06,R*1.14+.05],[w-R*.6,2*R+.08],[w+R*.6,2*R+.08],[w+R*.98+.06,R*1.14+.05],[w+R+.18,.27],
    [w+R+.12,.27],[w+R*.98,R*1.14],[w+R*.6,2*R+.01],[w-R*.6,2*R+.01],[w-R*.98,R*1.14],[w-R-.12,.27]],.04,sd*(xW(w)+.004)));
  P.box('k',1.44,.18,.02,0,.74,-2.072);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un bandeau
     noir à deux pavés rouges, deux barres chromées et un pot en pastille, sur une caisse à 1,6 M$. Désormais les feux en trois segments
     en relief et les butoirs (dans le P.sym), et ici : la GARNITURE striée de chrome entre les feux, la LÈVRE de malle relevée, la PLAQUE
     et sa lampe entre les deux pare-chocs, la JUPE noire et ses ailettes où s'encastre le pot de Léo (ECH_POTS.e_zed, inchangé). */
  for(const y of [.70,.74,.78])P.box('c',.44,.014,.01,0,y,-2.086);                          // la garniture striée
  P.prism('p',[[-1.98,.935],[-2.115,.968],[-2.12,.948],[-2.07,.915]],1.40,0);                 // la lèvre de malle
  P.box('K',.34,.13,.012,0,.52,-2.084);P.box('w',.30,.10,.012,0,.52,-2.091);P.box('W',.10,.014,.01,0,.592,-2.084); // la plaque, sa lampe
  P.box('k',1.30,.18,.06,0,.31,-2.095);                                                      // la jupe…
  for(const x of [-.56,-.38,-.20,0,.20,.56])P.box('K',.014,.15,.08,x,.30,-2.11);             // …ses ailettes (le pot passe à gauche)
  K.commit(P);
  return {hl:[.52,.645,2.10],tl:[.52,.74,-2.09],wx:.705,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.24,style:'rayons',n:8,jante:0xcfd3d8,accent:0xb3b8c0,branches:1}}; // (19/10) les huit branches en argent (sombres sur le fond sombre, elles ne se lisaient pas)
},
  e_feline:function(K){
  /* LA FÉLINE v2 (13/10, « plus ressemblante ») — relevée sur une photo de profil du coupé 1964 : le capot
     long et BAS (0,90 au pare-brise, il plonge en goutte vers la bouche), les ailes qui se gonflent au-dessus
     des roues, la coque en TONNEAU (rentrée sous la taille, ventre fuyant), un pavillon étroit qui file
     en fastback jusqu'à la poupe ronde, et la ceinture qui redescend sur les hanches. */
  const U=LPU,R=.33,ZF=1.375,ZR=-1.065;
  const P=K.kit({p:{g:'p',c:0xeee3c6},j:{g:'p',c:0xa89c7e},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xb9bec6},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    w:{g:'l',c:0xd9dce0},v:{g:'g',c:0x93a39f}}); // (17/10, l'arrière v2) w la plaque éclairée — aucune famille de plus · (19/10) v le verre CLAIR du phare (gris-vert : il reflète, on voit au travers)
  /* (19/10, l'affinement — Léo : « oui », les AILES SÉPARÉES comme LE SCARABÉE) la coque en grandes facettes venait des passages de roue
     creusés dans le loft (9 points par section, l'arche écrasait le flanc en lanières tordues). Désormais : la COQUE (le tonneau des portières,
     le capot entre les ailes, le nez et la poupe pleins) ne descend plus à l'arche ; sous chaque aile elle se resserre (sa paroi passe à
     l'intérieur de la roue) et les AILES sont des tubes fermés posés par-dessus (loftLibre) — la crête, le flanc qui tombe, la lèvre de l'arche
     ronde, la doublure. L'aile avant naît au bord arrière du capot-coquille (z ,50 : son arête est le vrai joint) et plonge dans le nez ;
     la hanche arrière naît derrière la portière (z −,70) et plonge dans la poupe. */
  const ZC=.28,ZBF=.50,ZBR=-.70,ZNF=2.06,ZNR=-1.96;                                // pare-brise · joints du capot et de la portière · nez et poupe pleins
  let zs=[-2.225,-2.19,-2.12,-2.03,-1.99,ZNR,-1.94,-1.88,-1.80,-1.66,-1.50,-1.33,-1.30,-1.20,-1.06,-.92,-.88,-.80,-.76,-.725,ZBR+.005,ZBR,-.66,-.40,-.14,-.10,.10,.24,.27,.30,.45,
          ZBF,ZBF+.005,.525,.70,.85,1.00,1.15,1.30,1.45,1.62,1.80,1.92,2.02,ZNF-.005,ZNF,2.085,2.10,2.17,2.205,2.225];
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.003);
  const cab=z=>z<ZC;
  const T=z=>U.lin([[-2.225,.55],[-2.20,.63],[-2.15,.68],[-2.06,.72],[-1.90,.78],[-1.65,.89],[-1.33,1.03],[-1.02,1.16],[-.72,1.22],[-.40,1.24],[-.14,1.21],[ZC,.91],
                    [.63,.895],[1.15,.88],[1.40,.865],[1.66,.83],[1.92,.75],[2.08,.66],[2.17,.58],[2.225,.50]],z),
        yB=z=>U.lin([[-2.225,.52],[-2.19,.60],[-2.10,.655],[-1.95,.70],[-1.75,.78],[-1.50,.86],[-1.33,.895],[-.70,.90],[ZC,.89],[1.00,.86],[1.375,.86],[1.70,.80],[1.95,.71],[2.10,.62],[2.225,.52]],z),
        sH=z=>U.lin([[-2.225,.48],[-2.10,.55],[-1.90,.60],[-1.60,.70],[-1.065,.74],[-.50,.76],[ZC,.77],[1.00,.76],[1.70,.71],[2.00,.61],[2.15,.53],[2.225,.47]],z),
        xW=z=>U.lin([[-2.225,.54],[-2.17,.62],[-2.05,.71],[-1.80,.79],[-1.50,.83],[-1.065,.83],[-.80,.81],[-.30,.79],[.40,.80],[1.00,.81],[1.375,.81],[1.66,.78],[1.92,.71],[2.08,.62],[2.17,.52],[2.225,.40]],z),
        xR=z=>U.lin([[-2.225,.36],[-2.00,.42],[-1.65,.46],[-1.33,.48],[-1.00,.50],[-.40,.51],[-.14,.54],[ZC,.64]],z),
        yBas=z=>U.lin([[-2.225,.34],[-1.95,.27],[1.90,.27],[2.225,.33]],z);
  // LES AILES : le bord extérieur (1,2 cm plus large que la coque, il plonge dans le nez et la poupe), la crête, la lèvre de l'arche (ronde)
  const fier=z=>z>0?U.lin([[ZBF,.012],[1.95,.012],[2.10,-.012]],z):U.lin([[ZBR,.012],[-1.84,.012],[-1.98,-.012]],z),
        aXo=z=>xW(z)+fier(z),aXi=z=>Math.max(.20,aXo(z)-.30),aYT=z=>yB(z)+(z>0?.02:.012),
        arc=(z,w)=>{const d=Math.abs(z-w),r=R+.04;return d<r?R+Math.sqrt(r*r-d*d):.30;},   // (19/10, Léo : « imite exactement ça ») l'arche SERRE le pneu : un cercle de 4 cm autour de la roue (une demi-ellipse de 45 cm qui bâillait)
        aYL=z=>z>0?Math.max(arc(z,ZF),U.lin([[1.80,.30],[1.95,.33]],z)):Math.max(arc(z,ZR),U.lin([[-1.70,.30],[-1.85,.33]],z));
  const aile=z=>{const xo=aXo(z),xi=aXi(z),yT=aYT(z),yL=Math.min(aYL(z),yT-.05),a=Math.min(.16,(yT-yL)*.55),s=[[xi,yT-.06]];
    for(let k=0;k<=7;k++){const t=k/7*Math.PI/2;s.push([xi+(xo-xi)*Math.sin(t),yT-a*(1-Math.cos(t))]);}   // la crête qui tombe vers le flanc
    const y1=yT-a;s.push([xo,y1-(y1-yL)*.35],[xo-.006,y1-(y1-yL)*.68],[xo-.02,yL+.022],[xo-.045,yL]);       // le flanc, la lèvre de l'arche
    s.push([(xo-.045+xi)/2,yL],[xi,yL],[xi,(yL+yT-.06)/2]);                                                 // la doublure, on remonte
    return s;};
  const aileY=(x,z)=>{const xo=aXo(z),xi=aXi(z),yT=aYT(z),yL=Math.min(aYL(z),yT-.05),a=Math.min(.16,(yT-yL)*.55);if(x<xi||x>xo)return -9;
    return yT-a*(1-Math.cos(Math.asin(Math.min(1,(x-xi)/(xo-xi)))));};
  // LA COQUE : 12 points par section ; sous une aile, la paroi passe en x = aile − 2 cm (à l'intérieur de la roue)
  const etroit=z=>(z>ZBF+.003&&z<ZNF-.003)||(z<ZBR-.003&&z>ZNR+.003);
  const SEC=z=>{
    const yb=yBas(z),xw=xW(z),t=T(z),sh=sH(z);
    const y3=Math.max(yb+.06,Math.min(.56,sh-.12)),y4=Math.max(y3+.02,sh),y5=Math.max(y4+.02,yB(z)),xc=xw-.11,tt=Math.max(t,y5),
          yv=Math.max(y4+.01,Math.min(y5,tt)-.022);
    let s;
    if(!etroit(z))s=[[0,yb],[xw-.13,yb],[xw-.065,yb+.04],[xw-.025,(yb+y3)/2+.02],[xw,y3],[xw-.008,(y3+y4)/2],[xw-.03,y4],[xw-.11,y5]];
    else{const xi=aXi(z)-.02,yH=z>0?aYT(z)-.03:yB(z)-.005;
      s=[[0,yb],[xi,yb]];for(const f of [.2,.4,.6,.8,.93])s.push([xi,yb+(yH-yb)*f]);s.push([z>0?xi+.02:xi+.01,yH]);}
    if(cab(z)){const y6=y5+.02,y7=Math.max(y6+.03,t-.05),xr=Math.min(xR(z),xw-.20);
      s.push([Math.max(xw-.16,s[7][0]+.005),y6],[xr,y7],[xr*.5,t-(t-y7)*.22],[0,Math.max(t,y7+.005)]);}
    else{const x8=Math.max(xc*.78,xc*.55+.02);s.push([Math.min(x8,s[7][0]-.01),Math.max(yv+.004,Math.min(s[7][1],yv+.02))],[Math.min(xc*.55,s[7][0]-.02),yv],[xc*.24,Math.max(yv+.002,tt-.008)],[0,Math.max(yv+.004,tt)]);}
    return s;
  };
  P.loft(zs,SEC,(j,z)=>{
    if(j===0)return 'k';
    if(etroit(z)&&j>=1&&j<=6)return 'k';                                          // la paroi sous l'aile : le fond du passage de roue
    if(cab(z)){
      if(j===8){if(z>-1.30&&z<-.76)return 'g';                                   // la custode
        if(z>-.70&&z<.24)return (z>-.14&&z<-.10)?'c':'g';                          // la vitre de porte, son déflecteur
        if(z>-.76&&z<-.70)return 'c';}                                            // le montant chromé
      if(j===9||j===10){if(z>-.14&&z<.27)return 'g';                              // le pare-brise bombé
        if(z>-1.80&&z<-.88)return 'g';}                                           // la grande lunette du hayon
    }
    return 'p';});
  {const PA=K.kit({p:{g:'p',c:0xeee3c6},k:{g:'m',c:0x131417}});const zsF=[],zsR=[];
    for(let z=ZBF;z<ZNF+.04;z+=.05)zsF.push(+z.toFixed(3));for(let d=-.48;d<=.48;d+=.04)zsF.push(+(ZF+d).toFixed(3));zsF.push(ZNF+.04);
    for(let z=ZBR;z>ZNR-.02;z-=.05)zsR.push(+z.toFixed(3));for(let d=-.48;d<=.48;d+=.04)zsR.push(+(ZR+d).toFixed(3));zsR.push(ZNR-.02);
    const net=A=>A.filter(z=>A===zsF?z>=ZBF&&z<=ZNF+.04:z<=ZBR&&z>=ZNR-.02).sort((a,b)=>a-b).filter((z,i,B)=>i===0||z-B[i-1]>.012);
    const pk=j=>j>=13&&j<=14?'k':'p';
    bulleOutils.loftLibre(PA,pk,net(zsF),aile,{bouts:true,ferme:true});bulleOutils.loftLibre(PA,pk,net(zsR),aile,{bouts:true,ferme:true});
    PA.ech=true;K.commit(PA);}
  // (19/10) la hauteur de la tôle en (x, z) : le dessus de la coque ou de l'aile (la plus haute)
  const yHaut=(x,z)=>{const s9=SEC(z);let y=-9;for(let i=s9.length-1;i>0;i--){const a=s9[i],b=s9[i-1];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0]){y=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);break;}}
    if((z>ZBF&&z<ZNF+.04)||(z<ZBR&&z>ZNR-.02))y=Math.max(y,aileY(x,z));return y;};
  // (19/10) le flanc en (y, z) : le x de la coque ou de l'aile (la plus large) à cette hauteur — une lame chromée s'y pose
  const xFlanc=(y,z)=>{const at=(s9,i0,i1)=>{let b=-9;for(let i=i0;i<i1;i++){const a=s9[i],c=s9[i+1];if((a[1]-y)*(c[1]-y)<=0&&a[1]!==c[1])b=Math.max(b,a[0]+(c[0]-a[0])*(y-a[1])/(c[1]-a[1]));}return b;};
    let x=at(SEC(z),0,7);if((z>ZBF&&z<ZNF+.04)||(z<ZBR&&z>ZNR-.02))x=Math.max(x,at(aile(z),8,12));return x;};
  // une lame chromée : depuis le centre (xs), elle tourne le coin (sur la face) puis longe le flanc (zs) — huit pans, 3,4 × 2,6 cm
  const lame=(sd,y,xs,zs)=>{const f=z=>z>0?1:-1,ch=[];for(const x of xs){const zz=f(zs[0])>0?zFace(x,y,1):zFace(x,y,-1);ch.push([sd*x,y,zz+f(zs[0])*.012]);}
    for(const z of zs){const x=xFlanc(y,z);if(x>0)ch.push([sd*(x+.012),y,z]);}
    if(ch.length>1)bulleOutils.tube(P,'c',ch,[[.013,0],[.009,.012],[0,.017],[-.009,.012],[-.013,0],[-.009,-.012],[0,-.017],[.009,-.012]],true);};
  // (la face du nez ou de la poupe en (x, y) : la tranche la plus au bout qui contient le point)
  const dansS9=(s9,x,y)=>{let c=false;const n=s9.length;for(let i=0,j=n-1;i<n;j=i++){const a=s9[i],b=s9[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        zFace=(x,y,s)=>{let a=s>0?2.075:-1.99,b=s*2.226;   /* (la recherche part du nez ou de la poupe PLEINS : sous les ailes la coque est étroite) */if(!dansS9(SEC(a),x,y))return a;for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS9(SEC(m),x,y))a=m;else b=m;}return a;};
  // LA BOUCHE OVALE : fond noir, lèvre chromée, la barrette qui la traverse
  P.put('k',new THREE.CylinderGeometry(1,1,1,16),0,.41,2.19,Math.PI/2,0,0,.22,.10,.10);
  P.put('c',new THREE.TorusGeometry(1,.09,3,14),0,.41,2.235,0,0,0,.23,.115,.5);
  P.box('c',.44,.02,.02,0,.41,2.24);P.box('c',.04,.06,.02,0,.41,2.245);
  P.box('c',.05,.05,.03,0,.53,2.215);                                             // le macaron
  P.sym(sd=>{
    // LES PHARES SOUS BULLE, au bout des ailes — (19/10, l'affinement : c'était un CRISTAL bleu nuit qui dépassait de l'aile) comme sur la
    // vraie : une découpe EN GOUTTE dans l'aile (ronde devant, pointue vers l'arrière), son jonc chromé COUCHÉ sur la tôle, le verre CLAIR
    // à peine bombé qui la ferme, et sous lui le phare rond (cuvette chromée, optique) — tout est posé à la hauteur relue dans la section
    {const N9=22,cx=.52,cz=1.975,L9=.15,W9=.072,ring=[];
      for(let i=0;i<=N9;i++){const u=i/N9*Math.PI*2,dz=L9*Math.cos(u),dx=W9*Math.sin(u)*(.55+.45*(1+Math.cos(u))/2),x=cx+dx,z=cz+dz;ring.push([sd*x,yHaut(x,z)+.006,z]);}
      bulleOutils.tube(P,'c',ring,[[.011,0],[.006,.008],[-.004,.009],[-.009,0],[-.004,-.006],[.006,-.006]],false);
      const c0=[sd*cx,yHaut(cx,cz)+.016,cz];for(let i=0;i<N9;i++)P.tri('v',c0,ring[i],ring[i+1]);
      const zl=cz+.055,ch=[sd*cx,yHaut(cx,zl)+.004,zl],d=[0,.55,1];
      bulleOutils.tour(P,'c',[[.052,0],[.047,.008],[.038,.013]],16,ch,d);bulleOutils.tour(P,'W',[[.038,.013],[.022,.016],[0,.017]],16,ch,d);}
    // les lames de pare-chocs qui encadrent la bouche, les clignotants dessous
    lame(sd,.42,[.25,.36,.45,.52],[2.20,2.15,2.08,2.00,1.92,1.86]);P.box('c',.03,.12,.04,sd*.25,.42,2.222);   // (19/10) la LAME AVANT qui tourne le coin et file le long du flanc (deux bouts de lame : la photo de Léo)
    P.box('O',.08,.035,.03,sd*.48,.47,2.115,0,sd*.45);
    // les OUÏES du capot, de part et d'autre du bossage
    for(let i=0;i<6;i++){const z=1.18+i*.075;P.box('k',.15,.01,.03,sd*.26,T(z)-.024,z,0,0,-sd*.10);}
    // flancs : poignée, rétro chromé, la coupe du capot derrière la roue, le jonc de seuil
    P.box('c',.02,.02,.12,sd*(xW(-.48)-.065),.80,-.48);
    P.box('c',.015,.05,.015,sd*.72,.93,.20);P.cyl('c',.042,.03,8,sd*.72,.965,.20,'z');
    P.box('c',.045,.015,.015,sd*.70,.912,.20);   // (2026-10-27, aucun rétro qui vole) le PIED de la tige, couché jusqu'au bas de la vitre (elle s'arrêtait 2 cm à côté)
    // (19/10) la coupe du capot-coquille et l'arrière de la portière : ce sont désormais les bords des ailes (plus de fil posé)                          // l'arrière de la porte
    // (13/10, Léo : « les barres chelou ») le jonc de seuil chromé RETIRÉ
    // la poupe ronde : petits feux sur les ailes, lames chromées, plaque
    // (17/10, l'arrière v2) LES FEUX SUR LEUR SOCLE CHROMÉ, plus marqués : le rouge bombé au-dessus, l'orange dessous ; la LAME qui tourne
    // le coin, et son BUTOIR
    // (la queue est ronde : à x 0,5 la tôle est déjà à z −2,18 — socle et verres posés DEHORS)
    {const zf=zFace(.505,.62,-1);P.put('c',new THREE.CylinderGeometry(1,1,1,12),sd*.505,.62,zf+.004,Math.PI/2,0,-sd*.25,.075,.03,.11);
    P.put('L',new THREE.SphereGeometry(1,8,5),sd*.505,.645,zf-.012,0,0,0,.062,.045,.045);P.cyl('L',.012,.01,6,sd*.505,.645,zf-.03,'z');
    P.put('O',new THREE.SphereGeometry(1,8,5),sd*.51,.585,zf-.008,0,0,0,.05,.032,.04);}   // (19/10) les feux POSÉS SUR la lame, sur la tôle (la photo de Léo)
    lame(sd,.55,[.24,.34,.44,.52],[-2.18,-2.12,-2.04,-1.96,-1.84,-1.70,-1.58,-1.50]);   // (19/10) la LAME ARRIÈRE : elle tourne le coin et longe la hanche jusqu'à l'arche (la photo de Léo)
    P.box('c',.03,.11,.04,sd*.24,.55,zFace(.24,.55,-1)-.03,.01);
  });
  P.box('c',.24,.016,.02,0,.63,-2.20);                                            // poignée de hayon
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « refais aussi l'arrière de : ROSSO 40, LE SAMOURAÏ, LA DAYTONA, LA FÉLINE, L'ICEBERG » — la revue des poupes, 2e tour) : de petits feux ronds, une plaque vierge, deux pots ; fidèle, mais minuscule de loin.
     Désormais les feux sur leur socle chromé, les retours de lame et les butoirs (dans le P.sym), et la PLAQUE éclairée par ses deux
     lampes. Les deux pots de Léo (ECH_POTS.e_feline) n'ont pas bougé. */
  P.box('k',.36,.13,.02,0,.40,-2.222);P.box('w',.32,.10,.012,0,.40,-2.234);P.box('k',.90,.05,.10,0,.30,-2.14);   // la plaque, la jupe
  P.sym(sd=>{P.box('c',.07,.03,.04,sd*.12,.475,-2.225,.35);P.box('W',.05,.014,.01,sd*.12,.462,-2.24);});        // ses deux lampes
  K.commit(P);
  /* (19/10, l'affinement — c'étaient des anneaux plats) LES ROUES À RAYONS de la vraie : la jante chromée, le fond sombre, deux nappes de
     seize rayons croisés (du moyeu à la jante, en biais), le moyeu et son écrou à oreilles ; pneu haut à flancs ronds */
  const JW=.22,hw=JW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x16171a},c:{g:'c',c:0xe4e8ed},s:{g:'m',c:0x9ba1aa},d:{g:'m',c:0x141518}});   // (19/10) rayons gris acier (blancs, ils faisaient un soleil ; la photo : fins, sur le tambour sombre)
  J.lathe('k',[[.20,-hw],[R*.86,-hw],[R*.97,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.97,hw*.72],[R*.86,hw],[.20,hw]],20,0,0,0,'x');
  J.lathe('k',[[.215,-hw],[.215,hw]],20,0,0,0,'x');J.lathe('c',[[.215,hw-.004],[.214,fx+.012],[.19,fx+.010],[.184,fx+.002],[.184,-hw+.02]],24,0,0,0,'x');   // la jante : (19/10) une large lèvre chromée plate (la photo)
  J.lathe('d',[[.184,-hw+.02],[.184,fx-.075],[0,fx-.075]],20,0,0,0,'x');                                         // le fond
  J.lathe('c',[[.048,fx-.075],[.048,fx+.012],[.036,fx+.022],[.022,fx+.026]],14,0,0,0,'x');                       // le moyeu
  const rai=(a0,a1,x0,x1)=>{const A=new THREE.Vector3(x0,.045*Math.cos(a0),.045*Math.sin(a0)),B=new THREE.Vector3(x1,.18*Math.cos(a1),.18*Math.sin(a1)),
    v=B.clone().sub(A),g=new THREE.BoxGeometry(.0055,v.length(),.0055);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    J.put('s',g,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2);};
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;rai(a,a+.40,fx-.06,fx-.022);rai(a+.13,a+.13-.40,fx+.006,fx-.02);}  // deux nappes croisées (19/10 : 48 rayons)
  J.lathe('c',[[.05,fx+.012],[.042,fx+.03],[.03,fx+.042],[0,fx+.046]],14,0,0,0,'x');                              // (19/10) le GROS PAPILLON de la photo : un cône chromé…
  for(const e of [1,-1])J.prism('c',[[0,e*.03],[.024,e*.10],[.012,e*.11],[-.012,e*.11],[-.024,e*.10],[0,e*.03]].map(p=>[p[0],p[1]]),.016,fx+.036);   // …et ses deux oreilles
  const JG=J.done();
  return {hl:[.535,.625,2.03],tl:[.50,.585,-2.20],wx:.68,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe9ecf0}};
},
