// >>> fin SHAPES.simpson (BOITES)
// <<< SHAPES.caid (BOITES) >>> — LE CAÏD = le GMC HUMMER EV (2026-10-18, discussion BOÎTES ; Léo : « une magnifique GMC » ; 19/10 : « refais-le en SUV »).
// Remplace l'ancienne méthode `caid(K)` de l'objet SHAPES (laissée en place : la coordination l'effacera).
SHAPES.caid=(function(){
const CACHE={};
const cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lin=(t,x)=>{if(x<=t[0][0])return t[0][1];
  for(let i=1;i<t.length;i++)if(x<=t[i][0]){const p=t[i-1],q=t[i];return p[1]+(q[1]-p[1])*(x-p[0])/((q[0]-p[0])||1);}return t[t.length-1][1];};
// ---- les formes 2D ----
const cercle=(cu,cv,r,n)=>{const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;o.push([cu+Math.cos(a)*r,cv+Math.sin(a)*r]);}return o;},
      ellipse=(cu,cv,a,b,n,rot)=>{const o=[],c=Math.cos(rot||0),s=Math.sin(rot||0);for(let i=0;i<n;i++){const t=i/n*Math.PI*2,x=Math.cos(t)*a,y=Math.sin(t)*b;o.push([cu+x*c-y*s,cv+x*s+y*c]);}return o;},
      aire=P=>{let A=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];A+=p[0]*q[1]-q[0]*p[1];}return A/2;},
      // le contour GONFLÉ de d (le joint de caoutchouc autour d'une vitre)
      gonfle=(P,d)=>{const n=P.length,s=aire(P)>0?1:-1;return P.map((p,i)=>{const a=P[(i-1+n)%n],b=P[(i+1)%n];
        let ux=p[0]-a[0],uy=p[1]-a[1],l=Math.hypot(ux,uy)||1;const n1=[s*uy/l,-s*ux/l];ux=b[0]-p[0];uy=b[1]-p[1];l=Math.hypot(ux,uy)||1;const n2=[s*uy/l,-s*ux/l];
        let mx=n1[0]+n2[0],my=n1[1]+n2[1];const ml=Math.hypot(mx,my)||1;mx/=ml;my/=ml;const k=d/Math.max(.35,mx*n1[0]+my*n1[1]);return [p[0]+mx*k,p[1]+my*k];});},
      rect=(u0,v0,u1,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]],
      // un trait épais (barre) de a à b, demi-largeur w
      barre=(a,b,w)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w,ny=dx/l*w;return [[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];},
      // un secteur d'anneau (l'arc-en-ciel) de r0 à r1, tronqué sous vMin
      anneau=(cu,cv,r0,r1,vMin,n)=>{const a0=Math.asin(cl((vMin-cv)/r1,-1,1)),a1=Math.asin(cl((vMin-cv)/r0,-1,1)),o=[];
        for(let i=0;i<=n;i++){const a=mix(a0,Math.PI-a0,i/n);o.push([cu+Math.cos(a)*r1,cv+Math.sin(a)*r1]);}
        for(let i=0;i<=n;i++){const a=mix(Math.PI-a1,a1,i/n);o.push([cu+Math.cos(a)*r0,cv+Math.sin(a)*r0]);}return o;},
      // une étoile à 4 branches (le scintillement)
      etoile=(cu,cv,r,n4)=>{const o=[],m=n4||4;for(let i=0;i<m*2;i++){const a=i/(m*2)*Math.PI*2+Math.PI/2,rr=i%2?r*.32:r;o.push([cu+Math.cos(a)*rr,cv+Math.sin(a)*rr]);}return o;};

// garder la part au-delà de z0, puis la rééchantillonner à pas égaux
const garde=(P,z0,dir)=>{const o=[];for(let i=0;i<P.length;i++){const a=P[i],ina=(a[1]-z0)*dir>=0;
    if(i>0){const b=P[i-1],inb=(b[1]-z0)*dir>=0;if(ina!==inb){const t=(z0-b[1])/(a[1]-b[1]);o.push([b[0]+(a[0]-b[0])*t,z0]);}}if(ina)o.push(a);}return o;},
  reech=(P,n)=>{const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const T=L[L.length-1]||1,o=[];let k=1;for(let i=0;i<=n;i++){const s=T*i/n;while(k<P.length-1&&L[k]<s)k++;const a=P[k-1],b=P[k],t=cl((s-L[k-1])/((L[k]-L[k-1])||1),0,1);
      o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return o;},
  // x d'une rangée à la station z (sur les flancs, la courbe la rogne déjà près du nez et de la poupe)
  xSur=(P,z,dir)=>{for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if((z-a[1])*dir>=0&&(z-b[1])*dir<=0){const t=(z-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*t;}}return null;};
// LE NEZ ET LA POUPE, COLONNE PAR COLONNE : la 1re moitié des colonnes suit le COIN (en z, jusqu'à ce que la rangée soit rentrée de 14 cm
// — 10 à la poupe), la 2e moitié la FACE (en x, jusqu'au milieu). Toutes les rangées ont ainsi leurs colonnes au même endroit du dessin
// (au même pas en arc, des rangées de coins différents se décalaient : facettes en dents de scie au montant du pare-brise)
const zSurX=(P,x)=>{for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0]){const t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;}}return P[P.length-1][1];};
const colBout=(r,P,zs,n,ins,dir)=>{const o=[];if(r.t==='fc'){for(let i=0;i<=n;i++)o.push([0,mix(zs,dir>0?r.zc:r.zr,i/n)]);return o;}
  const xm=r.W-ins,zm=zSurX(P,xm),h=Math.round(n/2);
  for(let i=0;i<=n;i++){if(i<=h){const z=mix(zs,zm,i/h);o.push([xSur(P,z,dir)!=null?Math.min(r.W,xSur(P,z,dir)):r.W,z]);}
    else{const x=xm*(1-(i-h)/(n-h));o.push([x,zSurX(P,x)]);}}return o;};
// ============================ LE DÉCOUPAGE AU PLAN ============================
// vues : cote (u=z, v=y) · face (u=x, v=y) · dos (u=x, v=y) · dessus (u=z, v=x)
const UVf={cote:p=>[p[2],p[1]],face:p=>[p[0],p[1]],dos:p=>[p[0],p[1]],dessus:p=>[p[2],p[0]]},
      V3={cote:(du,dv)=>[0,dv,du],face:(du,dv)=>[du,dv,0],dos:(du,dv)=>[du,dv,0],dessus:(du,dv)=>[dv,0,du]};
const segsDe=(P,ferme)=>{const sg=[];const m=ferme?P.length:P.length-1;for(let i=0;i<m;i++){const a=P[i],b=P[(i+1)%P.length];
  sg.push([a[0],a[1],b[0],b[1],Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}return sg;};
const bbDe=(P,m)=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P){u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);}return [u0-m,u1+m,v0-m,v1+m];};
const dansP=(Z,u,v)=>{if(u<Z.bb[0]||u>Z.bb[1]||v<Z.bb[2]||v>Z.bb[3])return false;let c=false;for(const s of Z.sg)if((s[1]>v)!==(s[3]>v)&&u<(s[2]-s[0])*(v-s[1])/(s[3]-s[1])+s[0])c=!c;return c;};
// recouper un morceau convexe (sommets [u, v, l0, l1, l2]) par un segment
const croise=(a,b,c,d,e,f,g,h)=>{const o=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
        return ((o(e,f,g,h,a,b)>0)!==(o(e,f,g,h,c,d)>0))&&((o(a,b,c,d,e,f)>0)!==(o(a,b,c,d,g,h)>0));},
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
      bbP=P=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P){if(p[0]<u0)u0=p[0];if(p[0]>u1)u1=p[0];if(p[1]<v0)v0=p[1];if(p[1]>v1)v1=p[1];}return [u0,u1,v0,v1];},
      coupe=(Pp0,segs)=>{let parts=null;const b=Pp0.bb||(Pp0.bb=bbP(Pp0));for(const s of segs){if(s[5]<b[0]||s[4]>b[1]||s[7]<b[2]||s[6]>b[3])continue;
          if(!parts){if(!touche(Pp0,s))continue;parts=[Pp0];}const n2=[];
          for(const Pp of parts){const r=touche(Pp,s)?fend(Pp,s):null;if(r)n2.push(r[0],r[1]);else n2.push(Pp);}parts=n2;}return parts||[Pp0];};
