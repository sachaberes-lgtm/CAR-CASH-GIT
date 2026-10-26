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
  /* LE HOT ROD v4 (2026-10-26, « la plus belle voiture poly que tu puisses faire, au niveau de LA ROSSO 40 et de LA HONTE ») — refait de zéro.
     Le v3 (11 600 triangles) racontait tout, au millimètre, et ne se lisait plus : une coque froissée de triangles, un moteur en poussière
     de mini-cubes. Le v4 dit UNE chose, fort : un petit cube rouge, bas, posé sur un châssis noir, et devant lui un V8 À NU qui crache
     ses tubulures en diagonale sous un COMPRESSEUR chromé coiffé d'une écope qui monte aussi haut que le toit. Rouge, chrome, noir.
     · LA COQUE : un seul loft de 12 points par demi-coupe (bas, chanfrein, flanc d'aplomb, le JONC de ceinture du Deuce, le pavillon
       qui tourne en deux pans), 18 stations, de GRANDS pans plats ; le coupé « trois fenêtres » de 1932 RABOTÉ (20 cm de vitre pour
       50 de caisse), la grande custode aveugle, la petite lunette en fente, le dos bombé en tortue qui tombe d'aplomb sur le tablier ;
     · LE CHÂSSIS noir sous la caisse (la bande sombre qui la soulève), ses cornes jusqu'à la barre chromée ;
     · LA CALANDRE du Deuce : la coquille chromée, ses barreaux rouges sur fond noir ; les PHARES-OBUS sur leurs pieds ;
     · LE MOTEUR : bloc noir, cache-culbuteurs polis, le 6-71 chromé à côtes et sa courroie, deux carbus dorés, l'écope « bug catcher »
       (sa gueule noire regarde la route), huit tubulures « zoomies » qui sortent en diagonale ;
     · LES FLAMMES peintes sur l'auvent et les portes : des rubans plats, orange et cœur jaune, quatre langues par flanc ;
     · LA POUPE : deux feux ronds à « blue dot », le pare-chocs tube, la plaque pendue à la traverse, deux pots sous le plancher ;
     · LES ROUES : arrière énormes, avant fines, flanc blanc, jante tôle ROUGE, enjoliveur poli et chapeau « dog dish » (dessinées ici).
     Ancrages : phares (hl) au cœur des obus, feux (tl) sur le tablier, roues avant à voie étroite (wxF) et plus petites (wRF). */
  const U=LPU,ZF=1.62,ZR=-1.04,RF=.30,RR=.41;
  const P=K.kit({p:{g:'p',c:0x8a0812},k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    C:{g:'c',c:0x9aa1ab},g:{g:'g',c:0x1c2733},Y:{g:'o',c:0xc79a3e},F:{g:'p',c:0xff7a12,f:0},Fy:{g:'p',c:0xffd23a,f:0},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0x4f7dff},w:{g:'l',c:0xe8e8e4}});
  // LA LAQUE QUI NE BRÛLE PAS : sous la lampe du studio (et le soleil), ce qui regarde le ciel — pavillon, malle, auvent — prend toute la
  // lumière et sature en rose pâle. On assombrit d'un cran la COULEUR des facettes couchées de la tôle (groupe 'p', à la pose : zéro coût) ;
  // les flancs gardent leur rouge. Vaut pour toute peinture de la boutique (c'est un ombrage, pas une teinte).
  {const d0=P.done;P.done=()=>{const gs=d0(),g=gs.p;if(g&&g.attributes.normal){const n=g.attributes.normal.array,c=g.attributes.color.array;
    for(let i=0;i<n.length;i+=3){const ny=Math.abs(n[i+1]),k=ny>.6?.82:ny>.3?.91:1;c[i]*=k;c[i+1]*=k;c[i+2]*=k;}}return gs;};}
  // ---- LES OUTILS : un prisme de a à b sur une section quelconque (le plan de coupe se règle sur `sv`, sinon à plat) ----
  const cr=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],nz=u=>{const l=Math.hypot(u[0],u[1],u[2])||1;return [u[0]/l,u[1]/l,u[2]/l];};
  const prisme=(k,a,b,Q,sv,kc)=>{const d=nz([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
    let s=sv?nz(sv):(Math.abs(d[1])>.92?[1,0,0]:nz(cr([0,1,0],d)));const u=nz(cr(d,s));s=nz(cr(u,d));
    const pt=(o,q)=>[o[0]+s[0]*q[0]+u[0]*q[1],o[1]+s[1]*q[0]+u[1]*q[1],o[2]+s[2]*q[0]+u[2]*q[1]],A=Q.map(q=>pt(a,q)),B=Q.map(q=>pt(b,q)),n=Q.length;
    for(let i=0;i<n;i++){const j=(i+1)%n;P.tri(k,A[i],A[j],B[j]);P.tri(k,A[i],B[j],B[i]);}
    if(kc!==0)for(let i=1;i<n-1;i++){P.tri(kc||k,A[0],A[i+1],A[i]);P.tri(kc||k,B[0],B[i],B[i+1]);}};
  const ngon=(r,n,a0)=>{const o=[];for(let i=0;i<n;i++){const a=(a0||0)+i/n*Math.PI*2;o.push([Math.cos(a)*r,Math.sin(a)*r]);}return o;},
        rect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],
        oct=(w,h,c)=>{const x=w/2,y=h/2;c=Math.min(c,x*.9,y*.9);return [[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]];};
  const tube=(k,a,b,r,n,kc)=>prisme(k,a,b,ngon(r,n||6,Math.PI/(n||6)),null,kc),
        barre=(k,a,b,w,h,sv)=>prisme(k,a,b,rect(w,h),sv),
        poutre=(k,a,b,w,h,c,sv)=>prisme(k,a,b,oct(w,h,c),sv);
  const mx=(p,sd)=>[sd*p[0],p[1],p[2]];
  // ================= LA COQUE : un loft, 12 points par demi-coupe =================
  const AR=[[0,.88],[.28,.875],[.42,.72],[.48,.52]];                                 // l'arche de la roue arrière, dans le flanc
  const yb0=z=>U.lin([[-1.70,.60],[-1.55,.57],[-1.40,.555],[-.60,.50],[.60,.47]],z),                 // le bas de caisse (le nez plonge : la caisse est « rakée »)
        xW=z=>U.lin([[-1.70,.50],[-1.69,.56],[-1.66,.605],[-1.61,.635],[-1.52,.655],[-1.32,.665],[-.40,.665],[.30,.65],[.47,.625],[.60,.59]],z),
        yB=z=>U.lin([[-1.70,.86],[-1.69,.905],[-1.66,.945],[-1.61,.97],[-1.52,.985],[-1.32,.995],[-1.00,1.0],[.30,1.0],[.47,.985],[.60,.97]],z),
        yT=z=>U.lin([[-1.70,.90],[-1.69,.95],[-1.66,.995],[-1.61,1.03],[-1.52,1.055],[-1.32,1.085],[-1.00,1.13],[-.95,1.225],
                     [-.86,1.27],[-.74,1.30],[.12,1.31],[.22,1.303],[.29,1.072],[.40,1.062],[.53,1.045],[.60,1.025]],z),   // (l'auvent de 31 cm qui monte vers le pare-brise : la cabine RECULÉE, comme sur le '32)
        cf=z=>U.lin([[-1.00,0],[-.95,.45],[-.86,.8],[-.74,1],[.22,1],[.29,0]],z),                  // la part de cabine (0 : la malle / l'auvent)
        x9=z=>U.lin([[-1.00,.20],[-.86,.22],[-.70,.26],[.22,.26],[.29,.21]],z);                    // le pli du pavillon (et le bord de la lunette)
  /* (v4.2, Léo : « elle est un peu PLATE ») LE RELIEF, sans un trait : les HANCHES — le flanc s'élargit de 2,2 cm au-dessus de la roue arrière
     (l'aile qu'on devine, ses deux pans d'entrée et de sortie prennent la lumière) ; la VOÛTE — le pavillon, la malle et l'auvent montent en
     faîte au milieu (3,4 cm sur le toit) : deux grands pans par côté qui ne reçoivent pas la même lumière ; LE VERRE EN FACETTES — la vitre de
     porte prend un PLI au milieu, bombé de 1 à 2,6 cm en alternance d'une station à l'autre (la technique de la Zagaie) */
  const hb=z=>U.lin([[-1.61,0],[-1.52,.022],[-.76,.022],[-.62,0]],z),
        PLI=new Map([[-.35,.026],[-.17,.010],[.01,.026]].map(q=>[Math.round(q[0]*1e4),q[1]]));
  const sec=z=>{const yb=Math.max(U.arch(z,[ZR],AR,0),yb0(z)),xw=xW(z)+hb(z),B=yB(z),t=yT(z),c=cf(z),m=(a,b)=>[a[0]+(b[0]-a[0])*c,a[1]+(b[1]-a[1])*c],h=t-B;
    const g0=m([xw-.03,B+.012],[xw-.045,B+.025]),g1=m([xw-.10,B+h*.50],[xw-.10,t-.075]),dx=g1[0]-g0[0],dy=g1[1]-g0[1],l=Math.hypot(dx,dy)||1,
          o=c>.999?(PLI.get(Math.round(z*1e4))||0):0,gm=[(g0[0]+g1[0])/2+dy/l*o,(g0[1]+g1[1])/2-dx/l*o];   // le pli de la vitre, poussé vers le dehors
    return [[0,yb],[xw-.06,yb],[xw,yb+.06],[xw,Math.max(yb+.065,B-.07)],[xw+.012,Math.max(yb+.07,B-.035)],[xw,B],
      g0,gm,g1,m([xw-.145,B+h*.68],[xw-.128,t-.034]),m([xw-.19,B+h*.82],[xw-.17,t-.010]),
      m([x9(z),B+h*.96+.006],[x9(z),t+.016]),m([0,t+.016],[0,t+.034])];};   // (le pavillon tourne en deux pans puis monte en FAÎTE au milieu)
  let zs=[-1.70,-1.69,-1.66,-1.61,-1.00,-.95,-.86,-.52,-.35,-.17,.01,.18,.22,.29,.40,.53,.60];
  for(const d of [.28,.42,.48])zs.push(ZR-d,ZR+d);                               // (l'arche donne -1,52 -1,46 -1,32 / -0,76 -0,62 -0,56)
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  P.loft(zs,sec,(j,z)=>{
    if(j===0)return 'k';
    if(j<0)return 'p';                                                           // la poupe, le tablier (derrière le moteur)
    if((j===6||j===7)&&z>-.52&&z<.18)return 'g';                                 // la vitre de portière, en deux pans pliés
    if((j===10||j===11)&&z>.22&&z<.29)return 'g';                                // le pare-brise, presque droit (ses facettes sont posées devant)
    if(j===11&&z>-1.00&&z<-.95)return 'g';                                       // la lunette en fente
    return 'p';});
  const S=(z,i)=>sec(z)[i];
  /* LE PARE-BRISE ET LA LUNETTE EN FACETTES : devant le verre du loft, un verre taillé en pointe de diamant — dix facettes en éventail autour
     d'un centre poussé de 2 cm vers le dehors : celles du haut regardent le ciel et s'allument, celles du bas restent sombres (symétriques).
     Leur cadre est dans la LAQUE (Léo : pas de lamelle de métal clair qui file le long de la vitre). */
  const diamant=(zT,zB,push,ez)=>{const T=[S(zT,10),S(zT,11),S(zT,12)],Bv=[S(zB,10),S(zB,11),S(zB,12)],
      O=[[-T[0][0],T[0][1],zT],[-T[1][0],T[1][1],zT],[0,T[2][1],zT],[T[1][0],T[1][1],zT],[T[0][0],T[0][1],zT],
         [Bv[0][0],Bv[0][1],zB],[Bv[1][0],Bv[1][1],zB],[0,Bv[2][1],zB],[-Bv[1][0],Bv[1][1],zB],[-Bv[0][0],Bv[0][1],zB]].map(q=>[q[0],q[1],q[2]+ez]),
      M=[0,(T[2][1]+Bv[2][1])/2+push[1],(zT+zB)/2+ez+push[2]];
    for(let i=0;i<O.length;i++)P.tri('g',M,O[i],O[(i+1)%O.length]);};
  diamant(.22,.29,[0,.004,.022],.004);diamant(-.95,-1.00,[0,.008,-.014],-.004);
  {const ZH=.22,ZB=.29,h=[S(ZH,10),S(ZH,12)],b=[S(ZB,10),S(ZB,12)],e=.008;
   P.sym(sd=>{barre('p',[sd*h[0][0],h[0][1]-.006,ZH+.010],[0,h[1][1]-.006,ZH+.010],.03,.026,[0,0,1]);   // (le haut sous l'arête du pavillon : pas de visière)
     barre('p',[sd*b[0][0],b[0][1]+e,ZB+.006],[0,b[1][1]+e,ZB+.006],.03,.026,[0,0,1]);
     barre('p',[sd*(h[0][0]+.01),h[0][1],ZH+.006],[sd*(b[0][0]+.01),b[0][1],ZB+.006],.03,.03);});}
  // ---- (2026-10-26, Léo : « AUCUN trait noir sur la carrosserie ») plus de joint de porte ni de malle dessiné : la tôle reste d'un seul tenant,
  //      la POIGNÉE chromée seule dit la porte ; le bouchon d'essence sur l'auvent (le '32 l'a là) ----
  P.sym(sd=>P.box('c',.016,.018,.09,sd*(xW(.12)+.012),.935,.12));
  P.lathe('c',[[.05,0],[.05,.012],[.04,.024],[0,.03]],8,0,yT(.45)-.004,.45,'y');
  tube('c',[xW(.27)-.01,1.04,.27],[xW(.27)+.09,1.15,.26],.009,5);P.cyl('c',.05,.018,8,xW(.27)+.10,1.16,.255,'z');P.cyl('K',.042,.004,8,xW(.27)+.10,1.16,.245,'z');
  // ---- LES FLAMMES, peintes à plat sur l'auvent et les portes : quatre LANGUES (un ruban qui ondule et s'effile, la pointe qui remonte),
  //      orange, et leur cœur jaune par-dessus. Nées au bord du tablier, elles se fondent en un front plein. ----
  {const LG=[[.58,.12,.22,-.09,.16],[1.0,.37,.26,-.12,.24],[.80,.62,.24,-.10,.20],[.46,.86,.18,-.05,.10]],   // [longueur, hauteur de base, épaisseur, ondulation, remontée de la pointe]
     Z0=.588,LZ=1.0,Y0=.585,Y1=.915,N=8;
   const langue=(k,o,kL,kW,ep,sd)=>{const [L0,vb,W0,a,cu]=o,L=L0*kL,W=W0*kW,V=[];
     for(let i=0;i<=N;i++){const t=i/N,u=t*L,v=vb+a*Math.sin(1.7*Math.PI*t)+cu*t*t*t,w=W*Math.pow(1-t,.8)*(1+.35*Math.sin(Math.PI*t))/2,z=Z0-u*LZ;
       const X=sd*(xW(z)+ep);V.push([[X,Y0+(v-w)*(Y1-Y0),z],[X,Y0+(v+w)*(Y1-Y0),z]]);}
     for(let i=0;i<N;i++){const A=V[i],B=V[i+1];P.tri(k,A[0],B[0],B[1]);P.tri(k,A[0],B[1],A[1]);}};
   P.sym(sd=>{for(const o of LG){langue('F',o,1,1,.0035,sd);langue('Fy',o,.62,.48,.0065,sd);}});}
  // ================= LE CHÂSSIS NOIR, sous la caisse : longerons (le « kick-up » sur le pont arrière), cornes, traverses =================
  const RP=[[.50,.56,-1.74],[.50,.60,-1.42],[.50,.60,-.78],[.555,.42,-.52],[.555,.42,.55],[.45,.43,1.10],[.32,.47,1.50],[.30,.50,1.78],[.30,.45,1.99]];
  P.sym(sd=>{for(let i=0;i<RP.length-1;i++)barre('k',mx(RP[i],sd),mx(RP[i+1],sd),.07,[.12,.12,.13,.12,.13,.13,.10,.10][i],[1,0,0]);});
  barre('k',[-.50,.555,-1.70],[.50,.555,-1.70],.08,.10);                       // la traverse arrière
  barre('k',[-.31,.45,ZF+.03],[.31,.45,ZF+.03],.09,.08);                     // la traverse avant, où pend la lame
  tube('c',[-.31,.45,1.985],[.31,.45,1.985],.024,8);                             // la barre chromée, au bout des cornes
  // ================= LA CALANDRE du Deuce : la coquille polie, la grille noire, ses barreaux rouges =================
  const SH=[[0,1.20],[.13,1.19],[.22,1.16],[.275,1.10],[.29,1.02],[.285,.72],[.26,.63],[.20,.585],[.10,.565],[0,.56]],
        ring=f=>{const o=SH.map(q=>[q[0]*f,.88+(q[1]-.88)*f]);return o.concat(o.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));};
  P.plate('c',ring(1),.11,1.66);                                                   // la coquille (1,66 → 1,77)
  P.plate('K',ring(.86),.012,1.768);                                               // la grille, au fond
  {const IN=SH.map(q=>[q[0]*.86,.88+(q[1]-.88)*.86]),haut=x=>U.lin(IN.filter(q=>q[1]>.88),x),bas=x=>U.lin(IN.filter(q=>q[1]<=.88).reverse(),x);
   for(let i=-4;i<=4;i++){const x=i*.052,ax=Math.abs(x),y1=haut(ax)-.012,y0=bas(ax)+.012;P.box('p',.024,y1-y0,.012,x,(y0+y1)/2,1.786);}}
  P.cyl('c',.032,.035,8,0,1.215,1.715,'y');P.cyl('c',.016,.02,6,0,1.24,1.715,'y');  // le bouchon de radiateur
  P.box('K',.50,.52,.08,0,.86,1.60);                                               // le radiateur derrière
  // ---- LES PHARES-OBUS, sur leurs pieds boulonnés aux longerons ----
  P.sym(sd=>{const x=sd*.46,y=.84,z=1.78;
    P.lathe('c',[[0,-.17],[.055,-.15],[.088,-.10],[.10,-.04],[.102,0]],8,x,y,z,'z');
    P.lathe('W',[[.078,.002],[.05,.012],[0,.016]],8,x,y,z,'z');
    tube('c',[sd*.32,.50,1.71],[sd*.46,.75,1.71],.016);});
  // ================= LE TRAIN AVANT : essieu surbaissé poli, lame transversale, épingles, amortisseurs =================
  {const A=[[-.535,.30],[-.40,.215],[.40,.215],[.535,.30]];
   for(let i=0;i<3;i++)poutre('c',[A[i][0],A[i][1],ZF],[A[i+1][0],A[i+1][1],ZF],.05,.065,.014,[0,0,1]);}
  P.sym(sd=>{
    tube('c',[sd*.49,.27,ZF-.02],[sd*.40,.43,1.14],.016);                          // l'épingle
    tube('k',[sd*.47,.25,ZF+.06],[sd*.31,.50,1.70],.022);                          // l'amortisseur
    barre('k',[sd*.42,.25,ZF+.02],[sd*.42,.31,ZF+.02],.025,.03);});                // la jumelle
  {let p0=null;for(let i=0;i<=4;i++){const x=-.42+.84*i/4,p=[x,.40-.105*Math.pow(x/.42,2),ZF+.02];if(p0)barre('k',p0,p,.055,.03,[0,0,1]);p0=p;}}   // la lame, en arc
  tube('c',[.40,.46,1.15],[.50,.27,ZF-.06],.012);P.box('k',.08,.09,.10,.42,.45,1.15); // la direction, son boîtier
  // ================= LE MOTEUR : V8 à nu, compresseur 6-71, deux carbus, écope, huit « zoomies » =================
  const Z0=.74,Z1=1.40,ZM=(Z0+Z1)/2,LM=Z1-Z0;
  P.box('k',.28,.12,.62,0,.37,ZM);                                                 // le carter
  poutre('K',[0,.54,Z0],[0,.54,Z1],.40,.22,.04);                                   // le bloc, noir laqué
  barre('K',[0,.53,.60],[0,.53,Z0],.20,.16);                                       // la cloche, jusqu'au tablier
  P.sym(sd=>{const ro=-sd*.65,su=[Math.cos(ro),Math.sin(ro),0];                   // la culasse penchée et son cache-culbuteurs poli
    prisme('K',[sd*.17,.665,Z0+.02],[sd*.17,.665,Z1-.02],oct(.15,.11,.03),su);
    prisme('c',[sd*.215,.725,Z0+.04],[sd*.215,.725,Z1-.04],oct(.14,.06,.02),su);
    {const uu=[-su[1],su[0],0];for(const t of [-.035,.035]){const c0=[sd*.215+uu[0]*.031+su[0]*t,.725+uu[1]*.031+su[1]*t];barre('K',[c0[0],c0[1],Z0+.10],[c0[0],c0[1],Z1-.10],.01,.006,su);}}   // ses deux gorges
    // LES ZOOMIES : quatre tubes par flanc, qui sortent du bloc et montent en diagonale vers l'arrière, gueule noire
    for(let i=0;i<4;i++){const z=.90+i*.15,a=[sd*.24,.60,z],b=[sd*.37,.61,z-.02],e=[sd*.50,.80,z-.21];
      tube('c',a,b,.027,6,0);tube('c',b,e,.027,6,'K');}});
  poutre('c',[0,.79,ZM-.30],[0,.79,ZM+.30],.24,.06,.015);                          // la pipe du compresseur, polie
  // LE COMPRESSEUR : la boîte chromée, ses côtes, son nez et sa poulie ; la courroie crantée jusqu'au vilebrequin
  const ZB0=.82,ZB1=1.34;
  poutre('c',[0,.93,ZB0],[0,.93,ZB1],.30,.24,.05);
  P.sym(sd=>{for(const y of [.875,.93,.985])P.box('K',.014,.014,ZB1-ZB0-.07,sd*.154,y,(ZB0+ZB1)/2);});
  poutre('C',[0,.93,ZB1],[0,.93,ZB1+.03],.12,.10,.02);
  P.cyl('c',.078,.04,10,0,.93,ZB1+.05,'z');P.cyl('C',.03,.05,6,0,.93,ZB1+.06,'z');
  P.cyl('c',.088,.04,10,0,.47,1.455,'z');                                          // la poulie du vilebrequin
  P.sym(sd=>barre('k',[sd*.08,.93,ZB1+.05],[sd*.088,.47,1.455],.014,.045,[1,0,0])); // la courroie
  // les deux carbus dorés, et L'ÉCOPE « bug catcher » qui les coiffe : sa gueule noire regarde la route
  for(const z of [.97,1.19])poutre('Y',[0,1.075,z-.07],[0,1.075,z+.07],.17,.07,.015);
  const ecS=z=>{const t=(z-.90)/.48,w=.12+.035*t,y0=1.11,y1=1.30+.08*t;return [[0,y0],[w-.02,y0],[w,y0+.02],[w+.012,y1-.035],[w-.03,y1],[0,y1+.006]];};
  P.loft([.90,.93,1.33,1.38],ecS,(j,z)=>j===-1?'K':'c');
  {const E=ecS(1.38),R2=E.concat(E.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));                    // la lèvre polie de la gueule (un anneau), une grille de deux barres
   const yc=(R2[0][1]+R2[5][1])/2,O=R2.map(q=>[q[0]*1.10,yc+(q[1]-yc)*1.10]);
   for(let i=0;i<R2.length;i++){const j=(i+1)%R2.length,a=R2[i],b=R2[j],A=O[i],B=O[j];
     P.tri('c',[a[0],a[1],1.392],[A[0],A[1],1.392],[B[0],B[1],1.392]);P.tri('c',[a[0],a[1],1.392],[B[0],B[1],1.392],[b[0],b[1],1.392]);
     P.tri('c',[A[0],A[1],1.392],[A[0],A[1],1.36],[B[0],B[1],1.36]);P.tri('c',[A[0],A[1],1.392],[B[0],B[1],1.36],[B[0],B[1],1.392]);}
   for(const y of [1.20,1.29])barre('C',[-.145,y,1.386],[.145,y,1.386],.01,.01);}
  tube('c',[.10,.64,1.43],[.10,1.00,1.59],.024,6);                                // la durite polie, jusqu'au radiateur
  // ================= LA POUPE : le pont « quick-change », deux feux ronds sur le tablier, le pare-chocs tube, la plaque pendue dessous =================
  tube('k',[-.62,RR,ZR],[.62,RR,ZR],.042,8);                                      // les trompettes du pont
  P.lathe('c',[[0,-.11],[.10,-.08],[.125,0],[.10,.09],[0,.12]],8,0,RR,ZR,'z');     // la noix
  poutre('c',[0,.44,ZR-.12],[0,.44,ZR-.21],.17,.19,.04);                           // le couvercle des pignons, poli
  P.sym(sd=>{
    // LES FEUX, sur le tablier arrière : la cuvette polie, le verre rouge bombé et, au cœur, le « blue dot » des rodders
    P.lathe('c',[[.088,0],[.09,-.016],[.077,-.026]],10,sd*.36,.74,-1.70,'z');
    P.lathe('L',[[.077,-.02],[.056,-.036],[0,-.043]],10,sd*.36,.74,-1.70,'z');P.cyl('Q',.028,.008,8,sd*.36,.74,-1.745,'z');
    tube('c',[sd*.44,.56,-1.74],[sd*.44,.585,-1.80],.018);});                       // les pattes du pare-chocs, au bout des longerons
  tube('c',[-.52,.585,-1.80],[.52,.585,-1.80],.026,8);                            // le pare-chocs tube, sous le tablier
  P.box('k',.05,.10,.03,0,.555,-1.735);P.box('k',.34,.13,.016,0,.47,-1.765);P.box('w',.30,.10,.012,0,.47,-1.774);   // la plaque, pendue à la traverse (celle du joueur s'y pose)
  P.box('c',.14,.022,.03,0,.83,-1.70);                                          // la poignée de malle
  K.commit(P);
  // LE VERNIS (Léo : « brillant comme La Honte, un rouge franc qui ne brûle pas au blanc sous la lampe ») : la laque de la caisse (groupe 'p',
  // cette caisse seulement) garde son brillant, mais le ciel qu'elle renvoie est TEINTÉ de son rouge (métal .65) : en rasant (le toit, la
  // malle vus de trois-quarts) elle ne se lave plus en rose pâle, elle s'allume en rouge ; le point de la lampe reste petit et sombre
  {const mP=K.mats&&K.mats.p;if(mP){mP.shininess=48;mP.specular.setHex(0x3c3c3c);mP.reflectivity=.20;
    if(mP.userData.uV)mP.userData.uV.value.set(.30,1.25,3,.65);}}
  // ================= LES ROUES : arrière énormes, avant fines — flanc blanc, jante tôle rouge, enjoliveur poli, chapeau « dog dish » =================
  const roue=(hw,n)=>{const J=lpKit({t:{g:'m',c:0x161619},b:{g:'s',c:0xf1ece0},R:{g:'p',c:0xb3101a,f:0},c:{g:'c',c:0xe9ecf0}}),R=RR;
    J.lathe('t',[[.25,-hw],[.34,-hw],[R,-hw*.5],[R,hw*.5],[.34,hw],[.25,hw]],n,0,0,0,'x');
    J.lathe('b',[[.27,hw+.003],[.33,hw+.003]],n,0,0,0,'x');                         // le flanc blanc
    J.lathe('c',[[.25,hw+.001],[.228,hw-.012]],n,0,0,0,'x');                        // l'enjoliveur poli
    J.lathe('R',[[.228,hw-.012],[.20,hw-.034],[.12,hw-.04]],n,0,0,0,'x');           // la jante tôle, rouge
    J.lathe('c',[[.12,hw-.04],[.105,hw-.02],[.055,hw-.006],[0,hw-.003]],n,0,0,0,'x'); // le chapeau
    return J.done();};
  const JR=roue(.16,16),JF=roue(.09*RR/RF,10),mat=g=>(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null);
  return {hl:[.46,.84,1.80],tl:[.36,.74,-1.74],wx:.76,wxF:.62,wRF:RF/RR,wzF:ZF,wzR:-ZR,
          roueDeco:(w,sx,sz)=>{const G=sz>0?JF:JR;for(const g in G){const m=new THREE.Mesh(G[g],mat(g));m.userData.lp=1;w.add(m);}},
          lpw:{R:RR,w:.32,style:'nyan',jante:0xb3101a}};
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
