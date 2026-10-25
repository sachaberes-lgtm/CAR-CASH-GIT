// >>> fin SHAPES.combi (BOITES)
// · · ·
// · · ·
// · · ·
// <<< SHAPES.wrangler (BOITES) >>> — LE BAROUDEUR, la Jeep Wrangler JL 4 portes au plan (2026-10-18, discussion BOÎTES)
SHAPES.wrangler=(function(){
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
/* ============================ LE WRANGLER (JL 4 portes, 2018) ============================
   Le « JL Unlimited » relevé sur son élévation de côté (getoutlines.com / the-blueprints.com, 365,7 px par mètre mesurés sur l'empattement
   3,008 m) et sur les cotes officielles (voie 1,598 m, largeur aux ailes 1,894 m) ; la face et le dos lus sur des photos de face (Commons).
   · LA CAISSE (la baignoire, les portes, le pavillon) : une GRILLE comme LE COMBI — rangées par hauteur, chaque rangée sa courbe en plan
     (faces planes, coins de 4-6 cm), le pare-brise couché de 39°, le hard-top qui se resserre vers le haut ;
   · à part, comme sur le vrai : le CAPOT bombé entre les ailes, les AILES AVANT à dessus plat, les ÉLARGISSEURS (arches trapues),
     la CALANDRE aux sept fentes et ses deux phares ronds, les pare-chocs d'acier, les marchepieds, les charnières de portes apparentes,
     la ROUE DE SECOURS sur le hayon et son 3e feu stop, les ponts rigides visibles dessous.
   Repère : x à gauche, y en haut, z vers l'avant, mètres ; l'origine au milieu entre le hayon et le pare-chocs avant.
   (2026-10-18, Léo, photo d'un JL Sahara gris : « même couleurs, même le truc au-dessus de la roue ») LA FINITION SAHARA : le hard-top, les
   élargisseurs et les charnières à la couleur de la caisse ; poignées, rétroviseurs, pare-chocs et marchepieds noirs ; jantes bicolores usinées
   (cinq branches polies creusées de gris, rebord poli). */
const R=.405,TW=.255,WX=.80,ZF=1.492,ZR=-1.516;
const ZS0=-2.00,ZS1=.20,NR=10,NF=14;
const BELT=1.222;
// la baignoire (sous la ceinture) : [hauteur, demi-largeur] ; le haut (hard-top) se resserre de 0,846 à 0,793
/* ===== LE RELIEF DU FLANC (2026-10-20, Léo : « le relief visible quand on tourne autour » ; l'étude de la gamme au garage : n° 3 des plus
   plates, une porte verticale d'un bloc entre les élargisseurs) ===== trois pans au lieu d'une dalle : le BAS de porte qui rentre vers le
   marchepied (~17°, il regarde le sol), la PORTE presque droite qui bombe jusqu'à l'ARÊTE à hauteur des poignées, l'ÉPAULE qui rentre
   jusqu'au petit creux sous le jonc de ceinture (~14°, elle regarde le ciel). `SBx(y)` : le flanc à une hauteur (charnières et poignées s'y
   posent). Avant : toutes les rangées à 0,856 de .64 à 1,18. */
const SB=[[.60,.800],[.64,.818],[.75,.838],[.88,.856],[1.00,.863],[1.10,.866],[1.18,.848],[1.205,.856],[1.222,.866],[1.24,.853]],
      SBx=y=>lin(SB,y),
      SH=[1.27,1.32,1.42,1.52,1.62,1.72,1.775];
const zPB=y=>.648-.804*(y-1.326);                         // le pare-brise (et le montant) vu de côté
const zHT=y=>-2.149+(y-1.23)*.1956;                       // la lunette du hard-top, couchée vers l'avant
const ROWS=[{t:'fc',zc:.88,zr:-2.149},{t:'fe',W:.80,zc:.88,zr:-2.149,rf:.05,rr:.06}];
for(const [y,W] of SB)ROWS.push({t:'s',y:y,W:W,zc:y<1.19?.88:y<1.21?.86:y<1.23?.85:.84,zr:-2.149,rf:.05,rr:.06});
for(const y of SH)ROWS.push({t:'s',y:y,W:lin([[1.27,.846],[1.775,.793]],y),zc:zPB(y),zr:zHT(y),rf:.045,rr:.06});
ROWS.push({t:'s',y:1.785,W:.787,zc:zPB(1.785),zr:zHT(1.785),rf:.04,rr:.06});
const IL=ROWS.length-1,IB=ROWS.findIndex(r=>r.y===1.24);
const UR=[1,.97,.92,.85,.7,.5,.25,0],HDR=[[0,.068],[.25,.067],[.5,.064],[.7,.058],[.85,.05],[.92,.04],[.97,.025],[1,0]],
      RHC=z=>lin([[-2.03,1.84],[-1.4,1.859],[.24,1.82]],z),
      BRF=[[0,0],[.02,.45],[.05,.78],[.1,.93],[.3,1]],Bz=z=>Math.min(lin(BRF,ROWS[IL].zc-z),lin(BRF,z-ROWS[IL].zr)),
      yToit=(u,z)=>1.785+lin(HDR,u)*(RHC(z)-1.785)/.068*Bz(z);
for(const u of UR)ROWS.push({t:'r',u:u});
// le passage de roue arrière dans la baignoire (la roue avant est sous l'aile, devant elle)
const ARR=[[-1.98,.60],[-1.942,.62],[-1.925,.749],[-1.857,.919],[-1.736,1.005],[-1.310,1.005],[-1.207,.919],[-1.105,.749],[-1.002,.613],[-.99,.60]],
      YB=z=>z<ARR[0][0]||z>ARR[ARR.length-1][0]?.60:Math.max(.60,lin(ARR,z));
// la courbe en plan d'une rangée : face plane, coin arrondi
const nezPts=r=>{if(r.t==='fc')return [[0,ZS1-.6],[0,r.zc]];const o=[[r.W,ZS1-.6]],rc=r.rf;
    for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zc-rc+rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zc]);return o;},
      dosPts=r=>{if(r.t==='fc')return [[0,ZS0+.6],[0,r.zr]];const o=[[r.W,ZS0+.6]],rc=r.rr;
    for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zr+rc-rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zr]);return o;};