// la distance (signée) d'un point à un trait, et la direction qui s'en éloigne
const loin=(L9,u,w)=>{const P9=L9.P;let bd=1e9,sg=1,du=0,dv=0;for(let i=0;i<P9.length-1;i++){const a=P9[i],b=P9[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1e-12,
    t=Math.max(0,Math.min(1,((u-a[0])*dx+(w-a[1])*dy)/l2)),ex=u-a[0]-t*dx,ey=w-a[1]-t*dy,d=Math.hypot(ex,ey);
    if(d<bd){bd=d;sg=(dx*ey-dy*ex)>=0?1:-1;const l=Math.sqrt(l2);du=-dy/l;dv=dx/l;}}return [bd,sg,du,dv];};
const RLF={j:{w:.0135,g:.0035,k:.22,lb:.010},h:{w:.016,g:0,k:.28}};   // joint : LA FENTE C (2026-10-19 : l'ombre, le fil — fenteRGB par sommet) ; pli : une arête de lumière
const ligneDe=(P0,kind,s,ferme)=>{const r=RLF[kind],P9=ferme?P0.concat([P0[0]]):P0,n=P9.length;if(n<2)return null;
  const nm=i=>{const a=P9[Math.max(0,i-1)],b=P9[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];};
  const off=d=>P9.map((p,i)=>{const m=nm(i);return [p[0]+m[0]*d,p[1]+m[1]*d];}),segs=[];
  const add=Q=>{for(const s of segsDe(Q,false))segs.push(s);};
  if(r.g){add(off(r.g));add(off(-r.g));if(r.lb){add(off(r.g+r.lb));add(off(-r.g-r.lb));}}else{add(P9);add(off(r.w));add(off(-r.w));}
  return {P:P9,r:r,segs:segs,bb:bbDe(P9,r.w),s:s||0};};
// LA DÉCOUPE (la même que LE COMBI) : chaque facette, dans la vue qui la regarde, recoupée par les contours et les traits qui la touchent
const decoupe=(TR,ZO,LG,CODES,PEINT,vueDe,GAP)=>{
    const OUT={},emet=(g,ps,n,k,ds)=>{const o=OUT[g]||(OUT[g]={P:[],N:[],K:[],D:[]});for(const p of ps){o.P.push(p[0],p[1],p[2]);o.N.push(n[0],n[1],n[2]);}o.K.push(k);o.D.push(ds?ds[0]:9,ds?ds[1]:9,ds?ds[2]:9);};
    // (2026-10-19, LA FENTE C) la distance signée d'un sommet au joint le plus proche (d > 0 du côté éclairé : le haut, ou l'avant) — 9 = loin
    const dJoint=(lgn,p)=>{let bd=9,sd=1;for(const [w,L] of lgn){if(L.r!==RLF.j)continue;const uv=UVf[w](p);if(uv[0]<L.bb[0]||uv[0]>L.bb[1]||uv[1]<L.bb[2]||uv[1]>L.bb[3])continue;
      const r=loin(L,uv[0],uv[1]);if(r[0]<bd){bd=r[0];const A=V3[w](r[2]*r[1],r[3]*r[1]);sd=(A[1]+.3*A[2])>=0?1:-1;}}return bd<RLF.j.g+RLF.j.lb+.002?bd*sd:9;};
    // (les contours et les traits rangés par tranches de 10 cm le long de u : une facette n'interroge que ceux de ses tranches)
    const RANGE=(L)=>{const T=new Map();L.forEach((Z,i)=>{for(let c=Math.floor(Z.bb[0]*10);c<=Math.floor(Z.bb[1]*10);c++){let a=T.get(c);if(!a)T.set(c,a=[]);a.push(i);}});return T;};
    const RZ={},RL={};for(const w in ZO){RZ[w]=RANGE(ZO[w]);RL[w]=RANGE(LG[w]);}
    let tampon=1;const VU=new Uint32Array(4096);
    const cand=(T,L,q)=>{tampon++;const o=[];for(let c=Math.floor(q[0]*10);c<=Math.floor(q[1]*10);c++){const a=T.get(c);if(!a)continue;
        for(const i of a){if(VU[i]===tampon)continue;VU[i]=tampon;const Z=L[i];if(!(q[1]<Z.bb[0]||q[0]>Z.bb[1]||q[3]<Z.bb[2]||q[2]>Z.bb[3]))o.push(i);}}o.sort((x,y)=>x-y);return o.map(i=>L[i]);};
    const bb3=(w,a,b,c)=>{const A=UVf[w](a),B=UVf[w](b),C=UVf[w](c);return [Math.min(A[0],B[0],C[0]),Math.max(A[0],B[0],C[0]),Math.min(A[1],B[1],C[1]),Math.max(A[1],B[1],C[1])];};
    let TA=null,TB=null,TC=null;
    const P3=q=>[q[0]*TA[0]+q[1]*TB[0]+q[2]*TC[0],q[0]*TA[1]+q[1]*TB[1]+q[2]*TC[1],q[0]*TA[2]+q[1]*TB[2]+q[2]*TC[2]],
          UV2=(w,x,y,z)=>w==='cote'?[z,y]:w==='dessus'?[z,x]:[x,y],
          enV=(w,Pp)=>{const o=new Array(Pp.length);for(let i=0;i<Pp.length;i++){const q=Pp[i],l0=q[0],l1=q[1],l2=q[2],x=l0*TA[0]+l1*TB[0]+l2*TC[0],y=l0*TA[1]+l1*TB[1]+l2*TC[1],z=l0*TA[2]+l1*TB[2]+l2*TC[2];
            o[i]=w==='cote'?[z,y,l0,l1,l2]:w==='dessus'?[z,x,l0,l1,l2]:[x,y,l0,l1,l2];}return o;},
          deV=Pp=>{const o=new Array(Pp.length);for(let i=0;i<Pp.length;i++){const q=Pp[i];o[i]=[q[2],q[3],q[4]];}return o;};
    for(const T of TR){const a=T[0],b=T[1],c=T[2],k0=T[3];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],wx=c[0]-a[0],wy=c[1]-a[1],wz=c[2]-a[2];let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const nl=Math.hypot(nx,ny,nz)||1;
      const un=[nx/nl,ny/nl,nz/nl],m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
      if(!PEINT.has(k0)){emet(CODES[k0].g,[a,b,c],un,k0);continue;}
      const v=vueDe(m,un),cote9=m[0]>0?1:-1;
      const zon=v?cand(RZ[v],ZO[v],bb3(v,a,b,c)).filter(Z=>!Z.s||Z.s===cote9):[];
      const AL={cote:Math.abs(un[0]),face:Math.max(0,un[2]),dos:Math.max(0,-un[2]),dessus:Math.max(0,un[1])},lgn=[];
      for(const w in AL){if(AL[w]<.5||!LG[w].length)continue;for(const L of cand(RL[w],LG[w],bb3(w,a,b,c)))if((!L.s||L.s===cote9)&&(L.r.g||AL[w]>=.8))lgn.push([w,L]);}
      if(!zon.length&&!lgn.length){emet(CODES[k0].g,[a,b,c],un,k0);continue;}
      TA=a;TB=b;TC=c;
      // (les morceaux restent dans la vue en cours — [u, v, barycentres] — tant qu'on recoupe dans la même vue)
      let vc=v||lgn[0][0],pcs=[enV(vc,[[1,0,0],[0,1,0],[0,0,1]])];
      const recoupe=sg=>{const n2=[];for(const Pp of pcs){const r=coupe(Pp,sg);for(const q of r)n2.push(q);}pcs=n2;};
      for(const Z of zon)recoupe(Z.sg);
      lgn.sort((x,y)=>x[0]<y[0]?-1:x[0]>y[0]?1:0);
      for(const [w,L] of lgn){if(w!==vc){pcs=pcs.map(Pp=>enV(w,deV(Pp)));vc=w;}recoupe(L.segs);}
      pcs=pcs.map(deV);
      for(const Pq of pcs){const g3=[0,0,0];for(const q of Pq){g3[0]+=q[0]/Pq.length;g3[1]+=q[1]/Pq.length;g3[2]+=q[2]/Pq.length;}
        const C3=P3(g3);let k=k0;if(v){const uv=UVf[v](C3);for(const Z of zon)if(Z.sur.indexOf(k)>=0&&dansP(Z,uv[0],uv[1]))k=Z.k;}
        let n=un,fen=null;
        if(PEINT.has(k)){let best=null,dc=1e9;for(const [w,L] of lgn){const uv=UVf[w](C3);if(uv[0]<L.bb[0]||uv[0]>L.bb[1]||uv[1]<L.bb[2]||uv[1]>L.bb[3])continue;const r=loin(L,uv[0],uv[1]);if(r[0]<L.r.w&&r[0]<dc){dc=r[0];best=[w,L,r];}}
          if(best){const [w,L,r]=best,R9=L.r;if(R9.g&&dc<R9.g){if(GAP&&GAP[k]!=null)k=GAP[k];else fen=0;}
            else{const tl=R9.g?-R9.k*Math.max(0,1-(dc-R9.g)/(R9.w-R9.g)):R9.k*Math.max(0,1-dc/R9.w);
              if(tl){let A=V3[w](r[2]*r[1],r[3]*r[1]);const an=A[0]*un[0]+A[1]*un[1]+A[2]*un[2];A=[A[0]-an*un[0],A[1]-an*un[1],A[2]-an*un[2]];const la=Math.hypot(A[0],A[1],A[2]);
                if(la>1e-6){n=[un[0]+A[0]/la*tl,un[1]+A[1]/la*tl,un[2]+A[2]/la*tl];const h=Math.hypot(n[0],n[1],n[2]);n=[n[0]/h,n[1]/h,n[2]/h];}}}}}
        const Pp=Pq.map(P3);for(let t=1;t<Pp.length-1;t++){const p0=Pp[0],p1=Pp[t],p2=Pp[t+1];
          const ex=p1[0]-p0[0],ey=p1[1]-p0[1],ez=p1[2]-p0[2],fx=p2[0]-p0[0],fy=p2[1]-p0[1],fz=p2[2]-p0[2],cx=ey*fz-ez*fy,cy=ez*fx-ex*fz,cz=ex*fy-ey*fx;
          if(cx*cx+cy*cy+cz*cz<1e-16)continue;const sw=(cx*un[0]+cy*un[1]+cz*un[2])<0;
          const ds=fen===0?[0,0,0]:PEINT.has(k)?[dJoint(lgn,p0),dJoint(lgn,sw?p2:p1),dJoint(lgn,sw?p1:p2)]:null;emet(CODES[k].g,sw?[p0,p2,p1]:[p0,p1,p2],n,k,ds);}}}
    return OUT;};
