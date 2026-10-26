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
  /* LE ROUGE-GORGE (2026-10-26, refait à la main en POLY, façon ROSSO 40) — la Reliant Robin Mk1 (1973-81), fibre de verre, TROIS ROUES.
     L'idée : un COIN. Vu de dessus, le nez est étroit et la caisse s'évase jusqu'aux hanches arrière ; vu de profil, une cabine haute et
     carrée posée sur un capot court, une lunette-hayon qui tombe raide sur une queue haute. Une seule petite roue devant, au milieu, qui
     sort d'une BOUCHE en arche sous le nez, entre les deux moitiés de la lame chromée : l'âme de la caisse — fragile, attachante. Et la
     GORGE ROUGE de l'oiseau (Robin = rouge-gorge) : (2026-10-26, Léo : « au bout du museau un orange-rouge brillant, presque pétillant,
     qui vienne du bout du museau en dégradé plutôt qu'un rectangle ; le rouge devant sera permanent ») LE MUSEAU EN FLAMME — la face est
     orange-rouge vif, et la couleur remonte le capot en CHEVRON (plus loin sur l'arête du capot que sur les flancs) par bandes successives :
     orange-rouge → orange → terre cuite → mauve → ardoise → le bleu (la gorge du rouge-gorge passe à son gris-bleu). Une rangée sur deux
     prend une teinte à 40 % vers la bande suivante : le dégradé se fait plus fin, et le métallisé ('k') fait scintiller les facettes. Hors
     de la laque : aucune peinture de la boutique ne la recouvre. Les teintes sont un cran sous le vif : le dessus du capot, en pleine
     lampe, ne doit pas passer au pêche pâle.
     LE LOFT : 11 points par demi-section, des stations seulement là où la forme tourne. Chaque bande garde la MÊME PENTE d'une station à
     l'autre (le retrait d'une bande est proportionnel à sa hauteur) : ses quatre coins restent dans un plan, la facette s'allume d'un bloc,
     jamais de pli en diagonale. Tout le reste est POSÉ : phares ronds, lames chromées, feux, poignées, rétros.
     Repère : x à gauche, y en haut, z vers l'avant. */
  const U=LPU,L=(t,z)=>U.lin(t,z);
  const F_DEG=[0xec3410,0xee5214,0xbc4a52,0x7e5292,0x4a5eb4,0x1d74cc],   // orange-rouge, orange, terre cuite, mauve, ardoise… et le bleu de la caisse
        mixC=(a,b,t)=>{const c=(s)=>Math.round(((a>>s)&255)+(((b>>s)&255)-((a>>s)&255))*t);return (c(16)<<16)|(c(8)<<8)|c(0);};
  const R=.26,ZF=1.22,ZR=-.92,ZN=1.685,ZQ=-1.685;
  const PAL={p:{g:'p',c:0x1d74cc},
    // le museau en flamme : cinq bandes (a), et leurs rangées intermédiaires (b, à 40 % vers la bande suivante), en métallisé — voir F_DEG
k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x172231},
    c:{g:'c',c:0xe4e8ed},a:{g:'s',c:0xb4b9c1},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a},w:{g:'l',c:0xd9dce0}};
  for(let n=0;n<5;n++){PAL['F'+n+'a']={g:'k',c:F_DEG[n]};PAL['F'+n+'b']={g:'k',c:mixC(F_DEG[n],F_DEG[n+1],.4)};}
  // ---- LES LIGNES (mètres) : la ceinture (bas des vitres, épaule du capot), le dessus (axe), le plancher, la demi-largeur à la taille ----
  const yB=z=>L([[ZQ,.86],[-1.66,.905],[-1.62,.885],[-1.40,.875],[.70,.875],[.76,.846],[1.60,.70],[ZN,.64]],z),
        yT=z=>z>=.70?yB(z)+.012:L([[ZQ,.90],[-1.66,.94],[-1.62,.955],[-1.20,1.415],[-1.12,1.44],[.28,1.44],[.36,1.415],[.70,.887]],z),
        yb=z=>L([[ZQ,.34],[-1.60,.27],[-1.40,.24],[.70,.24],[1.0,.33],[1.30,.37],[ZN,.38]],z),
        xW=z=>L([[ZQ,.635],[-1.62,.695],[-1.30,.725],[-1.10,.732],[-.70,.732],[-.45,.712],[.20,.692],[.70,.657],[1.20,.575],[1.50,.50],[1.60,.465],[ZN,.42]],z),
        yW=.62,yP=.46;   // la ligne de caractère (la taille), la ligne des lames chromées
  // la roue AVANT, seule au milieu : un TUNNEL sous le nez, qui débouche en arche dans la face avant (la bouche)
  const XT=.135,tun=z=>{const d=z-ZF;if(d<-.40)return 0;return d<0?L([[-.40,0],[-.34,.56],[-.20,.60]],d):L([[0,.60],[.18,.58],[.28,.53],[.445,.49]],d);};
  // les roues ARRIÈRE dans des passages découpés dans les flancs (une arche à pans)
  const AR=[[0,.585],[.11,.578],[.19,.545],[.25,.48],[.30,.39],[.335,.28],[.35,.24]];
  const S=z=>{
    const b0=yb(z),b=U.arch(z,[ZR],AR,b0),bt=Math.max(b,tun(z)),xw=xW(z),top=yT(z),bel=yB(z),
          tk=L([[.90,.09],[1.45,.14],[ZN,.18]],z)*(1-Math.min(1,(b-b0)/.06)),   // le ventre qui rentre sous le nez (le jabot) — effacé au passage de roue : l'arche coupe net
          y6=Math.max(b+.03,yW),x6=xw+.025,x7=x6-.225*(bel-y6),           // l'épaule : toujours la même pente
          yR=Math.max(bel,top-.024),x8=x7-.30*(yR-bel),x9=x8-.09,         // la vitre (même pente partout), le chanfrein du pavillon
          cr=z>.70?Math.max(0,.042*x9-.004):0;                            // l'arête du capot (proportionnelle : chaque moitié reste un plan)
    const y9=Math.max(yR,top-.004),yc=top+cr;                            // (un point au milieu du demi-capot, ALIGNÉ : le pan reste plan, le chevron s'y dessine)
    return [[0,bt],[XT,bt],[XT+.03,b],[xw-tk,b],[xw-.035-tk*.25,Math.max(b+.01,.33)],[xw-.006,Math.max(b+.02,yP)],[x6,y6],
            [x7,bel],[x8,yR],[x9,y9],[x9/2,(y9+yc)/2],[0,yc]];};
  const zs=[ZQ,-1.66,-1.62,-1.40,-1.30,-1.20,-1.12,-.30,-.22,.28,.36,.70,.76,.94,1.0,1.08,1.15,1.25,1.35,1.45,1.55,1.60,ZN];   // (le museau : une station tous les 5-10 cm, les marches du dégradé)
  for(const p of AR)if(p[0]>0)zs.push(ZR-p[0],ZR+p[0]);
  for(const d of [-.40,-.34,-.20,.18,.28])zs.push(ZF+d);
  zs.sort((a,b)=>a-b);for(let i=zs.length-1;i>0;i--)if(zs[i]-zs[i-1]<.005)zs.splice(i,1);
  const pied=z=>z>-.30&&z<-.22,vitre=z=>z>-1.30&&z<.70&&!pied(z),pare=z=>z>.36&&z<.70,hayon=z=>z>-1.62&&z<-1.20;
  // LA FLAMME : la « profondeur » d'une facette = sa distance au bout du nez + un décalage par bande (0 sur l'arête du capot, plus vers le bas
  // du flanc) — le front de chaque couleur dessine un CHEVRON qui file sur l'arête ; a/b en damier (le scintillement)
  const F_SEUIL=[.20,.40,.54,.66,.76],F_DEC=[0,0,0,.20,.19,.18,.16,.13,.11,.07,0],
        flamme=(j,z)=>{const d=ZN-z+F_DEC[j];for(let n=0;n<5;n++)if(d<F_SEUIL[n]){let i=0;while(i<zs.length&&zs[i]<z)i++;return 'F'+n+(i&1?'a':'b');}return null;};
  const P=K.kit(PAL);P.ech=true;   // (`ech` : le relevé des pots ne touche à rien de la caisse — son pot est dessiné à part, voir ECH_POTS.robin)
  P.loft(zs,S,(j,z)=>{
    if(j===-1)return 'F0a';                                   // LA GORGE : la face avant, orange-rouge vif
    if(j<0)return 'p';
    if(j<=2)return 'k';                                       // tunnel, plancher
    if(j===7&&vitre(z))return 'g';                            // vitres latérales (le montant du milieu, la custode : de la tôle)
    if(j>=9&&(pare(z)||hayon(z)))return 'g';                  // pare-brise, lunette-hayon
    if(z>.70){const f=flamme(j,z);if(f)return f;}             // le museau en flamme
    return 'p';});
  K.commit(P);
  // ---- LES DÉTAILS POSÉS ----
  const D=K.kit(PAL);D.ech=true;
  // les phares RONDS aux coins du nez (cerclage chromé, glace), les clignotants qui prennent le coin, la calandre noire et ses lames
  D.sym(sd=>{D.cyl('c',.088,.03,12,sd*.28,.552,ZN+.008,'z');D.cyl('W',.07,.03,12,sd*.28,.552,ZN+.016,'z');
    D.box('O',.012,.065,.075,sd*.452,.552,1.643,0,-sd*.487,0);});
  D.box('k',.30,.11,.012,0,.557,ZN+.004);for(const y of [.53,.557,.584])D.box('c',.27,.01,.012,0,y,ZN+.011);D.box('c',.045,.045,.016,0,.557,ZN+.016,0,0,Math.PI/4);   // + le losange de l'insigne
  // LA LAME AVANT en deux moitiés : la roue sort entre elles · la lame arrière d'un seul tenant ; chacune tourne sur les coins
  D.sym(sd=>{D.box('c',.25,.045,.05,sd*.285,.425,ZN+.02);D.box('c',.10,.045,.05,sd*.43,.425,ZN-.015,0,sd*.85,0);});
  D.box('c',1.12,.055,.05,0,.43,ZQ-.02);D.sym(sd=>D.box('c',.12,.045,.05,sd*.62,.43,ZQ+.025,0,-sd*.75,0));
  D.box('k',1.0,.08,.03,0,.36,ZQ+.01);                                                 // la jupe noire sous la lame
  // les feux arrière : hauts et étroits, aux coins de la poupe, dans un cadre chromé · la plaque · la serrure du hayon
  D.sym(sd=>{const x=sd*.49;
    for(const y of [.545,.845])D.box('c',.16,.018,.03,x,y,ZQ-.01);for(const dx of [-.071,.071])D.box('c',.018,.318,.03,x+dx,.695,ZQ-.01);   // le cerclage chromé
    D.box('K',.13,.29,.02,x,.695,ZQ-.004);                                                                // la cuvette noire
    D.box('L',.12,.175,.012,x,.75,ZQ-.012);D.box('O',.12,.075,.012,x,.605,ZQ-.012);D.box('w',.12,.02,.012,x,.555,ZQ-.012);   // rouge, orange, recul
    D.box('k',.05,.07,.06,sd*.585,.43,ZQ-.005);});                                                      // les butoirs caoutchouc de la lame
  D.box('p',.70,.20,.016,0,.655,ZQ-.005);D.box('c',.70,.014,.016,0,.762,ZQ-.008);D.box('k',.38,.13,.012,0,.645,ZQ-.012);D.box('w',.34,.10,.012,0,.645,ZQ-.018);   // le tableau de poupe en RELIEF (la tôle, un décroché), son jonc chromé, la plaqueD.box('c',.10,.03,.03,0,.905,-1.665);D.box('k',.34,.012,.02,.10,1.025,-1.562,-.83,0,0);D.box('k',.03,.03,.03,-.07,1.02,-1.57,-.83,0,0);
  // les RÉTROS ronds chromés sur leur tige, la POIGNÉE de porte, les ESSUIE-GLACES
  D.sym(sd=>{D.box('k',.09,.016,.02,sd*.675,.895,.60,0,sd*.30,sd*.45);D.cyl('c',.046,.03,10,sd*.725,.925,.585,'z');D.cyl('g',.036,.012,10,sd*.725,.925,.569,'z');
    D.box('c',.014,.026,.13,sd*.708,.80,-.10,0,0,sd*.225);
    D.box('O',.01,.03,.06,sd*.566,.55,1.30,0,-sd*.245,0);   // le répétiteur de l'aile
    D.box('k',.34,.012,.02,sd*.17,.955,.64,.82,sd*.10,0);});
  // les JONCS chromés de la ceinture et de la gouttière du pavillon : ils suivent la tôle station par station (le loft est droit entre deux)
  {const jonc=(i,z0,z1,dx,dy)=>{const ch=[z0].concat(zs.filter(z=>z>z0+.004&&z<z1-.004),[z1]).map(z=>{const p=S(z)[i];return [p[0]+dx,p[1]+dy,z];});
     const sec=[[.009,0],[0,.008],[-.009,0],[0,-.008]];D.sym(sd=>bulleOutils.tube(D,'c',ch.map(p=>[sd*p[0],p[1],p[2]]),sec,true));};
   jonc(7,-1.30,.70,.003,.004);jonc(8,-1.04,.20,.002,.002);}
  // les passages de roue arrière : une joue sombre derrière la roue (on ne voit plus à travers la caisse)
  D.sym(sd=>D.prism('k',AR.map(p=>[ZR+p[0],p[1]]).reverse().concat(AR.slice(1).map(p=>[ZR-p[0],p[1]])),.02,sd*.47));
  K.commit(D);
  // ---- LES ROUES : jantes tôle de 10 pouces argent, petit enjoliveur chromé ; la roue AVANT, seule au milieu, a sa jante des deux côtés ----
  const JW=.20,hw=JW/2,fx=hw-.018,jante=deux=>{const J=lpKit({k:{g:'m',c:0x18191b},a:{g:'s',c:0xb9bec6},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
    J.lathe('k',[[.14,-hw],[R*.84,-hw],[R*.96,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.96,hw*.72],[R*.84,hw],[.14,hw]],14,0,0,0,'x');
    J.lathe('d',[[.14,-hw+.015],[.14,-(fx-.03)],[0,-(fx-.03)]],10,0,0,0,'x');
    for(const e of deux?[1,-1]:[1]){for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;J.cyl('d',.017,.012,4,e*(fx+.002),Math.cos(a)*.104,Math.sin(a)*.104,'x');}   // les quatre trous de la jante tôle
      J.lathe('a',[[.14,e*(hw-.004)],[.13,e*(fx+.004)],[.07,e*fx]],12,0,0,0,'x');J.lathe('c',[[.07,e*fx],[.05,e*(fx+.016)],[0,e*(fx+.022)]],10,0,0,0,'x');}
    return J.done();};
  const JG=jante(false),JG2=jante(true);   // les roues arrière ne montrent qu'une face ; la roue avant, seule au milieu, se voit des deux côtés
  // LE POT : une sortie chromée, sous la lame arrière, côté gauche (déclaré ici : le banc des voitures ne lit que le gabarit)
  ECH_POTS.robin={enc:0,p:[{t:'rond',r:.026,ev:1.3,k:'c',len:.34,pts:[[.36,.275,-1.74]]}]};
  return {hl:[.28,.552,ZN+.02],tl:[.49,.75,ZQ-.02],wx:.64,wzF:ZF,wzR:-ZR,w1F:1,
          roueDeco:(w,sx,sz)=>{if(sz>0&&sx<0)return;const G9=sz>0?JG2:JG;for(const g in G9){const m=new THREE.Mesh(G9[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
Object.assign(I18N,{"LE ROUGE-GORGE":"THE REDBREAST",
 "Trois roues, de la fibre de verre et une confiance aveugle. Dans les virages, elle penche ; toi, tu pries.":"Three wheels, fibreglass and blind faith. In the corners she leans; you pray."});
