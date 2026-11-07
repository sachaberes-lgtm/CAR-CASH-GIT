/* ===== LES DÉCORS DES DUNES, REFAITS (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt pour voir le niveau que j'attends ») =====
   LA BOÎTE À OUTILS (`dnKit`) : un constructeur à PILE DE TRANSFORMATIONS (déplacer, tourner, mettre à l'échelle, puis poser des boîtes, des troncs de pyramide, des cylindres et surfaces
   de révolution LISSES, des sphères aplaties, des tubes), des normales explicites (plates sur la pierre, lisses sur les fûts), une teinte par face (un peu bruitée : jamais deux faces
   pareilles) et une MATIÈRE par sommet (aK : 0 peint · 1 assises de pierre · 2 roche · 3 or · 4 libre). Les modèles sont cachés dans DN.kit (une fois par session, comme DN.geos).
   Tout est dessiné par la matière des décors (DN_AFS) : la pierre y est en ASSISES (rangées, joints décalés, taille qui suit la distance).
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
      const bout=(r,o,kk)=>{const cc=Array.isArray(col[0])?col[0]:col,f=jf(.03);for(let c=0;c<Cn;c++){const c2=(c+1)%Cn;tri(cen[r],Pp[r][c],Pp[r][c2],cc,kk||0,f,o);}};
      if(cap&1)bout(0,cen[1],Array.isArray(k)?k[0]:k);if(cap&2)bout(R-1,cen[R-2],Array.isArray(k)?k[k.length-1]:k);},
    fin:()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
      g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.computeBoundingSphere();return g;},
    n:()=>P.length/3
  };
  return K9;}
/* LE CUISEUR DES DÉCORS (celui du canyon, avec les normales et la matière) : des géométries posées par une matrice, fondues en UNE (un seul appel de dessin) — te : teinte facultative [r, g, b] */
function dnCuiseur(){let cap=1<<15,n=0,P=new Float32Array(cap*3),Nm=new Float32Array(cap*3),C=new Float32Array(cap*3),K=new Float32Array(cap);const m3=new THREE.Matrix3(); // (des tableaux typés qui grandissent par doublement : 50 000 sommets en ~3 ms, sans un seul objet alloué par sommet)
  const grow=need=>{if(n+need<=cap)return;while(n+need>cap)cap*=2;const g=(a,m)=>{const b=new Float32Array(cap*m);b.set(a.subarray(0,n*m));return b;};P=g(P,3);Nm=g(Nm,3);C=g(C,3);K=g(K,1);};
  return {ajoute:function(g,mt,te){if(DN.cuisJ)DN.cuisJ.push({p:g.attributes.position.array,e:Float32Array.from(mt.elements)}); /* (2026-11-07) le journal des poses : dnAuditDecor */const cnt=g.attributes.position.count,p=g.attributes.position.array,c=g.attributes.color.array,nn=g.attributes.normal.array,k=g.attributes.aK?g.attributes.aK.array:null,r=te?te[0]:1,gg=te?te[1]:1,b=te?te[2]:1,e=mt.elements;m3.getNormalMatrix(mt);const f=m3.elements;grow(cnt);
      for(let j=0;j<cnt;j++){const o=(n+j)*3,j3=j*3,x=p[j3],y=p[j3+1],z=p[j3+2],nx=nn[j3],ny=nn[j3+1],nz=nn[j3+2];
        P[o]=e[0]*x+e[4]*y+e[8]*z+e[12];P[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13];P[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
        const X=f[0]*nx+f[3]*ny+f[6]*nz,Y=f[1]*nx+f[4]*ny+f[7]*nz,Z=f[2]*nx+f[5]*ny+f[8]*nz,l=1/(Math.sqrt(X*X+Y*Y+Z*Z)||1);Nm[o]=X*l;Nm[o+1]=Y*l;Nm[o+2]=Z*l;
        C[o]=c[j3]*r;C[o+1]=c[j3+1]*gg;C[o+2]=c[j3+2]*b;K[n+j]=k?k[j]:0;}
      n+=cnt;},
    n:function(){return n;},
    fin:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P.slice(0,n*3),3));g.setAttribute('normal',new THREE.BufferAttribute(Nm.slice(0,n*3),3));g.setAttribute('color',new THREE.BufferAttribute(C.slice(0,n*3),3));
      g.setAttribute('aK',new THREE.BufferAttribute(K.slice(0,n),1));g.computeBoundingSphere();return g;}};}
 /* LA PALETTE DE LA DA (ARRAKIS) : le grès, le granit, la terre cuite, la rouille, l'os ; plus de lapis ni d'or précieux */