const NP=[],DP=[],FN=[],FD=[];
for(const r of ROWS){if(r.t==='r'){NP.push(null);DP.push(null);FN.push(null);FD.push(null);continue;}
  const a=nezPts(r),b=dosPts(r);NP.push(a);DP.push(b);FN.push(colBout(r,a,ZS1,NF,.06,1));FD.push(colBout(r,b,ZS0,NR,.06,-1));}
const xAt=(j,z)=>{const r=ROWS[j];if(r.t==='fc')return 0;let x=r.W;if(z>ZS1-.6){const v=xSur(NP[j],z,1);if(v!=null)x=Math.min(x,v);}
  if(z<ZS0+.6){const v=xSur(DP[j],z,-1);if(v!=null)x=Math.min(x,v);}return x;};
const ZSIDE=(()=>{const s=new Set();for(let z=ZS0;z<ZS1+.001;z+=.15)s.add(+z.toFixed(3));for(const p of ARR)s.add(p[0]);s.add(ZS1);
  return [...s].filter(z=>z>=ZS0-1e-6&&z<=ZS1+1e-6).sort((a,b)=>a-b).filter((z,i,A)=>i===0||z-A[i-1]>.012);})();
const COL=[];for(let i=NR;i>0;i--)COL.push({k:'d',i:i});for(const z of ZSIDE)COL.push({k:'s',z:z});for(let i=1;i<=NF;i++)COL.push({k:'n',i:i});
const point=(c,j)=>{const r=ROWS[j];
  if(c.k==='s'){const z=c.z,yb=YB(z);if(r.t==='fc')return [0,yb,z];if(r.t==='fe')return [xAt(j,z),yb,z];
    if(r.t==='s')return [xAt(j,z),Math.max(r.y,yb),z];return [r.u*xAt(IL,z),yToit(r.u,z),z];}
  const S=c.k==='n'?FN:FD;if(r.t==='r'){const q=S[IL][c.i];return [r.u*q[0],yToit(r.u,q[1]),q[1]];}
  const q=S[j][c.i];return [q[0],r.t==='s'?Math.max(r.y,YB(q[1])):YB(q[1]),q[1]];};
// un rectangle aux coins arrondis
const rrect=(u0,v0,u1,v1,r,n)=>{const o=[],c=[[u1-r,v0+r,-Math.PI/2],[u1-r,v1-r,0],[u0+r,v1-r,Math.PI/2],[u0+r,v0+r,Math.PI]];n=n||4;
  for(const [cu,cv,a0] of c)for(let i=0;i<=n;i++){const a=a0+i/n*Math.PI/2;o.push([cu+Math.cos(a)*r,cv+Math.sin(a)*r]);}return o;};
