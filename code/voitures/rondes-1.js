/* ===== LES NOUVELLES VOITURES (2026-10-18) — UN EMPLACEMENT PAR GABARIT : chaque discussion remplace SA ligne-repère par son
   `SHAPES.x=function(K){…}` (LA BULLE et LE COMBI refaits : `SHAPES.bulle=` / `SHAPES.combi=` ici, qui remplacent les anciens de l'objet SHAPES). ===== */
// · · ·
// · · ·
// · · ·
// <<< SHAPES.bulle (RONDES) >>>
/* LES OUTILS DES RONDES (2026-10-18, discussion RONDES : LA BULLE, la Fiat 500, la Reliant Robin) — la méthode de LA PERLE, en outils
   génériques (la PERLE garde les siens, dans son gabarit) :
   · `decoupe(gs, GP, zones, PAL)` : LA TÔLE DÉCOUPÉE AU PLAN. Chaque triangle de la tôle (le tampon `GP`) est vu dans la vue qui le
     regarde le plus en face (côté [z,y], dessus [z,|x|], face/dos [|x|,y]) ; chaque contour de cette vue qui le touche le RECOUPE en
     morceaux convexes ; chaque morceau prend la clé du DERNIER contour qui le contient (vitre, cadre, joint, chrome…) et passe dans le
     tampon de sa matière. Les morceaux restent dans le plan de leur facette : la normale ne bouge pas, la caisse reste en facettes.
   · `bande(L, w)` : une ligne du plan → le contour d'une bande de demi-largeur w (un joint, une baguette).
   · `loftLibre(P, k, zs, S, opt)` : un LOFT HORS AXE (une aile, un pare-chocs) : des sections [x,y] au même nombre de points, reliées de
     tranche en tranche, posées des deux côtés (miroir en x), bouchées aux deux bouts.
   · `lisse(gs, cles, deg)` : les normales du verre lissées PAR GROUPES de facettes en chaque point (la leçon du pare-brise de LA PERLE). */
