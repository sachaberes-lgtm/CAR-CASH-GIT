/* ===== LES DÉCORS DES DUNES, REFAITS (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt pour voir le niveau que j'attends ») =====
   LA BOÎTE À OUTILS (`dnKit`) : un constructeur à PILE DE TRANSFORMATIONS (déplacer, tourner, mettre à l'échelle, puis poser des boîtes, des troncs de pyramide, des cylindres et surfaces
   de révolution LISSES, des sphères aplaties, des tubes), des normales explicites (plates sur la pierre, lisses sur les fûts), une teinte par face (un peu bruitée : jamais deux faces
   pareilles) et une MATIÈRE par sommet (aK : 0 peint · 1 assises de pierre · 2 roche · 3 or · 4 pierre gravée de glyphes). Les modèles sont cachés dans DN.kit (une fois par session, comme DN.geos).
   Tout est dessiné par la matière des décors (DN_AFS) : la pierre y est en ASSISES (rangées, joints décalés, taille qui suit la distance), les glyphes ne se lisent que de près.
   Console : `dbgDunes('galerie')` pose tous les modèles en rang devant la caméra (banc). */
function dnKit(sd0){
  const P=[],C=[],Nm=[],K=[],cur=new THREE.Matrix4(),stk=[],v=new THREE.Vector3(),n9=new THREE.Vector3(),m=new THREE.Matrix4(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),e3=new THREE.Vector3();
  let sd=(sd0||12345)|0,kvf=null;const rnd=()=>(sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff)/0x7fffffff;
  const pt=(p,n,c,k,f)=>{v.set(p[0],p[1],p[2]).applyMatrix4(cur);P.push(v.x,v.y,v.z);n9.set(n[0],n[1],n[2]).transformDirection(cur);Nm.push(n9.x,n9.y,n9.z);C.push(c[0]*f,c[1]*f,c[2]*f);K.push(kvf?kvf(p):k);};
  // un triangle : la normale plate est tournée vers l'EXTÉRIEUR du solide (o = un point dedans) ; nn = trois normales lisses (sinon plate)
  const tri=(a,b,c,col,k,f,o,nn)=>{e1.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);e2.set(c[0]-a[0],c[1]-a[1],c[2]-a[2]);e3.crossVectors(e1,e2);const l=e3.length();if(l<1e-9)return;e3.multiplyScalar(1/l);
    let sg=1;if(nn){const sx=nn[0][0]+nn[1][0]+nn[2][0],sy=nn[0][1]+nn[1][1]+nn[2][1],sz=nn[0][2]+nn[1][2]+nn[2][2];if(e3.x*sx+e3.y*sy+e3.z*sz<0)sg=-1;}
    else if(o){const cx=(a[0]+b[0]+c[0])/3-o[0],cy=(a[1]+b[1]+c[1])/3-o[1],cz=(a[2]+b[2]+c[2])/3-o[2];if(e3.x*cx+e3.y*cy+e3.z*cz<0)sg=-1;}
    const n=nn?null:[e3.x*sg,e3.y*sg,e3.z*sg];
    if(sg>0){pt(a,nn?nn[0]:n,col,k,f);pt(b,nn?nn[1]:n,col,k,f);pt(c,nn?nn[2]:n,col,k,f);}else{pt(a,nn?nn[0]:n,col,k,f);pt(c,nn?nn[2]:n,col,k,f);pt(b,nn?nn[1]:n,col,k,f);}};
  const jf=j=>1-(j==null?.05:j)+2*(j==null?.05:j)*rnd();
  const quad=(a,b,c,d,col,k,o,j)=>{const f=jf(j);tri(a,b,c,col,k||0,f,o);tri(a,c,d,col,k||0,f,o);};
  const K9={
    push:()=>{stk.push(cur.clone());},pop:()=>{cur.copy(stk.pop());},
    T:(x,y,z)=>{cur.multiply(m.makeTranslation(x,y,z));},Ry:a=>{cur.multiply(m.makeRotationY(a));},Rx:a=>{cur.multiply(m.makeRotationX(a));},Rz:a=>{cur.multiply(m.makeRotationZ(a));},Sc:s=>{cur.multiply(m.makeScale(s,s,s));},
    reset:()=>{cur.identity();stk.length=0;},setK:f=>{kvf=f;}, // setK(p => k) : la matière CALCULÉE par sommet (null : la matière donnée) — 20 + u : l'oriflamme qui ondule, u = la distance au mât (0 → 1), voir DN_MVS
    tri:tri,quad:quad,
    // une boîte posée : centre (cx, cz), de y0 à y0+sy ; fond facultatif
    box:(cx,y0,cz,sx,sy,sz,col,k,bas,j)=>{const x0=cx-sx/2,x1=cx+sx/2,y1=y0+sy,z0=cz-sz/2,z1=cz+sz/2,o=[cx,y0+sy/2,cz],A=[x0,y0,z0],B=[x1,y0,z0],Cc=[x1,y0,z1],D=[x0,y0,z1],E=[x0,y1,z0],F=[x1,y1,z0],G=[x1,y1,z1],H=[x0,y1,z1];
      quad(A,B,F,E,col,k,o,j);quad(B,Cc,G,F,col,k,o,j);quad(Cc,D,H,G,col,k,o,j);quad(D,A,E,H,col,k,o,j);quad(E,F,G,H,col,k,o,j);if(bas)quad(A,D,Cc,B,col,k,o,j);},
    // un tronc de pyramide rectangulaire : base w0 × d0 en y0 (centre cx, cz), sommet w1 × d1 décalé de (ox, oz) en y0+h ; w1 = 0 : pointe
    frus:(cx,y0,cz,w0,d0,w1,d1,h,col,k,ox,oz,bas,j)=>{ox=ox||0;oz=oz||0;const y1=y0+h,o=[cx+ox/2,y0+h/2,cz+oz/2],
      a=[cx-w0/2,y0,cz-d0/2],b=[cx+w0/2,y0,cz-d0/2],c=[cx+w0/2,y0,cz+d0/2],d=[cx-w0/2,y0,cz+d0/2],
      e=[cx+ox-w1/2,y1,cz+oz-d1/2],f=[cx+ox+w1/2,y1,cz+oz-d1/2],g=[cx+ox+w1/2,y1,cz+oz+d1/2],hh=[cx+ox-w1/2,y1,cz+oz+d1/2];
      if(w1<=0||d1<=0){const t=[cx+ox,y1,cz+oz],f9=jf(j);tri(a,b,t,col,k||0,f9,o);tri(b,c,t,col,k||0,f9,o);tri(c,d,t,col,k||0,f9,o);tri(d,a,t,col,k||0,f9,o);}
      else{quad(a,b,f,e,col,k,o,j);quad(b,c,g,f,col,k,o,j);quad(c,d,hh,g,col,k,o,j);quad(d,a,e,hh,col,k,o,j);quad(e,f,g,hh,col,k,o,j);}
      if(bas)quad(a,d,c,b,col,k,o,j);},
    // un tronc de cône à n pans, flancs LISSES : rayon r0 en y0, r1 en y0+h (r1 = 0 : pointe), centre (cx, cz) ; le dessus plat ; col peut être une liste (une teinte par pan)
    cyl:(cx,y0,cz,r0,r1,h,n,col,k,rot,bas)=>{rot=rot||0;const y1=y0+h,o=[cx,y0+h/2,cz],sl=(r0-r1)/Math.max(h,1e-6);
      for(let i=0;i<n;i++){const a1=rot+i/n*6.28319,a2=rot+(i+1)/n*6.28319,c1=Math.cos(a1),s1=Math.sin(a1),c2=Math.cos(a2),s2=Math.sin(a2),cc=Array.isArray(col[0])?col[i%col.length]:col,f=jf(.04),
          n1=[c1,sl,s1],n2=[c2,sl,s2],p1=[cx+c1*r0,y0,cz+s1*r0],p2=[cx+c2*r0,y0,cz+s2*r0],q1=[cx+c1*r1,y1,cz+s1*r1],q2=[cx+c2*r1,y1,cz+s2*r1];
        tri(p1,p2,q2,cc,k||0,f,null,[n1,n2,n2]);if(r1>0){tri(p1,q2,q1,cc,k||0,f,null,[n1,n2,n1]);tri(q1,q2,[cx,y1,cz],cc,k||0,f,[cx,y1-1,cz]);}
        if(bas)tri(p1,[cx,y0,cz],p2,cc,k||0,f,[cx,y0+1,cz]);}},
    // une surface de révolution : prof = [[r, y], …] de bas en haut, flancs lisses (la normale suit la pente du profil)
    lathe:(cx,cz,prof,n,col,k,rot)=>{rot=rot||0;
      for(let j=0;j<prof.length-1;j++){const r0=prof[j][0],y0=prof[j][1],r1=prof[j+1][0],y1=prof[j+1][1],dr=r1-r0,dy=y1-y0,nl=Math.hypot(dr,dy)||1,nr=dy/nl,ny=-dr/nl;
        for(let i=0;i<n;i++){const a1=rot+i/n*6.28319,a2=rot+(i+1)/n*6.28319,c1=Math.cos(a1),s1=Math.sin(a1),c2=Math.cos(a2),s2=Math.sin(a2),cc=Array.isArray(col[0])?col[(i+j)%col.length]:col,f=jf(.03),
            n1=[c1*nr,ny,s1*nr],n2=[c2*nr,ny,s2*nr],p1=[cx+c1*r0,y0,cz+s1*r0],p2=[cx+c2*r0,y0,cz+s2*r0],q1=[cx+c1*r1,y1,cz+s1*r1],q2=[cx+c2*r1,y1,cz+s2*r1];
          if(r0>1e-6)tri(p1,p2,q2,cc,k||0,f,null,[n1,n2,n2]);if(r1>1e-6)tri(p1,q2,q1,cc,k||0,f,null,[n1,n2,n1]);}}},
    // une sphère aplatie (ellipsoïde) : centre, rayons rx ry rz, nlat bandes de latitude, nlon pans
    sph:(cx,cy,cz,rx,ry,rz,nlat,nlon,col,k)=>{const q=(i,j)=>{const t=-Math.PI/2+i/nlat*Math.PI,a=j/nlon*6.28319,ct=Math.cos(t),st=Math.sin(t);return {p:[cx+ct*Math.cos(a)*rx,cy+st*ry,cz+ct*Math.sin(a)*rz],n:[ct*Math.cos(a)/rx,st/ry,ct*Math.sin(a)/rz]};};
      for(let i=0;i<nlat;i++)for(let j=0;j<nlon;j++){const A=q(i,j),B=q(i,j+1),Cc=q(i+1,j+1),D=q(i+1,j),f=jf(.04);
        if(i>0)tri(A.p,B.p,Cc.p,col,k||0,f,null,[A.n,B.n,Cc.n]);if(i<nlat-1)tri(A.p,Cc.p,D.p,col,k||0,f,null,[A.n,Cc.n,D.n]);}},
    // un tube de A à B (rayons r0, r1), n pans, lisse
    tube:(A,B,r0,r1,n,col,k,bout)=>{const ax=new THREE.Vector3(B[0]-A[0],B[1]-A[1],B[2]-A[2]),l=ax.length()||1;ax.multiplyScalar(1/l);const up=Math.abs(ax.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0),
      u=new THREE.Vector3().crossVectors(ax,up).normalize(),w=new THREE.Vector3().crossVectors(ax,u).normalize(),sl=(r0-r1)/l;
      const P2=(O,r,t)=>[O[0]+(u.x*Math.cos(t)+w.x*Math.sin(t))*r,O[1]+(u.y*Math.cos(t)+w.y*Math.sin(t))*r,O[2]+(u.z*Math.cos(t)+w.z*Math.sin(t))*r],
        N2=t=>[u.x*Math.cos(t)+w.x*Math.sin(t)+ax.x*sl,u.y*Math.cos(t)+w.y*Math.sin(t)+ax.y*sl,u.z*Math.cos(t)+w.z*Math.sin(t)+ax.z*sl];
      for(let i=0;i<n;i++){const t1=i/n*6.28319,t2=(i+1)/n*6.28319,f=jf(.04),p1=P2(A,r0,t1),p2=P2(A,r0,t2),q1=P2(B,r1,t1),q2=P2(B,r1,t2),n1=N2(t1),n2=N2(t2);
        tri(p1,p2,q2,col,k||0,f,null,[n1,n2,n2]);if(r1>0)tri(p1,q2,q1,col,k||0,f,null,[n1,n2,n1]);
        if(bout){tri(q1,q2,B,col,k||0,f,[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2]);}}},
    // un prisme extrudé : un contour [[x, z], …] entre y0 et y1 (côtés plats + dessus)
    ext:(poly,y0,y1,col,k,j)=>{let cx=0,cz=0;for(const q of poly){cx+=q[0];cz+=q[1];}cx/=poly.length;cz/=poly.length;const o=[cx,(y0+y1)/2,cz];
      for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],col,k,o,j);tri([cx,y1,cz],[a[0],y1,a[1]],[b[0],y1,b[1]],col,k||0,jf(j),[cx,y1-1,cz]);}},
    // une surface LOFTÉE (2026-10-22) : des ANNEAUX superelliptiques le long d'un axe — secs = [{p:[x,y,z] (centre), u:[ux,uy,uz] (1er demi-axe, rayon compris), w:[wx,wy,wz] (2e demi-axe), n: la « carrure » (2 = ellipse, 4 = carré arrondi)}] ;
    // nseg points par anneau ; flancs LISSES (normales moyennées des faces voisines) ; col et k : une valeur, ou une LISTE (une par tranche entre deux anneaux) ; cap : 1 ferme le premier anneau, 2 le dernier, 3 les deux
    loft:(secs,nseg,col,k,cap)=>{const R=secs.length,Cn=nseg,Pp=[],Nn2=[],cen=[];
      for(let r=0;r<R;r++){const s=secs[r],ex=2/(s.n||2),row=[];let cx=0,cy=0,cz=0;
        for(let c=0;c<Cn;c++){const a=c/Cn*6.28319,ca=Math.cos(a),sa=Math.sin(a),cs=Math.sign(ca)*Math.pow(Math.abs(ca),ex),sn=Math.sign(sa)*Math.pow(Math.abs(sa),ex);
          const q=[s.p[0]+s.u[0]*cs+s.w[0]*sn,s.p[1]+s.u[1]*cs+s.w[1]*sn,s.p[2]+s.u[2]*cs+s.w[2]*sn];row.push(q);cx+=q[0];cy+=q[1];cz+=q[2];}
        Pp.push(row);cen.push([cx/Cn,cy/Cn,cz/Cn]);Nn2.push(row.map(()=>[0,0,0]));}
      const cr=(a,b,c)=>{const x1=b[0]-a[0],y1=b[1]-a[1],z1=b[2]-a[2],x2=c[0]-a[0],y2=c[1]-a[1],z2=c[2]-a[2];return [y1*z2-z1*y2,z1*x2-x1*z2,x1*y2-y1*x2];};
      const add=(r,c,n,rf)=>{const q=Pp[r][c],o=cen[rf],d=(q[0]-o[0])*n[0]+(q[1]-o[1])*n[1]+(q[2]-o[2])*n[2],sg=d<0?-1:1;Nn2[r][c][0]+=n[0]*sg;Nn2[r][c][1]+=n[1]*sg;Nn2[r][c][2]+=n[2]*sg;};
      for(let r=0;r<R-1;r++)for(let c=0;c<Cn;c++){const c2=(c+1)%Cn,a=Pp[r][c],b=Pp[r][c2],d=Pp[r+1][c],e=Pp[r+1][c2],n1=cr(a,b,e),n2=cr(a,e,d);
        add(r,c,n1,r);add(r,c2,n1,r);add(r+1,c2,n1,r+1);add(r,c,n2,r);add(r+1,c2,n2,r+1);add(r+1,c,n2,r+1);}
      const nz=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
      for(let r=0;r<R;r++)for(let c=0;c<Cn;c++)Nn2[r][c]=nz(Nn2[r][c]);
      for(let r=0;r<R-1;r++)for(let c=0;c<Cn;c++){const c2=(c+1)%Cn,f=jf(.03),cc=Array.isArray(col[0])?col[r%col.length]:col,kr=Array.isArray(k)?k[r%k.length]:(k||0);
        tri(Pp[r][c],Pp[r][c2],Pp[r+1][c2],cc,kr,f,null,[Nn2[r][c],Nn2[r][c2],Nn2[r+1][c2]]);tri(Pp[r][c],Pp[r+1][c2],Pp[r+1][c],cc,kr,f,null,[Nn2[r][c],Nn2[r+1][c2],Nn2[r+1][c]]);}
      const bout=(r,o)=>{const cc=Array.isArray(col[0])?col[0]:col,f=jf(.03);for(let c=0;c<Cn;c++){const c2=(c+1)%Cn;tri(cen[r],Pp[r][c],Pp[r][c2],cc,k||0,f,o);}};
      if(cap&1)bout(0,cen[1]);if(cap&2)bout(R-1,cen[R-2]);},
    fin:()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
      g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.computeBoundingSphere();return g;},
    n:()=>P.length/3
  };
  return K9;}