return function(K){
  const SP=K.spec||{},CORPS=SP.color!=null?SP.color:0x464950;
  const PAL={p:{g:'p',c:CORPS},k:{g:'m',c:0x161719},K:{g:'g',c:0x0b0c0f},c:{g:'c',c:0xd4d8de},C:{g:'c',c:0x6c727b},g:{g:'g',c:0x1d2a36},
    W:{g:'l',c:0xfff2d2},L:{g:'l',c:0xff2a36},O:{g:'l',c:0xffa21a},R:{g:'m',c:0x7a1018},s:{g:'s',c:0x23252a},Q:{g:'l',c:0xe8e8e8},P:{g:'m',c:0x3d4047},N:{g:'l',c:0x5ee6ff},M:{g:'l',c:0xff3ec8}};
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const CODES=[];CODES[0]={g:'#'};CODES[1]={g:'#',k:.38};CODES[2]={g:'g',c:0x1d2a36};CODES[3]={g:'g',c:0x0b0c0f};CODES[22]={g:'s',c:0x23252a};
  CODES[23]={g:'m',c:0x16171b};CODES[25]={g:'m',c:0x32333a};CODES[26]={g:'#'};CODES[27]={g:'l',c:0xff2a36};
  const PEINT=new Set([0,26]),GAP={}; // 26 = le HARD-TOP, à la couleur de la caisse (finition Sahara) : un code à lui pour que les vitres ne mordent pas le cadre du pare-brise
  const CPx=new THREE.Color(),fondu=y=>.80+.20*cl((y-.25)/1.0,0,1),colP=y=>{CPx.setHex(EP.c);if(EP.grad&&typeof lpGrad==='function')lpGrad(EP.grad,y,CPx);
    const s=((EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0)?fondu(y):1;return [CPx.r*s,CPx.g*s,CPx.b*s];};
  let CCH=false;try{CCH=/[?&]baroudeur=(couches|entre)/.test(location.search);}catch(e){}   /* (25/10, Léo : « fais évoluer le Baroudeur comme La Fidèle ») `?baroudeur=couches` : la caisse en COUCHES EMPILÉES (rangées de dalles, vitres par rangée, détails posés) au lieu de la découpe au plan */
  let C9=CACHE[0];
  if(!CCH&&!C9){
    const G=COL.map(c=>ROWS.map((r,j)=>point(c,j))),TR=[];
    const ref=c=>[0,1.0,cl(c[2],-1.7,.4)];
    const tri=(a,b,c,k)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      if(nx*nx+ny*ny+nz*nz<1e-12)return;const m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],r=ref(m);
      if(nx*(m[0]-r[0])+ny*(m[1]-r[1])+nz*(m[2]-r[2])<0)TR.push([a,c,b,k]);else TR.push([a,b,c,k]);};
    const M=p=>[-p[0],p[1],p[2]];
    for(let c=0;c<COL.length-1;c++)for(let j=0;j<ROWS.length-1;j++){
      const A=G[c][j],B=G[c+1][j],C=G[c+1][j+1],D=G[c][j+1];
      let k=j<=1?23:0;if(!k&&A[1]<=YB(A[2])+.001&&B[1]<=YB(B[2])+.001&&C[1]<=YB(C[2])+.001&&D[1]<=YB(D[2])+.001)k=23;
      // au-dessus de la ceinture : le HARD-TOP (code 26, couleur caisse) — sauf le cadre du pare-brise (code 0)
      if(!k&&j>=IB){const pb=j<IL&&COL[c].k==='n'&&COL[c+1].k==='n'&&COL[c].i>NF/2-1;k=pb?0:26;}
      for(const s of [1,-1]){const f=s>0?(p=>p):M;tri(f(A),f(B),f(C),k);tri(f(A),f(C),f(D),k);}}
    // ---- LES CONTOURS ----
    const ZO={cote:[],face:[],dos:[],dessus:[]},LG={cote:[],face:[],dos:[],dessus:[]};
    const zone=(v,k,P,o)=>{o=o||{};ZO[v].push({k:k,sg:segsDe(P,true),bb:bbDe(P,0),s:o.s||0,sur:o.sur||[0]});},
          joint=(v,P,s,ferme)=>{const L=ligneDe(P,'j',s,ferme);if(L)LG[v].push(L);},pli=(v,P,s,ferme)=>{const L=ligneDe(P,'h',s,ferme);if(L)LG[v].push(L);};
    // LES VITRES : porte avant (son bord avant suit le montant), porte arrière et sa glissière, custode du hard-top ; le pare-brise, la lunette
    zone('cote',2,[[-.309,1.30],[.322,1.30],[.25,1.68],[.228,1.712],[-.28,1.717],[-.309,1.69]],{sur:[26]});
    zone('cote',2,rrect(-1.088,1.30,-.464,1.717,.03),{sur:[26]});zone('cote',23,barre([-.92,1.30],[-.92,1.717],.009),{sur:[2]});
    zone('cote',2,[[-1.975,1.30],[-1.24,1.30],[-1.24,1.687],[-1.27,1.717],[-1.93,1.717],[-1.965,1.69]],{sur:[26]});
    zone('face',2,rrect(-.705,1.37,.705,1.755,.035),{sur:[0]});
    for(const s of [-1,1])zone('face',3,barre([s*.64,1.40],[s*.10,1.418],.008),{sur:[2]});
    zone('dos',2,rrect(-.69,1.31,.69,1.745,.04),{sur:[26]});
    // LES PORTES (charnières apparentes posées en pièces), le hayon, le bandeau de ceinture, les panneaux amovibles du toit
    joint('cote',[[.563,1.24],[.563,.66],[.54,.637],[-.375,.637],[-.398,.66],[-.398,1.785]]);
    joint('cote',[[-.418,1.785],[-.418,.66],[-.44,.637],[-.86,.637],[-.891,.663],[-.977,.80],[-1.063,.937],[-1.148,1.039],[-1.16,1.10],[-1.16,1.785]]);
    joint('dos',[[-.625,.745],[.626,.745],[.626,1.225],[-.625,1.225]],0,true);
    pli('cote',[[-2.149,BELT],[.88,BELT]]);pli('dos',[[-.86,BELT],[.86,BELT]]);
    joint('dessus',[[-.40,-.76],[-.40,.76]]);joint('dessus',[[-.40,0],[.25,0]]);
    const vueDe=(m,n)=>{if(m[2]>.15&&n[2]>.5)return 'face';if(m[2]<-1.9&&n[2]<-.5)return 'dos';if(n[1]>.7)return 'dessus';if(Math.abs(n[0])>.3)return 'cote';return null;};
    const OUT=decoupe(TR,ZO,LG,CODES,PEINT,vueDe,GAP);
    C9={};for(const g in OUT){const o=OUT[g];C9[g]={P:new Float32Array(o.P),N:new Float32Array(o.N),K:Uint8Array.from(o.K),D:new Float32Array(o.D)};}
    CACHE[0]=C9;}
  // ---- LA CAISSE POSÉE : ses couleurs (la peinture de la boutique comprise) ----
  const gs={};if(!CCH){const BASE=(()=>{CPx.setHex(EP.c);return [CPx.r,CPx.g,CPx.b];})(),pDe=(EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0,FIX=CODES.map(d=>{if(!d||d.c==null)return null;CPx.setHex(d.c);return [CPx.r,CPx.g,CPx.b];});
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
  K.commit({done:()=>gs,prims:[]});}
  // ============================ LES PIÈCES ============================
  const P=K.kit(PAL);
  const tour=(pts,n)=>{const g=new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1])),n||16);g.rotateX(Math.PI/2);return g;};
  const pose=(k,g,p,n,rz,sx,sy)=>P.put(k,g,p[0],p[1],p[2],Math.atan2(-n[1],n[2]),Math.asin(cl(n[0],-1,1)),rz||0,sx||1,sy||1,1);
  const quad=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};

  // ============================ LA CAISSE « ENTRE-DEUX » (`?baroudeur=entre`) ============================
  /* (25/10, Léo : « un entre-deux entre l'ultra réalisme et le style de LA HONTE ou LA TAURINE ») ni la découpe au plan (des milliers de petits triangles, joints, filets : « ultra réaliste »), ni des blocs
     (v1 : écailles de rectangles ; v2 : boîtes lisses). La VRAIE forme du Wrangler — flancs qui rentrent sous la caisse, ceinture, hard-top aux flancs qui se resserrent, toit bombé, pare-brise et lunette couchés —
     en UN loft à sections de 11 points (comme LA TAURINE) : des facettes franches mais lisibles, pas de dessin dans la tôle. Les vitres sont des BANDES du loft (peintes), le pare-brise et la lunette aussi ;
     le capot est un second loft à 6 points ; les portes sont deux panneaux en relief par flanc. Tout le reste (ailes, élargisseurs, calandre, roues…) est déjà en pièces posées. */
  const RP=.018;   // le relief des panneaux de porte
  if(CCH){
    const B=(k,w,h,d,x,y,z,rx,ry,rz)=>P.box(k,w,h,d,x,y,z,rx||0,ry||0,rz||0);
    const Wc=y=>lin([[1.27,.846],[1.775,.793]],y),
          topC=z=>z<-2.04?1.23+(z+2.149)/.1956:z<=.279?1.785:Math.max(1.245,1.326+(.648-z)/.804);   // la ligne du haut : lunette, toit, pare-brise
    // les stations : les bords des vitres et des passages de roue sont doublés (à 4 mm) pour que la peinture change net
    let zs=[-2.149,-2.12,-2.09,-2.06,-2.04,-1.977,-1.973,-1.9,-1.8,-1.70,-1.60,-1.50,-1.40,-1.30,-1.242,-1.238,-1.16,-1.09,-1.086,-.95,-.80,-.65,-.52,-.466,-.462,-.40,-.311,-.307,-.20,-.05,.10,.22,.288,.292,.34,.40,.46,.53,.60,.648,.70,.80,.88];
    for(const q of ARR)zs.push(q[0]);zs.sort((x,y)=>x-y);zs=zs.filter((z,i)=>i===0||z-zs[i-1]>.0015);
    const inWin=z=>(z>-.309&&z<.29)||(z>-1.088&&z<-.464)||(z>-1.975&&z<-1.24);
    P.loft(zs,z=>{
      const yb=YB(z),top=topC(z),y2=Math.max(yb+.03,.70),y3=Math.max(yb+.05,1.0),y4=Math.max(y3+.03,1.222);
      const y5=Math.max(y4+.002,Math.min(1.245,top-.002)),y6=Math.max(y5+.002,Math.min(1.30,top-.004)),y7=Math.max(y6+.002,Math.min(1.717,top-.002)),y8=Math.max(y7+.002,top),
            dome=.05*cl((top-1.3)/.45,0,1);
      return [[0,yb],[.80,yb],[.835,y2],[.862,y3],[.866,y4],[Wc(y5),y5],[Wc(y6),y6],[Wc(y7),y7],[Wc(y8),y8],[Math.min(.705,Wc(y8)-.06),y8+dome*.35],[0,y8+dome]];
    },(j,z)=>{
      if(j<0)return 'p';
      if(j<=1)return 'k';                                                                    // le dessous et le seuil : noirs
      if(j===6)return inWin(z)?'g':'p';                                                      // les vitres de côté : porte avant, porte arrière, custode
      if(j===9)return ((z>.285&&z<.655)||(z>-2.135&&z<-2.045))?'g':'p';                       // le pare-brise et la lunette
      return 'p';});
    // LES PORTES : deux panneaux par flanc, en relief
    for(const sd of [1,-1])for(const [z0,z1] of [[.563,-.375],[-.418,-1.16]]){const L=Math.abs(z0-z1)-.012,zc=(z0+z1)/2;
      B('p',RP,.56,L,sd*(SBx(.93)+RP/2-.002),.93,zc);}
    // LES PETITS DÉTAILS (comme LA FIDÈLE : des pièces posées, bien saillantes — jamais dessinées dans la tôle) : poignées chromées, filet chromé sous les vitres, trappe à carburant, badge d'aile,
    // crochets de remorquage rouges, essuie-glace arrière
    for(const sd of [1,-1]){
      for(const z of [-.205,-.945])B('c',.03,.045,.21,sd*(SBx(1.105)+RP+.016),1.105,z);                       // la poignée : un bloc chromé
      B('c',.012,.016,2.27,sd*.851,1.262,-.835);                                                              // le filet chromé, sous les vitres
      B('c',.010,.032,.13,sd*.866,1.075,1.34);                                                                // le badge d'aile
      B('R',.075,.035,.11,sd*.46,.60,2.17);B('c',.075,.010,.11,sd*.46,.62,2.17);}                             // les crochets de remorquage
    B('k',.016,.14,.14,.872,1.145,-1.78);B('c',.006,.12,.012,.880,1.145,-1.78);                               // la trappe à carburant (à gauche, derrière)
    B('k',.40,.012,.018,.10,1.50,zHT(1.50)-.022);B('k',.012,.012,.20,.10,1.50,zHT(1.50)-.012);              // l'essuie-glace arrière : lame et bras
    // LE CAPOT : un loft à 6 points (bombé), entre les ailes
    {const yT0=z=>lin([[.648,1.321],[1.083,1.307],[1.493,1.272],[1.684,1.225],[1.794,1.19],[1.835,1.17],[1.862,1.152]],z),HZ=[.648,.80,.95,1.10,1.25,1.40,1.55,1.66,1.75,1.80,1.862];
     P.loft(HZ,z=>{const t=yT0(z);return [[0,1.148],[.66,1.148],[.66,t-.014],[.56,t-.003],[.30,t+.010],[0,t+.016]];},()=>'p');
     for(const sd of [1,-1])B('k',.20,.008,.06,sd*.24,yT0(.97)+.014,.97);}   // les deux prises d'air du capot
  }
  // LE CAPOT : bombé, entre les ailes, qui plonge sur la calandre
  if(!CCH){const yT=z=>lin([[.648,1.321],[1.083,1.307],[1.493,1.272],[1.684,1.225],[1.794,1.19],[1.835,1.17],[1.862,1.152]],z),
     HZ=[.648,.80,.95,1.10,1.25,1.40,1.55,1.66,1.75,1.80,1.835,1.862],HX=[-.66,-.657,-.63,-.48,-.28,-.09,.09,.28,.48,.63,.657,.66],
     S=z=>HX.map(x=>[x,Math.abs(x)>.659?1.148:yT(z)+(Math.abs(x)>.65?-.006:.016*(1-(x/.66)*(x/.66))),z]);
   for(let i=0;i<HZ.length-1;i++){const A=S(HZ[i]),B=S(HZ[i+1]);for(let j=0;j<HX.length-1;j++)quad('p',A[j],B[j],B[j+1],A[j+1]);}
   const F=S(HZ[HZ.length-1]),c0=[0,1.148,HZ[HZ.length-1]];for(let j=0;j<HX.length-1;j++)P.tri('p',c0,F[j],F[j+1]);
  }
  P.sym(sd=>{P.box('k',.03,.075,.06,sd*.668,1.15,1.78);});                       // les deux loquets de caoutchouc
  // LES AILES AVANT (dessus plat), LES ÉLARGISSEURS à la couleur de la caisse (Sahara), avant et arrière
  const AILE=[[.85,1.148],[1.862,1.148],[1.876,1.13],[1.886,1.0],[1.90,.86],[1.887,.826],[1.827,.902],[1.794,.976],[1.534,.979],[1.274,.976],[1.203,.949],[1.129,.872],[1.036,.719],[.930,.522],[.85,.522]],
        ELAV=[[.749,.577],[.938,.856],[1.083,1.023],[1.203,1.055],[1.493,1.066],[1.736,1.053],[1.827,1.009],[1.95,.856],[1.975,.79],[1.975,.70],[1.93,.70],[1.887,.826],[1.827,.902],[1.794,.976],[1.534,.979],[1.274,.976],[1.203,.949],[1.129,.872],[1.036,.719],[.93,.522],[.80,.522]],
        ELAR=[[-2.096,.536],[-2.028,.749],[-1.925,.937],[-1.857,1.039],[-1.737,1.091],[-1.686,1.097],[-1.241,1.097],[-1.173,1.039],[-1.088,.937],[-1.002,.80],[-.916,.663],[-.875,.577],[-.90,.53],[-.968,.526],[-1.002,.613],[-1.105,.749],[-1.207,.919],[-1.310,1.005],[-1.736,1.005],[-1.857,.919],[-1.925,.749],[-1.942,.577],[-2.0,.52]];
  P.sym(sd=>{P.prism('p',AILE,.20,sd*.76);P.prism('p',ELAV,.147,sd*.8735);P.prism('p',ELAR,.147,sd*.8735);   // (relief) les élargisseurs plus profonds vers la caisse : le bas de porte rentre, rien ne se voit au travers
    // le feu de jour et le clignotant de l'élargisseur : une bande de LED À FLEUR de son arête avant (elle suit le contour, 1 cm de large,
    // 2 mm de relief) — avant, deux bâtonnets posés dessus, qui flottaient au-dessus des roues une fois l'élargisseur couleur caisse
    {const off=(P9,d)=>{const o=[];for(let i=0;i<P9.length;i++){const a=P9[Math.max(0,i-1)],b=P9[Math.min(P9.length-1,i+1)],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy)||1;o.push([P9[i][0]+dy/l*d,P9[i][1]-dz/l*d]);}return o;},
         bande=(P9,d0,d1)=>off(P9,d0).concat(off(P9,d1).reverse());
     const DRL=[[1.70,1.0505],[1.736,1.0475],[1.795,1.020],[1.827,.997],[1.875,.938]],CLI=[[1.875,.938],[1.912,.885],[1.936,.846]];
     P.prism('W',bande(DRL,.008,.018),.004,sd*.949);P.prism('O',bande(CLI,.008,.018),.004,sd*.949);}
    P.box('k',.006,.07,.17,sd*.862,1.00,.98);                                                      // l'ouïe d'aile
    P.box('k',.10,.12,1.61,sd*.85,.51,-.055);P.box('s',.10,.012,1.61,sd*.85,.575,-.055);          // le MARCHEPIED
    for(const [z,y] of [[.535,1.094],[.535,.766],[-.44,1.094],[-.44,.766]])P.box('p',.035,.065,.075,sd*(SBx(y)+.0125+(CCH?RP:0)),y,z);   // les charnières (couleur caisse) — (relief) posées sur le flanc à leur hauteur
    for(const z of [-.205,-.945])P.box('k',.02,.035,.19,sd*(SBx(1.105)+.006+(CCH?RP:0)),1.105,z);              // les poignées (noires), sur l'arête
    // le rétroviseur, sur la portière
    {const a=[sd*.86,1.30,.40],b=[sd*.96,1.37,.41],d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(d[0],d[1],d[2]);
     const g=new THREE.CylinderGeometry(.016,.016,l,6);g.translate(0,l/2,0);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(d[0]/l,d[1]/l,d[2]/l)),e=new THREE.Euler().setFromQuaternion(q);
     P.put('k',g,a[0],a[1],a[2],e.x,e.y,e.z);P.box('k',.07,.17,.13,sd*.995,1.40,.41);P.box('g',.05,.14,.004,sd*.995,1.40,.344);}
    // les feux arrière (aux coins), leur verre
    P.box('L',.13,.23,.025,sd*.795,1.055,-2.1615);P.box('g',.07,.12,.006,sd*.795,1.055,-2.176);P.box('W',.05,.012,.006,sd*.795,1.11,-2.177);
  });
  // LES GLITCHS DE PIXELS (25/10, Léo : « des glitchs pixels qui remontent depuis les couvre-roues, pas partout : un effet bug de jeu ») : de petits cubes de 3-4 cm, de la couleur de la caisse (quelques-uns noirs ou chromés),
  // posés sur les élargisseurs à partir du bord de l'arche et de plus en plus rares vers le haut ; certains saillent, d'autres flottent un cran à côté. Un tirage déterministe (la même caisse à chaque fois).
  if(CCH){
    const B=(k,w,h,d,x,y,z)=>P.box(k,w,h,d,x,y,z,0,0,0);
    const hash=(a,b,c,d)=>{const v=Math.sin(a*12.9898+b*78.233+c*37.719+d*5.171)*43758.5453;return v-Math.floor(v);};
    const dans=(Pg,z,y)=>{let c=false;for(let i=0,j=Pg.length-1;i<Pg.length;j=i++){const a=Pg[i],b=Pg[j];if((a[1]>y)!==(b[1]>y)&&z<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
    const ARF=[[.93,.522],[1.036,.719],[1.129,.872],[1.203,.949],[1.274,.976],[1.534,.979],[1.794,.976],[1.827,.902],[1.887,.826]],
          archF=z=>lin(ARF,z),archR=z=>Math.max(.60,lin(ARR,z));
    const CE=.05,HM=.22;
    for(const [wh,Pg,z0,z1,arch,id] of [['av',ELAV,.93,1.90,archF,0],['ar',ELAR,-2.0,-.90,archR,1]])for(const sd of [1,-1]){
      for(let iz=Math.round(z0/CE);iz*CE<z1;iz++)for(let iy=0;iy<Math.round(HM/CE)+2;iy++){
        const z=iz*CE,ya=arch(z),y=ya+.02+iy*CE,d=(y-ya)/HM;if(d>1||!dans(Pg,z,y))continue;
        const pr=.85*Math.pow(1-d,1.3),h=hash(iz,iy,sd,id);if(h>pr)continue;
        const q=hash(iz+.3,iy+.7,sd,id+2),sz=CE*(.70+.45*hash(iz+.9,iy+.1,sd,id+4)),sail=q<.2?.045:.012+.03*hash(iz+.5,iy+.5,sd,id+6);
        const col=q>.96?'M':q>.92?'N':q>.86?'c':q>.70?'k':'p',dz=q<.2?(q<.1?CE*.5:-CE*.5):0;
        B(col,.02,sz,sz,sd*(.947+sail+.01),y,z+dz);}}
  }
  // LA CALANDRE : sept fentes, deux phares ronds, un peu couchée
  {const sh=new THREE.Shape(),PTS=rrect(-.66,-.18,.66,.175,.03,3);sh.moveTo(PTS[0][0],PTS[0][1]);for(let i=1;i<PTS.length;i++)sh.lineTo(PTS[i][0],PTS[i][1]);
   const fente=x=>{const h=new THREE.Path(),Q=rrect(x-.0375,-.12,x+.0375,.14,.03,3);h.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)h.lineTo(Q[i][0],Q[i][1]);return h;};
   for(let i=0;i<7;i++)sh.holes.push(fente(-.315+i*.105));
   for(const s of [-1,1]){const h=new THREE.Path();h.absarc(s*.505,.01,.106,0,Math.PI*2,false);sh.holes.push(h);}
   const g=new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:false,curveSegments:10});const rx=-.12;
   P.put('p',g,0,.98,1.83,rx,0,0);
   const nG=[0,-Math.sin(rx),Math.cos(rx)],sur=(x,y,d)=>[x,.98+y*Math.cos(rx)-(.05+d)*Math.sin(rx),1.83+y*Math.sin(rx)+(.05+d)*Math.cos(rx)];
   for(let i=0;i<7;i++)P.put('k',new THREE.BoxGeometry(.075,.26,.012),-.315+i*.105,.98+.01,1.835,rx,0,0);   // le fond des fentes
   for(const s of [-1,1]){const p=sur(s*.505,.01,-.036);pose('C',tour([[.086,0],[.104,.004],[.106,.03],[.096,.034],[.084,.03]],24),p,nG);
     pose('W',tour([[.084,.03],[.072,.03]],24),p,nG);pose('g',tour([[.072,.028],[.03,.04],[0,.042]],20),p,nG);pose('W',tour([[.026,.04],[0,.046]],12),p,nG);}}
  // les pare-chocs d'acier (antibrouillards devant, catadioptres derrière)
  P.box('k',1.24,.22,.18,0,.69,2.06);P.sym(sd=>{P.box('k',.34,.20,.15,sd*.78,.69,1.99,0,-sd*.35,0);P.put('W',tour([[0,.0],[.045,0]],14),sd*.53,.66,2.151);
    P.put('C',tour([[.045,-.004],[.058,-.004],[.058,.002]],14),sd*.53,.66,2.151);P.box('R',.12,.04,.01,sd*.72,.63,-2.303);});
  P.box('k',1.0,.10,.20,0,.53,2.0);P.box('k',1.76,.20,.17,0,.62,-2.215);
  // le hayon : ses charnières (côté droit, celui du trottoir), sa poignée ; la plaque sur le pare-chocs (`plqDessinee` y pose celle du joueur)
  for(const y of [.84,1.12])P.box('k',.11,.05,.03,-.64,y,-2.162);P.box('k',.03,.12,.03,.52,1.0,-2.162);
  P.box('Q',.46,.12,.01,0,.585,-2.302);
  // LA ROUE DE SECOURS sur le hayon, son support et le 3e feu stop
  {const zc=-2.305,yc=1.046,h=TW/2;
   P.put('k',tour([[.235,h],[.37,h],[R,h*.6],[R,-h*.6],[.37,-h],[.235,-h]],24),0,yc,zc);
   for(let i=0;i<22;i++){const a=i/22*Math.PI*2;for(const s of [-1,1])P.put('k',new THREE.BoxGeometry(.075,.032,TW*.36),Math.cos(a+s*.07)*(R+.008),yc+Math.sin(a+s*.07)*(R+.008),zc+s*TW*.2,0,0,a+Math.PI/2);}
   // la jante de la roue de secours : la même que les quatre autres (branches polies creusées de gris, rebord poli, moyeu gris)
   P.put('k',tour([[.235,-h+.02],[.06,-h+.03]],20),0,yc,zc);P.put('c',tour([[.234,-h+.012],[.206,-h+.004],[.196,-h+.008],[.196,-h+.03]],24),0,yc,zc);
   const brasZ=(r0,r1,l0,l1,a,k,ep,z0)=>{const c=Math.cos(a),s9=Math.sin(a),P2=(r,t)=>[r*c-t*s9,r*s9+t*c],Q=[P2(r0,-l0),P2(r1,-l1),P2(r1,l1),P2(r0,l0)],sh=new THREE.Shape();
     sh.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<4;i++)sh.lineTo(Q[i][0],Q[i][1]);P.put(k,new THREE.ExtrudeGeometry(sh,{depth:ep,bevelEnabled:false}),0,yc,z0);};
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/2;brasZ(.05,.204,.03,.05,a,'c',.02,zc-h-.002);brasZ(.075,.188,.009,.018,a,'P',.006,zc-h-.008);}
   P.put('P',tour([[.072,-h+.01],[.07,-h-.006],[.05,-h-.012],[0,-h-.014]],16),0,yc,zc);P.put('c',tour([[.03,-h-.013],[.022,-h-.019],[0,-h-.02]],12),0,yc,zc);
   P.box('k',.30,.10,.12,0,yc,-2.19);P.box('k',.06,.36,.04,0,yc+.22,-2.19);P.box('L',.16,.025,.03,0,1.475,-2.215);}
  // dessous : le compartiment moteur sombre, les ponts rigides et leurs différentiels
  P.box('k',1.31,.55,.98,0,.87,1.37);
  P.cyl('k',.05,1.36,10,0,R,ZF,'x');P.cyl('k',.13,.18,12,.12,.38,ZF,'x');P.cyl('k',.055,1.36,10,0,R,ZR,'x');P.cyl('k',.14,.20,12,0,.38,ZR,'x');
  K.commit(P);
  // ---- LES ROUES : pneu tout-terrain à pavés (18 pouces), jante SAHARA bicolore : cinq branches polies creusées de gris, rebord poli ----
  const hw=TW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x161719},d:{g:'m',c:0x0e0f12},c:{g:'c',c:0xc9ced6},C:{g:'c',c:0x5d636c},P:{g:'m',c:0x3d4047}});
  J.lathe('k',[[.235,-hw],[.37,-hw],[R,-hw*.6],[R,hw*.6],[.37,hw],[.235,hw]],24,0,0,0,'x');
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;for(const s of [-1,1])J.put('k',new THREE.BoxGeometry(TW*.36,.032,.075),s*TW*.2,Math.sin(a+s*.07)*(R+.008),Math.cos(a+s*.07)*(R+.008),Math.PI/2-(a+s*.07),0,0);}
  J.lathe('d',[[.232,-hw+.02],[.232,fx-.03],[0,fx-.03]],20,0,0,0,'x');
  J.lathe('c',[[.234,fx-.012],[.231,fx+.004],[.206,fx+.009],[.196,fx+.005],[.196,fx-.02]],24,0,0,0,'x');   // le rebord poli, large
  // une branche = un trapèze poli (6 cm au moyeu, 10 au rebord) et sa gorge peinte en gris, en relief au milieu
  const bras=(r0,r1,l0,l1,a)=>{const c=Math.cos(a),s9=Math.sin(a),P2=(r,t)=>[r*c-t*s9,r*s9+t*c];return [P2(r0,-l0),P2(r1,-l1),P2(r1,l1),P2(r0,l0)];};
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;J.prism('c',bras(.05,.204,.03,.05,a),.024,fx+.001);J.prism('P',bras(.075,.188,.009,.018,a),.008,fx+.016);}
  J.lathe('P',[[.072,fx-.01],[.07,fx+.012],[.05,fx+.018],[0,fx+.02]],16,0,0,0,'x');                  // le moyeu gris
  J.lathe('c',[[.03,fx+.019],[.022,fx+.025],[0,fx+.026]],12,0,0,0,'x');
  const JG=J.done();
  return {hl:[.505,.995,1.86],tl:[.795,1.055,-2.176],wx:WX,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:TW,style:'nyan',jante:0xc9ced6}};
};

})();
ECH_POTS.wrangler={p:[{t:'reel',r:.034,k:'C',len:.34,jeu:.006,jonc:.006,pts:[[-.55,.33,-2.17]]}]}; // un seul pot, à droite sous le pare-chocs (photo de dos)
Object.assign(I18N,{'LE BAROUDEUR':'THE TRAILBLAZER','Sept fentes, quatre roues motrices, zéro route nécessaire. Il ne contourne pas les obstacles : il monte dessus.':'Seven slots, four-wheel drive, zero road required. It doesn\'t go around obstacles: it climbs them.'});
