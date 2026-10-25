// · · ·
// · · ·
// · · ·
// <<< SHAPES.zagato (LA ZAGAIE) — début >>>
/* ===== LA ZAGAIE, LA 5-95 DE ZAGATO (2026-10-22, Léo : « zagato imite exactement la forme de la voiture orange ») ===== */
SHAPES.zagato=function(K){
  /* LA ZAGAIE — la Lamborghini 5-95 de Zagato (2014, un exemplaire sur la base d'une Gallardo), refaite à la photo (2026-10-22, Léo : « imite exactement la
     forme de la voiture orange »). Tout vient de deux sources : le PROFIL du dessin de studio (340 pixels par mètre, l'empattement de 2,56 m comme étalon :
     le nez à z = 2,113, la poupe à −2,107, les roues à 1,147 et −1,411) et les photos de presse de face, de dos et de dessus (les largeurs ; la photo de dos
     donne l'appareil : 9,7 m, 2,08 m de haut, 12° de champ). Repère : x à droite, y en haut, z vers l'avant, mètres. Une seule coque en loft (22 points par
     tranche), la tôle DÉCOUPÉE au plan (`bulleOutils.decoupe`) : vitres noires qui s'enroulent, toit orange, gueule, phares, feux ronds, grille de poupe.
     Orange cuivré (la laque, légèrement marbrée : `patineGeo`, normales qui coulent : `lisseDiffuse`), jantes anthracite à 5 paires de branches, étriers, pneus sculptés (`pneuTravaille`), la poupe
     (grille perforée d'alvéoles hexagonales, ailettes de carbone, feux ronds à lentille rouge et couronne de LED), la nacelle de toit (le conduit d'air) en carbone. */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.335,ZF=1.147,ZR=-1.411,ZN=2.113,ZT=-2.107;   /* le rayon de la roue, les essieux, le nez, la poupe */
  const PAL={p:{g:'p',c:0xc7753c},k:{g:'m',c:0x111215},K:{g:'g',c:0x08090b},g:{g:'g',c:0x131b24},c:{g:'c',c:0xe9ecf0},C:{g:'k',c:0x34363c},M:{g:'s',c:0x5a5d65},
    B:{g:'s',c:0x7a3d17},E:{g:'s',c:0xb4501c},Y:{g:'s',c:0x2b2d33},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0x8c1424},l:{g:'l',c:0x3a0a12},O:{g:'l',c:0xffa21a},Q:{g:'l',c:0xf2f2f0},
    r:{g:'m',c:0x1c1d21},o:{g:'o',c:0xd9a520},n:{g:'g',c:0x1e2936},
    x:{g:'s',c:0xff00ff},N:{g:'m',c:0x08080b},b:{g:'m',c:0x2a1a10},h:{g:'l',c:0xffc89a},q:{g:'c',c:0xb4bfce}};   /* x : la clé des TROUS (retirée à la sortie) · b : l'ombre brune des parois · h : l'éclat d'un rebord · q : le chrome sombre des optiques */
  // ---- LES COURBES DU PROFIL (mètres ; z croissants, de la poupe au nez) ----
  const yTop=z=>L([[ZT,.58],[-2.07,.62],[-2.04,.72],[-2.0,.80],[-1.986,.876],[-1.94,.885],[-1.88,.891],[-1.82,.90],[-1.76,.915],[-1.705,.926],[-1.646,.935],[-1.585,.941],
    [-1.5,.953],[-1.4,.965],[-1.2,1.0],[-1.0,1.045],[-.85,1.075],[-.68,1.10],[-.642,1.129],[-.554,1.141],[-.407,1.156],[-.231,1.168],[-.113,1.171],[.034,1.168],[.181,1.153],
    [.328,1.126],[.416,1.11],[.475,1.10],[.504,1.074],[.592,1.044],[.71,1.003],[.828,.962],[.945,.915],[1.063,.868],[1.12,.842],[1.18,.833],[1.24,.829],[1.30,.818],[1.35,.803],
    [1.43,.775],[1.446,.753],[1.475,.744],[1.534,.724],[1.593,.706],[1.652,.682],[1.71,.659],[1.769,.635],[1.828,.606],[1.887,.576],[1.946,.538],[1.975,.518],[2.005,.497],
    [2.034,.471],[2.063,.447],[2.09,.424],[ZN,.40]],z);
  const yBas=z=>L([[ZT,.53],[-2.09,.503],[-2.067,.459],[-2.055,.397],[-2.044,.368],[-2.02,.326],[-1.984,.32],[-1.937,.197],[-1.878,.171],[-1.75,.135],[-1.6,.123],[1.4,.121],[1.6,.128],
    [1.8,.138],[1.95,.15],[2.05,.165],[ZN,.19]],z);
  // les arches : le plafond de chaque arche (z, y), relevé colonne par colonne sur le dessin ; 0 hors de l'arche
  const archF=[[.79,0],[.80,.121],[.806,.30],[.816,.394],[.84,.456],[.863,.50],[.887,.529],[.91,.556],[.934,.576],[.957,.594],[.981,.609],[1.004,.624],[1.028,.632],[1.051,.641],[1.075,.647],
    [1.099,.653],[1.122,.656],[1.204,.659],[1.228,.656],[1.251,.65],[1.275,.641],[1.299,.635],[1.322,.624],[1.346,.612],[1.369,.597],[1.393,.579],[1.416,.562],[1.44,.535],[1.463,.503],
    [1.487,.462],[1.51,.403],[1.516,.30],[1.522,.121],[1.53,0]],
        archR=[[-1.81,0],[-1.80,.121],[-1.79,.30],[-1.778,.424],[-1.754,.476],[-1.731,.518],[-1.707,.547],[-1.684,.571],[-1.66,.594],[-1.637,.609],[-1.613,.624],[-1.59,.635],[-1.566,.647],
    [-1.543,.659],[-1.519,.665],[-1.496,.671],[-1.472,.674],[-1.449,.676],[-1.366,.674],[-1.343,.671],[-1.319,.665],[-1.296,.656],[-1.272,.647],[-1.249,.638],[-1.225,.624],[-1.201,.609],
    [-1.178,.594],[-1.154,.574],[-1.131,.547],[-1.107,.518],[-1.084,.482],[-1.06,.429],[-1.049,.394],[-1.04,.30],[-1.034,.121],[-1.025,0]];
  const archH=z=>Math.max(L(archF,z),L(archR,z));
  // la plus grande largeur (la demi-largeur du plan de dessus), et la hauteur où elle tombe
  const xM=z=>L([[ZT,.70],[-2.10,.78],[-2.07,.86],[-2.03,.91],[-1.98,.935],[-1.9,.95],[-1.7,.962],[ZR,.968],[-1.2,.962],[-.9,.945],[-.5,.93],[0,.92],[.4,.93],[.8,.945],[ZF,.955],
    [1.4,.945],[1.6,.925],[1.8,.89],[1.95,.84],[2.03,.78],[2.08,.70],[ZN,.58]],z),
        yM=z=>L([[ZT,.52],[-1.9,.60],[-1.4,.60],[-.5,.52],[.5,.50],[1.2,.52],[1.8,.46],[ZN,.30]],z);
  // la CEINTURE (le bas des vitres) et le BORD DU TOIT (la gouttière ; devant, le montant du pare-brise)
  const yB=z=>L([[-1.5,.953],[-1.4,.95],[-1.084,.924],[-.996,.912],[-.85,.891],[-.70,.879],[-.5,.866],[-.26,.847],[-.113,.829],[.034,.812],[.181,.797],[.328,.779],[.62,.741],[.71,.735],
    [.77,.744],[.9,.776],[1.063,.791],[1.2,.79],[1.44,.775]],z),
        xB=z=>L([[-1.5,.70],[-1.2,.80],[-.9,.84],[-.5,.85],[0,.84],[.4,.83],[.8,.82],[1.1,.80],[1.44,.76]],z);
  const yR=z=>L([[-1.5,.953],[-1.1,1.05],[-.68,1.062],[-.3,1.068],[0,1.072],[.2,1.075],[.475,1.085],[.5,1.05],[.7,.99],[.9,.93],[1.12,.845],[1.2,.833],[1.44,.775]],z),
        xR=z=>L([[-1.5,.44],[-1.1,.53],[-.68,.58],[-.3,.61],[0,.62],[.3,.62],[.475,.60],[.5,.58],[.7,.64],[.9,.69],[1.12,.73],[1.44,.76]],z);
  // le capot (devant) et le pont (derrière) : le bord des ailes
  const xH=z=>L([[1.12,.84],[1.44,.82],[1.6,.80],[1.8,.76],[1.95,.70],[2.05,.62],[ZN,.50]],z),
        xD=z=>L([[ZT,.70],[-2.0,.85],[-1.8,.86],[-1.6,.82],[-1.4,.78]],z);
  const clWS=z=>cl((z-.5)/.1,0,1)*(1-cl((z-1.12)/.1,0,1));   /* 1 sur le pare-brise */
  // ---- LA COQUE : une section par tranche, 22 points du bas (axe) au faîte (axe) ----
  const SIMPLE=!window.dbgZagaieDetail,JM=6;   /* (23/10, Léo : « simplifie toute la voiture en la complexifiant : formes plus simples, inspi LA HONTE ») SIMPLE : 15 points par section et une tranche tous les 18 cm : de GRANDS PANS plats */
  const brut=z=>{
    const yt=yTop(z),yb=Math.min(Math.max(yBas(z),archH(z)),yt-.14),s=[];
    const xm=xM(z),ym=Math.min(yM(z),yt-.08),xl=xm-.10;
    const hk=lis(cl((z-1.12)/.32,0,1)),dk=lis(cl((-1.38-z)/.22,0,1));
    let xb=xB(z),yb2=yB(z),xr=xR(z),yr=yR(z);
    const xh=xH(z),yh=yt,xd=xD(z),yd=yt,ytc=yt-.012*hk-.035*dk;   /* les ailes (la crête = la silhouette) dominent le capot et le pont de 1,2 et 3,5 cm */
    xb=mix(xb,xh,hk);yb2=mix(yb2,yh,hk);xr=mix(xr,xh*.985,hk);yr=mix(yr,yh,hk);
    xb=mix(xb,xd,dk);yb2=mix(yb2,yd,dk);xr=mix(xr,xd*.985,dk);yr=mix(yr,yd,dk);
    const q=(1-hk)*(1-dk);
    let xs=Math.min(xb+.035*q,xm-.004),ys=Math.max(yb2-.05*q,ym+.03);
    yb2=Math.max(yb2,ys+.004);if(q>0)yr=Math.max(yr,yb2+.004);
    /* (23/10, Léo : « ça fait un peu déconstruit : smooth » ; « utilise les mêmes techniques que pour LE SQUALE ») la section a TOUJOURS 22 points ; loin du nez les points en trop sont posés sur les segments de la coque simple (mêmes grands pans, aucune différence), au nez (z > 1,85) ils reprennent la vraie courbe : le lobe de la bouche est un volume rond, plus un pavage */
    const w=SIMPLE?cl((1.85-z)/.35,0,1):0;
    const grp=(f,ts,tsS)=>{const kn=[[0,f(0)]].concat(tsS.slice().sort((a,b)=>a-b).map(t=>[t,f(t)]),[[1,f(1)]]);
      const ps=t=>{for(let i=0;i<kn.length-1;i++)if(t<=kn[i+1][0]+1e-9){const a=kn[i],b=kn[i+1],u=(t-a[0])/(b[0]-a[0]);return [a[1][0]+(b[1][0]-a[1][0])*u,a[1][1]+(b[1][1]-a[1][1])*u];}return kn[kn.length-1][1];};
      for(const t of ts){const d=f(t);if(!w){s.push(d);continue;}const q=ps(t);s.push([d[0]+(q[0]-d[0])*w,d[1]+(q[1]-d[1])*w]);}};
    s.push([0,yb],[xl*.8,yb],[xl,yb+.012]);
    grp(t=>[mix(xl,xm,Math.sin(t*Math.PI/2)),mix(yb+.012,ym,t)],[.3,.6,.85],[.55]);
    s.push([xm,ym]);
    grp(t=>[mix(xm,xs,Math.pow(t,1.5)),mix(ym,ys,t)],[.3,.6,.85],[.55]);
    s.push([xs,ys],[mix(xs,xb,.5),mix(ys,yb2,.5)],[xb,yb2]);
    grp(t=>[mix(xb,xr,t)+.008*Math.sin(t*Math.PI),mix(yb2,yr,t)],[.33,.66],[.5]);
    s.push([xr,yr]);
    const p=mix(mix(2.6,2.0,clWS(z)),3.0,Math.max(hk,dk));
    grp(t=>[t*xr,ytc-(ytc-yr)*Math.pow(t,p)],[.88,.72,.54,.36,.18],[.66,.33]);
    s.push([0,ytc]);
    for(let i=1;i<=9;i++)if(s[i][1]<s[i-1][1]-.0001)s[i][1]=s[i-1][1];
    return s;};
  /* LE NEZ ET LA POUPE ARRONDIS : au-delà de AV et en deçà de AP, la dernière section complète est RÉDUITE en largeur (le plan de dessus) et ROGNÉE au profil. */
  const AV=2.03,AP=-1.97,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yTop(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const SM=new Map(),S=z=>{const k=Math.round(z*4000);let s=SM.get(k);if(!s){s=sect(k/4000);SM.set(k,s);}return s;};
  // la hauteur de la tôle en (z, |x|) : pour poser les détails dessus (du faîte vers le bas, la première facette qui contient x)
  const surf=(z,x)=>{const s=S(z);x=Math.abs(x);for(let j=s.length-2;j>=JM;j--){const a=s[j],b=s[j+1],lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]);
    if(x>=lo-1e-9&&x<=hi+1e-9&&hi-lo>1e-6)return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return s[s.length-1][1];};
  const zs0=[];for(let z=ZT;z<ZN-.04;z+=SIMPLE?.18:.09)zs0.push(+z.toFixed(4));
  for(let z=1.56;z<2.03;z+=.045)zs0.push(+z.toFixed(4));   /* (23/10, Léo : « repasse sur le museau 20 fois, à côté du modèle ») le nez en tranches fines : le lobe de la bouche est un volume lisse, pas un pavage */
  zs0.push(ZN,2.10,2.085,2.07,2.05,2.03,-2.10,-2.09,-2.075,-2.055,-2.03,-2.0,-1.985,-1.97,.475,.504,1.12,1.43,1.446,-.642,-.68,.60,-.60);
  for(const a of [archF,archR])for(let i=1;i<a.length-1;i++)if(i%2===1||a[i][1]<.5)zs0.push(a[i][0]);
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.005);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':(j<=1&&z>-1.93)?'k':'p');   /* le bas de caisse est noir, sauf sous la poupe : là, le pare-chocs orange remonte */
  // ---- LA TÔLE DÉCOUPÉE AU PLAN ----
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const m=(x,y)=>[(961.5-x)/340,(690-y)/340];   /* un point du dessin de studio (pixels) → [z,y] en mètres */
  const circ=(cx,cy,r,n,sx)=>{const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;o.push([cx+Math.cos(a)*r*(sx||1),cy+Math.sin(a)*r]);}return o;};
  // les vitres de côté : tout le cadre noir et la glace d'un trait, de la fin du pare-brise à la poupe de la lunette
  const VIT=[[700,418],[700,356],[790,325],[800,322],[830,323],[900,324],[1000,326],[1100,328],[1190,329],[1250,331],[1330,332],[1400,349],[1470,364],[1470,366],[1400,367],[1330,376],[1260,386],[1200,391],
    [1120,395],[1100,397],[1000,408],[900,419],[830,428],[740,439],[700,437]].map(p=>m(p[0],p[1]));
  zo('cote',VIT,'g',{al:.45,ou:(x,y,z)=>y>.7&&z<.8&&z>-1.52});
  // le pare-brise (le cadre noir, puis la glace) et la lunette qui s'enroule sur le pont
  zo('dessus',[[1.15,0],[1.15,.76],[.47,.62],[.47,0]],'K',{al:.4});
  zo('dessus',[[1.12,0],[1.12,.72],[.50,.58],[.50,0]],'g',{al:.4});
  zo('dessus',[[-.66,0],[-.66,.61],[-1.1,.54],[-1.52,.45],[-1.52,0]],'K',{al:.3,ou:(x,y,z)=>y>.9});
  zo('dessus',[[-.68,0],[-.68,.58],[-1.1,.51],[-1.5,.43],[-1.5,0]],'g',{al:.3,ou:(x,y,z)=>y>.9});
  // les joints de la porte, relevés sur le dessin (avant, bas, arrière), et l'évent derrière la porte
  const PORTE=[[716,440],[711,460],[708,480],[707,500],[705,520],[706,560],[706,600],[704,622],[740,621],[800,619],[860,617],[920,614],[980,611],[1040,608],[1062,600],[1081,570],[1100,540],[1121,510],
    [1139,480],[1155,450],[1160,440],[1156,425],[1148,405],[1140,396]].map(p=>m(p[0],p[1]));
  zo('cote',O.bande(PORTE,.0062),'x',{al:.55,ou:(x,y,z)=>y<.8&&z>-.7&&z<.75});   /* le joint de la porte : un TROU dans la tôle (la rainure se construit plus bas, en relief) */
  const VENT=[[1163,512],[1170,530],[1175,548],[1178,566],[1174,584],[1168,598],[1155,608],[1138,606],[1131,598],[1134,584],[1139,568],[1146,550],[1154,536],[1160,522]].map(p=>m(p[0],p[1]));   /* l'évent derrière la porte (z, y) : relevé sur le dessin */
  zo('cote',VENT,'x',{al:.5,ou:(x,y,z)=>z<-.4&&z>-.7&&y<.6});   /* un TROU dans la tôle : la cavité se construit plus bas */
  // la gueule et les phares : des TROUS dans la coque (la clé x s'enlève à la sortie) ; la cavité, les lèvres et le verre en retrait se posent plus bas
  const MG=[[0,.197],[.2,.198],[.42,.199],[.52,.211],[.60,.221],[.653,.225],[.673,.238],[.693,.25],[.713,.286],[.715,.33],[.70,.374],[.686,.397],[.665,.409],[.644,.421],[.6,.421],[.54,.417],[.45,.411],
    [.36,.403],[.30,.397],[.2,.386],[.1,.376],[0,.371]];   /* le demi-contour de la gueule, du bas-centre au haut-centre (relevé sur la photo de 3/4 avant, posé sur la tôle) */
  zo('face',MG,'x',{al:.25,ou:(x,y,z)=>z>1.95&&y<.5});
  const LENS_PLAN=[[1.923,.523],[1.872,.519],[1.845,.516],[1.817,.538],[1.773,.553],[1.729,.548],[1.697,.583],[1.666,.652],[1.639,.728],[1.62,.798],[1.60,.811],[1.686,.792],[1.774,.781],[1.868,.757],
    [1.925,.742],[1.955,.70],[1.948,.639],[1.932,.565]];   /* le contour du phare, vu de dessus (z, |x|), relevé de même */
  zo('dessus',LENS_PLAN,'x',{al:.3,ou:(x,y,z)=>z>1.55&&y>.45});
  const SIDE=[[1.592,.69],[1.59,.63],[1.64,.55],[1.72,.485]];   /* la suite de la fente (23/10 : elle s arrête avant l arc de la bouche, les deux fils ne se croisent plus) ; elle : elle contourne l'arrière du phare et file sur le flanc vers la joue (z, y) */
  const BOUCHE=[[1.958,.495],[1.954,.463],[1.942,.438],[1.926,.407],[1.913,.365],[1.894,.322],[1.881,.268],[1.89,.219],[1.93,.186],[1.977,.174]];   /* LA FENTE DE LA BOUCHE : relevée en reportant le fil blanc de la capture de Léo sur la tôle (`dbgRayon`) — un arc qui descend de sous le phare le long de l'angle de la joue, tourne et revient sous le menton (z, y) ; 23/10 */
  const LFRONT=[[1.941,.53],[1.948,.57],[1.962,.64],[1.969,.70],[1.962,.74],[1.957,.76]];   /* le début de la fente (23/10, Léo : « la fente est reliée au phare ») : elle PART du bord avant-bas du phare, le longe un cran en avant (z, |x|), puis plonge sur le côté en croissant (BOUCHE) */
  const SEAM=[[1.997,0],[1.993,.05],[1.988,.17],[1.982,.28],[1.974,.39],[1.958,.49],[1.928,.532]];   /* le joint du bord avant du capot (z, |x|), relevé sur la photo et posé sur la tôle */
  zo('dessus',O.bande(SEAM,.0058),'x',{al:.3,ou:(x,y,z)=>z>1.85&&y>.4});
  zo('cote',O.bande(SIDE,.0058),'x',{al:.5,ou:(x,y,z)=>z>1.5&&y>.38});
  /* LE CROISSANT (23/10, étude de la photo de la vraie 5-95 : « la fente » est un CROISSANT sombre qui sépare le lobe de la bouche de l'aile : une pointe fine juste sous l'angle bas du phare, large au milieu (3,5 cm),
     une pointe fine en bas où la lèvre du bas avance) : sa largeur n'est pas constante ; le bord du côté bouche (vers l'avant) est un gros boudin de la couleur de la caisse */
  const bsp=(L,pas)=>{const o=[L[0]];for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/pas));for(let k=1;k<=n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;};
  const CRQ=bsp(BOUCHE,.02),CRW=i=>.0115*Math.pow(Math.sin(Math.PI*i/(CRQ.length-1)),.8)+.0012;
  const CRO=(i,u)=>{const a=CRQ[Math.max(0,i-1)],b=CRQ[Math.min(CRQ.length-1,i+1)];let tz=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tz,ty)||1;tz/=l;ty/=l;let nz=ty,ny=-tz;if(nz<0){nz=-nz;ny=-ny;}return [CRQ[i][0]+nz*u,CRQ[i][1]+ny*u];};   /* +u : vers l'avant (le côté bouche) */
  zo('dessus',O.bande(LFRONT,.0040),'x',{al:.3,ou:(x,y,z)=>z>1.85&&y>.4});
  zo('cote',CRQ.map((q,i)=>CRO(i,-CRW(i))).concat(CRQ.map((q,i)=>CRO(CRQ.length-1-i,CRW(CRQ.length-1-i)))),'x',{al:.45,ou:(x,y,z)=>z>1.78&&y<.58&&Math.abs(x)>.62});   /* le joint du capot : un TROU, la rainure se construit plus bas */
  // la poupe : le MASQUE sombre qui entoure les feux et la grille (la photo de dos), les deux nids des feux ronds, la grille perforée entre eux (de dos)
  const dosZ=(x,y,z)=>z<-1.9;
  zo('dos',[[0,.55],[.50,.55],[.66,.58],[.78,.64],[.83,.74],[.80,.86],[.70,.93],[0,.945]],'C',{al:.25,ou:dosZ});
  zo('dos',circ(.64,.74,.17,24),'K',{al:.25,ou:dosZ});
  zo('dos',[[0,.62],[.50,.62],[.52,.66],[.52,.85],[.50,.87],[0,.87]],'M',{al:.25,ou:dosZ});
  zo('dos',[[0,.30],[.62,.30],[.70,.33],[.55,.44],[0,.44]],'k',{al:.2,ou:dosZ});   /* le diffuseur noir sous la plaque */
  const MEMO=(typeof SHAPES==='object'&&SHAPES.zagato&&SHAPES.zagato.length===1)?(SHAPES.zagato._tole||(SHAPES.zagato._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>{const gs=O.decoupe(PL.done(),GP,Z,PP,MEMO,['g',GP]);   /* les normales de la vitre ET de la tôle se lissent (par groupes de facettes < 35° : les arêtes vives restent nettes) — l'arrondi se lit */
    for(const g in gs){const G=gs[g],pa=G.attributes.position.array,na=G.attributes.normal.array,ca=G.attributes.color.array,op=[],on=[],oc=[];let nul=0;   /* les TROUS : les facettes de la clé x (magenta) ne sortent pas */
      for(let i=0;i<pa.length;i+=9){if(ca[i]>.99&&ca[i+1]<.01&&ca[i+2]>.99){nul++;continue;}for(let j=0;j<9;j++){op.push(pa[i+j]);on.push(na[i+j]);oc.push(ca[i+j]);}}
      if(!nul)continue;const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(op,3));g2.setAttribute('normal',new THREE.Float32BufferAttribute(on,3));
      g2.setAttribute('color',new THREE.Float32BufferAttribute(oc,3));G.dispose();gs[g]=g2;}
    for(const g9 of ['g',GP])if(gs[g9])if(!SIMPLE||g9==='g')lisseDiffuse(gs[g9],SIMPLE?3:12,1);else if(g9===GP)lisseDiffuse(gs[g9],5,1,(x,y,z)=>z>1.55);   /* le NEZ seul coule (le lobe de la bouche est un volume lisse comme sur la photo) ; le reste garde ses grands pans */   /* la laque et la vitre coulent : les ondulations du loft ne se lisent plus dans les reflets */
    if(gs[GP])patineGeo(gs[GP],{marbre:.035,echelle:.42,graine:3});   /* la marbrure du satiné : la laque n'a pas le même ton partout (la leçon de LA HONTE) */
    return gs;}});
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  // une pièce posée SUR la tôle en (|x|, z), son axe y couché sur la normale (la pente en z et en x relevée sur la coque) ; `sd` : le côté
  const surN=(z,x,sd)=>{const sz=(surf(z+.04,x)-surf(z-.04,x))/.08,sx=(surf(z,x-.03)-surf(z,x+.03))/.06;   /* sx > 0 : la tôle penche vers le dehors */
    const n=new THREE.Vector3(sx*sd,1,-sz).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n);return new THREE.Euler().setFromQuaternion(q);};
  const poseSur=(k,g,x,z,sd,dy,sc)=>{const y=surf(z,x)+(dy||0),e=surN(z,x,sd);P.put(k,g,sd*x,y,z,e.x,e.y,e.z,sc&&sc[0],sc&&sc[1],sc&&sc[2]);};
  // la NACELLE de toit : un conduit en carbone qui part de l'arrière du pavillon et s'effile jusqu'au pont
  {const zp=[];for(let z=-.64;z>-1.5;z-=.05)zp.push(+z.toFixed(3));zp.push(-1.5);zp.sort((a,b)=>a-b);
   const podTop=z=>L([[-1.5,.962],[-1.467,.97],[-1.408,.988],[-1.349,1.009],[-1.29,1.032],[-1.231,1.056],[-1.172,1.079],[-1.113,1.097],[-1.055,1.118],[-.996,1.132],[-.94,1.147],[-.85,1.165],
      [-.76,1.176],[-.675,1.182],[-.64,1.178]],z),podW=z=>L([[-1.5,.015],[-1.4,.06],[-1.2,.10],[-.95,.135],[-.75,.15],[-.64,.14]],z);
   P.loft(zp,z=>{const w=podW(z),yt=podTop(z),yb=Math.min(yTop(z)-.015,yt-.02),h=yt-yb;return [[0,yb],[w*.8,yb],[w,yb+h*.3],[w*.88,yb+h*.7],[w*.5,yt-h*.06],[0,yt]];},()=> 'r');}
  // les RÉTROS : la coque de la couleur de la caisse (un savon), la glace noire vers l'arrière, le bras qui sort de la porte
  const coque=sd=>{const g=new THREE.SphereGeometry(1,14,9),a=g.attributes.position;
    for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);const f=v=>Math.sign(v)*Math.pow(Math.abs(v),.62);x=f(x);y=f(y);z=f(z);a.setXYZ(i,sd*x,y,z);}
    if(sd<0)g.index.array.reverse();g.computeVertexNormals();return g;};
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  P.sym(sd=>{P.put('p',coque(sd),sd*.972,.90,.645,0,0,0,.062,.052,.092);P.put('n',new THREE.PlaneGeometry(1,1),sd*.972,.90,.552,0,Math.PI,0,.10,.085,1);
    barre('p',[sd*.86,.77,.50],[sd*.94,.88,.62],.034,.026);});
  // ---- LE MUSEAU : la cavité de la gueule (parois, fond), les lèvres roulées qui accrochent la lumière, la lame de carbone ----
  const dansS=(sc,x,y)=>{let c=false;const n=sc.length;for(let i=0,j=n-1;i<n;j=i++){const a=sc[i],b=sc[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const zFace=(x,y)=>{for(let z=ZN;z>1.7;z-=.002)if(dansS(S(z),Math.abs(x),y))return z;return 2.0;};   /* le z de la tôle du nez en (x, y) : la première tranche qui contient le point */
  const circS=(r,n)=>{const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;o.push([Math.cos(a)*r,Math.sin(a)*r]);}return o;};
  {const FO=MG.slice();for(let i=MG.length-2;i>=1;i--)FO.push([-MG[i][0],MG[i][1]]);   /* le contour complet, fermé */
   for(let it=0;it<2;it++){const o9=[];for(let i=0;i<FO.length;i++){const p=FO[i],q=FO[(i+1)%FO.length];o9.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],[.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]]);}FO.length=0;for(const q of o9)FO.push(q);}   /* (la leçon du SQUALE) le contour de la lèvre est ARRONDI (Chaikin, deux tours) : le bout de la gueule n'a plus de marches */
   const C0=[0,.30],O3=FO.map(q=>[q[0],q[1],zFace(q[0],q[1])]),N=O3.length;
   for(let it=0;it<4;it++){const z9=O3.map(q=>q[2]);for(let i=0;i<N;i++)O3[i][2]=(z9[(i+N-1)%N]+2*z9[i]+z9[(i+1)%N])/4;}   /* (la leçon du SQUALE : une seule surface lisse que tout le monde suit) le z de la lèvre est LU sur une coque en pans : il tremble ; quatre passes le lissent le long du contour */
   const ring=(k,dz)=>O3.map(q=>[C0[0]+(q[0]-C0[0])*k,C0[1]+(q[1]-C0[1])*k,q[2]-dz]);
   const ZB=1.93,R1=ring(.93,.06),R2=ring(.84,0).map(q=>[q[0],q[1],ZB]),band=(A,B,key)=>{for(let i=0;i<N;i++){const j=(i+1)%N;P.tri(key,A[i],A[j],B[j]);P.tri(key,A[i],B[j],B[i]);}};
   band(O3,R1,'N');band(R1,R2,'N');
   {const c2=[0,.30,ZB-.01];for(let i=0;i<N;i++){const j=(i+1)%N;P.tri('K',c2,R2[i],R2[j]);}}
   /* LE MUSEAU, SIMPLE ET FRANC (23/10, Léo : « continue le remodelage du museau ») : UNE lèvre épaisse et continue tout autour de la gueule (un boudin à six pans sur le contour entier, plus gros en haut : le
      bord du capot qui surplombe), un menton en planche qui avance et dont les bouts se relèvent (la planche penche, pas de crochets séparés), le carbone au fond. Plus de sourcil flottant, plus de griffes. */
   const lipM=(rad,dy0)=>{const ch=[];for(let i=0;i<=N;i++){const q=O3[i%N],dx=q[0]-C0[0],dy=q[1]-C0[1],dl=Math.hypot(dx,dy)||1;ch.push([q[0]+dx/dl*rad,q[1]+dy/dl*rad+(dy>0?dy0:0),q[2]+.010]);}return ch;};
   O.tube(P,'p',lipM(.016,.002),circS(.021,6));   /* la lèvre du haut : un boudin plus fin (la photo : le bord du capot au-dessus de la gueule est une arête, pas un bandeau) */
   // le CARBONE aux deux bouts : une plaque noire, trois lames épaisses
   for(const sd of [-1,1]){const zm=1.938,cx=sd*.47;
     P.box('K',.30,.135,.010,cx,.285,zm);
     for(let i=0;i<3;i++)P.box('C',.28,.018,.014,cx,.240+i*.045,zm+.010);}
   /* LA LAME DU BAS (23/10, Léo : « c'est un peu maladroit… le bas » ; la photo de la vraie 5-95 : une longue lame fine qui avance sous la gueule d'un bout à l'autre et finit en pointe sous le lobe) : UNE seule pièce de la couleur de
      la caisse, posée sur la face du nez (le z lu sur la coque, lissé), qui avance de 8 cm au milieu et s'effile aux bouts — plus de planche épaisse, plus de blocs ni de coins séparés (la leçon du SQUALE : une surface, des bandes parallèles) */
   {const X=[];for(let x=-.76;x<=.7601;x+=.038)X.push(+x.toFixed(3));let zf=X.map(x=>zFace(x,.20));
    for(let it=0;it<5;it++){const z9=zf.slice();for(let i=1;i<X.length-1;i++)zf[i]=(z9[i-1]+2*z9[i]+z9[i+1])/4;}
    const E=.020,Lx=x=>.014+.072*(1-Math.pow(Math.abs(x)/.78,3)),
      R=X.map((x,i)=>[x,.190,zf[i]-.035]),F=X.map((x,i)=>[x,.186,zf[i]+Lx(x)]),r=R.map(q=>[q[0],q[1]-E,q[2]]),fr=F.map(q=>[q[0],q[1]-E,q[2]]),
      qd=(a,b,c,d)=>{P.tri('p',a,b,c);P.tri('p',a,c,d);};
    for(let i=0;i<X.length-1;i++){qd(R[i],R[i+1],F[i+1],F[i]);qd(r[i],fr[i],fr[i+1],r[i+1]);qd(F[i],F[i+1],fr[i+1],fr[i]);}
    for(const i of [0,X.length-1]){qd(R[i],F[i],fr[i],r[i]);}}
   /* LA BARRE ARGENT : un fin tube chromé qui traverse la gueule d'un angle à l'autre, courbe (bas au milieu, relevée aux bouts), posé devant le carbone, accroché aux deux lèvres */
   {const ch=[];for(let x=-.64;x<=.641;x+=.08){const u=x/.64;ch.push([x,.268+.040*u*u,1.958+.012*u*u]);}O.tube(P,'c',ch,circS(.0085,8),false);}}
  // LE BLASON du nez (la photo : un petit écusson au milieu du nez, au-dessus de la gueule) : une plaque sombre à liseré d'or, penchée sur la pente du nez
  {const y0=.452,za=zFace(0,y0+.03),zb=zFace(0,y0-.03),th=Math.atan((za-zb)/.06),zc=(za+zb)/2;
   P.box('o',.044,.050,.005,0,y0,zc+.001,th,0,0);P.box('K',.034,.040,.005,0,y0,zc+.0032,th,0,0);P.box('o',.016,.020,.004,0,y0-.002,zc+.0058,th,0,0);}
  // LA LAME DU CAPOT (la photo : au pied du pare-brise le capot finit sur une arête ROULÉE, bien haute, qui court d'un montant à l'autre et se termine en pointe de chaque côté) : un COIN de la couleur de la caisse
  // (la face avant raide, le dos qui redescend vers la glace), sur sa crête un filet d'éclat ; derrière, les deux essuie-glaces noirs couchés sur la glace
  {const ch=[];for(let x=-.72;x<=.721;x+=.06){const ax=Math.abs(x);ch.push([x,surf(1.43,Math.min(ax,.70))+.003,1.432+(ax>.62?(ax-.62)*.5:0)]);}
   const PLATE=[[.010,-.004],[.010,.016],[-.012,.006],[-.060,.002],[-.060,-.004]];   /* (23/10, Léo : « on dirait un churros ») : plus un boudin arrondi : une LAME PLATE, bord avant biseauté à 1,6 cm, qui s'amincit en pointe aux bouts */
   O.tube(P,'p',ch,PLATE,false);
   for(const [x0,x1,z0,z1] of [[-.62,-.10,1.09,1.02],[.04,.58,1.02,1.09]]){const a=[x0,surf(z0,Math.abs(x0))+.005,z0],b=[x1,surf(z1,Math.abs(x1))+.005,z1];barre('k',a,b,.012,.008);}}
  // ---- LES PHARES : un verre sombre en retrait dans la coque (parois brunes), la lunette chromée du côté du nez, deux optiques rondes et cinq modules de LED ----
  {const bnd=[];for(let i=0;i<LENS_PLAN.length;i++){const a=LENS_PLAN[i],b=LENS_PLAN[(i+1)%LENS_PLAN.length],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/.035));for(let k=0;k<n;k++)bnd.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}
   const nrm=(z,x,sd)=>{const sz=(surf(z+.03,x)-surf(z-.03,x))/.06,sx=(surf(z,x-.025)-surf(z,x+.025))/.05;return new THREE.Vector3(sx*sd,1,-sz).normalize();};
   P.sym(sd=>{
     const top=bnd.map(q=>({x:sd*q[1],y:surf(q[0],q[1]),z:q[0],n:nrm(q[0],q[1],sd)})),inn=top.map(t=>[t.x-t.n.x*.012,t.y-t.n.y*.012,t.z-t.n.z*.012]),M=top.length;
     for(let i=0;i<M;i++){const j=(i+1)%M,a=[top[i].x,top[i].y,top[i].z],b=[top[j].x,top[j].y,top[j].z];P.tri('b',a,b,inn[j]);P.tri('b',a,inn[j],inn[i]);}
     for(const f of THREE.ShapeUtils.triangulateShape(bnd.map(q=>new THREE.Vector2(q[1],q[0])),[]))P.tri('k',inn[f[0]],inn[f[1]],inn[f[2]]);   /* le fond mat, sombre */
     {const cz=bnd.reduce((a,q)=>a+q[0],0)/M,cx=bnd.reduce((a,q)=>a+q[1],0)/M;   /* le reflet du ciel : une bande de verre le long du bord du dessus */
      const cen=[sd*cx,surf(cz,cx)-.0125,cz],up=inn.map(q=>[q[0]+(cen[0]-q[0])*.30,q[1]+(cen[1]-q[1])*.30+.0006,q[2]+(cen[2]-q[2])*.30]);
      for(let i=0;i<M*.42;i++){const j=i+1;if(j>=M)break;P.tri('n',[inn[i][0],inn[i][1]+.0006,inn[i][2]],[inn[j][0],inn[j][1]+.0006,inn[j][2]],up[j]);P.tri('n',[inn[i][0],inn[i][1]+.0006,inn[i][2]],up[j],up[i]);}}
     // la lunette chromée, au bord du côté du nez
     {const ch=[];for(const [z,x] of [[1.955,.70],[1.948,.639],[1.932,.565],[1.923,.523]]){const n=nrm(z,x,sd);ch.push([sd*x+n.x*.002,surf(z,x)+n.y*.002,z+n.z*.002]);}
      O.tube(P,'c',ch,circS(.0045,6),true);}
     // une pièce posée dans le retrait : (x, z) sur la coque, `dy` au-dessus du verre ; `lx, lz` : un décalage dans le plan du verre
     const at=(k,g,x,z,dy,lx,lz)=>{const n=nrm(z,x,sd),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n),e=new THREE.Euler().setFromQuaternion(q),v=new THREE.Vector3(lx||0,0,lz||0).applyQuaternion(q),h=dy-.0105;
       P.put(k,g,sd*x+n.x*h+v.x,surf(z,x)+n.y*h+v.y,z+n.z*h+v.z,e.x,e.y,e.z);};
     const cy=(r,h,n)=>new THREE.CylinderGeometry(r,r,h,n||22);
     at('k',cy(.060,.006),.679,1.87,.002);at('q',cy(.052,.008),.679,1.87,.004);at('K',cy(.044,.009),.679,1.87,.0055);at('q',cy(.036,.010),.679,1.87,.007);at('W',cy(.017,.011,16),.679,1.87,.0085);
     at('k',cy(.046,.006,18),.751,1.71,.002);at('q',cy(.036,.008,18),.751,1.71,.004);at('K',cy(.029,.009,18),.751,1.71,.0055);
     for(const [dx,dz] of [[0,0],[.014,0],[-.014,0],[.007,.012],[-.007,.012],[.007,-.012],[-.007,-.012]])at('W',cy(.0062,.011,6),.751,1.71,.0075,dx,dz);
     for(const [x,z] of [[.548,1.887],[.564,1.855],[.589,1.826],[.603,1.78],[.607,1.726]]){at('q',new THREE.BoxGeometry(.054,.008,.024),x,z,.003);at('K',new THREE.BoxGeometry(.046,.010,.017),x,z,.0045);
       for(const o of [-.012,.012])at('W',new THREE.BoxGeometry(.007,.012,.007),x,z,.0055,o,0);}
   });}
  // la poupe : la grille perforée (des alvéoles hexagonales sur du métal brossé), ses deux ailettes, les feux ronds (cerclage noir, lentille rouge à six secteurs, moyeu argent), le 3e feu
  const zBack=(x,y)=>{for(let z=ZT;z<-1.6;z+=.002)if(dansS(S(z),Math.abs(x),y))return z;return -2.0;};   /* le z de la tôle de la poupe en (x, y) : la première tranche qui contient le point */
  {const hexa=(cx,cy,cz,r)=>{for(let i=0;i<6;i++){const a=i/6*Math.PI*2,b=(i+1)/6*Math.PI*2;P.tri('k',[cx,cy,cz],[cx+Math.cos(a)*r,cy+Math.sin(a)*r,cz],[cx+Math.cos(b)*r,cy+Math.sin(b)*r,cz]);}};
   const dx=.027,dy=.0235;let rang=0;
   for(let y=.635;y<.862;y+=dy,rang++){for(let x=-.50+(rang%2)*dx/2;x<=.5001;x+=dx){if(Math.abs(x)>.505)continue;hexa(x,y,zBack(x,y)-.0016,.0096);}}   /* les alvéoles : des hexagones noirs, 5 cm de chaque côté du centre en moins */
   for(const yf of [.705,.790]){const zf=zBack(0,yf)-.014;P.box('k',1.02,.028,.040,0,yf,zf+.006);P.box('q',1.0,.0030,.040,0,yf+.0145,zf+.006);P.box('K',1.0,.006,.040,0,yf-.012,zf+.006);}   /* les deux ailettes de carbone : un dessus qui accroche la lumière */
   P.box('L',.40,.008,.010,0,.88,zBack(0,.88)-.003);}   /* le feu stop du couvercle */
  P.sym(sd=>{const ca=Math.cos(.37),sa=Math.sin(.37),e=new THREE.Euler(-Math.PI/2+.37,0,0),cx=sd*.64,cy=.74,cz=-2.052;
    const on=(dx,dy,h)=>[cx+dx,cy+sa*h+ca*dy,cz-ca*h+sa*dy];   /* un point du disque : (dx, dy) dans son plan, h vers l'arrière */
    const pose=(k,g,dx,dy,h)=>{const q=on(dx,dy,h);P.put(k,g,q[0],q[1],q[2],e.x,e.y,e.z);};
    pose('K',new THREE.CylinderGeometry(.150,.150,.012,32),0,0,.002);
    pose('L',new THREE.CylinderGeometry(.122,.122,.014,32),0,0,.010);
    pose('l',new THREE.CylinderGeometry(.060,.060,.014,24),0,0,.0125);
    for(let i=0;i<6;i++){const g=new THREE.BoxGeometry(.007,.006,.066);g.translate(0,0,.092);g.rotateY(i/6*Math.PI*2+.26);pose('K',g,0,0,.0175);}
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=i%3===0?.104:.086;pose('O',new THREE.CylinderGeometry(.0050,.0050,.004,6),Math.cos(a)*r,Math.sin(a)*r,.0185);}   /* les points de LED de la lentille */
    pose('c',new THREE.CylinderGeometry(.036,.036,.012,20),0,0,.0170);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;pose('W',new THREE.CylinderGeometry(.0042,.0042,.004,6),Math.cos(a)*.026,Math.sin(a)*.026,.0235);}   /* le moyeu : une couronne de LED */
  });
  P.box('Q',.46,.115,.012,0,.37,-2.052);   /* la place de la plaque : une boîte claire, à plat (`plqDessinee` ne prend pas une boîte penchée) */
  // les ÉTRIERS : un bloc sombre à liseré orange derrière les branches, fixes (la roue tourne devant eux)
  P.sym(sd=>{for(const w of [ZF,ZR]){const ph=2.65,rr=.19;P.box('E',.06,.075,w>0?.20:.17,sd*(.80+.022),R+Math.sin(ph)*rr,w+Math.cos(ph)*rr,Math.PI/2-ph,0,0);}});
  // ---- LES CREUX (Léo, 23/10 : « crée un creux, et représente-le en relief : c'est une partie en relief, mais collée par-dessus — le fil rouge de LA HONTE ») : chaque joint, chaque évent est une VRAIE
  // pièce : un trou dans la tôle, une rainure (deux parois, un fond sombre) ou une cavité (parois, fond, ailettes) construites dessous, un bourrelet de la couleur de la caisse collé tout autour, et sur son
  // bord haut un filet d'éclat (la lumière rase l'arête). La peau, elle, ne change pas : elle reste lisse et brillante.
  const skinX=(z,y)=>{const sc=S(z);let best=null;for(let j=0;j<=sc.length-2;j++){const a=sc[j],b=sc[j+1];if((a[1]-y)*(b[1]-y)<=0&&Math.abs(b[1]-a[1])>1e-6){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(best==null||x>best)best=x;}}return best==null?xM(z):best;};
  const V3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],CR=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],NO=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
  /* les outils des creux (`creuxOutils`, travail-caisse.js) : `surfPN` (position + normale sortante d'une surface paramétrée `F(a,b)`), `dens`, `rainure(F,L,sortie,hw,dp)` : le long d'une ligne (a, b), deux parois ('N', un noir mat), un fond sombre */
  const {surfPN,dens,rainure}=creuxOutils(P);   /* (23/10, Léo : « un petit trait orange dans la fente, bizarre — est-ce sur la voiture ? sinon enlève-le ») : sur la vraie 5-95 le joint est un trait sombre, sans lèvre ni filet : rien n'est collé le long de la rainure */
  /* le croissant : un fond noir et ses parois (3 cm), le bord du côté bouche coiffé d'un gros boudin de la couleur de la caisse */
  const croissant=(F,sd)=>{const n=CRQ.length,PT=(i,u,h)=>{const o=CRO(i,u),r=surfPN(F,o[0],o[1],[sd,0,0]);return [r.p[0]+r.n[0]*h,r.p[1]+r.n[1]*h,r.p[2]+r.n[2]*h];};
    for(let i=0;i<n-1;i++){const w0=CRW(i),w1=CRW(i+1),A0=PT(i,-w0,-.010),A1=PT(i+1,-w1,-.010),B0=PT(i,w0,-.010),B1=PT(i+1,w1,-.010),FA0=PT(i,-w0*.6,-.032),FA1=PT(i+1,-w1*.6,-.032),FB0=PT(i,w0*.6,-.032),FB1=PT(i+1,w1*.6,-.032);
      P.tri('N',A0,A1,FA1);P.tri('N',A0,FA1,FA0);P.tri('N',B0,FB0,FB1);P.tri('N',B0,FB1,B1);P.tri('N',FA0,FA1,FB1);P.tri('N',FA0,FB1,FB0);
      P.tri('N',A0,FA0,FB0);P.tri('N',A0,FB0,B0);}
    O.tube(P,'p',Array.from({length:n},(_,i)=>PT(i,CRW(i)+.006,.002)),circS(.0085,6),true);};
  const flancF=sd=>(z,y)=>[sd*skinX(z,y),y,z],topF=sd=>(z,u)=>[sd*u,surf(z,u),z];
  P.sym(sd=>{
    rainure(flancF(sd),PORTE.map(q=>[q[0],q[1]]),[sd,0,0],.0060,.020);   /* le joint de la porte : avant, bas, arrière */
    rainure(topF(sd),SEAM.map(q=>[q[0],q[1]]),[0,1,0],.0056,.016);
    rainure(flancF(sd),SIDE,[sd,0,0],.0056,.016);
    croissant(flancF(sd),sd);
    rainure(topF(sd),LFRONT,[0,1,0],.0040,.014);       /* le joint du capot */
    // L'ÉVENT derrière la porte : un trou dans la tôle (ci-dessus), sa cavité (parois, fond, quatre ailettes), la lèvre collée tout autour
    {const Fv=flancF(sd),O3=VENT.map(q=>Fv(q[0],q[1])),cz=VENT.reduce((a,q)=>a+q[0],0)/VENT.length,cy=VENT.reduce((a,q)=>a+q[1],0)/VENT.length,pn=surfPN(Fv,cz,cy,[sd,0,0]),dn=pn.n,dp=.038,
        C3=Fv(cz,cy),inn=O3.map(q=>[C3[0]+(q[0]-C3[0])*.80-dn[0]*dp,C3[1]+(q[1]-C3[1])*.80-dn[1]*dp,C3[2]+(q[2]-C3[2])*.80-dn[2]*dp]),N=O3.length,fl=[C3[0]-dn[0]*(dp+.004),C3[1]-dn[1]*(dp+.004),C3[2]-dn[2]*(dp+.004)];
      for(let i=0;i<N;i++){const j=(i+1)%N;P.tri('b',O3[i],O3[j],inn[j]);P.tri('b',O3[i],inn[j],inn[i]);P.tri('K',fl,inn[i],inn[j]);}
      for(let k=1;k<=4;k++){const yk=cy+(k-2.5)*.062,zk=cz+(k-2.5)*(-.004),xk=skinX(zk,yk);P.box('C',.010,.008,.105,sd*(xk-dp*.46),yk,zk,.55,0,0);}   /* les ailettes, penchées */
      const lip=O3.map((q,i)=>{const d=NO(V3(q,C3));return [q[0]+d[0]*.0075+dn[0]*.002,q[1]+d[1]*.0075+dn[1]*.002,q[2]+d[2]*.0075+dn[2]*.002];});lip.push(lip[0]);
      O.tube(P,'p',lip,circS(.0075,6),true);}   /* la lèvre de la couleur de la caisse, sans filet orange (Léo : « un petit trait orange, bizarre ») */
  });
  K.commit(P);
  {const mP=K.mats&&K.mats.p;if(mP){mP.reflectivity=.22;mP.shininess=28;}}   /* le cuivre de la vraie 5-95 est SATINÉ (mat-brillant) : moins de ciel dans la laque, les pans ne scintillent plus (23/10, « le museau doit être identique ») */
  // ---- LES JANTES : cinq PAIRES de branches fines qui s'écartent du moyeu (la photo), anthracite satiné, la lèvre polie, le disque derrière ----
  const JW=.28,hw=JW/2,fx=hw-.03,RR=.253;
  const J=lpKit({k:{g:'m',c:0x16171a},e:{g:'m',c:0x2d2e33},w:{g:'k',c:0x6c707a},f:{g:'m',c:0x4a4d55},a:{g:'m',c:0x26282e},h:{g:'m',c:0x3c3f48},c:{g:'c',c:0xe9ecf0},d:{g:'m',c:0x0e0f12},b:{g:'k',c:0x4a4c54},s:{g:'s',c:0x2c2e34},o:{g:'o',c:0xd9a520}});
  J.lathe('k',[[RR-.01,-hw],[R*.90,-hw],[R*.975,-hw*.72],[R,-hw*.32],[R,hw*.32],[R*.975,hw*.72],[R*.90,hw],[RR-.01,hw]],24,0,0,0,'x');
   /* (23/10, Léo : « roue lisse poly ») le pneu est LISSE : un tour à pans francs, ni pavés, ni lettres, ni valve (la leçon de LA HONTE / du SQUALE : de grands pans, pas de détail fin) */
  J.lathe('c',[[RR+.003,hw-.002],[RR+.003,fx+.020],[RR-.012,fx+.020]],28,0,0,0,'x');   /* la lèvre polie */
  J.lathe('a',[[RR-.012,fx+.020],[RR-.012,fx+.004],[RR-.030,fx+.004]],28,0,0,0,'x');
  J.lathe('s',[[RR-.030,fx+.004],[RR-.030,fx-.15]],24,0,0,0,'x');
  J.lathe('d',[[RR-.030,fx-.15],[.085,fx-.15],[.085,fx-.16],[0,fx-.16]],24,0,0,0,'x');
  J.lathe('b',[[.205,fx-.118],[.205,fx-.128],[.085,fx-.128]],28,0,0,0,'x');J.lathe('b',[[.205,fx-.118],[.200,fx-.100],[.205,fx-.118]],28,0,0,0,'x');   /* le disque */
  /* LES BRANCHES (la photo : cinq branches LARGES, plates, anthracite, chacune fourchue en Y vers la jante, un chanfrein plus clair sur le dessus) */
  const SPY=[[-.034,.072],[.034,.072],[.050,.130],[.070,.190],[.074,.238],[.022,.242],[.007,.198],[-.007,.198],[-.022,.242],[-.074,.238],[-.070,.190],[-.050,.130]],
        SPH=SPY.map(q=>[q[0]*.74,.17+(q[1]-.17)*.80]);
  for(let i=0;i<5;i++){J.prism('a',SPY,.034,fx-.016,i/5*Math.PI*2);}   /* la branche : un seul plateau plat (plus de chanfrein : lisse) */
  J.lathe('a',[[.092,fx-.002],[.090,fx+.008],[.050,fx+.014],[0,fx+.014]],20,0,0,0,'x');   /* le moyeu */
  J.lathe('c',[[.052,fx+.012],[.050,fx+.018],[.034,fx+.021],[0,fx+.021]],16,0,0,0,'x');
  J.lathe('o',[[.030,fx+.020],[.026,fx+.027],[0,fx+.029]],10,0,0,0,'x');   /* le taureau : un disque doré */
  const JG=J.done();
  return {hl:[.66,.62,1.88],tl:[.64,.74,-2.06],wx:.80,wxF:.80,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const mm=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);mm.userData.lp=1;w.add(mm);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0x2b2c31}};
};
// LES QUATRE SORTIES : deux paires, aux coins bas du pare-chocs (la photo de dos)
ECH_POTS.zagato={p:[{t:'rond',r:.05,k:'C',dbl:1,k2:'k',pts:[[.545,.35,-2.075],[.695,.35,-2.075],[-.545,.35,-2.075],[-.695,.35,-2.075]]}]};
Object.assign(I18N,{'LA ZAGAIE':'THE ASSEGAI','Une pièce unique, taillée comme une lance : la gueule grande ouverte, le toit noir qui s\'enroule, la queue coupée net.':'A one-off, cut like a spear: a gaping mouth, a black roof that wraps around, a tail chopped clean off.'});
// >>> fin SHAPES.zagato (LA ZAGAIE)
