// <<< SHAPES.aventador (LE TORO NOIR) — début >>>
/* ===== LE TORO NOIR, L'AVENTADOR NOIRE (2026-11-26, Sacha : « la Lamborghini Aventador classique, en noir, tu la modélises dans le jeu […] dans le même style
   poli que la Léonie et que la Honte, donc avec peu de facettes et dans la même charte graphique que le reste du jeu ; sans bug, et tu adaptes tous les feux et les
   échappements et les traînées de lumière ») =====
   L'Aventador LP 700-4 de 2011, sur ses cotes réelles (4,78 × 2,03 × 1,14 m, empattement 2,70 m, roues de 19 pouces devant, 20 derrière). Le même atelier que LÉONIE :
   UNE coque en loft à facettes (8 points par section), puis les pièces posées. Ce qui la fait reconnaître à 200 m : le coin d'un seul trait du nez au toit, les
   passages de roue en trapèze, la grande prise d'air creusée dans le flanc derrière la portière, les ouïes sur les épaules, le capot moteur vitré à persiennes, les
   phares fins en Y, les feux arrière en Y, la grille noire de la poupe et LA sortie hexagonale au milieu. Repère : nez en +Z, conducteur à GAUCHE (+X), y = 0 au sol.
   ⚠ la laque est la clé 'p' (la peinture de la boutique la remplace) ; feux rouges 'L' en BOÎTES à la poupe : buildCar y fait naître les traînées de lumière (CAR_FEUX) ;
   le pot est déclaré dans ECH_POTS.aventador (la flamme de la nitro naît dans sa bouche). */
