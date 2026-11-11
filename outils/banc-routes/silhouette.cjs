/* LA SILHOUETTE (2026-11-11, LA TORSION EN MODULES — Sacha : « il faut que les routes soient esthétiques de loin, dans l'espace ou les nuages on ne voit que ça ») :
   une planche par carte — pour chaque graine, la route ENTIÈRE vue de loin (oblique, le ruban plein : dessus clair, dessous sombre, ombré par un soleil)
   et trois vues DU VOLANT (perspective, la caméra derrière la caisse à 15 %, 45 % et 70 % de la route) : ce que le joueur voit au loin.
   node silhouette.cjs nuages|espace palier graines(ex 1-6) sortie.png [search de l'URL, ex "?torsion=hasard"]
   Sortie console : par graine, les figures, les vrilles, la part hors de l'endroit, le roulis cumulé (tours) et le roulis le plus vif (°/s à la croisière). */
const fs=require('fs'),P=require('./png.cjs');
const [carte,pal,gr,sortie,search]=process.argv.slice(2);
const B=search?require('./charge.cjs').creer(search):require('./charge.cjs');
const V3=B.ctx.THREE.Vector3;
const [g0,g1]=String(gr||'1-6').split('-').map(Number);
const DEMI=28,SOLEIL=new V3(.45,.8,.35).normalize();
function tri(im,a,b,c,col){ /* un triangle plein (balayage) */
  let x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(im.w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(im.h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
  if(x1-x0>2500||y1-y0>2500)return;
  const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(d)<1e-9)return;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d;if(u>=-.02&&v>=-.02&&u+v<=1.02)P.px(im,x,y,col);}}
function ruban(r){ /* les deux bords et la normale, à chaque point de contrôle */
  const Q=r.ctrl,n=Q.length,N=r.N,G=[],D=[],T=[];
  for(let i=0;i<n;i++){const t=new V3().subVectors(Q[Math.min(n-1,i+1)],Q[Math.max(0,i-1)]).normalize(),nn=N?N[i]:new V3(0,1,0),b=new V3().crossVectors(t,nn).normalize().multiplyScalar(DEMI);
    G.push(new V3().copy(Q[i]).add(b));D.push(new V3().copy(Q[i]).sub(b));T.push(t);}
  return {G,D,T};}
function teinte(nn,vers,fig){ /* la couleur d'une tranche : dessus crème, dessous bleu nuit ; ombrée ; les figures un peu dorées */
  const dessus=nn.dot(vers)>0,l=.35+.65*Math.max(0,(dessus?1:-1)*nn.dot(SOLEIL));
  const c=dessus?(fig?[255,214,120]:[240,238,230]):[70,95,170];return [c[0]*l,c[1]*l,c[2]*l];}
function peint(im,cadre,r,R,proj,versDe){ /* peintre : les tranches du fond d'abord */
  const Q=r.ctrl,n=Q.length,fig=new Uint8Array(n);for(const m of r.marks)if(m.fig||m.g)for(let i=m.i0;i<=m.i1&&i<n;i++)fig[i]=1;
  const q=[];for(let i=1;i<n;i++){const a=proj(R.G[i-1]),b=proj(R.D[i-1]),c=proj(R.D[i]),d=proj(R.G[i]);if(!a||!b||!c||!d)continue;q.push([(a[2]+b[2]+c[2]+d[2])/4,a,b,c,d,i]);}
  q.sort(function(x,y){return y[0]-x[0];});
  const X=p=>[cadre[0]+p[0],cadre[1]+p[1]];
  for(const e of q){const i=e[5],col=teinte(r.N?r.N[i]:new V3(0,1,0),versDe(Q[i]),fig[i]);
    const a=X(e[1]),b=X(e[2]),c=X(e[3]),d=X(e[4]);
    if([a,b,c,d].some(p=>p[0]<cadre[0]-400||p[0]>cadre[0]+cadre[2]+400||p[1]<cadre[1]-400||p[1]>cadre[1]+cadre[3]+400))continue;
    tri(im,a,b,c,col);tri(im,a,c,d,col);}}
function loin(im,cadre,r,R,az,el){ /* la route entière, oblique, orthographique, cadrée */
  const ca=Math.cos(az*Math.PI/180),sa=Math.sin(az*Math.PI/180),ce=Math.cos(el*Math.PI/180),se=Math.sin(el*Math.PI/180);
  const brut=p=>{const x=p.x*ca-p.z*sa,z=p.x*sa+p.z*ca;return [x,-(p.y*ce-z*se),z*ce+p.y*se];};
  let m=[1e9,1e9,-1e9,-1e9];for(const p of r.ctrl){const q=brut(p);m[0]=Math.min(m[0],q[0]);m[1]=Math.min(m[1],q[1]);m[2]=Math.max(m[2],q[0]);m[3]=Math.max(m[3],q[1]);}
  const sc=Math.min((cadre[2]-40)/Math.max(1,m[2]-m[0]),(cadre[3]-40)/Math.max(1,m[3]-m[1]));
  const ox=(cadre[2]-(m[2]-m[0])*sc)/2,oy=(cadre[3]-(m[3]-m[1])*sc)/2;
  const vers=new V3(sa*ce,se,-ca*ce).multiplyScalar(-1); /* vers la caméra */
  const cam=new V3(-sa*ce,se,ca*ce); /* la direction d'où l'on regarde (vers la caméra) */
  peint(im,cadre,r,R,p=>{const q=brut(p);return [ox+(q[0]-m[0])*sc,oy+(q[1]-m[1])*sc,-q[2]];},()=>cam);}
