/* L'ATELIER. `pal` : clé → {g: matière, c: couleur, f: 0 pour couper le fondu vertical}.
   Toutes les pièces sont versées dans des tampons par matière, à facettes (non indexé) ; `done()`
   rend {matière: BufferGeometry} avec des normales PAR FACE. */
function lpKit(pal){
  const B={},col=new THREE.Color(),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),
        V1=new THREE.Vector3(),V2=new THREE.Vector3();
  // LE FONDU VERTICAL de la laque : le bas de caisse un ton plus sombre que les pans hauts. C'est
  // l'éclairage de studio des jeux de voitures — il pose la caisse au sol sans une ombre de plus.
  const fondu=y=>.80+.20*LPU.cl((y-.25)/1.0,0,1);
  const tri=(k,a,b,c)=>{
    const e=pal[k];if(!e)return;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    if(nx*nx+ny*ny+nz*nz<1e-12)return;                     // facette dégénérée (section qui se referme)
    const t=B[e.g]||(B[e.g]={P:[],C:[]});col.setHex(e.c);
    for(const p of [a,b,c]){t.P.push(p[0],p[1],p[2]);if(e.grad)lpGrad(e.grad,p[1],col); // PEINTURE en dégradé : une couleur par sommet
      const s=((e.g==='p'||e.g.charAt(0)==='p')&&e.f!==0)?fondu(p[1]):1;t.C.push(col.r*s,col.g*s,col.b*s);} // ('pm:…' : la tôle à motif garde son fondu)
  };
  const put=(k,g,x,y,z,rx,ry,rz,sx,sy,sz)=>{               // verse une géométrie THREE, posée et tournée
    if(g.type==='CylinderGeometry'&&Math.abs(Math.abs(rx||0)-Math.PI/2)<.05&&!ry&&!rz&&K.prims){ // (pots) un cylindre COUCHÉ dans l'axe par rotation
      const q=g.parameters,h=q.height*(sy||1);K.prims.push({t:'cyl',g:pal[k]?pal[k].g:null,c:pal[k]?pal[k].c:null,r:Math.max(q.radiusTop,q.radiusBottom)*Math.max(sx||1,sz||1),z0:(z||0)-h/2,z1:(z||0)+h/2,x:x||0,y:y||0,z:z||0,ax:'z'});}
    E.set(rx||0,ry||0,rz||0);Q.setFromEuler(E);V1.set(x||0,y||0,z||0);V2.set(sx||1,sy||1,sz||1);
    M.compose(V1,Q,V2);
    const gg=g.index?g.toNonIndexed():g;gg.applyMatrix4(M);
    const p=gg.attributes.position.array,flip=(V2.x*V2.y*V2.z)<0;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      if(flip)tri(k,a,c,b);else tri(k,a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();
  };
  const prims=[],gOf=k=>pal[k]?pal[k].g:null,cOf=k=>pal[k]?pal[k].c:null; // (2026-09-26) le RELEVÉ des pièces simples : buildCar y retrouve les POTS d'échappement
  const K={
    tri:tri,put:put,prims:prims,
    box(k,w,h,d,x,y,z,rx,ry,rz){prims.push({t:'box',g:gOf(k),c:cOf(k),w:w,h:h,d:d,x:x||0,y:y||0,z:z||0,rot:!!(rx||ry||rz)});put(k,new THREE.BoxGeometry(w,h,d),x,y,z,rx,ry,rz);},
    // cylindre (ou cône si r2) à `n` pans, couché selon `ax` ('x','y','z')
    cyl(k,r,len,n,x,y,z,ax,r2){prims.push({t:'cyl',g:gOf(k),c:cOf(k),r:Math.max(r,r2!=null?r2:r),z0:(z||0)-len/2,z1:(z||0)+len/2,x:x||0,y:y||0,z:z||0,ax:ax||'y'});
      const g=new THREE.CylinderGeometry(r2!=null?r2:r,r,len,n||8);
      if(ax==='x')g.rotateZ(-Math.PI/2);else if(ax==='z')g.rotateX(Math.PI/2);put(k,g,x,y,z);},
    // tour : points [rayon, position le long de l'axe], révolution à `n` pans autour de `ax`
    lathe(k,pts,n,x,y,z,ax){let rm=0,a0=1e9,a1=-1e9;for(const p of pts){rm=Math.max(rm,p[0]);a0=Math.min(a0,p[1]);a1=Math.max(a1,p[1]);}
      prims.push({t:'lathe',g:gOf(k),c:cOf(k),r:rm,z0:(z||0)+a0,z1:(z||0)+a1,x:x||0,y:y||0,z:z||0,ax:ax||'y'});
      const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n||12);
      if(ax==='x')g.rotateZ(-Math.PI/2);else if(ax==='z')g.rotateX(Math.PI/2);put(k,g,x,y,z);},
    // prisme : un contour de PROFIL [z,y] extrudé sur `wid` en X, centré sur `x` (ailerons, dérives, lames)
    prism(k,pts,wid,x,rx,ry,rz){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
      const g=new THREE.ExtrudeGeometry(s,{depth:wid,bevelEnabled:false});
      g.rotateY(-Math.PI/2);g.translate(wid/2,0,0);put(k,g,x,0,0,rx,ry,rz);},
    // plaque : un contour de FACE [x,y] extrudé sur `ep` vers +Z, posé en z (calandres, feux, bandeaux)
    plate(k,pts,ep,z){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
      put(k,new THREE.ExtrudeGeometry(s,{depth:ep,bevelEnabled:false}),0,0,z);},
    sym(fn){fn(1);fn(-1);},
    /* LE LOFT. `zs` : stations croissantes (de la poupe au nez). `S(z)` : demi-section, points [x,y]
       du bas-centre au haut-centre, TOUJOURS le même nombre. `paint(j,z,y,x)` : clé de la facette —
       j = n° de bande (0 = plancher … N-2 = toit), −1 bouchon avant, −2 bouchon arrière. */
    loft(zs,S,paint){
      const sec=zs.map(z=>S(z)),N=sec[0].length;
      for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],A=sec[i],C=sec[i+1];
        for(let j=0;j<N-1;j++){const a=A[j],b=A[j+1],c=C[j+1],d=C[j];
          const k=paint(j,(z0+z1)/2,(a[1]+b[1]+c[1]+d[1])/4,(a[0]+b[0]+c[0]+d[0])/4);
          tri(k,[a[0],a[1],z0],[b[0],b[1],z0],[c[0],c[1],z1]);tri(k,[a[0],a[1],z0],[c[0],c[1],z1],[d[0],d[1],z1]);
          tri(k,[-a[0],a[1],z0],[-c[0],c[1],z1],[-b[0],b[1],z0]);tri(k,[-a[0],a[1],z0],[-d[0],d[1],z1],[-c[0],c[1],z1]);}}
      for(const [s9,z,dir] of [[sec[0],zs[0],-1],[sec[sec.length-1],zs[zs.length-1],1]]){
        const ct=[];for(let j=0;j<N;j++)ct.push(new THREE.Vector2(s9[j][0],s9[j][1]));
        for(let j=N-2;j>=1;j--)ct.push(new THREE.Vector2(-s9[j][0],s9[j][1]));
        for(const f of THREE.ShapeUtils.triangulateShape(ct,[])){
          let a=ct[f[0]],b=ct[f[1]],c=ct[f[2]];
          if((((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0)!==(dir>0)){const t=b;b=c;c=t;}
          tri(paint(dir>0?-1:-2,z,(a.y+b.y+c.y)/3,(a.x+b.x+c.x)/3),[a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z]);}
      }
    },
    done(){const out={};
      for(const g in B){const geo=new THREE.BufferGeometry();
        geo.setAttribute('position',new THREE.Float32BufferAttribute(B[g].P,3));
        geo.setAttribute('color',new THREE.Float32BufferAttribute(B[g].C,3));
        geo.computeVertexNormals();out[g]=geo;}           // non indexé → une normale PAR FACE : les facettes
      return out;}
  };
  return K;
}
/* L'OMBRE CUITE (2026-09-26, vague 2 « L'ENCRE ET L'OR ») — les caisses du kit se lisaient comme des BOÎTES uniformes : aucune occlusion,
   le bas de caisse aussi clair que le toit, la caisse flottait sur le bitume. On cuit une fois, à la construction, une occlusion dans la
   couleur des sommets : le bas s'enfonce dans l'ENCRE (#1c0430 — la couleur de toute ombre du jeu), les pans hauts gardent leur laque.
   Ce n'est pas un gris : l'encre est une multiplication TEINTÉE (le vert s'éteint plus vite que le rouge et le bleu) — une orange
   s'assombrit vers le brun-pourpre, un vert vers le canard, jamais vers la boue. Zéro coût en course (des sommets, déjà là), zéro
   programme de plus. Ni les feux (ils émettent), ni les roues (elles tournent : une ombre cuite tournerait avec elles).
   `H` = la hauteur de la caisse ; l'ombre vit dans ses 55 % du bas. */