const bulleOutils=(function(){
  const UV=(v,p)=>v==='cote'?[p[2],p[1]]:v==='dessus'?[p[2],Math.abs(p[0])]:[Math.abs(p[0]),p[1]];
  const poly=(P,k,v,o)=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;const sg=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];
      u0=Math.min(u0,a[0]);u1=Math.max(u1,a[0]);v0=Math.min(v0,a[1]);v1=Math.max(v1,a[1]);
      sg.push([a[0],a[1],b[0],b[1],Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}
    return Object.assign({k:k,v:v,sg:sg,bb:[u0,u1,v0,v1],P:P},P.L?{L:P.L,g:P.w}:{},o||{});};
  // une ligne → le contour de sa bande (demi-largeur w), bouts carrés
  const bande=(L,w)=>{const n=L.length,nm=i=>{const a=L[Math.max(0,i-1)],b=L[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];};
    const A=[],B=[];for(let i=0;i<n;i++){const m=nm(i);A.push([L[i][0]+m[0]*w,L[i][1]+m[1]*w]);B.push([L[i][0]-m[0]*w,L[i][1]-m[1]*w]);}const o=A.concat(B.reverse());o.L=L;o.w=w;return o;}; // (19/10) la bande garde sa ligne : la FENTE en a besoin
  const dans=(Z,u,w)=>{let c=false;for(const s of Z.sg)if((s[1]>w)!==(s[3]>w)&&u<(s[2]-s[0])*(w-s[1])/(s[3]-s[1])+s[0])c=!c;return c;};
  const croise=(a,b,c,d,e,f,g,h)=>{const o=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
          return ((o(e,f,g,h,a,b)>0)!==(o(e,f,g,h,c,d)>0))&&((o(a,b,c,d,e,f)>0)!==(o(a,b,c,d,g,h)>0));},
        touche=(Pc,s)=>{const n=Pc.length,de=(x,y)=>{let sg=0;for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n],c=(r[0]-p[0])*(y-p[1])-(r[1]-p[1])*(x-p[0]);
            if(Math.abs(c)<1e-14)continue;const t=c>0?1:-1;if(!sg)sg=t;else if(t!==sg)return false;}return true;};
          if(de(s[0],s[1])||de(s[2],s[3]))return true;
          for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n];if(croise(p[0],p[1],r[0],r[1],s[0],s[1],s[2],s[3]))return true;}return false;},
        fend=(Pc,s)=>{const ax=s[0],ay=s[1],ex=s[2]-ax,ey=s[3]-ay,fv=Pc.map(p=>ex*(p[1]-ay)-ey*(p[0]-ax));let po=0,ne=0;
          for(const v of fv){if(v>1e-12)po++;else if(v<-1e-12)ne++;}if(!po||!ne)return null;
          const A=[],B=[],n=Pc.length;for(let i=0;i<n;i++){const p=Pc[i],r=Pc[(i+1)%n],a=fv[i],b=fv[(i+1)%n];
            if(a>=-1e-12)A.push(p);if(a<=1e-12)B.push(p);
            if((a>1e-12&&b<-1e-12)||(a<-1e-12&&b>1e-12)){const t=a/(a-b),m=p.map((x,j)=>x+(r[j]-x)*t);A.push(m);B.push(m);}}
          return [A,B];},
        bbP=P9=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P9){if(p[0]<u0)u0=p[0];if(p[0]>u1)u1=p[0];if(p[1]<v0)v0=p[1];if(p[1]>v1)v1=p[1];}return [u0,u1,v0,v1];},
        coupe=(Pp0,segs)=>{let parts=[Pp0];const b=bbP(Pp0);for(const s of segs){if(s[5]<b[0]||s[4]>b[1]||s[7]<b[2]||s[6]>b[3])continue;const n2=[];
            for(const Pp of parts){const r=touche(Pp,s)?fend(Pp,s):null;if(r)n2.push(r[0],r[1]);else n2.push(Pp);}parts=n2;}return parts;};
  const AXE={cote:[1,0,0],dessus:[0,1,0],face:[0,0,1],dos:[0,0,-1]};
  /* LA DÉCOUPE. `zones` : [{v, k, sg, bb, al?, ou?}] — `al` : la zone ne mord que sur une tôle qui regarde sa vue au moins à ce cosinus
     (sinon : seulement là où sa vue est la vue DOMINANTE de la facette) ; `ou(cx,cy,cz)` : un filtre de position. Les clés : celles de
     la palette, plus 'j' (le JOINT : un interstice sombre dans la matière de la tôle). */
  /* `memo` (un objet gardé par le gabarit, sur sa fonction) : la découpe ne dépend que de la forme — elle se fait une fois par session ; on
     garde positions, normales et le CODE de chaque sommet (0 : la tôle, sa couleur se recalcule de sa hauteur comme dans lpKit ; sinon la
     clé de palette) — une peinture de la boutique repeint sans redécouper. `lis` : les clés dont les normales se lissent (le verre). */
  const CJ0=[.13,.14,.16];
  const colTole=(E)=>{const C=new THREE.Color();return y=>{C.setHex(E.c);if(E.grad&&typeof lpGrad==='function')lpGrad(E.grad,y,C);
    const s=((E.g==='p'||E.g.charAt(0)==='p')&&E.f!==0)?.80+.20*Math.max(0,Math.min(1,(y-.25)/1.0)):1;return [C.r*s,C.g*s,C.b*s];};};
  const refait=(gs,GP,PAL,memo)=>{const cP=colTole(PAL.p),CL=['p','j'],cc={};
    const cK=c=>{if(cc[c])return cc[c];const k=memo.cles[c];if(k==='j')return cc[c]=CJ0;const C=new THREE.Color(PAL[k]?PAL[k].c:0xff00ff);return cc[c]=[C.r,C.g,C.b];};
    if(gs[GP])gs[GP].dispose();delete gs[GP];
    for(const g9 in memo.G){const m=memo.G[g9],g=g9==='@'?GP:g9,C=new Float32Array(m.P.length);
      for(let i=0,j=0;j<m.K.length;i+=3,j++){let c=m.K[j]===0?cP(m.P[i+1]):cK(m.K[j]);if(m.D&&m.D[j]<9)c=fenteRGB(c,m.D[j],m.Gd[j]);C[i]=c[0];C[i+1]=c[1];C[i+2]=c[2];}
      let P=m.P.slice(),N=m.N.slice();const H=gs[g];
      if(H){const cat=(a,b)=>{const r=new Float32Array(a.length+b.length);r.set(a);r.set(b,a.length);return r;};P=cat(H.attributes.position.array,P);N=cat(H.attributes.normal.array,N);
        const C2=cat(H.attributes.color.array,C);H.dispose();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C2,3));gs[g]=geo;continue;}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));gs[g]=geo;}
    return gs;};
  const decoupe=(gs,GP,zones,PAL,memo,lis)=>{const G=gs[GP];if(!G||!zones.length)return gs;
    const pa=G.attributes.position.array;
    let h=pa.length;for(let i=0;i<pa.length;i+=997)h=(h*31+Math.round(pa[i]*1e4))|0;
    /* (19/10, RONDES — LA FENTE C, l'outil commun de JAPONAISES) un joint 'j' n'est plus un trait sombre fixe : la bande prend la couleur de la
       TÔLE × ,50 (fenteRGB, d = 0) ; et si la bande connaît sa ligne (`bande` la garde), une zone de RAMPE 'jr' de 1,1 cm de part et d'autre
       la double : la tôle y est recoupée et chaque sommet prend fenteRGB(tôle, distance signée à la ligne) — l'ombre qui remonte, le fil clair
       du côté haut (ou avant). `?fente=A` = le trait d'avant. La distance est gardée par sommet (D) : une peinture de boutique la recalcule. */
    const FV=typeof japFente==='function'?japFente():'A',FX=FV!=='A';
    if(memo&&memo.G&&memo.h===h&&memo.fv===FV)return refait(gs,GP,PAL,memo);
    if(FX){const z2=[];for(const Z of zones){if(Z.k==='j'&&Z.L){const R9=poly(bande(Z.L,(Z.g||.0035)+.011),'jr',Z.v,{al:Z.al,ou:Z.ou});R9.L=Z.L;R9.g=Z.g||.0035;z2.push(R9);}z2.push(Z);}zones=z2;}
    const dSig=(L,u,w)=>{let bd=1e9,sd=1;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1e-12,
        q=Math.max(0,Math.min(1,((u-a[0])*dx+(w-a[1])*dy)/l2)),ex=u-a[0]-q*dx,ey=w-a[1]-q*dy,d=Math.hypot(ex,ey);
        if(d<bd){bd=d;const l=Math.sqrt(l2);let nu=-dy/l,nv=dx/l;if(Math.abs(nv)>.3?nv<0:nu<0){nu=-nu;nv=-nv;}sd=(ex*nu+ey*nv)>=0?1:-1;}}return bd*sd;};   // d > 0 : le haut (ou l'avant) — le côté du fil
    const na=G.attributes.normal.array,ca=G.attributes.color.array,OUT={},CJ=CJ0,tmpC={},cles=['p'],code=k=>{let c=cles.indexOf(k);if(c<0){cles.push(k);c=cles.length-1;}return c;};
    const sortie=k=>{const g=k==='j'||k==='p'?GP:(PAL[k]?PAL[k].g:GP);return OUT[g]||(OUT[g]={P:[],N:[],C:[],K:[],D:[],Gd:[]});};
    const coulK=k=>{if(tmpC[k])return tmpC[k];const c=new THREE.Color(PAL[k]?PAL[k].c:0xff00ff);return tmpC[k]=[c.r,c.g,c.b];};
    for(let i=0;i<pa.length;i+=9){
      const cx=(pa[i]+pa[i+3]+pa[i+6])/3,cy=(pa[i+1]+pa[i+4]+pa[i+7])/3,cz=(pa[i+2]+pa[i+5]+pa[i+8])/3;
      const ux=pa[i+3]-pa[i],uy=pa[i+4]-pa[i+1],uz=pa[i+5]-pa[i+2],wx=pa[i+6]-pa[i],wy=pa[i+7]-pa[i+1],wz=pa[i+8]-pa[i+2];
      let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
      const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz),dom=ax>=ay*.75&&ax>=az?'cote':ay>=az?'dessus':nz>0?'face':'dos';
      const al={cote:ax,dessus:Math.max(0,ny),face:Math.max(0,nz),dos:Math.max(0,-nz)};
      const P3=q=>[q[0]*pa[i]+q[1]*pa[i+3]+q[2]*pa[i+6],q[0]*pa[i+1]+q[1]*pa[i+4]+q[2]*pa[i+7],q[0]*pa[i+2]+q[1]*pa[i+5]+q[2]*pa[i+8]];
      const enV=(v,Pp)=>Pp.map(q=>{const u=UV(v,P3(q));return [u[0],u[1],q[0],q[1],q[2]];}),deV=Pp=>Pp.map(q=>[q[2],q[3],q[4]]);
      const T0=[[1,0,0],[0,1,0],[0,0,1]],bbs={};const bbV=v=>bbs[v]||(bbs[v]=bbP(enV(v,T0)));
      const zon=[];for(const Z of zones){if(Z.al!=null?al[Z.v]<Z.al:Z.v!==dom)continue;if(Z.ou&&!Z.ou(cx,cy,cz))continue;const b=bbV(Z.v);
        if(b[1]<Z.bb[0]||b[0]>Z.bb[1]||b[3]<Z.bb[2]||b[2]>Z.bb[3])continue;zon.push(Z);}
      if(!zon.length){const o=sortie('p');for(let j=0;j<9;j++){o.P.push(pa[i+j]);o.N.push(na[i+j]);o.C.push(ca[i+j]);}o.K.push(0,0,0);o.D.push(9,9,9);o.Gd.push(0,0,0);continue;}
      let pcs=[T0];for(const Z of zon){const n2=[];for(const Pp of pcs)for(const q of coupe(enV(Z.v,Pp),Z.sg))n2.push(deV(q));pcs=n2;}
      for(const Pq of pcs){let g0=0,g1=0,g2=0;for(const q of Pq){g0+=q[0];g1+=q[1];g2+=q[2];}g0/=Pq.length;g1/=Pq.length;g2/=Pq.length;
        let k='p',jz=null,rz=null;for(const Z of zon){const c=UV(Z.v,P3([g0,g1,g2]));if(dans(Z,c[0],c[1])){if(Z.k==='jr')rz=Z;else{k=Z.k;jz=Z.k==='j'?Z:null;}}}
        const fzn=FX?(k==='j'?jz:k==='p'?rz:null):null,k2=fzn?'p':k;      // la fente (sa bande, ou sa rampe) reste de la TÔLE
        const o=sortie(k2),cK=k2==='p'?null:k2==='j'?CJ:coulK(k2);
        for(let t=1;t<Pq.length-1;t++){const tr=[Pq[0],Pq[t],Pq[t+1]];
          const A=P3(tr[0]),B=P3(tr[1]),C=P3(tr[2]);const ex=B[0]-A[0],ey=B[1]-A[1],ez=B[2]-A[2],fx=C[0]-A[0],fy=C[1]-A[1],fz=C[2]-A[2];
          if(Math.hypot(ey*fz-ez*fy,ez*fx-ex*fz,ex*fy-ey*fx)<1e-10)continue;
          const cd=code(k2);for(const q of tr){const p=P3(q);o.P.push(p[0],p[1],p[2]);o.N.push(nx,ny,nz);o.K.push(cd);
            if(cK){o.C.push(cK[0],cK[1],cK[2]);o.D.push(9);o.Gd.push(0);continue;}
            const c0=[q[0]*ca[i]+q[1]*ca[i+3]+q[2]*ca[i+6],q[0]*ca[i+1]+q[1]*ca[i+4]+q[2]*ca[i+7],q[0]*ca[i+2]+q[1]*ca[i+5]+q[2]*ca[i+8]];
            if(fzn){const gz=fzn.g||.0035;let d=0;if(fzn.k==='jr'){const u9=UV(fzn.v,p);d=dSig(fzn.L,u9[0],u9[1]);}fenteRGB(c0,d,gz,c0);o.D.push(d);o.Gd.push(gz);}else{o.D.push(9);o.Gd.push(0);}
            o.C.push(c0[0],c0[1],c0[2]);}}}}
    G.dispose();delete gs[GP];
    if(lis&&lis.length){const tmp={};for(const g of lis)if(OUT[g]){const o=OUT[g],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(o.P,3));
        geo.setAttribute('normal',new THREE.Float32BufferAttribute(o.N,3));tmp[g]=geo;}lisse(tmp,lis,35);for(const g in tmp){OUT[g].N=Array.from(tmp[g].attributes.normal.array);tmp[g].dispose();}}
    if(memo){memo.h=h;memo.fv=FV;memo.cles=cles;memo.G={};for(const g in OUT)memo.G[g===GP?'@':g]={P:new Float32Array(OUT[g].P),N:new Float32Array(OUT[g].N),K:new Uint8Array(OUT[g].K),D:new Float32Array(OUT[g].D),Gd:new Float32Array(OUT[g].Gd)};}
    for(const g in OUT){const o=OUT[g],H=gs[g],geo=new THREE.BufferGeometry();
      let P=new Float32Array(o.P),N=new Float32Array(o.N),C=new Float32Array(o.C);
      if(H){const cat=(a,b)=>{const r=new Float32Array(a.length+b.length);r.set(a);r.set(b,a.length);return r;};
        P=cat(H.attributes.position.array,P);N=cat(H.attributes.normal.array,N);C=cat(H.attributes.color.array,C);H.dispose();}
      geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));gs[g]=geo;}
    return gs;};
  /* LE LISSAGE PAR GROUPES : en chaque point, les facettes qui s'y touchent sont réunies de proche en proche (moins de `deg` degrés) ;
     chaque groupe a UNE normale. Le verre glisse sans cassure, une vraie arête reste nette. */
  const lisse=(gs,cles,deg)=>{const NC=Math.cos((deg||35)*Math.PI/180);for(const g of cles){const G=gs[g];if(!G)continue;
      const a=G.attributes.position.array,n=G.attributes.normal.array,M=new Map(),cle=i=>Math.round(a[i]*4e3)+','+Math.round(a[i+1]*4e3)+','+Math.round(a[i+2]*4e3);
      const F=[];for(let i=0;i<a.length;i+=9){const ux=a[i+3]-a[i],uy=a[i+4]-a[i+1],uz=a[i+5]-a[i+2],wx=a[i+6]-a[i],wy=a[i+7]-a[i+1],wz=a[i+8]-a[i+2];
        const fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx,fl=Math.hypot(fx,fy,fz)||1e-14;F.push([fx,fy,fz,fx/fl,fy/fl,fz/fl]);
        for(let q=0;q<9;q+=3){const k=cle(i+q);let l=M.get(k);if(!l)M.set(k,l=[]);l.push(i+q);}}
      const o=new Float32Array(n.length);o.set(n);
      for(const l of M.values()){const m=l.length,par=l.map((_,j)=>j),rac=j=>{while(par[j]!==j)j=par[j]=par[par[j]];return j;},f=j=>F[(l[j]/9)|0];
        for(let x=0;x<m;x++)for(let y=x+1;y<m;y++){const A=f(x),B=f(y);if(A[3]*B[3]+A[4]*B[4]+A[5]*B[5]>=NC){const r1=rac(x),r2=rac(y);if(r1!==r2)par[r1]=r2;}}
        const S=new Map();for(let x=0;x<m;x++){const r=rac(x);let s=S.get(r);if(!s)S.set(r,s=[0,0,0]);const A=f(x);s[0]+=A[0];s[1]+=A[1];s[2]+=A[2];}
        for(let x=0;x<m;x++){const s=S.get(rac(x)),h=Math.hypot(s[0],s[1],s[2]);if(h>1e-14){o[l[x]]=s[0]/h;o[l[x]+1]=s[1]/h;o[l[x]+2]=s[2]/h;}}}
      G.attributes.normal.array.set(o);G.attributes.normal.needsUpdate=true;}return gs;};
  /* LE LOFT HORS AXE. `S(z)` rend une section [[x,y],…] (même nombre de points partout), `k(j,z)` la clé d'une bande (ou une clé fixe) ;
     `opt.sym` : posé des deux côtés (miroir en x) ; `opt.bouts` : les deux bouts bouchés (en éventail autour de leur centre) ;
     `opt.ferme` : la section se referme sur elle-même (un tube). */
  const loftLibre=(P,k,zs,S,opt)=>{opt=opt||{};const sec=zs.map(z=>S(z)),N=sec[0].length,kk=typeof k==='function'?k:()=>k,M=opt.ferme?N:N-1;
    const pose=(sd)=>{const X=p=>sd*p[0];const t=(c,a,b,d)=>sd>0?P.tri(c,a,b,d):P.tri(c,a,d,b);
      const Zp=(p,z)=>z+(p[2]||0);   // (un 3e terme : la section penche — le cerclage d'un phare incliné)
      for(let i=0;i<zs.length-1;i++){const A=sec[i],C=sec[i+1],z0=zs[i],z1=zs[i+1];
        for(let j=0;j<M;j++){const j2=(j+1)%N,c=kk(j,(z0+z1)/2);const a=[X(A[j]),A[j][1],Zp(A[j],z0)],b=[X(A[j2]),A[j2][1],Zp(A[j2],z0)],cc=[X(C[j2]),C[j2][1],Zp(C[j2],z1)],d=[X(C[j]),C[j][1],Zp(C[j],z1)];
          t(c,a,b,cc);t(c,a,cc,d);}}
      if(opt.bouts)for(const [s9,z,dir] of [[sec[0],zs[0],-1],[sec[sec.length-1],zs[zs.length-1],1]]){let mx=0,my=0,mz=0;for(const p of s9){mx+=p[0];my+=p[1];mz+=p[2]||0;}mx/=N;my/=N;mz/=N;
        const c=kk(dir>0?-1:-2,z);for(let j=0;j<M;j++){const j2=(j+1)%N,a=[X(s9[j]),s9[j][1],Zp(s9[j],z)],b=[X(s9[j2]),s9[j2][1],Zp(s9[j2],z)],m=[sd*mx,my,z+mz];
          if(dir>0)t(c,m,b,a);else t(c,m,a,b);}}};
    if(opt.sym===false)pose(1);else{pose(1);pose(-1);}};
  // un contour fermé échantillonné : n points également espacés le long du périmètre
  const reech=(Q,n,ferme)=>{const F=ferme?Q.concat([Q[0]]):Q;const cum=[0];for(let i=1;i<F.length;i++)cum.push(cum[i-1]+Math.hypot(F[i][0]-F[i-1][0],F[i][1]-F[i-1][1]));
    const L=cum[cum.length-1],o=[];for(let k=0;k<n;k++){const s=L*k/(ferme?n:n-1);let i=1;while(i<cum.length-1&&cum[i]<s)i++;const t=(s-cum[i-1])/((cum[i]-cum[i-1])||1);
      o.push([F[i-1][0]+(F[i][0]-F[i-1][0])*t,F[i-1][1]+(F[i][1]-F[i-1][1])*t]);}return o;};
  // la coupe d'un contour par une verticale u : [bas, haut]
  const coupeV=(P,u)=>{let lo=1e9,hi=-1e9;const n=P.length;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];
      if((a[0]-u)*(b[0]-u)<=0&&a[0]!==b[0]){const t=a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]);if(t<lo)lo=t;if(t>hi)hi=t;}}return hi>lo?[lo,hi]:null;};
  // un contour fermé GONFLÉ de d (d < 0 : rentré) — le cadre chromé autour d'une vitre
  const gonfle=(P,d)=>{const n=P.length;let A=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1];}const sg=A>0?-1:1,o=[];
    for(let i=0;i<n;i++){const a=P[(i+n-1)%n],b=P[i],c=P[(i+1)%n],e1=[b[0]-a[0],b[1]-a[1]],e2=[c[0]-b[0],c[1]-b[1]],l1=Math.hypot(e1[0],e1[1])||1,l2=Math.hypot(e2[0],e2[1])||1;
      const n1=[sg*e1[1]/l1,-sg*e1[0]/l1],n2=[sg*e2[1]/l2,-sg*e2[0]/l2];let m=[n1[0]+n2[0],n1[1]+n2[1]];const lm=Math.hypot(m[0],m[1])||1;m=[m[0]/lm,m[1]/lm];
      const k=d/Math.max(.45,m[0]*n1[0]+m[1]*n1[1]);o.push([b[0]+m[0]*k,b[1]+m[1]*k]);}return o;};
  /* LE TUBE : une section [[n,y],…] (n : vers le dehors du chemin, y : vers le haut) balayée le long d'un chemin 3D [[x,y,z],…] ;
     `fin` : les deux bouts bouchés. Pare-chocs, butoirs, barres. */
  const tube=(P,k,ch,sec,fin)=>{const N=sec.length,F=[];for(let i=0;i<ch.length;i++){const a=ch[Math.max(0,i-1)],b=ch[Math.min(ch.length-1,i+1)];
      let tx=b[0]-a[0],ty=b[1]-a[1],tz=b[2]-a[2];const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
      let ux=0,uy=1,uz=0;if(Math.abs(ty)>.9){ux=0;uy=0;uz=1;}const d=ux*tx+uy*ty+uz*tz;ux-=d*tx;uy-=d*ty;uz-=d*tz;const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;
      const nx=ty*uz-tz*uy,ny=tz*ux-tx*uz,nz=tx*uy-ty*ux;F.push(sec.map(q=>[ch[i][0]+nx*q[0]+ux*q[1],ch[i][1]+ny*q[0]+uy*q[1],ch[i][2]+nz*q[0]+uz*q[1]]));}
    for(let i=0;i<F.length-1;i++)for(let j=0;j<N;j++){const j2=(j+1)%N;P.tri(k,F[i][j],F[i][j2],F[i+1][j2]);P.tri(k,F[i][j],F[i+1][j2],F[i+1][j]);}
    if(fin)for(const [S9,s] of [[F[0],1],[F[F.length-1],-1]]){let c=[0,0,0];for(const p of S9){c[0]+=p[0]/N;c[1]+=p[1]/N;c[2]+=p[2]/N;}
      for(let j=0;j<N;j++){const j2=(j+1)%N;if(s>0)P.tri(k,c,S9[j2],S9[j]);else P.tri(k,c,S9[j],S9[j2]);}}};
  // une géométrie de tour (révolution autour de +y : [rayon, hauteur]) posée en p, son axe tourné vers la direction `dir`
  const tour=(P,k,pts,n,p,dir,sx,sz)=>{const g=new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1])),n);if(sx||sz)g.scale(sx||1,1,sz||1);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dir[0],dir[1],dir[2]).normalize());
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));P.put(k,g,p[0],p[1],p[2]);};
  return {gonfle:gonfle,tube:tube,tour:tour,poly:poly,bande:bande,dans:dans,decoupe:decoupe,lisse:lisse,loftLibre:loftLibre,reech:reech,coupeV:coupeV,UV:UV,AXE:AXE};
})();
SHAPES.bulle=function(K){
  /* LA BULLE refaite (2026-10-18, Léo : « à refaire, avec le même soin que LA PERLE ; s'inspirer de la photo de cette annonce
     (une Coccinelle 1962) ; bleu ciel »). Tout vient d'un PLAN COTÉ (la Type 1, élévations de côté, de face, de dos et vue de dessus,
     213,6 unités par mètre, l'empattement de 2,40 m comme étalon), relevé en mètres dans le repère du jeu (x à droite, y en haut,
     z vers l'avant, z = 0 au milieu de la longueur). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.338,ZF=1.302,ZR=-1.098;
  const PAL={p:{g:'p',c:0x93cfd6},k:{g:'m',c:0x161719},K:{g:'g',c:0x0d0e11},c:{g:'c',c:0xe2e6eb},g:{g:'g',c:0x1a2632},
    W:{g:'l',c:0xfff4dc},L:{g:'l',c:0xd81e2a},O:{g:'l',c:0xffa21a},w:{g:'s',c:0xf1eee6},s:{g:'s',c:0xe9e2cf},d:{g:'m',c:0x101114},y:{g:'m',c:0x1f4651}};
  // ---- LES COURBES DU PLAN (mètres) ----
  // le dessus, dans l'axe (côté) : pare-chocs exclus — capot, pare-brise, pavillon, lunette, capot moteur, jupe
  const yTop=z=>L([[-1.865,.47],[-1.84,.55],[-1.81,.61],[-1.77,.69],[-1.707,.761],[-1.671,.827],[-1.617,.913],[-1.555,.993],[-1.49,1.064],[-1.377,1.158],
    [-1.216,1.275],[-1.053,1.38],[-.998,1.42],[-.914,1.456],[-.828,1.486],[-.745,1.508],[-.65,1.526],[-.443,1.545],[-.159,1.549],[-.022,1.542],[.129,1.523],
    [.283,1.492],[.444,1.448],[.473,1.423],[.584,1.229],[.668,1.103],[.865,1.094],[1.021,1.077],[1.201,1.047],[1.343,1.009],[1.471,.96],[1.573,.904],
    [1.661,.835],[1.727,.758],[1.80,.67],[1.86,.60],[1.90,.55],[1.925,.49]],z);
  // la plus grande largeur de la caisse (dessus : le pli de ceinture, puis le « U » de la poupe)
  const xC=z=>L([[-1.865,.02],[-1.854,.06],[-1.845,.10],[-1.822,.165],[-1.788,.225],[-1.737,.29],[-1.676,.345],[-1.59,.408],[-1.487,.467],[-1.422,.496],
    [-1.305,.542],[-.949,.654],[-.789,.684],[-.59,.703],[-.273,.713],[.075,.705],[.478,.676],[.617,.66],[.70,.645]],z);
  const yCr=z=>L([[-1.865,.52],[-1.75,.56],[-1.6,.64],[-1.42,.76],[-1.2,.85],[-1.0,.88],[.70,.88]],z);
  // la gouttière (côté : sa hauteur ; dessus : sa demi-largeur) — devant, le montant du pare-brise ; derrière, l'épaule qui descend vers l'aile
  const yG=z=>L([[-1.80,.62],[-1.65,.70],[-1.527,.729],[-1.363,.901],[-1.238,1.022],[-1.096,1.147],[-.988,1.229],[-.92,1.272],[-.845,1.309],[-.767,1.339],[-.683,1.364],
    [-.591,1.384],[-.494,1.398],[-.247,1.41],[.057,1.408],[.199,1.397],[.31,1.383],[.4,1.355],[.437,1.335],[.47,1.309],[.508,1.265],[.60,1.11],[.683,.975],[.70,.965]],z);
  const xG=z=>L([[-1.80,.20],[-1.70,.32],[-1.59,.40],[-1.487,.46],[-1.399,.50],[-1.308,.53],[-1.2,.549],[-1.07,.559],[-.6,.57],[-.28,.575],[.09,.57],[.445,.55],[.50,.556],[.60,.58],[.70,.62]],z);
  // le capot avant : son bord (dessus : demi-largeur ; côté et face : hauteur)
  const xH=z=>L([[.70,.62],[.83,.595],[1.114,.539],[1.289,.495],[1.449,.448],[1.596,.398],[1.698,.356],[1.80,.291],[1.866,.216],[1.907,.119],[1.925,.03]],z),
        yH=z=>L([[.70,.965],[.911,.958],[1.062,.944],[1.189,.921],[1.332,.881],[1.449,.84],[1.596,.77],[1.698,.71],[1.80,.62],[1.866,.585],[1.925,.55]],z);
  const yBas=z=>L([[-1.865,.46],[-1.70,.40],[-1.50,.30],[1.55,.30],[1.75,.36],[1.925,.38]],z);
  // la JUPE AVANT : sous le nez du capot, elle s'étend entre les ailes (vue de face : jusqu'à 0,31 m sous les phares) — sa largeur et le haut de sa face
  const xJupe=z=>L([[1.55,0],[1.62,.43],[1.75,.41],[1.83,.385],[1.88,.35],[1.925,.28]],z),yJupe=z=>L([[1.55,.70],[1.70,.62],[1.82,.575],[1.925,.55]],z);
  // ---- LA COQUE : une section par tranche, 20 points du bas (axe) au faîte (axe) ----
  const NS=20;
  const sect=z=>{
    const yb=yBas(z),yt=yTop(z),s=[];
    // la part « capot » (de 0 dans l'habitacle à 1 sur le capot) et la part « poupe »
    const hk=lis(cl((z-.69)/.08,0,1));
    let xc=xC(z),yc=Math.min(yCr(z),yG(z)-.03),xg=xG(z),yg=Math.min(yG(z),yt-.005);
    // la ceinture (le bas des vitres) : 1,02 m le long des vitres, la base du pare-brise devant, sous la gouttière derrière
    let yv=z>.55?mix(1.02,.967,cl((z-.55)/.14,0,1)):1.02;yv=Math.min(yv,yg-.02);let xv=Math.min(xc-.04,mix(xc,xg,.22));
    if(hk>0){const xh=xH(z),yh=yH(z);xc=mix(xc,xh,hk);yc=mix(yc,yh-.03,hk);xv=mix(xv,xh,hk);yv=mix(yv,yh,hk);xg=mix(xg,xh*.995,hk);yg=mix(yg,yh+.001,hk);}
    let xw=Math.min(xc-.03,z>-.62&&z<.70?.66:xc*.92);
    {const xj=xJupe(z);if(xj>xc){const k=lis(cl((xj-xc)/.06,0,1));xw=mix(xw,xj,k);const yj=Math.min(yJupe(z),yv-.015);xc=mix(xc,xj-.03,k);yc=mix(yc,yj,k);}}
    s.push([0,yb],[xw*.9,yb],[xw,yb+.02]);
    // le flanc bas : de la base au pli de ceinture (bombé)
    for(const t of [.25,.5,.75]){const y=mix(yb+.02,yc,t),b=Math.sin(t*Math.PI/2);s.push([mix(xw,xc,b),y]);}
    s.push([xc,yc]);
    // le haut du flanc, jusqu'au bas des vitres
    s.push([mix(xc,xv,.55),mix(yc,yv,.5)],[xv,yv]);
    // la vitre (ou le montant) : droite de la ceinture à la gouttière
    for(const t of [.33,.66])s.push([mix(xv,xg,t),mix(yv,yg,t)]);
    s.push([xg,yg]);
    // le pavillon : arc de la gouttière au faîte (plus rond sur le capot)
    const p=mix(2.6,2.0,hk);
    for(const t of [.86,.70,.52,.33,.16])s.push([t*xg,yt-(yt-yg)*Math.pow(t,p)]);
    s.push([0,yt]);
    for(let i=1;i<s.length;i++)if(s[i][1]<s[i-1][1]-.0001&&i<NS-1)s[i][1]=s[i-1][1];
    return s;};
  const zs0=[-1.865,-1.854,-1.84,-1.82,-1.79,-1.75,-1.707,-1.671,-1.617,-1.555,-1.49,-1.42,-1.377,-1.30,-1.216,-1.13,-1.053,-.998,-.94,-.86,
    -.75,-.65,-.55,-.443,-.33,-.22,-.10,.02,.14,.26,.36,.444,.473,.53,.584,.63,.668,.69,.72,.76,.865,.96,1.06,1.16,1.26,1.36,1.47,1.57,1.66,1.727,1.78,1.83,1.87,1.90,1.925];
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.004);
  const peint=(j,z)=>j<0?'p':j<=1?'k':'p';
  const PL=K.kit(PAL);PL.loft(zs,sect,peint);
  /* LA TÔLE DÉCOUPÉE AU PLAN (la méthode de LA PERLE, `bulleOutils.decoupe`) : les vitres et leur cadre chromé, la baguette de ceinture, les
     joints des portes, du capot et du capot moteur, les ouïes sous la lunette — chacun dans SA vue, le dernier contour qui contient un
     morceau le peint. */
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,fer=Q=>Q.concat([Q[0]]);
  const VPOR=[[-.146,1.022],[-.166,1.025],[-.183,1.034],[-.192,1.048],[-.197,1.07],[-.196,1.336],[-.193,1.347],[-.187,1.356],[-.177,1.362],[-.163,1.364],[.016,1.363],[.156,1.355],
    [.293,1.339],[.334,1.329],[.371,1.317],[.422,1.288],[.464,1.246],[.559,1.09],[.569,1.059],[.567,1.045],[.559,1.033],[.547,1.027],[.53,1.024]],
    VCUS=[[-.349,1.03],[-.327,1.032],[-.31,1.041],[-.3,1.055],[-.295,1.076],[-.296,1.332],[-.3,1.345],[-.306,1.354],[-.329,1.365],[-.351,1.366],[-.454,1.357],[-.568,1.341],
    [-.667,1.318],[-.757,1.286],[-.83,1.251],[-.882,1.213],[-.904,1.191],[-.92,1.168],[-.931,1.146],[-.937,1.121],[-.938,1.085],[-.927,1.053],[-.906,1.035],[-.877,1.025]],
    PBR=[[0,1.393],[.189,1.39],[.313,1.383],[.394,1.371],[.442,1.352],[.477,1.318],[.498,1.267],[.529,1.117],[.531,1.077],[.525,1.056],[.509,1.044],[.483,1.042],[.325,1.068],[.225,1.08],[.114,1.086],[0,1.088]],
    LUN=[[0,1.389],[.134,1.385],[.242,1.373],[.335,1.353],[.403,1.325],[.419,1.31],[.43,1.291],[.447,1.22],[.446,1.13],[.44,1.106],[.429,1.09],[.416,1.085],[.396,1.086],[.26,1.118],[.179,1.131],[0,1.141]],
    CAPOT=[[.75,0],[.803,.155],[.75,.493],[.749,.538],[.757,.572],[.769,.587],[.783,.594],[.828,.595],[1.114,.539],[1.289,.495],[1.449,.448],[1.596,.398],[1.698,.356],[1.751,.327],[1.8,.291],[1.836,.256],[1.866,.216],[1.889,.172],[1.907,.119],[1.917,.065],[1.921,0]],
    MOT=[[0,1.057],[.137,1.048],[.272,1.021],[.387,.976],[.44,.945],[.468,.921],[.482,.901],[.489,.876],[.488,.848],[.48,.81],[.443,.719],[.384,.624],[0,.624]];
  const Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  // côté
  for(const W9 of [VPOR,VCUS]){zo('cote',O.gonfle(W9,.016),'c',{al:.45,ou:(x,y,z)=>y>.98});zo('cote',W9,'g',{al:.45,ou:(x,y,z)=>y>.98});}
  zo('cote',O.bande([[.362,1.022],[.30,1.337]],.008),'c',{al:.45,ou:(x,y,z)=>y>.98});                          // le montant du déflecteur
  zo('cote',O.bande([[.70,.952],[-.25,.952],[-.70,.952],[-1.02,.952]],.0065),'c',{al:.55,ou:(x,y,z)=>z>-1.05&&z<.72}); // la baguette de ceinture
  for(const J9 of [[[-.248,.335],[-.248,1.40]],[[.692,.335],[.692,.941],[.683,.975],[.508,1.265],[.47,1.31]],[[-.252,.34],[.696,.34]]])
    zo('cote',O.bande(J9,.0035),'j',{al:.6});
  // dessus : le capot avant
  zo('dessus',O.bande(CAPOT,.0035),'j',{al:.3,ou:(x,y,z)=>z>.7});
  // face : le pare-brise ; dos : la lunette, le capot moteur, les ouïes
  zo('face',O.gonfle(PBR.concat(PBR.slice(1,-1).reverse().map(p=>[-p[0],p[1]])).map(p=>[p[0],p[1]]),.018).map(p=>[Math.abs(p[0]),p[1]]),'c',{al:.35,ou:(x,y,z)=>z>.4&&y>1.0});
  zo('face',PBR.concat([[0,1.088]]),'g',{al:.35,ou:(x,y,z)=>z>.4&&y>1.0});
  zo('dos',O.gonfle(LUN,.018),'c',{al:.3,ou:(x,y,z)=>z<-.9&&y>1.0});zo('dos',LUN,'g',{al:.3,ou:(x,y,z)=>z<-.9&&y>1.0});
  zo('dos',O.bande(MOT.slice(0,-1),.0035),'j',{al:.25,ou:(x,y,z)=>z<-1.3});
  for(let i=0;i<17;i++){const x=.02+i*.0265,yt=1.112-.035*Math.pow(x/.45,2),h=.07-.02*(x/.45);zo('dos',[[x-.006,yt-h],[x+.006,yt-h],[x+.006,yt],[x-.006,yt]],'d',{al:.2,ou:(x,y,z)=>z<-1.2&&y>.95});}
  const MEMO=(typeof SHAPES==='object'&&SHAPES.bulle&&SHAPES.bulle.length===1)?(SHAPES.bulle._tole||(SHAPES.bulle._tole={})):null;   // (la découpe gardée d'une construction à l'autre)
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  // ---- LES AILES : quatre tubes fermés hors axe, une section par tranche ----
  /* la coupe d'une aile vue de face (le plan) : la crête au tiers intérieur, le flanc extérieur vertical, le bas rentré ; `xi` le bord
     intérieur (il plonge sous le bord du capot, dans la caisse), `xo` la plus grande largeur, `yT` la crête, `yL` le bord bas (l'arche).
     Le tube se referme par un PLANCHER au niveau de l'arche (la doublure de l'aile, au-dessus du pneu). Rééchantillonné à NA points
     également espacés, départ au bord intérieur : d'une tranche à l'autre les points se correspondent. */
  const NA=26;
  // (les points sont RÉPARTIS PAR TRONÇON, en nombre fixe : d'une tranche à l'autre chaque point garde son rôle — le rééchantillonnage au
  // périmètre les faisait glisser, la tôle se froissait)
  const coupeAile=(xi,xo,yT,yL)=>{const H=Math.max(.02,yT-yL),xc=xi+.34*(xo-xi),a=Math.min(.42*H,.20),yb=Math.min(yL,yT-.012);
    const s=[[xi-.03,Math.max(yb,yT-.13)],[xi,Math.max(yb,yT-.04)],[mix(xi,xc,.5),yT-.006]];                    // 3 : le bord intérieur
    for(let k=0;k<=8;k++){const t=k/8*Math.PI/2;s.push([xc+(xo-xc)*Math.sin(t),yT-a+a*Math.cos(t)]);}            // 9 : la crête jusqu'au flanc
    const y1=Math.max(yb+.004,yT-a-.45*(H-a)),y2=Math.max(yb+.002,mix(yT-a,yb,.82));
    s.push([xo,mix(yT-a,y1,.5)],[xo,y1],[xo-.004,mix(y1,y2,.5)],[xo-.012,y2],[mix(xo-.012,xo-Math.min(.06,.14*H),.5),mix(y2,yb,.6)],[xo-Math.min(.06,.14*H),yb]); // 6 : le flanc
    const xb=xo-Math.min(.06,.14*H);for(let k=1;k<=7;k++)s.push([mix(xb,xi-.03,k/8),yb]);                       // 7 : le plancher (la doublure)
    s.push([xi-.03,mix(yb,Math.max(yb,yT-.13),.5)]);                                                          // 1 : on remonte
    return s;};
  // le bout d'une aile : chaque point glisse RADIALEMENT vers un cercle (ou une ellipse) penché autour du centre `c`
  const cercle=(s,c,r,ry,inc)=>s.map(p=>{const a=Math.atan2((p[1]-c[1])/(ry||r)*r,p[0]-c[0]),dy=Math.sin(a)*(ry||r);return [c[0]+Math.cos(a)*r,c[1]+dy,-dy*(inc||0)];});
  const fond=(s,C,k)=>k<=0?s:s.map((p,i)=>[mix(p[0],C[i][0],k),mix(p[1],C[i][1],k),mix(0,C[i][2],k)]);
  const HC=[.505,.665],TPH=Math.tan(25*Math.PI/180);
  const AV={yT:[[.70,.30],[.705,.343],[.759,.491],[.805,.588],[.847,.654],[.896,.712],[.952,.759],[1.016,.799],[1.085,.83],[1.16,.854],[1.229,.866],[1.302,.869],[1.394,.86],
             [1.493,.84],[1.596,.812],[1.683,.78],[1.726,.759],[1.776,.74],[1.82,.72],[1.85,.70]],
    xo:[[.70,.62],[.76,.70],[.828,.733],[.946,.747],[1.101,.756],[1.30,.762],[1.567,.767],[1.663,.766],[1.722,.757],[1.765,.738],[1.802,.707],[1.835,.657],[1.85,.63]],
    yL:[[.70,.29],[.907,.30],[.943,.431],[.972,.516],[1.003,.58],[1.042,.633],[1.094,.682],[1.155,.719],[1.217,.74],[1.288,.747],[1.382,.736],[1.427,.72],[1.464,.70],
        [1.506,.668],[1.548,.625],[1.675,.461],[1.712,.422],[1.79,.40],[1.85,.40]]};
  const AR9={yT:[[-1.80,.38],[-1.76,.44],[-1.70,.51],[-1.64,.59],[-1.58,.66],[-1.507,.726],[-1.435,.785],[-1.361,.834],[-1.295,.866],[-1.226,.888],[-1.148,.90],[-1.073,.90],
             [-.995,.888],[-.926,.864],[-.865,.831],[-.809,.789],[-.76,.738],[-.718,.679],[-.678,.602],[-.646,.518],[-.622,.426],[-.612,.34],[-.605,.30]],
    xo:[[-1.80,.40],[-1.787,.427],[-1.719,.562],[-1.685,.614],[-1.647,.659],[-1.603,.698],[-1.56,.729],[-1.514,.751],[-1.463,.766],[-1.363,.78],[-1.178,.786],[-.914,.782],
        [-.684,.773],[-.631,.767],[-.605,.758],[-.586,.738],[-.572,.704],[-.565,.69]],
    yL:[[-1.80,.32],[-1.69,.33],[-1.62,.345],[-1.57,.363],[-1.529,.388],[-1.495,.421],[-1.386,.591],[-1.351,.632],[-1.315,.664],[-1.265,.696],[-1.211,.72],[-1.153,.734],
        [-1.094,.737],[-1.023,.727],[-.956,.704],[-.893,.669],[-.845,.626],[-.806,.573],[-.776,.508],[-.754,.44],[-.722,.307],[-.70,.29],[-.605,.29]]};
  const PA=K.kit(PAL);
  // l'aile AVANT : de la pointe sur le marchepied jusqu'au PHARE — ses dernières tranches s'arrondissent en un cerclage penché de 25°
  {const zsA=[];for(let z=.705;z<1.60;z+=.05)zsA.push(+z.toFixed(3));for(let z=1.60;z<1.778;z+=.025)zsA.push(+z.toFixed(3));zsA.push(1.78);
   const base=z=>{const yT=L(AV.yT,z),xo=L(AV.xo,z),yL=Math.min(L(AV.yL,z),yT-.02),xi=Math.min(z<.76?xo-.08:xH(Math.max(.76,z))-.03,xo-.08);return coupeAile(xi,xo,yT,yL);};
   const s0=base(1.60);
   O.loftLibre(PA,'p',zsA,z=>{const s=base(z),k=lis(cl((z-1.60)/.18,0,1));return k>0?fond(s,cercle(s,HC,.132,.132,TPH),k):s;},{bouts:true,ferme:true});}
  // l'aile ARRIÈRE : de la pointe sur le marchepied jusqu'à la jupe, où elle se referme en ogive
  {const zsR=[];zsR.push(-1.80,-1.78,-1.755,-1.73);for(let z=-1.70;z<-.605;z+=.05)zsR.push(+z.toFixed(3));zsR.push(-.605);
   const base=z=>{const yT=L(AR9.yT,z),xo=L(AR9.xo,z),yL=Math.min(L(AR9.yL,z),yT-.02),xi=Math.min(xC(z)-.07,xo-.08);return coupeAile(xi,xo,yT,yL);};
   const s0=base(-1.70);
   O.loftLibre(PA,'p',zsR,z=>{const s=base(z),k=lis(cl((-1.70-z)/.10,0,1));return k>0?fond(s,cercle(s,[.60,.37],.10,.05,0),k*.85):s;},{bouts:true,ferme:true});}
  PA.ech=true;K.commit(PA);
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  // les MARCHEPIEDS : caoutchouc noir, jonc chromé au bord
  P.sym(sd=>{P.box('k',.15,.034,1.33,sd*.68,.262,.05);P.box('c',.012,.014,1.33,sd*.756,.274,.05);});
  // LES PARE-CHOCS à lame, BUTOIRS et « porte-serviettes » (l'annonce : la version export)
  const LAME=[[-.012,-.044],[.016,-.046],[.03,-.034],[.036,-.012],[.036,.012],[.03,.034],[.016,.046],[-.012,.044],[-.018,.02],[-.018,-.02]];
  const lameCh=(Q,y)=>{const o=[];for(let i=Q.length-1;i>=1;i--)o.push([-Q[i][0],y,Q[i][1]]);for(const q of Q)o.push([q[0],y,q[1]]);return o;};
  const AVL=[[0,2.012],[.20,2.003],[.35,1.985],[.48,1.958],[.58,1.927],[.65,1.89],[.70,1.85],[.725,1.815]],ARL=[[0,-1.95],[.13,-1.947],[.25,-1.932],[.35,-1.907],[.45,-1.872],[.53,-1.833],[.61,-1.783],[.68,-1.725],[.72,-1.68]];
  O.tube(P,'c',lameCh(AVL,.42),LAME,true);O.tube(P,'c',lameCh(ARL,.42).reverse(),LAME,true);
  const BUT=[[.018,0],[.0127,.0127],[0,.018],[-.0127,.0127],[-.018,0],[-.0127,-.0127],[0,-.018],[.0127,-.0127]],BAR=[[.011,0],[.0078,.0078],[0,.011],[-.0078,.0078],[-.011,0],[-.0078,-.0078],[0,-.011],[.0078,-.0078]];   // (19/10) butoirs et porte-serviettes RONDS, huit pans (des barres carrées)
  P.sym(sd=>{
    for(const [x9,zb,s] of [[.355,1.99,1],[.40,-1.935,-1]]){
      O.tube(P,'c',[[sd*x9,.36,zb],[sd*x9,.40,zb+s*.035],[sd*x9,.47,zb+s*.04],[sd*x9,.54,zb+s*.032],[sd*x9,.60,zb+s*.015],[sd*x9,.63,zb-s*.02]],BUT,true);
      const zc=x=>L(s>0?AVL:ARL.map(q=>[q[0],q[1]]),x);
      O.tube(P,'c',[[sd*(x9+.01),.555,zb+s*.02],[sd*.50,.556,zc(.50)+s*.035],[sd*.60,.554,zc(.60)+s*.032],[sd*.645,.53,zc(.645)+s*.028],[sd*.665,.49,zc(.665)+s*.022],[sd*.668,.445,zc(.668)+s*.012]],BAR,true);}
  });
  // LES PHARES : cerclage chromé, glace bombée, penchés de 25° (la caisse de 1962), au bout de l'aile
  const DPH=[0,Math.sin(25*Math.PI/180),Math.cos(25*Math.PI/180)];
  P.sym(sd=>{const c=[sd*HC[0],HC[1],1.783];
    O.tour(P,'c',[[.128,-.03],[.134,-.004],[.126,.012],[.108,.019],[.097,.014]],22,c,DPH);
    O.tour(P,'W',[[.097,.014],[.08,.026],[.05,.034],[0,.037]],22,c,DPH);});
  // LES FEUX (les photos de l'annonce) : une NACELLE ovale couleur caisse sur le dos de l'aile arrière, la glace rouge bombée au bout,
  // cerclée de chrome — tournée vers l'arrière, un peu vers le dehors
  P.sym(sd=>{const c=[sd*.545,.628,-1.60],D=[sd*.18,-.04,-1];
    O.tour(P,'p',[[0,-.11],[.035,-.10],[.056,-.06],[.062,-.02],[.06,.02],[.054,.05]],16,c,D,1,1.18);
    O.tour(P,'c',[[.054,.05],[.056,.056],[.05,.062]],16,c,D,1,1.18);
    O.tour(P,'L',[[.05,.062],[.04,.074],[.022,.081],[0,.083]],16,c,D,1,1.18);});
  // le capot moteur : sa NERVURE dans l'axe, des ouïes à la bosse chromée de l'éclairage de plaque
  {const ch=[];for(let z=-1.50;z>=-1.665;z-=.03)ch.push([0,yTop(z)+.001,z]);O.tube(P,'p',ch,[[-.028,0],[-.008,.009],[0,.011],[.008,.009],[.028,0]],true);}
  P.put('p',new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2),0,.778,-1.708,-1.05,0,0,.105,.055,.05);
  P.box('c',.16,.012,.02,0,.752,-1.735,.5,0,0);
  // les CLIGNOTANTS en obus sur les ailes avant, les RÉTROS ronds sur les charnières, les poignées, les grilles d'avertisseur
  P.sym(sd=>{
    P.put('c',new THREE.SphereGeometry(1,10,6),sd*.565,.865,1.43,0,0,0,.026,.022,.075);
    P.put('O',new THREE.SphereGeometry(1,8,5),sd*.565,.866,1.495,0,0,0,.019,.017,.022);
    P.cyl('c',.006,.17,6,sd*.66,1.02,.655);P.cyl('c',.042,.016,14,sd*.675,1.115,.655,'z');P.cyl('K',.037,.004,14,sd*.675,1.115,.646,'z');
    P.box('c',.018,.016,.19,sd*.722,.912,-.115);P.box('c',.02,.026,.035,sd*.728,.912,-.20);
    P.put('c',new THREE.SphereGeometry(1,10,6),sd*.39,.47,1.872,0,0,0,.042,.024,.01);
  });
  // le capot avant : la baguette chromée dans l'axe, la poignée au nez
  {const ch=[];for(let z=1.025;z<=1.80;z+=.035)ch.push([0,yTop(z)+.001,z]);O.tube(P,'c',ch,[[-.011,0],[-.008,.004],[0,.006],[.008,.004],[.011,0]],true);}
  P.box('c',.03,.018,.075,0,yTop(1.85)-.005,1.855,.6,0,0);
  // les essuie-glaces, couchés au pied du pare-brise
  P.sym(sd=>P.box('k',.34,.012,.014,sd*.18,1.12,.655,0,0,sd*.10));
  // les PASSAGES DE ROUE : une joue sombre derrière chaque roue
  const joue=(w,AR0)=>{const o=[[w-.43,.28]];for(let k=0;k<=12;k++){const a=Math.PI*k/12;o.push([w-Math.cos(a)*.43,.30+Math.sin(a)*.44]);}o.push([w+.43,.28]);return o;};
  P.sym(sd=>{P.prism('d',joue(ZF),.02,sd*.50);P.prism('d',joue(ZR),.02,sd*.52);});
  /* LA DESTRUCTION VOXEL DU SCARABÉE (25/10, Léo : « les cubes insérés, pas posés par-dessus ; une impression de destruction, pixel / voxel ; plus de noir ») `?scarabee=glitch` : des plaques de cubes de 6 cm À FLEUR
     de la tôle, sur les FLANCS (le pli de ceinture, au milieu de la caisse — rien aux roues) : l'intérieur mis à nu en bleu-vert sombre (pas de noir), un peu de crème, bordées d'éclats de la couleur de la caisse
     qui dépassent de 1 à 4 cm, quelques-uns arrachés. Les plaques s'effritent vers l'arrière. */
  let SCG=false;try{SCG=/[?&]scarabee=glitch/.test(location.search);}catch(e){}
  if(SCG){
    const hs=(a,b,c,d)=>{const v=Math.sin(a*12.9898+b*78.233+c*37.719+d*5.171)*43758.5453;return v-Math.floor(v);};
    const CE=.06;
    for(const sd of [1,-1]){
      const dedans=new Set(),id=sd>0?5:6,graines=[[4,-2.4,4.2],[-2,-2,3.6],[-7,-2.6,3.2]];
      for(let iu=-9;iu<=8;iu++)for(let iv=-6;iv<=0;iv++){let m=0;for(const [su,sv,r] of graines)m=Math.max(m,(1-Math.hypot(iu-su,iv-sv)/r)*(.55+.9*hs(iu,iv,id,1)));if(m>.34)dedans.add(iu+','+iv);}
      const C2=.08,pose=(k,iu,iv,up,eclat)=>{const z=iu*C2,y=yCr(z)+iv*C2,x=xC(z)-.006*Math.abs(iv*C2/.1)+(eclat?up/2+.008:.006);
        P.box(k,eclat?.02:.014,C2*.92,C2*.92,sd*x,y,z,0,0,0);};   // cases de 8 cm (plus visible)
      for(const kk of dedans){const [iu,iv]=kk.split(',').map(Number),bord=![[1,0],[-1,0],[0,1],[0,-1]].every(([da,db])=>dedans.has((iu+da)+','+(iv+db))),q=hs(iu+.3,iv+.7,id,2);
        if(bord){if(q<.28)pose('p',iu,iv,.012+.034*hs(iu,iv,id,3),true);else if(q<.56)pose('s',iu,iv,.012+.034*hs(iu,iv,id,3),true);else if(q<.68)pose('p',iu,iv,.05+.05*hs(iu,iv,id,4),true);}
        else{if(q<.86)pose('y',iu,iv,0,false);else pose('s',iu,iv,0,false);}}}
  }
  // la plaque dessinée : la vraie s'y pose (voir plqDessinee)
  P.box('l',.30,.075,.012,0,.665,-1.79,.5,0,0);
  K.commit(P);
  // ---- LES ROUES : pneu à FLANC BLANC, jante tôle couleur caisse, enjoliveur chromé en dôme (l'annonce) ----
  const JW=.155,hw=JW/2,fx=hw-.022,cJ=PP.p.c!=null?PP.p.c:PAL.p.c,J=lpKit({k:{g:'m',c:0x18191b},w:{g:'s',c:0xefe9d8},p:{g:'p',c:cJ},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
  J.lathe('k',[[.19,-hw],[R*.84,-hw],[R*.96,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.96,hw*.72],[R*.84,hw],[.19,hw]],24,0,0,0,'x');
  J.lathe('w',[[.20,hw+.002],[.272,hw+.002]],24,0,0,0,'x');                                        // le flanc blanc
  J.lathe('p',[[.19,hw-.004],[.182,fx+.004],[.125,fx]],24,0,0,0,'x');J.lathe('d',[[.19,-hw+.02],[.19,fx-.04],[0,fx-.04]],20,0,0,0,'x');
  J.lathe('c',[[.124,fx],[.118,fx+.018],[.095,fx+.036],[.06,fx+.046],[0,fx+.05]],20,0,0,0,'x');     // l'enjoliveur en dôme
  const JG=J.done();
  return {hl:[.505,.665,1.82],tl:[.545,.635,-1.64],wx:.665,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
ECH_POTS.bulle={p:[{t:'rond',r:.021,ev:1.35,k:'c',pts:[[-.155,.325,-1.965],[.155,.325,-1.965]]}]}; // (2026-10-18, LA BULLE refaite) les deux « sarbacanes » de la 1962, sous le pare-chocs
