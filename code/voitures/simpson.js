// >>> fin SHAPES.wrangler (BOITES)
// · · ·
// · · ·
// · · ·
// <<< SHAPES.simpson (BOITES) >>> — LA CABOSSÉE, la berline rose de la série (2026-10-18, discussion BOÎTES)
SHAPES.simpson=(function(){
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
const RLF={j:{w:.011,g:.0035,k:.55},h:{w:.016,g:0,k:.28}};   // joint : interstice + bords qui plongent ; pli : une arête de lumière
const ligneDe=(P0,kind,s,ferme)=>{const r=RLF[kind],P9=ferme?P0.concat([P0[0]]):P0,n=P9.length;if(n<2)return null;
  const nm=i=>{const a=P9[Math.max(0,i-1)],b=P9[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];};
  const off=d=>P9.map((p,i)=>{const m=nm(i);return [p[0]+m[0]*d,p[1]+m[1]*d];}),segs=[];
  const add=Q=>{for(const s of segsDe(Q,false))segs.push(s);};
  if(r.g){add(off(r.g));add(off(-r.g));}else{add(P9);add(off(r.w));add(off(-r.w));}
  return {P:P9,r:r,segs:segs,bb:bbDe(P9,r.w),s:s||0};};
// LA DÉCOUPE (la même que LE COMBI) : chaque facette, dans la vue qui la regarde, recoupée par les contours et les traits qui la touchent
const decoupe=(TR,ZO,LG,CODES,PEINT,vueDe,GAP)=>{
    const OUT={},emet=(g,ps,n,k)=>{const o=OUT[g]||(OUT[g]={P:[],N:[],K:[]});for(const p of ps){o.P.push(p[0],p[1],p[2]);o.N.push(n[0],n[1],n[2]);}o.K.push(k);};
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
        let n=un;
        if(PEINT.has(k)){let best=null,dc=1e9;for(const [w,L] of lgn){const uv=UVf[w](C3);if(uv[0]<L.bb[0]||uv[0]>L.bb[1]||uv[1]<L.bb[2]||uv[1]>L.bb[3])continue;const r=loin(L,uv[0],uv[1]);if(r[0]<L.r.w&&r[0]<dc){dc=r[0];best=[w,L,r];}}
          if(best){const [w,L,r]=best,R9=L.r;if(R9.g&&dc<R9.g)k=(GAP&&GAP[k]!=null)?GAP[k]:1;
            else{const tl=R9.g?-R9.k*Math.max(0,1-(dc-R9.g)/(R9.w-R9.g)):R9.k*Math.max(0,1-dc/R9.w);
              if(tl){let A=V3[w](r[2]*r[1],r[3]*r[1]);const an=A[0]*un[0]+A[1]*un[1]+A[2]*un[2];A=[A[0]-an*un[0],A[1]-an*un[1],A[2]-an*un[2]];const la=Math.hypot(A[0],A[1],A[2]);
                if(la>1e-6){n=[un[0]+A[0]/la*tl,un[1]+A[1]/la*tl,un[2]+A[2]/la*tl];const h=Math.hypot(n[0],n[1],n[2]);n=[n[0]/h,n[1]/h,n[2]/h];}}}}}
        const Pp=Pq.map(P3);for(let t=1;t<Pp.length-1;t++){const p0=Pp[0],p1=Pp[t],p2=Pp[t+1];
          const ex=p1[0]-p0[0],ey=p1[1]-p0[1],ez=p1[2]-p0[2],fx=p2[0]-p0[0],fy=p2[1]-p0[1],fz=p2[2]-p0[2],cx=ey*fz-ez*fy,cy=ez*fx-ex*fz,cz=ex*fy-ey*fx;
          if(cx*cx+cy*cy+cz*cz<1e-16)continue;emet(CODES[k].g,(cx*un[0]+cy*un[1]+cz*un[2])<0?[p0,p2,p1]:[p0,p1,p2],n,k);}}}
    return OUT;};
