// <<< fin SHAPES.robin (RONDES) >>>
// <<< SHAPES.b_canard (RONDES) >>>
SHAPES.b_canard=function(K){
  /* LA QUEUE DE CANARD — la 911 Carrera RS 2.7 de 1973 (2026-10-18, discussion RONDES ; Léo : « retravaille-la vraiment à fond, même
     technique que la Taycan, même rigueur que tous les commentaires sur la Taycan »). Refaite entièrement SUR LE PLAN D'USINE de la 911
     (dessin de carrosserie Porsche, 4 vues + une coupe, the-blueprints.com) relu en mètres : z = 1,177 + (2066 − px)/404,
     y = 0,35 + (497 − py)/404 (« Plan 0 » = 0,35 m du sol, le pavillon tombe à 1,32 m, la hauteur de la RS). Ce que la RS change au
     dessin de 1967 : l'empattement long (+57 mm, la roue arrière reculée, la caisse ne bouge pas), les ailes arrière ÉLARGIES (1,652 m),
     la queue de canard, les pare-chocs de 1973, les Fuchs, la livrée blanche à bande bleue (sans lettrage). Tout ce qui se voit vient du
     plan ou des photos de la vraie (Wikimedia Commons, « Porsche 911 Carrera RS 2.7 »). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.32,ZF=1.177,ZR=ZF-2.268;
  const PAL={p:{g:'p',c:0xf2efe6},b:{g:'p',c:0x1f5fd8,f:0},k:{g:'m',c:0x141518},n:{g:'m',c:0x141518},K:{g:'g',c:0x0c0e12},g:{g:'g',c:0x1c2733},
    c:{g:'c',c:0xe9ecf0},C:{g:'c',c:0x8a9098},W:{g:'l',c:0xf3f1e6},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x8a0c18},O:{g:'l',c:0xffa21a},w:{g:'l',c:0xd9dce0},d:{g:'m',c:0x101114}};
  // ---- LE PLAN (mètres du jeu) ----
  // le profil dans l'axe : nez, capot (caché par les ailes sur le plan), pare-brise, pavillon, lunette, capot moteur
  // (la QUEUE DE CANARD : derrière la grille, le capot moteur ne plonge plus — son dessus file à peine montant jusqu'à la LÈVRE, en surplomb
  //  au-dessus des feux (les photos de profil de la RS) ; le plan de 1967 descendait de 0,908 à 0,529)
  const yC=z=>L([[-2.115,.952],[-2.06,.948],[-2.0,.944],[-1.85,.932],[-1.70,.918],[-1.60,.907],[-1.536,.908],[-1.447,.952],[-1.432,.962],
    [-1.40,.983],[-1.353,.999],[-1.20,1.062],[-1.021,1.132],[-.90,1.176],[-.80,1.212],[-.70,1.246],[-.608,1.268],[-.407,1.296],[-.254,1.307],[-.053,1.312],
    [.098,1.308],[.14,1.302],[.197,1.283],[.251,1.251],[.35,1.184],[.474,1.098],[.598,1.006],[.692,.932],[.845,.904],[.994,.877],[1.093,.862],[1.212,.845],
    [1.259,.834],[1.345,.813],[1.425,.792],[1.514,.77],[1.598,.741],[1.677,.715],[1.719,.698],[1.761,.662],[1.835,.632],[1.885,.612],[1.934,.583],[1.972,.546],[2.001,.511]],z);
  // la plus grande largeur (dessus) — + les ailes arrière ÉLARGIES de la RS (1,652 m) et un rien devant (1,610 m)
  const xMp=z=>L([[-2.075,.433],[-2.031,.485],[-1.972,.594],[-1.957,.612],[-1.927,.637],[-1.882,.66],[-1.823,.678],[-1.749,.692],[-1.63,.708],[-1.467,.725],
    [-1.318,.727],[-1.021,.751],[-.65,.77],[.108,.786],[.85,.79],[1.118,.783],[1.459,.766],[1.667,.747],[1.801,.718],[1.83,.706],[1.86,.688],[1.89,.662],
    [1.92,.628],[1.949,.582],[2.009,.448],[2.053,.386]],z);
  const flare=z=>.075*Math.exp(-Math.pow((z-ZR)/.42,2)),xM=z=>xMp(z)+flare(z)+.008*Math.exp(-Math.pow((z-ZF)/.5,2));
  // la crête de l'aile avant (trait plein du côté), le bord du capot (dessus), le phare
  // (devant le phare, l'aile redescend : le bord du phare (le trait raide du côté, de 0,838 à 0,652 m) puis le nez de l'aile jusqu'au pare-chocs)
  const yAile=z=>L([[.70,.90],[1.0,.884],[1.20,.875],[1.333,.866],[1.516,.854],[1.675,.838],[1.712,.838],[1.741,.744],[1.774,.652],[1.88,.585],[1.98,.53]],z),
        xAile=z=>L([[.70,.69],[1.0,.70],[1.30,.67],[1.55,.635],[1.70,.615],[1.80,.60]],z),
        xCap=z=>L([[.70,.565],[.796,.562],[1.20,.503],[1.60,.446],[1.97,.389]],z);
  // la ceinture (côté, trait à py 283-286 ; dessus, py 735) et le bord du pavillon (gouttière : dessus py 790-800, coupe : 1,22-1,25 m)
  const yBelt=z=>L([[-1.20,.86],[-.90,.875],[.20,.877],[.70,.88]],z),xBelt=z=>L([[-1.20,.705],[-.90,.70],[-.40,.69],[.30,.686],[.70,.69]],z);
  const xToit=z=>L([[-.80,.515],[-.60,.528],[-.20,.535],[.103,.525]],z),yToit=z=>yC(z)-L([[-.80,.03],[-.40,.055],[0,.06],[.103,.1]],z);
  /* LE PARE-BRISE (dessus : la vitre de px 2262 à 2498) : sa BASE est cintrée en plan — au milieu à z 0,692, elle recule vers les côtés
     jusqu'au pied du montant (z 0,449, x 0,661, à la ceinture) ; puis le montant monte (côté : px 2380 → 2500) jusqu'au pavillon. */
  const xBasePB=z=>L([[.449,.661],[.499,.644],[.56,.604],[.622,.55],[.66,.488],[.684,.401],[.692,.30]],z),yBasePB=z=>L([[.449,.88],[.56,.895],[.66,.91],[.692,.925]],z),
        xMontant=z=>L([[.103,.525],[.165,.55],[.251,.587],[.35,.629],[.449,.661]],z),yMontant=z=>L([[.103,1.209],[.152,1.159],[.226,1.073],[.301,.986],[.40,.88],[.449,.88]],z);
  // l'arrière : la crête de l'aile arrière (dos : l'épaule à 0,74 · 0,85), le bord de la lunette (dessus py 800 → 820), du capot moteur (830 → 845)
  const yAileAr=z=>L([[-2.0,.74],[-1.85,.80],[-1.60,.845],[-1.30,.858],[-1.10,.862],[-.90,.875]],z),
        xAileAr=z=>L([[-2.0,.60],[-1.85,.66],[-1.60,.70],[-1.30,.715],[-1.10,.71],[-.90,.70]],z),
        xLun=z=>L([[-1.44,.475],[-1.10,.50],[-.80,.515]],z),xMot=z=>L([[-2.05,.40],[-1.80,.41],[-1.44,.44]],z),
        xCanard=z=>L([[-2.115,.48],[-2.06,.505],[-1.95,.535],[-1.80,.55],[-1.60,.49],[-1.50,.44]],z),
        xBordAr=z=>L([[-2.115,.48],[-2.06,.505],[-1.95,.535],[-1.80,.55],[-1.65,.522],[-1.50,.485],[-1.44,.475],[-1.10,.50],[-.80,.515]],z);   // l'arête de la queue de canard (dos et dessus des photos)
  // le dessous (côté : le bas de caisse à py 528) et les passages de roue (cercles du plan : avant r 0,364 ; arrière élargi r 0,375)
  const yLevre=z=>L([[-2.115,.896],[-2.06,.878],[-2.008,.85]],z);   // le dessous de la lèvre, qui remonte vers son bord
  const yBas=z=>L([[-2.06,.40],[-2.0,.33],[-1.85,.30],[-1.45,.29],[-.72,.272],[.80,.272],[1.53,.29],[1.85,.29],[1.97,.32],[2.02,.42]],z);
  const arc=(r,c)=>{const o=[];for(const t of [0,.25,.45,.6,.72,.82,.9,.96,1])o.push([+(r*Math.sin(t*Math.PI/2)).toFixed(4),+(c+r*Math.cos(t*Math.PI/2)).toFixed(4)]);o.push([r+.004,.22]);return o;};
  const ARF=arc(.364,.35),ARR=arc(.375,.35);
  const archY=(z,yb)=>Math.max(yb,U.arch(z,[ZF],ARF,yb),U.arch(z,[ZR],ARR,yb));
  // ---- LA SECTION : du bas (axe) au faîte (axe) ----
  const ZPB=.692,ZBPB=.449,ZTOIT=.103,ZLUN=-.79,ZMOT=-1.44;
  const bez=(a,c,b,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]];
  const brut=z=>{
    const yb0=yBas(z),yb=archY(z,yb0),xm=xM(z),yt=yC(z),s=[];
    // la hauteur de la plus grande largeur : basse au flanc (la coupe : 0,42), plus haute aux ailes
    const ym=L([[-2.0,.55],[-1.5,.52],[-1.1,.48],[-.7,.43],[.8,.43],[1.2,.48],[1.7,.52],[2.0,.50]],z);
    // l'épaule S et le bord E selon la zone
    let S,E,creuxSE=0;
    if(z>=ZPB){                                   // l'avant : la crête de l'aile, puis le bord du capot plus bas, entre les ailes
      // (près du phare, l'aile s'ÉLARGIT en cuvette : un dessus plat de la largeur du phare, de 0,515 à 0,715 — le phare s'y loge)
      const kH=lis(cl((z-1.48)/.16,0,1));S=[Math.min(xAile(z)+.10*kH,xm-.018),yAile(z)];E=[xCap(z),yt-.006];creuxSE=1+kH;}
    else if(z>=ZLUN){                             // l'habitacle : la ceinture, puis la vitre jusqu'au montant / à la gouttière
      S=[Math.min(xBelt(z),xm-.03),yBelt(z)];
      E=z>=ZBPB?[xBasePB(z),yBasePB(z)]:z>=ZTOIT?[xMontant(z),yMontant(z)]:[xToit(z),yToit(z)];}
    else{                                         // la lunette, puis le capot moteur et sa queue de canard, entre les ailes arrière :
      // UN SEUL bord, continu, de la lunette à la lèvre (deux tables raccordées sautaient de 3,5 cm à z −1,44 : la tôle s'y froissait)
      S=[Math.min(xAileAr(z),xm-.03),yAileAr(z)];E=[xBordAr(z),yt-L([[-2.115,.012],[-1.60,.015],[-1.44,.03],[-.80,.035]],z)];}
    // le fondu entre l'aile avant et la ceinture (le pied du montant), entre la ceinture et l'aile arrière (la custode)
    const fA=lis(cl((z-ZPB)/.12,0,1));if(z>=ZPB&&fA<1){S=[mix(xBelt(z),S[0],fA),mix(yBelt(z),S[1],fA)];}
    S[1]=Math.max(S[1],ym+.10);E[1]=Math.min(E[1],yt-.002);if(E[0]>S[0]-.02)E[0]=S[0]-.02;
    const xl=Math.min(xm-.07,.72),yl=yb;
    s.push([0,yb],[xl*.9,yb]);
    // sous le flanc : le bas de caisse qui rentre (la coupe), jusqu'à la plus grande largeur
    for(const t of [0,.3,.55,.78])s.push([mix(xl,xm,Math.sin(t*Math.PI/2)),mix(yl+.015,ym,t*t*(3-2*t))]);
    s.push([xm,ym]);
    // le flanc jusqu'à l'épaule : vertical à la plus grande largeur, il s'arrondit vers l'épaule
    // (la COUPE d'usine : du plus large, le flanc rentre de plus en plus vite jusqu'à la ceinture — pas d'arête d'épaule)
    for(const u of [.26,.52,.72,.85,.94]){const f=L([[0,0],[.258,.056],[.516,.153],[.722,.306],[.851,.514],[.939,.771],[1,1]],u);s.push([xm-(xm-S[0])*f,ym+(S[1]-ym)*u]);}
    s.push(S);
    // de l'épaule au bord : à l'avant une cuvette (l'aile domine le capot), ailleurs la vitre / la custode
    if(creuxSE){const kH=creuxSE-1,c2=[mix(mix(S[0],E[0],.45),S[0]-.20,kH),mix(Math.min(S[1],E[1])-.012,S[1],kH)];for(const t of [.3,.6,.85])s.push(bez(S,c2,E,t));}
    else{const c2=[mix(S[0],E[0],.5)+.012,mix(S[1],E[1],.5)];for(const t of [.3,.6,.85])s.push(bez(S,c2,E,t));}   // (toujours 3 points : toutes les sections ont le même nombre de points, sinon le loft les relie de travers)
    s.push(E);
    // le bombé jusqu'à l'axe
    for(const t of [.86,.70,.52,.34,.17])s.push([t*E[0],yt-(yt-E[1])*Math.pow(t,2.4)]);
    s.push([0,yt]);
    // (la monotonie jusqu'à l'épaule : le passage de roue relève le bas de la section, le flanc ne redescend pas sous lui)
    for(let i=1;i<=12;i++)if(s[i][1]<s[i-1][1])s[i][1]=s[i-1][1];
    return s;};
  const AV=1.97,AP=-2.0,S_AV=brut(AV);
  // LA LÈVRE : derrière la poupe (z < −2,0), la section n'est plus qu'une tranche — de son dessous (yLevre) à son dessus, aussi large que
  // l'arête ; la face arrière (feux, plaque) est la marche entre la dernière section pleine et la première tranche
  const levre=z=>{const yu=yLevre(z),yt=yC(z),xe=xCanard(z),s=[],n=brut(AP).length;
    const P9=[[0,yu],[xe*.55,yu],[xe*.8,yu+.002],[xe*.93,yu+.006],[xe+.005,yu+.014],[xe+.008,yu+.024],[xe+.004,(yu+yt)/2+.01],[xe,yt-.008]];
    for(let i=0;i<n;i++){const u=i/(n-1);if(u<=.5){const f=u/.5*(P9.length-1),k=Math.min(P9.length-2,Math.floor(f)),r=f-k;s.push([mix(P9[k][0],P9[k+1][0],r),mix(P9[k][1],P9[k+1][1],r)]);}
      else{const v=(u-.5)/.5;s.push([xe*(1-v),yt-(yt-(yt-.008))*Math.pow(1-v,2.4)]);}}
    for(let i=1;i<s.length;i++)if(i<=n/2&&s[i][1]<s[i-1][1])s[i][1]=s[i-1][1];return s;};
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);if(z<AP)return levre(z);const s0=S_AV,kx=xM(z)/xM(AV),t=yC(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  // (une tranche tous les 10 cm — la poly ; plus serrées au phare, à la poupe et aux passages de roue)
  const zs0=[];for(let z=-2.06;z<=2.005;z+=.10)zs0.push(+z.toFixed(3));for(let z=1.55;z<=1.98;z+=.035)zs0.push(+z.toFixed(3));for(let z=-1.98;z<=-1.80;z+=.06)zs0.push(+z.toFixed(3));
  for(const z of [2.0,2.02,2.03,1.99,1.98,-2.0,-2.008,-2.02,-2.04,-2.06,-2.08,-2.10,-2.115,ZPB,ZBPB,ZTOIT,ZLUN,ZMOT,ZPB+.06,ZPB+.12,.56,.62,.66,.68])zs0.push(z);
  for(const w of [ZF,ZR])for(const d of [.07,.15,.23,.29,.33,.355,.37,.38])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.filter(z=>z>=-2.115&&z<=2.03).sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.006);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':(j<=1&&z>AP)?'k':'p');   // (le dessous en noir — pas la face arrière, qui est la marche vers la lèvre)
  /* LA TÔLE DÉCOUPÉE AU PLAN (`bulleOutils.decoupe`, la méthode de LA PERLE) : chaque contour est relevé AU PIXEL du plan d'usine et passé
     en mètres ici (PZ, PY, DX) ; une zone = UNE vue. Vitres de porte et de custode (la goutte), leur cadre noir et le montant B ; les joints
     de la porte, du capot (son bord le long des ailes, son nez), du capot moteur ; le pare-brise (sa base cintrée) et la lunette, cerclés de
     noir ; la fente d'auvent ; la grille de la queue de canard ; les feux ; la BANDE BLEUE de bas de caisse, sans lettrage. */
  const PZ=px=>1.177+(2066-px)/404,PY=py=>.35+(497-py)/404,cote=P9=>P9.map(q=>[PZ(q[0]),PY(q[1])]),miroir=P9=>P9.concat(P9.slice(1,-1).reverse().map(q=>[q[0],-q[1]]));
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const vit=(x,y,z)=>y>.855;
  // côté : le cadre noir (vitre de porte + montant B + custode), puis les deux vitres
  zo('cote',cote([[2346,288],[2372,277],[2400,262],[2430,226],[2460,190],[2484,162],[2500,147],[2520,139],[2560,137],[2650,139],[2740,148],[2800,160],[2860,176],[2920,198],
    [2965,222],[2992,248],[2998,268],[2990,283],[2970,289],[2800,290],[2600,289],[2346,290]]),'K',{al:.45,ou:vit});   // (devant, il descend jusqu'au pied du pare-brise : les deux cadres noirs s'y rejoignent)
  zo('cote',cote([[2398,284],[2420,258],[2450,222],[2475,190],[2492,168],[2510,155],[2540,150],[2600,149],[2690,153],[2740,163],[2772,171],[2742,285]]),'g',{al:.45,ou:vit});
  zo('cote',cote([[2758,288],[2790,175],[2850,186],[2900,203],[2950,226],[2975,245],[2988,262],[2982,277],[2960,284],[2800,287]]),'g',{al:.45,ou:vit});
  // la porte (le plan : son bord avant vertical à px 2268, l'arrière qui file sous le montant B, le bas au seuil)
  zo('cote',O.bande(cote([[2380,286],[2300,289],[2280,295],[2268,310],[2268,495],[2652,495],[2665,485],[2680,460],[2700,420],[2715,380],[2730,330],[2742,290]]),.0035),'j',{al:.5,ou:(x,y,z)=>z>-.6&&z<.8&&y<.9});
  // la livrée : la bande BLEUE de bas de caisse, d'une roue à l'autre (sans le lettrage « Carrera »)
  zo('cote',[[.80,.296],[-.70,.296],[-.70,.352],[.80,.352]],'b',{al:.5,ou:(x,y,z)=>z>-.72&&z<.82});
  // dessus : le pare-brise (sa base cintrée : au milieu à z 0,692, au pied du montant à 0,449) et son cadre, la lunette et son cadre
  const PB=[[.692,0],[.692,.277],[.684,.401],[.66,.488],[.622,.55],[.56,.604],[.499,.644],[.449,.661],[.35,.629],[.251,.587],[.165,.55],[.115,.525],[.107,.45],[.107,0]],
        LU=[[-.793,0],[-.793,.401],[-.813,.475],[-.863,.5],[-1.135,.505],[-1.333,.495],[-1.407,.475],[-1.432,.401],[-1.432,0]];
  const cadre=P9=>O.gonfle(miroir(P9),.026).map(q=>[q[0],Math.abs(q[1])]);
  // (au pied du montant, le cadre noir de la vitre de porte (côté) descend jusqu'ici : noir des deux côtés de la limite des vues, pas de dents)
  const pbOu=(x,y,z)=>y>.86&&z>.04&&z<.76;
  zo('dessus',cadre(PB),'K',{al:.3,ou:pbOu});zo('dessus',PB,'g',{al:.3,ou:pbOu});
  zo('dessus',cadre(LU),'K',{al:.3,ou:(x,y,z)=>y>.9&&z<-.74&&z>-1.5});zo('dessus',LU,'g',{al:.3,ou:(x,y,z)=>y>.9&&z<-.74&&z>-1.5});
  // le capot (son bord arrière à l'auvent, ses bords le long des ailes — l'arête E de la section —, son nez au pare-chocs) ; la fente d'auvent
  zo('dessus',O.bande([[.776,0],[.776,.57],[1.20,.503],[1.60,.446],[1.971,.389],[1.99,.30],[2.0,.15],[2.003,0]],.0035),'j',{al:.35,ou:(x,y,z)=>z>.75});
  zo('dessus',[[.722,0],[.722,.30],[.73,.315],[.748,.315],[.756,.30],[.756,0]],'K',{al:.35,ou:(x,y,z)=>z>.70&&z<.78&&y>.88});
  // le capot moteur et sa queue de canard : la ligne de joint, la grille noire à lames au pied de la queue
  zo('dessus',O.bande([[-1.45,0],[-1.45,.44],[-1.55,.455],[-1.70,.50],[-1.85,.52],[-1.98,.51]],.0035),'j',{al:.35,ou:(x,y,z)=>z<-1.4&&z>-2.0});
  zo('dessus',[[-1.50,0],[-1.50,.40],[-1.52,.42],[-1.70,.43],[-1.72,.41],[-1.72,0]],'K',{al:.35,ou:(x,y,z)=>z<-1.48&&z>-1.74});
  for(let i=0;i<7;i++){const z9=-1.528-i*.026;zo('dessus',[[z9,0],[z9,.40],[z9-.008,.40],[z9-.008,0]],'n',{al:.35,ou:(x,y,z)=>z<-1.48&&z>-1.74});}
  // dos : les feux au coin de la poupe, sous la lèvre (les photos : rouge au-dedans, ambre au-dehors), un filet noir entre eux
  const feu=(x,y,z)=>z<-1.86&&y<.76&&y>.5;
  zo('dos',[[.285,.532],[.60,.532],[.615,.548],[.615,.686],[.60,.702],[.285,.702]],'K',{al:.2,ou:feu});   // (19/10) le cadre noir 5 mm, le filet 4 mm (11 et 8 avant : ils cernaient les feux)
  zo('dos',[[.290,.537],[.417,.537],[.417,.697],[.290,.697]],'L',{al:.2,ou:feu});
  zo('dos',[[.421,.537],[.598,.537],[.610,.551],[.610,.683],[.598,.697],[.421,.697]],'O',{al:.2,ou:feu});
  // face : sous chaque phare, la grille d'avertisseur noire à lames et le clignotant (blanc au-dedans, ambre au-dehors)
  const nez=(x,y,z)=>z>1.84&&y>.52&&y<.64;
  zo('face',[[.29,.548],[.445,.548],[.445,.602],[.29,.602]],'K',{al:.3,ou:nez});
  for(const y9 of [.562,.575,.588])zo('face',O.bande([[.30,y9],[.435,y9]],.0028),'C',{al:.3,ou:nez});
  zo('face',[[.455,.548],[.505,.548],[.505,.602],[.455,.602]],'w',{al:.3,ou:nez});
  zo('face',[[.505,.548],[.635,.548],[.645,.56],[.645,.59],[.635,.602],[.505,.602]],'O',{al:.3,ou:nez});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.b_canard&&SHAPES.b_canard.length===1)?(SHAPES.b_canard._tole||(SHAPES.b_canard._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  if(K.muet)return;   // (la préchauffe du menu ne veut que la tôle découpée : rondesChauffe)
  // ---- LES DÉTAILS (posés sur la tôle ou plantés dedans, jamais à plat contre elle : rien ne clignote) ----
  const P=K.kit(PAL);P.ech=true;
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  // le x de la tôle à la hauteur y dans la tranche z (le flanc, du bas jusqu'à l'épaule)
  const xTole=(z,y)=>{const s=sect(z);for(let i=1;i<=12;i++){const a=s[i-1],b=s[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return xM(z);};
  /* LES PARE-CHOCS DE 1973 : couleur caisse, un JONC de caoutchouc noir sur le dessus ; tirés le long de leur tracé vu de dessus (ils
     enveloppent le nez et la poupe jusqu'aux passages de roue). Deux tubes qui se touchent par une arête — jamais deux faces l'une sur l'autre. */
  const trace=(P9,y)=>{const o=P9.slice(1).reverse().map(q=>[-q[0],y,q[1]]);for(const q of P9)o.push([q[0],y,q[1]]);return o;};
  const avP=[[0,2.058],[.15,2.055],[.30,2.045],[.45,2.02],[.57,1.985],[.66,1.935],[.72,1.865],[.745,1.78],[.75,1.68],[.715,1.575]];
  const arP=[[.69,-1.575],[.715,-1.68],[.70,-1.78],[.66,-1.88],[.58,-1.98],[.45,-2.05],[.25,-2.085],[0,-2.095]];   // (19/10) les deux bouts RENTRENT de 3 cm dans la tôle : ils finissaient en lame qui dépassait
  const dec=(S9,d)=>S9.map(q=>[q[0]-d,q[1]]);   // (le tracé relevé est la FACE du pare-chocs : la section recule d'autant)
  O.tube(P,'p',trace(avP,0),dec([[-.07,.335],[0,.325],[.035,.333],[.052,.36],[.06,.40],[.062,.45],[.06,.50],[-.07,.50]],.062),true);
  O.tube(P,'n',trace(avP,0),dec([[-.07,.50],[.06,.50],[.067,.508],[.07,.522],[.065,.535],[-.07,.537]],.062),true);
  const arC=arP.slice(0,-1).map(q=>[q[0],0,q[1]]).concat([[0,0,-2.095]],arP.slice(0,-1).reverse().map(q=>[-q[0],0,q[1]]));
  O.tube(P,'p',arC,dec([[-.07,.365],[0,.357],[.035,.365],[.05,.39],[.055,.43],[.055,.468],[-.07,.468]],.055),true);
  O.tube(P,'n',arC,dec([[-.07,.468],[.055,.468],[.062,.476],[.064,.49],[.058,.503],[-.07,.505]],.055),true);
  // la plaque (la vraie s'y pose : plqDessinee) sur le pare-chocs arrière
  P.box('l',.42,.10,.012,0,.418,-2.108);
  /* LES PHARES — l'œil de la 911 : un PHARE ROND dans le bout de l'aile, sa cuvette couleur caisse qui rentre dans l'aile, le cerclage
     chromé, la glace bombée à cannelures (anneaux clair / argent) ; posé dans le plan du bord du phare relevé de profil (penché de 18°
     vers l'arrière, centre x 0,615 · y 0,745 · z 1,743) et avancé de 3 cm : la tôle de l'aile ne touche jamais sa face. */
  // (les cotes du plan : le bord du phare de 0,838 à 0,652 m de haut, penché de 18° — un cerclage de 0,105 m de rayon, une glace de 0,088)
  const nP=[0,Math.sin(.321),Math.cos(.321)];
  P.sym(sd=>{const c=[sd*.615,.745+nP[1]*.012,1.743+nP[2]*.012];
    O.tour(P,'p',[[.101,-.07],[.102,-.015],[.100,0]],28,c,nP);                                  // la cuvette, plantée dans l'aile
    O.tour(P,'c',[[.100,0],[.101,.008],[.097,.016],[.088,.021],[.080,.019]],28,c,nP);           // le cerclage chromé
    // la glace bombée, D'UN SEUL VERRE (19/10 : l'anneau argent à mi-rayon et le cache chromé au milieu faisaient un iris et une pupille — un regard)
    O.tour(P,'W',[[.080,.019],[.062,.027],[.040,.033],[.018,.036],[0,.037]],24,c,nP);});
  // sous les phares, dans la face avant : la grille d'avertisseur noire et le clignotant (blanc / ambre)
  // les ESSUIE-GLACES couchés au pied du pare-brise, le RÉTRO de course côté conducteur (chromé, sur sa tige), les POIGNÉES chromées
  for(const [x0,y0,x1,y1] of [[-.50,.905,.04,.935],[-.02,.935,.46,.912]])barre('k',[x0,y0,.70-Math.abs(x0)*.07],[x1,y1,.70-Math.abs(x1)*.07],.011,.012);
  {const xb=xTole(.33,.84);barre('c',[-(xb-.01),.84,.33],[-(xb+.07),.915,.345],.016,.016);
    const g=new THREE.SphereGeometry(1,14,9),a=g.attributes.position;
    for(let i=0;i<a.count;i++){const f=v=>Math.sign(v)*Math.pow(Math.abs(v),.6);a.setXYZ(i,f(a.getX(i)),f(a.getY(i)),f(a.getZ(i)));}
    P.put('c',g,-(xb+.10),.935,.35,0,.18,0,.068,.04,.028);P.put('g',new THREE.PlaneGeometry(1,1),-(xb+.10),.935,.32,0,Math.PI+.18,0,.11,.06,1);}
  P.sym(sd=>{const xh=xTole(-.42,.80);P.box('c',.018,.022,.15,sd*(xh+.008),.80,-.42);});
  K.commit(P);
  /* ---- LES ROUES : les FUCHS de la RS — cinq branches forgées polies, les creux entre elles peints à la couleur de la livrée (BLEU), la
     lèvre de jante polie, le moyeu chromé ; pneu à flanc haut des années 70 ---- */
  const JW=.20,hw=JW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x18191b},c:{g:'c',c:0xe4e8ed},b:{g:'p',c:0x1f5fd8,f:0},d:{g:'m',c:0x101114},C:{g:'c',c:0x9aa0a8}});
  J.lathe('k',[[.20,-hw],[R*.86,-hw],[R*.97,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.97,hw*.72],[R*.86,hw],[.20,hw]],26,0,0,0,'x');
  J.lathe('c',[[.20,hw-.003],[.197,fx+.014],[.188,fx+.012],[.183,fx+.004]],28,0,0,0,'x');                     // la lèvre polie
  J.lathe('b',[[.183,fx+.004],[.16,fx-.004],[.11,fx-.014],[.075,fx-.018]],28,0,0,0,'x');                     // le voile bleu, creusé
  J.lathe('d',[[.20,-hw+.02],[.20,fx-.05],[0,fx-.05]],20,0,0,0,'x');
  J.lathe('c',[[.075,fx-.018],[.068,fx+.004],[.055,fx+.012],[.03,fx+.016],[0,fx+.017]],22,0,0,0,'x');        // le moyeu
  for(let i=0;i<5;i++){const a=i*2*Math.PI/5,pt=(r,d)=>[r*Math.cos(a+d),r*Math.sin(a+d)];
    J.prism('c',[pt(.068,-.30),pt(.12,-.24),pt(.178,-.215),pt(.178,.215),pt(.12,.24),pt(.068,.30)],.022,fx-.004);}   // les cinq branches
  const JG=J.done();
  return {hl:[.615,.745,1.79],tl:[.52,.61,-2.01],wx:.69,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
/* LA PRÉCHAUFFE (comme `perleTraits` / `japChauffe`) : la tôle de LA QUEUE DE CANARD découpée au plan une fois, pendant la préchauffe du menu
   (`chauffeDivers`, une caisse par étape : LA QUEUE DE CANARD puis LA GRANDE ANGLAISE) — le gabarit tourne dans un chantier muet (`K.muet`) et garde sa découpe sur sa fonction (`_tole`). */
function rondesChauffe(){for(const n of ['b_canard','e_anglaise']){const F=typeof SHAPES==='object'&&SHAPES[n];if(!F||F.length!==1||(F._tole&&F._tole.G))continue;const t0=performance.now();
  F({kit:pal=>lpKit(typeof peintPal==='function'?peintPal(pal):pal),commit:kt=>{const gs=kt.done?kt.done():kt;if(gs)for(const g in gs)if(gs[g]&&gs[g].dispose)gs[g].dispose();},mats:{},add:o=>o,muet:1});
  F._ms=Math.round(performance.now()-t0);return true;}
  return false;}
window.dbgRondesChauffe=function(){const o={};for(const n of ['b_canard','e_anglaise']){const F=SHAPES[n];o[n]={decoupee:!!(F&&F._tole&&F._tole.G),ms:F&&F._ms||null};}return o;}; // (banc) la tôle de LA QUEUE DE CANARD est-elle déjà découpée (préchauffe du menu) ?
// <<< fin SHAPES.b_canard (RONDES) >>>
// <<< SHAPES.e_anglaise (RONDES) >>>
SHAPES.e_anglaise=function(K){
  /* LA GRANDE ANGLAISE — la Bentley Continental GT de 2003 (1re génération), refaite AU PLAN (2026-10-18, discussion RONDES ; Léo :
     « dans la direction qu'on a prise jusque-là, améliorer, amplifier l'effet de THE ENGLISH DAME »). Pas de plan coté libre de la 2003 :
     le PROFIL vient du dessin de la 2004 (the-blueprints.com, 245 px/m en long, 251 en haut — étalonné sur la longueur, 4,804 m, et la
     hauteur, 1,39 m), la VUE DE DESSUS de la GTC de 2012 (même plate-forme, ramenée à 1,918 m) ; tout est recomposé à 250 px/m
     (`plans/anglaise/plan.png`) et relu en mètres du jeu : z = (628,7 − px)/250, y = (373,6 − py)/250, x = (680 − py)/250.
     Les détails (calandre maille, quatre phares ronds, feux ovales, jantes à six branches, chromes) : les photos de la 1re génération
     (Wikimedia Commons, « Bentley Continental GT (1st gen.) »). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.352,ZF=1.343,ZR=-1.378;
  const PAL={p:{g:'p',c:0x1a3d2a},k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xeef0f3},C:{g:'c',c:0x8a9098},
    W:{g:'l',c:0xf6f2e4},w:{g:'l',c:0xd9dce0},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x7e0a14},O:{g:'l',c:0xffa21a},d:{g:'m',c:0x101114},n:{g:'m',c:0x1c1d20},F:{g:'c',c:0xbfc4cb}};   // (19/10) F : le chrome du cadre de calandre, moins blanc
  // ---- LE PLAN (mètres du jeu) ----
  // le profil dans l'axe (le haut de la silhouette de côté) : bouclier, calandre, capot, pare-brise, pavillon, lunette, malle, bouclier
  const yC=z=>L([[-2.40,.62],[-2.393,.674],[-2.36,.76],[-2.313,.846],[-2.27,.93],[-2.233,.978],[-2.153,1.006],[-2.073,1.03],[-1.993,1.05],[-1.913,1.066],
    [-1.833,1.084],[-1.78,1.10],[-1.673,1.122],[-1.593,1.146],[-1.513,1.166],[-1.433,1.19],[-1.353,1.21],[-1.273,1.23],[-1.193,1.25],[-1.113,1.272],
    [-1.033,1.30],[-.953,1.326],[-.873,1.342],[-.793,1.354],[-.713,1.366],[-.633,1.372],[-.553,1.378],[-.473,1.385],[-.393,1.388],[-.313,1.39],[-.233,1.39],
    [-.153,1.386],[-.073,1.382],[.007,1.378],[.087,1.366],[.167,1.352],[.247,1.33],[.327,1.296],[.407,1.262],[.487,1.23],[.567,1.194],[.647,1.158],[.727,1.122],
    [.807,1.082],[.887,1.046],[.97,1.022],[1.047,1.016],[1.127,1.01],[1.207,1.006],[1.287,1.002],[1.367,.99],[1.447,.986],[1.527,.978],[1.607,.97],[1.687,.962],
    [1.767,.95],[1.847,.938],[1.927,.926],[2.007,.91],[2.087,.894],[2.167,.88],[2.215,.86],[2.247,.826],[2.287,.74],[2.327,.634],[2.37,.52],[2.407,.40]],z);
  // la plus grande largeur (la vue de dessus) : un rien de taille aux portières, les HANCHES au-dessus des roues arrière
  const xM=z=>L([[-2.40,.04],[-2.396,.14],[-2.385,.24],[-2.345,.328],[-2.297,.466],[-2.249,.538],[-2.201,.65],[-2.153,.736],[-2.105,.802],[-2.057,.83],[-1.961,.852],[-1.865,.87],
    [-1.769,.886],[-1.673,.904],[-1.577,.926],[-1.481,.942],[-1.385,.95],[-1.193,.95],[-1.097,.942],[-1.001,.934],[-.857,.926],[-.713,.916],[-.617,.904],
    [-.473,.912],[-.329,.916],[-.137,.92],[.055,.926],[.199,.93],[.343,.936],[.631,.938],[.727,.942],[1.0,.946],[1.4,.946],[1.591,.94],[1.687,.936],
    [1.735,.926],[1.783,.908],[1.831,.888],[1.879,.878],[1.927,.864],[1.975,.844],[2.023,.81],[2.071,.768],[2.119,.71],[2.167,.648],[2.215,.57],[2.263,.492],
    [2.311,.422],[2.359,.30],[2.395,.22],[2.403,.12],[2.407,.04]],z);   // (le nez se referme en BANDES : un bouchon faisait des éventails)
  // la hauteur de la plus grande largeur (les vues de face et de dos) : à mi-portière, plus haute aux hanches arrière
  const yM=z=>L([[-2.3,.56],[-1.9,.62],[-1.4,.62],[-1.0,.58],[-.5,.56],[.6,.56],[1.3,.58],[2.0,.56],[2.35,.52]],z);
  // la CEINTURE (le bas des vitres, côté) et sa largeur (la tôle rentre de la hanche à la vitre : la coupe des vues de face et de dos)
  const yBelt=z=>L([[-1.80,1.10],[-1.40,1.08],[-1.117,1.084],[-1.045,1.052],[-.885,1.012],[-.605,.976],[-.285,.96],[.115,.952],[.515,.94],[.70,.92],[.95,.95],[1.3,.97],[1.8,.93],[2.1,.88]],z),
        xBelt=z=>L([[-2.0,.70],[-1.6,.79],[-1.3,.80],[-1.0,.785],[-.6,.775],[0,.77],[.5,.77],[.75,.79],[1.2,.80],[1.7,.78],[2.1,.70]],z);
  // la GOUTTIÈRE (le haut des vitres : le cadre de côté, à 1,27 m au milieu) et sa largeur (la vue de face : le pavillon à 0,58)
  const yRail=z=>L([[-1.117,1.12],[-1.045,1.17],[-.925,1.20],[-.605,1.255],[-.285,1.272],[.035,1.272],[.235,1.252],[.335,1.21],[.515,1.06],[.675,.93]],z),
        xRail=z=>L([[-1.117,.62],[-.925,.60],[-.605,.585],[-.285,.58],[.035,.58],[.235,.585],[.335,.60],[.515,.64],[.675,.70]],z);
  // LE PARE-BRISE (sa base cintrée en plan : au milieu à z 0,97, au pied du montant à 0,70) et la LUNETTE (de 1,30 m à 1,10 m, z −1,04 → −1,78)
  const ZPB=.97,ZBPB=.70,ZTOIT=.25,ZLUN=-1.04,ZMALLE=-1.78;
  const xBasePB=z=>L([[.70,.70],[.78,.66],[.86,.58],[.92,.48],[.955,.36],[.97,.20]],z),yBasePB=z=>L([[.70,.93],[.80,.96],[.90,.99],[.97,1.012]],z);
  const xLun=z=>L([[-1.80,.62],[-1.60,.60],[-1.40,.585],[-1.20,.575],[-1.04,.57]],z);
  // l'avant : la crête des ailes (le phare s'y loge) et le bord du capot ; l'arrière : la crête des hanches, le bord de la malle
  const xAile=z=>L([[.97,.79],[1.3,.80],[1.7,.79],[2.0,.74],[2.15,.66]],z),xCap=z=>L([[.97,.60],[1.3,.60],[1.7,.58],[2.0,.52],[2.15,.46]],z);
  const yAileAr=z=>L([[-2.30,.90],[-2.15,.98],[-1.95,1.03],[-1.78,1.06],[-1.40,1.08],[-1.117,1.084]],z),xAileAr=z=>L([[-2.30,.62],[-2.15,.72],[-1.95,.79],[-1.6,.82],[-1.2,.81]],z),
        xMalle=z=>L([[-2.30,.50],[-2.15,.56],[-1.95,.60],[-1.78,.62]],z);
  // le dessous (le bas de caisse à 0,17 m, les boucliers plus hauts) et les passages de roue (le plan : r 0,41 devant, 0,42 derrière)
  const yBas=z=>L([[-2.40,.36],[-2.34,.27],[-2.0,.24],[-1.80,.20],[-.95,.17],[.95,.17],[1.80,.19],[2.25,.22],[2.40,.30]],z);
  const arc=(r,c)=>{const o=[];for(const t of [0,.25,.45,.6,.72,.82,.9,.96,1])o.push([+(r*Math.sin(t*Math.PI/2)).toFixed(4),+(c+r*Math.cos(t*Math.PI/2)).toFixed(4)]);o.push([r+.004,.16]);return o;};
  const ARF=arc(.395,.35),ARR=arc(.405,.35);
  const archY=(z,yb)=>Math.max(yb,U.arch(z,[ZF],ARF,yb),U.arch(z,[ZR],ARR,yb));
  // ---- LA SECTION : du bas (axe) au faîte (axe), toujours le MÊME nombre de points ----
  const bez=(a,c,b,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]];
  const brut=z=>{
    const yb=archY(z,yBas(z)),xm=xM(z),yt=yC(z),ym=Math.min(yM(z),yt-.25),s=[];
    let S,E,cuv=0;
    if(z>=ZPB){S=[Math.min(xAile(z),xm-.05),yt-L([[.97,.012],[1.6,.012],[1.9,.02],[2.1,.05],[2.2,.075]],z)];E=[xCap(z),yt-.008];cuv=1;}    // l'avant : ailes (elles descendent vers les phares), capot    // l'avant : ailes, capot
    else if(z>=ZLUN){S=[Math.min(xBelt(z),xm-.05),yBelt(z)];                                                                  // l'habitacle
      E=z>=ZBPB?[xBasePB(z),yBasePB(z)]:[xRail(z),Math.min(yRail(z),yt-.035)];}
    else if(z>=ZMALLE){S=[Math.min(mix(xAileAr(z),xBelt(z),lis(cl((z+1.30)/.26,0,1))),xm-.05),yAileAr(z)];E=[xLun(z),yt-.03];}  // la lunette entre les hanches
    else{S=[Math.min(xAileAr(z),xm-.05),Math.min(yAileAr(z),yt-L([[-2.2,.06],[-2.0,.02],[-1.78,.012]],z))];E=[xMalle(z),yt-.01];}                                // la malle
    // les raccords : l'aile avant fond dans la ceinture au pied du montant ; la ceinture dans la hanche à la custode
    const fA=lis(cl((z-ZPB)/.15,0,1));if(z>=ZPB&&fA<1)S=[mix(xBelt(z),S[0],fA),mix(yBelt(z),S[1],fA)];
    S[1]=Math.max(S[1],ym+.12);E[1]=Math.min(E[1],yt-.002);if(E[0]>S[0]-.03)E[0]=S[0]-.03;
    const xl=Math.min(xm-.10,.76);
    s.push([0,yb],[xl*.9,yb]);
    for(const t of [0,.3,.55,.78])s.push([mix(xl,xm,Math.sin(t*Math.PI/2)),mix(yb+.02,ym,t*t*(3-2*t))]);
    s.push([xm,ym]);
    // le flanc : il rentre de plus en plus vite jusqu'à la ceinture (la coupe des vues de face et de dos)
    for(const u of [.24,.48,.68,.83,.93]){const f=L([[0,0],[.24,.06],[.48,.17],[.68,.33],[.83,.55],[.93,.78],[1,1]],u);s.push([xm-(xm-S[0])*f,ym+(S[1]-ym)*u]);}
    s.push(S);
    // de l'épaule au bord : la vitre (elle rentre — la gouttière à 0,58), ou le dessus des ailes vers le capot
    {const c2=cuv?[mix(S[0],E[0],.45),Math.max(S[1],E[1])+.006]:[mix(S[0],E[0],.5)+.018,mix(S[1],E[1],.5)];for(const t of [.3,.6,.85])s.push(bez(S,c2,E,t));}
    s.push(E);
    // le bombé jusqu'à l'axe
    for(const t of [.86,.70,.52,.34,.17])s.push([t*E[0],yt-(yt-E[1])*Math.pow(t,2.2)]);
    s.push([0,yt]);
    for(let i=1;i<=12;i++)if(s[i][1]<s[i-1][1])s[i][1]=s[i-1][1];
    return s;};
  // le nez et la poupe : la dernière section complète, réduite en largeur et rognée au profil (la méthode de LA PERLE)
  const AV=2.33,AP=-2.32,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yC(z),b=yBas(z);
    if(z<AP){const b0=s0[0][1],ky=(t-b)/(s0[s0.length-1][1]-b0);return s0.map(p=>[p[0]*kx,b+(p[1]-b0)*ky]);} // (19/10) la poupe se resserre en BANDES : rognée au profil, ses points s'écrasaient sur la même hauteur et tordaient les facettes (l'éventail au-dessus du feu)
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const zs0=[];for(let z=-2.30;z<=2.30;z+=.10)zs0.push(+z.toFixed(3));
  for(const z of [2.33,2.36,2.38,2.395,2.403,2.407,-2.33,-2.36,-2.38,-2.385,-2.396,-2.40,ZPB,ZBPB,ZTOIT,ZLUN,ZMALLE,.78,.86,.92,.955,-1.10,-1.20,-2.275,-2.25,-2.225,-2.175,-2.15,-2.125,-2.05])zs0.push(z); // (19/10) sept tranches de plus aux hanches arrière : la poupe s'y arrondit vite en plan (0,47 → 0,80 m en 20 cm), une tranche tous les 10 cm y tordait les facettes
  for(const w of [ZF,ZR])for(const d of [.08,.17,.25,.32,.37,.40,.415,.43])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.filter(z=>z>=-2.40&&z<=2.407).sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.006);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=1?'k':'p');
  /* LA TÔLE DÉCOUPÉE (`bulleOutils.decoupe`, une zone = UNE vue) : les vitres sans cadre et leur joint noir, le montant fin entre la vitre de
     porte et la custode, le pare-brise et la lunette, la baguette chromée sous les vitres et celle du bas de caisse, les joints (portes,
     capot, malle) ; devant, la CALANDRE MAILLE (cadre chromé, barre verticale, losanges) et les trois prises d'air maille du bouclier ;
     derrière, les FEUX OVALES (le cœur rouge sombre, le bord) et l'encadrement de la plaque. */
  const PZ=X=>(628.7-X)/250,PY=Y=>(373.6-Y)/250;
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const miroir=P9=>P9.concat(P9.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));
  const cadre=P9=>O.gonfle(miroir(P9),.022).map(q=>[Math.abs(q[0]),q[1]]);
  // côté : les vitres (le plan : le haut sur la gouttière, la custode qui finit en pointe vers la lunette)
  const DLO=[[460,141],[480,124],[500,110],[525,88],[545,72],[570,62],[620,57],[700,57],[780,62],[860,75],[893,86],[905,94],[903,101],[890,108],[850,118],[780,127],[700,131],[600,133],[500,136]].map(q=>[PZ(q[0]),PY(q[1])]);
  const vit=(x,y,z)=>y>.9;
  zo('cote',O.gonfle(DLO,.02),'K',{al:.5,ou:vit});zo('cote',DLO,'g',{al:.5,ou:vit});
  zo('cote',[[PZ(770),PY(129)],[PZ(780),PY(129)],[PZ(808),PY(64)],[PZ(798),PY(63)]],'K',{al:.5,ou:vit});                                   // le montant fin
  zo('cote',O.bande(DLO.slice(14).concat([[PZ(460),PY(141)]]).map(q=>[q[0],q[1]-.016]),.006),'c',{al:.5,ou:(x,y,z)=>y>.86&&z>-.95&&z<.72});   // la baguette chromée sous les vitres
  // les portes (leur bord avant juste derrière l'aile, l'arrière qui descend en biais), le bas de caisse chromé
  zo('cote',O.bande([[.78,.93],[.785,.70],[.775,.45],[.76,.30],[.70,.255],[-.35,.255],[-.48,.30],[-.58,.50],[-.625,.75],[-.63,.95]],.0035),'j',{al:.55,ou:(x,y,z)=>y>.24&&y<1.0});
  zo('cote',O.bande([[.80,.235],[-.88,.235]],.007),'c',{al:.55,ou:(x,y,z)=>y<.3&&z>-.95&&z<.85});
  // dessus : le pare-brise (sa base cintrée) et la lunette, cerclés de noir ; le capot (ses bords sur les ailes, son nez) ; la malle
  const PB=[[.97,0],[.97,.20],[.955,.36],[.92,.48],[.86,.58],[.78,.66],[.70,.70],[.52,.645],[.335,.60],[.25,.585],[.235,.40],[.23,0]].map(q=>[q[0],q[1]]),
        LU=[[-1.05,0],[-1.05,.40],[-1.07,.52],[-1.16,.565],[-1.40,.58],[-1.60,.595],[-1.74,.585],[-1.78,.50],[-1.785,0]];
  const cad=P9=>O.gonfle(P9.concat(P9.slice(1,-1).reverse().map(q=>[q[0],-q[1]])),.026).map(q=>[q[0],Math.abs(q[1])]);
  const pbOu=(x,y,z)=>y>.9&&z>.1&&z<1.02,luOu=(x,y,z)=>y>1.0&&z<-.95&&z>-1.85;
  zo('dessus',cad(PB),'K',{al:.3,ou:pbOu});zo('dessus',PB,'g',{al:.3,ou:pbOu});
  zo('dessus',cad(LU),'K',{al:.3,ou:luOu});zo('dessus',LU,'g',{al:.3,ou:luOu});
  zo('dessus',O.bande([[1.03,0],[1.03,.56],[1.30,.60],[1.70,.585],[2.0,.52],[2.15,.40],[2.20,.20],[2.21,0]],.0035),'j',{al:.35,ou:(x,y,z)=>z>1.0});
  zo('dessus',O.bande([[-1.83,0],[-1.83,.58],[-1.95,.60],[-2.15,.555],[-2.25,.45],[-2.29,.25],[-2.30,0]],.0035),'j',{al:.35,ou:(x,y,z)=>z<-1.8});
  // face : la CALANDRE — un rectangle aux coins ronds, le haut cintré, un cadre chromé épais, une barre verticale, la maille en losanges
  const nez=(x,y,z)=>z>2.0;
  const rr=(x0,y0,x1,y1,r,n)=>{const o=[],c=[[x1-r,y1-r,0],[x0+r,y1-r,1],[x0+r,y0+r,2],[x1-r,y0+r,3]];for(const [cx,cy,q] of c)for(let i=0;i<=(n||4);i++){const a=(q+i/(n||4))*Math.PI/2;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return o;};
  // une ligne coupée à un rectangle (Liang-Barsky) : la maille ne déborde jamais de son cadre
  const clip=(a,b,x0,y0,x1,y1)=>{let t0=0,t1=1;const dx=b[0]-a[0],dy=b[1]-a[1];for(const [p,q] of [[-dx,a[0]-x0],[dx,x1-a[0]],[-dy,a[1]-y0],[dy,y1-a[1]]]){if(p===0){if(q<0)return null;continue;}const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r;}else{if(r<t0)return null;if(r<t1)t1=r;}}return [[a[0]+t0*dx,a[1]+t0*dy],[a[0]+t1*dx,a[1]+t1*dy]];};
  const maille=(v,x0,y0,x1,y1,pas,k,w,ou)=>{const h=y1-y0;for(let x=x0-h;x<=x1+h;x+=pas)for(const s of [1,-1]){const L9=clip([x,y0],[x+s*h,y1],x0,y0,x1,y1);if(L9&&Math.hypot(L9[1][0]-L9[0][0],L9[1][1]-L9[0][1])>.01)zo(v,O.bande(L9,w),k,{al:.3,ou});}};
  const GR=rr(-.425,.505,.425,.815,.055,5).map(q=>[q[0],q[1]+.02*(1-(q[0]/.425)**2)*(q[1]>.7?1:0)]);
  const GRi=O.gonfle(GR,-.022);   // (19/10) le cadre 2,2 cm (3,4 : un tube de plastique)
  // (la calandre elle-même est un VOLUME, plus bas : son cadre chromé dépasse du nez comme sur la vraie)
  // les prises d'air du bouclier : la grande au milieu, deux sur les côtés (la maille noire)
  const bas=(x,y,z)=>z>2.1&&y<.48;
  for(const P9 of [rr(-.47,.25,.47,.37,.04,3),rr(.56,.26,.86,.41,.05,3)]){zo('face',P9,'K',{al:.3,ou:bas});}
  zo('face',rr(-.86,.26,-.56,.41,.05,3),'K',{al:.3,ou:bas});
  maille('face',-.44,.265,.44,.355,.05,'n',.003,bas);for(const s of [1,-1])maille('face',s>0?.585:-.835,.28,s>0?.835:-.585,.39,.05,'n',.003,bas);
  // dos : les FEUX OVALES (le contour, la lentille rouge, le cœur sombre) au coin, sous la ligne de la malle ; l'encadrement de la plaque
  const ov=(cx,cy,rx,ry,a,n)=>{const o=[];for(let i=0;i<(n||20);i++){const t=i/(n||20)*Math.PI*2,x=Math.cos(t)*rx,y=Math.sin(t)*ry;o.push([cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]);}return o;};
  const feu=(x,y,z)=>z<-2.0&&y>.6&&y<1.05;
  zo('dos',ov(.66,.84,.215,.095,.20,24),'c',{al:.25,ou:feu});zo('dos',ov(.66,.84,.20,.082,.20,24),'L',{al:.25,ou:feu});zo('dos',ov(.66,.84,.10,.04,.20,18),'r',{al:.25,ou:feu});
  zo('dos',[[-.25,.47],[.25,.47],[.25,.62],[-.25,.62]].map(q=>[q[0],q[1]]),'k',{al:.25,ou:(x,y,z)=>z<-2.2&&y<.66});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.e_anglaise&&SHAPES.e_anglaise.length===1)?(SHAPES.e_anglaise._tole||(SHAPES.e_anglaise._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  if(K.muet)return;
  // ---- LES DÉTAILS (plantés dans la tôle ou posés à plus de 2 cm : rien ne clignote) ----
  const P=K.kit(PAL);P.ech=true;
  const dansS=(s,x,y)=>{let c=false;const n=s.length;for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        zAv=(x,y)=>{let a=1.95,b=2.41;if(!dansS(sect(a),x,y))return a;for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;},
        zAr=(x,y)=>{let a=-1.95,b=-2.41;if(!dansS(sect(a),x,y))return a;for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;};
  /* LES QUATRE PHARES RONDS (les photos : l'intérieur plus grand, l'extérieur plus petit, chacun dans son cerclage chromé, une optique
     ronde au centre de la glace) — chacun posé SUR la tôle (la tranche la plus en avant qui contient son centre) et tourné comme le coin. */
  P.sym(sd=>{for(const [x,y,r,dx] of [[.565,.685,.098,.16],[.79,.70,.085,.42]]){const z0=zAv(x,y),c=[sd*x,y,z0-.008],d=[sd*dx,.06,1];
      O.tour(P,'p',[[r+.012,-.10],[r+.013,-.01],[r+.010,0]],24,c,d);
      O.tour(P,'c',[[r+.010,0],[r+.011,.010],[r+.004,.020],[r-.006,.022]],24,c,d);
      O.tour(P,'C',[[r-.006,.022],[r*.80,.026],[r*.62,.030]],22,c,d);                              // la cuvette chromée du réflecteur
      O.tour(P,'W',[[r*.62,.030],[r*.50,.033]],20,c,d);                                              // l'anneau clair
      O.tour(P,'c',[[r*.50,.033],[r*.46,.040],[r*.40,.044]],18,c,d);                                 // la bague de l'optique
      O.tour(P,'C',[[r*.40,.044],[r*.30,.054],[r*.16,.060],[0,.062]],18,c,d);}});                   // l'optique ronde (chrome fumé : une lentille sombre faisait des yeux de dessin animé)
  /* LA CALANDRE MAILLE, en volume : un plan penché comme le nez (21° : le nez recule de 0,39 m par mètre de haut), posé 1,5 cm devant la
     tôle au milieu — le fond noir et le cadre chromé (un anneau extrudé) s'enfoncent dans le nez, la maille en losanges sur deux
     épaisseurs (1,6 cm d'écart : les barres se croisent sans jamais se toucher à plat), la barre verticale chromée devant. */
  {const a9=Math.atan(.39),y0=.66,z0=zAv(0,y0)+.016,forme=P9=>{const s=new THREE.Shape();P9.forEach((q,i)=>i?s.lineTo(q[0],q[1]-y0):s.moveTo(q[0],q[1]-y0));return s;};
    const ext=(sh,d,w0)=>{const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,w0);return g;};
    const fond=ext(forme(GRi),.14,-.15);P.put('K',fond,0,y0,z0,-a9,0,0);
    // (le cadre : une bande entre le contour et le contour rentré, ses deux parois — construite à la main, la triangulation à trou le remplissait)
    {const n=GR.length,v=[],q=(x,y,w)=>v.push(x,y-y0,w),quad=(a,b,c,d)=>{q(...a);q(...b);q(...c);q(...a);q(...c);q(...d);};
      for(let i=0;i<n;i++){const j=(i+1)%n,A=GR[i],B=GR[j],C=GRi[j],D=GRi[i];
        quad([A[0],A[1],.014],[D[0],D[1],.014],[C[0],C[1],.014],[B[0],B[1],.014]);
        quad([A[0],A[1],-.09],[A[0],A[1],.014],[B[0],B[1],.014],[B[0],B[1],-.09]);
        quad([D[0],D[1],.014],[D[0],D[1],-.09],[C[0],C[1],-.09],[C[0],C[1],.014]);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
      const A0=GR.slice(0,3),ar=(A0[1][0]-A0[0][0])*(A0[2][1]-A0[0][1])-(A0[1][1]-A0[0][1])*(A0[2][0]-A0[0][0]);if(ar<0)g.index=null;
      if(ar<0){const p9=g.attributes.position.array;for(let k=0;k<p9.length;k+=9)for(let m=0;m<3;m++){const s=p9[k+3+m];p9[k+3+m]=p9[k+6+m];p9[k+6+m]=s;}}
      g.computeVertexNormals();P.put('F',g,0,y0,z0,-a9,0,0);}
    const vy=.79-.53,pas=.06;for(const [s9,w9] of [[1,-.004],[-1,.012]])for(let x=-.398-vy;x<=.398+vy;x+=pas){const L9=clip([x,.53],[x+s9*vy,.79],-.398,.53,.398,.79);if(!L9)continue;
      const dx=L9[1][0]-L9[0][0],dy=L9[1][1]-L9[0][1],l=Math.hypot(dx,dy);if(l<.012)continue;const g=new THREE.BoxGeometry(.007,l,.008);g.rotateZ(-Math.atan2(dx,dy));
      g.translate((L9[0][0]+L9[1][0])/2,(L9[0][1]+L9[1][1])/2-y0,w9);P.put('C',g,0,y0,z0,-a9,0,0);}
    const bar=new THREE.BoxGeometry(.016,.30,.012);bar.translate(0,.66-y0,.02);P.put('c',bar,0,y0,z0,-a9,0,0);}
  // les rétros (couleur caisse, glace noire vers l'arrière), les poignées chromées, la trappe à essence chromée sur la hanche droite
  const xTole=(z,y)=>{const s=sect(z);for(let i=1;i<=13;i++){const a=s[i-1],b=s[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return xM(z);};
  P.sym(sd=>{const xb=xTole(.62,.95);const g=new THREE.SphereGeometry(1,16,10),a=g.attributes.position;
    for(let i=0;i<a.count;i++){const f=v=>Math.sign(v)*Math.pow(Math.abs(v),.62);a.setXYZ(i,f(a.getX(i)),f(a.getY(i)),f(a.getZ(i)));}
    P.put('p',g,sd*(xb+.13),1.02,.60,0,sd*.12,0,.10,.055,.065);P.put('K',new THREE.PlaneGeometry(1,1),sd*(xb+.135),1.02,.534,0,Math.PI,0,.17,.085,1);
    P.box('k',.05,.04,.08,sd*(xb+.03),.985,.62);
    const xh=xTole(-.32,.84);P.box('c',.02,.026,.17,sd*(xh+.009),.84,-.32);});
  {const xf=xTole(-1.70,1.0),n=[1,-(xTole(-1.70,1.03)-xTole(-1.70,.97))/.06,-(xTole(-1.67,1.0)-xTole(-1.73,1.0))/.06];   // (19/10) la trappe POSÉE sur la hanche, tournée comme elle (un disque droit qui débordait)
    O.tour(P,'c',[[.055,-.012],[.055,.001],[.05,.005],[.02,.007],[0,.007]],16,[xf-.002,1.0,-1.70],n);}
  // les essuie-glaces couchés au pied du pare-brise
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  for(const [x0,x1] of [[-.55,.05],[.0,.55]])barre('k',[x0,1.018,.985-Math.abs(x0)*.15],[x1,1.024,.985-Math.abs(x1)*.15],.012,.012);
  // la plaque (la vraie s'y pose : plqDessinee), dans son encadrement du bouclier arrière
  P.box('l',.42,.10,.012,0,.545,zAr(0,.545)-.012);
  K.commit(P);
  /* ---- LES ROUES : la jante de 19 pouces de la 1re génération — six branches qui se TORDENT en hélice vers la jante, une lèvre rivetée,
     le cache central sombre (sans logo) ; pneu bas ---- */
  const JW=.26,hw=JW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x18191b},s:{g:'m',c:0xa9aeb6},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114},n:{g:'m',c:0x24262b}});
  J.lathe('k',[[.245,-hw],[R*.88,-hw],[R*.98,-hw*.7],[R,-hw*.3],[R,hw*.3],[R*.98,hw*.7],[R*.88,hw],[.245,hw]],26,0,0,0,'x');
  J.lathe('c',[[.245,hw-.004],[.242,fx+.012],[.232,fx+.010],[.226,fx+.004]],30,0,0,0,'x');                    // la lèvre polie
  J.lathe('s',[[.226,fx+.004],[.222,fx-.004],[.214,fx-.006]],30,0,0,0,'x');                                     // la marche rivetée
  for(let i=0;i<12;i++){const a=i*Math.PI/6;J.box('c',.008,.008,.008,fx-.002,Math.cos(a)*.218,Math.sin(a)*.218,a,0,0);}
  J.lathe('d',[[.245,-hw+.02],[.245,fx-.06],[0,fx-.06]],20,0,0,0,'x');
  J.lathe('s',[[.07,fx-.01],[.064,fx+.008],[.052,fx+.012],[.034,fx+.013]],20,0,0,0,'x');                       // le moyeu (19/10 : argent jusqu'au petit cache)
  J.lathe('n',[[.034,fx+.013],[.02,fx+.016],[0,fx+.017]],18,0,0,0,'x');                                        // le cache sombre, petit
  for(let i=0;i<6;i++){const a=i*Math.PI/3,pt=(r,d)=>[r*Math.cos(a+d),r*Math.sin(a+d)];
    J.prism('s',[pt(.06,-.20),pt(.12,-.13),pt(.19,-.03),pt(.229,.04),pt(.229,.22),pt(.17,.17),pt(.11,.10),pt(.06,.20)],.03,fx-.012);}   // les six branches en hélice (19/10 : jusqu'à la marche de la jante, elles s'arrêtaient 1 cm avant)
  const JG=J.done();
  return {hl:[.565,.685,2.33],tl:[.66,.84,-2.32],wx:.80,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