/* ============================ LE CAÏD — LE GMC HUMMER EV SUV (2024) ============================
   (2026-10-19, Léo : « refais-le en SUV » — le nez et tout le détail du pick-up gardés ; l'arrière refait sur les cotes du SUV : longueur
   5,00 roue de secours comprise, empattement 3,218, largeur 2,197, hauteur 1,976 : l'essieu arrière avance de 23 cm, la cabine va jusqu'au
   hayon (vitre de custode, montant arrière couleur caisse), le toit en panneaux de verre sur toute la longueur, le hayon porte la roue de
   secours ; les élargisseurs arrière se resserrent derrière la roue. Ce qui suit décrivait le pick-up.)
   Léo : « une magnifique GMC » — le HUMMER EV pick-up. Relevé sur le dessin coté de dimensions.com (profil, face, dos, dessus au même pas :
   104,9 unités par mètre, l'empattement 3,45 m ; longueur 5,51, largeur 2,20, hauteur 2,01 ; pneus de 35 pouces → R .45) ; les détails sur
   les photos de Commons (Edition 1 Interstellar White, Meteorite, Neptune Blue, Onyx Black). Ce qui le fait reconnaître, tout y est :
   · LA CAISSE MASSIVE ET ANGULEUSE : capot haut et large à bossage, pare-brise couché, cabine noire (montants, pavillon) aux quatre
     PANNEAUX DE TOIT amovibles, les AILERONS de la cabine (les « sails ») qui plongent dans la BENNE, la lunette en retrait entre eux ;
   · LA FACE : le BANDEAU LUMINEUX pleine largeur sur sa bande noire — les segments de lumière seuls, sans les lettres — et les feux
     en C aux deux bouts ; le bouclier noir, le sabot alu, les crochets rouges ;
   · les ÉNORMES PNEUS tout-terrain sur passages CARRÉS, les ÉLARGISSEURS noirs anguleux, les bas de caisse noirs et les marchepieds ;
   · LA POUPE : les FEUX EN C verticaux aux coins de la benne, le hayon, le bouclier noir. Électrique : pas de pots, deux fentes qui luisent.
   Aucun logo, aucun texte. Deux grilles de tôle (la méthode de LA PERLE) : le BAS (benne, flancs, ailes, face, hayon) et la SERRE (cabine) ;
   le capot est une nappe bombée qui s'enroule vers ses bords (le NEZ ARRONDI du 19/10, voir tB/rB/wN/dN). Repère : x à gauche, y en haut, z vers l'avant ; l'origine au milieu de la longueur. */
const R=.45,TW=.315,WX=.953,ZF=1.878,ZR=-1.340,W0=.98,ZN=2.72,ZT=-1.85,BELT=1.463,ZCOW=1.27,RC=.30,RFB=.22,DZB=ZT+2.71; // DZB : la poupe du pick-up (z −2,71) recalée sur celle du SUV
/* (2026-10-19, Léo : « plus arrondi le devant, et respirant le même air que le modèle original ») LE NEZ ARRONDI : le capot est une nappe
   bombée posée sur toute l'empreinte du nez (un rectangle aux coins arrondis de RC en plan) ; à moins de `rB(z)` de son bord elle S'ENROULE
   (un quart de cercle) jusqu'à la verticale, et les flancs comme la face montent jusque-là — les épaules coulent dans les ailes, le capot
   tombe sur le bandeau. tB = le niveau du capot (sans le bombé), rB = le rayon de l'enroulé (nul au pare-brise, 15 cm devant). */
const lis=t=>t*t*(3-2*t);
const tB=z=>lin([[ZCOW,BELT],[1.47,1.474],[1.88,1.455],[2.22,1.425],[2.50,1.38],[ZN,1.335]],z),
      rB=z=>.15*lis(cl((z-ZCOW)/.43,0,1)),
      wN=z=>z<=ZN-RC?W0:W0-RC+Math.sqrt(Math.max(0,RC*RC-(z-(ZN-RC))*(z-(ZN-RC)))),          // la demi-largeur du nez en plan
      dN=(x,z)=>{const a=Math.abs(x);if(z<=ZN-RC||a<=W0-RC)return Math.min(W0-a,ZN-z);return RC-Math.hypot(a-(W0-RC),z-(ZN-RC));}, // la distance au bord
      PL=z=>z<ZCOW?BELT:tB(z)-rB(z);
// LES PASSAGES DE ROUE CARRÉS : le bord de l'ouverture et celui de l'élargisseur (z, hauteur)
const FI=[[1.306,.364],[1.392,.755],[1.544,1.031],[1.602,1.073],[2.164,1.073],[2.221,1.041],[2.317,.879],[2.412,.707],[2.44,.459]],
      FO=[[1.268,.345],[1.382,.755],[1.525,1.127],[1.573,1.169],[1.745,1.174],[1.802,1.146],[2.183,1.146],[2.355,.974],[2.44,.669],[2.46,.44]],
      mR=A=>A.map(([z,y])=>{const d=z+1.573;return [ZR+(d<0?d*.73:d),y];}),                                      // (SUV) le passage arrière du pick-up, avancé et resserré derrière l'essieu
      RI=mR([[-2.107,.898],[-1.935,1.089],[-1.897,1.108],[-1.363,1.108],[-1.306,1.07],[-1.049,.745],[-1.04,.40]]),
      RO=mR([[-2.259,.898],[-1.992,1.213],[-1.954,1.232],[-1.745,1.232],[-1.687,1.194],[-1.325,1.184],[-1.268,1.146],[-1.039,.765],[-1.0,.62],[-1.0,.364]]);
const ARF=[[1.30,.50],[1.392,.755],[1.544,1.031],[1.602,1.073],[2.164,1.073],[2.221,1.041],[2.317,.879],[2.412,.707],[2.44,.62]],
      ARR=mR([[-2.12,.66],[-2.107,.898],[-1.935,1.089],[-1.897,1.108],[-1.363,1.108],[-1.306,1.07],[-1.049,.745],[-1.03,.50]]);
const YBb=z=>z>2.44?.62:z>=1.30?lin(ARF,z):z>ARR[ARR.length-1][0]?.50:z>=ARR[0][0]?lin(ARR,z):.66;
// LA GRILLE GÉNÉRIQUE (celle de LA CABOSSÉE) : + `bout`/`fx` (le contour du nez et ses colonnes aux x donnés),
// + `boutD`/`fxd` (pareil à la poupe : les ailerons de la cabine et la lunette en retrait), + `plafond(z)`
const colBoutX=(r,P,zs,n,ins,xs,dir)=>{const o=[];if(r.t==='fc'){for(let i=0;i<=n;i++)o.push([0,mix(zs,dir>0?r.zc:r.zr,i/n)]);for(const x of xs)o.push([0,dir>0?r.zc:r.zr]);return o;}
  const xm=r.W-ins,zm=zSurX(P,xm);for(let i=0;i<=n;i++){const z=mix(zs,zm,i/n);o.push([xSur(P,z,dir)!=null?Math.min(r.W,xSur(P,z,dir)):r.W,z]);}
  for(const x of xs)o.push([x,zSurX(P,x)]);return o;};
const grille=D=>{
  const ROWS=D.rows.slice(),IL=ROWS.length-1;for(const u of D.toit.u)ROWS.push({t:'r',u:u});
  const nez=r=>{if(D.bout&&r.t!=='fc')return D.bout(r);if(r.t==='fc')return [[0,D.zs1-.6],[0,r.zc]];const o=[[r.W,D.zs1-.6]],rc=r.rf;
      for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zc-rc+rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zc]);return o;},
        dos=r=>{if(D.boutD&&r.t!=='fc')return D.boutD(r);if(r.t==='fc')return [[0,D.zs0+.6],[0,r.zr]];const o=[[r.W,D.zs0+.6]],rc=r.rr;
      for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zr+rc-rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zr]);return o;};
  const NP=[],DP=[],FN=[],FD=[];
  for(const r of ROWS){if(r.t==='r'){NP.push(null);DP.push(null);FN.push(null);FD.push(null);continue;}
    const a=nez(r),b=dos(r);NP.push(a);DP.push(b);
    FN.push(D.fx?colBoutX(r,a,D.zs1,D.nf,D.ins,D.fx,1):colBout(r,a,D.zs1,D.nf,D.ins,1));
    FD.push(D.fxd?colBoutX(r,b,D.zs0,D.nr,D.ins,D.fxd,-1):colBout(r,b,D.zs0,D.nr,D.ins,-1));}
  const NF=D.fx?D.nf+D.fx.length:D.nf,NR=D.fxd?D.nr+D.fxd.length:D.nr;
  const xAt=(j,z)=>{const r=ROWS[j];if(r.t==='fc')return 0;let x=r.W;if(z>D.zs1-.6){const v=xSur(NP[j],z,1);if(v!=null)x=Math.min(x,v);}
    if(z<D.zs0+.6){const v=xSur(DP[j],z,-1);if(v!=null)x=Math.min(x,v);}return x;};
  const ZS=(()=>{const s=new Set();for(let z=D.zs0;z<D.zs1+.001;z+=D.pas)s.add(+z.toFixed(3));for(const z of (D.plus||[]))s.add(+z.toFixed(4));s.add(D.zs1);
    return [...s].filter(z=>z>=D.zs0-1e-6&&z<=D.zs1+1e-6).sort((a,b)=>a-b).filter((z,i,A)=>i===0||z-A[i-1]>.012);})();
  const COL=[];for(let i=NR;i>0;i--)COL.push({k:'d',i:i});for(const z of ZS)COL.push({k:'s',z:z});for(let i=1;i<=NF;i++)COL.push({k:'n',i:i});
  const YB=D.yb,PF=D.plafond||(()=>9),hy=(y,z)=>Math.min(y,PF(z)),point=(c,j)=>{const r=ROWS[j];
    if(c.k==='s'){const z=c.z,yb=YB(z);if(r.t==='fc')return [0,yb,z];if(r.t==='fe')return [xAt(j,z),yb,z];
      if(r.t==='s')return [xAt(j,z),Math.max(hy(r.y,z),yb),z];return [r.u*xAt(IL,z),D.toit.y(r.u,z),z];}
    const S=c.k==='n'?FN:FD;if(r.t==='r'){const q=S[IL][c.i];return [r.u*q[0],D.toit.y(r.u,q[1]),q[1]];}
    const q=S[j][c.i];return [q[0],r.t==='s'?Math.max(hy(r.y,q[1]),YB(q[1])):YB(q[1]),q[1]];};
  return {ROWS:ROWS,COL:COL,IL:IL,G:COL.map(c=>ROWS.map((r,j)=>point(c,j)))};};
