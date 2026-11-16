'use strict';var GRT={B:12,K:1.6},GRV={nzK:2},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity},GRT_ARETES=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null},GRT_AMB=[],GROTTE={},GT={},MV=null,MLL=null;
function grtH3(i,j,k,s){let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263)+Math.imul(k|0,1274126177)+Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function grtN3(x,y,z,s){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const a=grtH3(i,j,k,s),b=grtH3(i+1,j,k,s),c=grtH3(i,j+1,k,s),d=grtH3(i+1,j+1,k,s),e=grtH3(i,j,k+1,s),f=grtH3(i+1,j,k+1,s),g=grtH3(i,j+1,k+1,s),h=grtH3(i+1,j+1,k+1,s);
  return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*(1-w)+(e+(f-e)*u+(g-e)*v+(e-f-g+h)*u*v)*w;}
function grtRoche(x,y,z){const k=GRV.nzK;return (grtN3(x/(46*k),y/(34*k),z/(46*k),11)*2-1)*.72+(grtN3(x/(17*k),y/(14*k),z/(17*k),23)*2-1)*.28;}
function grtMonde(x0,y0,z0,x1,y1,z1){const B=GRT.B,C=B*16,ox=Math.floor(x0/C)*C,oy=Math.floor(y0/C)*C,oz=Math.floor(z0/C)*C;
  const CX=Math.ceil((x1-ox)/C)+1,CY=Math.ceil((y1-oy)/C)+1,CZ=Math.ceil((z1-oz)/C)+1;
  return {B:B,ox:ox,oy:oy,oz:oz,CX:CX,CY:CY,CZ:CZ,NX:CX*16,NY:CY*16,NZ:CZ*16,dir:new Int32Array(CX*CY*CZ).fill(-1),pool:[],dn:[],nzc:[],si:[],sd:[],chS:[],cle:[],nAir:0};}
function grtCh(V,ci,cj,ck){const d=ci+V.CX*(cj+V.CY*ck);let c=V.dir[d];
  if(c<0){c=V.pool.length;V.dir[d]=c;V.pool.push(new Uint8Array(4096));V.dn.push(new Int8Array(4096).fill(-127));V.nzc.push(null);V.si.push(new Int32Array(64).fill(-1));V.sd.push(new Float32Array(64).fill(1e12));V.chS.push(1e9);V.cle.push(d);}return c;}
function grtNoyau(V,R,q){const B=V.B,inv=1/B,K=GRT.K,px=R.X[q],py=R.Y[q],pz=R.Z[q],ax=R.NNX[q],ay=R.NNY[q],az=R.NNZ[q],rc=ROAD_HALF+10,hcU=30,hcD=THICK+9,hc=rc+Math.max(hcU,hcD)+B;
  const i0=Math.max(0,Math.floor((px-hc-V.ox)*inv)),i1=Math.min(V.NX-1,Math.floor((px+hc-V.ox)*inv)),j0=Math.max(0,Math.floor((py-hc-V.oy)*inv)),j1=Math.min(V.NY-1,Math.floor((py+hc-V.oy)*inv)),k0=Math.max(0,Math.floor((pz-hc-V.oz)*inv)),k1=Math.min(V.NZ-1,Math.floor((pz+hc-V.oz)*inv));
  let cc=-1,A=null,DN=null;
  for(let k=k0;k<=k1;k++){const ez=V.oz+(k+.5)*B-pz;for(let j=j0;j<=j1;j++){const ey=V.oy+(j+.5)*B-py;for(let i=i0;i<=i1;i++){const ex=V.ox+(i+.5)*B-px,dN=ex*ax+ey*ay+ez*az,uc=Math.max(0,ex*ex+ey*ey+ez*ez-dN*dN)/(rc*rc);if(uc>=1)continue;
    const c2=uc+dN*dN/(dN>0?hcU*hcU:hcD*hcD);if(c2>=1)continue;
    const ci=(i>>4)+V.CX*((j>>4)+V.CY*(k>>4));if(ci!==cc){cc=ci;let c=V.dir[ci];if(c<0)c=grtCh(V,i>>4,j>>4,k>>4);A=V.pool[c];DN=V.dn[c];}
    const o=(i&15)|((j&15)<<4)|((k&15)<<8);if(DN[o]===127)continue;const dv=Math.min(127,Math.round((1+(1-Math.sqrt(c2))*12)*K));if(dv>DN[o])DN[o]=dv;if(A[o]!==1){A[o]=1;V.nAir++;}}}}}
