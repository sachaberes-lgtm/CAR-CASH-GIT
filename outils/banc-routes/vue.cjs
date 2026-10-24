/* vue oblique d'un module : node vue.cjs carte graine palier [n° de figure|fig:puits] sortie.png [azimut° [élévation°]] — la dalle en deux bords, le centre coloré */
const B=require('./charge.cjs'),P=require('./png.cjs'),fs=require('fs');
function vue(r,m,sortie,az,el){
  const Q=r.ctrl,N=r.N,n=Q.length,i0=Math.max(1,m.i0-8),i1=Math.min(n-2,m.i1+8);
  const ca=Math.cos((az||35)*Math.PI/180),sa=Math.sin((az||35)*Math.PI/180),ce=Math.cos((el||28)*Math.PI/180),se=Math.sin((el||28)*Math.PI/180);
  const proj=p=>{const x=p.x*ca-p.z*sa,z=p.x*sa+p.z*ca;return [x,p.y*ce-z*se,z*ce+p.y*se];}; // x écran, y écran, profondeur
  const pts=[],ed=[];
  for(let i=i0;i<=i1;i++){const T=new B.ctx.THREE.Vector3().subVectors(Q[i+1],Q[i-1]).normalize(),Bv=new B.ctx.THREE.Vector3().crossVectors(T,N[i]).normalize().multiplyScalar(28);
    pts.push(proj(Q[i]));ed.push([proj(new B.ctx.THREE.Vector3().copy(Q[i]).add(Bv)),proj(new B.ctx.THREE.Vector3().copy(Q[i]).sub(Bv)),N[i].y]);}
  let a=[1e9,1e9,-1e9,-1e9];for(const q of pts){a[0]=Math.min(a[0],q[0]);a[1]=Math.min(a[1],q[1]);a[2]=Math.max(a[2],q[0]);a[3]=Math.max(a[3],q[1]);}
  const W=1000,H=800,sc=Math.min((W-60)/(a[2]-a[0]),(H-60)/(a[3]-a[1])),im=P.Img(W,H,[16,18,28]);
  const X=q=>30+(q[0]-a[0])*sc,Y=q=>H-30-(q[1]-a[1])*sc;
  for(let k=1;k<pts.length;k++){const ny=ed[k][2],c=ny>.5?[90,220,120]:ny<-.2?[255,80,80]:[250,210,70];
    // remplissage de la bande (quadrilatère par tranches de lignes)
    for(let t=0;t<=1;t+=.1){const p0=[ed[k-1][0][0]*(1-t)+ed[k-1][1][0]*t,ed[k-1][0][1]*(1-t)+ed[k-1][1][1]*t],p1=[ed[k][0][0]*(1-t)+ed[k][1][0]*t,ed[k][0][1]*(1-t)+ed[k][1][1]*t];P.line(im,X(p0),Y(p0),X(p1),Y(p1),c,1);}
    P.line(im,X(ed[k-1][0]),Y(ed[k-1][0]),X(ed[k][0]),Y(ed[k][0]),[255,255,255],1);P.line(im,X(ed[k-1][1]),Y(ed[k-1][1]),X(ed[k][1]),Y(ed[k][1]),[120,120,140],1);}
  fs.writeFileSync(sortie,P.png(im));}
module.exports={vue};
if(require.main===module){const [c,sd,pal,fig,out,az,el]=process.argv.slice(2);const r=B.piste(c,+sd,+pal);
  const m=/^fig:/.test(fig)?r.marks.find(x=>x.fig===fig.slice(4)):r.marks[+fig];if(!m){console.log('pas de figure',r.marks.map(x=>x.fig||'-').join(','));process.exit(1);}
  vue(r,m,out,+az||35,+el||28);console.log('ok',m.fig,m.i0,m.i1);}
