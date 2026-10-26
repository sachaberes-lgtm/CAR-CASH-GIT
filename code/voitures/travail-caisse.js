/* ===== LE TRAVAIL DE LA CAISSE (2026-10-22, Léo : « les deux aussi belles et travaillées que LA HONTE, mais ne perds pas la forme ») ===== les trois outils communs de LA ZAGAIE et du LOUP,
   pris à ce qui fait la finition de LA HONTE (boiteUsee, roueEpave : une couleur par endroit — marbrure, crasse, rouille —, des pneus sculptés) mais sans rien déplacer : la FORME ne bouge pas.
   · `lisseDiffuse(G, tours, poids)` : les normales d'une géométrie en facettes lissées en plusieurs tours (la laque coule, les ondulations d'un loft ne se lisent plus dans les reflets) ;
   · `patineGeo(G, o)` : la couleur de chaque sommet de la tôle travaillée — marbrure douce (un bruit de valeur à deux octaves), crasse du bas, poussière sur ce qui regarde le ciel, plaques de rouille ;
   · `pneuTravaille(J, R, hw, o)` : un pneu de kit sculpté — pavés de la bande de roulement en quinconce, cordon et lettres du flanc, valve. */
const PAT_H=(i,j,k)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(k,1274126177);h=Math.imul(h^(h>>>13),1103515245);return ((h^(h>>>16))>>>0)/4294967296;};
function patBruit(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),u=x-i,v=y-j,w=z-k,a=u*u*(3-2*u),b=v*v*(3-2*v),c=w*w*(3-2*w),H=PAT_H,l=(p,q,s)=>p+(q-p)*s;
  return l(l(l(H(i,j,k),H(i+1,j,k),a),l(H(i,j+1,k),H(i+1,j+1,k),a),b),l(l(H(i,j,k+1),H(i+1,j,k+1),a),l(H(i,j+1,k+1),H(i+1,j+1,k+1),a),b),c);}
/* LA LAQUE QUI COULE : chaque « côté » d'un sommet (une position et sa normale : un pli vif reste séparé) est un nœud ; à chaque tour, la normale d'un nœud devient la sienne plus la moyenne de ses
   voisins (les nœuds reliés par un côté de facette). `bulleOutils.lisse` ne regarde que les facettes qui se touchent EN un point : une facette tous les 9 cm d'un loft y survit. */
function lisseDiffuse(G,tours,poids,zone){   /* `zone(x,y,z)` (facultatif) : seuls les sommets qui y tombent sont lissés, les autres gardent leur normale */
  const N0=zone?G.attributes.normal.array.slice():null;
  const P=G.attributes.position.array,N=G.attributes.normal.array,nv=(P.length/3)|0,id=new Map(),nod=new Int32Array(nv),cur0=[];
  for(let i=0;i<nv;i++){const k=Math.round(P[i*3]*4e3)+','+Math.round(P[i*3+1]*4e3)+','+Math.round(P[i*3+2]*4e3)+'|'+Math.round(N[i*3]*400)+','+Math.round(N[i*3+1]*400)+','+Math.round(N[i*3+2]*400);
    let n=id.get(k);if(n===undefined){n=cur0.length;id.set(k,n);cur0.push([N[i*3],N[i*3+1],N[i*3+2]]);}nod[i]=n;}
  const adj=cur0.map(()=>new Set());
  for(let t=0;t+2<nv;t+=3){const a=nod[t],b=nod[t+1],c=nod[t+2];adj[a].add(b);adj[a].add(c);adj[b].add(a);adj[b].add(c);adj[c].add(a);adj[c].add(b);}
  let cur=cur0;const w=poids==null?1:poids;
  for(let it=0;it<tours;it++){cur=cur.map((v,i)=>{const L=adj[i];if(!L.size)return v;let x=0,y=0,z=0;for(const j of L){x+=cur[j][0];y+=cur[j][1];z+=cur[j][2];}
      x=v[0]+w*x/L.size;y=v[1]+w*y/L.size;z=v[2]+w*z/L.size;const h=Math.hypot(x,y,z)||1;return [x/h,y/h,z/h];});}
  for(let i=0;i<nv;i++){if(zone&&!zone(P[i*3],P[i*3+1],P[i*3+2])){N[i*3]=N0[i*3];N[i*3+1]=N0[i*3+1];N[i*3+2]=N0[i*3+2];continue;}const v=cur[nod[i]];N[i*3]=v[0];N[i*3+1]=v[1];N[i*3+2]=v[2];}
  G.attributes.normal.needsUpdate=true;return G;}
/* LA PATINE : `o` = {marbre (amplitude, .05), echelle (m, .35), graine, crasse (0-1 : le bas s'assombrit), yCrasse (m : la hauteur où elle s'éteint, .5), poussiere (0-1 : ce qui regarde le ciel s'éclaircit),
   rouille (0-1 : la part de plaques de rouille, plus fréquentes en bas), lumMin (les sommets plus sombres que ça — joints, noirs — ne sont pas touchés)}. Les couleurs sont MULTIPLIÉES : la peinture
   de la boutique passe dessous sans rien casser. */
function patineGeo(G,o){o=o||{};const P=G.attributes.position.array,C=G.attributes.color.array,N=G.attributes.normal.array,
    ech=o.echelle||.35,mar=o.marbre==null?.05:o.marbre,cra=o.crasse||0,yc=o.yCrasse||.5,pou=o.poussiere||0,rou=o.rouille||0,gr=(o.graine||1)*7.31,lmin=o.lumMin==null?.12:o.lumMin,
    sm=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
  for(let i=0;i<P.length;i+=3){const r=C[i],g=C[i+1],b=C[i+2],lum=(r+g+b)/3;if(lum<lmin)continue;
    const x=P[i]/ech+gr,y=P[i+1]/ech+gr*.7,z=P[i+2]/ech+gr*1.3,h=P[i+1];
    let k=1+mar*(2*(.65*patBruit(x,y,z)+.35*patBruit(x*2.7+5,y*2.7,z*2.7))-1);
    if(cra)k*=1-cra*(1-sm((h-.10)/yc));
    if(pou&&N[i+1]>.6)k*=1+pou*(N[i+1]-.6)/.4;
    let R9=r*k,G9=g*k,B9=b*k;
    if(rou){const rn=patBruit(x*1.9+3,y*1.9,z*1.9),seuil=1-rou*(1.5-sm((h-.1)/.8));
      if(rn>seuil){const t=Math.min(1,(rn-seuil)*6);R9=R9+(.46-R9)*t*.7;G9=G9+(.27-G9)*t*.7;B9=B9+(.17-B9)*t*.7;}}
    C[i]=R9>1?1:R9;C[i+1]=G9>1?1:G9;C[i+2]=B9>1?1:B9;}
  if(G.attributes.color)G.attributes.color.needsUpdate=true;return G;}
/* LE PNEU SCULPTÉ (la leçon de `roueEpave`) : `J` = un lpKit de roue (l'axe de la roue est +X, la jante sur la face +X) ; `R` le rayon du pneu, `hw` sa demi-largeur ; `o` : {k (clé du caoutchouc), e (clé du
   gris clair du flanc), c (clé du chrome), rm (le rayon moyen du flanc : entre le bord de la jante et l'épaule), rv (le rayon de la valve), n (nombre de pavés)}. */