/* LE CUISEUR DES DÉCORS (celui du canyon, avec les normales et la matière) : des géométries posées par une matrice, fondues en UNE (un seul appel de dessin) — te : teinte facultative [r, g, b] */
function dnCuiseur(){let cap=1<<15,n=0,P=new Float32Array(cap*3),Nm=new Float32Array(cap*3),C=new Float32Array(cap*3),K=new Float32Array(cap);const m3=new THREE.Matrix3(); // (des tableaux typés qui grandissent par doublement : 50 000 sommets en ~3 ms, sans un seul objet alloué par sommet)
  const grow=need=>{if(n+need<=cap)return;while(n+need>cap)cap*=2;const g=(a,m)=>{const b=new Float32Array(cap*m);b.set(a.subarray(0,n*m));return b;};P=g(P,3);Nm=g(Nm,3);C=g(C,3);K=g(K,1);};
  return {ajoute:function(g,mt,te){const cnt=g.attributes.position.count,p=g.attributes.position.array,c=g.attributes.color.array,nn=g.attributes.normal.array,k=g.attributes.aK?g.attributes.aK.array:null,r=te?te[0]:1,gg=te?te[1]:1,b=te?te[2]:1,e=mt.elements;m3.getNormalMatrix(mt);const f=m3.elements;grow(cnt);
      for(let j=0;j<cnt;j++){const o=(n+j)*3,j3=j*3,x=p[j3],y=p[j3+1],z=p[j3+2],nx=nn[j3],ny=nn[j3+1],nz=nn[j3+2];
        P[o]=e[0]*x+e[4]*y+e[8]*z+e[12];P[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13];P[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
        const X=f[0]*nx+f[3]*ny+f[6]*nz,Y=f[1]*nx+f[4]*ny+f[7]*nz,Z=f[2]*nx+f[5]*ny+f[8]*nz,l=1/(Math.sqrt(X*X+Y*Y+Z*Z)||1);Nm[o]=X*l;Nm[o+1]=Y*l;Nm[o+2]=Z*l;
        C[o]=c[j3]*r;C[o+1]=c[j3+1]*gg;C[o+2]=c[j3+2]*b;K[n+j]=k?k[j]:0;}
      n+=cnt;},
    n:function(){return n;},
    fin:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P.slice(0,n*3),3));g.setAttribute('normal',new THREE.BufferAttribute(Nm.slice(0,n*3),3));g.setAttribute('color',new THREE.BufferAttribute(C.slice(0,n*3),3));
      g.setAttribute('aK',new THREE.BufferAttribute(K.slice(0,n),1));g.computeBoundingSphere();return g;}};}