SHAPES.aventador=function(K){
  const U=LPU,L=(t,z)=>U.lin(t,z),RR=.355,RF=.33,ZF=1.35,ZR=-1.35,ZN=2.40,ZT=-2.36;
  const P=K.kit({p:{g:'p',c:0x16171b},r:{g:'p',c:0x121317},k:{g:'m',c:0x0d0e10},K:{g:'g',c:0x08090b},c:{g:'c',c:0xe9ecf0},C:{g:'k',c:0x9aa0a8},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xf4f8ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0x8a0c18},w:{g:'l',c:0xd9dce0},O:{g:'l',c:0xffa21a}});
  // LES PASSAGES DE ROUE EN TRAPÈZE, un par essieu (la roue avant est plus petite : son arche aussi)
  const arF=[[0,2*RF+.035],[RF*.62,2*RF+.025],[RF+.15,.20]],arR=[[0,2*RR+.025],[RR*.62,2*RR+.015],[RR+.15,.20]];
  const zs=[ZT,-2.30,-2.12,-1.95,-1.05,-.92,-.62,-.45,-.30,-.05,.30,.62,.90,1.95,2.12,2.28,ZN];
  for(const [w,r] of [[ZF,RF],[ZR,RR]])for(const d of [r*.62,r+.15])zs.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  zs.sort((a,b)=>a-b);
  // le dessus, d'un seul trait du nez au toit, puis le capot moteur qui descend doucement vers la poupe
  const yC=z=>L([[ZT,.86],[-2.30,.90],[-2.12,.92],[-1.95,.94],[-1.05,1.02],[-.62,1.08],[-.30,1.125],[-.05,1.14],[.30,1.07],[.62,.95],[.90,.84],[1.35,.76],[1.95,.62],[2.12,.56],[2.28,.49],[ZN,.42]],z),
        xW=z=>L([[ZT,.91],[-2.12,.98],[ZR,1.015],[-.92,.99],[-.45,.95],[.30,.94],[.90,.96],[ZF,1.0],[1.95,.97],[2.12,.93],[2.28,.86],[ZN,.78]],z),
        yB=z=>L([[ZT,.82],[-2.12,.88],[ZR,.93],[-.92,.95],[-.62,.92],[-.30,.90],[.30,.88],[.90,.84],[ZF,.76],[1.95,.63],[2.12,.57],[2.28,.50],[ZN,.43]],z), // l'épaule (la ceinture dans l'habitacle)
        yBas=z=>Math.max(U.arch(z,[ZF],arF,0),U.arch(z,[ZR],arR,0),L([[ZT,.30],[-2.18,.15],[2.18,.13],[ZN,.18]],z)),
        cab=z=>z>-.63&&z<.91,
        prise=z=>U.cl(Math.min((z+1.04)/.14,(-.31-z)/.14),0,1); // LA PRISE D'AIR DE FLANC : 1 entre la portière et l'arche arrière
  P.loft(zs,z=>{
    const yb=yBas(z),xw=xW(z),c=yC(z),k=prise(z),
          ym=Math.min(Math.max(L([[ZT,.50],[ZR,.56],[-.62,.58],[.30,.54],[ZF,.56],[ZN,.30]],z),yb+.07),c-.08),
          y2=Math.min(Math.max(.28,yb+.04),ym-.03),ysh=Math.min(Math.max(yB(z),ym+.05),c-.005);
    const p4=cab(z)?[xw-.20,ysh+.03]:[xw-.12,ysh+.01],
          p5=cab(z)?[L([[-.63,.50],[-.30,.54],[.30,.58],[.62,.66],[.91,.74]],z),c-.025]:[L([[ZT,.62],[-1.05,.60],[-.63,.52],[.91,.58],[ZN,.50]],z),c-.004];
    if(p4[1]>p5[1])p4[1]=p5[1]-.002;
    return [[0,yb],[xw-.06,yb],[xw-.025-.05*k,y2],[xw-.16*k,ym],[xw-.03-.10*k,ysh],p4,p5,[0,c]];  // le flanc se creuse dans la prise d'air
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===1&&z>ZR+RR+.15&&z<ZF-RF-.15)return 'k';                         // le bas de caisse en carbone
    if((j===2||j===3)&&prise(z)>.35)return 'k';                              // la prise d'air, noire
    if(j===5&&cab(z))return (z>-.46&&z<.80)?'g':'p';                        // la vitre latérale
    if(j===6&&z>-.06&&z<.90)return 'g';                                      // le pare-brise
    if(j===6&&z>-1.96&&z<-.62)return 'g';                                    // le capot moteur vitré
    return 'p';});
  // LES PERSIENNES du capot moteur (la vitre en trois pans hexagonaux, ses lames noires)
  for(let i=0;i<7;i++){const z=-.74-i*.17;P.box('K',.74,.016,.05,0,yC(z)+.012,z,-.07);}
  P.box('r',.05,.03,1.30,0,yC(-1.30)+.018,-1.30,-.075);                    // l'arête du milieu
  P.sym(sd=>{
    // LES OUÏES D'ÉPAULE derrière les vitres (elles nourrissent le V12)
    P.box('k',.20,.05,.44,sd*.80,yB(-1.0)+.02,-1.0,-.06);P.box('K',.16,.012,.40,sd*.80,yB(-1.0)+.048,-1.0,-.06);
    // LA PRISE D'AIR DE FLANC : ses lames
    for(const z of [-.55,-.75])P.box('K',.03,.18,.012,sd*(xW(z)-.10),.50,z);
    // LES PHARES EN Y : le boîtier noir posé sur l'aile qui plonge, la lampe, et la LED en Y qui le traverse
    P.box('K',.40,.05,.24,sd*.64,yB(2.16)+.012,2.16,.40,sd*.18,0);
    P.box('W',.20,.02,.08,sd*.70,yB(2.20)+.035,2.20,.40,sd*.18,0);
    P.box('W',.30,.012,.025,sd*.60,yB(2.08)+.04,2.08,.40,sd*.30,sd*.06);
    P.box('W',.14,.012,.025,sd*.46,yB(2.16)+.03,2.15,.40,-sd*.55,0);
    P.box('O',.05,.03,.08,sd*(xW(2.12)-.02),.52,2.12);                       // le feu de gabarit, au coin
    // LES PRISES D'AIR AVANT : deux grands triangles noirs aux coins du bouclier, leurs lames
    P.box('k',.36,.17,.02,sd*.55,.27,ZN+.004);
    for(const x of [.45,.55,.65])P.box('K',.012,.15,.03,sd*x,.27,ZN+.01);
    // LES FEUX ARRIÈRE EN Y : le boîtier noir, la barre du haut et la branche qui plonge vers le milieu
    P.box('K',.56,.12,.04,sd*.62,.78,-2.355);
    P.box('L',.50,.035,.03,sd*.64,.81,-2.37);
    P.box('L',.20,.03,.03,sd*.44,.76,-2.37,0,0,sd*.62);
    P.box('Q',.40,.05,.012,sd*.66,.755,-2.378);
    // LE RÉTRO sur son bras (planté dans l'épaule de la portière)
    P.box('p',.10,.08,.17,sd*1.01,.93,.66);P.box('k',.22,.04,.04,sd*.88,.89,.66);
    // la ligne de la portière, au ciseau
    P.box('k',.012,.006,1.00,sd*(xW(.30)+.003),.66,.28,.13,0,0);   // elle remonte vers la prise d'air, comme le pli de la vraie
  });
  // LE BOUCLIER AVANT : la bouche du milieu, la lame au ras du sol
  P.box('k',.52,.10,.03,0,.25,2.405);P.box('k',1.74,.03,.22,0,.12,2.30);
  // LA POUPE : la grille noire, le diffuseur et ses ailettes, l'aileron replié sur la malle, la plaque éclairée
  P.box('K',1.20,.30,.02,0,.56,-2.37);
  {const X=.58,Y0=.43,Y1=.69,T=.12;   // la grille en mailles, ouverte au milieu pour la sortie
   for(let y=Y0;y<=Y1+.001;y+=.065){if(Math.abs(y-.56)<.10){for(const sd of [-1,1])P.box('k',X-T,.012,.012,sd*(T+X)/2,y,-2.382);}else P.box('k',2*X,.012,.012,0,y,-2.382);}
   for(let x=-X;x<=X+.001;x+=.145)if(Math.abs(x)>T)P.box('k',.012,Y1-Y0,.012,x,(Y0+Y1)/2,-2.384);}
  P.box('k',1.70,.15,.26,0,.235,-2.22);for(const x of [-.60,-.36,.36,.60])P.box('K',.016,.13,.24,x,.235,-2.23);
  P.box('k',1.42,.03,.24,0,yC(-2.20)+.03,-2.20,.06);
  P.box('K',.42,.12,.012,0,.36,-2.385);P.box('w',.38,.09,.012,0,.36,-2.392);
  K.commit(P);
  {const mP=K.mats&&K.mats.p;if(mP){mP.reflectivity=.33;mP.shininess=90;}}   /* le noir verni : c'est le reflet qui dessine la caisse (une laque noire mate disparaît la nuit) */
  return {hl:[.66,.56,2.30],tl:[.62,.80,-2.38],wx:.87,wzF:ZF,wzR:-ZR,wRF:RF/RR,
          lpw:{R:RR,w:.32,style:'rayons',n:5,jante:0x8d939b,accent:0x8d939b,branches:1}};
};
// LA SORTIE HEXAGONALE au milieu de la grille (l'Aventador LP 700-4 n'en a qu'une)
ECH_POTS.aventador={p:[{t:'rond',r:.085,n:6,rz:Math.PI/6,k:'C',dbl:1,k2:'c',len:.30,pts:[[0,.56,-2.40]]}]};
Object.assign(I18N,{'LE TORO NOIR':'THE BLACK BULL','Noire, plate, taillée comme une lame. Le V12 respire par les flancs, et la ville se tait quand elle passe.':'Black, flat, cut like a blade. The V12 breathes through its flanks, and the city goes quiet when it passes.'});
// >>> fin SHAPES.aventador (LE TORO NOIR)
