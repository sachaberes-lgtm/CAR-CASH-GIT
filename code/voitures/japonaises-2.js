/* LES FACETTES PAR QUADRILATÈRE (affinement, 19/10) : un loft pose chaque case en DEUX triangles ; sur une tôle qui se tord (une aile arrière
   qui rentre en même temps qu'elle monte), ces deux triangles ne sont pas dans le même plan et prennent deux lumières → un DAMIER clair/sombre
   (relevé sur LA LAME, LA FIDÈLE, LA BÊTE). `japQuads(G)` reconnaît les paires d'une même case (l'ordre du loft : (a,b,c)(a,c,d) et leur miroir
   (-a,-c,-b)(-a,-d,-c)) et leur donne UNE normale, la moyenne : chaque case est UNE facette plate — le style poly, sans damier. */
function japQuads(G){const p=G.attributes.position.array,n=G.attributes.normal.array,eq=(i,j)=>p[i]===p[j]&&p[i+1]===p[j+1]&&p[i+2]===p[j+2];
  // 1) les paires d'une même case → une normale par case ; on garde, pour chaque case, ses deux arêtes TRANSVERSALES (à z constant)
  const Q=[],E=new Map(),key=(i,j)=>{const a=Math.round(p[i]*1e4)+','+Math.round(p[i+1]*1e4)+','+Math.round(p[i+2]*1e4),b=Math.round(p[j]*1e4)+','+Math.round(p[j+1]*1e4)+','+Math.round(p[j+2]*1e4);return a<b?a+'|'+b:b+'|'+a;};
  for(let t=0;t+18<=p.length;){const u=t+9;let V=null;
    if(eq(t,u)&&eq(t+6,u+3))V={a:[t,u],b:[t+3],c:[t+6,u+3],d:[u+6],e0:[t,t+3],e1:[t+6,u+6]};            // (a,b,c)(a,c,d)
    else if(eq(t,u)&&eq(t+3,u+6))V={a:[t,u],b:[t+6],c:[t+3,u+6],d:[u+3],e0:[t,t+6],e1:[t+3,u+3]};       // le miroir (a,c,b)(a,d,c)
    if(V&&p[V.e0[0]+2]===p[V.e0[1]+2]&&p[V.e1[0]+2]===p[V.e1[1]+2]){let x=0,y=0,z=0;for(const b of [t,u])for(let k=0;k<9;k+=3){x+=n[b+k];y+=n[b+k+1];z+=n[b+k+2];}
      const h=Math.hypot(x,y,z)||1;V.N=[x/h,y/h,z/h];V.k0=key(V.e0[0],V.e0[1]);V.k1=key(V.e1[0],V.e1[1]);
      for(const kk of [V.k0,V.k1]){let l=E.get(kk);if(!l)E.set(kk,l=[]);l.push(Q.length);}Q.push(V);t+=18;}
    else t+=9;}
  // 2) le long de la caisse, une case se fond dans sa voisine (même bande) sous 25° : la lumière glisse le long de la tôle, les arêtes restent
  const cs=Math.cos(25*Math.PI/180),voisin=(q,kk)=>{const N=Q[q].N,l=E.get(kk);let r=N;for(const o of l)if(o!==q){const M=Q[o].N,d=N[0]*M[0]+N[1]*M[1]+N[2]*M[2];
      if(d>=cs){const x=N[0]+M[0],y=N[1]+M[1],z=N[2]+M[2],h=Math.hypot(x,y,z)||1;r=[x/h,y/h,z/h];}}return r;};
  const pose=(v,N)=>{n[v]=N[0];n[v+1]=N[1];n[v+2]=N[2];};
  for(let q=0;q<Q.length;q++){const V=Q[q],n0=voisin(q,V.k0),n1=voisin(q,V.k1);for(const v of V.a)pose(v,n0);for(const v of V.b)pose(v,n0);for(const v of V.c)pose(v,n1);for(const v of V.d)pose(v,n1);}
  G.attributes.normal.needsUpdate=true;return G;}
