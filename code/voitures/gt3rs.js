// <<< SHAPES.gt3rs (LA PISTARDE) — début >>>
/* ===== LA PISTARDE, LA GT3 RS BLANCHE (2026-11-26, Sacha : « tu mets une Porsche GT3 RS en la blanche avec des lettres en orange […] dans le
   même style poli que la Léonie et que la Honte, donc avec peu de facettes et dans la même charte graphique que le reste du jeu ; sans bug, et tu adaptes tous les
   feux et les échappements et les traînées de lumière ») =====
   La 911 GT3 RS de 2023 sur ses cotes réelles (4,57 × 1,90 × 1,32 m, empattement 2,46 m, roues de 20 pouces devant, 21 derrière). Même atelier que LÉONIE : UNE coque
   en loft à facettes (8 points par section), puis les pièces posées. Ce qui la fait reconnaître : les phares ronds au sommet des ailes, le capot plus bas qu'elles et ses
   deux naseaux, les ouïes sur les ailes avant, le pavillon qui coule jusqu'à la poupe, les hanches larges, LE GRAND AILERON sur ses cols de cygne (plus haut que le
   toit), la barre de feux d'un bout à l'autre, les deux sorties au milieu. (26/11, Sacha) Ni stickers de la marque ni dessins sur les phares.
   Repère : nez en +Z, conducteur à GAUCHE (+X), y = 0 au sol. ⚠ la laque est 'p' (la boutique la repeint) ; les feux rouges 'L' sont des BOÎTES à la poupe (les traînées de lumière y naissent, voir CAR_FEUX) ; le pot est ECH_POTS.gt3rs. */