/* ============================ LA VOITURE D'HOMER (la berline rose de la série) ============================
   « Identique » : la berline rose telle que dans la série — une américaine des années 70-80 (la série la dit « 1986 Plymouth Junkerolla »,
   ses dessins viennent de la Valiant et de la Fiat 1500), sans plan coté : les images de la série font foi (la capture d'origine, l'affiche
   officielle récente, les versions 3D des jeux). Ce qui la fait reconnaître, tout y est :
   · trois volumes : un long capot plat, une cabine à quatre portes au pare-brise couché, un coffre qui finit en PETITS AILERONS ;
   · la face : deux phares ronds cernés de noir, la calandre gris foncé à quatre lames ; les pare-chocs gris foncé, épais, qui tournent ;
   · L'AILE AVANT GAUCHE FROISSÉE (« que Homer n'a jamais fait réparer ») et l'ANTENNE TORDUE en zigzag qui en sort, près du pare-brise ;
   · les vitres bleu pâle cernées de noir (le trait du dessin), le rétro côté conducteur seulement, les enjoliveurs gris tout plats.
   Deux grilles de tôle (même outil que LE COMBI) : la caisse basse (capot, flancs, coffre, ailerons) et la serre posée dessus ; portes, vitres,
   capot, coffre, calandre et le pli des ailes découpés dedans — les joints font le trait noir du dessin. Repère : x à gauche, y en haut, z vers
   l'avant, mètres ; l'origine au milieu de la caisse. */
const R=.345,TW=.225,WX=.78,ZF=1.45,ZR=-1.33,RA=.425;
// LA GRILLE GÉNÉRIQUE : rangées (bas → haut, faces planes à coins arrondis en plan), puis un dessus en dôme par fractions de largeur
const grille=D=>{
  const ROWS=D.rows.slice(),IL=ROWS.length-1;for(const u of D.toit.u)ROWS.push({t:'r',u:u});
  const nez=r=>{if(r.t==='fc')return [[0,D.zs1-.6],[0,r.zc]];const o=[[r.W,D.zs1-.6]],rc=r.rf;
      for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zc-rc+rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zc]);return o;},
        dos=r=>{if(r.t==='fc')return [[0,D.zs0+.6],[0,r.zr]];const o=[[r.W,D.zs0+.6]],rc=r.rr;
      for(let i=0;i<=8;i++){const p=i/8*Math.PI/2;o.push([r.W-rc+rc*Math.cos(p),r.zr+rc-rc*Math.sin(p)]);}for(let i=1;i<=4;i++)o.push([(r.W-rc)*(1-i/4),r.zr]);return o;};
  const NP=[],DP=[],FN=[],FD=[];
  for(const r of ROWS){if(r.t==='r'){NP.push(null);DP.push(null);FN.push(null);FD.push(null);continue;}
    const a=nez(r),b=dos(r);NP.push(a);DP.push(b);FN.push(colBout(r,a,D.zs1,D.nf,D.ins,1));FD.push(colBout(r,b,D.zs0,D.nr,D.ins,-1));}
  const xAt=(j,z)=>{const r=ROWS[j];if(r.t==='fc')return 0;let x=r.W;if(z>D.zs1-.6){const v=xSur(NP[j],z,1);if(v!=null)x=Math.min(x,v);}
    if(z<D.zs0+.6){const v=xSur(DP[j],z,-1);if(v!=null)x=Math.min(x,v);}return x;};
  const ZS=(()=>{const s=new Set();for(let z=D.zs0;z<D.zs1+.001;z+=D.pas)s.add(+z.toFixed(3));for(const z of (D.plus||[]))s.add(+z.toFixed(4));s.add(D.zs1);
    return [...s].filter(z=>z>=D.zs0-1e-6&&z<=D.zs1+1e-6).sort((a,b)=>a-b).filter((z,i,A)=>i===0||z-A[i-1]>.012);})();
  const COL=[];for(let i=D.nr;i>0;i--)COL.push({k:'d',i:i});for(const z of ZS)COL.push({k:'s',z:z});for(let i=1;i<=D.nf;i++)COL.push({k:'n',i:i});
  const YB=D.yb,point=(c,j)=>{const r=ROWS[j];
    if(c.k==='s'){const z=c.z,yb=YB(z);if(r.t==='fc')return [0,yb,z];if(r.t==='fe')return [xAt(j,z),yb,z];
      if(r.t==='s')return [xAt(j,z),Math.max(r.y,yb),z];return [r.u*xAt(IL,z),D.toit.y(r.u,z),z];}
    const S=c.k==='n'?FN:FD;if(r.t==='r'){const q=S[IL][c.i];return [r.u*q[0],D.toit.y(r.u,q[1]),q[1]];}
    const q=S[j][c.i];return [q[0],r.t==='s'?Math.max(r.y,YB(q[1])):YB(q[1]),q[1]];};
  return {ROWS:ROWS,COL:COL,IL:IL,G:COL.map(c=>ROWS.map((r,j)=>point(c,j)))};};