function japDecoupe(G,o){
  const pa=G.attributes.position.array,na=G.attributes.normal.array,Z=o.zones||{},LG=o.lignes||{},C=o.codes,CK=Object.keys(C);
  const cle=o.cleCache||'_tole';let C9=o.cache&&o.cache[cle];
  const FV=japFente(),FX=FV!=='A';
  if(!C9||C9.n!==pa.length||CK.some(k=>!C9.G[k])||(C9.fv||'A')!==FV||C9.q!==(o.quads!==false)){
    if(o.quads!==false&&!G.userData.quads){japQuads(G);G.userData.quads=1;}   // (affinement : une facette par case du loft, fondue le long de la caisse — seulement quand on découpe : le résultat est gardé)
    const ns=typeof o.ns==='function'?o.ns():(o.ns||na);   // (`ns` peut être une fonction : les normales lissées ne se calculent que si l'on découpe)
    const croise=(a,b,c,d,e,f,g,h)=>{const s=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
            return ((s(e,f,g,h,a,b)>0)!==(s(e,f,g,h,c,d)>0))&&((s(a,b,c,d,e,f)>0)!==(s(a,b,c,d,g,h)>0));},
          touche=(Pc,s)=>{const n=Pc.length,dedans=(x,y)=>{let sg=0;for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n],c=(r[0]-p[0])*(y-p[1])-(r[1]-p[1])*(x-p[0]);
              if(Math.abs(c)<1e-14)continue;const t=c>0?1:-1;if(!sg)sg=t;else if(t!==sg)return false;}return true;};
            if(dedans(s[0],s[1])||dedans(s[2],s[3]))return true;
            for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n];if(croise(p[0],p[1],r[0],r[1],s[0],s[1],s[2],s[3]))return true;}return false;},
          fend=(Pc,s)=>{const ax=s[0],ay=s[1],ex=s[2]-ax,ey=s[3]-ay,fv=Pc.map(p=>ex*(p[1]-ay)-ey*(p[0]-ax));let po=0,ne=0;
            for(const v of fv){if(v>1e-12)po++;else if(v<-1e-12)ne++;}if(!po||!ne)return null;
            const A=[],B=[],n=Pc.length;for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n],a=fv[i],b=fv[(i+1)%n];
              if(a>=-1e-12)A.push(p);if(a<=1e-12)B.push(p);
              if((a>1e-12&&b<-1e-12)||(a<-1e-12&&b>1e-12)){const t=a/(a-b),m=p.map((x,j)=>x+(r[j]-x)*t);A.push(m);B.push(m);}}
            return [A,B];},
          bbP=P9=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P9){if(p[0]<u0)u0=p[0];if(p[0]>u1)u1=p[0];if(p[1]<v0)v0=p[1];if(p[1]>v1)v1=p[1];}return [u0,u1,v0,v1];},
          coupe9=(Pp0,segs)=>{let parts=[Pp0];const b=bbP(Pp0);for(const s of segs){if(s[5]<b[0]||s[4]>b[1]||s[7]<b[2]||s[6]>b[3])continue;const n2=[];
              for(const Pp of parts){const r=touche(Pp,s)?fend(Pp,s):null;if(r)n2.push(r[0],r[1]);else n2.push(Pp);}parts=n2;}return parts;},
          dansZ=(Z9,u,v)=>{let c=false;for(const s of Z9.sg)if((s[1]>v)!==(s[3]>v)&&u<(s[2]-s[0])*(v-s[1])/(s[3]-s[1])+s[0])c=!c;
            if(Z9.axe!==false&&Z9.bb[0]<1e-6&&u>=0){/* les bords sur l'axe : le miroir */}return c;},
          dBord=(Z9,u,v)=>{let d=1e9;for(const s of Z9.sg){const dx=s[2]-s[0],dy=s[3]-s[1],L2=dx*dx+dy*dy||1e-12,t=Math.max(0,Math.min(1,((u-s[0])*dx+(v-s[1])*dy)/L2));d=Math.min(d,Math.hypot(u-s[0]-t*dx,v-s[1]-t*dy));}return d;},
          loin=(L9,u,w)=>{const P9=L9.P;let bd=1e9,sg=1,du=0,dv=0;for(let i=0;i<P9.length-1;i++){const a=P9[i],b=P9[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1e-12,
              t=Math.max(0,Math.min(1,((u-a[0])*dx+(w-a[1])*dy)/l2)),ex=u-a[0]-t*dx,ey=w-a[1]-t*dy,d=Math.hypot(ex,ey);
              if(d<bd){bd=d;sg=(dx*ey-dy*ex)>=0?1:-1;const l=Math.sqrt(l2);du=-dy/l;dv=dx/l;}}return [bd,sg,du,dv];};
    const OUT={},COP={};for(const k of CK)OUT[k]={P:[],N:[],D:[]};
    const garde=i=>{const q=OUT.p;for(let j=0;j<9;j++){q.P.push(pa[i+j]);q.N.push(na[i+j]);}if(FX)q.D.push(9,9,9);};
    for(let i=0;i<pa.length;i+=9){
      const cx=(pa[i]+pa[i+3]+pa[i+6])/3,cy=(pa[i+1]+pa[i+4]+pa[i+7])/3,cz=(pa[i+2]+pa[i+5]+pa[i+8])/3;
      const ux=pa[i+3]-pa[i],uy=pa[i+4]-pa[i+1],uz=pa[i+5]-pa[i+2],wx=pa[i+6]-pa[i],wy=pa[i+7]-pa[i+1],wz=pa[i+8]-pa[i+2];
      let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);
      const v=(o.vue&&o.vue(cx,cy,cz,ax,ay,az,nx,ny,nz))||(ax>=ay*.75&&ax>=az?'cote':ay>=az?'dessus':nz>0?'face':'dos');
      const P3=q=>[q[0]*pa[i]+q[1]*pa[i+3]+q[2]*pa[i+6],q[0]*pa[i+1]+q[1]*pa[i+4]+q[2]*pa[i+7],q[0]*pa[i+2]+q[1]*pa[i+5]+q[2]*pa[i+8]],
            UV=(w,P)=>w==='cote'?[P[2],P[1]]:w==='dessus'?[P[2],Math.abs(P[0])]:[Math.abs(P[0]),P[1]],
            enV=(w,Pp)=>Pp.map(q=>{const u=UV(w,P3(q));return [u[0],u[1],q[0],q[1],q[2]];}),deV=Pp=>Pp.map(q=>[q[2],q[3],q[4]]),
            bbV=w=>bbP(enV(w,[[1,0,0],[0,1,0],[0,0,1]])),hors=(bq,Z9)=>bq[1]<Z9.bb[0]||bq[0]>Z9.bb[1]||bq[3]<Z9.bb[2]||bq[2]>Z9.bb[3];
      const b=bbV(v),zon=(Z[v]||[]).filter(Z9=>!hors(b,Z9)&&(!Z9.gate||Z9.gate(cx,cy,cz,nx,ny,nz)));
      const AL={cote:ax,dessus:Math.max(0,ny),face:Math.max(0,nz),dos:Math.max(0,-nz)},lgn=[];
      if(!(o.sansLignes&&o.sansLignes(cx,cy,cz)))for(const w in AL){if(AL[w]<.5||!LG[w])continue;const bw=bbV(w);
        for(const L9 of LG[w])if(!hors(bw,L9)&&(L9.r.g||AL[w]>=.85)&&(!L9.gate||L9.gate(cx,cy,cz,nx,ny,nz)))lgn.push([w,L9]);}
      if(!zon.length&&!lgn.length){garde(i);continue;}
      let pcs=[[[1,0,0],[0,1,0],[0,0,1]]];
      for(const Z9 of zon){const n2=[];for(const Pp of pcs)for(const q of coupe9(enV(v,Pp),Z9.sg))n2.push(deV(q));pcs=n2;}
      for(const [w,L9] of lgn){const sg9=FX&&L9.r.g?L9.segs.concat(L9.segW||[]):L9.segs,n2=[];for(const Pp of pcs)for(const q of coupe9(enV(w,Pp),sg9))n2.push(deV(q));pcs=n2;}
      const vers3=(w,du,dv)=>w==='cote'?[0,dv,du]:w==='dessus'?[dv,0,du]:[du,dv,0];
      for(const Pq of pcs){const Pp=enV(v,Pq);let su=0,sv=0;for(const p of Pp){su+=p[0];sv+=p[1];}su/=Pp.length;sv/=Pp.length;
        let k='p',Zk=null;for(const Z9 of zon)if(dansZ(Z9,su,sv)){k=Z9.k;Zk=Z9;}
        const g3=[0,0,0];for(const q of Pq){g3[0]+=q[0]/Pq.length;g3[1]+=q[1]/Pq.length;g3[2]+=q[2]/Pq.length;}
        let L9=null,Lw='',dc=1e9,sgc=1,rc=null;if(k==='p')for(const [w,Lq] of lgn){const c=UV(w,P3(g3)),r=loin(Lq,c[0],c[1]);if(r[0]<Lq.r.w&&r[0]<dc){dc=r[0];sgc=r[1];L9=Lq;Lw=w;rc=r;}}
        const gap=L9&&L9.r.g&&dc<L9.r.g,code=k==='p'?(gap?'gap':'p'):k,q=OUT[code]||OUT.p,lis=C[code]&&C[code].lisse,nn=lis?ns:na;
        // le CREUX d'une zone (une ouverture : la bouche, une entrée d'air) : la tôle s'enfonce le long de la normale lissée, nul sur le bord
        const cr=Zk&&Zk.creux?Zk:null,cp=Zk&&Zk.copie?(COP[Zk.copie]||(COP[Zk.copie]={P:[],N:[]})):null;   // `copie` : la tôle d'origine du morceau, gardée à part (le capot d'un phare escamotable)
        for(let t=1;t<Pp.length-1;t++){const tr=[Pp[0],Pp[t],Pp[t+1]];
          if(Math.abs((tr[1][0]-tr[0][0])*(tr[2][1]-tr[0][1])-(tr[1][1]-tr[0][1])*(tr[2][0]-tr[0][0]))<1e-12)continue;
          for(const qq of tr){const l0=qq[2],l1=qq[3],l2=qq[4];
            let px=l0*pa[i]+l1*pa[i+3]+l2*pa[i+6],py=l0*pa[i+1]+l1*pa[i+4]+l2*pa[i+7],pz=l0*pa[i+2]+l1*pa[i+5]+l2*pa[i+8];
            if(cp){cp.P.push(px,py,pz);cp.N.push(na[i],na[i+1],na[i+2]);}
            if(cr){const d=Math.min(1,dBord(cr,qq[0],qq[1])/.008)*cr.creux;let sx=l0*ns[i]+l1*ns[i+3]+l2*ns[i+6],sy=l0*ns[i+1]+l1*ns[i+4]+l2*ns[i+7],sz=l0*ns[i+2]+l1*ns[i+5]+l2*ns[i+8];
              const sh=Math.hypot(sx,sy,sz)||1;px-=sx/sh*d;py-=sy/sh*d;pz-=sz/sh*d;}
            q.P.push(px,py,pz);
            if(FX){let dj=9;if(L9&&L9.r.g){const c9=UV(Lw,[px,py,pz]),r9=loin(L9,c9[0],c9[1]);dj=r9[0]*r9[1];}q.D.push(dj);}   // (la fente : la distance signée au joint, sommet par sommet)
            let x=l0*nn[i]+l1*nn[i+3]+l2*nn[i+6],y=l0*nn[i+1]+l1*nn[i+4]+l2*nn[i+7],z=l0*nn[i+2]+l1*nn[i+5]+l2*nn[i+8],h=Math.hypot(x,y,z)||1;x/=h;y/=h;z/=h;
            if(L9&&!gap){const r=rc,dd=r[0],R9=L9.r;
              const tl=R9.g?-R9.k*Math.max(0,1-(dd-R9.g)/(R9.w-R9.g)):R9.k*Math.max(0,1-dd/R9.w);
              if(tl){let A=vers3(Lw,r[2]*sgc,r[3]*sgc);const an=A[0]*x+A[1]*y+A[2]*z;A=[A[0]-an*x,A[1]-an*y,A[2]-an*z];const la=Math.hypot(A[0],A[1],A[2]);
                if(la>1e-6){x+=A[0]/la*tl;y+=A[1]/la*tl;z+=A[2]/la*tl;h=Math.hypot(x,y,z)||1;x/=h;y/=h;z/=h;}}}
            q.N.push(x,y,z);}}}}
    C9={n:pa.length,G:{},C:{},fv:FV,q:o.quads!==false};for(const k of CK)C9.G[k]={P:new Float32Array(OUT[k].P),N:new Float32Array(OUT[k].N),D:FX?new Float32Array(OUT[k].D):null};
    for(const k in COP)C9.C[k]={P:new Float32Array(COP[k].P),N:new Float32Array(COP[k].N)};
    if(o.cache)o.cache[cle]=C9;}
  // les couleurs (refaites à chaque construction : la peinture de la boutique peut changer) et les géométries, réunies par groupe de matière
  const col=new THREE.Color(),PAR={};
  for(const k of CK){const c=C9.G[k];if(!c.P.length)continue;const g=k==='p'||k==='gap'?(k==='p'?o.GP:(C.gap.g||o.GP)):C[k].g,Cc=new Float32Array(c.P.length);
    const FP=FX&&c.D&&(k==='p'||k==='gap'),gR=(C.gap&&C.gap.r)||.0035,T3=[0,0,0],FVo=fenteVar();
    for(let i=0;i<c.P.length;i+=3){let r,gg,bb;if(FP){const t=i-i%9,q=o.colTri?o.colP((c.P[t+1]+c.P[t+4]+c.P[t+7])/3,(c.P[t]+c.P[t+3]+c.P[t+6])/3,(c.P[t+2]+c.P[t+5]+c.P[t+8])/3):o.colP(c.P[i+1]);
        const d=c.D[i/3];if(k==='gap'||Math.abs(d)<9)fenteRGB(q,k==='gap'?0:(d>0?Math.max(d,gR):Math.min(d,-gR)),gR,T3,FVo);else{T3[0]=q[0];T3[1]=q[1];T3[2]=q[2];}   // (LA FENTE, l'outil commun)
        r=T3[0];gg=T3[1];bb=T3[2];}
      else if(k==='p'){const t=i-i%9,q=o.colTri?o.colP((c.P[t+1]+c.P[t+4]+c.P[t+7])/3,(c.P[t]+c.P[t+3]+c.P[t+6])/3,(c.P[t+2]+c.P[t+5]+c.P[t+8])/3):o.colP(c.P[i+1]);r=q[0];gg=q[1];bb=q[2];}else{col.setHex(C[k].c);r=col.r;gg=col.g;bb=col.b;}Cc[i]=r;Cc[i+1]=gg;Cc[i+2]=bb;}
    const L=PAR[g]||(PAR[g]={P:[],N:[],C:[]});L.P.push(c.P);L.N.push(c.N);L.C.push(Cc);}
  const cat=A=>{let n=0;for(const a of A)n+=a.length;const r=new Float32Array(n);let o2=0;for(const a of A){r.set(a,o2);o2+=a.length;}return r;},out={};
  for(const k in (C9.C||{})){const c=C9.C[k],Cc=new Float32Array(c.P.length);for(let i=0;i<c.P.length;i+=3){const q=o.colP(c.P[i+1],c.P[i],c.P[i+2]);Cc[i]=q[0];Cc[i+1]=q[1];Cc[i+2]=q[2];}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(c.P.slice(),3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(c.N.slice(),3));geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));out['__'+k]=geo;}
  for(const g in PAR){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(cat(PAR[g].P),3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(cat(PAR[g].N),3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cat(PAR[g].C),3));out[g]=geo;}
  return out;}
// la couleur de la tôle à une hauteur : la recette de `lpKit` (peinture ou dégradé, fondu vertical)
function japColP(EP){const C=new THREE.Color();return y=>{C.setHex(EP.c);if(EP.grad&&typeof lpGrad==='function')lpGrad(EP.grad,y,C);
  const s=((EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0)?.80+.20*Math.max(0,Math.min(1,(y-.25)/1.0)):1;return [C.r*s,C.g*s,C.b*s];};}
// fusionne des géométries {g:geo} dans un dictionnaire de géométries (même groupe = une seule géométrie)
function japFusion(A,B){for(const g in B){if(!A[g]){A[g]=B[g];continue;}const a=A[g].attributes,b=B[g].attributes,geo=new THREE.BufferGeometry();
    for(const n of ['position','normal','color']){if(!a[n]||!b[n])continue;const r=new Float32Array(a[n].array.length+b[n].array.length);r.set(a[n].array);r.set(b[n].array,a[n].array.length);geo.setAttribute(n,new THREE.Float32BufferAttribute(r,3));}
    A[g].dispose();B[g].dispose();A[g]=geo;}return A;}
// un RUBAN autour d'un trait (une bande de LED, un liseré) : le contour à ±w/2 de la polyligne
function japRuban(P,w){const n=P.length,h=w/2,G=[],D=[];for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
    G.push([P[i][0]-dy/l*h,P[i][1]+dx/l*h]);D.push([P[i][0]+dy/l*h,P[i][1]-dx/l*h]);}return G.concat(D.reverse());}
// un contour mis à l'échelle autour de son centre (les cercles intérieurs d'un feu)
function japEchelle(P,k){let cx=0,cy=0;for(const p of P){cx+=p[0];cy+=p[1];}cx/=P.length;cy/=P.length;return P.map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k]);}
/* LA PRÉCHAUFFE (comme `perleTraits`) : la tôle de chaque japonaise découpée au plan une fois, pendant la préchauffe du menu (`chauffeDivers`) —
   le gabarit tourne dans un chantier muet (`K.muet` : il s'arrête après la tôle) et garde sa découpe sur sa fonction (`_tole`). Une caisse par appel. */