function pneuTravaille(J,R,hw,o){o=o||{};const kt=o.k||'k',ke=o.e||'e',kc=o.c||'c',n=o.n||30,rm=o.rm||R*.82;
  for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2,s=i%2?1:-1;
    J.box(kt,hw*.46,.014,2*Math.PI*R/n*.60,s*hw*.30,Math.sin(a)*(R+.003),Math.cos(a)*(R+.003),Math.PI/2-a);}   /* les pavés de la bande de roulement, en quinconce */
  J.lathe(ke,[[rm+R*.05,hw+.0012],[rm+R*.09,hw+.0012]],28,0,0,0,'x');   /* le cordon du flanc */
  for(let i=0;i<24;i++){const a=(i+.5)/24*Math.PI*2,l=i%3===0?.052:i%3===1?.030:.018;
    J.box(ke,.0025,.0095,l,hw+.0008,Math.sin(a)*rm,Math.cos(a)*rm,Math.PI/2-a);}   /* les lettres du flanc : de petits traits clairs */
  {const a=2.2,rv=o.rv||R*.74;J.cyl(kc,.0055,.030,6,hw-.004,Math.sin(a)*rv,Math.cos(a)*rv,'x');}   /* la valve */
}
/* LES CREUX COLLÉS (23/10, Léo : « solidifie et utilise la technique hybride ») : l'outil commun de LA ZAGAIE et du LOUP — un joint ou un évent est un TROU dans la tôle (clé x), une rainure ou une cavité construite
   dessous (deux parois, un fond SOLIDE : rien ne se voit à travers), et un boudin de la couleur de la caisse collé autour ; la peau reste lisse. `P` = le lpKit des détails ; `o` : {mat (la clé de la matière sombre, 'N'),
   tf (une fonction de point appliquée à tout ce qui est posé : la tôle froissée du LOUP), enfonce (la rentrée de sécurité sous la surface idéale, .010)}. Rend {V3, CR, NO, surfPN, dens, rainure}.
   · `surfPN(F, a, b, sortie)` : la position et la normale SORTANTE de la surface paramétrée F au point (a, b) ;
   · `rainure(F, L, sortie, hw, dp)` : le long de la ligne L (a, b), demi-largeur hw, profondeur dp. */
function creuxOutils(P,o){o=o||{};const mat=o.mat||'N',tf=o.tf||(q=>q),en=o.enfonce==null?.010:o.enfonce;
  const V3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],CR=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],NO=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
  const surfPN=(F,a,b,sortie)=>{const e=.004,pa=V3(F(a+e,b),F(a-e,b)),pb=V3(F(a,b+e),F(a,b-e));let n=NO(CR(pa,pb));if(n[0]*sortie[0]+n[1]*sortie[1]+n[2]*sortie[2]<0)n=[-n[0],-n[1],-n[2]];return {p:F(a,b),n:n};};
  const dens=(L,pas)=>{const r=[L[0]];for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/pas));for(let k=1;k<=n;k++)r.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return r;};
  const rainure=(F,L,sortie,hw,dp)=>{const Q=dens(L,.025).map(q=>surfPN(F,q[0],q[1],sortie)),n=Q.length,B=[];
    for(let i=0;i<n;i++){const t=NO(V3(Q[Math.min(n-1,i+1)].p,Q[Math.max(0,i-1)].p));let b=NO(CR(Q[i].n,t));if(b[1]<0)b=[-b[0],-b[1],-b[2]];B.push(b);}
    const pt=(i,u,h)=>{h-=en;return tf([Q[i].p[0]+B[i][0]*u+Q[i].n[0]*h,Q[i].p[1]+B[i][1]*u+Q[i].n[1]*h,Q[i].p[2]+B[i][2]*u+Q[i].n[2]*h]);};   /* rentrée de 1 cm : la coque en grands pans passe EN DEÇÀ de la surface idéale, la rainure ne doit pas dépasser */
    for(let i=0;i<n-1;i++){const a0=pt(i,hw,0),a1=pt(i+1,hw,0),c0=pt(i,-hw,0),c1=pt(i+1,-hw,0),fa0=pt(i,hw,-dp),fa1=pt(i+1,hw,-dp),fc0=pt(i,-hw,-dp),fc1=pt(i+1,-hw,-dp);
      P.tri(mat,a0,a1,fa1);P.tri(mat,a0,fa1,fa0);P.tri(mat,c0,fc0,fc1);P.tri(mat,c0,fc1,c1);P.tri(mat,fa0,fa1,fc1);P.tri(mat,fa0,fc1,fc0);}};   /* un trait SOMBRE, sans reflet roux */
  return {V3:V3,CR:CR,NO:NO,surfPN:surfPN,dens:dens,rainure:rainure};}
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
  P.sym(sd=>{P.box('p',.08,.11,.19,sd*1.015,.815,.73);P.box('p',.05,.05,.08,sd*.955,.765,.77);P.box('k',.082,.09,.01,sd*1.016,.815,.826);});
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
/* ===== LA STRATOS, STATION MÉTÉO (2026-10-22, Léo : « retouche stratos : ajoute plusieurs gadgets cyber-futuristes de prédiction météorologique sur la voiture, répartition abstrait / technique, voiture épique » · puis « design cohérent à la Stratos ») =====
   « Stratos » vient de la STRATOSPHÈRE : la berlinette lit le ciel. La caisse ne bouge pas (ni livrée, ni feux, ni jantes, ni profil) : on lui POSE du matériel dans SA langue — même palette (le blanc, le
   vert et le rouge de la livrée, l'or des jantes, le noir mat, le chrome, le blanc chaud des phares), mêmes facettes (cylindres à 8-12 pans, boîtes), même montage que la rampe de phares : une platine
   noire, un collier d'or, la pièce par-dessus. Deux moitiés :
   · LA TECHNIQUE (du vrai matériel, dur et lisible) : l'ANÉMOMÈTRE à trois coupelles blanche / verte / rouge (mât de gauche), la MANCHE À AIR tricolore (mât de droite) — deux mâts rayés vert / blanc /
     rouge, comme la livrée —, les deux RADARS DOPPLER qui tournent en sens contraire sur la plage arrière, les deux PARATONNERRES aux bouts du becquet, les deux CADRANS (baromètre, hygromètre) au bout
     de la rampe de phares, et l'ABRI À PERSIENNES (les persiennes du capot moteur) qui porte le gyroscope ;
   · L'ABSTRAIT (de la lumière) : le GYROSCOPE (trois anneaux d'or qui basculent sur trois axes, billes verte / blanche / rouge, et l'ICÔNE du jour au centre : soleil, nuage, pluie, orage — un carrousel
     au garage, la vraie météo de la zone en course : `LVL.pluie`, `LVL.brume`, `LVL.mer`, `LVL.nuit`), la BARRE DE PRÉVISION du becquet (une courbe de pression qui défile, vert → or → rouge), le
     SCANNER sous les phares et l'ARC qui claque d'un paratonnerre à l'autre.
   Tout le fixe est versé dans le kit de la caisse (zéro dessin de plus) ; ce qui BOUGE vit dans UN groupe (`BLING.anim`, voir ailes.js ; `userData.anime` pour la salle blanche) : dix dessins de plus,
   et aucune allocation par image (tampons préparés une fois : les pièces qui changent de forme réécrivent leurs sommets en place).
   LE SCAN (2026-10-22, Léo : « oui, fais le SCAN au tap sur la Stratos ») : c'est l'ACTION SPÉCIALE de la caisse (`CAR_ACTION`, voir atchoum-feu.js) — le tap au garage, au menu ciel et en boutique lance 3 s :
   les radars, les anneaux et les coupelles s'emballent, une crête blanche balaie la barre de prévision, trois arcs claquent entre les paratonnerres (le gyroscope encaisse), l'icône défile puis se fige sur un résultat.
   `?stratos=ancien` = la Stratos d'avant · `dbgStratos({t,icone,vit,eclair,arc,scan,avance,course,ancien})` fige un état pour les photos (rend l'état courant) · `dbgAction()` joue le SCAN. */
