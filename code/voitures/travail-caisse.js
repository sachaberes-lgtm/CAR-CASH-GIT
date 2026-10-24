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
