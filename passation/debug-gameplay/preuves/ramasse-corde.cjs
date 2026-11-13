// Preuve OR-01 : la « corde » de ramD (ramassage.js:15) saute le balayage pour les objets hors de l'axe.
// node ramasse-corde.cjs  -> largeur de prise effective (m, demi-largeur) au sol, par vitesse et cadence, avec / sans la corde.
const lisse60=(k,dt)=>1-Math.pow(Math.max(0,1-k/60),dt*60);
function run(kmh,fps,d,phase,mode,yo){
  const v=kmh/3.6,dt=1/fps,R=3.8;
  let xc=0,pA={x:0,y:0,z:0};const P={x:60+phase*v*dt,y:yo,z:d};
  for(let f=0;f<400;f++){
    const A={x:xc,y:0,z:0};xc+=v*dt;const B={x:xc,y:0,z:0};
    const sg=Math.hypot(B.x-A.x,0,0),bal=sg>1e-6&&sg<=v*Math.max(dt,.05)*2+2;
    const ds=Math.abs(P.x-B.x);if(ds>22+(bal?sg*2:0)){ if(P.x<B.x-40)return false; continue;}
    const Q={x:P.x,y:P.y,z:P.z};
    if(ds<15&&Math.abs(P.z-0)<9){const k=lisse60(6,dt);P.x+=(B.x-P.x)*k;P.y+=(B.y-P.y)*k;P.z+=(B.z-P.z)*k;}
    const d0=Math.hypot(P.x-B.x,P.y-B.y,P.z-B.z);let r=d0;
    if(mode!=='point'&&bal){
      const dx=B.x-A.x,dy=0,dz=0,l2=dx*dx;let skip=false;
      if(mode==='corde'){const hv=(Q.y-B.y),c=R*R-hv*hv;if(c>0&&l2<=4*c)skip=true;}
      if(mode==='corde2'){const qa={x:Q.x-A.x,y:Q.y-A.y,z:Q.z-A.z},pr=(qa.x*dx)/Math.sqrt(l2),perp2=qa.x*qa.x+qa.y*qa.y+qa.z*qa.z-pr*pr,c=R*R-perp2;if(c>0&&l2<=4*c)skip=true;}
      if(!skip){let t=((Q.x-A.x)*dx)/l2;t=t<0?0:t>1?1:t;const x=A.x+dx*t-Q.x,y=A.y-Q.y,z=A.z-Q.z;r=Math.min(d0,Math.hypot(x,y,z));}
    }
    if(r<R)return true;
    if(P.x<B.x-40)return false;
  }
  return false;
}
function largeur(kmh,fps,mode,yo){let tot=0,N=40;for(let d=0;d<=9;d+=.1){let g=0;for(let i=0;i<N;i++)g+=run(kmh,fps,d,i/N,mode,yo)?1:0;tot+=g/N*.1;}return tot;}
for(const yo of [1.3,.9]){console.log('hauteur objet',yo);
for(const fps of [60,30]){for(const kmh of [300,500,700,1000,1500]){
  const a=largeur(kmh,fps,'point',yo),b=largeur(kmh,fps,'corde',yo),c=largeur(kmh,fps,'plein',yo),e=largeur(kmh,fps,'corde2',yo);
  console.log(`fps ${fps} ${kmh} km/h : demi-largeur de prise  point ${a.toFixed(2)}  corde(actuel) ${b.toFixed(2)}  balayage plein ${c.toFixed(2)}  (perte corde ${(100*(1-b/c)).toFixed(0)} %)  corde corrigée ${e.toFixed(2)}`);}}}