var STRATOS_METEO=!/[?&]stratos=ancien\b/.test(location.search);
const STRATOS_M={force:{},etat:{t:0,vit:0,icone:0,k0:0,k1:0,arc:0,scan:-1}};
window.dbgStratos=function(o){if(o){if(o.ancien!=null)STRATOS_METEO=!o.ancien;Object.assign(STRATOS_M.force,o);}const e=STRATOS_M.etat,r=x=>Math.round(x*100)/100;return {meteo:STRATOS_METEO,t:r(e.t),vit:r(e.vit),icone:e.icone,eclair:[r(e.k0),r(e.k1)],arc:r(e.arc),scan:r(e.scan)};}; // {ancien:1} : la Stratos d'avant, à chaud (le banc AVANT | APRÈS)
function stratosPal(){return {
  o:{g:'c',c:0xe0b84a},                       // l'or des jantes
  V:{g:'l',c:0x20e06c},                       // le vert de la livrée, allumé
  A:{g:'l',c:0xffc02e},                       // l'or, allumé
  w:{g:'l',c:0xfff6dc},                       // le blanc chaud des phares, à blanc
  d:{g:'p',c:0x1b1c20,f:0},                   // laque noire (les pièces qui tournent)
  y:{g:'p',c:0xe0b84a,f:0}};}                 // laque dorée
var STRATOS_LAMPE=null;
function stratosLampe(){ /* la matière des pièces lumineuses qui BOUGENT : une lampe comme les autres (Basic, couleurs de sommets), mais SANS `userData.lp` — la passe des feux (feux-led.js) relit les couleurs des pièces « l » aux deux bouts de la caisse et en tire des coques de lueur FIXES : sur des barres qui montent et descendent, elles resteraient en l'air · `plq` : partagée, jamais libérée (voir buildCar) */
  if(!STRATOS_LAMPE){STRATOS_LAMPE=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});STRATOS_LAMPE.userData.plq=1;}return STRATOS_LAMPE;}
const STRATOS_Y=new THREE.Vector3(0,1,0),STRATOS_Z=new THREE.Vector3(0,0,1),STRATOS_Q=new THREE.Quaternion(),STRATOS_E=new THREE.Euler(),STRATOS_V=new THREE.Vector3(),STRATOS_M4=new THREE.Matrix4();
function stratosOrient(dx,dy,dz){ // les angles qui couchent un objet d'axe y sur (dx,dy,dz)
  STRATOS_Q.setFromUnitVectors(STRATOS_Y,STRATOS_V.set(dx,dy,dz).normalize());STRATOS_E.setFromQuaternion(STRATOS_Q,'XYZ');return [STRATOS_E.x,STRATOS_E.y,STRATOS_E.z];}
function stratosSegment(Q,k,a,b,w){ // une baguette carrée de a à b
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);if(l<1e-6)return;
  STRATOS_Q.setFromUnitVectors(STRATOS_Z,STRATOS_V.set(dx,dy,dz).normalize());STRATOS_E.setFromQuaternion(STRATOS_Q,'XYZ');
  Q.put(k,new THREE.BoxGeometry(w,w,l),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,STRATOS_E.x,STRATOS_E.y,STRATOS_E.z);}
function stratosFacettes(Q,geo,tons,x,y,z,rx,ry,rz,s){ // une pièce THREE versée en facettes LUISANTES, ombrées à la main (4 teintes selon l'inclinaison : rien n'éclaire une matière « l »)
  STRATOS_M4.compose(STRATOS_V.set(x||0,y||0,z||0),STRATOS_Q.setFromEuler(STRATOS_E.set(rx||0,ry||0,rz||0)),new THREE.Vector3(s||1,s||1,s||1));
  const g=geo.index?geo.toNonIndexed():geo;g.applyMatrix4(STRATOS_M4);const p=g.attributes.position.array;
  for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    const l=(nx*.42+ny*.74+nz*.52)*.5+.5,j=Math.max(0,Math.min(tons.length-1,Math.floor(l*tons.length)));
    Q.tri(tons[j],a,b,c);}
  g.dispose();if(g!==geo)geo.dispose();}
/* une boîte (douze triangles) écrite en place dans un tampon de sommets (P : positions, C : couleurs), au rang `o` ; rend le rang suivant. Aucune allocation : appelée à chaque image. */
const STRATOS_CX=[0,1,1,0,0,1,1,0],STRATOS_CY=[0,0,0,0,1,1,1,1],STRATOS_CZ=[0,0,1,1,0,0,1,1];          // les huit coins : 0-3 en bas, 4-7 en haut
const STRATOS_TRI=[0,1,2,0,2,3, 4,7,6,4,6,5, 0,4,5,0,5,1, 1,5,6,1,6,2, 2,6,7,2,7,3, 3,7,4,3,4,0];     // six faces, deux triangles chacune
function stratosBoite(P,C,o,xa,xb,ya,yb,za,zb,r,g,b){
  for(let k=0;k<36;k++){const c=STRATOS_TRI[k];
    P[o]=STRATOS_CX[c]?xb:xa;P[o+1]=STRATOS_CY[c]?yb:ya;P[o+2]=STRATOS_CZ[c]?zb:za;C[o]=r;C[o+1]=g;C[o+2]=b;o+=3;}
  return o;}