const LP_OMBRE=[.60,.50,.72]; // l'encre en MULTIPLICATION (r, g, b) au ras du sol — #1c0430 éclairci pour rester une teinte, pas un trou
function lpOmbre(geo,H){
  const p=geo.attributes.position.array,c=geo.attributes.color.array,h=Math.max(.45,H*.55);
  for(let i=0;i<p.length;i+=3){
    const u=Math.min(1,Math.max(0,p[i+1]/h)),t=u*u*(3-2*u);                          // 0 au sol → 1 à 55 % de la hauteur
    c[i]*=LP_OMBRE[0]+(1-LP_OMBRE[0])*t;c[i+1]*=LP_OMBRE[1]+(1-LP_OMBRE[1])*t;c[i+2]*=LP_OMBRE[2]+(1-LP_OMBRE[2])*t;}
  geo.attributes.color.needsUpdate=true;
}
/* LES ROUES, façon Rocket League : un pneu GROS et facetté (16 pans, épaules chanfreinées), une
   jante dessinée sur la face EXTÉRIEURE (+X) — les roues de gauche sont posées en miroir.
   Styles : 'rayons' (n branches), 'multi' (rayons fins et nombreux), 'cadran' (disque percé),
   'enjoliveur' (dôme chromé), 'plis' (flasque plié en étoile). `blanc` = flanc blanc, `crampons` = pavés de tout-terrain. */
