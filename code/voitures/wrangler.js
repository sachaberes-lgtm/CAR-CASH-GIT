// >>> fin SHAPES.combi (BOITES)
// · · ·
// · · ·
// · · ·
// <<< SHAPES.wrangler (BOITES) >>> — LE BAROUDEUR, la Jeep Wrangler JL 4 portes (2018), refait EN BOÎTES (2026-10-26, le chantier poly)
SHAPES.wrangler=(function(){
/* ============================ LE BAROUDEUR — UN PETIT CHAR EN BOÎTES ============================
   (2026-10-26, Léo : « la plus belle voiture poly », au niveau de ROSSO 40 et de LA HONTE ; carte blanche) — la caisse « au plan »
   (des milliers de petits triangles, des joints dessinés dans la tôle) et l'« entre-deux » sont remplacés par une Jeep EN BOÎTES :
   « Sept fentes, quatre roues motrices, zéro route nécessaire. »
   · la BAIGNOIRE : un loft de neuf coupes, des flancs DROITS — le PLAN DE PORTE vertical, le bas de porte qui RENTRE de 5,5 cm vers le
     marchepied (il regarde le sol : une deuxième valeur sur le flanc), le bas de caisse noir, le rebord de ceinture qui sort de 1,4 cm —
     et le passage de roue arrière taillé en trapèze ;
   · le HARD-TOP NOIR (celui des Sport et Rubicon : la grise et la noire, le contraste du « petit char ») : un second loft posé sur la
     ceinture, flancs qui rentrent un peu, toit à chanfrein ; le pare-brise et son cadre à la couleur de la caisse, l'auvent noir, les
     essuie-glaces. Les vitres sont des BANDES du loft (à fleur, uniformes) : sur le noir, elles se lisent ;
   · l'AVANT en blocs : capot plat à bossage et ouïes, ailes à dessus plat qui dépassent la calandre, la CALANDRE À SEPT FENTES en
     barreaux (un code-barres posé sur un fond noir : la profondeur est vraie), deux phares RONDS à couronne de LED ;
   · les ÉLARGISSEURS exagérés (le « petit char ») : des bandeaux noirs balayés le long de l'arche — lèvre, face, chanfrein qui prend
     la lumière ; le feu de jour et le clignotant dans celui de devant ;
   · le reste POSÉ : pare-chocs d'acier, crochets rouges, marchepieds, charnières apparentes, poignées, rétros, loquets de capot,
     la ROUE DE SECOURS sur le hayon, le 3e feu stop au bord du toit, les feux debout, les manilles rouges, les ponts rigides dessous.
     Aucun joint ni trait dessiné sur la tôle (règle de Léo : du relief, pas de dessin).
   Repère : x à gauche (le conducteur), y en haut, z vers l'avant, mètres ; y = 0 au sol. Les roues : 5 branches usinées creusées de gris,
   pneu à 14 pans et pavés en quinconce. Essais : `?baroudeur=toitcaisse` (le hard-top couleur caisse) · `?baroudeur=capotnoir`. */
const cl=(v,a,b)=>v<a?a:v>b?b:v,lin=(t,x)=>{if(x<=t[0][0])return t[0][1];
  for(let i=1;i<t.length;i++)if(x<=t[i][0]){const p=t[i-1],q=t[i];return p[1]+(q[1]-p[1])*(x-p[0])/((q[0]-p[0])||1);}return t[t.length-1][1];};
// ---- LES COTES ----
const R=.43,TW=.31,WX=.83,ZF=1.49,ZR=-1.52;                              // roue (rayon, largeur), demi-voie, essieux
const XW=.865,BELT=1.225,SHELF=1.24,XH0=.835,xh=y=>XH0-(y-SHELF)*.075;     // le plan de porte, la ceinture, le hard-top qui rentre en montant
const YC=.82,TUCK=.055;                                                     // le bas de porte RENTRE de 5,5 cm vers le marchepied (il regarde le sol) ; le pli à 82 cm
const ROOF=1.80,ZWH=.27,ZWB=.62,YWB=1.31,PENTE=(ROOF-YWB)/(ZWB-ZWH),       // le pare-brise : du haut (z ,27 ; y 1,80) au pied (z ,62 ; y 1,31)
      top=z=>z<=ZWH?ROOF:ROOF-(z-ZWH)*PENTE;
// L'ARCHE : un trapèze aux coins hauts coupés — [devant-bas, coin, coin, coin, coin, derrière-bas], de l'avant vers l'arrière
const ARCHE=(zc,hb,ht,yb,yt,ch,ybA)=>{const A=[zc+hb,ybA!=null?ybA:yb],B=[zc+ht,yt],C=[zc-ht,yt],D=[zc-hb,yb],
    u=(p,q)=>{const dz=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dz,dy);return [dz/l,dy/l];},o=(p,v)=>[p[0]+v[0]*ch,p[1]+v[1]*ch];
  return [A,o(B,u(B,A)),o(B,u(B,C)),o(C,u(C,B)),o(C,u(C,D)),D];};
const ARF=ARCHE(ZF,.46,.30,.50,1.00,.075,.70),ARR=ARCHE(ZR,.48,.29,.50,1.00,.075);
const ARRz=ARR.slice().reverse(),archY=z=>z<ARRz[0][0]||z>ARRz[ARRz.length-1][0]?.50:lin(ARRz,z);
// les vitres de côté (z) : portière avant (son bord avant suit le montant), portière arrière, custode
const VITRES=[[-.34,.56],[-1.06,-.45],[-2.02,-1.20]],enVitre=z=>VITRES.some(v=>z>v[0]&&z<v[1]);

return function(K){
  const SP=K.spec||{},CORPS=SP.color!=null?SP.color:0x464950;
  const PAL={p:{g:'p',c:CORPS},                                  // la tôle (la peinture de la boutique la remplace)
    k:{g:'m',c:0x141518},f:{g:'m',c:0x1e1f23},s:{g:'s',c:0x2b2d32},// le plastique noir, l'élargisseur grainé, l'acier des pare-chocs
    K:{g:'g',c:0x0b0c0f},g:{g:'g',c:0x1b2733},                     // le fond noir (fentes, cuvettes), les vitres
    c:{g:'c',c:0xc3c8cf},C:{g:'c',c:0x5d636c},                     // l'alu usiné, le gris canon
    d:{g:'m',c:0x2a2c31},                                          // le fond de jante
    W:{g:'l',c:0xfff2d6},L:{g:'l',c:0xff2333},O:{g:'l',c:0xffa21a},Q:{g:'l',c:0xe8e8e8},
    R:{g:'m',c:0xb3121c}};                                         // les crochets rouges
  let FL='';try{FL=(location.search.match(/[?&]baroudeur=([a-z0-9,]+)/)||[])[1]||'';}catch(e){}
  const HT=FL.indexOf('toitcaisse')>=0?'p':'T';PAL.T={g:'m',c:0x1c1d21};
  const P=K.kit(PAL);
  // un triangle tourné vers le DEHORS (loin de `ref`)
  const T3=(k,a,b,c,ref)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],
      nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,mx=(a[0]+b[0]+c[0])/3-ref[0],my=(a[1]+b[1]+c[1])/3-ref[1],mz=(a[2]+b[2]+c[2])/3-ref[2];
    if(nx*mx+ny*my+nz*mz<0)P.tri(k,a,c,b);else P.tri(k,a,b,c);};

  // ============================ LA BAIGNOIRE (sous la ceinture) ============================
  /* une demi-coupe : le plancher, la paroi du passage de roue (elle s'efface hors de l'arche), le biseau bas, le PLAN DE PORTE vertical,
     l'épaule qui sort d'un cm jusqu'à la ceinture, le rebord, le replat où s'assied le hard-top (son joint noir) */
  {let zs=[-2.16,-2.10,.74];for(const p of ARR)zs.push(p[0]);zs.sort((a,b)=>a-b);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.003);
   P.loft(zs,z=>{const yb=archY(z),xw=lin([[-2.16,.80],[-2.10,XW]],z),xs=XH0*lin([[-2.16,.93],[-2.10,1]],z);
     const xl=xw-TUCK;return [[0,.50],[.60,.50],[.60,yb],[xl-.06,yb],[xl,yb+.06],[xw,Math.max(YC,yb+.07)],[xw,1.19],[xw+.014,1.195],[xw+.014,BELT],[xs,SHELF],[0,SHELF]];},
   (j)=>j>=0&&j<=3?'k':j===8?'k':'p');}

  // ============================ LE HARD-TOP ET LE PARE-BRISE ============================
  {const zs=[-2.12,-2.07,-2.02,-1.20,-1.06,-.45,-.34,ZWH,.29,.56,.577,ZWB];
   P.loft(zs,z=>{const k=lin([[-2.12,.95],[-2.07,1]],z),t=top(z),
       y2=1.30,y3=Math.max(y2+.001,Math.min(1.71,t-.07)),y4=Math.max(y3+.001,Math.min(1.765,t-.022)),y5=Math.max(y4+.001,t);
     return [[0,SHELF],[k*XH0,SHELF],[k*xh(y2),y2],[k*xh(y3),y3],[k*xh(y4),y4],[k*xh(y4)-.07,y5],[0,y5+(z<=ZWH?.012:0)]];},
   (j,z)=>{if(j===2&&enVitre(z))return 'g';                                          // les trois vitres de côté
     if(j===5&&z>.29&&z<.56)return 'g';                                                 // le pare-brise
     return z<ZWH-.001||j===-2?HT:'p';});}

  // ============================ L'AVANT ============================
  // LE CAPOT : plat, son BOSSAGE au milieu (il s'efface avant le nez), la lèvre qui tombe sur la calandre
  {const yh=z=>lin([[.60,1.31],[1.70,1.255],[1.87,1.215]],z),dm=z=>.03*cl((1.665-z)/.025,0,1);
   const BOSS=FL.indexOf('capotnoir')>=0?'T':'p';
   P.loft([.60,1.64,1.665,1.80,1.87],z=>{const y=yh(z),d=dm(z);
     return [[0,y-.10],[.695,y-.10],[.695,y-.025],[.66,y+.006],[.34,y+.012],[.30,y+.012+d],[0,y+.012+d]];},(j,z)=>j===0?'k':j===5&&z<1.64?BOSS:'p');
   P.box('k',.50,.018,.006,0,yh(1.6525)+.0296,1.6556,-.695);                      // la fente noire, sur la marche au bout du bossage
   // les deux OUÏES du capot : un fond noir, trois lames de tôle
   P.sym(sd=>{const z0=1.12,y=yh(z0)+.009;P.box('k',.17,.006,.24,sd*.50,y,z0,Math.atan2(.055,1.1));
     for(let i=0;i<3;i++)P.box('p',.17,.014,.022,sd*.50,y+.004,z0-.075+i*.075,Math.atan2(.055,1.1));});}
  // LES AILES AVANT : un bloc à dessus plat, qui dépasse la calandre ; l'arche y est taillée
  {const PR=[[.72,1.21],[2.04,1.18],[2.04,ARF[0][1]],ARF[0],ARF[1],ARF[2],ARF[3],ARF[4],[ARF[5][0],.50],[.72,.50]];
   P.sym(sd=>P.prism('p',PR,.195,sd*.7775));}
  // le compartiment moteur (noir : rien ne se voit au travers des fentes ni entre les roues)
  P.box('k',1.32,.62,1.12,0,.88,1.30);

  // LA CALANDRE À SEPT FENTES : un fond noir, et devant lui les BARREAUX de tôle — un code-barres posé
  {const zf=1.905,d=.05,zc=zf-d/2,y0=.85,y1=1.075,yc=(y0+y1)/2,h=y1-y0;
   P.box('k',1.32,h+.02,.02,0,yc,zf-d-.004);                                    // le fond
   P.box('p',1.37,.045,d,0,y1+.0225,zc);P.box('p',1.37,.05,d,0,y0-.025,zc);      // les traverses haute et basse
   for(let i=0;i<6;i++)P.box('p',.04,h,d,(i-2.5)*.106,yc,zc);                    // les six barreaux entre les sept fentes
   P.sym(sd=>{
     P.box('p',.335,h,d,sd*.5175,yc,zc);                                         // la joue du phare
     // LE PHARE ROND : la couronne de tôle, la cuvette, l'anneau de LED, le gris canon, l'œil
     const x=sd*.52,z=zf;
     P.lathe('p',[[.118,0],[.118,.012],[.104,.02],[.094,.02]],12,x,yc,z,'z');
     P.lathe('K',[[.094,.008],[0,.008]],12,x,yc,z,'z');
     P.lathe('W',[[.086,.012],[.066,.012]],12,x,yc,z,'z');
     P.lathe('C',[[.066,.011],[.04,.011]],12,x,yc,z,'z');
     P.lathe('W',[[.04,.013],[0,.013]],12,x,yc,z,'z');});}
  // L'AUVENT noir entre le capot et le pare-brise, et les deux ESSUIE-GLACES couchés sur le verre
  P.box('k',1.40,.025,.06,0,1.322,.615);
  {const a=Math.atan2(PENTE,-1);P.sym(sd=>P.box('k',.50,.014,.025,sd*.26,top(.54)+.012,.54,-a));}
  // LES LOQUETS DE CAPOT, sur les ailes (le caoutchouc noir des Jeep)
  P.sym(sd=>{P.box('k',.04,.07,.06,sd*.705,1.205,1.79);P.box('k',.05,.02,.08,sd*.705,1.245,1.79);});

  // ============================ LES ÉLARGISSEURS (le petit char) ============================
  /* un bandeau BALAYÉ le long de l'arche : [décalage hors de l'arche, saillie] — la lèvre qui regarde le pneu, la face, le chanfrein qui
     remonte vers la tôle et prend la lumière. Les bouts sont coupés à l'horizontale. */
  const SEC=[[0,-.02],[0,.10],[.03,.13],[.10,.13],[.14,.045],[.14,-.02]];
  const aile=(path,c,xb,sd)=>{const n=path.length,N=[];
    for(let i=0;i<n-1;i++){const a=path[i],b=path[i+1],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy);let nz=dy/l,ny=-dz/l;
      if(nz*((a[0]+b[0])/2-c[0])+ny*((a[1]+b[1])/2-c[1])<0){nz=-nz;ny=-ny;}N.push([nz,ny]);}
    const O=path.map((p,i)=>{if(i===0||i===n-1){const m=N[i===0?0:n-2],h=m[0]>0?1:-1;return [h/(h*m[0]),0];}
      const a=N[i-1],b=N[i];let mz=a[0]+b[0],my=a[1]+b[1];const ml=Math.hypot(mz,my);mz/=ml;my/=ml;const k=1/(mz*a[0]+my*a[1]);return [mz*k,my*k];});
    const PT=path.map((p,i)=>SEC.map(s=>[sd*(xb+s[1]),p[1]+O[i][1]*s[0],p[0]+O[i][0]*s[0]])),
          CT=PT.map(S=>{let x=0,y=0,z=0;for(const q of S){x+=q[0];y+=q[1];z+=q[2];}return [x/S.length,y/S.length,z/S.length];});
    for(let i=0;i<n-1;i++){const ref=[(CT[i][0]+CT[i+1][0])/2,(CT[i][1]+CT[i+1][1])/2,(CT[i][2]+CT[i+1][2])/2];
      for(let j=0;j<SEC.length-1;j++){const a=PT[i][j],b=PT[i][j+1],c2=PT[i+1][j+1],d=PT[i+1][j];T3('f',a,b,c2,ref);T3('f',a,c2,d,ref);}}
    for(const [i,i2] of [[0,1],[n-1,n-2]]){const S=PT[i],ref=CT[i2];for(let j=1;j<S.length-1;j++)T3('f',S[0],S[j],S[j+1],ref);}
    return {PT,O};};
  P.sym(sd=>{
    const av=aile(ARF,[ZF,.41],.875,sd);aile(ARR,[ZR,.41],XW,sd);
    // LE FEU DE JOUR (blanc) et le CLIGNOTANT (ambre), à fleur de la face de l'élargisseur avant, sur sa jambe de devant
    const a=ARF[0],b=ARF[1],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy),rx=-Math.atan2(dy,dz),o=[dy/l,-dz/l];
    for(const [k,t0,t1] of [['O',.10,.42],['W',.48,.95]]){const tm=(t0+t1)/2,zz=a[0]+dz*tm+o[0]*.065,yy=a[1]+dy*tm+o[1]*.065;
      P.box(k,.006,.026,l*(t1-t0),sd*(.875+.133),yy,zz,rx);}
  });

  // ============================ LE FLANC ============================
  P.sym(sd=>{
    // LES PORTES : leurs CHARNIÈRES apparentes et leurs axes, les poignées (aucun joint dessiné sur la tôle : le relief seul)
    for(const z of [.645,-.455])for(const y of [.88,1.08]){P.box('p',.026,.09,.11,sd*(XW+.013),y,z);P.box('C',.032,.10,.02,sd*(XW+.016),y,z+.055);}
    for(const z of [-.27,-1.00])P.box('k',.03,.04,.17,sd*(XW+.016),1.10,z);
    // LE RÉTROVISEUR : le bras sur la portière, la coque noire, la glace
    P.box('k',.12,.03,.05,sd*(XW+.06),1.28,.50);P.box('k',.07,.16,.12,sd*(XW+.15),1.34,.49);P.box('g',.05,.13,.006,sd*(XW+.15),1.34,.428);
    // LE MARCHEPIED : une poutre noire entre les élargisseurs
    P.prism('f',[[-.84,.44],[.80,.44],[.84,.48],[.80,.52],[-.84,.52],[-.88,.48]],.13,sd*.865);
  });

  // ============================ LE PARE-CHOCS AVANT, LES CROCHETS ============================
  P.prism('s',[[1.95,.56],[2.11,.56],[2.14,.59],[2.14,.77],[2.11,.80],[1.95,.80]],1.24,0);
  P.sym(sd=>{P.box('s',.26,.20,.14,sd*.72,.68,2.03,0,sd*.35,0);
    P.prism('R',[[2.10,.62],[2.19,.62],[2.22,.65],[2.22,.73],[2.19,.76],[2.10,.76],[2.10,.735],[2.18,.735],[2.195,.72],[2.195,.665],[2.18,.645],[2.10,.645]],.028,sd*.40);
    P.lathe('k',[[.05,0],[.05,.012],[.036,.012]],8,sd*.56,.665,2.14,'z');P.lathe('W',[[.036,.008],[0,.008]],8,sd*.56,.665,2.14,'z');});
  P.box('k',1.10,.07,.42,0,.44,1.76);                                              // la plaque de protection

  // ============================ L'ARRIÈRE ============================
  P.sym(sd=>{
    // LES FEUX : le boîtier noir debout aux coins, le rouge, le recul blanc
    P.box('k',.15,.42,.03,sd*.705,.97,-2.17);P.box('L',.11,.25,.012,sd*.705,1.055,-2.186);P.box('W',.11,.07,.012,sd*.705,.85,-2.186);
  });
  for(const y of [.86,1.12])P.box('k',.12,.06,.035,-.66,y,-2.17);P.box('k',.03,.12,.03,.58,1.00,-2.17);   // les charnières du hayon (côté trottoir), sa poignée
  P.plate('g',[[-.66,1.33],[.66,1.33],[.68,1.35],[.68,1.70],[.66,1.72],[-.66,1.72],[-.68,1.70],[-.68,1.35]],.01,-2.128);   // la lunette
  P.box('k',.34,.012,.02,.18,1.36,-2.132);                                          // l'essuie-glace
  P.prism('s',[[-2.16,.44],[-2.27,.44],[-2.29,.47],[-2.29,.60],[-2.27,.62],[-2.16,.62]],1.64,0);   // le pare-chocs d'acier
  P.box('Q',.46,.12,.01,0,.53,-2.295);                                              // la plaque (`plqDessinee` y pose celle du joueur)
  P.box('k',.08,.08,.14,0,.40,-2.28);                                               // l'attelage
  P.sym(sd=>P.prism('R',[[-2.27,.50],[-2.33,.50],[-2.36,.47],[-2.36,.43],[-2.33,.40],[-2.27,.40],[-2.27,.42],[-2.32,.42],[-2.34,.44],[-2.34,.46],[-2.32,.48],[-2.27,.48]],.026,sd*.62));   // les manilles rouges

  // ============================ LES ROUES ============================
  /* LA ROUE (pour les quatre ET la roue de secours) : un pneu à 14 pans aux épaules coupées, 14 PAVÉS en quinconce qui débordent sur
     l'épaule (la silhouette crénelée), la jante à cinq branches usinées sur un fond gris, la lèvre polie, le moyeu gris canon.
     Construite une fois dans un chantier à part (une matière par pièce), elle sert aux roues (roueDeco) et à la roue de secours. */
  const RG=(()=>{const J=lpKit({t:{g:'t',c:0x17181b},d:{g:'d',c:0x2a2c31},r:{g:'r',c:0xc3c8cf},h:{g:'h',c:0x5d636c}}),hw=TW/2,N=14,fx=hw-.03,rt=R-.022,rj=.25,
      TJ=(k,a,b,c,ref)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
        if((uy*vz-uz*vy)*((a[0]+b[0]+c[0])/3-ref[0])+(uz*vx-ux*vz)*((a[1]+b[1]+c[1])/3-ref[1])+(ux*vy-uy*vx)*((a[2]+b[2]+c[2])/3-ref[2])<0)J.tri(k,a,c,b);else J.tri(k,a,b,c);};
    J.lathe('t',[[rj,-hw],[rt-.035,-hw],[rt,-hw*.72],[rt,hw*.72],[rt-.035,hw],[rj,hw]],N,0,0,0,'x');
    for(let i=0;i<N;i++){const a=(i+.5)/N*Math.PI*2,sa=Math.sin(a),ca=Math.cos(a),xo=(i%2?1:-1)*.04,r0=rt-.01,r1=rt+.02,t=.075,
        V=(x,r,u)=>[xo+x,sa*r+ca*u,ca*r-sa*u],c=V(0,r0,0),q=(a2,b2,c2,d2)=>{TJ('t',a2,b2,c2,c);TJ('t',a2,c2,d2,c);};
      const A=V(-.095,r0,-t),B=V(.095,r0,-t),C=V(.095,r0,t),D=V(-.095,r0,t),E=V(-.095,r1,-t),F=V(.095,r1,-t),G=V(.095,r1,t),H=V(-.095,r1,t);
      q(E,F,G,H);q(A,B,F,E);q(D,C,G,H);q(A,D,H,E);q(B,C,G,F);}
    J.lathe('r',[[rj,fx+.004],[rj-.01,fx+.016],[rj-.036,fx-.012]],N,0,0,0,'x');           // la lèvre polie
    J.lathe('d',[[rj-.036,fx-.03],[0,fx-.03]],N,0,0,0,'x');                                                  // le fond
    for(let s=0;s<5;s++){const a=s/5*Math.PI*2+Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),Q=(r,t)=>[ca*r-sa*t,sa*r+ca*t];
      J.prism('r',[Q(.05,-.034),Q(rj-.03,-.052),Q(rj-.03,.052),Q(.05,.034)],.026,fx-.012);                 // les cinq branches…
      J.prism('d',[Q(.08,-.010),Q(rj-.05,-.020),Q(rj-.05,.020),Q(.08,.010)],.006,fx+.003);}                 // …creusées de gris
    J.lathe('h',[[.068,fx-.02],[.068,fx+.004],[.04,fx+.012],[0,fx+.014]],6,0,0,0,'x');                      // le moyeu
    return J.done();})();
  const RKEY={t:'k',d:'d',r:'c',h:'C'},RMAT={t:'m',d:'m',r:'c',h:'c'};
  // LA ROUE DE SECOURS sur le hayon, et son support
  {const yc=1.07,zc=-2.16-.035-TW/2;
   for(const g in RG)P.put(RKEY[g],RG[g].clone(),0,yc,zc,0,Math.PI/2,0);
   P.box('k',.26,.12,.05,0,yc,-2.185);
  }
  P.box('k',.42,.035,.02,0,1.757,-2.13);P.box('L',.36,.02,.01,0,1.757,-2.142);      // le 3e feu stop, au bord du toit

  // ============================ DESSOUS : les ponts rigides ============================
  P.cyl('k',.05,1.36,8,0,R,ZF,'x');P.cyl('k',.12,.18,10,.12,R-.02,ZF,'x');
  P.cyl('k',.055,1.36,8,0,R,ZR,'x');P.cyl('k',.13,.20,10,0,R-.02,ZR,'x');
  K.commit(P);
  return {hl:[.52,.9625,1.925],tl:[.71,1.03,-2.19],wx:WX,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in RG){const m=new THREE.Mesh(RG[g],(K.mats&&K.mats[RMAT[g]])||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:TW,style:'nyan',jante:0xc3c8cf}};
};
})();
ECH_POTS.wrangler={p:[{t:'reel',r:.034,k:'C',len:.34,jeu:.006,jonc:.006,pts:[[-.52,.36,-2.24]]}]}; // un seul pot, à droite sous le pare-chocs (photo de dos)
Object.assign(I18N,{'LE BAROUDEUR':'THE TRAILBLAZER','Sept fentes, quatre roues motrices, zéro route nécessaire. Il ne contourne pas les obstacles : il monte dessus.':'Seven slots, four-wheel drive, zero road required. It doesn\'t go around obstacles: it climbs them.'});