const STRATOS_VR=[1.1,-1.55,2.2],STRATOS_KI=[1.2,1.55,1.55,1.2];                                      // la vitesse de chaque anneau ; la taille de chaque pictogramme
const STRATOS_DIR=[1,0,0,-1,0,0,0,1,0,0,-1,0,.7,.7,0,-.7,.7,0];                                      // les six branches d'une étincelle
function stratosMeteo(K,P,G){
  const yT=G.yT,PI=Math.PI,F0=STRATOS_M.force;
  const zF=-.32,yF=yT(-.28)+.06+.0125;                                       // le centre et le dessus de l'aileron de toit
  const yP=yF+.30,yG=yF+.34;                                                  // le haut des mâts, le centre du gyroscope
  const PA=Object.assign({p:{g:'p',c:0xe9eae4,grad:[0xa7aab0,0xdcded9,0xf4f4f0]},v:{g:'p',c:0x006b2c,f:0},r:{g:'p',c:0xc4000e,f:0},
    k:{g:'m',c:0x121317},c:{g:'c',c:0xe9ecf0}},stratosPal());
  /* ————— LA TECHNIQUE, FIXE (dans le kit de la caisse) ————— */
  for(const sd of [-1,1]){const x=sd*.46;                                     // les deux mâts : sur les bouts de l'aileron de toit, au droit de ses jambes
    P.cyl('k',.055,.03,8,x,yF+.015,zF);P.cyl('V',.058,.004,10,x,yF+.0295,zF);P.cyl('o',.063,.012,8,x,yF+.036,zF);   // la platine noire, son filet vert allumé, son collier d'or
    P.cyl('v',.019,.088,6,x,yF+.086,zF);P.cyl('p',.019,.088,6,x,yF+.174,zF);P.cyl('r',.019,.088,6,x,yF+.262,zF);     // le mât rayé vert / blanc / rouge, comme la livrée
    P.cyl('o',.027,.014,6,x,yP-.004,zF);}                                     // et son chapeau d'or
  {const x=.46;P.cyl('o',.008,.09,6,x,yP,zF-.045,'z');                        // la manche à air : un bras et un cerceau d'or
   P.lathe('o',[[.064,-.006],[.078,-.006],[.078,.006],[.064,.006],[.064,-.006]],12,x,yP,zF-.09,'z');}
  P.box('p',.28,.085,.21,0,yF+.0425,zF);                                      // l'ABRI À PERSIENNES : un caisson blanc, des fentes noires comme sur le capot moteur
  for(let i=0;i<3;i++){const y=yF+.019+i*.024;
    for(const sd of [-1,1]){P.box('k',.006,.011,.17,sd*.14,y,zF);P.box('k',.22,.011,.006,0,y,zF+sd*.105);}}
  P.box('o',.29,.01,.22,0,yF+.09,zF);                                         // son chapeau d'or
  P.cyl('c',.032,.045,10,0,yF+.1175,zF,'y',.052);P.cyl('V',.055,.006,12,0,yF+.14,zF);   // le berceau du gyroscope et son anneau vert allumé
  P.cyl('A',.0035,.075,6,0,yG+.2225,zF);P.put('w',new THREE.OctahedronGeometry(.017,0),0,yG+.28,zF);   // l'antenne polaire : une pointe allumée
  P.box('V',1.02,.007,.007,0,yF-.005,zF-.105);                                // le filet vert sous le bord arrière de l'aileron de toit
  for(const sd of [-1,1]){const x=sd*.52,z=-1.42;                             // les pieds des radars, sur la plage arrière
    P.cyl('k',.058,.07,8,x,.935,z);P.cyl('V',.07,.005,12,x,.968,z);P.cyl('o',.066,.012,8,x,.977,z);P.cyl('k',.028,.05,8,x,1.005,z);}
  for(const sd of [-1,1]){const x=sd*.745,z=-1.84;                            // les paratonnerres : une platine, trois isolateurs chromés, une tige d'or, une pointe allumée
    P.box('k',.07,.035,.07,x,.915,z);for(let i=0;i<3;i++)P.cyl('c',.028-i*.002,.012,8,x,.945+i*.03,z);
    P.cyl('o',.012,.34,6,x,1.06,z);P.put('w',new THREE.OctahedronGeometry(.026,0),x,1.245,z);}
  P.sym(sd=>{const x=sd*.585,y=.83,z=1.33;                                    // les deux CADRANS, au bout de la rampe de phares : même lunette chrome, plus petits
    P.box('k',.15,.035,.06,sd*.575,.761,1.30);P.box('k',.03,.08,.04,x,yT(1.30)+.03,1.30);P.box('k',.06,.03,.05,x,.79,1.32);
    P.cyl('c',.058,.05,12,x,y,z,'z');P.cyl('K',.048,.012,12,x,y,z+.028,'z');
    for(let i=0;i<7;i++){const a=(-120+i*40)*PI/180;P.box('A',.007,.011,.005,x+Math.sin(a)*.036,y+Math.cos(a)*.036,z+.036,0,0,-a);}   // les graduations, en or : un blanc pur à l'avant ferait des coques de lueur la nuit (feux-led.js)
    const an=sd>0?.62:-.95;P.box('A',.006,.034,.004,x+Math.sin(an)*.016,y+Math.cos(an)*.016,z+.0375,0,0,-an);P.cyl('A',.006,.005,6,x,y,z+.0385,'z');});  // l'aiguille : beau temps à droite, humide à gauche
  /* ————— LE QUI BOUGE : un seul groupe ————— */
  const MG=K.add(new THREE.Group());MG.userData.bouge=1;
  const mat=g=>{if(g==='l')return stratosLampe();const L=K.mats||(K.mats={});return L[g]||(L[g]=lpMat(g,typeof FSTU==='object'&&FSTU?FSTU.on:undefined));};
  const verse=(Q,g9)=>{const gs=Q.done();for(const g in gs){const m=new THREE.Mesh(gs[g],mat(g));m.userData.lp=1;g9.add(m);}};
  // l'ANÉMOMÈTRE (mât de gauche) : un moyeu, trois bras, trois coupelles — blanche, verte, rouge
  const AN=new THREE.Group();AN.position.set(-.46,yP+.03,zF);MG.add(AN);
  {const Q=K.kit(PA);Q.cyl('d',.03,.06,8,0,0,0);Q.cyl('y',.016,.03,6,0,.04,0);
   for(let i=0;i<3;i++){const a=i/3*PI*2,c=Math.cos(a),s=Math.sin(a),e=stratosOrient(s,0,c);
     Q.box('d',.15,.014,.016,c*.075,0,-s*.075,0,a,0);
     Q.put(['p','v','r'][i],new THREE.CylinderGeometry(.05,.02,.085,8),c*.19,0,-s*.19,e[0],e[1],e[2]);}   // la coupelle, ouverte à l'envers de son mouvement
   verse(Q,AN);}
  // la MANCHE À AIR (mât de droite) : cinq bandes vert / blanc / rouge / blanc / vert, qui flotte ou pend selon l'allure
  const SK=new THREE.Group();SK.position.set(.46,yP,zF-.09);MG.add(SK);
  const NS=8,NR=6,skR=[.07,.062,.054,.046,.038,.03],skZ=[0,-.07,-.14,-.21,-.28,-.35];
  const skPos=new Float32Array((NR-1)*NS*6*3),skCol=new Float32Array((NR-1)*NS*6*3),skGeo=new THREE.BufferGeometry(),skC=new THREE.Color();
  const skCs=new Float32Array(NS),skSn=new Float32Array(NS),skX=new Float32Array(NR),skY=new Float32Array(NR),skW=new Float32Array(NR);
  for(let s=0;s<NS;s++){skCs[s]=Math.cos(s/NS*PI*2);skSn[s]=Math.sin(s/NS*PI*2);}
  {const bandes=[0x0b7a35,0xeeeee8,0xcc0a18,0xeeeee8,0x0b7a35];
   for(let b=0;b<NR-1;b++){skC.setHex(bandes[b]);for(let j=0;j<NS*6;j++){const o=(b*NS*6+j)*3;skCol[o]=skC.r;skCol[o+1]=skC.g;skCol[o+2]=skC.b;}}
   skGeo.setAttribute('position',new THREE.BufferAttribute(skPos,3));skGeo.setAttribute('color',new THREE.BufferAttribute(skCol,3));
   const sock=new THREE.Mesh(skGeo,mat('p'));sock.userData.lp=1;sock.frustumCulled=false;SK.add(sock);}
  const skPut=(o,r,s)=>{skPos[o]=skX[r]+skCs[s]*skR[r];skPos[o+1]=skY[r]+skSn[s]*skR[r];skPos[o+2]=skW[r];return o+3;};
  const skPose=(t,v)=>{ // v : 0 (arrêt, garage : elle ondule à peine) → 1 (en course : elle se tend et claque)
    const tend=.72+.28*v;
    for(let r=0;r<NR;r++){skX[r]=Math.sin(t*(2.6+5*v)-r*.95)*.011*r*(.5+v);
      skY[r]=-(1-tend)*.012*r*r+Math.sin(t*(2.1+4*v)-r*.75+1.3)*.009*r*(.5+v);skW[r]=skZ[r]*(.9+.1*tend);}
    let o=0;
    for(let b=0;b<NR-1;b++)for(let s=0;s<NS;s++){const s1=(s+1)%NS;
      o=skPut(o,b,s);o=skPut(o,b+1,s);o=skPut(o,b+1,s1);o=skPut(o,b,s);o=skPut(o,b+1,s1);o=skPut(o,b,s1);}
    skGeo.attributes.position.needsUpdate=true;skGeo.computeVertexNormals();};
  // les deux RADARS DOPPLER : une cuvette blanche (creux sombre, lèvre d'or), trois haubans, un cornet ; elle tourne, se penche de 32° vers le ciel
  const RD=[];
  for(const sd of [-1,1]){const g9=new THREE.Group();g9.position.set(sd*.52,1.03,-1.42);g9.rotation.y=PI-sd*.5;MG.add(g9);RD.push(g9);
    const Q=K.kit(PA),th=PI/2-32*PI/180,O=[0,.075,.045],Tr=(x,y,z)=>{const c=Math.cos(th),s=Math.sin(th);return [O[0]+x,O[1]+y*c-z*s,O[2]+y*s+z*c];};
    const ext=[[0,0],[.035,.004],[.07,.015],[.105,.033],[.13,.054],[.145,.074]],int=ext.map(p=>[p[0],p[1]+.02]);
    Q.box('d',.07,.035,.06,0,.0175,0);                                         // le palier
    Q.put('p',new THREE.LatheGeometry(ext.map(p=>new THREE.Vector2(p[0],p[1])),12),O[0],O[1],O[2],th,0,0);   // la cuvette
    Q.put('d',new THREE.LatheGeometry(int.map(p=>new THREE.Vector2(p[0],p[1])),12),O[0],O[1],O[2],th,0,0);   // son creux sombre
    Q.put('y',new THREE.LatheGeometry([new THREE.Vector2(.146,.074),new THREE.Vector2(.146,.094)],12),O[0],O[1],O[2],th,0,0);   // la lèvre d'or
    stratosSegment(Q,'d',[0,.035,0],Tr(0,-.012,0),.018);                       // la chape, du palier au dos de la cuvette
    for(let i=0;i<3;i++){const a=i/3*PI*2+PI/2;stratosSegment(Q,'d',Tr(Math.cos(a)*.146,.094,Math.sin(a)*.146),Tr(0,.145,0),.007);}   // les trois haubans
    {const p=Tr(0,.13,0);Q.put('y',new THREE.CylinderGeometry(.006,.017,.034,8),p[0],p[1],p[2],th,0,0);} // le cornet
    verse(Q,g9);}
  // le GYROSCOPE : trois anneaux d'or qui basculent chacun sur son axe (x, y, z), deux billes par anneau (vert, blanc, rouge) ; l'icône du jour au centre
  const GY=new THREE.Group();GY.position.set(0,yG,zF);MG.add(GY);
  const anneaux=[];
  for(const def of [{R:.17,ax:'y',bille:'V',bx:[0,0,1],tourne:'x'},{R:.145,ax:'z',bille:'w',bx:[1,0,0],tourne:'y'},{R:.12,ax:'x',bille:'L',bx:[0,1,0],tourne:'z'}]){
    const rg=new THREE.Group();GY.add(rg);const Q=K.kit(Object.assign({L:{g:'l',c:0xff2a3a}},PA));
    Q.lathe('A',[[def.R-.013,-.010],[def.R+.013,-.010],[def.R+.013,.010],[def.R-.013,.010],[def.R-.013,-.010]],18,0,0,0,def.ax);
    for(const sg of [-1,1])Q.put(def.bille,new THREE.OctahedronGeometry(.03,0),def.bx[0]*def.R*sg,def.bx[1]*def.R*sg,def.bx[2]*def.R*sg);
    verse(Q,rg);anneaux.push({g:rg,ax:def.tourne});}
  // l'ICÔNE : quatre pictogrammes versés dans UNE géométrie ; on n'en dessine qu'un (drawRange), qui pousse, tient, rentre
  const PI9={s0:0xb86a10,s1:0xe89a1c,s2:0xffc02e,s3:0xffe58a,n0:0x8fa3c8,n1:0xc3d0e8,n2:0xe9f0fb,n3:0xffffff,g0:0x0d7a3a,g1:0x15b455,g2:0x20e06c,g3:0x9bffc0,r0:0x8a0a16,r1:0xcc1424,r2:0xff2a3a,r3:0xff9aa0};
  const palI={};for(const k in PI9)palI[k]={g:'l',c:PI9[k]};
  const plages=[];let icone;
  {const Q=K.kit(palI),n9=()=>{const gs=Q.done();const n=gs.l?gs.l.attributes.position.count:0;for(const g in gs)gs[g].dispose();return n;};
   const TS=['s0','s1','s2','s3'],TN=['n0','n1','n2','n3'],TG=['g0','g1','g2','g3'],TR=['r0','r1','r2','r3'];
   let p0=0;
   stratosFacettes(Q,new THREE.IcosahedronGeometry(.036,0),TS);                                  // LE SOLEIL : un noyau, six rayons, huit petits
   for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const e=stratosOrient(d[0],d[1],d[2]);stratosFacettes(Q,new THREE.ConeGeometry(.017,.055,5),TS,d[0]*.062,d[1]*.062,d[2]*.062,e[0],e[1],e[2]);}
   for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){const e=stratosOrient(sx,sy,sz);stratosFacettes(Q,new THREE.ConeGeometry(.011,.034,4),TS,sx*.047,sy*.047,sz*.047,e[0],e[1],e[2]);}
   let p1=n9();plages.push([p0,p1-p0]);p0=p1;
   for(const b of [[-.04,-.012,0,.030],[0,.012,0,.042],[.044,-.006,0,.033],[.012,-.022,.014,.028],[-.016,-.018,-.016,.027]])stratosFacettes(Q,new THREE.IcosahedronGeometry(1,0),TN,b[0],b[1],b[2],0,0,0,b[3]);   // LE NUAGE : cinq bulles
   p1=n9();plages.push([p0,p1-p0]);p0=p1;
   stratosFacettes(Q,new THREE.IcosahedronGeometry(1,1),TG,0,-.018,0,0,0,0,.034);stratosFacettes(Q,new THREE.ConeGeometry(.0295,.062,7),TG,0,.030,0);   // LA PLUIE : une goutte et deux petites
   for(const sx of [-1,1]){stratosFacettes(Q,new THREE.IcosahedronGeometry(1,1),TG,sx*.056,-.042,0,0,0,0,.016);stratosFacettes(Q,new THREE.ConeGeometry(.0142,.03,6),TG,sx*.056,-.027,0);}
   p1=n9();plages.push([p0,p1-p0]);p0=p1;
   {const sh=new THREE.Shape();[[-.010,.085],[.040,.085],[.012,.022],[.048,.022],[-.036,-.088],[-.006,-.008],[-.046,-.008]].forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
    const g=new THREE.ExtrudeGeometry(sh,{depth:.032,bevelEnabled:false});g.translate(0,0,-.016);stratosFacettes(Q,g,TR);}                    // L'ORAGE : l'éclair, et deux étincelles
   for(const sx of [-1,1])stratosFacettes(Q,new THREE.OctahedronGeometry(.014,0),['n2','n3','n3','n3'],sx*.066,.05*sx,0);
   p1=n9();plages.push([p0,p1-p0]);
   const gs=Q.done();icone=new THREE.Mesh(gs.l,mat('l'));icone.userData.lp=1;icone.frustumCulled=false;GY.add(icone);}
  // la BARRE DE PRÉVISION : vingt et une barres sur le becquet, une courbe de pression qui défile
  const BR=new THREE.Group();BR.position.set(0,.88,-1.84);BR.rotation.x=-.30;MG.add(BR);
  const NB=21,PB=.0605,WB=.042,brPos=new Float32Array(NB*36*3),brCol=new Float32Array(NB*36*3),brGeo=new THREE.BufferGeometry();
  brGeo.setAttribute('position',new THREE.BufferAttribute(brPos,3));brGeo.setAttribute('color',new THREE.BufferAttribute(brCol,3));
  {const m=new THREE.Mesh(brGeo,mat('l'));m.userData.lp=1;m.frustumCulled=false;BR.add(m);}
  const CV=new THREE.Color(0x20e06c),CA=new THREE.Color(0xffc02e),CR=new THREE.Color(0xff2a3a),CB=new THREE.Color(),CW=new THREE.Color(0xfff6dc);
  const brPose=(t,v,sw,bz)=>{let o=0;const sc=(.5+.5*Math.sin(t*1.1*(1+v)))*(NB-1);                    // sw, bz : le balayage du SCAN (la position de la crête en barres, sa force ; 0 = aucun)
    for(let i=0;i<NB;i++){
      const w=.5+.5*Math.sin(i*.55-t*(1.5+2.5*v)),u=.5+.5*Math.sin(i*.21+t*.7),x0=(i-(NB-1)/2)*PB;let h=.018+.062*w*(.55+.45*u);
      let q=Math.max(0,Math.min(1,(h-.018)/.062)),bl=.55*Math.exp(-((i-sc)*(i-sc))/6);
      if(bz>0){const d=i-sw,g=(d<0?Math.exp(d/5):Math.exp(-d*d/3))*bz;h+=(.088-h)*g;q=Math.max(q,g);bl=Math.min(1,bl+.9*bz*Math.exp(-d*d/2));}   // devant la crête les barres montent d'un coup, derrière elle retombent en traînée, et la crête est blanche
      if(q<.5)CB.copy(CV).lerp(CA,q*2);else CB.copy(CA).lerp(CR,(q-.5)*2);
      CB.lerp(CW,bl);
      o=stratosBoite(brPos,brCol,o,x0-WB/2,x0+WB/2,.02,.02+h,-WB*.45,WB*.45,CB.r,CB.g,CB.b);}
    brGeo.attributes.position.needsUpdate=true;brGeo.attributes.color.needsUpdate=true;};
  // les ÉTINCELLES des paratonnerres (deux étoiles à six branches qui claquent à tour de rôle), l'ARC qui saute de l'un à l'autre et le SCANNER du bouclier avant : sinon invisibles (réduits à un point)
  const NA=10,NC=11,OA=2*6*2*3*3,OC=OA+NA*2*6*3;                                                     // l'arc : deux rubans de dix tronçons ; OC : où commencent les cellules du scanner dans le tampon
  const EG=new THREE.BufferGeometry(),ePos=new Float32Array(OC+NC*36*3),eCol=new Float32Array(ePos.length);
  EG.setAttribute('position',new THREE.BufferAttribute(ePos,3));EG.setAttribute('color',new THREE.BufferAttribute(eCol,3));
  {const m=new THREE.Mesh(EG,mat('l'));m.userData.lp=1;m.frustumCulled=false;MG.add(m);}
  const aJ0=new Float32Array(NA+1),aJ1=new Float32Array(NA+1),aX=new Float32Array(NA+1),aY=new Float32Array(NA+1),aZ=new Float32Array(NA+1),CS=new THREE.Color(),CD=new THREE.Color(0x06271a);
  const sPose=(t,v)=>{let o=OC;const sp=(.5+.5*Math.sin(t*1.7*(1+v)))*(NC-1);                       // un point de lumière qui va et vient sous les phares, comme un balayage de radar
    for(let i=0;i<NC;i++){const b=Math.exp(-((i-sp)*(i-sp))/1.3),x0=(i-(NC-1)/2)*.12;
      CS.copy(CD).lerp(CV,b).lerp(CW,b*b*.55);
      o=stratosBoite(ePos,eCol,o,x0-.047,x0+.047,.292,.308,G.LF+.012,G.LF+.02,CS.r,CS.g,CS.b);}};
  const eTri=(o,ax,ay,az,bx,by,bz,cx,cy,cz,r,g,b)=>{ePos[o]=ax;ePos[o+1]=ay;ePos[o+2]=az;ePos[o+3]=bx;ePos[o+4]=by;ePos[o+5]=bz;ePos[o+6]=cx;ePos[o+7]=cy;ePos[o+8]=cz;
    for(let j=0;j<9;j+=3){eCol[o+j]=r;eCol[o+j+1]=g;eCol[o+j+2]=b;}return o+9;};
  let tqArc=-1;
  const ePose=(k0,k1,ka,tq)=>{let o=0;
    for(let s=0;s<2;s++){const k=s?k1:k0,cx=(s?1:-1)*.745,cy=1.245,cz=-1.84,L=.14*k,W=.014*k;
      for(let j=0;j<6;j++){const dx=STRATOS_DIR[j*3],dy=STRATOS_DIR[j*3+1],dz=STRATOS_DIR[j*3+2],px=-dy,py=dx;                // une pointe : un triangle de chaque côté de l'axe, vu de face et de profil
        o=eTri(o,cx+dx*L,cy+dy*L,cz+dz*L,cx+px*W,cy+py*W,cz,cx-px*W,cy-py*W,cz,1,.96,.78);
        o=eTri(o,cx+dx*L,cy+dy*L,cz+dz*L,cx,cy,cz+W,cx,cy,cz-W,1,.96,.78);}}
    if(ka>0&&tq!==tqArc){tqArc=tq;for(let i=0;i<=NA;i++){aJ0[i]=(Math.random()-.5)*.13;aJ1[i]=(Math.random()-.5)*.09;}}   // l'arc change de chemin 25 fois par seconde
    for(let j=0;j<=NA;j++){const u=j/NA,e=Math.sin(u*PI);aX[j]=-.745+1.49*u;aY[j]=1.245+(aJ0[j]+.04)*e*ka;aZ[j]=-1.84+aJ1[j]*e*ka;}
    const w=.016*ka;                                                                                   // l'arc : deux rubans en croix (vus de derrière et de dessus), du bout gauche au bout droit
    for(let i=0;i<NA;i++){const ax=aX[i],ay=aY[i],az=aZ[i],bx=aX[i+1],by=aY[i+1],bz=aZ[i+1];
      o=eTri(o,ax,ay-w,az,bx,by-w,bz,bx,by+w,bz,1,.95,.7);o=eTri(o,ax,ay-w,az,bx,by+w,bz,ax,ay+w,az,1,.95,.7);}
    for(let i=0;i<NA;i++){const ax=aX[i],ay=aY[i],az=aZ[i],bx=aX[i+1],by=aY[i+1],bz=aZ[i+1];
      o=eTri(o,ax,ay,az-w,bx,by,bz-w,bx,by,bz+w,1,.95,.7);o=eTri(o,ax,ay,az-w,bx,by,bz+w,ax,ay,az+w,1,.95,.7);}
    EG.attributes.position.needsUpdate=true;EG.attributes.color.needsUpdate=true;};
  // L'ANIMATION : une horloge, une allure (arrêt → course → nitro), l'icône du jour, les étincelles et l'arc
  const E=STRATOS_M.etat;
  let T=F0.t!=null?F0.t:0,vit=F0.vit!=null?F0.vit:0,ic=F0.icone!=null?F0.icone%4:0,tIc=.35,tE0=1.2+Math.random()*2,tE1=2.5+Math.random()*3,tA=3+Math.random()*3,k0=0,k1=0,ka=0;
  let scanT=F0.scan!=null?F0.scan:-1,scanIc0=0,scanIcR=F0.scan!=null?3:0;                              // LE SCAN : le temps écoulé depuis le tap (−1 : au repos), l'icône de départ, celle qui reste (l'orage pour les photos)
  const rouleur=()=>{if(STRATOS_M.force.course!=null)return !!STRATOS_M.force.course;try{return !!(started&&!gameOver&&!garageOn);}catch(e){return false;}};   /* (banc) dbgStratos({course:1}) : comme en course */
  const nitro=()=>{try{return !!nitroOn;}catch(e){return false;}};
  const kmh=()=>{try{return Math.min(1.4,(loop._spK||0)/800);}catch(e){return 0;}};
  const ease=u=>u<=0?0:u>=1?1:1-Math.pow(1-u,3);                                                   // sortie douce
  const lisse=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
  const arcK=d=>d<0||d>=.22?0:1-d/.22;                                                             // un claquement : plein au départ, éteint 0,22 s plus tard
  const anime=dt=>{dt=Math.min(dt||0,.1);const F=STRATOS_M.force;T+=dt;
    // LE SCAN (le TAP sur la caisse, `CAR_ACTION`) : 3 s — la CHARGE (0-0,45 s : tout s'emballe), le BALAYAGE de la barre (0-1,05 s), trois ARCS (0,55 · 1,10 · 1,65 s),
    // l'icône qui DÉFILE puis se FIGE sur un résultat (1,4 s), la RETOMBÉE (1,5-3 s). Tout est fonction du temps du scan : `dbgStratos({scan:t})` le fige pour les photos.
    if(F.scan!=null)scanT=F.scan;else if(scanT>=0){scanT+=dt;if(scanT>=3){scanT=-1;tIc=.35;}}
    const sc=scanT<0?0:Math.min(ease(scanT/.45),1-lisse((scanT-1.5)/1.5)),enScan=scanT>=0&&F.icone==null;
    const cible=F.vit!=null?F.vit:rouleur()?.35+.5*kmh()+(nitro()?.35:0):0;vit+=(cible-vit)*Math.min(1,dt*2.5);if(F.vit!=null)vit=F.vit;
    const v=Math.min(1,Math.max(vit,sc)),a=1+vit*2.4;
    AN.rotation.y+=dt*(1.7+9*vit+14*sc);
    const rr=1+6*sc;RD[0].rotation.y+=dt*1.2*a*rr;RD[1].rotation.y-=dt*1.2*a*rr;
    for(let i=0;i<3;i++)anneaux[i].g.rotation[anneaux[i].ax]+=dt*STRATOS_VR[i]*a*(1+3.5*sc);
    // l'icône. EN COURSE : la météo de la zone (pluie → goutte, pluie de nuit → orage, brume ou mer de nuages → nuage, sinon soleil) ; elle pousse quand la zone change.
    // AU GARAGE : un carrousel, 2,4 s chacune — elle pousse, tient (elle tourne, elle ondule), rentre ; l'allure l'accélère. AU SCAN : elle défile à 0,17 s, puis reste sur son résultat
    let veut=-1;if(F.icone==null&&scanT<0&&rouleur()){try{veut=LVL.pluie>.35?(LVL.nuit>.5?3:2):(LVL.brume>.35||LVL.mer>.35)?1:0;}catch(e){veut=-1;}}
    if(F.icone!=null)ic=F.icone%4;
    else if(enScan)ic=scanT<1.4?(scanIc0+1+Math.floor(scanT/.17))%4:scanIcR;
    else if(veut>=0){if(ic!==veut){ic=veut;tIc=0;}tIc=Math.min(tIc+dt,1);}
    else{if(tIc>2.4)tIc%=2.4;tIc+=dt*(1+.6*vit);if(tIc>=2.4){tIc-=2.4;ic=(ic+1)%4;}}
    const u=(F.icone!=null||enScan)?1:veut>=0?Math.min(1,tIc/.3):Math.min(1,tIc/.3)*Math.min(1,(2.4-tIc)/.3);
    const pop=!enScan?1:scanT<1.4?.82+.18*((scanT%.17)/.17):1+.32*Math.exp(-((scanT-1.4)*(scanT-1.4))/.015);   // chaque pictogramme qui défile « tourne la page » ; le résultat claque
    icone.geometry.setDrawRange(plages[ic][0],plages[ic][1]);icone.scale.setScalar(Math.max(.001,((F.icone!=null||enScan)?1:ease(u))*STRATOS_KI[ic]*pop));icone.rotation.y=T*1.3;icone.position.y=Math.sin(T*2.2)*.004;
    const d1=scanT-.55,d2=scanT-1.10,d3=scanT-1.65;GY.scale.setScalar(scanT<0?1:1+.2*Math.min(1,Math.exp(-d1*d1/.006)+Math.exp(-d2*d2/.006)+Math.exp(-d3*d3/.006)));   // le gyroscope encaisse chaque arc
    skPose(T,v);brPose(T,v,scanT<0?-99:Math.min(scanT/1.05,1.25)*(NB+8)-4,scanT<0?0:scanT<1.05?1:Math.max(0,1-(scanT-1.05)/.5));
    // les étincelles : un claquement bref, une retombée (0,22 s), puis un long silence ; l'arc : tous les 4 à 9 s, 0,22 s, les deux pointes claquent avec lui
    if(F.eclair!=null||F.arc!=null){k0=k1=F.eclair!=null?F.eclair:0;ka=F.arc!=null?F.arc:0;}else if(F.scan!=null){k0=k1=ka=0;}else{
      tE0-=dt;tE1-=dt;tA-=dt;k0=Math.max(0,k0-dt/.22);k1=Math.max(0,k1-dt/.22);ka=Math.max(0,ka-dt/.22);
      if(scanT>=0){tA=Math.max(tA,2);tE0=Math.max(tE0,1);tE1=Math.max(tE1,1);}                       // pendant le SCAN, pas d'arc au hasard : les siens suffisent
      if(tE0<=0){k0=1;tE0=1.4+Math.random()*3.2-vit*.8;}if(tE1<=0){k1=1;tE1=1.4+Math.random()*3.2-vit*.8;}
      if(tA<=0){ka=1;k0=k1=1;tA=4+Math.random()*5-vit*1.5;}}
    if(scanT>=0){const ks=Math.max(arcK(d1),arcK(d2),arcK(d3));if(ks>ka)ka=ks;if(ks>k0)k0=k1=ks;}
    ePose(k0*k0,k1*k1,ka>0?Math.min(1,ka*3):0,Math.floor(T*25));sPose(T,Math.max(v,2*sc));
    E.t=T;E.vit=vit;E.icone=ic;E.k0=k0;E.k1=k1;E.arc=ka;E.scan=scanT;};
  const action=()=>{if(scanT<0){scanIc0=ic;scanT=0;}else scanT=Math.min(scanT,.9);scanIcR=(ic+1+Math.floor(Math.random()*3))%4;return true;};   // le tap : le SCAN part ; retapé en route, il reprend à la décharge
  anime(0);MG.userData.anime=anime;MG.userData.action=action;
  if(typeof CAR_ACTION!=='undefined')CAR_ACTION=action;
  if(F0.avance){for(let i=0,n=Math.round(F0.avance*30);i<n;i++)anime(1/30);}                        // (banc) dbgStratos({avance:s}) : la caisse naît s secondes plus tard
  if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);
}
// (2026-10-20) UNE FICHE SANS COTES NE SE CONSTRUIT PAS. Les caisses retirées sont réduites à `{retire:1,name}` (voir cars.js) : montées
// quand même (dbgEquipe des bancs), le repli `gt` recevait une largeur `undefined` — coque, ancrages et gabarit en NaN, le cadrage du
// garage (GAR.vD, cdx…) passait en NaN et toute l'image 3D sortait NOIRE. Le joueur n'y arrive pas (equippedCar, garageListe et
// l'inventaire écartent les retirées) : c'est le filet. Une retirée qui garde sa fiche (LA POUPÉE, LA DAYTONA…) se construit comme avant.
function carFicheOk(s){return !!s&&s.w>0&&s.h>0&&s.l>0;}
/* LES 29 RÉFÉRENCES DE LÉO (25/10 : « à ne pas toucher », le langage visuel du jeu) : la traduction ci-dessous ne les regroupe jamais. Noms sans accent ni ponctuation. */
const LANGAGE_REF=new Set(['LA HONTE','LA FIDELE','ELDORADO','LE CHARGEUR 69','LA VETTE','LA BAVAROISE','LA DOLORES','LE CORBILLARD','LE CHARGEUR','LE DEFIEUR','LE TRONE CENTRAL','LA CERISE','LE SAMOURAI','L ORIGAMI','ROSSO 40','LE MASTODONTE','LA STRATOS','ATCHOUM','LA TAURINE','LE SPECTRE','L ETERNELLE','POSTER 84','LE BLINDE NOIR','SQUALE','CHAT POP TART','LA PIZZA EXPRESS','LE LOUP','LE MUR DU SON','LE DRAGON D OR']);
/* LA TRADUCTION AU LANGAGE DU JEU (25/10, Léo : « quand les voitures ont trop de facettes, tu divises par deux le nombre de facettes » ; avant : « les traduire pour que ce soit comme les autres, mais que leur modèle soit toujours ressenti, juste ajusté ») —
   PAR DÉFAUT depuis la v912 ; `?langage=0` la coupe. Une caisse qui dépasse 12 000 triangles (tes références en font ~5 000) voit sa PEINTURE regroupée en grandes facettes planes : tous les sommets d'une même case de grille n'en font plus qu'un, au centre de leur
   groupe, les triangles qui s'effondrent disparaissent. La taille de la case est CHERCHÉE (recherche par dichotomie, mémorisée par voiture) pour que la caisse entière tombe à la MOITIÉ de ses triangles, sans dépasser 45 cm. La silhouette reste celle de la
   voiture, une facette = une couleur (la moyenne de ses sommets). SEULE la peinture (laque 44, nacre 70, métallisé 90) est regroupée : feux, chrome, grilles, plastiques, verre, roues et petites pièces (< 25 cm) gardent leurs détails. Jamais sur tes 29 RÉFÉRENCES
   (le langage visuel du jeu), ni sur le Baroudeur (sa coque est dans la même pièce que ses détails). Appelée juste avant `caisseSoude()`. */