SHAPES.gt3rs=function(K){
  const U=LPU,L=(t,z)=>U.lin(t,z),mix=(a,b,t)=>a+(b-a)*t,RR=.37,RF=.35,ZF=1.23,ZR=-1.23,ZN=2.20,ZT=-2.34;
  const P=K.kit({p:{g:'p',c:0xe9ebee},r:{g:'p',c:0xd3d6db},k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xe9ecf0},C:{g:'k',c:0x9aa0a8},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xf4f8ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0x8a0c18},w:{g:'l',c:0xd9dce0}});
  // LES PASSAGES DE ROUE RONDS, un par essieu
  const ar=r=>[[0,2*r+.03],[r*.60,2*r-.01],[r*.92,r*1.15],[r+.10,.22]],arF=ar(RF),arR=ar(RR);
  const zs=[ZT,-2.25,-1.95,-1.50,-1.0,-.62,-.25,.05,.40,.72,.80,1.60,1.95,2.08,ZN];
  for(const [w,r] of [[ZF,RF],[ZR,RR]])for(const d of [r*.60,r*.92,r+.10])zs.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  zs.sort((a,b)=>a-b);
  // le dessus : le capot bas entre les ailes, le pare-brise, le pavillon qui coule jusqu'à la malle
  const yC=z=>L([[ZT,.88],[-2.25,.94],[-1.95,.99],[-1.50,1.07],[-1.0,1.17],[-.62,1.25],[-.25,1.31],[.05,1.29],[.40,1.09],[.72,.85],[.80,.80],[ZF,.745],[1.60,.715],[1.95,.665],[2.08,.60],[ZN,.48]],z),
        xW=z=>L([[ZT,.80],[-2.25,.88],[-1.95,.94],[ZR,.97],[-.80,.94],[-.55,.89],[.65,.89],[.80,.90],[ZF,.93],[1.60,.92],[1.95,.88],[2.08,.82],[ZN,.70]],z),
        yF=z=>L([[.80,.90],[ZF,.82],[1.60,.785],[1.95,.735],[2.08,.66],[ZN,.52]],z),  // la crête des ailes avant (le phare au bout)
        yB=z=>L([[ZT,.80],[-2.25,.84],[-1.95,.87],[ZR,.89],[-.62,.89],[.05,.88],[.80,.88]],z), // l'épaule des hanches, la ceinture
        yBas=z=>Math.max(U.arch(z,[ZF],arF,0),U.arch(z,[ZR],arR,0),L([[ZT,.30],[-2.20,.16],[2.08,.15],[ZN,.20]],z)),
        cab=z=>z>-.63&&z<.81,av=z=>z>=.81;
  /* 9 points par section : le flanc ROULE en deux pans vers l'épaule (une 911 n'a pas de mur droit, ses hanches sont des galets) */
  P.loft(zs,z=>{
    const yb=yBas(z),xw=xW(z),c=yC(z),
          y2=Math.max(.30,yb+.04),y3=Math.max(.56,yb+.08),
          ys=av(z)?Math.max(yF(z)-.09,y3+.05):Math.min(Math.max(yB(z),y3+.06),c-.04),
          yr=Math.min(mix(y3,ys,.55)+.02,ys-.01);
    let p4,p5;
    if(av(z)){p4=[xw-.17,Math.max(yF(z),ys+.01)];p5=[L([[.80,.70],[1.10,.50],[1.60,.46],[ZN,.40]],z),c+.008];}   // la crête de l'aile, puis le capot plus bas
    else if(cab(z)){p4=[xw-.15,ys+.04];p5=[L([[-.63,.48],[-.25,.50],[.05,.53],[.40,.59],[.72,.68],[.81,.70]],z),c-.03];} // la ceinture, le bord du pavillon
    else{p4=[xw-.17,ys+.035];p5=[L([[ZT,.50],[-1.95,.54],[-1.0,.52],[-.63,.48]],z),c-.02];}                    // les hanches qui roulent, la malle
    if(!av(z)&&p4[1]>p5[1])p4[1]=p5[1]-.002;
    return [[0,yb],[xw-.06,yb],[xw-.008,y2],[xw,y3],[xw-.025,yr],[xw-.075,ys],p4,p5,[0,c]];
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===1&&z>ZR+RR+.10&&z<ZF-RF-.10)return 'k';                         // le bas de caisse noir
    if(j===6&&cab(z))return (z>-.58&&z<.70)?'g':'p';                        // la vitre latérale
    if(j===7&&z>.06&&z<.78)return 'g';                                       // le pare-brise
    if(j===7&&z>-1.30&&z<-.60)return 'g';                                    // la lunette arrière
    return 'p';});
  // LA MALLE MOTEUR : ses lames noires, et l'arête qui court du pavillon à l'aileron
  for(let i=0;i<6;i++){const z=-1.45-i*.13;P.box('K',.72,.014,.05,0,yC(z)+.01,z,-.17);}
  P.box('p',.035,.06,.95,0,yC(-.95)+.02,-.95,-.21);
  P.sym(sd=>{
    // LES PHARES RONDS au bout des ailes : la cuvette noire, le verre bombé
    {const a=.85,ny=Math.cos(a),nz=Math.sin(a),x=sd*.645,y=.625,z=2.10,N=d=>[x,y+ny*d,z+nz*d];   // l'axe du phare : vers l'avant et un peu le ciel (la pente du bout de l'aile)
     P.put('p',new THREE.CylinderGeometry(.128,.15,.12,14),...N(0),a,0,0);                 // le godet de l'aile, couleur caisse (le phare sort d'une bosse, comme sur une vraie 911)
     P.put('K',new THREE.CylinderGeometry(.118,.118,.02,14),...N(.065),a,0,0);             // la cuvette noire
     P.put('W',new THREE.LatheGeometry([[.10,0],[.08,.02],[0,.028]].map(q=>new THREE.Vector2(q[0],q[1])),14),...N(.074),a,0,0);}   /* le verre bombé, blanc et nu (2026-11-26, Sacha : « ni de dessins sur les phares ») */
    // LES OUÏES sur le dessus des ailes avant
    for(let i=0;i<5;i++){const z=1.34+i*.07;P.box('K',.24,.012,.035,sd*.72,yF(z)+.006,z,.10,0,-sd*.10);}
    // LES NASEAUX du capot
    P.box('K',.20,.012,.24,sd*.20,yC(1.55)+.006,1.55,.08);
    // LES PRISES D'AIR AVANT : les deux côtés du bouclier, et leurs lames
    P.box('k',.36,.14,.03,sd*.52,.29,ZN-.02);for(const x of [.42,.52,.62])P.box('K',.012,.12,.06,sd*x,.29,ZN-.01);
    // LES CLIGNOTANTS LED sous les phares
    P.box('W',.20,.018,.02,sd*.60,.42,ZN-.03);
    // LES FEUX ARRIÈRE : le coin de la barre, plus épais
    P.box('K',.34,.09,.03,sd*.64,.86,ZT-.005);P.box('L',.30,.05,.03,sd*.64,.86,ZT-.012);P.box('Q',.26,.02,.012,sd*.64,.83,ZT-.02);
    // LE RÉTRO sur son pied (planté dans la portière)
    P.box('p',.13,.08,.17,sd*.99,1.00,.56);P.box('k',.03,.09,.04,sd*.835,.95,.56);P.box('k',.15,.025,.04,sd*.90,.99,.56);
    // LES CHEMINÉES des arches avant (les ouïes derrière la roue)
    for(let i=0;i<3;i++)P.box('K',.012,.13,.025,sd*(xW(.82)+.003),.52,.84-i*.06);
    // la ligne de la portière
    P.box('k',.008,.36,.008,sd*(xW(.70)+.002),.58,.70);
    /* (2026-11-26, Sacha : « mets pas les vrais stickers Porsche ») plus de lettres « GT3 RS » sur les portières : la caisse reste nue, sans marque */
  });
  // LE BOUCLIER AVANT : la grande bouche du milieu, la lame
  P.box('k',.50,.12,.03,0,.27,ZN-.01);P.box('k',1.50,.03,.20,0,.13,ZN-.10);
  // LA POUPE : la barre de feux d'un bout à l'autre, la grille, le diffuseur, la plaque éclairée
  P.box('L',1.0,.022,.02,0,.865,ZT-.01);
  P.box('K',1.10,.14,.02,0,.70,ZT-.005);for(let i=0;i<4;i++)P.box('k',1.06,.01,.01,0,.645+i*.035,ZT-.018);
  P.box('k',1.46,.15,.24,0,.235,ZT+.11);for(const x of [-.50,-.28,.28,.50])P.box('K',.016,.13,.22,x,.235,ZT+.10);
  P.box('K',.42,.12,.012,0,.50,ZT-.01);P.box('w',.38,.09,.012,0,.50,ZT-.018);
  // LE GRAND AILERON : le plan, le volet, les dérives, les deux cols de cygne qui le tiennent PAR-DESSUS
  P.box('k',1.72,.035,.36,0,1.31,-2.00,-.10);
  P.box('k',1.66,.025,.16,0,1.37,-2.17,-.38);
  P.sym(sd=>{
    P.prism('k',[[-1.80,1.24],[-2.30,1.24],[-2.32,1.44],[-1.86,1.36]],.025,sd*.87);
    P.prism('k',[[-1.78,1.07],[-1.92,1.04],[-2.02,1.30],[-1.96,1.345],[-1.88,1.33]],.035,sd*.36);
  });
  K.commit(P);
  {const mP=K.mats&&K.mats.p;if(mP){mP.reflectivity=.27;mP.shininess=70;}}   /* le blanc verni : un reflet franc, comme LE LOUP (une laque blanche mate se lit plâtre) */
  return {hl:[.66,.62,2.10],tl:[.64,.86,-2.36],wx:.80,wzF:ZF,wzR:-ZR,wRF:RF/RR,
          lpw:{R:RR,w:.33,style:'multi',n:10,jante:0x2b2e33}};
};
// LES DEUX SORTIES au milieu du diffuseur, en titane
ECH_POTS.gt3rs={p:[{t:'rond',r:.062,n:14,k:'C',dbl:1,k2:'c',pts:[[.11,.34,-2.37],[-.11,.34,-2.37]]}]};
Object.assign(I18N,{'LA PISTARDE':'THE TRACK QUEEN','Blanche comme une piste neuve, et un aileron plus haut que le toit. Elle ne connaît que deux vitesses : vite, et le record.':'White as a fresh track, and a wing taller than the roof. She knows two speeds: fast, and the record.'});
// >>> fin SHAPES.gt3rs (LA PISTARDE)