// ---- LE BAS : benne, flancs, ailes, la face (coins très arrondis en plan), le hayon ----
const RB=(y,W)=>({t:'s',y:y,W:W,zc:ZN,zr:ZT,rf:y>=.80?RC:RFB,rr:.09}),
      BAS={rows:[{t:'fc',zc:ZN,zr:ZT},{t:'fe',W:.93,zc:ZN,zr:ZT,rf:RFB,rr:.08}].concat([[.50,.95],[.58,.975],[.66,W0],[.76,W0],[.86,W0],[.95,W0],[1.03,W0],[1.10,W0],
          [1.17,W0],[1.24,W0],[1.30,W0],[1.36,W0],[1.42,W0],[BELT,W0]].map(([y,W])=>RB(y,W))),toit:{u:[],y:()=>0},plafond:PL,
        zs0:ZT+.11,zs1:2.40,nr:8,nf:12,ins:.32,pas:.22,yb:YBb,plus:FI.map(p=>p[0]).concat(RI.map(p=>p[0]),ARF.map(p=>p[0]),ARR.map(p=>p[0]),
          [ZCOW,1.24,.105,.09,-.51,-.55,-.60,1.47,1.88,2.22,2.52,2.65])};
// ---- LA SERRE : la cabine noire — pare-brise couché, pavillon, et derrière les deux AILERONS qui encadrent la lunette en retrait ----
const zW=y=>1.268-(y-1.379)*.739,zS=y=>lin([[BELT,ZT],[1.95,ZT+.13]],y),YT=1.95,
      HDR=[[0,.07],[.3,.069],[.6,.064],[.8,.053],[.9,.04],[.96,.022],[1,0]],BRF=[[0,0],[.02,.45],[.05,.78],[.1,.93],[.3,1]],
      SERRE={rows:[[BELT,.975],[1.55,.965],[1.65,.95],[1.75,.93],[1.85,.905],[1.93,.875],[YT,.86]].map(([y,W])=>({t:'s',y:y,W:W,zc:zW(y),zr:zS(y),rf:.07,rr:.05})),
        toit:{u:[1,.96,.9,.8,.6,.3,0],y:(u,z)=>{const B=Math.min(lin(BRF,zW(YT)-z),lin(BRF,z-zS(YT)));return YT+lin(HDR,u)*B;}},
        zs0:ZT+.12,zs1:.45,nr:6,nf:10,ins:.06,pas:.22,yb:()=>-1,plus:[.105,.09,-.03,.12,-.52,-.60,ZT+.25,ZT+.30]};
// un contour aux coins arrondis (rayon r, n pas par coin)
const arrondi=(P,r,n)=>{const o=[],m=P.length;n=n||4;for(let i=0;i<m;i++){const a=P[(i-1+m)%m],p=P[i],b=P[(i+1)%m];
  const ua=[a[0]-p[0],a[1]-p[1]],ub=[b[0]-p[0],b[1]-p[1]],la=Math.hypot(ua[0],ua[1]),lb=Math.hypot(ub[0],ub[1]),rr=Math.min(r,la*.45,lb*.45);
  const A=[p[0]+ua[0]/la*rr,p[1]+ua[1]/la*rr],B=[p[0]+ub[0]/lb*rr,p[1]+ub[1]/lb*rr];
  for(let k=0;k<=n;k++){const t=k/n,s=1-t;o.push([s*s*A[0]+2*s*t*p[0]+t*t*B[0],s*s*A[1]+2*s*t*p[1]+t*t*B[1]]);}}return o;};
const rrect=(u0,v0,u1,v1,r,n)=>arrondi([[u0,v0],[u1,v0],[u1,v1],[u0,v1]],r,n);
const CODES=[];CODES[0]={g:'#'};CODES[1]={g:'#',k:.38};CODES[2]={g:'g',c:0x1d2a36};CODES[3]={g:'g',c:0x0b0c0f};CODES[23]={g:'m',c:0x16171b};
CODES[25]={g:'m',c:0x32333a};CODES[26]={g:'m',c:0x1c1d21};
const PEINT=new Set([0,26]),GAP={26:25};
// LA DÉCOUPE, une fois par session (≈30 ms) : `pre` la fait faire dans un moment creux (voir le bloc d'intégration), sinon le 1er montage la fait
const cuire=()=>{let C9=CACHE[0];if(C9)return C9;
    const TR=[],ref=c=>[0,1.1,cl(c[2],ZT+.4,2.2)];
    const tri=(a,b,c,k)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      if(nx*nx+ny*ny+nz*nz<1e-12)return;const m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],r=ref(m);
      if(nx*(m[0]-r[0])+ny*(m[1]-r[1])+nz*(m[2]-r[2])<0)TR.push([a,c,b,k]);else TR.push([a,b,c,k]);};
    const M=p=>[-p[0],p[1],p[2]];
    for(const [D,bas] of [[BAS,1],[SERRE,0]]){const g=grille(D),G=g.G;
      for(let c=0;c<g.COL.length-1;c++)for(let j=0;j<g.ROWS.length-1;j++){
        const A=G[c][j],B=G[c+1][j],C=G[c+1][j+1],E=G[c][j+1];let k;
        if(bas){k=j<=1?23:0;if(!k&&A[1]<=YBb(A[2])+.001&&B[1]<=YBb(B[2])+.001&&C[1]<=YBb(C[2])+.001&&E[1]<=YBb(E[2])+.001)k=23;}
        else{const mx=(A[0]+B[0]+C[0]+E[0])/4,mz=(A[2]+B[2]+C[2]+E[2])/4,my=(A[1]+B[1]+C[1]+E[1])/4;k=(mx>.70&&mz<ZT+.25&&my<1.935)?0:26;}  // (SUV) le montant arrière couleur caisse, le reste de la cabine noir
        for(const f of [p=>p,M]){tri(f(A),f(B),f(C),k);tri(f(A),f(C),f(E),k);}}}
    // ---- LES CONTOURS ----
    const ZO={cote:[],face:[],dos:[],dessus:[]},LG={cote:[],face:[],dos:[],dessus:[]};
    const zone=(v,k,P,o)=>{o=o||{};ZO[v].push({k:k,sg:segsDe(P,true),bb:bbDe(P,0),s:o.s||0,sur:o.sur||[0]});},
          joint=(v,P,s,ferme)=>{const L=ligneDe(P,'j',s,ferme);if(L)LG[v].push(L);},pli=(v,P,s,ferme)=>{const L=ligneDe(P,'h',s,ferme);if(L)LG[v].push(L);};
    // les vitres (sur la cabine noire), le pare-brise, la lunette entre les ailerons
    zone('cote',2,arrondi([[1.13,1.49],[.85,1.885],[.12,1.885],[.12,1.49]],.04),{sur:[26]});
    zone('cote',2,arrondi([[-.03,1.49],[-.03,1.885],[-.52,1.885],[-.52,1.49]],.04),{sur:[26]});
    zone('cote',2,arrondi([[-.60,1.49],[-.60,1.885],[ZT+.31,1.885],[ZT+.36,1.49]],.04),{sur:[26]});                     // (SUV) la vitre de custode
    zone('face',2,rrect(-.86,1.50,.86,1.925,.04),{sur:[26]});
    zone('dos',2,rrect(-.64,1.54,.64,1.88,.05),{sur:[26]});
    // les quatre PANNEAUX DE TOIT amovibles (verre fumé brillant sur le cadre mat)
    for(const [z0,z1] of [[.12,.80],[-.78,-.04],[ZT+.26,-.86]])for(const s of [-1,1])zone('dessus',3,rrect(z0,s>0?.05:-.70,z1,s>0?.70:-.05,.04),{sur:[26]}); // (SUV) + la paire au-dessus du coffre
    // LA FACE : couleur caisse, la BARRE NOIRE du bandeau lumineux, une fente noire dessous (le bas est derrière le bouclier)
    zone('face',3,rrect(-.985,1.035,.985,1.168,.02));zone('face',3,rrect(-.62,.968,.62,.99,.008));
    for(const s of [1,-1])zone('cote',3,[[ZN-RC-.02,1.035],[ZN+.05,1.035],[ZN+.05,1.168],[ZN-RC-.02,1.168]],{s:s});
    // les portes (sous la ceinture : au-dessus, la cabine est noire), le hayon, les plis
    joint('cote',[[1.24,BELT],[1.24,.68],[1.20,.64],[.14,.64],[.105,.68],[.105,BELT]]);
    joint('cote',[[.09,BELT],[.09,.68],[.055,.64],[-.47,.64],[-.51,.70],[-.59,.92],[-.60,1.20],[-.56,BELT]]);          // (SUV) la porte arrière, qui contourne le passage avancé
    pli('cote',[[2.05,1.27],[1.45,1.31],[ZT+.08,1.31]]);pli('cote',[[1.17,.88],[-.50,.88]]);
    joint('dos',rrect(-.80,.94,.80,BELT+.012,.03),0,true);pli('dos',[[-.78,1.04],[.78,1.04]]);                              // (SUV) le hayon
    const vueDe=(m,n)=>{if(m[2]>2.4&&n[2]>.5)return 'face';if(m[2]>.7&&m[1]>1.45&&n[2]>.5)return 'face';
      if(m[2]<ZT+.2&&n[2]<-.5)return 'dos';if(m[2]<-.6&&m[1]>1.46&&n[2]<-.5)return 'dos';
      if(n[1]>.7)return 'dessus';if(Math.abs(n[0])>.3)return 'cote';return null;};
    const OUT=decoupe(TR,ZO,LG,CODES,PEINT,vueDe,GAP);
    C9={};for(const g in OUT){const o=OUT[g];C9[g]={P:new Float32Array(o.P),N:new Float32Array(o.N),K:Uint8Array.from(o.K),D:new Float32Array(o.D)};}
    return CACHE[0]=C9;};