// ---- LA CAISSE BASSE : flancs, capot (qui descend vers le nez), coffre qui se relève en ailerons ----
const arche=(z,zw)=>{const d=Math.abs(z-zw);return d<RA?R+Math.sqrt(RA*RA-d*d):0;},
      YBb=z=>Math.max(.28,arche(z,ZF),arche(z,ZR));
const capY=z=>z>.95?lin([[.95,.885],[1.6,.862],[2.2,.838],[2.40,.825]],z):z>-1.5?.90:lin([[-2.38,.935],[-1.5,.925]],z),
      aileron=z=>lin([[-2.38,.095],[-2.25,.08],[-2.0,.045],[-1.75,0]],z),
      BAS={rows:[{t:'fc',zc:2.33,zr:-2.31},{t:'fe',W:.84,zc:2.33,zr:-2.31,rf:.14,rr:.12},
        {t:'s',y:.30,W:.90,zc:2.33,zr:-2.31,rf:.14,rr:.12},{t:'s',y:.36,W:.92,zc:2.38,zr:-2.36,rf:.14,rr:.12},{t:'s',y:.46,W:.925,zc:2.40,zr:-2.38,rf:.14,rr:.12},
        {t:'s',y:.56,W:.925,zc:2.40,zr:-2.38,rf:.14,rr:.12},{t:'s',y:.66,W:.925,zc:2.40,zr:-2.38,rf:.14,rr:.12},{t:'s',y:.73,W:.922,zc:2.40,zr:-2.38,rf:.14,rr:.12},
        {t:'s',y:.78,W:.915,zc:2.40,zr:-2.38,rf:.14,rr:.12}],
        toit:{u:[1,.97,.92,.82,.65,.45,.25,0],y:(u,z)=>{const b=capY(z),bord=u>=.999?-.032:u>=.969?-.013:u>=.919?-.004:0,
          cr=(z>.95?.012*lis(cl((z-1.0)/.35,0,1)):z<-1.5?.006:0)*(1-u*u),fin=u>=.82?aileron(z):u>=.65?aileron(z)*(u-.65)/.17:0;return Math.max(.79,b+bord+cr+fin);}},
        zs0:-1.85,zs1:1.95,nr:12,nf:14,ins:.10,pas:.12,yb:YBb,plus:(()=>{const o=[];for(const w of [ZF,ZR])for(let d=-RA;d<=RA+.001;d+=.04)o.push(w+d);return o;})()};