function* grtCreuse1(V,R,q,O){ /* (2026-10-31, passe perf mobile) un générateur : un rendez-vous JF.lim par tranche de cases (un creusement d'un bloc : 15-37 ms ×4 au pré-bâti) */ /* O : un creusement à part, le BASSIN vertical de la lave {ax,ay,az,rh,up,dn} — sans lui, l'ellipsoïde de l'échantillon, de révolution autour de la NORMALE de la dalle */
  const B=V.B,inv=1/B,K=GRT.K,px=R.X[q],py=R.Y[q],pz=R.Z[q],cax=R.NNX[q],cay=R.NNY[q],caz=R.NNZ[q]; // (cax… : la normale de la dalle, pour la carotte de la route)
  const ax=O?O.ax:cax,ay=O?O.ay:cay,az=O?O.az:caz,lat=O?0:R.LAT[q],cx0=px+R.BX[q]*lat,cy0=py+R.BY[q]*lat,cz0=pz+R.BZ[q]*lat;
  const rh=O?O.rh:R.RH[q],up=O?O.up:R.UP[q],dn=O?O.dn:R.DN[q],ex=O?2:R.EX[q],nz=R.NZ[q];
  const rc=ROAD_HALF+10,hcU=30,hcD=THICK+9,e2=Math.abs(ex-2)<.01,he=ex/2,ie=1/ex,M=1+nz,BO=2.5*B,Rm=rh*M+BO,Hm=Math.max(up,dn)*M+BO,Rm2=Rm*Rm,sur=1-nz-2*B/rh,SAT=GRT_VASTE?3*B:1e9,core=!O;
  const hx=Math.sqrt(Rm*Rm*(1-ax*ax)+Hm*Hm*ax*ax),hy=Math.sqrt(Rm*Rm*(1-ay*ay)+Hm*Hm*ay*ay),hz=Math.sqrt(Rm*Rm*(1-az*az)+Hm*Hm*az*az),hc=core?rc+Math.max(hcU,hcD)+B:0;
  // 1 · LES SOUS-CUBES (32 m) qu'il touche : l'échantillon le plus proche (la salle, l'abscisse)
  {const S=4*B,a0=Math.floor((cx0-hx-V.ox)/S),a1=Math.floor((cx0+hx-V.ox)/S),c0=Math.floor((cz0-hz-V.oz)/S),c1=Math.floor((cz0+hz-V.oz)/S),b0=Math.floor((cy0-hy-V.oy)/S),b1=Math.floor((cy0+hy-V.oy)/S);
   for(let c=Math.max(0,c0);c<=Math.min(V.NZ/4-1,c1);c++)for(let b=Math.max(0,b0);b<=Math.min(V.NY/4-1,b1);b++)for(let a=Math.max(0,a0);a<=Math.min(V.NX/4-1,a1);a++){
     const x=V.ox+(a+.5)*S,y=V.oy+(b+.5)*S,z=V.oz+(c+.5)*S,dx=x-cx0,dy=y-cy0,dz=z-cz0,dN=dx*ax+dy*ay+dz*az,dh=Math.max(0,Math.sqrt(Math.max(0,dx*dx+dy*dy+dz*dz-dN*dN))-28),dv=Math.max(0,Math.abs(dN)-28),H=(dN>0?up:dn)*M+BO;
     if(dh*dh/Rm2+dv*dv/(H*H)>1)continue;
     const ch=grtCh(V,a>>2,b>>2,c>>2),qq=(a&3)|((b&3)<<2)|((c&3)<<4),ex9=x-px,ey9=y-py,ez9=z-pz,d2=ex9*ex9+ey9*ey9+ez9*ez9;if(d2<V.sd[ch][qq]){V.sd[ch][qq]=d2;V.si[ch][qq]=q;}if(q<V.chS[ch])V.chS[ch]=q;}}
  // 2 · LES CASES : la marge en MÈTRES (la fraction de rayon × la distance au centre / r̂) ; au-delà de 2,5 cases hors de la paroi la plus lointaine, rien
  const i0=Math.max(0,Math.floor((Math.min(cx0-hx,px-hc)-V.ox)*inv)),i1=Math.min(V.NX-1,Math.floor((Math.max(cx0+hx,px+hc)-V.ox)*inv)),
    j0=Math.max(0,Math.floor((Math.min(cy0-hy,py-hc)-V.oy)*inv)),j1=Math.min(V.NY-1,Math.floor((Math.max(cy0+hy,py+hc)-V.oy)*inv)),
    k0=Math.max(0,Math.floor((Math.min(cz0-hz,pz-hc)-V.oz)*inv)),k1=Math.min(V.NZ-1,Math.floor((Math.max(cz0+hz,pz+hc)-V.oz)*inv));
  let cc=-1,A=null,DN=null,NZ=null;
  for(let k=k0;k<=k1;k++){if(k>k0&&performance.now()>JF.lim)yield;const cz=V.oz+(k+.5)*B,dz=cz-cz0,ez=cz-pz;
    for(let j=j0;j<=j1;j++){const cy=V.oy+(j+.5)*B,dy=cy-cy0,ey=cy-py;
      for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,dx=cx-cx0,ex2=cx-px;
        const dN=dx*ax+dy*ay+dz*az,d2=dx*dx+dy*dy+dz*dz,dh2=Math.max(0,d2-dN*dN);
        let uc=2,dNp=0; /* la carotte autour de la route (ROAD_HALF + 10 m de large, 30 m au-dessus, THICK + 9 m au-dessous — le haut étant celui de la dalle) : toujours vide, quoi que fasse le bruit */
        if(core&&Math.abs(ex2)<hc&&Math.abs(ey)<hc&&Math.abs(ez)<hc){dNp=ex2*cax+ey*cay+ez*caz;uc=Math.max(0,ex2*ex2+ey*ey+ez*ez-dNp*dNp)/(rc*rc);}
        const inCore=uc<1&&uc+dNp*dNp/(dNp>0?hcU*hcU:hcD*hcD)<1;
        if(!inCore&&(dh2>Rm2||dN>Hm||dN<-Hm))continue;
        const H=dN>0?up:dn,dy2=dN*dN,u=e2?dh2/(rh*rh):Math.pow(dh2/(rh*rh),he),w=e2?dy2/(H*H):Math.pow(dy2/(H*H),he),rr=e2?Math.sqrt(u+w):Math.pow(u+w,ie),ds=Math.sqrt(d2)/Math.max(rr,.05);
        const dehors=(rr-M)*ds>BO;if(dehors&&!inCore)continue; // (loin dehors : la roche, rien à écrire)
        const ci=(i>>4)+V.CX*((j>>4)+V.CY*(k>>4));if(ci!==cc){cc=ci;let c=V.dir[ci];if(c<0)c=grtCh(V,i>>4,j>>4,k>>4);A=V.pool[c];DN=V.dn[c];NZ=V.nzc[c]||(V.nzc[c]=new Int8Array(4096).fill(-128));}
        const o=(i&15)|((j&15)<<4)|((k&15)<<8);if(DN[o]===127)continue;
        let m;if(dehors)m=-1e3;else if(rr<sur)m=1-nz-rr;else{let n8=NZ[o];if(n8===-128)n8=NZ[o]=Math.round(grtRoche(cx,cy,cz)*127);m=1+nz*n8/127-rr;}
        m*=ds; // (en mètres)
        if(m>SAT)m=128/K; /* (GROTTE VASTE) à plus de 3 cases de la paroi, seul le SIGNE sert (surface, collision, décors, occlusion) : la case est saturée
           tout de suite et les échantillons suivants la sautent (DN===127) */
        if(inCore)m=Math.max(m,1+(1-Math.sqrt(uc+dNp*dNp/(dNp>0?hcU*hcU:hcD*hcD)))*12);
        const dv=Math.max(-127,Math.min(127,Math.round(m*K)));if(dv>DN[o])DN[o]=dv;
        if(m>0&&A[o]!==1){A[o]=1;V.nAir++;}}}}}