function japChauffe(){for(const n of ['mx5rf','mx5na','ae86','corolla','pikes']){const F=typeof SHAPES==='object'&&SHAPES[n];if(!F||F._tole)continue;
    const nA=(typeof BLING==='object'&&BLING&&BLING.anim)?BLING.anim.length:-1;
    try{F({kit:pal=>lpKit(typeof peintPal==='function'?peintPal(pal):pal),commit:kt=>{const gs=kt.done();for(const g in gs)gs[g].dispose();},mats:{},add:o=>o,muet:1});}catch(e){console.warn('japChauffe',n,e);}
    if(!F._tole)F._tole=1;   /* (27/10) un gabarit taillé à la main (la Lame, la Cerise…) ne pose jamais `_tole` : sans cette marque la préchauffe le rejouait à chaque appel et n'arrivait plus jamais à l'AE86, à la Corolla ni à la Pikes */
    if(nA>=0&&BLING.anim.length>nA)BLING.anim.length=nA;return true;}
  return false;}
/* LES PHARES ESCAMOTABLES DE LA MX-5 NA : quand ils se lèvent (`mode`, à choisir par Léo) — 'course' (levés en course, baissés au garage et au
   menu, un clin d'œil à l'arrivée au garage), 'nitro' (baissés, ils se lèvent à la nitro), 'toujours'. Console : dbgPhares(1|0|null, mode). */
var MX5PH={mode:'nitro',force:null}; // (2026-10-18, Léo, sur la planche : « B — à la nitro » : l'appel de phares)
window.dbgPhares=function(v,m){if(m)MX5PH.mode=m;MX5PH.force=v==null?null:+v;return MX5PH;};
/* ===== LA CERISE EN POLY (26/10, Léo : « aussi nette que La Honte et la Rosso : grosses facettes planes, détails posés, pas d'arrondi lissé ») =====
   Redessinée À LA MAIN comme la Rosso : UN loft de ~34 coupes à 10 points (le flanc presque droit, une ARÊTE de caractère à mi-hauteur
   qui monte en sourcil sur chaque roue, l'épaule qui roule en deux pans, puis le dessus : capot, baquet, housse de capote, malle), le nez
   ROND en trois pans, la poupe courte, les HANCHES gonflées au-dessus des roues, les passages de roue en OCTOGONE. Le reste est POSÉ :
   le pare-brise et son cadre, la bouche ovale qui sourit, les clignotants, les feux en trois cases, les rétros, les baquets, le volant.
   L'ÂME : les PHARES ESCAMOTABLES — deux capots de laque posés sur le capot, qui se lèvent sur leur charnière (`MX5PH`, `CAR_ACTION`).
   La jante « marguerite » d'origine, en huit pétales plats. `?cerise=plan` rend la caisse découpée au plan d'avant ; `?phares=1` les lève. */
/* LES CASES PLATES : le loft pose chaque case en deux triangles (a,b,c)(a,c,d) — et leur miroir (−a,−c,−b)(−a,−d,−c) ; sur une tôle qui se tord,
   les deux ne sont pas dans le même plan et prennent deux lumières (le DAMIER). Ici chaque paire reçoit UNE normale, la moyenne : une case = une facette. */
function mx5naCases(G){const p=G.attributes.position.array,n=G.attributes.normal.array,eq=(i,j)=>p[i]===p[j]&&p[i+1]===p[j+1]&&p[i+2]===p[j+2];
  for(let t=0;t+18<=p.length;){const u=t+9;if(eq(t,u)&&(eq(t+6,u+3)||eq(t+3,u+6))){let x=0,y=0,z=0;for(const b of [t,u]){x+=n[b];y+=n[b+1];z+=n[b+2];}
      const h=Math.hypot(x,y,z)||1;for(let v=t;v<t+18;v+=3){n[v]=x/h;n[v+1]=y/h;n[v+2]=z/h;}t+=18;}else t+=9;}
  G.attributes.normal.needsUpdate=true;return G;}
