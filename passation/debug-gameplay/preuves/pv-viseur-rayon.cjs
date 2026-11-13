// PV-02 : le viseur (boucle-3-physique.js, dalleProche(…,8,VIS_R2,-1)) — quelle largeur de route voit-il, et combien coûte le rayon élargi ?
// Copie exacte de dalleIx / dalleLb / dalleProche (portail-passage.js), piste synthétique de 9 000 points (1 m) : droite + virage + hélice serrée.
const fs=require('fs');const b3=fs.readFileSync(__dirname+'/../../../code/moteur/boucle-3-physique.js','utf8');
const m=/VIS_R2=ROAD_HALF>40\?400:Math\.max\(400,\(ROAD_HALF\+(\d+)\)/.exec(b3);console.log('rayon lu dans le code : ROAD_HALF+'+(m?m[1]:'?? (non trouvé)'));
const pts=[];for(let i=0;i<9000;i++){let x,y,z;if(i<3000){x=i;y=0;z=0;}else if(i<6000){const a=(i-3000)/400;x=3000+400*Math.sin(a);y=0;z=400-400*Math.cos(a);}else{const a=(i-6000)/150;x=-500+150*Math.cos(a);z=150*Math.sin(a);y=-40-(i-6000)*.012;}pts.push({x,y,z});}
const NP=pts.length,K=64;let nD=0;
const X={nb:Math.ceil(NP/K),c:[],r:[]};for(let b=0;b<X.nb;b++){let a=[1e18,1e18,1e18],c=[-1e18,-1e18,-1e18];for(let i=b*K;i<Math.min(NP,b*K+K);i++){const p=pts[i];a=[Math.min(a[0],p.x),Math.min(a[1],p.y),Math.min(a[2],p.z)];c=[Math.max(c[0],p.x),Math.max(c[1],p.y),Math.max(c[2],p.z)];}
  const ce=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2];let r2=0;for(let i=b*K;i<Math.min(NP,b*K+K);i++){const p=pts[i];r2=Math.max(r2,(p.x-ce[0])**2+(p.y-ce[1])**2+(p.z-ce[2])**2);}X.c.push(ce);X.r.push(Math.sqrt(r2)+1e-3);}
function proche(x,y,z,pas,bd0){let bi=-1,bd=bd0;for(let b=0;b<X.nb;b++){const c=X.c[b],g=Math.hypot(x-c[0],y-c[1],z-c[2])-X.r[b],lb=g>0?g*g:0;if(lb>bd0||lb>=bd)continue;
  for(let i=b*K;i<Math.min(NP,b*K+K);i+=pas){nD++;const p=pts[i],d=(x-p.x)**2+(y-p.y)**2+(z-p.z)**2;if(d<bd){bd=d;bi=i;}}}return bi;}
const RH=28;
for(const R2 of [400,(RH+6)**2]){let vu=0,n=0;nD=0;
  for(let k=0;k<4000;k++){const i=Math.floor(Math.random()*8990),p=pts[i],q=pts[i+1],tx=q.x-p.x,tz=q.z-p.z,tl=Math.hypot(tx,tz),bx=-tz/tl,bz=tx/tl,l=(Math.random()*2-1)*RH,h=Math.random()*3;
    const x=p.x+bx*l,y=p.y+h,z=p.z+bz*l;n++;if(proche(x,y,z,8,R2)>=0)vu++;}
  console.log('rayon '+Math.sqrt(R2).toFixed(0)+' m : anneau possible sur '+(vu/n*100).toFixed(0)+' % des points de pose (route de 56 m) ; '+(nD/n).toFixed(1)+' distances par appel (+ '+X.nb+' tests de sphère, inchangés)');}