var ROUES_VRAIES=true;try{if(/[?&]roues=ancien/.test(location.search))ROUES_VRAIES=false;}catch(e){} // (2026-10-19, Léo : « applique la correction des jantes à toutes les voitures ») EN MARCHE ; `?roues=ancien` = l'ancien dessin // (2026-10-19) la correction GLOBALE des rayons (voir crW), ÉTEINTE : Léo décide
window.dbgRoues=function(on){if(on!=null){ROUES_VRAIES=!!on;try{buildCar(CARS[equippedCar()]);}catch(e){return e.message;}}return ROUES_VRAIES;};
function lpWheel(o){
  if(o.style==='nyan')return {}; // (2026-10-08) le chat pop-tart dessine ses roues lui-même (voir « LES ROUES PIXEL » dans son gabarit) : ici, des moyeux VIDES qui portent l'angle
  // (2026-10-19) la correction GLOBALE (ROUES_VRAIES) sur une fiche qui ne demande rien : des branches couleur `accent` trop sombre se perdraient sur le
  // fond sombre (l'anneau se lisait contre la lèvre, une branche non) → l'accent sombre s'éclaircit vers la jante. Sans la correction : rien ne change.
  let acc=o.accent||0xe6e9ee;
  if(ROUES_VRAIES&&!o.branches&&!o.creux&&o.branches!==0&&o.style!=='multi'&&o.style!=='cadran'&&o.style!=='enjoliveur'&&o.style!=='plis'){
    const lu=h=>(.3*(h>>16&255)+.59*(h>>8&255)+.11*(h&255))/255,j=o.jante||0xe6e9ee;
    if(lu(acc)<.25){const m=(x,y)=>Math.round(x+(y-x)*.55);acc=(m(acc>>16&255,j>>16&255)<<16)|(m(acc>>8&255,j>>8&255)<<8)|m(acc&255,j&255);}}
  const R=o.R,hw=o.w/2,K=lpKit({k:{g:'m',c:o.pneu||0x16171a},w:{g:'s',c:0xf4f1ea},
    c:{g:'c',c:o.jante||0xe6e9ee},d:{g:'m',c:o.fond||0x1b1c21},o:{g:'o',c:0xffc24a},a:{g:'p',c:acc,f:0},b:{g:'p',c:o.bande||0xffffff,f:0}});
  if(!o.sansPneu)K.lathe('k',[[R*.64,-hw],[R*.88,-hw],[R,-hw*.55],[R,hw*.55],[R*.88,hw],[R*.64,hw]],16,0,0,0,'x'); // `sansPneu` : le gabarit pose le sien (`roueDeco`)
  if(o.crampons)for(let i=0;i<14;i++){const a=i/14*Math.PI*2;
    K.box('k',o.w*.84,.05,.11,0,Math.sin(a)*R,Math.cos(a)*R,Math.PI/2-a);}
  if(o.bande&&!o.sansPneu)K.lathe('b',[[R+.004,-hw*.16],[R+.004,hw*.16]],16,0,0,0,'x'); // (2026-10-08, SQUALE) une BANDE claire au milieu de la bande de roulement : vue d'en dessous, la roue se lit
  const fx0=hw-.035,FACES=o.deux?[1,-1]:[1];                 // le plan de la jante, en retrait du pneu
  // la profondeur des VRAIES BRANCHES (0 = l'ancien dessin) : `creux` (BOÎTES : jusqu'à 60 % de la demi-largeur — au-delà de 4 cm le fond recule
  // d'autant) ou `branches` (JAPONAISES : 4 cm) ; ou, pour les styles à rayons qui ne disent rien, la correction GLOBALE `ROUES_VRAIES` (éteinte :
  // `?roues=vraies`, `dbgRoues(1)`) — `branches:0` dans une fiche la refuse pour elle
  const crW=o.creux?Math.min(o.creux,hw*.6):(o.style==='cadran'||o.style==='enjoliveur'||o.style==='plis')?0:(o.branches||(ROUES_VRAIES&&o.branches!==0))?.04:0,
        fdd=Math.max(0,crW-.04);
  // (2026-10-08, SQUALE) `deux` : la roue du MILIEU, qu'on voit des deux côtés — un tambour FERMÉ et une jante sur CHAQUE face (miroir en x)
  if(o.deux)K.lathe('d',[[0,-(fx0-.05)],[R*.64,-(fx0-.05)],[R*.64,fx0-.05],[0,fx0-.05]],16,0,0,0,'x');
  else K.lathe('d',[[R*.64,-hw+.02],[R*.64,fx0-.05-fdd],[0,fx0-.05-fdd]],16,0,0,0,'x'); // fût + fond sombre (il recule derrière une jante creusée de plus de 4 cm)
  for(const e of FACES){const fx=e*fx0;
  if(o.blanc)K.lathe('w',[[R*.70,e*(hw+.004)],[R*.86,e*(hw+.004)]],16,0,0,0,'x');
  if(o.style==='cadran'){
    K.lathe('c',[[R*.64,fx],[0,fx]],16,0,0,0,'x');
    for(let h=0;h<5;h++){const a=h/5*Math.PI*2;K.cyl('d',R*.13,.012,8,fx+e*.004,Math.sin(a)*R*.40,Math.cos(a)*R*.40,'x');}
  }else if(o.style==='enjoliveur'&&o.chapeau){ // (2026-10-19, le HOT ROD) `chapeau:c` : la JANTE TÔLE peinte (`fond`), l'anneau poli au bord et un petit
    // enjoliveur au moyeu (c × le rayon de la jante) — sans l'option, le dôme couvre toute la face (inchangé)
    const c=o.chapeau,rc=R*.64*c;
    K.lathe('d',[[R*.64,fx],[R*.58,fx+e*.004],[rc,fx+e*.012]],16,0,0,0,'x');                        // la tôle peinte, en léger cône
    K.lathe('c',[[R*.64,fx+e*.002],[R*.60,fx+e*.007]],16,0,0,0,'x');                                // l'anneau poli
    K.lathe('c',[[rc,fx+e*.012],[rc*.80,fx+e*.03],[rc*.40,fx+e*.05],[0,fx+e*.054]],16,0,0,0,'x');    // le chapeau chromé
    K.cyl('o',rc*.22,.02,8,fx+e*.058,0,0,'x');
  }else if(o.style==='enjoliveur'){
    K.lathe('c',[[R*.64,fx],[R*.52,fx+e*.025],[R*.24,fx+e*.055],[0,fx+e*.06]],16,0,0,0,'x');
    K.cyl('o',R*.13,.02,8,fx+e*.064,0,0,'x');
  }else if(o.style==='plis'){
    // (2026-10-02, L'ORIGAMI) LE FLASQUE PLIÉ : un disque plein, `n` plis en étoile — une crête, un creux, et chaque pan attrape SA
    // lumière (un pan sur deux en `jante`, l'autre en `accent` : la roue qui tourne se lit). Les pointes débordent sur le flanc du pneu.
    // ⚠ rien ne dépasse fx + 0,022 : le flou de jante (voir ROUES.flou) se pose à fx + 0,024, par-dessus.
    const n=o.n||7,N=n*2,r=R*.64,ct=[fx+e*.012,0,0],pt=(a,rr,x)=>[x,Math.sin(a)*rr,Math.cos(a)*rr];
    for(let s=0;s<N;s++){const a0=s/N*Math.PI*2,a1=(s+1)/N*Math.PI*2;
      K.tri(s%2?'a':'c',ct,pt(a0,r,s%2?fx-e*.006:fx+e*.02),pt(a1,r,s%2?fx+e*.02:fx-e*.006));}
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2,d=Math.PI/N*.62;
      K.tri('a',pt(a-d,R*.655,e*(hw+.004)),pt(a+d,R*.655,e*(hw+.004)),pt(a,R*.85,e*(hw+.004)));}
    K.cyl('d',R*.10,.012,7,fx+e*.016,0,0,'x');                                // le cache-moyeu
  }else{
    const n=o.n||5,multi=o.style==='multi';
    if(crW){ /* (2026-10-19) LES VRAIES BRANCHES — UN SEUL outil pour `creux` (BOÎTES, « des jantes en disques plats » : la jante CREUSÉE) et
       `branches` (JAPONAISES, = un creux de 4 cm) : la lèvre plonge, chaque rayon est une ARÊTE (deux pans qui prennent chacun leur lumière) qui
       descend, LE LONG du rayon, du bord vers le moyeu enfoncé. Mêmes matières : 0 programme de plus. */
      K.lathe('c',[[R*.64,fx],[R*.60,fx-e*crW*.3],[R*.55,fx-e*crW*.45]],16,0,0,0,'x');
      const k=multi?'c':'a',x1=fx-e*crW*.45,x0=fx-e*crW,r0=R*.17,r1=R*.57,w0=R*(multi?.036:.06),w1=R*(multi?.055:.09),hz=.014,
        T=(A,B,C)=>{const nx=(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]);if(nx*e<0)K.tri(k,A,C,B);else K.tri(k,A,B,C);};
      for(let s=0;s<n;s++){const a=s/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),Q=(r,t,x)=>[x,sa*r+ca*t,ca*r-sa*t],
        A=Q(r0,-w0,x0),B=Q(r1,-w1,x1),C=Q(r1,w1,x1),D=Q(r0,w0,x0),M0=Q(r0,0,x0+e*hz),M1=Q(r1,0,x1+e*hz);
        T(A,B,M1);T(A,M1,M0);T(M0,M1,C);T(M0,C,D);}
    }else{
    // ⚠ l'ancien dessin : les planches sont posées EN TRAVERS du rayon (rotation −a : la longueur part en tangente) — les n planches font un ANNEAU à
    // n pans, aucune branche ne part du moyeu (les « disques à cercles »). Gardé tel quel : toute caisse qui ne demande rien ne change pas.
    K.lathe('c',[[R*.64,fx],[R*.55,fx]],16,0,0,0,'x');                     // la lèvre
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2;
      K.box(multi?'c':'a',.03,R*.46,multi?R*.07:R*.13,fx-e*.012,Math.sin(a)*R*.33,Math.cos(a)*R*.33,-a);}}
  }
  if(o.style!=='enjoliveur'&&o.style!=='plis')K.cyl('c',R*.16,.05,8,fx-e*(crW?crW+.012:.01),0,0,'x'); // le moyeu (enfoncé dans la jante creusée)
  if(o.ecrous&&crW)for(let i=0;i<o.ecrous;i++){const a=i/o.ecrous*Math.PI*2+.3;K.cyl('c',R*.028,.024,6,fx-e*(crW-.02),Math.sin(a)*R*.10,Math.cos(a)*R*.10,'x');} // (19/10, BOÎTES) les ÉCROUS sur le moyeu
  if(o.pique&&e>0){K.cyl('c',R*.15,.14,6,fx+.07,0,0,'x',R*.07);K.cyl('w',R*.07,.12,6,fx+.20,0,0,'x',.004);} // (2026-10-16, LE BLINDÉ NOIR) LE PIC DE MOYEU : le char de Ben-Hur — dans l'axe, il ne tourne pas à l'œil
  }
  return K.done();
}
/* LA HONTE, UN CRAN PLUS BELLE (2026-10-15, Léo : « un tout petit plus de détail au niveau de la brillance et de la texture de sa
   carcasse ; si tu y arrives, plus de définition ; des roues refaites, plus réalistes »). Sa silhouette de boîtes ne bouge pas ; ses
   tôles deviennent des BOÎTES USÉES (boiteUsee) : les arêtes CHANFREINÉES (une facette de 3 cm où court le reflet), les grandes faces
   CABOSSÉES par facettes (des creux de quelques millimètres, rien ne dépasse), et une couleur PAR FACETTE, multipliée par la peinture —
   la laque marbrée, la crasse du bas, des plaques de rouille (plus souvent en bas), la poussière sur ce qui regarde le ciel, l'arête usée
   plus claire. Tout reste à facettes (normales par face : la DA poly). */
