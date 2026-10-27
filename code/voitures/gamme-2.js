  c_silencieuse:function(K){
  /* (13/10, « plus ressemblante ») la berline électrique de Palo Alto : un nez plus HAUT et ROND vu de dessus (c'était un coin
     plat), la coque qui rentre sous la taille, une hanche arrière qui se gonfle, les phares en amande qui suivent l'aile. */
  const hmp=(z,w,r)=>{const d=Math.abs(z-w)/r;return d>=1?0:1-d*d;};
  const U=LPU,R=.355,ZF=1.52,ZR=-1.44,LF=2.485;
  const P=K.kit(fentePal({p:{g:'p',c:0xc5cbd3,grad:[0x7f8894,0xbcc3cc,0xeef0f2]},T:{g:'s',c:0x141a24},k:{g:'m',c:0x131417},K:{g:'g',c:0x0c0e12},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xf2f7ff},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}}));   // (19/10) fentePal : 'J' la fente, 'Jf' son fil (la FENTE C)
  const AR=[[0,2*R+.05],[R*.62,2*R+.03],[R*.98,R*1.22],[R+.12,.24]];
  const zs=[-LF,-2.44,-2.34,-2.20,-2.05,-1.80,-1.40,-.40,-.30,.05,.80,.95,1.60,2.10,2.25,2.36,2.44,LF];
  for(const w of [ZF,ZR])for(const d of [R*.62,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  /* (2026-10-19, l'AFFINEMENT de BOÎTES : « une silhouette de Cybertruck » — toit en arête, pavillon à deux pans, nez en coin) : le pavillon
     en ARC du pare-brise à la malle (des points tous les 30-40 cm), la coupe du toit BOMBÉE (quatre facettes au lieu d'une arête), le nez arrondi. */
  const yC=z=>U.lin([[-LF,.66],[-2.45,.92],[-2.40,1.04],[-2.33,1.075],[-2.20,1.09],[-2.05,1.13],[-1.80,1.21],[-1.40,1.29],[-1.00,1.375],[-.60,1.425],[-.20,1.445],[.10,1.43],
                     [.40,1.35],[.70,1.20],[.95,1.03],[1.60,.935],[2.10,.875],[2.25,.85],[2.36,.815],[2.44,.76],[LF,.66]],z),
        yB=z=>U.lin([[-LF,.62],[-2.45,.88],[-2.40,.99],[-2.33,1.03],[-2.05,1.02],[-1.40,1.00],[.95,.94],[1.60,.905],[2.10,.845],[2.25,.815],[2.36,.78],[2.44,.715],[LF,.62]],z)+.025*hmp(z,ZR,.9),
        yR=z=>U.lin([[-2.05,1.07],[-1.80,1.16],[-1.40,1.26],[-1.00,1.33],[-.60,1.37],[-.20,1.385],[.10,1.365],[.40,1.29],[.70,1.15],[.95,.99]],z),
        xW=z=>U.lin([[-LF,.72],[-2.44,.83],[-2.36,.90],[-2.24,.95],[-2.10,.975],[1.70,.975],[1.95,.965],[2.10,.945],[2.22,.915],[2.34,.86],[2.42,.78],[2.47,.68],[LF,.56]],z)+.012*hmp(z,ZR,.8),
        xR=z=>U.lin([[-2.05,.74],[-1.40,.68],[-.40,.65],[.05,.67],[.95,.80]],z),
        cab=z=>z>-2.06&&z<.96;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.24),xw=xW(z),c=yC(z),B=yB(z),y2=Math.max(.36,yb+.05),yM=Math.max(y2+.01,Math.min(.62,B-.14));
    let s5,s6,s7,s8,s9;
    if(cab(z)){const yG=B+.025,r=Math.max(yG+.012,yR(z)),xr=xR(z),xG=xw-.09;
      s5=[xG+.012,yG-.012];s6=[xG,yG];s7=[xr+.012,Math.max(yG+.004,r-.02)];s8=[xr,r];s9=[xr*.5,Math.max(r+.004,c-.012)];}
    else{s5=[xw-.06,B+.008];s6=[xw-.08,B+.012];s7=[xw-.26,Math.max(B+.016,c-.03)];s8=[xw-.28,Math.max(B+.02,c-.025)];s9=[Math.min(.30,xw*.45),Math.max(B+.024,c-.008)];}
    const cT=Math.max(s9[1]+.002,c),dm=(u,x0,y0)=>[x0*u,cT-(cT-y0)*u*u];                                       // le bombé, du bord au milieu
    return [[0,yb],[xw-.12,yb],[xw-.045,y2],[xw+.005,yM],[xw-.04,B],s5,s6,s7,s8,dm(.78,s8[0],s8[1]),dm(.52,s8[0],s8[1]),dm(.26,s8[0],s8[1]),[0,cT]];   // (19/10) la coque qui RENTRE dessous et sous l'épaule (les flancs étaient une dalle)
  },(j,z)=>{
    if(j===0)return 'k';
    if(j<0)return 'p';
    if(j===1)return (z>2.30||z<-2.30)?'p':'k';
    const gl=z>-1.86&&z<.80;
    if(cab(z)){
      if(j===5||j===7)return gl||z<0?'k':'p';                                   // LE JONC noir qui cercle les vitres (19/10 : le custode arrière noir, comme la vraie — c'était un triangle blanc dans la vitre)
      if(j===6)return gl?((z>-.40&&z<-.30)?'k':'g'):'k';                         // vitres, montant B noir
      if(j>=8)return (z>.05)?'g':(z>-1.40?'T':'g');                              // pare-brise · TOIT DE VERRE fumé · lunette
    }
    return 'p';});
  // LE NEZ : le CÔNE noir des premières années (un ovale laqué cerclé de chrome, le T au milieu), une fente basse, deux écopes de coin, les phares effilés
  P.plate('c',[[-.36,.55],[.36,.55],[.40,.60],[.37,.66],[-.37,.66],[-.40,.60]],.02,LF-.006);P.plate('K',[[-.33,.565],[.33,.565],[.37,.60],[.34,.648],[-.34,.648],[-.37,.60]],.02,LF+.002);
  P.box('c',.10,.016,.01,0,.632,LF+.026);P.box('c',.016,.06,.01,0,.605,LF+.026);
  P.plate('k',[[-.36,.30],[.36,.30],[.42,.37],[.38,.45],[-.38,.45],[-.42,.37]],.03,LF-.02);P.plate('c',[[-.34,.455],[.34,.455],[.34,.47],[-.34,.47]],.03,LF-.018);
  P.sym(sd=>{
    P.prism('k',[[LF-.10,.30],[LF-.13,.44],[LF-.22,.45],[LF-.20,.30]],.14,sd*.70);
    // PHARES EFFILÉS : une amande couchée sur la pente du nez, deux projecteurs dedans
    const eye=new THREE.Shape();eye.moveTo(-.19,.02);eye.lineTo(.12,.05);eye.lineTo(.21,.03);eye.lineTo(.19,-.02);eye.lineTo(.02,-.04);eye.lineTo(-.18,-.02);
    P.put('k',new THREE.ExtrudeGeometry(eye,{depth:.02,bevelEnabled:false}),sd*.62,.826,2.30,-1.13,0,0,sd*1.25,1.45,1);
    P.put('W',new THREE.ExtrudeGeometry(eye,{depth:.02,bevelEnabled:false}),sd*.622,.838,2.29,-1.13,0,0,sd*1.10,.85,1);
    for(const x of [.55,.69])P.put('W',new THREE.CylinderGeometry(.03,.03,.02,8),sd*x,.84,2.305,-1.13+Math.PI/2,0,0);
    // FLANCS : poignées affleurantes (un trait d'alu), rétros, bas de caisse noir
    for(const z of [.40,-.75])P.box('c',.012,.025,.20,sd*.965,.975,z);
    P.box('p',.10,.08,.20,sd*1.02,1.03,.78);P.box('k',.08,.03,.14,sd*.96,.99,.80);
    P.box('k',.02,.08,2.00,sd*(xW(.04)-.08),.26,.04);
    for(const [z,y,h] of [[.80,.70,.44],[-1.30,.86,.15]]){P.box('J',.006,h,.007,sd*(xW(z)+.002),y,z,z>0?-.12:.10);P.box('Jf',.006,h,.003,sd*(xW(z)+.002),y,z+.006,z>0?-.12:.10);}   // les ouvrants des quatre portes (19/10 : la FENTE C, plus de trait noir)
    // LA POUPE : feux fins qui enveloppent le coin, becquet affleurant
    P.box('L',.50,.075,.06,sd*.60,.905,-2.39);P.box('L',.03,.06,.24,sd*.94,.915,-2.24,0,sd*.18,0);
    P.box('k',.50,.02,.062,sd*.60,.86,-2.39);
  });
  P.box('c',.66,.025,.05,0,.905,-2.395);                                        // le jonc de malle
  P.box('p',1.40,.02,.12,0,1.04,-2.18);                                        // le becquet de malle
  P.box('k',1.30,.10,.03,0,.33,-LF+.01);                                       // diffuseur
  for(let i=0;i<5;i++)P.box('k',.02,.08,.14,(i-2)*.24,.30,-2.44);
  P.box('k',.40,.12,.02,0,.60,-2.465);                                         // plaque (vierge)
  // (19/10) la barre de pavillon RETIRÉE : plate sur un toit désormais bombé, ses bouts flottaient au-dessus (une arête vue de profil)
  K.commit(P);
  return {hl:[.66,.80,2.31],tl:[.62,.90,-2.37],wx:.83,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'multi',n:10,jante:0x4a5059}};
},
  d_samourai:function(K){
  /* (13/10, « plus ressemblant ») la GT-R des années 2000 est HAUTE et carrée : capot presque à plat jusqu'à un nez droit (il
     plongeait en coin), pare-brise plus droit, phares en amande remontés sous le bord du capot. */
  const U=LPU,R=.34,ZF=1.37,ZR=-1.30;
  const P=K.kit({p:{g:'p',c:0x3b2c4e},   // (13/10, Léo : « plus mauve, comme sur la photo ») le VIOLET NUIT, plus le bleu roi
    C:{g:'s',c:0x1b1d22},h:{g:'s',c:0xa9b1bc},e:{g:'m',c:0xc8102e},K:{g:'g',c:0x16181c},k:{g:'m',c:0x131417},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x18212c},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    R:{g:'l',c:0x7a1018},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) R les catadioptres, w la plaque éclairée — aucune famille de plus
  const AR=[[0,2*R+.05],[R*.75,2*R+.03],[R+.08,R*1.15],[R+.14,.30]];
  const zs=[-2.30,-2.25,-2.20,-1.50,-.85,-.70,-.20,-.13,.02,.10,.62,.68,1.40,2.10,2.24,2.30];
  for(const w of [ZF,ZR])for(const d of [R*.75,R+.08,R+.14])zs.push(w-d,w+d);
  zs.push(.52,.59,.66,2.06,2.13,-.62,-.70,-.78,-2.08,-2.15,-2.22);           // (relief) les rampes des ailes et de la hanche
  zs.sort((a,b)=>a-b);for(let i=zs.length-1;i>0;i--)if(zs[i]-zs[i-1]<.005)zs.splice(i,1); // (sans doublon : une bande nulle)
  const yC=z=>U.lin([[-2.30,1.00],[-2.25,1.025],[-2.20,1.035],[-1.50,1.05],[-.85,1.345],[.02,1.36],[.68,.975],[1.40,.955],[2.10,.915],[2.24,.895],[2.30,.86]],z),
        yB=z=>U.lin([[-2.30,.95],[-2.20,.98],[-1.50,1.00],[-.80,1.00],[.68,.955],[1.40,.93],[2.10,.885],[2.24,.865],[2.30,.835]],z),
        xW=z=>U.lin([[-2.30,.83],[-2.24,.87],[-2.00,.885],[2.00,.885],[2.24,.86],[2.30,.82]],z),
        xR=z=>U.lin([[-1.50,.80],[-.85,.70],[.02,.68],[.68,.78]],z),
        cab=z=>z>-1.50&&z<.68;
  /* ===== LE RELIEF DU FLANC (2026-10-20, Léo : « le relief visible quand on tourne autour » ; l'étude de la gamme au garage : n° 1 des plus
     plates, un flanc d'UNE dalle qui s'allumait d'un bloc) ===== la GT-R en PANS : les AILES qui débordent au-dessus des roues (la hanche
     arrière plus forte que l'aile avant), la PORTE en creux entre elles et qui rentre vers le bas (elle regarde le sol : plus sombre), le
     seuil en marche au-dessus de la jupe, l'ARÊTE franche à hauteur de poignée, l'ÉPAULE qui rentre jusqu'à la ceinture (elle regarde le
     ciel : claire). Une porte en creux mais droite resterait UN pan : elle penche. `flanc(z)` = les points de la demi-section, `xFl(z,y)`
     le flanc à une hauteur (ouïe, poignée, rétro s'y posent). */
  const lis=t=>{t=U.cl(t,0,1);return t*t*(3-2*t);},
        aile=z=>.022*lis((z-.52)/.14)*lis((2.20-z)/.14)+.032*lis((-.62-z)/.16)*lis((z+2.22)/.14),
        flanc=z=>{const yb=U.arch(z,[ZF,ZR],AR,.30),xw=xW(z),b=Math.max(yB(z),yb+.14),f=aile(z),ya=Math.max(Math.min(.84,yB(z)-.05),yb+.09);
          return [[0,yb],[xw-.05,yb],[xw+.004,Math.max(yb+.03,.37)],[xw-.028+f*.5,Math.max(yb+.05,.44)],[xw-.004+f*.85,Math.max(yb+.07,.63)],
                  [xw+.012+f,ya],[xw-.034,b],[xw-.075,b+.02]];},
        xFl=(z,y)=>{const s=flanc(z);for(let i=2;i<6;i++)if(y<=s[i+1][1])return s[i][0]+(s[i+1][0]-s[i][0])*U.cl((y-s[i][1])/((s[i+1][1]-s[i][1])||1),0,1);return s[6][0];};
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.30),xw=xW(z),c=yC(z),b=Math.max(yB(z),yb+.14);
    const s=flanc(z);
    if(cab(z)){const y6=Math.max(c-.04,b+.03);s.push([xR(z),y6],[xR(z)-.14,Math.max(y6+.004,c-.005)],[0,c+.005]);}
    else s.push([xw-.22,Math.max(b+.03,c-.02)],[xw-.45,Math.max(b+.035,c-.008)],[0,Math.max(b+.04,c)]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===1&&z>-2.0&&z<2.0)return 'C';                                      // la jupe latérale
    if(j<0||j<=6||!cab(z))return 'p';                                       // (relief) deux bandes de plus au flanc : seuil, porte, arête, épaule
    if(j===7){if(z<-.70||z>.62)return 'p';return (z>-.20&&z<-.13)?'K':'g';}  // custode, pied B noir, portière
    return (z>.02||z<-.85)?'g':'p';});                                       // pare-brise, lunette, pavillon
  // LE GRAND AILERON sur deux mâts, et son volet
  P.box('p',1.54,.045,.28,0,1.225,-2.04,-.06);
  P.box('C',1.48,.03,.09,0,1.262,-2.18,-.35);
  P.sym(sd=>{
    P.box('p',.06,.20,.14,sd*.50,1.12,-2.02);
    P.box('p',.03,.13,.32,sd*.77,1.18,-2.06);                                // les flasques
    // LES PHARES (13/10, « retravaille le détail ») : un bloc anguleux, pointu vers la calandre et plus haut côté aile, au BOÎTIER
    // ARGENT (il était fumé) ; deux petits projecteurs (cerclage noir, lentille) au lieu de deux gros yeux qui brillaient
    // (13/10, Léo : « un peu plus arrondie sur les coins des phares, en haut ») les deux coins HAUTS en arrondi
    const rond=Q=>{const o=[];for(let i=0;i<Q.length;i++){const [x,y,r]=Q[i],a=Q[(i+Q.length-1)%Q.length],c=Q[(i+1)%Q.length];if(!r){o.push([x,y]);continue;}
      const la=Math.hypot(a[0]-x,a[1]-y),lc=Math.hypot(c[0]-x,c[1]-y),p0=[x+(a[0]-x)*r/la,y+(a[1]-y)*r/la],p2=[x+(c[0]-x)*r/lc,y+(c[1]-y)*r/lc];
      for(let k=0;k<=5;k++){const t=k/5,u=1-t;o.push([u*u*p0[0]+2*u*t*x+t*t*p2[0],u*u*p0[1]+2*u*t*y+t*t*p2[1]]);}}return o.map(p=>[sd*p[0],p[1]]);};
    P.plate('K',rond([[.262,.716,.012],[.60,.671,0],[.812,.683,.03],[.842,.806,.075],[.40,.796,.07]]),.014,2.30);
    P.plate('h',rond([[.288,.718,.01],[.60,.683,0],[.80,.692,.024],[.828,.795,.065],[.41,.785,.06]]),.014,2.306);
    for(const [x,r] of [[.46,.042],[.66,.054]]){P.cyl('K',r+.012,.02,12,sd*x,.738,2.318,'z');P.cyl('W',r,.02,12,sd*x,.738,2.324,'z');P.cyl('h',r*.35,.02,8,sd*x,.738,2.33,'z');}
    P.box('W',.20,.008,.01,sd*.62,.700,2.322);                                 // le liseré de veilleuse sous les projecteurs
    P.box('O',.10,.03,.02,sd*.70,.60,2.312);                                  // le clignotant, dans le bouclier
    // LES ÉCOPES DE FREINS aux coins du bouclier : la bouche noire en biais, et son aileron
    P.plate('k',[[.56*sd,.30],[.78*sd,.30],[.80*sd,.50],[.62*sd,.50]],.02,2.30);P.box('p',.02,.18,.04,sd*.69,.40,2.31,0,0,-sd*.10);
    P.box('C',.02,.12,.16,sd*(xFl(.80,.66)+.008),.66,.80);                   // l'ouïe d'aile avant (relief : posée sur l'aile qui déborde)
    {const xr=xFl(.70,.99)+.025;P.prism('K',[[.80,.97],[.58,.97],[.62,1.02],[.74,1.02]],.06,sd*xr);P.box('p',.07,.09,.18,sd*(xr+.05),1.03,.66,0,sd*.12,0);} // rétro sur son pied, contre le montant (relief : sur l'épaule rentrée)
    P.box('K',.02,.03,.12,sd*(xFl(0,.80)+.006),.80,.00);                       // poignée (relief : juste sous l'arête)
    // LES QUATRE FEUX RONDS
    for(const x of [.46,.70]){P.cyl('L',.10,.03,12,sd*x,.83,-2.31,'z');
      P.cyl('K',.05,.02,8,sd*x,.83,-2.323,'z');P.cyl(x<.5?'W':'L',.032,.02,8,sd*x,.83,-2.328,'z');}
    P.box('K',.20,.24,.02,sd*.585,.83,-2.302);
  });
  // LA CALANDRE : une fente noire entre les phares, le BADGE rouge et chrome au milieu, une barre laquée dessous
  P.plate('k',[[-.25,.705],[.25,.705],[.27,.785],[-.27,.785]],.02,2.30);
  P.box('c',.11,.04,.012,0,.745,2.326);P.box('e',.075,.022,.012,0,.745,2.332);
  // LA GRANDE BOUCHE en trapèze, plus large en bas : l'échangeur ARGENT derrière une grille noire
  P.plate('k',[[-.52,.29],[.52,.29],[.45,.565],[-.45,.565]],.02,2.30);
  P.plate('h',[[-.44,.33],[.44,.33],[.39,.53],[-.39,.53]],.012,2.312);
  for(let i=0;i<7;i++)P.box('C',.92-i*.018,.012,.01,0,.33+i*.033,2.33);
  for(let i=-6;i<=6;i++)P.box('C',.012,.22,.01,i*.068,.43,2.331);
  P.prism('C',[[2.12,.30],[2.30,.30],[2.30,.275],[2.345,.235],[2.345,.205],[2.12,.205]],1.66,0);   // la lame carbone, SOUDÉE sous le bouclier (affinement : elle flottait 7 cm dessous)…
  P.prism('C',[[2.30,.27],[2.40,.232],[2.40,.205],[2.30,.205]],.70,0);                               // …qui avance au milieu
  // L'ÉVENT DE CAPOT carbone : un bossage, sa bouche noire devant
  P.prism('C',[[1.70,.935],[2.12,.905],[2.12,.935],[1.80,.955]],.46,0);P.box('K',.40,.022,.01,0,.92,2.124);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « refais aussi l'arrière de : ROSSO 40, LE SAMOURAÏ, LA DAYTONA, LA FÉLINE, L'ICEBERG » — la revue des poupes, 2e tour) : les feux ronds en anneaux étaient bons ; la plaque était un pavé noir, le bas plat,
     le pot une pastille. Désormais le BOUCLIER dans la couleur et son pli, la PLAQUE ENCASTRÉE et sa lampe, l'antibrouillard au milieu,
     les catadioptres, le grand DIFFUSEUR carbone à ailettes où s'encastre le gros canon de Léo (ECH_POTS.d_samourai, inchangé). */
  P.prism('p',[[-2.25,.67],[-2.335,.66],[-2.36,.60],[-2.355,.43],[-2.31,.38],[-2.25,.38]],1.70,0);   // le bouclier
  P.box('K',1.66,.014,.012,0,.615,-2.356);                                                          // son pli
  P.box('K',.50,.15,.012,0,.52,-2.362);P.box('w',.44,.11,.012,0,.52,-2.369);P.box('W',.10,.014,.01,0,.602,-2.36); // la plaque encastrée, sa lampe
  P.box('L',.16,.045,.012,0,.42,-2.36);                                                             // l'antibrouillard
  P.sym(sd=>P.box('R',.10,.03,.012,sd*.70,.47,-2.357));                                             // les catadioptres
  P.box('C',1.40,.20,.16,0,.28,-2.30);for(const x of [-.60,-.45,-.30,-.15,0,.15,.62])P.box('k',.016,.19,.18,x,.28,-2.31); // le diffuseur, ses ailettes
  P.cyl('c',.07,.12,10,.39,.30,-2.33,'z');P.cyl('k',.05,.13,10,.39,.30,-2.33,'z'); // UN seul gros canon
  K.commit(P);
  return {hl:[.60,.738,2.33],tl:[.70,.83,-2.32],wx:.78,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.28,style:'multi',n:10,jante:0xb9bec6,branches:1}};
},
  d_vette:function(K){
  const U=LPU,R=.33,ZF=1.19,ZR=-1.25;
  const PAL={p:{g:'p',c:0x7a1e25},k:{g:'m',c:0x131417},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x18212c},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    r:{g:'l',c:0x9a0f1a},w:{g:'l',c:0xd9dce0}},P=K.kit(fentePal(PAL)); // (17/10, l'arrière v2) r, w (la plaque éclairée) — aucune famille de plus · (18/10) PAL nommée : les escamotables la reprennent · (19/10) + la FENTE (J, Jf)
  const AR=[[0,2*R+.04],[R*.70,2*R+.02],[R+.06,R*1.12],[R+.14,.26]];
  const zs=[-2.24,-2.20,-2.10,-1.85,-.90,-.80,-.30,.40,.45,1.80,2.10,2.20,2.24];
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.06,R+.14])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-2.24,.90],[-2.20,.95],[-2.10,.97],[-1.85,.99],[-.90,1.165],[-.30,1.18],[.45,.88],[1.80,.70],[2.10,.64],[2.20,.59],[2.24,.54]],z),
        yB=z=>U.lin([[-2.24,.86],[-2.10,.92],[-1.85,.94],[-.90,.90],[.45,.84],[1.80,.67],[2.10,.61],[2.20,.56],[2.24,.51]],z),
        xW=z=>U.lin([[-2.24,.84],[-2.18,.88],[-1.90,.90],[1.70,.90],[2.05,.86],[2.20,.80],[2.24,.74]],z),
        xR=z=>U.lin([[-1.85,.80],[-.90,.66],[-.30,.64],[.45,.76]],z),
        cab=z=>z>-1.85&&z<.45;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.26),xw=xW(z),c=yC(z),b=Math.max(yB(z),yb+.12);
    const s=[[0,yb],[xw-.06,yb],[xw,Math.max(yb+.04,.36)],[xw+.012,Math.max(yb+.07,.60)],[xw-.01,b],[xw-.08,b+.02]];
    if(cab(z)){const y6=Math.max(c-.04,b+.03);s.push([xR(z),y6],[xR(z)-.16,Math.max(y6+.004,c-.005)],[0,c]);}
    else s.push([xw-.28,Math.max(b+.02,c-.02)],[xw-.52,Math.max(b+.025,c-.006)],[0,Math.max(b+.03,c)]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j<0||j<=4||!cab(z))return 'p';
    if(z>-.90&&z<-.80)return 'K';                                             // l'arceau de targa
    if(j===5)return z<.40?'g':'p';                                            // vitre de portière, et LA BULLE qui s'enroule
    return (z<-.90||z>-.30)?'g':'p';});                                       // bulle, toit targa, pare-brise
  P.sym(sd=>{
    // LES ESCAMOTABLES, rangés à plat dans le capot : ici leur LOGEMENT noir ; le couvercle rouge et les phares pivotent (plus bas, après K.commit)
    P.box('k',.34,.012,.36,sd*.60,.677,1.90,.20);
    // les ouïes derrière les roues avant
    P.box('K',.02,.16,.18,sd*.905,.58,.60);
    for(let i=0;i<4;i++)P.box('p',.035,.012,.19,sd*.915,.525+i*.04,.60,0,0,-sd*.5);   // (affinement) des LAMES de tôle penchées (c'étaient des traits noirs)
    P.box('J',.02,.006,1.26,sd*.903,.73,1.075,.08);P.box('Jf',.02,.003,1.26,sd*.903,.7345,1.075,.08);   // LA LIGNE DE JOINT de la coquille (la FENTE C : l'ombre et son fil)
    for(const [a,b] of [[-2.10,-1.74],[-.76,.70],[1.68,1.98]]){P.box('p',.03,.03,b-a,sd*.905,.50,(a+b)/2,0,0,Math.PI/4);P.box('k',.012,.01,b-a,sd*.926,.50,(a+b)/2);} // (affinement) le jonc de la C4 : un fin jonc noir de 1 cm sur l'arête d'un PLI de tôle (c'était une bande noire de 4,5 cm collée à plat : un autocollant)
    P.box('k',.06,.07,.14,sd*.93,.92,.36);P.box('k',.06,.02,.04,sd*.88,.90,.36); // rétro
    P.box('k',.03,.08,.04,sd*.87,.86,.36);   // (2026-10-27, aucun rétro qui vole) son PIED, planté 2,5 cm dans la portière (le bras flottait 4 cm au-dessus)
    P.box('O',.16,.04,.02,sd*.58,.49,2.235);P.box('W',.12,.04,.02,sd*.36,.34,2.235);
    // QUATRE FEUX CARRÉS sur le tableau noir — (17/10, l'arrière v2) ENFONCÉS : un cerclage chromé qui dépasse, la cuvette noire, le verre
    // rouge en retrait, son cœur sombre et ses stries
    for(const x of [.36,.63]){
      for(const y of [.64,.80])P.box('c',.22,.02,.04,sd*x,y,-2.262);for(const dx of [-.10,.10])P.box('c',.02,.16,.04,sd*(x+dx),.72,-2.262);
      P.box('K',.18,.14,.03,sd*x,.72,-2.252);P.box('L',.17,.11,.01,sd*x,.72,-2.262);P.box('r',.08,.05,.01,sd*x,.72,-2.268);
      for(const y of [.69,.75])P.box('K',.17,.014,.006,sd*x,y,-2.27);}
    for(const x of [.30,.44])P.cyl('c',.045,.10,8,sd*x,.32,-2.26,'z');
  });
  P.box('k',1.44,.06,.03,0,.44,2.225);P.box('k',1.10,.07,.02,0,.34,2.225); // bouclier, fente
  P.box('K',1.52,.20,.02,0,.72,-2.242);                                     // le tableau noir de la poupe
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'étaient quatre
     carrés rouges plats, un bas noir plat et quatre pots en pastilles. Désormais les feux ENFONCÉS (dans le P.sym), et ici : le tableau EN
     CREUX entre deux lèvres de tôle, le BOUCLIER qui se replie sous la caisse et son pli, la PLAQUE, le DIFFUSEUR noir dont les ailettes
     encadrent les quatre sorties de Léo (ECH_POTS.d_vette, inchangé), le 3e feu stop. (Le bas noir plat est retiré.) */
  P.box('p',1.62,.035,.05,0,.835,-2.25);P.box('p',1.62,.035,.05,0,.605,-2.25);                // le tableau en creux
  P.prism('p',[[-2.16,.585],[-2.27,.575],[-2.30,.50],[-2.29,.43],[-2.24,.40],[-2.16,.40]],1.68,0); // le bouclier qui se replie
  P.box('K',1.60,.014,.012,0,.50,-2.302);                                                    // son pli
  P.box('K',.34,.12,.012,0,.48,-2.298);P.box('w',.30,.09,.012,0,.48,-2.306);                 // la plaque
  P.box('k',1.24,.18,.12,0,.30,-2.27);                                                       // le diffuseur…
  for(const x of [-.45,-.33,-.165,0,.165,.33,.45])P.box('K',.014,.16,.14,x,.30,-2.28);        // …ses ailettes entre les quatre sorties
  P.box('L',.30,.02,.012,0,.885,-2.247);                                                     // le 3e feu stop
  P.box('K',.30,.012,.14,0,.905,.46,-.35);                                   // essuie-glace caché
  K.commit(P);
  /* LES ESCAMOTABLES SE LÈVENT À LA NITRO (2026-10-18, Sacha : « la vette ne doit pas faire de lumière dans le shop et doit ouvrir ses phares
     que quand tu boost ») — c'était un couvercle soudé au capot, et le halo des phares brillait PAR-DESSUS (en boutique, de face). Désormais
     chaque escamotable est un BOÎTIER : dessus le couvercle rouge (fermé, il affleure le capot comme avant), dessous la face noire et ses DEUX
     PHARES RONDS. À la nitro il pivote d'un bloc (101° autour d'un axe calculé pour que la face se dresse DROITE, son bas arrière posé au bord
     avant du logement), le couvercle passe derrière : les quatre yeux de la C3. Fermés, rien n'éclaire : `CAR_PHK` (0 → 1, le levé) éteint le
     halo des phares, leur nappe au sol et leur lumière sur la route (voir carVit, lumTick). Au garage, en boutique, au menu : fermés ; pas de
     clin d'œil (celui de LA CERISE). `dbgPhares(1|0|null)` les force (le crochet de LA CERISE, partagé). */
  {const TH=Math.PI/2+.20,HB=.15,D=.16,PHV=[],PHG=K.add(new THREE.Group());
   const A0=[-D,-HB-.01],A1=[.14,-.14],dz=A1[0]-A0[0],dy=A1[1]-A0[1],d9=Math.hypot(dz,dy),h9=(d9/2)/Math.tan(TH/2),
         Pz=(A0[0]+A1[0])/2-dy/d9*h9,Py=(A0[1]+A1[1])/2+dz/d9*h9; // l'axe (repère du capot, z-y) qui envoie le bas arrière de la face, A0, sur A1
   for(const sd of [1,-1]){const Q=K.kit(PAL),T9=new THREE.Group(),piv=new THREE.Group(),bras=new THREE.Group();
     Q.box('p',.31,.02,.33,0,0,0);                                                // le couvercle : la tôle du capot
     Q.box('k',.30,HB,.32,0,-HB/2-.01,0);                                         // le boîtier
     for(const x of [-.072,.072]){Q.cyl('c',.063,.016,16,x,-HB-.016,.08);Q.cyl('W',.052,.01,16,x,-HB-.021,.08);Q.cyl('c',.014,.006,8,x,-HB-.028,.08);} // les deux phares ronds : cerclage, glace, moyeu
     const gs=Q.done();for(const g in gs){const m=new THREE.Mesh(gs[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;bras.add(m);}
     T9.position.set(sd*.60,.682,1.90);T9.rotation.x=.20;piv.position.set(0,Py,Pz);bras.position.set(0,-Py,-Pz); // T9 : le repère du capot (sa pente)
     piv.add(bras);T9.add(piv);PHG.add(T9);PHV.push(piv);}
   let k=0,vu0=false;const lis=t=>t*t*(3-2*t);
   const anime=dt=>{dt=Math.min(dt||0,.1);let ni=false;try{ni=typeof nitroOn!=='undefined'&&nitroOn&&typeof started!=='undefined'&&started&&!gameOver;}catch(_){}
     const fo=(typeof MX5PH==='object'&&MX5PH&&typeof MX5PH.force==='number')?MX5PH.force:null,vise=fo!=null?fo:ni?1:0;
     k+=(vise-k)*Math.min(1,dt*5.5);if(fo!=null&&!vu0)k=fo;vu0=true;
     const kk=lis(Math.min(1,Math.max(0,k)));for(const p of PHV)p.rotation.x=-TH*kk;
     if(typeof CAR_PHK!=='undefined')CAR_PHK=kk;};
   anime(1/30);PHG.userData.anime=anime;
   if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);}
  return {hl:[.60,.757,2.03],tl:[.63,.72,-2.26],wx:.77,wzF:ZF,wzR:-ZR, // hl : les phares LEVÉS (la face droite au bord avant du logement)
          lpw:{R:R,w:.28,style:'multi',n:12,jante:0xc3c8cf,branches:1}};
},
  e_anglaise:function(K){
  /* LA GRANDE ANGLAISE v2 (13/10, « plus ressemblante ») — le grand coupé de Crewe : un seul ARC du pare-brise
     à la malle (lunette couchée, malle courte), une ceinture HAUTE et des vitres étroites qui rentrent fort,
     un pavillon BOMBÉ, l'épaule qui court des phares aux hanches et se gonfle au-dessus de la roue arrière,
     un capot galbé à deux nervures, la calandre à mailles droite comme un I, les quatre phares ronds. */
  const U=LPU,R=.385,ZF=1.45,ZR=-1.30,hmp=(z,w)=>{const d=Math.abs(z-w)/.95;return d>=1?0:1-d*d;};
  const P=K.kit({p:{g:'p',c:0x1a3d2a},k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},c:{g:'c',c:0xeef0f3},
    g:{g:'g',c:0x1c2733},W:{g:'l',c:0xfff6e0},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    r:{g:'l',c:0x7e0a14},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) r la lentille, w la plaque éclairée — aucune famille de plus
  const AR=[[0,2*R+.04],[R*.60,2*R+.01],[R*.98,R*1.12],[R+.12,.30]];
  const ZC=.70,ZM=-1.85;                                                         // pied du pare-brise, pied de la lunette
  let zs=[-2.40,-2.37,-2.30,-2.15,-2.02,ZM,-1.80,-1.66,-1.52,-1.48,-1.30,-1.10,-.92,-.86,-.60,-.40,-.15,.10,.40,.50,.66,ZC,.74,1.00,1.80,2.10,2.22,2.30,2.35,2.38,2.40];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.012);
  const cab=z=>z<=ZC&&z>=ZM;
  const T=z=>U.lin([[-2.40,.86],[-2.37,.94],[-2.30,.985],[-2.02,1.01],[ZM,1.04],[-1.66,1.12],[-1.30,1.26],[-1.10,1.31],[-.60,1.375],[-.40,1.385],[-.15,1.37],[ZC,.95],
                    [1.00,.935],[1.80,.895],[2.10,.865],[2.24,.835],[2.32,.80],[2.37,.775],[2.40,.74]],z),
        yB=z=>U.lin([[-2.40,.84],[-2.30,.93],[-2.02,.99],[ZM,1.01],[-1.30,1.02],[-.60,1.00],[ZC,.965],[1.00,.94],[2.10,.86],[2.32,.80],[2.40,.75]],z)+.03*hmp(z,ZR), // la HANCHE
        sH=z=>U.lin([[-2.40,.76],[-2.30,.84],[-1.30,.87],[ZC,.85],[2.10,.79],[2.32,.74],[2.40,.70]],z)+.02*hmp(z,ZR),
        xW=z=>U.lin([[-2.40,.62],[-2.37,.74],[-2.30,.85],[-2.15,.92],[-1.90,.955],[-1.30,.97],[-.80,.95],[0,.935],[.80,.945],[1.45,.95],[2.10,.935],[2.22,.90],[2.30,.83],[2.35,.72],[2.38,.56],[2.40,.36]],z),
        xR=z=>U.lin([[ZM,.50],[-1.50,.55],[-1.00,.585],[-.40,.60],[-.15,.62],[ZC,.71]],z);
  P.loft(zs,z=>{
    const yb=Math.max(U.arch(z,[ZF,ZR],AR,.30),U.lin([[-2.40,.36],[-2.20,.30],[2.20,.30],[2.40,.34]],z)),xw=xW(z),t=T(z),sh=sH(z);
    const y3=Math.max(yb+.06,Math.min(.62,sh-.14)),y2=Math.max(yb+.03,Math.min(.40,y3-.10)),y4=Math.max(y3+.02,sh),y5=Math.max(y4+.02,yB(z));
    const s=[[0,yb],[xw-.10,yb],[xw-.02,y2],[xw,y3],[xw-.015,y4],[xw-.075,y5]];
    if(cab(z)){const y6=y5+.025,y7=Math.max(y6+.04,t-.075);                         // la vitre qui rentre, le pavillon BOMBÉ
      s.push([xw-.16,y6],[Math.min(xR(z),xw-.22),y7],[xR(z)*.55,Math.max(y7+.01,t-.018)],[0,Math.max(t,y7+.015)]);}
    else{const tt=Math.max(t,y5+.006),yc=Math.max(y5+.004,Math.min(tt,y5+.02));   // capot à deux nervures / malle courte
      s.push([xw-.21,yc],[.46,Math.max(yc-.006,tt-.012)],[.22,tt-.003],[0,tt]);}
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(cab(z)){
      if(j===6&&z>-1.48&&z<.50)return (z>-.92&&z<-.86)?'c':'g';                    // porte sans cadre, la custode derrière son jonc
      if((j===7||j===8)&&z>-.15)return 'g';                                         // le pare-brise
      if((j===7||j===8)&&z<-1.10)return 'g';                                        // la lunette couchée
    }
    return 'p';});
  // LA CALANDRE À MAILLES, droite comme un I : cadre chromé, fond noir, grille croisée
  P.plate('c',[[-.27,.42],[.27,.42],[.30,.46],[.30,.74],[.27,.775],[-.27,.775],[-.30,.74],[-.30,.46]],.03,2.39);
  P.plate('K',[[-.245,.445],[.245,.445],[.265,.47],[.265,.73],[.245,.75],[-.245,.75],[-.265,.73],[-.265,.47]],.03,2.40);
  for(let i=0;i<9;i++)P.box('c',.008,.29,.008,(i/8-.5)*.48,.597,2.433);
  for(let i=0;i<6;i++)P.box('c',.50,.008,.008,0,.47+i*.052,2.433);
  P.box('c',.12,.04,.03,0,.795,2.36);P.box('c',.035,.055,.035,0,.81,2.37);              // l'emblème ailé et son B
  // le bouclier : la bouche basse à mailles, ses deux joues
  P.plate('k',[[-.30,.26],[.30,.26],[.33,.30],[.31,.37],[-.31,.37],[-.33,.30]],.03,2.385);
  for(let i=0;i<3;i++)P.box('c',.60,.008,.01,0,.285+i*.03,2.418);
  P.sym(sd=>{
    // LES QUATRE PHARES RONDS : le grand dehors, le petit dedans, dans leur cuvette noire
    P.cyl('K',.13,.05,14,sd*.62,.665,2.355,'z');P.cyl('c',.115,.05,14,sd*.62,.665,2.365,'z');P.cyl('W',.096,.05,14,sd*.62,.665,2.372,'z');P.cyl('c',.03,.05,8,sd*.62,.665,2.38,'z');
    P.cyl('K',.09,.05,12,sd*.425,.67,2.378,'z');P.cyl('c',.078,.05,12,sd*.425,.67,2.388,'z');P.cyl('W',.062,.05,12,sd*.425,.67,2.395,'z');
    P.plate('k',[[sd*.40,.26],[sd*.66,.26],[sd*.70,.34],[sd*.42,.36]],.03,2.35);for(let i=0;i<3;i++)P.box('c',.26,.008,.01,sd*.54,.285+i*.026,2.38); // joues à mailles
    P.box('O',.10,.025,.03,sd*.74,.56,2.20,0,sd*.55);                               // clignotant d'angle
    // flancs : le jonc chromé qui CERNE les vitres, la poignée, le rétro, la grille d'aile, le seuil
    const seg=(k,w,h,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),be=Math.asin(dx/L),th=-Math.asin(dy/(L*Math.cos(be)));P.box(k,w,h,L+.01,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,th,be,0);};   // (13/10, « traits maladroits ») le jonc SUIT la ceinture (il était droit et flottait hors de la tôle)
    // (13/10, Léo : « les barres chelou ») le jonc chromé de ceinture RETIRÉ
    P.box('c',.02,.02,.16,sd*(xW(-.25)-.02),.84,-.25);
    P.box('p',.16,.09,.19,sd*1.00,1.07,.52);P.box('k',.07,.03,.05,sd*.90,1.03,.55);
    P.box('c',.012,.08,.20,sd*.952,.62,1.00);P.box('k',.01,.06,.17,sd*.955,.62,1.00);
    /* (13/10) le seuil chromé retiré */
    // LA POUPE : feux ovales couchés au bout des hanches, sorties ovales
    P.put('k',new THREE.CylinderGeometry(1,1,1,14),sd*.50,.84,-2.37,Math.PI/2,0,0,.165,.06,.095);
    P.put('L',new THREE.CylinderGeometry(1,1,1,14),sd*.50,.84,-2.395,Math.PI/2,0,0,.145,.05,.075);
    /* (17/10, l'arrière v2) LE FEU OVALE EN VOLUME : le cerclage chromé, la lentille sombre, l'anneau de LED au cœur */
    {const ann=(k,a,b,e,z,ep)=>{const s=new THREE.Shape(),h=new THREE.Path();s.absellipse(0,0,a,b,0,Math.PI*2,false,0); // un anneau OVALE d'épaisseur égale
       h.absellipse(0,0,a-e,b-e,0,Math.PI*2,true,0);s.holes.push(h);P.put(k,new THREE.ExtrudeGeometry(s,{depth:ep,bevelEnabled:false,curveSegments:7}),sd*.50,.84,z);}; // (une ellipse fait 2 × 7 pans)
     ann('c',.168,.098,.022,-2.432,.05);                                                               // le cerclage chromé, qui dépasse
     P.put('r',new THREE.CylinderGeometry(1,1,1,14),sd*.50,.84,-2.424,Math.PI/2,0,0,.085,.01,.042);   // la lentille sombre
     ann('L',.062,.032,.012,-2.434,.012);}                                                            // l'anneau de LED au cœur
    P.put('c',new THREE.CylinderGeometry(1,1,1,10),sd*.55,.34,-2.40,Math.PI/2,0,0,.10,.12,.055);
    P.put('k',new THREE.CylinderGeometry(1,1,1,10),sd*.55,.34,-2.42,Math.PI/2,0,0,.08,.10,.042);
  });
  P.box('c',.56,.022,.03,0,.72,-2.39);P.box('c',.06,.06,.02,0,.78,-2.39);         // le jonc de malle, l'emblème
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'étaient deux ovales
     rouges plaqués à plat et une baguette. Désormais les feux ovales en volume (dans le P.sym), et ici : la LÈVRE de malle, la PLAQUE,
     le BOUCLIER dans la couleur et sa BAGUETTE chromée, le DIFFUSEUR à ailettes où s'encastrent les sorties ovales de Léo (ECH_POTS.e_anglaise,
     inchangé). (Le diffuseur plat d'avant est remplacé.) */
  P.prism('p',[[-2.28,.99],[-2.385,.945],[-2.41,.952],[-2.30,1.004]],1.0,0);                   // la lèvre de malle
  P.box('k',.40,.13,.012,0,.645,-2.404);P.box('w',.36,.10,.012,0,.645,-2.411);                 // la plaque
  P.prism('p',[[-2.36,.44],[-2.44,.46],[-2.45,.56],[-2.42,.60],[-2.36,.60]],1.20,0);           // le bouclier…
  P.box('c',1.12,.018,.01,0,.57,-2.452);                                                       // …sa baguette chromée
  P.box('k',1.36,.16,.08,0,.34,-2.41);                                                         // le diffuseur…
  for(const x of [-.36,-.18,0,.18,.36])P.box('K',.014,.15,.10,x,.335,-2.42);                   // …ses ailettes
  K.commit(P);
  return {hl:[.62,.665,2.26],tl:[.50,.84,-2.42],wx:.80,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.30,style:'rayons',n:5,jante:0xd9dde2,accent:0xb9bec6}};
},
  a_chargeur69:function(K){
  /* LE CHARGEUR 69 — le fauve noir de 1969 : taille de GUÊPE (ailes avant bombées, portes pincées,
     hanches arrière gonflées), calandre noire pleine largeur SANS phare visible, lunette enfoncée
     entre deux ARCS-BOUTANTS, feux arrière en longs bandeaux, bouchon de réservoir de course. */
  const U=LPU,R=.34,ZF=1.56,ZR=-1.41;
  const PAL9={p:{g:'p',c:0x0e0e10},k:{g:'m',c:0x121316},K:{g:'g',c:0x08090b},c:{g:'c',c:0xe9ecf0},
    g:{g:'g',c:0x18232e},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},r:{g:'l',c:0x9a0f1a},O:{g:'l',c:0xffa21a}},P=K.kit(PAL9);
  /* (2026-10-19, BOÎTES : « le pavillon en grandes facettes aux reflets violets qui cassent », en STYLE POLY : des facettes PLATES) la laque
     noire en PANNEAUX : les facettes voisines presque dans le même plan (< 9° l'une de l'autre, < 14° de la première du panneau) prennent UNE
     seule normale, la moyenne pondérée par l'aire — chaque panneau renvoie UN reflet net (des bandes presque parallèles se miraient chacune un
     bout de ciel différent) ; les vraies arêtes restent vives, rien n'est lissé. Les vitres ne changent pas. */
  {const gP=(typeof peintPal==='function'?peintPal(PAL9):PAL9).p.g,d0=P.done;P.done=function(){const o=d0.call(P),G9=o[gP];if(G9){
    const a=G9.attributes.position.array,n=G9.attributes.normal.array,T=a.length/9,F=new Float32Array(T*4),E=new Map(),
      cle=i=>Math.round(a[i]*500)+','+Math.round(a[i+1]*500)+','+Math.round(a[i+2]*500);
    for(let t=0;t<T;t++){const i=t*9,ux=a[i+3]-a[i],uy=a[i+4]-a[i+1],uz=a[i+5]-a[i+2],vx=a[i+6]-a[i],vy=a[i+7]-a[i+1],vz=a[i+8]-a[i+2],
        x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx,l=Math.hypot(x,y,z)||1,k=[cle(i),cle(i+3),cle(i+6)];
      F[t*4]=x/l;F[t*4+1]=y/l;F[t*4+2]=z/l;F[t*4+3]=l;
      for(let e=0;e<3;e++){const p=k[e],q=k[(e+1)%3],ek=p<q?p+'|'+q:q+'|'+p;let L=E.get(ek);if(!L)E.set(ek,L=[]);L.push(t);}}
    const nb=Array.from({length:T},()=>[]);for(const L of E.values())for(const t of L)for(const u of L)if(u!==t)nb[t].push(u);
    const grp=new Int32Array(T).fill(-1),c1=Math.cos(9*Math.PI/180),c2=Math.cos(14*Math.PI/180),
      dot=(p,q)=>F[p*4]*F[q*4]+F[p*4+1]*F[q*4+1]+F[p*4+2]*F[q*4+2],ord=[...Array(T).keys()].sort((p,q)=>F[q*4+3]-F[p*4+3]);
    for(const s0 of ord){if(grp[s0]>=0)continue;const pile=[s0],mem=[];grp[s0]=s0;
      while(pile.length){const t=pile.pop();mem.push(t);for(const u of nb[t])if(grp[u]<0&&dot(u,t)>c1&&dot(u,s0)>c2){grp[u]=s0;pile.push(u);}}
      let x=0,y=0,z=0;for(const t of mem){const w=F[t*4+3];x+=F[t*4]*w;y+=F[t*4+1]*w;z+=F[t*4+2]*w;}const l=Math.hypot(x,y,z)||1;
      for(const t of mem)for(let v=0;v<9;v+=3){n[t*9+v]=x/l;n[t*9+v+1]=y/l;n[t*9+v+2]=z/l;}}
    G9.attributes.normal.needsUpdate=true;}return o;};}
  const AR=[[0,2*R+.05],[R*.60,2*R+.03],[R*.98,R*1.14],[R+.13,.30]];
  const CW=1.06,RF=.30,RR=-.56,RW=-.80,ZE=2.56;
  const zs=[-ZE,-2.52,-2.38,-1.74,-1.20,-.94,RW,RR,-.40,-.30,-.04,.04,RF,.86,.98,CW,2.00,2.46,ZE];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.13])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-ZE,.90],[-2.52,.95],[-2.38,.96],[-1.74,.97],[RW,.99],[RR,1.33],[RF,1.35],[CW,.95],[2.00,.90],[2.46,.86],[ZE,.80]],z),
        sY=z=>U.lin([[-2.52,.96],[-2.38,1.00],[-1.74,1.07],[-1.20,1.17],[RR,1.33],[RF,1.35],[CW,.95],[ZE,.84]],z),
        xW=z=>U.lin([[-ZE,.90],[-2.44,.96],[-1.60,.975],[-.90,.945],[.40,.93],[1.20,.95],[1.70,.97],[2.40,.95],[ZE,.90]],z),
        bL=z=>U.lin([[-ZE,.94],[-1.70,.99],[-1.25,.99],[-.70,.92],[CW,.90],[ZE,.84]],z),cab=z=>z>RF&&z<CW,
        tun=z=>z>-2.40&&z<RR+.001,
        sC=z=>U.lin([[-1.02,0],[-.94,.02],[-.40,.02],[-.30,0],[-.04,0],[.04,.022],[.86,.022],[.98,0]],z);
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.30),c=yC(z),sy=sY(z),xw=xW(z),bl=Math.min(bL(z),sy-.03),
          y2=Math.max(yb+.06,.38),y3=Math.max(.56,y2+.01),y4=Math.max(y3+.01,Math.min(bl-.08,sy-.07));
    const s=[[0,yb],[xw-.07,yb],[xw-.02,y2],[xw,y3],[xw-sC(z),Math.max(y3+.005,Math.min(.68,y4-.01))],[xw,y4],[xw-.04,bl]];
    if(z>RR-.001&&z<CW+.001){const xr=U.lin([[RR,.74],[RF,.72],[CW,.80]],z);
      s.push([xr,Math.max(bl+.01,sy-.05)],[xr-.08,sy],[.52,c+.004],[.50,c+.006],[0,c+.01]);}
    else if(tun(z)){s.push([.80,Math.max(bl+.005,sy-.03)],[.74,sy],[.64,sy-.005],[.62,c+.002],[0,c+.006]);}
    else s.push([xw-.10,Math.max(bl+.002,sy-.01)],[xw-.22,sy],[.52,c+.002],[.50,c+.003],[0,c+.006]);
    return s;
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===6&&z>RR&&z<CW)return (z>RR+.08&&z<CW-.015)?'g':'p';   // (19/10) la vitre va jusqu'au montant (une pointe blanche restait devant)
    if(j>=7&&z>RF&&z<CW)return 'g';
    if(j===10&&z>RW&&z<RR)return 'g';                               /* la lunette, enfoncée entre les arcs */
    return 'p';});
  /* LA CALANDRE PLEINE LARGEUR, phares escamotés derrière la grille */
  P.box('k',1.80,.34,.03,0,.63,ZE+.002);
  P.box('c',1.84,.02,.03,0,.45,ZE+.006);
  /* (2026-10-19, BOÎTES : « la face en caisson plat ») la calandre AU FOND DE SA BOUCHE : le bord du capot et les bouts d'ailes avancent de
     7 cm autour d'elle (sur la vraie, la grille est en retrait dans un tunnel) ; le jonc chromé passe au bord de la lèvre */
  P.box('p',1.84,.045,.08,0,.818,ZE+.035);P.box('c',1.80,.012,.014,0,.797,ZE+.068);
  for(let i=0;i<4;i++)P.box('K',1.76,.014,.012,0,.52+i*.075,ZE+.02);
  P.box('c',.035,.34,.03,0,.63,ZE+.02);
  P.sym(sd=>{P.box('c',.02,.38,.03,sd*.91,.63,ZE+.006);P.box('p',.07,.36,.08,sd*.885,.63,ZE+.035);P.box('c',.012,.34,.014,sd*.848,.63,ZE+.068);
    /* feux arrière en longs bandeaux, bouclier chromé */
    P.box('c',.78,.17,.02,sd*.46,.80,-ZE-.016);P.box('L',.74,.13,.03,sd*.46,.80,-ZE-.02);for(let i=0;i<2;i++)P.box('r',.74,.01,.01,sd*.46,.775+i*.05,-ZE-.036);
    P.box('O',.06,.04,.12,sd*.955,.62,2.30);P.box('L',.03,.04,.12,sd*.97,.66,-2.30);
    P.cyl('c',.045,.08,8,sd*.44,.32,-ZE-.04,'z');
    /* poignées, joncs */
    P.box('c',.02,.025,.14,sd*.94,.86,.02);
    P.box('c',.012,.02,1.40,sd*(.955),.40,.08);
    /* les deux bossages de capot et leurs ouïes */
    P.box('p',.22,.04,.46,sd*.34,yC(2.10)+.012,2.10,.07);for(let i=0;i<3;i++)P.box('k',.16,.012,.02,sd*.34,yC(2.26)+.03-.012*i,2.26+.04*i-.04,.07);
  });
  P.box('K',1.84,.24,.03,0,.80,-ZE-.004);P.box('K',.14,.15,.02,0,.80,-ZE-.022);
  /* pare-chocs chromés, lames fines qui prennent les coins */
  P.box('c',1.84,.07,.08,0,.40,ZE+.03);P.box('c',1.82,.08,.08,0,.44,-ZE-.03);
  P.sym(sd=>{P.box('c',.08,.07,.22,sd*.91,.40,ZE-.06,0,sd*.5,0);P.box('c',.08,.08,.22,sd*.91,.44,-ZE+.06,0,-sd*.5,0);});
  /* LE BOUCHON DE RÉSERVOIR DE COURSE sur l'aile gauche, le rétro de course côté conducteur */
  P.cyl('c',.08,.03,12,-.95,.86,-1.95,'x');P.cyl('p',.05,.03,10,-.965,.86,-1.95,'x');
  P.box('c',.03,.18,.03,-.92,.94,.92);P.cyl('c',.06,.05,10,-.96,1.07,.90,'z');   // (2026-10-27, aucun rétro qui vole) la tige descend 2 cm DANS la portière (elle s'arrêtait 10 cm au-dessus)
  K.commit(P);
  return {hl:[.60,.63,ZE+.02],tl:[.46,.80,-ZE-.04],wx:.83,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.26,style:'rayons',n:5,jante:0xe2e6ea,accent:0xc9ced6}};
 },
  b_canard:function(K){
  // (2026-10-13, Léo : « plus réalistes et ressemblantes ») v2 : un 911, c'est BAS et ROND — l'épaule descendue, les flancs galbés, les
  // ailes qui se GONFLENT au-dessus des roues (l'arrière élargi de la RS), la poupe qui tombe sous la queue de canard, la grande custode.
  const U=LPU,R=.31,ZF=1.20,ZR=-1.07;
  const P=K.kit({p:{g:'p',c:0xf2efe6},b:{g:'p',c:0x1f5fd8,f:0},n:{g:'m',c:0x141518},K:{g:'g',c:0x0c0e12},g:{g:'g',c:0x1c2733},
    c:{g:'c',c:0xe9ecf0},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},
    r:{g:'l',c:0x9a0f1a},w:{g:'l',c:0xd9dce0}}); // (17/10, l'arrière v2) r, w (la plaque éclairée) — aucune famille de plus
  const AR=[[0,2*R+.04],[R*.60,2*R+.02],[R*.95,R*1.25],[R+.10,.24]];
  const zs=[-2.03,-1.97,-1.85,-1.75,-1.60,-1.50,-1.30,-1.25,-1.20,-1.05,-.90,-.60,-.45,-.35,-.29,-.10,.05,.55,1.00,1.10,1.40,1.70,1.95,2.03];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.95,R+.10])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-2.03,.66],[-1.97,.76],[-1.75,.86],[-1.50,.94],[-1.20,1.05],[-.90,1.18],[-.60,1.28],[-.30,1.32],[-.10,1.31],[.05,1.28],[.55,.90],[1.10,.80],[1.70,.68],[1.95,.62],[2.03,.56]],z),
        yS=z=>U.lin([[-2.03,.58],[-1.85,.68],[-1.60,.75],[-1.05,.78],[-.60,.80],[.55,.79],[1.00,.76],[1.70,.76],[1.95,.70],[2.03,.60]],z),
        xW=z=>U.lin([[-2.03,.70],[-1.95,.75],[-1.45,.77],[-.70,.77],[-.38,.765],[1.90,.75],[2.03,.68]],z)
             +.055*Math.exp(-Math.pow((z-ZR)/.48,2))+.035*Math.exp(-Math.pow((z-ZF)/.45,2)),            // les ailes qui se GONFLENT
        cab=z=>z>-1.30&&z<.55,hood=z=>z>=.55;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.24),xw=xW(z),c=yC(z),s=yS(z),y3=Math.max(.46,yb+.07),y4=Math.max(s,y3+.05),y5=y4+.03;
    let p6,p7;
    if(hood(z)){p6=[xw-.22,Math.min(y5-.01,c-.012)];p7=[xw-.40,c-.004];}             // le capot PLONGE entre les ailes
    else if(cab(z)){const y6=Math.max(y5+.004,c-.05);p6=[xw-.05-.05*U.cl((y6-y5)/.25,0,1),y6];p7=[xw-.22,Math.max(y6+.003,c-.012)];}
    else{p6=[xw-.20,Math.max(y5+.003,c-.02)];p7=[xw-.40,Math.max(p6[1]+.003,c-.005)];}  // le capot moteur, entre les hanches
    return [[0,yb],[xw-.08,yb],[xw-.02,yb+.05],[xw,y3],[xw-.025,y4],[xw-.07,y5],p6,p7,[0,Math.max(p7[1]+.002,c)]];   // le flanc GALBE
  },(j,z)=>{
    if(j<0)return 'p';
    if(j<=1)return 'n';
    if(j===5&&cab(z)&&z>-1.25)return (z>-.35&&z<-.29)?'n':'g';                // vitre de porte, la GRANDE custode
    if(j===5&&cab(z)&&z<=-1.25)return 'p';
    if(j===7&&z>.05&&z<.55)return 'g';                                         // pare-brise
    if(j===7&&z>-1.30&&z<-.60)return 'g';                                      // la lunette du fastback
    return 'p';});
  // LA QUEUE DE CANARD : la poupe du capot moteur qui se relève en lèvre, grille dessus
  // (17/10, l'arrière v2) la lèvre RELEVÉE de 4 cm (elle ne se lisait presque pas de dos) et la grille à six lames
  P.prism('p',[[-1.52,yC(-1.52)-.04],[-2.02,.965],[-2.10,.99],[-2.09,.93],[-1.97,.80],[-1.60,.90]],1.30,0);
  P.box('n',1.32,.02,.05,0,.985,-2.095);
  for(let i=0;i<6;i++){const z=-1.62-i*.065;P.box('n',.90,.012,.04,0,U.lin([[-1.52,yC(-1.52)-.04],[-2.02,.965]],z)+.012,z,-.36);}
  // LES YEUX : phares ronds perchés au bout des ailes
  P.sym(sd=>{
    P.put('n',new THREE.CylinderGeometry(.115,.115,.05,12),sd*.58,.744,1.950,Math.PI/2-.35,0,0);
    P.put('c',new THREE.CylinderGeometry(.10,.10,.06,12),sd*.58,.745,1.955,Math.PI/2-.35,0,0);
    P.put('W',new THREE.CylinderGeometry(.08,.08,.07,12),sd*.58,.747,1.962,Math.PI/2-.35,0,0);
    P.box('O',.10,.05,.02,sd*.54,.42,2.07);P.box('W',.10,.05,.02,sd*.28,.42,2.07);   // clignotants, antibrouillards
    /* (17/10, l'arrière v2) LE FEU EN VOLUME : sa coque noire, le rouge strié, l'orange, cerclés de chrome ; le SOUFFLET au bout du
       pare-chocs, le BUTOIR de caoutchouc */
    P.box('K',.26,.17,.05,sd*.60,.70,-2.03);
    P.box('L',.22,.09,.012,sd*.60,.725,-2.058);P.box('K',.22,.014,.006,sd*.60,.725,-2.066);P.box('O',.22,.045,.012,sd*.60,.655,-2.058);
    for(const y of [.617,.783])P.box('c',.26,.014,.01,sd*.60,y,-2.058);
    P.box('n',.12,.15,.13,sd*.71,.42,-1.995);for(const y of [.375,.42,.465])P.box('K',.122,.014,.132,sd*.71,y,-1.995);
    P.box('n',.07,.15,.03,sd*.30,.42,-2.06);
    // (13/10, Léo : « les barres chelou ») LA BANDE BLEUE de flanc RETIRÉE
    P.cyl('c',.05,.03,10,sd*.84,.93,.42,'x');P.box('c',.03,.03,.06,sd*.81,.91,.42); // rétro rond
    P.box('c',.012,.025,.12,sd*.83,.82,-.20);                                    // poignée
    P.cyl('c',.045,.12,8,sd*.36,.30,-2.08,'z');
  });
  // pare-chocs fins à jonc noir, lame avant
  P.box('p',1.58,.14,.12,0,.42,1.99);P.box('n',1.60,.035,.13,0,.47,1.99);P.box('n',1.46,.05,.14,0,.31,1.97);
  P.box('p',1.58,.14,.12,0,.42,-1.99);P.box('n',1.60,.035,.13,0,.47,-1.99);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'étaient des feux
     en pavés, une plaque noire, un bas plat, et de dos la queue de canard ne se lisait pas. Désormais la lèvre relevée et sa grille (plus
     haut), les feux en volume, soufflets et butoirs (dans le P.sym), et ici : le BANDEAU RÉFLÉCHISSANT strié d'un feu à l'autre, la PLAQUE
     blanche, son cadre et sa lampe. Le pot de Léo (ECH_POTS.b_canard) n'a pas bougé. */
  P.box('K',.74,.08,.03,0,.70,-2.04);P.box('r',.70,.05,.012,0,.70,-2.058);for(let i=-4;i<=4;i++)P.box('K',.014,.05,.006,i*.075,.70,-2.066);
  P.box('n',.40,.13,.02,0,.585,-2.035);P.box('w',.36,.10,.01,0,.585,-2.048);P.box('W',.12,.014,.01,0,.655,-2.044);
  P.box('c',.14,.03,.03,0,.72,1.99);                                           // la poignée du capot
  K.commit(P);
  return {hl:[.58,.745,1.97],tl:[.60,.73,-2.04],wx:.68,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.24,style:'rayons',n:5,jante:0xdadde2,accent:0x1f5fd8}};
},
