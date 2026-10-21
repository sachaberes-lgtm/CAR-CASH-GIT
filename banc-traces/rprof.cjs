const path=require('path');const [,,idx,carte,pal0,g0]=process.argv;const B=require('./charge.cjs')(path.resolve(idx)),T=B.ctx.THREE;
const r=B.trace(carte,+g0,+pal0);const c=new T.CatmullRomCurve3(r.ctrl.map(p=>new T.Vector3(p[0],p[1],p[2])),false,'centripetal');c.arcLengthDivisions=r.ctrl.length*16;
const L=c.getLength(),N=Math.round(L/4),P=c.getSpacedPoints(N);let best=1e9,at=0;const R9=[];
for(let i=3;i<N-3;i++){const a=P[i-3],b=P[i],d=P[i+3];const ax=b.x-a.x,az=b.z-a.z,bx=d.x-b.x,bz=d.z-b.z;const ang=Math.abs(Math.atan2(ax*bz-az*bx,ax*bx+az*bz));const R=ang<1e-4?1e9:12/ang;R9.push(R);if(R<best){best=R;at=i;}}
console.log('L',Math.round(L),'min',Math.round(best),'à s=',at*4,'frac',(at*4/L).toFixed(3));const Q=r.Q;for(const k in Q)if(Q[k].s!=null)console.log(k,(Q[k].s/ (r.ctrl.reduce((a,p,i)=>i?a+Math.hypot(p[0]-r.ctrl[i-1][0],p[2]-r.ctrl[i-1][2]):0,0))).toFixed(3));
console.log('profil autour :',R9.slice(Math.max(0,at-20),at+20).map(x=>Math.round(x)).join(' '));