/* LES COULEURS DE LA DA : le grès chaud, le lapis (le teal contre l'or), l'or, la terre cuite, la faïence turquoise */
const DN_COL={gres:[.95,.83,.66],gres2:[.87,.71,.53],cre:[.98,.92,.80],lapis:[.18,.32,.66],azur:[.26,.48,.88],granit:[.72,.49,.45],or:[1,.80,.34],terre:[.74,.38,.24],turq:[.22,.70,.70],noir:[.12,.10,.10],sable:[.96,.78,.50],os:[.96,.93,.84]};
/* LES MODÈLES (hauteur et largeurs en mètres, à poser tels quels ou à l'échelle UNIFORME) — `dnMod(nom)` rend la géométrie (cachée) */
/* LES PYRAMIDES DE GIZEH (2026-10-22, Léo : « des pyramides plus belles ») — demi-base 1, haut ~ 1 : v0 KHÉOPS (le parement de calcaire de Tura, crème et poli, l'ÉLECTRUM du pyramidion qui flambe au soleil), v1 KHÉPHREN (le haut a gardé
   son parement blanc — « un second sommet » —, le bas est nu, en assises), v2 MYKÉRINOS (les assises du bas en GRANIT ROUGE d'Assouan, le haut en calcaire). Des assises de calcaire tout du long (le dégradé : plus chaud au pied, plus blanc au sommet) */
function dnPyrGiza(v){const g=dnKit(87+v),C=DN_COL,N=v===1?26:40,H=.945,r=f=>1-.945*f,mx=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
    cre=[.99,.95,.84],cre2=[.95,.90,.78],och=[.93,.79,.57],och2=[.86,.71,.51],red=[.66,.31,.23],red2=[.56,.26,.20];
  g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);
  for(let i=0;i<N;i++){const f0=i/N,f1=(i+1)/N,y0=.012+f0*H,y1=.012+f1*H,r0=r(f0),r1=r(f1);let col,k=1;
    if(v===0){col=mx(i&1?cre2:cre,och,Math.max(0,1-f0/.28)*.45);}
    else if(v===1){if(f0<.72){col=i&1?och2:och;g.frus(0,y0,0,r0*2,r0*2,(r1-.004)*2,(r1-.004)*2,y1-y0,col,1,0,0,0,.05);g.frus(0,y1-.0006,0,(r1-.004)*2,(r1-.004)*2,r1*2,r1*2,.0006,C.gres2,1);continue;}
      col=f0<.76?[.80,.66,.46]:(i&1?cre2:cre);}
    else{if(f0<.27){col=i&1?red2:red;k=2;}else col=i&1?cre2:cre;}
    g.frus(0,y0,0,r0*2,r0*2,r1*2,r1*2,y1-y0,col,k,0,0,0,.035);}
  g.frus(0,.957,0,.11,.11,.092,.092,.006,C.or,3);g.frus(0,.963,0,.092,.092,0,0,.037,C.or,3);g.box(0,.012,-.995,.12,.10,.03,C.noir,0);return g.fin();}