// ---- LA SERRE : pare-brise couché, pavillon, lunette ; elle se resserre vers le haut ----
const zWS=y=>.97-(y-.86)*1.106,zRW=y=>y<=.93?-1.56:-1.56+(y-.93)*1.034,
      SERRE={rows:[[.86,.885],[.92,.876],[1.02,.856],[1.14,.83],[1.26,.805],[1.38,.78],[1.47,.755],[1.52,.735]].map(([y,W])=>({t:'s',y:y,W:W,zc:zWS(y),zr:zRW(y),rf:.05,rr:.06})),
        toit:{u:[1,.95,.85,.6,.3,0],y:(u,z)=>{const zc=zWS(1.52),zr=zRW(1.52),B=Math.min(lin([[0,0],[.03,.5],[.08,.85],[.2,1]],zc-z),lin([[0,0],[.03,.5],[.08,.85],[.2,1]],z-zr));
          return 1.52+lin([[0,.035],[.3,.034],[.6,.03],[.85,.022],[.95,.012],[1,0]],u)*B;}},
        zs0:-.80,zs1:.10,nr:10,nf:12,ins:.05,pas:.15,yb:()=>-1};
// L'AILE AVANT GAUCHE FROISSÉE : la tôle rentre de quelques cm en vagues, du phare jusqu'au passage de roue (côté gauche seulement)
const froisse=p=>{if(p[0]<.35||p[2]<1.55||p[1]<.55)return p;const w=lis(cl((p[2]-1.55)/.30,0,1))*lis(cl((2.42-p[2])/.12,0,1)),h=lis(cl((p[1]-.55)/.18,0,1));
  const v=.6+.4*Math.sin(p[2]*42+p[1]*17),k=w*h*v,dx=.034*k*cl((p[0]-.35)/.5,0,1),dy=p[1]>.80?-.018*k*cl((p[0]-.55)/.3,0,1):0;return [p[0]-dx,p[1]+dy,p[2]];},
      lis=t=>t*t*(3-2*t);
const rrect=(u0,v0,u1,v1,r,n)=>{const o=[],c=[[u1-r,v0+r,-Math.PI/2],[u1-r,v1-r,0],[u0+r,v1-r,Math.PI/2],[u0+r,v0+r,Math.PI]];n=n||4;
  for(const [cu,cv,a0] of c)for(let i=0;i<=n;i++){const a=a0+i/n*Math.PI/2;o.push([cu+Math.cos(a)*r,cv+Math.sin(a)*r]);}return o;};
