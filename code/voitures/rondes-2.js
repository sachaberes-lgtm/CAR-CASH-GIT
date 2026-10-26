// <<< fin SHAPES.bulle (RONDES) >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.cinq (RONDES) >>>
SHAPES.cinq=function(K){
  /* LA DOLCE VITA v2 — EN POLY, À LA MAIN (2026-10-26, Léo : « la voiture la plus stylée que tu puisses faire », au niveau de ROSSO 40).
     La 500 « 1957 » réduite à ce qui la fait sourire : une COQUE-BONBON en un seul loft (quatorze points par demi-section, des stations
     posées là où la forme casse, raccourcie d'un bloc : courte et dodue), le TOIT IVOIRE en pièce de couleur à part, cerné d'une gouttière
     EN RELIEF, et LE VISAGE — deux gros yeux ronds cerclés de chrome, la MOUSTACHE chromée qui remonte vers eux, le sourire du bouclier.
     Derrière, les feux en anneaux rouges à îlot couleur caisse (la signature de la 500), la baguette du hayon, la visière du becquet.
     Règles de Léo (26/10) : AUCUN trait noir peint sur la tôle (un détail de panneau = un relief), et des teintes FRANCHES qui ne brûlent
     pas au blanc sous la lampe du studio — mesuré : une face tournée vers le plafond y sort ≈ 2,6 × la teinte (linéaire) + 0,12 ; le
     bleu 0x4a7599 en sort bleu ciel, le toit 0x9d998e en sort ivoire (0x8eb2df et 0xefe8d8 brûlaient). Le noir ne reste qu'aux vitres,
     au montant central, à la bouche, au bas du bouclier, aux pieds de rétro et aux essuie-glaces (les plastiques).
     LE MUSEAU (même jour, Léo : « la forme du museau de juste avant », puis « ce sont les PHARES d'avant qui étaient mieux placés ; là
     on dirait un sourire, l'autre on aurait dit une VOITURE ») : le capot plonge bas en UN grand pan, posé en PIÈCE À PART (surélevé,
     un chant net tout autour), le nez court et large ; les phares des versions « poly auto » (petits, ronds, dans l'angle de l'aile, un
     second feu rond dessous), deux baguettes chromées droites et l'insigne, le large bandeau sombre du bas. Plus de moustache qui sourit.
     Repère du jeu : x à droite, y en haut, z vers l'avant, z = 0 au milieu. */
  const U=LPU,cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,L=(t,z)=>U.lin(t,z);
  const R=.33,ZF=1.12,ZR=-1.20,ZN=1.795,ZT=-1.755,ZA=1.56,ZB=-1.53;   // ZA/ZB : au-delà, le nez et la poupe se referment en anneaux
  const PAL={p:{g:'p',c:0x4a7599},R:{g:'p',c:0x9d998e,f:0},k:{g:'m',c:0x17181b},K:{g:'g',c:0x0d0e11},c:{g:'c',c:0xe4e8ed},g:{g:'g',c:0x1a2533},
    W:{g:'l',c:0xf6f4ec},L:{g:'l',c:0xd8202e},r:{g:'l',c:0x8a1420},O:{g:'l',c:0xffa21a},Q:{g:'l',c:0xd9dce0},d:{g:'m',c:0x0f1013}};
  const P=K.kit(PAL);P.ech=true;
  /* COURTE ET DODUE : tout est dessiné aux cotes de la 500, puis la caisse est RACCOURCIE d'un bloc (KZ) au moment de la poser — pièces,
     essieux et ancrages compris : un bonbon, pas une citadine. */
  const KZ=.955,MZ=new THREE.Matrix4().makeScale(1,1,KZ),pose=kt=>K.commit({ech:true,prims:kt.prims.map(p=>Object.assign({},p,{z:p.z*KZ,z0:p.z0*KZ,z1:p.z1*KZ,d:p.d!=null?p.d*KZ:p.d})),
    done:()=>{const gs=kt.done();for(const g in gs)gs[g].applyMatrix4(MZ);return gs;}});
  // ---- LE PROFIL ET LE PLAN (mètres, d'après le plan coté de la 500) : la partie pleine, du bas de la lunette (ZB) au bord du capot (ZA) ----
  const yT=z=>L([[ZB,.975],[-1.215,1.385],[-1.15,1.44],[-1.01,1.468],[-.65,1.493],[-.15,1.493],[.215,1.45],[.93,.975],[ZA,.80]],z),   // (le MUSEAU, 26/10, Léo : « la forme de juste avant ») le capot : UN seul grand pan qui plonge doucement
        X=z=>L([[ZB,.79],[-1.39,.813],[1.08,.82],[1.31,.814],[1.435,.80],[ZA,.78]],z),     // la plus grande largeur (le ventre) — un œuf vu de dessus
        ym=z=>L([[ZB,.66],[ZA,.62]],z),
        xs=z=>L([[ZB,.775],[-1.39,.80],[1.08,.805],[1.31,.796],[1.435,.78],[ZA,.76]],z), // le PLI D'ÉPAULE, du feu au phare
        ys=z=>L([[ZB,.905],[-1.01,.90],[0,.885],[.93,.866],[1.31,.82],[1.435,.78],[ZA,.72]],z),   // le pli d'aile plonge vers le phare
        // la CEINTURE (le bas des vitres), puis le bord du capot ; jusqu'au pied du pare-brise, sa largeur vient du PLAN DES VITRES (xg)
        yBe=z=>L([[ZB,.925],[-1.15,1.045],[-1.07,1.05],[-.65,1.035],[-.15,1.02],[.80,.95],[.93,.909],[1.31,.875],[1.435,.85],[ZA,.80]],z),
        xBe=z=>L([[.80,.735],[.93,.64],[1.31,.69],[1.435,.665],[ZA,.60]],z),
        // le BORD DU PARE-BRISE (il s'enroule : plus en arrière sur les côtés qu'au milieu)
        xR=z=>L([[.215,.575],[.93,.64]],z),
        // le HAUT DES VITRES : un arc, qui retombe devant (le montant, droit) et derrière (la custode arrondie) — la signature de la 500
        yW=z=>L([[-1.07,1.05],[-1.01,1.155],[-.885,1.265],[-.815,1.30],[-.65,1.335],[-.42,1.35],[-.15,1.348],[.215,1.29],[.30,1.262],[.80,.95]],z);
  /* LE VERRE EST PLAN (le studio et le ciel s'y reflètent : un quad tordu y fait un éclat). Les vitres latérales, le montant arrière et la
     bande au-dessus des vitres vivent sur UN plan incliné (xg) ; le pare-brise, le toit, le hayon et sa lunette sont des sections de
     forme CONSTANTE qui suivent le faîte (des trapèzes coplanaires) — LE DÔME : du faîte, une pente douce jusqu'au milieu, puis plus franche. */
  const xg=y=>.715-.40*(y-1.0);
  const gout=(z,t)=>{                                          // [la gouttière, le milieu du dôme] selon la zone
    const toit=()=>{const y=t-.10;return [[xg(y),y],[.276,t-.0276]];},hay=()=>{const y=t-.05;return [[xg(y),y],[.43,t-.035]];};
    if(z>=.215){const xr=xR(z),a=.48*xr;return [[xr,t-.06*a-.279*(xr-a)],[a,t-.06*a]];}         // le pare-brise : un V très ouvert au milieu, deux pans qui s'enroulent
    if(z>=-1.15)return toit();
    if(z<=-1.215)return hay();
    const u=(-1.15-z)/.065,A=toit(),B=hay();return A.map((p,i)=>[mix(p[0],B[i][0],u),mix(p[1],B[i][1],u)]);};   // sous la visière du becquet
  // LA DEMI-SECTION : quatorze points, du plancher (axe) au faîte (axe) — un ventre qui rentre vers le seuil, l'épaule, la serre qui se couche
  const brut=z=>{
    const yb=.20,x=X(z),t=yT(z),s=[[0,yb],[x*.80,yb],[x*.92,.30],[x*.98,.46],[x,ym(z)],[xs(z),ys(z)]];
    const cab=z>-1.07&&z<.80,bx=z<.80?null:xBe(z),by=Math.max(z>.93?t-.103*bx:yBe(z),ys(z)+.02),bx9=z<.80?xg(by):bx;   // le CAPOT : la profondeur de son dôme reste proportionnelle à sa largeur — quatre pans plans, du pare-brise au nez
    let g,m;
    if(z>.93){g=[bx9,by];m=[.48*bx9,t-.28*(t-by)];}                               // le capot
    else{[g,m]=gout(z,t);}
    g[1]=Math.max(g[1],by);if(z<.80)g[0]=Math.min(g[0],xg(g[1]));
    const wy=cab?Math.max(by,Math.min(yW(z),g[1]-.01)):by,w=cl((wy-by)/.05,0,1),y7=Math.min(by+.016*w,wy),y8=mix(y7,wy,.55);
    const V=y=>cab?[xg(y),y]:[bx9,by];
    const p9=V(wy),dg=Math.hypot(g[0]-p9[0],g[1]-p9[1]),kj=dg>.028?.028/dg:1,rl=cl((dg-.02)/.03,0,1)*.013,   // LA GOUTTIÈRE EN RELIEF : un petit décroché couleur caisse, 2,8 cm sous le bord du toit,
      p9b=[mix(g[0],p9[0],kj)+.928*rl,mix(g[1],p9[1],kj)+.371*rl];                                        // qui avance de 1,3 cm et accroche la lumière (Léo : aucun trait noir sur la tôle)
    s.push([bx9,by],V(y7),V(y8),p9,p9b,g,m,[0,t]);
    return s;};
  const AR=[[0,.725],[.19,.69],[.315,.53],[.385,.26],[.41,0]];                        // LES PASSAGES DE ROUE (dz → y) : un hexagone
  const arche=(z,s)=>{const a=U.arch(z,[ZF,ZR],AR,0);if(a<=s[0][1])return s;const o=[0,0,.04,.08,.12];
    for(let i=0;i<5;i++)s[i][1]=Math.max(s[i][1],a+o[i]);s[5][1]=Math.max(s[5][1],s[4][1]+.03);return s;};
  /* LE NEZ ET LA POUPE, EN ANNEAUX : la section de ZA (ZB) se resserre d'un bloc en largeur, et en hauteur autour du point le plus
     avancé (yc) — le capot plonge, le bouclier reste : quatre anneaux, quatre rangées de grandes facettes, un œuf taillé.
     [z, largeur, dessus, dessous] */
  const ANN={1:[[ZA,1,.80,.20],[1.66,.95,.75,.205],[1.735,.86,.665,.215],[ZN,.68,.53,.265]],   // le nez COURT et LARGE, aux coins arrondis
            [-1]:[[ZB,1,.975,.20],[-1.585,.962,.925,.20],[-1.71,.78,.70,.21],[ZT,.42,.44,.285]]},
        YC={1:.40,[-1]:.38};
  const sect=z=>{
    if(z>=ZB&&z<=ZA)return arche(z,brut(z));
    const sd=z>0?1:-1,A=sd>0?ANN[1]:ANN[-1].slice().reverse(),q=k=>L(A.map(a=>[a[0],a[k]]),z),yc=YC[sd],s0=brut(sd>0?ZA:ZB),
      t0=s0[s0.length-1][1],kx=q(1),kh=(q(2)-yc)/(t0-yc),kl=(yc-q(3))/(yc-.20);
    return arche(z,s0.map(p=>[p[0]*kx,p[1]>yc?yc+(p[1]-yc)*kh:yc-(yc-p[1])*kl]));};
  // LES STATIONS : là où la forme casse (pas plus)
  const zs0=[ZT,-1.71,-1.585,ZB,-1.44,-1.215,-1.15,-1.07,-.65,-.50,-.42,-.15,.19,.215,.30,.80,.93,ZA,1.66,1.735,ZN];
  for(const w of [ZF,ZR])for(const d of [.19,.315,.385])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.006);
  const VIT=z=>z>-1.075&&z<.805;
  P.loft(zs,sect,(j,z)=>{
    if(j<0)return 'p';
    if(j===0)return 'k';
    if(j<=5)return 'p';
    if(j===6)return VIT(z)?'c':'p';                                               // la baguette chromée sous les vitres
    if(j<=8)return VIT(z)?((z>-.50&&z<-.42)?'K':'g'):'p';                          // les vitres, le montant central noir
    if(z>=.93||z<=ZB+.005)return 'p';                                             // capot, bas du hayon
    if(j<=10)return 'p';                                                          // le montant de pare-brise, la tôle au-dessus des vitres, la gouttière en relief
    if(z>.205)return 'g';                                                         // le pare-brise
    if(z>-1.215)return 'R';                                                       // LE TOIT IVOIRE
    return (j===12&&z>-1.44)?'g':'p';});                                          // la lunette, encastrée dans le hayon
  pose(P);
  // ---- LES OUTILS DE POSE : trouver la tôle (la face avant / arrière, le flanc) et sa normale — chaque détail s'y POSE, à plat ----
  // la tôle RÉELLE entre deux stations : l'interpolation des deux sections voisines (la section « théorique » s'en écarte entre deux stations)
  const SC=zs.map(z=>sect(z)),secL=z=>{if(z<=zs[0])return SC[0];if(z>=zs[zs.length-1])return SC[SC.length-1];let i=0;while(zs[i+1]<z)i++;
      const u=(z-zs[i])/(zs[i+1]-zs[i]),A=SC[i],B=SC[i+1];return A.map((p,k)=>[mix(p[0],B[k][0],u),mix(p[1],B[k][1],u)]);},
    hautL=(z,x)=>{const s9=secL(z);for(let i=s9.length-1;i>0;i--){const a=s9[i],b=s9[i-1];if(b[0]>=x)return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1);}return s9[0][1];};
  const dans=(s,x,y)=>{let c=false;const n=s.length;x=Math.abs(x);for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
    zBout=(x,y,sd)=>{let z=sd>0?ZN:ZT;const pas=-sd*.004;while(Math.abs(z)>.5&&!dans(secL(z),x,y))z+=pas;let a=z,b=z-pas;
      for(let i=0;i<14;i++){const m=(a+b)/2;if(dans(secL(m),x,y))a=m;else b=m;}return a;},
    nBout=(x,y,sd)=>{const e=.012,z0=zBout(x,y,sd),gx=(zBout(x+e,y,sd)-zBout(x-e,y,sd))/(2*e),gy=(zBout(x,y+e,sd)-zBout(x,y-e,sd))/(2*e);
      return new THREE.Vector3(-sd*gx,-sd*gy,sd).normalize();},
    xFl=(z,y)=>{const s=secL(z);for(let i=1;i<s.length-1;i++){const a=s[i],b=s[i+1];if((a[1]-y)*(b[1]-y)<=0&&b[1]!==a[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return s[4][0];},
    nFl=(z,y)=>{const e=.015;return new THREE.Vector3(1,-(xFl(z,y+e)-xFl(z,y-e))/(2*e),-(xFl(z+e,y)-xFl(z-e,y))/(2*e)).normalize();};
  const D=K.kit(PAL);D.ech=true;
  const Y=new THREE.Vector3(0,1,0),Zv=new THREE.Vector3(0,0,1);
  // un TOUR (lathe) posé sur la tôle : profil [rayon, hauteur le long de la normale], la hauteur 0 = la tôle
  const tour=(k,pts,n,c,d)=>{const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y,d)));D.put(k,g,c[0],c[1],c[2]);};
  // une PLAQUE (contour [x,y] dans son plan) posée sur la tôle, son haut gardé vertical, `ep` d'épaisseur hors de la tôle
  const plaque=(k,cont,ep,c,d,lev)=>{const sh=new THREE.Shape();sh.moveTo(cont[0][0],cont[0][1]);for(let i=1;i<cont.length;i++)sh.lineTo(cont[i][0],cont[i][1]);
    const g=new THREE.ExtrudeGeometry(sh,{depth:ep+.03,bevelEnabled:false});g.translate(0,0,-.03+(lev||0));
    const zz=d.clone().normalize(),xx=new THREE.Vector3().crossVectors(Y,zz).normalize(),yy=new THREE.Vector3().crossVectors(zz,xx);
    g.applyMatrix4(new THREE.Matrix4().makeBasis(xx,yy,zz));D.put(k,g,c[0],c[1],c[2]);};
  // un RUBAN posé sur la tôle (baguettes, moustache, bouche) : des centres sur la surface, leurs normales, une hauteur par point
  const ruban=(k,pts,nrm,hs,ep)=>{const Q=[];for(let i=0;i<pts.length;i++){const p=new THREE.Vector3(...pts[i]),n=nrm[i],u=Y.clone().addScaledVector(n,-n.y).normalize(),h=hs[i]/2;
      const A=p.clone().addScaledVector(u,-h),B=p.clone().addScaledVector(u,h);Q.push([A,B,A.clone().addScaledVector(n,ep),B.clone().addScaledVector(n,ep)].map(v=>[v.x,v.y,v.z]));}
    for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1];D.tri(k,a[2],b[2],b[3]);D.tri(k,a[2],b[3],a[3]);D.tri(k,a[3],b[3],b[1]);D.tri(k,a[3],b[1],a[1]);D.tri(k,a[0],b[0],b[2]);D.tri(k,a[0],b[2],a[2]);}
    for(const e of [Q[0],Q[Q.length-1]]){D.tri(k,e[0],e[2],e[3]);D.tri(k,e[0],e[3],e[1]);}};
  const surAv=(k,x0,x1,n,yf,hf,ep,sd)=>{const P9=[],N9=[],H9=[];for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=yf(x),z=zBout(x,y,sd),nn=nBout(x,y,sd);
      P9.push([x+nn.x*.003,y+nn.y*.003,z+nn.z*.003]);N9.push(nn);H9.push(hf(x));}ruban(k,P9,N9,H9,ep);};
  const surFl=(k,sd,z0,z1,n,yf,hf,ep)=>{const P9=[],N9=[],H9=[];for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n,y=yf(z),nn=nFl(z,y);nn.x*=sd;
      P9.push([sd*xFl(z,y)+nn.x*.003,y,z]);N9.push(nn);H9.push(hf(z));}ruban(k,P9,N9,H9,ep);};
  // ---- LE VISAGE : une face de VOITURE (Léo, sur e25 : « là on dirait un sourire gentil ; l'autre, on aurait dit une voiture ») ----
  // les phares et la face reprennent le placement des versions d'avant (« poly auto ») : petits phares ronds dans l'angle de l'aile, sous le
  // coin du capot, un second feu rond plus bas, deux baguettes chromées DROITES, le large bandeau sombre du bas
  for(const sd of [1,-1]){
    const dir=(x,y,k)=>{const n=nBout(x,y,1).multiplyScalar(.5).add(new THREE.Vector3(.55,.06,.83).normalize().multiplyScalar(.5)).normalize();n.x*=sd;return n;};
    // LES PHARES : petits, ronds, cerclés de chrome, dans l'angle de l'aile (ils regardent devant ET dehors)
    {const x=.565,y=.675,c=[sd*x,y,zBout(x,y,1)],n=dir(x,y);
      tour('c',[[.080,-.04],[.083,.004],[.077,.013],[.066,.016]],16,c,n);tour('W',[[.066,.012],[.053,.02],[.03,.025],[0,.026]],16,c,n);}
    // les feux ronds du bouclier, dessous
    {const x=.605,y=.52,c=[sd*x,y,zBout(x,y,1)],n=dir(x,y);
      tour('c',[[.064,-.04],[.066,.003],[.060,.01],[.05,.012]],12,c,n);tour('W',[[.05,.009],[.038,.015],[0,.018]],12,c,n);}
    // les clignotants ambre, aux coins du bouclier, à côté du bandeau
    {const x=.62,y=.345,n=nBout(x,y,1);n.x*=sd;plaque('O',[[-.06,-.017],[.06,-.017],[.06,.017],[-.06,.017]],.008,[sd*x,y,zBout(x,y,1)],n);}
  }
  // les DEUX BAGUETTES chromées, droites : la haute porte l'insigne, la basse a les bouts rabattus
  surAv('c',-.28,.28,6,x=>.605,x=>.016,.012,1);
  plaque('c',[[-.034,-.02],[.034,-.02],[.046,0],[.034,.02],[-.034,.02],[-.046,0]],.02,[0,.605,zBout(0,.605,1)],nBout(0,.605,1));   // le petit insigne (sans logo)
  surAv('c',-.36,.36,12,x=>.515-.03*Math.max(0,(Math.abs(x)-.29)/.07),x=>.014,.01,1);
  // LE BANDEAU sombre du bas, large (la prise d'air : du plastique)
  surAv('k',-.52,.52,14,x=>.345,x=>.11-.025*Math.pow(Math.abs(x)/.52,3),.006,1);
  /* LE CAPOT EN PIÈCE À PART (Léo : « un peu séparé ») : les pans du capot du loft, recopiés 1,8 cm plus haut et découpés au-dessus des
     phares (un bord avant droit, ses coins reculent d'eux-mêmes sur l'aile), avec un CHANT net tout autour — un relief couleur caisse, aucun trait noir. */
  {const LIFT=.018,yF=x=>.76,f=p=>p[1]-yF(p[0]),up=p=>[p[0],p[1]+LIFT,p[2]];
   const coupe=poly=>{const o=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=f(a),fb=f(b);
       if(fa>=0)o.push(a);if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb),q=[0,1,2].map(k=>a[k]+(b[k]-a[k])*t);q.bord=1;o.push(q);}}return o;};
   const chant=(p,r)=>{D.tri('p',p,r,up(r));D.tri('p',p,up(r),up(p));};
   const i0=zs.findIndex(z=>z>=.93-1e-6);
   for(let i=i0;i<zs.length-1;i++){const A=SC[i],C=SC[i+1],z0=zs[i],z1=zs[i+1];
     for(const sd of [1,-1]){
       for(const j of [11,12]){const a=[sd*A[j][0],A[j][1],z0],b=[sd*A[j+1][0],A[j+1][1],z0],c=[sd*C[j+1][0],C[j+1][1],z1],d=[sd*C[j][0],C[j][1],z1];
         for(const T of [[a,b,c],[a,c,d]]){const q=coupe(T);if(q.length<3)continue;
           for(let k=1;k<q.length-1;k++)D.tri('p',up(q[0]),up(q[k]),up(q[k+1]));
           for(let k=0;k<q.length;k++){const p=q[k],r=q[(k+1)%q.length];if(p.bord&&r.bord)chant(p,r);}}}       // le chant du bord avant
       {const a=[sd*A[11][0],A[11][1],z0],d=[sd*C[11][0],C[11][1],z1],fa=f(a),fd=f(d);                       // le chant du bord latéral (contre l'aile) :
        if(fa>=0&&fd>=0)chant(a,d);else if(fa>=0||fd>=0){const t=fa/(fa-fd),m=[0,1,2].map(k=>a[k]+(d[k]-a[k])*t);chant(fa>=0?a:m,fa>=0?m:d);}}}   // seulement là où le bord est au-dessus de la coupe
   }
   {const A=SC[i0],z0=zs[i0];for(const sd of [1,-1])for(const j of [11,12])chant([sd*A[j][0],A[j][1],z0],[sd*A[j+1][0],A[j+1][1],z0]);}   // le chant arrière, contre la grille d'auvent
  }

  // ---- LE FLANC ----
  for(const sd of [1,-1]){
    // LES RÉTROS : une coque IVOIRE (le toit en écho), la glace vers l'arrière, le pied noir planté dans la porte
    {const z=.60,y=1.085,x=.875,g=new THREE.CylinderGeometry(.036,.056,.13,8);g.rotateY(Math.PI/8);
      D.put('R',g,sd*x,y,z,Math.PI/2,0,0,1.45,1,1);                                  // la coque : une capsule à huit pans, plus fine vers l'avant
      D.put('g',new THREE.CircleGeometry(.05,8).rotateZ(Math.PI/8),sd*x,y,z-.066,0,Math.PI,0,1.4,1,1);   // la glace, derrière
      D.box('k',.11,.03,.05,sd*.79,1.035,.62,0,0,sd*.45);}
    // LA POIGNÉE chromée, au bout de la porte, sous le pli d'épaule
    {const z=-.36,y=.835;D.box('c',.02,.028,.15,sd*(xFl(z,y)+.006),y,z,0,0,0);}
    // LA BAGUETTE CHROMÉE du bas de porte (la finition « 1957 »)
    surFl('c',sd,.60,-.72,4,z=>.47,z=>.018,.008);
    // les répétiteurs ambre sur l'aile avant
    {const z=.92,y=.72;D.box('O',.012,.022,.06,sd*(xFl(z,y)+.004),y,z);}
  }
  // les ESSUIE-GLACES, couchés à plat sur le bas du pare-brise
  for(const [x0,x1] of [[-.30,-.01],[.02,.31]]){const zw=.895,ya=hautL(zw,Math.abs(x0))+.009,yb=hautL(zw,Math.abs(x1))+.009;
    D.box('k',x1-x0,.012,.024,(x0+x1)/2,(ya+yb)/2,zw,.56,0,0);}
  // l'ANTENNE, au fond du pavillon, couchée vers l'arrière
  D.put('k',new THREE.CylinderGeometry(.005,.011,.15,6),0,hautL(-1.04,0)+.035,-1.04,-.85,0,0);
  // ---- LA POUPE ----
  for(const sd of [1,-1]){
    // LES FEUX en anneaux rouges, l'îlot couleur caisse au milieu (la signature de la 500), posés haut sur les coins du hayon
    const x=.585,y=.835,z=zBout(x,y,-1),n=nBout(x,y,-1);n.x*=sd;const c=[sd*x,y,z],st=(w,h,k)=>{const o=[];for(let i=0;i<=6;i++){const a=i/6*Math.PI;o.push([w*Math.cos(a),h-w+w*Math.sin(a)]);}
      for(let i=0;i<=6;i++){const a=Math.PI+i/6*Math.PI;o.push([w*Math.cos(a),-(h-w)+w*Math.sin(a)]);}return o;};
    plaque('L',st(.095,.12),.012,c,n);plaque('p',st(.045,.07),.018,c,n);
    // les catadioptres du bouclier
    {const x9=.58,y9=.40,z9=zBout(x9,y9,-1),n9=nBout(x9,y9,-1);n9.x*=sd;plaque('r',[[-.05,-.016],[.05,-.016],[.05,.016],[-.05,.016]],.008,[sd*x9,y9,z9],n9);}
  }
  // la BAGUETTE CHROMÉE du hayon (sa poignée), entre les feux
  surAv('c',-.30,.30,6,x=>.905,x=>.026,.012,-1);
  // la plaque (le jeu y pose la vraie : une boîte claire, droite) et le bas du bouclier noir
  {const y=.70,z=zBout(0,y,-1);D.box('Q',.46,.12,.012,0,y,z-.004);}
  surAv('k',-.50,.50,10,x=>.31,x=>.10,.008,-1);
  // LE BECQUET IVOIRE au bout du toit (une visière qui épouse le pavillon), et le 3e feu stop dessous
  {const zb=-1.15,top=x=>hautL(zb,x),
     n9=10,xm9=.50,av=[],ar=[],avB=[],arB=[];
   for(let i=0;i<=n9;i++){const x=-xm9+2*xm9*i/n9,y=top(Math.abs(x)),r=1-.35*Math.pow(Math.abs(x)/xm9,3);
     av.push([x,y+.004,zb+.03]);ar.push([x,y-.010-.016*(1-r),zb-.12*r]);avB.push([x,y-.012,zb+.03]);arB.push([x,y-.024-.016*(1-r),zb-.12*r+.008]);}
   for(let i=0;i<n9;i++){const q=(A,B,C,E)=>{D.tri('R',A,B,C);D.tri('R',A,C,E);};
     q(av[i],av[i+1],ar[i+1],ar[i]);q(ar[i],ar[i+1],arB[i+1],arB[i]);q(arB[i],arB[i+1],avB[i+1],avB[i]);}
   for(const i of [0,n9]){D.tri('R',av[i],ar[i],arB[i]);D.tri('R',av[i],arB[i],avB[i]);}
   D.box('L',.22,.012,.02,0,top(0)-.032,zb-.106);}                                // le 3e feu stop, sous la visière
  pose(D);
  // ---- LES ROUES « 1957 » : pneu, large cercle crème, disque couleur caisse, moyeu chromé ----
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,cJ=PP.p.c!=null?PP.p.c:PAL.p.c;
  const JW=.205,hw=JW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x1a1b1e},w:{g:'p',c:0xf2ead6,f:0},p:{g:'p',c:cJ,f:0},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
  J.lathe('k',[[.22,-hw],[R*.87,-hw],[R*.97,-hw*.7],[R,-hw*.25],[R,hw*.25],[R*.97,hw*.7],[R*.87,hw],[.22,hw]],16,0,0,0,'x');
  J.lathe('w',[[.225,hw-.004],[.218,fx+.014],[.184,fx+.016]],16,0,0,0,'x');
  J.lathe('p',[[.184,fx+.016],[.118,fx+.008]],16,0,0,0,'x');
  J.lathe('c',[[.118,fx+.008],[.103,fx+.024],[.07,fx+.034],[0,fx+.038]],16,0,0,0,'x');
  J.lathe('d',[[.22,-hw+.02],[.22,fx-.03],[0,fx-.03]],16,0,0,0,'x');
  const JG=J.done();
  return {hl:[.565,.675,1.67*KZ],tl:[.585,.835,-1.63*KZ],wx:.70,wzF:ZF*KZ,wzR:-ZR*KZ,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
ECH_POTS.cinq={p:[{t:'rond',r:.032,ev:1.2,k:'c',pts:[[-.42,.27,-1.672]]}]}; // (2026-10-26) une seule sortie, à gauche sous le bouclier
Object.assign(I18N,{"LA DOLCE VITA":"LA DOLCE VITA",
 "Toit blanc, robe céleste, moustache chromée. Elle se gare dans un mouchoir de poche, et elle repart avec le mouchoir.":"White roof, sky-blue dress, chrome moustache. She parks on a handkerchief, and drives off with the handkerchief."});
// <<< fin SHAPES.cinq (RONDES) >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.robin (RONDES) >>>
SHAPES.robin=function(K){
  /* LA RELIANT ROBIN Mk1 (2026-10-18, discussion RONDES — « la trois-roues anglaise, une roue AVANT, la Mk1 des années 70, fibre de verre »).
     Pas de plan vectoriel libre : la coque vient du plan de the-blueprints.com (côté et dessus, raster, étalonné sur l'EMPATTEMENT de
     2,159 m — 170 px/m), relu à la grille en mètres du repère du jeu (x à droite, y en haut, z vers l'avant), les cotes officielles de la Mk1
     (3,33 × 1,42 × 1,37 m) et les photos de Mk1 de Wikimedia Commons pour le nez et la poupe (phares ronds, calandre à lames, pare-chocs
     chromés fins, feux rectangulaires — le plan est celui d'une Robin plus tardive, à pare-chocs enveloppants). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.265,ZF=1.294,ZR=-.865;
  const PAL={p:{g:'p',c:0x2289dc},k:{g:'m',c:0x161719},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe2e6eb},C:{g:'c',c:0x8a9098},g:{g:'g',c:0x182330},
    W:{g:'l',c:0xf6f2e4},L:{g:'l',c:0xd0182a},O:{g:'l',c:0xff9a1a},d:{g:'m',c:0x101114},s:{g:'s',c:0x2a2b30}};
  // ---- LES COURBES DU PLAN (mètres) ----
  // (la poupe de la Mk1 : 8 cm plus courte que le plan — une Robin plus tardive — et la lunette-hayon plus couchée, comme sur les photos)
  const yTop=z=>L([[-1.645,.40],[-1.635,.62],[-1.626,.80],[-1.52,.985],[-1.42,1.14],[-1.32,1.27],[-1.25,1.325],[-1.18,1.347],[.07,1.347],[.15,1.336],[.245,1.32],
    [.40,1.18],[.55,1.04],[.618,.975],[.667,.93],[.775,.90],[1.01,.863],[1.30,.815],[1.598,.77],[1.67,.752],[1.696,.74],[1.712,.70],[1.722,.60],[1.725,.45]],z);
  const yBas=z=>L([[-1.645,.33],[-1.60,.31],[-1.46,.30],[-1.25,.24],[-.52,.19],[1.05,.24],[1.50,.28],[1.725,.32]],z);
  const xM=z=>L([[-1.645,.04],[-1.6435,.24],[-1.64,.42],[-1.636,.58],[-1.62,.655],[-1.58,.69],[-1.52,.705],[-1.32,.71],[0,.71],[.50,.69],[1.0,.675],[1.50,.66],[1.62,.648],[1.68,.62],[1.70,.585],[1.714,.50],[1.72,.40],[1.7235,.24],[1.725,.04]],z);   // (les faces avant et arrière, planes, se referment en bandes : un bouchon rogné se chevauchait)
  // la ceinture (le bas des vitres) et le bord du pavillon ; derrière, le bord du hayon qui descend ; devant, le bord du capot
  const yBelt=z=>L([[-1.62,.80],[-1.47,.86],[-1.36,.90],[.60,.90],[.70,.89],[1.0,.86],[1.40,.81],[1.70,.75]],z),
        xR=z=>L([[-1.62,.58],[-1.32,.60],[-1.20,.60],[.10,.585],[.245,.555],[.40,.575],[.618,.62],[.70,.63]],z),
        yR=z=>L([[-1.626,.79],[-1.52,.975],[-1.42,1.125],[-1.32,1.25],[-1.20,1.305],[.10,1.305],[.245,1.29],[.40,1.15],[.55,1.01],[.618,.95],[.68,.90]],z);
  // la roue AVANT, seule, au milieu : un tunnel au fond de la caisse ; les roues arrière dans des passages découpés dans les flancs
  const ARF=[[0,.60],[.15,.58],[.24,.52],[.29,.44],[.31,.34],[.32,.22]],ARR=[[0,.59],[.15,.565],[.22,.52],[.27,.45],[.30,.36],[.31,.24]];
  const NS=20;
  const brut=z=>{
    const yb=yBas(z),yt=yTop(z),xm=xM(z),s=[];
    const ybA=U.arch(z,[ZR],ARR,yb),ybT=U.arch(z,[ZF],ARF,yb);         // passage arrière (flancs), tunnel avant (axe)
    const hk=lis(cl((z-.62)/.10,0,1)),rk=lis(cl((-1.30-z)/.10,0,1));
    let yc=Math.min(.71,yt-.06),xbt=xm-.025,ybt=Math.min(yBelt(z),yt-.03),xr=Math.min(xR(z),xbt-.02),yr=Math.min(yR(z),yt-.006);
    if(hk>0){const xh=xm-.07,yh=yt-.035;xr=mix(xr,xh,hk);yr=mix(yr,yh,hk);xbt=mix(xbt,xm-.03,hk);ybt=Math.min(mix(ybt,yh-.02,hk),yh-.012);}
    yr=Math.max(yr,ybt+.008);yc=Math.min(yc,ybt-.02);
    if(rk>0)xr=mix(xr,xbt-.21*(yr-ybt),rk);   // le montant du hayon garde la pente des vitres : il ne se couche pas en corniche vers la poupe
    const xl=xm-.05;
    s.push([0,ybT],[.17,ybT],[.21,Math.max(yb,Math.min(ybT,yb+.06))],[xl,ybA],[xm-.018,Math.max(ybA+.06,yb+.08)]);
    s.push([xm,Math.max(ybA+.12,.42)],[xm,Math.max(ybA+.14,.58)],[xm,yc],[xm-.008,mix(yc,ybt,.5)],[xbt,ybt]);
    for(const t of [.35,.7])s.push([mix(xbt,xr,t),mix(ybt,yr,t)]);
    s.push([xr,yr]);
    for(const t of [.93,.80,.55,.28])s.push([t*xr,yt-(yt-yr)*Math.pow(t,6)]);
    s.push([0,yt]);
    for(let i=1;i<s.length-1;i++)if(s[i][1]<s[i-1][1]-.0001&&i>3)s[i][1]=s[i-1][1];
    return s;};
  // le nez et la poupe : la dernière section complète, réduite en largeur et rognée au profil (la méthode de LA PERLE)
  const AV=1.66,AP=-1.58,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yTop(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const zs0=[-1.645,-1.64,-1.634,-1.626,-1.61,-1.595,-1.58,-1.52,-1.42,-1.32,-1.25,-1.18,-1.10,-1.00,-.90,-.80,-.70,-.60,-.50,
    -.40,-.30,-.20,-.10,0,.07,.15,.245,.32,.40,.48,.55,.618,.667,.72,.775,.85,.93,1.01,1.10,1.20,1.30,1.40,1.50,1.56,1.60,1.63,1.66,1.68,1.696,1.705,1.712,1.718,1.72,1.722,1.7235,1.725,-1.6435,-1.642];
  for(const w of [ZF,ZR])for(const d of [.15,.24,.29,.31,.32])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.001);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=1?'k':'p');
  /* LA TÔLE DÉCOUPÉE AU PLAN (côté et dessus) et aux photos (nez, poupe) : vitres et joints caoutchouc noirs, pare-brise, lunette-hayon,
     portes, capot ; devant, la calandre à lames et les clignotants ; derrière, les feux rectangulaires. */
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const VPOR=[[.484,.984],[.108,1.282],[-.343,1.282],[-.32,.896],[.484,.896]],
        VCUS=[[-.461,1.263],[-1.15,1.263],[-1.20,1.245],[-1.33,1.004],[-1.32,.93],[-1.29,.916],[-.47,.916]];
  const vit=(x,y,z)=>y>.86;
  for(const W9 of [VPOR,VCUS]){zo('cote',O.gonfle(W9,.018),'K',{al:.5,ou:vit});zo('cote',W9,'g',{al:.5,ou:vit});}
  for(const J9 of [[[.667,.885],[.69,.75],[.71,.60],[.725,.45],[.735,.30],[.735,.25]],[[-.39,1.30],[-.37,.90],[-.35,.25]],[[.74,.255],[-.36,.25]]])
    zo('cote',O.bande(J9,.0035),'j',{al:.6});
  const PBR=[[.635,0],[.635,.555],[.625,.585],[.60,.595],[.33,.555],[.255,.53],[.235,.50],[.235,0]],pbr=(x,y,z)=>z>.19&&z<.71&&y>.88;   // le pare-brise (vu de dessus)
  zo('dessus',[[.685,0],[.685,.575],[.66,.612],[.60,.625],[.32,.585],[.235,.558],[.212,.52],[.212,0]],'K',{al:.35,ou:pbr});zo('dessus',PBR,'g',{al:.35,ou:pbr});
  zo('dessus',O.bande([[.78,0],[.78,.57],[1.33,.57],[1.33,0]],.0035),'j',{al:.4,ou:(x,y,z)=>z>.7});                                        // le capot
  // la lunette-HAYON (vue de dos : les photos) et son joint
  const LUN=[[0,1.27],[.42,1.26],[.52,1.22],[.56,1.12],[.57,.94],[.55,.86],[.48,.83],[0,.83]];
  zo('dos',O.gonfle(LUN.concat(LUN.slice(1,-1).reverse().map(p=>[-p[0],p[1]])),.02).map(p=>[Math.abs(p[0]),p[1]]),'K',{al:.3,ou:(x,y,z)=>z<-1.2&&y>.78});
  zo('dos',LUN,'g',{al:.3,ou:(x,y,z)=>z<-1.2&&y>.78});
  zo('dos',[[.40,.68],[.66,.68],[.66,.58],[.40,.58]],'L',{al:.3,ou:(x,y,z)=>z<-1.42});zo('dos',[[.56,.68],[.66,.68],[.66,.58],[.56,.58]],'O',{al:.3,ou:(x,y,z)=>z<-1.42});
  zo('dos',O.bande([[0,.72],[.62,.72]],.0035),'j',{al:.3,ou:(x,y,z)=>z<-1.42});
  // le nez (les photos) : la calandre noire à lames chromées entre les phares, les clignotants sous les phares
  const nez=(x,y,z)=>z>1.55;
  zo('face',[[0,.52],[.31,.52],[.31,.615],[0,.615]],'K',{al:.4,ou:nez});
  for(const y9 of [.545,.567,.589])zo('face',O.bande([[0,y9],[.30,y9]],.0045),'c',{al:.4,ou:nez});
  zo('face',[[.38,.445],[.52,.445],[.52,.475],[.38,.475]],'O',{al:.4,ou:nez});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.robin&&SHAPES.robin.length===1)?(SHAPES.robin._tole||(SHAPES.robin._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  const dansS=(s,x,y)=>{let c=false;const n=s.length;for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        // (la tôle la plus en avant / en arrière qui contient le point : par dichotomie entre une tranche pleine et le bout)
        zBout=(x,y,s)=>{let a=s*1.15,b=s>0?1.7255:-1.6455;if(!dansS(sect(a),x,y)){for(let z=b;s*z>s*a;z-=s*.005)if(dansS(sect(z),x,y))return z;return s*1.6;} /* (19/10) au milieu, le tunnel de la roue avant laisse un vide à z 1,15 : on cherche alors depuis le bout (le pare-chocs était coupé en deux) */for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;},
        zAvant=(x,y)=>zBout(x,y,1),zArriere=(x,y)=>zBout(x,y,-1);
  // LES PHARES RONDS cerclés de chrome, aux coins du nez
  P.sym(sd=>{const z9=zAvant(.47,.57),c=[sd*.47,.57,z9-.006],d=[sd*.18,.04,1];
    O.tour(P,'c',[[.095,-.03],[.097,0],[.09,.014],[.077,.019],[.071,.014]],22,c,d);O.tour(P,'W',[[.071,.014],[.06,.024],[.035,.03],[0,.032]],22,c,d);});
  // LES PARE-CHOCS : une lame chromée fine devant et derrière (la Mk1), qui tourne un peu sur les coins
  const LAME=[[-.01,-.03],[.012,-.03],[.022,-.018],[.024,0],[.022,.018],[.012,.03],[-.01,.03]];
  {const av=[],ar=[];for(let i=0;i<=12;i++){const x=-.60+1.2*i/12,zf=zAvant(Math.min(.58,Math.abs(x)),.41),zr=zArriere(Math.min(.60,Math.abs(x)),.41);av.push([x,.41,zf+.012]);ar.unshift([x,.41,zr-.012]);}
   O.tube(P,'c',av,LAME,true);O.tube(P,'c',ar,LAME,true);}
  // les RÉTROS (petits, noirs, sur les portes), les POIGNÉES chromées, les ESSUIE-GLACES
  P.sym(sd=>{bulleOutils.tube(P,'k',[[sd*.712,.855,.50],[sd*.745,.905,.495]],[[.011,0],[0,.011],[-.011,0],[0,-.011]],true);P.lathe('k',[[0,.015],[.04,.015],[.046,.005],[.046,-.007],[.04,-.013],[0,-.013]],12,sd*.755,.945,.49,'z');P.cyl('g',.035,.004,12,sd*.755,.945,.476,'z');P.box('c',.016,.022,.13,sd*.718,.82,-.27);   // (19/10) le rétro : une tête ronde sur son bras (deux boîtes avant)
    P.box('k',.30,.012,.014,sd*.20,.985,.60,-.6,0,sd*.12);});
  // les passages de roue arrière : une joue sombre ; le tunnel de la roue avant : deux joues
  const joue=(w,r,y0)=>{const o=[[w-r,y0]];for(let k=0;k<=12;k++){const a=Math.PI*k/12;o.push([w-Math.cos(a)*r,y0+.02+Math.sin(a)*(r+.04)]);}o.push([w+r,y0]);return o;};
  P.sym(sd=>{P.prism('d',joue(ZR,.32,.20),.02,sd*.50);P.prism('d',joue(ZF,.32,.22),.02,sd*.12);});
  P.box('l',.33,.08,.012,0,.56,-1.642,0,0,0);   // la plaque dessinée (la vraie s'y pose)
  K.commit(P);
  // ---- LES ROUES : jantes tôle de 10 pouces argent, petit enjoliveur chromé ; la roue AVANT, seule au milieu, a sa jante des deux côtés ----
  const JW=.14,hw=JW/2,fx=hw-.018,J=lpKit({k:{g:'m',c:0x18191b},a:{g:'s',c:0xb9bec6},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
  J.lathe('k',[[.135,-hw],[R*.84,-hw],[R*.96,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.96,hw*.72],[R*.84,hw],[.135,hw]],22,0,0,0,'x');
  J.lathe('d',[[.135,-hw+.015],[.135,-(fx-.03)],[0,-(fx-.03)]],18,0,0,0,'x');
  for(const e of [1,-1]){J.lathe('a',[[.135,e*(hw-.004)],[.128,e*(fx+.004)],[.075,e*fx]],20,0,0,0,'x');J.lathe('c',[[.075,e*fx],[.065,e*(fx+.014)],[.035,e*(fx+.02)],[0,e*(fx+.022)]],16,0,0,0,'x');}
  const JG=J.done();
  return {hl:[.47,.57,1.72],tl:[.55,.63,-1.64],wx:.62,wzF:ZF,wzR:-ZR,w1F:1,
          roueDeco:(w,sx,sz)=>{if(sz>0&&sx<0)return;for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
ECH_POTS.robin={p:[{t:'rond',r:.022,ev:1.25,k:'c',pts:[[.36,.24,-1.635]]}]}; // (2026-10-18, LE ROUGE-GORGE) une sortie, à droite sous la lame arrière
Object.assign(I18N,{"LE ROUGE-GORGE":"THE REDBREAST",
 "Trois roues, de la fibre de verre et une confiance aveugle. Dans les virages, elle penche ; toi, tu pries.":"Three wheels, fibreglass and blind faith. In the corners she leans; you pray."});
