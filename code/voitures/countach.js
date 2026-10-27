// · · ·
// · · ·
// · · ·
// <<< SHAPES.countach (LE LOUP) — début >>>
/* ===== LE LOUP, LA COUNTACH BLANCHE DU FILM (2026-10-22, Léo : « genere la blanche ressemblance 11/10 ») ===== */
SHAPES.countach=function(K){
  /* LE LOUP — le coin blanc de 1989 (25e anniversaire) sorti des photos : le profil vient du cliché de profil de Léo (201,6 pixels par mètre pour l'empattement de 2,50 m, la
     hauteur corrigée de 3 % : les roues sont rondes), le dessus et la face de photos d'une 25e intacte (le capot en V : un plateau plat entre deux plis, les ailes plus basses),
     l'épave des clichés de Léo (rc0 à rc5 : l'aile gauche écrasée et son phare entrouvert, le phare droit arraché, le pare-chocs déchiré aux deux bouts, la lame basse qui pend,
     la portière et le quartier gauches froissés, le quartier droit aussi). Repère : x vers la GAUCHE de la voiture, y en haut, z vers l'avant (z = 0 au milieu de l'empattement), mètres.
     Une seule coque en loft À ARÊTES VIVES (la Countach est un solide plié), les vitres et les joints découpés au plan, l'aileron sur deux mâts, les portes à ciseaux (l'ACTION
     SPÉCIALE les lève). La peau est travaillée comme celle de LA HONTE (`patineGeo` : marbrure, crasse du bas ; et, sur l'épave, des plaques de métal nu mat, grises ou brunes, là où la peinture est partie) ;
     les pneus sont sculptés (`pneuTravaille`). `?epave=0` : la Countach intacte. */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const EPAVE_ON=!(/[?&]epave=0/.test(location.search)||window.dbgIntacte);   /* la caisse du film : l'épave (`?epave=0` : la Countach intacte) */
  const R=.29,ZF=1.255,ZR=-1.255,ZN=2.46,ZL=2.36,ZT=-2.0;   /* le rayon de la roue, les essieux, le nez (le pare-chocs), le nez de la coque, la poupe */
  const PAL={p:{g:'p',c:0xb4b9c2},k:{g:'m',c:0x141517},K:{g:'g',c:0x090a0c},g:{g:'g',c:0x26323f},c:{g:'c',c:0xe9ecf0},C:{g:'k',c:0x9aa0a8},
    r:{g:'m',c:0x1c1d21},x:{g:'s',c:0xff00ff},b:{g:'m',c:0x24262b},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xb01c28},l:{g:'l',c:0x4a0c14},O:{g:'l',c:0xff9a1a},Q:{g:'l',c:0xf2f2f0},
    s:{g:'s',c:0x8f949c},w:{g:'s',c:0x8d9199},y:{g:'m',c:0x4e2c24},e:{g:'m',c:0x2a2b30},i:{g:'s',c:0xc4cad3},q:{g:'c',c:0xdde6ee},n:{g:'g',c:0x4a5d70}};
  // ---- LES COURBES DU PROFIL (mètres ; z croissants, de la poupe au nez) : le dessus relevé au pixel sur le cliché de profil ----
  const yTop=z=>L([[ZT,.56],[-1.93,.765],[-1.86,.787],[-1.81,.807],[-1.76,.823],[-1.6,.875],[-1.51,.90],[-1.3,.945],[-1.163,.975],[-1.0,1.005],[-.9,1.017],[-.82,1.027],[-.72,1.037],[-.62,1.042],
    [-.52,1.04],[-.42,1.048],[-.32,1.053],[-.22,1.058],[-.12,1.063],[-.02,1.068],[.18,1.068],[.28,1.063],[.37,1.058],[.42,1.056],[.47,1.034],[.52,1.017],[.57,.996],[.62,.976],[.67,.961],
    [.72,.940],[.77,.926],[.82,.907],[.87,.888],[.92,.867],[.97,.851],[1.02,.827],[1.07,.809],[1.12,.799],[1.17,.797],[1.22,.792],[1.27,.780],[1.37,.757],[1.47,.744],[1.57,.728],[1.67,.705],
    [1.77,.67],[1.87,.634],[1.96,.589],[2.06,.54],[2.16,.489],[2.26,.453],[2.36,.448],[ZN,.433]],z);
  const yBas=z=>L([[ZT,.24],[-1.9,.22],[-1.7,.17],[-1.45,.13],[-1.0,.12],[1.0,.12],[1.5,.10],[1.65,.10],[2.0,.115],[ZL,.13]],z);
  const archT=[[0,.60],[.1,.583],[.2,.527],[.25,.473],[.29,.40],[.31,.29],[.335,.12],[.36,0]];
  const archH=z=>Math.max(L(archT,Math.abs(z-ZF)),L(archT,Math.abs(z-ZR)));
  // la plus grande largeur et la hauteur où elle tombe
  const xM=z=>L([[ZT,.84],[-1.93,.88],[-1.8,.93],[-1.6,.98],[ZR,1.0],[-.9,.97],[-.5,.945],[0,.935],[.5,.93],[.82,.92],[ZF,.93],[1.7,.91],[2.1,.88],[ZN,.86]],z),
        yM=z=>L([[ZT,.40],[-1.6,.50],[ZR,.55],[-.9,.50],[-.5,.42],[.5,.42],[ZF,.50],[1.7,.40],[ZN,.30]],z);
  // le BORD DU PONT (l'épaule), la ceinture (le bas des vitres), le bord du toit ; le tronc du pont moteur (une plate-forme qui dépasse l'aile)
  const ySh=z=>L([[ZT,.50],[-1.93,.70],[-1.86,.74],[-1.6,.83],[-1.3,.87],[-.9,.89],[-.7,.88]],z),xCv=z=>L([[-1.93,.62],[-1.6,.70],[-1.2,.72],[-.9,.72],[-.7,.68]],z);
  const xB=z=>L([[-.75,.92],[.8,.92],[1.0,.90],[1.7,.89],[2.1,.86],[ZN,.84]],z),
        yB=z=>L([[-.75,.86],[-.6,.85],[-.1,.83],[.4,.80],[.8,.78],[1.03,.77]],z),
        xR=z=>L([[-.75,.72],[-.6,.54],[-.4,.50],[.3,.50],[.5,.50],[1.03,.74]],z);
  const xh=z=>L([[1.03,.70],[1.5,.61],[2.0,.52],[ZL,.46]],z);   /* la demi-largeur du plateau du capot : son pli (la voiture vue de face : un V entre le pare-brise et le nez) */
  // ---- LA COQUE : une section par tranche, 10 points du bas (axe) au faîte (axe), à arêtes vives ----
  const brut=z=>{
    const yt=yTop(z),yb=Math.min(Math.max(yBas(z),archH(z)),yt-.20),xm=xM(z),ym=Math.min(yM(z),yt-.25);
    const rk=lis(cl((-.6-z)/.25,0,1)),fk=lis(cl((z-.47)/.56,0,1));   /* rk : 1 sur le pont moteur · fk : 1 sur le capot, 0 dans l'habitacle (le pare-brise : de .47 à 1,03) */
    const s=[[0,yb],[xm-.02,yb],[xm,ym]];
    // l'habitacle : l'épaule est la ceinture, la vitre monte au bord du toit
    const xb=xB(z),yb2=Math.min(yB(z),yt-.06),xr=xR(z),yr=yt-.016;
    const cab=[[xm-.01,mix(ym,yb2,.55)],[xb,yb2],[mix(xb,xr,.34),mix(yb2,yr,.34)],[mix(xb,xr,.67),mix(yb2,yr,.67)],[xr,yr],[xr*.5,yt-.004],[0,yt]];
    // le pont moteur : l'épaule d'aile, le replat, le mur du capot, le dessus plat
    const ysh=Math.min(ySh(z),yt-.03),xsh=xm-.04,xc=xCv(z),
      pon=[[xm-.01,mix(ym,ysh,.55)],[xsh,ysh],[xc+.02,ysh+.012],[xc+.005,mix(ysh+.012,yt,.55)],[xc,yt],[xc*.5,yt],[0,yt]];
    // le capot avant : un plateau plat entre deux plis, les ailes (les logements de phares) un cran plus bas et qui tombent vers le flanc
    const x1=xh(z),
      cap=[[xm-.012,mix(ym,yt-.12,.6)],[xm-.02,yt-.115],[xm-.07,yt-.085],[x1+.05,yt-.05],[x1+.012,yt-.036],[x1,yt-.002],[0,yt]];
    for(let i=0;i<7;i++){let x=cab[i][0],y=cab[i][1];
      if(rk>0){x=mix(x,pon[i][0],rk);y=mix(y,pon[i][1],rk);}
      if(fk>0){x=mix(x,cap[i][0],fk);y=mix(y,cap[i][1],fk);}
      s.push([x,y]);}
    return s;};
  const AV=ZL,AP=-1.93,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yTop(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const SM=new Map(),S=z=>{const k=Math.round(z*4000);let s=SM.get(k);if(!s){s=sect(k/4000);SM.set(k,s);}return s;};
  const zs0=[ZT,-1.98,-1.93,-1.86,-1.76,-1.6,-1.3,-1.163,-.9,-.75,-.62,-.4,-.1,.1,.3,.47,.52,.62,.72,.82,.92,1.03,1.12,1.4,1.7,1.9,2.1,2.26,ZL];
  for(const w of [ZF,ZR])for(const d of [0,.1,.2,.25,.29,.31,.335])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.012);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=0?'k':'p');
  // ---- LA TÔLE DÉCOUPÉE AU PLAN (le profil du cliché : 201,6 pixels par mètre en z, 195,7 en y ; z = 0 au milieu de l'empattement, le sol à y = 396) ----
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const m=(x,y)=>[(x-474.5)/201.6,(396-y)/195.7];   /* un point du cliché de profil → [z, y] en mètres */
  const pxs=a=>a.map(q=>m(q[0],q[1]));
  zo('cote',pxs([[656,244],[590,197],[520,191],[430,190],[428,232],[560,238]]),'g',{al:.4,ou:(x,y,z)=>y>.74&&z>-.5&&z<.85});   /* la vitre de porte */
  zo('cote',pxs([[382,228],[425,194],[415,229]]),'g',{al:.4,ou:(x,y,z)=>y>.75&&z<-.2&&z>-.6});   /* la custode */
  zo('dessus',[[1.04,0],[1.04,.77],[.47,.505],[.47,0]],'K',{al:.4,ou:(x,y,z)=>y>.74});   /* le cadre noir du pare-brise */
  zo('dessus',[[1.01,0],[1.01,.75],[.49,.49],[.49,0]],'g',{al:.4,ou:(x,y,z)=>y>.74});
  zo('dessus',[[-.6,0],[-.6,.52],[-.84,.58],[-.84,0]],'g',{al:.35,ou:(x,y,z)=>y>.95});   /* la lunette arrière */
  const JPORTE=[[416,233],[425,262],[437,290],[445,322],[628,325],[656,244]],PRISE=[[374,248],[435,256],[479,264],[431,277],[375,288],[371,253]];
  zo('cote',O.bande(pxs(JPORTE.slice(0,4)),.0062),'x',{al:.5,ou:(x,y,z)=>z>-.6&&z<.95});   /* les joints de la porte (23/10, « technique hybride ») : de VRAIES rainures — un trou dans la tôle, la rainure construite dessous (plus bas) : l'arrière, le bas, l'avant */
  zo('cote',O.bande(pxs(JPORTE.slice(3,5)),.0062),'x',{al:.5,ou:(x,y,z)=>z>-.6&&z<.95});
  zo('cote',O.bande(pxs(JPORTE.slice(4)),.0062),'x',{al:.5,ou:(x,y,z)=>z>-.6&&z<.95});
  zo('cote',pxs(PRISE),'x',{al:.5,ou:(x,y,z)=>z>-.6&&z<.1&&y>.5});   /* la grande prise d'air de flanc : un trou dans la tôle, sa cavité et sa lèvre se posent plus bas */
  zo('cote',pxs([[338,199],[386,197],[386,226],[340,228]]),'K',{al:.3,ou:(x,y,z)=>z<-.3&&y>.78});   /* la grille de persiennes du capot moteur, derrière la custode */
  if(EPAVE_ON){
    zo('dessus',[[1.95,.58],[1.95,.84],[2.27,.84],[2.27,.58]],'x',{al:.35,ou:(x,y,z)=>x>0&&z>1.9&&y>.3});   /* le logement du phare gauche : le couvercle se lève, l'ambre se montre */
    zo('dessus',[[1.82,.50],[1.82,.90],[2.30,.90],[2.30,.50]],'x',{al:.35,ou:(x,y,z)=>x<0&&z>1.75&&y>.3});   /* le phare droit : le couvercle arraché, le seau à nu */
    zo('face',[[0,.10],[0,.285],[.82,.285],[.82,.10]],'x',{al:.5,ou:(x,y,z)=>z>2.3&&y<.29});   /* la jupe sous la poutre : arrachée */
    zo('dessus',[[1.58,.78],[1.84,.80],[1.82,.93],[1.60,.92]],'x',{al:.3,ou:(x,y,z)=>x>.6&&y>.35&&y<.9&&z>1.4&&z<2.0});   /* la déchirure de l'aile gauche, au-dessus de la roue : on voit le noir derrière */
  }
  const MEMO=(typeof SHAPES==='object'&&SHAPES.countach&&SHAPES.countach.length===1)?(SHAPES.countach._tole||(SHAPES.countach._tole={})):null;
  /* L'ÉPAVE (le film) — une liste de BOSSES (`DENTS`) : chacune pousse la tôle dans sa direction `d`, avec une retombée douce (centre `c`, rayons `r`) et une plissure `p` (des crêtes vives : le
     froissé), et une liste de PLIS en V (`PLIS`). Un champ de déplacement (`depl`), appliqué à TOUS les sommets de la coque (une même position, un même déplacement : rien ne se déchire) et aux pièces du kit qui
     longent la tôle (`dpl`) ; avant, les facettes des zones touchées sont coupées en quatre (`raffine`) pour que la tôle ait de quoi se froisser. */
  const EPAVE=EPAVE_ON,LISSE_EPAVE=6;
  const ridge=t=>1-Math.abs(Math.sin(t));
  const DENTS=[   /* x > 0 : la GAUCHE de la voiture (le flanc qui a pris le choc) · c : centre, r : rayons, d : poussée, p : force des plis, u : le sens et la fréquence des plis (rad/m), t : saleté */
    {c:[.84,.38,2.10],r:[.45,.40,.65],d:[-.22,-.04,-.14],p:.20,u:[5,6,6],t:1},          /* l'aile avant gauche, le coin écrasé vers l'intérieur et l'arrière */
    {c:[.88,.72,1.45],r:[.32,.22,.50],d:[-.14,-.12,-.07],p:.30,u:[7,3,2.5],t:1},         /* le bourrelet d'aile au-dessus de la roue : la tôle poussée en vague */
    {c:[.90,.55,.28],r:[.13,.40,.62],d:[-.07,0,0],p:.20,u:[0,5,8],t:.7},                 /* la portière : enfoncée en creux */
    {c:[.92,.62,-.46],r:[.15,.30,.40],d:[-.11,0,.01],p:.15,u:[0,6,7],t:1},               /* le bas de la portière et la prise d'air enfoncés */
    {c:[.92,.58,-1.48],r:[.24,.42,.62],d:[-.19,-.035,.04],p:.25,u:[0,6,7],t:1},          /* le quartier arrière écrasé */
    {c:[-.84,.56,1.52],r:[.28,.26,.46],d:[.10,-.07,-.05],p:.30,u:[-7,3,2.5],t:1},        /* x < 0 : la droite — l'aile avant, le bourrelet */
    {c:[-.88,.28,2.16],r:[.32,.26,.42],d:[.15,.02,-.10],p:.20,u:[-5,6,6],t:1},           /* le coin bas du nez, côté phare arraché */
    {c:[-.90,.58,-1.46],r:[.22,.40,.60],d:[.14,-.03,.03],p:.25,u:[0,6,7],t:1}            /* le quartier arrière droit froissé */
  ];
  /* LES PLIS : des rainures en V le long d'un segment [a → f] (la tôle pliée vive : une arête, deux pans qui prennent chacun leur lumière) — p : la profondeur, w : la demi-largeur, d : le sens de
     l'enfoncement (le dedans de la caisse), t : la saleté ; ils se posent sur les bosses : la tôle y est écrasée ET marquée de ses plis (la photo : une grande diagonale au front de l'aile, la
     portière qui plie en son milieu, le quartier plié deux fois, le capot plié en V). */
  const PLIS=[
    {a:[.92,.78,1.30],f:[.80,.40,2.22],p:.050,w:.09,d:[-1,-.2,-.1],t:.9},     /* la diagonale du front de l'aile gauche */
    {a:[.93,.72,1.12],f:[.91,.50,1.70],p:.035,w:.07,d:[-1,0,0],t:.8},        /* le pli derrière elle, au-dessus de la roue */
    {a:[.94,.66,.78],f:[.94,.62,-.22],p:.026,w:.07,d:[-1,0,0],t:.5},         /* la portière qui plie à mi-hauteur */
    {a:[.95,.84,-1.12],f:[.97,.40,-1.50],p:.042,w:.08,d:[-1,0,0],t:.9},      /* le quartier arrière : un premier pli */
    {a:[.97,.82,-1.55],f:[.98,.46,-1.78],p:.036,w:.07,d:[-1,0,0],t:.8},      /* … et un second */
    {a:[.60,.80,1.46],f:[.22,.54,2.24],p:.034,w:.08,d:[0,-1,-.15],t:.6},     /* le capot plié en V : sa diagonale */
    {a:[-.94,.80,-1.20],f:[-.96,.42,-1.62],p:.040,w:.08,d:[1,0,0],t:.8}      /* le quartier arrière droit */
  ];
  for(const e of DENTS)e.b=[e.c[0]-e.r[0]*1.1,e.c[0]+e.r[0]*1.1,e.c[1]-e.r[1]*1.1,e.c[1]+e.r[1]*1.1,e.c[2]-e.r[2]*1.1,e.c[2]+e.r[2]*1.1];
  for(const e of PLIS){const m9=e.w*1.25;e.b=[Math.min(e.a[0],e.f[0])-m9,Math.max(e.a[0],e.f[0])+m9,Math.min(e.a[1],e.f[1])-m9,Math.max(e.a[1],e.f[1])+m9,Math.min(e.a[2],e.f[2])-m9,Math.max(e.a[2],e.f[2])+m9];
    const l=Math.hypot(e.d[0],e.d[1],e.d[2])||1;e.dn=[e.d[0]/l,e.d[1]/l,e.d[2]/l];e.s=[e.f[0]-e.a[0],e.f[1]-e.a[1],e.f[2]-e.a[2]];e.l2=e.s[0]*e.s[0]+e.s[1]*e.s[1]+e.s[2]*e.s[2];}
  const dedans=(L,x,y,z)=>{for(const e of L){const b=e.b;if(x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]&&z>=b[4]&&z<=b[5])return true;}return false;};
  const dep=[0,0,0,0,0],roiAbime=(x,y,z)=>dedans(DENTS,x,y,z)||dedans(PLIS,x,y,z);
  const depl=(x,y,z)=>{dep[0]=dep[1]=dep[2]=dep[3]=dep[4]=0;if(!EPAVE)return dep;   /* dep[3] : la saleté · dep[4] : la force d'un pli */
    for(const e of DENTS){const b=e.b;if(x<b[0]||x>b[1]||y<b[2]||y>b[3]||z<b[4]||z>b[5])continue;
      const dx=(x-e.c[0])/e.r[0],dy=(y-e.c[1])/e.r[1],dz=(z-e.c[2])/e.r[2],q=dx*dx+dy*dy+dz*dz;if(q>=1)continue;
      const w=(1-q)*(1-q),rg=ridge(e.u[0]*x+e.u[1]*y+e.u[2]*z),mo=1+e.p*(rg*2-1);
      dep[0]+=e.d[0]*w*mo;dep[1]+=e.d[1]*w*mo;dep[2]+=e.d[2]*w*mo;dep[3]=Math.max(dep[3],w*e.t*(.4+.6*rg));}
    for(const e of PLIS){const b=e.b;if(x<b[0]||x>b[1]||y<b[2]||y>b[3]||z<b[4]||z>b[5])continue;
      const t=Math.max(0,Math.min(1,((x-e.a[0])*e.s[0]+(y-e.a[1])*e.s[1]+(z-e.a[2])*e.s[2])/e.l2)),
        qx=e.a[0]+e.s[0]*t-x,qy=e.a[1]+e.s[1]*t-y,qz=e.a[2]+e.s[2]*t-z,dd=Math.hypot(qx,qy,qz);if(dd>=e.w)continue;
      const v=1-dd/e.w;   /* le V : le fond sur la ligne, 0 au bord */
      dep[0]+=e.dn[0]*e.p*v;dep[1]+=e.dn[1]*e.p*v;dep[2]+=e.dn[2]*e.p*v;dep[3]=Math.max(dep[3],v*e.t);dep[4]=Math.max(dep[4],v);}
    return dep;};
  const dpl=(x,y,z)=>{const d=depl(x,y,z);return [x+d[0],y+d[1],z+d[2]];};   /* un point de pièce du kit, suivi de la tôle */
  /* `raffine` : les facettes des zones touchées sont coupées en quatre (une fois par niveau) ; une arête coupée l'est des DEUX côtés (le voisin non touché se coupe en 2 ou 3 pour la suivre, chaque
     groupe de matière du lot voit les mêmes arêtes) : aucun trou en T, aucune fissure. Chaque sommet porte position, couleur et normale. */
  const raffine=(lots,lv)=>{
    const vk=(a,i)=>Math.round(a[i]*1e5)+','+Math.round(a[i+1]*1e5)+','+Math.round(a[i+2]*1e5),ek=(a,b)=>a<b?a+'|'+b:b+'|'+a;
    let T=[];for(const g in lots){const Lt=lots[g];for(let i=0;i<Lt.P.length;i+=9)T.push({g:g,p:Lt.P.slice(i,i+9),c:Lt.C.slice(i,i+9),n:Lt.N.slice(i,i+9)});}
    for(let l=0;l<lv;l++){
      const split=new Set();
      for(const t of T){const p=t.p;if(roiAbime((p[0]+p[3]+p[6])/3,(p[1]+p[4]+p[7])/3,(p[2]+p[5]+p[8])/3)){const k0=vk(p,0),k1=vk(p,3),k2=vk(p,6);split.add(ek(k0,k1));split.add(ek(k1,k2));split.add(ek(k2,k0));}}
      if(!split.size)break;
      const out=[];
      for(const t of T){const p=t.p,c=t.c,nn=t.n,k0=vk(p,0),k1=vk(p,3),k2=vk(p,6),s01=split.has(ek(k0,k1)),s12=split.has(ek(k1,k2)),s20=split.has(ek(k2,k0)),n=s01+s12+s20;
        if(!n){out.push(t);continue;}
        const V0=[p[0],p[1],p[2],c[0],c[1],c[2],nn[0],nn[1],nn[2]],V1=[p[3],p[4],p[5],c[3],c[4],c[5],nn[3],nn[4],nn[5]],V2=[p[6],p[7],p[8],c[6],c[7],c[8],nn[6],nn[7],nn[8]],
          M=(a,b)=>{const m=a.map((v,i)=>(v+b[i])/2),h=Math.hypot(m[6],m[7],m[8])||1;m[6]/=h;m[7]/=h;m[8]/=h;return m;},
          push=(a,b,d)=>out.push({g:t.g,p:[a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]],c:[a[3],a[4],a[5],b[3],b[4],b[5],d[3],d[4],d[5]],n:[a[6],a[7],a[8],b[6],b[7],b[8],d[6],d[7],d[8]]});
        if(n===3){const m01=M(V0,V1),m12=M(V1,V2),m20=M(V2,V0);push(V0,m01,m20);push(m01,V1,m12);push(m20,m12,V2);push(m01,m12,m20);}
        else if(n===1){if(s01){const m=M(V0,V1);push(V0,m,V2);push(m,V1,V2);}else if(s12){const m=M(V1,V2);push(V1,m,V0);push(m,V2,V0);}else{const m=M(V2,V0);push(V2,m,V1);push(m,V0,V1);}}
        else{let Va,Vb,Vc;if(s01&&s12){Va=V0;Vb=V1;Vc=V2;}else if(s12&&s20){Va=V1;Vb=V2;Vc=V0;}else{Va=V2;Vb=V0;Vc=V1;}   /* deux arêtes coupées : le coin commun Vb */
          const mab=M(Va,Vb),mbc=M(Vb,Vc);push(mab,Vb,mbc);push(Va,mab,mbc);push(Va,mbc,Vc);}}
      T=out;}
    const R={};for(const t of T){const Lt=R[t.g]||(R[t.g]={P:[],C:[],N:[]});for(let j=0;j<9;j++){Lt.P.push(t.p[j]);Lt.C.push(t.c[j]);Lt.N.push(t.n[j]);}}
    return R;};
  /* `lisseZone` : les normales des facettes DÉPLACÉES lissées entre voisines (moins de `deg` degrés d'écart, pondérées par la surface) : la tôle froissée garde ses plis vifs (au-delà) mais
     ses reflets coulent d'un pan à l'autre comme sur une vraie laque (la leçon de LA PERLE) — au lieu d'un pavage de facettes plates qui scintillent. */
  const lisseZone=(P,N,mvf,deg)=>{const cs=Math.cos(deg*Math.PI/180),nt=P.length/9,M=new Map(),cle=i=>Math.round(P[i]*2e3)+','+Math.round(P[i+1]*2e3)+','+Math.round(P[i+2]*2e3),A=new Float32Array(nt);
    for(let t=0;t<nt;t++){if(!mvf[t])continue;const i=t*9,ux=P[i+3]-P[i],uy=P[i+4]-P[i+1],uz=P[i+5]-P[i+2],wx=P[i+6]-P[i],wy=P[i+7]-P[i+1],wz=P[i+8]-P[i+2];
      A[t]=Math.hypot(uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx);
      for(let v=0;v<3;v++){const k=cle(i+v*3);let l=M.get(k);if(!l)M.set(k,l=[]);l.push([t,v]);}}
    const o=N.slice();
    for(const l of M.values()){if(l.length<2)continue;
      for(const [t,c] of l){const nx=N[t*9],ny=N[t*9+1],nz=N[t*9+2];let x=0,y=0,z=0;
        for(const [q] of l){const qx=N[q*9],qy=N[q*9+1],qz=N[q*9+2];if(nx*qx+ny*qy+nz*qz>=cs){x+=qx*A[q];y+=qy*A[q];z+=qz*A[q];}}   /* la normale PLATE de la facette voisine q (le premier sommet la porte) */
        const h=Math.hypot(x,y,z)||1;o[t*9+c*3]=x/h;o[t*9+c*3+1]=y/h;o[t*9+c*3+2]=z/h;}}
    return o;};
  /* `abime` : un lot raffiné → ses géométries : la tôle poussée (`depl`), la normale plate recalculée là où la facette a bougé puis lissée entre voisines (`lisseZone`), et la PEAU SALIE (la leçon de
     LA HONTE : la laque marbrée, la crasse, la rouille) — les facettes très abîmées de la laque passent dans la matière SATINÉE, grise ou brune (la peinture est partie, le métal nu ne reflète plus le
     ciel : fini les reflets roses sur les creux), les autres se salissent seulement ; les autres matières (le verre) gardent leur normale. */
  const abime=(lots,lv)=>{const R=raffine(lots,lv),G9={},dans=g=>G9[g]||(G9[g]={P:[],C:[],N:[],M:[]});
    for(const g in R){const Lt=R[g],P=Lt.P,C=Lt.C,N=Lt.N,nt=P.length/9;
      for(let t=0;t<nt;t++){const i=t*9;let mv=0,dirt=0,pli=0;
        for(let v=0;v<9;v+=3){const d=depl(P[i+v],P[i+v+1],P[i+v+2]);if(d[0]||d[1]||d[2]){P[i+v]+=d[0];P[i+v+1]+=d[1];P[i+v+2]+=d[2];mv=1;}dirt+=d[3]/3;pli+=d[4]/3;}
        const cx=(P[i]+P[i+3]+P[i+6])/3,cy=(P[i+1]+P[i+4]+P[i+7])/3,cz=(P[i+2]+P[i+5]+P[i+8])/3;let cible=g;
        if(mv){const ux=P[i+3]-P[i],uy=P[i+4]-P[i+1],uz=P[i+5]-P[i+2],wx=P[i+6]-P[i],wy=P[i+7]-P[i+1],wz=P[i+8]-P[i+2];let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
          for(let v=0;v<9;v+=3){N[i+v]=nx;N[i+v+1]=ny;N[i+v+2]=nz;}}
        if(dirt>.05&&g!=='g'){
          const nb=patBruit(cx*5+1.7,cy*5,cz*5),rust=patBruit(cx*7+9,cy*7+3,cz*7)>.88;
          if(g===GP&&dirt>.16&&nb<dirt*1.4-.10){   /* la peinture est partie : le métal nu, gris ou brun, mat */
            cible='s';const gv=.17+.20*nb+.05*dirt;
            for(let v=0;v<9;v+=3){if(rust){C[i+v]=.27;C[i+v+1]=.16;C[i+v+2]=.11;}else{C[i+v]=gv;C[i+v+1]=gv*.97;C[i+v+2]=gv*.93;}}}
          else{const k=Math.min(.55,dirt*.55);   /* la peau sale : du gris aux plis */
            for(let v=0;v<9;v+=3){const r=C[i+v],gg=C[i+v+1],b=C[i+v+2];if((r+gg+b)/3>.3){C[i+v]=r+((rust?.58:.40)-r)*k;C[i+v+1]=gg+((rust?.34:.41)-gg)*k;C[i+v+2]=b+((rust?.20:.44)-b)*k;}}}}
        const T=dans(cible);for(let v=0;v<9;v++){T.P.push(P[i+v]);T.C.push(C[i+v]);T.N.push(N[i+v]);}T.M.push(mv);}}
    const out={};
    for(const g in G9){const T=G9[g],N2=(g==='g'||g==='c')?T.N:lisseZone(T.P,T.N,T.M,LISSE_EPAVE),geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N2,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(T.C,3));out[g]=geo;}
    return out;};
  /* LES PORTES À CISEAUX : les facettes (tôle, vitre, joints) qui tombent dans le polygone de la portière, au-delà du bord du toit, sortent de la coque et vont dans un groupe par côté,
     posé sur sa charnière (le pied du montant de pare-brise) : l'ACTION SPÉCIALE les lève. */
  const DOOR=[[-.29,.835],[-.15,.378],[.76,.363],[.90,.777],[.573,1.017],[.226,1.048],[-.22,1.053],[-.23,.84]];
  const dansP=(P9,u,w)=>{let c=false;for(let i=0,j=P9.length-1;i<P9.length;j=i++){const a=P9[i],b=P9[j];if((a[1]>w)!==(b[1]>w)&&u<(b[0]-a[0])*(w-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const HX=0,HY=.72,HZ=.86,pivs=[];
  const sortiePortes=gs=>{const bag={'1':{},'-1':{}},rest={},mk=B=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(B.P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(B.N,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(B.C,3));return geo;};
    for(const g in gs){const G=gs[g],pa=G.attributes.position.array,na=G.attributes.normal.array,ca=G.attributes.color.array,R9=rest[g]={P:[],N:[],C:[]};
      for(let i=0;i<pa.length;i+=9){if(ca[i]>.99&&ca[i+1]<.01&&ca[i+2]>.99)continue;   /* les trous (clé x, magenta) ne sortent pas */
        const cx=(pa[i]+pa[i+3]+pa[i+6])/3,cy=(pa[i+1]+pa[i+4]+pa[i+7])/3,cz=(pa[i+2]+pa[i+5]+pa[i+8])/3;let dst=R9;
        if(Math.abs(cx)>.52&&dansP(DOOR,cz,cy)){const sd=cx>0?'1':'-1',B=bag[sd][g]||(bag[sd][g]={P:[],N:[],C:[]});dst=B;}
        for(let j=0;j<9;j++){dst.P.push(pa[i+j]);dst.N.push(na[i+j]);dst.C.push(ca[i+j]);}}
      G.dispose();delete gs[g];}
    const cor=EPAVE?abime(rest,1):null;
    for(const g in rest){const gg=cor?cor[g]:mk(rest[g]);if(gg)gs[g]=gg;}
    for(const sd of ['1','-1']){const outer=new THREE.Group(),inner=new THREE.Group();outer.position.set(HX,HY,HZ);outer.add(inner);
      const dd=EPAVE?abime(bag[sd],1):null;
      for(const g in bag[sd]){const geo=dd?dd[g]:mk(bag[sd][g]);if(typeof lpOmbre==='function')lpOmbre(geo,K.H);geo.translate(-HX,-HY,-HZ);   /* l'ombre cuite se calcule dans le repère de la caisse (les y d'avant la charnière) : avant, elle noircissait toute la portière */
        const mm=new THREE.Mesh(geo,(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));mm.userData.lp=1;inner.add(mm);}
      K.add(outer);pivs.push({outer:outer,inner:inner,sd:+sd});}
    return gs;};
  K.commit({ech:true,prims:[],done:()=>{const gs=O.decoupe(PL.done(),GP,Z,PP,MEMO,['g']);if(gs[GP])patineGeo(gs[GP],EPAVE_ON?{marbre:.045,echelle:.38,graine:5,crasse:.20,yCrasse:.42,poussiere:.03,rouille:.05}:{marbre:.03,echelle:.45,graine:5});return sortiePortes(gs);}});   /* la marbrure, la crasse du bas, un peu de rouille (la peau de l'épave) */
  // L'ACTION SPÉCIALE (`CAR_ACTION`) : le tap lève les deux portes à ciseaux, elles tiennent, redescendent ; en course elles sont closes (elles se rabattent si on part levées)
  {let k=0,tgt=0,hold=0;const ease=t=>t*t*(3-2*t),pose=()=>{const e=ease(cl(k,0,1));for(const q of pivs){q.inner.rotation.x=1.30*e;q.outer.rotation.z=-q.sd*.16*e;}};
   const anime=dt=>{dt=Math.min(dt||0,.1);let st=false;try{st=typeof started!=='undefined'&&started&&!gameOver;}catch(_){}
     if(st&&k>0){tgt=0;hold=0;k=Math.max(0,k-dt*2.5);pose();return;}
     if(hold>0){hold-=dt;if(hold<=0)tgt=0;}
     const d=tgt-k;if(d)k+=Math.sign(d)*Math.min(Math.abs(d),dt*(d>0?1.1:.8));pose();};
   const action=()=>{tgt=1;hold=3.2;return true;};
   pose();if(typeof CAR_ACTION!=='undefined')CAR_ACTION=action;if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);
   window.dbgLoup=function(v){if(v==null)return {k:k,tgt:tgt,hold:hold};k=tgt=cl(+v,0,1);hold=0;pose();return k;};}
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  const surf=(z,x)=>{const sc=S(z);x=Math.abs(x);for(let j=sc.length-2;j>=2;j--){const a=sc[j],b=sc[j+1],lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]);
    if(x>=lo-1e-9&&x<=hi+1e-9&&hi-lo>1e-6)return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return sc[sc.length-1][1];};
  const surfX=(z,y)=>{const sc=S(z);for(let j=1;j<sc.length-1;j++){const a=sc[j],b=sc[j+1];if((a[1]-y)*(b[1]-y)<=0&&Math.abs(b[1]-a[1])>1e-6)return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return xM(z);};   /* la demi-largeur de la tôle en (z, y) */
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  const circS=(r,n)=>{const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;o.push([Math.cos(a)*r,Math.sin(a)*r]);}return o;};
  // ---- LES CREUX COLLÉS (23/10, Léo : « solidifie et utilise la technique hybride », comme LA ZAGAIE) : les joints de la porte et la prise d'air de flanc ne sont plus peints : un trou dans la tôle (ci-dessus), la
  // rainure ou la cavité construite dessous (parois, fond sombre SOLIDE), la lèvre de la couleur de la caisse collée autour ; la tôle froissée de l'épave les emporte (`dpl`).
  {const CX=creuxOutils(P,{mat:'k',tf:q=>dpl(q[0],q[1],q[2])}),flancF=sd=>(z,y)=>[sd*surfX(z,y),y,z];
   P.sym(sd=>{CX.rainure(flancF(sd),pxs(JPORTE),[sd,0,0],.0060,.020);
    const Fv=flancF(sd),pol=pxs(PRISE),O3=pol.map(q=>Fv(q[0],q[1])),cz=pol.reduce((a,q)=>a+q[0],0)/pol.length,cy=pol.reduce((a,q)=>a+q[1],0)/pol.length,dn=CX.surfPN(Fv,cz,cy,[sd,0,0]).n,dp=.05,
      C3=Fv(cz,cy),T=q=>dpl(q[0],q[1],q[2]),inn=O3.map(q=>T([C3[0]+(q[0]-C3[0])*.80-dn[0]*dp,C3[1]+(q[1]-C3[1])*.80-dn[1]*dp,C3[2]+(q[2]-C3[2])*.80-dn[2]*dp])),
      fl=T([C3[0]-dn[0]*(dp+.004),C3[1]-dn[1]*(dp+.004),C3[2]-dn[2]*(dp+.004)]),O4=O3.map(q=>T([q[0]-dn[0]*.010,q[1]-dn[1]*.010,q[2]-dn[2]*.010])),N=O3.length;
    for(let i=0;i<N;i++){const j=(i+1)%N;P.tri('k',O4[i],O4[j],inn[j]);P.tri('k',O4[i],inn[j],inn[i]);P.tri('K',fl,inn[i],inn[j]);}   /* les parois et le fond de la cavité */
    for(let k=1;k<=3;k++){const yk=cy+(k-2)*.034,zk=cz,xk=surfX(zk,yk),q=T([sd*(xk-dp*.46),yk,zk]);P.box('C',.010,.007,.20,q[0],q[1],q[2],.30,0,0);}   /* les ailettes */
    const lip=O3.map((q,i)=>{const d=CX.NO(CX.V3(q,C3));return T([q[0]+d[0]*.0075+dn[0]*.002,q[1]+d[1]*.0075+dn[1]*.002,q[2]+d[2]*.0075+dn[2]*.002]);});lip.push(lip[0]);
    O.tube(P,'p',lip,circS(.0075,6),true);});}   /* la lèvre : un boudin de la couleur de la caisse tout autour de la prise d'air */
  // LES LÈVRES D'AILE : un tube blanc posé sur le flanc, autour de chaque arche (le rebord large de la Countach)
  for(const zw of [ZF,ZR]){P.sym(sd=>{const ch=[];for(let d=-.345;d<=.346;d+=.035){const z=zw+d,ah=archH(z);if(ah>.13){const q=[sd*(xM(z)+.016),ah+.012,z];ch.push(sd>0?dpl(q[0],q[1],q[2]):q);}}
      if(ch.length>2)O.tube(P,'p',ch,circS(.024,6),true);});}
  // L'AILERON : une lame mince sur deux mâts en plaques, un petit bord relevé à chaque bout (le cliché de profil : le bord de fuite monte, l'aile déborde la poupe)
  {const zl=-1.23,zt=-1.93,yl=1.045,yt2=1.105,w=.82;
   const pl=[[zt,yt2],[zl,yl],[zl,yl-.03],[zt,yt2-.03]];   /* le profil de la lame, vu de côté (z, y) */
   P.prism('p',pl,2*w,0);
   P.box('p',2*w,.04,.016,0,yt2+.004,zt+.004,-.05,0,0);   /* la lèvre du bord de fuite */
   P.sym(sd=>{P.box('p',.014,.06,.70,sd*(w+.004),(yl+yt2)/2,(zl+zt)/2);   /* le bout de lame */
     P.prism('p',[[-1.70,.895],[-1.50,.905],[-1.50,1.06],[-1.76,1.10]],.032,sd*.42);});}   /* les mâts : un trapèze de plaque */
  // LES PERSIENNES du capot moteur : des lames noires sur le flanc de la custode (la grille est découpée dans la tôle)
  P.sym(sd=>{for(let i=0;i<6;i++){const y=.88+i*.022;P.box('k',.008,.007,.25,sd*(.95-(y-.85)*2.0+.004),y,-.57,0,0,sd*.46);}});
  // LES LAMES du bas de caisse (les strakes) : trois ailettes qui s'étirent vers l'avant, sous la portière
  P.sym(sd=>{const q0=sd>0?dpl(sd*(xM(-.4)+.002),.25,-.38):[sd*(xM(-.4)+.002),.25,-.38];P.box('k',.008,.19,.84,q0[0],q0[1],q0[2]);   /* le fond sombre de l'ouïe */
    for(let i=0;i<4;i++){const zc=-.40-i*.05,q=sd>0?dpl(sd*(xM(zc)+.014),.30-i*.034,zc):[sd*(xM(zc)+.014),.30-i*.034,zc];P.box('p',.026,.018,.78-i*.09,q[0],q[1],q[2]);}});
  // LE NEZ : le pare-chocs (une poutre pleine largeur, les blocs d'angle qui tournent le coin), la lame sous la poutre, les antibrouillards, la prise d'air
  const poutre=(x0,x1,ext)=>{const w=x1-x0,xc=(x0+x1)/2;P.box('p',w,.155,.16,xc,.3625,2.38);P.box('w',w+ext,.010,.12,xc,.447,2.39);P.box('k',w+.02,.012,.012,xc,.318,2.468);};   /* la poutre, de x0 à x1 */
  const bloc=sd=>{P.box('p',.14,.165,.26,sd*.84,.3625,2.33);P.box('k',.012,.026,.13,sd*.912,.408,2.40);P.box('k',.012,.026,.13,sd*.912,.34,2.40);};   /* le bloc d'angle, ses deux fentes */
  if(!EPAVE_ON){poutre(-.78,.78,.18);P.sym(sd=>{bloc(sd);P.box('K',.28,.075,.012,sd*.70,.185,ZL+.003);P.box('q',.085,.055,.012,sd*.37,.19,ZL+.004);P.box('C',.095,.065,.008,sd*.37,.19,ZL+.001);});}   /* la prise d'air, l'antibrouillard */
  else{
    poutre(-.78,.70,.10);bloc(-1);   /* la poutre garde sa pleine largeur : le bloc d'angle droit tient (son bout est déchiré), le gauche n'est plus que de la mousse brune */
    P.box('y',.035,.11,.08,-.915,.36,2.40,0,.15,.25);P.box('y',.09,.12,.09,.76,.36,2.41,0,-.15,.1);P.box('p',.045,.09,.11,.85,.33,2.37,.3,.4,.6);P.box('w',.05,.08,.07,.82,.40,2.43,-.2,.3,.5);
    P.box('k',1.66,.17,.02,0,.20,2.285);   /* sous la poutre : le noir (la jupe est arrachée) */
    // la lame basse (le bas de la jupe) arrachée et tirée vers l'avant, un peu de travers, ses deux évents carrés
    P.box('w',1.62,.045,.32,.12,.085,2.40,0,.50,.03);P.box('s',1.60,.020,.05,.2015,.118,2.549,0,.50,.03);   /* la lame basse : gris clair satiné, sa lèvre relevée plus sombre */
    P.box('k',.10,.012,.06,-.28,.110,2.67,0,.50,0);P.box('k',.10,.012,.06,.40,.110,2.14,0,.50,0);
  }
  P.sym(sd=>{P.box('k',.010,.022,.30,sd*(xM(1.96)+.003),.235,1.965);P.box('k',.010,.022,.30,sd*(xM(1.96)+.003),.195,1.965);   /* les ouïes de la lame, sur le flanc */
    P.box('O',.012,.045,.12,sd*(xM(1.78)+.002),.45,1.78);});   /* le catadioptre ambré du flanc */
  // LE CAPOT : l'écusson, les essuie-glaces au pied du pare-brise
  P.box('k',.07,.004,.045,0,surf(2.12,0)+.003,2.12);
  P.sym(sd=>barre('r',[sd*.06,surf(1.0,sd*.06)+.006,1.0],[sd*.62,surf(1.03,sd*.62)+.006,1.03],.012,.012));
  // LES RÉTROS : un boîtier carré sur son pied
  P.sym(sd=>{P.box('p',.08,.11,.19,sd*1.015,.815,.73);P.box('p',.09,.05,.08,sd*.935,.765,.77);   /* (2026-10-27, aucun rétro qui vole) le pied entre 2 cm dans la portière (il s'arrêtait 2 cm à côté) */ P.box('k',.082,.09,.01,sd*1.016,.815,.826);});
  // L'HABITACLE (visible portes levées) : le plancher, les deux sièges, le tableau de bord, le volant (à gauche)
  P.box('e',1.5,.04,1.15,0,.40,.15);
  P.sym(sd=>{P.box('i',.42,.14,.48,sd*.31,.50,.05);P.box('i',.42,.44,.10,sd*.31,.72,-.22,.25,0,0);});
  P.box('k',1.30,.14,.38,0,.74,.82,-.35,0,0);
  P.lathe('k',[[.16,-.014],[.19,-.014],[.19,.014],[.16,.014]],14,.31,.78,.60,'z');
  // LA POUPE : les blocs de feux (rouge, ambre, recul), la plaque, le bandeau noir, le pare-chocs
  P.sym(sd=>{P.box('k',.44,.16,.008,sd*.65,.645,-1.974);P.box('L',.25,.058,.012,sd*.61,.675,-1.982);P.box('O',.10,.058,.012,sd*.80,.675,-1.982);P.box('l',.20,.045,.012,sd*.62,.605,-1.982);P.box('W',.10,.045,.012,sd*.80,.605,-1.982);});
  P.sym(sd=>{const q=sd>0?dpl(sd*(xM(-1.76)+.004),.695,-1.76):[sd*(xM(-1.76)+.004),.695,-1.76];P.box('L',.006,.026,.075,q[0],q[1],q[2]);});   /* le catadioptre rouge du quartier (le petit rectangle de la photo) */
  P.box('Q',.46,.115,.012,0,.60,-1.986);
  P.box('k',1.70,.05,.01,0,.505,-1.976);   /* le bandeau noir de la jupe */
  P.box('p',1.72,.24,.13,0,.355,-1.99);P.sym(sd=>P.box('p',.16,.24,.44,sd*.82,.355,-1.80));   /* le pare-chocs arrière : la poutre et ses retours */
  P.box('k',.90,.010,.09,0,.477,-1.99);    /* la grille du dessus du pare-chocs */
  if(EPAVE_ON){
    // le logement du phare droit, mis à nu : un seau sombre penché, ses deux optiques rondes (une cerclée d'argent, une éclatée), le couvercle qui pend
    const a=.6,ca=Math.cos(a),sa=Math.sin(a),O1=[-.70,.50,2.05];
    P.put('k',new THREE.BoxGeometry(.46,.20,.44),O1[0],O1[1]-.09*ca,O1[2]-.09*sa,a);
    for(const [dx,r,vitre] of [[-.105,.078,1],[.105,.078,0]]){const px=O1[0]+dx,py=O1[1],pz=O1[2];   /* l'optique : la cuvette chromée, le verre (le droit est éclaté), le reflet */
      P.put('c',new THREE.CylinderGeometry(r+.014,r+.014,.03,18),px,py+.015*ca,pz+.015*sa,a);
      P.put(vitre?'n':'k',new THREE.CylinderGeometry(r,r,.03,18),px,py+.026*ca,pz+.026*sa,a);
      if(vitre)P.put('W',new THREE.CylinderGeometry(r*.35,r*.35,.03,10),px-.02,py+.036*ca,pz+.036*sa,a);else P.put('q',new THREE.BoxGeometry(.01,.03,r*1.5),px+.01,py+.034*ca,pz+.034*sa,a,0,.5);}
    P.box('p',.34,.012,.20,-.60,.60,1.93,.9,0,-.3);   /* le volet du phare, soulevé de travers */
    // les plis et les éraflures de la tôle : de fins traits sombres posés sur la portière et les quartiers (suivent la tôle enfoncée)
    {
     const trait=(sd,L)=>{const ch=L.map(q=>{const x=sd*(surfX(q[0],q[1])+.006),r=dpl(x,q[1],q[0]);return r;});O.tube(P,'e',ch,circS(.0065,4),true);};
     for(const L of [[[.72,.80],[.46,.63],[.16,.46]],[[.56,.84],[.22,.67],[-.04,.53]],[[-.08,.84],[-.24,.70],[-.28,.52]],[[-1.12,.72],[-1.34,.60],[-1.58,.50]],[[-1.0,.62],[-1.30,.56],[-1.55,.42]]])trait(1,L);
     for(const L of [[[-1.16,.70],[-1.38,.60],[-1.60,.52]],[[1.45,.66],[1.7,.58],[1.9,.5]]])trait(-1,L);}
    // le FOND de chaque pli : un trait sombre fin qui suit la rainure (posé sur la tôle puis enfoncé avec elle)
    for(const e of PLIS){const ch=[];for(let i=0;i<=12;i++){const t=i/12;let x=e.a[0]+e.s[0]*t,y=e.a[1]+e.s[1]*t;const z=e.a[2]+e.s[2]*t;
        if(Math.abs(e.dn[0])>.5){const sd=Math.sign(x)||1;x=sd*(surfX(z,y)+.003);}else{y=surf(z,Math.abs(x))+.003;}
        const q=dpl(x,y,z);ch.push(q);}
      O.tube(P,'e',ch,circS(.0042,4),true);}
    // le bourrelet de tôle déchirée en haut de l'aile gauche : un boudin blanc, le long de la crête qui s'est plissée
    {const ch=[[.93,.745,1.12],[.89,.735,1.30],[.85,.72,1.48],[.80,.70,1.66],[.74,.685,1.80]].map(q=>dpl(q[0],q[1],q[2]));O.tube(P,'w',ch,circS(.03,6),true);}
    {const t=dpl(.84,.50,1.70),f=dpl(.745,.745,1.28);P.box('k',.11,.05,.15,t[0],t[1],t[2],-.25,.2,-.2);P.box('k',.05,.03,.50,f[0],f[1],f[2],0,.12,0);}   /* le noir derrière la déchirure, la fente entre le capot et l'aile */
    // le logement gauche : le fond sombre, la lentille ambrée, le couvercle levé (posés sur la tôle enfoncée)
    {const f=dpl(.71,surf(2.1,.71)-.045,2.11),l=dpl(.71,surf(2.25,.71)-.035,2.272),c=dpl(.71,surf(1.93,.71)+.045,2.04);
     P.box('b',.28,.05,.30,f[0],f[1],f[2]);P.box('O',.20,.05,.014,l[0],l[1],l[2]);P.box('p',.22,.010,.25,c[0],c[1],c[2],-.30,0,.04);}
  }
  K.commit(P);
  {const mP=K.mats&&K.mats.p;if(mP){mP.reflectivity=.29;mP.shininess=80;}}   /* un vernis plus franc : la laque blanche se lit argentée sous la lumière du garage (la photo de l'épave est grise, pas crème) */
  // ---- LES ROUES : cinq trous, la lèvre polie ----
  const JW=.30,hw=JW/2,fx=hw-.03,RR=.215;
  const J=lpKit({k:{g:'m',c:0x16171a},c:{g:'c',c:0xe9ecf0},a:{g:'c',c:0xb4bac3},d:{g:'m',c:0x0e0f12},s:{g:'s',c:0x2c2e34},e:{g:'m',c:0x4a4d55}});
  J.lathe('k',[[RR-.01,-hw],[R*.88,-hw],[R*.975,-hw*.7],[R,-hw*.3],[R,hw*.3],[R*.975,hw*.7],[R*.88,hw],[RR-.01,hw]],24,0,0,0,'x');
   /* (23/10, Léo : « roue lisse poly ») le pneu est LISSE : un tour à pans francs, sans pavés ni lettres */
  J.lathe('c',[[RR,hw-.004],[RR-.002,fx+.012],[RR-.012,fx+.008]],28,0,0,0,'x');
  J.lathe('a',[[RR-.012,fx+.006],[RR-.012,fx-.02],[0,fx-.02]],28,0,0,0,'x');
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;J.lathe('d',[[0,fx-.016],[.048,fx-.016],[.048,fx+.004]],14,0,Math.cos(a)*.115,Math.sin(a)*.115,'x');}
  for(let i=0;i<5;i++){const a=(i+.5)/5*Math.PI*2;J.lathe('d',[[0,fx-.016],[.014,fx-.016],[.014,fx+.004]],8,0,Math.cos(a)*.075,Math.sin(a)*.075,'x');}
  J.lathe('c',[[.05,fx-.012],[.046,fx+.012],[.02,fx+.022],[0,fx+.022]],14,0,0,0,'x');
  const JG=J.done();
  return {hl:[.60,.58,2.3],tl:[.66,.62,-1.95],wx:.84,wxF:.80,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const mm=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);mm.userData.lp=1;w.add(mm);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xb4bac3}};
};
// LES QUATRE SORTIES de la poupe : deux paires sous la poutre du pare-chocs
ECH_POTS.countach={p:[{t:'rond',r:.045,k:'C',dbl:1,k2:'k',pts:[[.40,.20,-2.12],[.22,.20,-2.12],[-.22,.20,-2.12],[-.40,.20,-2.12]]}]};
Object.assign(I18N,{'LE LOUP':'THE WOLF','Blanche, basse, taillée à la hache, et passée sous un camion. Les portes se lèvent encore.':'White, low, cut with an axe, and run over by a truck. The doors still lift.'});
// >>> fin SHAPES.countach (LE LOUP)
