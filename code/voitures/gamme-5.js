  e_murduson:function(K){
  const U=LPU,R=.28,ZF=1.62,ZR=-2.12,XN=.70;
  const P=K.kit({p:{g:'p',c:0xf4f4f0},o:{g:'o',c:0xd9a520},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    s:{g:'s',c:0x8c9098},g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},J:{g:'l',c:0xffb24a}});
  // LE FUSELAGE : une flèche à huit pans, du cône de nez à la queue
  const zs=[-3.00,-2.70,-2.40,-2.10,-1.60,-1.20,-.60,.30,.90,1.60,2.20,2.60,2.85,3.00];
  const fw=z=>U.lin([[-3.00,.50],[-2.70,.52],[-2.10,.46],[-1.20,.36],[.60,.36],[1.80,.30],[2.60,.17],[2.85,.09],[3.00,.03]],z),
        fb=z=>U.lin([[-3.00,.30],[-2.40,.30],[2.20,.30],[2.85,.44],[3.00,.52]],z),
        ft=z=>U.lin([[-3.00,.76],[-2.40,.92],[-.60,1.02],[.30,1.04],[1.60,.92],[2.60,.70],[2.85,.62],[3.00,.56]],z);
  P.loft(zs,z=>{const w=fw(z),b=fb(z),t=ft(z),m=(b+t)/2;
    return [[0,b],[w*.62,b],[w,b+(m-b)*.45],[w,m+(t-m)*.20],[w*.92,m+(t-m)*.60],[w*.66,t-(t-m)*.10],[w*.30,t],[0,t]];
  },(j,z)=>j===0?'k':'p');
  // LA VERRIÈRE, bulle de pilote sur le dos, et son cadre d'or
  P.put('g',new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2),0,1.02,.90,0,0,0,.22,.20,.62);
  P.put('o',new THREE.TorusGeometry(1,.05,3,12),0,1.025,.90,Math.PI/2,0,0,.225,.63,.5);
  P.cyl('c',.012,.26,6,0,.55,3.12,'z');                                          // la perche de Pitot
  P.box('k',.22,.014,1.30,0,.853,1.95,.19);                                        // le panneau anti-reflet, noir mat, devant la bulle
  P.sym(sd=>{
    // LES RÉACTEURS : fût, entrée d'air chromée à cône, bague d'or, tuyère en bout
    P.lathe('p',[[.30,2.32],[.355,2.12],[.36,1.40],[.35,.30],[.31,-.40],[.28,-.56]],12,sd*XN,.66,0,'z');
    P.lathe('c',[[.25,2.30],[.33,2.36],[.30,2.31]],12,sd*XN,.66,0,'z');
    P.cyl('k',.26,.04,12,sd*XN,.66,2.28,'z');
    P.cyl('c',.02,.26,8,sd*XN,.66,2.38,'z',.11);                                   // le cône d'entrée
    P.lathe('o',[[.363,1.86],[.363,1.74]],12,sd*XN,.66,0,'z');
    P.lathe('s',[[.28,-.56],[.25,-.76],[.23,-.80]],12,sd*XN,.66,0,'z');           // la tuyère
    P.cyl('k',.22,.03,12,sd*XN,.66,-.79,'z');P.cyl('J',.13,.02,10,sd*XN,.66,-.80,'z'); // le cœur encore rouge
    P.box('p',.20,.14,2.20,sd*.42,.70,.80);                                        // le pylône qui les lie au fuselage
    P.box('o',.012,.03,2.80,sd*(XN+.362),.66,.85);                                // le filet d'or des réacteurs
    // LES CARÉNAGES ARRIÈRE : une nacelle par roue, une aile-moignon, la tuyère d'éjection en bout
    P.lathe('p',[[.05,-1.30],[.20,-1.55],[.30,-1.95],[.30,-2.40],[.18,-2.72],[.05,-2.82]],10,sd*XN,.42,0,'z');
    P.lathe('o',[[.302,-1.82],[.302,-1.72]],10,sd*XN,.42,0,'z');
    // les deux TUYÈRES D'ÉJECTION dans la poupe
    P.cyl('s',.10,.16,10,sd*.48,.45,-3.04,'z');P.cyl('k',.08,.02,10,sd*.48,.45,-3.125,'z');P.cyl('J',.05,.02,8,sd*.48,.45,-3.13,'z');
    P.box('W',.10,.04,.02,sd*.14,.56,2.72,0,sd*.6);                                // feux de nez
    P.box('L',.14,.05,.02,sd*.24,.66,-3.005);
    P.box('o',.012,.025,4.60,sd*.345,.70,-.30);                                    // le filet d'or du fuselage
  });
  // LA DÉRIVE d'avion et son empennage
  P.prism('p',[[-2.95,.88],[-2.10,.94],[-2.62,1.40],[-3.02,1.40]],.07,0);
  P.prism('o',[[-2.62,1.40],[-3.02,1.40],[-3.02,1.43],[-2.60,1.43]],.075,0);
  P.box('p',1.10,.04,.34,0,1.14,-2.86);P.box('o',1.10,.042,.03,0,1.14,-2.70);
  K.commit(P);
  return {hl:[.14,.56,2.74],tl:[.24,.66,-3.01],wx:XN,wzF:ZF,wzR:-ZR,pots:[[-.48,.45,-3.14],[.48,.45,-3.14],[-XN,.66,-.82],[XN,.66,-.82]], // (pots) les tuyères de la poupe ET les deux réacteurs
          lpw:{R:R,w:.20,style:'enjoliveur',jante:0xe9ecf0}};
},
  e_dragon:function(K){
  const U=LPU,R=.37,ZF=1.40,ZR=-1.40;
  const P=K.kit({p:{g:'o',c:0xd9a520},q:{g:'o',c:0x9c6a10,f:0},k:{g:'m',c:0x121316},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xf2ead8},
    g:{g:'g',c:0x1a1410},J:{g:'l',c:0xffc62a},L:{g:'l',c:0xff2a1a},F:{g:'l',c:0xff7a18}});
  const AR=[[0,2*R+.03],[R*.60,2*R-.02],[R*.98,R*1.10],[R+.13,.26]];
  let zs=[-2.35,-2.25,-1.90,-.80,-.70,-.10,.40,.75,.85,2.00,2.20,2.35];
  for(const w of [ZF,ZR])for(const d of [0,R*.60,R*.98,R+.13])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z>-.81&&z<.86,hmp=(z,w)=>{const d=Math.abs(z-w)/.95;return d>=1?0:1-d*d;};
  const T=z=>U.lin([[-2.35,.74],[-2.25,.80],[-1.90,.84],[-.80,.96],[-.10,1.10],[.40,1.07],[.75,.82],[.85,.76],[2.00,.52],[2.20,.44],[2.35,.36]],z),
        yB=z=>U.lin([[-2.35,.70],[-2.25,.76],[-.60,.74],[.40,.70],[.85,.66],[2.00,.52],[2.20,.44],[2.35,.38]],z)+.18*hmp(z,ZR)+.15*hmp(z,ZF), // les ÉPAULES du dragon
        xW=z=>U.lin([[-2.35,.94],[-2.20,1.02],[-1.30,1.05],[-.60,.96],[.20,.92],[.90,.96],[1.30,1.00],[2.00,.94],[2.35,.76]],z);
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.26),xw=xW(z),b=yB(z),t=T(z);
    const s=[[0,yb],[xw-.07,yb],[xw-.02,Math.max(.40,yb+.05)],[xw,Math.max(yb+.08,b-.22)],[xw-.05,b]];
    if(cab(z)){const xr=U.lin([[-.80,.44],[-.10,.50],[.40,.50],[.85,.58]],z);s.push([xw-.26,b+.01],[xr,Math.max(b+.03,t-.07)],[0,t]);}
    else s.push([xw-.24,b-.01],[.42,Math.min(b-.05,Math.max(t,(b+t)/2))],[0,t]);   // le capot CREUSE entre les épaules
    return s;
  },(j,z)=>{
    if(j<=2)return 'k';                                                           // le ventre de carbone noir
    if(cab(z)&&j===5&&z>-.70)return 'g';                                           // la verrière de chasse
    if(cab(z)&&j===6)return z>.40?'g':'K';                                         // pare-brise, toit noir
    return 'p';});
  // LA CORNE, plantée au bout du nez, et sa petite sœur
  P.put('p',new THREE.CylinderGeometry(0,.10,.62,5),0,.52,2.28,Math.PI/2-.42,0,0);
  P.put('q',new THREE.CylinderGeometry(0,.06,.30,5),0,.58,1.96,Math.PI/2-.62,0,0);
  // LES YEUX DE DRAGON : amande ambre sous une arcade noire, pupille fendue
  const eye=new THREE.Shape();eye.moveTo(-.17,-.02);eye.lineTo(-.06,.045);eye.lineTo(.12,.05);eye.lineTo(.18,.015);eye.lineTo(.07,-.035);eye.lineTo(-.09,-.04);eye.lineTo(-.17,-.02);
  const eg=new THREE.ExtrudeGeometry(eye,{depth:.02,bevelEnabled:false});
  P.sym(sd=>{
    P.put('k',eg.clone(),sd*.62,.535,2.085,-1.00,sd*.40,sd*.22,sd*1.55,1.9,1);        // l'arcade sourcilière
    P.put('J',eg.clone(),sd*.62,.543,2.10,-1.00,sd*.40,sd*.22,sd*1.30,1.35,1);
    P.box('k',.026,.10,.03,sd*.63,.552,2.108,-1.00,sd*.40,0);                         // la pupille fendue
  });
  eg.dispose();
  // LA GUEULE : prise d'air noire et deux crocs
  P.box('k',1.40,.13,.06,0,.28,2.33);
  P.sym(sd=>{P.put('c',new THREE.CylinderGeometry(.04,0,.14,4),sd*.40,.26,2.37,0,0,0);
    P.box('k',.02,.06,.40,sd*.70,.24,2.20,0,sd*.25);});                               // les ailettes du bouclier
  // LES ÉCAILLES : des pointes de diamant qui se chevauchent sur les épaules, en deux ors
  const sc=new THREE.CylinderGeometry(0,.11,.032,4,1,true);
  const eca=(x,y,z,k,a)=>P.put(k,sc.clone(),x,y,z,-.22,0,a,1,1,1.5);
  P.sym(sd=>{
    for(const [W,ni] of [[ZR,6],[ZF,5]])for(let r=0;r<2;r++)for(let i=0;i<ni;i++){
      const z=W+.44-i*.17-r*.085,x=xW(z)-.10-r*.08;eca(sd*x,yB(z)+.008-r*.012,z,'q',sd*(.10+r*.14));}
    // flancs : les naseaux d'aération, le rétro-lame
    P.prism('k',[[-.45,.40],[-1.00,.42],[-.95,.72],[-.55,.66]],.04,sd*(xW(-.72)+.005));
    P.box('k',.03,.10,.04,sd*.80,.80,.60);P.box('p',.16,.05,.18,sd*.86,.85,.60,0,0,-sd*.25);
    // LES LAMES-AILERONS : la dérive repliée sur l'épaule arrière, bordée d'or
    P.prism('k',[[-1.55,.96],[-2.30,1.14],[-2.42,1.14],[-2.30,.86],[-1.90,.86]],.04,sd*.80);
    P.prism('p',[[-2.30,1.14],[-2.42,1.14],[-2.42,1.17],[-2.28,1.17]],.045,sd*.80);
    // la poupe : feux-griffes, tuyères
    P.box('L',.44,.035,.02,sd*.58,.70,-2.355,0,0,sd*.18);P.box('L',.30,.03,.02,sd*.62,.62,-2.355,0,0,sd*.18);
    P.cyl('c',.10,.14,10,sd*.46,.43,-2.36,'z');P.cyl('k',.08,.02,10,sd*.46,.43,-2.43,'z');P.cyl('F',.05,.02,8,sd*.46,.43,-2.435,'z');
  });
  sc.dispose();
  // l'AILERON-LAME tendu entre les deux dérives : lame noire, bord d'attaque d'or, bord de fuite en ailes de chauve-souris
  P.box('k',1.60,.03,.30,0,1.13,-2.28,.08);P.box('p',1.60,.035,.035,0,1.145,-2.13);
  for(let i=0;i<4;i++)P.box('k',.34,.03,.10,(i/3-.5)*1.20,1.12,-2.45,.08,0,0);
  // L'ÉCHINE : piquants d'or le long du dos, du toit à la queue
  for(let i=0;i<5;i++){const z=-.95-i*.26,h=.17-i*.02,y=T(z);P.prism(i%2?'q':'p',[[z+.07,y-.03],[z-.18,y-.03],[z-.16,y+h]],.05,0);}
  P.box('k',1.80,.30,.02,0,.60,-2.355);                                            // la poupe noire
  for(let i=0;i<5;i++)P.box('k',.02,.12,.26,(i/4-.5)*1.10,.30,-2.26);             // les ailettes du diffuseur
  K.commit(P);
  return {hl:[.62,.54,2.14],tl:[.58,.70,-2.37],wx:.84,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.32,style:'rayons',n:6,jante:0xd9a520,accent:0x1a1b1f}};
},
  a_mastodonte:function(K){
  /* LE MASTODONTE — le pick-up perché sur des pneus de tracteur : caisse de camionnette des années 80
     posée à hauteur d'homme, châssis-échelle, ponts et AMORTISSEURS chromés à l'air libre, rampe de
     phares sur le toit, flammes orange sur le capot et les flancs. */
  const U=LPU,R=.80,ZF=1.48,ZR=-1.48,YB=1.45;
  const P=K.kit({p:{g:'p',c:0x1463ff},F:{g:'p',c:0xff7a14,f:0},Y:{g:'p',c:0xffc21a,f:0},k:{g:'m',c:0x141518},
    K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1a2632},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,1.90],[R*.78,1.86],[R+.06,YB+.01]];
  const ZE=2.36,CW=1.10,RF=.62,RR=-.30,CB=-.40,BS=-.44,H=2.12,C=2.78,BL=2.10;
  const zs=[-ZE,-2.30,BS,CB,RR,RF,CW,2.26,ZE];
  for(const w of [ZF,ZR])for(const d of [R*.78,R+.06])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const xw=.95,yC=z=>U.lin([[RR,C],[RF,C],[CW,H+.02]],z);
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,YB),y2=yb+.05;
    const s=[[0,yb],[xw-.05,yb],[xw,y2]];
    if(z>CW)s.push([xw,H-.07],[xw-.03,H-.02],[xw-.10,H],[xw-.40,H+.005],[0,H+.01]);
    else if(z>CB-.001){const c=yC(z),xr=U.lin([[CB,.82],[RR,.80],[RF,.80],[CW,.88]],z);
      s.push([xw,BL-.05],[xw-.03,BL],[xr,Math.max(BL+.02,c-.06)],[xr-.08,c],[0,c+.01]);}
    else s.push([xw,BL-.05],[xw-.03,BL],[xw-.08,BL-.01],[xw-.09,1.76],[0,1.74]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(z<CB&&z>BS)return 'p';
    if(z<BS&&j>=5)return 'k';                                        /* la benne, doublée noir */
    if(j===5&&z>CB&&z<CW)return (z>RR+.02&&z<CW-.06)?'g':'p';
    if(j>=6&&z>RF&&z<CW)return 'g';
    return 'p';});
  /* la lunette de cabine */
  P.box('g',1.30,.40,.02,0,2.50,CB+.012);
  /* LE CHÂSSIS À L'AIR : longerons, ponts, différentiels, amortisseurs chromés */
  P.sym(sd=>P.box('k',.12,.16,4.30,sd*.42,1.24,0));
  for(const w of [ZF,ZR]){P.cyl('k',.10,1.60,8,0,R,w,'x');P.cyl('k',.22,.26,8,.10,R,w,'z');
    P.sym(sd=>{const dz=w>0?-.30:.30;
      P.put('c',new THREE.CylinderGeometry(.05,.05,.72,6),sd*.60,1.16,w+dz,0,0,sd*.30);
      P.put('k',new THREE.CylinderGeometry(.08,.08,.30,6),sd*.66,1.00,w+dz,0,0,sd*.30);});}
  /* LA RAMPE DE PHARES sur le toit */
  P.box('k',1.44,.07,.10,0,C+.08,.20);P.sym(sd=>P.box('k',.05,.10,.05,sd*.66,C+.03,.20));
  for(const x of [-.54,-.18,.18,.54]){P.box('k',.16,.14,.08,x,C+.15,.20);P.cyl('W',.06,.03,6,x,C+.15,.25,'z');}
  /* LA FACE : calandre à grille, phares carrés, pare-buffle tubulaire */
  P.box('c',1.50,.40,.03,0,1.84,ZE+.005);P.box('K',1.40,.32,.02,0,1.84,ZE+.02);
  for(let i=-3;i<=3;i++)P.box('c',.02,.30,.02,i*.20,1.84,ZE+.03);P.box('c',1.40,.02,.02,0,1.84,ZE+.03);
  P.sym(sd=>{P.box('c',.30,.20,.03,sd*.74,1.86,ZE+.005);P.box('W',.24,.14,.03,sd*.74,1.86,ZE+.015);
    P.box('O',.12,.06,.02,sd*.74,1.66,ZE+.01);
    P.box('L',.10,.36,.03,sd*.86,1.86,-ZE-.01);
    P.box('k',.05,.05,.20,sd*.97,2.30,.95);P.box('k',.06,.32,.20,sd*1.06,2.32,.88);
    /* les deux pots qui plongent vers l'arrière */
    P.put('c',new THREE.CylinderGeometry(.06,.06,.84,8),sd*.57,.825,-2.105,.665,0,0);
    P.cyl('K',.045,.02,8,sd*.57,.50,-2.37,'z');
  });
  P.cyl('k',.07,1.90,6,0,1.52,ZE+.04,'x');P.sym(sd=>P.box('k',.10,.40,.08,sd*.62,1.66,ZE+.03));
  P.cyl('k',.06,1.70,6,0,1.55,-ZE-.015,'x');
  /* LES FLAMMES : sur le capot, et le long des flancs */
  for(const [x,zt,w] of [[0,1.20,.20],[-.36,1.45,.18],[.36,1.45,.18],[-.68,1.75,.14],[.68,1.75,.14]]){
    P.tri('F',[x-w,H+.02,2.34],[x+w,H+.02,2.34],[x+.06,H+.02,zt]);P.tri('Y',[x-w*.5,H+.024,2.34],[x+w*.5,H+.024,2.34],[x+.03,H+.024,(zt+2.38)/2+.10]);}
  P.tri('F',[-.84,H+.02,2.34],[.84,H+.02,2.34],[.84,H+.02,2.20]);P.tri('F',[-.84,H+.02,2.34],[.84,H+.02,2.20],[-.84,H+.02,2.20]);
  P.sym(sd=>{const x=sd*(xw+.004);
    P.tri('F',[x,1.93,2.32],[x,2.07,2.32],[x,2.07,.95]);P.tri('F',[x,1.93,2.32],[x,2.07,.95],[x,1.93,.95]);
    for(const [z0,ya,yb,zt,yt] of [[1.00,1.95,2.07,-.58,2.03],[.62,1.80,1.98,-.42,1.86],[.60,1.64,1.82,-.18,1.66]]){
      P.tri('F',[x,ya,z0],[x,yb,z0],[x,yt,zt]);P.tri('Y',[x,ya+.03,z0],[x,yb-.03,z0],[x,yt,(zt+z0)/2]);}
  });
  K.commit(P);
  return {hl:[.74,1.86,ZE+.03],tl:[.86,1.86,-ZE-.03],wx:1.00,wzF:ZF,wzR:-ZR,pots:[[-.57,.50,-2.39],[.57,.50,-2.39]], // (pots) la bouche des deux pots qui plongent
          lpw:{R:R,w:.62,style:'rayons',n:16,jante:0xe6e9ee,accent:0xe6e9ee,crampons:1,creux:.12,ecrous:6}}; // (19/10, JAPONAISES) la jante de Bigfoot : une CUVETTE chromée de 12 cm (seize branches serrées, presque pleine), six écrous
 },
  b_groupeb:function(K){
  const U=LPU,R=.33,ZF=1.28,ZR=-1.26;
  const P=K.kit({p:{g:'p',c:0xf4f4f0},n:{g:'m',c:0x141518},K:{g:'g',c:0x0c0e12},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xe9ecf0},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    b:{g:'p',c:0x1f4fd8,f:0},y:{g:'p',c:0xffc61a,f:0},r:{g:'p',c:0xd8261e,f:0},
    R:{g:'l',c:0x7a1018},w:{g:'l',c:0xd9dce0},a:{g:'c',c:0x9aa2ab}}); // (17/10, l'arrière v2) R, w (la plaque éclairée), a (l'alu du sabot) — aucune famille de plus
  const AR=[[0,2*R+.05],[R*.82,2*R+.03],[R+.11,.26]];
  const zs=[-1.915,-1.88,-1.78,-1.55,-1.45,-1.25,-1.19,-.60,-.52,-.45,.30,.38,1.05,1.85,1.915];
  for(const d of [R*.82,R+.11])zs.push(ZR-d,ZR+d);
  for(const d of [R*.82,R+.11,.47,.55])zs.push(ZF-d,ZF+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-1.915,.94],[-1.88,.98],[-1.78,1.00],[-1.55,1.33],[-1.45,1.35],[.30,1.35],[.38,1.33],[1.05,.92],[1.85,.66],[1.915,.60]],z),
        yB=z=>U.lin([[-1.915,.92],[-1.78,.97],[-.45,.93],[1.05,.90],[1.85,.66],[1.915,.60]],z),
        fF=z=>U.cl((.55-Math.abs(z-ZF))/.08,0,1),fR=z=>U.cl((-.45-z)/.15,0,1),
        xS=z=>U.lin([[-1.915,.74],[-1.86,.77],[1.84,.77],[1.915,.72]],z),
        win=z=>z>-1.25&&z<1.05;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.26),xs=xS(z),xw=xs+.05*fF(z)+.075*fR(z),c=yC(z),bl=yB(z);
    const y3=Math.max(.74,yb+.08),y5=Math.max(bl,y3+.07),y6=y5+.02,y7=Math.max(y6+.004,c-.045),y8=Math.max(y7+.003,c-.01);
    return [[0,yb],[xw-.06,yb],[xw,yb+.05],[xw,y3],[xs,y3+.03],[xs,y5],[xs-.02,y6],[xs-.02-.05*U.cl((y7-y6)/.25,0,1),y7],[xs-.19,y8],[0,Math.max(y8+.002,c)]];
  },(j,z)=>{
    if(j<0)return 'p';
    if(j<=1)return 'n';
    if(j>=2&&j<=3&&z>-.60&&z<-.45)return 'n';                                  // l'OUÏE : le front de l'aile élargie
    if(j===6&&win(z))return (z>-.52&&z<-.45)?'n':'g';                         // vitres, montant B
    if((j===5||j===7)&&win(z))return 'n';                                      // encadrements noirs
    if(j===8&&z>.38&&z<1.05)return 'g';                                        // pare-brise
    if(j===8&&z>-1.78&&z<-1.55)return 'g';                                     // hayon
    return 'p';});
  // L'ÉCOPE DE PAVILLON, bouche vers l'avant
  P.prism('p',[[-.62,1.35],[-.78,1.45],[-1.40,1.43],[-1.48,1.35]],.46,0);P.box('n',.40,.07,.02,0,1.41,-.785);
  P.box('n',1.30,.035,.20,0,1.365,-1.60,.12);                                  // becquet de hayon
  // LA RAMPE : quatre longues portées sur une barre noire, devant la calandre
  P.box('n',1.16,.05,.10,0,.73,1.92);
  P.sym(sd=>{
    for(const x of [.17,.45]){P.cyl('n',.085,.08,8,sd*x,.80,1.93,'z');P.cyl('c',.075,.02,8,sd*x,.80,1.975,'z');P.cyl('W',.062,.03,8,sd*x,.80,1.98,'z');}
    P.box('W',.28,.10,.02,sd*.53,.64,1.918);P.box('O',.08,.10,.02,sd*.72,.64,1.915);
    /* (17/10, l'arrière v2) LE FEU EN VOLUME dans sa coque noire : le rouge strié, l'orange ; le catadioptre du pare-chocs */
    P.box('n',.50,.19,.04,sd*.55,.83,-1.935);
    P.box('L',.30,.14,.012,sd*.60,.83,-1.958);for(const y of [.79,.83,.87])P.box('n',.30,.014,.006,sd*.60,y,-1.966);
    P.box('O',.08,.14,.012,sd*.405,.83,-1.958);
    P.box('R',.10,.03,.012,sd*.66,.43,-1.932);
    P.box('b',.012,.035,1.62,sd*(xS(0)+.004),.60,.01);P.box('y',.012,.035,1.62,sd*(xS(0)+.004),.56,.01);P.box('r',.012,.035,1.62,sd*(xS(0)+.004),.52,.01);
    P.box('n',.02,.18,.36,sd*.85,.80,-.80);                                     // grille d'ouïe
    for(const y of [.74,.80,.86])P.box('p',.024,.012,.34,sd*.85,y,-.80);
    P.box('p',.05,.08,.14,sd*.82,.98,.88);P.box('n',.06,.04,.06,sd*.78,.95,.88);  // rétros
    P.box('n',.012,.03,.12,sd*.775,.86,-.20);
    P.box('r',.02,.20,.18,sd*.70,.32,ZF-R-.16);P.box('r',.02,.20,.18,sd*.76,.32,ZR-R-.16); // bavettes
    P.cyl('c',.045,.08,8,sd*.37,.30,-1.93,'z');
  });
  P.box('n',.52,.09,.02,0,.64,1.918);for(const y of [.62,.66])P.box('c',.50,.008,.02,0,y,1.925);
  P.box('n',1.64,.20,.12,0,.36,1.87);P.box('n',.90,.05,.02,0,.33,1.935);
  P.box('n',1.72,.20,.12,0,.38,-1.87);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'étaient des feux
     en pavés de part et d'autre d'une grille plate et un pare-chocs en boîte. Désormais les feux en volume (dans le P.sym), et ici : la
     GRILLE en relief (cadre, cinq lames), la PLAQUE de rallye, la SANGLE DE REMORQUAGE rouge sous le pare-chocs, le SABOT d'alu boulonné.
     Le pot latéral de Léo (ECH_POTS.b_groupeb) n'a pas bougé. */
  P.box('n',.60,.19,.04,0,.83,-1.935);for(let i=0;i<5;i++)P.box('K',.54,.014,.03,0,.762+i*.034,-1.955,-.35); // la grille en relief
  P.box('n',.42,.13,.012,0,.62,-1.918);P.box('w',.38,.10,.012,0,.62,-1.925);                                  // la plaque
  P.put('r',new THREE.TorusGeometry(1,.22,4,12),-.42,.235,-1.935,0,0,0,.05,.075,.06);P.box('r',.035,.06,.02,-.42,.30,-1.935); // la sangle
  P.box('a',1.10,.025,.26,0,.27,-1.80);for(const x of [-.45,-.15,.15,.45])P.cyl('n',.014,.01,6,x,.255,-1.90,'y'); // le sabot, ses boulons
  K.commit(P);
  return {hl:[.53,.64,1.93],tl:[.55,.83,-1.93],wx:.74,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'rayons',n:8,jante:0xf2f2ee,accent:0xf2f2ee}};
},
  c_hotrod:function(K){
  /* LE HOT ROD v3 (2026-10-19, Léo sur la planche du v2 : « au style poly tu peux vraiment faire mieux : concentre-toi sur la STRUCTURE — il y a un
     truc qui vole dans les airs ; inspire-toi des gros plans ; le moteur, c'est là que tu peux jouer avec les mini-cubes, recherche le modèle »).
     Le coupé « trois fenêtres » de 1932, rouge, en « highboy », bâti de BAS EN HAUT, chaque pièce posée sur une autre (le v2 avait la calandre à
     9 cm au-dessus de sa traverse, le moteur sans supports, la lame de ressort sans jumelles) :
     · le CHÂSSIS rouge à facettes : les longerons sous la caisse (on les voit sous les portes), qui se resserrent, remontent sous la calandre et
       plongent en CORNES jusqu'à la barre chromée ; la traverse du ressort, le support de radiateur, la traverse de boîte ;
     · la CAISSE posée DESSUS (le bas à 0,50 = le haut des longerons), le toit et sa gouttière, les encadrements de vitres, la porte en fente C ;
     · la COQUILLE de calandre sur son support et sur les longerons, le radiateur derrière ;
     · l'ESSIEU surbaissé chromé, la LAME transversale serrée sous sa traverse et tenue par ses jumelles, les jambes de force en épingle, les
       amortisseurs, la direction ;
     · les PHARES-OBUS sur leurs pieds, boulonnés aux longerons ;
     · LE MOTEUR, en mini-cubes : un V8 HEMI Chrysler (392) — les bougies au milieu de la culasse : les fils ROUGES entrent par le DESSUS des
       grands couvre-culasses polis à ailettes (c'est ce qui le signe) —, deux quadruple-corps sur une pipe haute, la grande ÉCOPE polie, les
       collecteurs tubulaires quatre-en-un, posé sur ses SUPPORTS entre les longerons ; derrière lui la cloche et la boîte, sous le plancher. */
  const U=LPU,ZF=1.60,ZR=-1.09,RR9=.38,RF9=.31;
  const PAL9={p:{g:'p',c:0x761a21},k:{g:'m',c:0x121317},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1c2733},
    e:{g:'p',c:0xb3121a,f:0},C:{g:'c',c:0x8f96a1},Y:{g:'s',c:0xb89a52},b:{g:'s',c:0xf1eee6},n:{g:'m',c:0x2a0d10},h:{g:'s',c:0x9ea4ac},B:{g:'p',c:0x2e6fd8,f:0},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},w:{g:'l',c:0xd9dce0}};               // h : les collecteurs (acier gris) · B : le boîtier d'allumage bleu
  const P=K.kit(fentePal(PAL9));                                                    // 'J' / 'Jf' : la FENTE C des ouvrants
  // ---- les outils : un tube, une poutre CHANFREINÉE (section en octogone, le style poly) d'un point à un autre, une boîte chanfreinée ----
  const tige=(k,a,b,r)=>poutreF(k,a,b,2*r,2*r,r*.58);                              // un tube = un prisme à huit pans (posé triangle par triangle)
  const oct=(w,h,c)=>{const s=new THREE.Shape(),x=w/2,y=h/2;c=Math.min(c,x*.9,y*.9);s.moveTo(-x+c,-y);s.lineTo(x-c,-y);s.lineTo(x,-y+c);s.lineTo(x,y-c);s.lineTo(x-c,y);
    s.lineTo(-x+c,y);s.lineTo(-x,y-c);s.lineTo(-x,-y+c);s.lineTo(-x+c,-y);return s;};
  /* LE PRISME OCTOGONAL posé triangle par triangle (une ExtrudeGeometry par pièce triangulait chaque fois sa forme : 85-105 ms pour la caisse,
     ~30 ms ainsi) : de a à b, section w (travers) × h (hauteur) aux coins coupés de c, roulée de `roll` ; `sv` impose le travers. */
  const cr=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],nz=u=>{const l=Math.hypot(u[0],u[1],u[2])||1;return [u[0]/l,u[1]/l,u[2]/l];};
  const poutreF=(k,a,b,w,h,c,roll,sv)=>{let d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(d[0],d[1],d[2])||1e-6;d=[d[0]/L,d[1]/L,d[2]/L];
    const e=.003,A0=[a[0]-d[0]*e,a[1]-d[1]*e,a[2]-d[2]*e],B0=[b[0]+d[0]*e,b[1]+d[1]*e,b[2]+d[2]*e];
    let s=sv?nz(sv):(Math.abs(d[1])>.92?[1,0,0]:nz(cr([0,1,0],d)));const u=nz(cr(d,s));s=nz(cr(u,d));
    const x=w/2,y=h/2;c=Math.min(c==null?Math.min(w,h)*.25:c,x*.9,y*.9);const Q=[[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]],cs=Math.cos(roll||0),sn=Math.sin(roll||0);
    const pt=(o,q)=>{const px=q[0]*cs-q[1]*sn,py=q[0]*sn+q[1]*cs;return [o[0]+s[0]*px+u[0]*py,o[1]+s[1]*px+u[1]*py,o[2]+s[2]*px+u[2]*py];};
    const RA=Q.map(q=>pt(A0,q)),RB=Q.map(q=>pt(B0,q)),M=[(A0[0]+B0[0])/2,(A0[1]+B0[1])/2,(A0[2]+B0[2])/2];
    const T3=(p,q,r,o)=>{const n=cr([q[0]-p[0],q[1]-p[1],q[2]-p[2]],[r[0]-p[0],r[1]-p[1],r[2]-p[2]]);if(n[0]*o[0]+n[1]*o[1]+n[2]*o[2]<0)P.tri(k,p,r,q);else P.tri(k,p,q,r);};
    for(let i=0;i<8;i++){const j=(i+1)%8,f=[(RA[i][0]+RB[j][0])/2-M[0],(RA[i][1]+RB[j][1])/2-M[1],(RA[i][2]+RB[j][2])/2-M[2]];T3(RA[i],RA[j],RB[j],f);T3(RA[i],RB[j],RB[i],f);}
    for(let i=1;i<7;i++){T3(RA[0],RA[i],RA[i+1],[-d[0],-d[1],-d[2]]);T3(RB[0],RB[i],RB[i+1],d);}};
  const poutre=(k,a,b,w,h,c)=>poutreF(k,a,b,w,h,c);
  const boite=(k,w,h,L,c,x,y,z,rz)=>poutreF(k,[x,y,z-L/2],[x,y,z+L/2],w,h,c,rz||0,[1,0,0]);
  const cube=(k,w,h,L,x,y,z)=>poutreF(k,[x,y,z-L/2],[x,y,z+L/2],w,h,0,0,[1,0,0]);       // le mini-cube (sans BoxGeometry)
  // ================= LE CHÂSSIS (rouge, à facettes) =================
  const LG=[[.675,.41,-.62],[.675,.41,.45],[.45,.41,.82],[.33,.38,1.05],[.30,.40,1.55],[.27,.50,1.76],[.27,.37,1.97]];   // [x, y du milieu, z] du longeron, de la porte à la corne
  P.sym(sd=>{
    for(let i=0;i<LG.length-1;i++){const a=LG[i],b=LG[i+1],h=i<2?.18:i<5?.16:.14;poutre('p',[sd*a[0],a[1],a[2]],[sd*b[0],b[1],b[2]],.07,h,.018);}
    poutre('p',[sd*.675,.41,-.62],[sd*.48,.57,-.80],.07,.17,.018);poutre('p',[sd*.48,.57,-.80],[sd*.48,.57,-1.40],.065,.17,.018);   // le « kick-up » sur l'essieu
    poutre('p',[sd*.48,.57,-1.40],[sd*.48,.48,-1.74],.065,.15,.018);
  });
  poutre('p',[-.30,.44,ZF+.02],[.30,.44,ZF+.02],.10,.09,.02);                       // la traverse du ressort
  poutre('p',[-.27,.53,1.74],[.27,.53,1.74],.08,.05,.015);                          // le support de radiateur (la calandre s'y pose)
  poutre('p',[-.64,.38,.55],[.64,.38,.55],.08,.07,.015);                            // la traverse de boîte
  poutre('p',[-.48,.48,-1.74],[.48,.48,-1.74],.08,.08,.02);                         // la traverse arrière
  tige('c',[-.29,.37,1.97],[.29,.37,1.97],.022,8);                                  // la barre chromée, au bout des cornes
  // ================= LA CAISSE, posée sur les longerons =================
  const AR=[[0,.84],[.19,.81],[.33,.71],[.38,.62],[.43,.50]];                       // l'arche de la roue arrière, dans le flanc
  let zs=[-1.76,-1.73,-1.68,-1.60,-1.50,-1.40,-1.00,-.94,-.86,-.78,-.68,-.55,-.42,-.20,.05,.24,.30,.36,.44,.50,.58,.65,.70,.735,.755,.77];
  for(const d of [.19,.33,.38,.43])zs.push(ZR-d,ZR+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const T=z=>U.lin([[-1.76,.62],[-1.73,.74],[-1.68,.84],[-1.60,.92],[-1.50,.99],[-1.40,1.04],[-1.25,1.075],[-1.10,1.10],[-1.00,1.12],[-.94,1.17],
                     [-.86,1.25],[-.78,1.32],[-.68,1.38],[-.55,1.42],[-.42,1.44],[.24,1.44],[.30,1.43],[.36,1.27],[.44,1.115],[.50,1.11],[.58,1.10],[.65,1.085],[.70,1.06],[.735,1.03],[.755,.995],[.77,.95]],z),
        yB=z=>U.lin([[-1.76,.60],[-1.73,.72],[-1.68,.82],[-1.60,.90],[-1.50,.97],[-1.40,1.02],[-1.25,1.055],[-1.10,1.08],[.44,1.08],[.50,1.05],[.58,1.025],[.65,1.005],[.70,.985],[.735,.96],[.755,.93],[.77,.89]],z),
        xW=z=>U.lin([[-1.76,.46],[-1.73,.56],[-1.68,.63],[-1.60,.68],[-1.50,.71],[-1.40,.73],[.24,.73],[.40,.722],[.50,.705],[.58,.68],[.65,.645],[.70,.61],[.735,.58],[.755,.56],[.77,.535]],z),
        xR=z=>U.lin([[-1.00,.66],[-.86,.62],[-.68,.60],[-.42,.60],[.30,.62],[.44,.66]],z),
        cab=z=>z>-1.00&&z<.44;
  const sec=z=>{const yb=U.arch(z,[ZR],AR,.50),xw=xW(z),B=yB(z),t=T(z);
    const s=[[0,yb],[xw-.085,yb],[xw-.028,yb+.05],[xw-.002,Math.max(yb+.12,B-.22)],[xw+.008,B-.045],[xw,B]];        // (v3.1) le bas de caisse qui RENTRE ; le jonc de ceinture
    if(cab(z)){const xr=xR(z);s.push([xw-.035,B+.012],[xr,Math.max(B+.03,t-.11)],[xr-.05,t-.048],[xr*.55,t-.012],[0,t]);}   // (v3.1) le toit BOMBÉ, l'arête arrondie
    else{const tt=Math.max(t,B+.004),cw=tt-B;s.push([xw-.02,B+cw*.45],[xw*.82,tt-cw*.2],[xw*.55,tt-cw*.05],[xw*.27,tt],[0,tt+.002]);}   // (v3.1) l'auvent et la malle bombés
    return s;};
  P.loft(zs,sec,(j,z)=>{
    if(j===0)return 'k';
    if(j<0||!cab(z))return 'p';
    if(j===6)return (z>-.40&&z<.26)?'g':'p';                                       // la vitre de portière (« trois fenêtres » : pas de custode)
    if(j>=8&&z>.31&&z<.43)return 'g';                                              // le pare-brise, presque droit
    if(j===9&&z>-.92&&z<-.76)return 'g';                                           // la petite lunette dans le dos rond
    return 'p';});
  // les VRAIS VOLUMES : la gouttière du toit, l'encadrement de la vitre de porte, celui du pare-brise et de la lunette (des joncs à facettes,
  // posés sur les arêtes de la coque) ; la porte « suicide » en FENTE C qui monte jusqu'à la gouttière
  const pt=(z,i,d,sd)=>{const q=sec(z)[i];return [sd*(q[0]+(d||0)),q[1],z];};
  /* (v3.1) LA VITRE DE PORTE aux coins HAUTS ARRONDIS : un point de la vitre = (z, u), u de la ceinture (0) à l'arête du toit (1) ; deux éventails
     rouges ferment les coins, l'encadrement en jonc suit l'arrondi */
  const gv=(z,u,d,sd)=>{const S=sec(z),a=S[6],b=S[7],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [sd*(a[0]+dx*u+dy/l*d),a[1]+dy*u-dx/l*d,z];};
  const ZW0=-.40,ZW1=.26,RZ=.075,RU=.26,cadre=[];
  cadre.push([ZW0,0],[ZW1,0]);for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;cadre.push([ZW1-RZ+RZ*Math.cos(a),1-RU+RU*Math.sin(a)]);}
  for(let i=0;i<=6;i++){const a=Math.PI/2+i/6*Math.PI/2;cadre.push([ZW0+RZ+RZ*Math.cos(a),1-RU+RU*Math.sin(a)]);}cadre.push([ZW0,0]);
  /* (v3.1) le côté de la caisse à la hauteur y (pour poser la porte et ses fentes SUR la tôle) */
  const cote=(z,y)=>{const S=sec(z);for(let i=1;i<5;i++){const a=S[i],b=S[i+1];if(y<=b[1]||i===4){const u=Math.max(0,Math.min(1,(y-a[1])/((b[1]-a[1])||1)));return a[0]+(b[0]-a[0])*u;}}return S[5][0];};
  const fente=(pts,sd)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy)||1;let nz9=-dy/l,ny9=dz/l;if(nz9+ny9<0){nz9=-nz9;ny9=-ny9;}
      const A=[sd*(cote(a[0],a[1])+.002),a[1],a[0]],B9=[sd*(cote(b[0],b[1])+.002),b[1],b[0]];poutreF('J',A,B9,.007,.006,.001);
      poutreF('Jf',[A[0],A[1]+ny9*.0055,A[2]+nz9*.0055],[B9[0],B9[1]+ny9*.0055,B9[2]+nz9*.0055],.003,.006,0);}};
  const PORTE=[[.265,1.07]];for(let i=0;i<=4;i++){const a=i/4*Math.PI/2;PORTE.push([.265-.05+.05*Math.cos(a),.585+.05-.05*Math.sin(a)]);}
  for(let i=0;i<=4;i++){const a=Math.PI/2+i/4*Math.PI/2;PORTE.push([-.41+.05+.05*Math.cos(a),.585+.05-.05*Math.sin(a)]);}PORTE.push([-.41,1.07]);
  P.sym(sd=>{
    for(let i=0;i<9;i++){const za=-.95+i*.14,zb=Math.min(.30,za+.14);poutre('p',pt(za,7,.018,sd),pt(zb,7,.018,sd),.026,.022,.007);}   // la gouttière
    for(let i=0;i<cadre.length-1;i++)poutre('p',gv(cadre[i][0],cadre[i][1],.006,sd),gv(cadre[i+1][0],cadre[i+1][1],.006,sd),.02,.018,.006);   // l'encadrement de la vitre
    for(const [zc,zs9,dz] of [[ZW1,ZW1-RZ,-1],[ZW0,ZW0+RZ,1]]){const C=gv(zc,1,.003,sd);let q=null;   // les coins de la vitre, rouges
      for(let i=0;i<=6;i++){const a=i/6*Math.PI/2,P9=gv(zs9-dz*RZ*Math.cos(a),1-RU+RU*Math.sin(a),.003,sd);if(q)P.tri('p',C,q,P9);q=P9;}}
    fente(PORTE,sd);                                                                // (v3.1) la porte en FENTE C, coins du bas arrondis
    {const Z9=[.72,.65,.58,.50,.44,.30,.10,-.20,-.50,-.80,-1.10,-1.30,-1.45,-1.55];for(let i=0;i<Z9.length-1;i++)poutre('p',pt(Z9[i],4,.008,sd),pt(Z9[i+1],4,.008,sd),.016,.022,.006);}   // (v3.1) le jonc de ceinture
    poutre('p',[sd*.47,T(.43)+.004,.435],[sd*.47,T(.31)+.004,.305],.024,.022,.007);                               // le montant du pare-brise
    poutre('p',[sd*.25,T(-.915),-.915],[sd*.25,T(-.765),-.765],.02,.018,.006);                                     // le cadre de la lunette
    // la porte « suicide » (charnières derrière) : ses deux bords, son bas, en FENTE C (le fil clair devant)
    P.box('c',.014,.022,.10,sd*(xW(.20)+.012),.97,.20);P.box('c',.016,.05,.012,sd*(xW(.12)+.004),.96,.12);       // la poignée devant, la serrure
    tige('c',[sd*.66,1.16,.41],[sd*.74,1.20,.40],.007);P.put('c',new THREE.CylinderGeometry(.045,.045,.012,10),sd*.76,1.21,.40,Math.PI/2,0,0);   // le rétro rond
    {const z0=-1.15,z1=-1.60;for(let i=0;i<5;i++){const za=z0+(z1-z0)*i/5,zb=z0+(z1-z0)*(i+1)/5;poutre('J',[sd*.50,T(za)-.002,za],[sd*.50,T(zb)-.002,zb],.007,.006,0);}}   // la malle
  });
  poutre('p',[-.47,T(.305)+.01,.305],[.47,T(.305)+.01,.305],.026,.024,.007);poutre('p',[-.47,T(.435)+.008,.435],[.47,T(.435)+.008,.435],.024,.02,.006);   // le haut et le bas du pare-brise
  poutre('p',[-.25,T(-.915),-.915],[.25,T(-.915),-.915],.018,.018,.005);poutre('p',[-.25,T(-.765),-.765],[.25,T(-.765),-.765],.018,.018,.005);           // le haut et le bas de la lunette
  P.box('J',1.00,.006,.007,0,T(-1.15)+.001,-1.15);P.box('c',.10,.018,.03,0,T(-1.24)+.012,-1.24);   // le haut de la malle, sa poignée chromée
  // l'habitacle, vu par les vitres : la banquette capitonnée, le tableau de bord, le volant (à droite, comme sur la photo)
  P.box('n',1.06,.20,.46,0,.66,-.40);P.box('n',1.06,.46,.10,0,.93,-.66,.14);
  for(let i=0;i<6;i++)P.box('k',.006,.40,.11,-.45+i*.18,.93,-.605,.14);           // le capiton
  P.box('p',1.20,.12,.10,0,1.04,.38);P.lathe('k',[[.16,-.012],[.16,.012]],12,-.30,1.05,.20,'z');tige('k',[-.30,1.05,.20],[-.30,.92,.40],.018);
  // ================= LA CALANDRE, posée sur son support et sur les longerons =================
  const SH=[[0,1.18],[.12,1.17],[.21,1.145],[.27,1.10],[.295,1.03],[.29,.70],[.275,.585],[.20,.56],[0,.555]],
        sh=f=>{const o=SH.map(q=>[q[0]*f,.86+(q[1]-.86)*f]);return o.concat(o.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));},o9=sh(1);
  P.plate('p',o9,.10,1.72);                                                         // la coquille (1,72 → 1,82)
  for(let i=0;i<o9.length;i++){const a=o9[i],b=o9[(i+1)%o9.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);   // son bord, qui avance de 8 cm (chanfreiné)
    const ex=(b[0]-a[0])/L*.01,ey=(b[1]-a[1])/L*.01;poutreF('p',[a[0]-ex,a[1]-ey,1.86],[b[0]+ex,b[1]+ey,1.86],.08,.036,.008,0,[0,0,1]);}
  P.plate('k',sh(.88),.02,1.82);                                                    // la grille, au fond
  {const IN=SH.map(q=>[q[0]*.86,.86+(q[1]-.86)*.86]),hautX=x=>U.lin(IN.filter(q=>q[1]>.86),x),basX=x=>U.lin(IN.filter(q=>q[1]<=.86).reverse(),x);
   for(let i=-15;i<=15;i++){const x=i*.0165,ax=Math.abs(x),y1=hautX(ax)-.012,y0=basX(ax)+.012;if(y1>y0)cube('c',.006,y1-y0,.012,x,(y0+y1)/2,1.845);}   // 31 barreaux
   P.box('c',.52,.006,.012,0,.86,1.846);}
  P.box('k',.50,.52,.08,0,.825,1.66);                                                // le radiateur, sur son support
  P.cyl('c',.032,.03,10,0,1.195,1.79,'y');P.cyl('c',.012,.03,6,0,1.22,1.79,'y');P.box('c',.07,.008,.014,0,1.235,1.79);   // le bouchon
  // ================= L'AVANT : essieu surbaissé, lame transversale et ses jumelles, épingles, amortisseurs, direction =================
  P.sym(sd=>{poutre('c',[sd*.555,RF9,ZF],[sd*.42,.23,ZF],.05,.06,.014);              // l'essieu en I, qui plonge
    P.cyl('c',.028,.15,8,sd*.555,RF9,ZF,'y');                                        // le pivot
    P.box('c',.05,.02,.06,sd*.44,.265,ZF);                                          // la sellette du ressort
    poutre('k',[sd*.44,.27,ZF+.02],[sd*.44,.33,ZF+.02],.018,.03,.004);              // la jumelle
    tige('c',[sd*.48,.24,ZF-.02],[sd*.33,.30,1.06],.011);tige('c',[sd*.48,.28,ZF-.02],[sd*.33,.32,1.06],.011);   // les épingles, jusqu'au longeron
    tige('k',[sd*.48,.25,ZF+.07],[sd*.42,.38,1.68],.024);tige('c',[sd*.42,.38,1.68],[sd*.33,.52,1.72],.014);     // l'amortisseur, au longeron
  });
  poutre('c',[-.42,.23,ZF],[.42,.23,ZF],.05,.06,.014);
  for(const [w,b0] of [[.88,.335],[.70,.320],[.50,.305]]){const n=6;for(let i=0;i<n;i++){const xa=-w/2+w*i/n,xb=-w/2+w*(i+1)/n,ya=b0+.053*(1-Math.pow(xa/.44,2)),yb=b0+.053*(1-Math.pow(xb/.44,2));
    poutre('k',[xa,ya,ZF+.02],[xb,yb,ZF+.02],.055,.014,.004);}}                    // la lame transversale, en arc, serrée sous sa traverse
  P.box('c',.08,.06,.07,0,.37,ZF+.02);                                             // ses brides
  P.box('k',.07,.08,.09,-.31,.33,1.18);tige('c',[-.50,.22,ZF-.08],[-.31,.30,1.18],.012);   // le boîtier de direction, la barre
  // ---- LES PHARES-OBUS, sur leurs pieds boulonnés aux longerons ----
  P.sym(sd=>{const x=sd*.44,y=.72,z=1.84;
    P.lathe('c',[[0,-.14],[.06,-.125],[.09,-.08],[.10,-.03],[.10,.02]],12,x,y,z,'z');
    P.cyl('c',.104,.016,14,x,y,z+.026,'z');P.cyl('c',.088,.006,14,x,y,z+.03,'z');P.cyl('W',.032,.008,10,x,y,z+.034,'z');
    poutre('c',[sd*.29,.50,1.80],[x,.50,1.80],.04,.03,.008);tige('c',[x,.50,1.81],[x,.63,1.82],.016);       // la patte au longeron, le pied
  });
  // ---- LA PLAQUE, en bas devant, pendue à la barre : noire, lettres blanches en mini cubes ----
  {const px=-.06,py=.285,pz=1.995;P.box('k',.36,.11,.01,px,py,pz);for(const dx of [-.12,.12])P.box('c',.012,.06,.008,px+dx,py+.07,pz-.006);
   const GL={C:['111','100','100','100','111'],A:['010','101','111','101','101'],S:['111','100','111','001','111'],H:['101','101','111','101','101'],
     '3':['111','001','111','001','111'],'2':['111','001','111','100','111']},txt='CASH 32',cs=.0105;let x=px-(txt.length*4-1)*cs/2;
   for(const ch of txt){const g=GL[ch];if(g)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(g[r][c]==='1')cube('b',cs*.9,cs*.9,.004,x+(c+.5)*cs,py+(2-r)*cs,pz+.007);x+=4*cs;}
   for(const dy of [-.05,.05])P.box('b',.34,.004,.004,px,py+dy,pz+.007);}
  // ================= LE MOTEUR : V8 HEMI, en mini-cubes, posé sur ses supports entre les longerons =================
  const Z0=.90,Z1=1.52,ZM=(Z0+Z1)/2,LM=Z1-Z0;
  boite('k',.30,.10,.52,.02,0,.27,ZM);boite('k',.22,.06,.20,.015,0,.20,ZM+.12);     // le carter et son puisard
  boite('e',.42,.23,LM,.03,0,.435,ZM);                                              // le bloc
  P.sym(sd=>{poutre('k',[sd*.20,.40,1.30],[sd*.275,.40,1.30],.06,.05,.012);poutre('k',[sd*.20,.40,1.00],[sd*.325,.40,1.00],.06,.05,.012);   // les SUPPORTS, sur les longerons
    const rz=-sd*.62,ux=sd*Math.sin(.62),uy=Math.cos(.62),ax=Math.cos(.62),ay=-sd*Math.sin(.62),hx=sd*.20,hy=.62,cx=hx+ux*.105,cy=hy+uy*.105;   // le couvre-culasse posé SUR la culasse, dans son axe
    boite('e',.22,.12,LM-.02,.03,hx,hy,ZM,rz);                                      // la culasse hémisphérique, large
    // LE COUVRE-CULASSE POLI : la semelle, le corps chanfreiné, NEUF AILETTES (une allée au milieu pour les fils), les vis de la semelle
    boite('c',.23,.02,LM,.004,cx-ux*.04,cy-uy*.04,ZM,rz);
    boite('h',.20,.08,LM-.04,.028,cx,cy,ZM,rz);                                      // le corps, aluminium satiné (les ailettes polies s'y détachent)
    for(const t of [-.075,-.058,-.041,-.024,.024,.041,.058,.075])if(Math.abs(t)<.08)boite('c',.007,.014,LM-.12,.002,cx+ux*.045+ax*t,cy+uy*.045+ay*t,ZM,rz);
    for(let i=0;i<7;i++)for(const t of [-.105,.105])boite('c',.016,.016,.016,.003,cx-ux*.032+ax*t,cy-uy*.032+ay*t,Z0+.06+i*(LM-.12)/6,rz);
    // les BOUGIES AU MILIEU : quatre capuchons rouges dans l'allée, les fils rouges en faisceau qui filent vers l'avant, puis à l'allumeur
    for(let i=0;i<4;i++){const zz=Z0+.12+i*.13,bx=cx+ux*.06,by=cy+uy*.06,top=[bx+ux*.045,by+uy*.045,zz],arc=[bx+ux*.085+ax*.02,by+uy*.085+ay*.02,zz+.05];
      poutreF('e',[bx,by,zz],top,.03,.03,.008);                                       // le capuchon, bien dressé
      tige('e',top,arc,.0065);tige('e',arc,[cx+ux*.11+ax*.03,cy+uy*.11+ay*.03,Z1+.04],.0065);}   // le fil qui boucle puis file vers l'avant
    tige('e',[cx+ux*.11+ax*.03,cy+uy*.11+ay*.03,Z1+.04],[-.12,.74,Z1+.06],.012);    // le faisceau, jusqu'à l'allumeur
    // la pipe d'admission haute : ses quatre bras qui descendent vers la culasse
    for(let i=0;i<4;i++){const zz=Z0+.12+i*.13;poutre('c',[sd*.06,.76,zz],[sd*.15,.66,zz],.045,.035,.01);}
    // LES COLLECTEURS tubulaires, gris : quatre tubes qui sortent sous la semelle, passent au-dessus du longeron et plongent derrière la roue
    for(let i=0;i<4;i++){const zz=Z0+.10+i*.14,a=[sd*.31,.58,zz],b=[sd*.39,.60,zz-.02],c=[sd*.44,.50,zz-.05],d=[sd*.45,.39,zz-.10],e=[sd*.45,.34,zz-.16];
      tige('h',a,b,.019,6);tige('h',b,c,.019,6);tige('h',c,d,.019,6);tige('h',d,e,.019,6);}
    tige('h',[sd*.45,.33,Z1-.06],[sd*.45,.33,Z0+.02],.034,8);P.cyl('h',.045,.08,8,sd*.45,.33,Z0-.02,'z');   // le tube collecteur, son cône
    tige('k',[sd*.45,.33,Z0-.06],[sd*.32,.29,-1.66],.024);                          // l'échappement, sous le plancher, jusqu'à la poupe
  });
  // la pipe haute (polie), les deux quadruple-corps (zingués), leur tringlerie, la rampe d'essence
  boite('c',.26,.22,LM-.10,.03,0,.67,ZM);                                         // posée sur le bloc
  for(const zz of [ZM-.13,ZM+.13]){boite('Y',.17,.11,.15,.02,0,.835,zz);
    for(const dz of [-.08,.08])boite('Y',.15,.055,.025,.006,0,.82,zz+dz);          // les cuves, devant et derrière
    for(const dx of [-.05,.05])P.box('k',.03,.008,.03,dx,.892,zz);}                 // les bouches, sous l'écope
  P.box('c',.012,.012,.30,.10,.80,ZM);tige('c',[-.10,.81,ZM-.15],[-.10,.81,ZM+.15],.008,5);   // la tringlerie, la rampe d'essence
  // L'ÉCOPE polie, posée sur les carburateurs : basse derrière, haute devant, sa gueule ovale qui regarde la calandre
  /* (v3.1, Léo : « l'écope chromée comme sur ma photo ») un grand volume de CHROME BOMBÉ, posé sur les deux quadruple-corps : huit facettes par
     demi-section (le bas en chrome sombre, le haut clair : le reflet du sol et du ciel), l'arrière qui s'arrondit, la gueule OUVERTE vers l'avant —
     une lèvre polie évasée et, derrière, le trou sombre */
  const ZE0=.88,ZE1=Z1+.04,ecS=(z,k)=>{const t=(z-ZE0)/(ZE1-ZE0),r=Math.min(1,(z-ZE0)/.12),m=.5+.5*(r*r*(3-2*r)),w=(.15+.035*t)*m*(k||1),h=(.12+.12*t*t)*m*(k||1),
      yb=.90+Math.max(0,(z-1.42)/(ZE1-1.42))*.05;                                    // le ventre se relève devant les carburateurs, la gueule monte
      return [[0,yb],[w-.04,yb],[w-.01,yb+.022],[w,yb+h*.42],[w-.014,yb+h-.04],[w-.045,yb+h-.008],[w*.5,yb+h+.006],[0,yb+h+.01]];};
  P.loft([ZE0,ZE0+.03,ZE0+.08,ZE0+.16,1.08,1.24,1.42,1.50,ZE1],z=>ecS(z),(j,z)=>j===-1?'K':j===-2?'C':j<=2?'C':'c');
  {const ring=k=>{const h=ecS(ZE1,k);return h.concat(h.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));},yc=.95+(.12+.12)*.5,
     sc=(r,f)=>r.map(q=>[q[0]*f,yc+(q[1]-yc)*f]),O=sc(ring(1),1),O2=sc(ring(1),1.07),I2=sc(ring(1),.84),z0=ZE1,z1=ZE1+.04;
   for(let i=0;i<O.length;i++){const j=(i+1)%O.length;
     P.tri('c',[O[i][0],O[i][1],z0],[O2[i][0],O2[i][1],z1],[O2[j][0],O2[j][1],z1]);P.tri('c',[O[i][0],O[i][1],z0],[O2[j][0],O2[j][1],z1],[O[j][0],O[j][1],z0]);   // la lèvre évasée
     P.tri('c',[O2[i][0],O2[i][1],z1],[I2[i][0],I2[i][1],z1],[I2[j][0],I2[j][1],z1]);P.tri('c',[O2[i][0],O2[i][1],z1],[I2[j][0],I2[j][1],z1],[O2[j][0],O2[j][1],z1]);   // son bord poli
     P.tri('k',[I2[i][0],I2[i][1],z1],[I2[i][0],I2[i][1],z0-.03],[I2[j][0],I2[j][1],z0-.03]);P.tri('k',[I2[i][0],I2[i][1],z1],[I2[j][0],I2[j][1],z0-.03],[I2[j][0],I2[j][1],z1]);}}   // le tunnel sombre
  // l'avant du moteur : la distribution, les poulies, la courroie, l'alternateur, la pompe à eau et la durite polie vers le radiateur ; l'allumeur, le boîtier bleu
  boite('c',.30,.20,.03,.03,0,.47,Z1+.02);P.cyl('c',.07,.04,12,0,.38,Z1+.05,'z');P.cyl('c',.055,.04,12,0,.58,Z1+.05,'z');
  P.cyl('c',.06,.12,10,.20,.62,Z1,'z');poutre('k',[0,.31,Z1+.075],[0,.635,Z1+.075],.02,.012,.003);poutre('k',[0,.635,Z1+.075],[.20,.68,Z1+.075],.02,.012,.003);
  tige('c',[0,.62,Z1+.06],[0,.98,1.64],.024);
  P.cyl('k',.045,.08,10,-.12,.70,Z1+.06,'y');P.cyl('e',.05,.025,10,-.12,.75,Z1+.06,'y');P.box('B',.06,.04,.08,-.22,.66,Z1+.02);
  // derrière le moteur : la cloche polie et la boîte, sous le plancher, sur leur traverse
  P.lathe('c',[[.09,0],[.14,.06],[.15,.20],[.10,.22]],10,0,.34,Z0-.22,'z');boite('k',.16,.12,.50,.03,0,.34,.43);
  // ================= LA POUPE : traverse, pont arrière, feux en goutte sur leurs tiges, la plaque (celle du joueur s'y pose), le pare-chocs tube =================
  tige('c',[-.58,RR9,ZR],[.58,RR9,ZR],.04,10);P.lathe('c',[[0,-.12],[.12,-.08],[.13,0],[.12,.08],[0,.12]],12,0,RR9,ZR,'z');P.box('k',.12,.08,.10,0,RR9,ZR+.12);   // le pont « quick-change »
  P.sym(sd=>{tige('k',[sd*.45,.40,ZR-.06],[sd*.47,.50,ZR-.12],.03);tige('c',[sd*.45,.40,ZR-.06],[sd*.46,.46,ZR-.09],.02);});   // les amortisseurs, au longeron
  {const goutte=[[0,0],[.045,.008],[.06,.03],[.065,.07],[.055,.12],[.03,.16],[0,.17]];
   P.sym(sd=>{P.lathe('c',goutte,12,sd*.52,.58,-1.83,'z');
     P.put('L',new THREE.SphereGeometry(.052,10,5,0,Math.PI*2,0,Math.PI/2),sd*.52,.58,-1.826,-Math.PI/2,0,0,1,.55,1);
     P.cyl('L',.02,.01,6,sd*.52,.58,-1.856,'z');tige('c',[sd*.48,.48,-1.75],[sd*.52,.55,-1.78],.012);
     P.box('k',.03,.05,.10,sd*.36,.40,-1.79);});
   P.cyl('c',.024,1.10,10,0,.40,-1.825,'x');
   P.box('k',.34,.13,.02,0,.56,-1.80);P.box('w',.30,.10,.01,0,.56,-1.812);
   P.box('c',.10,.03,.05,0,.645,-1.79,.35);P.box('W',.08,.014,.01,0,.628,-1.813);}
  K.commit(P);
  // ================= LES ROUES (dessinées ici, la photo 2) : pneu à FLANC BLANC, jante ROUGE, grand chapeau chromé ; petites devant (`wRF`) =================
  const roue=hw=>{const J=lpKit({t:{g:'m',c:0x18181b},b:{g:'s',c:0xf1eee6},R:{g:'p',c:0xc8141c,f:0},c:{g:'c',c:0xe9ecf0},d:{g:'m',c:0x101012}}),R=RR9;
    J.lathe('t',[[.235,-hw],[.30,-hw],[.355,-hw*.92],[.378,-hw*.6],[R,0],[.378,hw*.6],[.355,hw*.92],[.30,hw],[.235,hw]],16,0,0,0,'x');
    J.lathe('b',[[.25,hw+.002],[.30,hw+.002],[.333,hw*.94+.002]],16,0,0,0,'x');      // le flanc blanc
    J.lathe('R',[[.235,-hw+.01],[.235,hw-.012],[.225,hw-.03],[.20,hw-.042],[.16,hw-.045]],16,0,0,0,'x');   // la jante, rouge
    J.lathe('d',[[.235,-hw+.016],[0,-hw+.016]],16,0,0,0,'x');                       // le fond
    J.lathe('c',[[.16,hw-.045],[.145,hw-.026],[.105,hw-.008],[.055,hw+.006],[0,hw+.01]],16,0,0,0,'x');   // le chapeau chromé
    return J.done();};
  const JR=roue(.15),JF=roue(.104),mat=g=>(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null);
  return {hl:[.44,.72,1.87],tl:[.52,.58,-1.86],wx:.72,wxF:.66,wRF:RF9/RR9,wzF:ZF,wzR:-ZR,
          roueDeco:(w,sx,sz)=>{const G=sz>0?JF:JR;for(const g in G){const m=new THREE.Mesh(G[g],mat(g));m.userData.lp=1;w.add(m);}},
          lpw:{R:RR9,w:.30,style:'nyan',jante:0xc8141c}};
},
  d_puce:function(K){
  /* (13/10, « plus ressemblante ») la petite anglaise de rallye : des coins RONDS vus de dessus (elle était carrée), le
     pavillon qui s'arrête plus tôt sur une lunette couchée et une malle basse (elle avait l'air d'un break), le capot qui plonge. */
  const U=LPU,R=.25,ZF=.99,ZR=-.99;
  const P=K.kit({p:{g:'p',c:0x761a22},w:{g:'p',c:0xf4f4f0,f:0},c:{g:'c',c:0xe9ecf0},k:{g:'m',c:0x131417},K:{g:'g',c:0x0c0d10},
    g:{g:'g',c:0x18212c},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.05],[R*.70,2*R+.03],[R+.05,R*1.10],[R+.12,.24]];
  const zs=[-1.45,-1.43,-1.415,-1.39,-1.35,-1.30,-1.10,-.92,-.86,.36,.66,.76,1.30,1.35,1.39,1.415,1.43,1.45];   // (19/10) deux tranches de plus à chaque coin : il s'arrondit en plan
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.05,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-1.45,.84],[-1.43,.88],[-1.39,.90],[-1.10,.92],[-.92,1.315],[-.70,1.345],[.36,1.35],[.76,.90],[1.30,.80],[1.39,.775],[1.43,.75],[1.45,.71]],z),
        yB=z=>U.lin([[-1.45,.80],[-1.39,.86],[-1.10,.875],[-.92,.87],[.76,.86],[1.39,.75],[1.45,.69]],z),
        xW=z=>U.lin([[-1.45,.54],[-1.43,.61],[-1.39,.655],[-1.30,.685],[-1.10,.70],[1.20,.70],[1.30,.69],[1.39,.66],[1.43,.615],[1.45,.55]],z),
        xR=z=>U.lin([[-1.10,.60],[-.92,.565],[.36,.565],[.76,.64]],z),
        cab=z=>z>-1.10&&z<.76;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.24),xw=xW(z),c=yC(z),b=Math.max(yB(z),yb+.14);
    /* (19/10, l'affinement — Léo : « les rondeurs de la Mini ») la coupe d'une Mini : le bas de caisse qui RENTRE en arrondi jusqu'au seuil,
       le flanc qui bombe à mi-portière, l'épaule ronde sous la vitre, le pavillon bombé qui descend vers sa gouttière (il était plat) */
    const kA=1-.85*Math.min(1,Math.max(0,(yb-.24)/.10));                     // au-dessus des roues la tôle tombe d'aplomb (la rentrée s'efface)
    const s=[[0,yb],[xw-.14*kA,yb],[xw-.07*kA,Math.max(yb+.035,.30)],[xw-.02*kA,Math.max(yb+.06,.38)],[xw+.005,Math.max(yb+.09,.48)],
      [xw+.006,Math.max(yb+.11,b-.14)],[xw-.026,b],[xw-.07,b+.024]];
    if(cab(z)){const xr=xR(z),y6=Math.max(c-.06,b+.03);                     // LA GOUTTIÈRE : le toit posé sur sa lèvre
      s.push([xr,y6],[xr+.018,Math.max(y6+.01,c-.05)],[xr-.005,Math.max(y6+.012,c-.026)],[xr-.05,Math.max(y6+.016,c-.011)],[xr-.17,Math.max(y6+.018,c-.003)],[0,Math.max(y6+.02,c)]);}
    else s.push([xw-.12,Math.max(b+.025,c-.045)],[xw-.18,Math.max(b+.028,c-.03)],[xw-.26,Math.max(b+.031,c-.018)],[xw-.36,Math.max(b+.034,c-.009)],[xw-.50,Math.max(b+.037,c-.003)],[0,Math.max(b+.04,c)]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j<0||j<=6||!cab(z))return 'p';
    if(j===7)return (z>.66||z<-.86)?'p':'g';                                  // vitres, montants rouges
    if(z>.36)return j===8?'p':'g';                                            // pare-brise
    if(z<-.92)return j===8?'w':'g';                                          // lunette
    return 'w';});                                                            // LE TOIT BLANC, gouttières comprises
  // LA FACE : calandre en moustache, deux phares ronds, deux longues-portées, la sangle de capot
  P.plate('c',[[-.44,.40],[.44,.40],[.48,.50],[.38,.64],[.20,.66],[-.20,.66],[-.38,.64],[-.48,.50]],.015,1.447);
  P.plate('k',[[-.41,.42],[.41,.42],[.44,.50],[.36,.62],[.19,.64],[-.19,.64],[-.36,.62],[-.44,.50]],.015,1.455);
  for(let i=0;i<4;i++)P.box('c',.80-Math.abs(i-1.5)*.06,.014,.02,0,.46+i*.05,1.473);
  // (19/10) LES PARE-CHOCS ENVELOPPENT LES COINS : une barre chromée (huit pans) qui suit le contour, de l'arche avant à l'arche arrière du même bout
  {const T8=[[.025,0],[.018,.022],[0,.028],[-.018,.022],[-.025,0],[-.018,-.022],[0,-.028],[.018,-.022]],
        BP=[[.72,1.29],[.715,1.35],[.70,1.40],[.665,1.44],[.60,1.47],[.50,1.485],[.25,1.49]];
    for(const e of [1,-1]){const ch=BP.map(q=>[q[0],.33,e*q[1]]).concat([[0,.33,e*1.49]],BP.slice().reverse().map(q=>[-q[0],.33,e*q[1]]));
      bulleOutils.tube(P,'c',ch,T8,true);}}
  P.box('k',.09,.012,.30,.16,yC(1.30)+.006,1.30,.17);                         // la sangle de capot
  P.sym(sd=>{
    P.cyl('c',.10,.04,10,sd*.50,.665,1.44,'z');P.cyl('W',.082,.05,10,sd*.50,.665,1.445,'z');
    P.cyl('c',.085,.08,10,sd*.20,.49,1.53,'z');P.cyl('W',.068,.09,10,sd*.20,.49,1.535,'z');  // longues-portées de rallye
    P.cyl('O',.035,.03,6,sd*.54,.50,1.45,'z');
    for(const e of [1,-1])P.cyl('c',.028,.15,8,sd*.28,.37,e*1.515,'y');      // butoirs : des tubes debout (des cubes avant le 19/10)
    P.box('p',.02,.42,.02,sd*(.705+.012),.66,.74);                           // LA COUTURE extérieure (19/10 : elle part de 45 cm, où la caisse commence à rentrer)
    P.box('p',.03,.38,.07,sd*.603,1.09,-.33,0,0,sd*.19);                     // pied milieu
    P.cyl('k',.175,.02,12,sd*.709,.60,.14,'x');P.cyl('w',.16,.025,12,sd*.711,.60,.14,'x'); // le rond de numéro
    for(const y of [.52,.76])P.box('c',.02,.05,.06,sd*.715,y,.63);            // charnières apparentes
    P.box('c',.02,.03,.10,sd*.713,.80,-.24);                                 // poignée
    P.box('c',.012,.34,.02,sd*.63,1.07,.14,0,0,sd*.18);                      // la vitre coulissante
    P.cyl('c',.035,.12,6,sd*.56,.84,1.06,'y');P.box('c',.09,.06,.02,sd*.56,.92,1.06); // rétro d'aile
    P.box('L',.08,.14,.03,sd*.54,.66,-1.455);P.box('O',.08,.05,.03,sd*.54,.765,-1.455);
    P.cyl('c',.045,.03,8,sd*.685,.82,-1.28,'x');                             // les deux bouchons d'essence
  });
  P.box('W',.40,.12,.02,0,.50,-1.453);P.box('c',.18,.025,.03,0,.74,-1.455); // plaque (19/10 : une boîte CLAIRE — plqDessinee y pose la vraie, sous la malle ; noire, elle restait un trou), poignée de malle
  P.cyl('c',.03,.08,8,.31,.26,-1.48,'z');
  K.commit(P);
  return {hl:[.50,.665,1.46],tl:[.54,.66,-1.46],wx:.60,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.18,style:'rayons',n:8,jante:0xd6dade,accent:0xd6dade}};
},
/* L'ABSTRAITE (2026-10-09, Léo : « fais-en une hyper abstraite mais travaillée, concept ») — LA VOITURE-IDÉE. Un coin pur (le nez au
   ras du sol, la poupe haute et droite) TRANCHÉ en trois lames qui flottent l'une sur l'autre : la lame basse en graphite, le corps
   en blanc nacré, la verrière en éclat de verre noir — et dans chaque tranche une FENTE DE LUMIÈRE d'or. Les roues ne sont pas sous
   elle : quatre DISQUES blancs piqués d'or, posés à côté, tenus par de fins bras ; au-dessus de chacun, une lame de pare-boue qui
   flotte sans rien qui la tienne. Et un ANNEAU D'OR qu'elle traverse sans jamais le toucher (le portail du jeu, en sculpture). Ni
   calandre, ni portière, ni rétroviseur : un trait blanc devant, un trait rouge derrière. Tout en facettes franches (le kit). */
  abstraite:function(K){
    const U=LPU,R=.36,ZF=1.45,ZR=-1.45;
    const P=K.kit({p:{g:'p',c:0xf2f2ee},G:{g:'s',c:0x2b2e34},K:{g:'g',c:0x0a0b0e},O:{g:'l',c:0xffc84a},o:{g:'o',c:0xd9a520},
      W:{g:'l',c:0xf4f6ff},L:{g:'l',c:0xff2030},k:{g:'m',c:0x111214}});
    // LA LAME BASSE : un long losange en plan, effilé en lame devant (elle dépasse du corps : le nez au ras du sol)
    const wA=z=>U.lin([[-2.22,.50],[-2.1,.62],[2.0,.62],[2.42,.08]],z);
    P.loft([-2.22,-2.1,2.0,2.42],z=>{const w=wA(z);return [[0,.26],[w*.9,.26],[w,.32],[w,.46],[0,.46]];},()=>'G');
    P.loft([-2.18,-2.1,2.0,2.36],z=>{const w=wA(z)-.03;return [[0,.46],[w,.46],[w,.50],[0,.50]];},()=>'O');      // la 1re fente de lumière, en retrait
    // LE CORPS : le coin, à six pans (chanfreins francs), la poupe coupée net
    const wB=z=>U.lin([[-2.3,.58],[-2.2,.66],[1.0,.66],[1.8,.56],[2.2,.34],[2.32,.10]],z),
          yT=z=>U.lin([[-2.3,.96],[-1.4,1.0],[-.6,.98],[.2,.90],[1.0,.78],[1.8,.66],[2.32,.56]],z);
    // le flanc porte une RAINURE de lumière au tiers de sa hauteur (elle s'évanouit dans le nez, où le flanc n'a plus de hauteur)
    P.loft([-2.3,-2.2,-1.4,-.6,.2,1.0,1.8,2.2,2.32],z=>{const w=wB(z),t=yT(z),y2=Math.min(.56,t-.02),y3=Math.max(y2+.005,t-.08),
        hh=Math.min(.032,(y3-y2)*.3),g0=y2+(y3-y2)*.35,pr=.045*hh/.032;
      return [[0,.50],[w*.94,.50],[w,y2],[w,g0],[w-pr,g0+hh/2],[w,g0+hh],[w,y3],[w*.82,t],[0,t+.012]];},j=>j===0?'G':(j===3||j===4)?'O':'p');
    // LA VERRIÈRE : un éclat de verre noir à arête vive, posé sur la 2e fente de lumière
    const wC=z=>U.lin([[-1.7,.30],[-1.2,.46],[-.2,.48],[.6,.40],[1.15,.06]],z),
          tC=z=>U.lin([[-1.7,yT(-1.7)+.10],[-1.2,1.16],[-.2,1.18],[.6,1.04],[1.15,yT(1.15)+.07]],z),zC=[-1.7,-1.2,-.2,.6,1.15];
    P.loft(zC,z=>{const w=wC(z)+.02,b=yT(z);return [[0,b],[w,b],[w,b+.035],[0,b+.035]];},()=>'O');
    P.loft(zC,z=>{const w=wC(z),b=yT(z)+.035,t=tC(z);return [[0,b],[w,b],[w*.62,b+(t-b)*.55],[0,t]];},()=>'K');
    // LES BRAS des disques, et au-dessus de chaque roue UN ARC qui flotte (une bande blanche cintrée, cerclée d'un fil d'or)
    P.sym(sd=>{for(const z of [ZF,ZR]){
      P.box('G',.11,.05,.10,sd*.675,R,z);
      const ar=new THREE.CylinderGeometry(R+.10,R+.10,.30,12,1,true,Math.PI*1.5-1.1,2.2);ar.rotateZ(-Math.PI/2);P.put('p',ar,sd*.86,R,z);
      for(const dx of [-.15,.15]){const fil=new THREE.TorusGeometry(R+.102,.009,4,18,2.2);fil.rotateZ(Math.PI/2-1.1);fil.rotateY(Math.PI/2);P.put('O',fil,sd*.86+dx,R,z);}}});
    P.put('o',new THREE.TorusGeometry(.88,.042,6,32),0,.93,-.45,-.25,0,0);                               // L'ANNEAU D'OR, penché vers l'arrière : le mouvement
    P.box('W',1.04,.026,.03,0,.48,2.06);                                                                 // le trait blanc, devant
    /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un mur
       blanc barré d'un trait rouge ; l'anneau d'or faisait tout le travail. Désormais LE FEU EN ANNEAU, ovale, qui répond à l'anneau d'or :
       un anneau de lumière rouge sur un fond de verre noir, cerclé d'un fil d'or ; dessous, le BOUCLIER sculpté en creux et son fil d'or ;
       le DIFFUSEUR aux ailettes d'or, et un anneau d'or autour de chaque sortie (le pot de Léo, ECH_POTS.abstraite, n'a pas bougé). */
    {const ann=(k,a,b,e,x,y,z,n)=>{const s=new THREE.Shape(),h=new THREE.Path();s.absellipse(0,0,a,b,0,Math.PI*2,false,0); // un anneau OVALE d'épaisseur égale
       h.absellipse(0,0,a-e,b-e,0,Math.PI*2,true,0);s.holes.push(h);P.put(k,new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false,curveSegments:n||12}),x,y,z);}; // (n : une ellipse fait 2n pans)
     P.put('K',new THREE.CylinderGeometry(1,1,1,24),0,.75,-2.306,Math.PI/2,0,0,.44,.012,.13);            // le fond de verre noir
     ann('L',.46,.15,.032,0,.75,-2.33);ann('o',.505,.195,.014,0,.75,-2.33);                              // l'anneau rouge, le fil d'or
     P.sym(sd=>P.box('L',.03,.03,.012,sd*.46,.75,-2.318));                                               // (les repères des traînées, aux bouts)
     P.plate('K',[[-.40,.52],[.40,.52],[.47,.615],[-.47,.615]],.02,-2.322);P.box('o',.94,.014,.012,0,.618,-2.318); // le creux du bouclier
     for(const x of [-.46,-.34,-.10,0,.10,.34,.46])P.box('o',.022,.13,.34,x,.33,-2.09);                  // les ailettes d'or, sous la poupe
     P.sym(sd=>ann('o',.075,.075,.014,sd*.22,.36,-2.246,6));}                                              // un anneau d'or autour de chaque sortie
    P.sym(sd=>P.cyl('k',.05,.04,10,sd*.22,.36,-2.23,'z'));                                               // deux fentes rondes : la poussée sort de là
    K.commit(P);
    return {hl:[.30,.48,2.08],tl:[.46,.80,-2.32],wx:.86,wzF:ZF,wzR:-ZR,pots:[[.22,.36,-2.26],[-.22,.36,-2.26]],
            lpw:{R:R,w:.26,style:'enjoliveur',jante:0xf2f2ee,pneu:0x1a1b1f}};
  },