const DN_COL={gres:[.95,.83,.66],gres2:[.87,.71,.53],cre:[.98,.92,.80],lapis:[.18,.32,.66],azur:[.26,.48,.88],granit:[.72,.49,.45],or:[1,.80,.34],terre:[.74,.38,.24],turq:[.22,.70,.70],noir:[.12,.10,.10],sable:[.96,.78,.50],os:[.96,.93,.84]};
/* LES MODÈLES (hauteur et largeurs en mètres, à poser tels quels ou à l'échelle UNIFORME) — `dnMod(nom)` rend la géométrie (cachée) */
const DN_MOD={
  // LE BRASERO (haut 1) : le pied de pierre, la vasque d'or, la flamme (matière 22 : elle s'allume de l'intérieur — la nuit, c'est elle qui éclaire l'allée)
  brasero:function(){const g=dnKit(103),C=DN_COL;g.cyl(0,0,0,.34,.26,.05,10,C.gres2,1,0,1);g.cyl(0,.05,0,.14,.12,.62,8,C.gres,1,0,0);g.lathe(0,0,[[.10,.66],[.26,.76],[.34,.98],[.30,1.0]],10,C.or,3);
    g.cyl(0,.90,0,.22,0,.55,7,[1,.50,.08],22);g.cyl(0,.92,0,.15,0,.78,6,[1,.80,.22],22);return g.fin();},
  monolitheCasse:function(){const g=dnKit(13),b=4,h=64,C=DN_COL;g.box(0,0,0,4.6*b,.7*b,4.6*b,C.gres2,1,1);g.box(0,.7*b,0,3.5*b,.6*b,3.5*b,C.gres,1);const y0=1.3*b,hs=h*.86-y0,w0=2*b,w1=1.58*b; // (2026-11-05, ARRAKIS) plus de glyphe ni d'or : le monolithe cassé n'est que de la roche
    g.frus(0,y0,0,w0,w0,w1,w1,hs,C.granit,2,0,0,0,.03);for(const f of [.10,.34,.58,.82]){const ww=w0+(w1-w0)*f;g.frus(0,y0+hs*f,0,ww*1.035,ww*1.035,ww*1.035,ww*1.035,h*.014,C.terre,2);}
    for(let k=0;k<5;k++){const a=k/5*6.28319,x=Math.cos(a)*w1*.3,z=Math.sin(a)*w1*.3;g.frus(x,y0+hs-1,z,w1*.42,w1*.42,w1*.2,w1*.2,2+((k*7)%3),C.granit,2);}return g.fin();},
  // LE BLOC : un cube posé (centre en x et z, de 0 à 1) — assises de pierre, teinté à la pose ; la MAISON de terre en est faite
  bloc:function(){const g=dnKit(5);g.box(0,0,0,1,1,1,[1,1,1],1,1);return g.fin();},
  blocPlein:function(){const g=dnKit(6);g.box(0,0,0,1,1,1,[1,1,1],0,1);return g.fin();}
};
/* ===== L'AUDIT DU DÉCOR CUIT (2026-11-07, Sacha : « génération aléatoire parfaite ») =====
   Tout le décor des dunes est CUIT dans une géométrie (dnCuiseur) : le banc n'en voit qu'une boîte immense. Le cuiseur tient donc un JOURNAL (DN.cuisJ, rempli par dnMonumentsTiresG :
   chaque pose = le tampon de positions du modèle + sa matrice) et `dbgDunes('decor')` relit chaque pose, sommet par sommet (et le centre de chaque triangle) :
   · `route` : un point du décor dans le COULOIR de conduite (à moins d'une demi-largeur + 1 m de l'axe, de 0,3 à 7 m au-dessus de la dalle) — un décor planté dans la route ;
   · `flotte` : le PIED (les sommets du bas : 12 % de la hauteur) au-dessus du sable de plus de 0,5 m — un décor qui flotte ;
   les instances du groupe des dunes (buttes, diables) passent au même crible. Lecture seule : rien ne bouge. `dbgDunes('decor', 1)` = toutes les poses fautives (sinon les 12 pires de chaque sorte). */