function mx5naPoly(K){
  const U=LPU,R=.289,ZF=1.165,ZR=-1.115,ZE=1.985,ZB=-1.985;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,lis=t=>t*t*(3-2*t);
  if(K.muet){if(typeof SHAPES==='object'&&SHAPES.mx5na)SHAPES.mx5na._tole={};return {};}   // (la préchauffe du menu : plus rien à découper)
  let FPH=null;try{if(/[?&]phares=1/.test(location.search))FPH=1;}catch(e){}   // (le banc des photos : `?phares=1` les montre levés)
  const PAL={p:{g:'p',c:0x8c0a14},k:{g:'m',c:0x121316},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x16202c},i:{g:'s',c:0x1d1e22},v:{g:'s',c:0x141417},
    s:{g:'s',c:0x2b2c31},t:{g:'s',c:0x6e4630},W:{g:'l',c:0xf4f7ff},L:{g:'l',c:0xe0141f},c:{g:'c',c:0xd4d8de},d:{g:'m',c:0x0e0f12},
    O:{g:'l',c:0xf08a12},q:{g:'g',c:0xaeb3bb},w:{g:'l',c:0xe8eaee},G:{g:'s',c:0x172029}};
  // ---- LES COTES (mètres) : la demi-largeur, le haut (capot, ceinture, pont de malle), le bas hors passages de roue, l'arête ----
  const XM=[[ZB,.56],[-1.955,.68],[-1.90,.76],[-1.80,.815],[-1.60,.842],[ZR,.862],[-.80,.84],[-.40,.818],[0,.812],[.40,.82],[ZF,.852],[1.40,.845],[1.60,.825],[1.74,.792],[1.86,.735],[1.94,.645],[ZE,.50]],
        YT=[[ZB,.765],[-1.955,.835],[-1.90,.866],[-1.80,.86],[-1.20,.85],[-.72,.822],[-.40,.805],[0,.80],[.30,.80],[.50,.795],[ZF,.738],[1.80,.612],[1.90,.568],[1.94,.537],[ZE,.478]],   // (le capot en DEUX pans plats, cassés sur l'essieu ; la malle d'un seul, qui se relève en canard au bout)
        YB=[[ZB,.30],[-1.955,.25],[-1.90,.215],[-1.80,.20],[-1.50,.19],[-.80,.17],[.80,.165],[1.50,.18],[1.80,.19],[1.90,.205],[1.94,.222],[ZE,.25]],
        YC=[[ZB,.52],[-1.60,.50],[-.80,.47],[.80,.46],[1.60,.475],[ZE,.42]],
        AR=[[0,.622],[.20,.585],[.29,.51],[.335,.38],[.35,.17]];   // le passage de roue : un OCTOGONE (quatre pans de chaque côté)
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z),yC=z=>L(YC,z);
  // les zones du dessus : capot (et l'auvent sous le pare-brise, ZD → ZW), baquet, housse de capote, malle ; YF le plancher
  const ZD=.30,ZW=.50,ZS=-.72,ZK=-1.20,YF=.36;
  const zone=z=>z>ZD?'capot':z>ZS?'hab':z>ZK?'capote':'malle';
  const S0=z=>{const xm=xM(z),y0=yB0(z),yb=U.arch(z,[ZF,ZR],AR,y0),yt=yT(z),kx=Math.min(1,xm/.62),B=Math.max(y0,yb),zo=zone(z),yc=Math.max(yC(z),B+.055);
    const s=[[0,yb],[xm-.13*kx,yb],[xm-.05*kx,Math.max(B+.03,Math.min(yc-.08,y0+.12))],   // le dessous, le bas de caisse rentré
      [xm,yc],                                                                         // L'ARÊTE (le plus large) : d'un bouclier à l'autre, en sourcil sur les roues
      [xm-.024*kx,yc+(yt-yc)*.58],[xm-.062*kx,yt-.032],[xm-.11*kx,yt]];                 // le flanc, puis l'épaule qui roule en deux pans
    for(let i=2;i<s.length;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]+.002);
    const y6=s[6][1];
    if(zo==='capot')s.push([Math.min(.64,xm-.175*kx),y6+.006],[Math.min(.32,xm*.42),y6+.018],[0,y6+.024]);   // la crête de l'aile, le capot à peine bombé (x fixes : des pans PLANS)
    else if(zo==='hab')s.push([xm-.165*kx,y6-.026],[xm-.20*kx,YF+.15],[0,YF]);        // le bord du baquet qui roule dedans, la contre-porte, le plancher
    else if(zo==='capote'){const u=cl((ZS-z)/(ZS-ZK),0,1),yo=y6+.012+.055*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.25)),.6);
      s.push([xm-.16*kx,y6-.004],[xm-.26*kx,yo],[0,yo+.008]);}                          // la capote repliée sous sa housse : une bosse noire
    else s.push([Math.min(.64,xm-.175*kx),y6+.004],[Math.min(.32,xm*.42),y6+.012],[0,y6+.016]);   // la malle
    return s;};
  const SM=new Map(),S=z=>{const k=Math.round(z*4000);let s=SM.get(k);if(!s){s=S0(k/4000);SM.set(k,s);}return s;};
  const zs0=[ZB,-1.955,-1.90,-1.80,ZK,ZK+.004,ZS-.004,ZS,-.40,-.05,ZD-.004,ZD,ZW,1.66,1.80,1.94,ZE];
  for(const w of [ZF,ZR])for(const d of [0,.20,.29,.335,.35])zs0.push(w-d,w+d);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.003);
  const peint=(j,z)=>{if(j<0)return 'p';if(j===0)return 'k';
    const zo=zone(z);
    if(j>=7){if(Math.abs(z-ZD+.002)<.003)return 'i';                     // la face de la planche de bord
      if(Math.abs(z-ZS+.002)<.003)return 'v';                             // le dos de la housse, vu du baquet
      if(zo==='hab')return j===7?'i':'s';                                  // la contre-porte, le plancher
      if(zo==='capote')return 'v';
      if(zo==='capot'&&z<ZW)return 'i';}                                   // l'auvent sous le pare-brise : la planche de bord
    return 'p';};
  const PL=K.kit(PAL);PL.loft(zs,S,peint);
  {const d0=PL.done;PL.done=()=>{const gs=d0();for(const g in gs)mx5naCases(gs[g]);return gs;};}   // chaque case du loft = UNE facette plate (pas de damier)
  K.commit(PL);
  // la tôle TELLE QU'ELLE EST : entre deux coupes, les deux sections interpolées — la hauteur du dessus en (x, z), le flanc en (y, z)
  const SC9=zs.map(z=>S(z)),T=z=>{let i=0,j=zs.length-1;if(z<=zs[0])return SC9[0];if(z>=zs[j])return SC9[j];while(j-i>1){const m=(i+j)>>1;if(zs[m]<=z)i=m;else j=m;}
    const t=(z-zs[i])/(zs[j]-zs[i]),A=SC9[i],B=SC9[j];return A.map((p,q)=>[p[0]+(B[q][0]-p[0])*t,p[1]+(B[q][1]-p[1])*t]);};
  const yH=(x,z)=>{const s=T(z);x=Math.abs(x);for(let i=s.length-1;i>6;i--){const a=s[i],b=s[i-1];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return s[6][1];},
        xF=(y,z)=>{const s=T(z);for(let i=2;i<6;i++){const a=s[i],b=s[i+1];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return s[3][0];},
        pente=z=>Math.atan((xM(z+.03)-xM(z-.03))/.06);   // l'angle du flanc vu de dessus (pour poser une pièce à plat dessus)
  // ---- LES DÉTAILS POSÉS ----
  const P=K.kit(PAL);
  // LE PARE-BRISE : trois pans de verre sombre (le milieu, deux coins qui reviennent à peine) et sa tranche de verre noir (deux montants, la traverse)
  const yTop=1.13,zTop=.03;
  {const B9=[[0,yH(0,ZW+.012)+.004,ZW+.012],[.40,yH(0,ZW+.012)+.004,ZW+.012],[.625,yH(.625,ZW-.02)+.004,ZW-.02]],   // le pied (milieu, cassure, coin)
         H9=[[0,yTop,zTop],[.37,yTop,zTop],[.578,yTop-.022,zTop-.03]];                                        // la tête
    for(const sd of [1,-1]){const f=p=>[p[0]*sd,p[1],p[2]];
      for(let i=0;i<2;i++){const a=f(B9[i]),b=f(B9[i+1]),c=f(H9[i+1]),d=f(H9[i]);P.tri('g',a,b,c);P.tri('g',a,c,d);
        const r=q=>[q[0],q[1]-.0035,q[2]-.0025];P.tri('G',r(a),r(c),r(b));P.tri('G',r(a),r(d),r(c));}}   // (le revers, vu de la poursuite : un verre bleu-gris mat, il ne renvoie pas le ciel blanc du studio)
    // la tranche : UN tube carré de verre noir qui suit le bord (montant, traverse, montant), d'onglet en onglet — pas de cadre de couleur
    const mi=p=>[-p[0],p[1],p[2]],E9=[mi(B9[2]),mi(H9[2]),mi(H9[1]),H9[0],H9[1],H9[2],B9[2]],nE=E9.length,Gc=[0,.97,.27],
          n3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},x3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
          nP=n3([0,.48,.307]),RG=[];
    for(let i=0;i<nE;i++){const a=E9[Math.max(0,i-1)],b=E9[Math.min(nE-1,i+1)],t=n3([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);let o=n3(x3(t,nP));
      const p=E9[i];if(o[0]*(p[0]-Gc[0])+o[1]*(p[1]-Gc[1])+o[2]*(p[2]-Gc[2])<0)o=o.map(v=>-v);
      const C=[p[0]+o[0]*.01+nP[0]*.003,p[1]+o[1]*.01+nP[1]*.003,p[2]+o[2]*.01+nP[2]*.003],q=(u,v)=>[C[0]+o[0]*u+nP[0]*v,C[1]+o[1]*u+nP[1]*v,C[2]+o[2]*u+nP[2]*v];
      RG.push([q(.014,.012),q(-.014,.012),q(-.014,-.012),q(.014,-.012)]);}
    for(let i=0;i<nE-1;i++)for(let k=0;k<4;k++){const k2=(k+1)%4,A=RG[i],B=RG[i+1];P.tri('K',A[k],B[k],B[k2]);P.tri('K',A[k],B[k2],A[k2]);}
    P.box('k',.20,.05,.025,0,yTop-.075,zTop-.01,-.55,0,0);P.box('k',.02,.05,.02,0,yTop-.03,zTop-.005);}   // le rétroviseur intérieur
  // LES RÉTROVISEURS : un pied noir sur la portière, une coque de laque taillée en coin, la glace sombre vers l'arrière
  P.sym(sd=>{const x0=xM(.36)-.085,y0=yT(.36),f=Q=>Q.map(p=>[sd*p[0],p[1]]);
    P.prism('k',[[.45,y0-.04],[.31,y0-.04],[.33,y0+.045],[.41,y0+.05]],.085,sd*(x0+.035));                     // la voile noire : plantée dans l'épaule, elle porte la coque (jamais de rétro qui vole)
    P.plate('p',f([[x0+.04,y0+.028],[x0+.19,y0+.036],[x0+.20,y0+.105],[x0+.175,y0+.122],[x0+.055,y0+.118],[x0+.035,y0+.10]]),.08,.29);   // la coque, vue de face un trapèze aux coins coupés
    P.plate('K',f([[x0+.053,y0+.04],[x0+.18,y0+.046],[x0+.188,y0+.10],[x0+.168,y0+.111],[x0+.065,y0+.108],[x0+.05,y0+.094]]),.006,.284);});   // la glace
  // L'HABITACLE : deux baquets (cuir cognac), la console, le volant à droite (la japonaise), le levier, la casquette du combiné
  P.sym(sd=>{const x0=sd*.335;
    P.prism('t',[[-.16,YF+.03],[-.56,YF+.03],[-.56,YF+.13],[-.50,YF+.155],[-.20,YF+.13]],.44,x0);                // l'assise
    P.prism('t',[[-.50,YF+.05],[-.64,YF+.05],[-.77,.88],[-.65,.90]],.44,x0);                                      // le dossier
    P.prism('t',[[-.645,.885],[-.77,.875],[-.80,.985],[-.69,.995]],.25,x0);                                       // l'appui-tête
    for(const e of [-.205,.205])P.prism('v',[[-.54,YF+.12],[-.66,YF+.12],[-.765,.84],[-.68,.86]],.04,x0+e);});   // les joues du dossier
  P.box('i',.17,.12,.62,0,YF+.06,-.04);                                                                            // la console
  P.cyl('k',.012,.16,6,0,YF+.20,.05,'y');P.cyl('c',.024,.035,8,0,YF+.29,.05,'y');                                // le levier et son pommeau
  P.box('k',.36,.075,.15,-.335,yH(.335,.34)+.03,.36);                                                             // la casquette du combiné
  {const g=new THREE.TorusGeometry(.17,.017,4,10);g.rotateX(.45);P.put('k',g,-.335,.74,.16);                     // le volant (le haut vers la planche)
   P.box('k',.30,.026,.03,-.335,.74,.16,.45,0,0);P.cyl('k',.045,.07,8,-.335,.74,.175,'z');}
  // LA JOUE DES PASSAGES DE ROUE : du noir derrière la roue (on ne voit plus le ciel à travers l'aile)
  {const joue=w=>{const o=[[w-.35,.17]];for(let i=AR.length-2;i>=0;i--)o.push([w-AR[i][0],AR[i][1]+.005]);for(let i=1;i<AR.length-1;i++)o.push([w+AR[i][0],AR[i][1]+.005]);o.push([w+.35,.17]);return o;};
   P.sym(sd=>{for(const w of [ZF,ZR])P.prism('d',joue(w),.02,sd*.585);});}
  // ---- LE NEZ : la BOUCHE ovale qui sourit (le bas plonge au milieu), les clignotants aux coins, la lèvre noire ----
  P.plate('K',[[-.33,.31],[-.30,.258],[-.14,.238],[.14,.238],[.30,.258],[.33,.31],[.30,.366],[-.30,.366]],.012,ZE-.004);
  P.plate('k',[[-.29,.307],[-.265,.268],[-.13,.252],[.13,.252],[.265,.268],[.29,.307],[.265,.35],[-.265,.35]],.006,ZE+.006);   // le fond de la bouche
  P.sym(sd=>{const a=[[.36,.30],[.375,.278],[.44,.278],[.456,.30],[.44,.322],[.375,.322]].map(p=>[sd*p[0],p[1]]);P.plate('O',a,.01,ZE-.003);});
  P.box('k',.92,.028,.11,0,.205,ZE-.06);                                                                           // la lèvre
  // LA POIGNÉE de portière (un petit levier chromé, en haut à l'arrière de la portière)
  P.sym(sd=>{const z=-.47,y=.735,x=xF(y,z);P.box('c',.014,.022,.095,sd*(x+.004),y,z,0,sd*pente(z),0);});
  // LES REPÈRES DE CÔTÉ (orange devant, rouge derrière), à plat sur le flanc
  P.sym(sd=>{for(const [z,k] of [[1.68,'O'],[-1.70,'L']]){const y=.44,x=xF(y,z);P.box(k,.012,.03,.11,sd*(x+.002),y,z,0,sd*pente(z),0);}});
  // ---- LA POUPE : les FEUX en trois cases (le recul rond, le rouge, l'orange au bout), la plaque, le pare-chocs, la jupe noire ----
  P.sym(sd=>{const f=Q=>Q.map(p=>[sd*p[0],p[1]]),rr=(u0,v0,u1,v1,r)=>[[u0+r,v0],[u1-r,v0],[u1,v0+r],[u1,v1-r],[u1-r,v1],[u0+r,v1],[u0,v1-r],[u0,v0+r]];
    P.plate('K',f(rr(.19,.565,.555,.735,.035)),.012,ZB-.010);                                                    // le cerclage, laqué noir
    P.plate('L',f(rr(.205,.58,.455,.72,.026)),.008,ZB-.016);                                                     // le rouge…
    P.plate('O',f(rr(.463,.58,.54,.72,.024)),.008,ZB-.016);                                                      // …l'orange au bout
    {const o=[];for(let q=0;q<8;q++){const a=q/8*Math.PI*2+Math.PI/8;o.push([sd*(.262+Math.cos(a)*.038),.65+Math.sin(a)*.038]);}P.plate('q',o,.006,ZB-.020);}});   // le recul, rond
  P.box('p',1.06,.18,.064,0,.39,ZB-.02);                                                                          // le pare-chocs (une marche sous les feux)
  P.box('K',.40,.135,.012,0,.40,ZB-.054);P.box('w',.35,.10,.008,0,.40,ZB-.062);                                 // la plaque, dans son logement
  P.box('k',.96,.055,.12,0,.272,ZB+.02);                                                                            // la jupe noire
  // LE LOGEMENT des phares (sous les capots : on ne le voit que capots levés)
  const lid={z0:1.40,z1:1.68,x0:.36,x1:.64};
  P.sym(sd=>{const a=lid.x0+.012,b=lid.x1-.012,c=lid.z0+.012,e=lid.z1-.012,v=(x,z)=>[sd*x,yH(x,z)+.003,z];P.tri('k',v(a,c),v(b,c),v(b,e));P.tri('k',v(a,c),v(b,e),v(a,e));});
  K.commit(P);
  // ---- LES DEUX POTS, sous la jupe ----
  const pots=[[.33,.272,ZB-.05],[-.33,.272,ZB-.05]];
  if(typeof ECHP==='object'&&ECHP.rond&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.rond(E,{r:.034,n:8,k:'c',dbl:1,k2:'C',len:.30,pts:pots});K.commit(E);}   // deux sorties à huit pans, comme la Rosso
  /* ---- LES PHARES ESCAMOTABLES ----
     Chaque boîtier est un coin fermé : dessus, le CAPOT de laque (posé 12 mm au-dessus du capot, ses bords de laque aussi — fermé, il ne montre
     aucun trait noir) ; dessous, le boîtier noir et sa FACE (le phare rond cerclé de chrome). Il PIVOTE de 60° autour d'un axe pris DANS la
     caisse : le pivot est calculé pour que, levé, la face soit droite et que son bas affleure le capot. Fermé, le phare regarde vers le bas. */
  const TH=60*Math.PI/180,PH=[],PHG=K.add(new THREE.Group());let HL=[.50,.76,1.64];   // HL : le centre du phare LEVÉ (l'ancrage `hl`)
  {const xm9=(lid.x0+lid.x1)/2,zF=lid.z1-.008,H9=.17,F0=[zF,yH(xm9,zF)],B0=[zF-Math.sin(TH)*H9,F0[1]-Math.cos(TH)*H9],
         Bp=[lid.z1-.03,yH(xm9,lid.z1-.03)+.045],mz=(B0[0]+Bp[0])/2,my=(B0[1]+Bp[1])/2,dz9=Bp[0]-B0[0],dy9=Bp[1]-B0[1],d9=Math.hypot(dz9,dy9)||1e-6,
         h9=(d9/2)/Math.tan(TH/2),Pz=mz-dy9/d9*h9,Py=my+dz9/d9*h9;   // le centre de la rotation qui envoie le bas de la face B0 sur Bp
    for(const sd of [1,-1]){const Q=K.kit(PAL);   // (bâti EN PLACE, dans le repère de la caisse — le fondu de la laque reste celui du capot — puis ramené au pivot)
      const xa=lid.x0,xb=lid.x1,za=lid.z0,zb=lid.z1,V=(x,y,z)=>[sd*x,y,z],tp=(x,z)=>V(x,yH(x,z)+.012,z),bs=(x,z)=>V(x,yH(x,z)-.014,z);
      // le capot de laque : le dessus, ses quatre tranches
      const T4=[tp(xa,za),tp(xb,za),tp(xb,zb)];T4.push([T4[0][0],T4[0][1]+T4[2][1]-T4[1][1],T4[2][2]]);   // le dessus PLAN (un parallélogramme : pas de pli en diagonale)…
      {const d=Math.max(0,tp(xa,zb)[1]-T4[3][1])+.004;for(const t of T4)t[1]+=d;}                              // …relevé pour que le capot ne le perce jamais
      Q.tri('p',T4[0],T4[1],T4[2]);Q.tri('p',T4[0],T4[2],T4[3]);
      for(const [p,q,a,b] of [[[xa,za],[xb,za],0,1],[[xb,za],[xb,zb],1,2],[[xb,zb],[xa,zb],2,3],[[xa,zb],[xa,za],3,0]]){const A=T4[a],B=T4[b],C=bs(q[0],q[1]),D=bs(p[0],p[1]);Q.tri('p',A,B,C);Q.tri('p',A,C,D);}
      // le boîtier noir : ses joues (le capot dessus, la face devant, le dessous, le dos), la face, le dessous, le dos
      const fT=x=>bs(x,zb-.008),fB=x=>{const t=fT(x);return [t[0],t[1]-Math.cos(TH)*H9,t[2]-Math.sin(TH)*H9];},r0=x=>{const t=bs(x,za+.01);return [t[0],t[1]-.07,t[2]];};
      for(const x of [xa+.006,xb-.006]){const poly=[bs(x,za+.01),fT(x),fB(x),r0(x)];Q.tri('K',poly[0],poly[1],poly[2]);Q.tri('K',poly[0],poly[2],poly[3]);}
      const ia=xa+.006,ib=xb-.006;
      Q.tri('K',fT(ia),fB(ia),fB(ib));Q.tri('K',fT(ia),fB(ib),fT(ib));          // la face
      Q.tri('K',fB(ia),r0(ia),r0(ib));Q.tri('K',fB(ia),r0(ib),fB(ib));          // le dessous
      Q.tri('K',r0(ia),bs(ia,za+.01),bs(ib,za+.01));Q.tri('K',r0(ia),bs(ib,za+.01),r0(ib));   // le dos
      // le phare rond, dans le plan de la face
      const A9=fT(ia),B9=fT(ib),Ca=fB(ia),Cb=fB(ib),cen=[(A9[0]+B9[0]+Ca[0]+Cb[0])/4,(A9[1]+B9[1]+Ca[1]+Cb[1])/4,(A9[2]+B9[2]+Ca[2]+Cb[2])/4];
      const nz3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},cr3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
      const ux=nz3([B9[0]-A9[0],B9[1]-A9[1],B9[2]-A9[2]]),vH0=nz3([A9[0]-Ca[0],A9[1]-Ca[1],A9[2]-Ca[2]]);let nn=nz3(cr3(ux,vH0));if(nn[2]-nn[1]<0)nn=nn.map(t=>-t);
      const vH=nz3(cr3(nn,ux));
      const disque=(r,k,o2,n,bom)=>{const C3=[cen[0]+nn[0]*o2,cen[1]+nn[1]*o2,cen[2]+nn[2]*o2],Cb3=[C3[0]+nn[0]*(bom||0),C3[1]+nn[1]*(bom||0),C3[2]+nn[2]*(bom||0)];
        for(let q=0;q<n;q++){const a0=(q+.5)/n*Math.PI*2,a1=(q+1.5)/n*Math.PI*2,pq=a=>[C3[0]+(ux[0]*Math.cos(a)+vH[0]*Math.sin(a))*r,C3[1]+(ux[1]*Math.cos(a)+vH[1]*Math.sin(a))*r,C3[2]+(ux[2]*Math.cos(a)+vH[2]*Math.sin(a))*r];
          Q.tri(k,Cb3,pq(a0),pq(a1));}};
      disque(.074,'c',.004,10);disque(.062,'W',.007,10,.010);                    // le cerclage chromé, la glace bombée
      if(sd>0){const y=cen[1]-Py,z=cen[2]-Pz;HL=[cen[0],Py+y*Math.cos(TH)+z*Math.sin(TH),Pz-y*Math.sin(TH)+z*Math.cos(TH)];}
      const gs=Q.done(),piv=new THREE.Group(),bras=new THREE.Group();piv.position.set(0,Py,Pz);
      for(const g in gs){gs[g].translate(0,-Py,-Pz);const m=new THREE.Mesh(gs[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;bras.add(m);}
      piv.add(bras);PHG.add(piv);PH.push(bras);}}
  /* QUAND ILS SE LÈVENT (`MX5PH.mode`, le choix de Léo : 'nitro' — baissés, ils se lèvent à la nitro : l'appel de phares) ; 'course', 'toujours'.
     `dbgPhares(1|0|null)` les force. L'ACTION SPÉCIALE (2026-10-20, Léo) : le TAP sur la caisse lève les deux phares, qui tiennent puis se baissent. */
  {let k=0,kG=0,gT=0,vu0=false;const anime=dt=>{dt=Math.min(dt||0,.1);
      let st=false,ni=false;try{st=typeof started!=='undefined'&&started&&!gameOver;ni=typeof nitroOn!=='undefined'&&nitroOn;}catch(_){}
      const M9=(typeof MX5PH==='object'&&MX5PH)?MX5PH:{mode:'nitro',force:null};
      let vise=M9.mode==='toujours'?1:M9.mode==='nitro'?(ni?1:0):(st?1:0);
      if(gT>0)gT-=dt;const cG=gT>0?1:0;kG+=(cG-kG)*Math.min(1,dt*(cG?9:5.5));   // l'action : montée vive, descente posée, jamais un à-coup si on retape
      const fo=typeof M9.force==='number'?M9.force:FPH;
      if(fo!=null)vise=fo;
      k+=(vise-k)*Math.min(1,dt*5.5);if(fo!=null&&!vu0){k=fo;}vu0=true;
      const kk=lis(cl(k,0,1)),kA=fo==null?Math.max(kk,lis(cl(kG,0,1))):kk;PH[0].rotation.x=-TH*kA;PH[1].rotation.x=-TH*kA;};
    const action=()=>{gT=.75;return true;};   // les phares restent levés 0,75 s, puis redescendent
    anime(1/30);
    PHG.userData.anime=anime;PHG.userData.action=action;
    if(typeof CAR_ACTION!=='undefined')CAR_ACTION=action;
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);}
  // ---- LA JANTE « MARGUERITE » (14 pouces) : huit pétales plats en trapèze, le cache-moyeu, le fond noir ; le pneu 185/60 à douze pans ----
  const JW=.19,hw=JW/2,fx=hw-.03,RJ=.178,J=lpKit({k:{g:'m',c:0x161719},a:{g:'k',c:0xc5c9cf},d:{g:'m',c:0x0f1013}});
  J.lathe('k',[[RJ,-hw],[R*.90,-hw],[R,-hw*.55],[R,hw*.55],[R*.90,hw],[RJ,hw]],12,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.012],[RJ+.004,fx+.004],[RJ-.018,fx+.008]],12,0,0,0,'x');                    // le rebord
  J.lathe('d',[[RJ-.016,fx-.008],[0,fx-.008]],12,0,0,0,'x');                                         // le fond
  {const sh=new THREE.Shape();sh.moveTo(-.016,.058);sh.lineTo(.016,.058);sh.lineTo(.036,.150);sh.lineTo(0,.162);sh.lineTo(-.036,.150);sh.lineTo(-.016,.058);
   for(let q=0;q<8;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.014,bevelEnabled:false,curveSegments:1});g.rotateY(-Math.PI/2);g.rotateX((q+.5)/8*Math.PI*2);g.translate(fx+.006,0,0);J.put('a',g,0,0,0);}}
  J.lathe('a',[[.064,fx-.004],[.058,fx+.016],[.036,fx+.026],[0,fx+.028]],8,0,0,0,'x');             // le cache-moyeu
  const JG=J.done();
  return {hl:HL,tl:[.40,.645,-1.995],wx:.70,wzF:ZF,wzR:-ZR,pots:pots,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xc5c9cf}};
}
SHAPES.mx5na=function(K){
  if(!(typeof location!=='undefined'&&/[?&]cerise=plan/.test(location.search)))return mx5naPoly(K);   // (26/10) LA CERISE EN POLY, taillée à la main ; `?cerise=plan` = la caisse découpée au plan d'avant
  /* LA … — le petit roadster d'Hiroshima de 1989 (la ligne de la Mazda MX-5 « NA »), ROUGE CLASSIQUE, capote repliée. Tout vient de son
     PLAN COTÉ (quatre vues, 172 px/m, recoupé avec le plan au trait) : la silhouette de côté (capot bas, crête à 0,83 m, portières à 0,77,
     poupe à 0,85), la largeur vue de dessus (nez ROND, 1,70 m aux ailes avant, taille de guêpe aux portières), la coupe vue de face
     (flanc droit, ventre à 0,60, épaule qui roule sur 8 cm) ; puis, DÉCOUPÉS dans la tôle comme sur LA PERLE (`japDecoupe`) : la
     bouche ovale, les veilleuses ovales du nez, les feux arrière à trois cases (recul rond, rouge, orange), les répétiteurs, les joints
     (capot, malle, portières, boucliers) et le pli du flanc. LES PHARES ESCAMOTABLES SE LÈVENT : deux boîtiers noirs, le capot rouge
     dessus, qui pivotent sur leur charnière arrière (`MX5PH`). La jante « marguerite » d'origine (huit pétales, gros cache-moyeu).
     Repère : x à droite, y en haut, z vers l'avant, mètres. */
  const U=LPU,R=.289,ZF=1.165,ZR=-1.115,ZE=1.975,ZB=-1.975;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const PAL={p:{g:'p',c:0x761b22},k:{g:'m',c:0x131316},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x16202c},i:{g:'s',c:0x1d1e22},v:{g:'s',c:0x141417},
    s:{g:'s',c:0x2b2c31},W:{g:'l',c:0xf4f7ff},L:{g:'l',c:0xff1a2e},c:{g:'c',c:0xd4d8de},a:{g:'k',c:0xc3c7cd},d:{g:'m',c:0x0e0f12},
    O:{g:'g',c:0xe08414},q:{g:'s',c:0xdedfe2}};
  // ---- LES COTES DU PLAN (mètres) ----
  // la largeur vue de dessus (demi), la silhouette de côté (le haut), le bas sans les passages de roue
  const XM=[[ZB,.15],[-1.968,.23],[-1.954,.335],[-1.933,.45],[-1.915,.51],[-1.897,.558],[-1.862,.626],[-1.826,.658],[-1.791,.68],[-1.72,.708],[-1.649,.73],[-1.578,.755],
            [-1.507,.773],[-1.44,.793],[-1.365,.81],[-1.23,.83],[-1.082,.838],[-.798,.84],[-.514,.834],[-.231,.83],[.337,.826],[.62,.828],[.904,.846],[1.188,.835],[1.33,.82],
            [1.471,.795],[1.542,.773],[1.613,.744],[1.684,.708],[1.72,.687],[1.755,.665],[1.784,.645],[1.812,.613],[1.84,.574],[1.862,.532],[1.883,.484],[1.897,.437],
            [1.911,.39],[1.925,.338],[1.94,.262],[1.954,.19],[ZE,.12]],
        YT=[[ZB,.488],[-1.94,.50],[-1.905,.51],[-1.895,.52],[-1.893,.58],[-1.888,.66],[-1.878,.74],[-1.865,.78],[-1.85,.80],[-1.83,.812],[-1.80,.818],[-1.75,.825],[-1.70,.83],[-1.60,.831],[-1.52,.834],
            [-1.44,.842],[-1.37,.848],[-1.30,.853],[-1.23,.853],[-1.16,.843],[-1.09,.832],[-1.02,.82],[-.95,.813],[-.88,.803],[-.81,.796],[-.74,.79],[-.67,.784],[-.60,.779],
            [-.50,.777],[-.36,.773],[-.30,.768],[.20,.768],[.27,.772],[.32,.776],[.44,.79],[.51,.802],[.58,.813],[.65,.82],[.72,.825],[.90,.826],[.96,.821],[1.03,.814],
            [1.07,.808],[1.14,.797],[1.21,.785],[1.28,.773],[1.35,.757],[1.42,.739],[1.49,.72],[1.56,.698],[1.63,.675],[1.70,.651],[1.77,.618],[1.84,.587],[1.87,.567],
            [1.905,.545],[1.94,.505],[ZE,.458]],
        YB=[[ZB,.36],[-1.95,.32],[-1.93,.30],[-1.894,.267],[-1.86,.242],[-1.51,.232],[-1.47,.22],[-.78,.163],[-.5,.159],[0,.157],[.8,.152],[.86,.19],[1.52,.235],[1.60,.226],
            [1.70,.218],[1.80,.202],[1.836,.195],[1.852,.27],[1.87,.335],[1.905,.35],[1.94,.355],[ZE,.37]],   // (affinement : le nez finit en face ronde, plus en bec)
        AR=[[0,.61],[.07,.60],[.14,.583],[.18,.563],[.21,.54],[.25,.51],[.28,.47],[.31,.42],[.325,.36],[.33,.29],[.335,0]];
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z);
  // l'habitacle : la planche de bord (son bord arrière), les sièges, le couvre-capote ; le pare-brise (son pied, vu de dessus)
  const ZD=.30,ZS=-.68,ZK=-1.20,YF=.36,zWS=x=>.565-.06*Math.pow(Math.min(1,Math.abs(x)/.646),2);
  const zone=z=>z>ZD?'capot':z>ZS?'hab':z>ZK?'capote':'malle';
  /* LA COUPE (relevée vue de face, à la cote de la plus grosse section — elle se met à l'échelle de chaque tranche) : `t` va du bas du flanc
     (0) au haut de la caisse (1), `f` est la part de la demi-largeur — flanc presque droit, un PLI à 0,42 m (le haut des boucliers continue
     le long des portières), le VENTRE à 0,60, la taille à 0,70, la lèvre de l'aile à 0,74, puis l'épaule qui roule jusqu'au capot. */
  const COTE=[[.044,.935],[.36,.958],[.395,.972],[.654,1.0],[.80,.958],[.862,.962],[.90,.89],[.935,.835]];
  const S0=z=>{const xm=xM(z),yt=yT(z),y0=yB0(z),zo=zone(z),H=Math.max(.04,yt-y0),yb=U.arch(z,[ZF,ZR],AR,y0);
    const kx=Math.min(1,xm/.62);   // (au nez et à la poupe la coupe se resserre : les retraits suivent la largeur)
    const s=[[0,yb],[xm-.13*kx,yb]];
    for(const q of COTE)s.push([xm-(1-q[1])*.845*kx*(q[1]>.95?1:1),y0+q[0]*H]);
    if(zo==='hab'){s.push([xm-.12*kx,yt],[xm-.15*kx,yt-.008],[xm-.165*kx,YF+.06],[0,YF]);}
    else if(zo==='capote'){const u=cl((ZS-z)/(ZS-ZK),0,1),yo=yt+.015+.05*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.45)),.7);s.push([xm-.13*kx,yt],[xm-.15*kx,yt-.004],[xm-.20*kx,yo-.01],[0,yo]);}
    else s.push([xm*.77,y0+.962*H],[xm*.55,y0+.985*H],[xm*.27,y0+.998*H],[0,yt+.004]);
    // (sous les passages de roue : les points du flanc ne descendent jamais sous l'arche, et montent toujours)
    for(let i=1;i<s.length-1;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]+(i===1?0:.002));
    return s;};
  const SM=new Map(),S=z=>{const k=Math.round(z*2000);let s=SM.get(k);if(!s){s=S0(k/2000);SM.set(k,s);}return s;};
  const zs0=[ZB,-1.968,-1.954,-1.94,-1.925,-1.905,-1.895,-1.893,-1.888,-1.878,-1.865,-1.85,-1.83,-1.80,-1.75,-1.70,-1.62,-1.54,-1.47,-1.30,-1.23,-1.16,-1.08,-1.0,-.92,-.84,-.76,
    -.50,-.30,-.10,.10,.20,.36,.44,.51,.58,.65,.72,.80,.90,1.00,1.10,1.40,1.47,1.54,1.62,1.70,1.77,1.812,1.84,1.862,1.883,1.897,1.911,1.925,1.94,1.954,1.968,ZE,
    ZD,ZD-.004,ZS,ZS-.004,ZK,ZK-.004];
  for(const w of [ZF,ZR])for(const d of [0,.07,.14,.21,.28,.31,.325,.335])zs0.push(w-d,w+d);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.003);
  const JT=2+COTE.length;   // le 1er point du dessus (capot / haut de portière)
  const peint=(j,z)=>{if(j<0)return 'p';if(j===0)return z>1.70||z<-1.84?'p':'k';const zo=zone(z);
    if(j>=JT&&Math.abs(z-ZD+.002)<.003)return 'i';   // (la paroi arrière de la planche de bord)
    if(zo==='hab'&&j>JT)return 'i';
    if(zo==='capote'&&j>JT)return 'v';
    return 'p';};
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const PL=K.kit(PAL);PL.loft(zs,S,peint);let LIDG=null;
  // ---- LA DÉCOUPE AU PLAN (`japDecoupe`) ----
  const MEM=(typeof SHAPES==='object'&&SHAPES.mx5na)||null;
  const lid={z0:1.415,z1:1.72,x0:.38,x1:.65};
  const ZN={
    face:japZones([
      {k:'K',p:japDemi(.39,.25,.36,.055,5),creux:.05,gate:(x,y,z,nx,ny,nz)=>z>1.75&&nz>.2},                                   // la BOUCHE ovale
      {k:'q',p:japOvale(.45,.522,.16,.032,22),gate:(x,y,z,nx,ny,nz)=>z>1.70&&nz>.1},                                           // les VEILLEUSES du nez (verre clair)…
      {k:'O',p:japOvale(.535,.522,.07,.022,16),gate:(x,y,z,nx,ny,nz)=>z>1.70&&nz>.1}]),                                         // …et leur cœur orange
    cote:japZones([
      {k:'O',p:japRect(1.545,.385,1.675,.415,.012,3),gate:(x,y,z,nx,ny,nz)=>z>1.45},                                            // le répétiteur avant (orange)
      {k:'L',p:japRect(-1.63,.385,-1.515,.415,.012,3),gate:(x,y,z,nx,ny,nz)=>z<-1.4},
      {k:'K',p:japRect(-.52,.632,-.40,.656,.011,3),gate:(x,y,z,nx,ny,nz)=>z>-.6&&z<-.3}]),                                         // la poignée de portière                                         // et l'arrière (rouge)
    dos:japZones([
      {k:'K',p:japRect(.285,.548,.65,.702,.07,5),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3},                                        // le FEU : son cerclage noir
      {k:'L',p:japRect(.297,.56,.548,.69,.062,5),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3},                                         // le rouge (il entoure le recul)
      {k:'O',p:japRect(.552,.56,.638,.69,.058,5),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3},                                         // l'orange, au bout
      {k:'K',p:japOvale(.362,.625,.052,.052,18),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3},                                          // le recul, rond : son cerclage…
      {k:'q',p:japOvale(.362,.625,.043,.043,18),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3},                                          // …et son verre clair
      {k:'L',p:japDemi(.085,.735,.752,.006,2),gate:(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.3}]),                                        // le 3e feu stop
    dessus:japZones([
      {k:'d',p:japRect(lid.z0,lid.x0,lid.z1,lid.x1,.035,4),creux:.085,copie:'lid',gate:(x,y,z,nx,ny,nz)=>z>1.3&&ny>.4},                       // le LOGEMENT des phares (sous les capots)
      {k:'i',p:(()=>{const o=[[ZD,0]];for(let i=0;i<=12;i++){const x=.66*i/12;o.push([zWS(x),x]);}o.push([ZD,.66]);return o;})(),gate:(x,y,z,nx,ny,nz)=>y>.70&&z>ZD-.01&&z<.70}])};   // la planche de bord, sous le pare-brise
  const LGN={
    cote:japLignes([
      {k:'j',p:[[.53,.775],[.545,.70],[.552,.55],[.545,.40],[.53,.25],[.52,.172]]},                                              // la portière : devant…
      {k:'j',p:[[-.58,.765],[-.60,.60],[-.605,.40],[-.60,.25],[-.585,.172]]},                                                     // …derrière…
      {k:'j',p:[[.52,.172],[-.585,.172]]},                                                                                         // …et dessous
      {k:'h',p:[[1.80,.43],[1.50,.425],[.86,.42],[0,.418],[-.78,.42],[-1.45,.425],[-1.86,.43]]}]),                                  // le PLI du flanc (le haut des boucliers)
    face:japLignes([{k:'j',p:[[0,.445],[.40,.445],[.62,.448],[.76,.455]],gate:(x,y,z,nx,ny,nz)=>z>1.7}]),                          // le haut du bouclier avant
    dos:japLignes([{k:'j',p:[[0,.505],[.45,.505],[.70,.51],[.80,.52]],gate:(x,y,z,nx,ny,nz)=>z<-1.8}]),                            // le haut du bouclier arrière
    dessus:japLignes([
      {k:'j',p:[[.72,.62],[1.0,.63],[1.30,.645],[lid.z0-.02,.66],[lid.z1+.02,.665],[1.79,.60],[1.83,.45],[1.85,.25],[1.855,0]]},     // le capot
      {k:'j',p:[[-1.225,0],[-1.225,.585],[-1.32,.61],[-1.60,.612],[-1.80,.56],[-1.835,.30],[-1.84,0]]}])};                              // la malle
  const CODES={p:{g:GP},gap:{g:GP,c:0x2a0508},K:{g:'g',c:PAL.K.c,lisse:1},d:{g:'m',c:PAL.d.c},i:{g:'s',c:PAL.i.c},q:{g:'g',c:0xd9dde2,lisse:1},
    O:{g:'g',c:PAL.O.c,lisse:1},L:{g:'l',c:PAL.L.c}};
  {const f2=PL.done;PL.done=()=>{const gs=f2(),G=gs[GP];if(!G)return gs;
    const ns=japLisse(G,32);const out=japDecoupe(G,{zones:ZN,lignes:LGN,codes:CODES,ns:ns,GP:GP,colP:japColP(EP),cache:MEM,
      vue:(x,y,z,ax,ay,az,nx,ny,nz)=>z>1.72&&nz>.2&&y<.58?'face':z<-1.80&&nz<-.25&&y<.80?'dos':null});
    LIDG=out.__lid||null;delete out.__lid;G.dispose();delete gs[GP];return japFusion(gs,out);};}
  K.commit(PL);
  // la hauteur de la tôle (le dessus) en (x, z) : sur la section de la tranche, du côté du dessus
  // (la tôle TELLE QU'ELLE EST : entre deux tranches, les deux sections interpolées — pas la courbe idéale)
  const ZS9=zs,SC9=ZS9.map(z=>S(z)),T=z=>{let i=0,j=ZS9.length-1;if(z<=ZS9[0])return SC9[0];if(z>=ZS9[j])return SC9[j];while(j-i>1){const m=(i+j)>>1;if(ZS9[m]<=z)i=m;else j=m;}
    const t=(z-ZS9[i])/(ZS9[j]-ZS9[i]),A=SC9[i],B=SC9[j];return A.map((p,q)=>[p[0]+(B[q][0]-p[0])*t,p[1]+(B[q][1]-p[1])*t]);};
  const yDessus=(x,z)=>{const s=T(z);for(let i=s.length-1;i>0;i--){const a=s[i],b=s[i-1];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return s[s.length-1][1];};
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);
  // LE PARE-BRISE : un cadre rouge (montants et traverse), le verre ; le pied posé sur l'auvent, la traverse à 1,16 m
  {const N=10,M=8,pt=(u,s)=>{const ax=Math.abs(u),xb=.625*u,xt=.565*u,zb=zWS(xb)-.012,zt=-.005+.10*Math.pow(ax,2.5),yb=yDessus(Math.abs(xb),zb)-.004,yt=1.157-.035*Math.pow(ax,3);
      const x=mix(xb,xt,s),y=mix(yb,yt,s),z=mix(zb,zt,s)+.025*Math.sin(Math.PI*s)*(1-ax*ax);return [x,y,z];};
    const F=.075,FS=.045;   // la largeur du cadre (en u) et de la traverse (en s)
    for(let i=0;i<N;i++)for(let j=0;j<M;j++){const u0=-1+2*i/N,u1=-1+2*(i+1)/N,s0=j/M,s1=(j+1)/M;const a=pt(u0,s0),b=pt(u1,s0),c=pt(u1,s1),d=pt(u0,s1);
      P.tri('g',a,b,c);P.tri('g',a,c,d);}
    // le cadre : un tube carré CONTINU qui suit le bord (montants et traverse) — un repère par point, moyenné entre ses deux voisins
    const bord=[];for(let j=0;j<=M;j++)bord.push(pt(-1,j/M));for(let i=1;i<N;i++)bord.push(pt(-1+2*i/N,1));for(let j=M;j>=0;j--)bord.push(pt(1,j/M));
    const nb=bord.length,nP=[0,.55,.83],RG=[];
    for(let i=0;i<nb;i++){const a=bord[Math.max(0,i-1)],b=bord[Math.min(nb-1,i+1)],t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
      const w=[t[1]*nP[2]-t[2]*nP[1],t[2]*nP[0]-t[0]*nP[2],t[0]*nP[1]-t[1]*nP[0]],wl=Math.hypot(w[0],w[1],w[2])||1,W=[w[0]/wl*.026,w[1]/wl*.026,w[2]/wl*.026],N9=[nP[0]*.02,nP[1]*.02,nP[2]*.02],p=bord[i];
      RG.push([[p[0]+W[0]+N9[0],p[1]+W[1]+N9[1],p[2]+W[2]+N9[2]],[p[0]-W[0]+N9[0],p[1]-W[1]+N9[1],p[2]-W[2]+N9[2]],[p[0]-W[0]-N9[0],p[1]-W[1]-N9[1],p[2]-W[2]-N9[2]],[p[0]+W[0]-N9[0],p[1]+W[1]-N9[1],p[2]+W[2]-N9[2]]]);}
    for(let i=0;i<nb-1;i++)for(let k=0;k<4;k++){const k2=(k+1)%4,kk=k===2?'i':'p',A=RG[i],B=RG[i+1];P.tri(kk,A[k],B[k],B[k2]);P.tri(kk,A[k],B[k2],A[k2]);}
    // le rétroviseur intérieur
    const r=pt(0,.94);P.box('k',.22,.06,.02,r[0],r[1]-.05,r[2]-.04,-.6,0,0);}
  // LES RÉTROVISEURS : une coque rouge en goutte sur un bras, la glace noire vers l'arrière
  P.sym(sd=>{const x0=sd*.80,y0=yT(.20)+.005,z0=.19;
    P.box('p',.05,.026,.11,x0-sd*.005,y0+.008,z0);P.box('k',.026,.05,.028,x0+sd*.05,y0+.032,z0-.035,0,0,-sd*.6);
    const cx=x0+sd*.11,cy=y0+.075,cz=z0-.04;
    {const g=new THREE.SphereGeometry(.06,8,3,0,Math.PI*2,0,Math.PI*.62);g.rotateX(Math.PI/2);P.put('p',g,cx,cy,cz+.012,0,0,0,1.45,.95,1.05);}   // la coque, une demi-goutte ouverte vers l'arrière
    P.cyl('K',.058,.006,8,cx,cy,cz-.022,'z');P.put('K',new THREE.CircleGeometry(.056,8).scale(1.42,.92,1).rotateY(Math.PI),cx,cy,cz-.026);});
  // L'HABITACLE : deux baquets (assise, dossier, appui-tête), la console, le volant (à gauche), le levier
  // LES BAQUETS : une coque en U (le dos et deux joues), l'assise creusée, l'appui-tête intégré — tissu noir
  P.sym(sd=>{const x0=sd*.35,A=-.30,ca=Math.cos(A),sa=Math.sin(A),dos=(u,v,w)=>[x0+u,YF+.10+v*ca-w*sa,-.47+v*sa+w*ca];   // (u en travers, v le long du dossier, w devant)
    const sec=v=>{const L9=v<.40?.235:v<.47?.235-(v-.40)*1.6:.125,ep=.05;return [[-L9,-.035],[-L9+.03,.035],[-L9*.55,0],[0,-.008],[L9*.55,0],[L9-.03,.035],[L9,-.035],[L9-.02,-.075],[-L9+.02,-.075]];};
    const vs=[0,.12,.26,.40,.46,.58,.62];
    for(let a=0;a<vs.length-1;a++){const A9=sec(vs[a]),B9=sec(vs[a+1]),n=A9.length;
      for(let q=0;q<n;q++){const q2=(q+1)%n,p1=dos(A9[q][0],vs[a],A9[q][1]),p2=dos(A9[q2][0],vs[a],A9[q2][1]),p3=dos(B9[q2][0],vs[a+1],B9[q2][1]),p4=dos(B9[q][0],vs[a+1],B9[q][1]);
        const k=(q===1||q===2||q===3||q===4)&&(a===3)?'v':'s';P.tri(k,p1,p2,p3);P.tri(k,p1,p3,p4);}}
    {const T9=sec(.62);let cx=0,cy=0;for(const q of T9){cx+=q[0];cy+=q[1];}cx/=T9.length;cy/=T9.length;const C9=dos(cx,.62,cy);for(let q=0;q<T9.length;q++)P.tri('s',C9,dos(T9[q][0],.62,T9[q][1]),dos(T9[(q+1)%T9.length][0],.62,T9[(q+1)%T9.length][1]));}
    // l'assise : un coussin aux bords relevés
    const as=[[-.22,.05],[-.17,.085],[0,.06],[.17,.085],[.22,.05],[.22,-.02],[-.22,-.02]];
    for(const [za,zb] of [[-.45,-.12],[-.12,.02]]){const ya=za<-.4?0:0,f=z9=>z9>-.05?.02:0;
      for(let q=0;q<as.length;q++){const q2=(q+1)%as.length,a1=[x0+as[q][0],YF+as[q][1]-f(za),za],a2=[x0+as[q2][0],YF+as[q2][1]-f(za),za],b1=[x0+as[q][0],YF+as[q][1]-f(zb),zb],b2=[x0+as[q2][0],YF+as[q2][1]-f(zb),zb];
        P.tri('s',a1,b1,b2);P.tri('s',a1,b2,a2);}}
    P.plate('s',[[x0-.22,YF-.02],[x0+.22,YF-.02],[x0+.22,YF+.05],[x0+.17,YF+.085],[x0,YF+.06],[x0-.17,YF+.085],[x0-.22,YF+.05]],.004,.018);});
  P.box('i',.16,.16,.70,0,YF+.06,0);                                                             // la console
  {const yd=yDessus(.33,.36);P.box('i',.36,.07,.16,-.33,yd+.02,.37);P.box('K',.30,.05,.01,-.33,yd,.29);}   // la casquette du combiné (devant le volant) et le cadran
  P.cyl('k',.012,.16,6,0,YF+.20,.10,'y');                                                        // le levier…
  P.cyl('c',.022,.03,8,0,YF+.29,.10,'y');                                                        // …et son pommeau
  {const g=new THREE.TorusGeometry(.18,.017,6,18);g.rotateX(-.42);P.put('k',g,-.33,.72,.20);   // le volant
   P.box('k',.30,.025,.03,-.33,.72,.20,-.42+Math.PI/2,0,0);P.cyl('k',.04,.06,8,-.33,.71,.215,'z');}
  // LA JOUE DES PASSAGES DE ROUE : du noir derrière la roue (on ne voit plus le ciel à travers l'aile)
  {const joue=w=>{const o=[];for(let i=AR.length-1;i>=0;i--){const p=AR[i];if(p[1]>=.17)o.push([w-p[0]*1.02,p[1]+.01]);}
      o.unshift([w-.34,.17]);for(let i=1;i<AR.length;i++){const p=AR[i];if(p[1]>=.17)o.push([w+p[0]*1.02,p[1]+.01]);}o.push([w+.34,.17]);return o;};
   P.sym(sd=>{for(const w of [ZF,ZR])P.prism('d',joue(w),.02,sd*.58);});}
  K.commit(P);
  // ---- LE POT : un seul, à droite, sous le bouclier ----
  let pots=[[.50,.255,-1.97]];
  if(typeof ECHP==='object'&&ECHP.reel&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.reel(E,{r:.03,k:'c',len:.30,pts:[[.50,.255,-1.97]]});K.commit(E);}
  /* ---- LES PHARES ESCAMOTABLES ----
     Chaque boîtier est un coin fermé : dessus, le CAPOT (les morceaux mêmes de la tôle du capot découpés dans son logement : fermé, il
     affleure au millimètre), deux joues noires, la FACE (une lunette noire et le phare rond, cerclé de chrome), le dessous et le dos noirs.
     Il PIVOTE de 60° autour d'un axe pris DANS la caisse : le pivot est calculé pour que, levé, la face soit droite et que son bas affleure
     le capot (comme la vraie : le phare sort du capot, il ne se dresse pas au bout d'un bras). Fermé, le phare regarde vers le bas. */
  const TH=60*Math.PI/180,PH=[],PHG=K.add(new THREE.Group());
  {const xm9=(lid.x0+lid.x1)/2,zF=lid.z1-.008,H9=.17,F0=[zF,yDessus(xm9,zF)],B0=[zF-Math.sin(TH)*H9,F0[1]-Math.cos(TH)*H9],
         Bp=[lid.z1-.03,yDessus(xm9,lid.z1-.03)+.045],mz=(B0[0]+Bp[0])/2,my=(B0[1]+Bp[1])/2,dz9=Bp[0]-B0[0],dy9=Bp[1]-B0[1],d9=Math.hypot(dz9,dy9)||1e-6,
         h9=(d9/2)/Math.tan(TH/2),Pz=mz-dy9/d9*h9,Py=my+dz9/d9*h9;   // le centre de la rotation (sens direct dans le plan z-y) qui envoie le bas de la face B0 sur Bp
    for(const sd of [1,-1]){const Q=K.kit(PAL),L3=(x,y,z)=>[sd*x,y-Py,z-Pz];
      const xa=lid.x0+.012,xb=lid.x1-.012,ZR0=lid.z0+.02;
      const top=x=>{const o=[];for(let j=0;j<=8;j++){const z=lid.z0+.012+(zF-lid.z0-.012)*j/8;o.push(L3(x,yDessus(x,z)-.002,z));}return o;},
            fT=x=>L3(x,yDessus(x,zF),zF),fB=x=>{const t=fT(x);return [t[0],t[1]-Math.cos(TH)*H9,t[2]-Math.sin(TH)*H9];},
            r0=x=>L3(x,yDessus(x,ZR0)-.075,ZR0);
      // les joues : le profil du capot dessus, la face devant, le dessous et le dos (un éventail depuis le centre)
      for(const x of [xa,xb]){const T9=top(x),poly=T9.concat([fB(x),r0(x)]);let c=[0,0,0];for(const q of poly){c[0]+=q[0];c[1]+=q[1];c[2]+=q[2];}c=c.map(t=>t/poly.length);
        for(let q=0;q<poly.length;q++)Q.tri('K',c,poly[q],poly[(q+1)%poly.length]);}
      Q.tri('K',fB(xa),fB(xb),r0(xb));Q.tri('K',fB(xa),r0(xb),r0(xa));                                       // le dessous
      {const ta=top(xa)[0],tb=top(xb)[0];Q.tri('K',r0(xa),r0(xb),tb);Q.tri('K',r0(xa),tb,ta);}                 // le dos
      Q.tri('K',fT(xa),fB(xa),fB(xb));Q.tri('K',fT(xa),fB(xb),fT(xb));                                        // la face
      // le phare rond, dans le plan de la face (son bord haut suit la pente du capot)
      const A9=fT(xa),B9=fT(xb),Ca=fB(xa),Cb=fB(xb),cen=[(A9[0]+B9[0]+Ca[0]+Cb[0])/4,(A9[1]+B9[1]+Ca[1]+Cb[1])/4,(A9[2]+B9[2]+Ca[2]+Cb[2])/4];
      const nz3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},cr3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
      const ux=nz3([B9[0]-A9[0],B9[1]-A9[1],B9[2]-A9[2]]),vH0=nz3([A9[0]-Ca[0],A9[1]-Ca[1],A9[2]-Ca[2]]);let nn=nz3(cr3(ux,vH0));if(nn[2]-nn[1]<0)nn=nn.map(t=>-t);
      const vH=nz3(cr3(nn,ux));
      const disque=(r,k,o2,n,bom)=>{n=n||16;const C3=[cen[0]+nn[0]*o2,cen[1]+nn[1]*o2,cen[2]+nn[2]*o2],Cb3=[C3[0]+nn[0]*(bom||0),C3[1]+nn[1]*(bom||0),C3[2]+nn[2]*(bom||0)];
        for(let q=0;q<n;q++){const a0=q/n*Math.PI*2,a1=(q+1)/n*Math.PI*2,pq=a=>[C3[0]+(ux[0]*Math.cos(a)+vH[0]*Math.sin(a))*r,C3[1]+(ux[1]*Math.cos(a)+vH[1]*Math.sin(a))*r,C3[2]+(ux[2]*Math.cos(a)+vH[2]*Math.sin(a))*r];
          Q.tri(k,Cb3,pq(a0),pq(a1));}};
      disque(.076,'c',.004);disque(.066,'W',.007,18,.012);                                                   // le cerclage chromé, la glace bombée
      const gs=Q.done(),piv=new THREE.Group(),bras=new THREE.Group();piv.position.set(0,Py,Pz);
      // LE CAPOT : les morceaux de la tôle découpée dans le logement (mêmes facettes que le capot : fermé, il affleure au millimètre)
      if(LIDG){const p9=LIDG.attributes.position.array,n9=LIDG.attributes.normal.array,c9=LIDG.attributes.color.array,PP=[],NN=[],CC=[];
        for(let t=0;t<p9.length;t+=9){if((p9[t]+p9[t+3]+p9[t+6])*sd<=0)continue;for(let q=0;q<9;q+=3){PP.push(p9[t+q],p9[t+q+1]-Py+.0012,p9[t+q+2]-Pz);NN.push(n9[t+q],n9[t+q+1],n9[t+q+2]);CC.push(c9[t+q],c9[t+q+1],c9[t+q+2]);}}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(NN,3));g.setAttribute('color',new THREE.Float32BufferAttribute(CC,3));
        if(gs[GP])japFusion(gs,{[GP]:g});else gs[GP]=g;}
      for(const g in gs){const m=new THREE.Mesh(gs[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;bras.add(m);}   // (pas d'ombre cuite : les sommets sont dans le repère du pivot)
      piv.add(bras);PHG.add(piv);PH.push(bras);}}
  /* QUAND ILS SE LÈVENT (`MX5PH.mode`) — à choisir par Léo : 'course' (levés en course, baissés au garage et au menu), 'nitro' (baissés,
     ils se lèvent à la nitro : l'appel de phares), 'toujours'. `dbgPhares(1|0|null)` les force.
     L'ACTION SPÉCIALE (2026-10-20, Léo) : le clin d'œil ne part plus tout seul à l'arrivée au garage — c'est le TAP sur la caisse qui le
     déclenche (`CAR_ACTION`, voir caisseAction) : les DEUX phares se lèvent, tiennent, se baissent. Retapée pendant, elle les garde levés. */
  {let k=0,kG=0,gT=0,vu0=false;const anime=dt=>{dt=Math.min(dt||0,.1);
      let st=false,ni=false;try{st=typeof started!=='undefined'&&started&&!gameOver;ni=typeof nitroOn!=='undefined'&&nitroOn;}catch(_){}
      const M9=(typeof MX5PH==='object'&&MX5PH)?MX5PH:{mode:'nitro',force:null};
      let vise=M9.mode==='toujours'?1:M9.mode==='nitro'?(ni?1:0):(st?1:0);
      if(gT>0)gT-=dt;const cG=gT>0?1:0;kG+=(cG-kG)*Math.min(1,dt*(cG?9:5.5)); // l'action : montée vive, descente posée, jamais un à-coup si on retape
      if(typeof M9.force==='number')vise=M9.force;
      k+=(vise-k)*Math.min(1,dt*5.5);if(typeof M9.force==='number'&&!vu0){k=M9.force;}vu0=true;
      const kk=lis(cl(k,0,1)),kA=M9.force==null?Math.max(kk,lis(cl(kG,0,1))):kk;PH[0].rotation.x=-TH*kA;PH[1].rotation.x=-TH*kA;};
    const action=()=>{gT=.75;return true;};   // les phares restent levés 0,75 s, puis redescendent
    anime(1/30);
    PHG.userData.anime=anime;PHG.userData.action=action;
    if(typeof CAR_ACTION!=='undefined')CAR_ACTION=action;
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);}
  // ---- LA JANTE « MARGUERITE » (14 pouces) : huit pétales bombés, le gros cache-moyeu, le fond sombre ; le pneu 185/60 ----
  const JW=.19,hw=JW/2,fx=hw-.03,RJ=.178,J=lpKit({k:{g:'m',c:0x161719},a:{g:'s',c:0xaeb2b8},d:{g:'m',c:0x0f1013},b:{g:'m',c:0x34353a}});
  J.lathe('k',[[RJ,-hw],[R*.90,-hw],[R,-hw*.62],[R,hw*.62],[R*.90,hw],[RJ,hw]],24,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.01],[RJ+.004,fx+.002],[RJ-.012,fx+.006],[RJ-.022,fx-.004]],24,0,0,0,'x');   // le rebord de la jante
  J.lathe('d',[[RJ-.02,-hw+.02],[RJ-.02,fx-.012],[0,fx-.012]],20,0,0,0,'x');                       // le fond
  {const pet=[];for(let q=0;q<=8;q++){const a=-Math.PI/2+Math.PI*q/8;pet.push([Math.cos(a)*.044,.150+Math.sin(a)*.014]);}   // le bout du pétale, rond
   const sh=new THREE.Shape();sh.moveTo(-.02,.06);sh.lineTo(.02,.06);for(const p of pet)sh.lineTo(p[0],p[1]);sh.lineTo(-.02,.06);
   for(let q=0;q<8;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.016,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1,curveSegments:1});
     g.rotateY(-Math.PI/2);g.rotateX(q/8*Math.PI*2);g.translate(fx+.004,0,0);J.put('a',g,0,0,0);}}
  J.lathe('a',[[.068,fx+.004],[.064,fx+.016],[.045,fx+.026],[0,fx+.03]],16,0,0,0,'x');             // le cache-moyeu
  const JG=J.done();
  return {hl:[.52,.66,1.62],tl:[.47,.62,-1.89],wx:.70,wzF:ZF,wzR:-ZR,pots:pots,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xc5c9cf}};
};
