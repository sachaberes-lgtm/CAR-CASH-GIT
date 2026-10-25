const SHAPES={
  // 1. L'ÉPAVE — tôle froissée, une roue voilée, un phare mort. Le point de départ de chaque run.
  epave(K){
    const {W,H,L,y0,box:B}=K;
    // (2026-10-15, Léo : « plus de détail au niveau de la brillance et de la texture de sa carcasse ») ses tôles : des BOÎTES USÉES (voir
    // boiteUsee), dans la tôle et l'accent de la caisse avec une couleur par facette — et une laque usée qui brille un peu plus (un reflet
    // plus net, qui court sur les chanfreins), toujours mate à côté de la gamme. Même programme pour les deux (le liseré de l'épave).
    const bV=K.body.clone(),aV=K.acc.clone();for(const m of [bV,aV]){m.vertexColors=true;rimify(m,null);}
    bV.shininess=30;bV.specular.setHex(0x8e8e8e);bV.reflectivity=.07;aV.shininess=26;aV.specular.setHex(0x9a9a9a);
    /* (2026-10-26, Léo : « LA HONTE, on peut pas la peindre ») la peinture ne teintait que la grande tôle : le toit, les bas de caisse, le rétro et les
       plaques de rouille gardaient leur brun d'origine (une caisse à moitié peinte). Peinte, elle les prend : l'accent = la teinte (le bas du dégradé)
       un cran plus sombre, la rouille = la teinte à moitié (la patine reste visible, ton sur ton). Un MOTIF garde l'accent d'origine. */
    const pd9=cosmSur('peinture'),pe9=!!pd9&&pd9.id!=='usine'&&!pd9.mot,pa9=pe9?new THREE.Color(pd9.c!=null?pd9.c:pd9.grad[0]):null,RU=pe9?K.rust.clone():K.rust;
    if(pe9){aV.color.copy(pa9).multiplyScalar(.8);aV.emissive.copy(aV.color);RU.color.copy(pa9).multiplyScalar(.5);}
    const U=(w,h,d,m,x,y,z,o)=>{const ms=new THREE.Mesh(boiteUsee(w,h,d,Object.assign({yc:y},o)),m);ms.position.set(x,y,z);return K.add(ms);};
    /* (2026-10-20, LE RELIEF) de VRAIS COUPS dans la grande caisse (voir boiteUsee `creux`) : la portière gauche enfoncée, l'aile avant
       droite froissée en deux plis, le coin arrière droit cabossé — chacun loin des plaques de rouille et des lignes de portières */
    U(W,H*.62,L,bV,0,y0+H*.31,0,{seed:1,dent:.007,rouille:.10,cellC:.14,creux:[
      {s:-1,y:.01,z:-.20,ry:.22,rz:.42,p:.08},
      {s:1,y:.05,z:1.42,ry:.20,rz:.28,p:.055},{s:1,y:-.06,z:1.70,ry:.16,rz:.20,p:.04},
      {s:1,y:.02,z:-1.52,ry:.20,rz:.32,p:.05}]}).rotation.z=.03;
    U(W*.94,H*.272,L*.34,bV,0,y0+H*.64,L*.30,{seed:2,dent:.012,rouille:.08,cell:.3}).rotation.set(.16,0,-.06); // le capot froissé (×,8 de haut, comme avant)
    U(W*.94,H*.36,L*.26,bV,0,y0+H*.65,-L*.34,{seed:3,dent:.008,rouille:.16,cell:.3}).rotation.x=-.09;
    /* (2026-10-15, Léo : « un plafond moins buggé : l'orange se mélange bizarrement à la vitre », puis, la v456 vue : « remets le plafond
       comme avant » — « le toit d'avant, mais posé dessus ») LE TOIT D'AVANT, POSÉ SUR LA VITRE. Le dessus de la boîte de verre était à la
       hauteur du MILIEU de la dalle du toit, et les deux penchaient en sens contraire (−,04 / +,09) : le toit s'enfonçait d'un côté dans
       le verre, le verre le perçait de l'autre. La v456 l'avait remplacé par un grand toit patiné qui couvrait la vitre ; c'est de nouveau
       la petite dalle d'origine (lisse, l'accent, sa pente de ,09), POSÉE À PLAT sur la vitre : c'est le dessus du verre qui prend la pente
       du toit (ses côtés restent ceux d'avant, la cabine s'écrase de 10 cm d'un côté — une épave), et la dalle repose dessus à 1 mm.
       Plus aucune face ne se bat, et elle ne flotte pas (posée sur un seul bord, elle avait l'air de planer). */
    const RT=-.04,RR=.09,gl=B(W*.78,H*.62,L*.40,K.glass,0,y0+H*.93,-L*.05);gl.rotation.z=RT;
    {const pa=gl.geometry.attributes.position,k=Math.tan(RR-RT);for(let i=0;i<pa.count;i++)if(pa.getY(i)>0)pa.setY(i,pa.getY(i)+k*pa.getX(i)); // le dessus du verre, cisaillé
     pa.needsUpdate=true;gl.geometry.computeVertexNormals();gl.geometry.computeBoundingBox();gl.geometry.computeBoundingSphere();
     const t=H*.06,hT=H*.31,c=t/2+.001;
     /* (2026-10-21, Léo : « le toit de LA HONTE avec un peu de taches comme le reste de la voiture, pas trop ») la dalle du toit devient une
       BOÎTE USÉE comme les tôles (mêmes plaques de rouille, mêmes arêtes usées), un peu moins chargée ; même taille (H×,10 × ,6 = H×,06 de haut) */
     U(W*.72,H*.06,L*.34,aV,-hT*Math.sin(RT)-c*Math.sin(RR),gl.position.y+hT*Math.cos(RT)+c*Math.cos(RR),-L*.05,{seed:9,rouille:.30,cell:.22,c:.008}).rotation.z=RR;}
    for(const sd of [-1,1]){
      const mir=B(.09,.09,.16,sd<0?RU:K.acc,sd*(W/2+.10),y0+H*.95,L*.12);if(sd<0)mir.rotation.z=-.9;
      U(.08,H*.25,L*.62,aV,sd*(W/2+.02),y0+H*.12,0,{seed:5+sd,rouille:.22,c:.012});
    }
    B(W*.55,H*.2,.07,K.dark,0,y0+H*.42,L/2+.10);
    for(const fz of [1,-1]){const bp=B(W*1.02,H*.24,.18,K.dark,0,y0+H*.15,fz*(L/2+.06));
      if(fz<0){bp.rotation.z=.14;bp.position.y-=.08;}}
    for(const sp of [[.30,.50,.35,.50,.30],[-.42,.45,-.10,.40,.50],[.10,.68,-.42,.60,.25],[-.25,.30,.42,.35,.40]])
      B(W*sp[3],H*sp[4],.05,RU,sp[0]*W,y0+H*sp[1],sp[2]*L+(sp[2]>0?.03:-.03)); // plaques de rouille
    B(.04,H*.40,L*.35,RU,W/2+.05,y0+H*.45,L*.10);
    return {doors:1,rouesEpave:1}; // (2026-10-15) ses roues au kit (voir roueEpave), sans perdre ses phares, ses pots ni ses portières (ce que `lpw` retirerait)
  },
  /* ============================================================================================
     LES CINQ — des voitures VRAIES, que l'argent a rendues célèbres, chacune réduite à ce qui la
     fait reconnaître à 200 m : l'aileron du Cadillac 59, la roue de secours du G, la calandre
     temple de la Rolls, le plateau de la F40, le coin de la Countach. Les noms restent sans marque.
     Modelées au KIT LOW-POLY (`lpKit`) : un loft à facettes pour la coque, des pièces pour le reste.
     Repère : nez en +Z, conducteur à GAUCHE (+X), y=0 au sol.
     ⚠ LE PASSAGE DE ROUE EST DANS LE LOFT : `LPU.arch` fait monter le bas de caisse aux stations de
     la roue. Il faut donc que ces stations EXISTENT dans `zs` — sans elles, l'arche passe entre deux
     sections et disparaît (le bas de caisse reste droit et mange le pneu).
     ⚠ un flanc doit toujours rester AU-DESSUS de l'arche (P2, P3 ≥ bas de caisse + marge) : sinon la
     section se recroise sur elle-même et la facette sort retournée.
     ========================================================================================== */
  // 2. ELDORADO — Cadillac Eldorado Biarritz 1959. Le plus long, le plus rose, deux lames d'aileron
  //    armées d'obus de feux, flancs blancs, et une vraie baignoire de cuir à ciel ouvert.
  eldorado(K){
    // (2026-10-13, Léo : « rends-les plus réalistes et ressemblantes ») v2 : les flancs GALBÉS (le bas rentre, l'arête de ceinture, le haut
    // qui s'arrondit), la face de 59 (quatre phares sous une VISIÈRE d'aile, calandre à deux étages piquée de BIJOUX, pare-chocs à OBUS qui
    // s'enroule), le pare-brise PANORAMIQUE qui tourne aux coins, des ailerons plus épais à la base, le jonc et le skeg chromés.
    /* (2026-10-17, Sacha : « tu prends la voiture Eldorado et tu essayes de lui rajouter des détails… sans folie, sans trop de ressources »)
       v3, LES DÉTAILS DE LA BIARRITZ 59 (photos de Wikimedia Commons). La silhouette ne bouge pas (seul le nez s'élargit de 5 cm, comme la vraie :
       les phares au coin des ailes). VU : la calandre de face, celle de la poupe, les cerclages des phares étaient posés 2 cm DERRIÈRE le bouchon du
       loft (z ±2,90) — invisibles, on ne voyait que six traits sur du rose. Ils sont sortis de la tôle. Ajouts : les OBUS POINTUS dans leur bague
       chromée au bout des ailerons, la calandre ARRIÈRE à bijoux, les NACELLES rondes des feux de recul aux coins du pare-chocs, le second étage
       de calandre dans le pare-chocs avant et ses feux de position orange, la mascotte en flèche, les joints des portières (un fil SUR la peau du
       loft, relu à la section), et l'habitacle qu'on voit d'en haut : moquette, deux baquets capitonnés à dossier chromé et leur console, banquette
       capitonnée à accoudoir, planche de bord chromée à deux cadrans, volant incliné à jante chromée, essuie-glaces, rétroviseur intérieur.
       ⚠ Les longs joncs de flanc et le skeg restent RETIRÉS (Léo, 13/10 : « ne plus en reposer sans qu'il le demande »).
       COÛT : mêmes matières (aucun appel de dessin, aucun programme de plus — les clés neuves G, t, q, O sont dans les familles g, m, s, l déjà
       posées) ; les bijoux sont des POINTES à quatre facettes (4 triangles au lieu des 12 d'une boîte), plis et joints des PLAQUES (2 triangles).
       ⚠ Les nacelles de la poupe sont des tubes posés par `put` (sans relevé) : un `cyl` couché sous 60 cm près de la poupe serait pris pour un pot
       et effacé par echRetire. */
    const U=LPU,R=.40,ZF=1.70,ZR=-1.62;
    const P=K.kit(fentePal({p:{g:'p',c:0xff6fae},c:{g:'c',c:0xe9ecf0},k:{g:'m',c:0x17171c},s:{g:'s',c:0xf6efe3,f:0},
      S:{g:'s',c:0xe6dfcf},g:{g:'g',c:0x6f9fbf},W:{g:'l',c:0xfff3cf},L:{g:'l',c:0xff2236},
      G:{g:'g',c:0x0b0c10},t:{g:'m',c:0x3b1530},q:{g:'s',c:0xd9c9ae},O:{g:'l',c:0xffa43a}}));   // (19/10) fentePal : 'J' la fente, 'Jf' son fil · (17/10) G fond de calandre laqué noir · t moquette prune (la laque rose sous le soleil l'aurait avalée) · q plis du cuir · O feux de position
    const AR=[[0,2*R+.04],[R*.55,2*R],[R*.95,R*1.30],[R+.12,.30]];         // arche HEXAGONALE
    const zs=[-2.90,-2.80,-2.62,-1.36,-1.30,-.40,.44,.50,1.2,2.40,2.62,2.80,2.90];
    for(const w of [ZF,ZR])for(const d of [R*.55,R*.95,R+.12])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const tub=z=>z>-1.33&&z<.47;                                             // la baignoire de l'habitacle
    const xW=z=>U.lin([[-2.90,.86],[-2.80,.97],[-2.62,1.00],[2.62,1.00],[2.80,.98],[2.90,.93]],z),   // (17/10) le nez à ,93 (il était à ,88 : les phares débordaient dans le vide)
          yL=z=>U.lin([[-2.90,.88],[-2.62,.93],[1.10,.93],[2.40,.90],[2.90,.84]],z);
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.30),xw=xW(z),yl=yL(z),yc=Math.max(.66,yb+.06);  // yc : l'arête de ceinture (le galbe)
      const s=[[0,yb],[xw-.12,yb],[xw-.03,Math.max(.52,yb+.04)],[xw,yc],[xw-.008,yl-.08],[xw-.035,yl-.015],[xw-.07,yl]];
      if(tub(z))s.push([xw-.17,.66],[0,.64]);                                // on CREUSE : le loft descend dans l'habitacle
      else s.push([xw-.30,yl+.02],[0,yl+.035]);
      return s;
    },(j,z)=>{
      if(j===0)return 'k';
      if(j>=6&&(tub(z)||(z>-1.36&&z<.50)))return j===7?(z>.44?'p':z>-1.30?'t':'s'):'s';   // parois de cuir, planche de bord rose, (17/10) plancher en MOQUETTE
      return 'p';});
    const tube=(k,rAr,rAv,len,n,x,y,z)=>{const g=new THREE.CylinderGeometry(rAv,rAr,len,n);g.rotateX(Math.PI/2);P.put(k,g,x,y,z);}; // un tube dans l'axe, SANS relevé de pot
    const quad=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};
    const bijou=(x,y,z,s,d)=>{const h=s/2,o=[x,y,z+d*s*.75],A=[x-h,y-h,z],B=[x+h,y-h,z],C=[x+h,y+h,z],D=[x-h,y+h,z];   // une POINTE à quatre facettes : chacune prend SA lumière
      P.tri('c',A,B,o);P.tri('c',B,C,o);P.tri('c',C,D,o);P.tri('c',D,A,o);};
    // LES AILERONS : une lame qui naît au milieu de la portière et file jusqu'à la poupe — épaisse à la base, fine au sommet — et ses obus
    P.sym(sd=>{
      P.prism('p',[[-.45,.92],[-2.94,1.40],[-2.86,.92]],.07,sd*.955);
      P.prism('p',[[-.90,.92],[-2.90,1.16],[-2.86,.92]],.16,sd*.90);
      // (17/10) LES OBUS POINTUS : une bague chromée au ras du bord de fuite, la lentille, la pointe ; une lame chromée suit le bord entre les deux
      for(const y of [1.05,1.19]){const e=-2.86-(y-.92)/.48*.08;            // e : le bord de fuite de l'aileron à cette hauteur
        P.cyl('c',.058,.06,10,sd*.955,y,e,'z',.066);P.lathe('L',[[.05,0],[.05,-.03],[.044,-.075],[.03,-.115],[.012,-.14],[0,-.148]],10,sd*.955,y,e-.03,'z');}   // (19/10) l'OBUS en balle (deux disques et un cône avant)
      P.box('c',.08,.30,.03,sd*.955,1.12,-2.893,-.165,0,0);
      // (13/10, Léo : « les barres chelou ») le SKEG chromé RETIRÉ
    });
    // LE PARE-CHOCS À OBUS, qui s'enroule sur les ailes — (17/10) et dans ses coins, les FEUX DE POSITION ronds
    const BPC=(a,b,S9)=>bulleOutils.tube(P,'c',[a,b],S9,true);   // (19/10, l'affinement) les pare-chocs en barres CHANFREINÉES (des boîtes à angles droits)
    BPC([-.90,.42,2.94],[.90,.42,2.94],[[0.12,-0.065],[0.12,0.065],[0.085,0.1],[-0.085,0.1],[-0.12,0.065],[-0.12,-0.065],[-0.085,-0.1],[0.085,-0.1]]);BPC([-.85,.55,2.90],[.85,.55,2.90],[[0.09,-0.015],[0.09,0.015],[0.07,0.035],[-0.07,0.035],[-0.09,0.015],[-0.09,-0.015],[-0.07,-0.035],[0.07,-0.035]]);
    P.sym(sd=>{BPC([sd*.822,.42,2.878],[sd*1.078,.42,2.722],[[0.11,-0.065],[0.11,0.065],[0.075,0.1],[-0.075,0.1],[-0.11,0.065],[-0.11,-0.065],[-0.075,-0.1],[0.075,-0.1]]);
      P.cyl('c',.085,.20,12,sd*.46,.37,3.10,'z',.035);P.cyl('c',.06,.05,10,sd*.46,.37,2.98,'z');   // les OBUS
      tube('c',.085,.08,.05,12,sd*.74,.41,3.075);P.cyl('O',.055,.02,10,sd*.74,.41,3.10,'z');});
    // LA CALANDRE à deux étages, piquée de bijoux — (17/10) SORTIE de la tôle : l'étage haut entre les phares, l'étage bas dans le pare-chocs
    P.box('G',1.00,.20,.03,0,.70,2.915);
    for(const y of [.805,.595])P.box('c',1.04,.024,.035,0,y,2.922);
    for(let i=0;i<13;i++)for(let r=0;r<3;r++)bijou((i/12-.5)*.90,.645+r*.055,2.93,.036,1);
    P.box('G',.70,.09,.02,0,.43,3.065);
    for(let i=0;i<8;i++)bijou((i/7-.5)*.60,.43,3.075,.036,1);
    // QUATRE PHARES sous une VISIÈRE d'aile — (17/10) le cerclage chromé SORTI de la tôle, la visière plus profonde
    P.sym(sd=>{P.box('p',.54,.07,.30,sd*.74,.86,2.80);P.box('c',.50,.20,.03,sd*.75,.75,2.915);
      for(const x of [.62,.86]){P.lathe('c',[[.097,-.01],[.098,.012],[.09,.024],[.078,.026]],16,sd*x,.75,2.93,'z');P.lathe('W',[[.078,.026],[.064,.034],[.04,.04],[0,.043]],16,sd*x,.75,2.93,'z');}   // (19/10) le cerclage BISEAUTÉ, le verre bombé (des disques plats à 12 pans)
      P.cyl('c',.055,.14,8,sd*.44,.43,-3.06,'z');                           // les pots, à travers le pare-chocs
      // (13/10) le jonc chromé de flanc RETIRÉ
      P.cyl('c',.009,.07,6,sd*.985,.975,.40,'y');P.lathe('c',[[0,.018],[.044,.018],[.05,.008],[.05,-.006],[.044,-.014],[0,-.014]],12,sd*.99,1.035,.40,'z');P.cyl('g',.04,.004,12,sd*.99,1.035,.384,'z');   // (19/10) le rétro : une TÊTE RONDE chromée sur sa tige, sa glace (un cube chromé avant)
      P.box('c',.02,.03,.14,sd*1.005,.82,-.56);                               // poignée — (17/10) au bout de la portière
    });
    // (17/10) LA CALANDRE DE LA POUPE à bijoux, entre les ailerons (elle était cachée dans la tôle), et les NACELLES des feux de recul
    P.box('G',1.24,.20,.03,0,.66,-2.915);
    for(const y of [.765,.555])P.box('c',1.28,.022,.035,0,y,-2.922);
    for(let i=0;i<13;i++)for(let r=0;r<3;r++)bijou((i/12-.5)*1.12,.60+r*.06,-2.93,.036,-1);
    BPC([-.90,.42,-2.94],[.90,.42,-2.94],[[0.12,-0.065],[0.12,0.065],[0.085,0.1],[-0.085,0.1],[-0.12,0.065],[-0.12,-0.065],[-0.085,-0.1],[0.085,-0.1]]);
    P.sym(sd=>{BPC([sd*.822,.42,-2.878],[sd*1.078,.42,-2.722],[[0.11,-0.065],[0.11,0.065],[0.075,0.1],[-0.075,0.1],[-0.11,0.065],[-0.11,-0.065],[-0.075,-0.1],[0.075,-0.1]]);
      tube('c',.125,.112,.08,12,sd*.88,.51,-3.06);tube('G',.092,.092,.02,12,sd*.88,.51,-3.095);tube('W',.042,.042,.02,8,sd*.88,.51,-3.10);});
    P.prism('c',[[2.72,.90],[2.44,.926],[2.47,.985],[2.62,.932]],.026,0);    // la mascotte — (17/10) une flèche couchée qui file
    // (17/10) LES JOINTS DES PORTIÈRES : un fil sombre posé SUR la peau, relu à la section du loft (jamais à un x constant), 4 mm dehors
    const peau=z=>{const xw=xW(z),yl=yL(z);return [[xw-.087,.38],[xw-.03,.52],[xw,.66],[xw-.008,yl-.08],[xw-.035,yl-.015],[xw-.07,yl]];};
    for(const zf of [.52,-.68]){const pts=peau(zf);
      P.sym(sd=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/l*.004,ny=-(b[0]-a[0])/l*.004;
        quad('J',[sd*(a[0]+nx),a[1]+ny,zf-.004],[sd*(b[0]+nx),b[1]+ny,zf-.004],[sd*(b[0]+nx),b[1]+ny,zf+.003],[sd*(a[0]+nx),a[1]+ny,zf+.003]);   // (19/10) LA FENTE (la peinture × ,5), 7 mm
        quad('Jf',[sd*(a[0]+nx),a[1]+ny,zf+.003],[sd*(b[0]+nx),b[1]+ny,zf+.003],[sd*(b[0]+nx),b[1]+ny,zf+.006],[sd*(a[0]+nx),a[1]+ny,zf+.006]);}});}   // et son FIL clair, 3 mm, du côté avant
    // le pare-brise PANORAMIQUE : la vitre de face et ses deux coins qui tournent, cadre chromé — (17/10) essuie-glaces, rétroviseur intérieur
    P.box('g',1.40,.38,.03,0,1.12,.58,-.30);
    P.sym(sd=>{P.box('g',.30,.36,.03,sd*.80,1.11,.44,-.20,sd*1.15,0);bulleOutils.tube(P,'c',[[sd*.90,1.10-.209,.30+.017],[sd*.90,1.10+.209,.30-.017]],[[.024,0],[.017,.017],[0,.024],[-.017,.017],[-.024,0],[-.017,-.017],[0,-.024],[.017,-.017]],true);   // (19/10) le montant : un TUBE chromé (une barre carrée)
      P.box('k',.40,.012,.012,sd*.28,.985,.645,-.30,0,sd*.10);});
    P.box('c',1.50,.04,.05,0,1.31,.52,-.30);
    P.box('c',.16,.05,.025,0,1.255,.50,-.30);
    // (17/10) LES SIÈGES CAPITONNÉS : deux baquets à dossier chromé et leur console, la banquette et son accoudoir ; les plis, des bandes de cuir plus foncé
    const pliA=(x,y,z,w,l)=>quad('q',[x-w/2,y,z-l/2],[x+w/2,y,z-l/2],[x+w/2,y,z+l/2],[x-w/2,y,z+l/2]),               // sur une assise
          pliD=(x,y,z,w,h,a)=>{const cy=Math.cos(a)*h/2,cz=Math.sin(a)*h/2;quad('q',[x-w/2,y-cy,z-cz],[x+w/2,y-cy,z-cz],[x+w/2,y+cy,z+cz],[x-w/2,y+cy,z+cz]);}; // sur un dossier penché de a
    for(const sd of [1,-1]){const x=sd*.40;
      P.box('s',.64,.12,.44,x,.72,-.10);P.box('s',.64,.46,.13,x,.87,-.32,-.14,0,0);
      for(let i=0;i<5;i++){const xi=x+(i/4-.5)*.48;pliA(xi,.782,-.10,.04,.40);pliD(xi,.880,-.247,.04,.40,-.14);}
      P.box('c',.64,.024,.14,x,1.112,-.354,-.14,0,0);}
    P.box('S',.14,.16,.48,0,.73,-.10);P.box('c',.14,.012,.40,0,.815,-.10);
    P.box('s',1.56,.12,.44,0,.72,-1.02);P.box('s',1.56,.42,.13,0,.85,-1.24,-.14,0,0);
    for(let i=0;i<9;i++){const xi=(i/8-.5)*1.40;if(Math.abs(xi)<.1)continue;pliA(xi,.782,-1.02,.04,.40);pliD(xi,.860,-1.167,.04,.36,-.14);}
    P.box('S',.16,.07,.40,0,.815,-1.02);
    P.box('S',1.70,.10,.30,0,.98,-1.48);                                     // la capote repliée
    // (17/10) LE POSTE DE CONDUITE : volant incliné vers le conducteur (jante, cerclage chromé, branches, colonne), bloc de deux cadrans, jonc de planche
    for(const [k,g] of [['k',new THREE.TorusGeometry(.16,.016,5,12)],['c',new THREE.TorusGeometry(.095,.006,3,10)],['c',new THREE.BoxGeometry(.31,.02,.012)]])P.put(k,g,.36,.99,.28,-.55,0,0);
    P.put('c',new THREE.BoxGeometry(.02,.15,.012),.36,.926,.319,-.55,0,0);
    P.box('k',.035,.035,.22,.36,.935,.36,.60,0,0);
    P.box('k',.44,.10,.04,.36,.92,.475);for(const x of [.27,.45])P.cyl('W',.028,.01,8,x,.92,.453,'z');
    P.box('c',1.50,.025,.025,0,.85,.468);
    K.commit(P);
    /* (19/10, l'affinement) L'ENJOLIVEUR « SABRE » de la 59 (un dôme lisse) : la bande blanche du pneu, la cuvette chromée et ses VINGT ailettes
       rayonnantes, le moyeu à cône et son centre d'or */
    const JW9=.26,hw9=JW9/2,fx9=hw9-.03,J9=lpKit({k:{g:'m',c:0x16171a},w:{g:'s',c:0xf4f1ea},c:{g:'c',c:0xe9ecf0},s:{g:'c',c:0xc9ced6},d:{g:'m',c:0x1b1c21},o:{g:'o',c:0xffc24a}});
    J9.lathe('k',[[R*.64,-hw9],[R*.88,-hw9],[R,-hw9*.55],[R,hw9*.55],[R*.88,hw9],[R*.64,hw9]],16,0,0,0,'x');
    J9.lathe('w',[[R*.66,hw9+.004],[R*.86,hw9+.004]],16,0,0,0,'x');
    J9.lathe('d',[[R*.64,-hw9+.02],[R*.64,fx9-.05],[0,fx9-.05]],16,0,0,0,'x');
    J9.lathe('c',[[R*.65,fx9-.004],[R*.62,fx9+.012],[R*.52,fx9+.006],[R*.30,fx9+.02],[R*.16,fx9+.04]],20,0,0,0,'x');   // la cuvette
    for(let i=0;i<20;i++){const a=i/20*Math.PI*2,rr=R*.41;J9.box('s',.012,R*.22,.012,fx9+.016,Math.cos(a)*rr,Math.sin(a)*rr,a-Math.PI/2,0,0);}   // les ailettes
    J9.lathe('c',[[R*.16,fx9+.04],[R*.10,fx9+.06],[R*.05,fx9+.068]],14,0,0,0,'x');J9.lathe('o',[[R*.05,fx9+.068],[0,fx9+.07]],10,0,0,0,'x');
    const JE=J9.done();
    return {hl:[.74,.75,2.90],tl:[.955,1.12,-2.96],wx:.83,wzF:ZF,wzR:-ZR,
            roueDeco:w=>{for(const g in JE)if(JE[g]){const m=new THREE.Mesh(JE[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
            lpw:{R:R,w:.26,style:'nyan',jante:0xe9ecf0}};
  },
  // 3. LE CAÏD — Mercedes G63. Un cube de trois tonnes : passages CARRÉS élargis, clignotants posés
  //    sur les ailes, charnières apparentes, calandre à barreaux, roue de secours sur la porte.
  caid(K){
    // (2026-10-13, Léo : « plus réalistes et ressemblantes ») v2 : une G, c'est presque TOUT habitacle — le capot raccourci (pare-brise
    // à 55 cm derrière l'essieu avant, presque droit), les ÉLARGISSEURS noirs sur les quatre roues, la BAGUETTE de protection à hauteur
    // d'arche, une calandre plus étroite ENTRE les phares, le bouclier à grandes prises d'air.
    const U=LPU,R=.47,ZF=1.47,ZR=-1.42;
    const P=K.kit({p:{g:'p',c:0x86f51c},k:{g:'m',c:0x16171b},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe9ecf0},
      g:{g:'g',c:0x1a2a3c},W:{g:'l',c:0xfff4d8},L:{g:'l',c:0xff2030},O:{g:'l',c:0xffa21a},
      r:{g:'l',c:0x9a0f1a},R:{g:'l',c:0x7a1018},w:{g:'l',c:0xd9dce0},m:{g:'m',c:0x2a2c31}}); // (17/10, l'arrière v2) r, R, w (la plaque éclairée), m — aucune famille de plus
    const AR=[[0,2*R+.06],[R*.92,2*R+.06],[R+.10,.48]];                     // arche CARRÉE
    const zs=[-2.26,-2.12,-1.66,-1.52,-.62,-.48,.78,.86,.98,2.18,2.30];
    for(const w of [ZF,ZR])for(const d of [R*.92,R+.10,R+.24])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const cab=z=>z<.92,flare=z=>Math.min(Math.abs(z-ZF),Math.abs(z-ZR))<R+.17;
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.48),xw=flare(z)?.99:.95,ht=z>2.18?1.16:1.21;
      const s=[[0,yb],[xw-.06,yb],[xw,yb+.06],[xw,1.13],[xw-.04,1.17]];
      if(cab(z))s.push([.86,1.86],[0,1.92]);else s.push([xw-.08,ht-.02],[0,ht]);
      return s;
    },(j,z)=>{
      if(j<=1)return j===0?'k':'p';
      if(j===4&&cab(z))                                                      // vitres entre montants A B C D
        return (z>.78||(z>-.62&&z<-.48)||(z>-1.66&&z<-1.52)||z<-2.12)?'p':'g';
      if(j===5&&z>.86&&z<.98)return 'g';                                      // pare-brise presque droit
      return 'p';});
    P.sym(sd=>P.box('p',.05,.05,3.08,sd*.875,1.85,-.67));                     // gouttière de pavillon
    // les ÉLARGISSEURS noirs : un bandeau qui épouse l'arche carrée
    const elarg=(sd,zc)=>{const h=2*R+.10,d=R*.92+.06;
      P.box('k',.10,.07,2*d,sd*1.02,h,zc);
      for(const e of [1,-1])P.box('k',.10,h-.50,.08,sd*1.02,(h+.50)/2,zc+e*(d+.03),0,0,0);};
    P.sym(sd=>{elarg(sd,ZF);elarg(sd,ZR);
      for(const [z0,z1] of [[ZF-R-.18,ZR+R+.18]])P.box('k',.03,.07,z0-z1,sd*.965,1.06,(z0+z1)/2);   // la BAGUETTE entre les arches
    });
    // la face : bouclier à prises d'air, calandre ENTRE les phares, phares RONDS, antibrouillards
    P.box('k',1.96,.28,.22,0,.53,2.38);P.box('k',1.96,.24,.18,0,.51,-2.34);
    for(const x of [-.55,0,.55])P.box('K',x?.36:.52,.14,.03,x,.52,2.495);
    P.box('K',.82,.40,.03,0,.88,2.315);
    for(let i=0;i<9;i++)P.box('c',.025,.36,.03,(i/8-.5)*.74,.88,2.33);
    P.box('c',.86,.03,.035,0,1.09,2.33);P.box('c',.86,.03,.035,0,.67,2.33);
    P.sym(sd=>{
      P.cyl('c',.16,.05,14,sd*.73,.90,2.31,'z');P.cyl('W',.11,.06,14,sd*.73,.90,2.33,'z');P.lathe('W',[[.135,0],[.15,0]],16,sd*.73,.90,2.345,'z');
      P.box('W',.14,.07,.03,sd*.68,.51,2.495);
      P.box('O',.12,.07,.14,sd*.82,1.225,2.12);                              // clignotants SUR les ailes
      /* (17/10, l'arrière v2) LE FEU EN COLONNE dans sa coque noire qui dépasse : rouge en haut (strié), clignotant, recul, cerclé de chrome */
      P.box('K',.19,.47,.06,sd*.84,.93,-2.285);
      P.box('L',.14,.21,.012,sd*.84,1.04,-2.318);for(const y of [.98,1.02,1.06,1.10])P.box('r',.14,.014,.006,sd*.84,y,-2.326);
      P.box('O',.14,.08,.012,sd*.84,.875,-2.318);P.box('W',.14,.06,.012,sd*.84,.795,-2.318);P.box('L',.14,.04,.012,sd*.84,.735,-2.318);
      for(const y of [.696,1.164])P.box('c',.19,.014,.012,sd*.84,y,-2.318);for(const x of [.745,.935])P.box('c',.014,.47,.012,sd*x,.93,-2.318);
      P.box('K',.10,.27,.25,sd*.95,.51,-2.33);                                // la protection d'angle du pare-chocs
      P.box('R',.10,.03,.012,sd*.70,.585,-2.436);                              // les catadioptres
      P.box('p',.20,.16,.12,sd*1.03,1.36,.80);P.box('k',.10,.04,.05,sd*.96,1.30,.80); // rétro + bras
      for(const z of [.70,-.40])for(const y of [.70,1.02])P.box('c',.03,.07,.08,sd*.965,y,z); // CHARNIÈRES
      for(const z of [.20,-.90])P.box('c',.03,.03,.14,sd*.965,1.06,z);        // poignées
      P.box('k',.16,.06,1.86,sd*.96,.46,-.10);                                 // marchepied
      for(const z of [-.86,-.98])P.cyl('c',.05,.10,8,sd*1.00,.44,z,'x');       // sorties latérales
      P.cyl('c',.05,.14,8,sd*.44,.43,-2.42,'z');                              // pots arrière (ancre de la plume)
    });
    P.box('p',.72,.05,1.00,0,1.235,1.60);                                     // bossage de capot
    P.box('g',1.40,.50,.02,0,1.52,-2.27);                                     // lunette
    P.box('k',1.60,.05,.02,0,1.19,-2.27);
    // LA ROUE DE SECOURS sur la porte arrière — LE signe du G
    P.lathe('k',[[.26,-.13],[.36,-.13],[.41,-.06],[.41,.06],[.36,.13],[.26,.13]],14,0,1.06,-2.42,'z');
    P.lathe('p',[[.32,-.12],[.30,-.14],[0,-.15]],14,0,1.06,-2.42,'z');
    P.cyl('c',.08,.04,8,0,1.06,-2.57,'z');
    /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un mur plat,
       deux pavés rouges et un pare-chocs en boîte ; seule la roue de secours tenait la poupe. Désormais les feux en COLONNE dans leurs coques
       (plus haut, dans le P.sym), et ici : le JOINT de la porte arrière, ses deux CHARNIÈRES et sa poignée, la HOUSSE de la roue cerclée de
       chrome, le 3e feu stop sous le pavillon, la PLAQUE et l'ANNEAU DE REMORQUAGE dans le pare-chocs, le marchepied strié. Les pots latéraux
       de Léo (ECH_POTS.caid) n'ont pas bougé. */
    P.box('k',1.47,.014,.012,0,.70,-2.266);P.box('k',1.47,.014,.012,0,1.70,-2.266);P.sym(sd=>P.box('k',.014,1.0,.012,sd*.735,1.20,-2.266)); // le joint de porte
    for(const y of [.86,1.50]){P.box('c',.06,.11,.05,-.72,y,-2.29);P.box('k',.03,.13,.03,-.72,y,-2.272);} // les charnières (à droite vue de derrière, comme la G : x < 0)
    P.box('k',.20,.06,.02,.58,1.12,-2.272);P.box('c',.15,.03,.03,.58,1.12,-2.29);                      // la poignée
    P.put('c',new THREE.TorusGeometry(1,.07,4,28),0,1.06,-2.556,0,0,0,.335,.335,.4);                    // le cerclage chromé de la housse
    P.box('L',.36,.03,.02,0,1.83,-2.272);                                                              // le 3e feu stop
    P.box('K',.46,.14,.012,0,.50,-2.436);P.box('w',.40,.10,.012,0,.50,-2.443);                         // la plaque
    P.box('m',.62,.03,.10,0,.645,-2.38);for(let i=0;i<4;i++)P.box('k',.60,.014,.012,0,.662,-2.35-i*.024); // le marchepied strié
    P.put('c',new THREE.TorusGeometry(1,.28,4,10),.48,.36,-2.44,0,Math.PI/2,0,.05,.05,.05);              // l'anneau de remorquage
    K.commit(P);
    return {hl:[.73,.90,2.36],tl:[.84,.92,-2.32],wx:.84,wzF:ZF,wzR:-ZR,
            lpw:{R:R,w:.32,style:'rayons',n:6,accent:0x1d1f24,crampons:1}};
  },
  // 4. SA MAJESTÉ — Rolls-Royce Phantom. Haute, longue, bicolore, un liseré d'or ; la calandre
  //    temple dépasse du nez, la dame ailée se tient dessus, et le capot porte son arête d'inox.
  // 5. ROSSO 40 — Ferrari F40. Rouge course, ailes qui bombent au-dessus des roues, Lexan à
  //    persiennes, NACA sur le capot, et l'aileron plateau qui NAÎT des ailes arrière.
  rosso(K){
    /* (13/10, « plus ressemblante ») la coque est ROUGE jusqu'au seuil (la moitié basse était noire : elle paraissait longue et plate),
       elle rentre sous la taille, et ses hanches se gonflent au-dessus des roues arrière. */
    const U=LPU,R=.37,ZF=1.30,ZR=-1.16;
    const P=K.kit(fentePal({p:{g:'p',c:0x871921},r:{g:'p',c:0x68161d},k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},
      c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},
      Q:{g:'l',c:0x8a0c18},w:{g:'l',c:0xd9dce0}})); // (17/10, l'arrière v2) Q le cœur des feux, w la plaque éclairée — aucune famille de plus · (19/10) + la FENTE (J, Jf)
    const AR=[[0,2*R+.03],[R*.60,2*R-.02],[R*.98,R*1.10],[R+.12,.26]];
    const zs=[-2.20,-1.95,-.70,-.52,-.36,.10,.60,.74,1.95,2.18];
    for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.12])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const yC=z=>U.lin([[-2.20,.96],[-1.95,.96],[-.70,1.06],[-.52,1.12],[.10,1.09],[.74,.80],[1.00,.76],[1.95,.56],[2.18,.44]],z),
          cab=z=>z>-.71&&z<.75;
    P.loft(zs,z=>{
      const yb=Math.max(U.arch(z,[ZF,ZR],AR,.26),U.lin([[-2.20,.32],[-2.00,.26],[1.95,.26],[2.18,.30]],z)),xw=U.lin([[-2.20,.94],[-1.90,.99],[ZR,1.00],[-.50,.97],[.40,.96],[1.40,.98],[1.95,.92],[2.18,.78]],z),
            yB=Math.max(U.lin([[-2.20,.94],[-1.95,.96],[-.80,.92],[-.30,.80],[.74,.78],[1.30,.74],[1.95,.58],[2.18,.46]],z),yb+.10),
            c=yC(z);
      const p3=[xw-.02,yB],p4=cab(z)?[xw-.22,yB+.04]:[xw-.10,yB+.01];
      const p5=cab(z)?[U.lin([[-.70,.60],[-.52,.56],[.10,.58],[.74,.72]],z),c-.02]:[.45,Math.max(p4[1]+.002,c-.01)];
      return [[0,yb],[xw-.09,yb],[xw-.025,Math.max(.36,yb+.04)],[xw,Math.max(.54,yb+.07)],p3,p4,p5,[0,c]];
    },(j,z)=>{
      if(j===0)return 'k';
      if(j===5&&cab(z))return (z>-.36&&z<.60)?'g':'p';                       // vitre latérale, arc-boutant
      if(j===6&&z>.10&&z<.74)return 'g';                                      // pare-brise
      if(j===6&&z>-1.86&&z<-.70)return 'g';                                   // le Lexan du capot moteur
      return 'p';});
    // L'AILERON PLATEAU, porté par des flasques qui prolongent les ailes
    const xw9=z=>U.lin([[-2.20,.94],[-1.90,.99],[ZR,1.00],[-.50,.97],[.40,.96],[1.40,.98],[1.95,.92],[2.18,.78]],z);
    P.box('p',1.96,.05,.30,0,1.18,-2.06);
    P.sym(sd=>P.prism('p',[[-1.80,.92],[-2.22,.92],[-2.22,1.22],[-1.95,1.22]],.06,sd*.93));
    for(let i=0;i<6;i++){const z=-.86-i*.17;P.box('K',1.04,.02,.05,0,yC(z)+.012,z);} // persiennes
    P.sym(sd=>{
      P.box('k',.16,.012,.30,sd*.25,yC(1.35)+.005,1.35,.21);                 // NACA de capot
      P.box('r',.30,.012,.22,sd*.66,yC(1.82)+.004,1.82,.21);                 // trappes de phares
      P.box('W',.30,.06,.03,sd*.62,.42,2.185);
      P.box('k',.02,.18,.36,sd*(xw9(-.57)+.002),.72,-.57);                                // prise d'air arrière
      P.box('k',.02,.06,.34,sd*(xw9(.12)+.002),.74,.12);P.box('J',.012,.006,1.40,sd*(xw9(0)-.02),.30,.07);P.box('Jf',.012,.003,1.40,sd*(xw9(0)-.02),.3045,.07);   // NACA de portière, le joint du seuil (affinement : la FENTE C, c'était un trait noir de 4 cm)                                 // NACA de portière
      P.box('p',.12,.08,.16,sd*.84,.95,.52);P.box('k',.10,.03,.04,sd*.77,.92,.52);
      for(const x of [.55,.76]){P.cyl('K',.088,.04,14,sd*x,.74,-2.225,'z');   // quatre feux ronds — (17/10, l'arrière v2) EN VOLUME : la cuvette
        P.lathe('L',[[.07,0],[.055,-.017],[0,-.024]],14,sd*x,.74,-2.245,'z');P.cyl('Q',.026,.01,8,sd*x,.74,-2.268,'z');} // le verre bombé, son cœur
      P.cyl('c',.05,.14,8,sd*.44,.43,-2.26,'z');
    });
    P.box('k',1.50,.12,.03,0,.33,2.185);                                      // bouche avant
    P.box('k',1.84,.46,.02,0,.66,-2.205);                                     // grille arrière
    /* L'ARRIÈRE v2 (2026-10-17, Sacha : « refais aussi l'arrière de : ROSSO 40, LE SAMOURAÏ, LA DAYTONA, LA FÉLINE, L'ICEBERG » — la revue des poupes, 2e tour) : le panneau noir et ses quatre feux ronds étaient fidèles mais peints à plat. Désormais
       la GRILLE EN LOSANGES sur tout le panneau (deux nappes de barres croisées à 45°, coupées au bord), les feux EN VOLUME (dans le P.sym),
       la PLAQUE au milieu de la grille, le DIFFUSEUR noir à ailettes où s'encastrent les trois sorties de Léo (ECH_POTS.rosso, inchangé). */
    {const X=.92,Y0=.43,Y1=.89,H=Y1-Y0;for(const sg of [1,-1])for(let x0=-X-H;x0<=X+H;x0+=.15){                // la grille en losanges
       const t0=Math.max(0,sg>0?(-X-x0)/H:(x0-X)/H),t1=Math.min(1,sg>0?(X-x0)/H:(x0+X)/H);if(t1-t0<.05)continue;
       const xa=x0+sg*H*t0,xb=x0+sg*H*t1,ya=Y0+H*t0,yb=Y0+H*t1;
       P.box('K',Math.hypot(xb-xa,yb-ya),.016,.008,(xa+xb)/2,(ya+yb)/2,-2.219,0,0,sg*Math.PI/4);}}
    P.box('K',.40,.13,.012,0,.60,-2.226);P.box('w',.36,.10,.012,0,.60,-2.233);                       // la plaque
    P.box('k',1.00,.16,.08,0,.40,-2.24);for(const x of [-.40,-.26,-.075,.075,.26,.40])P.box('K',.016,.15,.10,x,.40,-2.26); // le diffuseur, ses ailettes
    P.cyl('c',.05,.14,8,0,.43,-2.26,'z');                                     // la troisième sortie
    K.commit(P);
    return {hl:[.62,.42,2.20],tl:[.66,.74,-2.24],wx:.80,wzF:ZF,wzR:-ZR,
            lpw:{R:R,w:.30,style:'rayons',n:5,jante:0xc9ced6,accent:0xc9ced6,branches:1}};
  },
  // 6. POSTER 84 — Lamborghini Countach, celle du mur de ta chambre. Un coin, des passages de roue
  //    TRAPÉZOÏDAUX, les « oreilles » derrière les vitres, la NACA en biais dans la portière,
  //    l'aileron en V et les jantes « cadran de téléphone ».
  poster(K){
    const U=LPU,R=.36,ZF=1.14,ZR=-1.32;
    const P=K.kit({p:{g:'p',c:0xffc414},r:{g:'p',c:0xf29a00},k:{g:'m',c:0x131417},c:{g:'c',c:0xe9ecf0},
      g:{g:'g',c:0x18212c},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
    const AR=[[0,2*R+.05],[R*.58,2*R+.05],[R+.16,.28]];                     // arche TRAPÉZOÏDALE
    const zs=[-2.07,-1.98,-1.00,-.74,-.40,-.18,.50,.62,2.07];
    for(const w of [ZF,ZR])for(const d of [R*.58,R+.16])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const yC=z=>U.lin([[-2.07,.84],[-1.98,.90],[-1.00,1.00],[-.74,1.07],[-.18,1.07],[.62,.74],[1.10,.64],[2.07,.44]],z),
          cab=z=>z>-.75&&z<.63;
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.28),xw=U.lin([[-2.07,.96],[-1.90,1.00],[1.55,1.00],[2.07,.82]],z),
            yB=Math.max(U.lin([[-2.07,.84],[-1.98,.88],[-.74,.92],[.62,.72],[2.07,.44]],z),yb+.10),c=yC(z);
      const p4=cab(z)?[.80,yB+.02]:[xw-.08,yB+.005];
      const p5=cab(z)?[U.lin([[-.74,.56],[-.18,.56],[.62,.74]],z),c-.01]:[.50,Math.max(p4[1]+.002,c-.005)];
      return [[0,Math.min(yb,c-.08)],[xw-.06,yb],[xw,Math.max(.40,yb+.04)],[xw-.01,yB],p4,p5,[0,c]]; // (19/10, RONDES) au milieu, le plancher ne monte plus à l'arche : à l'essieu avant il passait 18 cm AU-DESSUS du capot (la tache noire devant le pare-brise)
    },(j,z)=>{
      if(j<=1)return 'k';
      if(j===4&&cab(z))return (z>-.40&&z<.50)?'g':'p';
      if(j===5&&z>-.18&&z<.62)return 'g';
      return 'p';});
    P.sym(sd=>{
      P.prism('p',[[-.62,.84],[-1.30,.84],[-1.30,.99],[-.70,1.05]],.30,sd*.78);  // LES OREILLES
      P.box('k',.26,.08,.02,sd*.78,.97,-.655,-.5);                              // leur bouche
      P.prism('k',[[-.25,.62],[-.85,.66],[-.85,.78],[-.25,.645]],.02,sd*1.001); // LA NACA, en biais — (19/10) en TRAPÈZE, pointue devant (une plaque rectangulaire)
      P.box('k',.98,.04,.30,sd*.49,1.16+.035,-1.88,0,0,sd*.07);                 // l'aileron en V…
      P.box('k',.05,.24,.12,sd*.30,1.03,-1.88);                                 // …sur deux mâts
      P.box('r',.30,.012,.30,sd*.62,yC(1.35)+.005,1.35,.10);                   // capots de phares
      P.box('W',.30,.05,.02,sd*.72,.40,2.075);P.box('O',.12,.05,.02,sd*.47,.40,2.075);
      P.box('L',.44,.10,.02,sd*.74,.68,-2.08);P.box('O',.14,.10,.02,sd*.46,.68,-2.08);
      for(const x of [.40,.49])P.cyl('c',.04,.14,8,sd*x,.40,-2.12,'z');        // quatre sorties
      P.box('p',.12,.07,.14,sd*.86,.86,.50);
    });
    for(let i=0;i<5;i++){const z=-1.15-i*.15;P.box('k',1.00,.015,.06,0,yC(z)+.01,z);} // persiennes du capot moteur
    P.box('k',1.60,.05,.10,0,.30,2.05);                                        // la lame avant
    P.box('k',1.90,.40,.02,0,.62,-2.075);                                      // poupe noire
    K.commit(P);
    /* (19/10, l'affinement) LA JANTE « TÉLÉPHONE » en relief (un disque plat et ses ronds noirs) : la lèvre, le VOILE creusé, cinq TROUS, le moyeu
       et ses écrous ; pneu à flancs ronds */
    const JW=.30,hw=JW/2,fx=hw-.03,J=lpKit({k:{g:'m',c:0x16171a},c:{g:'c',c:0xd4d8de},s:{g:'s',c:0xc6cad1},d:{g:'m',c:0x111215}});
    J.lathe('k',[[.235,-hw],[R*.86,-hw],[R*.97,-hw*.7],[R,-hw*.3],[R,hw*.3],[R*.97,hw*.7],[R*.86,hw],[.235,hw]],20,0,0,0,'x');
    J.lathe('c',[[.235,hw-.004],[.232,fx+.010],[.222,fx+.006]],24,0,0,0,'x');                          // la lèvre polie
    J.lathe('s',[[.222,fx+.006],[.20,fx-.006],[.13,fx-.016],[.075,fx-.008],[.06,fx+.004]],24,0,0,0,'x'); // le voile, creusé
    J.lathe('d',[[.235,-hw+.02],[.235,fx-.05],[0,fx-.05]],20,0,0,0,'x');                              // le fond
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;J.cyl('d',.04,.016,10,fx-.016,Math.cos(a)*.148,Math.sin(a)*.148,'x');}   // les cinq trous
    J.lathe('c',[[.06,fx+.004],[.055,fx+.016],[.03,fx+.024],[0,fx+.026]],16,0,0,0,'x');               // le moyeu
    for(let i=0;i<5;i++){const a=(i+.5)/5*Math.PI*2;J.cyl('s',.009,.012,6,fx+.016,Math.cos(a)*.042,Math.sin(a)*.042,'x');}
    const JG=J.done();
    return {hl:[.72,.40,2.10],tl:[.74,.68,-2.10],wx:.80,wzF:ZF,wzR:-ZR,
            roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
            lpw:{R:R,w:JW,style:'nyan',jante:0xd4d8de}};
  },
  /* ============================================================================================
     LES CAISSES DE CONTRAT (2026-09-25) — trois silhouettes que tout le monde reconnaît à 200 m,
     sans nom ni logo. Même atelier que les CINQ (loft à facettes + pièces), même repère.
     ⚠ la laque est TOUJOURS la clé 'p' : c'est elle que la PEINTURE de la boutique remplace.
     ========================================================================================== */
  // 7. LA BULLE — la Coccinelle : un dôme de toit, quatre ailes RONDES posées à part, des marchepieds,
  //    les phares perchés sur les ailes avant, capot moteur à ouïes à la poupe.
  bulle(K){
    // (2026-10-13, Léo : « plus réalistes et ressemblantes ») v2 : les cotes de la vraie (empattement 2,40, 1,54 m de large ailes comprises) —
    // les ailes étaient trop LARGES (près de 2 m : une voiture des années 30) ; le DÔME occupe maintenant presque toute la longueur, le
    // capot avant plonge, le capot moteur tombe en arrondi.
    const U=LPU,R=.33,ZF=1.20,ZR=-1.20;
    const P=K.kit({p:{g:'p',c:0x8fd6ff},k:{g:'m',c:0x17181c},c:{g:'c',c:0xe9ecf0},
      g:{g:'g',c:0x1a2632},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff2a36},O:{g:'l',c:0xffa21a}});
    const AR=[[0,2*R+.08],[R*.9,2*R+.02],[R+.14,.34]];
    const zs=[-2.04,-1.98,-1.85,-1.65,-1.40,-1.28,-1.02,-.70,-.45,-.33,0,.30,.46,.78,1.00,1.35,1.65,1.88,2.00,2.04];
    for(const w of [ZF,ZR])for(const d of [R*.9,R+.14])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const yC=z=>U.lin([[-2.04,.54],[-1.98,.68],[-1.85,.86],[-1.65,1.00],[-1.40,1.13],[-1.28,1.24],[-1.02,1.38],[-.70,1.47],[-.35,1.52],[0,1.52],
                       [.30,1.46],[.46,1.40],[.78,1.04],[1.00,.98],[1.35,.92],[1.65,.84],[1.88,.72],[2.00,.60],[2.04,.52]],z),
          xW=z=>U.lin([[-2.04,.46],[-1.90,.58],[-1.60,.65],[1.60,.65],[1.92,.57],[2.04,.44]],z);
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.34),c=yC(z),xw=xW(z),belt=Math.min(.98,c-.06),y2=Math.min(yb+.08,belt-.02);
      return [[0,yb],[xw-.06,yb],[xw-.02,y2],[xw,(y2+belt)/2],[xw-.025,belt],[xw*.84,belt+(c-belt)*.55],[xw*.5,c-(c-belt)*.07],[0,c]];   // le flanc GALBE
    },(j,z)=>{
      if(j===0)return 'k';
      if(j>=4&&z>.47&&z<.77)return 'g';                                        // pare-brise bombé
      if(j===4&&z>-1.01&&z<.47)return (z>-.46&&z<-.32)?'p':'g';                // vitres latérales, montant B
      if(j>=5&&z>-1.27&&z<-1.03)return 'g';                                    // la petite lunette
      return 'p';});
    const aile=new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI*.56);
    for(const w of [ZF,ZR])P.sym(sd=>P.put('p',aile.clone(),sd*.62,.47,w+(w>0?.08:-.06),0,0,0,.19,.45,R+.32)); // LES AILES RONDES (serrées contre la caisse)
    aile.dispose();
    P.sym(sd=>{
      P.box('k',.14,.05,ZF-ZR-2*(R+.24),sd*.66,.36,(ZF+ZR)/2);                // marchepied
      P.cyl('c',.11,.10,12,sd*.62,.80,ZF+.48,'z',.115);P.cyl('W',.085,.11,12,sd*.62,.80,ZF+.52,'z'); // phares sur les ailes
      P.box('L',.07,.16,.07,sd*.64,.74,ZR-.52);                               // feux sur les ailes arrière
      P.box('c',.04,.03,.14,sd*.655,.92,.10);                                  // poignée
      P.box('c',.03,.10,.03,sd*.68,1.06,.52);P.box('c',.10,.06,.03,sd*.72,1.13,.52); // rétro
      P.box('c',.06,.14,.06,sd*.58,.43,2.10);P.box('c',.06,.14,.06,sd*.58,.43,-2.10); // butoirs
      P.cyl('c',.035,.16,8,sd*.30,.36,-2.10,'z');                              // les deux pots
    });
    P.box('c',1.44,.07,.07,0,.43,2.10);P.box('c',1.44,.07,.07,0,.43,-2.10);   // pare-chocs à lames
    P.box('c',.04,.02,.52,0,yC(1.35)+.012,1.35);                              // la baguette du capot
    for(let i=0;i<4;i++){const z=-1.66-i*.07;P.box('k',.36,.014,.035,0,yC(z)+.01,z,.7);} // ouïes moteur
    K.commit(P);
    return {hl:[.62,.80,ZF+.56],tl:[.64,.74,ZR-.58],wx:.62,wzF:ZF,wzR:-ZR,
            lpw:{R:R,w:.24,style:'enjoliveur',blanc:1}};
  },
  // 8. LE COMBI — le minibus des années 60 : une boîte aux coins ronds, deux tons, le V peint sur la
  //    face, pare-brise en deux, rangée de hublots, et la planche de surf sur les barres de toit.
  combi(K){
    // (2026-10-13, Léo : « plus réalistes et ressemblantes ») v2 : la face est BOMBÉE en plan, comme le vrai T1 — des lamelles posées sur un
    // arc, chacune peinte du V (crème en haut, couleur en bas, la pointe sur l'emblème), le pare-brise en deux qui suit la courbe ; les
    // OUÏES d'aération en haut des flancs arrière ; des roues un peu plus petites (15 pouces).
    const U=LPU,R=.33,ZF=1.22,ZR=-1.22;
    const P=K.kit({p:{g:'p',c:0x35c2bb},s:{g:'p',c:0xf4ecd8},r:{g:'p',c:0xff8a3d},k:{g:'m',c:0x17181c},
      c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1a2632},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff2a36},O:{g:'l',c:0xffa21a}});
    const AR=[[0,2*R+.07],[R*.95,2*R+.02],[R+.12,.40]];
    const zs=[-2.20,-2.12,-1.90,1.90,2.06];
    for(let k=0;k<=6;k++){const z=-1.55+k*.517;zs.push(z,z+.078);}                // une station de part et d'autre de chaque montant
    for(const w of [ZF,ZR])for(const d of [R*.95,R+.12])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const yC=z=>U.lin([[-2.20,1.80],[-2.12,1.93],[-1.90,1.98],[1.90,1.98],[2.12,1.93],[2.20,1.80]],z),
          xW=z=>U.lin([[-2.20,.78],[-2.10,.86],[2.06,.86]],z);
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.40),c=yC(z),xw=xW(z);
      return [[0,yb],[xw-.05,yb],[xw,yb+.08],[xw,1.08],[xw,1.20],[xw-.02,1.64],[xw-.10,Math.min(1.88,c-.04)],[xw*.55,c],[0,c]];
    },(j,z)=>{
      if(j===0)return 'k';
      if(j<0)return 's';                                                       // les deux faces : crème (le bas est repeint par une plaque)
      if(j<=2)return 'p';                                                      // le bas, couleur franche
      if(j===4&&z>-1.55&&z<1.55){const f=((z+1.55)/.517)%1;return (f<.15)?'s':'g';} // les hublots, montants crème
      return 's';});                                                           // le haut, crème
    // LA FACE BOMBÉE : 14 lamelles sur un arc (z = 2,23 au centre, 2,06 aux coins), chacune peinte du V, le pare-brise en deux
    const NL=16,zN=x=>2.23-.17*(x/.86)*(x/.86),yv=x=>.70+.38*Math.abs(x)/.86,
      q=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};
    for(let i=0;i<NL;i++){const x0=-.86+1.72*i/NL,x1=x0+1.72/NL,z0=zN(x0),z1=zN(x1),v0=yv(x0),v1=yv(x1),
        w0=z0-.05,w1=z1-.05,mid=Math.abs((x0+x1)/2)<.06;
      q('p',[x0,.44,z0],[x1,.44,z1],[x1,v1,z1],[x0,v0,z0]);                    // le bas, couleur — le V EXACT
      q('s',[x0,v0,z0],[x1,v1,z1],[x1,1.42,z1],[x0,1.42,z0]);                  // le V crème
      q(mid?'s':'g',[x0,1.42,z0],[x1,1.42,z1],[x1,1.80,w1],[x0,1.80,w0]);      // le pare-brise, un peu couché (le montant du milieu)
      q('s',[x0,1.80,w0],[x1,1.80,w1],[x1,1.95,w1-.04],[x0,1.95,w0-.04]);      // le haut
      q('s',[x0,1.95,w0-.04],[x1,1.95,w1-.04],[x1,1.95,2.06],[x0,1.95,2.06]);  // il rejoint le toit
      q('p',[x0,.44,z0],[x1,.44,z1],[x1,.44,2.06],[x0,.44,2.06]);};
    P.sym(sd=>{
      P.cyl('c',.14,.04,12,sd*.60,.82,zN(.60)+.015,'z');P.cyl('W',.10,.05,12,sd*.60,.82,zN(.60)+.025,'z');
      P.box('O',.08,.06,.03,sd*.30,1.22,zN(.30)+.015,0,-sd*.12,0);             // clignotants
      for(let i=0;i<6;i++)P.box('k',.012,.035,.30,sd*.862,1.50+i*.055,-1.86);  // les OUÏES d'aération
      P.box('L',.07,.20,.03,sd*.74,.80,-2.215);                               // feux arrière
      P.box('k',.04,.04,.08,sd*.40,2.02,-1.40);P.box('k',.04,.04,.08,sd*.40,2.02,1.00); // pieds des barres
      P.cyl('c',.04,.14,8,sd*.30,.40,-2.26,'z');
    });
    P.cyl('c',.20,.025,18,0,.98,2.245,'z');P.cyl('p',.15,.03,18,0,.98,2.25,'z'); // l'emblème rond
    P.box('c',1.72,.10,.10,0,.42,2.20);P.box('c',1.72,.10,.10,0,.42,-2.25);
    P.plate('p',[[-.84,.44],[.84,.44],[.84,1.08],[-.84,1.08]],.015,-2.222);   // la poupe, deux tons elle aussi
    P.box('g',1.10,.34,.03,0,1.56,-2.215);                                    // lunette arrière
    P.box('k',.90,.26,.02,0,.74,-2.215);                                      // la grille du moteur
    P.box('k',1.00,.03,.05,0,2.07,-1.40);P.box('k',1.00,.03,.05,0,2.07,1.00);   // barres de toit
    P.put('r',new THREE.SphereGeometry(1,12,6),0,2.13,-.20,0,0,0,.28,.045,1.36); // LA PLANCHE DE SURF
    P.box('s',.03,.006,2.1,0,2.176,-.20);                                     // son liteau
    K.commit(P);
    return {hl:[.60,.82,2.15],tl:[.74,.80,-2.24],wx:.78,wzF:ZF,wzR:-ZR,
            lpw:{R:R,w:.24,style:'enjoliveur',blanc:1}};
  },
  // 9. LA DOLORÈS — le coin d'inox brossé à portes papillon : capot en pente, persiennes sur la lunette,
  //    jonc noir sur les flancs, phares carrés dans une face noire.
  dolores(K){
    const U=LPU,R=.34,ZF=1.22,ZR=-1.26;
    const P=K.kit({p:{g:'c',c:0xc3c7cc},k:{g:'m',c:0x141518},c:{g:'c',c:0xe9ecf0},
      g:{g:'g',c:0x121a22},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
    const AR=[[0,2*R+.06],[R*.62,2*R+.06],[R+.15,.30]];
    const zs=[-2.11,-2.02,-1.62,-.66,-.40,.10,.52,.92,2.11];
    for(const w of [ZF,ZR])for(const d of [R*.62,R+.15])zs.push(w-d,w+d);
    zs.sort((a,b)=>a-b);
    const yC=z=>U.lin([[-2.11,.86],[-2.02,.90],[-1.62,.93],[-.66,1.12],[.10,1.14],[.92,.80],[1.40,.72],[2.11,.60]],z),
          cab=z=>z>-.68&&z<.94;
    P.loft(zs,z=>{
      const yb=U.arch(z,[ZF,ZR],AR,.30),xw=U.lin([[-2.11,.90],[-1.96,.93],[1.70,.93],[2.11,.84]],z),
            yB=Math.max(U.lin([[-2.11,.84],[-1.62,.88],[-.66,.88],[.92,.78],[2.11,.58]],z),yb+.10),c=yC(z);
      const p4=cab(z)?[.80,yB+.02]:[xw-.06,yB+.005];
      const p5=cab(z)?[U.lin([[-.66,.60],[.10,.62],[.92,.78]],z),c-.01]:[.46,Math.max(p4[1]+.002,c-.004)];
      return [[0,yb],[xw-.06,yb],[xw,Math.max(.40,yb+.04)],[xw-.01,yB],p4,p5,[0,c]];
    },(j,z)=>{
      if(j===0)return 'k';
      if(j===4&&cab(z))return (z>-.55&&z<.80)?'g':'p';                        // vitres latérales
      if(j===5&&z>.12&&z<.92)return 'g';                                       // pare-brise couché
      return 'p';});
    for(let i=0;i<8;i++){const z=-.74-i*.115;P.box('k',.96,.016,.07,0,yC(z)+.012,z,-.20);} // PERSIENNES de lunette
    P.sym(sd=>{
      for(const [z0,z1] of [[-.76,.72],[-2.06,-1.76]])P.box('k',.02,.06,z1-z0,sd*.935,.62,(z0+z1)/2); // le jonc noir — (2026-10-19, BOÎTES) en tronçons : d'un seul tenant (3,60 m) il traversait les passages de roue et flottait au-dessus des roues
      P.box('k',.012,.012,1.34,sd*.22,1.147,-.26);                            // la charnière des portes papillon
      P.box('W',.24,.10,.02,sd*.36,.56,2.118);P.box('W',.24,.10,.02,sd*.64,.56,2.118); // phares carrés
      P.box('O',.10,.06,.02,sd*.82,.44,2.118);
      P.box('L',.46,.10,.02,sd*.54,.66,-2.118);P.box('O',.12,.10,.02,sd*.20,.66,-2.118);
      P.box('k',.12,.06,.16,sd*.94,.88,.52);                                   // rétro
      P.cyl('c',.04,.14,8,sd*.38,.34,-2.16,'z');
    });
    P.box('k',1.82,.20,.03,0,.54,2.112);                                      // la face noire
    P.box('k',1.84,.14,.18,0,.36,2.06);P.box('k',1.84,.18,.16,0,.40,-2.06);   // boucliers
    P.box('k',1.84,.22,.02,0,.66,-2.114);                                     // poupe noire
    K.commit(P);
    return {hl:[.50,.56,2.13],tl:[.54,.66,-2.13],wx:.80,wzF:ZF,wzR:-ZR,
            lpw:{R:R,w:.28,style:'multi',n:10,jante:0xcfd3d8}};
  },
  /* ============================================================================================
     LA GAMME DES 15, RETROUVÉE (2026-09-25, user : « on a des modèles 3D de chaque modèle dans le code, retrouve-les »).
     Ces gabarits vivaient dans la branche `appstore-backlog` (gamme du 2026-08-05) et ont disparu à la fusion, quand la
     gamme est repartie de zéro. Ils utilisent l'ancienne boîte à outils (`box`/`prof`/`cyl`/`sph`/`con`), dont le `K`
     actuel est un sur-ensemble : ils se construisent TELS QUELS, copiés à l'identique. Les sept plus spectaculaires sont
     les caisses PREMIUM de la boutique. (2026-10-18) Les six « du quotidien » restées sans fiche (kei, break, pickup, muscle, berline,
     wedge) sont retirées : `gt` reste, c'est le repli d'une fiche sans `shape` (voir buildCar).
     ========================================================================================== */

  // 7. LA GT À MOTEUR ARRIÈRE — le FASTBACK en goutte d'eau, ailes bombées.
  gt(K){
    const {W,H,L,y0,box:B}=K;
    K.prof([[-.50*L,0],[.50*L,0],[.50*L,.30*H],[.20*L,.48*H],[-.10*L,.58*H],[-.44*L,.62*H],[-.50*L,.56*H]],W*.96,K.body);
    K.prof([[.14*L,.44*H],[-.02*L,.94*H],[-.24*L,.92*H],[-.36*L,.54*H]],W*.70,K.glass);
    B(W*.56,.05,L*.20,K.acc,0,y0+H*.90,-L*.13).rotation.x=.06;
    for(const sd of [-1,1]){
      K.sph(W*.10,H*.34,L*.20,K.body,sd*(W/2-.02),y0+H*.44,L*.24); // ailes bombées AV
      K.sph(W*.11,H*.32,L*.22,K.body,sd*(W/2-.02),y0+H*.42,-L*.26);
      B(.08,H*.22,L*.60,K.acc,sd*(W/2+.02),y0+H*.10,0);
    }
    return {};
  },
  // 9. L'HYPERCAR — l'ARCHE DE TOIT bicolore qui court du nez au coffre, fer à cheval en calandre.
  // 10. LA MONOPLACE — roues DEHORS, pontons, aileron biplan. Aucune carrosserie autour des roues.
  // 11. LE PROTOTYPE D'ENDURANCE — dérive dorsale reliée à un aileron de porte-avions,
  //     quatre phares longue portée. Long, bas, et cette ombre de requin sur le dos.
  // 12. LE FURTIF — coin plat, bulle de verre, dérive. La reine : on ne lui voit aucune ligne droite.
  proto(K){
    const {W,H,L,y0,box:B}=K;
    K.prof([[-.50*L,0],[.50*L,0],[.50*L,.16*H],[.10*L,.40*H],[-.30*L,.52*H],[-.50*L,.50*H]],W*.94,K.body);
    K.sph(W*.30,H*.52,L*.20,K.glass,0,y0+H*.42,L*.02);
    B(.04,H*.42,L*.30,K.acc,0,y0+H*.62,-L*.34);
    for(const sd of [-1,1])B(.06,H*.20,L*.24,K.dark,sd*(W/2+.01),y0+H*.28,-L*.14);
    return {hl:[W*.30,y0+H*.30,L*.44],tl:[W*.30,y0+H*.44,-L/2-.06]};
  },
