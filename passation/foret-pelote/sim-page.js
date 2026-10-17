function prepareSim(tr){
  const n=tr.trou.length,ds=tr.pas,P=Float64Array.from(tr.p),T=Float64Array.from(tr.t),N=Float64Array.from(tr.n),B=Float64Array.from(tr.b);
  const U=new Float64Array(3*n),F=new Float64Array(3*n),land=new Uint8Array(n),solide=new Uint8Array(n);
  for(let i=0;i<n;i++){const o=3*i,sg=N[o+1]>0?1:-1;
    U[o]=sg*N[o];U[o+1]=sg*N[o+1];U[o+2]=sg*N[o+2]; /* la normale de la face tournée vers le HAUT */
    const dec=sg>0?0:tr.thick; /* dalle à l'endroit : la face roulable est le dessus (P) ; à l'envers : le dessous, thick plus bas le long de N */
    F[o]=P[o]-dec*N[o];F[o+1]=P[o+1]-dec*N[o+1];F[o+2]=P[o+2]-dec*N[o+2];
    solide[i]=tr.trou[i]?0:1;land[i]=(solide[i]&&Math.abs(N[o+1])>.3)?1:0;}
  const C=40;let minx=1e18,minz=1e18,maxx=-1e18,maxz=-1e18;
  for(let i=0;i<n;i++)if(solide[i]){const x=P[3*i],z=P[3*i+2];if(x<minx)minx=x;if(x>maxx)maxx=x;if(z<minz)minz=z;if(z>maxz)maxz=z;}
  const gx=Math.floor((maxx-minx)/C)+3,gz=Math.floor((maxz-minz)/C)+3,cnt=new Int32Array(gx*gz+1);
  const cel=i=>(Math.floor((P[3*i]-minx)/C)+1)+gx*(Math.floor((P[3*i+2]-minz)/C)+1);
  for(let i=0;i<n;i++)if(solide[i])cnt[cel(i)+1]++;
  for(let c=0;c<gx*gz;c++)cnt[c+1]+=cnt[c];
  const liste=new Int32Array(cnt[gx*gz]),rem=cnt.slice(0,gx*gz);
  for(let i=0;i<n;i++)if(solide[i])liste[rem[cel(i)]++]=i;
  return {n,ds,P,T,N,B,U,F,land,C,minx,minz,gx,gz,deb:cnt,liste,half:tr.half,thick:tr.thick,g:tr.g,spd:tr.spd,minY:tr.minY};
}
/* UNE trajectoire. Écrit son issue dans R : type 0 mort · 1 pose · 2 tranche (BUMP) · 3 temps écoulé. */
function trajectoire(S,i,sigma,V,u,dt,R){
  const {P,T,N,B,U,F,land,C,minx,minz,gx,gz,deb,liste,ds,half,thick,g,spd,minY}=S;
  const o=3*i;
  let qx=P[o]+sigma*half*B[o]+H_DEPART*N[o],qy=P[o+1]+sigma*half*B[o+1]+H_DEPART*N[o+1],qz=P[o+2]+sigma*half*B[o+2]+H_DEPART*N[o+2];
  R.sx=qx;R.sy=qy;R.sz=qz;
  let vx=V*T[o],vy=V*T[o+1],vz=V*T[o+2];
  const TL=.75*ds,R2=(half+9)*(half+9),hl=half-1,hb=half+2,nmax=Math.round(T_MAX/dt),yMort=minY-120;
  for(let k=1;k<=nmax;k++){
    /* le volant : le cap tourne autour de la verticale (ω = u·(1,15 + min(0,6 ; 0,004·|v_jeu|))), puis la gravité monde */
    const w=u*(1.15+Math.min(.6,.004*Math.sqrt(vx*vx+vy*vy+vz*vz)/spd))*dt;
    if(w){const c=Math.cos(w),s=Math.sin(w),nx=vx*c-vz*s;vz=vx*s+vz*c;vx=nx;}
    vy-=g*dt;
    const px=qx,py=qy,pz=qz;qx+=vx*dt;qy+=vy*dt;qz+=vz*dt;
    if(qy<yMort){R.type=0;R.t=k*dt;return;}
    if(HEURT&&(k&1)===0){HP[0]=qx;HP[1]=qy-.6;HP[2]=qz;if(window.dbgForet('heurt',HP)){R.type=4;R.t=k*dt;return;}}
    const cx=Math.floor((qx-minx)/C)+1,cz=Math.floor((qz-minz)/C)+1;
    let aMin=2,jMin=-1,tauMin=0,tranche=false;
    for(let dz=-1;dz<=1;dz++){const zz=cz+dz;if(zz<0||zz>=gz)continue;
      for(let dx=-1;dx<=1;dx++){const xx=cx+dx;if(xx<0||xx>=gx)continue;const c=xx+gx*zz;
        for(let m=deb[c],mf=deb[c+1];m<mf;m++){
          const j=liste[m],oj=3*j,ex=qx-P[oj],ez=qz-P[oj+2];
          if(ex*ex+ez*ez>R2)continue;
          if(land[j]){ /* le plan de la face qui regarde le ciel : franchi de haut en bas pendant ce pas ? */
            const h1=(qx-F[oj])*U[oj]+(qy-F[oj+1])*U[oj+1]+(qz-F[oj+2])*U[oj+2];
            if(h1<=0){const h0=(px-F[oj])*U[oj]+(py-F[oj+1])*U[oj+1]+(pz-F[oj+2])*U[oj+2];
              if(h0>0){const a=h0/(h0-h1);
                if(a<aMin){const fx=px+(qx-px)*a-P[oj],fy=py+(qy-py)*a-P[oj+1],fz=pz+(qz-pz)*a-P[oj+2];
                  const tau=fx*T[oj]+fy*T[oj+1]+fz*T[oj+2];
                  if(tau<=TL&&tau>=-TL){const l=fx*B[oj]+fy*B[oj+1]+fz*B[oj+2];
                    if(l<hl&&l>-hl){aMin=a;jMin=j;tauMin=tau;}}}}}}
          /* la tranche (et le corps de la dalle) : |lat| < half+2 et hauteur entre −épaisseur et 0 — un heurt, pas une pose */
          if(!tranche){const ey=qy-P[oj+1],tau1=ex*T[oj]+ey*T[oj+1]+ez*T[oj+2];
            if(tau1<=TL&&tau1>=-TL){const hN=ex*N[oj]+ey*N[oj+1]+ez*N[oj+2];
              if(hN<=0&&hN>=-thick){const l1=ex*B[oj]+ey*B[oj+1]+ez*B[oj+2];if(l1<hb&&l1>-hb)tranche=true;}}}
        }}}
    if(jMin>=0){R.type=1;R.t=(k-1+aMin)*dt;R.j=jMin;R.sL=jMin*ds+tauMin;
      R.qx=px+(qx-px)*aMin;R.qy=py+(qy-py)*aMin;R.qz=pz+(qz-pz)*aMin;R.vx=vx;R.vy=vy;R.vz=vz;return;}
    if(tranche){R.type=2;R.t=k*dt;return;}
  }
  R.type=3;R.t=nmax*dt;
}
function raccourcis(tr){
  const S=prepareSim(tr),n=S.n,ds=S.ds,half=S.half,km=tr.L/1000,vPal=tr.vPal,VITESSES=FACT_VIT.map(f=>Math.round(vPal*f*10)/10);
  const dt=tr.L>14000?1/30:1/60,pasI=Math.max(1,Math.round(PAS_DECOL/ds)),R={};
  const stat={trajectoires:0,pose:0,poseSurSaRoute:0,poseAvant:0,tranche:0,mort:0,temps:0,decollages:0,dt:dt};
  const cands=[],pieges=[];
  for(let i=0;i<n;i+=pasI){
    if(!S.land[i]||S.N[3*i+1]<=.3)continue; /* on décolle du dessus d'une dalle qui existe, pas d'une paroi ni du vide */
    stat.decollages++;const sI=i*ds;
    for(const sigma of [1,-1])for(const V of VITESSES)for(const u of VOLANTS){
      stat.trajectoires++;trajectoire(S,i,sigma,V,u,dt,R);
      if(R.type===0){stat.mort++;continue;}if(R.type===2){stat.tranche++;continue;}if(R.type===3){stat.temps++;continue;}if(R.type===4){stat.arbre=(stat.arbre||0)+1;continue;}
      stat.pose++;
      if(R.sL<=sI+100){stat.poseSurSaRoute++;
        if(R.sL<sI-300){const oj=3*R.j,tx=S.T[oj],tz=S.T[oj+2];const ang=deg(Math.acos(Math.max(-1,Math.min(1,(R.vx*tx+R.vz*tz)/(Math.hypot(R.vx,R.vz)*Math.hypot(tx,tz)||1)))));
          if(ang<=ANG_PROPRE)pieges.push({sI:sI,sP:R.sL,perte:sI-R.sL,chute:R.sy-R.qy,ang:ang});}
        continue;} /* retour sur sa propre route : pas un raccourci (en ARRIÈRE de plus de 300 m, pose propre : un PIÈGE) */
      const dir=Math.hypot(R.qx-R.sx,R.qy-R.sy,R.qz-R.sz),gain=(R.sL-sI)-dir;
      if(gain<GAIN_MIN){stat.poseAvant++;continue;}
      /* angle de pose : la vitesse horizontale contre la tangente de la route d'arrivée (à défaut, projetée dans le plan de la dalle) */
      const oj=3*R.j;let tx=S.T[oj],tz=S.T[oj+2],vx=R.vx,vz=R.vz,ang;
      if(Math.hypot(tx,tz)>=.3)ang=Math.acos(Math.max(-1,Math.min(1,(vx*tx+vz*tz)/(Math.hypot(vx,vz)*Math.hypot(tx,tz)||1))));
      else{const vn=R.vx*S.U[oj]+R.vy*S.U[oj+1]+R.vz*S.U[oj+2],ax=R.vx-vn*S.U[oj],ay=R.vy-vn*S.U[oj+1],az=R.vz-vn*S.U[oj+2];
        ang=Math.acos(Math.max(-1,Math.min(1,(ax*S.T[oj]+ay*S.T[oj+1]+az*S.T[oj+2])/(Math.hypot(ax,ay,az)||1))));}
      cands.push({sI:sI,i:i,sigma:sigma,V:V,u:u,sP:R.sL,gain:gain,ang:deg(ang),t:R.t,chute:R.sy-R.qy,dist:dir,
        propre:deg(ang)<=ANG_PROPRE,rentable:gain>=GAIN_RENTABLE&&deg(ang)<=ANG_PROPRE});
    }
  }
  /* regroupement : les rentables d'abord (par gain), puis le reste ; un candidat absorbe tout ce qui est à moins de 100 m en décollage ET en pose */
  const ordre=cands.slice().sort((a,b)=>(b.rentable-a.rentable)||(b.gain-a.gain)),pris=new Uint8Array(ordre.length),groupes=[];
  for(let k=0;k<ordre.length;k++){if(pris[k])continue;const c=ordre[k],mem=[c];pris[k]=1;
    for(let q=k+1;q<ordre.length;q++)if(!pris[q]&&Math.abs(ordre[q].sI-c.sI)<100&&Math.abs(ordre[q].sP-c.sP)<100){pris[q]=1;mem.push(ordre[q]);}
    const bons=mem.filter(m=>m.propre&&m.gain>=GAIN_MIN),pool=bons.length?bons:mem;
    const meilleur=mem.reduce((a,b)=>(b.rentable!==a.rentable?b.rentable:b.gain>a.gain)?b:a,mem[0]);
    const vit=[...new Set(pool.map(m=>m.V))].sort((a,b)=>a-b),vol=[...new Set(pool.filter(m=>m.V===meilleur.V).map(m=>m.u))].sort((a,b)=>a-b);
    groupes.push({sDecol:[Math.min(...mem.map(m=>m.sI)),Math.max(...mem.map(m=>m.sI))],sPose:meilleur.sP,sPosePlage:[Math.min(...mem.map(m=>m.sP)),Math.max(...mem.map(m=>m.sP))],
      chute:meilleur.chute,gainMax:Math.max(...mem.map(m=>m.gain)),gainMeilleur:meilleur.gain,tVol:meilleur.t,vitesses:vit,volants:vol,angle:meilleur.ang,
      cote:meilleur.sigma>0?'+B':'-B',cotes:[...new Set(mem.map(m=>m.sigma>0?'+B':'-B'))],rentable:mem.some(m=>m.rentable),membres:mem.length});}
  groupes.sort((a,b)=>b.gainMax-a.gainMax);
  const pg=[];for(const c of pieges.sort((a,b)=>b.perte-a.perte)){if(pg.some(g=>Math.abs(g.sI-c.sI)<100&&Math.abs(g.sP-c.sP)<150))continue;pg.push(c);}
  const rent=groupes.filter(g=>g.rentable);
  return {pieges:pg.length,piegesKm:pg.length/km,piegesTop:pg.slice(0,8).map(g=>[Math.round(g.sI),Math.round(g.sP),Math.round(g.chute)]),vitesses:VITESSES,stat,nb:groupes.length,rentables:rent.length,rentablesKm:rent.length/km,gros:rent.filter(g=>g.gainMax>=400).length,meilleurGain:groupes.length?groupes[0].gainMax:0,
    top:groupes.slice(0,10),tous:groupes};
}