function boiteUsee(w,h,d,o){o=o||{};
  const H3=[w/2,h/2,d/2],c=Math.min(o.c==null?.03:o.c,w*.22,h*.22,d*.22),cs=o.cell||.34,de=o.dent||0,sd=o.seed||1,yc=o.yc||0,ru=o.rouille||0,P=[],C=[],
    hh=(a,b,e)=>{const x=Math.sin(a*12.9898+b*78.233+e*37.719+sd*4.17)*43758.5453;return x-Math.floor(x);},
    sm=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
  const coul=(yw,ny,arete,i,j,f)=>{let k=.95+.08*hh(j,i,f+7);              // la marbrure : la laque n'a plus le même ton partout
    k*=.80+.20*sm((yw-.25)/.6);                                              // la crasse : le bas plus sombre
    if(arete)return [k*1.13,k*1.09,k*1.03];                                  // l'arête usée : la laque est partie, le reflet y court
    if(hh(i,j,f)<ru*(1.4-sm((yw-.3)/.7)))return [k*.68,k*.50,k*.38];         // la rouille, plus fréquente en bas
    if(ny>.7)return [k*1.05,k*1.03,k*.98];                                   // la poussière, sur ce qui regarde le ciel
    return [k,k,k];};
  const tri=(a,b,e,k,dir)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=e[0]-a[0],vy=e[1]-a[1],vz=e[2]-a[2]; // tourné vers `dir` (le dehors)
    if((uy*vz-uz*vy)*dir[0]+(uz*vx-ux*vz)*dir[1]+(ux*vy-uy*vx)*dir[2]<0){const t=b;b=e;e=t;}
    P.push(a[0],a[1],a[2],b[0],b[1],b[2],e[0],e[1],e[2]);for(let n=0;n<3;n++)C.push(k[0],k[1],k[2]);};
  const pt=(ax,va,u,uv,v,vv)=>{const p=[0,0,0];p[ax]=va;p[u]=uv;p[v]=vv;return p;};
  /* (2026-10-20, LE RELIEF — l'étude de la gamme au garage : LA HONTE n° 5 des plus plates, une épave en aplats dont les coups étaient
     PEINTS) `cellC` : des cases plus fines sur les deux FLANCS seulement (la grande caisse n'avait qu'une rangée sur sa hauteur : rien à
     creuser) ; `creux` : de VRAIS COUPS, [{s: côté ±1, y, z: le centre (repère de la boîte), ry, rz: les rayons, p: la profondeur}] — les
     sommets intérieurs du flanc reculent, les facettes autour penchent et prennent la lumière chacune à leur tour. */
  const CR=o.creux||[],coup=(s,y,z)=>{let d=0;for(const q of CR){if(q.s!==s)continue;const r=Math.hypot((y-q.y)/q.ry,(z-q.z)/q.rz);if(r<1)d=Math.max(d,q.p*sm(1-r));}return d;};
  // les six faces, rentrées de c, quadrillées en cases d'environ `cell`, les sommets intérieurs creusés (jamais le bord : il touche le chanfrein)
  for(let ax=0;ax<3;ax++)for(const s of [-1,1]){const u=(ax+1)%3,v=(ax+2)%3,eu=H3[u]-c,ev=H3[v]-c,dir=[0,0,0];dir[ax]=s;const cf=ax===0&&o.cellC?o.cellC:cs;
    const dessous=ax===1&&s<0,nu=dessous?1:Math.max(1,Math.round(2*eu/cf)),nv=dessous?1:Math.max(1,Math.round(2*ev/cf)),f=ax*2+(s>0?1:0);
    const V=(i,j)=>{const bord=i===0||j===0||i===nu||j===nv,uu=-eu+2*eu*i/nu,vv=-ev+2*ev*j/nv;
      return pt(ax,s*(H3[ax]-(bord?0:de*hh(i*7+f,j*3,f+1)+(ax===0?coup(s,uu,vv):0))),u,uu,v,vv);};
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=V(i,j),b=V(i+1,j),e=V(i+1,j+1),g=V(i,j+1),k=dessous?[.55,.5,.47]:coul(yc+(a[1]+e[1])/2,ax===1?s:0,false,i,j,f);
      tri(a,b,e,k,dir);tri(a,e,g,k,dir);}}
  // les douze chanfreins et les huit coins
  for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){const t=3-a-b;for(const sa of [-1,1])for(const sb of [-1,1]){
    const q=(ta,tb,tt)=>{const p=[0,0,0];p[a]=ta;p[b]=tb;p[t]=tt;return p;},dir=[0,0,0];dir[a]=sa;dir[b]=sb;
    const A0=q(sa*H3[a],sb*(H3[b]-c),-H3[t]+c),A1=q(sa*H3[a],sb*(H3[b]-c),H3[t]-c),B0=q(sa*(H3[a]-c),sb*H3[b],-H3[t]+c),B1=q(sa*(H3[a]-c),sb*H3[b],H3[t]-c),
      k=coul(yc+(A0[1]+B1[1])/2,(dir[1]||0)*.7,true,a*5+b,sa+sb*3,9);
    tri(A0,A1,B1,k,dir);tri(A0,B1,B0,k,dir);}}
  for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){const dir=[sx,sy,sz],k=coul(yc+sy*H3[1],sy*.6,true,sx,sz,11);
    tri([sx*H3[0],sy*(H3[1]-c),sz*(H3[2]-c)],[sx*(H3[0]-c),sy*H3[1],sz*(H3[2]-c)],[sx*(H3[0]-c),sy*(H3[1]-c),sz*H3[2]],k,dir);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.computeVertexNormals();return g;} // non indexée : une normale par facette