function volant(im,cadre,r,R,part){ /* la vue du joueur : derrière la caisse, 16 m au-dessus de la dalle, on regarde loin devant */
  const Q=r.ctrl,n=Q.length,i=Math.max(2,Math.min(n-3,Math.round(part*(n-1)))),nn=r.N?r.N[i]:new V3(0,1,0),t=R.T[i];
  const O=new V3().copy(Q[i]).addScaledVector(nn,16).addScaledVector(t,-34),f=new V3().copy(t).addScaledVector(nn,-.12).normalize(),dr=new V3().crossVectors(f,nn).normalize(),up=new V3().crossVectors(dr,f).normalize();
  const F=cadre[3]*.9;
  peint(im,cadre,r,R,p=>{const d=new V3().subVectors(p,O),z=d.dot(f);if(z<4)return null;return [cadre[2]/2+d.dot(dr)/z*F,cadre[3]/2-d.dot(up)/z*F,z];},p=>new V3().subVectors(O,p).normalize());}
const CW=560,CH=380,VW=280,VH=190,LIG=CH+VH+14,gs=[];for(let g=g0;g<=(g1||g0);g++)gs.push(g);
const COL=Math.min(3,gs.length),im=P.Img(COL*(CW+10)+10,Math.ceil(gs.length/COL)*LIG+10,carte==='espace'?[6,7,14]:[96,140,196]);
const bilan=[];
gs.forEach(function(g,k){
  const r=B.piste(carte,g,+pal||0),R=ruban(r),x=10+(k%COL)*(CW+10),y=10+Math.floor(k/COL)*LIG;
  loin(im,[x,y,CW,CH],r,R,35+g*23,24);
  [.15,.45,.7].forEach(function(p,j){const c=[x+j*(VW*2/3+2),y+CH+4,Math.floor(CW/3)-2,VH];
    for(let yy=c[1];yy<c[1]+c[3];yy++)for(let xx=c[0];xx<c[0]+c[2];xx++)P.px(im,xx,yy,carte==='espace'?[12,14,26]:[120,160,210]);
    const sous=P.Img(c[2],c[3],carte==='espace'?[12,14,26]:[120,160,210]);volant(sous,[0,0,c[2],c[3]],r,R,p);
    for(let yy=0;yy<c[3];yy++)for(let xx=0;xx<c[2];xx++){const o=(yy*sous.w+xx)*4;P.px(im,c[0]+xx,c[1]+yy,[sous.d[o],sous.d[o+1],sous.d[o+2]]);}});
  /* les chiffres du roulis : la part hors de l'endroit, le roulis cumulé de la normale autour de la tangente, sa pointe */
  const Q=r.ctrl,N=r.N,n=Q.length;let hors=0,envers=0,cum=0,pointe=0,sA=0;
  if(N)for(let i=1;i<n;i++){const ds=Q[i].distanceTo(Q[i-1]);sA+=ds;if(N[i].y<.5)hors++;if(N[i].y<-.2)envers++;
    const t=R.T[i],a=new V3().copy(N[i-1]).addScaledVector(t,-N[i-1].dot(t)).normalize(),b=new V3().copy(N[i]).addScaledVector(t,-N[i].dot(t)).normalize();
    const w=Math.atan2(new V3().crossVectors(a,b).dot(t),a.dot(b));cum+=Math.abs(w);pointe=Math.max(pointe,Math.abs(w)/Math.max(1,ds)*r.vw);}
  const ligne={g:g,L:Math.round(sA),s:+(sA/r.vw).toFixed(0),figs:r.marks.map(m=>m.fig||'-').join(','),vrilles:r.info?r.info.vrilles:0,hors:+(hors/n).toFixed(2),envers:+(envers/n).toFixed(2),tours:+(cum/(2*Math.PI)).toFixed(2),pointeDegS:Math.round(pointe*57.3),contacts:r.info?r.info.contacts:0,essai:r.info?r.info.essai:0};
  bilan.push(ligne);console.log(carte,'p'+(+pal||0),JSON.stringify(ligne));});
const moy=k=>(bilan.reduce((a,x)=>a+x[k],0)/bilan.length).toFixed(2);
console.log('MOYENNE',carte,'vrilles',moy('vrilles'),'hors',moy('hors'),'envers',moy('envers'),'tours',moy('tours'),'pointe °/s',moy('pointeDegS'),'contacts',moy('contacts'));
if(sortie){fs.writeFileSync(sortie,P.png(im));console.log('ok',sortie);}
