// le rayon le plus serré, mesuré sur la COURBE du jeu (Catmull-Rom centripète des points de contrôle, comme pisteRoute), tous les 4 m
const path=require('path');const [,,idx,carte,pal0,n0]=process.argv;const B=require('./charge.cjs')(path.resolve(idx)),T=B.ctx.THREE;
const out=[];for(let g=1;g<=(+n0||40);g++){const r=B.trace(carte,g,+pal0||0);const c=new T.CatmullRomCurve3(r.ctrl.map(p=>new T.Vector3(p[0],p[1],p[2])),false,'centripetal');c.arcLengthDivisions=r.ctrl.length*16;
  const L=c.getLength(),N=Math.round(L/4),P=c.getSpacedPoints(N);let best=1e9,at=0;
  for(let i=3;i<N-3;i++){const a=P[i-3],b=P[i],d=P[i+3];const ax=b.x-a.x,az=b.z-a.z,bx=d.x-b.x,bz=d.z-b.z;const cr=ax*bz-az*bx,dt=ax*bx+az*bz,ang=Math.abs(Math.atan2(cr,dt));if(ang<1e-4)continue;const R=12/ang;if(R<best){best=R;at=i*4/L;}}
  out.push([g,Math.round(best),+at.toFixed(3)]);}
out.sort((a,b)=>a[1]-b[1]);console.log(carte,'pal',pal0,'rayon le plus serré (m) [graine, R, où] :',JSON.stringify(out.slice(0,6)),' médiane',out[out.length>>1][1]);