function grtD(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return -127;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?-127:V.dn[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtLit(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return 0;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?0:V.pool[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtMatieres(x,y,z,sal,lv){ // la matière d'un sommet de la roche (lv : un coin voisin est de la lave 4 ou de l'eau 5)
  const lac=GROTTE.lac,eau=GROTTE.eau;
  if(lv===4&&lac&&Math.abs(y-lac.y)<3.5)return GT.LAVE;if(lv===5&&eau&&Math.abs(y-eau.y)<3.5)return GT.EAU;
  if((sal===3||sal===4)&&GROTTE.piliers)for(const c of GROTTE.piliers)if((x-c.x)**2+(z-c.z)**2<c.r*c.r&&y>c.yb-8&&y<c.yt+8)return c.k==='stal'?GT.CONCRETION:GT.BASALTE;
  return GT.ROCHE;}
function grtLum(x,y,z,sal,LL,out){
  const a=GRT_AMB[sal]||GRT_AMB[0],ka=sal?GRV.amb:1;let t=0,r=a[0]*ka,g=a[1]*ka,b=a[2]*ka;
  if(LL){for(const o of LL.t){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<GRV.tR2)t+=1.3/(1+d2/GRV.tF)*(1-d2/GRV.tR2);}
    for(const o of LL.p){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<o.r2){let k=1-d2/o.r2;k*=k*o.I;r+=o.c[0]*k;g+=o.c[1]*k;b+=o.c[2]*k;}}}
  const lac=GROTTE.lac;if(lac&&(GROTTE.lavLum?GROTTE.lavLum[sal]:sal>=3)&&y>lac.y-8){const k=(sal===4?1.65:.9)*Math.exp(-Math.max(0,y-lac.y)/(sal===4?GRV.lavL:38));r+=1.0*k;g+=.32*k;b+=.055*k;}
  const e=GROTTE.eau;if(e&&sal===1&&y>e.y-8){const k=.6*Math.exp(-Math.max(0,y-e.y)/16);r+=.04*k;g+=.22*k;b+=.26*k;}
  out[0]=Math.min(1,t);out[1]=Math.min(2,r);out[2]=Math.min(2,g);out[3]=Math.min(2,b);}
function grtTampons(){const T=GRT_TMP;if(!T.loc){T.loc=new Float32Array(20*20*20);T.vid=new Int32Array(17*17*17);const NV=40000;T.P=new Float32Array(NV*3);T.F=new Uint8Array(NV*4);T.Lt=new Uint8Array(NV*4);T.I=new Uint32Array(NV*6);}return T;}
function grtR6(x,y,z,sal,k){return Math.min(63,Math.floor(grtH3(Math.floor(x*k),Math.floor(y*k),Math.floor(z*k),sal*7)*64));}
function* grtMailleNetsG(V,c,LL){
  const T=grtTampons(),d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,I0=ci*16,J0=cj*16,K0=ck*16,B=V.B,lum=T.lum,loc=T.loc,vid=T.vid,R=GROTTE.R;
  // 1 · les densités du tronçon et de sa bordure (−2 … 17)
  for(let k=0;k<20;k++){if(performance.now()>JF.lim)yield;for(let j=0;j<20;j++)for(let i=0;i<20;i++)loc[i+20*(j+20*k)]=grtD(V,I0+i-2,J0+j-2,K0+k-2);}
  const L=function(i,j,k){return loc[(i+2)+20*((j+2)+20*(k+2))];};
  // 2 · les sommets (cubes −1 … 15)
  vid.fill(-1);let nv=0;const MAXV=39990,cv=new Float32Array(8);
  for(let cc=-1;cc<16&&nv<MAXV;cc++){for(let b=-1;b<16&&nv<MAXV;b++){if(performance.now()>JF.lim)yield; /* (2026-11-01) le rendez-vous à chaque rangée (une couche entière : jusqu'à 100 ms ×4 d'un bloc) */for(let a=-1;a<16;a++){
    let m=0;for(let q=0;q<8;q++){const v=L(a+(q&1),b+((q>>1)&1),cc+((q>>2)&1));cv[q]=v;if(v>0)m|=1<<q;}
    if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,ne=0;
    for(let e=0;e<12;e++){const q0=GRT_ARETES[e][0],q1=GRT_ARETES[e][1],v0=cv[q0],v1=cv[q1];if((v0>0)===(v1>0))continue;const t=v0/(v0-v1);
      sx+=(q0&1)+((q1&1)-(q0&1))*t;sy+=((q0>>1)&1)+(((q1>>1)&1)-((q0>>1)&1))*t;sz+=((q0>>2)&1)+(((q1>>2)&1)-((q0>>2)&1))*t;ne++;}
    const lx=(a+.5+sx/ne)*B,ly=(b+.5+sy/ne)*B,lz=(cc+.5+sz/ne)*B,wx=V.ox+I0*B+lx,wy=V.oy+J0*B+ly,wz=V.oz+K0*B+lz;
    // la normale (vers l'air), l'occlusion, la salle, la matière
    const gx=(cv[1]+cv[3]+cv[5]+cv[7])-(cv[0]+cv[2]+cv[4]+cv[6]),gy=(cv[2]+cv[3]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[4]+cv[5]),gz=(cv[4]+cv[5]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[2]+cv[3]),gl=Math.hypot(gx,gy,gz)||1;
    let roc=0;for(let z9=-1;z9<=2;z9++)for(let y9=-1;y9<=2;y9++)for(let x9=-1;x9<=2;x9++)if(L(a+x9,b+y9,cc+z9)<=0)roc++;
    let sal=0,lv=0;{let q9=-1;for(let q=0;q<8&&q9<0;q++){if(cv[q]<=0)continue;const ii=I0+a+(q&1),jj=J0+b+((q>>1)&1),kk=K0+cc+((q>>2)&1),ch=V.dir[(ii>>4)+V.CX*((jj>>4)+V.CY*(kk>>4))];
        if(ch>=0)q9=V.si[ch][((ii&15)>>2)|(((jj&15)>>2)<<2)|(((kk&15)>>2)<<4)];}
      if(q9>=0&&R)sal=R.SAL[q9];
      for(let q=0;q<8&&!lv;q++){const p=grtLit(V,I0+a+(q&1),J0+b+((q>>1)&1),K0+cc+((q>>2)&1));if(p===4||p===5)lv=p;}}
    /* (2026-11-10) LE LAC EST PLAT : un sommet qui touche le lac et qui est à moins de 0,4 case de son niveau est posé EXACTEMENT dessus — l'arrondi de la densité (±0,3 m) bossuait le plan, et le pli entre le lac et une paroi ou le pied d'un pilier (un escalier de cases de 12 m) faisait des dents de 5 m le long de la ligne d'eau */
    const Y9=lv===4?GROTTE.lac:lv===5?GROTTE.eau:null,dd9=Y9?Y9.y-wy:0,dy9=Y9&&Math.abs(dd9)<B*.4&&Math.abs(dd9*gy/gl)<.9?dd9:0; /* (2026-11-10, audit JB-01) le choc lit la densité NON déplacée : sur une berge en pente douce la roche dessinée s'écartait jusqu'à 4,8 m de celle qui tue — le sommet n'est posé sur le lac que si l'écart le long de la normale reste sous 0,9 m (sur une paroi droite, là où la ligne d'eau comptait, rien ne change) */
    const p3=nv*3,p4=nv*4;T.P[p3]=lx;T.P[p3+1]=ly+dy9;T.P[p3+2]=lz;
    T.F[p4]=grtMatieres(wx,wy,wz,sal,lv);T.F[p4+1]=sal;T.F[p4+2]=Math.round(Math.max(.3,Math.min(1,1.28-roc/64))*255);T.F[p4+3]=lv===4?1:lv===5?2:0; /* (2026-11-10) 1 : un coin touche la LAVE, 2 : l'EAU (le drapeau du bord d'un lac, voir w4 plus bas) */
    grtLum(wx+gx/gl*1.5,wy+gy/gl*1.5,wz+gz/gl*1.5,sal,LL,lum);T.Lt[p4]=lum[0]*255;T.Lt[p4+1]=lum[1]*127.5;T.Lt[p4+2]=lum[2]*127.5;T.Lt[p4+3]=lum[3]*127.5;
    vid[(a+1)+17*((b+1)+17*(cc+1))]=nv++;}}}
  // 3 · les quads : chaque arête (points 0 … 15 du tronçon) qui traverse la paroi — tournés vers l'air
  let ni=0;const V9=function(a,b,cc){return vid[(a+1)+17*((b+1)+17*(cc+1))];};
  for(let cc=0;cc<16;cc++){if(performance.now()>JF.lim)yield;for(let b=0;b<16;b++)for(let a=0;a<16;a++){const v0=L(a,b,cc),s0=v0>0;
    for(let ax=0;ax<3;ax++){const v1=ax===0?L(a+1,b,cc):ax===1?L(a,b+1,cc):L(a,b,cc+1);if((v1>0)===s0)continue;
      let q0,q1,q2,q3;
      if(ax===0){q0=V9(a,b-1,cc-1);q1=V9(a,b,cc-1);q2=V9(a,b,cc);q3=V9(a,b-1,cc);}
      else if(ax===1){q0=V9(a-1,b,cc-1);q1=V9(a-1,b,cc);q2=V9(a,b,cc);q3=V9(a,b,cc-1);}
      else{q0=V9(a-1,b-1,cc);q1=V9(a,b-1,cc);q2=V9(a,b,cc);q3=V9(a-1,b,cc);}
      if(q0<0||q1<0||q2<0||q3<0||ni+6>T.I.length)continue;
      if(s0){T.I[ni++]=q0;T.I[ni++]=q1;T.I[ni++]=q2;T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q3;}
      else{T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q1;T.I[ni++]=q0;T.I[ni++]=q3;T.I[ni++]=q2;}}}}
  /* 4 · UNE MATIÈRE PAR FACETTE : les sommets sont dédoublés par triangle et la facette prend la matière de la majorité de ses coins (le numéro
     de matière interpolé sur un triangle à cheval passait par toutes les matières entre les deux : un liseré arc-en-ciel le long des bords —
     banc du 18/10). La lumière et l'occlusion restent celles des coins (fondues sur la facette). */
  const nt=ni/3,P=new Float32Array(nt*9),F=new Uint8Array(nt*12),Lt=new Uint8Array(nt*12);
  for(let t=0;t<nt;t++){if((t&2047)===2047&&performance.now()>JF.lim)yield;const a=T.I[t*3],b=T.I[t*3+1],c9=T.I[t*3+2],ma=T.F[a*4],mb=T.F[b*4],mc=T.F[c9*4],mt=(ma===mb||ma===mc)?ma:(mb===mc?mb:(ma||mb||mc));
    /* (2026-11-10, Sacha : « des triangles très visibles sur l'eau et la lave ») w4 = le BORD D'UN LAC (0 aucun · 1 lave · 2 eau : un coin du triangle touche une case du lac) + 4 × le TON de la facette (0-63). La matière
       lave/eau/roche ne se joue plus sur la majorité des coins (des dents de 12 m le long du rivage) : le fragment la décide à la HAUTEUR du lac (uLacW, GRT_FS) — la ligne d'eau est droite, au pixel près. */
    const lk=Math.max(T.F[a*4+3],T.F[b*4+3],T.F[c9*4+3]),w4=lk+4*grtR6(V.ox+I0*B+(T.P[a*3]+T.P[b*3]+T.P[c9*3])/3,V.oy+J0*B+(T.P[a*3+1]+T.P[b*3+1]+T.P[c9*3+1])/3,V.oz+K0*B+(T.P[a*3+2]+T.P[b*3+2]+T.P[c9*3+2])/3,T.F[a*4+1],GRT_VASTE?.11:.16);
    for(let k=0;k<3;k++){const v=k===0?a:k===1?b:c9,o=t*3+k;P[o*3]=T.P[v*3];P[o*3+1]=T.P[v*3+1];P[o*3+2]=T.P[v*3+2];
      F[o*4]=mt;F[o*4+1]=T.F[v*4+1];F[o*4+2]=T.F[v*4+2];F[o*4+3]=w4;Lt[o*4]=T.Lt[v*4];Lt[o*4+1]=T.Lt[v*4+1];Lt[o*4+2]=T.Lt[v*4+2];Lt[o*4+3]=T.Lt[v*4+3];}}
  return {P:P,F:F,L:Lt,I:null,nv:nt*3,nt:nt};}
function grwInit(m){var n=m.n,V={B:m.Vb,ox:m.ox,oy:m.oy,oz:m.oz,CX:m.CX,CY:m.CY,CZ:m.CZ,NX:m.NX,NY:m.NY,NZ:m.NZ,dir:m.dir,pool:[],dn:[],si:[],cle:m.cle};for(var c=0;c<n;c++){V.pool.push(m.P.subarray(c*4096,(c+1)*4096));V.dn.push(m.D.subarray(c*4096,(c+1)*4096));V.si.push(m.SI.subarray(c*64,(c+1)*64));}GT=m.GT;GRT_AMB=m.AMB;GRV={amb:m.amb,tR2:m.tR2,tF:m.tF,lavL:m.lavL};GROTTE={R:{SAL:m.SAL},lac:m.lac,eau:m.eau,piliers:m.piliers,lavLum:m.lavLum};MLL=new Map(m.LL);MV=V;}
function grwPull(m){if(!MV)return;for(var i=0;i<m.list.length;i++){var c=m.list[i],r=grtMailleNetsG(MV,c,MLL.get(MV.cle[c])||null),x;do{x=r.next();}while(!x.done);var q=x.value;postMessage({t:'maille',job:m.job,c:c,P:q.P,F:q.F,L:q.L,nv:q.nv,nt:q.nt},[q.P.buffer,q.F.buffer,q.L.buffer]);}}
onmessage=function(e){var m=e.data;if(m.t==='init'){grwInit(m);return;}if(m.t==='pull'){grwPull(m);return;}if(m.t==='fin'){MV=null;MLL=null;GROTTE={};return;}var t0=performance.now();GRT={B:m.B,K:m.K};GRV={nzK:m.nzK};GRT_VASTE=m.vaste;ROAD_HALF=m.rh;THICK=m.th;var R=m.R,V=grtMonde(m.x0,m.y0,m.z0,m.x1,m.y1,m.z1);for(var q=0,ac=1e9;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;for(var g1 of grtCreuse1(V,R,q));if(R.BAS[q]>0)for(var g2 of grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]}));}var n=V.pool.length,P=new Uint8Array(n*4096),D=new Int8Array(n*4096),SI=new Int32Array(n*64),SD=new Float32Array(n*64);for(var c=0;c<n;c++){P.set(V.pool[c],c*4096);D.set(V.dn[c],c*4096);SI.set(V.si[c],c*64);SD.set(V.sd[c],c*64);}postMessage({job:m.job,n:n,P:P,D:D,SI:SI,SD:SD,dir:V.dir,chS:V.chS,cle:V.cle,nAir:V.nAir,ms:Math.round(performance.now()-t0)},[P.buffer,D.buffer,SI.buffer,SD.buffer,V.dir.buffer]);};