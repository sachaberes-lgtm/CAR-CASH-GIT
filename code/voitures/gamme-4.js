  e_raie:function(K){
  /* LA RAIE v2 (13/10, « plus ressemblante ») — la troisième génération de la raie de Saint-Louis (68-72, pare-chocs
     chromés), relevée sur ses photos : la VAGUE des ailes (bosses hautes au-dessus des roues, taille PINCÉE aux portières,
     le capot creusé entre les ailes avant avec son bossage), un nez long et pointu, la coque qui rentre sous la taille,
     les arcs-boutants autour d'une lunette debout, le T-top, la poupe tronquée à quatre feux ronds. */
  const U=LPU,R=.33,ZF=1.20,ZR=-1.29;
  const P=K.kit({p:{g:'p',c:0xc4161c},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.05],[R*.60,2*R+.02],[R*.98,R*1.14],[R+.13,.27]];
  let zs=[-2.32,-2.28,-2.20,-1.90,-1.60,-1.20,-.86,-.80,-.60,-.30,0,.26,.31,.45,.80,1.60,1.85,2.00,2.12,2.22,2.28,2.32];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.13])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const tun=z=>z>-1.61&&z<-.83,cab=z=>z>=-.83&&z<.32;
  const hmp=(z,w,r)=>{const d=Math.abs(z-w)/r;return d>=1?0:1-d*d;};
  const T=z=>U.lin([[-2.32,.82],[-2.28,.87],[-2.20,.90],[-1.60,.905],[-.86,.92],[-.80,1.19],[-.30,1.21],[.31,.82],[.45,.80],[ZF,.785],[1.85,.70],[2.12,.60],[2.32,.50]],z),
        yB=z=>U.lin([[-2.32,.79],[-2.20,.84],[ZR,.85],[-.60,.80],[.31,.78],[ZF,.77],[1.85,.70],[2.12,.62],[2.32,.50]],z)+.075*hmp(z,ZR,1.0)+.10*hmp(z,ZF,.95),   // la VAGUE
        xW=z=>U.lin([[-2.32,.74],[-2.15,.84],[ZR,.88],[-.60,.82],[-.10,.79],[.40,.81],[ZF,.875],[1.85,.83],[2.12,.72],[2.32,.48]],z);   // LA BOUTEILLE
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.27),U.lin([[-2.32,.34],[-2.10,.27],[2.05,.27],[2.32,.33]],z)),xw=xW(z),b=yB(z),t=T(z);
    const y3=Math.max(yb+.06,Math.min(.56,b-.20)),y2=Math.max(yb+.03,Math.min(.36,y3-.10)),y4=Math.max(y3+.02,b-.08),y5=Math.max(y4+.02,b);
    const s=[[0,yb],[xw-.08,yb],[xw-.03,y2],[xw,y3],[xw-.015,y4],[xw-.06,y5]];
    if(cab(z)){const xr=U.lin([[-.80,.60],[-.30,.58],[.31,.68]],z);s.push([xw-.14,y5+.02],[Math.min(xr,xw-.20),Math.max(y5+.04,t-.05)],[.10,Math.max(y5+.05,t-.01)],[0,Math.max(y5+.055,t)]);}
    else if(tun(z)){const ys=U.lin([[-1.60,.93],[-.86,1.16]],z);                   // les ARCS-BOUTANTS et la lunette creusée
      s.push([xw-.14,y5+.02],[.60,Math.max(y5+.03,ys)],[.52,Math.max(y5+.01,t+.005)],[0,Math.max(y5+.005,t)]);}
    else if(z>.31){const xc=xw-.10,yv=Math.max(y4+.01,Math.min(t,y5)-.06);         // les ailes en crête, le capot creusé, le BOSSAGE
      s.push([xc,y5+.012],[xc*.58,yv],[xc*.24,Math.max(yv+.004,t-.006)],[0,Math.max(yv+.008,t)]);}
    else{const xc=xw-.16;s.push([xc,y5+.005],[Math.min(.40,xc*.6),Math.max(y5+.006,Math.max(t,(y5+t)/2))],[.10,Math.max(y5+.004,t-.003)],[0,Math.max(y5+.005,t)]);}
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(cab(z)){
      if(j===6&&z>-.78&&z<.26)return 'g';
      if(j>=7&&z>-.30)return 'g';                                                 // pare-brise
      if(j===7)return 'g';                                                         // les deux dalles du T-TOP
    }
    if(j===8&&z>-.87&&z<-.79)return 'g';                                          // la lunette, debout au fond du creux
    return 'p';});
  // LES PHARES ESCAMOTABLES, trappes fermées : la tôle, et son joint
  P.sym(sd=>{
    P.box('k',.28,.012,.30,sd*.56,.712,1.84,.12,0,sd*.30);P.box('p',.26,.02,.28,sd*.56,.719,1.84,.12,0,sd*.30);
    // le nez : lames de pare-chocs, calandre basse à alvéoles, veilleuses
    P.box('c',.30,.045,.05,sd*.635,.47,2.195,0,sd*.82);                          // les lames d'angle, sur le V du nez
    P.box('O',.10,.05,.02,sd*.32,.37,2.345);
    // les OUÏES d'aile (quatre fentes), le rétro obus, bas de caisse
    P.box('k',.02,.16,.34,sd*.83,.60,.70);
    // (affinement) L'OUÏE EN GRILLE des C3 de 70-72 : un caisson couleur caisse dans le creux noir (c'étaient trois barres chromées posées)
    for(const y of [.535,.60,.665])P.box('p',.022,.012,.32,sd*.838,y,.70);for(let i=0;i<5;i++)P.box('p',.024,.15,.012,sd*.839,.60,.56+i*.07);
    P.box('c',.015,.05,.015,sd*.76,.86,.20);P.put('p',new THREE.SphereGeometry(1,8,5),sd*.77,.90,.20,0,0,0,.05,.04,.08);
    P.box('k',.02,.05,1.20,sd*(xW(-.05)-.04),.34,-.05);
    // la poupe tronquée : QUATRE feux ronds, lames, sorties carrées
    for(const x of [.30,.58]){P.cyl('c',.075,.03,12,sd*x,.68,-2.32,'z');P.cyl('L',.062,.04,12,sd*x,.68,-2.325,'z');}
    P.box('c',.52,.04,.08,sd*.44,.50,-2.33,0,-sd*.10);
    P.box('c',.16,.07,.05,sd*.40,.34,-2.33);P.box('k',.12,.04,.02,sd*.40,.34,-2.352);
  });
  P.box('k',.86,.13,.03,0,.37,2.325);for(let i=0;i<7;i++)P.box('c',.012,.11,.012,(i/6-.5)*.78,.37,2.343); // la calandre basse
  P.box('c',.90,.035,.05,0,.465,2.315);                                              // la lame du nez
  K.commit(P);
  return {hl:[.56,.72,1.95],tl:[.58,.68,-2.34],wx:.72,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'rayons',n:5,jante:0xd4d8de,accent:0x9aa0a8,branches:1}};
},
  a_eternelle:function(K){
  /* L'ÉTERNELLE v2 (13/10, « plus ressemblante ») — l'hypercar de Molsheim, relevée sur ses photos : un nez HAUT
     qui porte le FER À CHEVAL, des ailes avant qui bombent, un habitacle en GOUTTE (pare-brise couché, pavillon
     rond, une ARÊTE dorsale qui file jusqu'à la poupe), des hanches énormes, la grande LIGNE EN C polie qui sépare
     le bleu de devant du carbone de derrière, les QUATRE PHARES en ligne, et à la poupe le TRAIT de feux d'une
     aile à l'autre au-dessus d'une grille noire et de quatre sorties. */
  const U=LPU,R=.35,ZF=1.27,ZR=-1.44,hmp=(z,w,l)=>{const d=Math.abs(z-w)/l;return d>=1?0:1-d*d;};
  const P=K.kit({p:{g:'p',c:0x1d4fd8},n:{g:'p',c:0x121418,f:0},k:{g:'m',c:0x0f1013},K:{g:'g',c:0x08090b},
    c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x121a24},W:{g:'l',c:0xf2f7ff},L:{g:'l',c:0xff1a2a},r:{g:'l',c:0x9a0f1a}});
  const AR=[[0,2*R+.05],[R*.62,2*R+.03],[R*.98,R*1.12],[R+.13,.24]];
  const ZE=2.27,ZC=.85,ZK=-.62;                                                  // le nez, le pied du pare-brise, la fin du pavillon
  let zs=[-ZE,-2.24,-2.18,-2.10,-1.90,-1.70,-1.35,-1.00,-.80,ZK,-.55,-.50,-.25,.05,.40,.62,.80,ZC,.95,1.60,2.00,2.10,2.18,2.23,ZE];
  for(const w of [ZF,ZR])for(const d of [R*.62,R*.98,R+.13])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z<=ZC&&z>=ZK;
  const T=z=>U.lin([[-ZE,.88],[-2.24,.94],[-2.12,.975],[-1.90,.99],[-1.44,1.03],[-1.00,1.09],[ZK,1.16],[-.25,1.205],[.05,1.19],[.40,1.10],[ZC,.905],
                    [1.00,.885],[ZF,.855],[1.60,.81],[2.00,.73],[2.10,.70],[2.18,.67],[2.23,.645],[ZE,.61]],z),
        yB=z=>U.lin([[-ZE,.84],[-2.15,.92],[ZR,.99],[ZK,1.00],[0,.965],[ZC,.935],[ZF,.875],[1.70,.80],[2.05,.70],[2.20,.64],[ZE,.58]],z)+.02*hmp(z,ZR,.7),
        sH=z=>U.lin([[-ZE,.74],[-2.10,.82],[ZR,.86],[ZK,.80],[0,.74],[ZC,.75],[ZF,.76],[2.00,.66],[ZE,.54]],z)+.03*hmp(z,ZR,.8),
        xW=z=>U.lin([[-ZE,.86],[-2.22,.95],[-2.05,1.00],[-1.70,1.02],[ZR,1.025],[-.90,.99],[-.30,.95],[.40,.95],[ZC,.97],[ZF,.995],[1.80,.97],[2.10,.92],[2.22,.85],[ZE,.76]],z),
        xR=z=>U.lin([[ZK,.46],[-.25,.53],[.05,.58],[.40,.64],[ZC,.74]],z),
        zB=y=>U.lin([[.30,-.40],[.45,-.62],[.65,-.76],[.85,-.75],[1.00,-.62]],y);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.24),U.lin([[-ZE,.30],[-2.10,.24],[2.10,.24],[ZE,.28]],z)),xw=xW(z),t=T(z),sh=sH(z);
    const y3=Math.max(yb+.06,Math.min(.56,sh-.14)),y2=Math.max(yb+.03,Math.min(.36,y3-.10)),y4=Math.max(y3+.02,sh),y5=Math.max(y4+.02,yB(z));
    const s=[[0,yb],[xw-.09,yb],[xw-.02,y2],[xw,y3],[xw-.02,y4],[xw-.08,y5]];
    if(cab(z)){const y6=y5+.02,y7=Math.max(y6+.04,t-.07);                          // la GOUTTE : vitre qui rentre, pavillon rond
      s.push([xw-.16,y6],[Math.min(xR(z),xw-.26),y7],[xR(z)*.5,Math.max(y7+.01,t-.016)],[0,Math.max(t,y7+.015)]);}
    else if(z>ZC){const yc=y5+.025,tc=Math.max(y4+.01,Math.min(t,yc-.005)),xc=xw-.22;   // ailes bombées, capot creusé entre elles
      s.push([xc,yc],[xc*.62,Math.max(tc+.004,(yc+tc)/2)],[xc*.30,tc+.003],[0,tc]);}
    else{const tt=Math.max(t,y5+.03),xc=xw-.16;                                     // le capot moteur
      s.push([xc,y5+.02],[xc*.68,Math.max(y5+.025,tt-.04)],[xc*.30,tt-.012],[0,tt]);}
    return s;
  },(j,z,y)=>{
    if(j===0)return 'k';
    if(j===1)return 'n';
    if(j<=4)return z>zB(y)?'p':'n';                                  /* bleu devant la ligne en C, carbone derrière */
    if(z>ZC)return 'p';
    if(z<ZK){if(j===8&&z>-1.35&&z<-.80)return 'g';return 'n';}      /* capot moteur carbone, sa vitre au centre */
    if(j===5)return z>ZK?'p':'n';
    if(j===6)return z>-.50&&z<.80?'g':'n';                           /* les vitres, montants carbone */
    if(z>.05)return 'g';                                             /* le pare-brise */
    return 'n';});                                                   /* le pavillon carbone */
  /* LA LIGNE EN C, polie, qui naît sous la porte et remonte derrière elle jusqu'au pavillon */
  const C9=[[.62,.33],[-.40,.33],[-.62,.45],[-.76,.64],[-.77,.84],[-.68,.99],[-.52,1.08]];
  P.sym(sd=>{
    for(let i=0;i<C9.length-1;i++){const a=C9[i],b=C9[i+1],zm=(a[0]+b[0])/2,ym=(a[1]+b[1])/2,
        L9=Math.hypot(a[0]-b[0],a[1]-b[1]),ang=Math.atan2(b[1]-a[1],-(b[0]-a[0]));
      P.box('c',.03,.045,L9+.03,sd*(xW(zm)+.004-(ym>1.03?.24:ym>.95?.10:ym>.82?.02:0)),ym,zm,ang);}
    /* QUATRE PHARES EN LIGNE sur la pente de l'aile, dans leur fente noire */
    P.box('K',.36,.035,.13,sd*.62,.705,2.06,.30,sd*.18,0);
    for(let i=0;i<4;i++){const x=.48+i*.09;P.box('W',.06,.02,.05,sd*x,.718,2.10-i*.025,.30,sd*.18,0);}
    /* les grandes prises d'air du bouclier, et leur lame */
    P.plate('k',[[sd*.46,.27],[sd*.84,.27],[sd*.80,.52],[sd*.52,.47]],.03,2.20);
    P.box('c',.34,.015,.03,sd*.66,.52,2.235,0,sd*.25,0);
    /* rétros sur pied, poignée affleurante */
    P.box('n',.14,.025,.04,sd*.95,.955,.64);P.box('p',.07,.085,.18,sd*1.02,.975,.62);
    /* grilles de ventilation arrière et feux d'angle */
    P.box('k',.30,.22,.02,sd*.62,.62,-ZE-.006);
    P.box('L',.03,.04,.14,sd*.86,.92,-2.17,0,-sd*.5,0);
  });
  /* LE FER À CHEVAL : cadre chromé, grille bleu nuit, il mord dans le capot */
  P.plate('c',[[-.24,.70],[.24,.70],[.23,.50],[.17,.37],[.07,.31],[-.07,.31],[-.17,.37],[-.23,.50]],.035,ZE-.02);
  P.plate('K',[[-.205,.665],[.205,.665],[.195,.51],[.145,.40],[.06,.355],[-.06,.355],[-.145,.40],[-.195,.51]],.035,ZE-.01);
  for(let i=0;i<5;i++)P.box('k',.38-i*.05,.01,.01,0,.40+i*.06,ZE+.03);
  P.box('c',.06,.035,.02,0,.62,ZE+.03);                                           // le macaron ovale
  P.box('k',1.30,.04,.12,0,.25,ZE-.08);                                           // la lame basse
  /* L'ARÊTE DORSALE : du pavillon jusqu'à la poupe, et l'aileron couché */
  P.prism('n',[[-.25,1.20],[-2.20,.99],[-2.22,.985],[-.27,1.185]],.04,0);
  // (13/10, Léo : « les barres chelou ») le jonc chromé qui courait sur l'arête dorsale est RETIRÉ (il barrait la vitre du moteur)
  P.box('n',1.74,.035,.30,0,1.00,-2.10,.06);
  /* LE TRAIT DE FEUX : un seul trait rouge, d'une aile à l'autre */
  P.box('K',1.76,.09,.02,0,.90,-ZE-.004);P.box('L',1.66,.03,.03,0,.905,-ZE-.01);
  P.box('k',1.66,.38,.02,0,.62,-ZE+.004);
  for(let i=0;i<5;i++)P.box('n',1.60,.008,.012,0,.48+i*.06,-ZE-.006);
  /* le diffuseur à ailettes, et les quatre sorties */
  P.box('k',1.60,.03,.40,0,.26,-2.07,-.25);
  for(let i=-3;i<=3;i++)if(i)P.box('n',.02,.13,.34,i*.21,.31,-2.10,-.25);
  P.box('K',.66,.20,.03,0,.47,-ZE-.004);P.box('c',.70,.02,.035,0,.575,-ZE-.006);P.box('c',.70,.02,.035,0,.365,-ZE-.006);
  for(const x of [-.23,-.08,.08,.23])P.cyl('c',.058,.03,10,x,.47,-ZE-.012,'z');
  K.commit(P);
  return {hl:[.62,.72,2.08],tl:[.83,.905,-ZE-.02],wx:.86,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.30,style:'multi',n:10,jante:0xcfd4da,branches:1}};
 },
  b_trone:function(K){
  /* LE TRÔNE CENTRAL v2 (13/10, « plus ressemblant ») — la supercar à trois places de Woking : nez TRÈS bas et
     rond, deux ailes avant qui bombent plus haut que le capot (les phares en goutte au bout), le grand pare-brise
     couché, une VERRIÈRE étroite posée sur une coque large, l'ÉCOPE qui naît sur le toit et plonge vers le moteur,
     les grandes ouïes derrière les portes, et une poupe droite : grille noire, quatre feux ronds. */
  const U=LPU,R=.33,ZF=1.39,ZR=-1.33,hmp=(z,w,l)=>{const d=Math.abs(z-w)/l;return d>=1?0:1-d*d;};
  const P=K.kit({p:{g:'p',c:0xff7a10},n:{g:'m',c:0x121316},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xe9ecf0},
    a:{g:'s',c:0x3a3d44},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.035],[R*.60,2*R+.01],[R*.95,R*1.20],[R+.10,.20]];
  const ZC=.86,ZE=-.95;                                                          // pied du pare-brise, fin de la verrière
  let zs=[-2.145,-2.12,-2.05,-1.90,-1.65,-1.10,ZE,-.92,-.80,-.62,-.58,-.40,-.20,.10,.40,.62,.78,.82,ZC,.90,1.10,1.70,1.80,1.90,1.96,2.02,2.07,2.10,2.13,2.145];   // (affinement) le nez rond en facettes plus fines
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.95,R+.10])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z<=ZC&&z>=ZE;
  const T=z=>U.lin([[-2.145,.84],[-2.12,.89],[-2.05,.915],[-1.65,.95],[-1.10,.99],[ZE,1.00],[-.80,1.06],[-.40,1.13],[-.20,1.135],[.10,1.09],[.40,.99],[ZC,.755],
                    [1.10,.715],[1.39,.68],[1.70,.63],[1.90,.575],[2.02,.52],[2.10,.47],[2.145,.42]],z),
        yB=z=>U.lin([[-2.145,.82],[-2.05,.88],[-1.65,.92],[ZR,.935],[-1.00,.90],[-.60,.83],[0,.80],[ZC,.79],[1.10,.765],[ZF,.755],[1.70,.71],[1.95,.62],[2.10,.53],[2.145,.47]],z),
        sH=z=>U.lin([[-2.145,.72],[-1.90,.80],[ZR,.84],[-.80,.76],[0,.70],[ZC,.69],[ZF,.68],[1.80,.60],[2.05,.50],[2.145,.44]],z),
        xW=z=>U.lin([[-2.145,.80],[-2.10,.85],[-1.95,.89],[ZR,.91],[-.80,.895],[0,.875],[.80,.885],[ZF,.90],[1.70,.88],[1.90,.80],[2.05,.68],[2.12,.58],[2.145,.50]],z)+.012*hmp(z,ZR,.6),
        xR=z=>U.lin([[ZE,.40],[-.60,.44],[-.20,.46],[.10,.50],[.50,.60],[ZC,.70]],z);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.20),U.lin([[-2.145,.30],[-1.95,.20],[1.90,.20],[2.145,.27]],z)),xw=xW(z),t=T(z),sh=sH(z);
    const y3=Math.max(yb+.05,Math.min(.48,sh-.14)),y2=Math.max(yb+.03,Math.min(.32,y3-.08)),y4=Math.max(y3+.02,sh),y5=Math.max(y4+.02,yB(z));
    const s=[[0,yb],[xw-.09,yb],[xw-.02,y2],[xw,y3],[xw-.015,y4],[xw-.07,y5]];
    if(cab(z)){const y6=y5+.02,y7=Math.max(y6+.04,t-.07);                          // la VERRIÈRE : rentrée sur les épaules, bombée
      s.push([xw-.14,y6],[Math.min(xR(z),xw-.24),y7],[xR(z)*.5,Math.max(y7+.01,t-.016)],[0,Math.max(t,y7+.015)]);}
    else if(z>ZC){const yc=y5+.03,tc=Math.max(y3+.04,Math.min(t,yc-.01)),xc=xw-.20;  // les AILES plus hautes que le capot, qui se creuse entre elles
      s.push([xc,yc],[xc*.62,Math.max(tc+.006,(yc+tc)/2)],[xc*.30,tc+.004],[0,tc]);}
    else{const tt=Math.max(t,y5+.03);                                               // le capot moteur
      const xc=xw-.15;s.push([xc,y5+.02],[xc*.70,Math.max(y5+.025,tt-.035)],[xc*.35,tt-.01],[0,tt]);}
    return s;
  },(j,z)=>{
    if(j<0)return j===-2?'n':'p';
    if(j<=1)return 'n';
    if(cab(z)){
      if(j===6&&z>-.58&&z<.78)return 'g';                                            // la porte-papillon vitrée
      if((j===7||j===8)&&z>.10)return 'g';                                          // le pare-brise qui enveloppe
      if(j===6&&z<-.62&&z>-.92)return 'g';                                          // le hublot de custode
    }
    if(j===8&&z<ZE&&z>-1.65)return 'a';                                             // les persiennes du capot moteur, au centre
    return 'p';});
  // L'ÉCOPE : elle naît sur le pavillon, au-dessus du pilote, et plonge vers le moteur
  P.prism('p',[[-.18,1.125],[-.26,1.20],[-.55,1.215],[-1.05,1.06],[-1.05,1.00],[-.18,1.10]],.26,0);
  P.box('n',.20,.06,.02,0,1.175,-.235,-.9);
  for(let i=0;i<6;i++){const z=-1.12-i*.09;P.box('n',.42,.01,.05,0,T(z)+.008,z,-.10);}   // les lames sur le moteur
  P.sym(sd=>{
    // les lignes des portes-papillon, qui montent dans le pavillon
    P.box('n',.006,.36,.008,sd*(xW(.80)+.002),.58,.80,-.22);
    // L'OUÏE DE FLANC derrière la porte : le creux noir et sa lèvre
    P.prism('n',[[-.62,.40],[-1.02,.40],[-1.02,.86],[-.70,.80]],.02,sd*(xW(-.82)-.005));
    for(const y of [.50,.60,.70])P.box('a',.012,.012,.32,sd*(xW(-.82)+.002),y,-.84);
    P.box('n',.02,.08,.70,sd*(xW(.3)-.06),.27,.30);                                 // le bas de caisse
    P.box('p',.05,.07,.15,sd*.97,.92,.70);P.box('n',.12,.02,.03,sd*.90,.88,.72);     // les rétros sur tige
    // LES PHARES EN GOUTTE au bout des ailes : deux optiques rondes sous une bulle, le clignotant dessous
    P.put('c',new THREE.SphereGeometry(1,8,5),sd*.52,.672,1.86,.30,0,0,.13,.03,.16);   // (affinement) le RÉFLECTEUR chromé sous la bulle (noir, c'étaient deux gros yeux)
    P.put('W',new THREE.SphereGeometry(1,8,5),sd*.565,.688,1.82,.30,0,0,.048,.026,.048);P.put('W',new THREE.SphereGeometry(1,8,5),sd*.475,.682,1.89,.30,0,0,.042,.024,.042);
    P.box('O',.12,.022,.03,sd*.36,.47,2.10,0,sd*.30);
    // les deux grandes bouches ovales aux coins du bouclier
    P.put('n',new THREE.CylinderGeometry(1,1,1,12),sd*.42,.30,2.06,Math.PI/2,0,0,.13,.06,.05);
    // la poupe : quatre feux ronds au-dessus de la GRILLE
    for(const [x,k] of [[.62,'L'],[.78,'O']]){P.cyl('n',.07,.03,12,sd*x,.70,-2.15,'z');P.cyl(k,.056,.04,12,sd*x,.70,-2.155,'z');}
  });
  P.put('n',new THREE.CylinderGeometry(1,1,1,12),0,.27,2.12,Math.PI/2,0,0,.16,.05,.04);  // la petite bouche centrale
  P.box('n',.06,.02,.30,-.20,T(1.55)+.005,1.55);P.box('n',.06,.02,.30,.20,T(1.55)+.005,1.55); // les deux prises NACA du capot
  P.box('n',1.50,.32,.02,0,.48,-2.15);
  for(let i=0;i<5;i++)P.box('a',1.44,.01,.02,0,.36+i*.06,-2.158);                   // la GRILLE
  for(let i=0;i<7;i++)P.box('a',.01,.30,.02,(i/6-.5)*1.40,.48,-2.159);
  P.box('p',1.30,.025,.14,0,.905,-2.08,.12);                                       // le petit volet de poupe
  for(const x of [-.07,.07])P.cyl('c',.06,.10,10,x,.46,-2.18,'z');                  // les sorties centrales
  K.commit(P);
  return {hl:[.52,.69,1.88],tl:[.70,.70,-2.16],wx:.75,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.28,style:'rayons',n:5,jante:0xc0c4cc,accent:0x9ea3ab,branches:1}};   // (19/10) cinq branches gris magnésium (sombres, elles ne se lisaient pas)
},
  c_spectre:function(K){
  const U=LPU,R=.355,ZF=1.27,ZR=-1.43,LF=2.25;
  const P=K.kit({p:{g:'p',c:0x1a1d22},n:{g:'p',c:0x5cff1e,f:0},N:{g:'l',c:0x5cff1e},k:{g:'m',c:0x0f1013},K:{g:'g',c:0x0b0c10},
    c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1c2733},W:{g:'l',c:0xf2f7ff},L:{g:'l',c:0xff1f2e}});
  const AR=[[0,2*R+.05],[R*.62,2*R+.03],[R*.98,R*1.20],[R+.12,.20]];
  const zs=[-LF,-2.20,-2.05,-1.60,-1.10,-.55,.05,.95,1.60,2.05,2.18,LF];
  for(const w of [ZF,ZR])for(const d of [R*.62,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yB=z=>U.lin([[-LF,.62],[-2.20,.76],[-2.05,.82],[-1.43,.86],[-1.10,.84],[.95,.74],[1.30,.72],[1.60,.66],[2.05,.52],[2.18,.44],[LF,.36]],z),
        yF=z=>U.lin([[-LF,.66],[-2.20,.80],[-2.05,.87],[-1.43,.93],[-1.10,.90],[.95,.78],[1.30,.80],[1.60,.74],[2.05,.58],[2.18,.48],[LF,.38]],z), // crêtes d'ailes
        yH=z=>U.lin([[-LF,.64],[-2.20,.78],[-2.05,.84],[-1.60,.88],[-1.10,.90],[.95,.74],[1.30,.70],[1.60,.64],[2.05,.50],[2.18,.43],[LF,.36]],z), // capots
        yT=z=>U.lin([[-1.10,.92],[-.55,1.08],[-.20,1.12],[.05,1.11],[.50,1.00],[.95,.78]],z),
        xW=z=>U.lin([[-LF,.86],[-2.15,.96],[-1.80,1.00],[-1.00,1.00],[-.40,.96],[.40,.95],[1.00,.985],[1.70,.985],[2.10,.92],[LF,.80]],z),
        cab=z=>z>-1.11&&z<.96;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.16),xw=xW(z),B=yB(z),y2=Math.max(.26,yb+.05),yM=Math.max(y2+.01,Math.min(.50,B-.16));
    const s=[[0,yb],[xw-.07,yb],[xw,y2],[xw+.005,yM],[xw-.03,B]];
    if(cab(z)){const t=yT(z),xr=U.lin([[-1.10,.60],[-.55,.54],[.05,.52],[.50,.60],[.95,.72]],z);
      s.push([xw-.10,Math.max(B+.03,yF(z))],[xr,Math.max(B+.05,t-.06)],[xr*.5,Math.max(B+.06,t-.015)],[0,Math.max(B+.065,t)]);}
    else s.push([xw-.12,Math.max(B+.02,yF(z))],[xw-.34,yH(z)],[.24,yH(z)+.015],[0,yH(z)+.02]);
    return s;
  },(j,z)=>{
    if(j===0||j===1)return 'k';
    if(j<0)return 'p';
    if(cab(z)&&j>=5)return 'g';                                                  // LA BULLE : tout le vitrage d'un seul tenant
    if(j>=6&&z<-1.12&&z>-2.00)return 'K';                                       // le capot moteur vitré
    return 'p';});
  P.box('p',.06,.02,1.55,0,yT(-.25)+.008,-.25);                                 // l'arête de carbone sur la bulle
  // LA LAME AVANT qui rase le sol, liserée de néon, et ses deux canards
  P.box('k',1.96,.035,.34,0,.13,2.08);P.box('N',1.96,.012,.012,0,.15,2.25);
  P.plate('k',[[-.46,.20],[.46,.20],[.40,.33],[-.40,.33]],.03,LF-.02);P.plate('N',[[-.47,.335],[.47,.335],[.47,.35],[-.47,.35]],.01,LF+.012); // la gueule
  P.sym(sd=>{
    P.box('k',.18,.012,.12,sd*.90,.40,2.02,0,sd*.3,-sd*.25);
    // PHARES : une fente noire et trois optiques rondes, en ligne
    const eye=new THREE.Shape();eye.moveTo(-.20,.03);eye.lineTo(.14,.05);eye.lineTo(.22,.0);eye.lineTo(.16,-.04);eye.lineTo(-.16,-.03);
    P.put('k',new THREE.ExtrudeGeometry(eye,{depth:.03,bevelEnabled:false}),sd*.64,.585,1.93,-1.27,0,0,sd,1.3,1);
    P.put('W',new THREE.ExtrudeGeometry(eye,{depth:.03,bevelEnabled:false}),sd*.645,.60,1.925,-1.27,0,0,sd*.92,.35,1);
    P.put('N',new THREE.ExtrudeGeometry(eye,{depth:.03,bevelEnabled:false}),sd*.64,.568,1.99,-1.27,0,0,sd*1.02,.22,1);  // le sourcil néon
    for(let i=0;i<3;i++)P.put('W',new THREE.CylinderGeometry(.026,.026,.03,8),sd*(.54+i*.09),.588,1.905+i*.012,-1.27+Math.PI/2,0,0);
    P.box('k',.30,.14,.03,sd*.52,.26,LF-.02);                                   // bouches latérales
    // PORTES DIÈDRES au trait, grande écope latérale, jupe liserée de néon
    P.box('k',.012,.34,.012,sd*(xW(.72)+.004),.62,.72,-.25);P.box('k',.012,.012,1.18,sd*(xW(.12)+.004),.43,.12);
    P.box('k',.012,.30,.012,sd*(xW(-.48)+.004),.61,-.48,.35);
    P.prism('k',[[-.62,.46],[-1.14,.46],[-1.14,.86],[-.78,.80]],.02,sd*(xW(-.88)+.004));
    P.box('N',.012,.012,2.10,sd*(xW(0)+.012),.30,-.10);
    P.box('n',.10,.07,.16,sd*.98,.84,.78);P.box('k',.05,.03,.08,sd*.93,.81,.80);   // rétros vert néon
    // LE GRAND AILERON sur ses cols de cygne : il pend PAR LE DESSUS, flasques néon
    P.prism('k',[[-1.70,.84],[-1.80,.84],[-1.90,1.02],[-1.98,1.10],[-2.06,1.10],[-2.06,1.06],[-1.99,1.06],[-1.88,.98]],.035,sd*.42);
    P.prism('n',[[-1.86,.94],[-2.18,.94],[-2.20,1.06],[-1.90,1.06]],.02,sd*.86);
    // LA POUPE : deux anneaux rouges par côté, grille noire
    for(const x of [.58,.76]){P.cyl('L',.07,.03,12,sd*x,.66,-LF-.01,'z');P.cyl('k',.04,.035,10,sd*x,.66,-LF-.012,'z');}
  });
  P.prism('p',[[-1.92,1.02],[-2.20,1.00],[-2.20,1.035],[-1.95,1.06]],1.70,0);    // le plan de l'aileron, en carbone
  P.box('N',1.70,.01,.01,0,1.036,-2.20);
  P.box('k',1.74,.24,.02,0,.60,-LF-.005);                                       // grille arrière
  P.box('k',1.60,.14,.36,0,.20,-2.05);for(let i=0;i<6;i++)P.box('k',.02,.16,.36,(i-2.5)*.26,.24,-2.07); // diffuseur à ailettes
  P.box('c',.30,.10,.06,0,.44,-LF);P.box('k',.24,.06,.02,0,.44,-LF-.025);     // l'échappement central
  K.commit(P);
  return {hl:[.60,.55,2.00],tl:[.67,.66,-2.27],wx:.84,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.30,style:'rayons',n:7,jante:0x5cff1e,accent:0x2a2e35,branches:1}};
},
  /* LE BLINDÉ NOIR EN PORC-ÉPIC (2026-10-16, Léo : « un peu en mode gothique, mais partout — c'est un peu une voiture porc-épic »).
     Sa silhouette ne bouge pas (le char à roues avant sur bras, l'arrière doublé, les plaques) ; par-dessus, LE PELAGE : ~350 piquants
     posés sur la peau même du loft (`surf`/`nrm` relisent les sections au point près), couchés vers la poupe, courts sur le museau,
     longs sur le dos, une CRÊTE sur l'échine, les plus longs sur les ailes arrière — rien sur les vitres ni dans une roue. Le gothique :
     les meurtrières deviennent des LANCETTES en ogive (vitrail sombre, meneau), un pic au moyeu. 2e jet : le porc-épic sur le DOS, des
     CLOUS chromés sur les flancs et l'avant, la turbine d'origine (voir LE PELAGE). 3e jet (Léo : « la structure était belle, mais ça
     manque de finition et de fusion avec l'idée des pics ») : LA MUE (le clou se couche et s'allonge du nez au dos), des collerettes,
     le FILET D'OS de la ceinture, les ailes arrière en OGIVE, le BÉLIER, les yeux en biais, les plaques en fer noir. */
  d_chevalier:function(K){
  const U=LPU,R=.52,ZF=1.52,ZR=-1.42,WX=1.03,TW=.44;
  const P=K.kit({p:{g:'s',c:0x17181b},G:{g:'s',c:0x33353c},k:{g:'m',c:0x111214},K:{g:'g',c:0x0b0c0e},c:{g:'c',c:0xc9ced6},
    g:{g:'g',c:0x141c24},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xff8a24},
    q:{g:'k',c:0x24252b},Q:{g:'n',c:0xe9e1cd},                                  // LES PIQUANTS : la hampe en fer noir, la pointe en ivoire
    r:{g:'l',c:0x5e0a1e},v:{g:'l',c:0x3a1270}});                                  // LES LANCETTES : vitrail sombre, allumé de l'intérieur
  const zs=[-2.24,-2.08,-1.92,-.88,-.45,.15,.65,1.00,2.06,2.26];
  const yB=z=>U.lin([[-2.24,.48],[-1.92,.42],[1.00,.42],[2.06,.46],[2.26,.50]],z),
        xM=z=>U.lin([[-2.24,.50],[-1.92,.54],[-.88,.54],[-.45,.88],[.15,.93],[.65,.84],[1.00,.62],[2.06,.56],[2.26,.46]],z),
        yT=z=>U.lin([[-2.24,1.08],[-2.08,1.16],[-1.92,1.20],[-.88,1.46],[-.45,1.57],[.15,1.52],[.65,1.16],[1.00,1.00],[2.06,.74],[2.26,.62]],z),
        xT=z=>U.lin([[-2.24,.44],[-1.92,.48],[-.88,.50],[-.45,.56],[.15,.58],[.65,.70],[1.00,.56],[2.06,.44],[2.26,.36]],z);
  const SEC=z=>{const yb=yB(z),xm=xM(z),yt=yT(z),ys=Math.max(yb+.32,yt-.18);
    return [[0,yb],[xm-.14,yb],[xm,yb+.26],[xm-.06,ys],[xT(z),yt],[0,yt+.03]];};
  P.loft(zs,SEC,(j,z)=>{
    if(j===0)return 'k';
    if(j<0||j===1)return 'G';                                                  // bouclier et chine basse en plaques grises
    if(j===4&&z>.15&&z<.65)return 'g';                                         // le pare-brise blindé
    return 'p';});                                                             // (les meurtrières deviennent des LANCETTES, posées plus bas)
  // ---- LA PEAU, lue au point près : bande j de la section, `t` de 0 (point j) à 1 (point j+1), côté droit ----
  const SS=zs.map(SEC),hh=i=>{const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
  const surf=(j,z,t)=>{let i=0;while(i<zs.length-2&&z>zs[i+1])i++;
    const u=U.cl((z-zs[i])/(zs[i+1]-zs[i]),0,1),A=SS[i],C=SS[i+1],
      ax=A[j][0]+(A[j+1][0]-A[j][0])*t,ay=A[j][1]+(A[j+1][1]-A[j][1])*t,
      cx=C[j][0]+(C[j+1][0]-C[j][0])*t,cy=C[j][1]+(C[j+1][1]-C[j][1])*t;
    return [ax+(cx-ax)*u,ay+(cy-ay)*u,z];};
  const nrm=(j,z,t)=>{const e=.012,a=surf(j,z,Math.max(0,t-e)),b=surf(j,z,Math.min(1,t+e)),c=surf(j,z-e,t),d=surf(j,z+e,t),
      tx=b[0]-a[0],ty=b[1]-a[1],tz=b[2]-a[2],wx=d[0]-c[0],wy=d[1]-c[1],wz=d[2]-c[2];
    let nx=ty*wz-tz*wy,ny=tz*wx-tx*wz,nz=tx*wy-ty*wx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    let bx=-wx,by=-wy,bz=-wz;const s=bx*nx+by*ny+bz*nz;bx-=nx*s;by-=ny*s;bz-=nz*s;const m=Math.hypot(bx,by,bz)||1;
    return [[nx,ny,nz],[bx/m,by/m,bz/m]];};                                    // la normale (dehors) et la tangente qui file vers la POUPE
  // un triangle, et son miroir sur l'autre flanc (sd = 0 : sur l'axe, une seule fois)
  const T3=(k,a,b,c,sd)=>{if(sd>=0)P.tri(k,a,b,c);if(sd!==0)P.tri(k,[-a[0],a[1],a[2]],[-c[0],c[1],c[2]],[-b[0],b[1],b[2]]);};
  /* ---- LE PIQUANT DU PORC-ÉPIC : une hampe à quatre pans (losange) en fer noir qui s'affine, puis la pointe en ivoire —
     les vrais piquants sont clairs au bout. Enfoncé de 3 cm dans la tôle (aucun jour à sa base). ---- */
  const pique=(b,d,L,r,sd)=>{
    const l=Math.hypot(d[0],d[1],d[2]);d=[d[0]/l,d[1]/l,d[2]/l];
    const up=Math.abs(d[1])<.92?[0,1,0]:[1,0,0];
    let e1=[up[1]*d[2]-up[2]*d[1],up[2]*d[0]-up[0]*d[2],up[0]*d[1]-up[1]*d[0]];const m1=Math.hypot(e1[0],e1[1],e1[2]);e1=[e1[0]/m1,e1[1]/m1,e1[2]/m1];
    const e2=[d[1]*e1[2]-d[2]*e1[1],d[2]*e1[0]-d[0]*e1[2],d[0]*e1[1]-d[1]*e1[0]];
    const b0=[b[0]-d[0]*.03,b[1]-d[1]*.03,b[2]-d[2]*.03],F=.6,
      ring=(o,rr)=>{const R4=[];for(let k=0;k<4;k++){const a=k*Math.PI/2,ca=Math.cos(a)*rr,sa=Math.sin(a)*rr;
        R4.push([o[0]+e1[0]*ca+e2[0]*sa,o[1]+e1[1]*ca+e2[1]*sa,o[2]+e1[2]*ca+e2[2]*sa]);}return R4;},
      C0=ring(b0,r),mid=[b[0]+d[0]*L*F,b[1]+d[1]*L*F,b[2]+d[2]*L*F],C1=ring(mid,r*.46),A=[b[0]+d[0]*L,b[1]+d[1]*L,b[2]+d[2]*L];
    for(let k=0;k<4;k++){const n=(k+1)%4;
      T3('q',C0[k],C0[n],C1[n],sd);T3('q',C0[k],C1[n],C1[k],sd);T3('Q',C1[k],C1[n],A,sd);}
  };
  /* ---- LE CLOU GOTHIQUE : un cône d'acier chromé à six pans, monté sur sa COLLERETTE de fer noir (le rivet du blouson clouté) ---- */
  const clou=(b,d,L,r,sd)=>{
    const l=Math.hypot(d[0],d[1],d[2]);d=[d[0]/l,d[1]/l,d[2]/l];
    const up=Math.abs(d[1])<.92?[0,1,0]:[1,0,0];
    let e1=[up[1]*d[2]-up[2]*d[1],up[2]*d[0]-up[0]*d[2],up[0]*d[1]-up[1]*d[0]];const m1=Math.hypot(e1[0],e1[1],e1[2]);e1=[e1[0]/m1,e1[1]/m1,e1[2]/m1];
    const e2=[d[1]*e1[2]-d[2]*e1[1],d[2]*e1[0]-d[0]*e1[2],d[0]*e1[1]-d[1]*e1[0]],at=h=>[b[0]+d[0]*h,b[1]+d[1]*h,b[2]+d[2]*h],
      hex=(o,rr)=>{const H=[];for(let k=0;k<6;k++){const a=k*Math.PI/3+.52,ca=Math.cos(a)*rr,sa=Math.sin(a)*rr;H.push([o[0]+e1[0]*ca+e2[0]*sa,o[1]+e1[1]*ca+e2[1]*sa,o[2]+e1[2]*ca+e2[2]*sa]);}return H;},
      oc=at(.024),C0=hex(at(-.03),r*1.55),C1=hex(oc,r*1.22),C2=hex(oc,r),A=at(L);
    for(let k=0;k<6;k++){const n=(k+1)%6;
      T3('q',C0[k],C0[n],C1[n],sd);T3('q',C0[k],C1[n],C1[k],sd);T3('q',oc,C1[k],C1[n],sd);  // la collerette et son plateau
      T3('c',C2[k],C2[n],A,sd);}                                                            // le cône
  };
  const rot=(n,bk,a,sx,sd)=>{const c=Math.cos(a),s=Math.sin(a);   // la direction : couchée vers l'arrière de `a`, écartée vers le dehors de `sx`
    return [n[0]*c+bk[0]*s+sx,n[1]*c+bk[1]*s,n[2]*c+bk[2]*s];};
  /* ---- LE PELAGE (2026-10-16, 2e jet, Léo : « l'arrière, c'est bien en mode porc-épic ; sur les côtés ça peut être gothique, et
     devant aussi ») : derrière le toit (z < −0,55, fondu sur 30 cm), le DOS DE LA BÊTE — les piquants couchés vers la poupe, la crête,
     les ailes arrière ; les FLANCS et tout l'AVANT, des CLOUS gothiques chromés, droits, en rangées. Rien sur les vitres ni dans une roue.
     `?blinde=chrome` : le dos en cônes chromés (même pose que les piquants) — à trancher par Léo. ---- */
  let id=0;
  const dos9=z=>U.cl((.6-z)/2.4,0,1),                                           // 0 au museau → 1 à la poupe
    arr=(z,i)=>z<-.55+(hh(i*9.1)-.5)*.30,                                         // le dos de la bête (piquants) ou l'avant (clous)
    bete=pique,
    /* (3e jet, Léo : « ça manque de fusion avec l'idée des pics ») LA MUE : du museau au toit, le clou se COUCHE et s'allonge — droit et court
       sur le nez, penché et long en arrivant au dos, où il devient piquant. Une seule bête, du nez à la queue. */
    mue=dos=>{const g=Math.pow(U.cl(dos/.48,0,1),1.4);return [.12+.86*g,.80+.75*g];};
  for(const j of [2,3,4]){
    let row=0;
    for(let z=-2.12;z<=2.04;row++){
      const zArr=z<-.55&&j>2;
      if(j===4&&z>.06&&z<.72){z+=.19;continue;}                                // le pare-brise
      if(j===3&&z>-.46&&z<.64){z+=.19;continue;}                               // les lancettes
      if(j===2&&(z>2.0||z<-.80)){z+=.19;continue;}                             // l'arrière des flancs : les roues sous leurs ailes
      const a0=surf(j,z,0),a1=surf(j,z,1),wd=Math.hypot(a1[0]-a0[0],a1[1]-a0[1]),n=Math.max(1,Math.round(wd/(zArr?.17:.20)));
      for(let k=0;k<n;k++){id++;const dos=dos9(z);
        if(j>2&&arr(z,id)){                                                   // LE DOS : les piquants du porc-épic
          const t=U.cl((k+.5+(row%2?.25:-.25)+(hh(id)-.5)*.3)/n,.06,j===4?.9:.94),b=surf(j,z,t),[nn,bk]=nrm(j,z,t),
            L=(j===4?.42:.36)*(.55+.62*dos)*(.82+.36*hh(id*3.1)),a=(j===4?1.06:1.02)+(hh(id*7.7)-.5)*.22;
          bete(b,rot(nn,bk,a,(j===4?.10:.04)+(hh(id*5.3)-.5)*.10,1),L,.036+.01*dos,1);
        }else{                                                                 // LES FLANCS ET L'AVANT : les clous, en rangées
          const t=U.cl((k+.5+(row%2?.25:-.25))/n,.08,j===4?.88:.92),b=surf(j,z,t),[nn,bk]=nrm(j,z,t),[ma,ml]=mue(dos);
          clou(b,rot(nn,bk,ma,0,1),(j===4?.22:j===3?.20:.16)*ml,.05,1);}
      }
      z+=zArr?.165:.19;
    }
  }
  // LA CRÊTE : sur l'échine, la rangée des plus longs, dressée (derrière le toit) — devant, une rangée de gros clous
  for(let z=-2.0;z<=.02;){id++;const b=surf(4,z,1),[nn,bk]=nrm(4,z,.999),dos=dos9(z),r9=arr(z,id);
    if(r9)bete([0,b[1]+.02,z],rot([0,1,0],bk,.86+(hh(id)-.5)*.16,0,0),(.52+.30*dos)*(.85+.3*hh(id*2.3)),.05,0);
    else{const [ma,ml]=mue(dos);clou([0,b[1]+.02,z],rot([0,1,0],bk,Math.min(.86,ma+.2),0,0),.30*ml,.07,0);}
    z+=r9?.15:.19;}
  P.box('q',.30,.05,.80,0,1.60,-.45);P.box('Q',.035,.02,.80,0,1.63,-.45);P.box('q',.60,.04,.50,0,1.39,-1.30,-.24); // l'arête dorsale (son filet d'os), la trappe
  /* ---- LES LANCETTES : trois fenêtres en ogive par flanc, à la place des meurtrières — un vitrail sombre allumé de l'intérieur,
     un meneau noir au milieu (la fenêtre gothique à deux jours), posé 1 cm au-dessus de la tôle. ---- */
  const LW=.12,OFF=.012,onB=(z,t)=>{const p=surf(3,z,t),[nn]=nrm(3,z,t);return [p[0]+nn[0]*OFF,p[1]+nn[1]*OFF,p[2]+nn[2]*OFF];};
  [-.24,.09,.42].forEach((zc,w)=>{
    const C=[[zc-LW,.12],[zc+LW,.12],[zc+LW,.56],[zc+LW*.86,.69],[zc+LW*.52,.80],[zc,.88],[zc-LW*.52,.80],[zc-LW*.86,.69],[zc-LW,.56]],
      o=onB(zc,.46),col=w===1?'v':'r';
    for(let i=0;i<C.length;i++){const a=C[i],b=C[(i+1)%C.length];T3(col,o,onB(b[0],b[1]),onB(a[0],a[1]),1);}
    const m0=onB(zc-.011,.12),m1=onB(zc+.011,.12),m2=onB(zc+.011,.86),m3=onB(zc-.011,.86),dn=nrm(3,zc,.5)[0],up=x=>[x[0]+dn[0]*.004,x[1]+dn[1]*.004,x[2]+dn[2]*.004];
    T3('K',up(m0),up(m2),up(m1),1);T3('K',up(m0),up(m3),up(m2),1);
  });
  /* ---- LE FILET D'OS : la ligne de ceinture (le haut du flanc), du nez à la queue, en ivoire — la couleur des pointes court sur
     toute la caisse et la lie : les clous dessous, les lancettes et le dos de la bête dessus. ---- */
  {const bord=(z,t)=>{const p=surf(2,z,t),[nn]=nrm(2,z,t);return [p[0]+nn[0]*.008,p[1]+nn[1]*.008,p[2]+nn[2]*.008];};
    for(let z=-2.18;z<2.14;z+=.12){const z1=Math.min(2.14,z+.12),a=bord(z,.955),b=bord(z1,.955),c=bord(z1,1),d=bord(z,1);T3('Q',a,b,c,1);T3('Q',a,c,d,1);}}
  /* ---- LES AILES ARRIÈRE EN OGIVE (3e jet) : la plaque plate devient un ARC BRISÉ d'église au-dessus de la roue, filet d'os sur
     l'arête — les plus longs piquants poussent sur son dos. ---- */
  const FX=.86,FW=.86,AW=.82,AY=.96,AH=.42,ARC=z=>{const w=(z-ZR)/AW;if(Math.abs(w)>=1)return AY;const v=Math.abs(w)+1;return AY+AH*Math.sqrt(Math.max(0,4-v*v))/1.732;};
  const ARC_N=18,arcPts=(dy)=>{const o=[];for(let i=0;i<=ARC_N;i++){const z=ZR+AW-i*2*AW/ARC_N;o.push([z,ARC(z)+dy]);}return o;};
  P.sym(sd=>{
    // LES AILES ARRIÈRE : l'ogive (dessus, puis le dessous à 8 cm), le filet d'os sur l'arête extérieure
    {const top=arcPts(0),bas=arcPts(-.085).reverse();P.prism('p',top.concat(bas),FW,sd*FX);
     const fil=arcPts(.006),fil2=arcPts(-.03).reverse();P.prism('Q',fil.concat(fil2),.03,sd*(FX+FW/2-.005));}
    P.box('q',.80,.26,.05,sd*.86,.90,ZR-.80,-.20,0,0);                         // la bavette, au pied de l'ogive
    // LE PNEU ARRIÈRE DOUBLÉ vers l'intérieur (révolution parfaite : immobile ou pas, on ne voit rien)
    const hw=.15;P.lathe('k',[[R*.64,-sd*hw],[R*.88,-sd*hw],[R,-sd*hw*.55],[R,sd*hw*.55]],16,sd*(WX-TW/2-hw+.005),R,ZR,'x');
    P.lathe('k',[[R*.64,-sd*hw],[0,-sd*hw]],10,sd*(WX-TW/2-hw+.005),R,ZR,'x');
    // LES ROUES AVANT SUR BRAS : triangles, porte-moyeu, amortisseurs
    P.box('k',.52,.06,.10,sd*.72,.72,ZF);P.box('k',.52,.06,.10,sd*.72,.72,ZF-.26,0,sd*.45,0);
    P.box('k',.54,.07,.12,sd*.71,.36,ZF);P.box('k',.54,.07,.12,sd*.71,.36,ZF+.26,0,-sd*.45,0);
    P.box('G',.10,.46,.22,sd*.86,.54,ZF);
    P.put('c',new THREE.CylinderGeometry(.045,.045,.56,8),sd*.70,.84,ZF-.10,0,0,sd*.78);
    P.put('k',new THREE.CylinderGeometry(.07,.07,.26,8),sd*.64,.92,ZF-.10,0,0,sd*.78);
    // yeux et feux
    P.box('W',.15,.035,.03,sd*.21,.585,2.265,0,0,sd*.28);P.box('W',.08,.03,.03,sd*.35,.625,2.25,0,0,sd*.28); // les yeux, en biais : le regard de la bête
    P.box('W',.12,.035,.03,sd*.52,.98,1.06,0,sd*.5,0);
    P.box('L',.16,.04,.03,sd*.36,1.00,-2.245);P.box('L',.04,.10,.03,sd*.46,.80,-2.245);
    P.box('q',.40,.04,.36,sd*.36,1.14,-2.14,-.35);                             // les volets de poupe
  });
  /* ---- LE DOS DES AILES ARRIÈRE : les plus longs piquants de la bête, plantés sur l'ogive, couchés vers la poupe et un peu dehors ---- */
  for(let ix=0;ix<4;ix++)for(let iz=0;iz<8;iz++){id++;
    const dx=-.30+ix*.20+(iz%2?.05:-.05),z=ZR-.60+iz*.17,e=.01,y=ARC(z),yp=(ARC(z+e)-ARC(z-e))/(2*e),
      ln=Math.hypot(yp,1),nn=[0,1/ln,-yp/ln],bk=[0,-yp/ln,-1/ln],b=[FX+dx,y,z],dos=dos9(z);
    bete(b,rot(nn,bk,1.0+(hh(id)-.5)*.24,.10+.10*ix/3,1),(.50+.18*dos)*(.8+.4*hh(id*4.1)),.045,1);}
  // LA TUYÈRE centrale (2026-10-16 : la rosace essayée, Léo : « bizarre avec les couleurs, reviens sur le moteur d'avant »)
  P.cyl('k',.30,.26,12,0,.80,-2.32,'z',.25);P.cyl('c',.24,.04,12,0,.80,-2.44,'z');
  P.cyl('K',.20,.05,12,0,.80,-2.44,'z');P.cyl('O',.10,.06,10,0,.80,-2.44,'z');
  P.box('G',.70,.10,.06,0,.46,2.26);                                          // bouclier de nez
  // LE BÉLIER (3e jet) : cinq clous droit devant sur le bouclier, le plus long au milieu — la bête charge
  [[0,.30],[.15,.22],[.29,.15]].forEach(([x,L])=>clou([x,.46,2.29],[0,-.06,1],L,.045,x?1:0));
  K.commit(P);
  return {hl:[.20,.58,2.28],tl:[.36,1.00,-2.26],wx:WX,wzF:ZF,wzR:-ZR,pots:[[0,.80,-2.47]], // (pots) LA TURBINE centrale, à 80 cm : le relevé s'arrête à 60
          lpw:{R:R,w:TW,style:'rayons',n:5,jante:0x6a6e76,accent:0x2a2c31,crampons:1,pique:1}};
},