const monte=function(K){
  const SP=K.spec||{},CORPS=SP.color!=null?SP.color:0x7cb83f;
  const PAL={p:{g:'p',c:CORPS},k:{g:'m',c:0x16171b},K:{g:'g',c:0x0b0c0f},c:{g:'c',c:0xd4d8de},C:{g:'c',c:0x6c727b},g:{g:'g',c:0x1d2a36},
    W:{g:'l',c:0xfff6e6},L:{g:'l',c:0xff2a36},O:{g:'l',c:0xffa21a},Q:{g:'l',c:0xe8e8e8},T:{g:'m',c:0x1e2024},r:{g:'m',c:0xc8102e},R:{g:'m',c:0x7a1018},V:{g:'m',c:0x34363b}};
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const CPx=new THREE.Color(),fondu=y=>.80+.20*cl((y-.25)/1.0,0,1),colP=y=>{CPx.setHex(EP.c);if(EP.grad&&typeof lpGrad==='function')lpGrad(EP.grad,y,CPx);
    const s=((EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0)?fondu(y):1;return [CPx.r*s,CPx.g*s,CPx.b*s];};
  const C9=cuire();
  // ---- LA CAISSE POSÉE : ses couleurs (la peinture de la boutique comprise) ----
  const gs={},BASE=(()=>{CPx.setHex(EP.c);return [CPx.r,CPx.g,CPx.b];})(),pDe=(EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0,FIX=CODES.map(d=>{if(!d||d.c==null)return null;CPx.setHex(d.c);return [CPx.r,CPx.g,CPx.b];});
  const FE9=typeof fenteVar==='function'?fenteVar():null,FC9=[0,0,0];   // (2026-10-19) LA FENTE C : la variante lue une fois (`?fente=A` = le trait noir d'avant)
  for(const g0 in C9){const c=C9[g0],g=g0==='#'?GP:g0,col=new Float32Array(c.P.length);
    for(let t=0;t<c.K.length;t++){const kk=c.K[t],d=CODES[kk],F=FIX[kk];for(let q=0;q<3;q++){const i=t*9+q*3,y=c.P[i+1];let r,gg,b;
      if(!F){if(EP.grad&&typeof lpGrad==='function'){[r,gg,b]=colP(y);}else{const s=pDe?fondu(y):1;r=BASE[0]*s;gg=BASE[1]*s;b=BASE[2]*s;}if(d.k){r*=d.k;gg*=d.k;b*=d.k;}}
      else{const f=d.g==='#'?fondu(y):1;r=F[0]*f;gg=F[1]*f;b=F[2]*f;}
      if(c.D&&FE9&&PEINT.has(kk)){const dv=c.D[t*3+q];if(dv<8&&dv>-8){FC9[0]=r;FC9[1]=gg;FC9[2]=b;fenteRGB(FC9,dv,RLF.j.g,FC9,FE9);r=FC9[0];gg=FC9[1];b=FC9[2];}}
      col[i]=r;col[i+1]=gg;col[i+2]=b;}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(c.P.slice(),3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(c.N.slice(),3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    if(gs[g]){const H=gs[g],cat=(A,B)=>{const o=new Float32Array(A.length+B.length);o.set(A);o.set(B,A.length);return o;},n2=new THREE.BufferGeometry();
      for(const at of ['position','normal','color'])n2.setAttribute(at,new THREE.Float32BufferAttribute(cat(H.attributes[at].array,geo.attributes[at].array),3));H.dispose();geo.dispose();gs[g]=n2;}
    else gs[g]=geo;}
  K.commit({done:()=>gs,prims:[]});
  // ============================ LES PIÈCES ============================
  const P=K.kit(PAL);
  const tour=(pts,n)=>{const g=new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1])),n||16);g.rotateX(Math.PI/2);return g;};
  const tige=(k,a,b,r)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(d[0],d[1],d[2]),g=new THREE.CylinderGeometry(r,r,l,6);g.translate(0,l/2,0);
    const e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(d[0]/l,d[1]/l,d[2]/l)));P.put(k,g,a[0],a[1],a[2],e.x,e.y,e.z);};
  const quad=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};
  const pave=(k,Q,y0,y1)=>{const n=Q.length,cx=Q.reduce((s,q)=>s+q[0],0)/n,cz=Q.reduce((s,q)=>s+q[1],0)/n;
    for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n];quad(k,[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]);
      P.tri(k,[cx,y1,cz],[a[0],y1,a[1]],[b[0],y1,b[1]]);P.tri(k,[cx,y0,cz],[b[0],y0,b[1]],[a[0],y0,a[1]]);}};
  const off=(P9,d)=>{const o=[];for(let i=0;i<P9.length;i++){const a=P9[Math.max(0,i-1)],b=P9[Math.min(P9.length-1,i+1)],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy)||1;o.push([P9[i][0]-dy/l*d,P9[i][1]+dz/l*d]);}return o;},
        bande=(P9,d0,d1)=>off(P9,d0).concat(off(P9,d1).reverse()),
        pas=(P9,h)=>{const o=[];let acc=h/2;for(let i=1;i<P9.length;i++){const a=P9[i-1],b=P9[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc<=l){const t=acc/l;o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);acc+=h;}acc-=l;}return o;};
  const plan=(H,s)=>{const o=[];for(const [x,z] of H)o.push([x,z]);for(let i=H.length-1;i>=0;i--)if(H[i][0]!==0)o.push([-H[i][0],H[i][1]]);if(s)o.reverse();return o;};
  // LE CAPOT BOMBÉ : une nappe sur toute l'empreinte du nez, qui s'enroule vers ses bords (les ailes, la face) ; au fond, le PANNEAU NOIR
  // mat devant le pare-brise ; devant lui le dôme central du capot
  {const dome=(x,z)=>{const u=Math.abs(x);return .026*lis(cl((.445-u)/.022,0,1))*lis(cl((z-1.70)/.06,0,1))*lis(cl((2.40-z)/.18,0,1));},  // le dôme, ses NERVURES nettes (2 cm)
     PAN=[1.33,1.74,.60],dansPan=(x,z)=>Math.abs(x)<PAN[2]&&z>PAN[0]&&z<PAN[1],
     H=(x,z)=>{const w=wN(z),r=rB(z),d=dN(x,z),bombe=.05*Math.max(0,1-(x/w)*(x/w))*cl((ZN-z)/.35,0,1),tc=tB(z)+bombe+dome(x,z)-(dansPan(x,z)?.008:0);
       if(r<.002)return tc;const q=Math.min(d,r);return tc-r+Math.sqrt(Math.max(0,r*r-(r-q)*(r-q)));},
     ED=[0,.006,.025,.055,.095,.15,.22],FR=[0,.1,.2,.3,.4,.5,.6,.7,.8,.9],
     ZH=(()=>{const o=new Set([ZCOW,1.30,1.33,1.45,1.55,1.64,1.74,1.80,1.92,2.05,2.18,2.30,2.40,ZN-RC,2.46]);for(const e of ED)o.add(+(ZN-e).toFixed(4));
       return [...o].sort((p,q)=>p-q);})(),
     S=z=>{const w=wN(z),k=(w-.22)/(W0-.22),P9=[];for(const f of FR)if(f>0)P9.push((w-.22)*f);
       for(const x of [.423,.445,.60])P9.push(x*k);                                                                            // les nervures, le bord du panneau (même nombre de points à chaque rang)
       for(const e of ED)P9.push(w-e);P9.sort((p,q)=>p-q);const o=P9.slice().reverse().map(x=>-x).concat([0],P9);return o.map(x=>[x,H(x,z),z]);};
   for(let i=0;i<ZH.length-1;i++){const A=S(ZH[i]),B=S(ZH[i+1]);for(let j=0;j<A.length-1;j++){
     const mx=(A[j][0]+A[j+1][0])/2,mz=(ZH[i]+ZH[i+1])/2;quad(dansPan(mx,mz)?'k':'p',A[j],B[j],B[j+1],A[j+1]);}}
   {const A=S(ZCOW);for(let j=0;j<A.length-1;j++){const a=A[j],b=A[j+1];quad('k',a,[a[0],BELT-.01,ZCOW],[b[0],BELT-.01,ZCOW],b);}}
   // les OUÏES : trois fentes noires de chaque côté du capot, derrière les épaules
   P.sym(sd=>{for(let i=0;i<3;i++){const z=1.50+i*.055,x=sd*.76;P.box('K',.17,.008,.024,x,H(x,z)+.002,z);}});
   // le joint du capot sur le panneau noir (un trait clair au bord avant du panneau)
   P.box('C',1.20,.004,.008,0,H(0,PAN[1])+.003,PAN[1]+.004);
   quad('k',[-W0,BELT+.002,zW(BELT)-.02],[W0,BELT+.002,zW(BELT)-.02],[W0,BELT+.002,ZCOW],[-W0,BELT+.002,ZCOW]);}                      // l'auvent sous le pare-brise                                     // le pont noir entre les ailerons
  // LA FACE : le BANDEAU LUMINEUX — six segments séparés (sans lettres), les longs phares aux bouts, et leur coin AMBRE qui tourne sur
  // l'arrondi de la face ; les antibrouillards dans le bouclier
  {const z=ZN+.007,y=1.102;
   for(let i=0;i<6;i++){const x=-.3625+i*.145;P.box('W',.122,.05,.008,x,y,z);P.box('C',.13,.058,.004,x,y,z-.003);}
   P.sym(sd=>{P.box('W',.20,.05,.008,sd*.565,y,z);P.box('C',.21,.058,.004,sd*.565,y,z-.003);
     for(let i=0;i<7;i++){const t=.06+i*.115,rr=RC+.006,x=sd*(W0-RC+rr*Math.sin(t)),zz=ZN-RC+rr*Math.cos(t);P.box(i<2?'W':'O',.04,.05,.008,x,y,zz,0,sd*t,0);}
     // l'ANTIBROUILLARD dans son boîtier carré : le boîtier noir, le cadre chromé, la vitre, le projecteur rond
     P.box('K',.19,.115,.03,sd*.735,.875,2.775);P.box('C',.155,.082,.004,sd*.735,.875,2.7915);P.box('g',.14,.068,.004,sd*.735,.875,2.794);
     P.put('W',tour([[.028,.0],[0,.004]],16),sd*.70,.877,2.793);P.put('c',new THREE.TorusGeometry(.031,.004,4,16),sd*.70,.877,2.797);P.box('W',.05,.012,.004,sd*.775,.877,2.797);});}
  // LE BOUCLIER AVANT noir : la barre haute qui dépasse, la grande prise d'air, le SABOT alu, les crochets rouges
  pave('k',plan([[0,2.784],[.60,2.784],[.74,2.776],[.86,2.748],[.94,2.70],[.985,2.62],[1.0,2.46]]),.80,.95);
  pave('k',plan([[0,2.75],[.62,2.75],[.76,2.742],[.87,2.712],[.945,2.66],[.985,2.58],[.995,2.46]]),.50,.80);
  P.box('K',1.62,.012,.012,0,.948,2.79);                                                                          // la lèvre brillante du bouclier
  // LA CALANDRE à lames horizontales, en retrait dans le bouclier, et la CAMÉRA au milieu
  P.box('K',1.02,.19,.006,0,.695,2.753);for(let i=0;i<6;i++)P.box('k',.98,.012,.026,0,.618+i*.031,2.762,-.35,0,0);
  P.sym(sd=>{P.box('K',.012,.19,.03,sd*.505,.695,2.762);P.box('K',.05,.17,.008,sd*.585,.665,2.754);for(let i=0;i<4;i++)P.box('k',.042,.008,.012,sd*.585,.60+i*.04,2.759);}); // ses montants, les prises d'air
  P.box('K',.06,.034,.02,0,.785,2.762);P.put('g',tour([[.009,0],[0,.003]],10),0,.785,2.772);
  // le SABOT alu brossé : la plaque de face (ajourée, vissée), ses deux montants autour des anneaux, son dessous qui file sous la caisse
  P.box('C',1.30,.13,.025,0,.565,2.768);P.box('C',1.20,.10,.20,0,.47,2.66,.45,0,0);P.box('C',.70,.05,.14,0,.40,2.58,.30,0,0);
  for(const x of [-.13,0,.13])P.box('K',.09,.035,.006,x,.55,2.782);
  for(const x of [-.58,-.46,-.20,.20,.46,.58])P.cyl('c',.009,.008,8,x,.60,2.782,'z');
  P.sym(sd=>{P.box('C',.22,.15,.025,sd*.31,.675,2.772);P.box('K',.15,.105,.01,sd*.31,.675,2.785);              // le montant, la niche de l'anneau
    P.put('r',new THREE.TorusGeometry(.036,.011,6,14),sd*.31,.655,2.80,0,Math.PI/2,0);P.cyl('c',.008,.10,8,sd*.31,.692,2.80,'x');  // l'ANNEAU DE REMORQUAGE, sa goupille
    for(const y of [.62,.73])P.cyl('c',.008,.008,8,sd*.40,y,2.786,'z');});
  P.box('K',1.10,.02,.01,0,.505,2.752);                                                                            // la lèvre basse
  // LES ÉLARGISSEURS noirs anguleux, les joues des passages de roue, les bas de caisse noirs, les marchepieds
  P.sym(sd=>{P.prism('k',FO.concat(FI.slice().reverse()),.18,sd*1.01);P.prism('k',RO.concat(RI.slice().reverse()),.18,sd*1.01);
    for(const A of [FO,RO]){P.prism('k',bande(A,0,.035),.20,sd*1.012);                                            // le BORD ÉPAIS de l'élargisseur
      for(const q of pas(off(A,-.05),.16))P.cyl('V',.011,.010,8,sd*1.106,q[1],q[0],'x');}                          // ses VIS apparentes (19/10 : acier noirci — en chrome elles sortaient en clous blancs)
    for(const A of [FI,RI])P.prism('k',A.concat([[A[A.length-1][0],.30],[A[0][0],.30]]),.16,sd*.70);
    P.prism('k',[[-.79,.36],[1.29,.36],[1.36,.62],[1.24,.66],[-.75,.66],[-.81,.62]],.13,sd*.985);
    P.box('k',.10,.07,1.88,sd*1.07,.42,.24);P.box('T',.07,.008,1.82,sd*1.07,.457,.24);
    for(let i=0;i<9;i++)P.box('K',.085,.008,.035,sd*1.07,.464,-.61+i*.21);                                       // le GRIP du marchepied
    for(const z of [-.71,1.19])P.box('k',.10,.075,.03,sd*1.07,.42,z);                                              // ses embouts
    for(const z of [-.58,.24,1.0])P.box('k',.12,.05,.08,sd*1.0,.42,z);
    // les rétros carrés noirs, les poignées affleurantes
    tige('K',[sd*.975,1.47,1.10],[sd*1.06,1.52,1.02],.02);P.box('p',.12,.22,.20,sd*1.12,1.56,.98);P.box('K',.12,.03,.18,sd*1.12,1.44,.98);P.box('g',.09,.18,.004,sd*1.12,1.56,.879);
    P.box('K',.004,.032,.17,sd*1.181,1.52,.98);P.box('O',.004,.016,.15,sd*1.183,1.52,.98);                        // le CLIGNOTANT du rétro (fente noire, ambre dedans)
    for(const z of [.31,-.62]){P.box('K',.012,.058,.17,sd*.986,1.31,z);P.box('C',.016,.022,.135,sd*.998,1.31,z);P.box('C',.02,.018,.012,sd*1.002,1.31,z+.072);}});  // les POIGNÉES : la niche, la barre chromée, son pied
  // LA POUPE : les FEUX EN C verticaux aux coins de la benne (et leur retour sur le flanc), le bouclier noir, la plaque (`plqDessinee`)
  P.sym(sd=>{const z=ZT-.012;P.box('K',.15,.38,.03,sd*.855,1.27,ZT-.005);
    P.box('L',.03,.34,.01,sd*.905,1.27,z-.012);P.box('L',.09,.03,.01,sd*.855,1.425,z-.012);P.box('L',.09,.03,.01,sd*.855,1.115,z-.012);P.box('L',.05,.20,.006,sd*.84,1.27,z-.01);
    for(const y of [1.20,1.34])P.box('C',.07,.006,.004,sd*.848,y,z-.016);for(let i=0;i<5;i++)P.box('L',.012,.012,.004,sd*.875,1.17+i*.05,z-.017);   // les réflecteurs, les points de LED
    P.box('W',.06,.03,.006,sd*.86,1.07,z-.012);
    P.box('L',.01,.30,.05,sd*(W0+.005),1.27,ZT+.035);});
  pave('k',plan([[0,-2.783+DZB],[.80,-2.783+DZB],[.96,-2.74+DZB],[1.0,-2.66+DZB],[1.0,-2.52+DZB]],1),.557,.90);
  P.box('K',1.40,.012,.012,0,.895,-2.788+DZB);                                                                     // la lèvre du bouclier
  // l'ATTELAGE : le tube carré, son trou, la goupille, la prise
  P.box('k',.08,.08,.24,0,.50,-2.80+DZB);P.box('K',.05,.05,.006,0,.50,-2.922+DZB);P.cyl('C',.008,.12,8,0,.50,-2.86+DZB,'x');P.box('k',.05,.04,.04,.13,.52,-2.79+DZB);
  // le HAYON : sa poignée (côté charnières opposé), la caméra, les charnières à droite
  P.box('K',.04,.20,.02,-.66,1.18,ZT-.012);P.box('C',.02,.15,.03,-.66,1.18,ZT-.022);P.box('K',.04,.03,.02,0,.97,ZT-.012);P.put('g',tour([[.008,0],[0,.003]],10),0,.97,ZT-.022,Math.PI,0,0);
  for(const y of [1.0,1.38])P.box('k',.07,.10,.04,.77,y,ZT-.018);
  P.box('Q',.45,.12,.01,0,.74,-2.788+DZB);P.sym(sd=>{P.box('K',.13,.10,.02,sd*.42,.69,-2.786+DZB);P.box('R',.10,.02,.008,sd*.85,.82,-2.786+DZB);});
  // LA ROUE DE SECOURS sur le hayon : son support, le pneu à pavés (le même que les autres), la jante noire à dix branches, le moyeu
  {const xs=.10,ys=1.32,h=TW/2,zc=ZT-.10-h;
   P.box('k',.30,.30,.10,xs,ys,ZT-.05);
   P.put('k',tour([[.235,h],[.40,h],[R,h*.62],[R,-h*.62],[.40,-h],[.235,-h]],28),xs,ys,zc);
   for(let i=0;i<28;i++){const a=i/28*Math.PI*2,c9=Math.cos(a),s9=Math.sin(a);
     for(const d of [-1,1]){const b=a+d*.05;P.put('k',new THREE.BoxGeometry(.078,.042,TW*.34),xs+Math.cos(b)*(R+.012),ys+Math.sin(b)*(R+.012),zc+d*TW*.27,0,0,b-Math.PI/2);}
     P.put('k',new THREE.BoxGeometry(.07,i%2?.055:.085,.034),xs+c9*(R-(i%2?.03:.045)),ys+s9*(R-(i%2?.03:.045)),zc-h-.012,0,0,a-Math.PI/2);}
   P.put('T',tour([[.236,-h+.012],[.233,-h-.004],[.205,-h-.01],[.07,-h-.004],[0,-h-.002]],24),xs,ys,zc);
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const d of [-1,1]){const b=a+d*.20;P.box('T',.05,.13,.02,xs+Math.cos(b)*.14,ys+Math.sin(b)*.14,zc-h-.012,0,0,b-Math.PI/2);}}
   P.put('C',tour([[.06,-h-.014],[.04,-h-.022],[0,-h-.024]],14),xs,ys,zc);} // les catadioptres : rouge MAT (un rouge allumé à l'arrière, le jeu le prend pour un feu : halo et traînées tombaient dessous)
  // LE TOIT : l'épine et la traverse entre les quatre panneaux de verre, les BARRES de toit et leurs pieds
  {const zr=ZT+.22,L9=.82-zr;P.box('k',.05,.014,L9,0,2.022,(.82+zr)/2);for(const z of [.04,-.82])P.box('k',1.44,.014,.06,0,2.022,z);
   P.sym(sd=>{P.box('k',.03,.024,L9-.05,sd*.74,2.022,(.80+zr)/2);for(const z of [zr+.05,-.40,.30,.74])P.box('k',.05,.02,.05,sd*.74,2.008,z);});}
  // LES CINQ FEUX AMBRE posés sur le bord avant du pavillon
  for(let i=0;i<5;i++)P.box('O',.045,.022,.035,-.30+i*.15,YT+.03,zW(YT)-.03);
  // l'aileron de pavillon et son 3e feu stop
  P.box('k',1.36,.03,.20,0,YT+.06,ZT+.17);P.box('L',.40,.02,.015,0,YT+.06,ZT+.066);
  // dessous : les moteurs électriques, le plancher (la batterie)
  P.box('k',1.70,.20,3.9,0,.52,.40);P.cyl('k',.06,1.6,10,0,R,ZF,'x');P.cyl('k',.06,1.6,10,0,R,ZR,'x');
  P.box('k',.50,.30,.50,0,.50,ZF);P.box('k',.50,.30,.50,0,.50,ZR);
  K.commit(P);
  // ---- LES ROUES : pneus de 35 pouces tout-terrain à gros pavés, jantes de 18 noires à huit branches, faux beadlock boulonné ----
  const hw=TW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x161719},d:{g:'m',c:0x0e0f12},c:{g:'c',c:0xc9ced6},C:{g:'c',c:0x6c727b},T:{g:'m',c:0x1e2024},K:{g:'g',c:0x0b0c0f}});
  J.lathe('k',[[.235,-hw],[.40,-hw],[R,-hw*.62],[R,hw*.62],[.40,hw],[.235,hw]],30,0,0,0,'x');
  // la BANDE DE ROULEMENT : 28 rangs de trois pavés en quinconce (deux grands aux épaules, un petit au milieu, décalé), entaillés
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;
    for(const s of [-1,1]){const b=a+s*.05;J.put('k',new THREE.BoxGeometry(TW*.34,.042,.078),s*TW*.27,Math.sin(b)*(R+.012),Math.cos(b)*(R+.012),Math.PI/2-b,0,0);}
    const c=a+(i%2?.06:-.06);J.put('k',new THREE.BoxGeometry(TW*.18,.03,.055),(i%2?1:-1)*TW*.03,Math.sin(c)*(R+.006),Math.cos(c)*(R+.006),Math.PI/2-c,0,0);
    // l'ÉPAULEMENT : un gros pavé sur deux, un petit entre, qui descendent sur le flanc
    const d=a+.06;J.put('k',new THREE.BoxGeometry(.034,i%2?.055:.085,.07),fx+.014,Math.sin(d)*(R-(i%2?.03:.045)),Math.cos(d)*(R-(i%2?.03:.045)),Math.PI/2-d,0,0);}
  // le relief du FLANC du pneu : un anneau de petits blocs (les lettres et les crans, sans texte)
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2;J.put('k',new THREE.BoxGeometry(.008,.022,.03),fx+.004,Math.sin(a)*.372,Math.cos(a)*.372,Math.PI/2-a,0,0);}
  J.lathe('d',[[.232,-hw+.02],[.232,fx-.03],[0,fx-.03]],20,0,0,0,'x');
  J.lathe('C',[[.236,fx-.012],[.233,fx+.006],[.205,fx+.012],[.198,fx+.006],[.198,fx-.02]],28,0,0,0,'x');            // le rebord usiné
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;J.put('c',new THREE.CylinderGeometry(.008,.008,.01,6),fx+.016,Math.sin(a)*.218,Math.cos(a)*.218,0,0,Math.PI/2);}
  const bras=(r0,r1,l0,l1,a)=>{const c=Math.cos(a),s9=Math.sin(a),P2=(r,t)=>[r*c-t*s9,r*s9+t*c];return [P2(r0,-l0),P2(r1,-l1),P2(r1,l1),P2(r0,l0)];};
  // la JANTE MULTIBRANCHES noire : dix branches en cinq paires (en V), creusées d'une poche, le moyeu, huit écrous, le cache
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const s of [-1,1]){const b=a+s*.20;J.prism('T',bras(.075,.198,.022,.032,b),.026,fx);J.prism('K',bras(.10,.18,.006,.012,b),.006,fx+.016);}
    J.prism('T',bras(.07,.13,.03,.022,a),.02,fx+.004);}
  J.lathe('T',[[.085,fx-.01],[.08,fx+.016],[.06,fx+.022],[0,fx+.024]],18,0,0,0,'x');
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;J.put('c',new THREE.CylinderGeometry(.009,.009,.012,6),fx+.026,Math.sin(a)*.056,Math.cos(a)*.056,0,0,Math.PI/2);}
  J.lathe('K',[[.032,fx+.023],[.026,fx+.03],[0,fx+.032]],12,0,0,0,'x');
  const JG=J.done();
  return {hl:[.58,1.102,2.73],tl:[.86,1.27,-2.74],wx:WX,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:TW,style:'nyan',jante:0x1e2024}};
};
monte.pre=cuire;
return monte;

})();
{const f9=function(){try{SHAPES.caid.pre&&SHAPES.caid.pre();}catch(e){}};if(window.requestIdleCallback)requestIdleCallback(f9,{timeout:3000});else setTimeout(f9,2500);} // la découpe de sa tôle (≈30 ms, une fois) dans un moment creux, pas au montage
ECH_POTS.caid={p:[{t:'fente',w:.30,h:.035,k:'s',lueur:'G',pts:[[.45,.60,-1.93],[-.45,.60,-1.93]]}]}; // électrique : pas de pots, deux fentes qui luisent au bas du bouclier arrière (comme LA PERLE)
// >>> fin SHAPES.caid (BOITES)
// · · ·
// · · ·
// · · ·
SHAPES.origami=function(K){
  const U=LPU,R=.44,ZF=1.92,ZR=-1.72,ZN=2.74,ZT=-2.74,TB=.64,KL=.10,E=.006;
  const P=K.kit(fentePal({p:{g:'c',c:0xbdc2c9},S:{g:'c',c:0x7d838c},s:{g:'c',c:0x666c75},k:{g:'m',c:0x15161a},K:{g:'g',c:0x0b0c10},
    g:{g:'g',c:0x10161d},W:{g:'l',c:0xf4f8ff},L:{g:'l',c:0xff1a26},O:{g:'l',c:0xffa21a}}));   // (19/10) 'J' / 'Jf' : la FENTE C
  const yS=z=>U.lin([[ZT,1.21],[ZN,1.045]],z),                                  // L'ARÊTE : elle monte du nez à la poupe, d'un seul trait
        xW=z=>U.lin([[ZT,1.0],[2.56,.985],[ZN,.90]],z),                         // la demi-largeur à l'arête ; le coin du nez est coupé
        T=z=>U.lin([[ZT,1.30],[.50,1.79],[1.70,1.30],[ZN,1.075]],z),            // LE TRIANGLE : poupe · pointe · pied de pare-brise · nez
        xR=z=>xW(z)-TB*(T(z)-yS(z));                                            // la rive du dessus : plus le toit est haut, plus il est étroit
  const AR=[[0,2*R+.05],[R*.60,2*R+.05],[R+.14,.40]];                           // arche en TRAPÈZE
  const zs=[ZT,.50,1.70,2.56,ZN];
  for(const w of [ZF,ZR])for(const d of [R*.60,R+.14])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.40),s=yS(z),xw=xW(z),t=T(z),y2=yb+.05,y3=Math.max(y2+.012,.58),XL=y=>xw-KL*(s-y);
    return [[0,yb],[XL(y2)-.05,yb],[XL(y2),y2],[XL(y3),y3],[xw,s],[xw-TB*(t-s),t],[0,t]];
  },j=>(j>=0&&j<=2)?'k':'p');                                                   // plancher, chanfrein et bas de caisse noirs ; le reste : l'inox
  // ---- LE REPÈRE DES PANS : tout ce qui se pose sur la tôle s'écrit dans SON plan (d = le décollement) ----
  const poly=(k,p)=>{for(let i=1;i<p.length-1;i++)P.tri(k,p[0],p[i],p[i+1]);};  // un polygone convexe, en éventail
  const SU=(sd,z,y,d)=>[sd*(xW(z)-TB*(y-yS(z))+d),y+d*TB,z],                    // flanc HAUT
        SL=(sd,z,y,d)=>[sd*(xW(z)-KL*(yS(z)-y)+d),y,z],                         // flanc BAS
        TP=(x,z,d)=>[x,T(z)+d,z];                                               // dessus
  const bande=(k,x,z0,z1,d)=>poly(k,[TP(x(z0),z0,d),TP(-x(z0),z0,d),TP(-x(z1),z1,d),TP(x(z1),z1,d)]); // d'une rive à l'autre, de z0 à z1
  // ---- LE DESSUS : capot, pare-brise et toit de verre d'un seul tenant, couvre-benne à lames — entre deux rives d'inox ----
  const xg=z=>xR(z)-.05,xt=z=>xR(z)-.07;
  bande('J',z=>xR(z)-.06,2.704,2.697,E*.5);                                     // les joints du coffre avant : le bord d'attaque… (19/10 : la FENTE C)
  for(const sd of [1,-1])poly('J',[[xR(1.76)-.06,1.76],[xR(1.76)-.053,1.76],[xR(2.70)-.053,2.70],[xR(2.70)-.06,2.70]].map(q=>TP(sd*q[0],q[1],E*.5))); // …et les deux côtés
  bande('k',z=>xR(z)-.03,1.76,1.70,E);                                          // la grille d'auvent, au pied du pare-brise
  bande('g',xg,1.68,.50,E);bande('g',xg,.50,-1.00,E);                           // pare-brise, toit de verre
  poly('k',[TP(xg(1.62)-.07,1.62,3*E),TP(xg(1.62)-.045,1.62,3*E),TP(xg(.80)-.045,.80,3*E),TP(xg(.80)-.07,.80,3*E)]); // L'essuie-glace géant, le long du montant
  bande('k',xt,-1.00,-1.03,E);
  for(let i=0;i<9;i++){const z=-1.03-i*.184;bande(i%2?'S':'s',xt,z,z-.184,E);}  // les neuf lames
  // ---- LES FLANCS ----
  const yb_w=z=>yS(z)+.055,yt_w=z=>T(z)-.06;                                    // la vitre : au-dessus de l'arête, sous la rive
  P.sym(sd=>{
    // un seul pentagone, pointe en avant, bord arrière qui penche — c'est le dessin du toit en plus petit
    poly('g',[[1.58,yb_w(1.58)],[1.46,yt_w(1.46)],[.50,yt_w(.50)],[-1.02,yt_w(-1.02)],[-1.32,yb_w(-1.32)]].map(q=>SU(sd,q[0],q[1],E)));
    poly('K',[[.20,yb_w(.20)],[.26,yb_w(.26)],[.26,yt_w(.26)],[.20,yt_w(.20)]].map(q=>SU(sd,q[0],q[1],2*E)));   // le montant central
    // les joints de portes (pas de poignée : c'est un bouton), sur le flanc bas puis jusqu'à la vitre
    for(const z of [1.36,.23,-.98]){
      poly('J',[[z-.0055,.60],[z+.0055,.60],[z+.0055,yS(z)],[z-.0055,yS(z)]].map(q=>SL(sd,q[0],q[1],E*.5)));      // (19/10) la FENTE C…
      poly('J',[[z-.0055,yS(z)],[z+.0055,yS(z)],[z+.0055,yb_w(z)],[z-.0055,yb_w(z)]].map(q=>SU(sd,q[0],q[1],E*.5)));
      poly('Jf',[[z+.0055,.60],[z+.0095,.60],[z+.0095,yS(z)],[z+.0055,yS(z)]].map(q=>SL(sd,q[0],q[1],E*.5)));    // …et son fil clair, devant
      poly('Jf',[[z+.0055,yS(z)],[z+.0095,yS(z)],[z+.0095,yb_w(z)],[z+.0055,yb_w(z)]].map(q=>SU(sd,q[0],q[1],E*.5)));}
    // LES ÉLARGISSEURS : trois plaques par roue (jambe, linteau, jambe), en saillie du flanc ; un feu de gabarit sur chacun
    for(const w of [ZF,ZR]){const a=R*.60,b=R+.14,yt=2*R+.05,x=sd*.9675,ep=.135;
      P.prism('k',[[w-b,.40],[w-a,yt],[w-a-.07,yt+.085],[w-b-.13,.40]],ep,x);
      P.prism('k',[[w-a,yt],[w+a,yt],[w+a+.07,yt+.085],[w-a-.07,yt+.085]],ep,x);
      P.prism('k',[[w+b,.40],[w+a,yt],[w+a+.07,yt+.085],[w+b+.13,.40]],ep,x);}
    P.box('O',.02,.03,.11,sd*1.04,.80,ZF+.64);P.box('L',.02,.03,.11,sd*1.04,.80,ZR-.64);
    // le rétro : un coin noir sur sa béquille, sa glace tournée vers l'arrière
    P.prism('k',[[1.455,1.175],[1.56,1.175],[1.535,1.30],[1.47,1.30]],.15,sd*1.05);
    P.box('K',.12,.085,.01,sd*1.055,1.24,1.462,.2);P.box('k',.10,.035,.06,sd*.95,1.19,1.51);
    // LA FACE : les phares dans la fente, le retour de la barre de jour sur le coin coupé, un feu de position dans le bouclier
    P.box('W',.24,.04,.02,sd*.70,.865,ZN+.008);
    P.box('W',.20,.028,.02,sd*.948,1.048,2.653,0,sd*1.13,0);
    P.box('O',.10,.03,.02,sd*.68,.70,2.836);
    // LA POUPE : le retour de la barre rouge sur le flanc, un catadioptre, le joint du hayon
    P.box('L',.016,.04,.13,sd*1.0,1.168,ZT+.06);
    P.box('L',.16,.03,.02,sd*.68,.68,-2.836);
    P.box('J',.007,.34,.012,sd*.90,.99,ZT-.002);P.box('Jf',.004,.34,.012,sd*.8945,.99,ZT-.002);   // (19/10 : la FENTE C)
  });
  // ---- LA FACE ----
  P.box('W',2*xR(ZN)-.02,.028,.03,0,1.048,ZN+.004);                             // LA BARRE DE JOUR, d'un bord à l'autre
  P.box('K',1.74,.075,.02,0,.865,ZN+.002);                                      // la fente des phares
  P.box('k',1.74,.43,.01,0,.615,ZN+.003);                                       // le bas du bouchon, derrière le bouclier : noir (l'inox dépassait dessous)
  // LES BOUCLIERS : deux petits lofts, coins coupés en plan et dessous relevé (angles d'attaque et de fuite) — pas des pavés
  P.loft([2.56,2.76,2.84],z=>{const x=U.lin([[2.56,.965],[2.76,.935],[2.84,.80]],z),a=U.lin([[2.56,.40],[2.76,.47],[2.84,.57]],z),
    b=U.lin([[2.56,.815],[2.78,.815],[2.84,.775]],z);return [[0,a],[x,a],[x,b],[0,b]];},()=>'k');
  P.box('K',1.00,.085,.02,0,.67,2.835);                                         // l'entrée d'air
  // ---- LA POUPE ----
  P.box('L',1.98,.04,.016,0,1.168,ZT-.004);                                     // LA BARRE ROUGE, d'un bord à l'autre
  P.box('k',1.90,.07,.02,0,1.238,ZT-.002);                                      // le bandeau noir qui la coiffe
  P.box('J',1.80,.007,.012,0,.82,ZT-.002);P.box('Jf',1.80,.004,.012,0,.8255,ZT-.002);   // le joint bas du hayon (19/10 : la FENTE C)
  P.box('k',1.90,.40,.01,0,.60,ZT-.003);                                        // le bas du bouchon, derrière le bouclier
  P.loft([-2.84,-2.76,-2.56],z=>{const x=U.lin([[-2.84,.84],[-2.76,.985],[-2.56,1.0]],z),a=U.lin([[-2.84,.57],[-2.76,.48],[-2.56,.42]],z),
    b=U.lin([[-2.84,.76],[-2.78,.80],[-2.56,.80]],z);return [[0,a],[x,a],[x,b],[0,b]];},()=>'k');
  P.box('k',.70,.03,.10,0,.805,-2.78);                                          // la marche
  P.box('K',.36,.12,.02,0,.66,-2.836);                                          // la plaque (vierge)
  K.commit(P);
  return {hl:[.70,.865,ZN+.03],tl:[.80,1.168,ZT-.03],wx:.86,wzF:ZF,wzR:-ZR,pots:[[.52,.47,-2.83],[-.52,.47,-2.83]],
          lpw:{R:R,w:.30,style:'plis',n:7,jante:0x8d939b,accent:0x1b1d21,fond:0x0e0f12}};
};
