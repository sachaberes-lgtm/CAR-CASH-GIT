/* ===== LA GAMME DES 50 — DÉBUT (2026-09-26) ===== */
/* Cinquante caisses modelées au KIT low-poly (même atelier que ROSSO 40 et POSTER 84), une silhouette chacune, en cinq familles.
   Généré par l'atelier (scratchpad gamme/integrer.js) à partir des lots : ne pas éditer à la main, regénérer. */
Object.assign(SHAPES,{
  b_pizza:function(K){
  const U=LPU,R=.30,ZF=1.06,ZR=-1.10;
  const P=K.kit({p:{g:'p',c:0xf4f1ea},r:{g:'p',c:0xd8261e,f:0},k:{g:'m',c:0x33353a},n:{g:'m',c:0x141518},
    K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xe9ecf0},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},
    O:{g:'l',c:0xffa21a},b:{g:'s',c:0x8f5f2e},y:{g:'f',c:0xffc233},t:{g:'f',c:0xd98a3a},e:{g:'f',c:0xc3261a},
    R:{g:'l',c:0x7a1018},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) R les catadioptres, w la plaque éclairée
  const AR=[[0,2*R+.05],[R*.78,2*R+.03],[R+.10,.22]];
  const zs=[-1.70,-1.66,-1.58,-1.46,-1.08,-1.00,-.26,-.18,.28,.36,.96,1.62,1.70];
  for(const w of [ZF,ZR])for(const d of [R*.78,R+.10])zs.push(w-d,w+d);
  zs.push(ZF-.50,ZF+.50,ZR-.50,ZR+.50);zs.sort((a,b)=>a-b);for(let i=zs.length-1;i>0;i--)if(zs[i]-zs[i-1]<.005)zs.splice(i,1); // (relief) le pied des ailes
  const yC=z=>U.lin([[-1.70,.99],[-1.66,1.02],[-1.58,1.39],[-1.46,1.42],[.28,1.42],[.36,1.40],[.96,.95],[1.62,.86],[1.70,.82]],z),
        yB=z=>U.lin([[-1.70,.93],[-1.54,.95],[.96,.93],[1.62,.85],[1.70,.82]],z),
        xW=z=>U.lin([[-1.70,.715],[-1.65,.745],[1.64,.745],[1.70,.715]],z);
  /* ===== LE RELIEF DU FLANC (2026-10-20, Léo : « le relief visible quand on tourne autour » ; l'étude de la gamme au garage : n° 4 des plus
     plates, le liseré rouge PEINT sur une dalle) ===== le flanc se PLIE à la moulure : le bas qui rentre vers la jupe grise (il regarde le
     sol), l'épaule qui rentre jusqu'à la ceinture (elle regarde le ciel), les AILES qui bombent autour des roues ; le liseré devient une
     vraie MOULURE en relief, chanfreinée dessus (clair) et dessous (sombre). Avant : un flanc vertical de .47 à la ceinture. */
  const lis=t=>{t=U.cl(t,0,1);return t*t*(3-2*t);},aile=z=>.02*Math.max(lis(1-Math.abs(z-ZF)/.50),lis(1-Math.abs(z-ZR)/.50)),
        YM0=.78,YM1=.86;                                                       // la bande de la moulure
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.22),xw=xW(z),c=yC(z),bl=yB(z),f=aile(z);
    const y3=Math.max(.47,yb+.08),ym0=Math.max(YM0,y3+.02),ym1=Math.max(YM1,ym0+.03),y4=Math.max(bl,ym1+.04),y5=y4+.025,y6=Math.max(y5+.004,c-.045),y7=Math.max(y6+.003,c-.01);
    return [[0,yb],[xw-.05,yb],[xw-.01+f*.5,yb+.05],[xw-.035+f,y3],[xw+f*.4,ym0],[xw,ym1],[xw-.013,y4],[xw-.04,y5],[xw-.10,y6],[xw-.18,y7],[0,Math.max(y7+.002,c)]];
  },(j,z)=>{
    if(j<0)return 'p';
    if(j===0)return 'n';
    if(j<=2)return 'k';                                                        // bas de caisse gris mat
    if(j===7&&z>-1.46&&z<.96)return (z>-.26&&z<-.18)?'n':(z>-1.08&&z<-1.00)?'p':'g'; // vitres plates, montant B noir
    if(j===9&&z>.36&&z<.96)return 'g';                                         // pare-brise plat
    if(j===9&&z>-1.66&&z<-1.58)return 'g';                                     // lunette du hayon
    return 'p';});
  // LA FACE : pare-chocs gris qui font le tour, calandre-fente décalée, phares rectangulaires
  P.box('k',1.52,.22,.13,0,.35,1.68);P.box('k',1.52,.22,.13,0,.35,-1.68);
  P.sym(sd=>{P.box('k',.05,.22,.40,sd*.74,.35,1.50);P.box('k',.05,.22,.40,sd*.74,.35,-1.50);});
  P.box('k',.82,.20,.03,0,.64,1.705);
  for(let i=0;i<4;i++)P.box('n',.40,.024,.02,-.16,.575+i*.045,1.72);          // les fentes, d'un seul côté
  P.box('c',.07,.07,.02,.24,.64,1.72);                                         // le plot (pas de logo)
  P.sym(sd=>{
    P.box('n',.28,.18,.03,sd*.575,.64,1.705);P.box('W',.24,.14,.02,sd*.575,.64,1.72);
    P.box('O',.12,.05,.02,sd*.56,.36,1.75);
    /* (17/10, l'arrière v2) LE FEU EN COLONNE dans sa coque noire : rouge strié en haut, recul, clignotant, rouge bas, cerclé de chrome */
    P.box('K',.17,.43,.04,sd*.625,.685,-1.718);
    P.box('L',.13,.17,.01,sd*.625,.80,-1.742);for(const y of [.76,.80,.84])P.box('K',.13,.014,.006,sd*.625,y,-1.749);
    P.box('W',.13,.05,.01,sd*.625,.685,-1.742);P.box('O',.13,.07,.01,sd*.625,.62,-1.742);P.box('L',.13,.06,.01,sd*.625,.545,-1.742);
    for(const y of [.47,.90])P.box('c',.17,.014,.01,sd*.625,y,-1.744);for(const x of [.535,.715])P.box('c',.014,.43,.01,sd*x,.685,-1.744);
    P.box('R',.10,.03,.012,sd*.58,.40,-1.752);                                 // les catadioptres
    P.plate('r',[[.743,.785],[.758,.796],[.758,.849],[.743,.858]].map(q=>[sd*q[0],q[1]]),3.28,-1.66); // le liseré de livraison : (relief) une MOULURE chanfreinée, plus un trait peint
    P.box('n',.03,.10,.05,sd*.76,.99,.86);P.box('n',.08,.09,.12,sd*.80,1.03,.86); // rétro
    P.box('n',.08,.03,.05,sd*.735,.955,.86);   // (2026-10-27, aucun rétro qui vole) le pied tombait 2 cm à côté de la caisse : sa SEMELLE, couchée jusque dans le montant
    P.box('n',.012,.03,.12,sd*.75,.89,-.10);                                    // poignée
    P.box('n',.05,.05,.08,sd*.52,1.445,-.18);P.box('n',.05,.05,.08,sd*.52,1.445,-1.08); // pieds de galerie
  });
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un hayon
     plat, des feux en pavés, une plaque noire et un pare-chocs en boîte, sur la caisse la plus chère en euros. Désormais les feux en COLONNE
     (dans le P.sym), et ici : la PLAQUE blanche dans son cadre et sa lampe, la POIGNÉE du hayon, l'ESSUIE-GLACE sur la lunette, le
     MARCHEPIED strié sur le pare-chocs, le petit BECQUET de pavillon et son 3e feu stop. Le pot de Léo (ECH_POTS.b_pizza) n'a pas bougé. */
  P.box('n',.46,.14,.02,0,.62,-1.712);P.box('w',.40,.10,.01,0,.62,-1.726);    // la plaque
  P.sym(sd=>P.box('n',.014,.52,.01,sd*.515,.735,-1.704));                      // le joint du hayon
  P.box('n',.30,.06,.02,0,.765,-1.712);P.box('c',.22,.03,.03,0,.765,-1.73);P.box('W',.10,.014,.01,0,.70,-1.722); // la poignée, la lampe de plaque
  P.box('n',.42,.016,.016,.15,1.21,-1.636,.213,0,.9);P.box('n',.30,.012,.03,.21,1.28,-1.628,.213,0,.9); // l'essuie-glace : le bras, le balai
  P.box('n',.64,.025,.11,0,.472,-1.70);for(let i=0;i<3;i++)P.box('c',.60,.014,.01,0,.49,-1.66-i*.03); // le marchepied strié
  P.box('p',1.16,.04,.17,0,1.44,-1.63);P.box('n',1.10,.012,.15,0,1.418,-1.635);P.box('L',.34,.018,.012,0,1.425,-1.716); // le becquet, son 3e feu
  P.cyl('c',.035,.10,8,.33,.29,-1.72,'z');                                     // le pot
  P.box('n',1.20,.03,.05,0,1.485,-.18);P.box('n',1.20,.03,.05,0,1.485,-1.08); // barres de toit
  // LA BOÎTE GÉANTE : un plateau carton, la pizza dedans, le couvercle entrouvert qui laisse passer une part
  const zc=-.63,S=1.24,yb0=1.50;
  P.box('b',S,.03,S,0,yb0+.015,zc);
  P.box('b',S,.11,.025,0,yb0+.07,zc+S/2);P.box('b',S,.11,.025,0,yb0+.07,zc-S/2);
  P.box('b',.025,.11,S,S/2,yb0+.07,zc);P.box('b',.025,.11,S,-S/2,yb0+.07,zc);
  P.cyl('t',.56,.03,12,0,yb0+.05,zc,'y');P.cyl('y',.49,.03,12,0,yb0+.06,zc,'y');
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;P.cyl('e',.075,.02,7,Math.sin(a)*.28,yb0+.08,zc+Math.cos(a)*.28,'y');}
  const th=.10,hz=zc-S/2,hy=yb0+.125,lz=hz+Math.cos(th)*S/2,ly=hy+Math.sin(th)*S/2;  // le couvercle, charnière à l'arrière
  P.box('b',S+.02,.025,S+.02,0,ly,lz,-th);
  P.put('r',new THREE.CylinderGeometry(.44,.44,.006,12),0,ly+Math.cos(th)*.016,lz-Math.sin(th)*.016,-th,0,0); // l'imprimé du dessus
  P.sym(sd=>P.box('r',.006,.045,S*.84,sd*(S/2+.014),yb0+.075,zc));P.box('r',S*.84,.045,.006,0,yb0+.075,zc+S/2+.014);P.box('r',S*.84,.045,.006,0,yb0+.075,zc-S/2-.014);
  // LA PART QUI S'ÉCHAPPE par l'entrebâillement : elle passe le rebord et PEND sur le haut du pare-brise
  const dl=.62,xs=-.24,y0=yb0+.14,z0=zc+S/2+.02,sh=new THREE.Shape();
  sh.moveTo(-.14,0);sh.lineTo(.14,0);sh.lineTo(.22,.40);sh.lineTo(-.22,.40);sh.lineTo(-.14,0);
  P.put('y',new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false}),xs,y0,z0,Math.PI/2+dl,0,0);
  const cz=z0+Math.cos(dl)*.40,cy=y0-Math.sin(dl)*.40;
  P.box('t',.48,.06,.07,xs,cy,cz,dl);                                         // la croûte
  for(const q of [[-.07,.12],[.08,.21],[-.04,.30]])P.put('e',new THREE.CylinderGeometry(.06,.06,.016,7),xs+q[0],y0-Math.sin(dl)*q[1]+Math.cos(dl)*.008,z0+Math.cos(dl)*q[1]+Math.sin(dl)*.008,dl,0,0);
  P.box('y',.05,.10,.03,xs+.10,cy-.07,cz+.01);                                 // le fil de fromage qui coule
  K.commit(P);
  return {hl:[.575,.64,1.72],tl:[.62,.68,-1.72],wx:.64,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.20,style:'cadran',jante:0xd6d8dc}};
},
  d_corbillard:function(K){
  const U=LPU,R=.40,ZF=1.76,ZR=-1.98;
  const P=K.kit({p:{g:'p',c:0x0d0d10},v:{g:'s',c:0x1e1e24},c:{g:'c',c:0xe9ecf0},k:{g:'m',c:0x141518},K:{g:'g',c:0x0a0b0e},
    g:{g:'g',c:0x16202a},S:{g:'s',c:0xcfc0a2,f:0},q:{g:'s',c:0x6b5a44,f:0},   // (19/10) les rideaux un ton plus doux, leurs plis moins noirs (un aplat beige rayé)
W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.06],[R*.70,2*R+.02],[R+.06,R*1.18],[R+.18,.40]];
  const zs=[-2.90,-2.86,-2.74,-1.60,-.30,-.20,.36,1.05,2.72,2.85,2.90,ZR-.60,ZR-.54,ZR+.54,ZR+.60];
  for(const d of [R*.70,R+.06,R+.18])zs.push(ZF-d,ZF+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-2.90,1.30],[-2.86,1.44],[-2.74,1.53],[.36,1.55],[1.05,1.09],[2.72,1.05],[2.85,1.01],[2.90,.93]],z),
        yB=z=>U.lin([[-2.90,1.02],[-2.74,1.05],[1.05,1.05],[2.72,1.03],[2.90,.97]],z),
        xW=z=>U.lin([[-2.90,.90],[-2.84,.96],[-2.60,.98],[2.62,.98],[2.85,.95],[2.90,.90]],z),
        xR=z=>U.lin([[-2.90,.80],[-2.74,.86],[.36,.86],[1.05,.93]],z),
        jupe=z=>Math.abs(z-ZR)<.57;
  P.loft(zs,z=>{
    const yb=jupe(z)?.29:U.arch(z,[ZF],AR,.40),xw=xW(z),c=yC(z),b=Math.max(yB(z),yb+.20);
    const s=[[0,yb],[xw-.08,yb],[xw-.025,Math.max(yb+.05,.46)],[xw+.014,Math.max(yb+.10,.78)],[xw,b],[xw-.06,b+.025]];   // (19/10) la coque RENTRE sous l'arête (un caisson plat)
    if(z<1.05)s.push([xR(z),Math.max(b+.05,c-.04)],[0,c]);
    else s.push([xw-.30,Math.max(b+.035,c-.015)],[0,Math.max(b+.045,c)]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j<0||j<=4||z>=1.05)return 'p';
    if(j===5){
      if(z>-.20)return 'g';                                                  // la portière avant, et son déflecteur
      if(z>-.30)return 'p';                                                  // pied milieu
      if(z>-1.60)return 'S';                                                 // le salon : rideaux
      return 'v';}                                                           // les custodes aveugles en vinyle
    return z>.36?'g':'v';});                                                 // pare-brise, toit vinyle
  // LA FACE : calandre à grille, quatre phares en ligne, pare-chocs paquebot, la mascotte
  P.box('K',.86,.30,.03,0,.72,2.905);
  for(let i=0;i<9;i++)P.box('c',.018,.30,.03,(i/8-.5)*.82,.72,2.915);
  for(const y of [.67,.77])P.box('c',.86,.014,.03,0,y,2.915);
  P.box('c',.92,.03,.04,0,.885,2.91);P.box('c',.92,.03,.04,0,.555,2.91);
  P.box('c',1.98,.20,.16,0,.47,2.92);P.box('k',1.60,.04,.03,0,.44,3.005);
  P.prism('c',[[2.74,1.05],[2.88,1.05],[2.83,1.13],[2.76,1.11]],.03,0);
  P.box('c',.04,.012,1.62,0,1.056,1.90);
  P.box('c',1.96,.20,.16,0,.47,-2.92);P.box('k',.50,.10,.03,0,.49,-3.005);
  P.box('c',1.20,.40,.03,0,1.10,-2.905);P.box('S',1.10,.32,.03,0,1.10,-2.912);
  for(let i=0;i<5;i++)P.box('q',.014,.30,.03,(i/4-.5)*.90,1.10,-2.92);
  P.sym(sd=>{
    for(const x of [.56,.78]){P.cyl('c',.09,.03,8,sd*x,.75,2.91,'z');P.cyl('W',.07,.035,8,sd*x,.75,2.915,'z');}
    P.box('O',.20,.06,.03,sd*.62,.47,3.005);P.box('c',.10,.26,.10,sd*.44,.55,2.99);    // butoirs
    P.box('p',.46,.07,.12,sd*.67,.875,2.88);P.box('c',.46,.012,.014,sd*.67,.842,2.94); // (19/10, « la face plate ») les SOURCILS d'aile sur les phares, leur jonc
    P.box('c',.03,.03,5.50,sd*.968,.46,-.10);                              // le jonc de bas de caisse (19/10 : collé à la coque qui rentre)
    P.box('c',.02,.025,5.50,sd*.99,1.05,-.05);                              // le jonc de ceinture
    P.box('c',.03,.04,1.14,sd*.925,.31,ZR);                                 // le liseré de la jupe (19/10 : il flottait 7 cm hors de la caisse)
    P.box('c',.02,.03,.14,sd*.99,.96,.00);                                  // poignée
    P.box('c',.03,.10,.12,sd*1.02,1.14,.28);P.box('c',.06,.03,.03,sd*.98,1.10,.28); // rétro chromé
    P.box('c',.03,.065,.03,sd*.965,1.0675,.28);   // (2026-10-27, aucun rétro qui vole) son PIED, planté 1,5 cm dans la portière (le bras flottait 2 cm au-dessus)
    P.box('c',.02,.02,3.08,sd*.862,1.515,-1.19);                            // jonc de pavillon
    for(let i=0;i<11;i++){const z=-.40-i*.105;P.box('q',.012,.40,.03,sd*.906,1.29,z,0,0,sd*.14);} // les plis des rideaux (19/10 : deux fois plus, plus fins)
    P.box('q',.014,.05,1.16,sd*.877,1.475,-.93,0,0,sd*.14);                 // la cantonnière, en haut des rideaux
    P.box('O',.02,.07,.16,sd*.985,.78,2.60);P.box('L',.02,.07,.16,sd*.985,.78,-2.62); // feux de gabarit
    P.box('c',.02,.02,1.30,sd*.868,1.49,-.95);
    // LA BARRE DE LANDAU, en S chromé sur la custode
    const S9=[[-1.72,1.40],[-1.84,1.31],[-2.00,1.23],[-2.20,1.18],[-2.40,1.17],[-2.52,1.21],[-2.56,1.29]];
    for(let i=0;i<S9.length-1;i++){const a=S9[i],b=S9[i+1],L9=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const x9=.92-(((a[1]+b[1])/2)-1.07)/.45*.06+.02;
      P.box('c',.035,.045,L9+.02,sd*x9,(a[1]+b[1])/2,(a[0]+b[0])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),0,0);}
    P.cyl('c',.045,.03,8,sd*.91,1.40,-1.72,'x');P.cyl('c',.045,.03,8,sd*.905,1.29,-2.56,'x');
    P.box('K',.10,.50,.04,sd*.84,.78,-2.905);P.box('L',.08,.46,.04,sd*.84,.78,-2.915); // feux verticaux
    P.box('c',.13,.54,.03,sd*.84,.78,-2.895);
    P.cyl('c',.05,.08,8,sd*.44,.36,-2.94,'z');
  });
  K.commit(P);
  return {hl:[.67,.75,2.93],tl:[.84,.78,-2.93],wx:.84,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'enjoliveur',jante:0xe9ecf0,blanc:1}};
},
  a_chargeur:function(K){
  /* LE CHARGEUR — la berline musclée américaine : flancs creusés d'une ÉCOPE en C sur les portières,
     ceinture haute et vitres étroites, calandre noire EN CROIX, capot à deux écopes, et à la poupe le
     BANDEAU DE FEUX continu, d'une aile à l'autre.
     (13/10, « plus ressemblant ») le pavillon s'ARRONDIT et se resserre (il était plat et large comme une berline des années 70),
     la lunette est plus longue, en pente de fastback. */
  const U=LPU,R=.365,ZF=1.56,ZR=-1.49;
  const P=K.kit({p:{g:'g',c:0x020203},   // (13/10, Léo : « plus noir brillant ») le NOIR LAQUÉ : un noir presque pur — la laque n'y renvoie plus que le reflet, net sur les pans qui fuient (c'était un gris)
    k:{g:'m',c:0x121316},K:{g:'g',c:0x0b0c0f},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x16202a},W:{g:'l',c:0xf2f7ff},L:{g:'l',c:0xff1a2a},r:{g:'l',c:0x9a0f1a},O:{g:'l',c:0xffa21a},
    m:{g:'s',c:0x3a3f47},e:{g:'m',c:0xc8102e},n:{g:'s',c:0x0a0b0d}}); // n : (2026-10-19, BOÎTES) le fond de l'ÉCOPE, noir satiné
  const AR=[[0,2*R+.05],[R*.60,2*R+.03],[R*.98,R*1.16],[R+.12,.34]];
  const CW=1.30,RF=.36,RR=-.50,RB=-1.76,ZE=2.50;
  const zs=[-ZE,-2.47,-2.44,-2.30,-2.10,RB,-1.20,-.86,-.80,RR,-.02,.10,RF,CW,2.00,2.30,2.44,ZE];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-ZE,1.075],[-2.47,1.13],[-2.44,1.125],[-2.30,1.10],[RB,1.09],[-1.20,1.30],[-.80,1.415],[RR,1.45],[RF,1.47],[CW,1.00],[2.00,.93],[2.30,.89],[2.44,.85],[ZE,.80]],z),
        xW=z=>U.lin([[-ZE,.86],[-2.44,.915],[-2.30,.945],[-2.10,.962],[-1.50,.972],[-1.00,.958],[-.80,.95],[1.90,.95],[2.30,.90],[ZE,.80]],z),
        bL=z=>U.lin([[-ZE,1.05],[CW,.98]],z),
        sC=z=>U.lin([[-1.02,0],[-.80,.04],[.80,.04],[1.08,0]],z),cab=z=>z>RB-.001&&z<CW+.001;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),c=yC(z),xw=xW(z),bl=bL(z),y2=Math.max(yb+.06,.40),y3=Math.max(.56,y2+.01),
          y4=Math.min(Math.max(.76,y3+.01),c-.12),y5=Math.max(y4+.01,Math.min(bl-.06,c-.08)),y6=Math.max(y5+.01,Math.min(bl,c-.03));
    const s=[[0,yb],[xw-.07,yb],[xw-.01,y2],[xw,y3],[xw-sC(z),y4],[xw,y5],[xw-.04,y6]];
    if(cab(z)){const xr=U.lin([[RB,.74],[RR,.64],[RF,.64],[CW,.80]],z);s.push([xr,Math.max(y6+.01,c-.07)],[xr*.55,Math.max(y6+.02,c-.012)],[0,c+.012]);}
    else s.push([xw-.14,Math.max(y6+.002,c-.005)],[xw-.48,c+.004],[0,c+.008]);
    return s;
  },(j,z)=>{
    if(j===0||j===1)return 'k';                                      /* bas de caisse noir, jupes */
    if((j===3||j===4)&&z>-.98&&z<1.04)return 'n';                   /* (2026-10-19) le creux de l'ÉCOPE : en laque-verre ses deux pans plats se miraient en aplat (le sol rose de l'environnement, magenta) */
    if(j===6&&cab(z)){if(z>.10&&z<1.24)return 'g';if(z>-.86&&z<-.02)return 'g';if(z>-.02&&z<.10)return 'K';return 'p';}
    if(j===7&&cab(z)&&z>-.86&&z<1.26)return 'K';                     /* l'entourage de vitres noir */
    if(j===8&&((z>RF&&z<CW)||(z>RB&&z<RR)))return 'g';
    return 'p';});
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « retravaille l'arrière, il n'est pas beau ; chaque voiture, il faut qu'on ait envie de l'acheter ») —
     c'était un mur noir plat, un fil rouge et quatre pastilles ; c'est la poupe qu'on suit pendant toute la course :
     · LE BECQUET EN CANARD : la malle remonte au bout (yC) et porte le 3e feu stop ;
     · LES HANCHES : la caisse s'élargit sur les roues arrière (xW), les coins de poupe sont coupés en biseau ;
     · LE FEU EN ANNEAU, d'une aile à l'autre : deux barres de LED, le verre rouge entre elles, et les bouts ronds qui TOURNENT sur les
       biseaux des coins (on les voit de côté) ;
     · le BOUCLIER dans la couleur et son pli d'ombre, le monogramme chromé sous les feux, les catadioptres aux coins ;
     · le DIFFUSEUR noir à ailettes, où s'encastrent les deux sorties rectangulaires (le pot de Léo, ECH_POTS, inchangé). */
  {const zf=-ZE,yF=.94,                                                                                   // la poupe, la hauteur des feux
         TX=.676,TZ=.737,NX=.737,NZ=-.676,                                                                // le biseau du coin, de (.86, −2.50) à (.915, −2.44) : sa tangente, sa normale
         bis=(s,e)=>[.86+TX*s+NX*e,zf+TZ*s+NZ*e];                                                         // un point du biseau (s le long, e en avant de la tôle)
   P.plate('K',[[-.85,yF-.078],[.85,yF-.078],[.858,yF+.05],[.82,yF+.088],[-.82,yF+.088],[-.858,yF+.05]],.008,zf-.008); // le caisson noir des feux (à fleur : l'anneau rejoint le biseau sans marche)
   P.box('r',1.72,.10,.008,0,yF,zf-.012);                                                                 // le verre rouge
   P.box('L',1.72,.026,.012,0,yF+.056,zf-.014);P.box('L',1.72,.026,.012,0,yF-.056,zf-.014);                // l'anneau : les deux barres
   P.box('p',1.68,.22,.05,0,.71,zf-.025);                                                                 // le bouclier, dans la couleur
   P.box('K',1.64,.012,.012,0,.598,zf-.044);                                                              // son pli d'ombre, dessous
   {let x=-.17;for(const w of [.028,.024,.03,.022,.028,.024,.03]){P.box('c',w,.018,.01,x+w/2,.825,zf-.006);x+=w+.014;}} // le monogramme : sept lettres chromées, sans nom
   P.box('k',1.62,.24,.07,0,.39,zf-.035);                                                                 // le diffuseur : les sorties s'y encastrent
   for(const x of [-.32,-.20,-.08,.08,.20,.32])P.box('K',.014,.17,.09,x,.375,zf-.045);                    // ses ailettes
   P.box('L',.36,.016,.012,0,1.113,-2.490,.5,0,0);                                                        // le 3e feu stop, sur le biseau du becquet
   const disque=new THREE.CylinderGeometry(.05,.05,.012,12);disque.rotateX(Math.PI/2);
   P.sym(sd=>{const ry=sd>0?-Math.atan2(TZ,TX):-(Math.PI-Math.atan2(TZ,TX)),c=bis(.012,.006),v=bis(.006,.004);
     P.box('r',.012,.10,.012,sd*v[0],yF,v[1],0,sd*Math.atan2(TX,TZ),0);                                  // le verre passe le coin…
     P.put('r',disque.clone(),sd*c[0],yF,c[1],0,ry,0);                                               // …et finit en rond sur le biseau
     P.put('L',new THREE.TorusGeometry(1,.23,4,12,Math.PI),sd*c[0],yF,c[1],0,ry,-Math.PI/2,.056,.056,.035); // le bout rond de l'anneau
     for(const dy of [.056,-.056])P.box('L',.016,.026,.02,sd*v[0],yF+dy,v[1],0,sd*Math.atan2(TX,TZ),0);    // les barres passent le coin
     P.box('r',.10,.022,.008,sd*.74,.665,zf-.052);                                                        // les catadioptres
   });disque.dispose();}
  P.sym(sd=>{
    /* LES PHARES EFFILÉS (13/10, « retravaille le détail ») : ils partent des COINS de la calandre et s'enroulent dans l'aile,
       boîtier noir, deux projecteurs, l'anneau LED en C autour de celui du dehors et le trait LED dessous */
    P.plate('K',[[.50*sd,.705],[.80*sd,.722],[.80*sd,.782],[.52*sd,.778]],.03,ZE-.004);
    P.box('K',.21,.075,.03,sd*.815,.752,2.43,0,sd*.72,0);P.box('W',.15,.012,.02,sd*.822,.725,2.44,0,sd*.72,0);
    P.cyl('c',.032,.02,10,sd*.58,.745,ZE+.03,'z');P.cyl('W',.022,.02,10,sd*.58,.745,ZE+.036,'z');
    P.cyl('c',.036,.02,10,sd*.71,.750,ZE+.03,'z');P.cyl('W',.025,.02,10,sd*.71,.750,ZE+.036,'z');
    P.put('W',new THREE.TorusGeometry(1,.24,4,14,Math.PI*1.45),sd*.71,.750,ZE+.036,0,0,sd>0?.80:Math.PI-.80+Math.PI*.55,.06,.046,.05);
    P.box('W',.26,.010,.01,sd*.64,.716,ZE+.032,0,0,sd*.05);
    P.box('O',.03,.06,.12,sd*.87,.68,2.30,0,sd*.3,0);
    /* aux coins du bouclier : la prise d'air noire et son trait LED */
    P.plate('K',[[.60*sd,.36],[.78*sd,.37],[.77*sd,.47],[.62*sd,.46]],.02,ZE-.004);P.box('W',.14,.01,.01,sd*.69,.475,ZE+.018);
    /* rétros laqués, poignées, joints de portes */
    P.prism('k',[[1.30,1.00],[1.10,1.00],[1.14,1.05],[1.24,1.05]],.06,sd*.92);P.box('p',.08,.11,.19,sd*.975,1.07,1.16,0,sd*.10,0);
    P.box('k',.02,.025,.13,sd*.93,.95,.56);P.box('k',.02,.025,.13,sd*.93,.97,-.50);
    for(const z of [1.26,.04,-.84])P.box('k',.01,.38,.012,sd*.94,.79,z);
    /* (2026-10-19, BOÎTES : « noir sur noir, au jour la caisse ne se lit qu'en silhouette ») le JONC CHROMÉ de ceinture, sous les vitres :
       un trait de lumière qui dessine la taille de la caisse */
    P.box('c',.016,.016,2.12,sd*.924,1.006,.19,.0186,0,0);
    /* les deux EXTRACTEURS de chaleur près du pare-brise */
    for(let i=0;i<4;i++){const z=1.42+i*.06;P.box('K',.17,.008,.03,sd*.40,yC(z)+.005,z,.05);}
  });
  /* LA GRANDE CALANDRE NOIRE (13/10 : la croix, c'était la génération d'avant) : un trapèze d'un phare à l'autre, cadre noir
     satiné, mailles, le monogramme rouge à gauche — et UNE grande écope au milieu du capot */
  P.plate('k',[[-.47,.50],[.47,.50],[.53,.778],[-.53,.778]],.02,ZE-.004);
  P.plate('K',[[-.445,.52],[.445,.52],[.50,.757],[-.50,.757]],.02,ZE+.004);
  for(let i=0;i<9;i++)P.box('m',.90+i*.0125,.006,.012,0,.538+i*.025,ZE+.024);   // (2026-10-19, BOÎTES) des LAMES couchées, fines et serrées (c'était un damier de gros carreaux)
  P.box('e',.10,.026,.012,-.34,.70,ZE+.032);P.box('c',.10,.006,.012,-.34,.684,ZE+.032);
  /* la bouche basse à mailles, sur toute la largeur */
  P.plate('K',[[-.56,.30],[.56,.30],[.58,.44],[-.58,.44]],.02,ZE-.004);
  for(let i=0;i<5;i++)P.box('m',1.08,.006,.012,0,.32+i*.025,ZE+.018);           // (19/10) la bouche basse : les mêmes lames
  {const za=1.62,zb=2.18,ha=yC(za)+.004,hb=yC(zb)+.004;
   P.prism('p',[[za,ha-.02],[zb,hb-.02],[zb,hb+.07],[za,ha+.004]],.50,0);
   P.box('K',.42,.055,.01,0,hb+.03,zb+.002);}
  K.commit(P);
  return {hl:[.56,.745,2.51],tl:[.74,.95,-2.55],wx:.82,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'rayons',n:5,jante:0xa7adb5,accent:0x1b1c20}};
 },
  a_defieur:function(K){
  /* LE DÉFIEUR — le coupé muscle rétro : capot interminable et plat, flancs taillés d'une arête qui
     remonte sur la hanche, calandre pleine largeur en retrait avec ses QUATRE PHARES RONDS, la prise
     d'air noire plantée dans le capot, et les DEUX BANDES noires du nez au coffre.
     (13/10, « plus ressemblant ») BAISSÉ à ses vraies cotes : pavillon 1,30 (il montait à 1,44), capot 0,90, malle 0,99 —
     il était haut sur pattes comme un jouet ; l'arête de flanc descend à 0,72.
     (17/10, Sacha : « qu'elle ressemble vraiment à la voiture de Transformers, la bonne couleur de base, inspire-toi de la Chevrolet ;
     des petits détails pour la rendre plus belle ») LE ROBOT JAUNE : JAUNE RALLYE, les deux bandes noires ÉLARGIES et presque jointives
     (un filet jaune au milieu), les phares dans des cuvettes noires cerclés d'un ANNEAU de lumière bleutée (ses yeux), un ÉCUSSON en
     masque de robot au milieu de la calandre, la grande bouche noire du bouclier et ses antibrouillards, la lame avant, les goupilles
     de capot, l'OUÏE de flanc devant la roue arrière, les feux de position latéraux, QUATRE feux carrés à l'arrière, le troisième feu
     sur le becquet, des jantes noires à cinq branches. Aucune marque : ni nom, ni noeud papillon. */
  const U=LPU,R=.365,ZF=1.51,ZR=-1.44;
  const P=K.kit(fentePal({p:{g:'p',c:0xffd000},j:{g:'p',c:0xa07a00},n:{g:'p',c:0x121212,f:0},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c0f},
    c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x16202a},W:{g:'l',c:0xf4f8ff},L:{g:'l',c:0xff1a2a},r:{g:'l',c:0x9a0f1a},O:{g:'l',c:0xffa21a},
    H:{g:'l',c:0x8fd4ff},B:{g:'l',c:0x3fb8ff},M:{g:'m',c:0x2a2c31}}));   // (19/10) 'J' / 'Jf' : la FENTE C
  const AR=[[0,2*R+.05],[R*.62,2*R+.04],[R*.98,R*1.16],[R+.13,.34]];
  /* (2026-10-19, l'AFFINEMENT de BOÎTES : « un toit en coin pointu et un capot qui plonge ») le pare-brise RECULE (pied à 0,86, il était
     à 1,06) : le capot s'allonge, À PLAT jusqu'au nez (0,86 au bout, il tombait à 0,83) ; le pavillon s'allonge vers l'arrière (−0,70) :
     un toit plat, plus un coin. */
  const CW=.86,RF=.18,RR=-.70,RB=-1.62,ZE=2.46;
  const zs=[-ZE,-2.40,-2.26,RB,-1.16,RR,-.34,-.20,RF,.56,CW,1.80,2.30,2.40,ZE];
  for(const w of [ZF,ZR])for(const d of [R*.62,R*.98,R+.13])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-ZE,.95],[-2.40,1.00],[-2.26,.99],[RB,.99],[-1.16,1.17],[RR,1.29],[-.20,1.305],[RF,1.30],[.56,1.11],[CW,.93],[1.80,.925],[2.30,.91],[2.40,.895],[ZE,.865]],z),
        xW=z=>U.lin([[-ZE,.90],[-2.36,.95],[2.30,.95],[ZE,.92]],z),
        bL=z=>U.lin([[-ZE,.95],[-1.90,.985],[-.60,.95],[CW,.91],[ZE,.84]],z),cab=z=>z>RB-.001&&z<CW+.001,
        xF=(z,y)=>xW(z)-.02+.035*Math.min(1,Math.max(0,(y-.40)/.32));   // le flanc sous l'arête, à la hauteur y (il rentre en descendant)
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),c=yC(z),xw=xW(z),bl=Math.min(bL(z),c-.03),y2=Math.max(yb+.06,.40),
          y3=Math.max(.72,y2+.01),y4=Math.max(y3+.01,Math.min(bl-.07,c-.07));
    const s=[[0,yb],[xw-.07,yb],[xw-.02,y2],[xw+.015,y3],[xw,y4],[xw-.04,bl]];
    if(cab(z)){const xr=U.lin([[RB,.80],[RR,.72],[RF,.72],[CW,.84]],z);
      s.push([xr,Math.max(bl+.01,c-.05)],[xr-.10,c-.006],[.31,c+.002],[.045,c+.006],[0,c+.006]);}
    else s.push([xw-.12,Math.max(bl+.002,c-.01)],[xw-.40,c-.002],[.31,c+.002],[.045,c+.006],[0,c+.006]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===5&&cab(z)){if(z>-.86&&z<.98)return (z>-.38&&z<-.32)?'K':'g';return 'p';}   // (19/10) la vitre de custode suit le pavillon allongé (−0,86)
    const gl=(z>RF&&z<CW)||(z>RB&&z<RR);
    if(j>=7&&gl)return 'g';
    if(j===8)return 'n';                                           /* LES DEUX BANDES, larges, un filet jaune entre elles */
    return 'p';});
  /* LA CALANDRE PLEINE LARGEUR, en retrait, ses barrettes, et ses quatre phares ronds dans des cuvettes noires, cerclés de lumière */
  P.box('k',1.72,.26,.04,0,.70,ZE+.005);
  for(const y of [.62,.78])P.box('M',.86,.012,.012,0,y,ZE+.03);
  const halo=new THREE.TorusGeometry(1,.15,4,18);
  P.sym(sd=>{for(const x of [.58,.76]){P.cyl('K',.096,.03,14,sd*x,.70,ZE+.008,'z');P.cyl('c',.074,.03,14,sd*x,.70,ZE+.013,'z');
      P.cyl('W',.042,.03,12,sd*x,.70,ZE+.019,'z');P.put('H',halo.clone(),sd*x,.70,ZE+.033,0,0,0,.062,.062,.06);}   // l'ANNEAU bleuté : les yeux du robot
    /* feux arrière : DEUX feux CARRÉS par côté, dans un cadre noir laqué, cœur sombre (un cadre chromé faisait une barre blanche au soleil) */
    for(const x of [.30,.62]){P.box('K',.27,.145,.02,sd*x,.86,-ZE-.016);P.box('L',.24,.118,.03,sd*x,.86,-ZE-.022);
      P.box('r',.13,.05,.012,sd*x,.86,-ZE-.042);}
    /* grosses sorties trapèze aux coins */
    P.box('c',.20,.08,.06,sd*.62,.40,-ZE-.02);P.box('k',.16,.05,.02,sd*.62,.40,-ZE-.045);
    /* rétros, poignée, arête de caisse */
    P.box('p',.05,.05,.10,sd*.91,.95,.80);P.box('p',.07,.11,.18,sd*.955,.99,.78);P.box('K',.012,.08,.14,sd*.992,.99,.78);
    P.box('k',.02,.03,.16,sd*.955,.87,.14);for(const z of [1.00,-.44]){P.box('J',.006,.13,.008,sd*(xW(z)+.011),.81,z);P.box('Jf',.006,.13,.003,sd*(xW(z)+.011),.81,z+.0065);}   // (19/10 : la FENTE C)   // (13/10, « traits maladroits ») un fil de joint, d'un seul tenant au-dessus de l'arête (le trait noir était coupé en deux)
    /* LA BOUCHE DU BOUCLIER : ses antibrouillards ronds et ses clignotants aux coins */
    P.cyl('c',.046,.02,12,sd*.60,.435,ZE+.012,'z');P.cyl('W',.034,.02,10,sd*.60,.435,ZE+.02,'z');
    P.box('O',.07,.05,.02,sd*.74,.435,ZE+.008);
    /* L'OUÏE DE FLANC devant la roue arrière : un coin noir pointé vers l'avant, trois lames */
    {const x=sd*(xF(-.72,.62)+.004);P.prism('K',[[-.90,.555],[-.90,.685],[-.72,.685],[-.54,.62],[-.72,.555]],.016,x);
     for(const z of [-.84,-.76,-.68])P.box('M',.02,.10,.018,x+sd*.004,.62,z);}
    /* les feux de position latéraux : orange devant, rouge derrière */
    P.box('O',.014,.035,.11,sd*(xF(2.12,.64)+.006),.64,2.12);P.box('L',.014,.035,.11,sd*(xF(-2.12,.64)+.006),.64,-2.12);
  });
  /* L'ÉCUSSON : un masque de robot chromé au milieu de la calandre, deux fentes bleues pour les yeux */
  P.plate('c',[[-.075,.772],[.075,.772],[.082,.712],[.034,.636],[-.034,.636],[-.082,.712]],.02,ZE+.026);
  P.plate('K',[[-.058,.758],[.058,.758],[.064,.714],[.026,.652],[-.026,.652],[-.064,.714]],.02,ZE+.032);
  P.sym(sd=>{P.box('B',.044,.016,.012,sd*.030,.722,ZE+.046,0,0,sd*.32);P.box('c',.012,.03,.012,sd*.012,.672,ZE+.046);});
  P.box('n',1.86,.20,.02,0,.86,-ZE-.004);P.box('p',.30,.11,.035,0,.86,-ZE-.022);
  /* le même masque, en petit, au milieu de la poupe : c'est elle qu'on voit en course */
  P.plate('c',[[-.052,.902],[.052,.902],[.057,.860],[.024,.808],[-.024,.808],[-.057,.860]],.012,-ZE-.052);
  P.plate('K',[[-.040,.892],[.040,.892],[.044,.861],[.018,.819],[-.018,.819],[-.044,.861]],.012,-ZE-.058);
  P.sym(sd=>P.box('B',.03,.011,.01,sd*.021,.869,-ZE-.062,0,0,-sd*.32));
  P.box('p',1.76,.035,.12,0,1.015,-2.40,-.12);                       /* le becquet de coffre */
  P.box('L',.36,.014,.02,0,1.037,-2.458,-.12);                       /* le troisième feu, au bord du becquet */
  /* LA GRANDE BOUCHE NOIRE du bouclier, ses mailles, et la lame avant */
  P.plate('K',[[-.50,.355],[.50,.355],[.45,.515],[-.45,.515]],.02,ZE-.004);
  for(let i=0;i<3;i++)P.box('M',.88-i*.03,.008,.01,0,.39+i*.042,ZE+.018);
  for(let i=-6;i<=6;i++)P.box('M',.008,.13,.01,i*.068,.435,ZE+.019);
  P.box('k',1.76,.035,.16,0,.325,ZE-.01);
  P.box('k',1.30,.09,.04,0,.36,-ZE-.004);
  /* LA PRISE D'AIR NOIRE, plantée au milieu du capot, et les deux GOUPILLES de capot */
  const za=1.55,zb=2.05;
  P.prism('n',[[za,yC(za)-.01],[zb,yC(zb)-.01],[zb,yC(zb)+.10],[za+.10,yC(za)+.07],[za,yC(za)+.03]],.28,0);
  P.box('k',.24,.07,.01,0,yC(zb)+.05,zb+.004);
  P.sym(sd=>P.cyl('c',.024,.014,10,sd*.56,yC(2.34)+.004,2.34,'y'));
  /* le bouchon de réservoir de course, sur l'aile arrière droite */
  P.cyl('c',.07,.02,10,.955,.89,-1.90,'x');
  K.commit(P);
  return {hl:[.76,.70,ZE+.05],tl:[.60,.86,-ZE-.04],wx:.82,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.27,style:'rayons',n:5,jante:0x33363d,accent:0x141518}};
 },
  b_bavaroise:function(K){
  /* LA BAVAROISE v3 (13/10, Léo : « la blanche, toujours pas, à refondre ») — refaite d'après une photo de PROFIL de la sportive de
     Munich des années 80 : le capot qui DESCEND vers une face basse (0,79 au nez, elle était à 0,89), l'habitacle AVANCÉ (pied de
     pare-brise à 0,88) et donc une malle plus longue, haute, avec son becquet ; de GRANDES vitres à montants fins (ceinture à 0,90,
     pavillon à 1,36) ; l'ARÊTE d'épaule qui court des phares aux feux ; des ailes élargies qui s'y fondent (elles faisaient des caissons
     blancs posés sur la coque) ; un bouclier mince, sa bande noire, et la face : panneau noir, quatre phares, haricots étroits. */
  const U=LPU,R=.33,ZF=1.34,ZR=-1.22;
  const P=K.kit(fentePal({p:{g:'p',c:0xf2f2f0},n:{g:'m',c:0x141518},h:{g:'s',c:0xb4bcc6},K:{g:'g',c:0x0c0e12},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xe9ecf0},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    b:{g:'p',c:0x3fa9f5,f:0},v:{g:'p',c:0x3a2a8c,f:0},r:{g:'p',c:0xe0201c,f:0},Y:{g:'l',c:0xffd23a},D:{g:'m',c:0x33373e}}));   // (19/10) 'J' / 'Jf' : la FENTE C
  const AR=[[0,.71],[.19,.66],[.33,.52],[.38,.39],[R+.10,.24]];   // (19/10, BOÎTES) l'arche RONDE (elle était en trapèze : des élargisseurs en caissons)
  const ZT=-2.20,ZN=2.12,ZC=.88,ZM=-1.48;                                         // la poupe, le nez, pied du pare-brise, pied de la lunette
  let zs=[ZT,-2.17,-2.10,-1.90,ZM,-1.42,-1.20,-1.05,-.62,-.47,-.40,0,.30,.36,.74,.80,ZC,.94,1.40,1.80,2.05,ZN];
  for(const w of [ZF,ZR])for(const d of [.19,.33,.38,R+.10,.48,.53])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z<=ZC&&z>=ZM;
  const yC=z=>U.lin([[ZT,.92],[-2.17,.98],[-2.10,.995],[-1.90,1.00],[ZM,1.005],[-1.42,1.07],[-1.05,1.33],[-.62,1.36],[0,1.36],[.36,1.34],[ZC,.915],
                     [1.40,.885],[1.80,.855],[2.05,.81],[ZN,.79]],z),
        cR=z=>U.lin([[ZT,.80],[-2.0,.83],[0,.83],[1.40,.825],[2.0,.80],[ZN,.785]],z),          // l'ARÊTE d'épaule
        bL=z=>U.lin([[ZM,.94],[-1.05,.935],[-.40,.92],[ZC,.905]],z),                          // la ceinture (bas des vitres)
        xS=z=>U.lin([[ZT,.76],[-2.12,.79],[-1.95,.80],[1.95,.80],[ZN,.77]],z),
        xF=z=>{let f=0;for(const w of [ZF,ZR]){const d=Math.abs(z-w);f=Math.max(f,d<.42?1:d<.56?1-(d-.42)/.14:0);}return f;}, // les AILES ÉLARGIES
        xR=z=>U.lin([[ZM,.64],[-1.05,.68],[.36,.68],[ZC,.72]],z);   // (19/10) le pavillon plus LARGE : des vitres plus droites (le toit faisait une pyramide)
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.20),U.lin([[ZT,.22],[-2.05,.20],[2.00,.20],[ZN,.22]],z)),xs=xS(z),xw=xs+.032*xF(z),cr=cR(z),t=yC(z);
    const y2=Math.max(yb+.04,.28),y3=Math.max(y2+.02,cr-.07);
    const s=[[0,yb],[xw-.07,yb],[xw-.01,y2],[xw,y3],[xs+.008,cr]];
    if(cab(z)){const bl=Math.max(cr+.02,bL(z)),y7=Math.max(bl+.06,t-.026);
      s.push([xs-.015,bl],[xs-.05,bl+.02],[Math.min(xR(z),xs-.10),y7],[xR(z)*.6,Math.max(y7+.006,t-.008)],[0,Math.max(t,y7+.01)]);}
    else{const tt=Math.max(t,cr+.006),xc=xs-.06;                                    // capot / malle à plat entre les arêtes
      s.push([xs-.012,Math.max(cr+.004,tt-.012)],[xc,tt-.002],[xc*.6,tt],[xc*.3,tt],[0,tt]);}
    return s;
  },(j,z)=>{
    if(j<0)return 'p';
    if(j===0)return 'n';
    if(cab(z)){
      if(j===5)return 'n';                                                        // le joint noir au pied des vitres
      if(j===6){if(z>-.47&&z<-.40)return 'n';                                    // le montant milieu, noir
        if(z>-1.20&&z<.80)return 'g';return z<0?'p':'n';}                        // les grandes vitres ; le montant arrière dans la couleur (il faisait un triangle noir)
      if((j===7||j===8)&&z>.36)return 'g';                                       // le pare-brise
      if((j===7||j===8)&&z<-1.05&&z>-1.42)return 'g';                            // la lunette, droite
    }
    return 'p';});
  /* LA FACE : le panneau noir, les quatre phares (cerclage chromé, réflecteur argent, l'ampoule), les haricots étroits et hauts */
  P.box('K',1.50,.21,.02,0,.665,ZN+.004);
  P.sym(sd=>{
    for(const [x,r] of [[.615,.082],[.425,.068]]){P.cyl('c',r+.012,.02,14,sd*x,.665,ZN+.01,'z');P.cyl('h',r,.02,14,sd*x,.665,ZN+.016,'z');
      P.cyl('W',r*.45,.02,10,sd*x,.665,ZN+.022,'z');}
    for(const y of [.585,.745])P.box('n',.70,.01,.01,sd*.42,y,ZN+.018);
    P.plate('c',[[sd*.018,.555],[sd*.118,.555],[sd*.128,.575],[sd*.128,.765],[sd*.112,.785],[sd*.018,.785]],.02,ZN+.006);
    P.plate('K',[[sd*.03,.567],[sd*.106,.567],[sd*.114,.581],[sd*.114,.757],[sd*.102,.772],[sd*.03,.772]],.02,ZN+.012);
    for(const x of [.052,.072,.092])P.box('c',.008,.18,.01,sd*x,.668,ZN+.035);
    /* le bouclier : les clignotants orange aux coins, sous la bande noire */
    P.box('O',.15,.045,.02,sd*.62,.335,ZN+.092);
    /* les trois filets sur le bas de caisse */
    // (13/10, Léo : « les barres chelou ») les trois filets de bas de caisse RETIRÉS
    /* LA POUPE : les feux en bandeau (rouge, orange, recul), le joint */
    P.box('L',.34,.14,.02,sd*.58,.72,ZT-.004);P.box('O',.12,.14,.02,sd*.35,.72,ZT-.004);P.box('W',.06,.14,.02,sd*.26,.72,ZT-.004);
    for(const y of [.68,.76])P.box('n',.52,.008,.02,sd*.50,y,ZT-.01);
    /* rétros sur leur pied, poignée */
    P.prism('n',[[.80,.90],[.64,.90],[.67,.94],[.76,.94]],.05,sd*.80);P.box('p',.06,.08,.15,sd*.85,.965,.72,0,sd*.10,0);
    P.box('n',.012,.03,.13,sd*.805,.85,-.10);
    for(const z of [.76,-.44]){P.box('J',.006,.52,.007,sd*.806,.60,z);P.box('Jf',.006,.52,.003,sd*.806,.60,z+.006);}   // les jointures de la portière (19/10 : la FENTE C, plus de trait noir)
    P.box('J',.006,.007,1.62,sd*.797,.30,.06);P.box('Jf',.006,.003,1.62,sd*.797,.306,.06);   // le haut de la jupe, d'une roue à l'autre
    P.box('p',.06,.07,.10,sd*.56,1.04,-2.00);                                   // pieds d'aileron
  });
  /* les boucliers minces, leur bande noire, la bouche, la lame */
  P.box('p',1.66,.29,.12,0,.315,ZN+.03);P.box('n',1.64,.03,.01,0,.42,ZN+.091);
  P.box('n',.48,.09,.01,0,.31,ZN+.091);P.box('n',1.00,.03,.01,0,.215,ZN+.091);
  P.box('p',1.66,.27,.12,0,.33,ZT-.03);P.box('n',1.64,.03,.01,0,.43,ZT-.091);P.box('n',.46,.12,.02,0,.58,ZT-.006);   // plaque
  P.box('p',1.46,.03,.22,0,1.10,-2.02,.10);                                       // le becquet de malle
  /* LE MACARON sur le bord du capot, au-dessus des haricots */
  {const zr=2.035,yr=yC(zr)+.004;P.cyl('c',.045,.012,14,0,yr,zr,'y');P.cyl('b',.036,.014,14,0,yr+.002,zr,'y');P.box('p',.036,.004,.036,.018,yr+.01,zr-.018);P.box('p',.036,.004,.036,-.018,yr+.01,zr+.018);}
  /* les filets sur le capot, décalés à gauche : on les voit de la poursuite */
  {const z0=1.00,z1=2.00,hz=(z0+z1)/2,ht=Math.atan2(yC(z0)-yC(z1),z1-z0),hy=yC(hz)+.006;
   /* (13/10) les filets du capot RETIRÉS */}
  for(const x of [.34,.42])P.cyl('c',.042,.12,8,x,.27,ZT-.02,'z');
  /* (2026-10-17, Sacha : « rajoute-lui plus d'éléments de tuning — c'est inspiré des BMW de rallye : sur les roues, autour des roues, le
     pare-choc… des trucs un peu plus stylés, plus de détails ») LE KIT RALLYE. Devant : la RAMPE de quatre longue-portée au verre jaune
     sur le bouclier, la LAME, la SANGLE de remorquage rouge. Dessus : les GOUPILLES du capot, l'ÉCOPE du pavillon, l'ANTENNE, l'aileron
     devenu réglable (JOUES et VOLET noirs). Autour des roues : les ÉLARGISSEURS bordés de caoutchouc et RIVETÉS, les BAVETTES rouges ;
     dans les jantes (dorées, voir `lpw`) : les DISQUES et les ÉTRIERS rouges — pièces de caisse, ils ne tournent pas avec la roue.
     Rien de rouge ne passe par 'l' (les feux arrière se relèvent sur le rouge ÉMISSIF), aucune pièce chromée n'est un tube en z à la
     poupe (le relevé des pots, `echRetire`, l'ôterait). */
  {const yl=.515,zl=ZN+.16;
   P.box('n',1.00,.026,.03,0,yl-.062,zl-.03);                                   // la barre de la rampe, devant le bouclier
   P.sym(sd=>{
     for(const x of [.18,.41]){P.cyl('n',.05,.07,14,sd*x,yl,zl-.03,'z');        // (19/10) ⌀ 10 cm au lieu de 13 : ils mangeaient la face        // le boîtier
       P.cyl('c',.053,.014,14,sd*x,yl,zl+.008,'z');P.cyl('Y',.042,.012,14,sd*x,yl,zl+.012,'z'); // le cerclage, le verre jaune
       P.box('n',.022,.04,.022,sd*x,yl-.048,zl-.03);}                            // la patte
     P.box('n',.03,.026,.10,sd*.30,yl-.062,ZN+.10);                               // les supports, plantés dans le bouclier
   });}
  P.box('n',1.58,.022,.15,0,.165,ZN+.08);                                       // la lame, sous le bouclier
  P.box('r',.04,.10,.012,.48,.25,ZN+.097);P.cyl('c',.016,.03,8,.48,.30,ZN+.10,'z'); // la sangle de remorquage, son anneau
  P.box('r',.04,.10,.012,-.56,.27,ZT-.092);                                      // et la sienne derrière
  /* les goupilles du capot, l'écope du pavillon (la bouche noire devant), l'antenne au bout du toit */
  P.sym(sd=>{const z=1.92,y=yC(z);P.cyl('c',.022,.016,10,sd*.56,y+.006,z,'y');P.box('n',.006,.006,.05,sd*.56,y+.016,z);});
  P.prism('n',[[.10,1.352],[-.24,1.352],[-.14,1.40],[.10,1.415]],.30,0);P.box('K',.25,.042,.006,0,1.384,.103);
  {const r=-.32,L=.46;P.box('n',.03,.02,.04,.30,1.345,-.85);P.box('n',.008,L,.008,.30,1.345+L/2*Math.cos(r),-.85+L/2*Math.sin(r),r);}
  /* l'aileron réglable : les joues aux bouts du becquet, le volet au bord de fuite */
  P.sym(sd=>P.prism('n',[[-1.90,1.07],[-2.15,1.07],[-2.15,1.15],[-1.96,1.12]],.014,sd*.737));P.box('n',1.44,.035,.01,0,1.136,-2.128);
  /* le bouchon de réservoir à fermeture rapide, sur l'aile arrière droite */
  P.cyl('c',.045,.012,12,.802,.62,-1.84,'x');P.cyl('n',.03,.014,10,.806,.62,-1.84,'x');
  /* AUTOUR DES ROUES : le jonc de caoutchouc des élargisseurs, sur le bord de l'arche (le profil AR : du bas de caisse au sommet),
     ses rivets, et la bavette derrière chaque roue */
  {const AP=[...AR.slice(1).reverse().map(([d,y])=>[-d,y]),...AR],t=.024,xl=.815;   // (19/10) le jonc suit l'arche ronde, plus fin
   for(const w of [ZF,ZR])P.sym(sd=>{
     for(let i=0;i<AP.length-1;i++){const a=AP[i],b=AP[i+1],dz=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dz,dy),an=Math.atan2(dy,dz),
         nz=-dy/L,ny=dz/L;                                                       // la normale vers le DEHORS de l'arche
       P.box('n',.05,t,L+t*.9,sd*xl,(a[1]+b[1])/2+ny*t/2,w+(a[0]+b[0])/2+nz*t/2,-an);
       for(const u of [.5])P.cyl('c',.011,.012,6,sd*(xl+.031),a[1]+dy*u+ny*t/2,w+a[0]+dz*u+nz*t/2,'x');}  // les rivets
     P.box('r',.25,.19,.012,sd*.71,.155,w-(R+.13));                              // la bavette
     /* le disque et l'étrier, entre le fond de la jante (x .745) et ses rayons (x .768) */
     P.cyl('D',.19,.006,20,sd*.752,R,w,'x');
     P.box('r',.012,.07,.13,sd*.7615,R+.106,w-.106,-Math.PI/4);
   });}
  K.commit(P);
  return {hl:[.62,.665,ZN+.03],tl:[.58,.72,ZT-.02],wx:.71,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.24,style:'multi',n:12,jante:0xd4a43a,creux:.04}}; // (2026-10-17, le kit rallye) les jantes à rayons fins DORÉES, douze rayons (dix, argent, avant)
},