/* L'ORIFLAMME (2026-10-22) : une bande de toile le long de +x, des bandes de couleur, que le vent fait onduler (la matière 20 + u, voir DN_MVS : le bout libre bat, le mât ne bouge pas) */
function dnFlag(g,x,y,z,L,Hh,cols,n){n=n||8;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n;g.setK(function(p){return 20+Math.max(0,Math.min(1,(p[0]-x)/L));});g.quad([x+u0*L,y+Hh,z],[x+u1*L,y+Hh,z],[x+u1*L,y,z],[x+u0*L,y,z],cols[i%cols.length],20,null,.03);}g.setK(null);}
const DN_MOD={
  // L'OBÉLISQUE : le socle à deux marches, le fût de lapis qui s'affine, des bandeaux d'or, le pyramidion d'or (h = 64, base 8 m)
  obelisque:function(){const g=dnKit(11),b=4,h=64,C=DN_COL;g.box(0,0,0,4.6*b,.7*b,4.6*b,C.gres2,1,1);g.box(0,.7*b,0,3.5*b,.6*b,3.5*b,C.gres,1);
    const y0=1.3*b,hs=h*.86-y0,w0=2*b,w1=1.58*b,fw=f=>w0+(w1-w0)*f;g.frus(0,y0,0,w0,w0,w1,w1,hs,C.granit,4,0,0,0,.03);
    for(const f of [.10,.34,.58,.82]){const yy=y0+hs*f,ww=fw(f);g.frus(0,yy,0,ww*1.035,ww*1.035,ww*1.035,ww*1.035,h*.014,C.or,3);}
    g.frus(0,y0+hs,0,w1*1.06,w1*1.06,w1*1.06,w1*1.06,h*.012,C.or,3);g.frus(0,y0+hs+h*.012,0,w1,w1,0,0,h-(y0+hs+h*.012),C.or,3);return g.fin();},
  // LE PYLÔNE (une tour de temple, h = 30, base 14 × 9) : murs en fruit, corniche à gorge, quatre mortaises de mâts, un cartouche gravé
  pylone:function(){const g=dnKit(23),C=DN_COL,h=30,w0=14,d0=9,w1=11.4,d1=7;g.box(0,0,0,w0*1.12,1.1,d0*1.14,C.gres2,1,1);g.frus(0,1.1,0,w0,d0,w1,d1,h-1.1,C.gres,1,0,0,0,.05);
    g.box(0,h-.2,0,w1*1.1,1.6,d1*1.14,C.gres2,1);g.box(0,h+1.3,0,w1*1.16,.7,d1*1.2,C.or,3);
    for(const sx of [-1,1]){g.box(sx*4.2,3,-d0/2+.1,.9,h*.62,.3,C.noir,0);g.tube([sx*4.2,.5,-d0/2-.5],[sx*4.2,h*.98,-d0/2-.5],.30,.24,6,C.noir,0);g.sph(sx*4.2,h*.98+.3,-d0/2-.5,.4,.4,.4,3,6,C.or,3);dnFlag(g,sx*4.2+.3,h*.98-3.2,-d0/2-.5,8,3.2,[C.terre,C.or,C.azur,C.or],8);}
    g.box(0,h*.42,-d0/2+.05+(d0-d1)*.5*.42,6.4,h*.26,.4,C.gres,4);g.box(0,h*.42+.2,-d0/2+.06+(d0-d1)*.5*.42,6.0,.5,.45,C.or,3);g.box(0,h*.42+h*.26-.7,-d0/2+.06+(d0-d1)*.5*.42,6.0,.5,.45,C.lapis,3);return g.fin();},
  // LA COLONNE (h = 22, rayon 2,3) : base, fût qui se resserre, collier d'or, chapiteau en bouton de papyrus, abaque
  colonne:function(){const g=dnKit(31),C=DN_COL,h=22,r=2.3;g.box(0,0,0,r*3,.5,r*3,C.gres2,1,1);
    g.lathe(0,0,[[1.35*r,.5],[1.2*r,.9],[r,1.2],[.86*r,h*.72],[.82*r,h*.80],[.95*r,h*.82],[.86*r,h*.835]],12,C.gres,1);
    g.lathe(0,0,[[.86*r,h*.835],[1.12*r,h*.86],[1.5*r,h*.92],[1.38*r,h*.965],[1.1*r,h*.975]],12,[C.gres,C.cre],1);
    g.cyl(0,h*.80,0,.88*r,.88*r,.7,12,C.or,3);g.cyl(0,h*.88,0,1.3*r,1.3*r,.5,12,C.lapis,3);g.box(0,h*.975,0,r*3,h*.035,r*3,C.gres2,1);return g.fin();}
  ,
  // LE SPHINX (long 1, face à +z, haut ~ .46) : socle, croupe, dos, poitrail, pattes avant, queue, cou, nemès à lappets rayés lapis/or, visage, barbe, uræus
  sphinx:function(){const g=dnKit(41),C=DN_COL,gr=C.gres,g2=C.gres2;g.box(0,0,.02,.46,.028,1.08,g2,1,1);
    g.box(0,.028,-.30,.31,.22,.28,gr,1);g.box(0,.028,-.04,.23,.18,.24,gr,1);g.frus(0,.028,.14,.23,.20,.20,.15,.20,gr,1,0,.02);
    g.box(-.095,.028,.34,.078,.07,.40,gr,1);g.box(.095,.028,.34,.078,.07,.40,gr,1);g.box(-.095,.028,.55,.09,.052,.10,g2,1);g.box(.095,.028,.55,.09,.052,.10,g2,1);
    g.tube([.15,.07,-.43],[.20,.10,-.50],.014,.010,5,gr,1,1);g.box(0,.20,.21,.13,.17,.10,gr,1);
    g.frus(0,.30,.21,.30,.19,.24,.15,.19,C.lapis,3,0,0,0,.02);g.frus(0,.47,.21,.24,.15,.20,.13,.04,C.or,3);
    for(const sx of [-1,1])for(let i=0;i<5;i++)g.box(sx*.14,.20+i*.022,.225,.04,.021,.12,i&1?C.or:C.lapis,3);
    g.box(0,.31,.285,.115,.16,.075,C.cre,1);g.box(0,.35,.325,.032,.052,.03,C.cre,1);g.box(-.03,.385,.322,.025,.012,.012,C.noir,0);g.box(.03,.385,.322,.025,.012,.012,C.noir,0);g.box(0,.318,.322,.05,.008,.012,C.noir,0);
    g.box(0,.245,.30,.034,.07,.04,C.lapis,3);g.box(0,.47,.30,.022,.04,.022,C.or,3);return g.fin();},
  // LE COLOSSE ASSIS (h = 1, face à +z) : socle, trône à dossier, jambes, torse en fruit, bras sur les cuisses, collier d'or et de lapis, tête au nemès, couronne
  colosse:function(){const g=dnKit(53),C=DN_COL,gr=C.gres,g2=C.gres2;g.box(0,0,.02,.58,.05,.66,g2,1,1);g.box(0,.05,-.02,.50,.34,.46,gr,1);g.box(0,.39,-.22,.46,.32,.08,gr,1);
    for(const sx of [-1,1]){g.box(sx*.115,.39,.12,.15,.085,.36,gr,1);g.box(sx*.115,.05,.28,.14,.34,.13,gr,1);g.box(sx*.115,.05,.41,.15,.05,.19,g2,1);}
    g.frus(0,.39,-.09,.35,.20,.30,.16,.30,gr,1,0,0,0,.03);for(const sx of [-1,1]){g.box(sx*.21,.43,-.09,.075,.26,.11,gr,1);g.box(sx*.19,.47,.09,.07,.065,.31,gr,1);}
    g.box(0,.64,-.09,.40,.045,.19,C.lapis,3);g.box(0,.675,-.09,.34,.025,.17,C.or,3);
    g.box(0,.69,-.07,.13,.145,.12,C.cre,1);g.box(0,.725,-.065,.215,.165,.15,C.lapis,3);for(const sx of [-1,1])for(let i=0;i<4;i++)g.box(sx*.11,.60+i*.035,-.05,.04,.034,.10,i&1?C.or:C.lapis,3);
    g.box(0,.74,.005,.10,.14,.06,C.cre,1);g.box(0,.78,.04,.03,.045,.03,C.cre,1);g.box(-.028,.80,.038,.022,.011,.01,C.noir,0);g.box(.028,.80,.038,.022,.011,.01,C.noir,0);g.box(0,.70,.04,.03,.06,.03,C.lapis,3);
    g.frus(0,.805,-.07,.15,.13,.10,.10,.14,C.cre,1);g.frus(0,.945,-.07,.10,.10,.06,.06,.03,C.terre,1);return g.fin();},
  // LE PHARAON ASSIS (2026-10-22, Léo : « je préfère le style A » — un roi de pierre assis façon Ramsès) : trône cubique à dossier-dalle et flancs au sema-tawy, jambes puissantes, tablier plissé, torse large au collier d'or et de lapis,
  // mains à plat sur les genoux, tête au nemès rayé lapis/or (lappets sur la poitrine), uræus, barbe tressée — corps LISSE (matière 0), le trône en assises (1), l'or en 3, la frise du socle gravée (4). Haut ~ .95, face à +z, large ~ .70 au socle
  pharaon:function(crown){crown=crown||'nemes';const g=dnKit(55),C=DN_COL,gr=C.gres,g2=C.gres2,cre=[.97,.87,.70],rg=[.93,.78,.58],pe=[.66,.32,.28];
    const Ry=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.4}),Rz=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.4});
    g.box(0,0,0,.70,.03,.84,g2,1,1);g.box(0,.03,0,.64,.03,.78,gr,1);g.box(0,.052,.405,.52,.012,.012,gr,4);                                                // le socle à deux marches, la frise gravée
    g.box(0,.06,-.05,.44,.32,.50,gr,1);g.box(0,.38,-.285,.44,.44,.07,gr,1);g.box(0,.82,-.285,.40,.03,.065,g2,1);                                          // le trône : le bloc, le dossier-dalle qui monte derrière les épaules, son chaperon
    for(const sx of [-1,1]){g.box(sx*.223,.13,-.05,.014,.20,.30,C.or,3);g.box(sx*.226,.14,-.05,.012,.16,.24,C.lapis,3);g.box(sx*.227,.16,-.05,.01,.045,.14,C.or,3);}  // les flancs du trône : un cadre d'or, une plaque de lapis, le sema-tawy
    for(const sx of [-1,1]){const X=sx*.108;
      g.loft([Rz(-.12,.086,.070,2.6,X,.455),Rz(.04,.090,.072,2.6,X,.455),Rz(.17,.086,.068,2.6,X,.452),Rz(.245,.066,.060,2.4,X,.45)],16,gr,5,3);                  // la cuisse
      g.loft([Ry(.45,.066,.062,2.4,X,.262),Ry(.31,.060,.058,2.4,X,.268),Ry(.18,.058,.055,2.4,X,.272),Ry(.098,.063,.060,2.4,X,.274)],16,gr,5,3);                 // le tibia
      g.box(X,.06,.335,.12,.04,.21,g2,1);g.sph(X,.080,.44,.058,.024,.030,3,8,gr,5);}                                                                          // le pied
    g.box(0,.51,.10,.30,.026,.23,rg,5);for(let i=-6;i<=6;i++)g.box(i*.022,.536,.10,.009,.004,.23,i&1?C.or:cre,3);g.box(0,.51,.22,.30,.04,.012,C.or,3);          // le tablier plissé (le shendyt) et son ourlet d'or
    g.loft([Ry(.505,.135,.082,2.8,0,-.085),Ry(.56,.145,.086,2.8,0,-.085),Ry(.63,.168,.094,3,0,-.085),Ry(.662,.186,.098,3.2,0,-.085),Ry(.684,.200,.099,3.4,0,-.085),Ry(.702,.205,.097,3.4,0,-.085),Ry(.722,.178,.082,2.8,0,-.085),Ry(.738,.120,.066,2.4,0,-.085),Ry(.752,.058,.054,2.2,0,-.082)],20,[gr,gr,gr,C.or,C.turq,C.or,C.azur,gr],[5,5,5,3,3,3,3,5],3); // le torse — et son COLLIER (usekh) : des bandes d'or, de turquoise, d'or, d'azur
    g.box(0,.505,.0,.272,.024,.022,C.or,3);g.box(0,.507,.012,.052,.032,.012,C.lapis,3);                                                                         // la ceinture et sa plaque
    for(const sx of [-1,1]){g.tube([sx*.205,.70,-.085],[sx*.215,.60,-.06],.050,.043,12,gr,5,1);g.sph(sx*.215,.595,-.06,.045,.042,.045,4,8,gr,5);                // le bras, le coude
      g.tube([sx*.215,.595,-.06],[sx*.14,.555,.115],.043,.036,12,gr,5,1);g.tube([sx*.147,.558,.095],[sx*.14,.555,.12],.046,.046,12,C.or,3,1);g.sph(sx*.128,.552,.19,.047,.020,.078,4,10,cre,5);} // l'avant-bras, le bracelet d'or, la main à plat
    g.push();g.T(0,.744,-.07);g.Sc(1.2);g.T(0,-.744,.07); // la TÊTE, plus forte : un colosse se lit à sa tête
    g.loft([Ry(.744,.036,.042,2.2,0,-.055),Ry(.768,.052,.056,2.3,0,-.066),Ry(.796,.060,.064,2.3,0,-.072),Ry(.826,.062,.064,2.3,0,-.074),Ry(.854,.056,.058,2.2,0,-.074)],20,cre,5,3); // le visage ovoïde
    g.frus(0,.785,-.018,.022,.024,.011,.011,.030,cre,5,0,.011);for(const sx of [-1,1]){g.box(sx*.027,.810,-.011,.030,.010,.009,C.noir,0);g.box(sx*.030,.823,-.010,.036,.007,.009,C.noir,0);}g.box(0,.762,-.013,.042,.008,.009,pe,0); // le nez, les yeux de khôl, les sourcils, la bouche
    for(const sx of [-1,1])g.box(sx*.064,.80,-.07,.010,.04,.025,cre,5);                                                                                                  // les oreilles
    g.cyl(0,.836,-.074,.084,.084,.012,20,C.or,3);                                                                                                                       // le bandeau d'or
    for(let i=0;i<5;i++){const y0=.848+i*.022,y1=y0+.022,r=y=>.081*Math.sqrt(Math.max(.0004,1-Math.pow((y-.836)/.125,2)));g.lathe(0,-.074,[[r(y0),y0],[r(y1),y1]],20,i&1?C.or:C.azur,3);}                // le dôme du nemès : bandes lapis et or
    for(const sx of [-1,1])for(let i=0;i<7;i++)g.box(sx*(.094+.002*i),.832-i*.022,-.044,.042+.003*i,.0215,.076,i&1?C.or:C.azur,3);                                    // les lappets, sur la poitrine
    g.frus(0,.848,-.006,.010,.012,.006,.006,.032,C.or,3,0,.005);g.sph(0,.884,.0,.009,.013,.009,3,6,C.or,3);                                                             // l'uræus
    g.frus(0,.656,-.020,.022,.024,.016,.018,.092,C.lapis,3);g.box(0,.748,-.018,.015,.004,.025,C.or,3);for(const sx of [-1,1])g.box(sx*.059,.787,-.04,.004,.066,.004,C.or,3); // la barbe tressée et ses lanières
    g.pop();
    return g.fin();}
  ,
  // LE BRASERO (haut 1) : le pied de pierre, la vasque d'or, la flamme (matière 22 : elle s'allume de l'intérieur — la nuit, c'est elle qui éclaire l'allée)
  brasero:function(){const g=dnKit(103),C=DN_COL;g.cyl(0,0,0,.34,.26,.05,10,C.gres2,1,0,1);g.cyl(0,.05,0,.14,.12,.62,8,C.gres,1,0,0);g.lathe(0,0,[[.10,.66],[.26,.76],[.34,.98],[.30,1.0]],10,C.or,3);
    g.cyl(0,.90,0,.22,0,.55,7,[1,.50,.08],22);g.cyl(0,.92,0,.15,0,.78,6,[1,.80,.22],22);return g.fin();},
  // LE PAPYRUS (2026-10-22, la vie de l'oasis : « papyrus et lotus bleus ») : une touffe, haut 1 — huit tiges triangulaires en éventail, chacune son ombelle de filaments
  papyrus:function(){const g=dnKit(97),a=[.24,.52,.18],b=[.34,.62,.24],u=[.62,.76,.34];
    for(let i=0;i<8;i++){const an=i/8*6.283+.3*(i&1),sp=.10+.05*(i%3),hh=.74+.26*((i*5)%4)/3,bx=Math.cos(an)*.05,bz=Math.sin(an)*.05,tx=Math.cos(an)*sp,tz=Math.sin(an)*sp;
      g.tube([bx,0,bz],[tx,hh,tz],.016,.009,5,i&1?a:b,0);g.sph(tx,hh+.02,tz,.075,.04,.075,3,7,u,0);
      for(let k=0;k<5;k++){const aa=k/5*6.283;g.tube([tx,hh+.02,tz],[tx+Math.cos(aa)*.11,hh-.04,tz+Math.sin(aa)*.11],.005,.003,3,u,0);}}
    return g.fin();},
  // LE LOTUS BLEU (flotte, rayon .55) : la feuille ronde, huit pétales relevés, un cœur d'or
  lotus:function(){const g=dnKit(99),pad=[.20,.50,.22],bl=[.40,.58,.98],ye=[1,.85,.30];
    g.cyl(0,0,0,.55,.55,.02,10,pad,0,0,1);for(let i=0;i<8;i++){const an=i/8*6.283;g.tube([Math.cos(an)*.04,.02,Math.sin(an)*.04],[Math.cos(an)*.19,.17,Math.sin(an)*.19],.055,.012,5,bl,0,1);}
    g.sph(0,.05,0,.05,.04,.05,3,6,ye,0);return g.fin();},
  // LA FELOUQUE (long 1, vers +z) : la coque lofée (la proue relevée), le pont, le mât, la voile latine, des bastingages
  felouque:function(){const g=dnKit(101),C=DN_COL,wd=[.54,.38,.24],wd2=[.42,.30,.18],vo=[.98,.94,.84],Rz=(z,rx,ry,cy)=>({p:[0,cy,z],u:[rx,0,0],w:[0,ry,0],n:2.4});
    g.loft([Rz(-.50,.06,.09,.28),Rz(-.34,.15,.12,.22),Rz(-.08,.19,.14,.20),Rz(.22,.16,.13,.23),Rz(.40,.09,.10,.31),Rz(.50,.03,.07,.40)],12,wd,0,3);
    g.box(0,.31,-.02,.30,.02,.80,wd2,0);g.tube([0,.32,.05],[0,1.0,.05],.014,.008,6,wd2,0,1);
    g.tube([0,.96,-.34],[0,.60,.50],.008,.006,5,wd2,0);g.quad([0,.96,-.33],[0,.62,.49],[0,.36,.04],[0,.40,-.2],vo,0,null,.02);
    g.sph(0,.30,-.44,.05,.05,.05,3,6,C.or,3);g.box(0,.42,.40,.012,.12,.1,wd2,0);return g.fin();},
  // LE CHAMEAU (long 1, haut ~ .88, vers +z) : corps et bosse lisses, cou en deux tubes, tête, quatre jambes à genou, queue ; `bl` = la couleur de la couverture
  chameau:function(bl){const g=dnKit(61),ro=[.80,.60,.38],ro2=[.68,.48,.30],C=DN_COL;bl=bl||C.terre;g.sph(0,.55,0,.115,.135,.30,6,10,ro,0);g.sph(0,.73,-.05,.08,.11,.11,5,8,ro2,0);
    g.tube([0,.62,.22],[0,.80,.33],.062,.044,8,ro,0);g.sph(0,.86,.39,.048,.05,.09,5,8,ro,0);g.sph(0,.84,.47,.03,.03,.045,4,6,ro2,0);
    for(const [x,z] of [[.065,.20],[-.065,.20],[.065,-.20],[-.065,-.20]]){const f=z>0?1:-1;g.tube([x,.48,z],[x,.25,z+.03*f],.042,.03,6,ro,0);g.tube([x,.25,z+.03*f],[x,.015,z],.03,.022,6,ro2,0);g.box(x,0,z,.05,.02,.07,C.noir,0);}
    g.tube([0,.58,-.30],[0,.40,-.36],.014,.008,5,ro2,0,1);g.box(0,.675,.02,.25,.05,.30,bl,0);g.box(.135,.58,.02,.04,.15,.22,C.lapis,0);g.box(-.135,.58,.02,.04,.15,.22,C.lapis,0);return g.fin();},
  // LE PALMIER (h = 1) : le fût qui penche, anneaux, sept palmes arquées à folioles, un régime de dattes
  palmier:function(){const g=dnKit(71),b1=[.50,.36,.22],b2=[.42,.30,.18];let px=0;const hh=[0,.16,.33,.50,.67,.83,.92];
    for(let i=0;i<6;i++){const x0=px;px+=.012+i*.007;g.tube([x0,hh[i],0],[px,hh[i+1],0],.038-i*.0035,.034-i*.0035,7,i&1?b1:b2,0,i===5);}
    const top=[px,.93,0],ve=[.24,.52,.16],v2=[.30,.60,.20];
    for(let k=0;k<9;k++){const a=k/9*6.28319+.3,ca=Math.cos(a),sa=Math.sin(a),L=.40+.06*((k*7)%3),w=.065;
      const pr=[top,[top[0]+ca*L*.34,top[1]+.075,top[2]+sa*L*.34],[top[0]+ca*L*.68,top[1]+.07,top[2]+sa*L*.68],[top[0]+ca*L,top[1]-.08,top[2]+sa*L]];
      for(let i=0;i<3;i++){const A=pr[i],B=pr[i+1],px2=-sa*w*(1-i*.28),pz2=ca*w*(1-i*.28),qx=-sa*w*(1-(i+1)*.28),qz=ca*w*(1-(i+1)*.28);
        g.quad([A[0]+px2,A[1],A[2]+pz2],[A[0]-px2,A[1],A[2]-pz2],[B[0]-qx,B[1],B[2]-qz],[B[0]+qx,B[1],B[2]+qz],k&1?ve:v2,0,null,.04);}}
    for(let i=0;i<4;i++){g.sph(top[0]+(i-1.5)*.012,.89,.012*(i&1?1:-1),.014,.02,.014,3,5,[.62,.34,.12],0);}return g.fin();},
  // LES PYRAMIDES (demi-base 1, h 1) : à GRADINS (assises en retrait), LISSE (parement de calcaire), À DEGRÉS (Djoser) — pierre en assises, coiffe d'or, une porte sombre au pied
  pyrGradins:function(){const g=dnKit(81),C=DN_COL,N=20;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);for(let i=0;i<N;i++){const y0=i/N*.97+.012,y1=(i+1)/N*.97+.012,r0=(1-i/N)*1,r1=r0-.0035;g.frus(0,y0,0,r0*2,r0*2,r1*2,r1*2,y1-y0,i&1?C.gres:[.94,.78,.55],1,0,0,0,.04);
      if(i<N-1){const rn=(1-(i+1)/N)*1;g.frus(0,y1,0,r1*2,r1*2,rn*2,rn*2,.0008,C.gres2,1);}}
    g.frus(0,.97,0,.10,.10,0,0,.04,C.or,3);g.box(0,.012,-.995,.12,.10,.03,C.noir,0);return g.fin();},
  pyrGiza:function(){return dnPyrGiza(0);},pyrCap:function(){return dnPyrGiza(1);},pyrRouge:function(){return dnPyrGiza(2);},
  pyrLisse:function(){const g=dnKit(83),C=DN_COL;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);g.frus(0,.012,0,2,2,.14,.14,.93,C.cre,1,0,0,0,.025);g.frus(0,.942,0,.14,.14,0,0,.058,C.or,3);g.box(0,.012,-.995,.14,.11,.03,C.noir,0);return g.fin();},
  pyrDegres:function(){const g=dnKit(85),C=DN_COL,N=6;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);for(let i=0;i<N;i++){const y0=i/N*.96+.012,y1=(i+1)/N*.96+.012,r0=1-i/(N+.6),r1=1-(i+1)/(N+.6);g.frus(0,y0,0,r0*2,r0*2,r0*1.97,r0*1.97,y1-y0-.004,i&1?C.gres:C.cre,1,0,0,0,.04);g.frus(0,y1-.004,0,r0*1.97,r0*1.97,r1*2,r1*2,.004,C.gres2,1);}
    g.frus(0,.972,0,.12,.12,0,0,.03,C.or,3);return g.fin();}
  ,
  // le fût seul (l'obélisque BRISÉ : le dessus en dents de scie) et ses blocs
  obeliskTronc:function(){const g=dnKit(13),b=4,h=64,C=DN_COL;g.box(0,0,0,4.6*b,.7*b,4.6*b,C.gres2,1,1);g.box(0,.7*b,0,3.5*b,.6*b,3.5*b,C.gres,1);const y0=1.3*b,hs=h*.86-y0,w0=2*b,w1=1.58*b;
    g.frus(0,y0,0,w0,w0,w1,w1,hs,C.granit,4,0,0,0,.03);for(const f of [.10,.34,.58,.82]){const ww=w0+(w1-w0)*f;g.frus(0,y0+hs*f,0,ww*1.035,ww*1.035,ww*1.035,ww*1.035,h*.014,C.or,3);}
    for(let k=0;k<5;k++){const a=k/5*6.28319,x=Math.cos(a)*w1*.3,z=Math.sin(a)*w1*.3;g.frus(x,y0+hs-1,z,w1*.42,w1*.42,w1*.2,w1*.2,2+((k*7)%3),C.granit,4);}return g.fin();},
  // LA PORTE (un pylône double, h = 30 : deux tours en fruit de 14 × 9 de part et d'autre d'une baie de 12 m, un linteau gravé, une corniche, des mâts, des marches)
  porte:function(){const g=dnKit(27),C=DN_COL,h=30,w0=14,d0=9,w1=11.4,d1=7,gap=12;
    for(const sx of [-1,1]){g.push();g.T(sx*(gap/2+w0/2),0,0);g.box(0,0,0,w0*1.12,1.1,d0*1.14,C.gres2,1,1);g.frus(0,1.1,0,w0,d0,w1,d1,h-1.1,C.gres,1,0,0,0,.05);g.box(0,h-.2,0,w1*1.1,1.6,d1*1.14,C.gres2,1);g.box(0,h+1.3,0,w1*1.16,.7,d1*1.2,C.or,3);
      g.box(0,h*.40,-d0/2+.03,6.4,h*.28,.5,C.gres,4);g.box(0,h*.40+.2,-d0/2+.04,6.0,.5,.55,C.or,3);g.box(0,h*.40+h*.28-.7,-d0/2+.04,6.0,.5,.55,C.lapis,3);
      for(const tx of [-1,1]){g.tube([tx*3.6,.5,-d0/2-.4],[tx*3.6,h*.98,-d0/2-.4],.32,.26,6,C.noir,0);g.sph(tx*3.6,h*.98+.3,-d0/2-.4,.42,.42,.42,3,6,C.or,3);dnFlag(g,tx*3.6+.3,h*.98-3.4,-d0/2-.4,8.5,3.4,[C.terre,C.or,C.azur,C.or],8);}g.pop();}
    g.box(0,h*.66,0,gap+3,5,d1*1.05,C.gres,4);g.box(0,h*.66+4.7,0,gap+3.6,1.4,d1*1.2,C.gres2,1);g.box(0,h*.66+.3,-d0/2+.5,gap+.5,.5,.3,C.or,3);g.box(0,0,-d0/2-1.5,gap+6,.6,3,C.gres2,1,1);return g.fin();},
  // LE BLOC : un cube posé (centre en x et z, de 0 à 1) — assises de pierre, teinté à la pose ; la MAISON de terre en est faite
  bloc:function(){const g=dnKit(5);g.box(0,0,0,1,1,1,[1,1,1],1,1);return g.fin();},
  blocPlein:function(){const g=dnKit(6);g.box(0,0,0,1,1,1,[1,1,1],0,1);return g.fin();}
  ,
  // LE TAMBOUR (un morceau de colonne tombé : rayon 1,15, haut 1) et LA TÊTE (un fragment de colosse : nemès de lapis, visage de pierre lisse, uræus d'or ; haut ~ 1)
  tambour:function(){const g=dnKit(7),C=DN_COL;g.cyl(0,0,0,1.15,1.15,1,12,C.gres,1,0,1);g.cyl(0,.98,0,1.0,1.0,.06,12,C.gres2,1);return g.fin();},
  tete:function(){const g=dnKit(9),C=DN_COL,cre=[.95,.84,.66]; // LA TÊTE d'un colosse tombé (haut ~ 1,3, regarde +z) : un dôme de nemès à bandes lapis/or, un visage ovoïde de pierre lisse (nez, yeux de khôl, bouche), l'uræus d'or — tout lisse (matière 0), les assises ne vont pas aux courbes
    const R=.66;for(let k=0;k<7;k++){const y0=.02+k*.16,y1=y0+.16,r=y=>R*Math.sqrt(Math.max(.03,1-Math.pow((y-.62)/.74,2)));g.lathe(0,-.08,[[r(y0),y0],[r(y1),y1]],14,k&1?C.or:C.lapis,0);}
    g.sph(0,.58,.40,.40,.54,.30,5,12,cre,0);                                                                                       // le visage
    g.frus(0,.44,.66,.12,.16,.06,.07,.30,cre,0);                                                                                    // le nez
    g.box(-.19,.70,.66,.20,.07,.06,C.noir,0);g.box(.19,.70,.66,.20,.07,.06,C.noir,0);g.box(0,.26,.64,.26,.05,.06,C.noir,0);         // les yeux, la bouche
    g.frus(0,.98,.62,.10,.08,.04,.04,.22,C.or,3);                                                                                   // l'uræus
    return g.fin();}
  ,
  // LE VAUTOUR (envergure 6,6, vers +z) : corps, cou, tête nue rose, queue, deux ailes arquées à longues rémiges écartées — il plane (aucun battement), les ailes un peu relevées
  vautour:function(){const g=dnKit(91),nr=[.20,.15,.12],br=[.34,.26,.20],pl=[.52,.42,.32],ro=[.74,.40,.36],bk=[.10,.08,.07];
    g.sph(0,0,.12,.20,.17,.72,5,8,nr,0);g.tube([0,.06,.72],[0,.15,1.0],.085,.06,6,br,0);g.sph(0,.17,1.07,.075,.065,.11,4,6,ro,0);g.frus(0,.15,1.16,.05,.04,.02,.015,.10,bk,0,0,0);
    g.quad([-.18,0,-.45],[.18,0,-.45],[.13,.01,-1.05],[-.13,.01,-1.05],br,0);
    for(const sd of [-1,1]){const W=[[sd*.14,.04,.38],[sd*1.5,.28,.52],[sd*2.65,.36,.22],[sd*3.25,.18,-.12],[sd*1.7,.20,-.45],[sd*.14,.02,-.30]];
      g.tri(W[0],W[1],W[5],nr,0,.06);g.tri(W[1],W[4],W[5],br,0,.06);g.tri(W[1],W[2],W[4],nr,0,.06);g.tri(W[2],W[3],W[4],pl,0,.06);
      for(let k=0;k<5;k++){const z=.26-k*.09,x0=sd*(2.62+k*.02),x1=sd*(3.55+.07*(k&1)),y9=.34-k*.06;g.tri([x0,y9,z],[x1,y9-.10,z-.04],[x0,y9,z-.09],k&1?nr:br,0,.05);}}return g.fin();}
};
function dnMod(nom){if(!DN.kit)DN.kit={};if(!DN.kit[nom])DN.kit[nom]=DN_MOD[nom]();return DN.kit[nom];}
/* LA GALERIE (banc) : tous les modèles (ou la liste `noms`) posés en rang sur le sable, à 150 m de la route à l'abscisse `s`, et la caméra devant eux — pour juger la forme et la matière */
const DN_ECH={brasero:3,papyrus:2,lotus:2,felouque:12,sphinx:40,colosse:30,pharaon:30,chameau:12,palmier:18,pyrGradins:30,pyrLisse:30,pyrDegres:30,pyrGiza:30,pyrCap:30,pyrRouge:30,tete:8,tambour:5,vautour:14,bloc:6,blocPlein:6}; // la taille d'affichage des modèles unitaires (m) — la galerie seulement
function dnGalerie(s,noms,cap,haut,recul){
  if(!DN.on||!DN.S)return 'pas de dunes';const M9=dnMats(),S=DN.S,i=Math.max(0,Math.min(S.n-1,Math.round((s||300)/S.ds)));
  if(DN.gal){scene.remove(DN.gal);DN.gal.traverse(function(o){if(o.geometry)o.geometry.dispose();});}
  const grp=new THREE.Group(),nm=noms&&noms.length?noms:Object.keys(DN_MOD),tx=S.tx[i],tz=S.tz[i],lx=-tz,lz=tx,bx=S.x[i]+lx*150,bz=S.z[i]+lz*150,out=[];let off=0,ymax=-1e9;
  const tot=nm.map(function(n){const g=dnMod(n),ec=DN_ECH[n]||1;g.computeBoundingBox();return Math.max(g.boundingBox.max.x-g.boundingBox.min.x,g.boundingBox.max.z-g.boundingBox.min.z)*ec+12;}).reduce(function(a,b){return a+b;},0);
  for(let u=-60;u<=tot+60;u+=10)for(let w=-120;w<=120;w+=20)ymax=Math.max(ymax,dnHauteur(bx+tx*u+lx*w,bz+tz*u+lz*w));
  const y0=ymax+6; // un plateau plat de sable, posé au-dessus du relief : on juge les formes et la matière sous la lumière du jeu, sans le sable autour
  const pg=dnGeo();{const R=Math.max(200,tot);const A=[bx-tx*60-lx*R,y0,bz-tz*60-lz*R],B=[bx-tx*60+lx*R,y0,bz-tz*60+lz*R],Cc=[bx+tx*(tot+R)+lx*R,y0,bz+tz*(tot+R)+lz*R],D=[bx+tx*(tot+R)-lx*R,y0,bz+tz*(tot+R)-lz*R];pg.quad(A,B,Cc,D,[.96,.80,.52]);}
  const gm=pg.fin();grp.add(Object.assign(new THREE.Mesh(gm,M9.t),{frustumCulled:false}));
  for(const n of nm){const g=dnMod(n),ec=DN_ECH[n]||1;g.computeBoundingBox();const bb=g.boundingBox,w=(bb.max.x-bb.min.x)*ec,d=(bb.max.z-bb.min.z)*ec,w9=Math.max(w,d)+12;off+=w9/2;
    const x=bx+tx*off,z=bz+tz*off,me=new THREE.Mesh(g,M9.t);me.position.set(x,y0,z);me.scale.setScalar(ec);me.frustumCulled=false;me.matrixAutoUpdate=false;me.updateMatrix();grp.add(me);out.push({n:n,x:Math.round(x),y:Math.round(y0),z:Math.round(z),w:Math.round(w9)});off+=w9/2;}
  scene.add(grp);grp.updateMatrixWorld(true);DN.gal=grp;
  const mx=bx+tx*off/2,mz=bz+tz*off/2,R=recul==null?Math.max(120,off*.9):recul;
  return {modeles:out,largeur:Math.round(off),y:Math.round(y0),centre:[Math.round(mx),Math.round(y0),Math.round(mz)],oeil:[Math.round(mx-lx*R),Math.round(y0+(haut==null?14:haut)),Math.round(mz-lz*R)],tangente:[+tx.toFixed(3),+tz.toFixed(3)],lateral:[+lx.toFixed(3),+lz.toFixed(3)]};}