function dnAuditDecor(tout){
  if(!DN.on||!DN.S)return 'pas de dunes';const J=DN.cuisJ||[],noms=new Map(),o9={},RH9=ROAD_HALF,cell=20,grille=new Map(),kc=(x,z)=>Math.floor(x/cell)*100003+Math.floor(z/cell);
  for(const n in (DN.kit||{}))noms.set(DN.kit[n].attributes.position.array,n);
  for(let i=0;i<NP;i++){if(TROU&&TROU[i])continue;const k=kc(pts[i].x,pts[i].z);let c=grille.get(k);if(!c)grille.set(k,c=[]);c.push(i);}
  const dsR=L/Math.max(1,NP-1),R={poses:J.length,route:[],flotte:[],parType:{}};
  const proche=(x,y,z)=>{let bi=-1,bd=1e18;const cx=Math.floor(x/cell),cz=Math.floor(z/cell);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=grille.get((cx+a)*100003+cz+b);if(!c)continue;for(const i of c){const dx=pts[i].x-x,dz=pts[i].z-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i;}}}return bi;};
  const crible=(nom,pa,e,moi)=>{const T9=R.parType[nom]||(R.parType[nom]={n:0,route:0,flotte:0,flotteMax:0});T9.n++;const nv=pa.length/3,W=new Float32Array(pa.length);let y0=1e9,y1=-1e9,cx=0,cz=0;
    for(let j=0;j<nv;j++){const x=pa[j*3],y=pa[j*3+1],z=pa[j*3+2],X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];W[j*3]=X;W[j*3+1]=Y;W[j*3+2]=Z;if(Y<y0)y0=Y;if(Y>y1)y1=Y;cx+=X;cz+=Z;}
    cx/=nv;cz/=nv;let hit=null;const teste=(X,Y,Z)=>{const i=proche(X,Y,Z);if(i<0)return;const p=pts[i],dx=X-p.x,dy=Y-p.y,dz=Z-p.z,lt=dx*B[i].x+dy*B[i].y+dz*B[i].z,al=dx*T[i].x+dy*T[i].y+dz*T[i].z,up=dx*Nn[i].x+dy*Nn[i].y+dz*Nn[i].z;
      if(Math.abs(al)<2&&Math.abs(lt)<RH9+1&&up>.3&&up<7&&(!hit||up<hit.up))hit={s:Math.round(i*dsR),lat:+lt.toFixed(1),up:+up.toFixed(1)};};
    for(let j=0;j<nv;j++)teste(W[j*3],W[j*3+1],W[j*3+2]);
    for(let j=0;j+2<nv;j+=3)teste((W[j*3]+W[j*3+3]+W[j*3+6])/3,(W[j*3+1]+W[j*3+4]+W[j*3+7])/3,(W[j*3+2]+W[j*3+5]+W[j*3+8])/3);
    const pied=y0+Math.max(.3,(y1-y0)*.12);let fl=-1e9,fx=0,fz=0,fy=0;const PJ=[];for(let j=0;j<nv;j++)if(W[j*3+1]<=pied)PJ.push(j); /* un sommet du pied ne « flotte » que s'il est le BAS de sa colonne : le haut d'un socle dont la face descend dans le sable n'est pas un vide */
    for(const j of PJ){let dessous=false;for(const k of PJ){if(W[k*3+1]<W[j*3+1]-.3&&Math.abs(W[k*3]-W[j*3])<1.5&&Math.abs(W[k*3+2]-W[j*3+2])<1.5){dessous=true;break;}}if(dessous)continue;if(moi!=null&&porte(W[j*3],W[j*3+1],W[j*3+2],moi,y0))continue;const g=dnHauteur(W[j*3],W[j*3+2],o9),f=W[j*3+1]-g;if(f>fl){fl=f;fx=W[j*3];fz=W[j*3+2];fy=W[j*3+1];}}
    const ou={nom:nom,x:Math.round(cx),z:Math.round(cz),h:Math.round(y1-y0),y0:+y0.toFixed(1),gC:+dnHauteur(cx,cz,o9).toFixed(1)};
    if(hit){T9.route++;R.route.push(Object.assign(ou,hit));}
    if(fl>.5){T9.flotte++;let bi=0,bd=1e18;for(let k=0;k<NP;k+=2){const dx=pts[k].x-fx,dz=pts[k].z-fz,d=dx*dx+dz*dz;if(d<bd){bd=d;bi=k;}}R.flotte.push(Object.assign({},ou,{fl:+fl.toFixed(1),s:Math.round(bi*dsR),d:Math.round(Math.sqrt(bd)),pied:[Math.round(fx),+fy.toFixed(1),Math.round(fz)]}));}if(fl>T9.flotteMax)T9.flotteMax=+fl.toFixed(1);};
  const BX=[];for(const q of J){const pa=q.p,e=q.e;let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9,c0=1e9,c1=-1e9;for(let j=0;j<pa.length;j+=3){const x=pa[j],y=pa[j+1],z=pa[j+2],X=e[0]*x+e[4]*y+e[8]*z+e[12],Y=e[1]*x+e[5]*y+e[9]*z+e[13],Z=e[2]*x+e[6]*y+e[10]*z+e[14];if(X<a0)a0=X;if(X>a1)a1=X;if(Y<b0)b0=Y;if(Y>b1)b1=Y;if(Z<c0)c0=Z;if(Z>c1)c1=Z;}BX.push([a0,a1,b0,b1,c0,c1]);}
  const porte=(X,Y,Z,moi,y0)=>{for(let k=0;k<BX.length;k++){if(k===moi)continue;const b=BX[k];const tx=.2+.06*(b[1]-b[0]),tz=.2+.06*(b[5]-b[4]);if(X>=b[0]-tx&&X<=b[1]+tx&&Z>=b[4]-tz&&Z<=b[5]+tz&&Y>=b[2]&&b[3]+.6>=y0)return true;}return false;}; /* (un pied posé sur une autre pose : le podium sous un monolithe, la dalle sous une maison) */
  if(tout&&tout.pres){const P=tout.pres,o=[];BX.forEach(function(b,k){const cx=(b[0]+b[1])/2,cz=(b[4]+b[5])/2;if(Math.hypot(cx-P[0],cz-P[1])<(P[2]||30))o.push({k:k,nom:noms.get(J[k].p)||'?',x:[+b[0].toFixed(1),+b[1].toFixed(1)],y:[+b[2].toFixed(1),+b[3].toFixed(1)],z:[+b[4].toFixed(1),+b[5].toFixed(1)],gC:+dnHauteur(cx,cz,o9).toFixed(1)});});return o;} /* (banc) les poses autour de [x, z, rayon] : leurs boîtes */
  let jq=0;for(const q of J)crible(noms.get(q.p)||(q.p.length<2000?'talus/autre':'autre'),q.p,q.e,jq++);
  if(DN.grp)for(const im of DN.grp.children){if(!im.isInstancedMesh||im.name==='dunes décor tiré'||im.name==='dunes ruines ensablées')continue;const pa=im.geometry.attributes.position.array,mt=new THREE.Matrix4();
    for(let i=0;i<im.count;i++){im.getMatrixAt(i,mt);mt.premultiply(im.matrixWorld);crible(im.name,pa,mt.elements);}}
  R.nRoute=R.route.length;R.nFlotte=R.flotte.length;R.flotte.sort((a,b)=>b.fl-a.fl);
  if(!tout){R.route=R.route.slice(0,12);R.flotte=R.flotte.slice(0,12);}return R;}
function dnMod(nom){if(!DN.kit)DN.kit={};if(!DN.kit[nom])DN.kit[nom]=DN_MOD[nom]();return DN.kit[nom];}
/* LA GALERIE (banc) : tous les modèles (ou la liste `noms`) posés en rang sur le sable, à 150 m de la route à l'abscisse `s`, et la caméra devant eux — pour juger la forme et la matière */
const DN_ECH={brasero:3,bloc:6,blocPlein:6}; // la taille d'affichage des modèles unitaires (m) — la galerie seulement
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