const LANG_CACHE=new Map();
function traduisGroupe(spec,corps,tout){   // corps : le groupe dont les enfants directs sont les pièces de la caisse ; tout : la caisse entière (roues, détails…) — dans le jeu carBody et carGroup, dans la liste des voitures le même groupe
  let ON=true;try{ON=!/[?&]langage=0/.test(location.search);}catch(e){}
  if(!ON||!spec||spec.shape==='wrangler')return;   // le Baroudeur : sa coque et ses détails sont dans la même pièce, on n'y touche pas
  const nm=String(spec.name).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  if(LANGAGE_REF.has(nm))return;
  tout.updateMatrixWorld(true);
  let Tc=0;tout.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position&&!o.userData.sol&&!o.userData.noShadow&&o.material&&!Array.isArray(o.material)&&!o.material.transparent){const g=o.geometry;Tc+=g.index?g.index.count/3:g.attributes.position.count/3;}});
  if(Tc<=12000)return;
  const inv=new THREE.Matrix4().copy(corps.matrixWorld).invert(),M=new THREE.Matrix4(),P=new THREE.Vector3(),pein=[];
  for(const o of corps.children){
    if(!o.isMesh||!o.geometry||!o.geometry.attributes.position||o.userData.sol||o.userData.noShadow||!o.material||Array.isArray(o.material))continue;
    {const tg=o.material.userData&&o.material.userData.g;   // matière TAGUÉE (la liste des voitures) : peinture 'p', métallisé 'k', nacre 'n'
      if(tg!==undefined&&tg!==null){if(!(tg==='p'||tg==='k'||tg==='n'))continue;}
      else{if(o.material.isMeshBasicMaterial)continue;   // les FEUX (matière émissive) : on n'y touche pas
        const sh=o.material.shininess;if(!(sh===44||sh===70||sh===90))continue;}}   // SEULE la peinture (laque 44, nacre 70, métallisé 90)
    const g=o.geometry;g.computeBoundingBox();const bb=g.boundingBox;if(bb.min.distanceTo(bb.max)*Math.max(o.scale.x,o.scale.y,o.scale.z)<.25)continue;   // les petites pièces restent
    M.multiplyMatrices(inv,o.matrixWorld);const pos=g.attributes.position,n=pos.count,W=new Float32Array(n*3);
    for(let v=0;v<n;v++){P.fromBufferAttribute(pos,v).applyMatrix4(M);W[v*3]=P.x;W[v*3+1]=P.y;W[v*3+2]=P.z;}
    pein.push({o:o,W:W,n:n,ix:g.index,col:g.attributes.color,nT:g.index?g.index.count/3:n/3});
  }
  if(!pein.length)return;
  const cluster=(m,cell)=>{const id=new Int32Array(m.n),cl=new Map();let k=0;
    for(let v=0;v<m.n;v++){const key=((Math.round(m.W[v*3]/cell)+2048)*4096+(Math.round(m.W[v*3+1]/cell)+2048))*4096+(Math.round(m.W[v*3+2]/cell)+2048);let c=cl.get(key);if(c===undefined){c=k++;cl.set(key,c);}id[v]=c;}
    return {id:id,k:k};};
  const apres=cell=>{let t=0;for(const m of pein){const {id}=cluster(m,cell);for(let q=0;q<m.nT;q++){const a=id[m.ix?m.ix.getX(q*3):q*3],b=id[m.ix?m.ix.getX(q*3+1):q*3+1],c=id[m.ix?m.ix.getX(q*3+2):q*3+2];if(a!==b&&b!==c&&a!==c)t++;}}return t;};
  let cell=LANG_CACHE.get(spec.name);
  if(!cell){let Tp=0;for(const m of pein)Tp+=m.nT;const cible=Tc/2-(Tc-Tp);   // les triangles de peinture qu'il faut garder pour que TOUTE la caisse tombe à la moitié
    let lo=.05,hi=.45;if(cible<=0){cell=hi;}else{for(let i=0;i<8;i++){const mid=(lo+hi)/2;if(apres(mid)>cible)lo=mid;else hi=mid;}cell=hi;}
    LANG_CACHE.set(spec.name,cell);}
  for(const m of pein){
    const o=m.o,cl=cluster(m,cell),id=cl.id,X=new Float32Array(cl.k*4),C=new Float32Array(cl.k*3);
    for(let v=0;v<m.n;v++){const c=id[v];X[c*4]+=m.W[v*3];X[c*4+1]+=m.W[v*3+1];X[c*4+2]+=m.W[v*3+2];X[c*4+3]++;}
    const Pn=[],Cn=[];
    for(let t=0;t<m.nT;t++){const a=id[m.ix?m.ix.getX(t*3):t*3],b=id[m.ix?m.ix.getX(t*3+1):t*3+1],c=id[m.ix?m.ix.getX(t*3+2):t*3+2];if(a===b||b===c||a===c)continue;
      let cr=0,cg=0,cb=0;const va=m.ix?m.ix.getX(t*3):t*3,vb=m.ix?m.ix.getX(t*3+1):t*3+1,vc=m.ix?m.ix.getX(t*3+2):t*3+2;
      for(const q of [a,b,c]){const k=q*4;Pn.push(X[k]/X[k+3],X[k+1]/X[k+3],X[k+2]/X[k+3]);}
      if(m.col)for(const v of [va,vb,vc]){cr+=m.col.getX(v);cg+=m.col.getY(v);cb+=m.col.getZ(v);}
      if(m.col)for(let u=0;u<3;u++)Cn.push(cr/3,cg/3,cb/3);   // une facette = UNE couleur (la moyenne de ses trois sommets) : plus de dégradé dans un plan