return function(K){
  const SP=K.spec||{},ROSE=SP.color!=null?SP.color:0xd090d0;
  const PAL={p:{g:'p',c:ROSE},k:{g:'m',c:0x161719},s:{g:'s',c:0x4b474f},S:{g:'s',c:0x9a97a2},c:{g:'c',c:0xd4d8de},C:{g:'c',c:0x6c727b},g:{g:'g',c:0x9cb6c0},
    W:{g:'l',c:0xfff8e8},L:{g:'l',c:0xff2a36},O:{g:'l',c:0xffa21a},Q:{g:'l',c:0xe8e8e8}};
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const CODES=[];CODES[0]={g:'#'};CODES[1]={g:'#',k:.30};CODES[2]={g:'g',c:0x9cb6c0};CODES[3]={g:'g',c:0x16141a};CODES[22]={g:'s',c:0x3e3a42};
  CODES[23]={g:'m',c:0x16171b};CODES[28]={g:'s',c:0x77727d};
  const PEINT=new Set([0]),GAP={};
  const CPx=new THREE.Color(),fondu=y=>.80+.20*cl((y-.25)/1.0,0,1),colP=y=>{CPx.setHex(EP.c);if(EP.grad&&typeof lpGrad==='function')lpGrad(EP.grad,y,CPx);
    const s=((EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0)?fondu(y):1;return [CPx.r*s,CPx.g*s,CPx.b*s];};
  let C9=CACHE[0];
  if(!C9){
    const TR=[],ref=c=>[0,.75,cl(c[2],-1.6,1.6)];
    const tri=(a,b,c,k)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      if(nx*nx+ny*ny+nz*nz<1e-12)return;const m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],r=ref(m);
      if(nx*(m[0]-r[0])+ny*(m[1]-r[1])+nz*(m[2]-r[2])<0)TR.push([a,c,b,k]);else TR.push([a,b,c,k]);};
    const M=p=>[-p[0],p[1],p[2]];
    for(const [D,bas] of [[BAS,1],[SERRE,0]]){const g=grille(D),G=g.G;
      for(let c=0;c<g.COL.length-1;c++)for(let j=0;j<g.ROWS.length-1;j++){
        const A=G[c][j],B=G[c+1][j],C=G[c+1][j+1],E=G[c][j+1];
        let k=bas&&j<=1?23:0;if(bas&&!k&&A[1]<=YBb(A[2])+.001&&B[1]<=YBb(B[2])+.001&&C[1]<=YBb(C[2])+.001&&E[1]<=YBb(E[2])+.001)k=23;
        tri(froisse(A),froisse(B),froisse(C),k);tri(froisse(A),froisse(C),froisse(E),k);          // le flanc gauche (x > 0), l'aile froissée
        tri(M(A),M(B),M(C),k);tri(M(A),M(C),M(E),k);}}
    // ---- LES CONTOURS : vitres cernées de noir, portes, capot, coffre, calandre, le pli des ailes, le froissé ----
    const ZO={cote:[],face:[],dos:[],dessus:[]},LG={cote:[],face:[],dos:[],dessus:[]};
    const zone=(v,k,P,o)=>{o=o||{};ZO[v].push({k:k,sg:segsDe(P,true),bb:bbDe(P,0),s:o.s||0,sur:o.sur||[0]});},
          joint=(v,P,s,ferme)=>{const L=ligneDe(P,'j',s,ferme);if(L)LG[v].push(L);},pli=(v,P,s,ferme)=>{const L=ligneDe(P,'h',s,ferme);if(L)LG[v].push(L);};
    const vitre=(v,P,e)=>{zone(v,3,gonfle(P,e||.014));zone(v,2,P,{sur:[0,3]});};
    vitre('cote',[[-.13,.94],[.80,.94],[.86,.95],[.30,1.475],[-.10,1.475],[-.13,1.45]]);
    vitre('cote',[[-.92,.94],[-.22,.94],[-.22,1.45],[-.25,1.475],[-.72,1.475],[-.84,1.36]]);
    vitre('face',rrect(-.665,.935,.665,1.475,.05),.016);zone('face',3,[[-.72,.84],[.72,.84],[.72,.93],[-.72,.93]],{sur:[0,2,3]});   // (le pied du pare-brise : un joint noir, comme le trait du dessin)vitre('dos',rrect(-.62,.99,.62,1.47,.06),.016);
    joint('cote',[[.93,.90],[.93,.37],[.90,.33],[-.14,.33]]);joint('cote',[[-.155,1.50],[-.155,.33]]);
    joint('cote',[[-.17,.33],[-.88,.33],[-.95,.43],[-1.02,.62],[-1.06,.80],[-1.07,.90]]);
    pli('cote',[[2.30,.735],[-2.30,.735]]);
    joint('dessus',[[.95,-.80],[2.36,-.80]]);joint('dessus',[[.95,.80],[2.36,.80]]);joint('dessus',[[.95,-.80],[.95,.80]]);
    joint('dessus',[[-1.58,-.72],[-2.34,-.72],[-2.34,.72],[-1.58,.72]],0,true);
    joint('dos',[[-.72,.62],[.72,.62]]);
    // la calandre gris foncé, ses quatre lames ; son cadre noir
    zone('face',3,rrect(-.515,.485,.515,.785,.03));zone('face',22,rrect(-.50,.50,.50,.77,.025),{sur:[3]});
    for(let i=0;i<4;i++){const y=.53+i*.068;zone('face',28,rrect(-.47,y,.47,y+.03,.012),{sur:[22]});}
    // le froissé : un trait en vagues sur l'aile avant gauche (et deux plis courts dessous)
    {const P0=[];for(let z=1.64;z<=2.34;z+=.015)P0.push([z,.79+.011*Math.sin(z*34)]);joint('cote',P0,1);
     joint('cote',[[2.02,.775],[2.09,.735],[2.15,.75]],1);}
    const vueDe=(m,n)=>{if(m[2]>2.0&&n[2]>.5)return 'face';if(m[2]>.1&&m[1]>.83&&n[2]>.5)return 'face';if(m[2]<-.8&&n[2]<-.5)return 'dos';
      if(n[1]>.7)return 'dessus';if(Math.abs(n[0])>.3)return 'cote';return null;};
    const OUT=decoupe(TR,ZO,LG,CODES,PEINT,vueDe,GAP);
    C9={};for(const g in OUT){const o=OUT[g];C9[g]={P:new Float32Array(o.P),N:new Float32Array(o.N),K:Uint8Array.from(o.K)};}
    CACHE[0]=C9;}
  // ---- LA CAISSE POSÉE : ses couleurs (la peinture de la boutique comprise) ----
  const gs={},BASE=(()=>{CPx.setHex(EP.c);return [CPx.r,CPx.g,CPx.b];})(),pDe=(EP.g==='p'||EP.g.charAt(0)==='p')&&EP.f!==0,FIX=CODES.map(d=>{if(!d||d.c==null)return null;CPx.setHex(d.c);return [CPx.r,CPx.g,CPx.b];});
  for(const g0 in C9){const c=C9[g0],g=g0==='#'?GP:g0,col=new Float32Array(c.P.length);
    for(let t=0;t<c.K.length;t++){const kk=c.K[t],d=CODES[kk],F=FIX[kk];for(let q=0;q<3;q++){const i=t*9+q*3,y=c.P[i+1];let r,gg,b;
      if(!F){if(EP.grad&&typeof lpGrad==='function'){[r,gg,b]=colP(y);}else{const s=pDe?fondu(y):1;r=BASE[0]*s;gg=BASE[1]*s;b=BASE[2]*s;}if(d.k){r*=d.k;gg*=d.k;b*=d.k;}}
      else{const f=d.g==='#'?fondu(y):1;r=F[0]*f;gg=F[1]*f;b=F[2]*f;}
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
  // les phares ronds cernés de noir
  P.sym(sd=>{P.put('k',tour([[.082,0],[.097,0],[.097,.012],[.082,.014]],20),sd*.712,.63,2.40);P.put('W',tour([[0,.016],[.06,.014],[.082,.008]],20),sd*.712,.63,2.40);});
  // les pare-chocs gris foncé, épais, qui tournent aux coins ; la plaque arrière (`plqDessinee` y pose celle du joueur)
  /* (2026-10-19, BOÎTES : « une boîte grise qui dépasse aux coins ») le pare-chocs du dessin : une BANDE qui tourne en rond aux coins et
     revient le long du flanc, sans dépasser la caisse ; arêtes chanfreinées */
  {const pc=new THREE.Shape(),X=.935,Z=2.47,r=.20,t=.08;
   pc.moveTo(-X,-(Z-r-.11));pc.lineTo(-X,-(Z-r));pc.absarc(-(X-r),-(Z-r),r,Math.PI,Math.PI*1.5,false);pc.lineTo(X-r,-Z);
   pc.absarc(X-r,-(Z-r),r,-Math.PI/2,0,false);pc.lineTo(X,-(Z-r-.11));pc.lineTo(X-t,-(Z-r-.11));pc.lineTo(X-t,-(Z-r));
   pc.absarc(X-r,-(Z-r),r-t,0,-Math.PI/2,true);pc.lineTo(-(X-r),-(Z-t));pc.absarc(-(X-r),-(Z-r),r-t,Math.PI*1.5,Math.PI,true);pc.lineTo(-(X-t),-(Z-r-.11));
   const o9={depth:.15,bevelEnabled:true,bevelThickness:.015,bevelSize:.012,bevelSegments:1,curveSegments:3};
   P.put('s',new THREE.ExtrudeGeometry(pc,o9),0,.285,0,-Math.PI/2,0,0);P.put('s',new THREE.ExtrudeGeometry(pc,o9),0,.285,0,-Math.PI/2,0,Math.PI);}
  P.sym(sd=>{
    P.box('s',.012,.024,.11,sd*.927,.80,.30);P.box('s',.012,.024,.11,sd*.927,.80,-.55);                       // les poignées
    P.box('L',.15,.30,.03,sd*.815,.78,-2.388);P.box('S',.17,.02,.03,sd*.815,.94,-2.39);});                     // les feux, en bout d'aileron
  P.box('Q',.46,.12,.01,0,.36,-2.473);
  // L'ANTENNE TORDUE, en zigzag, sur l'aile avant gauche contre le pare-brise ; la boule au bout
  {const pts=[[.80,.87,1.02],[.80,1.07,1.02],[.81,1.12,1.075],[.80,1.28,1.045],[.79,1.33,.985],[.80,1.50,1.0]];
   for(let i=0;i<pts.length-1;i++)tige('C',pts[i],pts[i+1],.008);P.put('C',new THREE.SphereGeometry(.024,8,6),.80,1.50,1.0);}
  // le rétro côté conducteur (gauche) seulement
  tige('s',[.814,.8745,.80],[.99,1.00,.80],.012);   // (2026-10-27, aucun rétro qui vole) le bras, prolongé dans son axe, part 2 cm DANS le haut de la portière (il s'arrêtait en l'air, à 5 cm de la tôle)
  P.put('s',tour([[0,0],[.055,0],[.06,.02],[0,.025]],12),1.0,1.01,.79,Math.PI,0,0);
  // les joues noires des passages de roue (sans elles on voyait le ciel au travers)
  P.sym(sd=>{for(const zw of [ZF,ZR]){const o=[[zw-RA,.28]];for(let i=0;i<=16;i++){const a=Math.PI-i/16*Math.PI;o.push([zw+Math.cos(a)*RA,R+Math.sin(a)*RA]);}o.push([zw+RA,.28]);
    P.prism('k',o,.22,sd*.56);}});
  // dessous : le plancher sombre
  P.box('k',1.5,.04,4.2,0,.30,0);
  K.commit(P);
  // ---- LES ROUES : pneus noirs, enjoliveurs gris tout plats (le dessin) ----
  const hw=TW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x1b1c20},S:{g:'s',c:0x9a97a2},s:{g:'s',c:0x77727d}});
  J.lathe('k',[[.19,-hw],[.305,-hw],[R,-hw*.55],[R,hw*.55],[.305,hw],[.19,hw]],20,0,0,0,'x');
  J.lathe('S',[[.215,fx-.01],[.21,fx+.006],[.065,fx+.016],[0,fx+.018]],20,0,0,0,'x');
  J.lathe('s',[[.12,fx+.013],[.105,fx+.016]],20,0,0,0,'x');J.lathe('k',[[.18,-hw+.01],[.18,fx-.02],[0,fx-.02]],16,0,0,0,'x');
  const JG=J.done();
  return {hl:[.712,.63,2.42],tl:[.815,.78,-2.40],wx:WX,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:TW,style:'nyan',jante:0x9a97a2}};
};

})();
ECH_POTS.simpson={p:[{t:'reel',r:.028,k:'C',len:.30,jeu:.006,jonc:.006,pts:[[-.50,.26,-2.43]]}]}; // un seul pot, à droite sous le pare-chocs
Object.assign(I18N,{'LA CABOSSÉE':'THE BEATER','Rose bonbon, l\'aile avant gauche froissée depuis toujours, l\'antenne en zigzag. Elle démarre une fois sur deux, mais elle démarre.':'Candy pink, the front left fender crumpled forever, the antenna in a zigzag. It starts every other time, but it starts.'});