/* SES ROUES (même demande) : au kit, en facettes, comme celles de la gamme — mais une épave : un pneu au FLANC bombé, l'épaule, la bande et
   ses deux SILLONS, des SCULPTURES en quinconce, un cordon sur le flanc ; une JANTE EN TÔLE emboutie (la lèvre, le voile percé de six trous,
   la cuvette), cinq ÉCROUS. `rouille` : la roue arrière gauche, voilée, en rouille (son caractère d'origine). */
function roueEpave(R,w,rouille){const hw=w/2,fx=hw-.03,
  K=lpKit({k:{g:'m',c:0x18191c},f:{g:'m',c:0x303136},j:{g:'s',c:rouille?0x6a3f22:0x24211e},t:{g:'m',c:0x08080a},e:{g:'s',c:rouille?0x5a3a20:0x6b655c}});
  K.lathe('k',[[R*.66,-hw],[R*.88,-hw],[R*.97,-hw*.78],[R,-hw*.5],[R,-hw*.2],[R*.97,-hw*.14],[R*.97,hw*.14],[R,hw*.2],[R,hw*.5],[R*.97,hw*.78],[R*.88,hw],[R*.66,hw]],16,0,0,0,'x');
  for(let i=0;i<16;i++){const a=(i+.5)/16*Math.PI*2;K.box('k',hw*.34,.02,.07,(i%2?1:-1)*hw*.36,Math.sin(a)*(R+.005),Math.cos(a)*(R+.005),Math.PI/2-a);} // les sculptures
  K.lathe('f',[[R*.79,hw+.003],[R*.84,hw+.003]],16,0,0,0,'x');                                   // le cordon du flanc
  K.lathe('j',[[R*.66,fx-.04],[R*.64,fx],[R*.56,fx+.006],[R*.50,fx-.01],[R*.27,fx-.01],[R*.20,fx+.012],[0,fx+.012]],14,0,0,0,'x'); // la jante emboutie
  K.lathe('t',[[R*.64,-hw+.02],[R*.64,fx-.05],[0,fx-.05]],14,0,0,0,'x');                        // le fond : on ne voit pas au travers
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;K.box('t',.01,R*.09,R*.13,fx-.009,Math.sin(a)*R*.385,Math.cos(a)*R*.385,-a);} // les trous du voile
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;K.cyl('e',.017,.03,6,fx+.022,Math.sin(a)*R*.15,Math.cos(a)*R*.15,'x');} // les écrous
  return K.done();}
